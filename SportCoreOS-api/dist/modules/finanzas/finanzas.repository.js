"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanzasRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const base_repository_1 = require("../../common/repositories/base.repository");
let FinanzasRepository = class FinanzasRepository extends base_repository_1.BaseRepository {
    constructor(db) {
        super(db, 'finanzas.cargos_jugador');
    }
    async getResumenFinanciero(clubId) {
        const res = await this.db.query(`SELECT 
         COALESCE(SUM(cj.monto_total - cj.monto_descuento_beca), 0) as total_facturado,
         COALESCE(SUM(cj.monto_pagado), 0) as total_recaudado,
         COALESCE(SUM(cj.saldo_pendiente), 0) as total_en_mora,
         COUNT(DISTINCT j.id) FILTER (WHERE cj.saldo_pendiente > 0) as total_jugadores_en_mora
       FROM finanzas.cargos_jugador cj
       JOIN deportivo.jugadores j ON j.id = cj.jugador_id
       WHERE cj.club_id = $1`, [clubId]);
        return res.rows[0];
    }
    async getCargosPorCobrar(clubId, optionsOrCatId) {
        let categoriaId;
        let search;
        let estadoPago;
        let page = 1;
        let limit = 10;
        if (typeof optionsOrCatId === 'object' && optionsOrCatId !== null) {
            categoriaId = optionsOrCatId.categoriaId;
            search = optionsOrCatId.search;
            estadoPago = optionsOrCatId.estadoPago;
            page = Math.max(1, Number(optionsOrCatId.page) || 1);
            limit = Math.min(100, Math.max(1, Number(optionsOrCatId.limit) || 10));
        }
        else {
            categoriaId = typeof optionsOrCatId === 'string' ? optionsOrCatId : undefined;
        }
        const offset = (page - 1) * limit;
        const whereParts = ['cj.club_id = $1'];
        const params = [clubId];
        if (categoriaId && categoriaId !== 'TODAS') {
            params.push(categoriaId);
            whereParts.push(`j.categoria_id = $${params.length}`);
        }
        if (estadoPago && estadoPago !== 'TODOS') {
            if (estadoPago === 'PAGADO') {
                whereParts.push('cj.saldo_pendiente <= 0');
            }
            else if (estadoPago === 'MORA') {
                whereParts.push('cj.saldo_pendiente > 0');
            }
        }
        if (search && search.trim()) {
            params.push(`%${search.trim()}%`);
            const pIdx = params.length;
            whereParts.push(`(j.nombres ILIKE $${pIdx} OR j.apellidos ILIKE $${pIdx} OR j.numero_documento ILIKE $${pIdx} OR fc.nombre ILIKE $${pIdx})`);
        }
        const countRes = await this.db.query(`SELECT COUNT(*) as count
       FROM finanzas.cargos_jugador cj
       JOIN deportivo.jugadores j ON j.id = cj.jugador_id
       JOIN deportivo.categorias c ON c.id = j.categoria_id
       JOIN finanzas.conceptos fc ON fc.id = cj.concepto_id
       WHERE ${whereParts.join(' AND ')}`, params);
        const total = parseInt(countRes.rows[0]?.count || '0', 10);
        const queryParams = [...params, limit, offset];
        const dataRes = await this.db.query(`SELECT cj.*, 
              CONCAT(j.nombres, ' ', j.apellidos) as jugador_nombre, j.numero_documento,
              c.nombre as categoria_nombre, fc.nombre as concepto_nombre, fc.tipo as concepto_tipo
       FROM finanzas.cargos_jugador cj
       JOIN deportivo.jugadores j ON j.id = cj.jugador_id
       JOIN deportivo.categorias c ON c.id = j.categoria_id
       JOIN finanzas.conceptos fc ON fc.id = cj.concepto_id
       WHERE ${whereParts.join(' AND ')}
       ORDER BY cj.fecha_limite_pago ASC, j.apellidos ASC
       LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`, queryParams);
        return {
            data: dataRes.rows,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async generarMensualidad(clubId, mes, anio) {
        let conceptoRes = await this.db.query(`SELECT id, monto_base FROM finanzas.conceptos WHERE club_id = $1 AND tipo = 'PENSION' LIMIT 1`, [clubId]);
        let conceptoId;
        let montoSugerido = 180000;
        if (conceptoRes.rows.length === 0) {
            const newConc = await this.db.query(`INSERT INTO finanzas.conceptos (club_id, nombre, tipo, monto_base)
         VALUES ($1, 'Pensión Mensual Oficial 2026', 'PENSION', 180000)
         RETURNING id, monto_base`, [clubId]);
            conceptoId = newConc.rows[0].id;
        }
        else {
            conceptoId = conceptoRes.rows[0].id;
            montoSugerido = parseFloat(conceptoRes.rows[0].monto_base || '180000');
        }
        const jugadoresRes = await this.db.query(`SELECT id FROM deportivo.jugadores WHERE club_id = $1 AND estado_matricula = 'ACTIVO'`, [clubId]);
        let creados = 0;
        for (const jug of jugadoresRes.rows) {
            const existRes = await this.db.query(`SELECT id FROM finanzas.cargos_jugador 
         WHERE jugador_id = $1 AND concepto_id = $2 AND periodo_mes = $3 AND periodo_anio = $4`, [jug.id, conceptoId, mes, anio]);
            if (existRes.rows.length === 0) {
                const descBeca = 0;
                const total = montoSugerido;
                const saldo = total - descBeca;
                await this.db.query(`INSERT INTO finanzas.cargos_jugador (
             club_id, jugador_id, concepto_id, periodo_mes, periodo_anio,
             monto_total, monto_descuento_beca, monto_pagado, saldo_pendiente,
             estado_pago, fecha_emision, fecha_limite_pago
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, 'PENDIENTE', CURRENT_DATE, CURRENT_DATE + INTERVAL '10 days')`, [clubId, jug.id, conceptoId, mes, anio, total, descBeca, saldo]);
                creados++;
            }
        }
        return { success: true, cargosCreados: creados, totalJugadores: jugadoresRes.rows.length };
    }
    async registrarPago(id, clubId, monto) {
        const cargoRes = await this.db.query(`SELECT * FROM finanzas.cargos_jugador WHERE id = $1 AND club_id = $2`, [id, clubId]);
        if (cargoRes.rows.length === 0) {
            return null;
        }
        const cargo = cargoRes.rows[0];
        const pagadoAnterior = parseFloat(cargo.monto_pagado || '0');
        const nuevoPagado = pagadoAnterior + monto;
        const neto = parseFloat(cargo.monto_total) - parseFloat(cargo.monto_descuento_beca || '0');
        const nuevoSaldo = Math.max(0, neto - nuevoPagado);
        const nuevoEstado = nuevoSaldo === 0 ? 'PAGADO' : 'PARCIAL';
        const updateRes = await this.db.query(`UPDATE finanzas.cargos_jugador
       SET monto_pagado = $1, saldo_pendiente = $2, estado_pago = $3
       WHERE id = $4 AND club_id = $5
       RETURNING *`, [nuevoPagado, nuevoSaldo, nuevoEstado, id, clubId]);
        return updateRes.rows[0];
    }
};
exports.FinanzasRepository = FinanzasRepository;
exports.FinanzasRepository = FinanzasRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], FinanzasRepository);
//# sourceMappingURL=finanzas.repository.js.map
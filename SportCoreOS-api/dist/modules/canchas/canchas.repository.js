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
exports.CanchasRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
let CanchasRepository = class CanchasRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findCanchasByClub(clubId, options) {
        const isPaginated = options?.page !== undefined || options?.limit !== undefined;
        const page = Math.max(1, Number(options?.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(options?.limit) || (isPaginated ? 10 : 50)));
        const offset = (page - 1) * limit;
        const whereParts = ['c.club_id = $1', 'c.activa = true'];
        const params = [clubId];
        if (options?.tipoSuperficie && options.tipoSuperficie !== 'TODAS') {
            params.push(options.tipoSuperficie);
            whereParts.push(`c.tipo_superficie = $${params.length}`);
        }
        if (options?.search && options.search.trim()) {
            params.push(`%${options.search.trim()}%`);
            const pIdx = params.length;
            whereParts.push(`c.nombre ILIKE $${pIdx}`);
        }
        const countRes = await this.db.query(`SELECT COUNT(*) as count
       FROM deportivo.canchas c
       WHERE ${whereParts.join(' AND ')}`, params);
        const total = parseInt(countRes.rows[0]?.count || '0', 10);
        const queryParams = [...params, limit, offset];
        const dataRes = await this.db.query(`SELECT c.*, 
              (SELECT COUNT(*) FROM deportivo.reservas_cancha r WHERE r.cancha_id = c.id AND r.fecha_reserva = CURRENT_DATE AND r.estado_turno != 'cancelado') as reservas_hoy
       FROM deportivo.canchas c
       WHERE ${whereParts.join(' AND ')}
       ORDER BY c.nombre ASC
       LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`, queryParams);
        return {
            data: dataRes.rows,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async findCanchaById(id, clubId) {
        const res = await this.db.query(`SELECT * FROM deportivo.canchas WHERE id = $1 AND club_id = $2`, [id, clubId]);
        return res.rows[0] || null;
    }
    async createCancha(clubId, data) {
        const res = await this.db.query(`INSERT INTO deportivo.canchas (
        club_id, nombre, tipo_superficie, precio_hora_diurna, precio_hora_nocturna,
        hora_apertura, hora_cierre, activa
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, true)
      RETURNING *`, [
            clubId,
            data.nombre,
            data.tipo_superficie,
            data.precio_hora_diurna,
            data.precio_hora_nocturna,
            data.hora_apertura || '06:00',
            data.hora_cierre || '23:00',
        ]);
        return res.rows[0];
    }
    async updateCancha(id, clubId, data) {
        const fields = [];
        const params = [id, clubId];
        if (data.nombre !== undefined) {
            params.push(data.nombre);
            fields.push(`nombre = $${params.length}`);
        }
        if (data.tipo_superficie !== undefined) {
            params.push(data.tipo_superficie);
            fields.push(`tipo_superficie = $${params.length}`);
        }
        if (data.precio_hora_diurna !== undefined) {
            params.push(data.precio_hora_diurna);
            fields.push(`precio_hora_diurna = $${params.length}`);
        }
        if (data.precio_hora_nocturna !== undefined) {
            params.push(data.precio_hora_nocturna);
            fields.push(`precio_hora_nocturna = $${params.length}`);
        }
        if (data.activa !== undefined) {
            params.push(data.activa);
            fields.push(`activa = $${params.length}`);
        }
        if (fields.length === 0)
            return null;
        fields.push(`updated_at = NOW()`);
        const res = await this.db.query(`UPDATE deportivo.canchas SET ${fields.join(', ')} WHERE id = $1 AND club_id = $2 RETURNING *`, params);
        return res.rows[0] || null;
    }
    async deleteCancha(id, clubId) {
        const res = await this.db.query(`UPDATE deportivo.canchas SET activa = false, updated_at = NOW() WHERE id = $1 AND club_id = $2 RETURNING *`, [id, clubId]);
        return res.rows[0] || null;
    }
    async findReservasByFecha(clubId, fecha) {
        const res = await this.db.query(`SELECT r.*, c.nombre as cancha_nombre, c.tipo_superficie
       FROM deportivo.reservas_cancha r
       JOIN deportivo.canchas c ON c.id = r.cancha_id
       WHERE c.club_id = $1 AND r.fecha_reserva = $2 AND r.estado_turno != 'cancelado'
       ORDER BY r.hora_inicio ASC`, [clubId, fecha]);
        return res.rows;
    }
    async findConflictoReserva(canchaId, fecha, horaInicio, horaFin, excludeReservaId) {
        let query = `
      SELECT * FROM deportivo.reservas_cancha
      WHERE cancha_id = $1 
        AND fecha_reserva = $2 
        AND estado_turno != 'cancelado'
        AND (
          (hora_inicio < $4 AND hora_fin > $3)
        )
    `;
        const params = [canchaId, fecha, horaInicio, horaFin];
        if (excludeReservaId) {
            params.push(excludeReservaId);
            query += ` AND id != $${params.length}`;
        }
        const res = await this.db.query(query, params);
        return res.rows[0] || null;
    }
    async createReserva(data) {
        const res = await this.db.query(`INSERT INTO deportivo.reservas_cancha (
        cancha_id, fecha_reserva, hora_inicio, hora_fin, tipo_reserva,
        cliente_nombre, cliente_telefono, monto_total, monto_anticipo,
        estado_pago, estado_turno
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`, [
            data.cancha_id,
            data.fecha_reserva,
            data.hora_inicio,
            data.hora_fin,
            data.tipo_reserva,
            data.cliente_nombre || null,
            data.cliente_telefono || null,
            data.monto_total || 0,
            data.monto_anticipo || 0,
            data.estado_pago || 'pendiente',
            data.estado_turno || 'confirmado',
        ]);
        return res.rows[0];
    }
    async registrarPagoCaja(reservaId, monto) {
        const res = await this.db.query(`UPDATE deportivo.reservas_cancha
       SET monto_anticipo = monto_anticipo + $1,
           estado_pago = CASE WHEN (monto_anticipo + $1) >= monto_total THEN 'completado' ELSE 'parcial' END,
           updated_at = NOW()
       WHERE id = $2
       RETURNING *`, [monto, reservaId]);
        return res.rows[0] || null;
    }
    async cancelarReserva(reservaId) {
        const res = await this.db.query(`UPDATE deportivo.reservas_cancha
       SET estado_turno = 'cancelado', updated_at = NOW()
       WHERE id = $1
       RETURNING *`, [reservaId]);
        return res.rows[0] || null;
    }
};
exports.CanchasRepository = CanchasRepository;
exports.CanchasRepository = CanchasRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], CanchasRepository);
//# sourceMappingURL=canchas.repository.js.map
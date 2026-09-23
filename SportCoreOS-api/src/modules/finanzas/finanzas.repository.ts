import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepository } from '../../common/repositories/base.repository';

@Injectable()
export class FinanzasRepository extends BaseRepository {
  constructor(db: DatabaseService) {
    super(db, 'finanzas.cargos_jugador');
  }

  async getResumenFinanciero(clubId: string) {
    const res = await this.db.query(
      `SELECT 
         COALESCE(SUM(cj.monto_total - cj.monto_descuento_beca), 0) as total_facturado,
         COALESCE(SUM(cj.monto_pagado), 0) as total_recaudado,
         COALESCE(SUM(cj.saldo_pendiente), 0) as total_en_mora,
         COUNT(DISTINCT j.id) FILTER (WHERE cj.saldo_pendiente > 0) as total_jugadores_en_mora
       FROM finanzas.cargos_jugador cj
       JOIN deportivo.jugadores j ON j.id = cj.jugador_id
       WHERE cj.club_id = $1`,
      [clubId],
    );
    return res.rows[0];
  }

  async getCargosPorCobrar(
    clubId: string,
    optionsOrCatId?:
      | string
      | {
          categoriaId?: string;
          search?: string;
          estadoPago?: string;
          page?: number;
          limit?: number;
        },
  ) {
    let categoriaId: string | undefined;
    let search: string | undefined;
    let estadoPago: string | undefined;
    let page: number = 1;
    let limit: number = 10;

    if (typeof optionsOrCatId === 'object' && optionsOrCatId !== null) {
      categoriaId = optionsOrCatId.categoriaId;
      search = optionsOrCatId.search;
      estadoPago = optionsOrCatId.estadoPago;
      page = Math.max(1, Number(optionsOrCatId.page) || 1);
      limit = Math.min(500, Math.max(1, Number(optionsOrCatId.limit) || 100));
    } else {
      categoriaId = typeof optionsOrCatId === 'string' ? optionsOrCatId : undefined;
      limit = 100;
    }

    const offset = (page - 1) * limit;
    const whereParts = ['cj.club_id = $1'];
    const params: any[] = [clubId];

    if (categoriaId && categoriaId !== 'TODAS') {
      params.push(categoriaId);
      whereParts.push(`j.categoria_id = $${params.length}`);
    }

    if (estadoPago && estadoPago !== 'TODOS') {
      if (estadoPago === 'PAGADO') {
        whereParts.push('cj.saldo_pendiente <= 0');
      } else if (estadoPago === 'MORA') {
        whereParts.push('cj.saldo_pendiente > 0');
      }
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      const pIdx = params.length;
      whereParts.push(
        `(j.nombres ILIKE $${pIdx} OR j.apellidos ILIKE $${pIdx} OR j.numero_documento ILIKE $${pIdx} OR fc.nombre ILIKE $${pIdx})`,
      );
    }

    const countRes = await this.db.query(
      `SELECT COUNT(*) as count
       FROM finanzas.cargos_jugador cj
       JOIN deportivo.jugadores j ON j.id = cj.jugador_id
       LEFT JOIN deportivo.categorias c ON c.id = j.categoria_id
       JOIN finanzas.conceptos fc ON fc.id = cj.concepto_id
       WHERE ${whereParts.join(' AND ')}`,
      params,
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const queryParams = [...params, limit, offset];
    const dataRes = await this.db.query(
      `SELECT cj.*, 
              j.categoria_id as categoria_id,
              CONCAT(j.nombres, ' ', j.apellidos) as jugador_nombre, j.numero_documento,
              COALESCE(c.nombre, 'Sin Categoría') as categoria_nombre, fc.nombre as concepto_nombre, fc.tipo as concepto_tipo
       FROM finanzas.cargos_jugador cj
       JOIN deportivo.jugadores j ON j.id = cj.jugador_id
       LEFT JOIN deportivo.categorias c ON c.id = j.categoria_id
       JOIN finanzas.conceptos fc ON fc.id = cj.concepto_id
       WHERE ${whereParts.join(' AND ')}
       ORDER BY cj.fecha_limite_pago ASC, j.apellidos ASC
       LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
      queryParams,
    );

    return {
      data: dataRes.rows,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async generarMensualidad(clubId: string, mes: number, anio: number) {
    // 1. Obtener o crear concepto de Pensión Mensual
    let conceptoRes = await this.db.query(
      `SELECT id, monto_base FROM finanzas.conceptos WHERE club_id = $1 AND tipo = 'PENSION' LIMIT 1`,
      [clubId],
    );

    let conceptoId: string;
    let montoSugerido = 180000;

    if (conceptoRes.rows.length === 0) {
      const newConc = await this.db.query(
        `INSERT INTO finanzas.conceptos (club_id, nombre, tipo, monto_base)
         VALUES ($1, 'Pensión Mensual Oficial 2026', 'PENSION', 180000)
         RETURNING id, monto_base`,
        [clubId],
      );
      conceptoId = newConc.rows[0].id;
    } else {
      conceptoId = conceptoRes.rows[0].id;
      montoSugerido = parseFloat(conceptoRes.rows[0].monto_base || '180000');
    }

    // 2. Obtener jugadores activos del club
    const jugadoresRes = await this.db.query(
      `SELECT id FROM deportivo.jugadores WHERE club_id = $1 AND estado_matricula = 'ACTIVO'`,
      [clubId],
    );

    let creados = 0;
    for (const jug of jugadoresRes.rows) {
      // Verificar si ya existe cargo para este jugador, concepto, mes y año
      const existRes = await this.db.query(
        `SELECT id FROM finanzas.cargos_jugador 
         WHERE jugador_id = $1 AND concepto_id = $2 AND periodo_mes = $3 AND periodo_anio = $4`,
        [jug.id, conceptoId, mes, anio],
      );

      if (existRes.rows.length === 0) {
        const descBeca = 0;
        const total = montoSugerido;
        const saldo = total - descBeca;

        await this.db.query(
          `INSERT INTO finanzas.cargos_jugador (
             club_id, jugador_id, concepto_id, periodo_mes, periodo_anio,
             monto_total, monto_descuento_beca, monto_pagado, saldo_pendiente,
             estado_pago, fecha_emision, fecha_limite_pago
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, 'PENDIENTE', CURRENT_DATE, CURRENT_DATE + INTERVAL '10 days')`,
          [clubId, jug.id, conceptoId, mes, anio, total, descBeca, saldo],
        );
        creados++;
      }
    }

    return { success: true, cargosCreados: creados, totalJugadores: jugadoresRes.rows.length };
  }

  async registrarPago(id: string, clubId: string, monto: number) {
    const cargoRes = await this.db.query(
      `SELECT * FROM finanzas.cargos_jugador WHERE id = $1 AND club_id = $2`,
      [id, clubId],
    );

    if (cargoRes.rows.length === 0) {
      return null;
    }

    const cargo = cargoRes.rows[0];
    const pagadoAnterior = parseFloat(cargo.monto_pagado || '0');
    const nuevoPagado = pagadoAnterior + monto;
    const neto = parseFloat(cargo.monto_total) - parseFloat(cargo.monto_descuento_beca || '0');
    const nuevoSaldo = Math.max(0, neto - nuevoPagado);
    const nuevoEstado = nuevoSaldo === 0 ? 'PAGADO' : 'PARCIAL';

    const updateRes = await this.db.query(
      `UPDATE finanzas.cargos_jugador
       SET monto_pagado = $1, saldo_pendiente = $2, estado_pago = $3
       WHERE id = $4 AND club_id = $5
       RETURNING *`,
      [nuevoPagado, nuevoSaldo, nuevoEstado, id, clubId],
    );

    return updateRes.rows[0];
  }
}

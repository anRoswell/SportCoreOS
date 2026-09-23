import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class JugadoresRepository {
  constructor(private readonly db: DatabaseService) {}

  async findJugadoresByClub(
    clubId: string,
    optionsOrSearch?:
      | string
      | {
          search?: string;
          categoriaId?: string;
          estado?: string;
          posicion?: string;
          genero?: string;
          page?: number;
          limit?: number;
          sortBy?: string;
        },
    categoriaIdParam?: string,
    estadoParam?: string,
  ) {
    let search: string | undefined;
    let categoriaId: string | undefined;
    let estado: string | undefined;
    let posicion: string | undefined;
    let genero: string | undefined;
    let page: number = 1;
    let limit: number = 10;
    let sortBy: string | undefined;

    if (typeof optionsOrSearch === 'object' && optionsOrSearch !== null) {
      search = optionsOrSearch.search;
      categoriaId = optionsOrSearch.categoriaId;
      estado = optionsOrSearch.estado;
      posicion = optionsOrSearch.posicion;
      genero = optionsOrSearch.genero;
      page = Math.max(1, Number(optionsOrSearch.page) || 1);
      limit = Math.min(100, Math.max(1, Number(optionsOrSearch.limit) || 10));
      sortBy = optionsOrSearch.sortBy;
    } else {
      search = typeof optionsOrSearch === 'string' ? optionsOrSearch : undefined;
      categoriaId = categoriaIdParam;
      estado = estadoParam;
    }

    const offset = (page - 1) * limit;
    const whereParts = ['j.club_id = $1'];
    const params: any[] = [clubId];

    if (categoriaId && categoriaId !== 'TODAS') {
      params.push(categoriaId);
      whereParts.push(`j.categoria_id = $${params.length}`);
    }

    if (estado && estado !== 'TODOS') {
      params.push(estado);
      whereParts.push(`j.estado_matricula = $${params.length}`);
    }

    if (posicion && posicion !== 'TODAS') {
      params.push(`%${posicion.toLowerCase()}%`);
      const pIdx = params.length;
      whereParts.push(
        `(LOWER(j.posicion_principal) LIKE $${pIdx} OR LOWER(j.posicion_secundaria) LIKE $${pIdx})`,
      );
    }

    if (genero && genero !== 'TODOS') {
      params.push(genero);
      whereParts.push(`j.genero = $${params.length}`);
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      const pIdx = params.length;
      whereParts.push(
        `(j.nombres ILIKE $${pIdx} OR j.apellidos ILIKE $${pIdx} OR (j.nombres || ' ' || j.apellidos) ILIKE $${pIdx} OR (j.apellidos || ' ' || j.nombres) ILIKE $${pIdx} OR j.numero_documento ILIKE $${pIdx} OR j.eps ILIKE $${pIdx} OR CAST(j.numero_dorsal AS TEXT) ILIKE $${pIdx} OR j.posicion_principal ILIKE $${pIdx} OR j.posicion_secundaria ILIKE $${pIdx} OR c.nombre ILIKE $${pIdx} OR c.codigo_categoria ILIKE $${pIdx})`,
      );
    }

    let orderClause = 'ORDER BY j.apellidos ASC, j.nombres ASC';
    if (sortBy === 'DORSAL_ASC') orderClause = 'ORDER BY j.numero_dorsal ASC NULLS LAST';
    else if (sortBy === 'NOMBRE_ASC') orderClause = 'ORDER BY j.nombres ASC, j.apellidos ASC';
    else if (sortBy === 'APELLIDO_ASC') orderClause = 'ORDER BY j.apellidos ASC, j.nombres ASC';
    else if (sortBy === 'CREATED_DESC') orderClause = 'ORDER BY j.created_at DESC';
    else if (sortBy === 'TALLA_DESC') orderClause = 'ORDER BY b.talla_cm DESC NULLS LAST';

    const countRes = await this.db.query(
      `SELECT COUNT(*) as count
       FROM deportivo.jugadores j
       JOIN deportivo.categorias c ON c.id = j.categoria_id
       WHERE ${whereParts.join(' AND ')}`,
      params,
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const queryParams = [...params, limit, offset];
    const dataRes = await this.db.query(
      `SELECT j.id, j.club_id, j.categoria_id, j.nombres, j.apellidos, j.tipo_documento, j.numero_documento,
              j.fecha_nacimiento, j.genero, j.foto_url, j.posicion_principal,
              j.posicion_secundaria, j.pierna_habil, j.numero_dorsal, j.eps, j.estado_matricula,
              j.created_at, j.updated_at,
              c.nombre as categoria_nombre, c.codigo_categoria, c.color_distintivo,
              b.peso_kg, b.talla_cm, b.imc, b.fecha_evaluacion as ultima_evaluacion
       FROM deportivo.jugadores j
       JOIN deportivo.categorias c ON c.id = j.categoria_id
       LEFT JOIN LATERAL (
         SELECT peso_kg, talla_cm, imc, fecha_evaluacion
         FROM rendimiento.evaluaciones_biometricas eb
         WHERE eb.jugador_id = j.id
         ORDER BY eb.fecha_evaluacion DESC
         LIMIT 1
       ) b ON true
       WHERE ${whereParts.join(' AND ')}
       ${orderClause}
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

  async findById(id: string, clubId: string) {
    const query = `
      SELECT j.*, c.nombre as categoria_nombre, c.codigo_categoria, c.color_distintivo
      FROM deportivo.jugadores j
      JOIN deportivo.categorias c ON c.id = j.categoria_id
      WHERE j.id = $1 AND j.club_id = $2
    `;
    const res = await this.db.query(query, [id, clubId]);
    return res.rows[0] || null;
  }

  async findByDorsal(clubId: string, categoriaId: string, dorsal: number, excludeId?: string) {
    let query = `
      SELECT id, nombres, apellidos, numero_dorsal
      FROM deportivo.jugadores
      WHERE club_id = $1 AND categoria_id = $2 AND numero_dorsal = $3
    `;
    const params: any[] = [clubId, categoriaId, dorsal];

    if (excludeId) {
      params.push(excludeId);
      query += ` AND id != $${params.length}`;
    }

    const res = await this.db.query(query, params);
    return res.rows[0] || null;
  }

  async findByDocumento(clubId: string, numeroDocumento: string, excludeId?: string) {
    let query = `
      SELECT id, nombres, apellidos, numero_documento
      FROM deportivo.jugadores
      WHERE club_id = $1 AND numero_documento = $2
    `;
    const params: any[] = [clubId, numeroDocumento.trim()];

    if (excludeId) {
      params.push(excludeId);
      query += ` AND id != $${params.length}`;
    }

    const res = await this.db.query(query, params);
    return res.rows[0] || null;
  }

  async createJugador(data: {
    clubId: string;
    categoriaId: string;
    nombres: string;
    apellidos: string;
    tipoDocumento: string;
    numeroDocumento: string;
    fechaNacimiento: string;
    genero: string;
    fotoUrl?: string | null;
    posicionPrincipal: string;
    posicionSecundaria?: string | null;
    piernaHabil: string;
    numeroDorsal?: number | null;
    eps?: string | null;
    estadoMatricula?: string;
  }) {
    const query = `
      INSERT INTO deportivo.jugadores (
        club_id, categoria_id, nombres, apellidos, tipo_documento, numero_documento,
        fecha_nacimiento, genero, foto_url, posicion_principal, posicion_secundaria,
        pierna_habil, numero_dorsal, eps, estado_matricula
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `;
    const res = await this.db.query(query, [
      data.clubId,
      data.categoriaId,
      data.nombres.trim(),
      data.apellidos.trim(),
      data.tipoDocumento || 'TI',
      data.numeroDocumento.trim(),
      data.fechaNacimiento,
      data.genero || 'MASCULINO',
      data.fotoUrl || null,
      data.posicionPrincipal.trim(),
      data.posicionSecundaria?.trim() || null,
      data.piernaHabil || 'DIESTRO',
      data.numeroDorsal || null,
      data.eps?.trim() || 'EPS Sanitas',
      data.estadoMatricula || 'ACTIVO',
    ]);
    return res.rows[0];
  }

  async updateJugador(id: string, clubId: string, data: any) {
    const existing = await this.findById(id, clubId);
    if (!existing) return null;

    const categoriaId = data.categoriaId ?? existing.categoria_id;
    const nombres = data.nombres ?? existing.nombres;
    const apellidos = data.apellidos ?? existing.apellidos;
    const tipoDocumento = data.tipoDocumento ?? existing.tipo_documento;
    const numeroDocumento = data.numeroDocumento ?? existing.numero_documento;
    const fechaNacimiento = data.fechaNacimiento ?? existing.fecha_nacimiento;
    const genero = data.genero ?? existing.genero;
    const fotoUrl = data.fotoUrl !== undefined ? data.fotoUrl : existing.foto_url;
    const posicionPrincipal = data.posicionPrincipal ?? existing.posicion_principal;
    const posicionSecundaria = data.posicionSecundaria !== undefined ? data.posicionSecundaria : existing.posicion_secundaria;
    const piernaHabil = data.piernaHabil ?? existing.pierna_habil;
    const numeroDorsal = data.numeroDorsal !== undefined ? data.numeroDorsal : existing.numero_dorsal;
    const eps = data.eps ?? existing.eps;
    const estadoMatricula = data.estadoMatricula ?? existing.estado_matricula;

    const query = `
      UPDATE deportivo.jugadores
      SET categoria_id = $1, nombres = $2, apellidos = $3, tipo_documento = $4,
          numero_documento = $5, fecha_nacimiento = $6, genero = $7, foto_url = $8,
          posicion_principal = $9, posicion_secundaria = $10, pierna_habil = $11,
          numero_dorsal = $12, eps = $13, estado_matricula = $14, updated_at = NOW()
      WHERE id = $15 AND club_id = $16
      RETURNING *
    `;
    const res = await this.db.query(query, [
      categoriaId,
      nombres,
      apellidos,
      tipoDocumento,
      numeroDocumento,
      fechaNacimiento,
      genero,
      fotoUrl,
      posicionPrincipal,
      posicionSecundaria,
      piernaHabil,
      numeroDorsal,
      eps,
      estadoMatricula,
      id,
      clubId,
    ]);
    return res.rows[0] || null;
  }

  async deleteJugador(id: string, clubId: string) {
    const query = `
      UPDATE deportivo.jugadores
      SET estado_matricula = 'RETIRADO', updated_at = NOW()
      WHERE id = $1 AND club_id = $2
      RETURNING id
    `;
    const res = await this.db.query(query, [id, clubId]);
    return (res.rowCount ?? 0) > 0;
  }

  async findExpediente(id: string, clubId: string) {
    const jugRes = await this.db.query(
      `SELECT j.*, c.nombre as categoria_nombre, c.codigo_categoria, c.color_distintivo,
              CONCAT(u.nombre, ' ', u.apellido) as dt_nombre
       FROM deportivo.jugadores j
       JOIN deportivo.categorias c ON c.id = j.categoria_id
       LEFT JOIN core.usuarios u ON u.id = c.director_tecnico_id
       WHERE j.id = $1 AND j.club_id = $2`,
      [id, clubId],
    );

    if (jugRes.rows.length === 0) {
      return null;
    }

    const jugador = jugRes.rows[0];

    // Acudientes vinculados
    const acudientesRes = await this.db.query(
      `SELECT a.*, ja.es_contacto_principal, ja.autorizado_recoger
       FROM deportivo.acudientes a
       JOIN deportivo.jugador_acudientes ja ON ja.acudiente_id = a.id
       WHERE ja.jugador_id = $1
       ORDER BY ja.es_contacto_principal DESC, a.nombres ASC`,
      [id],
    );

    // Histórico de evaluaciones biométricas
    const bioRes = await this.db.query(
      `SELECT eb.*, CONCAT(u.nombre, ' ', u.apellido) as evaluador_nombre
       FROM rendimiento.evaluaciones_biometricas eb
       LEFT JOIN core.usuarios u ON u.id = eb.evaluador_id
       WHERE eb.jugador_id = $1
       ORDER BY eb.fecha_evaluacion DESC`,
      [id],
    );

    // Histórico financiero de cargos/pensiones
    const finRes = await this.db.query(
      `SELECT cj.*, fc.nombre as concepto_nombre, fc.tipo as concepto_tipo
       FROM finanzas.cargos_jugador cj
       JOIN finanzas.conceptos fc ON fc.id = cj.concepto_id
       WHERE cj.jugador_id = $1
       ORDER BY cj.periodo_anio DESC, cj.periodo_mes DESC`,
      [id],
    );

    // Resumen financiero consolidado
    const cargos = finRes.rows;
    const totalFacturado = cargos.reduce((acc: number, c: any) => acc + (parseFloat(c.monto_total) - parseFloat(c.monto_descuento_beca || 0)), 0);
    const totalPagado = cargos.reduce((acc: number, c: any) => acc + parseFloat(c.monto_pagado || 0), 0);
    const saldoPendiente = cargos.reduce((acc: number, c: any) => acc + parseFloat(c.saldo_pendiente || 0), 0);

    // Clínicas Especializadas & Insignias Pro
    let clinicasRes: any = { rows: [] };
    try {
      clinicasRes = await this.db.query(
        `SELECT inc.*, s.titulo as servicio_titulo, s.categoria_servicio, s.icono, s.color_tema, s.insignia_obtenida, s.entrenador_nombre, s.cancha_nombre
         FROM public.inscripciones_servicios inc
         JOIN public.servicios_especializados s ON s.id = inc.servicio_id
         WHERE inc.club_id = $1 AND (
           inc.nombre_jugador ILIKE '%' || $2 || '%'
           OR $3 ILIKE '%' || inc.nombre_jugador || '%'
         )
         ORDER BY inc.created_at DESC`,
        [clubId, jugador.nombres, jugador.nombres + ' ' + jugador.apellidos],
      );
    } catch (e) {
      clinicasRes = { rows: [] };
    }

    return {
      jugador,
      acudientes: acudientesRes.rows,
      historialBiometrico: bioRes.rows,
      historialFinanciero: cargos,
      clinicasInsignias: clinicasRes.rows,
      resumenFinanciero: {
        totalFacturado,
        totalPagado,
        saldoPendiente,
        estadoCuenta: saldoPendiente > 0 ? 'EN_MORA' : 'AL_DIA',
      },
    };
  }

  async createAcudiente(data: {
    nombres: string;
    apellidos: string;
    tipoDocumento: string;
    numeroDocumento: string;
    telefonoMovil: string;
    email?: string | null;
    parentesco: string;
    direccionResidencia?: string | null;
  }) {
    const query = `
      INSERT INTO deportivo.acudientes (
        nombres, apellidos, tipo_documento, numero_documento,
        telefono_movil, email, parentesco, direccion_residencia
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const res = await this.db.query(query, [
      data.nombres.trim(),
      data.apellidos.trim(),
      data.tipoDocumento || 'CC',
      data.numeroDocumento.trim(),
      data.telefonoMovil.trim(),
      data.email?.toLowerCase().trim() || null,
      data.parentesco || 'PADRE',
      data.direccionResidencia || null,
    ]);
    return res.rows[0];
  }

  async linkJugadorAcudiente(jugadorId: string, acudienteId: string, esPrincipal = true, autorizadoRecoger = true) {
    const query = `
      INSERT INTO deportivo.jugador_acudientes (
        jugador_id, acudiente_id, es_contacto_principal, autorizado_recoger
      ) VALUES ($1, $2, $3, $4)
      ON CONFLICT (jugador_id, acudiente_id)
      DO UPDATE SET es_contacto_principal = $3, autorizado_recoger = $4
      RETURNING *
    `;
    const res = await this.db.query(query, [jugadorId, acudienteId, esPrincipal, autorizadoRecoger]);
    return res.rows[0];
  }

  async removeJugadorAcudiente(jugadorId: string, acudienteId: string) {
    const query = `
      DELETE FROM deportivo.jugador_acudientes
      WHERE jugador_id = $1 AND acudiente_id = $2
    `;
    const res = await this.db.query(query, [jugadorId, acudienteId]);
    return (res.rowCount ?? 0) > 0;
  }

  async createEvaluacionBiometrica(data: {
    jugadorId: string;
    evaluadorId?: string | null;
    fechaEvaluacion: string;
    pesoKg: number;
    tallaCm: number;
    imc: number;
    testCooperMetros?: number | null;
    velocidad30mSeg?: number | null;
    saltoVerticalCm?: number | null;
    observaciones?: string | null;
  }) {
    const query = `
      INSERT INTO rendimiento.evaluaciones_biometricas (
        jugador_id, evaluador_id, fecha_evaluacion, peso_kg, talla_cm, imc,
        test_cooper_metros, velocidad_30m_seg, salto_vertical_cm, observaciones
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const res = await this.db.query(query, [
      data.jugadorId,
      data.evaluadorId || null,
      data.fechaEvaluacion,
      data.pesoKg,
      data.tallaCm,
      data.imc,
      data.testCooperMetros || null,
      data.velocidad30mSeg || null,
      data.saltoVerticalCm || null,
      data.observaciones || null,
    ]);
    return res.rows[0];
  }
}

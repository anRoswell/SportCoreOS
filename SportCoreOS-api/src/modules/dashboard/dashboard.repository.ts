import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface DashboardExecutiveKPIs {
  jugadoresActivos: number;
  jugadoresLesionados: number;
  totalCategorias: number;
  proximosPartidos: any[];
  finanzas: {
    facturadoMes: number;
    recaudadoMes: number;
    carteraMora: number;
    porcentajeRecaudo: number;
  };
  distribucionPosiciones: any[];
}

@Injectable()
export class DashboardRepository {
  constructor(private readonly db: DatabaseService) {}

  async countJugadoresActivosYLesionados(clubId: string): Promise<{ total_activos: number; total_lesionados: number }> {
    const res = await this.db.query(
      `SELECT 
         COUNT(*) as total_activos,
         COUNT(*) FILTER (WHERE estado_matricula = 'LESIONADO') as total_lesionados
       FROM deportivo.jugadores 
       WHERE club_id = $1 AND estado_matricula IN ('ACTIVO', 'LESIONADO')`,
      [clubId],
    );
    return {
      total_activos: parseInt(res.rows[0]?.total_activos || '0', 10),
      total_lesionados: parseInt(res.rows[0]?.total_lesionados || '0', 10),
    };
  }

  async countCategoriasActivas(clubId: string): Promise<number> {
    const res = await this.db.query(
      `SELECT COUNT(*) as total_categorias FROM deportivo.categorias WHERE club_id = $1 AND activa = true`,
      [clubId],
    );
    return parseInt(res.rows[0]?.total_categorias || '0', 10);
  }

  async findProximosPartidos(clubId: string, limit: number = 5): Promise<any[]> {
    const res = await this.db.query(
      `SELECT p.id, p.rival_nombre, p.fecha_partido, p.hora_partido, p.hora_citacion, p.sede_cancha,
              p.condicion_juego, p.indumentaria_kit,
              c.nombre as categoria_nombre, c.codigo_categoria,
              (SELECT COUNT(*)::int FROM competicion.convocatorias conv WHERE conv.partido_id = p.id) as total_convocados,
              (SELECT COUNT(*)::int FROM competicion.convocatorias conv WHERE conv.partido_id = p.id AND conv.estado_confirmacion = 'CONFIRMADO') as confirmados_count
       FROM competicion.partidos p
       JOIN deportivo.categorias c ON c.id = p.categoria_id
       WHERE p.club_id = $1
       ORDER BY p.fecha_partido ASC, p.hora_partido ASC
       LIMIT $2`,
      [clubId, limit],
    );
    return res.rows;
  }

  async findMetricasFinancieras(clubId: string): Promise<{ facturado_mes: number; recaudado_mes: number; cartera_mora: number }> {
    const res = await this.db.query(
      `SELECT 
         COALESCE(SUM(cj.monto_total - cj.monto_descuento_beca), 0) as facturado_mes,
         COALESCE(SUM(cj.monto_pagado), 0) as recaudado_mes,
         COALESCE(SUM(cj.saldo_pendiente), 0) as cartera_mora
       FROM finanzas.cargos_jugador cj
       WHERE cj.club_id = $1`,
      [clubId],
    );
    return {
      facturado_mes: parseFloat(res.rows[0]?.facturado_mes || '0'),
      recaudado_mes: parseFloat(res.rows[0]?.recaudado_mes || '0'),
      cartera_mora: parseFloat(res.rows[0]?.cartera_mora || '0'),
    };
  }

  async findDistribucionPosiciones(clubId: string): Promise<any[]> {
    const res = await this.db.query(
      `SELECT posicion_principal, COUNT(*) as cantidad
       FROM deportivo.jugadores
       WHERE club_id = $1 AND estado_matricula = 'ACTIVO'
       GROUP BY posicion_principal
       ORDER BY cantidad DESC`,
      [clubId],
    );
    return res.rows;
  }

  async findCategoriasActivas(clubId: string): Promise<any[]> {
    const res = await this.db.query(
      `SELECT c.id, c.nombre, c.codigo_categoria, c.color_distintivo, c.cupo_maximo
       FROM deportivo.categorias c
       WHERE c.club_id = $1 AND c.activa = true
       ORDER BY c.nombre ASC`,
      [clubId],
    );
    return res.rows;
  }

  async findJugadoresPizarra(clubId: string, limit: number = 18): Promise<any[]> {
    const res = await this.db.query(
      `SELECT j.id, j.numero_dorsal, j.nombres, j.apellidos, j.posicion_principal,
              j.posicion_secundaria, j.pierna_habil, j.eps, j.foto_url, j.estado_matricula,
              COALESCE(j.xp_total, 0) as xp_total,
              c.nombre as categoria_nombre,
              b.peso_kg, b.talla_cm, b.imc
       FROM deportivo.jugadores j
       JOIN deportivo.categorias c ON c.id = j.categoria_id
       LEFT JOIN LATERAL (
         SELECT peso_kg, talla_cm, imc
         FROM rendimiento.evaluaciones_biometricas eb
         WHERE eb.jugador_id = j.id
         ORDER BY eb.fecha_evaluacion DESC
         LIMIT 1
       ) b ON true
       WHERE j.club_id = $1 AND j.estado_matricula IN ('ACTIVO', 'LESIONADO')
       ORDER BY j.numero_dorsal ASC NULLS LAST, j.apellidos ASC
       LIMIT $2`,
      [clubId, limit],
    );
    return res.rows;
  }

  async findUltimasTransacciones(clubId: string, limit: number = 6): Promise<any[]> {
    const res = await this.db.query(
      `SELECT cj.id,
              CONCAT('TX-', SUBSTRING(cj.id::text, 1, 8)) as referencia_pago,
              CONCAT(j.nombres, ' ', j.apellidos) as jugador_nombre,
              COALESCE(c.nombre, 'General') as categoria_nombre,
              cj.monto_total, cj.monto_pagado, cj.saldo_pendiente,
              cj.fecha_limite_pago, cj.estado_pago,
              fc.nombre as concepto_nombre,
              'PSE / Online' as metodo_pago
       FROM finanzas.cargos_jugador cj
       JOIN deportivo.jugadores j ON j.id = cj.jugador_id
       LEFT JOIN deportivo.categorias c ON c.id = j.categoria_id
       JOIN finanzas.conceptos fc ON fc.id = cj.concepto_id
       WHERE cj.club_id = $1
       ORDER BY cj.created_at DESC
       LIMIT $2`,
      [clubId, limit],
    );
    return res.rows;
  }

  async findTopBiometria(clubId: string, limit: number = 3): Promise<any[]> {
    const res = await this.db.query(
      `SELECT eb.id, eb.jugador_id,
              CONCAT(j.nombres, ' ', j.apellidos) as jugador_nombre,
              j.numero_dorsal, j.posicion_principal, j.foto_url,
              c.nombre as categoria_nombre,
              eb.imc, eb.test_cooper_metros, eb.velocidad_30m_seg
       FROM rendimiento.evaluaciones_biometricas eb
       JOIN deportivo.jugadores j ON j.id = eb.jugador_id
       JOIN deportivo.categorias c ON c.id = j.categoria_id
       WHERE j.club_id = $1
       ORDER BY eb.fecha_evaluacion DESC
       LIMIT $2`,
      [clubId, limit],
    );
    return res.rows;
  }

  async findClubLanding(clubId: string): Promise<any | null> {
    try {
      const res = await this.db.query(
        `SELECT id, club_id, titulo, subtitulo, slug, estado, tema_color, es_pagina_inicio
         FROM core.landing_pages
         WHERE club_id = $1 AND es_pagina_inicio = true
         LIMIT 1`,
        [clubId],
      );
      return res.rows[0] || null;
    } catch {
      return null;
    }
  }
}

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class DashboardService {
  constructor(private readonly db: DatabaseService) {}

  async getExecutiveKPIs(clubId: string) {
    // 1. Total Jugadores Activos
    const jugCount = await this.db.query(
      `SELECT 
         COUNT(*) as total_activos,
         COUNT(*) FILTER (WHERE estado_matricula = 'LESIONADO') as total_lesionados
       FROM deportivo.jugadores 
       WHERE club_id = $1 AND estado_matricula IN ('ACTIVO', 'LESIONADO')`,
      [clubId],
    );

    // 2. Total Categorías Activas
    const catCount = await this.db.query(
      `SELECT COUNT(*) as total_categorias FROM deportivo.categorias WHERE club_id = $1 AND activa = true`,
      [clubId],
    );

    // 3. Próximos Partidos
    const proxPartidos = await this.db.query(
      `SELECT p.id, p.rival_nombre, p.fecha_partido, p.hora_partido, p.sede_cancha,
              p.condicion_juego, c.nombre as categoria_nombre, c.codigo_categoria
       FROM competicion.partidos p
       JOIN deportivo.categorias c ON c.id = p.categoria_id
       WHERE p.club_id = $1
       ORDER BY p.fecha_partido ASC, p.hora_partido ASC
       LIMIT 5`,
      [clubId],
    );

    // 4. Métricas Financieras del Mes
    const finRes = await this.db.query(
      `SELECT 
         COALESCE(SUM(cj.monto_total - cj.monto_descuento_beca), 0) as facturado_mes,
         COALESCE(SUM(cj.monto_pagado), 0) as recaudado_mes,
         COALESCE(SUM(cj.saldo_pendiente), 0) as cartera_mora
       FROM finanzas.cargos_jugador cj
       WHERE cj.club_id = $1`,
      [clubId],
    );

    // 5. Jugadores por Posición Táctica
    const posCount = await this.db.query(
      `SELECT posicion_principal, COUNT(*) as cantidad
       FROM deportivo.jugadores
       WHERE club_id = $1 AND estado_matricula = 'ACTIVO'
       GROUP BY posicion_principal
       ORDER BY cantidad DESC`,
      [clubId],
    );

    return {
      jugadoresActivos: parseInt(jugCount.rows[0]?.total_activos || '0', 10),
      jugadoresLesionados: parseInt(jugCount.rows[0]?.total_lesionados || '0', 10),
      totalCategorias: parseInt(catCount.rows[0]?.total_categorias || '0', 10),
      proximosPartidos: proxPartidos.rows,
      finanzas: {
        facturadoMes: parseFloat(finRes.rows[0]?.facturado_mes || '0'),
        recaudadoMes: parseFloat(finRes.rows[0]?.recaudado_mes || '0'),
        carteraMora: parseFloat(finRes.rows[0]?.cartera_mora || '0'),
        porcentajeRecaudo: finRes.rows[0]?.facturado_mes > 0
          ? Math.round((parseFloat(finRes.rows[0].recaudado_mes) / parseFloat(finRes.rows[0].facturado_mes)) * 100)
          : 0,
      },
      distribucionPosiciones: posCount.rows,
    };
  }
}

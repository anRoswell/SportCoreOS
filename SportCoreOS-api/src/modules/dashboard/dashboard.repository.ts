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
      `SELECT p.id, p.rival_nombre, p.fecha_partido, p.hora_partido, p.sede_cancha,
              p.condicion_juego, c.nombre as categoria_nombre, c.codigo_categoria
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
}

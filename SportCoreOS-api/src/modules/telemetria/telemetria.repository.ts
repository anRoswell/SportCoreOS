import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateSesionGpsDto, CreateMetricaGpsDto } from './telemetria.dto';

@Injectable()
export class TelemetriaRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAllSesiones(
    clubId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      tipoSesion?: string;
    },
  ) {
    const isPaginated = options?.page !== undefined || options?.limit !== undefined;
    const page = Math.max(1, Number(options?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options?.limit) || (isPaginated ? 10 : 50)));
    const offset = (page - 1) * limit;

    const whereParts = ['s.club_id = $1'];
    const params: any[] = [clubId];

    if (options?.tipoSesion && options.tipoSesion !== 'TODOS') {
      params.push(options.tipoSesion);
      whereParts.push(`s.tipo_sesion = $${params.length}`);
    }

    if (options?.search && options.search.trim()) {
      params.push(`%${options.search.trim()}%`);
      const pIdx = params.length;
      whereParts.push(`(p.rival_nombre ILIKE $${pIdx} OR s.dispositivo_marca ILIKE $${pIdx})`);
    }

    const countRes = await this.db.query(
      `SELECT COUNT(DISTINCT s.id) as count
       FROM deportivo.sesiones_gps s
       LEFT JOIN competicion.partidos p ON s.partido_id = p.id
       WHERE ${whereParts.join(' AND ')}`,
      params,
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const queryParams = [...params, limit, offset];
    const dataRes = await this.db.query(
      `SELECT s.*, 
              p.rival_nombre, p.goles_club, p.goles_rival,
              COUNT(m.id) as jugadores_monitoreados,
              COALESCE(AVG(m.distancia_total_m), 0) as distancia_promedio_m,
              COALESCE(MAX(m.velocidad_max_kmh), 0) as pico_velocidad_kmh
       FROM deportivo.sesiones_gps s
       LEFT JOIN competicion.partidos p ON s.partido_id = p.id
       LEFT JOIN deportivo.metricas_rendimiento_gps m ON s.id = m.sesion_id
       WHERE ${whereParts.join(' AND ')}
       GROUP BY s.id, p.id
       ORDER BY s.fecha_sesion DESC
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

  async findSesionById(id: string, clubId: string) {
    const sesionRes = await this.db.query(
      `SELECT s.*, p.rival_nombre, p.fecha_partido 
       FROM deportivo.sesiones_gps s
       LEFT JOIN competicion.partidos p ON s.partido_id = p.id
       WHERE s.id = $1 AND s.club_id = $2`,
      [id, clubId]
    );

    if (!sesionRes.rows[0]) return null;

    const metricasRes = await this.db.query(
      `SELECT m.*, j.nombres, j.apellidos, j.numero_dorsal, j.posicion_principal, j.foto_url
       FROM deportivo.metricas_rendimiento_gps m
       JOIN deportivo.jugadores j ON m.jugador_id = j.id
       WHERE m.sesion_id = $1
       ORDER BY m.distancia_total_m DESC`,
      [id]
    );

    return {
      ...sesionRes.rows[0],
      metricas: metricasRes.rows,
    };
  }

  async createSesion(clubId: string, dto: CreateSesionGpsDto) {
    const res = await this.db.query(
      `INSERT INTO deportivo.sesiones_gps (
        club_id, partido_id, fecha_sesion, tipo_sesion, dispositivo_marca, duracion_minutos, clima_temperatura
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        clubId,
        dto.partido_id || null,
        dto.fecha_sesion,
        dto.tipo_sesion || 'PARTIDO_OFICIAL',
        dto.dispositivo_marca || 'CATAPULT_10HZ',
        dto.duracion_minutos || 90,
        dto.clima_temperatura || null,
      ]
    );
    return res.rows[0];
  }

  async createMetrica(sesionId: string, dto: CreateMetricaGpsDto) {
    const res = await this.db.query(
      `INSERT INTO deportivo.metricas_rendimiento_gps (
        sesion_id, jugador_id, distancia_total_m, velocidad_max_kmh, distancia_sprint_m,
        sprints_conteo, aceleraciones_intensas, desaceleraciones_intensas, player_load_au,
        frecuencia_cardiaca_prom, frecuencia_cardiaca_max, coordenadas_heatmap_json
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        sesionId,
        dto.jugador_id,
        dto.distancia_total_m,
        dto.velocidad_max_kmh,
        dto.distancia_sprint_m || 0,
        dto.sprints_conteo || 0,
        dto.aceleraciones_intensas || 0,
        dto.desaceleraciones_intensas || 0,
        dto.player_load_au || 0,
        dto.frecuencia_cardiaca_prom || null,
        dto.frecuencia_cardiaca_max || null,
        JSON.stringify(dto.coordenadas_heatmap_json || []),
      ]
    );
    return res.rows[0];
  }

  async findMetricasByJugador(jugadorId: string, clubId: string) {
    const res = await this.db.query(
      `SELECT m.*, s.fecha_sesion, s.tipo_sesion, s.dispositivo_marca, p.rival_nombre
       FROM deportivo.metricas_rendimiento_gps m
       JOIN deportivo.sesiones_gps s ON m.sesion_id = s.id
       LEFT JOIN competicion.partidos p ON s.partido_id = p.id
       WHERE m.jugador_id = $1 AND s.club_id = $2
       ORDER BY s.fecha_sesion DESC LIMIT 15`,
      [jugadorId, clubId]
    );
    return res.rows;
  }
}

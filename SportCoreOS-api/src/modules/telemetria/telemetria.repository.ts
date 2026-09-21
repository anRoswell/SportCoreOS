import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateSesionGpsDto, CreateMetricaGpsDto } from './telemetria.dto';

@Injectable()
export class TelemetriaRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAllSesiones(clubId: string) {
    const res = await this.db.query(
      `SELECT s.*, 
              p.rival_nombre, p.goles_club, p.goles_rival,
              COUNT(m.id) as jugadores_monitoreados,
              COALESCE(AVG(m.distancia_total_m), 0) as distancia_promedio_m,
              COALESCE(MAX(m.velocidad_max_kmh), 0) as pico_velocidad_kmh
       FROM deportivo.sesiones_gps s
       LEFT JOIN competicion.partidos p ON s.partido_id = p.id
       LEFT JOIN deportivo.metricas_rendimiento_gps m ON s.id = m.sesion_id
       WHERE s.club_id = $1
       GROUP BY s.id, p.id
       ORDER BY s.fecha_sesion DESC`,
      [clubId]
    );
    return res.rows;
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

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class IaRepository {
  constructor(private readonly db: DatabaseService) {}

  async getPlantillaByCodigo(codigo: string) {
    const res = await this.db.query(
      `SELECT * FROM deportivo.ia_prompts_templates WHERE codigo_template = $1`,
      [codigo]
    );
    return res.rows[0] || null;
  }

  async getHistorialJugadorParaBoletin(jugadorId: string, clubId: string) {
    const jugadorRes = await this.db.query(
      `SELECT j.*, c.nombre as categoria_nombre 
       FROM deportivo.jugadores j 
       LEFT JOIN deportivo.categorias c ON j.categoria_id = c.id 
       WHERE j.id = $1 AND j.club_id = $2`,
      [jugadorId, clubId]
    );

    const biometriaRes = await this.db.query(
      `SELECT * FROM rendimiento.evaluaciones_biometricas 
       WHERE jugador_id = $1 
       ORDER BY fecha_evaluacion DESC LIMIT 2`,
      [jugadorId]
    );

    const partidosRes = await this.db.query(
      `SELECT c.rol_convocatoria, c.posicion_designada,
              p.rival_nombre, p.goles_club, p.goles_rival, p.fecha_partido
       FROM competicion.convocatorias c
       JOIN competicion.partidos p ON c.partido_id = p.id
       WHERE c.jugador_id = $1 AND p.club_id = $2
       ORDER BY p.fecha_partido DESC LIMIT 5`,
      [jugadorId, clubId]
    );

    return {
      jugador: jugadorRes.rows[0] || null,
      biometria: biometriaRes.rows,
      partidos: partidosRes.rows,
    };
  }

  async getMetricasFatigaJugador(jugadorId: string) {
    const res = await this.db.query(
      `SELECT m.*, s.fecha_sesion, s.tipo_sesion, s.duracion_minutos
       FROM deportivo.metricas_rendimiento_gps m
       JOIN deportivo.sesiones_gps s ON m.sesion_id = s.id
       WHERE m.jugador_id = $1
       ORDER BY s.fecha_sesion DESC LIMIT 10`,
      [jugadorId]
    );
    return res.rows;
  }

  async guardarLogGeneracion(
    clubId: string,
    jugadorId: string | null,
    codigoTemplate: string,
    promptTokens: number,
    completionTokens: number,
    contenidoGenerado: string,
    metadata: any = {}
  ) {
    const res = await this.db.query(
      `INSERT INTO deportivo.ia_logs_generacion (
        club_id, jugador_id, codigo_template, prompt_tokens, completion_tokens, contenido_generado, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [clubId, jugadorId, codigoTemplate, promptTokens, completionTokens, contenidoGenerado, JSON.stringify(metadata)]
    );
    return res.rows[0];
  }

  async getPlantelesParaAnalisis(categoriaId: string, clubId: string) {
    const res = await this.db.query(
      `SELECT j.nombres, j.apellidos, j.posicion_principal, j.pie_habil, j.estado, j.dorsal
       FROM deportivo.jugadores j
       WHERE j.categoria_id = $1 AND j.club_id = $2 AND j.estado = 'ACTIVO'`,
      [categoriaId, clubId]
    );
    return res.rows;
  }
}

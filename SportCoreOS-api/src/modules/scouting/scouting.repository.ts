import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateProspectoDto, UpdateProspectoDto, CreateEvaluacionDto } from './scouting.dto';

@Injectable()
export class ScoutingRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAllProspectos(clubId: string, search?: string, estado?: string, posicion?: string) {
    let query = `
      SELECT p.*,
             COUNT(e.id) as total_evaluaciones,
             COALESCE(AVG(e.promedio_global), p.valoracion_general, 0) as score_promedio_calculado
      FROM deportivo.prospectos_scouting p
      LEFT JOIN deportivo.evaluaciones_scouting e ON p.id = e.prospecto_id
      WHERE p.club_id = $1
    `;
    const params: any[] = [clubId];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (p.nombres_apellidos ILIKE $${params.length} OR p.club_origen ILIKE $${params.length} OR p.ciudad ILIKE $${params.length})`;
    }

    if (estado) {
      params.push(estado);
      query += ` AND p.estado_scouting = $${params.length}`;
    }

    if (posicion) {
      params.push(posicion);
      query += ` AND (p.posicion_principal = $${params.length} OR p.posicion_secundaria = $${params.length})`;
    }

    query += ` GROUP BY p.id ORDER BY p.created_at DESC`;

    const res = await this.db.query(query, params);
    return res.rows;
  }

  async findProspectoById(id: string, clubId: string) {
    const prospectoRes = await this.db.query(
      `SELECT * FROM deportivo.prospectos_scouting WHERE id = $1 AND club_id = $2`,
      [id, clubId]
    );

    if (!prospectoRes.rows[0]) return null;

    const evaluacionesRes = await this.db.query(
      `SELECT e.*, u.nombre as scout_nombre, u.email as scout_email
       FROM deportivo.evaluaciones_scouting e
       LEFT JOIN core.usuarios u ON e.scout_usuario_id = u.id
       WHERE e.prospecto_id = $1
       ORDER BY e.fecha_observacion DESC`,
      [id]
    );

    return {
      ...prospectoRes.rows[0],
      evaluaciones: evaluacionesRes.rows,
    };
  }

  async createProspecto(clubId: string, dto: CreateProspectoDto) {
    const res = await this.db.query(
      `INSERT INTO deportivo.prospectos_scouting (
        club_id, nombres_apellidos, fecha_nacimiento, posicion_principal, posicion_secundaria,
        pie_habil, club_origen, telefono_contacto, email_contacto, ciudad, altura_cm, peso_kg,
        video_highlight_url, estado_scouting, notas_scout
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        clubId,
        dto.nombres_apellidos,
        dto.fecha_nacimiento,
        dto.posicion_principal,
        dto.posicion_secundaria || null,
        dto.pie_habil || 'derecho',
        dto.club_origen || null,
        dto.telefono_contacto || null,
        dto.email_contacto || null,
        dto.ciudad || null,
        dto.altura_cm || null,
        dto.peso_kg || null,
        dto.video_highlight_url || null,
        dto.estado_scouting || 'en_observacion',
        dto.notas_scout || null,
      ]
    );
    return res.rows[0];
  }

  async updateProspecto(id: string, clubId: string, dto: UpdateProspectoDto) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (dto.nombres_apellidos !== undefined) {
      fields.push(`nombres_apellidos = $${idx++}`);
      values.push(dto.nombres_apellidos);
    }
    if (dto.posicion_principal !== undefined) {
      fields.push(`posicion_principal = $${idx++}`);
      values.push(dto.posicion_principal);
    }
    if (dto.club_origen !== undefined) {
      fields.push(`club_origen = $${idx++}`);
      values.push(dto.club_origen);
    }
    if (dto.estado_scouting !== undefined) {
      fields.push(`estado_scouting = $${idx++}`);
      values.push(dto.estado_scouting);
    }
    if (dto.valoracion_general !== undefined) {
      fields.push(`valoracion_general = $${idx++}`);
      values.push(dto.valoracion_general);
    }
    if (dto.notas_scout !== undefined) {
      fields.push(`notas_scout = $${idx++}`);
      values.push(dto.notas_scout);
    }

    if (fields.length === 0) return this.findProspectoById(id, clubId);

    fields.push(`updated_at = NOW()`);
    values.push(id, clubId);

    const query = `
      UPDATE deportivo.prospectos_scouting
      SET ${fields.join(', ')}
      WHERE id = $${idx++} AND club_id = $${idx++}
      RETURNING *
    `;

    const res = await this.db.query(query, values);
    return res.rows[0] || null;
  }

  async deleteProspecto(id: string, clubId: string) {
    const res = await this.db.query(
      `DELETE FROM deportivo.prospectos_scouting WHERE id = $1 AND club_id = $2 RETURNING *`,
      [id, clubId]
    );
    return res.rows[0] || null;
  }

  async createEvaluacion(prospectoId: string, scoutUsuarioId: string, dto: CreateEvaluacionDto) {
    const promedioGlobal = Number(
      ((dto.score_tecnico + dto.score_tactico + dto.score_fisico + dto.score_mental) / 4).toFixed(1)
    );

    const res = await this.db.query(
      `INSERT INTO deportivo.evaluaciones_scouting (
        prospecto_id, scout_usuario_id, fecha_observacion, partido_evento,
        score_tecnico, score_tactico, score_fisico, score_mental, promedio_global,
        comentarios_cualitativos, recomendacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        prospectoId,
        scoutUsuarioId,
        dto.fecha_observacion || new Date().toISOString().split('T')[0],
        dto.partido_evento || null,
        dto.score_tecnico,
        dto.score_tactico,
        dto.score_fisico,
        dto.score_mental,
        promedioGlobal,
        dto.comentarios_cualitativos || null,
        dto.recomendacion,
      ]
    );

    // Actualizar promedio general en el prospecto
    await this.db.query(
      `UPDATE deportivo.prospectos_scouting 
       SET valoracion_general = (
         SELECT COALESCE(AVG(promedio_global), 0) FROM deportivo.evaluaciones_scouting WHERE prospecto_id = $1
       ), updated_at = NOW()
       WHERE id = $1`,
      [prospectoId]
    );

    return res.rows[0];
  }
}

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepository } from '../../common/repositories/base.repository';

@Injectable()
export class CategoriasRepository extends BaseRepository {
  constructor(db: DatabaseService) {
    super(db, 'deportivo.categorias');
  }

  async findCategoriasByClub(
    clubId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      rama?: string;
    },
  ) {
    const isPaginated = options?.page !== undefined || options?.limit !== undefined;
    const page = Math.max(1, Number(options?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(options?.limit) || (isPaginated ? 10 : 50)));
    const offset = (page - 1) * limit;

    const whereParts = ['c.club_id = $1', 'c.activa = true'];
    const params: any[] = [clubId];

    if (options?.rama && options.rama !== 'TODAS') {
      params.push(options.rama);
      whereParts.push(`c.rama = $${params.length}`);
    }

    if (options?.search && options.search.trim()) {
      params.push(`%${options.search.trim()}%`);
      const pIdx = params.length;
      whereParts.push(`(c.nombre ILIKE $${pIdx} OR c.codigo_categoria ILIKE $${pIdx})`);
    }

    const countRes = await this.db.query(
      `SELECT COUNT(*) as count
       FROM deportivo.categorias c
       WHERE ${whereParts.join(' AND ')}`,
      params,
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const queryParams = [...params, limit, offset];
    const dataRes = await this.db.query(
      `SELECT c.id, c.nombre, c.codigo_categoria, c.anio_nacimiento_min, c.anio_nacimiento_max,
              c.rama, c.nivel_competencia, c.color_distintivo, c.activa,
              u.id as dt_id, CONCAT(u.nombre, ' ', u.apellido) as dt_nombre,
              (SELECT COUNT(*) FROM deportivo.jugadores j WHERE j.categoria_id = c.id AND j.estado_matricula = 'ACTIVO') as total_jugadores
       FROM deportivo.categorias c
       LEFT JOIN core.usuarios u ON u.id = c.director_tecnico_id
       WHERE ${whereParts.join(' AND ')}
       ORDER BY c.anio_nacimiento_max ASC
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

  async findPlantelByCategoria(categoriaId: string, clubId: string) {
    const res = await this.db.query(
      `SELECT j.id, j.nombres, j.apellidos, j.numero_documento, j.fecha_nacimiento,
              j.posicion_principal, j.posicion_secundaria, j.pierna_habil, j.numero_dorsal,
              j.foto_url, j.estado_matricula, j.eps,
              b.peso_kg, b.talla_cm, b.imc
       FROM deportivo.jugadores j
       LEFT JOIN LATERAL (
         SELECT peso_kg, talla_cm, imc
         FROM rendimiento.evaluaciones_biometricas eb
         WHERE eb.jugador_id = j.id
         ORDER BY eb.fecha_evaluacion DESC
         LIMIT 1
       ) b ON true
       WHERE j.categoria_id = $1 AND j.club_id = $2
       ORDER BY j.numero_dorsal ASC NULLS LAST, j.apellidos ASC`,
      [categoriaId, clubId],
    );
    return res.rows;
  }

  async createCategoria(clubId: string, data: any) {
    const res = await this.db.query(
      `INSERT INTO deportivo.categorias (
         club_id, nombre, codigo_categoria, anio_nacimiento_min, anio_nacimiento_max,
         rama, nivel_competencia, color_distintivo, cupo_maximo, director_tecnico_id, activa
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
       RETURNING *`,
      [
        clubId,
        data.nombre,
        data.codigo_categoria || data.nombre.substring(0, 6).toUpperCase(),
        data.anio_nacimiento_min || 2010,
        data.anio_nacimiento_max || 2010,
        data.rama || 'MASCULINO',
        data.nivel_competencia || 'FORMATIVO',
        data.color_distintivo || '#10B981',
        data.cupo_maximo || 25,
        data.director_tecnico_id || null,
      ],
    );
    return res.rows[0];
  }

  async updateCategoria(id: string, clubId: string, data: any) {
    const fields: string[] = [];
    const params: any[] = [id, clubId];

    if (data.nombre !== undefined) {
      params.push(data.nombre);
      fields.push(`nombre = $${params.length}`);
    }
    if (data.codigo_categoria !== undefined) {
      params.push(data.codigo_categoria);
      fields.push(`codigo_categoria = $${params.length}`);
    }
    if (data.anio_nacimiento_min !== undefined) {
      params.push(data.anio_nacimiento_min);
      fields.push(`anio_nacimiento_min = $${params.length}`);
    }
    if (data.anio_nacimiento_max !== undefined) {
      params.push(data.anio_nacimiento_max);
      fields.push(`anio_nacimiento_max = $${params.length}`);
    }
    if (data.rama !== undefined) {
      params.push(data.rama);
      fields.push(`rama = $${params.length}`);
    }
    if (data.nivel_competencia !== undefined) {
      params.push(data.nivel_competencia);
      fields.push(`nivel_competencia = $${params.length}`);
    }
    if (data.color_distintivo !== undefined) {
      params.push(data.color_distintivo);
      fields.push(`color_distintivo = $${params.length}`);
    }
    if (data.cupo_maximo !== undefined) {
      params.push(data.cupo_maximo);
      fields.push(`cupo_maximo = $${params.length}`);
    }
    if (data.director_tecnico_id !== undefined) {
      params.push(data.director_tecnico_id || null);
      fields.push(`director_tecnico_id = $${params.length}`);
    }
    if (data.activa !== undefined) {
      params.push(data.activa);
      fields.push(`activa = $${params.length}`);
    }

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);

    const query = `
      UPDATE deportivo.categorias 
      SET ${fields.join(', ')} 
      WHERE id = $1 AND club_id = $2 
      RETURNING *
    `;
    const res = await this.db.query(query, params);
    return res.rows[0] || null;
  }

  async deleteCategoria(id: string, clubId: string) {
    const res = await this.db.query(
      `UPDATE deportivo.categorias SET activa = false, updated_at = NOW() WHERE id = $1 AND club_id = $2 RETURNING *`,
      [id, clubId],
    );
    return res.rows[0] || null;
  }
}

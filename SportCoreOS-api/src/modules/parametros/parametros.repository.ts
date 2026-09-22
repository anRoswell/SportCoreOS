import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateParametroDto, UpdateParametroDto } from './parametros.dto';

export interface ParametroRow {
  id: string;
  club_id: string | null;
  modulo: string;
  clave: string;
  valor: string;
  tipo_valor: string;
  titulo: string;
  descripcion: string | null;
  estado: boolean;
  es_editable: boolean;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class ParametrosRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAll(clubId?: string | null): Promise<ParametroRow[]> {
    const query = `
      WITH params AS (
        SELECT DISTINCT ON (p.clave) p.*
        FROM core.parametros_sistema p
        WHERE ($1::uuid IS NOT NULL AND p.club_id = $1::uuid)
           OR ($1::uuid IS NULL AND p.club_id IS NULL)
           OR (p.club_id IS NULL)
        ORDER BY p.clave ASC, (CASE WHEN p.club_id = $1::uuid THEN 0 ELSE 1 END) ASC
      )
      SELECT * FROM params
      ORDER BY modulo ASC, clave ASC
    `;
    const res = await this.db.query(query, [clubId || null]);
    return res.rows;
  }

  async findByModulo(modulo: string, clubId?: string | null): Promise<ParametroRow[]> {
    const query = `
      WITH params AS (
        SELECT DISTINCT ON (p.clave) p.*
        FROM core.parametros_sistema p
        WHERE p.modulo = $1
          AND (($2::uuid IS NOT NULL AND p.club_id = $2::uuid)
               OR ($2::uuid IS NULL AND p.club_id IS NULL)
               OR (p.club_id IS NULL))
        ORDER BY p.clave ASC, (CASE WHEN p.club_id = $2::uuid THEN 0 ELSE 1 END) ASC
      )
      SELECT * FROM params
      ORDER BY clave ASC
    `;
    const res = await this.db.query(query, [modulo.toUpperCase(), clubId || null]);
    return res.rows;
  }

  async findByClave(clave: string, clubId?: string | null): Promise<ParametroRow | null> {
    // Si se pasa clubId, buscamos primero el específico del club; si no existe, el global (club_id IS NULL)
    if (clubId) {
      const specific = await this.db.query(
        `SELECT * FROM core.parametros_sistema WHERE clave = $1 AND club_id = $2 LIMIT 1`,
        [clave, clubId],
      );
      if (specific.rows[0]) return specific.rows[0];
    }

    const global = await this.db.query(
      `SELECT * FROM core.parametros_sistema WHERE clave = $1 AND club_id IS NULL LIMIT 1`,
      [clave],
    );
    return global.rows[0] || null;
  }

  async findById(id: string): Promise<ParametroRow | null> {
    const res = await this.db.query(
      `SELECT * FROM core.parametros_sistema WHERE id = $1 LIMIT 1`,
      [id],
    );
    return res.rows[0] || null;
  }

  async create(dto: CreateParametroDto): Promise<ParametroRow> {
    const res = await this.db.query(
      `INSERT INTO core.parametros_sistema (
        club_id, modulo, clave, valor, tipo_valor, titulo, descripcion, estado, es_editable, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *`,
      [
        dto.clubId || null,
        dto.modulo.toUpperCase(),
        dto.clave.toUpperCase(),
        dto.valor,
        dto.tipoValor || 'STRING',
        dto.titulo,
        dto.descripcion || null,
        dto.estado ?? true,
        dto.esEditable ?? true,
      ],
    );
    return res.rows[0];
  }

  async update(id: string, dto: UpdateParametroDto): Promise<ParametroRow | null> {
    const fields: string[] = ['valor = $2'];
    const params: any[] = [id, dto.valor];

    if (dto.titulo !== undefined) {
      params.push(dto.titulo);
      fields.push(`titulo = $${params.length}`);
    }
    if (dto.descripcion !== undefined) {
      params.push(dto.descripcion);
      fields.push(`descripcion = $${params.length}`);
    }
    if (dto.estado !== undefined) {
      params.push(dto.estado);
      fields.push(`estado = $${params.length}`);
    }

    fields.push('updated_at = NOW()');

    const res = await this.db.query(
      `UPDATE core.parametros_sistema SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
      params,
    );
    return res.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const res = await this.db.query(
      `DELETE FROM core.parametros_sistema WHERE id = $1 RETURNING id`,
      [id],
    );
    return (res.rowCount ?? 0) > 0;
  }
}

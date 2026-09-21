import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface ClubEntity {
  id: string;
  nombre: string;
  slug: string;
  sigla: string;
  ciudad: string;
  pais: string;
  logo_url: string | null;
  plan: string;
  activo: boolean;
  configuracion_json: any;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class ClubesRepository {
  constructor(private readonly db: DatabaseService) {}

  async findAll(onlyActive: boolean = true): Promise<ClubEntity[]> {
    const query = `
      SELECT id, nombre, slug, sigla, ciudad, pais, logo_url, plan, activo, configuracion_json, created_at, updated_at
      FROM core.clubes
      WHERE ($1::boolean = false OR activo = true)
      ORDER BY nombre ASC
    `;
    const res = await this.db.query<ClubEntity>(query, [onlyActive]);
    return res.rows;
  }

  async findById(id: string): Promise<ClubEntity | null> {
    const query = `
      SELECT id, nombre, slug, sigla, ciudad, pais, logo_url, plan, activo, configuracion_json, created_at, updated_at
      FROM core.clubes
      WHERE id = $1
    `;
    const res = await this.db.query<ClubEntity>(query, [id]);
    return res.rows[0] || null;
  }

  async findBySlug(slug: string): Promise<ClubEntity | null> {
    const query = `
      SELECT id, nombre, slug, sigla, ciudad, pais, logo_url, plan, activo, configuracion_json, created_at, updated_at
      FROM core.clubes
      WHERE slug = $1
    `;
    const res = await this.db.query<ClubEntity>(query, [slug]);
    return res.rows[0] || null;
  }

  async create(data: {
    nombre: string;
    slug: string;
    sigla: string;
    ciudad: string;
    pais: string;
    logo_url?: string | null;
    plan?: string;
    activo?: boolean;
    configuracion_json?: any;
  }): Promise<ClubEntity> {
    const query = `
      INSERT INTO core.clubes (
        nombre, slug, sigla, ciudad, pais, logo_url, plan, activo, configuracion_json
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const res = await this.db.query<ClubEntity>(query, [
      data.nombre,
      data.slug,
      data.sigla,
      data.ciudad,
      data.pais || 'Colombia',
      data.logo_url || null,
      data.plan || 'Plan Élite Pro',
      data.activo !== undefined ? data.activo : true,
      JSON.stringify(data.configuracion_json || {}),
    ]);
    return res.rows[0];
  }

  async update(id: string, data: Partial<ClubEntity>): Promise<ClubEntity | null> {
    const existing = await this.findById(id);
    if (!existing) return null;

    const nombre = data.nombre ?? existing.nombre;
    const sigla = data.sigla ?? existing.sigla;
    const ciudad = data.ciudad ?? existing.ciudad;
    const pais = data.pais ?? existing.pais;
    const logo_url = data.logo_url !== undefined ? data.logo_url : existing.logo_url;
    const plan = data.plan ?? existing.plan;
    const activo = data.activo !== undefined ? data.activo : existing.activo;
    const configuracion_json = data.configuracion_json ? JSON.stringify(data.configuracion_json) : JSON.stringify(existing.configuracion_json || {});

    const query = `
      UPDATE core.clubes
      SET nombre = $1, sigla = $2, ciudad = $3, pais = $4,
          logo_url = $5, plan = $6, activo = $7, configuracion_json = $8,
          updated_at = NOW()
      WHERE id = $9
      RETURNING *
    `;
    const res = await this.db.query<ClubEntity>(query, [
      nombre,
      sigla,
      ciudad,
      pais,
      logo_url,
      plan,
      activo,
      configuracion_json,
      id,
    ]);
    return res.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = `
      UPDATE core.clubes
      SET activo = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `;
    const res = await this.db.query(query, [id]);
    return (res.rowCount ?? 0) > 0;
  }

  async findStaffByClub(clubId: string): Promise<any[]> {
    const query = `
      SELECT u.id, u.nombre, u.apellido, u.email, u.rol, u.telefono, u.avatar_url, u.activo, m.rol_club
      FROM core.usuarios u
      JOIN core.membresias_club m ON m.usuario_id = u.id
      WHERE m.club_id = $1 AND m.activo = true
      ORDER BY u.nombre ASC
    `;
    const res = await this.db.query(query, [clubId]);
    return res.rows;
  }
}

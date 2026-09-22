import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { UpsertTenantModuleAccessDto } from './tenant-modules.dto';

export interface TenantModuleRow {
  id: string;
  club_id: string;
  modulo_codigo: string;
  habilitado: boolean;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  es_indefinido: boolean;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class TenantModulesRepository {
  constructor(private readonly db: DatabaseService) {}

  async findClubById(clubId: string) {
    const res = await this.db.query(
      `SELECT id, nombre, slug, plan, activo FROM core.clubes WHERE id = $1`,
      [clubId],
    );
    return res.rows[0] || null;
  }

  async findAllClubs() {
    const res = await this.db.query(
      `SELECT c.id, c.nombre, c.slug, c.plan, c.activo,
              COUNT(tma.id)::int as total_modulos_configurados,
              COUNT(CASE WHEN tma.habilitado = true THEN 1 END)::int as total_modulos_activos
       FROM core.clubes c
       LEFT JOIN core.tenant_module_access tma ON tma.club_id = c.id
       WHERE c.activo = true
       GROUP BY c.id, c.nombre, c.slug, c.plan, c.activo
       ORDER BY c.nombre ASC`,
    );
    return res.rows;
  }

  async findModulesByClub(clubId: string): Promise<TenantModuleRow[]> {
    const res = await this.db.query(
      `SELECT id, club_id, modulo_codigo, habilitado, fecha_inicio, fecha_fin, es_indefinido, created_at, updated_at
       FROM core.tenant_module_access
       WHERE club_id = $1
       ORDER BY modulo_codigo ASC`,
      [clubId],
    );
    return res.rows;
  }

  async upsertModule(
    clubId: string,
    moduleCode: string,
    dto: UpsertTenantModuleAccessDto,
    userId?: string,
  ): Promise<TenantModuleRow> {
    const res = await this.db.query(
      `INSERT INTO core.tenant_module_access (
         club_id, modulo_codigo, habilitado, fecha_inicio, fecha_fin, es_indefinido, created_by, updated_by, created_at, updated_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7, NOW(), NOW())
       ON CONFLICT (club_id, modulo_codigo)
       DO UPDATE SET
         habilitado = EXCLUDED.habilitado,
         fecha_inicio = EXCLUDED.fecha_inicio,
         fecha_fin = EXCLUDED.fecha_fin,
         es_indefinido = EXCLUDED.es_indefinido,
         updated_by = EXCLUDED.updated_by,
         updated_at = NOW()
       RETURNING *`,
      [
        clubId,
        moduleCode,
        dto.habilitado,
        dto.fechaInicio || null,
        dto.fechaFin || null,
        dto.esIndefinido ?? true,
        userId || null,
      ],
    );
    return res.rows[0];
  }

  async setAllModulesStatus(clubId: string, enabled: boolean, userId?: string) {
    const res = await this.db.query(
      `UPDATE core.tenant_module_access
       SET habilitado = $1, es_indefinido = true, updated_by = $2, updated_at = NOW()
       WHERE club_id = $3
       RETURNING *`,
      [enabled, userId || null, clubId],
    );
    return res.rows;
  }
}

import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

export interface RolePermissionRow {
  id: string;
  club_id: string | null;
  rol: string;
  modulo: string;
  accion: string;
  permitido: boolean;
  nivel_acceso: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class RolesRepository {
  constructor(private readonly db: DatabaseService) {}

  async findPermissionsByClubAndRole(clubId: string | null, rol?: string): Promise<RolePermissionRow[]> {
    let query = `
      SELECT * FROM core.roles_permisos
      WHERE (club_id = $1 OR ($1 IS NULL AND club_id IS NULL) OR club_id IS NULL)
    `;
    const params: any[] = [clubId || null];

    if (rol) {
      params.push(rol);
      query += ` AND rol = $${params.length}`;
    }

    query += ` ORDER BY rol ASC, modulo ASC, accion ASC`;
    const res = await this.db.query(query, params);
    return res.rows;
  }

  async upsertPermission(
    clubId: string | null,
    rol: string,
    modulo: string,
    accion: string,
    permitido: boolean,
    nivelAcceso: string = 'ALL',
  ): Promise<RolePermissionRow> {
    const res = await this.db.query(
      `INSERT INTO core.roles_permisos (
        club_id, rol, modulo, accion, permitido, nivel_acceso, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT ((COALESCE(club_id, '00000000-0000-0000-0000-000000000000'::uuid)), rol, modulo, accion)
      DO UPDATE SET
        permitido = EXCLUDED.permitido,
        nivel_acceso = EXCLUDED.nivel_acceso,
        updated_at = NOW()
      RETURNING *`,
      [clubId || null, rol, modulo, accion, permitido, nivelAcceso],
    );
    return res.rows[0];
  }

  async findUsersWithRoles(clubId: string) {
    const res = await this.db.query(
      `SELECT u.id, u.email, u.nombre, u.apellido, u.avatar_url, u.telefono, u.activo,
              m.id as membresia_id, m.rol_club, m.created_at as miembro_desde
       FROM core.usuarios u
       JOIN core.membresias_club m ON m.usuario_id = u.id
       WHERE m.club_id = $1 AND m.activo = true
       ORDER BY u.nombre ASC`,
      [clubId],
    );
    return res.rows;
  }

  async updateUserClubRole(clubId: string, usuarioId: string, rol: string) {
    const res = await this.db.query(
      `UPDATE core.membresias_club
       SET rol_club = $1
       WHERE club_id = $2 AND usuario_id = $3
       RETURNING *`,
      [rol, clubId, usuarioId],
    );
    return res.rows[0] || null;
  }

  async resetRolePermissionsToTemplate(clubId: string, rol?: string) {
    let query = `DELETE FROM core.roles_permisos WHERE club_id = $1`;
    const params: any[] = [clubId];
    if (rol) {
      params.push(rol);
      query += ` AND rol = $2`;
    }
    await this.db.query(query, params);
  }
}

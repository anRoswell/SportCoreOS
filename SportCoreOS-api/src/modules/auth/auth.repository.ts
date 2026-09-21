import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepository } from '../../common/repositories/base.repository';

export interface UserEntity {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  password_hash: string;
  rol: string;
  telefono?: string;
  avatar_url?: string;
  activo: boolean;
  ultimo_acceso?: Date;
  created_at: Date;
  updated_at?: Date;
}

export interface UserWithClubEntity extends UserEntity {
  club_id?: string;
  club_nombre?: string;
  club_slug?: string;
  club_logo?: string;
}

@Injectable()
export class AuthRepository extends BaseRepository<UserEntity> {
  constructor(db: DatabaseService) {
    super(db, 'core.usuarios');
  }

  async findByEmailWithClub(email: string): Promise<UserWithClubEntity | null> {
    const res = await this.db.query<UserWithClubEntity>(
      `SELECT u.id, u.email, u.password_hash, u.nombre, u.apellido, u.rol, u.telefono, u.avatar_url, u.activo,
              m.club_id, c.nombre as club_nombre, c.slug as club_slug, c.logo_url as club_logo
       FROM core.usuarios u
       LEFT JOIN core.membresias_club m ON m.usuario_id = u.id AND m.activo = true
       LEFT JOIN core.clubes c ON c.id = m.club_id
       WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1))`,
      [email],
    );
    return res.rows[0] || null;
  }

  async findByIdWithClub(userId: string): Promise<UserWithClubEntity | null> {
    const res = await this.db.query<UserWithClubEntity>(
      `SELECT u.id, u.email, u.nombre, u.apellido, u.rol, u.telefono, u.avatar_url, u.activo, u.created_at,
              m.club_id, c.nombre as club_nombre, c.slug as club_slug, c.logo_url as club_logo
       FROM core.usuarios u
       LEFT JOIN core.membresias_club m ON m.usuario_id = u.id AND m.activo = true
       LEFT JOIN core.clubes c ON c.id = m.club_id
       WHERE u.id = $1`,
      [userId],
    );
    return res.rows[0] || null;
  }

  async updateLastAccess(userId: string): Promise<void> {
    await this.db.query(
      `UPDATE core.usuarios SET ultimo_acceso = NOW() WHERE id = $1`,
      [userId],
    );
  }

  async createUser(user: Partial<UserEntity>, clubId?: string): Promise<UserEntity> {
    return this.withTransaction(async (client) => {
      const userRes = await client.query<UserEntity>(
        `INSERT INTO core.usuarios (nombre, apellido, email, password_hash, rol, telefono, activo)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         RETURNING id, nombre, apellido, email, rol, telefono, activo, created_at`,
        [user.nombre, user.apellido, user.email, user.password_hash, user.rol, user.telefono || null],
      );

      const created = userRes.rows[0];

      if (clubId) {
        await client.query(
          `INSERT INTO core.membresias_club (usuario_id, club_id, rol_club, activo)
           VALUES ($1, $2, $3, true)`,
          [created.id, clubId, created.rol],
        );
      }

      return created;
    });
  }

  async updateProfile(userId: string, data: { nombre: string; apellido: string; telefono?: string; avatar?: string }): Promise<UserEntity | null> {
    const res = await this.db.query<UserEntity>(
      `UPDATE core.usuarios
       SET nombre = $1, apellido = $2, telefono = $3, avatar_url = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, nombre, apellido, email, rol, telefono, avatar_url, updated_at`,
      [data.nombre, data.apellido, data.telefono || null, data.avatar || null, userId],
    );
    return res.rows[0] || null;
  }

  async updatePassword(userId: string, newHash: string): Promise<void> {
    await this.db.query(
      `UPDATE core.usuarios SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [newHash, userId],
    );
  }
}

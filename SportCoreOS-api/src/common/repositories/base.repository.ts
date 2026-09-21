import { Injectable, Logger } from '@nestjs/common';
import { PoolClient } from 'pg';
import { DatabaseService } from '../../database/database.service';

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export abstract class BaseRepository<T = any> {
  protected readonly logger = new Logger(this.constructor.name);

  constructor(
    protected readonly db: DatabaseService,
    protected readonly tableName: string,
  ) {}

  async findById(id: string, clubId?: string): Promise<T | null> {
    let sql = `SELECT * FROM ${this.tableName} WHERE id = $1`;
    const params: any[] = [id];

    if (clubId) {
      sql += ` AND club_id = $2`;
      params.push(clubId);
    }

    const res = await this.db.query<T>(sql, params);
    return res.rows[0] || null;
  }

  async findAllByClub(clubId: string, options?: PaginationOptions): Promise<PaginatedResult<T>> {
    const page = Math.max(1, options?.page || 1);
    const limit = Math.min(100, Math.max(1, options?.limit || 20));
    const offset = (page - 1) * limit;

    const countRes = await this.db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM ${this.tableName} WHERE club_id = $1`,
      [clubId],
    );
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const dataRes = await this.db.query<T>(
      `SELECT * FROM ${this.tableName} WHERE club_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [clubId, limit, offset],
    );

    return {
      data: dataRes.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteById(id: string, clubId?: string): Promise<boolean> {
    let sql = `DELETE FROM ${this.tableName} WHERE id = $1`;
    const params: any[] = [id];

    if (clubId) {
      sql += ` AND club_id = $2`;
      params.push(clubId);
    }

    const res = await this.db.query(sql, params);
    return (res.rowCount || 0) > 0;
  }

  /**
   * Ejecuta un callback dentro de una transacción ACID
   */
  async withTransaction<R>(callback: (client: PoolClient) => Promise<R>): Promise<R> {
    const pool = this.db.getPool();
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error('Transacción abortada con ROLLBACK:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

import { Logger } from '@nestjs/common';
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
export declare abstract class BaseRepository<T = any> {
    protected readonly db: DatabaseService;
    protected readonly tableName: string;
    protected readonly logger: Logger;
    constructor(db: DatabaseService, tableName: string);
    findById(id: string, clubId?: string): Promise<T | null>;
    findAllByClub(clubId: string, options?: PaginationOptions): Promise<PaginatedResult<T>>;
    deleteById(id: string, clubId?: string): Promise<boolean>;
    withTransaction<R>(callback: (client: PoolClient) => Promise<R>): Promise<R>;
}

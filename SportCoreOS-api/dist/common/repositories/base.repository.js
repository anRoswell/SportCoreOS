"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
let BaseRepository = class BaseRepository {
    db;
    tableName;
    logger = new common_1.Logger(this.constructor.name);
    constructor(db, tableName) {
        this.db = db;
        this.tableName = tableName;
    }
    async findById(id, clubId) {
        let sql = `SELECT * FROM ${this.tableName} WHERE id = $1`;
        const params = [id];
        if (clubId) {
            sql += ` AND club_id = $2`;
            params.push(clubId);
        }
        const res = await this.db.query(sql, params);
        return res.rows[0] || null;
    }
    async findAllByClub(clubId, options) {
        const page = Math.max(1, options?.page || 1);
        const limit = Math.min(100, Math.max(1, options?.limit || 20));
        const offset = (page - 1) * limit;
        const countRes = await this.db.query(`SELECT COUNT(*) as count FROM ${this.tableName} WHERE club_id = $1`, [clubId]);
        const total = parseInt(countRes.rows[0]?.count || '0', 10);
        const dataRes = await this.db.query(`SELECT * FROM ${this.tableName} WHERE club_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [clubId, limit, offset]);
        return {
            data: dataRes.rows,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async deleteById(id, clubId) {
        let sql = `DELETE FROM ${this.tableName} WHERE id = $1`;
        const params = [id];
        if (clubId) {
            sql += ` AND club_id = $2`;
            params.push(clubId);
        }
        const res = await this.db.query(sql, params);
        return (res.rowCount || 0) > 0;
    }
    async withTransaction(callback) {
        const pool = this.db.getPool();
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const result = await callback(client);
            await client.query('COMMIT');
            return result;
        }
        catch (error) {
            await client.query('ROLLBACK');
            this.logger.error('Transacción abortada con ROLLBACK:', error);
            throw error;
        }
        finally {
            client.release();
        }
    }
};
exports.BaseRepository = BaseRepository;
exports.BaseRepository = BaseRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService, String])
], BaseRepository);
//# sourceMappingURL=base.repository.js.map
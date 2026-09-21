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
exports.AuthRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const base_repository_1 = require("../../common/repositories/base.repository");
let AuthRepository = class AuthRepository extends base_repository_1.BaseRepository {
    constructor(db) {
        super(db, 'core.usuarios');
    }
    async findByEmailWithClub(email) {
        const res = await this.db.query(`SELECT u.id, u.email, u.password_hash, u.nombre, u.apellido, u.rol, u.telefono, u.avatar_url, u.activo,
              m.club_id, c.nombre as club_nombre, c.slug as club_slug, c.logo_url as club_logo
       FROM core.usuarios u
       LEFT JOIN core.membresias_club m ON m.usuario_id = u.id AND m.activo = true
       LEFT JOIN core.clubes c ON c.id = m.club_id
       WHERE LOWER(TRIM(u.email)) = LOWER(TRIM($1))`, [email]);
        return res.rows[0] || null;
    }
    async findByIdWithClub(userId) {
        const res = await this.db.query(`SELECT u.id, u.email, u.nombre, u.apellido, u.rol, u.telefono, u.avatar_url, u.activo, u.created_at,
              m.club_id, c.nombre as club_nombre, c.slug as club_slug, c.logo_url as club_logo
       FROM core.usuarios u
       LEFT JOIN core.membresias_club m ON m.usuario_id = u.id AND m.activo = true
       LEFT JOIN core.clubes c ON c.id = m.club_id
       WHERE u.id = $1`, [userId]);
        return res.rows[0] || null;
    }
    async updateLastAccess(userId) {
        await this.db.query(`UPDATE core.usuarios SET ultimo_acceso = NOW() WHERE id = $1`, [userId]);
    }
    async createUser(user, clubId) {
        return this.withTransaction(async (client) => {
            const userRes = await client.query(`INSERT INTO core.usuarios (nombre, apellido, email, password_hash, rol, telefono, activo)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         RETURNING id, nombre, apellido, email, rol, telefono, activo, created_at`, [user.nombre, user.apellido, user.email, user.password_hash, user.rol, user.telefono || null]);
            const created = userRes.rows[0];
            if (clubId) {
                await client.query(`INSERT INTO core.membresias_club (usuario_id, club_id, rol_club, activo)
           VALUES ($1, $2, $3, true)`, [created.id, clubId, created.rol]);
            }
            return created;
        });
    }
    async updateProfile(userId, data) {
        const res = await this.db.query(`UPDATE core.usuarios
       SET nombre = $1, apellido = $2, telefono = $3, avatar_url = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING id, nombre, apellido, email, rol, telefono, avatar_url, updated_at`, [data.nombre, data.apellido, data.telefono || null, data.avatar || null, userId]);
        return res.rows[0] || null;
    }
    async updatePassword(userId, newHash) {
        await this.db.query(`UPDATE core.usuarios SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [newHash, userId]);
    }
};
exports.AuthRepository = AuthRepository;
exports.AuthRepository = AuthRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AuthRepository);
//# sourceMappingURL=auth.repository.js.map
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
exports.ClubesRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
let ClubesRepository = class ClubesRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async findAll(onlyActive = true) {
        const query = `
      SELECT id, nombre, slug, sigla, ciudad, pais, logo_url, plan, activo, configuracion_json, created_at, updated_at
      FROM core.clubes
      WHERE ($1::boolean = false OR activo = true)
      ORDER BY nombre ASC
    `;
        const res = await this.db.query(query, [onlyActive]);
        return res.rows;
    }
    async findById(id) {
        const query = `
      SELECT id, nombre, slug, sigla, ciudad, pais, logo_url, plan, activo, configuracion_json, created_at, updated_at
      FROM core.clubes
      WHERE id = $1
    `;
        const res = await this.db.query(query, [id]);
        return res.rows[0] || null;
    }
    async findBySlug(slug) {
        const query = `
      SELECT id, nombre, slug, sigla, ciudad, pais, logo_url, plan, activo, configuracion_json, created_at, updated_at
      FROM core.clubes
      WHERE slug = $1
    `;
        const res = await this.db.query(query, [slug]);
        return res.rows[0] || null;
    }
    async create(data) {
        const query = `
      INSERT INTO core.clubes (
        nombre, slug, sigla, ciudad, pais, logo_url, plan, activo, configuracion_json
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
        const res = await this.db.query(query, [
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
    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing)
            return null;
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
        const res = await this.db.query(query, [
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
    async delete(id) {
        const query = `
      UPDATE core.clubes
      SET activo = false, updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `;
        const res = await this.db.query(query, [id]);
        return (res.rowCount ?? 0) > 0;
    }
    async findStaffByClub(clubId) {
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
};
exports.ClubesRepository = ClubesRepository;
exports.ClubesRepository = ClubesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ClubesRepository);
//# sourceMappingURL=clubes.repository.js.map
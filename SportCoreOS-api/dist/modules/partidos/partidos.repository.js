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
exports.PartidosRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
const base_repository_1 = require("../../common/repositories/base.repository");
let PartidosRepository = class PartidosRepository extends base_repository_1.BaseRepository {
    constructor(db) {
        super(db, 'competicion.partidos');
    }
    async findPartidosByClub(clubId, optionsOrCatId) {
        let categoriaId;
        let search;
        let estado;
        let page = 1;
        let limit = 10;
        if (typeof optionsOrCatId === 'object' && optionsOrCatId !== null) {
            categoriaId = optionsOrCatId.categoriaId;
            search = optionsOrCatId.search;
            estado = optionsOrCatId.estado;
            page = Math.max(1, Number(optionsOrCatId.page) || 1);
            limit = Math.min(100, Math.max(1, Number(optionsOrCatId.limit) || 10));
        }
        else {
            categoriaId = typeof optionsOrCatId === 'string' ? optionsOrCatId : undefined;
        }
        const offset = (page - 1) * limit;
        const whereParts = ['p.club_id = $1'];
        const params = [clubId];
        if (categoriaId && categoriaId !== 'TODAS') {
            params.push(categoriaId);
            whereParts.push(`p.categoria_id = $${params.length}`);
        }
        if (estado && estado !== 'TODOS') {
            params.push(estado);
            whereParts.push(`p.estado_partido = $${params.length}`);
        }
        if (search && search.trim()) {
            params.push(`%${search.trim()}%`);
            const pIdx = params.length;
            whereParts.push(`(p.rival_nombre ILIKE $${pIdx} OR p.sede_cancha ILIKE $${pIdx} OR p.tipo_partido ILIKE $${pIdx})`);
        }
        const countRes = await this.db.query(`SELECT COUNT(*) as count
       FROM competicion.partidos p
       JOIN deportivo.categorias c ON c.id = p.categoria_id
       WHERE ${whereParts.join(' AND ')}`, params);
        const total = parseInt(countRes.rows[0]?.count || '0', 10);
        const queryParams = [...params, limit, offset];
        const dataRes = await this.db.query(`SELECT p.*, c.nombre as categoria_nombre, c.codigo_categoria,
              (SELECT COUNT(*) FROM competicion.convocatorias conv WHERE conv.partido_id = p.id) as tiene_convocatoria
       FROM competicion.partidos p
       JOIN deportivo.categorias c ON c.id = p.categoria_id
       WHERE ${whereParts.join(' AND ')}
       ORDER BY p.fecha_partido DESC, p.hora_partido DESC
       LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`, queryParams);
        return {
            data: dataRes.rows,
            total,
            page,
            limit,
            totalPages: Math.max(1, Math.ceil(total / limit)),
        };
    }
    async findDetalle(partidoId, clubId) {
        const pRes = await this.db.query(`SELECT p.*, c.nombre as categoria_nombre, c.codigo_categoria
       FROM competicion.partidos p
       JOIN deportivo.categorias c ON c.id = p.categoria_id
       WHERE p.id = $1 AND p.club_id = $2`, [partidoId, clubId]);
        if (pRes.rows.length === 0) {
            return null;
        }
        const partido = pRes.rows[0];
        const eventosRes = await this.db.query(`SELECT ape.*, ape.observacion as descripcion, CONCAT(j.nombres, ' ', j.apellidos) as jugador_nombre, j.numero_dorsal
       FROM competicion.actas_partido_eventos ape
       LEFT JOIN deportivo.jugadores j ON j.id = ape.jugador_id
       WHERE ape.partido_id = $1
       ORDER BY ape.minuto_juego ASC`, [partidoId]);
        return {
            partido,
            eventosActa: eventosRes.rows,
        };
    }
    async createPartido(clubId, data) {
        const res = await this.db.query(`INSERT INTO competicion.partidos (
         club_id, categoria_id, rival_nombre, fecha_partido, hora_partido,
         hora_citacion, sede_cancha, condicion_juego, indumentaria_kit,
         latitud, longitud, estado_partido, goles_club, goles_rival
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PROGRAMADO', 0, 0)
       RETURNING *`, [
            clubId,
            data.categoria_id,
            data.rival_nombre,
            data.fecha_partido,
            data.hora_partido,
            data.hora_citacion || data.hora_partido,
            data.sede_cancha,
            data.condicion_juego || 'LOCAL',
            data.indumentaria_kit || 'Kit Oficial Titular',
            data.latitud || 4.7110,
            data.longitud || -74.0721,
        ]);
        const partido = res.rows[0];
        return partido;
    }
    async updatePartido(id, clubId, data) {
        const fields = [];
        const params = [id, clubId];
        if (data.rival_nombre !== undefined) {
            params.push(data.rival_nombre);
            fields.push(`rival_nombre = $${params.length}`);
        }
        if (data.fecha_partido !== undefined) {
            params.push(data.fecha_partido);
            fields.push(`fecha_partido = $${params.length}`);
        }
        if (data.hora_partido !== undefined) {
            params.push(data.hora_partido);
            fields.push(`hora_partido = $${params.length}`);
        }
        if (data.hora_citacion !== undefined) {
            params.push(data.hora_citacion);
            fields.push(`hora_citacion = $${params.length}`);
        }
        if (data.sede_cancha !== undefined) {
            params.push(data.sede_cancha);
            fields.push(`sede_cancha = $${params.length}`);
        }
        if (data.condicion_juego !== undefined) {
            params.push(data.condicion_juego);
            fields.push(`condicion_juego = $${params.length}`);
        }
        if (data.indumentaria_kit !== undefined) {
            params.push(data.indumentaria_kit);
            fields.push(`indumentaria_kit = $${params.length}`);
        }
        if (data.estado_partido !== undefined) {
            params.push(data.estado_partido);
            fields.push(`estado_partido = $${params.length}`);
        }
        if (data.goles_club !== undefined) {
            params.push(data.goles_club);
            fields.push(`goles_club = $${params.length}`);
        }
        if (data.goles_rival !== undefined) {
            params.push(data.goles_rival);
            fields.push(`goles_rival = $${params.length}`);
        }
        if (fields.length === 0)
            return null;
        const query = `
      UPDATE competicion.partidos
      SET ${fields.join(', ')}
      WHERE id = $1 AND club_id = $2
      RETURNING *
    `;
        const res = await this.db.query(query, params);
        return res.rows[0] || null;
    }
    async deletePartido(id, clubId) {
        await this.db.query(`DELETE FROM competicion.actas_partido_eventos WHERE partido_id = $1`, [id]);
        await this.db.query(`DELETE FROM competicion.convocatorias WHERE partido_id = $1`, [id]);
        const res = await this.db.query(`DELETE FROM competicion.partidos WHERE id = $1 AND club_id = $2 RETURNING *`, [id, clubId]);
        return res.rows[0] || null;
    }
    async createEventoActa(partidoId, data) {
        const res = await this.db.query(`INSERT INTO competicion.actas_partido_eventos (
         partido_id, jugador_id, minuto_juego, tipo_evento, observacion
       ) VALUES ($1, $2, $3, $4, $5)
       RETURNING *, observacion as descripcion`, [
            partidoId,
            data.jugador_id || null,
            data.minuto_juego,
            data.tipo_evento,
            data.observacion || data.descripcion || '',
        ]);
        return res.rows[0];
    }
};
exports.PartidosRepository = PartidosRepository;
exports.PartidosRepository = PartidosRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], PartidosRepository);
//# sourceMappingURL=partidos.repository.js.map
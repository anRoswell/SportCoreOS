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
exports.ConvocatoriasService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
let ConvocatoriasService = class ConvocatoriasService {
    db;
    constructor(db) {
        this.db = db;
    }
    async findByPartido(partidoId) {
        const jugadoresRes = await this.db.query(`SELECT c.*, j.nombres, j.apellidos, j.numero_dorsal, j.posicion_principal, j.foto_url
       FROM competicion.convocatorias c
       JOIN deportivo.jugadores j ON j.id = c.jugador_id
       WHERE c.partido_id = $1
       ORDER BY 
         CASE c.rol_convocatoria 
           WHEN 'TITULAR' THEN 1 
           WHEN 'SUPLENTE' THEN 2 
           WHEN 'RESERVA' THEN 3 
           ELSE 4 
         END,
         j.numero_dorsal ASC NULLS LAST`, [partidoId]);
        const partidoRes = await this.db.query(`SELECT p.*, c.nombre as categoria_nombre 
       FROM competicion.partidos p
       JOIN deportivo.categorias c ON c.id = p.categoria_id
       WHERE p.id = $1`, [partidoId]);
        return {
            partido: partidoRes.rows[0] || null,
            convocatoria: { id: partidoId, partido_id: partidoId },
            jugadores: jugadoresRes.rows,
        };
    }
    async responderConvocatoria(convocatoriaId, estado, motivoExcusa, jugadorId) {
        let query = `
      UPDATE competicion.convocatorias
      SET estado_confirmacion = $1, motivo_excusa = $2, fecha_confirmacion = NOW()
      WHERE id = $3
      RETURNING *
    `;
        let params = [estado, motivoExcusa || null, convocatoriaId];
        if (jugadorId) {
            query = `
        UPDATE competicion.convocatorias
        SET estado_confirmacion = $1, motivo_excusa = $2, fecha_confirmacion = NOW()
        WHERE (id = $3 OR (partido_id = $3 AND jugador_id = $4))
        RETURNING *
      `;
            params = [estado, motivoExcusa || null, convocatoriaId, jugadorId];
        }
        const res = await this.db.query(query, params);
        return res.rows[0];
    }
    async addJugadorConvocatoria(partidoId, jugadorId, rol = 'TITULAR', posicion) {
        const jugRes = await this.db.query(`SELECT posicion_principal FROM deportivo.jugadores WHERE id = $1`, [jugadorId]);
        const pos = posicion || jugRes.rows[0]?.posicion_principal || 'Jugador de Campo';
        const res = await this.db.query(`INSERT INTO competicion.convocatorias (
         partido_id, jugador_id, rol_convocatoria, posicion_designada, estado_confirmacion
       ) VALUES ($1, $2, $3, $4, 'PENDIENTE')
       ON CONFLICT (partido_id, jugador_id) 
       DO UPDATE SET rol_convocatoria = EXCLUDED.rol_convocatoria, posicion_designada = EXCLUDED.posicion_designada
       RETURNING *`, [partidoId, jugadorId, rol, pos]);
        return res.rows[0];
    }
    async removeJugadorConvocatoria(partidoId, jugadorId) {
        const res = await this.db.query(`DELETE FROM competicion.convocatorias 
       WHERE partido_id = $1 AND (jugador_id::text = $2 OR id::text = $2)
       RETURNING *`, [partidoId, jugadorId]);
        return res.rows[0] || { deleted: true };
    }
    async cambiarRolConvocatoria(partidoId, jugadorId, nuevoRol) {
        const res = await this.db.query(`UPDATE competicion.convocatorias
       SET rol_convocatoria = $3
       WHERE partido_id = $1 AND (jugador_id::text = $2 OR id::text = $2)
       RETURNING *`, [partidoId, jugadorId, nuevoRol]);
        return res.rows[0];
    }
    async sugerirConvocatoria(partidoId, limiteTitulares = 11, limiteSuplentes = 7) {
        const partidoRes = await this.db.query(`SELECT p.categoria_id, p.club_id FROM competicion.partidos p WHERE p.id = $1`, [partidoId]);
        const partido = partidoRes.rows[0];
        if (!partido)
            throw new common_1.NotFoundException('Partido no encontrado');
        const jugRes = await this.db.query(`SELECT j.id, j.posicion_principal, j.numero_dorsal
       FROM deportivo.jugadores j
       WHERE j.club_id = $1 AND j.categoria_id = $2 AND j.estado_matricula = 'ACTIVO'
       ORDER BY j.numero_dorsal ASC NULLS LAST
       LIMIT $3`, [partido.club_id, partido.categoria_id, limiteTitulares + limiteSuplentes]);
        for (let i = 0; i < jugRes.rows.length; i++) {
            const jug = jugRes.rows[i];
            const rol = i < limiteTitulares ? 'TITULAR' : 'SUPLENTE';
            await this.db.query(`INSERT INTO competicion.convocatorias (
           partido_id, jugador_id, rol_convocatoria, posicion_designada, estado_confirmacion
         ) VALUES ($1, $2, $3, $4, 'PENDIENTE')
         ON CONFLICT (partido_id, jugador_id) DO NOTHING`, [partidoId, jug.id, rol, jug.posicion_principal]);
        }
        return this.findByPartido(partidoId);
    }
};
exports.ConvocatoriasService = ConvocatoriasService;
exports.ConvocatoriasService = ConvocatoriasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ConvocatoriasService);
//# sourceMappingURL=convocatorias.service.js.map
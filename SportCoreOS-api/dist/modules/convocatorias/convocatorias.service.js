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
};
exports.ConvocatoriasService = ConvocatoriasService;
exports.ConvocatoriasService = ConvocatoriasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ConvocatoriasService);
//# sourceMappingURL=convocatorias.service.js.map
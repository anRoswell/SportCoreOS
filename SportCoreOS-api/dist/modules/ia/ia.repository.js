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
exports.IaRepository = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
let IaRepository = class IaRepository {
    db;
    constructor(db) {
        this.db = db;
    }
    async getPlantillaByCodigo(codigo) {
        const res = await this.db.query(`SELECT * FROM deportivo.ia_prompts_templates WHERE codigo_template = $1`, [codigo]);
        return res.rows[0] || null;
    }
    async getHistorialJugadorParaBoletin(jugadorId, clubId) {
        const jugadorRes = await this.db.query(`SELECT j.*, c.nombre as categoria_nombre 
       FROM deportivo.jugadores j 
       LEFT JOIN deportivo.categorias c ON j.categoria_id = c.id 
       WHERE j.id = $1 AND j.club_id = $2`, [jugadorId, clubId]);
        const biometriaRes = await this.db.query(`SELECT * FROM deportivo.evaluaciones_biometricas 
       WHERE jugador_id = $1 
       ORDER BY fecha_evaluacion DESC LIMIT 2`, [jugadorId]);
        const partidosRes = await this.db.query(`SELECT a.minutos_jugados, a.goles, a.asistencias, a.tarjetas_amarillas, a.calificacion_rendimiento,
              p.rival_nombre, p.goles_club, p.goles_rival, p.fecha_partido
       FROM deportivo.alineaciones a
       JOIN deportivo.partidos p ON a.partido_id = p.id
       WHERE a.jugador_id = $1 AND p.club_id = $2
       ORDER BY p.fecha_partido DESC LIMIT 5`, [jugadorId, clubId]);
        return {
            jugador: jugadorRes.rows[0] || null,
            biometria: biometriaRes.rows,
            partidos: partidosRes.rows,
        };
    }
    async getMetricasFatigaJugador(jugadorId) {
        const res = await this.db.query(`SELECT m.*, s.fecha_sesion, s.tipo_sesion, s.duracion_minutos
       FROM deportivo.metricas_rendimiento_gps m
       JOIN deportivo.sesiones_gps s ON m.sesion_id = s.id
       WHERE m.jugador_id = $1
       ORDER BY s.fecha_sesion DESC LIMIT 10`, [jugadorId]);
        return res.rows;
    }
    async guardarLogGeneracion(clubId, jugadorId, codigoTemplate, promptTokens, completionTokens, contenidoGenerado, metadata = {}) {
        const res = await this.db.query(`INSERT INTO deportivo.ia_logs_generacion (
        club_id, jugador_id, codigo_template, prompt_tokens, completion_tokens, contenido_generado, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`, [clubId, jugadorId, codigoTemplate, promptTokens, completionTokens, contenidoGenerado, JSON.stringify(metadata)]);
        return res.rows[0];
    }
    async getPlantelesParaAnalisis(categoriaId, clubId) {
        const res = await this.db.query(`SELECT j.nombres, j.apellidos, j.posicion_principal, j.pie_habil, j.estado, j.dorsal
       FROM deportivo.jugadores j
       WHERE j.categoria_id = $1 AND j.club_id = $2 AND j.estado = 'ACTIVO'`, [categoriaId, clubId]);
        return res.rows;
    }
};
exports.IaRepository = IaRepository;
exports.IaRepository = IaRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], IaRepository);
//# sourceMappingURL=ia.repository.js.map
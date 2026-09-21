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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../../database/database.service");
let DashboardService = class DashboardService {
    db;
    constructor(db) {
        this.db = db;
    }
    async getExecutiveKPIs(clubId) {
        const jugCount = await this.db.query(`SELECT 
         COUNT(*) as total_activos,
         COUNT(*) FILTER (WHERE estado_matricula = 'LESIONADO') as total_lesionados
       FROM deportivo.jugadores 
       WHERE club_id = $1 AND estado_matricula IN ('ACTIVO', 'LESIONADO')`, [clubId]);
        const catCount = await this.db.query(`SELECT COUNT(*) as total_categorias FROM deportivo.categorias WHERE club_id = $1 AND activa = true`, [clubId]);
        const proxPartidos = await this.db.query(`SELECT p.id, p.rival_nombre, p.fecha_partido, p.hora_partido, p.sede_cancha,
              p.condicion_juego, c.nombre as categoria_nombre, c.codigo_categoria
       FROM competicion.partidos p
       JOIN deportivo.categorias c ON c.id = p.categoria_id
       WHERE p.club_id = $1
       ORDER BY p.fecha_partido ASC, p.hora_partido ASC
       LIMIT 5`, [clubId]);
        const finRes = await this.db.query(`SELECT 
         COALESCE(SUM(cj.monto_total - cj.monto_descuento_beca), 0) as facturado_mes,
         COALESCE(SUM(cj.monto_pagado), 0) as recaudado_mes,
         COALESCE(SUM(cj.saldo_pendiente), 0) as cartera_mora
       FROM finanzas.cargos_jugador cj
       WHERE cj.club_id = $1`, [clubId]);
        const posCount = await this.db.query(`SELECT posicion_principal, COUNT(*) as cantidad
       FROM deportivo.jugadores
       WHERE club_id = $1 AND estado_matricula = 'ACTIVO'
       GROUP BY posicion_principal
       ORDER BY cantidad DESC`, [clubId]);
        return {
            jugadoresActivos: parseInt(jugCount.rows[0]?.total_activos || '0', 10),
            jugadoresLesionados: parseInt(jugCount.rows[0]?.total_lesionados || '0', 10),
            totalCategorias: parseInt(catCount.rows[0]?.total_categorias || '0', 10),
            proximosPartidos: proxPartidos.rows,
            finanzas: {
                facturadoMes: parseFloat(finRes.rows[0]?.facturado_mes || '0'),
                recaudadoMes: parseFloat(finRes.rows[0]?.recaudado_mes || '0'),
                carteraMora: parseFloat(finRes.rows[0]?.cartera_mora || '0'),
                porcentajeRecaudo: finRes.rows[0]?.facturado_mes > 0
                    ? Math.round((parseFloat(finRes.rows[0].recaudado_mes) / parseFloat(finRes.rows[0].facturado_mes)) * 100)
                    : 0,
            },
            distribucionPosiciones: posCount.rows,
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map
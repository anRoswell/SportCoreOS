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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetriaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const telemetria_service_1 = require("./telemetria.service");
const telemetria_dto_1 = require("./telemetria.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let TelemetriaController = class TelemetriaController {
    telemetriaService;
    constructor(telemetriaService) {
        this.telemetriaService = telemetriaService;
    }
    async getSesiones(user, page, limit, search, tipoSesion) {
        return this.telemetriaService.findAllSesiones(user.clubId, {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search,
            tipoSesion,
        });
    }
    async getSesionById(id, user) {
        return this.telemetriaService.findSesionById(id, user.clubId);
    }
    async createSesion(user, dto) {
        return this.telemetriaService.createSesion(user.clubId, dto);
    }
    async createMetrica(id, user, dto) {
        return this.telemetriaService.createMetrica(id, user.clubId, dto);
    }
    async getMetricasJugador(jugadorId, user) {
        return this.telemetriaService.findMetricasByJugador(jugadorId, user.clubId);
    }
};
exports.TelemetriaController = TelemetriaController;
__decorate([
    (0, common_1.Get)('sesiones'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas las sesiones de telemetría GPS del club con paginación' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'tipoSesion', required: false, type: String }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('tipoSesion')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], TelemetriaController.prototype, "getSesiones", null);
__decorate([
    (0, common_1.Get)('sesiones/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener detalle de sesión con métricas y heatmaps de todos los jugadores' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la sesión GPS' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TelemetriaController.prototype, "getSesionById", null);
__decorate([
    (0, common_1.Post)('sesiones'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una nueva sesión de entrenamiento o partido para ingesta de GPS' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, telemetria_dto_1.CreateSesionGpsDto]),
    __metadata("design:returntype", Promise)
], TelemetriaController.prototype, "createSesion", null);
__decorate([
    (0, common_1.Post)('sesiones/:id/metricas'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar métricas cinemáticas individuales (distancia, sprint, PlayerLoad, heatmap)' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID de la sesión GPS' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, telemetria_dto_1.CreateMetricaGpsDto]),
    __metadata("design:returntype", Promise)
], TelemetriaController.prototype, "createMetrica", null);
__decorate([
    (0, common_1.Get)('jugadores/:jugadorId/historial'),
    (0, swagger_1.ApiOperation)({ summary: 'Consultar el historial longitudinal de telemetría GPS de un jugador' }),
    (0, swagger_1.ApiParam)({ name: 'jugadorId', description: 'ID del jugador' }),
    __param(0, (0, common_1.Param)('jugadorId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TelemetriaController.prototype, "getMetricasJugador", null);
exports.TelemetriaController = TelemetriaController = __decorate([
    (0, swagger_1.ApiTags)('Módulo 12: Telemetría GPS, Heatmaps & Wearables'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('telemetria'),
    __metadata("design:paramtypes", [telemetria_service_1.TelemetriaService])
], TelemetriaController);
//# sourceMappingURL=telemetria.controller.js.map
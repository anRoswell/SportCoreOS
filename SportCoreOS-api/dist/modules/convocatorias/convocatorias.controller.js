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
exports.ConvocatoriasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const convocatorias_service_1 = require("./convocatorias.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let ConvocatoriasController = class ConvocatoriasController {
    convocatoriasService;
    constructor(convocatoriasService) {
        this.convocatoriasService = convocatoriasService;
    }
    async getByPartido(partidoId) {
        return this.convocatoriasService.findByPartido(partidoId);
    }
    async responder(convocatoriaId, body) {
        return this.convocatoriasService.responderConvocatoria(convocatoriaId, body.estado, body.motivoExcusa, body.jugadorId);
    }
    async addJugador(partidoId, body) {
        return this.convocatoriasService.addJugadorConvocatoria(partidoId, body.jugadorId, body.rol || 'TITULAR', body.posicion);
    }
    async removeJugador(partidoId, jugadorId) {
        return this.convocatoriasService.removeJugadorConvocatoria(partidoId, jugadorId);
    }
    async cambiarRol(partidoId, jugadorId, body) {
        return this.convocatoriasService.cambiarRolConvocatoria(partidoId, jugadorId, body.rol);
    }
    async sugerir(partidoId, body) {
        return this.convocatoriasService.sugerirConvocatoria(partidoId, body.limiteTitulares || 11, body.limiteSuplentes || 7);
    }
};
exports.ConvocatoriasController = ConvocatoriasController;
__decorate([
    (0, common_1.Get)('partido/:partidoId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener convocatoria oficial de un partido con lista de citados' }),
    __param(0, (0, common_1.Param)('partidoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConvocatoriasController.prototype, "getByPartido", null);
__decorate([
    (0, common_1.Post)(':convocatoriaId/responder'),
    (0, swagger_1.ApiOperation)({ summary: 'Confirmar asistencia o excusar inasistencia del jugador' }),
    __param(0, (0, common_1.Param)('convocatoriaId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConvocatoriasController.prototype, "responder", null);
__decorate([
    (0, common_1.Post)('partido/:partidoId/jugadores'),
    (0, swagger_1.ApiOperation)({ summary: 'Agregar o convocar jugador a un partido' }),
    __param(0, (0, common_1.Param)('partidoId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConvocatoriasController.prototype, "addJugador", null);
__decorate([
    (0, common_1.Post)('partido/:partidoId/jugadores/:jugadorId/eliminar'),
    (0, swagger_1.ApiOperation)({ summary: 'Desconvocar / Quitar jugador de la citación' }),
    __param(0, (0, common_1.Param)('partidoId')),
    __param(1, (0, common_1.Param)('jugadorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ConvocatoriasController.prototype, "removeJugador", null);
__decorate([
    (0, common_1.Post)('partido/:partidoId/jugadores/:jugadorId/rol'),
    (0, swagger_1.ApiOperation)({ summary: 'Cambiar rol de convocatoria (TITULAR / SUPLENTE / RESERVA)' }),
    __param(0, (0, common_1.Param)('partidoId')),
    __param(1, (0, common_1.Param)('jugadorId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ConvocatoriasController.prototype, "cambiarRol", null);
__decorate([
    (0, common_1.Post)('partido/:partidoId/sugerir'),
    (0, swagger_1.ApiOperation)({ summary: 'Pre-armar sugerencia de convocatoria para el DT' }),
    __param(0, (0, common_1.Param)('partidoId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ConvocatoriasController.prototype, "sugerir", null);
exports.ConvocatoriasController = ConvocatoriasController = __decorate([
    (0, swagger_1.ApiTags)('Convocatorias a Partidos'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('convocatorias'),
    __metadata("design:paramtypes", [convocatorias_service_1.ConvocatoriasService])
], ConvocatoriasController);
//# sourceMappingURL=convocatorias.controller.js.map
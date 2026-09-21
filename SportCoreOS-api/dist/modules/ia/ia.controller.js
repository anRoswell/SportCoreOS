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
exports.IaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ia_service_1 = require("./ia.service");
const ia_dto_1 = require("./ia.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let IaController = class IaController {
    iaService;
    constructor(iaService) {
        this.iaService = iaService;
    }
    async generarBoletinAlumno(user, dto) {
        return this.iaService.generarBoletinAlumno(user.clubId, dto);
    }
    async analisisFatiga(jugadorId) {
        return this.iaService.analisisFatiga(jugadorId);
    }
    async chatTacticoDt(user, dto) {
        return this.iaService.chatTacticoDt(user.clubId, dto);
    }
};
exports.IaController = IaController;
__decorate([
    (0, common_1.Post)('generar-boletin-alumno'),
    (0, swagger_1.ApiOperation)({ summary: 'Generar boletín formativo cualitativo mensual de un jugador para padres con IA' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ia_dto_1.GenerarBoletinAlumnoDto]),
    __metadata("design:returntype", Promise)
], IaController.prototype, "generarBoletinAlumno", null);
__decorate([
    (0, common_1.Get)('analisis-fatiga/:jugadorId'),
    (0, swagger_1.ApiOperation)({ summary: 'Calcular ratio ACWR, riesgo de lesión y minutos recomendados por IA' }),
    (0, swagger_1.ApiParam)({ name: 'jugadorId', description: 'ID único del jugador' }),
    __param(0, (0, common_1.Param)('jugadorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], IaController.prototype, "analisisFatiga", null);
__decorate([
    (0, common_1.Post)('chat-tactico-dt'),
    (0, swagger_1.ApiOperation)({ summary: 'Consultar al copiloto táctico de IA sobre planteamiento y variantes de partido' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ia_dto_1.ChatTacticoDtDto]),
    __metadata("design:returntype", Promise)
], IaController.prototype, "chatTacticoDt", null);
exports.IaController = IaController = __decorate([
    (0, swagger_1.ApiTags)('Módulo 10: SportCore AI (Asistente Gemini)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ia'),
    __metadata("design:paramtypes", [ia_service_1.IaService])
], IaController);
//# sourceMappingURL=ia.controller.js.map
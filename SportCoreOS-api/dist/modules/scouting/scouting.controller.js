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
exports.ScoutingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const scouting_service_1 = require("./scouting.service");
const scouting_dto_1 = require("./scouting.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ScoutingController = class ScoutingController {
    scoutingService;
    constructor(scoutingService) {
        this.scoutingService = scoutingService;
    }
    async getProspectos(user, page, limit, search, estado, posicion) {
        return this.scoutingService.findAllProspectos(user.clubId, {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search,
            estado,
            posicion,
        });
    }
    async getProspectoById(id, user) {
        return this.scoutingService.findProspectoById(id, user.clubId);
    }
    async createProspecto(user, dto) {
        return this.scoutingService.createProspecto(user.clubId, dto);
    }
    async updateProspecto(id, user, dto) {
        return this.scoutingService.updateProspecto(id, user.clubId, dto);
    }
    async deleteProspecto(id, user) {
        return this.scoutingService.deleteProspecto(id, user.clubId);
    }
    async createEvaluacion(id, user, dto) {
        return this.scoutingService.createEvaluacion(id, user.clubId, user.userId || user.id, dto);
    }
};
exports.ScoutingController = ScoutingController;
__decorate([
    (0, common_1.Get)('prospectos'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar talentos observados con filtros por posición, estado y búsqueda con paginación' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Buscar por nombre, club de origen o ciudad' }),
    (0, swagger_1.ApiQuery)({ name: 'estado', required: false, description: 'en_observacion, interes_fichaje, fichado, descartado' }),
    (0, swagger_1.ApiQuery)({ name: 'posicion', required: false, description: 'Filtrar por posición principal' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('estado')),
    __param(5, (0, common_1.Query)('posicion')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], ScoutingController.prototype, "getProspectos", null);
__decorate([
    (0, common_1.Get)('prospectos/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener expediente y rúbricas de evaluación técnica de un prospecto' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID del prospecto' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScoutingController.prototype, "getProspectoById", null);
__decorate([
    (0, common_1.Post)('prospectos'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar un nuevo talento en el pipeline de visorías' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, scouting_dto_1.CreateProspectoDto]),
    __metadata("design:returntype", Promise)
], ScoutingController.prototype, "createProspecto", null);
__decorate([
    (0, common_1.Put)('prospectos/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar datos generales o estado de captación del prospecto' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, scouting_dto_1.UpdateProspectoDto]),
    __metadata("design:returntype", Promise)
], ScoutingController.prototype, "updateProspecto", null);
__decorate([
    (0, common_1.Delete)('prospectos/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar un prospecto del pipeline' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScoutingController.prototype, "deleteProspecto", null);
__decorate([
    (0, common_1.Post)('prospectos/:id/evaluaciones'),
    (0, swagger_1.ApiOperation)({ summary: 'Añadir informe de observación y rúbricas 1-10 (Técnica, Táctica, Física, Mental)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, scouting_dto_1.CreateEvaluacionDto]),
    __metadata("design:returntype", Promise)
], ScoutingController.prototype, "createEvaluacion", null);
exports.ScoutingController = ScoutingController = __decorate([
    (0, swagger_1.ApiTags)('Módulo 11: Scouting, Visoría & Captación'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('scouting'),
    __metadata("design:paramtypes", [scouting_service_1.ScoutingService])
], ScoutingController);
//# sourceMappingURL=scouting.controller.js.map
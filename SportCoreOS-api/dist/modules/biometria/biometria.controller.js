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
exports.BiometriaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const biometria_service_1 = require("./biometria.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let BiometriaController = class BiometriaController {
    biometriaService;
    constructor(biometriaService) {
        this.biometriaService = biometriaService;
    }
    async getEvaluaciones(user, page, limit, search, categoriaId, diagnostico, sortBy) {
        return this.biometriaService.findByClub(user.clubId, {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search,
            categoriaId,
            diagnostico,
            sortBy,
        });
    }
    async registrarEvaluacion(user, data) {
        return this.biometriaService.registrarEvaluacion(user.clubId, user.sub, data);
    }
    async getHistorial(jugadorId) {
        return this.biometriaService.getHistorialJugador(jugadorId);
    }
};
exports.BiometriaController = BiometriaController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar evaluaciones biométricas paginadas con filtros y búsqueda' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Número de página' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Registros por página' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String, description: 'Búsqueda por nombre, dorsal o notas' }),
    (0, swagger_1.ApiQuery)({ name: 'categoriaId', required: false, type: String, description: 'Filtro por ID de categoría' }),
    (0, swagger_1.ApiQuery)({ name: 'diagnostico', required: false, type: String, description: 'Filtro por diagnóstico IMC' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, type: String, description: 'Criterio de ordenación' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('categoriaId')),
    __param(5, (0, common_1.Query)('diagnostico')),
    __param(6, (0, common_1.Query)('sortBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String, String]),
    __metadata("design:returntype", Promise)
], BiometriaController.prototype, "getEvaluaciones", null);
__decorate([
    (0, common_1.Post)('evaluacion'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar nueva evaluación antropométrica y test físico' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BiometriaController.prototype, "registrarEvaluacion", null);
__decorate([
    (0, common_1.Get)('jugador/:jugadorId'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener evolución temporal de peso, talla y tests de un jugador' }),
    __param(0, (0, common_1.Param)('jugadorId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BiometriaController.prototype, "getHistorial", null);
exports.BiometriaController = BiometriaController = __decorate([
    (0, swagger_1.ApiTags)('Biometría & Rendimiento'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('biometria'),
    __metadata("design:paramtypes", [biometria_service_1.BiometriaService])
], BiometriaController);
//# sourceMappingURL=biometria.controller.js.map
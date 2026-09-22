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
exports.PartidosController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const partidos_service_1 = require("./partidos.service");
const partidos_dto_1 = require("./partidos.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let PartidosController = class PartidosController {
    partidosService;
    constructor(partidosService) {
        this.partidosService = partidosService;
    }
    async getPartidos(user, page, limit, search, categoriaId, estado) {
        return this.partidosService.findByClub(user.clubId, {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search,
            categoriaId,
            estado,
        });
    }
    async getDetalle(id, user) {
        return this.partidosService.findDetallePartido(id, user.clubId);
    }
    async create(user, dto) {
        return this.partidosService.create(user.clubId, dto);
    }
    async update(id, user, dto) {
        return this.partidosService.update(id, user.clubId, dto);
    }
    async delete(id, user) {
        return this.partidosService.delete(id, user.clubId);
    }
    async addEvento(id, dto) {
        return this.partidosService.addEvento(id, dto);
    }
};
exports.PartidosController = PartidosController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar calendario y fixture de partidos con paginación' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'categoriaId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'estado', required: false, type: String }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('categoriaId')),
    __param(5, (0, common_1.Query)('estado')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], PartidosController.prototype, "getPartidos", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener detalle de partido y acta digital de eventos' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PartidosController.prototype, "getDetalle", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Programar un nuevo partido oficial o amistoso' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, partidos_dto_1.CreatePartidoDto]),
    __metadata("design:returntype", Promise)
], PartidosController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar datos o resultado de un partido' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, partidos_dto_1.UpdatePartidoDto]),
    __metadata("design:returntype", Promise)
], PartidosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar o cancelar un partido del calendario' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PartidosController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/eventos'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar un evento en el acta digital del partido (gol, tarjeta, etc)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, partidos_dto_1.CreateEventoActaDto]),
    __metadata("design:returntype", Promise)
], PartidosController.prototype, "addEvento", null);
exports.PartidosController = PartidosController = __decorate([
    (0, swagger_1.ApiTags)('Partidos & Fixture'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('partidos'),
    __metadata("design:paramtypes", [partidos_service_1.PartidosService])
], PartidosController);
//# sourceMappingURL=partidos.controller.js.map
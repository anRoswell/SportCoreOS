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
exports.CategoriasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const categorias_service_1 = require("./categorias.service");
const categorias_dto_1 = require("./categorias.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let CategoriasController = class CategoriasController {
    categoriasService;
    constructor(categoriasService) {
        this.categoriasService = categoriasService;
    }
    async getCategorias(user) {
        return this.categoriasService.findByClub(user.clubId);
    }
    async getPlantel(id, user) {
        return this.categoriasService.findPlantelByCategoria(id, user.clubId);
    }
    async create(user, dto) {
        return this.categoriasService.create(user.clubId, dto);
    }
    async update(id, user, dto) {
        return this.categoriasService.update(id, user.clubId, dto);
    }
    async delete(id, user) {
        return this.categoriasService.delete(id, user.clubId);
    }
};
exports.CategoriasController = CategoriasController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas las categorías deportivas del club (Sub-7 a Sub-20)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CategoriasController.prototype, "getCategorias", null);
__decorate([
    (0, common_1.Get)(':id/plantel'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener el plantel de jugadores registrados en una categoría' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CategoriasController.prototype, "getPlantel", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una nueva categoría deportiva' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, categorias_dto_1.CreateCategoriaDto]),
    __metadata("design:returntype", Promise)
], CategoriasController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar datos de una categoría deportiva' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, categorias_dto_1.UpdateCategoriaDto]),
    __metadata("design:returntype", Promise)
], CategoriasController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Desactivar una categoría deportiva' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CategoriasController.prototype, "delete", null);
exports.CategoriasController = CategoriasController = __decorate([
    (0, swagger_1.ApiTags)('Categorías Deportivas'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('categorias'),
    __metadata("design:paramtypes", [categorias_service_1.CategoriasService])
], CategoriasController);
//# sourceMappingURL=categorias.controller.js.map
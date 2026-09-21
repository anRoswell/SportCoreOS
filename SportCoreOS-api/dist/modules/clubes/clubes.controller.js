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
exports.ClubesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const clubes_service_1 = require("./clubes.service");
const clubes_dto_1 = require("./clubes.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let ClubesController = class ClubesController {
    clubesService;
    constructor(clubesService) {
        this.clubesService = clubesService;
    }
    async onboarding(dto) {
        return this.clubesService.onboarding(dto);
    }
    async getAll(onlyActive) {
        const activeFilter = onlyActive !== 'false';
        return this.clubesService.findAll(activeFilter);
    }
    async getMiClub(user) {
        return this.clubesService.findClubById(user.clubId);
    }
    async getSedes(user) {
        return this.clubesService.findSedesByClub(user.clubId);
    }
    async getById(id) {
        return this.clubesService.findClubById(id);
    }
    async getStaff(id) {
        return this.clubesService.getStaff(id);
    }
    async create(dto) {
        return this.clubesService.create(dto);
    }
    async update(id, dto) {
        return this.clubesService.update(id, dto);
    }
    async delete(id) {
        return this.clubesService.delete(id);
    }
};
exports.ClubesController = ClubesController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('onboarding'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Registrar una nueva escuela o academia de fútbol (Onboarding con Auto-Login)',
        description: 'Crea el club multi-tenant, el usuario Administrador/Director Deportivo, la membresía y devuelve el JWT para inicio de sesión inmediato.',
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Academia registrada y sesión iniciada con éxito' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'El correo del administrador ya está en uso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [clubes_dto_1.OnboardingClubDto]),
    __metadata("design:returntype", Promise)
], ClubesController.prototype, "onboarding", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas las escuelas y clubes disponibles' }),
    __param(0, (0, common_1.Query)('onlyActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClubesController.prototype, "getAll", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('perfil'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener datos del club del usuario autenticado' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClubesController.prototype, "getMiClub", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('sedes'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas las sedes y canchas del club del usuario autenticado' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClubesController.prototype, "getSedes", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener detalles de un club específico por ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClubesController.prototype, "getById", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':id/staff'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar entrenadores, directores y personal del club' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClubesController.prototype, "getStaff", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear un nuevo club (SuperAdmin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [clubes_dto_1.CreateClubDto]),
    __metadata("design:returntype", Promise)
], ClubesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar datos de un club' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, clubes_dto_1.UpdateClubDto]),
    __metadata("design:returntype", Promise)
], ClubesController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Desactivar un club' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClubesController.prototype, "delete", null);
exports.ClubesController = ClubesController = __decorate([
    (0, swagger_1.ApiTags)('Clubes & Escuelas Deportivas'),
    (0, common_1.Controller)('clubes'),
    __metadata("design:paramtypes", [clubes_service_1.ClubesService])
], ClubesController);
//# sourceMappingURL=clubes.controller.js.map
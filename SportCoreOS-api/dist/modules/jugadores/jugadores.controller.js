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
exports.JugadoresController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jugadores_service_1 = require("./jugadores.service");
const jugadores_dto_1 = require("./jugadores.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let JugadoresController = class JugadoresController {
    jugadoresService;
    constructor(jugadoresService) {
        this.jugadoresService = jugadoresService;
    }
    async getJugadores(user, page, limit, search, categoriaId, estado, posicion, genero, sortBy) {
        return this.jugadoresService.findAllByClub(user.clubId, {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search,
            categoriaId,
            estado,
            posicion,
            genero,
            sortBy,
        });
    }
    async getById(id, user) {
        return this.jugadoresService.findById(id, user.clubId);
    }
    async getExpediente(id, user) {
        return this.jugadoresService.findExpedienteCompleto(id, user.clubId);
    }
    async create(user, dto) {
        return this.jugadoresService.create(user.clubId, dto);
    }
    async update(id, user, dto) {
        return this.jugadoresService.update(id, user.clubId, dto);
    }
    async delete(id, user) {
        return this.jugadoresService.delete(id, user.clubId);
    }
    async addAcudiente(id, user, dto) {
        return this.jugadoresService.addAcudiente(id, user.clubId, dto);
    }
    async removeAcudiente(id, acudienteId, user) {
        return this.jugadoresService.removeAcudiente(id, user.clubId, acudienteId);
    }
    async addBiometria(id, user, dto) {
        const evaluadorId = user.sub || user.id;
        return this.jugadoresService.addEvaluacionBiometrica(id, user.clubId, evaluadorId, dto);
    }
};
exports.JugadoresController = JugadoresController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar jugadores del club con filtros (categoría, estado, posición, género, paginación)' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, description: 'Número de página' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, description: 'Registros por página' }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, description: 'Buscar por nombres, apellidos o documento' }),
    (0, swagger_1.ApiQuery)({ name: 'categoriaId', required: false, description: 'Filtrar por categoría deportiva' }),
    (0, swagger_1.ApiQuery)({ name: 'estado', required: false, description: 'Filtrar por estado (ACTIVO, SUSPENDIDO, LESIONADO, RETIRADO)' }),
    (0, swagger_1.ApiQuery)({ name: 'posicion', required: false, description: 'Filtrar por posición táctica' }),
    (0, swagger_1.ApiQuery)({ name: 'genero', required: false, description: 'Filtrar por género' }),
    (0, swagger_1.ApiQuery)({ name: 'sortBy', required: false, description: 'Criterio de ordenación' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('categoriaId')),
    __param(5, (0, common_1.Query)('estado')),
    __param(6, (0, common_1.Query)('posicion')),
    __param(7, (0, common_1.Query)('genero')),
    __param(8, (0, common_1.Query)('sortBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], JugadoresController.prototype, "getJugadores", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener datos básicos de un jugador por ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JugadoresController.prototype, "getById", null);
__decorate([
    (0, common_1.Get)(':id/expediente'),
    (0, swagger_1.ApiOperation)({ summary: 'Expediente 360° del jugador (Deportivo, Familiares/Acudientes, Radar Biométrico y Finanzas)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Retorna expediente 360° consolidado con historial completo' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JugadoresController.prototype, "getExpediente", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Inscribir nuevo jugador en el club (con validación de dorsal único)' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Jugador inscrito con éxito' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Conflicto de documento duplicado o dorsal ya ocupado en la categoría' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, jugadores_dto_1.CreateJugadorDto]),
    __metadata("design:returntype", Promise)
], JugadoresController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar datos de la ficha del jugador' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, jugadores_dto_1.UpdateJugadorDto]),
    __metadata("design:returntype", Promise)
], JugadoresController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Dar de baja / retirar jugador del club' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], JugadoresController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/acudientes'),
    (0, swagger_1.ApiOperation)({ summary: 'Vincular nuevo acudiente o familiar al jugador' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, jugadores_dto_1.CreateAcudienteDto]),
    __metadata("design:returntype", Promise)
], JugadoresController.prototype, "addAcudiente", null);
__decorate([
    (0, common_1.Delete)(':id/acudientes/:acudienteId'),
    (0, swagger_1.ApiOperation)({ summary: 'Desvincular acudiente del jugador' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('acudienteId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], JugadoresController.prototype, "removeAcudiente", null);
__decorate([
    (0, common_1.Post)(':id/biometria'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar nueva evaluación antropométrica / biométrica y pruebas físicas' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, jugadores_dto_1.CreateBiometriaDto]),
    __metadata("design:returntype", Promise)
], JugadoresController.prototype, "addBiometria", null);
exports.JugadoresController = JugadoresController = __decorate([
    (0, swagger_1.ApiTags)('Módulo 1: Jugadores & Fichas 360°'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('jugadores'),
    __metadata("design:paramtypes", [jugadores_service_1.JugadoresService])
], JugadoresController);
//# sourceMappingURL=jugadores.controller.js.map
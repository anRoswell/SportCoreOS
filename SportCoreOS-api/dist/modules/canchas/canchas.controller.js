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
exports.CanchasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const canchas_service_1 = require("./canchas.service");
const canchas_dto_1 = require("./canchas.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let CanchasController = class CanchasController {
    canchasService;
    constructor(canchasService) {
        this.canchasService = canchasService;
    }
    async getCanchas(user) {
        return this.canchasService.getCanchas(user.clubId);
    }
    async createCancha(user, dto) {
        return this.canchasService.createCancha(user.clubId, dto);
    }
    async updateCancha(id, user, dto) {
        return this.canchasService.updateCancha(id, user.clubId, dto);
    }
    async getDisponibilidad(user, fecha) {
        const targetFecha = fecha || new Date().toISOString().split('T')[0];
        return this.canchasService.getMatrizDisponibilidad(user.clubId, targetFecha);
    }
    async createReserva(user, dto) {
        return this.canchasService.createReserva(user.clubId, dto);
    }
    async registrarPagoCaja(id, dto) {
        return this.canchasService.registrarPagoCaja(id, dto);
    }
    async cancelarReserva(id) {
        return this.canchasService.cancelarReserva(id);
    }
};
exports.CanchasController = CanchasController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Listar todas las canchas y escenarios deportivos del club' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CanchasController.prototype, "getCanchas", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una nueva cancha o escenario deportivo' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, canchas_dto_1.CreateCanchaDto]),
    __metadata("design:returntype", Promise)
], CanchasController.prototype, "createCancha", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar datos y tarifas de una cancha' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, canchas_dto_1.UpdateCanchaDto]),
    __metadata("design:returntype", Promise)
], CanchasController.prototype, "updateCancha", null);
__decorate([
    (0, common_1.Get)('disponibilidad'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener matriz horaria de disponibilidad por fecha' }),
    (0, swagger_1.ApiQuery)({ name: 'fecha', required: true, example: '2026-03-25' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('fecha')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CanchasController.prototype, "getDisponibilidad", null);
__decorate([
    (0, common_1.Post)('reservas'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear una nueva reserva horaria con bloqueo transaccional' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, canchas_dto_1.CreateReservaDto]),
    __metadata("design:returntype", Promise)
], CanchasController.prototype, "createReserva", null);
__decorate([
    (0, common_1.Patch)('reservas/:id/pago-caja'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar abono o liquidación en efectivo/datáfono en recepción' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, canchas_dto_1.PagarCajaDto]),
    __metadata("design:returntype", Promise)
], CanchasController.prototype, "registrarPagoCaja", null);
__decorate([
    (0, common_1.Patch)('reservas/:id/cancelar'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancelar reserva de cancha' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CanchasController.prototype, "cancelarReserva", null);
exports.CanchasController = CanchasController = __decorate([
    (0, swagger_1.ApiTags)('Alquiler de Canchas & Sedes'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('canchas'),
    __metadata("design:paramtypes", [canchas_service_1.CanchasService])
], CanchasController);
//# sourceMappingURL=canchas.controller.js.map
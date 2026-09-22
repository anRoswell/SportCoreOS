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
exports.FinanzasController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const finanzas_service_1 = require("./finanzas.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let FinanzasController = class FinanzasController {
    finanzasService;
    constructor(finanzasService) {
        this.finanzasService = finanzasService;
    }
    async getResumen(user) {
        return this.finanzasService.getResumenFinanciero(user.clubId);
    }
    async getCargos(user, page, limit, search, categoriaId, estadoPago) {
        return this.finanzasService.getCargosPorCobrar(user.clubId, {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search,
            categoriaId,
            estadoPago,
        });
    }
    async generarMensualidad(user, body) {
        const now = new Date();
        const mes = body.mes || (now.getMonth() + 1);
        const anio = body.anio || now.getFullYear();
        return this.finanzasService.generarMensualidad(user.clubId, mes, anio);
    }
    async registrarPago(id, user, body) {
        return this.finanzasService.registrarPago(id, user.clubId, body.monto);
    }
};
exports.FinanzasController = FinanzasController;
__decorate([
    (0, common_1.Get)('resumen'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener métricas de recaudo mensual, facturación y cartera morosa' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinanzasController.prototype, "getResumen", null);
__decorate([
    (0, common_1.Get)('cargos'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar cargos y estados de cuenta con paginación y filtros' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'categoriaId', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'estadoPago', required: false, type: String }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('categoriaId')),
    __param(5, (0, common_1.Query)('estadoPago')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String, String]),
    __metadata("design:returntype", Promise)
], FinanzasController.prototype, "getCargos", null);
__decorate([
    (0, common_1.Post)('cargos/generar-mensualidad'),
    (0, swagger_1.ApiOperation)({ summary: 'Generar cobros de pensiones del mes para todos los jugadores activos' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], FinanzasController.prototype, "generarMensualidad", null);
__decorate([
    (0, common_1.Post)('cargos/:id/pagar'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar pago de un cargo de pensión o matrícula' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FinanzasController.prototype, "registrarPago", null);
exports.FinanzasController = FinanzasController = __decorate([
    (0, swagger_1.ApiTags)('Finanzas & Pagos PSE'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('finanzas'),
    __metadata("design:paramtypes", [finanzas_service_1.FinanzasService])
], FinanzasController);
//# sourceMappingURL=finanzas.controller.js.map
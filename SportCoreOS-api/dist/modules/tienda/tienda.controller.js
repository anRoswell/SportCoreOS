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
exports.TiendaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tienda_service_1 = require("./tienda.service");
const tienda_dto_1 = require("./tienda.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let TiendaController = class TiendaController {
    tiendaService;
    constructor(tiendaService) {
        this.tiendaService = tiendaService;
    }
    async getCatalogo(user, page, limit, search, categoria) {
        return this.tiendaService.getCatalogo(user.clubId, {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search,
            categoria,
        });
    }
    async getProductoById(id, user) {
        return this.tiendaService.getProductoById(id, user.clubId);
    }
    async createProducto(user, dto) {
        return this.tiendaService.createProducto(user.clubId, dto);
    }
    async updateProducto(id, user, dto) {
        return this.tiendaService.updateProducto(id, user.clubId, dto);
    }
    async deleteProducto(id, user) {
        return this.tiendaService.deleteProducto(id, user.clubId);
    }
    async ajustarStock(id, dto) {
        return this.tiendaService.ajustarStock(id, dto);
    }
    async getPedidos(user, page, limit, search, estadoDespacho) {
        return this.tiendaService.getPedidos(user.clubId, {
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search,
            estadoDespacho,
        });
    }
    async createPedido(user, dto) {
        return this.tiendaService.createPedido(user.clubId, dto);
    }
    async despacharPedido(id, dto) {
        return this.tiendaService.despacharPedido(id, dto);
    }
};
exports.TiendaController = TiendaController;
__decorate([
    (0, common_1.Get)('catalogo'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar catálogo de productos con tallas, stock y paginación' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'categoria', required: false, type: String }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('categoria')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "getCatalogo", null);
__decorate([
    (0, common_1.Get)('productos/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener detalle de un producto específico con sus tallas/variantes' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "getProductoById", null);
__decorate([
    (0, common_1.Post)('productos'),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nuevo producto con sus variantes de tallas' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tienda_dto_1.CreateProductoDto]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "createProducto", null);
__decorate([
    (0, common_1.Put)('productos/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar datos de un producto de la tienda' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "updateProducto", null);
__decorate([
    (0, common_1.Delete)('productos/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Desactivar o eliminar producto de la tienda' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "deleteProducto", null);
__decorate([
    (0, common_1.Patch)('variantes/:id/stock'),
    (0, swagger_1.ApiOperation)({ summary: 'Ajustar stock físico de una talla/variante en bodega' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tienda_dto_1.AjustarStockDto]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "ajustarStock", null);
__decorate([
    (0, common_1.Get)('pedidos'),
    (0, swagger_1.ApiOperation)({ summary: 'Listar órdenes y pedidos de indumentaria con paginación' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'search', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'estadoDespacho', required: false, type: String }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('estadoDespacho')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, String, String]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "getPedidos", null);
__decorate([
    (0, common_1.Post)('pedidos'),
    (0, swagger_1.ApiOperation)({ summary: 'Registrar nueva compra / orden de indumentaria con reserva de stock' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tienda_dto_1.CreatePedidoDto]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "createPedido", null);
__decorate([
    (0, common_1.Patch)('pedidos/:id/despachar'),
    (0, swagger_1.ApiOperation)({ summary: 'Validar y marcar pedido como entregado en utilería' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tienda_dto_1.DespacharPedidoDto]),
    __metadata("design:returntype", Promise)
], TiendaController.prototype, "despacharPedido", null);
exports.TiendaController = TiendaController = __decorate([
    (0, swagger_1.ApiTags)('Tienda Oficial & Inventario'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('tienda'),
    __metadata("design:paramtypes", [tienda_service_1.TiendaService])
], TiendaController);
//# sourceMappingURL=tienda.controller.js.map
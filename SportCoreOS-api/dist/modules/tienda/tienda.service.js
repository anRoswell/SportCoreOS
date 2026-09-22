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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiendaService = void 0;
const common_1 = require("@nestjs/common");
const tienda_repository_1 = require("./tienda.repository");
let TiendaService = class TiendaService {
    tiendaRepo;
    constructor(tiendaRepo) {
        this.tiendaRepo = tiendaRepo;
    }
    async getCatalogo(clubId, options) {
        return this.tiendaRepo.findCatalogoByClub(clubId, options);
    }
    async getProductoById(id, clubId) {
        const producto = await this.tiendaRepo.findProductoById(id, clubId);
        if (!producto) {
            throw new common_1.NotFoundException('Producto no encontrado');
        }
        return producto;
    }
    async createProducto(clubId, dto) {
        const producto = await this.tiendaRepo.createProducto(clubId, dto);
        if (dto.variantes && dto.variantes.length > 0) {
            for (const v of dto.variantes) {
                await this.tiendaRepo.createVariante(producto.id, v.talla, v.stock_actual, v.stock_minimo_alerta || 5);
            }
        }
        return producto;
    }
    async updateProducto(id, clubId, dto) {
        const updated = await this.tiendaRepo.updateProducto(id, clubId, dto);
        if (!updated) {
            throw new common_1.NotFoundException('Producto no encontrado');
        }
        return updated;
    }
    async deleteProducto(id, clubId) {
        const deleted = await this.tiendaRepo.deleteProducto(id, clubId);
        if (!deleted) {
            throw new common_1.NotFoundException('Producto no encontrado');
        }
        return deleted;
    }
    async ajustarStock(varianteId, dto) {
        const updated = await this.tiendaRepo.ajustarStock(varianteId, dto.stock_actual);
        if (!updated) {
            throw new common_1.NotFoundException('Variante de producto no encontrada');
        }
        return updated;
    }
    async createPedido(clubId, dto) {
        const variante = await this.tiendaRepo.findVarianteById(dto.variante_id);
        if (!variante) {
            throw new common_1.NotFoundException('Variante de producto no encontrada');
        }
        if (variante.stock_actual < dto.cantidad) {
            throw new common_1.BadRequestException(`Stock insuficiente. Solo quedan ${variante.stock_actual} unidades disponibles.`);
        }
        const stockActualizado = await this.tiendaRepo.decrementarStock(dto.variante_id, dto.cantidad);
        if (!stockActualizado) {
            throw new common_1.BadRequestException('No fue posible reservar el stock solicitado.');
        }
        const precioUnitario = Number(variante.precio_venta);
        const montoTotal = precioUnitario * dto.cantidad;
        const codigoQr = `SPORT-TIENDA-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const pedidoData = {
            club_id: clubId,
            variante_id: dto.variante_id,
            jugador_id: dto.jugador_id || null,
            cantidad: dto.cantidad,
            precio_unitario: precioUnitario,
            monto_total: montoTotal,
            estampado_nombre: dto.estampado_nombre || null,
            estampado_dorsal: dto.estampado_dorsal || null,
            comprador_nombre: dto.comprador_nombre || null,
            comprador_telefono: dto.comprador_telefono || null,
            estado_pago: 'PAGADO',
            estado_despacho: 'PENDIENTE_ENTREGA',
            metodo_pago: dto.metodo_pago || 'WOMPI_PSE',
            codigo_qr: codigoQr,
        };
        return this.tiendaRepo.createPedido(pedidoData);
    }
    async getPedidos(clubId, options) {
        return this.tiendaRepo.findPedidosByClub(clubId, options);
    }
    async despacharPedido(pedidoId, dto) {
        const despachado = await this.tiendaRepo.despacharPedido(pedidoId, dto.recibido_por);
        if (!despachado) {
            throw new common_1.NotFoundException('Pedido no encontrado');
        }
        return despachado;
    }
};
exports.TiendaService = TiendaService;
exports.TiendaService = TiendaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tienda_repository_1.TiendaRepository])
], TiendaService);
//# sourceMappingURL=tienda.service.js.map
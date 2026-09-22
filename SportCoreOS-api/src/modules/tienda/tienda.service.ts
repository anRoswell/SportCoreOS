import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { TiendaRepository } from './tienda.repository';
import { CreateProductoDto, CreatePedidoDto, DespacharPedidoDto, AjustarStockDto } from './tienda.dto';

@Injectable()
export class TiendaService {
  constructor(private readonly tiendaRepo: TiendaRepository) {}

  async getCatalogo(
    clubId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      categoria?: string;
    },
  ) {
    return this.tiendaRepo.findCatalogoByClub(clubId, options);
  }

  async getProductoById(id: string, clubId: string) {
    const producto = await this.tiendaRepo.findProductoById(id, clubId);
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  async createProducto(clubId: string, dto: CreateProductoDto) {
    const producto = await this.tiendaRepo.createProducto(clubId, dto);

    if (dto.variantes && dto.variantes.length > 0) {
      for (const v of dto.variantes) {
        await this.tiendaRepo.createVariante(producto.id, v.talla, v.stock_actual, v.stock_minimo_alerta || 5);
      }
    }
    return producto;
  }

  async updateProducto(id: string, clubId: string, dto: any) {
    const updated = await this.tiendaRepo.updateProducto(id, clubId, dto);
    if (!updated) {
      throw new NotFoundException('Producto no encontrado');
    }
    return updated;
  }

  async deleteProducto(id: string, clubId: string) {
    const deleted = await this.tiendaRepo.deleteProducto(id, clubId);
    if (!deleted) {
      throw new NotFoundException('Producto no encontrado');
    }
    return deleted;
  }


  async ajustarStock(varianteId: string, dto: AjustarStockDto) {
    const updated = await this.tiendaRepo.ajustarStock(varianteId, dto.stock_actual);
    if (!updated) {
      throw new NotFoundException('Variante de producto no encontrada');
    }
    return updated;
  }

  async createPedido(clubId: string, dto: CreatePedidoDto) {
    const variante = await this.tiendaRepo.findVarianteById(dto.variante_id);
    if (!variante) {
      throw new NotFoundException('Variante de producto no encontrada');
    }

    if (variante.stock_actual < dto.cantidad) {
      throw new BadRequestException(`Stock insuficiente. Solo quedan ${variante.stock_actual} unidades disponibles.`);
    }

    // Decrementar stock físico
    const stockActualizado = await this.tiendaRepo.decrementarStock(dto.variante_id, dto.cantidad);
    if (!stockActualizado) {
      throw new BadRequestException('No fue posible reservar el stock solicitado.');
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

  async getPedidos(
    clubId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      estadoDespacho?: string;
    },
  ) {
    return this.tiendaRepo.findPedidosByClub(clubId, options);
  }

  async despacharPedido(pedidoId: string, dto: DespacharPedidoDto) {
    const despachado = await this.tiendaRepo.despacharPedido(pedidoId, dto.recibido_por);
    if (!despachado) {
      throw new NotFoundException('Pedido no encontrado');
    }
    return despachado;
  }
}

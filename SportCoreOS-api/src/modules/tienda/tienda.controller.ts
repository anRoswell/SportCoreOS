import { Controller, Get, Post, Put, Delete, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { TiendaService } from './tienda.service';
import { CreateProductoDto, CreatePedidoDto, DespacharPedidoDto, AjustarStockDto } from './tienda.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tienda Oficial & Inventario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tienda')
export class TiendaController {
  constructor(private readonly tiendaService: TiendaService) {}

  @Get('catalogo')
  @ApiOperation({ summary: 'Listar catálogo de productos con tallas, stock y paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoria', required: false, type: String })
  async getCatalogo(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('categoria') categoria?: string,
  ) {
    return this.tiendaService.getCatalogo(user.clubId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      categoria,
    });
  }

  @Get('productos/:id')
  @ApiOperation({ summary: 'Obtener detalle de un producto específico con sus tallas/variantes' })
  async getProductoById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.tiendaService.getProductoById(id, user.clubId);
  }

  @Post('productos')
  @ApiOperation({ summary: 'Crear nuevo producto con sus variantes de tallas' })
  async createProducto(@CurrentUser() user: any, @Body() dto: CreateProductoDto) {
    return this.tiendaService.createProducto(user.clubId, dto);
  }

  @Put('productos/:id')
  @ApiOperation({ summary: 'Actualizar datos de un producto de la tienda' })
  async updateProducto(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: any,
  ) {
    return this.tiendaService.updateProducto(id, user.clubId, dto);
  }

  @Delete('productos/:id')
  @ApiOperation({ summary: 'Desactivar o eliminar producto de la tienda' })
  async deleteProducto(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.tiendaService.deleteProducto(id, user.clubId);
  }

  @Patch('variantes/:id/stock')
  @ApiOperation({ summary: 'Ajustar stock físico de una talla/variante en bodega' })
  async ajustarStock(
    @Param('id') id: string,
    @Body() dto: AjustarStockDto,
  ) {
    return this.tiendaService.ajustarStock(id, dto);
  }

  @Get('pedidos')
  @ApiOperation({ summary: 'Listar órdenes y pedidos de indumentaria con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'estadoDespacho', required: false, type: String })
  async getPedidos(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('estadoDespacho') estadoDespacho?: string,
  ) {
    return this.tiendaService.getPedidos(user.clubId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      estadoDespacho,
    });
  }

  @Post('pedidos')
  @ApiOperation({ summary: 'Registrar nueva compra / orden de indumentaria con reserva de stock' })
  async createPedido(@CurrentUser() user: any, @Body() dto: CreatePedidoDto) {
    return this.tiendaService.createPedido(user.clubId, dto);
  }

  @Patch('pedidos/:id/despachar')
  @ApiOperation({ summary: 'Validar y marcar pedido como entregado en utilería' })
  async despacharPedido(
    @Param('id') id: string,
    @Body() dto: DespacharPedidoDto,
  ) {
    return this.tiendaService.despacharPedido(id, dto);
  }
}

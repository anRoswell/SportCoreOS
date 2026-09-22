import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FinanzasService } from './finanzas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Finanzas & Pagos PSE')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('finanzas')
export class FinanzasController {
  constructor(private readonly finanzasService: FinanzasService) {}

  @Get('resumen')
  @ApiOperation({ summary: 'Obtener métricas de recaudo mensual, facturación y cartera morosa' })
  async getResumen(@CurrentUser() user: any) {
    return this.finanzasService.getResumenFinanciero(user.clubId);
  }

  @Get('cargos')
  @ApiOperation({ summary: 'Listar cargos y estados de cuenta con paginación y filtros' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'categoriaId', required: false, type: String })
  @ApiQuery({ name: 'estadoPago', required: false, type: String })
  async getCargos(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('categoriaId') categoriaId?: string,
    @Query('estadoPago') estadoPago?: string,
  ) {
    return this.finanzasService.getCargosPorCobrar(user.clubId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      categoriaId,
      estadoPago,
    });
  }

  @Post('cargos/generar-mensualidad')
  @ApiOperation({ summary: 'Generar cobros de pensiones del mes para todos los jugadores activos' })
  async generarMensualidad(
    @CurrentUser() user: any,
    @Body() body: { mes?: number; anio?: number },
  ) {
    const now = new Date();
    const mes = body.mes || (now.getMonth() + 1);
    const anio = body.anio || now.getFullYear();
    return this.finanzasService.generarMensualidad(user.clubId, mes, anio);
  }

  @Post('cargos/:id/pagar')
  @ApiOperation({ summary: 'Registrar pago de un cargo de pensión o matrícula' })
  async registrarPago(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { monto: number; metodo?: string },
  ) {
    return this.finanzasService.registrarPago(id, user.clubId, body.monto);
  }
}

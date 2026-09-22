import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CanchasService } from './canchas.service';
import { CreateCanchaDto, UpdateCanchaDto, CreateReservaDto, PagarCajaDto } from './canchas.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Alquiler de Canchas & Sedes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('canchas')
export class CanchasController {
  constructor(private readonly canchasService: CanchasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas las canchas y escenarios deportivos del club con paginación' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'tipoSuperficie', required: false, type: String })
  async getCanchas(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('tipoSuperficie') tipoSuperficie?: string,
  ) {
    return this.canchasService.getCanchas(user.clubId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      tipoSuperficie,
    });
  }

  @Get('disponibilidad')
  @ApiOperation({ summary: 'Obtener matriz horaria de disponibilidad por fecha' })
  @ApiQuery({ name: 'fecha', required: true, example: '2026-03-25' })
  async getDisponibilidad(
    @CurrentUser() user: any,
    @Query('fecha') fecha: string,
  ) {
    const targetFecha = fecha || new Date().toISOString().split('T')[0];
    return this.canchasService.getMatrizDisponibilidad(user.clubId, targetFecha);
  }

  @Get('cartagena')
  @ApiOperation({ summary: 'Obtener catálogo geolocalizado de todas las canchas y escenarios deportivos de Cartagena con GPS' })
  @ApiQuery({ name: 'localidad', required: false, type: String })
  @ApiQuery({ name: 'barrio', required: false, type: String })
  @ApiQuery({ name: 'tipoSuperficie', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getCanchasCartagena(
    @Query('localidad') localidad?: string,
    @Query('barrio') barrio?: string,
    @Query('tipoSuperficie') tipoSuperficie?: string,
    @Query('search') search?: string,
  ) {
    return this.canchasService.getCanchasCartagena({
      localidad,
      barrio,
      tipoSuperficie,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una cancha específica' })
  async getCanchaById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.canchasService.getCanchaById(id, user.clubId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva cancha o escenario deportivo' })
  async createCancha(@CurrentUser() user: any, @Body() dto: CreateCanchaDto) {
    return this.canchasService.createCancha(user.clubId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar datos y tarifas de una cancha' })
  async updateCancha(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateCanchaDto,
  ) {
    return this.canchasService.updateCancha(id, user.clubId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar o eliminar una cancha' })
  async deleteCancha(@Param('id') id: string, @CurrentUser() user: any) {
    return this.canchasService.deleteCancha(id, user.clubId);
  }

  @Post('reservas')
  @ApiOperation({ summary: 'Crear una nueva reserva horaria con bloqueo transaccional' })
  async createReserva(@CurrentUser() user: any, @Body() dto: CreateReservaDto) {
    return this.canchasService.createReserva(user.clubId, dto);
  }

  @Patch('reservas/:id/pago-caja')
  @ApiOperation({ summary: 'Registrar abono o liquidación en efectivo/datáfono en recepción' })
  async registrarPagoCaja(
    @Param('id') id: string,
    @Body() dto: PagarCajaDto,
  ) {
    return this.canchasService.registrarPagoCaja(id, dto);
  }

  @Patch('reservas/:id/cancelar')
  @ApiOperation({ summary: 'Cancelar reserva de cancha' })
  async cancelarReserva(@Param('id') id: string) {
    return this.canchasService.cancelarReserva(id);
  }
}

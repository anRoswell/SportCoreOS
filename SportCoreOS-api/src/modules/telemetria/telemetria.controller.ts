import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TelemetriaService } from './telemetria.service';
import { CreateSesionGpsDto, CreateMetricaGpsDto } from './telemetria.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Módulo 12: Telemetría GPS, Heatmaps & Wearables')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('telemetria')
export class TelemetriaController {
  constructor(private readonly telemetriaService: TelemetriaService) {}

  @Get('sesiones')
  @ApiOperation({ summary: 'Listar todas las sesiones de telemetría GPS del club' })
  async getSesiones(@CurrentUser() user: any) {
    return this.telemetriaService.findAllSesiones(user.clubId);
  }

  @Get('sesiones/:id')
  @ApiOperation({ summary: 'Obtener detalle de sesión con métricas y heatmaps de todos los jugadores' })
  @ApiParam({ name: 'id', description: 'ID de la sesión GPS' })
  async getSesionById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.telemetriaService.findSesionById(id, user.clubId);
  }

  @Post('sesiones')
  @ApiOperation({ summary: 'Crear una nueva sesión de entrenamiento o partido para ingesta de GPS' })
  async createSesion(@CurrentUser() user: any, @Body() dto: CreateSesionGpsDto) {
    return this.telemetriaService.createSesion(user.clubId, dto);
  }

  @Post('sesiones/:id/metricas')
  @ApiOperation({ summary: 'Registrar métricas cinemáticas individuales (distancia, sprint, PlayerLoad, heatmap)' })
  @ApiParam({ name: 'id', description: 'ID de la sesión GPS' })
  async createMetrica(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: CreateMetricaGpsDto,
  ) {
    return this.telemetriaService.createMetrica(id, user.clubId, dto);
  }

  @Get('jugadores/:jugadorId/historial')
  @ApiOperation({ summary: 'Consultar el historial longitudinal de telemetría GPS de un jugador' })
  @ApiParam({ name: 'jugadorId', description: 'ID del jugador' })
  async getMetricasJugador(@Param('jugadorId') jugadorId: string, @CurrentUser() user: any) {
    return this.telemetriaService.findMetricasByJugador(jugadorId, user.clubId);
  }
}

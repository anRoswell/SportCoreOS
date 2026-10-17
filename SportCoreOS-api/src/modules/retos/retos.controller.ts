import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RetosService } from './retos.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Retos Individuales Comprobables & Gamificación')
@Controller('retos')
export class RetosController {
  constructor(private readonly retosService: RetosService) {}

  @Get('catalogo')
  @ApiOperation({ summary: 'Obtener catálogo general de retos individuales con niveles de dificultad' })
  async getCatalogo(@CurrentUser() user: any, @Req() req: any) {
    const clubId = req.headers?.['x-club-id'] || user?.clubId || req.clubId;
    return this.retosService.getCatalogo(clubId);
  }

  @Get('jugador/:jugadorId')
  @ApiOperation({ summary: 'Obtener histórico y estado de retos individuales de un jugador' })
  async getProgresoJugador(@Param('jugadorId') jugadorId: string, @CurrentUser() user: any, @Req() req: any) {
    const clubId = req.headers?.['x-club-id'] || user?.clubId || req.clubId;
    return this.retosService.getProgresoJugador(jugadorId, clubId);
  }

  @Get('jugador/:jugadorId/metricas')
  @ApiOperation({ summary: 'Obtener porcentaje y métricas de XP ganada por retos del jugador' })
  async getMetricasJugador(@Param('jugadorId') jugadorId: string, @CurrentUser() user: any, @Req() req: any) {
    const clubId = req.headers?.['x-club-id'] || user?.clubId || req.clubId;
    return this.retosService.getMetricasJugador(jugadorId, clubId);
  }

  @Post('solicitar')
  @ApiOperation({ summary: 'Alumno solicita certificar un reto individual (pasa a estado COMPROBABLE)' })
  async solicitarComprobacion(@Body() dto: any, @CurrentUser() user: any, @Req() req: any) {
    const clubId = req.headers?.['x-club-id'] || user?.clubId || req.clubId;
    return this.retosService.solicitarComprobacion(clubId, dto);
  }

  @Get('pendientes')
  @ApiOperation({ summary: 'Director Técnico lista retos pendientes de comprobación en cancha' })
  @ApiQuery({ name: 'categoriaId', required: false, type: String, description: 'Filtrar por categoría' })
  async getPendientes(@Query('categoriaId') categoriaId: string, @CurrentUser() user: any, @Req() req: any) {
    const clubId = req.headers?.['x-club-id'] || user?.clubId || req.clubId;
    return this.retosService.getPendientesEvaluacion(clubId, categoriaId);
  }

  @Post(':progresoId/evaluar')
  @ApiOperation({ summary: 'Director Técnico evalúa y aprueba/rechaza el reto en vivo, sumando XP' })
  async evaluarReto(
    @Param('progresoId') progresoId: string,
    @Body() dto: { aprobado: boolean; evaluadorDtId?: string; evaluadorDtNombre?: string; observaciones?: string },
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const clubId = req.headers?.['x-club-id'] || user?.clubId || req.clubId;
    const evaluadorNombre = dto.evaluadorDtNombre || (user ? `${user.nombre} ${user.apellido}` : req.user ? `${req.user.nombre} ${req.user.apellido}` : 'Director Técnico');
    return this.retosService.evaluarReto(progresoId, clubId, {
      ...dto,
      evaluadorDtNombre: evaluadorNombre,
      evaluadorDtId: dto.evaluadorDtId || user?.sub || req.user?.sub || null,
    });
  }
}

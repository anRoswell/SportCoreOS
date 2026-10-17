import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConvocatoriasService } from './convocatorias.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Convocatorias a Partidos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('convocatorias')
export class ConvocatoriasController {
  constructor(private readonly convocatoriasService: ConvocatoriasService) {}

  @Get('init-data')
  @ApiOperation({ summary: 'Obtener datos completos iniciales de convocatorias (InitData Pattern)' })
  @ApiQuery({ name: 'partidoId', required: false, description: 'ID de partido preferido' })
  async getInitData(
    @CurrentUser() user: any,
    @Query('partidoId') partidoId?: string,
  ) {
    return this.convocatoriasService.getConvocatoriasInitData(user.clubId, partidoId);
  }

  @Get('partido/:partidoId')
  @ApiOperation({ summary: 'Obtener convocatoria oficial de un partido con lista de citados' })
  async getByPartido(@Param('partidoId') partidoId: string) {
    return this.convocatoriasService.findByPartido(partidoId);
  }

  @Post(':convocatoriaId/responder')
  @ApiOperation({ summary: 'Confirmar asistencia o excusar inasistencia del jugador' })
  async responder(
    @Param('convocatoriaId') convocatoriaId: string,
    @Body() body: { estado: string; motivoExcusa?: string; jugadorId?: string },
  ) {
    return this.convocatoriasService.responderConvocatoria(
      convocatoriaId,
      body.estado,
      body.motivoExcusa,
      body.jugadorId,
    );
  }

  @Post('partido/:partidoId/jugadores')
  @ApiOperation({ summary: 'Agregar o convocar jugador a un partido' })
  async addJugador(
    @Param('partidoId') partidoId: string,
    @Body() body: { jugadorId: string; rol?: string; posicion?: string },
  ) {
    return this.convocatoriasService.addJugadorConvocatoria(
      partidoId,
      body.jugadorId,
      body.rol || 'TITULAR',
      body.posicion,
    );
  }

  @Post('partido/:partidoId/jugadores/:jugadorId/eliminar')
  @ApiOperation({ summary: 'Desconvocar / Quitar jugador de la citación' })
  async removeJugador(
    @Param('partidoId') partidoId: string,
    @Param('jugadorId') jugadorId: string,
  ) {
    return this.convocatoriasService.removeJugadorConvocatoria(partidoId, jugadorId);
  }

  @Post('partido/:partidoId/jugadores/:jugadorId/rol')
  @ApiOperation({ summary: 'Cambiar rol de convocatoria (TITULAR / SUPLENTE / RESERVA)' })
  async cambiarRol(
    @Param('partidoId') partidoId: string,
    @Param('jugadorId') jugadorId: string,
    @Body() body: { rol: string },
  ) {
    return this.convocatoriasService.cambiarRolConvocatoria(partidoId, jugadorId, body.rol);
  }

  @Post('partido/:partidoId/sugerir')
  @ApiOperation({ summary: 'Pre-armar sugerencia de convocatoria para el DT' })
  async sugerir(
    @Param('partidoId') partidoId: string,
    @Body() body: { limiteTitulares?: number; limiteSuplentes?: number },
  ) {
    return this.convocatoriasService.sugerirConvocatoria(
      partidoId,
      body.limiteTitulares || 11,
      body.limiteSuplentes || 7,
    );
  }
}

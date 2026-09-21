import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConvocatoriasService } from './convocatorias.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Convocatorias a Partidos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('convocatorias')
export class ConvocatoriasController {
  constructor(private readonly convocatoriasService: ConvocatoriasService) {}

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
}

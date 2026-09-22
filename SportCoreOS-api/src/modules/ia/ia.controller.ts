import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { IaService } from './ia.service';
import { GenerarBoletinAlumnoDto, ChatTacticoDtDto } from './ia.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Módulo 10: SportCore AI (Asistente Gemini)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ia')
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Post('generar-boletin-alumno')
  @ApiOperation({ summary: 'Generar boletín formativo cualitativo mensual de un jugador para padres con IA' })
  async generarBoletinAlumno(
    @CurrentUser() user: any,
    @Body() dto: GenerarBoletinAlumnoDto,
  ) {
    return this.iaService.generarBoletinAlumno(user.clubId, dto);
  }

  @Get('analisis-fatiga/:jugadorId')
  @ApiOperation({ summary: 'Calcular ratio ACWR, riesgo de lesión y minutos recomendados por IA' })
  @ApiParam({ name: 'jugadorId', description: 'ID único del jugador' })
  async analisisFatiga(@Param('jugadorId') jugadorId: string) {
    return this.iaService.analisisFatiga(jugadorId);
  }

  @Post('chat-tactico-dt')
  @ApiOperation({ summary: 'Consultar al copiloto táctico de IA sobre planteamiento y variantes de partido' })
  async chatTacticoDt(
    @CurrentUser() user: any,
    @Body() dto: ChatTacticoDtDto,
  ) {
    return this.iaService.chatTacticoDt(user.clubId, dto);
  }

  @Post('generar-grafica-convocatoria')
  @ApiOperation({ summary: 'Generar diseño inteligente de póster para redes sociales con IA Gemini' })
  async generarGraficaConvocatoria(
    @CurrentUser() user: any,
    @Body() dto: any,
  ) {
    return this.iaService.generarGraficaConvocatoriaIa(user.clubId, dto);
  }
}


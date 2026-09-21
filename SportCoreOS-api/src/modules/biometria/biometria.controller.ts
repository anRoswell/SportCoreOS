import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BiometriaService } from './biometria.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Biometría & Rendimiento')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('biometria')
export class BiometriaController {
  constructor(private readonly biometriaService: BiometriaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar evaluaciones biométricas de todos los jugadores del club' })
  async getEvaluaciones(@CurrentUser() user: any) {
    return this.biometriaService.findByClub(user.clubId);
  }

  @Post('evaluacion')
  @ApiOperation({ summary: 'Registrar nueva evaluación antropométrica y test físico' })
  async registrarEvaluacion(@CurrentUser() user: any, @Body() data: any) {
    return this.biometriaService.registrarEvaluacion(user.clubId, user.sub, data);
  }

  @Get('jugador/:jugadorId')
  @ApiOperation({ summary: 'Obtener evolución temporal de peso, talla y tests de un jugador' })
  async getHistorial(@Param('jugadorId') jugadorId: string) {
    return this.biometriaService.getHistorialJugador(jugadorId);
  }
}

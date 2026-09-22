import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Listar evaluaciones biométricas paginadas con filtros y búsqueda' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Registros por página' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Búsqueda por nombre, dorsal o notas' })
  @ApiQuery({ name: 'categoriaId', required: false, type: String, description: 'Filtro por ID de categoría' })
  @ApiQuery({ name: 'diagnostico', required: false, type: String, description: 'Filtro por diagnóstico IMC' })
  @ApiQuery({ name: 'sortBy', required: false, type: String, description: 'Criterio de ordenación' })
  async getEvaluaciones(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('categoriaId') categoriaId?: string,
    @Query('diagnostico') diagnostico?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.biometriaService.findByClub(user.clubId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      categoriaId,
      diagnostico,
      sortBy,
    });
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

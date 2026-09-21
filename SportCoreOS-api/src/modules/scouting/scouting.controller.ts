import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ScoutingService } from './scouting.service';
import { CreateProspectoDto, UpdateProspectoDto, CreateEvaluacionDto } from './scouting.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Módulo 11: Scouting, Visoría & Captación')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('scouting')
export class ScoutingController {
  constructor(private readonly scoutingService: ScoutingService) {}

  @Get('prospectos')
  @ApiOperation({ summary: 'Listar talentos observados con filtros por posición, estado y búsqueda' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombre, club de origen o ciudad' })
  @ApiQuery({ name: 'estado', required: false, description: 'en_observacion, interes_fichaje, fichado, descartado' })
  @ApiQuery({ name: 'posicion', required: false, description: 'Filtrar por posición principal' })
  async getProspectos(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('estado') estado?: string,
    @Query('posicion') posicion?: string,
  ) {
    return this.scoutingService.findAllProspectos(user.clubId, search, estado, posicion);
  }

  @Get('prospectos/:id')
  @ApiOperation({ summary: 'Obtener expediente y rúbricas de evaluación técnica de un prospecto' })
  @ApiParam({ name: 'id', description: 'ID del prospecto' })
  async getProspectoById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.scoutingService.findProspectoById(id, user.clubId);
  }

  @Post('prospectos')
  @ApiOperation({ summary: 'Registrar un nuevo talento en el pipeline de visorías' })
  async createProspecto(@CurrentUser() user: any, @Body() dto: CreateProspectoDto) {
    return this.scoutingService.createProspecto(user.clubId, dto);
  }

  @Put('prospectos/:id')
  @ApiOperation({ summary: 'Actualizar datos generales o estado de captación del prospecto' })
  async updateProspecto(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateProspectoDto,
  ) {
    return this.scoutingService.updateProspecto(id, user.clubId, dto);
  }

  @Delete('prospectos/:id')
  @ApiOperation({ summary: 'Eliminar un prospecto del pipeline' })
  async deleteProspecto(@Param('id') id: string, @CurrentUser() user: any) {
    return this.scoutingService.deleteProspecto(id, user.clubId);
  }

  @Post('prospectos/:id/evaluaciones')
  @ApiOperation({ summary: 'Añadir informe de observación y rúbricas 1-10 (Técnica, Táctica, Física, Mental)' })
  async createEvaluacion(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: CreateEvaluacionDto,
  ) {
    return this.scoutingService.createEvaluacion(id, user.clubId, user.userId || user.id, dto);
  }
}

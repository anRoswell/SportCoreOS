import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JugadoresService } from './jugadores.service';
import {
  CreateJugadorDto,
  UpdateJugadorDto,
  CreateAcudienteDto,
  CreateBiometriaDto,
} from './jugadores.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Módulo 1: Jugadores & Fichas 360°')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('jugadores')
export class JugadoresController {
  constructor(private readonly jugadoresService: JugadoresService) {}

  @Get()
  @ApiOperation({ summary: 'Listar jugadores del club con filtros (categoría, estado, posición, género, paginación)' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número de página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Registros por página' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por nombres, apellidos o documento' })
  @ApiQuery({ name: 'categoriaId', required: false, description: 'Filtrar por categoría deportiva' })
  @ApiQuery({ name: 'estado', required: false, description: 'Filtrar por estado (ACTIVO, SUSPENDIDO, LESIONADO, RETIRADO)' })
  @ApiQuery({ name: 'posicion', required: false, description: 'Filtrar por posición táctica' })
  @ApiQuery({ name: 'genero', required: false, description: 'Filtrar por género' })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Criterio de ordenación' })
  async getJugadores(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('categoriaId') categoriaId?: string,
    @Query('estado') estado?: string,
    @Query('posicion') posicion?: string,
    @Query('genero') genero?: string,
    @Query('sortBy') sortBy?: string,
  ) {
    return this.jugadoresService.findAllByClub(user.clubId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      categoriaId,
      estado,
      posicion,
      genero,
      sortBy,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener datos básicos de un jugador por ID' })
  async getById(@Param('id') id: string, @CurrentUser() user: any) {
    return this.jugadoresService.findById(id, user.clubId);
  }

  @Get(':id/expediente')
  @ApiOperation({ summary: 'Expediente 360° del jugador (Deportivo, Familiares/Acudientes, Radar Biométrico y Finanzas)' })
  @ApiResponse({ status: 200, description: 'Retorna expediente 360° consolidado con historial completo' })
  async getExpediente(@Param('id') id: string, @CurrentUser() user: any) {
    return this.jugadoresService.findExpedienteCompleto(id, user.clubId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Inscribir nuevo jugador en el club (con validación de dorsal único)' })
  @ApiResponse({ status: 201, description: 'Jugador inscrito con éxito' })
  @ApiResponse({ status: 409, description: 'Conflicto de documento duplicado o dorsal ya ocupado en la categoría' })
  async create(@CurrentUser() user: any, @Body() dto: CreateJugadorDto) {
    return this.jugadoresService.create(user.clubId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de la ficha del jugador' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateJugadorDto,
  ) {
    return this.jugadoresService.update(id, user.clubId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Dar de baja / retirar jugador del club' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.jugadoresService.delete(id, user.clubId);
  }

  @Post(':id/acudientes')
  @ApiOperation({ summary: 'Vincular nuevo acudiente o familiar al jugador' })
  async addAcudiente(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: CreateAcudienteDto,
  ) {
    return this.jugadoresService.addAcudiente(id, user.clubId, dto);
  }

  @Delete(':id/acudientes/:acudienteId')
  @ApiOperation({ summary: 'Desvincular acudiente del jugador' })
  async removeAcudiente(
    @Param('id') id: string,
    @Param('acudienteId') acudienteId: string,
    @CurrentUser() user: any,
  ) {
    return this.jugadoresService.removeAcudiente(id, user.clubId, acudienteId);
  }

  @Post(':id/biometria')
  @ApiOperation({ summary: 'Registrar nueva evaluación antropométrica / biométrica y pruebas físicas' })
  async addBiometria(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: CreateBiometriaDto,
  ) {
    const evaluadorId = user.sub || user.id;
    return this.jugadoresService.addEvaluacionBiometrica(id, user.clubId, evaluadorId, dto);
  }
}

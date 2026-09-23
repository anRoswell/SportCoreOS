import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto, UpdateCategoriaDto } from './categorias.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Categorías Deportivas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorías deportivas del club con paginación y filtros' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'rama', required: false, type: String })
  @ApiQuery({ name: 'dtId', required: false, type: String })
  async getCategorias(
    @CurrentUser() user: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('rama') rama?: string,
    @Query('dtId') dtId?: string,
  ) {
    // Si el usuario logueado es ENTRENADOR_DT, solo ve sus categorías asignadas por defecto
    let targetDtId = dtId;
    if (user.rol === 'ENTRENADOR_DT') {
      targetDtId = user.id;
    }

    return this.categoriasService.findByClub(user.clubId, {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      rama,
      directorTecnicoId: targetDtId,
    });
  }

  @Get(':id/plantel')
  @ApiOperation({ summary: 'Obtener el plantel de jugadores registrados en una categoría' })
  async getPlantel(@Param('id') id: string, @CurrentUser() user: any) {
    return this.categoriasService.findPlantelByCategoria(id, user.clubId);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una nueva categoría deportiva' })
  async create(@CurrentUser() user: any, @Body() dto: CreateCategoriaDto) {
    return this.categoriasService.create(user.clubId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar datos de una categoría deportiva' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.update(id, user.clubId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar una categoría deportiva' })
  async delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.categoriasService.delete(id, user.clubId);
  }
}

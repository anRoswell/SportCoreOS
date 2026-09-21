import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Listar todas las categorías deportivas del club (Sub-7 a Sub-20)' })
  async getCategorias(@CurrentUser() user: any) {
    return this.categoriasService.findByClub(user.clubId);
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

import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PartidosService } from './partidos.service';
import { CreatePartidoDto, UpdatePartidoDto, CreateEventoActaDto } from './partidos.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Partidos & Fixture')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('partidos')
export class PartidosController {
  constructor(private readonly partidosService: PartidosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar calendario y fixture de partidos' })
  @ApiQuery({ name: 'categoriaId', required: false })
  async getPartidos(
    @CurrentUser() user: any,
    @Query('categoriaId') categoriaId?: string,
  ) {
    return this.partidosService.findByClub(user.clubId, categoriaId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de partido y acta digital de eventos' })
  async getDetalle(@Param('id') id: string, @CurrentUser() user: any) {
    return this.partidosService.findDetallePartido(id, user.clubId);
  }

  @Post()
  @ApiOperation({ summary: 'Programar un nuevo partido oficial o amistoso' })
  async create(@CurrentUser() user: any, @Body() dto: CreatePartidoDto) {
    return this.partidosService.create(user.clubId, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar datos o resultado de un partido' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdatePartidoDto,
  ) {
    return this.partidosService.update(id, user.clubId, dto);
  }

  @Post(':id/eventos')
  @ApiOperation({ summary: 'Registrar un evento en el acta digital del partido (gol, tarjeta, etc)' })
  async addEvento(
    @Param('id') id: string,
    @Body() dto: CreateEventoActaDto,
  ) {
    return this.partidosService.addEvento(id, dto);
  }
}

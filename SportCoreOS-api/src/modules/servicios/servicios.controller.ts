import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { ServiciosService } from './servicios.service';
import { CreateServicioDto, InscribirServicioDto } from './servicios.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Servicios Especializados & Masterclasses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('servicios')
export class ServiciosController {
  constructor(private readonly serviciosService: ServiciosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar clínicas y servicios especializados del club' })
  @ApiQuery({ name: 'categoria', required: false, description: 'Categoría del servicio' })
  @ApiQuery({ name: 'search', required: false, description: 'Buscar por título o entrenador' })
  async getServicios(
    @CurrentUser() user: any,
    @Query('categoria') categoria?: string,
    @Query('search') search?: string,
  ) {
    const clubId = user.clubId || 'c1000000-0000-0000-0000-000000000001';
    return this.serviciosService.getServicios(clubId, {
      categoria,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de una clínica especializada por ID' })
  async getServicioById(@Param('id') id: string, @CurrentUser() user: any) {
    const clubId = user.clubId || 'c1000000-0000-0000-0000-000000000001';
    return this.serviciosService.getServicioById(id, clubId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear una nueva clínica deportiva o programa especializado' })
  async createServicio(@CurrentUser() user: any, @Body() dto: CreateServicioDto) {
    const clubId = user.clubId || 'c1000000-0000-0000-0000-000000000001';
    return this.serviciosService.createServicio(clubId, dto);
  }

  @Post(':id/inscribir')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Inscribir a un jugador o usuario externo y generar ticket digital' })
  async inscribirServicio(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: InscribirServicioDto,
  ) {
    const clubId = user.clubId || 'c1000000-0000-0000-0000-000000000001';
    return this.serviciosService.inscribirServicio(clubId, id, dto);
  }

  @Get(':id/inscripciones')
  @ApiOperation({ summary: 'Listar participantes inscritos en una clínica especializada' })
  async getInscripciones(@Param('id') id: string, @CurrentUser() user: any) {
    const clubId = user.clubId || 'c1000000-0000-0000-0000-000000000001';
    return this.serviciosService.getInscripciones(id, clubId);
  }
}

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ClubesService } from './clubes.service';
import { CreateClubDto, UpdateClubDto, OnboardingClubDto } from './clubes.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Clubes & Escuelas Deportivas')
@Controller('clubes')
export class ClubesController {
  constructor(private readonly clubesService: ClubesService) {}

  /**
   * CREAR ESCUELA O CLUB DEPORTIVO (EXCLUSIVO SUPER ADMINISTRADOR)
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post('onboarding')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar una nueva escuela deportiva (Exclusivo Super Administrador)',
    description: 'Crea el club multi-tenant, el usuario Director Deportivo inicial y su membresía en la base de datos.',
  })
  @ApiResponse({ status: 201, description: 'Academia registrada exitosamente por el Super Administrador' })
  @ApiResponse({ status: 403, description: 'Acceso denegado: solo el Super Administrador puede crear escuelas' })
  @ApiResponse({ status: 409, description: 'El correo del administrador ya está en uso' })
  async onboarding(@Body() dto: OnboardingClubDto) {
    return this.clubesService.onboarding(dto);
  }

  /**
   * LISTADO PÚBLICO DE CLUBES (Para selector de academias en Login)
   */
  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar todas las escuelas y clubes disponibles' })
  async getAll(@Query('onlyActive') onlyActive?: string) {
    const activeFilter = onlyActive !== 'false';
    return this.clubesService.findAll(activeFilter);
  }

  /**
   * PERFIL DEL CLUB AUTENTICADO
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('perfil')
  @ApiOperation({ summary: 'Obtener datos del club del usuario autenticado' })
  async getMiClub(@CurrentUser() user: any) {
    return this.clubesService.findClubById(user.clubId);
  }

  /**
   * SEDES Y CANCHAS DEL CLUB AUTENTICADO
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('sedes')
  @ApiOperation({ summary: 'Listar todas las sedes y canchas del club del usuario autenticado' })
  async getSedes(@CurrentUser() user: any) {
    return this.clubesService.findSedesByClub(user.clubId);
  }

  /**
   * DETALLE DE UN CLUB POR ID
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalles de un club específico por ID' })
  async getById(@Param('id') id: string) {
    return this.clubesService.findClubById(id);
  }

  /**
   * LISTAR STAFF DE UN CLUB
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/staff')
  @ApiOperation({ summary: 'Listar entrenadores, directores y personal del club' })
  async getStaff(@Param('id') id: string) {
    return this.clubesService.getStaff(id);
  }

  /**
   * CREAR CLUB (ADMINISTRATIVO)
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Crear un nuevo club (Exclusivo SuperAdmin)' })
  async create(@Body() dto: CreateClubDto) {
    return this.clubesService.create(dto);
  }

  /**
   * ACTUALIZAR CLUB
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar datos de un club (Exclusivo SuperAdmin)' })
  async update(@Param('id') id: string, @Body() dto: UpdateClubDto) {
    return this.clubesService.update(id, dto);
  }

  /**
   * DESACTIVAR CLUB
   */
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar un club (Exclusivo SuperAdmin)' })
  async delete(@Param('id') id: string) {
    return this.clubesService.delete(id);
  }
}

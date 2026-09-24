import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { LandingsService } from './landings.service';
import { CreateLandingDto, UpdateLandingDto, CreateLeadDto } from './landings.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Creador de Landing Pages & Contenidos')
@Controller('landings')
export class LandingsController {
  constructor(private readonly landingsService: LandingsService) {}

  @Public()
  @Get('public/:slug')
  @ApiOperation({ summary: 'Obtener landing page pública por slug (visitantes/móvil)' })
  async getPublicLanding(@Param('slug') slug: string) {
    const landing = await this.landingsService.getPublicLandingBySlug(slug);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: landing,
    };
  }

  @Public()
  @Post('public/:slug/leads')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Registrar lead / formulario de pre-inscripción desde la landing' })
  async registerLead(
    @Param('slug') slug: string,
    @Body() dto: CreateLeadDto,
    @Req() req: any,
  ) {
    const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const lead = await this.landingsService.registerLead(slug, dto, ip);
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: '¡Solicitud registrada exitosamente! Nos contactaremos pronto.',
      data: lead,
    };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar landings y contenidos administrables' })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'estado', required: false })
  @ApiQuery({ name: 'clubId', required: false })
  async getLandings(
    @CurrentUser() user: any,
    @Query('tipo') tipo?: string,
    @Query('estado') estado?: string,
    @Query('clubId') queryClubId?: string,
  ) {
    const clubId = user?.clubId || user?.club_id || queryClubId || '10000000-0000-0000-0000-000000000001';
    const res = await this.landingsService.getLandings(clubId, tipo, estado);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: res.items,
      resumen: res.resumen,
    };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle completo de una landing para edición' })
  async getLandingById(@Param('id') id: string) {
    const landing = await this.landingsService.getLandingById(id);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: landing,
    };
  }

  @Public()
  @Get(':id/leads')
  @ApiOperation({ summary: 'Listar leads capturados por una landing' })
  async getLeads(@Param('id') id: string) {
    const leads = await this.landingsService.getLeadsByLanding(id);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: leads,
    };
  }

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nueva landing page o experiencia de contenido' })
  async createLanding(@CurrentUser() user: any, @Body() dto: CreateLandingDto) {
    const clubId = user?.clubId || user?.club_id || '10000000-0000-0000-0000-000000000001';
    const landing = await this.landingsService.createLanding(dto, clubId);
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Landing page creada exitosamente',
      data: landing,
    };
  }

  @Public()
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar contenido y bloques de una landing' })
  async updateLanding(@Param('id') id: string, @Body() dto: UpdateLandingDto) {
    const updated = await this.landingsService.updateLanding(id, dto);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Landing page actualizada correctamente',
      data: updated,
    };
  }

  @Public()
  @Patch(':id/toggle-estado')
  @ApiOperation({ summary: 'Publicar o pausar landing page (cambio de estado)' })
  async toggleEstado(@Param('id') id: string) {
    const toggled = await this.landingsService.toggleEstado(id);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: `Estado actualizado a ${toggled.estado}`,
      data: toggled,
    };
  }

  @Public()
  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicar una landing existente como plantilla' })
  async duplicate(@Param('id') id: string) {
    const duplicated = await this.landingsService.duplicateLanding(id);
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'Plantilla duplicada como borrador',
      data: duplicated,
    };
  }

  @Public()
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar landing page' })
  async deleteLanding(@Param('id') id: string) {
    const result = await this.landingsService.deleteLanding(id);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      message: result.message,
    };
  }
}

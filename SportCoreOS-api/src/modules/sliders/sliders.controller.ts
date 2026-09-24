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
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SlidersService } from './sliders.service';
import { CreateSliderDto, UpdateSliderDto, ReorderSlidersDto } from './sliders.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Sliders Promocionales & Marketing Onboarding')
@Controller('sliders')
export class SlidersController {
  constructor(private readonly slidersService: SlidersService) {}

  @Public()
  @Get('publicos')
  @ApiOperation({ summary: 'Obtener sliders promocionales activos para App Móvil / Web (Público / Landing)' })
  @ApiQuery({ name: 'plataforma', required: false, description: 'Filtrar por TODAS, MOBILE_APP o WEB_PORTAL' })
  @ApiQuery({ name: 'clubId', required: false, description: 'ID opcional del club' })
  async getPublicSliders(
    @Query('plataforma') plataforma = 'TODAS',
    @Query('clubId') clubId?: string,
  ) {
    return this.slidersService.getActiveSliders(plataforma, clubId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar todos los sliders promocionales del club / sistema (Gestión Admin)' })
  @ApiQuery({ name: 'plataforma', required: false, description: 'Filtrar por plataforma' })
  @ApiQuery({ name: 'soloActivos', required: false, description: 'Filtrar solo activos' })
  async getSliders(
    @CurrentUser() user: any,
    @Query('plataforma') plataforma?: string,
    @Query('soloActivos') soloActivos?: string,
  ) {
    const clubId = user?.clubId || null;
    return this.slidersService.getSliders(clubId, plataforma, soloActivos === 'true');
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un slider promocional por ID' })
  async getSliderById(@Param('id') id: string) {
    return this.slidersService.getSliderById(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo slider promocional' })
  async createSlider(@CurrentUser() user: any, @Body() dto: CreateSliderDto) {
    const clubId = user?.clubId || null;
    return this.slidersService.createSlider(clubId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('reorder')
  @ApiOperation({ summary: 'Reordenar la secuencia de sliders' })
  async reorderSliders(@Body() dto: ReorderSlidersDto) {
    return this.slidersService.reorderSliders(dto.ids);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar completamente un slider promocional' })
  async updateSlider(@Param('id') id: string, @Body() dto: UpdateSliderDto) {
    return this.slidersService.updateSlider(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar campos específicos de un slider promocional' })
  async patchSlider(@Param('id') id: string, @Body() dto: UpdateSliderDto) {
    return this.slidersService.updateSlider(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle-activo')
  @ApiOperation({ summary: 'Alternar estado activo / inactivo de un slider' })
  async toggleActivo(@Param('id') id: string) {
    return this.slidersService.toggleActivo(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un slider promocional' })
  async deleteSlider(@Param('id') id: string) {
    return this.slidersService.deleteSlider(id);
  }
}

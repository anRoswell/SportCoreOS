import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ParametrosService } from './parametros.service';
import { CreateParametroDto, UpdateParametroDto } from './parametros.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Parámetros del Sistema')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('parametros')
export class ParametrosController {
  constructor(private readonly parametrosService: ParametrosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los parámetros del sistema y del club' })
  @ApiQuery({ name: 'modulo', required: false, example: 'FINANZAS' })
  getAll(@CurrentUser() user: any, @Query('modulo') modulo?: string) {
    if (modulo) {
      return this.parametrosService.getByModulo(modulo, user.clubId);
    }
    return this.parametrosService.getAll(user.clubId);
  }

  @Get('modulo/:modulo')
  @ApiOperation({ summary: 'Listar parámetros filtrados por módulo funcional' })
  getByModulo(@Param('modulo') modulo: string, @CurrentUser() user: any) {
    return this.parametrosService.getByModulo(modulo, user.clubId);
  }

  @Get('clave/:clave')
  @ApiOperation({ summary: 'Obtener el valor y configuración de un parámetro por clave única' })
  getByClave(@Param('clave') clave: string, @CurrentUser() user: any) {
    return this.parametrosService.getByClave(clave, user.clubId);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo parámetro' })
  create(@Body() dto: CreateParametroDto, @CurrentUser() user: any) {
    if (!dto.clubId && user.clubId) {
      dto.clubId = user.clubId;
    }
    return this.parametrosService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar el valor o título de un parámetro' })
  update(@Param('id') id: string, @Body() dto: UpdateParametroDto) {
    return this.parametrosService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un parámetro personalizado' })
  delete(@Param('id') id: string) {
    return this.parametrosService.delete(id);
  }
}

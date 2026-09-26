import { Body, Controller, ForbiddenException, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ImportarPartidoLigaCsvDto, RegistrarPartidoLigaDto } from './liga-estadisticas.dto';
import { LigaEstadisticasService } from './liga-estadisticas.service';

@ApiTags('Rendimiento - Estadísticas de Liga')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DIRECTOR_DEPORTIVO', 'ENTRENADOR_DT', 'SUPER_ADMIN')
@Controller('rendimiento/liga')
export class LigaEstadisticasController {
  constructor(private readonly service: LigaEstadisticasService) {}

  @Get()
  @ApiOperation({ summary: 'Consultar estadísticas verificadas de competiciones externas de la escuela' })
  listar(
    @CurrentUser() user: any,
    @Query('categoriaId') categoriaId?: string,
    @Query('temporada') temporada?: string,
  ) {
    return this.service.listar(this.clubId(user), categoriaId, temporada);
  }

  @Post('partidos/manual')
  @ApiOperation({ summary: 'Registrar manualmente un acta externa pendiente de validación' })
  registrarManual(@CurrentUser() user: any, @Body() dto: RegistrarPartidoLigaDto) {
    return this.service.registrarManual(this.clubId(user), user.id, dto);
  }

  @Post('partidos/csv')
  @ApiOperation({ summary: 'Importar estadísticas de un partido externo desde CSV y dejar el acta pendiente de validación' })
  importarCsv(@CurrentUser() user: any, @Body() dto: ImportarPartidoLigaCsvDto) {
    return this.service.importarCsv(this.clubId(user), user.id, dto);
  }

  @Post('partidos/:partidoId/validar')
  @ApiOperation({ summary: 'Validar el acta y acreditar XP a los jugadores registrados' })
  validar(@CurrentUser() user: any, @Param('partidoId') partidoId: string) {
    return this.service.validar(this.clubId(user), user.id, partidoId);
  }

  private clubId(user: any): string {
    if (!user?.clubId) throw new ForbiddenException('El usuario autenticado no tiene una escuela activa.');
    return user.clubId;
  }
}

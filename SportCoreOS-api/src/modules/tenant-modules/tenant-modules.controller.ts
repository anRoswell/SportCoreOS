import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantModulesService } from './tenant-modules.service';
import { UpsertTenantModuleAccessDto, BulkUpdateTenantModulesDto } from './tenant-modules.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Licenciamiento & Módulos por Escuela')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenant-modules')
export class TenantModulesController {
  constructor(private readonly tenantModulesService: TenantModulesService) {}

  @Get('catalog')
  @ApiOperation({ summary: 'Consultar catálogo global de módulos de SportCoreOS' })
  getCatalog() {
    return this.tenantModulesService.getCatalog();
  }

  @Get('clubes')
  @ApiOperation({ summary: 'Listar clubes y estado de módulos configurados' })
  getClubs() {
    return this.tenantModulesService.getClubsList();
  }

  @Get('me')
  @ApiOperation({ summary: 'Consultar módulos habilitados para el club del usuario autenticado' })
  getMyClubModules(@CurrentUser() user: any) {
    return this.tenantModulesService.getClubModules(user.clubId);
  }

  @Get(':clubId')
  @ApiOperation({ summary: 'Consultar módulos y licencias de una escuela/club específico' })
  getClubModules(@Param('clubId') clubId: string) {
    return this.tenantModulesService.getClubModules(clubId);
  }

  @Put(':clubId/bulk')
  @ApiOperation({ summary: 'Actualización en masa de módulos habilitados para una escuela' })
  bulkUpdateClubModules(
    @Param('clubId') clubId: string,
    @Body() dto: BulkUpdateTenantModulesDto,
    @CurrentUser() user: any,
  ) {
    return this.tenantModulesService.bulkUpdateClubModules(clubId, dto, user.id);
  }

  @Put(':clubId/:moduleCode')
  @ApiOperation({ summary: 'Activar/desactivar o configurar vigencia de un módulo para un club' })
  upsertClubModule(
    @Param('clubId') clubId: string,
    @Param('moduleCode') moduleCode: string,
    @Body() dto: UpsertTenantModuleAccessDto,
    @CurrentUser() user: any,
  ) {
    return this.tenantModulesService.upsertClubModule(clubId, moduleCode, dto, user.id);
  }
}

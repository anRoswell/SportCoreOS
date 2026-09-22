import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { BulkUpdateRolePermissionsDto, UpdateSinglePermissionDto, AssignUserRoleDto } from './roles.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Roles, Perfiles & Permisos (RBAC)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get('catalogo')
  @ApiOperation({ summary: 'Listar catálogo de roles y descripciones de SportCoreOS' })
  getRolesCatalog() {
    return this.rolesService.getAvailableRoles();
  }

  @Get('permisos-template')
  @ApiOperation({ summary: 'Consultar la plantilla base predeterminada de permisos' })
  getTemplate() {
    return this.rolesService.getPermissionTemplate();
  }

  @Get('permisos')
  @ApiOperation({ summary: 'Consultar matriz completa de permisos del club' })
  @ApiQuery({ name: 'rol', required: false, example: 'ENTRENADOR_DT' })
  getPermissionsMatrix(
    @CurrentUser() user: any,
    @Query('rol') rol?: string,
  ) {
    return this.rolesService.getPermissionsMatrix(user.clubId, rol);
  }

  @Put('permisos')
  @ApiOperation({ summary: 'Guardar permisos por lote para un rol específico' })
  updateRolePermissions(
    @CurrentUser() user: any,
    @Body() dto: BulkUpdateRolePermissionsDto,
  ) {
    return this.rolesService.updateRolePermissions(user.clubId, dto);
  }

  @Put(':rol/permiso')
  @ApiOperation({ summary: 'Actualizar un permiso específico de un rol' })
  updateSinglePermission(
    @Param('rol') rol: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateSinglePermissionDto,
  ) {
    return this.rolesService.updateSinglePermission(user.clubId, rol, dto);
  }

  @Post('permisos/reset')
  @ApiOperation({ summary: 'Restablecer permisos a la plantilla predeterminada' })
  @ApiQuery({ name: 'rol', required: false })
  resetPermissions(
    @CurrentUser() user: any,
    @Query('rol') rol?: string,
  ) {
    return this.rolesService.resetRolePermissions(user.clubId, rol);
  }

  @Get('usuarios')
  @ApiOperation({ summary: 'Listar usuarios del club con sus roles asignados' })
  getUsersWithRoles(@CurrentUser() user: any) {
    return this.rolesService.getUsers(user.clubId);
  }

  @Post('asignar-usuario')
  @ApiOperation({ summary: 'Asignar o cambiar el rol de un usuario en el club' })
  assignUserRole(
    @CurrentUser() user: any,
    @Body() dto: AssignUserRoleDto,
  ) {
    return this.rolesService.assignUserRole(user.clubId, dto);
  }
}

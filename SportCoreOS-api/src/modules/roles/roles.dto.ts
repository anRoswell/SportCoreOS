import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateSinglePermissionDto {
  @ApiProperty({ description: 'Módulo', example: 'JUGADORES' })
  @IsString()
  @IsNotEmpty()
  modulo: string;

  @ApiProperty({ description: 'Acción permitida', example: 'CREAR_JUGADOR' })
  @IsString()
  @IsNotEmpty()
  accion: string;

  @ApiProperty({ description: 'Indica si tiene permiso de ejecución', example: true })
  @IsBoolean()
  permitido: boolean;

  @ApiPropertyOptional({ description: 'Nivel de acceso: ALL, RO (Read Only), OWN (Solo propios), NONE', example: 'ALL' })
  @IsOptional()
  @IsString()
  nivelAcceso?: string;
}

export class BulkUpdateRolePermissionsDto {
  @ApiProperty({ description: 'Rol objetivo', example: 'ENTRENADOR_DT' })
  @IsString()
  @IsNotEmpty()
  rol: string;

  @ApiProperty({ description: 'Lista de permisos asignados', type: [UpdateSinglePermissionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateSinglePermissionDto)
  permisos: UpdateSinglePermissionDto[];
}

export class AssignUserRoleDto {
  @ApiProperty({ description: 'ID del usuario', example: '00000000-0000-0000-0000-000000000003' })
  @IsString()
  @IsNotEmpty()
  usuarioId: string;

  @ApiProperty({ description: 'Nuevo rol en el club', example: 'ENTRENADOR_DT' })
  @IsString()
  @IsNotEmpty()
  rol: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Carlos' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ example: 'Valderrama' })
  @IsOptional()
  @IsString()
  apellido?: string;

  @ApiPropertyOptional({ example: 'carlos.valderrama@sportcore.com' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ example: '+57 310 123 4567' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiPropertyOptional({ example: 'ENTRENADOR_DT' })
  @IsOptional()
  @IsString()
  rol?: string;

  @ApiPropertyOptional({ example: 'SportCore@2026' })
  @IsOptional()
  @IsString()
  password?: string;
}


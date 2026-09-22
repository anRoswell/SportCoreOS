import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpsertTenantModuleAccessDto {
  @ApiProperty({ description: 'Indica si el módulo está habilitado para el club', example: true })
  @IsBoolean()
  habilitado: boolean;

  @ApiPropertyOptional({ description: 'Fecha de inicio de vigencia', example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string | null;

  @ApiPropertyOptional({ description: 'Fecha de finalización de vigencia', example: '2026-12-31' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string | null;

  @ApiPropertyOptional({ description: 'Indica si la licencia es indefinida/permanente', example: true })
  @IsOptional()
  @IsBoolean()
  esIndefinido?: boolean;
}

export class BulkUpdateTenantModulesDto {
  @ApiProperty({
    description: 'Lista de códigos de módulos a habilitar',
    example: ['JUGADORES', 'CATEGORIAS', 'PARTIDOS', 'FINANZAS', 'BIOMETRIA'],
  })
  @IsNotEmpty()
  modulosHabilitados: string[];
}

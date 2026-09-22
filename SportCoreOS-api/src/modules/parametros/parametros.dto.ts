import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum TipoValorParametro {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
}

export class CreateParametroDto {
  @ApiProperty({ description: 'Módulo funcional al que pertenece el parámetro', example: 'FINANZAS' })
  @IsString()
  @IsNotEmpty()
  modulo: string;

  @ApiProperty({ description: 'Clave única del parámetro', example: 'DIAS_TOLERANCIA_MORA' })
  @IsString()
  @IsNotEmpty()
  clave: string;

  @ApiProperty({ description: 'Valor del parámetro', example: '5' })
  @IsNotEmpty()
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value) : value))
  @IsString()
  valor: string;

  @ApiProperty({ enum: TipoValorParametro, default: TipoValorParametro.STRING })
  @IsEnum(TipoValorParametro)
  @IsOptional()
  tipoValor?: TipoValorParametro;

  @ApiProperty({ description: 'Título legible del parámetro', example: 'Días de Gracia / Tolerancia Mora' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiPropertyOptional({ description: 'Descripción explicativa del uso del parámetro' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'ID del club si es parámetro específico por escuela (NULL si es global)' })
  @IsString()
  @IsOptional()
  clubId?: string | null;

  @ApiPropertyOptional({ description: 'Estado activo o inactivo', default: true })
  @IsBoolean()
  @IsOptional()
  estado?: boolean;

  @ApiPropertyOptional({ description: 'Indica si puede ser modificado por usuarios administradores', default: true })
  @IsBoolean()
  @IsOptional()
  esEditable?: boolean;
}

export class UpdateParametroDto {
  @ApiProperty({ description: 'Nuevo valor del parámetro', example: '10' })
  @IsNotEmpty()
  @Transform(({ value }) => (value !== undefined && value !== null ? String(value) : value))
  @IsString()
  valor: string;

  @ApiPropertyOptional({ description: 'Título legible' })
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiPropertyOptional({ description: 'Descripción detallada' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Estado activo/inactivo' })
  @IsBoolean()
  @IsOptional()
  estado?: boolean;
}

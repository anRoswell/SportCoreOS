import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Sub-16 Formativa 2010' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ example: 'SUB_16' })
  @IsString()
  @IsNotEmpty()
  codigo_categoria: string;

  @ApiProperty({ example: 2010 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  anio_nacimiento_min: number;

  @ApiProperty({ example: 2010 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  anio_nacimiento_max: number;

  @ApiPropertyOptional({ example: 'MASCULINO', enum: ['MASCULINO', 'FEMENINO', 'MIXTO'] })
  @IsOptional()
  @IsString()
  rama?: string;

  @ApiPropertyOptional({ example: 'FORMATIVO', enum: ['FORMATIVO', 'COMPETITIVO', 'ELITE'] })
  @IsOptional()
  @IsString()
  nivel_competencia?: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsString()
  color_distintivo?: string;

  @ApiPropertyOptional({ example: 25 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cupo_maximo?: number;

  @ApiPropertyOptional({ example: 'uuid-dt' })
  @IsOptional()
  @IsString()
  director_tecnico_id?: string;
}

export class UpdateCategoriaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  codigo_categoria?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  anio_nacimiento_min?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  anio_nacimiento_max?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rama?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nivel_competencia?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  color_distintivo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  cupo_maximo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  director_tecnico_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

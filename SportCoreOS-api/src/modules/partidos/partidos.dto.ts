import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePartidoDto {
  @ApiProperty({ example: 'uuid-categoria' })
  @IsString()
  @IsNotEmpty()
  categoria_id: string;

  @ApiProperty({ example: 'Santa Fe D.C. Academia' })
  @IsString()
  @IsNotEmpty()
  rival_nombre: string;

  @ApiProperty({ example: '2026-09-26' })
  @IsString()
  @IsNotEmpty()
  fecha_partido: string;

  @ApiProperty({ example: '09:00:00' })
  @IsString()
  @IsNotEmpty()
  hora_partido: string;

  @ApiPropertyOptional({ example: '08:00:00' })
  @IsOptional()
  @IsString()
  hora_citacion?: string;

  @ApiProperty({ example: 'Sede Campestre Arrayanes - Cancha 1' })
  @IsString()
  @IsNotEmpty()
  sede_cancha: string;

  @ApiPropertyOptional({ example: 'LOCAL', enum: ['LOCAL', 'VISITANTE'] })
  @IsOptional()
  @IsString()
  condicion_juego?: string;

  @ApiPropertyOptional({ example: 'Kit Titular Verde Esmeralda' })
  @IsOptional()
  @IsString()
  indumentaria_kit?: string;

  @ApiPropertyOptional({ example: 4.7892 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitud?: number;

  @ApiPropertyOptional({ example: -74.0412 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitud?: number;
}

export class UpdatePartidoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rival_nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fecha_partido?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hora_partido?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hora_citacion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sede_cancha?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  condicion_juego?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  indumentaria_kit?: string;

  @ApiPropertyOptional({ enum: ['PROGRAMADO', 'EN_JUEGO', 'FINALIZADO', 'APLAZADO', 'CANCELADO'] })
  @IsOptional()
  @IsString()
  estado_partido?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  goles_club?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  goles_rival?: number;
}

export class CreateEventoActaDto {
  @ApiPropertyOptional({ example: 'uuid-jugador' })
  @IsOptional()
  @IsString()
  jugador_id?: string;

  @ApiProperty({ example: 25 })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  minuto_juego: number;

  @ApiProperty({ example: 'GOL', enum: ['GOL', 'TARJETA_AMARILLA', 'TARJETA_ROJA', 'CAMBIO_ENTRA', 'CAMBIO_SALE', 'ASISTENCIA'] })
  @IsString()
  @IsNotEmpty()
  tipo_evento: string;

  @ApiPropertyOptional({ example: 'Remate de media distancia' })
  @IsOptional()
  @IsString()
  observacion?: string;

  @ApiPropertyOptional({ example: 'Remate de media distancia' })
  @IsOptional()
  @IsString()
  descripcion?: string;
}

import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, IsUUID, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSesionGpsDto {
  @ApiProperty({ description: 'Fecha de la sesión o partido (YYYY-MM-DD)', example: '2026-03-21' })
  @IsDateString()
  @IsNotEmpty()
  fecha_sesion: string;

  @ApiPropertyOptional({ description: 'ID del partido asociado', example: '5d61a1ec-aa7c-457c-8d79-6433475217bc' })
  @IsUUID()
  @IsOptional()
  partido_id?: string;

  @ApiPropertyOptional({ description: 'Tipo de sesión (PARTIDO_OFICIAL, ENTRENAMIENTO_TACTICO, FISICO_INTENSIVO)', example: 'PARTIDO_OFICIAL' })
  @IsString()
  @IsOptional()
  tipo_sesion?: string;

  @ApiPropertyOptional({ description: 'Marca o formato del sensor (CATAPULT_10HZ, POLAR_TEAM_PRO, VMAXPRO, GPX_RAW)', example: 'CATAPULT_10HZ' })
  @IsString()
  @IsOptional()
  dispositivo_marca?: string;

  @ApiPropertyOptional({ description: 'Duración en minutos de la sesión', example: 90 })
  @IsNumber()
  @IsOptional()
  duracion_minutos?: number;

  @ApiPropertyOptional({ description: 'Clima o temperatura ambiental', example: '22°C Soleado' })
  @IsString()
  @IsOptional()
  clima_temperatura?: string;
}

export class CreateMetricaGpsDto {
  @ApiProperty({ description: 'ID del jugador monitoreado', example: 'e1e0691e-691e-4c92-9046-871955524534' })
  @IsUUID()
  @IsNotEmpty()
  jugador_id: string;

  @ApiProperty({ description: 'Distancia total recorrida en metros', example: 9850.5 })
  @IsNumber()
  @Min(0)
  distancia_total_m: number;

  @ApiProperty({ description: 'Velocidad máxima alcanzada en km/h', example: 31.8 })
  @IsNumber()
  @Min(0)
  velocidad_max_kmh: number;

  @ApiPropertyOptional({ description: 'Distancia a alta intensidad sprint (> 21 km/h) en metros', example: 680.0 })
  @IsNumber()
  @IsOptional()
  distancia_sprint_m?: number;

  @ApiPropertyOptional({ description: 'Cantidad total de sprints ejecutados', example: 24 })
  @IsNumber()
  @IsOptional()
  sprints_conteo?: number;

  @ApiPropertyOptional({ description: 'Conteo de aceleraciones intensas (> 3 m/s²)', example: 18 })
  @IsNumber()
  @IsOptional()
  aceleraciones_intensas?: number;

  @ApiPropertyOptional({ description: 'Conteo de desaceleraciones intensas (< -3 m/s²)', example: 14 })
  @IsNumber()
  @IsOptional()
  desaceleraciones_intensas?: number;

  @ApiPropertyOptional({ description: 'PlayerLoad triaxial acumulado (AU)', example: 580.4 })
  @IsNumber()
  @IsOptional()
  player_load_au?: number;

  @ApiPropertyOptional({ description: 'Frecuencia cardíaca promedio (bpm)', example: 168 })
  @IsNumber()
  @IsOptional()
  frecuencia_cardiaca_prom?: number;

  @ApiPropertyOptional({ description: 'Frecuencia cardíaca máxima (bpm)', example: 194 })
  @IsNumber()
  @IsOptional()
  frecuencia_cardiaca_max?: number;

  @ApiPropertyOptional({ description: 'Vectores de calor X/Y para renderizado 2D', example: [{ x: 25, y: 60, intensity: 0.8 }] })
  @IsArray()
  @IsOptional()
  coordenadas_heatmap_json?: any[];
}

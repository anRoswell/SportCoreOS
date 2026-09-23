import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServicioDto {
  @ApiProperty({ example: 'Explosividad & Sprint Pura para Niños' })
  @IsString()
  @IsNotEmpty()
  titulo: string;

  @ApiProperty({ example: 'Desarrollo de aceleración, reacción isométrica y primer paso' })
  @IsString()
  @IsNotEmpty()
  subtitulo: string;

  @ApiProperty({ example: 'VELOCIDAD_EXPLOSIVIDAD' })
  @IsString()
  @IsNotEmpty()
  categoria_servicio: string;

  @ApiPropertyOptional({ example: 'fa-bolt' })
  @IsString()
  @IsOptional()
  icono?: string;

  @ApiPropertyOptional({ example: '#10b981' })
  @IsString()
  @IsOptional()
  color_tema?: string;

  @ApiProperty({ example: 'Prof. Carlos Valderrama' })
  @IsString()
  @IsNotEmpty()
  entrenador_nombre: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  entrenador_avatar?: string;

  @ApiPropertyOptional({ example: 'Preparador Físico FIFA Pro' })
  @IsString()
  @IsOptional()
  entrenador_badge?: string;

  @ApiProperty({ example: 'Cancha de Fútbol Alameda La Victoria' })
  @IsString()
  @IsNotEmpty()
  cancha_nombre: string;

  @ApiProperty({ example: 'Alameda La Victoria Manzana 12, Cartagena' })
  @IsString()
  @IsNotEmpty()
  cancha_direccion: string;

  @ApiPropertyOptional({ example: 'https://maps.google.com/?q=10.389510,-75.488210' })
  @IsString()
  @IsOptional()
  cancha_gps_url?: string;

  @ApiProperty({ example: 'Martes y Jueves' })
  @IsString()
  @IsNotEmpty()
  dias_semana: string;

  @ApiProperty({ example: '04:30 PM - 06:00 PM' })
  @IsString()
  @IsNotEmpty()
  horario_rango: string;

  @ApiPropertyOptional({ example: 90 })
  @IsNumber()
  @IsOptional()
  duracion_minutos?: number;

  @ApiPropertyOptional({ example: 7 })
  @IsNumber()
  @IsOptional()
  edad_min?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsNumber()
  @IsOptional()
  edad_max?: number;

  @ApiPropertyOptional({ example: 15 })
  @IsNumber()
  @IsOptional()
  cupos_totales?: number;

  @ApiProperty({ example: 38000 })
  @IsNumber()
  precio_sesion_individual: number;

  @ApiProperty({ example: 145000 })
  @IsNumber()
  precio_paquete_mensual: number;

  @ApiPropertyOptional({ example: 15 })
  @IsNumber()
  @IsOptional()
  descuento_hermanos_pct?: number;

  @ApiProperty({ example: '⚡ Rayo de Aceleración Sub-12' })
  @IsString()
  @IsNotEmpty()
  insignia_obtenida: string;

  @ApiProperty({ example: 'Programa intensivo de bio-mecánica de carrera con fotocélulas láser...' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiPropertyOptional({ example: ['Medición con fotocélulas', 'Corrección de zancada'] })
  @IsArray()
  @IsOptional()
  beneficios?: string[];
}

export class InscribirServicioDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  jugador_id?: string;

  @ApiProperty({ example: 'Mateo Valderrama' })
  @IsString()
  @IsNotEmpty()
  nombre_jugador: string;

  @ApiProperty({ example: 'Carlos Valderrama Padre' })
  @IsString()
  @IsNotEmpty()
  nombre_acudiente: string;

  @ApiProperty({ example: '+573001234567' })
  @IsString()
  @IsNotEmpty()
  telefono_acudiente: string;

  @ApiPropertyOptional({ example: 'carlos.valderrama@gmail.com' })
  @IsString()
  @IsOptional()
  email_acudiente?: string;

  @ApiProperty({ example: 'PAQUETE_MENSUAL' })
  @IsString()
  @IsNotEmpty()
  tipo_plan: string; // SESION_INDIVIDUAL, PAQUETE_MENSUAL, BOOTCAMP_INTENSIVO

  @ApiProperty({ example: 145000 })
  @IsNumber()
  monto_pagado: number;

  @ApiProperty({ example: 'WOMPI_PSE' })
  @IsString()
  @IsNotEmpty()
  metodo_pago: string; // WOMPI_PSE, NEQUI, DAVIPLATA, TARJETA_CREDITO
}

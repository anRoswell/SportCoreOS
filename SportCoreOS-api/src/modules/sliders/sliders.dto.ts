import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
} from 'class-validator';

export class HighlightItemDto {
  @ApiProperty({ description: 'Icono o Emoji del beneficio', example: '⚡' })
  @IsString()
  @IsNotEmpty()
  icon!: string;

  @ApiProperty({ description: 'Texto principal del beneficio', example: 'Dashboard con KPIs en Vivo' })
  @IsString()
  @IsNotEmpty()
  text!: string;

  @ApiPropertyOptional({ description: 'Subtexto explicativo', example: 'Métricas deportivas y operativas' })
  @IsString()
  @IsOptional()
  subtext?: string;
}

export class CreateSliderDto {
  @ApiProperty({ description: 'Título principal de la diapositiva', example: 'Gestión Integral de Clubes' })
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @ApiProperty({ description: 'Subtítulo o descripción corta', example: 'Conecta directores técnicos, atletas y directivos con métricas en tiempo real.' })
  @IsString()
  @IsNotEmpty()
  subtitulo!: string;

  @ApiPropertyOptional({ description: 'Etiqueta o Tag de categoría', default: 'Ecosistema Cloud 360°' })
  @IsString()
  @IsOptional()
  tag?: string;

  @ApiPropertyOptional({ description: 'Icono emoji para la etiqueta', default: '🏆' })
  @IsString()
  @IsOptional()
  tag_icono?: string;

  @ApiPropertyOptional({ description: 'Color distintivo HEX', default: '#10b981' })
  @IsString()
  @IsOptional()
  badge_color?: string;

  @ApiPropertyOptional({ description: 'Gradiente CSS de acento', default: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' })
  @IsString()
  @IsOptional()
  accent_gradient?: string;

  @ApiPropertyOptional({ description: 'Icono FontAwesome central', default: 'fa-solid fa-chart-line' })
  @IsString()
  @IsOptional()
  icono?: string;

  @ApiPropertyOptional({ description: 'Cifra destacada', default: '100% Cloud' })
  @IsString()
  @IsOptional()
  stat_numero?: string;

  @ApiPropertyOptional({ description: 'Etiqueta de la métrica', default: 'Sincronización en vivo' })
  @IsString()
  @IsOptional()
  stat_label?: string;

  @ApiPropertyOptional({ description: 'Título de previsualización en tarjeta', default: 'Panel Directivo & Metas' })
  @IsString()
  @IsOptional()
  card_preview_titulo?: string;

  @ApiPropertyOptional({ description: 'Descripción de previsualización en tarjeta', default: 'Visión consolidada de canteras y alertas del club.' })
  @IsString()
  @IsOptional()
  card_preview_desc?: string;

  @ApiPropertyOptional({ description: 'Lista de características destacadas (Highlights)', type: [HighlightItemDto] })
  @IsArray()
  @IsOptional()
  highlights?: HighlightItemDto[];

  @ApiPropertyOptional({ description: 'Texto del botón CTA', default: 'Siguiente' })
  @IsString()
  @IsOptional()
  boton_cta_texto?: string;

  @ApiPropertyOptional({ description: 'Enlace o ruta de destino del botón CTA', default: '/auth/login' })
  @IsString()
  @IsOptional()
  boton_cta_url?: string;

  @ApiPropertyOptional({ description: 'URL de imagen de fondo o portada opcional' })
  @IsString()
  @IsOptional()
  imagen_url?: string;

  @ApiPropertyOptional({ description: 'Orden secuencial de aparición', default: 1 })
  @IsNumber()
  @IsOptional()
  orden?: number;

  @ApiPropertyOptional({ description: 'Estado activo o inactivo', default: true })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @ApiPropertyOptional({ description: 'Plataforma destino', enum: ['TODAS', 'MOBILE_APP', 'WEB_PORTAL'], default: 'TODAS' })
  @IsEnum(['TODAS', 'MOBILE_APP', 'WEB_PORTAL'])
  @IsOptional()
  plataforma_destino?: 'TODAS' | 'MOBILE_APP' | 'WEB_PORTAL';

  @ApiPropertyOptional({ description: 'Fecha de inicio de publicación (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  fecha_inicio?: string;

  @ApiPropertyOptional({ description: 'Fecha de fin de publicación (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  fecha_fin?: string;
}

export class UpdateSliderDto extends CreateSliderDto {}

export class ReorderSlidersDto {
  @ApiProperty({ description: 'Lista de IDs en el nuevo orden secuencial', example: ['uuid-1', 'uuid-2'] })
  @IsArray()
  @IsString({ each: true })
  ids!: string[];
}

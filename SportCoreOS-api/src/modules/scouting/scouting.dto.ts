import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoScouting, RecomendacionScouting } from '../../common/enums/domain.enums';

export class CreateProspectoDto {
  @ApiProperty({ description: 'Nombres y apellidos del prospecto', example: 'Mateo Henao Quintana' })
  @IsString()
  @IsNotEmpty()
  nombres_apellidos: string;

  @ApiProperty({ description: 'Fecha de nacimiento (YYYY-MM-DD)', example: '2010-04-18' })
  @IsDateString()
  @IsNotEmpty()
  fecha_nacimiento: string;

  @ApiProperty({ description: 'Posición principal en campo', example: 'extremo_derecho' })
  @IsString()
  @IsNotEmpty()
  posicion_principal: string;

  @ApiPropertyOptional({ description: 'Posición secundaria', example: 'delantero_centro' })
  @IsString()
  @IsOptional()
  posicion_secundaria?: string;

  @ApiPropertyOptional({ description: 'Pie hábil (derecho, izquierdo, ambidiestro)', example: 'izquierdo' })
  @IsString()
  @IsOptional()
  pie_habil?: string;

  @ApiPropertyOptional({ description: 'Club o escuela de origen actual', example: 'Club Deportivo Semillero Paisa' })
  @IsString()
  @IsOptional()
  club_origen?: string;

  @ApiPropertyOptional({ description: 'Teléfono de contacto de los padres/agente', example: '+57 301 444 5555' })
  @IsString()
  @IsOptional()
  telefono_contacto?: string;

  @ApiPropertyOptional({ description: 'Correo electrónico de contacto', example: 'familia.henao@email.com' })
  @IsString()
  @IsOptional()
  email_contacto?: string;

  @ApiPropertyOptional({ description: 'Ciudad de residencia', example: 'Medellín' })
  @IsString()
  @IsOptional()
  ciudad?: string;

  @ApiPropertyOptional({ description: 'Estatura en centímetros', example: 168.0 })
  @IsNumber()
  @IsOptional()
  altura_cm?: number;

  @ApiPropertyOptional({ description: 'Peso en kilogramos', example: 58.5 })
  @IsNumber()
  @IsOptional()
  peso_kg?: number;

  @ApiPropertyOptional({ description: 'URL de clip de video o highlight', example: 'https://youtube.com/watch?v=xyz' })
  @IsString()
  @IsOptional()
  video_highlight_url?: string;

  @ApiPropertyOptional({ description: 'Estado en el pipeline de captación', example: EstadoScouting.EN_OBSERVACION, enum: EstadoScouting })
  @IsOptional()
  @IsEnum(EstadoScouting)
  estado_scouting?: EstadoScouting;

  @ApiPropertyOptional({ description: 'Notas iniciales del ojeador', example: 'Gran técnica individual y velocidad de desborde.' })
  @IsString()
  @IsOptional()
  notas_scout?: string;
}

export class UpdateProspectoDto {
  @ApiPropertyOptional({ description: 'Nombres y apellidos' })
  @IsString()
  @IsOptional()
  nombres_apellidos?: string;

  @ApiPropertyOptional({ description: 'Posición principal' })
  @IsString()
  @IsOptional()
  posicion_principal?: string;

  @ApiPropertyOptional({ description: 'Club de origen' })
  @IsString()
  @IsOptional()
  club_origen?: string;

  @ApiPropertyOptional({ description: 'Estado en el pipeline', enum: EstadoScouting })
  @IsOptional()
  @IsEnum(EstadoScouting)
  estado_scouting?: EstadoScouting;

  @ApiPropertyOptional({ description: 'Valoración general estimada (1.0 a 10.0)' })
  @IsNumber()
  @IsOptional()
  valoracion_general?: number;

  @ApiPropertyOptional({ description: 'Notas y observaciones adicionales' })
  @IsString()
  @IsOptional()
  notas_scout?: string;
}

export class CreateEvaluacionDto {
  @ApiPropertyOptional({ description: 'Fecha del partido u observación', example: '2026-03-21' })
  @IsDateString()
  @IsOptional()
  fecha_observacion?: string;

  @ApiPropertyOptional({ description: 'Nombre del torneo o partido de observación', example: 'Torneo Departamental Sub-15' })
  @IsString()
  @IsOptional()
  partido_evento?: string;

  @ApiProperty({ description: 'Calificación Técnica (1.0 a 10.0)', example: 9.0 })
  @IsNumber()
  @Min(1.0)
  @Max(10.0)
  score_tecnico: number;

  @ApiProperty({ description: 'Calificación Táctica (1.0 a 10.0)', example: 8.5 })
  @IsNumber()
  @Min(1.0)
  @Max(10.0)
  score_tactico: number;

  @ApiProperty({ description: 'Calificación Física (1.0 a 10.0)', example: 8.8 })
  @IsNumber()
  @Min(1.0)
  @Max(10.0)
  score_fisico: number;

  @ApiProperty({ description: 'Calificación Mental / Actitudinal (1.0 a 10.0)', example: 9.0 })
  @IsNumber()
  @Min(1.0)
  @Max(10.0)
  score_mental: number;

  @ApiPropertyOptional({ description: 'Comentarios cualitativos detallados', example: 'Desequilibrio constante por banda izquierda y precisión en centros.' })
  @IsString()
  @IsOptional()
  comentarios_cualitativos?: string;

  @ApiProperty({ description: 'Recomendación del scout (FICHAR_YA, SEGUIMIENTO_CONTINUO, DESCARTAR)', example: RecomendacionScouting.FICHAR_YA, enum: RecomendacionScouting })
  @IsNotEmpty()
  @IsEnum(RecomendacionScouting)
  recomendacion: RecomendacionScouting;
}

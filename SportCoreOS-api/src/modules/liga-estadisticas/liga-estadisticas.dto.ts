import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

// PostgreSQL accepts the canonical UUID shape without enforcing RFC version/variant bits.
const POSTGRES_UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class LigaJugadorEstadisticaDto {
  @IsOptional()
  @Matches(POSTGRES_UUID_PATTERN)
  jugadorId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(99)
  dorsal?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(120)
  minutos = 0;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  goles = 0;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  asistencias = 0;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  remates = 0;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  rematesAPuerta = 0;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  pasesClave = 0;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  regatesExitosos = 0;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  recuperaciones = 0;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  intercepciones = 0;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  duelosGanados = 0;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  atajadas = 0;
}

export class RegistrarPartidoLigaDto {
  @Matches(POSTGRES_UUID_PATTERN)
  categoriaId!: string;

  @IsString()
  @IsNotEmpty()
  competenciaNombre!: string;

  @IsString()
  @IsNotEmpty()
  temporada!: string;

  @IsDateString()
  fechaPartido!: string;

  @IsString()
  @IsNotEmpty()
  rivalNombre!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(99)
  golesClub = 0;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(99)
  golesRival = 0;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LigaJugadorEstadisticaDto)
  jugadores!: LigaJugadorEstadisticaDto[];
}

export class ImportarPartidoLigaCsvDto {
  @Matches(POSTGRES_UUID_PATTERN)
  categoriaId!: string;

  @IsString()
  @IsNotEmpty()
  competenciaNombre!: string;

  @IsString()
  @IsNotEmpty()
  temporada!: string;

  @IsDateString()
  fechaPartido!: string;

  @IsString()
  @IsNotEmpty()
  rivalNombre!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(99)
  golesClub = 0;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(99)
  golesRival = 0;

  @IsString()
  @IsNotEmpty()
  csvContenido!: string;
}

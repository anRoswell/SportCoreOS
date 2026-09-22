import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsDateString,
  Min,
  Max,
  IsEmail,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoDocumento {
  TI = 'TI',
  CC = 'CC',
  RC = 'RC',
  CE = 'CE',
  PASAPORTE = 'PASAPORTE',
  PPT = 'PPT',
  NUIP = 'NUIP',
}

export enum PiernaHabil {
  DIESTRO = 'DIESTRO',
  ZURDO = 'ZURDO',
  AMBIDIESTRO = 'AMBIDIESTRO',
}

export enum Genero {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
}

export enum EstadoMatricula {
  ACTIVO = 'ACTIVO',
  SUSPENDIDO = 'SUSPENDIDO',
  LESIONADO = 'LESIONADO',
  RETIRADO = 'RETIRADO',
}

export class CreateJugadorDto {
  @ApiProperty({ example: '30000000-0000-0000-0000-000000000001', description: 'ID de la categoría a la que pertenece' })
  @IsString()
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  categoriaId: string;

  @ApiProperty({ example: 'Mateo' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del jugador es obligatorio' })
  nombres: string;

  @ApiProperty({ example: 'Gómez Restrepo' })
  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  apellidos: string;

  @ApiPropertyOptional({ enum: TipoDocumento, default: TipoDocumento.TI })
  @IsOptional()
  @IsEnum(TipoDocumento)
  tipoDocumento?: TipoDocumento;

  @ApiProperty({ example: '1023456781' })
  @IsString()
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  numeroDocumento: string;

  @ApiProperty({ example: '2011-04-15' })
  @IsDateString({}, { message: 'La fecha de nacimiento debe tener formato YYYY-MM-DD' })
  @IsNotEmpty()
  fechaNacimiento: string;

  @ApiPropertyOptional({ enum: Genero, default: Genero.MASCULINO })
  @IsOptional()
  @IsEnum(Genero)
  genero?: Genero;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=120' })
  @IsOptional()
  @IsString()
  fotoUrl?: string;

  @ApiProperty({ example: 'Extremo Derecho' })
  @IsString()
  @IsNotEmpty({ message: 'La posición principal es obligatoria' })
  posicionPrincipal: string;

  @ApiPropertyOptional({ example: 'Delantero Centro' })
  @IsOptional()
  @IsString()
  posicionSecundaria?: string;

  @ApiPropertyOptional({ enum: PiernaHabil, default: PiernaHabil.DIESTRO })
  @IsOptional()
  @IsEnum(PiernaHabil)
  piernaHabil?: PiernaHabil;

  @ApiPropertyOptional({ example: 7, minimum: 1, maximum: 99 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(99)
  numeroDorsal?: number;

  @ApiPropertyOptional({ example: 'SURA EPS' })
  @IsOptional()
  @IsString()
  eps?: string;

  @ApiPropertyOptional({ enum: EstadoMatricula, default: EstadoMatricula.ACTIVO })
  @IsOptional()
  @IsEnum(EstadoMatricula)
  estadoMatricula?: EstadoMatricula;

  @ApiPropertyOptional({ example: 0, description: 'Porcentaje de beca deportiva (0 a 100)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  porcentajeBeca?: number;

  // Datos opcionales del Acudiente / Familiar Principal
  @ApiPropertyOptional({ example: 'Luis Manuel' })
  @IsOptional()
  @IsString()
  acudienteNombres?: string;

  @ApiPropertyOptional({ example: 'Gómez' })
  @IsOptional()
  @IsString()
  acudienteApellidos?: string;

  @ApiPropertyOptional({ example: 'CC' })
  @IsOptional()
  @IsString()
  acudienteTipoDoc?: string;

  @ApiPropertyOptional({ example: '79845123' })
  @IsOptional()
  @IsString()
  acudienteNumeroDoc?: string;

  @ApiPropertyOptional({ example: '79845123' })
  @IsOptional()
  @IsString()
  acudienteNumeroDocumento?: string;

  @ApiPropertyOptional({ example: '+57 315 777 6666' })
  @IsOptional()
  @IsString()
  acudienteTelefono?: string;

  @ApiPropertyOptional({ example: 'padre.gomez@gmail.com' })
  @IsOptional()
  @ValidateIf((o) => !!o.acudienteEmail && o.acudienteEmail.trim().length > 0)
  @IsEmail()
  acudienteEmail?: string;

  @ApiPropertyOptional({ example: 'PADRE' })
  @IsOptional()
  @IsString()
  acudienteParentesco?: string;
}

export class UpdateJugadorDto {
  @ApiPropertyOptional({ example: '30000000-0000-0000-0000-000000000001' })
  @IsOptional()
  @IsString()
  categoriaId?: string;

  @ApiPropertyOptional({ example: 'Mateo' })
  @IsOptional()
  @IsString()
  nombres?: string;

  @ApiPropertyOptional({ example: 'Gómez Restrepo' })
  @IsOptional()
  @IsString()
  apellidos?: string;

  @ApiPropertyOptional({ enum: TipoDocumento })
  @IsOptional()
  @IsEnum(TipoDocumento)
  tipoDocumento?: TipoDocumento;

  @ApiPropertyOptional({ example: '1023456781' })
  @IsOptional()
  @IsString()
  numeroDocumento?: string;

  @ApiPropertyOptional({ example: '2011-04-15' })
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @ApiPropertyOptional({ enum: Genero })
  @IsOptional()
  @IsEnum(Genero)
  genero?: Genero;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=120' })
  @IsOptional()
  @IsString()
  fotoUrl?: string;

  @ApiPropertyOptional({ example: 'Extremo Derecho' })
  @IsOptional()
  @IsString()
  posicionPrincipal?: string;

  @ApiPropertyOptional({ example: 'Delantero Centro' })
  @IsOptional()
  @IsString()
  posicionSecundaria?: string;

  @ApiPropertyOptional({ enum: PiernaHabil })
  @IsOptional()
  @IsEnum(PiernaHabil)
  piernaHabil?: PiernaHabil;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(99)
  numeroDorsal?: number;

  @ApiPropertyOptional({ example: 'SURA EPS' })
  @IsOptional()
  @IsString()
  eps?: string;

  @ApiPropertyOptional({ enum: EstadoMatricula })
  @IsOptional()
  @IsEnum(EstadoMatricula)
  estadoMatricula?: EstadoMatricula;
}

export class CreateAcudienteDto {
  @ApiProperty({ example: 'Luis Manuel' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del acudiente es obligatorio' })
  nombres: string;

  @ApiProperty({ example: 'Gómez' })
  @IsString()
  @IsNotEmpty({ message: 'Los apellidos son obligatorios' })
  apellidos: string;

  @ApiPropertyOptional({ example: 'CC', default: 'CC' })
  @IsOptional()
  @IsString()
  tipoDocumento?: string;

  @ApiProperty({ example: '79845123' })
  @IsString()
  @IsNotEmpty({ message: 'El número de documento es obligatorio' })
  numeroDocumento: string;

  @ApiProperty({ example: '+57 315 777 6666' })
  @IsString()
  @IsNotEmpty({ message: 'El teléfono móvil es obligatorio' })
  telefonoMovil: string;

  @ApiPropertyOptional({ example: 'padre@sportcore.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'PADRE', default: 'PADRE' })
  @IsOptional()
  @IsString()
  parentesco?: string;

  @ApiPropertyOptional({ example: 'Calle 134 # 45-20, Bogotá D.C.' })
  @IsOptional()
  @IsString()
  direccionResidencia?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  esContactoPrincipal?: boolean;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  autorizadoRecoger?: boolean;
}

export class CreateBiometriaDto {
  @ApiPropertyOptional({ example: '2026-03-20' })
  @IsOptional()
  @IsDateString()
  fechaEvaluacion?: string;

  @ApiProperty({ example: 56.4, description: 'Peso corporal en Kilogramos (Kg)' })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: 'El peso es obligatorio' })
  pesoKg: number;

  @ApiProperty({ example: 167.5, description: 'Estatura/Talla en Centímetros (cm)' })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty({ message: 'La talla es obligatoria' })
  tallaCm: number;

  @ApiPropertyOptional({ example: 2850, description: 'Distancia recorrida en Test de Cooper (metros)' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  testCooperMetros?: number;

  @ApiPropertyOptional({ example: 3.92, description: 'Tiempo en Sprint de 30 metros (segundos)' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  velocidad30mSeg?: number;

  @ApiPropertyOptional({ example: 42.5, description: 'Altura en salto vertical (cm)' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  saltoVerticalCm?: number;

  @ApiPropertyOptional({ example: 'Excelente potencia aeróbica y visión de juego.' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

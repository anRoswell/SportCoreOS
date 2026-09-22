import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsUUID, Min, Matches, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoSuperficieCancha, TipoReservaCancha, MetodoPago } from '../../common/enums/domain.enums';

export class CreateCanchaDto {
  @ApiProperty({ description: 'Nombre descriptivo de la cancha', example: 'Cancha Sintética 8 - El Campín' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Tipo de superficie', example: TipoSuperficieCancha.SINTETICA_F8, enum: TipoSuperficieCancha })
  @IsNotEmpty()
  @IsEnum(TipoSuperficieCancha)
  tipo_superficie: TipoSuperficieCancha;

  @ApiProperty({ description: 'Precio de la hora diurna (sin luz)', example: 80000 })
  @IsNumber()
  @Min(0)
  precio_hora_diurna: number;

  @ApiProperty({ description: 'Precio de la hora nocturna (con luz artificial)', example: 120000 })
  @IsNumber()
  @Min(0)
  precio_hora_nocturna: number;

  @ApiPropertyOptional({ description: 'Hora de apertura (HH:mm)', default: '06:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/)
  hora_apertura?: string;

  @ApiPropertyOptional({ description: 'Hora de cierre (HH:mm)', default: '23:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/)
  hora_cierre?: string;
}

export class UpdateCanchaDto {
  @ApiPropertyOptional({ description: 'Nombre descriptivo de la cancha' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ description: 'Tipo de superficie' })
  @IsOptional()
  @IsString()
  tipo_superficie?: string;

  @ApiPropertyOptional({ description: 'Precio hora diurna' })
  @IsOptional()
  @IsNumber()
  precio_hora_diurna?: number;

  @ApiPropertyOptional({ description: 'Precio hora nocturna' })
  @IsOptional()
  @IsNumber()
  precio_hora_nocturna?: number;

  @ApiPropertyOptional({ description: 'Estado activa' })
  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

export class CreateReservaDto {
  @ApiProperty({ description: 'ID de la cancha' })
  @IsString()
  @IsNotEmpty()
  cancha_id: string;

  @ApiProperty({ description: 'Fecha de la reserva (YYYY-MM-DD)', example: '2026-03-25' })
  @IsString()
  @IsNotEmpty()
  fecha_reserva: string;

  @ApiProperty({ description: 'Hora de inicio (HH:mm)', example: '19:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/)
  hora_inicio: string;

  @ApiProperty({ description: 'Hora de fin (HH:mm)', example: '20:00' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/)
  hora_fin: string;

  @ApiProperty({ description: 'Tipo de reserva', example: TipoReservaCancha.ALQUILER_PARTICULAR, enum: TipoReservaCancha })
  @IsNotEmpty()
  @IsEnum(TipoReservaCancha)
  tipo_reserva: TipoReservaCancha;

  @ApiPropertyOptional({ description: 'Nombre del cliente / empresa' })
  @IsOptional()
  @IsString()
  cliente_nombre?: string;

  @ApiPropertyOptional({ description: 'Teléfono / WhatsApp de contacto' })
  @IsOptional()
  @IsString()
  cliente_telefono?: string;

  @ApiPropertyOptional({ description: 'Monto de anticipo abonado', default: 0 })
  @IsOptional()
  @IsNumber()
  monto_anticipo?: number;

  @ApiPropertyOptional({ description: 'Método de pago de anticipo', example: MetodoPago.TRANSFERENCIA, enum: MetodoPago })
  @IsOptional()
  @IsEnum(MetodoPago)
  metodo_pago?: MetodoPago;
}

export class PagarCajaDto {
  @ApiProperty({ description: 'Monto a pagar en recepción' })
  @IsNumber()
  @Min(0)
  monto: number;

  @ApiProperty({ description: 'Método de pago en caja', example: MetodoPago.EFECTIVO_CAJA, enum: MetodoPago })
  @IsNotEmpty()
  @IsEnum(MetodoPago)
  metodo_pago: MetodoPago;
}

import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, Min, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVarianteDto {
  @ApiProperty({ description: 'Talla del producto', example: '12' })
  @IsString()
  @IsNotEmpty()
  talla: string;

  @ApiProperty({ description: 'Stock inicial disponible', example: 20 })
  @IsNumber()
  @Min(0)
  stock_actual: number;

  @ApiPropertyOptional({ description: 'Stock mínimo para disparar alerta', default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stock_minimo_alerta?: number;
}

export class CreateProductoDto {
  @ApiProperty({ description: 'Código SKU único', example: 'KIT-TITULAR-2026' })
  @IsString()
  @IsNotEmpty()
  codigo_sku: string;

  @ApiProperty({ description: 'Nombre del producto', example: 'Kit Oficial Titular 2026 (Camisilla + Pantaloneta + Medias)' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Categoría de producto', example: 'uniforme_oficial', enum: ['uniforme_oficial', 'entrenamiento', 'accesorios', 'balones'] })
  @IsString()
  @IsNotEmpty()
  categoria: string;

  @ApiProperty({ description: 'Precio unitario de venta', example: 145000 })
  @IsNumber()
  @Min(0)
  precio_venta: number;

  @ApiPropertyOptional({ description: 'Foto o mockup del producto' })
  @IsOptional()
  @IsString()
  foto_url?: string;

  @ApiPropertyOptional({ description: 'Permite personalizar con dorsal y nombre', default: false })
  @IsOptional()
  @IsBoolean()
  personalizable?: boolean;

  @ApiPropertyOptional({ description: 'Variantes iniciales de tallas con stock' })
  @IsOptional()
  @IsArray()
  variantes?: CreateVarianteDto[];
}

export class UpdateProductoDto {
  @ApiPropertyOptional({ description: 'Nombre del producto' })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ description: 'Categoría de producto' })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional({ description: 'Precio unitario de venta' })
  @IsOptional()
  @IsNumber()
  precio_venta?: number;

  @ApiPropertyOptional({ description: 'Foto o mockup del producto' })
  @IsOptional()
  @IsString()
  foto_url?: string;

  @ApiPropertyOptional({ description: 'Permite personalizar con dorsal y nombre' })
  @IsOptional()
  @IsBoolean()
  personalizable?: boolean;

  @ApiPropertyOptional({ description: 'Estado activo del producto' })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class CreatePedidoDto {
  @ApiProperty({ description: 'ID de la variante de producto comprada' })
  @IsString()
  @IsNotEmpty()
  variante_id: string;

  @ApiProperty({ description: 'Cantidad de unidades', example: 1 })
  @IsNumber()
  @Min(1)
  cantidad: number;

  @ApiPropertyOptional({ description: 'ID del jugador vinculado' })
  @IsOptional()
  @IsString()
  jugador_id?: string;

  @ApiPropertyOptional({ description: 'Nombre personalizado a estampar' })
  @IsOptional()
  @IsString()
  estampado_nombre?: string;

  @ApiPropertyOptional({ description: 'Número de dorsal a estampar' })
  @IsOptional()
  @IsNumber()
  estampado_dorsal?: number;

  @ApiPropertyOptional({ description: 'Nombre del comprador o padre' })
  @IsOptional()
  @IsString()
  comprador_nombre?: string;

  @ApiPropertyOptional({ description: 'Teléfono / WhatsApp' })
  @IsOptional()
  @IsString()
  comprador_telefono?: string;

  @ApiPropertyOptional({ description: 'Método de pago', example: 'WOMPI_PSE', enum: ['WOMPI_PSE', 'EFECTIVO_CAJA', 'TRANSFERENCIA'] })
  @IsOptional()
  @IsString()
  metodo_pago?: string;
}

export class DespacharPedidoDto {
  @ApiProperty({ description: 'Código de despacho o firma de quien recibe en utilería' })
  @IsString()
  @IsNotEmpty()
  recibido_por: string;
}

export class AjustarStockDto {
  @ApiProperty({ description: 'Nuevo stock físico en bodega' })
  @IsNumber()
  @Min(0)
  stock_actual: number;
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AjustarStockDto = exports.DespacharPedidoDto = exports.CreatePedidoDto = exports.UpdateProductoDto = exports.CreateProductoDto = exports.CreateVarianteDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const domain_enums_1 = require("../../common/enums/domain.enums");
class CreateVarianteDto {
    talla;
    stock_actual;
    stock_minimo_alerta;
}
exports.CreateVarianteDto = CreateVarianteDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Talla del producto', example: '12' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateVarianteDto.prototype, "talla", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Stock inicial disponible', example: 20 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateVarianteDto.prototype, "stock_actual", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Stock mínimo para disparar alerta', default: 5 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateVarianteDto.prototype, "stock_minimo_alerta", void 0);
class CreateProductoDto {
    codigo_sku;
    nombre;
    categoria;
    precio_venta;
    foto_url;
    personalizable;
    variantes;
}
exports.CreateProductoDto = CreateProductoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Código SKU único', example: 'KIT-TITULAR-2026' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProductoDto.prototype, "codigo_sku", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre del producto', example: 'Kit Oficial Titular 2026 (Camisilla + Pantaloneta + Medias)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProductoDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Categoría de producto', example: domain_enums_1.CategoriaProductoTienda.UNIFORME_OFICIAL, enum: domain_enums_1.CategoriaProductoTienda }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(domain_enums_1.CategoriaProductoTienda),
    __metadata("design:type", String)
], CreateProductoDto.prototype, "categoria", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Precio unitario de venta', example: 145000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateProductoDto.prototype, "precio_venta", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Foto o mockup del producto' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductoDto.prototype, "foto_url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Permite personalizar con dorsal y nombre', default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateProductoDto.prototype, "personalizable", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Variantes iniciales de tallas con stock' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], CreateProductoDto.prototype, "variantes", void 0);
class UpdateProductoDto {
    nombre;
    categoria;
    precio_venta;
    foto_url;
    personalizable;
    activo;
}
exports.UpdateProductoDto = UpdateProductoDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nombre del producto' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProductoDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Categoría de producto' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProductoDto.prototype, "categoria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Precio unitario de venta' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateProductoDto.prototype, "precio_venta", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Foto o mockup del producto' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProductoDto.prototype, "foto_url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Permite personalizar con dorsal y nombre' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateProductoDto.prototype, "personalizable", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Estado activo del producto' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateProductoDto.prototype, "activo", void 0);
class CreatePedidoDto {
    variante_id;
    cantidad;
    jugador_id;
    estampado_nombre;
    estampado_dorsal;
    comprador_nombre;
    comprador_telefono;
    metodo_pago;
}
exports.CreatePedidoDto = CreatePedidoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la variante de producto comprada' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePedidoDto.prototype, "variante_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Cantidad de unidades', example: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreatePedidoDto.prototype, "cantidad", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID del jugador vinculado' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePedidoDto.prototype, "jugador_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nombre personalizado a estampar' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePedidoDto.prototype, "estampado_nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Número de dorsal a estampar' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePedidoDto.prototype, "estampado_dorsal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nombre del comprador o padre' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePedidoDto.prototype, "comprador_nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Teléfono / WhatsApp' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePedidoDto.prototype, "comprador_telefono", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Método de pago', example: domain_enums_1.MetodoPago.WOMPI_PSE, enum: domain_enums_1.MetodoPago }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(domain_enums_1.MetodoPago),
    __metadata("design:type", String)
], CreatePedidoDto.prototype, "metodo_pago", void 0);
class DespacharPedidoDto {
    recibido_por;
}
exports.DespacharPedidoDto = DespacharPedidoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Código de despacho o firma de quien recibe en utilería' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], DespacharPedidoDto.prototype, "recibido_por", void 0);
class AjustarStockDto {
    stock_actual;
}
exports.AjustarStockDto = AjustarStockDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nuevo stock físico en bodega' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], AjustarStockDto.prototype, "stock_actual", void 0);
//# sourceMappingURL=tienda.dto.js.map
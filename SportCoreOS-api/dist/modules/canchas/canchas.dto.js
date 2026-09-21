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
exports.PagarCajaDto = exports.CreateReservaDto = exports.UpdateCanchaDto = exports.CreateCanchaDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateCanchaDto {
    nombre;
    tipo_superficie;
    precio_hora_diurna;
    precio_hora_nocturna;
    hora_apertura;
    hora_cierre;
}
exports.CreateCanchaDto = CreateCanchaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombre descriptivo de la cancha', example: 'Cancha Sintética 8 - El Campín' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCanchaDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tipo de superficie', example: 'sintetica_f8', enum: ['sintetica_f5', 'sintetica_f8', 'natural_f11', 'futsal_madera'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCanchaDto.prototype, "tipo_superficie", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Precio de la hora diurna (sin luz)', example: 80000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCanchaDto.prototype, "precio_hora_diurna", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Precio de la hora nocturna (con luz artificial)', example: 120000 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateCanchaDto.prototype, "precio_hora_nocturna", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Hora de apertura (HH:mm)', default: '06:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):?([0-5]\d)$/),
    __metadata("design:type", String)
], CreateCanchaDto.prototype, "hora_apertura", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Hora de cierre (HH:mm)', default: '23:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):?([0-5]\d)$/),
    __metadata("design:type", String)
], CreateCanchaDto.prototype, "hora_cierre", void 0);
class UpdateCanchaDto {
    nombre;
    tipo_superficie;
    precio_hora_diurna;
    precio_hora_nocturna;
    activa;
}
exports.UpdateCanchaDto = UpdateCanchaDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nombre descriptivo de la cancha' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCanchaDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tipo de superficie' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCanchaDto.prototype, "tipo_superficie", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Precio hora diurna' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCanchaDto.prototype, "precio_hora_diurna", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Precio hora nocturna' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCanchaDto.prototype, "precio_hora_nocturna", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Estado activa' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCanchaDto.prototype, "activa", void 0);
class CreateReservaDto {
    cancha_id;
    fecha_reserva;
    hora_inicio;
    hora_fin;
    tipo_reserva;
    cliente_nombre;
    cliente_telefono;
    monto_anticipo;
    metodo_pago;
}
exports.CreateReservaDto = CreateReservaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID de la cancha' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReservaDto.prototype, "cancha_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha de la reserva (YYYY-MM-DD)', example: '2026-03-25' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReservaDto.prototype, "fecha_reserva", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Hora de inicio (HH:mm)', example: '19:00' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):?([0-5]\d)$/),
    __metadata("design:type", String)
], CreateReservaDto.prototype, "hora_inicio", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Hora de fin (HH:mm)', example: '20:00' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.Matches)(/^([01]\d|2[0-3]):?([0-5]\d)$/),
    __metadata("design:type", String)
], CreateReservaDto.prototype, "hora_fin", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Tipo de reserva', example: 'alquiler_particular', enum: ['entrenamiento_club', 'partido_oficial', 'alquiler_particular', 'mantenimiento'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateReservaDto.prototype, "tipo_reserva", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nombre del cliente / empresa' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservaDto.prototype, "cliente_nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Teléfono / WhatsApp de contacto' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservaDto.prototype, "cliente_telefono", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Monto de anticipo abonado', default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateReservaDto.prototype, "monto_anticipo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Método de pago de anticipo', example: 'TRANSFERENCIA' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReservaDto.prototype, "metodo_pago", void 0);
class PagarCajaDto {
    monto;
    metodo_pago;
}
exports.PagarCajaDto = PagarCajaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Monto a pagar en recepción' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PagarCajaDto.prototype, "monto", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Método de pago en caja', example: 'EFECTIVO', enum: ['EFECTIVO', 'DATAFONO', 'TRANSFERENCIA'] }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PagarCajaDto.prototype, "metodo_pago", void 0);
//# sourceMappingURL=canchas.dto.js.map
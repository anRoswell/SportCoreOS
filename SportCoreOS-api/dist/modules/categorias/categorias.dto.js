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
exports.UpdateCategoriaDto = exports.CreateCategoriaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateCategoriaDto {
    nombre;
    codigo_categoria;
    anio_nacimiento_min;
    anio_nacimiento_max;
    rama;
    nivel_competencia;
    color_distintivo;
    cupo_maximo;
    director_tecnico_id;
}
exports.CreateCategoriaDto = CreateCategoriaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Sub-16 Formativa 2010' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCategoriaDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SUB_16' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCategoriaDto.prototype, "codigo_categoria", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2010 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateCategoriaDto.prototype, "anio_nacimiento_min", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2010 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateCategoriaDto.prototype, "anio_nacimiento_max", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'MASCULINO', enum: ['MASCULINO', 'FEMENINO', 'MIXTO'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoriaDto.prototype, "rama", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'FORMATIVO', enum: ['FORMATIVO', 'COMPETITIVO', 'ELITE'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoriaDto.prototype, "nivel_competencia", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#3B82F6' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoriaDto.prototype, "color_distintivo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 25 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCategoriaDto.prototype, "cupo_maximo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-dt' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCategoriaDto.prototype, "director_tecnico_id", void 0);
class UpdateCategoriaDto {
    nombre;
    codigo_categoria;
    anio_nacimiento_min;
    anio_nacimiento_max;
    rama;
    nivel_competencia;
    color_distintivo;
    cupo_maximo;
    director_tecnico_id;
    activa;
}
exports.UpdateCategoriaDto = UpdateCategoriaDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCategoriaDto.prototype, "nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCategoriaDto.prototype, "codigo_categoria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCategoriaDto.prototype, "anio_nacimiento_min", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCategoriaDto.prototype, "anio_nacimiento_max", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCategoriaDto.prototype, "rama", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCategoriaDto.prototype, "nivel_competencia", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCategoriaDto.prototype, "color_distintivo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateCategoriaDto.prototype, "cupo_maximo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateCategoriaDto.prototype, "director_tecnico_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateCategoriaDto.prototype, "activa", void 0);
//# sourceMappingURL=categorias.dto.js.map
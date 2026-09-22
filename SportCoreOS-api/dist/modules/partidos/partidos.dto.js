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
exports.CreateEventoActaDto = exports.UpdatePartidoDto = exports.CreatePartidoDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const domain_enums_1 = require("../../common/enums/domain.enums");
class CreatePartidoDto {
    categoria_id;
    rival_nombre;
    fecha_partido;
    hora_partido;
    hora_citacion;
    sede_cancha;
    condicion_juego;
    indumentaria_kit;
    latitud;
    longitud;
}
exports.CreatePartidoDto = CreatePartidoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-categoria' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePartidoDto.prototype, "categoria_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Santa Fe D.C. Academia' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePartidoDto.prototype, "rival_nombre", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2026-09-26' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePartidoDto.prototype, "fecha_partido", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '09:00:00' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePartidoDto.prototype, "hora_partido", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '08:00:00' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartidoDto.prototype, "hora_citacion", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Sede Campestre Arrayanes - Cancha 1' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreatePartidoDto.prototype, "sede_cancha", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: domain_enums_1.CondicionJuego.LOCAL, enum: domain_enums_1.CondicionJuego }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(domain_enums_1.CondicionJuego),
    __metadata("design:type", String)
], CreatePartidoDto.prototype, "condicion_juego", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Kit Titular Verde Esmeralda' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartidoDto.prototype, "indumentaria_kit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 4.7892 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePartidoDto.prototype, "latitud", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: -74.0412 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreatePartidoDto.prototype, "longitud", void 0);
class UpdatePartidoDto {
    rival_nombre;
    fecha_partido;
    hora_partido;
    hora_citacion;
    sede_cancha;
    condicion_juego;
    indumentaria_kit;
    estado_partido;
    goles_club;
    goles_rival;
}
exports.UpdatePartidoDto = UpdatePartidoDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePartidoDto.prototype, "rival_nombre", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePartidoDto.prototype, "fecha_partido", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePartidoDto.prototype, "hora_partido", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePartidoDto.prototype, "hora_citacion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePartidoDto.prototype, "sede_cancha", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: domain_enums_1.CondicionJuego }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(domain_enums_1.CondicionJuego),
    __metadata("design:type", String)
], UpdatePartidoDto.prototype, "condicion_juego", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdatePartidoDto.prototype, "indumentaria_kit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: domain_enums_1.EstadoPartido }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(domain_enums_1.EstadoPartido),
    __metadata("design:type", String)
], UpdatePartidoDto.prototype, "estado_partido", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePartidoDto.prototype, "goles_club", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdatePartidoDto.prototype, "goles_rival", void 0);
class CreateEventoActaDto {
    jugador_id;
    minuto_juego;
    tipo_evento;
    observacion;
    descripcion;
}
exports.CreateEventoActaDto = CreateEventoActaDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'uuid-jugador' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventoActaDto.prototype, "jugador_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 25 }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], CreateEventoActaDto.prototype, "minuto_juego", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: domain_enums_1.TipoEventoActa.GOL, enum: domain_enums_1.TipoEventoActa }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsEnum)(domain_enums_1.TipoEventoActa),
    __metadata("design:type", String)
], CreateEventoActaDto.prototype, "tipo_evento", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Remate de media distancia' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventoActaDto.prototype, "observacion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Remate de media distancia' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventoActaDto.prototype, "descripcion", void 0);
//# sourceMappingURL=partidos.dto.js.map
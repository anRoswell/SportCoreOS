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
exports.ChatTacticoDtDto = exports.GenerarBoletinAlumnoDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class GenerarBoletinAlumnoDto {
    jugador_id;
    periodo;
    enfoque_adicional;
}
exports.GenerarBoletinAlumnoDto = GenerarBoletinAlumnoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID único del jugador', example: 'e1e0691e-691e-4c92-9046-871955524534' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], GenerarBoletinAlumnoDto.prototype, "jugador_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Mes del reporte (formato YYYY-MM)', example: '2026-03' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerarBoletinAlumnoDto.prototype, "periodo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Enfoque especial para el boletín', example: 'Fase ofensiva y liderazgo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GenerarBoletinAlumnoDto.prototype, "enfoque_adicional", void 0);
class ChatTacticoDtDto {
    consulta;
    categoria_id;
    sistema_base;
}
exports.ChatTacticoDtDto = ChatTacticoDtDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Consulta o pregunta táctica del DT', example: '¿Qué formación y presión alta me recomiendas frente a un 4-3-3 con extremos rápidos?' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ChatTacticoDtDto.prototype, "consulta", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID de la categoría a consultar', example: 'd1000000-0000-0000-0000-000000000001' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ChatTacticoDtDto.prototype, "categoria_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Sistema de juego base', example: '1-4-2-3-1' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ChatTacticoDtDto.prototype, "sistema_base", void 0);
//# sourceMappingURL=ia.dto.js.map
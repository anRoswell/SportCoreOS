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
exports.CreateEvaluacionDto = exports.UpdateProspectoDto = exports.CreateProspectoDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateProspectoDto {
    nombres_apellidos;
    fecha_nacimiento;
    posicion_principal;
    posicion_secundaria;
    pie_habil;
    club_origen;
    telefono_contacto;
    email_contacto;
    ciudad;
    altura_cm;
    peso_kg;
    video_highlight_url;
    estado_scouting;
    notas_scout;
}
exports.CreateProspectoDto = CreateProspectoDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Nombres y apellidos del prospecto', example: 'Mateo Henao Quintana' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProspectoDto.prototype, "nombres_apellidos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha de nacimiento (YYYY-MM-DD)', example: '2010-04-18' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProspectoDto.prototype, "fecha_nacimiento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Posición principal en campo', example: 'extremo_derecho' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateProspectoDto.prototype, "posicion_principal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Posición secundaria', example: 'delantero_centro' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProspectoDto.prototype, "posicion_secundaria", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Pie hábil (derecho, izquierdo, ambidiestro)', example: 'izquierdo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProspectoDto.prototype, "pie_habil", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Club o escuela de origen actual', example: 'Club Deportivo Semillero Paisa' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProspectoDto.prototype, "club_origen", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Teléfono de contacto de los padres/agente', example: '+57 301 444 5555' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProspectoDto.prototype, "telefono_contacto", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Correo electrónico de contacto', example: 'familia.henao@email.com' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProspectoDto.prototype, "email_contacto", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Ciudad de residencia', example: 'Medellín' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProspectoDto.prototype, "ciudad", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Estatura en centímetros', example: 168.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateProspectoDto.prototype, "altura_cm", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Peso en kilogramos', example: 58.5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateProspectoDto.prototype, "peso_kg", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'URL de clip de video o highlight', example: 'https://youtube.com/watch?v=xyz' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProspectoDto.prototype, "video_highlight_url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Estado en el pipeline de captación', example: 'en_observacion' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProspectoDto.prototype, "estado_scouting", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notas iniciales del ojeador', example: 'Gran técnica individual y velocidad de desborde.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateProspectoDto.prototype, "notas_scout", void 0);
class UpdateProspectoDto {
    nombres_apellidos;
    posicion_principal;
    club_origen;
    estado_scouting;
    valoracion_general;
    notas_scout;
}
exports.UpdateProspectoDto = UpdateProspectoDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nombres y apellidos' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProspectoDto.prototype, "nombres_apellidos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Posición principal' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProspectoDto.prototype, "posicion_principal", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Club de origen' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProspectoDto.prototype, "club_origen", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Estado en el pipeline (en_observacion, interes_fichaje, fichado, descartado)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProspectoDto.prototype, "estado_scouting", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Valoración general estimada (1.0 a 10.0)' }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateProspectoDto.prototype, "valoracion_general", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Notas y observaciones adicionales' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateProspectoDto.prototype, "notas_scout", void 0);
class CreateEvaluacionDto {
    fecha_observacion;
    partido_evento;
    score_tecnico;
    score_tactico;
    score_fisico;
    score_mental;
    comentarios_cualitativos;
    recomendacion;
}
exports.CreateEvaluacionDto = CreateEvaluacionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fecha del partido u observación', example: '2026-03-21' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEvaluacionDto.prototype, "fecha_observacion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Nombre del torneo o partido de observación', example: 'Torneo Departamental Sub-15' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEvaluacionDto.prototype, "partido_evento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Calificación Técnica (1.0 a 10.0)', example: 9.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1.0),
    (0, class_validator_1.Max)(10.0),
    __metadata("design:type", Number)
], CreateEvaluacionDto.prototype, "score_tecnico", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Calificación Táctica (1.0 a 10.0)', example: 8.5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1.0),
    (0, class_validator_1.Max)(10.0),
    __metadata("design:type", Number)
], CreateEvaluacionDto.prototype, "score_tactico", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Calificación Física (1.0 a 10.0)', example: 8.8 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1.0),
    (0, class_validator_1.Max)(10.0),
    __metadata("design:type", Number)
], CreateEvaluacionDto.prototype, "score_fisico", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Calificación Mental / Actitudinal (1.0 a 10.0)', example: 9.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1.0),
    (0, class_validator_1.Max)(10.0),
    __metadata("design:type", Number)
], CreateEvaluacionDto.prototype, "score_mental", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Comentarios cualitativos detallados', example: 'Desequilibrio constante por banda izquierda y precisión en centros.' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEvaluacionDto.prototype, "comentarios_cualitativos", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recomendación del scout (FICHAR_YA, SEGUIMIENTO, DESCARTAR)', example: 'FICHAR_YA' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateEvaluacionDto.prototype, "recomendacion", void 0);
//# sourceMappingURL=scouting.dto.js.map
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
exports.CreateMetricaGpsDto = exports.CreateSesionGpsDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CreateSesionGpsDto {
    fecha_sesion;
    partido_id;
    tipo_sesion;
    dispositivo_marca;
    duracion_minutos;
    clima_temperatura;
}
exports.CreateSesionGpsDto = CreateSesionGpsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Fecha de la sesión o partido (YYYY-MM-DD)', example: '2026-03-21' }),
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateSesionGpsDto.prototype, "fecha_sesion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'ID del partido asociado', example: '5d61a1ec-aa7c-457c-8d79-6433475217bc' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSesionGpsDto.prototype, "partido_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Tipo de sesión (PARTIDO_OFICIAL, ENTRENAMIENTO_TACTICO, FISICO_INTENSIVO)', example: 'PARTIDO_OFICIAL' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSesionGpsDto.prototype, "tipo_sesion", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Marca o formato del sensor (CATAPULT_10HZ, POLAR_TEAM_PRO, VMAXPRO, GPX_RAW)', example: 'CATAPULT_10HZ' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSesionGpsDto.prototype, "dispositivo_marca", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Duración en minutos de la sesión', example: 90 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateSesionGpsDto.prototype, "duracion_minutos", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Clima o temperatura ambiental', example: '22°C Soleado' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateSesionGpsDto.prototype, "clima_temperatura", void 0);
class CreateMetricaGpsDto {
    jugador_id;
    distancia_total_m;
    velocidad_max_kmh;
    distancia_sprint_m;
    sprints_conteo;
    aceleraciones_intensas;
    desaceleraciones_intensas;
    player_load_au;
    frecuencia_cardiaca_prom;
    frecuencia_cardiaca_max;
    coordenadas_heatmap_json;
}
exports.CreateMetricaGpsDto = CreateMetricaGpsDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID del jugador monitoreado', example: 'e1e0691e-691e-4c92-9046-871955524534' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMetricaGpsDto.prototype, "jugador_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Distancia total recorrida en metros', example: 9850.5 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateMetricaGpsDto.prototype, "distancia_total_m", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Velocidad máxima alcanzada en km/h', example: 31.8 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateMetricaGpsDto.prototype, "velocidad_max_kmh", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Distancia a alta intensidad sprint (> 21 km/h) en metros', example: 680.0 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMetricaGpsDto.prototype, "distancia_sprint_m", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Cantidad total de sprints ejecutados', example: 24 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMetricaGpsDto.prototype, "sprints_conteo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Conteo de aceleraciones intensas (> 3 m/s²)', example: 18 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMetricaGpsDto.prototype, "aceleraciones_intensas", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Conteo de desaceleraciones intensas (< -3 m/s²)', example: 14 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMetricaGpsDto.prototype, "desaceleraciones_intensas", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'PlayerLoad triaxial acumulado (AU)', example: 580.4 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMetricaGpsDto.prototype, "player_load_au", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Frecuencia cardíaca promedio (bpm)', example: 168 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMetricaGpsDto.prototype, "frecuencia_cardiaca_prom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Frecuencia cardíaca máxima (bpm)', example: 194 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreateMetricaGpsDto.prototype, "frecuencia_cardiaca_max", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Vectores de calor X/Y para renderizado 2D', example: [{ x: 25, y: 60, intensity: 0.8 }] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateMetricaGpsDto.prototype, "coordenadas_heatmap_json", void 0);
//# sourceMappingURL=telemetria.dto.js.map
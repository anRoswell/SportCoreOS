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
exports.TelemetriaService = void 0;
const common_1 = require("@nestjs/common");
const telemetria_repository_1 = require("./telemetria.repository");
let TelemetriaService = class TelemetriaService {
    telemetriaRepo;
    constructor(telemetriaRepo) {
        this.telemetriaRepo = telemetriaRepo;
    }
    async findAllSesiones(clubId) {
        return this.telemetriaRepo.findAllSesiones(clubId);
    }
    async findSesionById(id, clubId) {
        const sesion = await this.telemetriaRepo.findSesionById(id, clubId);
        if (!sesion) {
            throw new common_1.NotFoundException('Sesión de telemetría GPS no encontrada');
        }
        return sesion;
    }
    async createSesion(clubId, dto) {
        return this.telemetriaRepo.createSesion(clubId, dto);
    }
    async createMetrica(sesionId, clubId, dto) {
        const sesion = await this.telemetriaRepo.findSesionById(sesionId, clubId);
        if (!sesion) {
            throw new common_1.NotFoundException('Sesión de telemetría no encontrada en este club');
        }
        return this.telemetriaRepo.createMetrica(sesionId, dto);
    }
    async findMetricasByJugador(jugadorId, clubId) {
        return this.telemetriaRepo.findMetricasByJugador(jugadorId, clubId);
    }
};
exports.TelemetriaService = TelemetriaService;
exports.TelemetriaService = TelemetriaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [telemetria_repository_1.TelemetriaRepository])
], TelemetriaService);
//# sourceMappingURL=telemetria.service.js.map
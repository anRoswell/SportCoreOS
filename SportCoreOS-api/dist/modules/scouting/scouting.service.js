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
exports.ScoutingService = void 0;
const common_1 = require("@nestjs/common");
const scouting_repository_1 = require("./scouting.repository");
let ScoutingService = class ScoutingService {
    scoutingRepo;
    constructor(scoutingRepo) {
        this.scoutingRepo = scoutingRepo;
    }
    async findAllProspectos(clubId, search, estado, posicion) {
        return this.scoutingRepo.findAllProspectos(clubId, search, estado, posicion);
    }
    async findProspectoById(id, clubId) {
        const prospecto = await this.scoutingRepo.findProspectoById(id, clubId);
        if (!prospecto) {
            throw new common_1.NotFoundException('Prospecto no encontrado');
        }
        return prospecto;
    }
    async createProspecto(clubId, dto) {
        return this.scoutingRepo.createProspecto(clubId, dto);
    }
    async updateProspecto(id, clubId, dto) {
        const updated = await this.scoutingRepo.updateProspecto(id, clubId, dto);
        if (!updated) {
            throw new common_1.NotFoundException('Prospecto no encontrado');
        }
        return updated;
    }
    async deleteProspecto(id, clubId) {
        const deleted = await this.scoutingRepo.deleteProspecto(id, clubId);
        if (!deleted) {
            throw new common_1.NotFoundException('Prospecto no encontrado');
        }
        return deleted;
    }
    async createEvaluacion(prospectoId, clubId, scoutUsuarioId, dto) {
        const prospecto = await this.scoutingRepo.findProspectoById(prospectoId, clubId);
        if (!prospecto) {
            throw new common_1.NotFoundException('Prospecto no encontrado en este club');
        }
        return this.scoutingRepo.createEvaluacion(prospectoId, scoutUsuarioId, dto);
    }
};
exports.ScoutingService = ScoutingService;
exports.ScoutingService = ScoutingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [scouting_repository_1.ScoutingRepository])
], ScoutingService);
//# sourceMappingURL=scouting.service.js.map
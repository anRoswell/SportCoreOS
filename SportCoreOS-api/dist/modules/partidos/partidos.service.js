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
exports.PartidosService = void 0;
const common_1 = require("@nestjs/common");
const partidos_repository_1 = require("./partidos.repository");
let PartidosService = class PartidosService {
    partidosRepository;
    constructor(partidosRepository) {
        this.partidosRepository = partidosRepository;
    }
    async findByClub(clubId, categoriaId) {
        return this.partidosRepository.findPartidosByClub(clubId, categoriaId);
    }
    async findDetallePartido(partidoId, clubId) {
        const detalle = await this.partidosRepository.findDetalle(partidoId, clubId);
        if (!detalle) {
            throw new common_1.NotFoundException('Partido no encontrado');
        }
        return detalle;
    }
    async create(clubId, data) {
        return this.partidosRepository.createPartido(clubId, data);
    }
    async update(id, clubId, data) {
        return this.partidosRepository.updatePartido(id, clubId, data);
    }
    async addEvento(partidoId, data) {
        return this.partidosRepository.createEventoActa(partidoId, data);
    }
};
exports.PartidosService = PartidosService;
exports.PartidosService = PartidosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [partidos_repository_1.PartidosRepository])
], PartidosService);
//# sourceMappingURL=partidos.service.js.map
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
exports.CategoriasService = void 0;
const common_1 = require("@nestjs/common");
const categorias_repository_1 = require("./categorias.repository");
let CategoriasService = class CategoriasService {
    categoriasRepository;
    constructor(categoriasRepository) {
        this.categoriasRepository = categoriasRepository;
    }
    async findByClub(clubId) {
        return this.categoriasRepository.findCategoriasByClub(clubId);
    }
    async findPlantelByCategoria(categoriaId, clubId) {
        return this.categoriasRepository.findPlantelByCategoria(categoriaId, clubId);
    }
    async create(clubId, data) {
        return this.categoriasRepository.createCategoria(clubId, data);
    }
    async update(id, clubId, data) {
        return this.categoriasRepository.updateCategoria(id, clubId, data);
    }
    async delete(id, clubId) {
        return this.categoriasRepository.deleteCategoria(id, clubId);
    }
};
exports.CategoriasService = CategoriasService;
exports.CategoriasService = CategoriasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [categorias_repository_1.CategoriasRepository])
], CategoriasService);
//# sourceMappingURL=categorias.service.js.map
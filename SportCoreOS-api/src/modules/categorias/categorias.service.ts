import { Injectable } from '@nestjs/common';
import { CategoriasRepository } from './categorias.repository';

@Injectable()
export class CategoriasService {
  constructor(private readonly categoriasRepository: CategoriasRepository) {}

  async findByClub(
    clubId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      rama?: string;
      directorTecnicoId?: string;
    },
  ) {
    return this.categoriasRepository.findCategoriasByClub(clubId, options);
  }

  async findPlantelByCategoria(categoriaId: string, clubId: string) {
    return this.categoriasRepository.findPlantelByCategoria(categoriaId, clubId);
  }

  async create(clubId: string, data: any) {
    return this.categoriasRepository.createCategoria(clubId, data);
  }

  async update(id: string, clubId: string, data: any) {
    return this.categoriasRepository.updateCategoria(id, clubId, data);
  }

  async delete(id: string, clubId: string) {
    return this.categoriasRepository.deleteCategoria(id, clubId);
  }
}

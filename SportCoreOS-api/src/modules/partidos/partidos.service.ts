import { Injectable, NotFoundException } from '@nestjs/common';
import { PartidosRepository } from './partidos.repository';

@Injectable()
export class PartidosService {
  constructor(private readonly partidosRepository: PartidosRepository) {}

  async findByClub(
    clubId: string,
    optionsOrCatId?:
      | string
      | {
          categoriaId?: string;
          search?: string;
          estado?: string;
          page?: number;
          limit?: number;
        },
  ) {
    return this.partidosRepository.findPartidosByClub(clubId, optionsOrCatId);
  }

  async findDetallePartido(partidoId: string, clubId: string) {
    const detalle = await this.partidosRepository.findDetalle(partidoId, clubId);
    if (!detalle) {
      throw new NotFoundException('Partido no encontrado');
    }
    return detalle;
  }

  async create(clubId: string, data: any) {
    return this.partidosRepository.createPartido(clubId, data);
  }

  async update(id: string, clubId: string, data: any) {
    return this.partidosRepository.updatePartido(id, clubId, data);
  }

  async delete(id: string, clubId: string) {
    const deleted = await this.partidosRepository.deletePartido(id, clubId);
    if (!deleted) {
      throw new NotFoundException('Partido no encontrado');
    }
    return { success: true, message: 'Partido eliminado exitosamente', id };
  }

  async addEvento(partidoId: string, data: any) {
    return this.partidosRepository.createEventoActa(partidoId, data);
  }
}

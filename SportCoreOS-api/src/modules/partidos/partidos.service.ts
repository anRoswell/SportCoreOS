import { Injectable, NotFoundException } from '@nestjs/common';
import { PartidosRepository } from './partidos.repository';

@Injectable()
export class PartidosService {
  constructor(private readonly partidosRepository: PartidosRepository) {}

  async findByClub(clubId: string, categoriaId?: string) {
    return this.partidosRepository.findPartidosByClub(clubId, categoriaId);
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

  async addEvento(partidoId: string, data: any) {
    return this.partidosRepository.createEventoActa(partidoId, data);
  }
}

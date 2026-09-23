import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { RetosRepository } from './retos.repository';

@Injectable()
export class RetosService {
  constructor(private readonly retosRepo: RetosRepository) {}

  async getCatalogo(clubId?: string) {
    return this.retosRepo.findCatalogo(clubId);
  }

  async getProgresoJugador(jugadorId: string, clubId: string) {
    if (!jugadorId) {
      throw new BadRequestException('ID de jugador requerido');
    }
    return this.retosRepo.findProgresoByJugador(jugadorId, clubId);
  }

  async solicitarComprobacion(clubId: string, dto: {
    jugadorId: string;
    retoId: string;
    nivel: number;
    meta: number;
    unidad: string;
    xp: number;
  }) {
    if (!dto.jugadorId || !dto.retoId) {
      throw new BadRequestException('jugadorId y retoId son obligatorios');
    }
    return this.retosRepo.solicitarComprobacion({
      clubId,
      jugadorId: dto.jugadorId,
      retoId: dto.retoId,
      nivel: Number(dto.nivel) || 1,
      meta: Number(dto.meta) || 5,
      unidad: dto.unidad || 'repeticiones',
      xp: Number(dto.xp) || 30,
    });
  }

  async getPendientesEvaluacion(clubId: string, categoriaId?: string) {
    return this.retosRepo.findPendientesEvaluacion(clubId, categoriaId);
  }

  async evaluarReto(progresoId: string, clubId: string, dto: {
    aprobado: boolean;
    evaluadorDtId?: string;
    evaluadorDtNombre?: string;
    observaciones?: string;
  }) {
    if (!progresoId) {
      throw new BadRequestException('ID de progreso requerido');
    }
    const resultado = await this.retosRepo.evaluarReto(progresoId, clubId, dto);
    if (!resultado) {
      throw new NotFoundException('Reto comprobable no encontrado o no pertenece a este club');
    }
    return resultado;
  }

  async getMetricasJugador(jugadorId: string, clubId: string) {
    if (!jugadorId) {
      throw new BadRequestException('ID de jugador requerido');
    }
    return this.retosRepo.getMetricasJugador(jugadorId, clubId);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { TelemetriaRepository } from './telemetria.repository';
import { CreateSesionGpsDto, CreateMetricaGpsDto } from './telemetria.dto';

@Injectable()
export class TelemetriaService {
  constructor(private readonly telemetriaRepo: TelemetriaRepository) {}

  async findAllSesiones(
    clubId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      tipoSesion?: string;
    },
  ) {
    return this.telemetriaRepo.findAllSesiones(clubId, options);
  }

  async findSesionById(id: string, clubId: string) {
    const sesion = await this.telemetriaRepo.findSesionById(id, clubId);
    if (!sesion) {
      throw new NotFoundException('Sesión de telemetría GPS no encontrada');
    }
    return sesion;
  }

  async createSesion(clubId: string, dto: CreateSesionGpsDto) {
    return this.telemetriaRepo.createSesion(clubId, dto);
  }

  async createMetrica(sesionId: string, clubId: string, dto: CreateMetricaGpsDto) {
    const sesion = await this.telemetriaRepo.findSesionById(sesionId, clubId);
    if (!sesion) {
      throw new NotFoundException('Sesión de telemetría no encontrada en este club');
    }
    return this.telemetriaRepo.createMetrica(sesionId, dto);
  }

  async findMetricasByJugador(jugadorId: string, clubId: string) {
    return this.telemetriaRepo.findMetricasByJugador(jugadorId, clubId);
  }
}

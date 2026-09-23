import { Injectable, NotFoundException } from '@nestjs/common';
import { ServiciosRepository } from './servicios.repository';
import { CreateServicioDto, InscribirServicioDto } from './servicios.dto';

@Injectable()
export class ServiciosService {
  constructor(private readonly serviciosRepo: ServiciosRepository) {}

  async getServicios(
    clubId: string,
    options?: {
      categoria?: string;
      search?: string;
      soloActivos?: boolean;
    },
  ) {
    return this.serviciosRepo.findServicios(clubId, options);
  }

  async getServicioById(id: string, clubId: string) {
    const servicio = await this.serviciosRepo.findServicioById(id, clubId);
    if (!servicio) {
      throw new NotFoundException('Servicio o clínica especializada no encontrada');
    }
    return servicio;
  }

  async createServicio(clubId: string, dto: CreateServicioDto) {
    return this.serviciosRepo.createServicio(clubId, dto);
  }

  async inscribirServicio(clubId: string, servicioId: string, dto: InscribirServicioDto) {
    return this.serviciosRepo.inscribir(clubId, servicioId, dto);
  }

  async getInscripciones(servicioId: string, clubId: string) {
    return this.serviciosRepo.findInscripcionesByServicio(servicioId, clubId);
  }
}

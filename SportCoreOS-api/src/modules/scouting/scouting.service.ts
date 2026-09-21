import { Injectable, NotFoundException } from '@nestjs/common';
import { ScoutingRepository } from './scouting.repository';
import { CreateProspectoDto, UpdateProspectoDto, CreateEvaluacionDto } from './scouting.dto';

@Injectable()
export class ScoutingService {
  constructor(private readonly scoutingRepo: ScoutingRepository) {}

  async findAllProspectos(clubId: string, search?: string, estado?: string, posicion?: string) {
    return this.scoutingRepo.findAllProspectos(clubId, search, estado, posicion);
  }

  async findProspectoById(id: string, clubId: string) {
    const prospecto = await this.scoutingRepo.findProspectoById(id, clubId);
    if (!prospecto) {
      throw new NotFoundException('Prospecto no encontrado');
    }
    return prospecto;
  }

  async createProspecto(clubId: string, dto: CreateProspectoDto) {
    return this.scoutingRepo.createProspecto(clubId, dto);
  }

  async updateProspecto(id: string, clubId: string, dto: UpdateProspectoDto) {
    const updated = await this.scoutingRepo.updateProspecto(id, clubId, dto);
    if (!updated) {
      throw new NotFoundException('Prospecto no encontrado');
    }
    return updated;
  }

  async deleteProspecto(id: string, clubId: string) {
    const deleted = await this.scoutingRepo.deleteProspecto(id, clubId);
    if (!deleted) {
      throw new NotFoundException('Prospecto no encontrado');
    }
    return deleted;
  }

  async createEvaluacion(prospectoId: string, clubId: string, scoutUsuarioId: string, dto: CreateEvaluacionDto) {
    const prospecto = await this.scoutingRepo.findProspectoById(prospectoId, clubId);
    if (!prospecto) {
      throw new NotFoundException('Prospecto no encontrado en este club');
    }
    return this.scoutingRepo.createEvaluacion(prospectoId, scoutUsuarioId, dto);
  }
}

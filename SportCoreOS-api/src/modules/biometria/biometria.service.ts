import { Injectable } from '@nestjs/common';
import { BiometriaRepository, FindBiometriaFilterOptions } from './biometria.repository';

@Injectable()
export class BiometriaService {
  constructor(private readonly biometriaRepo: BiometriaRepository) {}

  async registrarEvaluacion(clubId: string, evaluadorId: string, data: any) {
    const m = data.tallaCm ? data.tallaCm / 100 : null;
    const imc = m && data.pesoKg ? parseFloat((data.pesoKg / (m * m)).toFixed(1)) : null;

    return this.biometriaRepo.createEvaluacion(evaluadorId || null, {
      jugadorId: data.jugadorId,
      fechaEvaluacion: data.fechaEvaluacion || new Date(),
      pesoKg: data.pesoKg,
      tallaCm: data.tallaCm,
      imc,
      testCooperMetros: data.testCooperMetros,
      velocidad30mSeg: data.testVelocidad30mSeg || data.velocidad30mSeg,
      saltoVerticalCm: data.testSaltoVerticalCm || data.saltoVerticalCm,
      observaciones: data.observacionesMedicas || data.observaciones,
    });
  }

  async getHistorialJugador(jugadorId: string) {
    return this.biometriaRepo.findHistorialByJugador(jugadorId);
  }

  async findByClub(clubId: string, options?: FindBiometriaFilterOptions) {
    return this.biometriaRepo.findByClubPaginated(clubId, options);
  }
}

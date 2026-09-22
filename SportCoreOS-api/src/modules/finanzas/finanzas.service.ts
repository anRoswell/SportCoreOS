import { Injectable } from '@nestjs/common';
import { FinanzasRepository } from './finanzas.repository';

@Injectable()
export class FinanzasService {
  constructor(private readonly finanzasRepository: FinanzasRepository) {}

  async getResumenFinanciero(clubId: string) {
    return this.finanzasRepository.getResumenFinanciero(clubId);
  }

  async getCargosPorCobrar(
    clubId: string,
    optionsOrCatId?:
      | string
      | {
          categoriaId?: string;
          search?: string;
          estadoPago?: string;
          page?: number;
          limit?: number;
        },
  ) {
    return this.finanzasRepository.getCargosPorCobrar(clubId, optionsOrCatId);
  }

  async generarMensualidad(clubId: string, mes: number, anio: number) {
    return this.finanzasRepository.generarMensualidad(clubId, mes, anio);
  }

  async registrarPago(id: string, clubId: string, monto: number) {
    return this.finanzasRepository.registrarPago(id, clubId, monto);
  }
}

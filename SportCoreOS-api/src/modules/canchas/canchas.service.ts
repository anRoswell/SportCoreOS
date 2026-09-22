import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { CanchasRepository } from './canchas.repository';
import { CreateCanchaDto, UpdateCanchaDto, CreateReservaDto, PagarCajaDto } from './canchas.dto';

@Injectable()
export class CanchasService {
  constructor(private readonly canchasRepo: CanchasRepository) {}

  async getCanchas(
    clubId: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
      tipoSuperficie?: string;
    },
  ) {
    return this.canchasRepo.findCanchasByClub(clubId, options);
  }

  async getCanchaById(id: string, clubId: string) {
    const cancha = await this.canchasRepo.findCanchaById(id, clubId);
    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }
    return cancha;
  }

  async createCancha(clubId: string, dto: CreateCanchaDto) {
    return this.canchasRepo.createCancha(clubId, dto);
  }

  async updateCancha(id: string, clubId: string, dto: UpdateCanchaDto) {
    const updated = await this.canchasRepo.updateCancha(id, clubId, dto);
    if (!updated) {
      throw new NotFoundException('Cancha no encontrada');
    }
    return updated;
  }

  async deleteCancha(id: string, clubId: string) {
    const deleted = await this.canchasRepo.deleteCancha(id, clubId);
    if (!deleted) {
      throw new NotFoundException('Cancha no encontrada');
    }
    return { success: true, message: 'Cancha eliminada / desactivada exitosamente', id };
  }

  async getMatrizDisponibilidad(clubId: string, fecha: string) {
    const canchasRes = await this.canchasRepo.findCanchasByClub(clubId);
    const canchas = Array.isArray(canchasRes) ? canchasRes : (canchasRes as any).data || [];
    const reservas = await this.canchasRepo.findReservasByFecha(clubId, fecha);

    // Generar slots estándar de 1 hora de 06:00 a 23:00 para cada cancha
    const horas = [
      '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
      '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
      '18:00', '19:00', '20:00', '21:00', '22:00'
    ];

    const canchasWithSlots = canchas.map((cancha: any) => {
      const slots = horas.map((hInicio) => {
        const [hh] = hInicio.split(':').map(Number);
        const nextH = (hh + 1).toString().padStart(2, '0');
        const hFin = `${nextH}:00`;

        const esNocturno = hh >= 18;
        const tarifaCalculada = esNocturno ? Number(cancha.precio_hora_nocturna) : Number(cancha.precio_hora_diurna);

        // Buscar si existe reserva que se solape
        const resMatch = reservas.find((r) => {
          if (r.cancha_id !== cancha.id) return false;
          const rIni = r.hora_inicio.substring(0, 5);
          const rFin = r.hora_fin.substring(0, 5);
          return (rIni < hFin && rFin > hInicio);
        });

        if (resMatch) {
          let estado = 'ocupado_particular';
          let label = `Alquiler (${resMatch.cliente_nombre || 'Cliente'})`;

          if (resMatch.tipo_reserva === 'entrenamiento_club') {
            estado = 'bloqueado_club';
            label = 'Entrenamiento Club';
          } else if (resMatch.tipo_reserva === 'partido_oficial') {
            estado = 'bloqueado_club';
            label = 'Partido Oficial';
          } else if (resMatch.tipo_reserva === 'mantenimiento') {
            estado = 'mantenimiento';
            label = 'Mantenimiento';
          }

          return {
            hora_inicio: hInicio,
            hora_fin: hFin,
            estado,
            estado_label: label,
            reserva_id: resMatch.id,
            cliente_nombre: resMatch.cliente_nombre,
            cliente_telefono: resMatch.cliente_telefono,
            monto_total: resMatch.monto_total,
            monto_anticipo: resMatch.monto_anticipo,
            estado_pago: resMatch.estado_pago,
            es_nocturno: esNocturno,
            tarifa: tarifaCalculada,
          };
        }

        return {
          hora_inicio: hInicio,
          hora_fin: hFin,
          estado: 'disponible',
          estado_label: `Disponible ($${tarifaCalculada.toLocaleString('es-CO')})`,
          es_nocturno: esNocturno,
          tarifa: tarifaCalculada,
        };
      });

      return {
        ...cancha,
        slots,
      };
    });

    const totalSlots = canchasWithSlots.flatMap((c) => c.slots).length;
    const ocupados = canchasWithSlots.flatMap((c) => c.slots).filter((s) => s.estado !== 'disponible').length;
    const porcentajeOcupacion = totalSlots > 0 ? Math.round((ocupados / totalSlots) * 100) : 0;

    return {
      fecha,
      porcentaje_ocupacion: porcentajeOcupacion,
      total_slots: totalSlots,
      slots_ocupados: ocupados,
      canchas: canchasWithSlots,
    };
  }

  async createReserva(clubId: string, dto: CreateReservaDto) {
    const cancha = await this.canchasRepo.findCanchaById(dto.cancha_id, clubId);
    if (!cancha) {
      throw new NotFoundException('Cancha no encontrada');
    }

    // Verificar si hay conflicto de horario
    const conflicto = await this.canchasRepo.findConflictoReserva(
      dto.cancha_id,
      dto.fecha_reserva,
      dto.hora_inicio,
      dto.hora_fin,
    );

    if (conflicto) {
      throw new ConflictException('El horario seleccionado ya se encuentra reservado o bloqueado.');
    }

    // Calcular monto total si no viene especificado
    const [hIni] = dto.hora_inicio.split(':').map(Number);
    const [hFin] = dto.hora_fin.split(':').map(Number);
    const duracionHoras = Math.max(1, hFin - hIni);
    const esNocturno = hIni >= 18;
    const tarifaPorHora = esNocturno ? Number(cancha.precio_hora_nocturna) : Number(cancha.precio_hora_diurna);
    const montoTotal = dto.tipo_reserva.includes('club') ? 0 : tarifaPorHora * duracionHoras;

    const anticipo = dto.monto_anticipo || 0;
    const estadoPago = montoTotal === 0 ? 'exonerado' : (anticipo >= montoTotal ? 'completado' : (anticipo > 0 ? 'parcial' : 'pendiente'));

    const reservaData = {
      ...dto,
      monto_total: montoTotal,
      monto_anticipo: anticipo,
      estado_pago: estadoPago,
      estado_turno: 'confirmado',
    };

    return this.canchasRepo.createReserva(reservaData);
  }

  async registrarPagoCaja(reservaId: string, dto: PagarCajaDto) {
    const actualizada = await this.canchasRepo.registrarPagoCaja(reservaId, dto.monto);
    if (!actualizada) {
      throw new NotFoundException('Reserva no encontrada');
    }
    return actualizada;
  }

  async cancelarReserva(reservaId: string) {
    const cancelada = await this.canchasRepo.cancelarReserva(reservaId);
    if (!cancelada) {
      throw new NotFoundException('Reserva no encontrada');
    }
    return cancelada;
  }

  async getCanchasCartagena(options?: {
    localidad?: string;
    barrio?: string;
    tipoSuperficie?: string;
    search?: string;
  }) {
    return this.canchasRepo.findCanchasCartagena(options);
  }
}

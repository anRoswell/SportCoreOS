"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanchasService = void 0;
const common_1 = require("@nestjs/common");
const canchas_repository_1 = require("./canchas.repository");
let CanchasService = class CanchasService {
    canchasRepo;
    constructor(canchasRepo) {
        this.canchasRepo = canchasRepo;
    }
    async getCanchas(clubId, options) {
        return this.canchasRepo.findCanchasByClub(clubId, options);
    }
    async getCanchaById(id, clubId) {
        const cancha = await this.canchasRepo.findCanchaById(id, clubId);
        if (!cancha) {
            throw new common_1.NotFoundException('Cancha no encontrada');
        }
        return cancha;
    }
    async createCancha(clubId, dto) {
        return this.canchasRepo.createCancha(clubId, dto);
    }
    async updateCancha(id, clubId, dto) {
        const updated = await this.canchasRepo.updateCancha(id, clubId, dto);
        if (!updated) {
            throw new common_1.NotFoundException('Cancha no encontrada');
        }
        return updated;
    }
    async deleteCancha(id, clubId) {
        const deleted = await this.canchasRepo.deleteCancha(id, clubId);
        if (!deleted) {
            throw new common_1.NotFoundException('Cancha no encontrada');
        }
        return { success: true, message: 'Cancha eliminada / desactivada exitosamente', id };
    }
    async getMatrizDisponibilidad(clubId, fecha) {
        const canchasRes = await this.canchasRepo.findCanchasByClub(clubId);
        const canchas = Array.isArray(canchasRes) ? canchasRes : canchasRes.data || [];
        const reservas = await this.canchasRepo.findReservasByFecha(clubId, fecha);
        const horas = [
            '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
            '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
            '18:00', '19:00', '20:00', '21:00', '22:00'
        ];
        const canchasWithSlots = canchas.map((cancha) => {
            const slots = horas.map((hInicio) => {
                const [hh] = hInicio.split(':').map(Number);
                const nextH = (hh + 1).toString().padStart(2, '0');
                const hFin = `${nextH}:00`;
                const esNocturno = hh >= 18;
                const tarifaCalculada = esNocturno ? Number(cancha.precio_hora_nocturna) : Number(cancha.precio_hora_diurna);
                const resMatch = reservas.find((r) => {
                    if (r.cancha_id !== cancha.id)
                        return false;
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
                    }
                    else if (resMatch.tipo_reserva === 'partido_oficial') {
                        estado = 'bloqueado_club';
                        label = 'Partido Oficial';
                    }
                    else if (resMatch.tipo_reserva === 'mantenimiento') {
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
    async createReserva(clubId, dto) {
        const cancha = await this.canchasRepo.findCanchaById(dto.cancha_id, clubId);
        if (!cancha) {
            throw new common_1.NotFoundException('Cancha no encontrada');
        }
        const conflicto = await this.canchasRepo.findConflictoReserva(dto.cancha_id, dto.fecha_reserva, dto.hora_inicio, dto.hora_fin);
        if (conflicto) {
            throw new common_1.ConflictException('El horario seleccionado ya se encuentra reservado o bloqueado.');
        }
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
    async registrarPagoCaja(reservaId, dto) {
        const actualizada = await this.canchasRepo.registrarPagoCaja(reservaId, dto.monto);
        if (!actualizada) {
            throw new common_1.NotFoundException('Reserva no encontrada');
        }
        return actualizada;
    }
    async cancelarReserva(reservaId) {
        const cancelada = await this.canchasRepo.cancelarReserva(reservaId);
        if (!cancelada) {
            throw new common_1.NotFoundException('Reserva no encontrada');
        }
        return cancelada;
    }
};
exports.CanchasService = CanchasService;
exports.CanchasService = CanchasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [canchas_repository_1.CanchasRepository])
], CanchasService);
//# sourceMappingURL=canchas.service.js.map
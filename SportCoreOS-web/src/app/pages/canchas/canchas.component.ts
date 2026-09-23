import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CatalogosService } from '../../core/services/catalogos.service';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';

@Component({
  selector: 'app-canchas',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrDirective],
  templateUrl: './canchas.component.html',
  styleUrl: './canchas.component.scss'
})
export class CanchasComponent implements OnInit {
  private api = inject(ApiService);
  private catalogos = inject(CatalogosService);

  readonly tiposSuperficie = this.catalogos.tiposSuperficie;
  readonly selectedFecha = signal<string>(new Date().toISOString().split('T')[0]);
  readonly canchasList = signal<any[]>([]);
  readonly disponibilidadData = signal<any | null>(null);

  readonly showReservaModal = signal<boolean>(false);
  readonly showPagoModal = signal<boolean>(false);
  readonly showCanchasListModal = signal<boolean>(false);
  readonly showCreateCanchaModal = signal<boolean>(false);
  readonly showEditCanchaModal = signal<boolean>(false);
  readonly showCancelConfirmModal = signal<boolean>(false);
  readonly showDeleteCanchaModal = signal<boolean>(false);
  readonly selectedSlotForPay = signal<any | null>(null);
  readonly slotToCancel = signal<any | null>(null);
  readonly canchaToDelete = signal<any | null>(null);
  readonly toastMessage = signal<string>('');

  isEditingCancha: boolean = false;
  editingCanchaId: string | null = null;

  pagoCajaMonto: number = 0;
  pagoCajaMetodo: string = 'EFECTIVO_CAJA';

  readonly horasSlots = [
    { inicio: '06:00', fin: '07:00', esNocturno: false },
    { inicio: '07:00', fin: '08:00', esNocturno: false },
    { inicio: '08:00', fin: '09:00', esNocturno: false },
    { inicio: '09:00', fin: '10:00', esNocturno: false },
    { inicio: '10:00', fin: '11:00', esNocturno: false },
    { inicio: '11:00', fin: '12:00', esNocturno: false },
    { inicio: '12:00', fin: '13:00', esNocturno: false },
    { inicio: '13:00', fin: '14:00', esNocturno: false },
    { inicio: '14:00', fin: '15:00', esNocturno: false },
    { inicio: '15:00', fin: '16:00', esNocturno: false },
    { inicio: '16:00', fin: '17:00', esNocturno: false },
    { inicio: '17:00', fin: '18:00', esNocturno: false },
    { inicio: '18:00', fin: '19:00', esNocturno: true },
    { inicio: '19:00', fin: '20:00', esNocturno: true },
    { inicio: '20:00', fin: '21:00', esNocturno: true },
    { inicio: '21:00', fin: '22:00', esNocturno: true },
    { inicio: '22:00', fin: '23:00', esNocturno: true },
  ];

  reservaForm = {
    cancha_id: '',
    fecha_reserva: new Date().toISOString().split('T')[0],
    hora_inicio: '18:00',
    hora_fin: '19:00',
    tipo_reserva: 'alquiler_particular',
    cliente_nombre: '',
    cliente_telefono: '',
    monto_anticipo: 0,
    metodo_pago: 'WOMPI_PSE',
  };

  canchaForm = {
    nombre: '',
    tipo_superficie: 'sintetica_f8',
    precio_hora_diurna: 80000,
    precio_hora_nocturna: 120000,
    hora_apertura: '06:00',
    hora_cierre: '23:00',
  };

  ngOnInit(): void {
    this.loadCanchas();
    this.loadDisponibilidad();
  }

  loadCanchas(): void {
    this.api.getCanchas().subscribe((data) => {
      const canchas = Array.isArray(data) ? data : (data?.data || []);
      this.canchasList.set(canchas);
      if (canchas && canchas.length > 0 && !this.reservaForm.cancha_id) {
        this.reservaForm.cancha_id = canchas[0].id;
      }
    });
  }

  loadDisponibilidad(): void {
    this.api.getDisponibilidadCanchas(this.selectedFecha()).subscribe((res) => {
      this.disponibilidadData.set(res);
    });
  }

  onFechaChange(nuevaFecha: string): void {
    this.selectedFecha.set(nuevaFecha);
    this.reservaForm.fecha_reserva = nuevaFecha;
    this.loadDisponibilidad();
  }

  getSlotForCancha(cancha: any, horaInicio: string): any {
    return cancha.slots?.find((s: any) => s.hora_inicio === horaInicio);
  }

  getSlotBadgeText(estado: string): string {
    switch (estado) {
      case 'disponible': return 'Libre';
      case 'bloqueado_club': return 'Club';
      case 'ocupado_particular': return 'Alquiler';
      case 'mantenimiento': return 'Cerrado';
      default: return estado;
    }
  }

  formatSuperficie(sup: string): string {
    switch (sup) {
      case 'sintetica_f5': return 'Sintética F5';
      case 'sintetica_f8': return 'Sintética F8';
      case 'natural_f11': return 'Grama Natural F11';
      case 'futsal_madera': return 'Futsal Madera';
      default: return sup || 'Cancha';
    }
  }

  formatCurrency(val: any): string {
    if (val === null || val === undefined || val === '') return '$ 0';
    const num = Number(val);
    if (isNaN(num)) return '$ 0';
    return '$ ' + Math.round(num).toLocaleString('es-CO');
  }

  onSlotClick(cancha: any, slot: any): void {
    if (slot.estado === 'disponible') {
      this.reservaForm.cancha_id = cancha.id;
      this.reservaForm.fecha_reserva = this.selectedFecha();
      this.reservaForm.hora_inicio = slot.hora_inicio;
      this.reservaForm.hora_fin = slot.hora_fin;
      this.reservaForm.monto_anticipo = slot.tarifa / 2;
      this.showReservaModal.set(true);
    }
  }

  openNuevaReservaModal(): void {
    this.showReservaModal.set(true);
  }

  closeReservaModal(): void {
    this.showReservaModal.set(false);
  }

  submitReserva(): void {
    if (!this.reservaForm.cancha_id || !this.reservaForm.fecha_reserva) {
      this.showToast('Por favor selecciona la cancha y fecha de reserva', true);
      return;
    }
    if (!this.reservaForm.cliente_nombre) {
      this.showToast('Ingresa el nombre del cliente para la reserva', true);
      return;
    }
    if (this.reservaForm.monto_anticipo < 0) {
      this.showToast('El monto de anticipo no puede ser negativo', true);
      return;
    }

    this.api.createReservaCancha(this.reservaForm).subscribe({
      next: () => {
        this.showToast('¡Turno reservado exitosamente!');
        this.closeReservaModal();
        this.loadDisponibilidad();
      },
      error: (err) => {
        const msg = err.error?.message || 'Error al reservar cancha (Verifica conflictos)';
        this.showToast(msg);
      }
    });
  }

  cancelarReserva(slot: any, event: Event): void {
    event.stopPropagation();
    if (!slot || !slot.reserva_id) return;
    this.slotToCancel.set(slot);
    this.showCancelConfirmModal.set(true);
  }

  closeCancelConfirmModal(): void {
    this.showCancelConfirmModal.set(false);
    this.slotToCancel.set(null);
  }

  confirmarCancelarReserva(): void {
    const slot = this.slotToCancel();
    if (!slot || !slot.reserva_id) return;

    this.api.cancelarReservaCancha(slot.reserva_id).subscribe({
      next: () => {
        this.showToast('Reserva cancelada y turno liberado exitosamente.');
        this.closeCancelConfirmModal();
        this.loadDisponibilidad();
      },
      error: () => {
        this.showToast('Error al cancelar reserva.');
      }
    });
  }

  openPagoCajaModal(slot: any, event: Event): void {
    event.stopPropagation();
    this.selectedSlotForPay.set(slot);
    this.pagoCajaMonto = (slot.monto_total || 0) - (slot.monto_anticipo || 0);
    this.showPagoModal.set(true);
  }

  closePagoModal(): void {
    this.showPagoModal.set(false);
    this.selectedSlotForPay.set(null);
  }

  submitPagoCaja(): void {
    const slot = this.selectedSlotForPay();
    if (!slot || !slot.reserva_id) return;

    this.api.pagarReservaCaja(slot.reserva_id, this.pagoCajaMonto, this.pagoCajaMetodo).subscribe({
      next: () => {
        this.showToast('¡Pago registrado y turno liquidado con éxito!');
        this.closePagoModal();
        this.loadDisponibilidad();
      },
      error: () => {
        this.showToast('Error al registrar pago en caja');
      }
    });
  }

  openCanchasListModal(): void {
    this.showCanchasListModal.set(true);
  }

  closeCanchasListModal(): void {
    this.showCanchasListModal.set(false);
  }

  openCreateCanchaModal(): void {
    this.isEditingCancha = false;
    this.editingCanchaId = null;
    this.canchaForm = {
      nombre: '',
      tipo_superficie: 'sintetica_f8',
      precio_hora_diurna: 80000,
      precio_hora_nocturna: 120000,
      hora_apertura: '06:00',
      hora_cierre: '23:00',
    };
    this.showCreateCanchaModal.set(true);
    this.showEditCanchaModal.set(false);
  }

  openEditCanchaModal(cancha: any): void {
    this.isEditingCancha = true;
    this.editingCanchaId = cancha.id;
    this.canchaForm = {
      nombre: cancha.nombre,
      tipo_superficie: cancha.tipo_superficie || 'sintetica_f8',
      precio_hora_diurna: Number(cancha.precio_hora_diurna) || 80000,
      precio_hora_nocturna: Number(cancha.precio_hora_nocturna) || 120000,
      hora_apertura: cancha.hora_apertura || '06:00',
      hora_cierre: cancha.hora_cierre || '23:00',
    };
    this.showEditCanchaModal.set(true);
    this.showCreateCanchaModal.set(false);
  }

  closeCanchaFormModal(): void {
    this.showCreateCanchaModal.set(false);
    this.showEditCanchaModal.set(false);
    this.isEditingCancha = false;
    this.editingCanchaId = null;
  }

  submitCanchaForm(): void {
    if (!this.canchaForm.nombre) {
      this.showToast('Ingresa el nombre del escenario');
      return;
    }

    if (this.isEditingCancha && this.editingCanchaId) {
      this.api.updateCancha(this.editingCanchaId, this.canchaForm).subscribe({
        next: () => {
          this.showToast('¡Cancha deportiva actualizada exitosamente!');
          this.closeCanchaFormModal();
          this.loadCanchas();
          this.loadDisponibilidad();
        },
        error: () => {
          this.showToast('Error al actualizar cancha');
        }
      });
    } else {
      this.api.createCancha(this.canchaForm).subscribe({
        next: () => {
          this.showToast('¡Cancha deportiva registrada exitosamente!');
          this.closeCanchaFormModal();
          this.loadCanchas();
          this.loadDisponibilidad();
        },
        error: () => {
          this.showToast('Error al crear cancha');
        }
      });
    }
  }

  openDeleteCanchaModal(cancha: any): void {
    this.canchaToDelete.set(cancha);
    this.showDeleteCanchaModal.set(true);
  }

  closeDeleteCanchaModal(): void {
    this.showDeleteCanchaModal.set(false);
    this.canchaToDelete.set(null);
  }

  confirmDeleteCancha(): void {
    const cancha = this.canchaToDelete();
    if (!cancha || !cancha.id) return;

    this.api.deleteCancha(cancha.id).subscribe({
      next: () => {
        this.showToast(`Cancha "${cancha.nombre}" desactivada exitosamente.`);
        this.closeDeleteCanchaModal();
        this.loadCanchas();
        this.loadDisponibilidad();
      },
      error: () => {
        this.showToast('Error al desactivar cancha');
      }
    });
  }

  private showToast(msg: string, isError: boolean = false): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}

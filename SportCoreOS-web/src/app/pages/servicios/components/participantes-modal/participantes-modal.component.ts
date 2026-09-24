import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicioEspecializado } from '../../servicios.component';
import { EstadoPago, TipoPlanServicio } from '../../../../core/enums/domain.enums';

@Component({
  selector: 'app-participantes-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './participantes-modal.component.html'
})
export class ParticipantesModalComponent {
  readonly EstadoPago = EstadoPago;
  readonly TipoPlanServicio = TipoPlanServicio;

  @Input() visible = false;
  @Input() servicio: ServicioEspecializado | null = null;
  @Input() inscripcionesList: any[] = [];
  @Input() isApproving = false;

  @Output() close = new EventEmitter<void>();
  @Output() aprobar = new EventEmitter<string>();
  @Output() rechazar = new EventEmitter<any>();
  @Output() verComprobante = new EventEmitter<any>();

  filtroEstadoInscripciones = signal<EstadoPago | string>(EstadoPago.TODOS);

  pendientesCount = computed(() => {
    return this.inscripcionesList.filter(i => i.estado_pago === EstadoPago.PENDIENTE_APROBACION).length;
  });

  filteredList = computed(() => {
    const filtro = this.filtroEstadoInscripciones();
    if (filtro === EstadoPago.TODOS) return this.inscripcionesList;
    return this.inscripcionesList.filter(i => (i.estado_pago || EstadoPago.APROBADO) === filtro);
  });

  formatNumber(val: any): string {
    if (!val) return '0';
    return Number(val).toLocaleString('es-CO');
  }

  cerrar() {
    this.filtroEstadoInscripciones.set(EstadoPago.TODOS);
    this.close.emit();
  }
}

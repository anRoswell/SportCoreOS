import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface PartidoData {
  id?: string;
  rival_nombre?: string;
  categoria_nombre?: string;
  fecha_partido?: string;
  hora_partido?: string;
  hora_citacion?: string;
  sede_cancha?: string;
  indumentaria_kit?: string;
  marcador_local?: number | null;
  marcador_visitante?: number | null;
  estado?: string;
  goles?: number;
  asistencias?: number;
  minutos_jugados?: number;
  calificacion_dt?: number;
}

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './match-card.component.html',
  styleUrls: ['./match-card.component.scss']
})
export class MatchCardComponent {
  @Input({ required: true }) match!: PartidoData;
  @Input() mode: 'standard' | 'live-hero' | 'callout' = 'standard';
  @Input() clubName: string = 'Academia SportCore FC';
  @Input() clubSigla: string = 'SFC';
  @Input() convocatoriaEstado: 'PENDIENTE' | 'CONFIRMADO' | 'EXCUSADO' = 'PENDIENTE';

  @Output() confirmAttendance = new EventEmitter<void>();
  @Output() excuseAttendance = new EventEmitter<void>();

  openGps(sede?: string) {
    if (!sede) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sede)}`;
    window.open(url, '_blank');
  }

  onConfirm() {
    this.confirmAttendance.emit();
  }

  onExcuse() {
    this.excuseAttendance.emit();
  }
}

import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export interface PartidoModel {
  id: string;
  categoria_id?: string;
  categoria_nombre?: string;
  rival_nombre: string;
  fecha_partido: string;
  hora_partido: string;
  hora_citacion?: string;
  sede_cancha: string;
  condicion_juego?: 'LOCAL' | 'VISITANTE' | string;
  indumentaria_kit?: string;
  goles_club?: number | null;
  goles_rival?: number | null;
  estado_partido?: 'PROGRAMADO' | 'FINALIZADO' | 'EN_VIVO' | 'CANCELADO' | string;
  rival_logo?: string;
}

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.scss'
})
export class MatchCardComponent {
  auth = inject(AuthService);

  @Input({ required: true }) match!: PartidoModel | any;
  @Input() mode: 'standard' | 'live-hero' | 'callout' | 'compact' = 'standard';
  @Input() convocatoriaEstado?: 'CONFIRMADO' | 'PENDIENTE' | 'EXCUSADO' | string;
  @Input() showActions: boolean = true;

  @Output() gpsClick = new EventEmitter<string>();
  @Output() convocatoriaClick = new EventEmitter<PartidoModel>();
  @Output() confirmAsistencia = new EventEmitter<PartidoModel>();
  @Output() excusarAsistencia = new EventEmitter<PartidoModel>();

  onOpenGps(event: Event): void {
    event.stopPropagation();
    if (this.match?.sede_cancha) {
      this.gpsClick.emit(this.match.sede_cancha);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.match.sede_cancha)}`;
      window.open(url, '_blank');
    }
  }

  onConvocatoria(event: Event): void {
    event.stopPropagation();
    this.convocatoriaClick.emit(this.match);
  }

  onConfirm(event: Event): void {
    event.stopPropagation();
    this.confirmAsistencia.emit(this.match);
  }

  onExcusar(event: Event): void {
    event.stopPropagation();
    this.excusarAsistencia.emit(this.match);
  }
}

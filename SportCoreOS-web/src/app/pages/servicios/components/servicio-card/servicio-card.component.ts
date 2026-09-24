import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicioEspecializado } from '../../servicios.component';
import { CategoriaServicio } from '../../../../core/enums/domain.enums';

@Component({
  selector: 'app-servicio-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servicio-card.component.html'
})
export class ServicioCardComponent {
  @Input({ required: true }) servicio!: ServicioEspecializado;
  @Input() defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face';

  @Output() inscribir = new EventEmitter<ServicioEspecializado>();
  @Output() verParticipantes = new EventEmitter<ServicioEspecializado>();

  formatNumber(val: any): string {
    if (!val) return '0';
    return Number(val).toLocaleString('es-CO');
  }

  getCategoriaLabel(cat: string): string {
    switch (cat) {
      case CategoriaServicio.VELOCIDAD_EXPLOSIVIDAD: return '⚡ Velocidad & Sprint';
      case CategoriaServicio.COORDINACION_AGILIDAD: return '🧠 Neuro-Motricidad';
      case CategoriaServicio.TECNICA_REGATE: return '🪄 Regate 1v1 Pro';
      case CategoriaServicio.ARQUEROS_ELITE: return '🧤 Guante de Oro';
      case CategoriaServicio.DEFINICION_TIRO: return '🎯 Definición & Gol';
      case CategoriaServicio.PREVENCION_FISICA: return '🛡️ Fuerza & Prevención';
      default: return 'Clínica Pro';
    }
  }
}

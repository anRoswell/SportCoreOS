import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlumnoRankItem } from '../../ranking-gamificado.component';
import { FutPlayerCardComponent } from '../../../../shared/components/fut-player-card/fut-player-card.component';

@Component({
  selector: 'app-ranking-fut-drawer',
  standalone: true,
  imports: [CommonModule, FutPlayerCardComponent],
  templateUrl: './ranking-fut-drawer.component.html'
})
export class RankingFutDrawerComponent {
  @Input() alumno: AlumnoRankItem | null = null;
  @Output() close = new EventEmitter<void>();
}

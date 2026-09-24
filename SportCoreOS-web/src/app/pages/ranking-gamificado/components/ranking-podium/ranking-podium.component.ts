import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlumnoRankItem } from '../../ranking-gamificado.component';

@Component({
  selector: 'app-ranking-podium',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking-podium.component.html'
})
export class RankingPodiumComponent {
  @Input({ required: true }) top3: AlumnoRankItem[] = [];
  @Input() categoriaNombre = '';

  @Output() seleccionarAlumno = new EventEmitter<AlumnoRankItem>();
}

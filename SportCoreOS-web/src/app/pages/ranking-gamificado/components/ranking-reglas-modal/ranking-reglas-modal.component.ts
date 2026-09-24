import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { REGLAS_ECONOMIA_XP, ReglaEconomiaXP } from '../../data/ranking-reglas.data';

@Component({
  selector: 'app-ranking-reglas-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking-reglas-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingReglasModalComponent {
  readonly close = output<void>();
  readonly reglas: ReglaEconomiaXP[] = REGLAS_ECONOMIA_XP;
}

import { Component, ChangeDetectionStrategy, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ranking-reglas-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ranking-reglas-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingReglasModalComponent {
  readonly close = output<void>();
}

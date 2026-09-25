import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scouting-kpis',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scouting-kpis.component.html',
  styleUrls: ['./scouting-kpis.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoutingKpisComponent {
  @Input({ required: true }) totalProspectos: number = 0;
  @Input({ required: true }) countInteres: number = 0;
  @Input({ required: true }) ratioInteres: number = 0;
  @Input({ required: true }) countFichados: number = 0;
  @Input({ required: true }) ratioFichados: number = 0;
  @Input({ required: true }) globalTechnicalAvg: string = '8.5';
  @Input({ required: true }) averageRatingPercent: number = 85;
}

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LandingStats {
  total: number;
  publicadas: number;
  vistasTotales: number;
  leadsTotales: number;
  conversionPromedio: number;
}

@Component({
  selector: 'app-landing-kpi-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-kpi-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingKpiBarComponent {
  @Input({ required: true }) stats: LandingStats = {
    total: 0,
    publicadas: 0,
    vistasTotales: 0,
    leadsTotales: 0,
    conversionPromedio: 0,
  };
}

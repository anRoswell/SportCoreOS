import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-biometria-kpi-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './biometria-kpi-bar.component.html',
  styleUrl: './biometria-kpi-bar.component.scss',
})
export class BiometriaKpiBarComponent {
  @Input() totalEvaluaciones: number = 0;
  @Input() atletasMonitoreados: number = 0;
  @Input() promedioImc: string = '0.0';
  @Input() sobresalientesCount: number = 0;
}

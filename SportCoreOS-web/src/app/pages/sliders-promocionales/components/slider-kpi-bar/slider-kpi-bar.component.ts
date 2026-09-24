import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slider-kpi-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider-kpi-bar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderKpiBarComponent {
  @Input() totalSliders = 0;
  @Input() activeSlidersCount = 0;
  @Input() mobileSlidersCount = 0;
  @Input() inactiveSlidersCount = 0;
}

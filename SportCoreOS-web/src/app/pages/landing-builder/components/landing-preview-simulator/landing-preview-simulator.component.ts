import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingDevicePreview, LandingThemeMode } from '../../../../core/enums/domain.enums';

@Component({
  selector: 'app-landing-preview-simulator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-preview-simulator.component.html',
})
export class LandingPreviewSimulatorComponent {
  @Input({ required: true }) currentForm: any = null;
  @Input() previewDevice: LandingDevicePreview = LandingDevicePreview.DESKTOP;

  readonly LandingDevicePreview = LandingDevicePreview;
  readonly LandingThemeMode = LandingThemeMode;

  getHeroBackground(sec: any): string {
    const bgImg = sec?.datos?.['imagen_fondo'] || sec?.datos?.['poster_url'];
    const gradient = this.currentForm?.tema_gradient || 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
    if (bgImg) {
      return `linear-gradient(180deg, rgba(7, 11, 20, 0.72) 0%, rgba(7, 11, 20, 0.88) 100%), url('${bgImg}') center/cover no-repeat`;
    }
    return gradient;
  }
}

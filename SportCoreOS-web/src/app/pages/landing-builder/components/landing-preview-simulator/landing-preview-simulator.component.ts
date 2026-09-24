import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingDevicePreview, LandingThemeMode } from '../../../../core/enums/domain.enums';

@Component({
  selector: 'app-landing-preview-simulator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-preview-simulator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPreviewSimulatorComponent {
  @Input({ required: true }) currentForm: any = null;
  @Input() previewDevice: LandingDevicePreview = LandingDevicePreview.DESKTOP;

  readonly LandingDevicePreview = LandingDevicePreview;
  readonly LandingThemeMode = LandingThemeMode;
}

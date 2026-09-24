import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingPage } from '../../../../core/services/api.service';

@Component({
  selector: 'app-landing-delete-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-delete-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingDeleteDialogComponent {
  @Input({ required: true }) item: LandingPage | null = null;

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}

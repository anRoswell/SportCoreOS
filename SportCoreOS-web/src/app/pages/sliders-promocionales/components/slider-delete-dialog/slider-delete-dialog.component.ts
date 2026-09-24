import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderPromocional } from '../../../../core/services/api.service';

@Component({
  selector: 'app-slider-delete-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider-delete-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderDeleteDialogComponent {
  @Input({ required: true }) item: SliderPromocional | null = null;

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}

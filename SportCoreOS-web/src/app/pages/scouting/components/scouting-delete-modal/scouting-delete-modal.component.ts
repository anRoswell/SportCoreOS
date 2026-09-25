import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProspectoItem, formatPosicionScouting } from '../../data/scouting.constants';

@Component({
  selector: 'app-scouting-delete-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scouting-delete-modal.component.html',
  styleUrls: ['./scouting-delete-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoutingDeleteModalComponent {
  @Input({ required: true }) prospecto: ProspectoItem | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<ProspectoItem>();

  formatPosicion(pos: string | undefined): string {
    return formatPosicionScouting(pos);
  }

  onConfirm(): void {
    if (this.prospecto) {
      this.confirm.emit(this.prospecto);
    }
  }
}

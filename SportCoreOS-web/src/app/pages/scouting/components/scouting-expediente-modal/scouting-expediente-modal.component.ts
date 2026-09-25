import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProspectoItem, ScoutingEstadoPipeline, formatPosicionScouting } from '../../data/scouting.constants';

@Component({
  selector: 'app-scouting-expediente-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scouting-expediente-modal.component.html',
  styleUrls: ['./scouting-expediente-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoutingExpedienteModalComponent {
  readonly ScoutingEstadoPipeline = ScoutingEstadoPipeline;

  @Input({ required: true }) prospecto: ProspectoItem | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() addRubrica = new EventEmitter<ProspectoItem>();
  @Output() changeStatus = new EventEmitter<{ prospecto: ProspectoItem; estado: string }>();

  formatPosicion(pos: string | undefined): string {
    return formatPosicionScouting(pos);
  }

  onAddRubrica(): void {
    if (this.prospecto) {
      this.addRubrica.emit(this.prospecto);
    }
  }

  onChangeStatus(estado: string): void {
    if (this.prospecto) {
      this.changeStatus.emit({ prospecto: this.prospecto, estado });
    }
  }
}

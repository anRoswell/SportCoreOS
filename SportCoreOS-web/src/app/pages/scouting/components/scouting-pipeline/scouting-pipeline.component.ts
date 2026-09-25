import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProspectoItem, ScoutingEstadoPipeline, formatPosicionScouting } from '../../data/scouting.constants';

@Component({
  selector: 'app-scouting-pipeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scouting-pipeline.component.html',
  styleUrls: ['./scouting-pipeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoutingPipelineComponent {
  readonly ScoutingEstadoPipeline = ScoutingEstadoPipeline;

  @Input({ required: true }) prospectos: ProspectoItem[] = [];

  @Output() viewExpediente = new EventEmitter<ProspectoItem>();
  @Output() evaluate = new EventEmitter<ProspectoItem>();
  @Output() changeStatus = new EventEmitter<{ prospecto: ProspectoItem; estado: string }>();

  formatPosicion(pos: string | undefined): string {
    return formatPosicionScouting(pos);
  }

  getByEstado(estado: string): ProspectoItem[] {
    return this.prospectos.filter(p => p.estado_pipeline === estado);
  }

  onCardClick(p: ProspectoItem): void {
    this.viewExpediente.emit(p);
  }

  onEval(p: ProspectoItem, event: Event): void {
    event.stopPropagation();
    this.evaluate.emit(p);
  }

  onAdvance(p: ProspectoItem, nextEstado: string, event: Event): void {
    event.stopPropagation();
    this.changeStatus.emit({ prospecto: p, estado: nextEstado });
  }
}

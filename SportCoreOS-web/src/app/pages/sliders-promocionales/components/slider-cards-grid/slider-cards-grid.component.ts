import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderPromocional } from '../../../../core/services/api.service';
import { SliderPlataforma, SliderEstadoFiltro } from '../../../../core/enums/domain.enums';

@Component({
  selector: 'app-slider-cards-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './slider-cards-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderCardsGridComponent {
  @Input({ required: true }) sliders: SliderPromocional[] = [];
  @Input({ required: true }) totalCount = 0;
  @Input({ required: true }) activeCount = 0;
  @Input({ required: true }) inactiveCount = 0;
  @Input({ required: true }) loading = false;
  @Input({ required: true }) searchQuery = '';
  @Input({ required: true }) filterPlatform: SliderPlataforma = SliderPlataforma.TODAS;
  @Input({ required: true }) filterStatus: SliderEstadoFiltro = SliderEstadoFiltro.TODOS;

  @Output() searchChange = new EventEmitter<string>();
  @Output() platformChange = new EventEmitter<SliderPlataforma>();
  @Output() statusChange = new EventEmitter<SliderEstadoFiltro>();
  @Output() openCreate = new EventEmitter<void>();
  @Output() edit = new EventEmitter<SliderPromocional>();
  @Output() duplicate = new EventEmitter<SliderPromocional>();
  @Output() delete = new EventEmitter<SliderPromocional>();
  @Output() toggleActivo = new EventEmitter<SliderPromocional>();
  @Output() moveOrder = new EventEmitter<{ slider: SliderPromocional; direction: 'UP' | 'DOWN' }>();

  readonly PlatformEnum = SliderPlataforma;
  readonly StatusEnum = SliderEstadoFiltro;
}

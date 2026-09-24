import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  BIOMETRIA_DIAGNOSTICO_OPTIONS,
  BIOMETRIA_SORT_OPTIONS,
} from '../../data/biometria.constants';
import {
  BiometriaCategoriaFiltro,
  BiometriaDiagnosticoFiltro,
  BiometriaSortBy,
} from '../../../../core/enums/domain.enums';

@Component({
  selector: 'app-biometria-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './biometria-filters.component.html',
  styleUrl: './biometria-filters.component.scss',
})
export class BiometriaFiltersComponent {
  readonly BiometriaCategoriaFiltro = BiometriaCategoriaFiltro;

  @Input() searchQuery: string = '';
  @Input() selectedCategoriaId: string = BiometriaCategoriaFiltro.TODAS;
  @Input() selectedDiagnostico: string = BiometriaDiagnosticoFiltro.TODOS;
  @Input() sortBy: string = BiometriaSortBy.FECHA_DESC;

  @Input() totalRecords: number = 0;
  @Input() categorias: any[] = [];
  @Input() hasActiveFilters: boolean = false;
  @Input() categoryCounts: { [key: string]: number } = {};

  @Output() searchChange = new EventEmitter<string>();
  @Output() categoriaChange = new EventEmitter<string>();
  @Output() diagnosticoChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() resetFilters = new EventEmitter<void>();

  readonly diagnosticoOptions = BIOMETRIA_DIAGNOSTICO_OPTIONS;
  readonly sortOptions = BIOMETRIA_SORT_OPTIONS;

  onSearchInput(val: string): void {
    this.searchChange.emit(val);
  }

  clearSearch(): void {
    this.searchChange.emit('');
  }

  onSelectCategoria(catId: string): void {
    this.categoriaChange.emit(catId);
  }

  onDiagnosticoSelect(diag: string): void {
    this.diagnosticoChange.emit(diag);
  }

  onSortSelect(sort: string): void {
    this.sortChange.emit(sort);
  }

  onReset(): void {
    this.resetFilters.emit();
  }

  getCategoryCount(catId: string): number {
    return this.categoryCounts[catId] || 0;
  }
}

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AlumnoRankItem } from '../../ranking-gamificado.component';
import { PaginationBarComponent } from '../../../../shared/components/pagination-bar/pagination-bar.component';
import {
  SortOrder,
  TierRank,
  RankingFiltroPosicion,
  RankingFiltroCategoria,
} from '../../../../core/enums/domain.enums';

@Component({
  selector: 'app-ranking-table',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationBarComponent],
  templateUrl: './ranking-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingTableComponent {
  readonly TierRank = TierRank;
  readonly RankingFiltroPosicion = RankingFiltroPosicion;
  readonly RankingFiltroCategoria = RankingFiltroCategoria;

  @Input({ required: true }) alumnos: AlumnoRankItem[] = [];
  @Input() categorias: { id: string; nombre: string; color: string }[] = [];
  @Input() categoriaSeleccionada: string = RankingFiltroCategoria.TODAS;
  @Input() tierSeleccionado: string = TierRank.TODOS;
  @Input() posicionSeleccionada: string = RankingFiltroPosicion.TODAS;
  @Input() busquedaTexto = '';
  @Input() sortColumn = 'posicionRanking';
  @Input() sortDirection: SortOrder = SortOrder.ASC;
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalFilteredCount = 0;
  @Input() pageSize = 8;
  @Input() isLoading = false;

  @Output() categoriaChange = new EventEmitter<string>();
  @Output() tierChange = new EventEmitter<string>();
  @Output() posicionChange = new EventEmitter<string>();
  @Output() busquedaChange = new EventEmitter<string>();
  @Output() resetFilters = new EventEmitter<void>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() seleccionarAlumno = new EventEmitter<AlumnoRankItem>();

  getSortIcon(col: string): string {
    if (this.sortColumn !== col) return 'fa-sort text-slate';
    return this.sortDirection === SortOrder.ASC ? 'fa-sort-up text-emerald' : 'fa-sort-down text-emerald';
  }

  getTrendTitle(a: AlumnoRankItem): string {
    if (a.posicionAnterior > a.posicionRanking) {
      return `Subió ${a.posicionAnterior - a.posicionRanking} puestos respecto a la semana pasada`;
    } else if (a.posicionAnterior < a.posicionRanking) {
      return `Bajó ${a.posicionRanking - a.posicionAnterior} puestos`;
    }
    return 'Mantiene su posición';
  }

  hasActiveFilters(): boolean {
    return this.categoriaSeleccionada !== RankingFiltroCategoria.TODAS ||
      this.tierSeleccionado !== TierRank.TODOS ||
      this.posicionSeleccionada !== RankingFiltroPosicion.TODAS ||
      this.busquedaTexto.trim() !== '';
  }
}

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TIENDA_CATEGORIAS_OPTIONS, formatCategoriaTienda } from '../../data/tienda.constants';
import { TiendaCategoriaProducto } from '../../../../core/enums/domain.enums';
import { ProductoTienda } from '../../../../core/models/tienda.model';

@Component({
  selector: 'app-tienda-catalogo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tienda-catalogo.component.html',
  styleUrl: './tienda-catalogo.component.scss',
})
export class TiendaCatalogoComponent {
  @Input({ required: true }) catalogoList: ProductoTienda[] = [];
  @Input() loading: boolean = false;
  @Input() selectedCatFilter: string = TiendaCategoriaProducto.TODAS;
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalRecords: number = 0;
  @Input() pageSize: number = 8;
  @Input() showingStart: number = 0;
  @Input() showingEnd: number = 0;

  @Output() catFilterChange = new EventEmitter<string>();
  @Output() buy = new EventEmitter<ProductoTienda>();
  @Output() edit = new EventEmitter<ProductoTienda>();
  @Output() delete = new EventEmitter<ProductoTienda>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  readonly categories = TIENDA_CATEGORIAS_OPTIONS;

  formatCategoria(cat: string): string {
    return formatCategoriaTienda(cat);
  }

  setPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) {
      this.pageChange.emit(p);
    }
  }

  onPageSizeChange(size: any): void {
    this.pageSizeChange.emit(Number(size));
  }

  getVisiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(1, current - 2);
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages: number[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}

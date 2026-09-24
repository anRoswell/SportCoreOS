import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tienda-stock',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tienda-stock.component.html',
  styleUrl: './tienda-stock.component.scss',
})
export class TiendaStockComponent {
  @Input({ required: true }) catalogoList: any[] = [];
  @Input() loading: boolean = false;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalRecords: number = 0;
  @Input() totalPages: number = 1;
  @Input() showingStart: number = 0;
  @Input() showingEnd: number = 0;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() ajustarStock = new EventEmitter<{ variante: any; delta: number }>();

  setPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) {
      this.pageChange.emit(p);
    }
  }

  setPageSize(size: any): void {
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

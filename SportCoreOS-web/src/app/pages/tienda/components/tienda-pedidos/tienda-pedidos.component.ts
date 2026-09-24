import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadoDespachoPedido } from '../../../../core/enums/domain.enums';

@Component({
  selector: 'app-tienda-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tienda-pedidos.component.html',
  styleUrl: './tienda-pedidos.component.scss',
})
export class TiendaPedidosComponent {
  readonly EstadoDespachoPedido = EstadoDespachoPedido;

  @Input({ required: true }) pedidosList: any[] = [];
  @Input() loading: boolean = false;
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalRecords: number = 0;
  @Input() pageSize: number = 10;
  @Input() showingStart: number = 0;
  @Input() showingEnd: number = 0;

  @Output() despachar = new EventEmitter<any>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

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

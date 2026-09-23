import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="pagination-bar" *ngIf="totalRecords > 0 || !loading">
      <div class="page-meta">
        Mostrando <strong>{{ ((currentPage - 1) * pageSize) + 1 }}</strong> - 
        <strong>{{ Math.min(currentPage * pageSize, totalRecords) }}</strong> de 
        <strong>{{ totalRecords }}</strong> registros
        <span class="total-badge">• Página {{ currentPage }} de {{ totalPages || 1 }}</span>
      </div>

      <div class="pagination-controls">
        <div class="page-size-selector" *ngIf="showPageSizeSelector">
          <label>Filas:</label>
          <select [ngModel]="pageSize" (ngModelChange)="onPageSizeChange($event)" class="select-page-size">
            <option *ngFor="let size of pageSizeOptions" [value]="size">{{ size }}</option>
          </select>
        </div>

        <button 
          class="btn-page" 
          [disabled]="currentPage <= 1 || loading" 
          (click)="changePage(1)" 
          title="Primera Página">
          <i class="fa-solid fa-angles-left"></i>
        </button>

        <button 
          class="btn-page" 
          [disabled]="currentPage <= 1 || loading" 
          (click)="changePage(currentPage - 1)" 
          title="Página Anterior">
          <i class="fa-solid fa-chevron-left"></i>
        </button>

        <span class="current-indicator">
          <strong>{{ currentPage }}</strong> / {{ totalPages || 1 }}
        </span>

        <button 
          class="btn-page" 
          [disabled]="currentPage >= totalPages || loading" 
          (click)="changePage(currentPage + 1)" 
          title="Página Siguiente">
          <i class="fa-solid fa-chevron-right"></i>
        </button>

        <button 
          class="btn-page" 
          [disabled]="currentPage >= totalPages || loading" 
          (click)="changePage(totalPages)" 
          title="Última Página">
          <i class="fa-solid fa-angles-right"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      border-radius: 0 0 16px 16px;
      font-size: 0.875rem;
      color: #64748b;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .page-meta {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .page-meta strong {
      color: #0f172a;
      font-weight: 700;
    }

    .total-badge {
      color: #94a3b8;
      font-size: 0.8rem;
      margin-left: 0.25rem;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .page-size-selector {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      margin-right: 0.5rem;
      font-size: 0.8rem;
      color: #64748b;
    }

    .select-page-size {
      padding: 0.3rem 0.6rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-weight: 600;
      color: #1e293b;
      background-color: #f8fafc;
      cursor: pointer;
      outline: none;
      transition: all 0.2s;
    }

    .select-page-size:focus {
      border-color: #10b981;
      box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
    }

    .btn-page {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: #334155;
      cursor: pointer;
      font-size: 0.8rem;
      transition: all 0.15s ease-in-out;
    }

    .btn-page:hover:not(:disabled) {
      background: #f1f5f9;
      color: #059669;
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }

    .btn-page:disabled {
      opacity: 0.4;
      cursor: not-allowed;
      border-color: #f1f5f9;
      background: #f8fafc;
    }

    .current-indicator {
      padding: 0.35rem 0.75rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.82rem;
      color: #64748b;
    }

    .current-indicator strong {
      color: #059669;
      font-weight: 800;
    }

    @media (max-width: 640px) {
      .pagination-bar {
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }
    }
  `]
})
export class PaginationBarComponent {
  @Input() currentPage: number = 1;
  @Input() totalPages: number = 1;
  @Input() totalRecords: number = 0;
  @Input() pageSize: number = 10;
  @Input() loading: boolean = false;
  @Input() showPageSizeSelector: boolean = true;
  @Input() pageSizeOptions: number[] = [10, 25, 50, 100];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  Math = Math;

  changePage(newPage: number) {
    if (newPage >= 1 && newPage <= (this.totalPages || 1) && newPage !== this.currentPage && !this.loading) {
      this.pageChange.emit(newPage);
    }
  }

  onPageSizeChange(newSize: any) {
    const size = Number(newSize);
    if (!isNaN(size) && size > 0) {
      this.pageSizeChange.emit(size);
    }
  }
}

import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProspectoItem, formatPosicionScouting, formatEstadoPipelineScouting, ScoutingEstadoPipeline } from '../../data/scouting.constants';

@Component({
  selector: 'app-scouting-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scouting-table.component.html',
  styleUrls: ['./scouting-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoutingTableComponent {
  readonly ScoutingEstadoPipeline = ScoutingEstadoPipeline;

  @Input({ required: true }) prospectos: ProspectoItem[] = [];
  @Input() loading: boolean = false;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() totalRecords: number = 0;
  @Input() totalPages: number = 1;
  @Input() showingStart: number = 0;
  @Input() showingEnd: number = 0;

  @Output() viewExpediente = new EventEmitter<ProspectoItem>();
  @Output() evaluate = new EventEmitter<ProspectoItem>();
  @Output() deleteProspecto = new EventEmitter<ProspectoItem>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  formatPosicion(pos: string | undefined): string {
    return formatPosicionScouting(pos);
  }

  formatEstadoPipeline(estado: string | undefined): string {
    return formatEstadoPipelineScouting(estado);
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

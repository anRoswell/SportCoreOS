import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  EvaluacionBiometrica,
  obtenerClaseImc,
  obtenerEtiquetaImc,
  calcularDiagnosticoBiometrico,
} from '../../data/biometria.helpers';
import { BIOMETRIA_PAGE_SIZE_OPTIONS } from '../../data/biometria.constants';

@Component({
  selector: 'app-biometria-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './biometria-table.component.html',
  styleUrl: './biometria-table.component.scss',
})
export class BiometriaTableComponent {
  @Input({ required: true }) mediciones: EvaluacionBiometrica[] = [];
  @Input() loading: boolean = false;
  @Input() hasActiveFilters: boolean = false;
  @Input() totalRecords: number = 0;
  @Input() totalPages: number = 1;
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() showingStart: number = 0;
  @Input() showingEnd: number = 0;

  @Output() viewDetail = new EventEmitter<EvaluacionBiometrica>();
  @Output() createNew = new EventEmitter<void>();
  @Output() resetFilters = new EventEmitter<void>();
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  readonly pageSizeOptions = BIOMETRIA_PAGE_SIZE_OPTIONS;

  getImcClass(imc: string | number | undefined): string {
    return obtenerClaseImc(imc);
  }

  getImcLabel(imc: string | number | undefined): string {
    return obtenerEtiquetaImc(imc);
  }

  getDiagnostico(m: EvaluacionBiometrica) {
    return calcularDiagnosticoBiometrico(m);
  }

  onRowClick(m: EvaluacionBiometrica): void {
    this.viewDetail.emit(m);
  }

  setPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) {
      this.pageChange.emit(p);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  onPageSizeChange(size: any): void {
    this.pageSizeChange.emit(Number(size));
  }

  getVisiblePages(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const range: number[] = [];

    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      range.push(i);
    }
    return range;
  }
}

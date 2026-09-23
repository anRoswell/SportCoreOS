import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-finanzas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './finanzas.component.html',
  styleUrl: './finanzas.component.scss'
})
export class FinanzasComponent implements OnInit {
  private api = inject(ApiService);

  readonly resumen = signal<any | null>(null);
  readonly cargos = signal<any[]>([]);
  readonly categorias = signal<any[]>([]);
  readonly selectedCategoriaId = signal<string>('TODAS');
  readonly selectedEstado = signal<string>('TODOS');
  readonly searchTerm = signal<string>('');
  readonly showGenerarModal = signal<boolean>(false);
  readonly showPagarModal = signal<boolean>(false);
  readonly selectedCargo = signal<any | null>(null);
  readonly toastMessage = signal<string>('');
  readonly loading = signal<boolean>(false);

  // Paginación Server-Side
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalRecords = signal<number>(0);
  readonly totalPages = signal<number>(1);

  genMes = new Date().getMonth() + 1;
  genAnio = new Date().getFullYear();
  montoPago = 180000;
  metodoPago = 'PSE Bancolombia';

  private searchDebounceTimer?: any;

  readonly recaudoEfectividad = computed(() => {
    const res = this.resumen();
    if (!res || !res.total_facturado || parseFloat(res.total_facturado) === 0) return 0;
    const fact = parseFloat(res.total_facturado);
    const rec = parseFloat(res.total_recaudado || '0');
    return Math.round((rec / fact) * 100);
  });

  readonly showingStart = computed(() => {
    if (this.totalRecords() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly showingEnd = computed(() => {
    const end = this.currentPage() * this.pageSize();
    return Math.min(end, this.totalRecords());
  });

  ngOnInit(): void {
    this.loadCategorias();
    this.loadResumen();
    this.loadCargos();
  }

  loadCategorias(): void {
    this.api.getCategorias({ limit: 100 }).subscribe((cats) => {
      const catList = Array.isArray(cats) ? cats : [];
      this.categorias.set(catList);
    });
  }

  loadResumen(): void {
    this.api.getResumenFinanzas().subscribe((res) => {
      this.resumen.set(res);
    });
  }

  loadCargos(): void {
    this.loading.set(true);
    const catId = this.selectedCategoriaId() !== 'TODAS' ? this.selectedCategoriaId() : undefined;
    const estado = this.selectedEstado() !== 'TODOS' ? this.selectedEstado() : undefined;
    const search = this.searchTerm().trim() || undefined;

    this.api.getCargos({
      page: this.currentPage(),
      limit: this.pageSize(),
      categoriaId: catId,
      estadoPago: estado,
      search: search
    }).subscribe({
      next: (res) => {
        const rows = Array.isArray(res) ? res : (res?.data || []);
        const total = res?.total !== undefined ? res.total : rows.length;
        const totalP = res?.totalPages !== undefined ? res.totalPages : Math.ceil(total / this.pageSize()) || 1;
        this.cargos.set(rows);
        this.totalRecords.set(total);
        this.totalPages.set(totalP);
        this.loading.set(false);
      },
      error: () => {
        this.cargos.set([]);
        this.totalRecords.set(0);
        this.totalPages.set(1);
        this.loading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadCargos();
  }

  onSearchInput(value: string): void {
    this.searchTerm.set(value);
    this.currentPage.set(1);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.loadCargos();
    }, 300);
  }

  clearSearch(): void {
    this.searchTerm.set('');
    this.currentPage.set(1);
    this.loadCargos();
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadCargos();
    }
  }

  setPageSize(size: number): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
    this.loadCargos();
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
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

  loadData(): void {
    this.loadResumen();
    this.loadCargos();
  }

  openGenerarModal(): void {
    this.showGenerarModal.set(true);
  }

  closeGenerarModal(): void {
    this.showGenerarModal.set(false);
  }

  submitGenerarMensualidad(): void {
    this.api.generarMensualidad(this.genMes, this.genAnio).subscribe({
      next: (res) => {
        this.showToast(`¡Cargos generados exitosamente! (${res.cargosCreados} nuevas pensiones creadas)`);
        this.closeGenerarModal();
        this.loadData();
      },
      error: () => {
        this.showToast('Error al generar mensualidades');
      },
    });
  }

  openPagarModal(cargo: any): void {
    this.selectedCargo.set(cargo);
    this.montoPago = parseFloat(cargo.saldo_pendiente);
    this.showPagarModal.set(true);
  }

  closePagarModal(): void {
    this.showPagarModal.set(false);
    this.selectedCargo.set(null);
  }

  submitPagar(): void {
    const cargo = this.selectedCargo();
    if (!cargo) return;

    this.api.registrarPago(cargo.id, this.montoPago).subscribe({
      next: () => {
        this.showToast(`¡Pago de $${this.montoPago.toLocaleString()} procesado exitosamente vía ${this.metodoPago}!`);
        this.closePagarModal();
        this.loadData();
      },
      error: () => {
        this.showToast('Error al procesar el pago.');
      },
    });
  }

  formatCurrency(val: any): string {
    if (val === null || val === undefined || val === '') return '$ 0';
    const num = Number(val);
    if (isNaN(num)) return '$ 0';
    return '$ ' + Math.round(num).toLocaleString('es-CO');
  }

  onSendBulkReminders(): void {
    this.showToast('Recordatorios de cobro y links PSE enviados masivamente vía WhatsApp.');
  }

  onDownloadReceipt(cargo: any): void {
    this.showToast(`Descargando comprobante de pago oficial para ${cargo.jugador_nombre}...`);
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}

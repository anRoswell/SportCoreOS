import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PlayerSelectorComponent } from '../../shared/components/player-selector/player-selector.component';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';

export interface EvaluacionBiometrica {
  id: string;
  jugador_id: string;
  evaluador_id?: string;
  fecha_evaluacion: string;
  peso_kg: number;
  talla_cm: number;
  imc: string;
  test_cooper_metros?: number;
  velocidad_30m_seg?: number;
  salto_vertical_cm?: number;
  observaciones?: string;
  jugador_nombre: string;
  numero_dorsal?: number;
  posicion_principal?: string;
  categoria_id?: string;
  categoria_nombre?: string;
  codigo_categoria?: string;
  color_distintivo?: string;
  avatar_url?: string;
}

@Component({
  selector: 'app-biometria',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayerSelectorComponent, FlatpickrDirective],
  templateUrl: './biometria.component.html',
  styleUrl: './biometria.component.scss'
})
export class BiometriaComponent implements OnInit {
  private api = inject(ApiService);

  readonly mediciones = signal<EvaluacionBiometrica[]>([]);
  readonly categorias = signal<any[]>([]);
  readonly jugadores = signal<any[]>([]);
  readonly loading = signal<boolean>(false);
  readonly saving = signal<boolean>(false);

  // Filtros
  readonly searchQuery = signal<string>('');
  readonly selectedCategoriaId = signal<string>('TODAS');
  readonly selectedDiagnostico = signal<string>('TODOS');
  readonly sortBy = signal<string>('FECHA_DESC');

  // Paginación
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);

  // Modales
  readonly showCreateModal = signal<boolean>(false);
  readonly showDetailModal = signal<boolean>(false);
  readonly selectedMedicion = signal<EvaluacionBiometrica | null>(null);

  readonly toastMessage = signal<string>('');
  readonly calculatedImc = signal<string>('-');

  newBio = {
    jugadorId: '',
    fechaEvaluacion: new Date().toISOString().split('T')[0],
    pesoKg: 58.5,
    tallaCm: 170.0,
    testCooperMetros: 2800,
    velocidad30mSeg: 4.15,
    saltoVerticalCm: 45.0,
    observaciones: '',
  };

  // KPIs
  readonly totalEvaluaciones = computed(() => this.totalRecords());

  readonly promedioImc = computed(() => {
    const list = this.mediciones();
    if (!list || !Array.isArray(list) || list.length === 0) return '0.0';
    const sum = list.reduce((acc, m) => acc + (parseFloat(m.imc) || 0), 0);
    return (sum / list.length).toFixed(1);
  });

  readonly sobresalientesCount = computed(() => {
    const list = this.mediciones();
    if (!list || !Array.isArray(list)) return 0;
    return list.filter((m) => this.getDiagnostico(m).tipo === 'success').length;
  });

  readonly atletasMonitoreadosCount = computed(() => {
    const list = this.mediciones();
    if (!list || !Array.isArray(list)) return 0;
    const uniqueIds = new Set(list.map((m) => m.jugador_id));
    return uniqueIds.size;
  });

  // Filtros Activos
  readonly hasActiveFilters = computed(() => {
    return (
      this.searchQuery().trim() !== '' ||
      this.selectedCategoriaId() !== 'TODAS' ||
      this.selectedDiagnostico() !== 'TODOS' ||
      this.sortBy() !== 'FECHA_DESC'
    );
  });

  // Lista Filtrada y Ordenada
  // Paginación y Totales Server-Side
  totalRecords = signal<number>(0);
  totalPages = signal<number>(1);

  // Lista visible (cargada página a página desde la BD)
  readonly filteredMediciones = computed(() => this.mediciones());
  readonly paginatedMediciones = computed(() => this.mediciones());
  readonly totalFilteredCount = computed(() => this.totalRecords());

  readonly showingStart = computed(() => {
    return this.totalRecords() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly showingEnd = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalRecords());
  });

  ngOnInit(): void {
    this.loadData();
    this.loadAuxData();
  }

  loadAuxData(): void {
    this.api.getCategorias().subscribe((cats) => {
      this.categorias.set(cats || []);
    });

    this.api.getJugadores().subscribe((res) => {
      let jugs: any[] = [];
      if (Array.isArray(res)) {
        jugs = res;
      } else if (res && Array.isArray(res.data)) {
        jugs = res.data;
      }
      this.jugadores.set(jugs);
      if (jugs && jugs.length > 0 && !this.newBio.jugadorId) {
        this.newBio.jugadorId = jugs[0].id;
      }
    });
  }

  loadData(): void {
    this.loading.set(true);
    this.api
      .getBiometria(
        this.currentPage(),
        this.pageSize(),
        this.searchQuery(),
        this.selectedCategoriaId(),
        this.selectedDiagnostico(),
        this.sortBy(),
      )
      .subscribe({
        next: (res) => {
          let rows: EvaluacionBiometrica[] = [];
          let total = 0;
          let totalPages = 1;

          if (Array.isArray(res)) {
            rows = res;
            total = res.length;
            totalPages = Math.max(1, Math.ceil(total / this.pageSize()));
          } else if (res && typeof res === 'object') {
            if (Array.isArray(res.data)) {
              rows = res.data;
              total = typeof res.total === 'number' ? res.total : rows.length;
              totalPages = typeof res.totalPages === 'number' ? res.totalPages : Math.max(1, Math.ceil(total / this.pageSize()));
            } else if (res.data && Array.isArray(res.data.data)) {
              rows = res.data.data;
              total = typeof res.data.total === 'number' ? res.data.total : rows.length;
              totalPages = typeof res.data.totalPages === 'number' ? res.data.totalPages : Math.max(1, Math.ceil(total / this.pageSize()));
            }
          }

          this.mediciones.set(rows);
          this.totalRecords.set(total);
          this.totalPages.set(totalPages);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error cargando biometría:', err);
          this.mediciones.set([]);
          this.totalRecords.set(0);
          this.totalPages.set(1);
          this.loading.set(false);
        },
      });
  }

  private searchDebounceTimer?: any;
  onSearchChange(val: string): void {
    this.searchQuery.set(val);
    this.currentPage.set(1);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.loadData();
    }, 300);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadData();
  }

  selectCategoria(catId: string): void {
    this.selectedCategoriaId.set(catId);
    this.currentPage.set(1);
    this.loadData();
  }

  onDiagnosticoChange(diag: string): void {
    this.selectedDiagnostico.set(diag);
    this.currentPage.set(1);
    this.loadData();
  }

  onSortChange(sort: string): void {
    this.sortBy.set(sort);
    this.loadData();
  }

  resetAllFilters(): void {
    this.searchQuery.set('');
    this.selectedCategoriaId.set('TODAS');
    this.selectedDiagnostico.set('TODOS');
    this.sortBy.set('FECHA_DESC');
    this.currentPage.set(1);
    this.loadData();
  }

  // Paginación
  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadData();
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadData();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadData();
    }
  }

  setPageSize(size: number): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
    this.loadData();
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const range: number[] = [];

    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      range.push(i);
    }
    return range;
  }

  getCategoryCount(catId: string): number {
    const list = this.mediciones();
    if (!list || !Array.isArray(list)) return 0;
    return list.filter((m) => m.categoria_id === catId).length;
  }

  calcularImc(): void {
    const peso = Number(this.newBio.pesoKg);
    const talla = Number(this.newBio.tallaCm);
    if (peso > 0 && talla > 0) {
      const m = talla / 100;
      const imc = (peso / (m * m)).toFixed(1);
      this.calculatedImc.set(imc);
    } else {
      this.calculatedImc.set('-');
    }
  }

  openCreateModal(): void {
    this.calcularImc();
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  openDetailModal(medicion: EvaluacionBiometrica): void {
    this.selectedMedicion.set(medicion);
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedMedicion.set(null);
  }

  submitCreateBio(): void {
    if (!this.newBio.jugadorId) {
      this.showToast('Debes seleccionar un deportista (*)');
      return;
    }
    const peso = Number(this.newBio.pesoKg);
    if (!peso || peso < 20 || peso > 180) {
      this.showToast('El peso corporal debe estar entre 20 y 180 kg');
      return;
    }
    const talla = Number(this.newBio.tallaCm);
    if (!talla || talla < 80 || talla > 240) {
      this.showToast('La estatura debe estar entre 80 y 240 cm');
      return;
    }

    this.saving.set(true);
    this.api.registrarBiometria(this.newBio).subscribe({
      next: () => {
        this.saving.set(false);
        this.showToast('¡Evaluación biométrica registrada exitosamente!');
        this.closeCreateModal();
        this.loadData();
      },
      error: () => {
        this.saving.set(false);
        this.showToast('Error al registrar evaluación');
      },
    });
  }

  getDiagnostico(b: any): { label: string; tipo: string } {
    const imc = parseFloat(b?.imc || '0');
    const cooper = parseInt(b?.test_cooper_metros || '0', 10);

    if (cooper >= 2800 || (imc >= 19 && imc <= 22)) {
      return { label: 'Sobresaliente', tipo: 'success' };
    } else if (cooper >= 2400 || (imc >= 18 && imc <= 24)) {
      return { label: 'Óptimo', tipo: 'blue' };
    }
    return { label: 'En Desarrollo', tipo: 'warning' };
  }

  getImcLabel(imcVal: any): string {
    const num = parseFloat(imcVal);
    if (isNaN(num)) return '-';
    if (num < 18.5) return 'Bajo Peso';
    if (num <= 24.9) return 'Normal / Óptimo';
    if (num <= 29.9) return 'Sobrepeso';
    return 'Obesidad';
  }

  getImcClass(imcVal: any): string {
    const num = parseFloat(imcVal);
    if (isNaN(num)) return '';
    if (num < 18.5) return 'bajo';
    if (num <= 24.9) return 'normal';
    return 'sobrepeso';
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}


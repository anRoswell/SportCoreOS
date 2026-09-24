import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import {
  BiometriaCategoriaFiltro,
  BiometriaDiagnosticoFiltro,
  BiometriaSortBy,
  BiometriaDiagnosticoTipo,
} from '../../core/enums/domain.enums';
import {
  EvaluacionBiometrica,
  calcularDiagnosticoBiometrico,
} from './data/biometria.helpers';
import { BiometriaKpiBarComponent } from './components/biometria-kpi-bar/biometria-kpi-bar.component';
import { BiometriaFiltersComponent } from './components/biometria-filters/biometria-filters.component';
import { BiometriaTableComponent } from './components/biometria-table/biometria-table.component';
import { BiometriaDetailModalComponent } from './components/biometria-detail-modal/biometria-detail-modal.component';
import { BiometriaFormModalComponent, NewBiometriaForm } from './components/biometria-form-modal/biometria-form-modal.component';

@Component({
  selector: 'app-biometria',
  standalone: true,
  imports: [
    CommonModule,
    BiometriaKpiBarComponent,
    BiometriaFiltersComponent,
    BiometriaTableComponent,
    BiometriaDetailModalComponent,
    BiometriaFormModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './biometria.component.html',
  styleUrl: './biometria.component.scss',
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
  readonly selectedCategoriaId = signal<string>(BiometriaCategoriaFiltro.TODAS);
  readonly selectedDiagnostico = signal<string>(BiometriaDiagnosticoFiltro.TODOS);
  readonly sortBy = signal<string>(BiometriaSortBy.FECHA_DESC);

  // Paginación
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalRecords = signal<number>(0);
  readonly totalPages = signal<number>(1);

  // Modales
  readonly showCreateModal = signal<boolean>(false);
  readonly showDetailModal = signal<boolean>(false);
  readonly selectedMedicion = signal<EvaluacionBiometrica | null>(null);

  readonly toastMessage = signal<string>('');

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
    return list.filter((m) => calcularDiagnosticoBiometrico(m).tipo === BiometriaDiagnosticoTipo.SUCCESS).length;
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
      this.selectedCategoriaId() !== BiometriaCategoriaFiltro.TODAS ||
      this.selectedDiagnostico() !== BiometriaDiagnosticoFiltro.TODOS ||
      this.sortBy() !== BiometriaSortBy.FECHA_DESC
    );
  });


  readonly categoryCounts = computed(() => {
    const map: { [key: string]: number } = {};
    const list = this.mediciones();
    list.forEach((m) => {
      if (m.categoria_id) {
        map[m.categoria_id] = (map[m.categoria_id] || 0) + 1;
      }
    });
    return map;
  });

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
          } else if (res) {
            const rawData = res.data;
            if (Array.isArray(rawData)) {
              rows = rawData;
              total = Number(res.total) || rows.length;
              totalPages = Number(res.totalPages) || Math.max(1, Math.ceil(total / this.pageSize()));
            } else if (rawData && Array.isArray(rawData.data)) {
              rows = rawData.data;
              total = Number(rawData.total) || rows.length;
              totalPages = Number(rawData.totalPages) || Math.max(1, Math.ceil(total / this.pageSize()));
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
    this.selectedCategoriaId.set(BiometriaCategoriaFiltro.TODAS);
    this.selectedDiagnostico.set(BiometriaDiagnosticoFiltro.TODOS);
    this.sortBy.set(BiometriaSortBy.FECHA_DESC);
    this.currentPage.set(1);
    this.loadData();
  }


  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadData();
    }
  }

  setPageSize(size: number): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
    this.loadData();
  }

  openCreateModal(): void {
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

  submitCreateBio(formData: NewBiometriaForm): void {
    if (!formData.jugadorId) {
      this.showToast('Debes seleccionar un deportista (*)');
      return;
    }
    const peso = Number(formData.pesoKg);
    if (!peso || peso < 20 || peso > 180) {
      this.showToast('El peso corporal debe estar entre 20 y 180 kg');
      return;
    }
    const talla = Number(formData.tallaCm);
    if (!talla || talla < 80 || talla > 240) {
      this.showToast('La estatura debe estar entre 80 y 240 cm');
      return;
    }

    this.saving.set(true);
    this.api.registrarBiometria(formData).subscribe({
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

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}

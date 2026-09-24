import { Component, OnInit, inject, signal, computed, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, JugadorExpediente360 } from '../../core/services/api.service';
import { CatalogosService } from '../../core/services/catalogos.service';

// Subcomponentes modulares de Jugadores
import { JugadorCardComponent } from './components/jugador-card/jugador-card.component';
import { JugadorExpedienteModalComponent } from './components/jugador-expediente-modal/jugador-expediente-modal.component';
import { JugadorFormModalComponent } from './components/jugador-form-modal/jugador-form-modal.component';
import { JugadorBiometriaModalComponent } from './components/jugador-biometria-modal/jugador-biometria-modal.component';
import { JugadorDeleteDialogComponent } from './components/jugador-delete-dialog/jugador-delete-dialog.component';

@Component({
  selector: 'app-jugadores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    JugadorCardComponent,
    JugadorExpedienteModalComponent,
    JugadorFormModalComponent,
    JugadorBiometriaModalComponent,
    JugadorDeleteDialogComponent
  ],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './jugadores.component.html',
  styleUrl: './jugadores.component.scss'
})
export class JugadoresComponent implements OnInit {
  private api = inject(ApiService);
  private catalogos = inject(CatalogosService);

  // Catálogos dinámicos
  epsList = this.catalogos.epsList;
  tiposDocumento = this.catalogos.tiposDocumento;
  parentescos = this.catalogos.parentescos;
  piernasHabiles = this.catalogos.piernasHabiles;
  posiciones = this.catalogos.posiciones;

  // Signals
  jugadores = signal<any[]>([]);
  categorias = signal<any[]>([]);
  loading = signal<boolean>(true);
  toastMsg = signal<string>('');
  isToastError = signal<boolean>(false);

  // Filtros Avanzados
  selectedCategoriaId = signal<string>('TODAS');
  searchQuery = signal<string>('');
  selectedEstado = signal<string>('TODOS');
  selectedPosicion = signal<string>('TODAS');
  selectedGenero = signal<string>('TODOS');
  selectedSortBy = signal<string>('APELLIDO_ASC');

  // Modo de visualización (Tabla o Fichas 360°)
  viewMode = signal<'TABLE' | 'CARDS'>('TABLE');

  // Paginación Reactiva
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);
  totalRecords = signal<number>(0);
  totalPages = signal<number>(1);

  // Modales
  showExpedienteModal = signal<boolean>(false);
  selectedExpediente = signal<JugadorExpediente360 | null>(null);

  showCreateModal = signal<boolean>(false);
  showEditModal = signal<boolean>(false);
  selectedPlayerToEdit = signal<any | null>(null);

  showBiometriaModal = signal<boolean>(false);
  selectedPlayerForBio = signal<any | null>(null);

  showDeleteConfirmModal = signal<boolean>(false);
  selectedPlayerToDelete = signal<any | null>(null);

  savingAcudiente = signal<boolean>(false);

  // KPIs Computados
  totalJugadores = computed(() => this.totalRecords());
  activosCount = computed(() => {
    const list = this.jugadores();
    if (!list || !Array.isArray(list)) return 0;
    return list.filter(j => j.estado_matricula === 'ACTIVO').length;
  });
  lesionadosCount = computed(() => {
    const list = this.jugadores();
    if (!list || !Array.isArray(list)) return 0;
    return list.filter(j => j.estado_matricula === 'LESIONADO').length;
  });
  evaluadosCount = computed(() => {
    const list = this.jugadores();
    if (!list || !Array.isArray(list)) return 0;
    return list.filter(j => j.talla_cm && j.peso_kg).length;
  });

  hasActiveFilters = computed(() => {
    return this.searchQuery().trim() !== '' ||
      this.selectedCategoriaId() !== 'TODAS' ||
      this.selectedEstado() !== 'TODOS' ||
      this.selectedPosicion() !== 'TODAS' ||
      this.selectedGenero() !== 'TODOS';
  });

  getSelectedCategoryName = computed(() => {
    const catId = this.selectedCategoriaId();
    if (catId === 'TODAS') return 'Todas';
    const found = this.categorias().find(c => c.id === catId);
    return found ? found.nombre : 'Categoría';
  });

  jugadoresFiltrados = computed(() => this.jugadores());
  paginatedJugadores = computed(() => this.jugadores());
  totalFilteredCount = computed(() => this.totalRecords());

  showingStart = computed(() => {
    if (this.totalFilteredCount() === 0) return 0;
    const cur = Math.min(Math.max(1, this.currentPage()), this.totalPages());
    return (cur - 1) * this.pageSize() + 1;
  });

  showingEnd = computed(() => {
    const cur = Math.min(Math.max(1, this.currentPage()), this.totalPages());
    return Math.min(cur * this.pageSize(), this.totalFilteredCount());
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const cur = Math.min(Math.max(1, this.currentPage()), total);
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: number[] = [];
    pages.push(1);
    if (cur > 3) pages.push(-1);
    for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) {
      pages.push(p);
    }
    if (cur < total - 2) pages.push(-1);
    pages.push(total);
    return pages;
  });

  ngOnInit() {
    this.loadCategorias();
    this.loadJugadores();
  }

  loadCategorias() {
    this.api.getCategorias().subscribe(cats => {
      const rows = Array.isArray(cats) ? cats : ((cats as any)?.data || []);
      this.categorias.set(rows);
    });
  }

  loadJugadores() {
    this.loading.set(true);
    this.api
      .getJugadores({
        page: this.currentPage(),
        limit: this.pageSize(),
        categoriaId: this.selectedCategoriaId(),
        search: this.searchQuery(),
        estado: this.selectedEstado(),
        posicion: this.selectedPosicion(),
        genero: this.selectedGenero(),
        sortBy: this.selectedSortBy(),
      })
      .subscribe({
        next: (res) => {
          let rows: any[] = [];
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

          this.jugadores.set(rows);
          this.totalRecords.set(total);
          this.totalPages.set(totalPages);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error cargando jugadores:', err);
          this.jugadores.set([]);
          this.totalRecords.set(0);
          this.totalPages.set(1);
          this.loading.set(false);
        },
      });
  }

  selectCategoria(catId: string) {
    this.selectedCategoriaId.set(catId);
    this.currentPage.set(1);
    this.loadJugadores();
  }

  private searchDebounceTimer?: any;
  onSearchChange(value: string) {
    this.searchQuery.set(value);
    this.currentPage.set(1);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.loadJugadores();
    }, 300);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadJugadores();
  }

  onSortByChange(value: string) {
    this.selectedSortBy.set(value);
    this.currentPage.set(1);
    this.loadJugadores();
  }

  toggleViewMode(mode: 'TABLE' | 'CARDS') {
    this.viewMode.set(mode);
  }

  onGeneroFilterChange(gen: string) {
    this.selectedGenero.set(gen);
    this.currentPage.set(1);
    this.loadJugadores();
  }

  onPosicionFilterChange(pos: string) {
    this.selectedPosicion.set(pos);
    this.currentPage.set(1);
    this.loadJugadores();
  }

  onEstadoFilterChange(est: string) {
    this.selectedEstado.set(est);
    this.currentPage.set(1);
    this.loadJugadores();
  }

  resetAllFilters() {
    this.selectedCategoriaId.set('TODAS');
    this.searchQuery.set('');
    this.selectedEstado.set('TODOS');
    this.selectedPosicion.set('TODAS');
    this.selectedGenero.set('TODOS');
    this.selectedSortBy.set('APELLIDO_ASC');
    this.currentPage.set(1);
    this.loadJugadores();
  }

  removeSearchFilter() {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadJugadores();
  }

  removeCategoriaFilter() {
    this.selectedCategoriaId.set('TODAS');
    this.currentPage.set(1);
    this.loadJugadores();
  }

  removeGeneroFilter() {
    this.selectedGenero.set('TODOS');
    this.currentPage.set(1);
    this.loadJugadores();
  }

  removePosicionFilter() {
    this.selectedPosicion.set('TODAS');
    this.currentPage.set(1);
    this.loadJugadores();
  }

  removeEstadoFilter() {
    this.selectedEstado.set('TODOS');
    this.currentPage.set(1);
    this.loadJugadores();
  }

  getCategoryCount(catId: string): number {
    return this.jugadores().filter(j => j.categoria_id === catId).length;
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadJugadores();
  }

  setPageSize(size: number) {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
    this.loadJugadores();
  }

  // --- EXPEDIENTE 360° ---
  openExpediente(jugadorId: string) {
    this.api.getExpedienteJugador(jugadorId).subscribe({
      next: (exp: JugadorExpediente360) => {
        this.selectedExpediente.set(exp);
        this.showExpedienteModal.set(true);
      },
      error: (err: any) => {
        console.error('Error al cargar expediente 360:', err);
        this.showToast('Error al cargar expediente del jugador', true);
      }
    });
  }

  closeExpediente() {
    this.showExpedienteModal.set(false);
    this.selectedExpediente.set(null);
  }

  onAgregarAcudiente(data: any) {
    const exp = this.selectedExpediente();
    if (!exp) return;

    this.savingAcudiente.set(true);
    this.api.addAcudiente(exp.jugador.id, data).subscribe({
      next: () => {
        this.savingAcudiente.set(false);
        this.openExpediente(exp.jugador.id);
        this.showToast('¡Acudiente vinculado con éxito!', false);
      },
      error: (err) => {
        this.savingAcudiente.set(false);
        const msg = err?.error?.message || 'Error al vincular acudiente';
        this.showToast(msg, true);
      }
    });
  }

  onEliminarAcudiente(acudienteId: string) {
    const exp = this.selectedExpediente();
    if (!exp) return;

    this.api.removeAcudiente(exp.jugador.id, acudienteId).subscribe({
      next: () => {
        this.openExpediente(exp.jugador.id);
        this.showToast('Acudiente desvinculado', false);
      },
      error: () => {
        this.showToast('Error al desvincular acudiente', true);
      }
    });
  }

  // --- CREAR JUGADOR ---
  openCreateModal() {
    this.showCreateModal.set(true);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  onPlayerCreated() {
    this.loadJugadores();
    this.showToast('¡Jugador inscrito exitosamente en la academia!', false);
  }

  // --- EDITAR JUGADOR ---
  openEditModal(player: any) {
    this.selectedPlayerToEdit.set(player);
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedPlayerToEdit.set(null);
  }

  onPlayerEdited() {
    this.loadJugadores();
    if (this.showExpedienteModal() && this.selectedExpediente()) {
      this.openExpediente(this.selectedExpediente()!.jugador.id);
    }
    this.showToast('¡Ficha del jugador actualizada exitosamente!', false);
  }

  // --- BIOMETRÍA ---
  openBiometriaModal(player: any) {
    this.selectedPlayerForBio.set(player);
    this.showBiometriaModal.set(true);
  }

  closeBiometriaModal() {
    this.showBiometriaModal.set(false);
    this.selectedPlayerForBio.set(null);
  }

  onBiometriaSaved() {
    this.loadJugadores();
    if (this.showExpedienteModal() && this.selectedExpediente()) {
      this.openExpediente(this.selectedExpediente()!.jugador.id);
    }
    this.showToast('¡Medición biométrica registrada exitosamente!', false);
  }

  // --- DAR DE BAJA / RETIRAR ---
  openDeleteConfirmModal(player: any) {
    this.selectedPlayerToDelete.set(player);
    this.showDeleteConfirmModal.set(true);
  }

  closeDeleteConfirmModal() {
    this.showDeleteConfirmModal.set(false);
    this.selectedPlayerToDelete.set(null);
  }

  onPlayerRetired() {
    this.loadJugadores();
    this.showToast('Jugador retirado del club exitosamente', false);
  }

  // Helpers generales
  resolvePhotoUrl(fotoUrl?: string, genero?: string): string {
    if (fotoUrl && fotoUrl.trim()) return fotoUrl;
    return genero === 'FEMENINO'
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face';
  }

  getEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 15;
    const birth = new Date(fechaNacimiento);
    const diff = Date.now() - birth.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  private showToast(msg: string, isError: boolean) {
    this.toastMsg.set(msg);
    this.isToastError.set(isError);
    setTimeout(() => {
      this.toastMsg.set('');
    }, 4000);
  }
}

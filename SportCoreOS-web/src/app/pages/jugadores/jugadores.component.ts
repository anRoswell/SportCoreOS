import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, JugadorExpediente360 } from '../../core/services/api.service';
import { CatalogosService } from '../../core/services/catalogos.service';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';

@Component({
  selector: 'app-jugadores',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrDirective],
  templateUrl: './jugadores.component.html',
  styleUrl: './jugadores.component.scss'
})
export class JugadoresComponent implements OnInit {
  private api = inject(ApiService);
  private catalogos = inject(CatalogosService);

  // Catálogos dinámicos desde Backend / Base de Datos
  epsList = this.catalogos.epsList;
  tiposDocumento = this.catalogos.tiposDocumento;
  parentescos = this.catalogos.parentescos;
  piernasHabiles = this.catalogos.piernasHabiles;
  posiciones = this.catalogos.posiciones;

  // Estados reactivos con Signals
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

  // Expediente 360°
  showExpedienteModal = signal<boolean>(false);
  selectedExpediente = signal<JugadorExpediente360 | null>(null);
  activeExpTab = signal<'DEPORTIVO' | 'FAMILIA' | 'BIOMETRIA' | 'FINANZAS' | 'SERVICIOS'>('DEPORTIVO');

  // Modal Inscribir Alumno (con Stepper de 3 Pasos)
  showCreateModal = signal<boolean>(false);
  createStep = signal<number>(1);
  uploadingPhoto = signal<boolean>(false);
  localPhotoPreviewCreate = signal<string | null>(null);
  localPhotoPreviewEdit = signal<string | null>(null);
  savingPlayer = false;
  newPlayerData = {
    categoriaId: '',
    nombres: '',
    apellidos: '',
    tipoDocumento: 'TI',
    numeroDocumento: '',
    fechaNacimiento: '2011-05-15',
    genero: 'MASCULINO',
    posicionPrincipal: 'Delantero Centro',
    posicionSecundaria: '',
    piernaHabil: 'DIESTRO',
    numeroDorsal: 9,
    eps: 'SURA EPS',
    estadoMatricula: 'ACTIVO',
    porcentajeBeca: 0,
    acudienteNombres: '',
    acudienteApellidos: '',
    acudienteTelefono: '',
    acudienteEmail: '',
    acudienteParentesco: 'PADRE',
    acudienteTipoDoc: 'CC',
    acudienteNumeroDoc: '',
    fotoUrl: '',
  };

  // Modal Editar Alumno
  showEditModal = signal<boolean>(false);
  selectedPlayerToEdit = signal<any | null>(null);
  editPlayerData = {
    categoriaId: '',
    nombres: '',
    apellidos: '',
    tipoDocumento: 'TI',
    numeroDocumento: '',
    fechaNacimiento: '2011-05-15',
    genero: 'MASCULINO',
    posicionPrincipal: 'Delantero Centro',
    posicionSecundaria: '',
    piernaHabil: 'DIESTRO',
    numeroDorsal: 10,
    eps: 'SURA EPS',
    estadoMatricula: 'ACTIVO',
    porcentajeBeca: 0,
    fotoUrl: '',
  };

  // Modal Biometría
  showBiometriaModal = signal<boolean>(false);
  selectedPlayerForBio = signal<any | null>(null);
  savingBio = false;

  // Modal Confirmación de Eliminación / Baja Deportiva
  showDeleteConfirmModal = signal<boolean>(false);
  selectedPlayerToDelete = signal<any | null>(null);
  deletingPlayer = signal<boolean>(false);
  newBioData = {
    pesoKg: 58.5,
    tallaCm: 168.0,
    testCooperMetros: 2850,
    velocidad30mSeg: 3.92,
    saltoVerticalCm: 44.0,
    observaciones: '',
  };

  // Acudientes Inline Form
  showAddAcudienteForm = false;
  savingAcudiente = false;
  newAcudiente = {
    nombres: '',
    apellidos: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    telefonoMovil: '',
    email: '',
    parentesco: 'PADRE',
  };

  // Totales y Paginación Server-Side
  totalRecords = signal<number>(0);
  totalPages = signal<number>(1);

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

  // Filtros Reactivos Activos Check
  hasActiveFilters = computed(() => {
    return this.searchQuery().trim() !== '' ||
      this.selectedCategoriaId() !== 'TODAS' ||
      this.selectedEstado() !== 'TODOS' ||
      this.selectedPosicion() !== 'TODAS' ||
      this.selectedGenero() !== 'TODOS';
  });

  // Nombre de categoría seleccionada para el chip
  getSelectedCategoryName = computed(() => {
    const catId = this.selectedCategoriaId();
    if (catId === 'TODAS') return 'Todas';
    const found = this.categorias().find(c => c.id === catId);
    return found ? found.nombre : 'Categoría';
  });

  // Lista visible (cargada página a página desde la BD)
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
    if (cur > 3) pages.push(-1); // Ellipsis
    for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) {
      pages.push(p);
    }
    if (cur < total - 2) pages.push(-1); // Ellipsis
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
      if (rows && rows.length > 0 && !this.newPlayerData.categoriaId) {
        this.newPlayerData.categoriaId = rows[0].id;
      }
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

  onSortByChange(value: string) {
    this.selectedSortBy.set(value);
    this.currentPage.set(1);
    this.loadJugadores();
  }

  toggleViewMode(mode: 'TABLE' | 'CARDS') {
    this.viewMode.set(mode);
  }

  onPosicionFilterChange(value: string) {
    this.selectedPosicion.set(value);
    this.currentPage.set(1);
    this.loadJugadores();
  }

  onGeneroFilterChange(value: string) {
    this.selectedGenero.set(value);
    this.currentPage.set(1);
    this.loadJugadores();
  }

  onEstadoFilterChange(value: string) {
    this.selectedEstado.set(value);
    this.currentPage.set(1);
    this.loadJugadores();
  }

  clearSearch() {
    this.searchQuery.set('');
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

  resetAllFilters() {
    this.searchQuery.set('');
    this.selectedCategoriaId.set('TODAS');
    this.selectedEstado.set('TODOS');
    this.selectedPosicion.set('TODAS');
    this.selectedGenero.set('TODOS');
    this.selectedSortBy.set('APELLIDO_ASC');
    this.currentPage.set(1);
    this.loadJugadores();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadJugadores();
    }
  }

  setPageSize(size: number | string) {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
    this.loadJugadores();
  }

  getCategoryCount(catId: string): number {
    const list = this.jugadores();
    if (!list || !Array.isArray(list)) return 0;
    return list.filter(j => j.categoria_id === catId).length;
  }

  // Manejo de Expediente 360°
  openExpediente(jugadorId: string) {
    this.api.getExpedienteJugador(jugadorId).subscribe({
      next: (exp) => {
        this.selectedExpediente.set(exp);
        this.activeExpTab.set('DEPORTIVO');
        this.showExpedienteModal.set(true);
        this.showAddAcudienteForm = false;
      },
      error: () => {
        this.showToast('Error al cargar expediente 360°', true);
      }
    });
  }

  closeExpediente() {
    this.showExpedienteModal.set(false);
    this.selectedExpediente.set(null);
  }

  // Inscribir Jugador
  // Inscribir Jugador
  openCreateModal() {
    this.createStep.set(1);
    this.localPhotoPreviewCreate.set(null);
    this.newPlayerData = {
      categoriaId: this.categorias().length > 0 ? this.categorias()[0].id : '',
      nombres: '',
      apellidos: '',
      tipoDocumento: 'TI',
      numeroDocumento: '',
      fechaNacimiento: '2011-05-15',
      genero: 'MASCULINO',
      posicionPrincipal: 'Delantero Centro',
      posicionSecundaria: '',
      piernaHabil: 'DIESTRO',
      numeroDorsal: (this.jugadores().length + 1) % 99 || 7,
      eps: 'SURA EPS',
      estadoMatricula: 'ACTIVO',
      porcentajeBeca: 0,
      acudienteNombres: '',
      acudienteApellidos: '',
      acudienteTelefono: '',
      acudienteEmail: '',
      acudienteParentesco: 'PADRE',
      acudienteTipoDoc: 'CC',
      acudienteNumeroDoc: '',
      fotoUrl: '',
    };
    this.showCreateModal.set(true);
  }

  getSelectedCategoryNameForId(id: string): string {
    if (!id) return 'Sin categoría';
    const cat = this.categorias().find(c => c.id === id);
    return cat ? cat.nombre : 'Categoría';
  }

  setCreateStep(step: number) {
    if (step === 2 && !this.isStep1Valid()) {
      this.showToast('Por favor completa los nombres, apellidos, documento y fecha de nacimiento', true);
      return;
    }
    if (step === 3 && (!this.isStep1Valid() || !this.isStep2Valid())) {
      this.showToast('Por favor selecciona la categoría deportiva y posición del jugador', true);
      return;
    }
    this.createStep.set(step);
  }

  nextCreateStep() {
    if (this.createStep() === 1) {
      if (!this.isStep1Valid()) {
        this.showToast('Por favor completa los campos obligatorios del Paso 1 (Nombres, Apellidos, Documento, Fecha)', true);
        return;
      }
      this.createStep.set(2);
    } else if (this.createStep() === 2) {
      if (!this.isStep2Valid()) {
        this.showToast('Por favor selecciona la categoría y posición principal del jugador', true);
        return;
      }
      this.createStep.set(3);
    }
  }

  prevCreateStep() {
    if (this.createStep() > 1) {
      this.createStep.update(s => s - 1);
    }
  }

  isStep1Valid(): boolean {
    return !!(
      this.newPlayerData.nombres?.trim() &&
      this.newPlayerData.apellidos?.trim() &&
      this.newPlayerData.numeroDocumento?.trim() &&
      this.newPlayerData.fechaNacimiento
    );
  }

  isStep2Valid(): boolean {
    return !!(
      this.newPlayerData.categoriaId &&
      this.newPlayerData.posicionPrincipal
    );
  }

  cleanImageUrl(rawUrl: string): string {
    if (!rawUrl) return '';
    let clean = rawUrl.trim();
    // Remover comillas dobles o simples envolventes
    if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
      clean = clean.slice(1, -1).trim();
    }
    // Formato Markdown: ![alt](https://...)
    const mdMatch = clean.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/i);
    if (mdMatch) clean = mdMatch[1];
    // Formato HTML: <img src="https://...">
    const htmlMatch = clean.match(/src=["'](https?:\/\/[^"']+)["']/i);
    if (htmlMatch) clean = htmlMatch[1];
    // Formato con brackets: <https://...> o (https://...)
    if ((clean.startsWith('<') && clean.endsWith('>')) || (clean.startsWith('(') && clean.endsWith(')'))) {
      clean = clean.slice(1, -1).trim();
    }
    // Si contiene /uploads/ con protocolo/host, extraer solo la ruta relativa /uploads/...
    const uploadsIdx = clean.indexOf('/uploads/');
    if (uploadsIdx !== -1 && (clean.startsWith('http://') || clean.startsWith('https://'))) {
      clean = clean.substring(uploadsIdx);
    }
    return clean;
  }

  onPhotoUrlChange(val: string, mode: 'create' | 'edit') {
    const clean = this.cleanImageUrl(val);
    if (mode === 'create') {
      this.newPlayerData.fotoUrl = clean;
      this.localPhotoPreviewCreate.set(null);
    } else {
      this.editPlayerData.fotoUrl = clean;
      this.localPhotoPreviewEdit.set(null);
    }
  }

  onPhotoUrlPaste(event: ClipboardEvent, mode: 'create' | 'edit') {
    const pastedText = event.clipboardData?.getData('text');
    if (pastedText) {
      event.preventDefault();
      const clean = this.cleanImageUrl(pastedText);
      if (mode === 'create') {
        this.newPlayerData.fotoUrl = clean;
        this.localPhotoPreviewCreate.set(null);
      } else {
        this.editPlayerData.fotoUrl = clean;
        this.localPhotoPreviewEdit.set(null);
      }
    }
  }

  async pasteFromClipboard(mode: 'create' | 'edit') {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const clean = this.cleanImageUrl(text);
          if (mode === 'create') {
            this.newPlayerData.fotoUrl = clean;
            this.localPhotoPreviewCreate.set(null);
          } else {
            this.editPlayerData.fotoUrl = clean;
            this.localPhotoPreviewEdit.set(null);
          }
        }
      }
    } catch {
      // Ignorar si el navegador no permite acceso directo al portapapeles
    }
  }

  handlePhotoBoxPaste(event: ClipboardEvent, mode: 'create' | 'edit') {
    if (event.clipboardData?.items) {
      for (let i = 0; i < event.clipboardData.items.length; i++) {
        const item = event.clipboardData.items[i];
        if (item.type.indexOf('image') !== -1) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            this.processPhotoFile(file, mode);
            return;
          }
        }
      }
    }
    const text = event.clipboardData?.getData('text');
    if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image') || text.startsWith('/uploads/'))) {
      event.preventDefault();
      const clean = this.cleanImageUrl(text);
      if (mode === 'create') {
        this.newPlayerData.fotoUrl = clean;
        this.localPhotoPreviewCreate.set(null);
      } else {
        this.editPlayerData.fotoUrl = clean;
        this.localPhotoPreviewEdit.set(null);
      }
    }
  }

  handlePhotoBoxDrop(event: DragEvent, mode: 'create' | 'edit') {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.processPhotoFile(file, mode);
        return;
      }
    }
    const text = event.dataTransfer?.getData('text');
    if (text) {
      const clean = this.cleanImageUrl(text);
      if (mode === 'create') {
        this.newPlayerData.fotoUrl = clean;
        this.localPhotoPreviewCreate.set(null);
      } else {
        this.editPlayerData.fotoUrl = clean;
        this.localPhotoPreviewEdit.set(null);
      }
    }
  }

  processPhotoFile(file: File, mode: 'create' | 'edit') {
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('La imagen supera el límite de 5 MB', true);
      return;
    }
    this.uploadingPhoto.set(true);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (mode === 'create') {
        this.localPhotoPreviewCreate.set(base64);
      } else {
        this.localPhotoPreviewEdit.set(base64);
      }
    };
    reader.readAsDataURL(file);

    this.api.uploadFile(file, 'avatars').subscribe({
      next: (res) => {
        this.uploadingPhoto.set(false);
        // Guardar y mostrar estrictamente la ruta relativa donde se cargó (ej: /uploads/clubes/...)
        const relativeUrl = res.url || (res.filename ? `/uploads/${res.filename}` : res.path) || '';
        if (relativeUrl) {
          if (mode === 'create') {
            this.newPlayerData.fotoUrl = relativeUrl;
            this.localPhotoPreviewCreate.set(null);
          } else {
            this.editPlayerData.fotoUrl = relativeUrl;
            this.localPhotoPreviewEdit.set(null);
          }
        }
        this.showToast('¡Fotografía cargada correctamente!', false);
      },
      error: () => {
        this.uploadingPhoto.set(false);
        this.showToast('Fotografía cargada en vista previa local', false);
      }
    });
  }

  resolvePhotoUrl(url: string | null | undefined, genero?: string, mode?: 'create' | 'edit'): string {
    if (mode === 'create' && this.localPhotoPreviewCreate()) {
      return this.localPhotoPreviewCreate()!;
    }
    if (mode === 'edit' && this.localPhotoPreviewEdit()) {
      return this.localPhotoPreviewEdit()!;
    }
    if (!url || !url.trim()) {
      return this.getDefaultAvatar(genero || 'MASCULINO');
    }
    return this.api.resolveFileUrl(url);
  }

  onPhotoSelected(event: Event, mode: 'create' | 'edit') {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.showToast('Por favor selecciona un archivo de imagen válido', true);
      return;
    }
    this.processPhotoFile(file, mode);
  }

  onPhotoPreviewError(event: Event, mode: 'create' | 'edit') {
    const img = event.target as HTMLImageElement;
    if (img) {
      const genero = mode === 'create' ? this.newPlayerData.genero : this.editPlayerData.genero;
      const fallback = this.getDefaultAvatar(genero);
      if (img.src !== fallback) {
        img.src = fallback;
      }
    }
  }

  removePhoto(mode: 'create' | 'edit') {
    if (mode === 'create') {
      this.newPlayerData.fotoUrl = '';
      this.localPhotoPreviewCreate.set(null);
    } else {
      this.editPlayerData.fotoUrl = '';
      this.localPhotoPreviewEdit.set(null);
    }
    this.showToast('Fotografía removida', false);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  submitCreateJugador() {
    if (!this.newPlayerData.nombres?.trim()) {
      this.showToast('El nombre del deportista es obligatorio (*)', true);
      return;
    }
    if (!this.newPlayerData.apellidos?.trim()) {
      this.showToast('Los apellidos del deportista son obligatorios (*)', true);
      return;
    }
    if (!this.newPlayerData.numeroDocumento?.trim()) {
      this.showToast('El número de documento de identidad es obligatorio (*)', true);
      return;
    }
    if (this.newPlayerData.numeroDocumento.trim().length < 5) {
      this.showToast('El número de documento debe tener al menos 5 caracteres', true);
      return;
    }
    if (!this.newPlayerData.categoriaId) {
      this.showToast('Debes seleccionar una categoría deportiva válida (*)', true);
      return;
    }
    if (this.newPlayerData.numeroDorsal && (this.newPlayerData.numeroDorsal < 1 || this.newPlayerData.numeroDorsal > 99)) {
      this.showToast('El número de dorsal debe estar entre 1 y 99', true);
      return;
    }

    this.savingPlayer = true;
    this.api.createJugador(this.newPlayerData).subscribe({
      next: (res) => {
        this.savingPlayer = false;
        this.closeCreateModal();
        if (res.jugador) {
          const fullJ = {
            ...res.jugador,
            categoria_nombre: this.categorias().find(c => c.id === res.jugador.categoria_id)?.nombre || 'Categoría',
            color_distintivo: this.categorias().find(c => c.id === res.jugador.categoria_id)?.color_distintivo || '#10B981',
          };
          this.jugadores.update(list => [fullJ, ...list]);
        }
        this.loadJugadores();
        this.showToast('¡Jugador inscrito exitosamente!', false);
      },
      error: (err) => {
        this.savingPlayer = false;
        const msg = err?.error?.message || 'Error al inscribir jugador. Verifica documento y dorsal.';
        this.showToast(msg, true);
      }
    });
  }

  // Biometría Modal
  openBiometriaModal(player: any) {
    this.selectedPlayerForBio.set(player);
    this.newBioData = {
      pesoKg: player.peso_kg ? parseFloat(player.peso_kg) : 58.5,
      tallaCm: player.talla_cm ? parseFloat(player.talla_cm) : 168.0,
      testCooperMetros: 2850,
      velocidad30mSeg: 3.92,
      saltoVerticalCm: 44.0,
      observaciones: '',
    };
    this.showBiometriaModal.set(true);
  }

  closeBiometriaModal() {
    this.showBiometriaModal.set(false);
    this.selectedPlayerForBio.set(null);
  }

  calculateLiveImc(): number {
    if (this.newBioData.tallaCm <= 0 || this.newBioData.pesoKg <= 0) return 0;
    const m = this.newBioData.tallaCm / 100;
    return parseFloat((this.newBioData.pesoKg / (m * m)).toFixed(1));
  }

  submitBiometria() {
    const player = this.selectedPlayerForBio();
    if (!player) return;

    if (!this.newBioData.pesoKg || this.newBioData.pesoKg < 20 || this.newBioData.pesoKg > 180) {
      this.showToast('Ingresa un peso corporal válido entre 20 y 180 kg', true);
      return;
    }
    if (!this.newBioData.tallaCm || this.newBioData.tallaCm < 80 || this.newBioData.tallaCm > 240) {
      this.showToast('Ingresa una estatura / talla válida entre 80 y 240 cm', true);
      return;
    }

    this.savingBio = true;
    const payload = {
      tallaCm: Number(this.newBioData.tallaCm),
      pesoKg: Number(this.newBioData.pesoKg),
      testCooperMetros: this.newBioData.testCooperMetros ? Number(this.newBioData.testCooperMetros) : undefined,
      velocidad30mSeg: this.newBioData.velocidad30mSeg ? Number(this.newBioData.velocidad30mSeg) : undefined,
      saltoVerticalCm: this.newBioData.saltoVerticalCm ? Number(this.newBioData.saltoVerticalCm) : undefined,
      observaciones: this.newBioData.observaciones || undefined,
    };

    this.api.addBiometria(player.id, payload).subscribe({
      next: (res) => {
        this.savingBio = false;
        this.closeBiometriaModal();
        const bio = res.evaluacion || res;
        this.jugadores.update(list => list.map(j => {
          if (j.id === player.id) {
            return {
              ...j,
              peso_kg: bio.peso_kg || payload.pesoKg,
              talla_cm: bio.talla_cm || payload.tallaCm,
              imc: bio.imc || this.calculateLiveImc(),
            };
          }
          return j;
        }));
        this.loadJugadores();
        if (this.showExpedienteModal() && this.selectedExpediente()?.jugador.id === player.id) {
          this.openExpediente(player.id);
        }
        this.showToast('¡Medición biométrica registrada exitosamente!', false);
      },
      error: (err) => {
        this.savingBio = false;
        const msg = err?.error?.message || 'Error al guardar medición biométrica';
        this.showToast(msg, true);
      }
    });
  }

  // Acudientes
  toggleAddAcudienteForm() {
    this.showAddAcudienteForm = !this.showAddAcudienteForm;
  }

  submitAddAcudiente() {
    const exp = this.selectedExpediente();
    if (!exp) return;

    if (!this.newAcudiente.nombres || !this.newAcudiente.numeroDocumento || !this.newAcudiente.telefonoMovil) {
      this.showToast('Por favor diligencia los datos del acudiente', true);
      return;
    }

    this.savingAcudiente = true;
    this.api.addAcudiente(exp.jugador.id, this.newAcudiente).subscribe({
      next: () => {
        this.savingAcudiente = false;
        this.showAddAcudienteForm = false;
        this.openExpediente(exp.jugador.id);
        this.showToast('¡Acudiente vinculado con éxito!', false);
      },
      error: (err) => {
        this.savingAcudiente = false;
        const msg = err?.error?.message || 'Error al vincular acudiente';
        this.showToast(msg, true);
      }
    });
  }

  removeAcudiente(acudienteId: string) {
    const exp = this.selectedExpediente();
    if (!exp) return;

    this.api.removeAcudiente(exp.jugador.id, acudienteId).subscribe({
      next: () => {
        this.openExpediente(exp.jugador.id);
        this.showToast('Acudiente desvinculado', false);
      },
      error: (err) => {
        this.showToast('Error al desvincular acudiente', true);
      }
    });
  }

  // Editar & Retirar
  openEditModal(player: any) {
    this.selectedPlayerToEdit.set(player);
    this.localPhotoPreviewEdit.set(null);
    this.editPlayerData = {
      categoriaId: player.categoria_id || (this.categorias().length > 0 ? this.categorias()[0].id : ''),
      nombres: player.nombres || '',
      apellidos: player.apellidos || '',
      tipoDocumento: player.tipo_documento || 'TI',
      numeroDocumento: player.numero_documento || '',
      fechaNacimiento: player.fecha_nacimiento ? player.fecha_nacimiento.substring(0, 10) : '2011-05-15',
      genero: player.genero || 'MASCULINO',
      posicionPrincipal: player.posicion_principal || 'Delantero Centro',
      posicionSecundaria: player.posicion_secundaria || '',
      piernaHabil: player.pierna_habil || 'DIESTRO',
      numeroDorsal: player.numero_dorsal ? Number(player.numero_dorsal) : 10,
      eps: player.eps || 'SURA EPS',
      estadoMatricula: player.estado_matricula || 'ACTIVO',
      porcentajeBeca: player.porcentaje_beca ? Number(player.porcentaje_beca) : 0,
      fotoUrl: player.foto_url || '',
    };
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedPlayerToEdit.set(null);
  }

  submitEditJugador() {
    const player = this.selectedPlayerToEdit();
    if (!player || !player.id) return;

    if (!this.editPlayerData.nombres?.trim()) {
      this.showToast('El nombre del deportista es obligatorio (*)', true);
      return;
    }
    if (!this.editPlayerData.apellidos?.trim()) {
      this.showToast('Los apellidos del deportista son obligatorios (*)', true);
      return;
    }
    if (!this.editPlayerData.numeroDocumento?.trim()) {
      this.showToast('El número de documento es obligatorio (*)', true);
      return;
    }
    if (this.editPlayerData.numeroDocumento.trim().length < 5) {
      this.showToast('El número de documento debe tener al menos 5 caracteres', true);
      return;
    }
    if (!this.editPlayerData.categoriaId) {
      this.showToast('Debes seleccionar una categoría deportiva válida (*)', true);
      return;
    }
    if (this.editPlayerData.numeroDorsal && (this.editPlayerData.numeroDorsal < 1 || this.editPlayerData.numeroDorsal > 99)) {
      this.showToast('El número de dorsal debe estar entre 1 y 99', true);
      return;
    }
    if (this.editPlayerData.porcentajeBeca && (this.editPlayerData.porcentajeBeca < 0 || this.editPlayerData.porcentajeBeca > 100)) {
      this.showToast('El porcentaje de beca debe estar entre 0% y 100%', true);
      return;
    }

    this.savingPlayer = true;
    this.api.updateJugador(player.id, {
      categoriaId: this.editPlayerData.categoriaId,
      nombres: this.editPlayerData.nombres,
      apellidos: this.editPlayerData.apellidos,
      tipoDocumento: this.editPlayerData.tipoDocumento,
      numeroDocumento: this.editPlayerData.numeroDocumento,
      fechaNacimiento: this.editPlayerData.fechaNacimiento,
      genero: this.editPlayerData.genero,
      posicionPrincipal: this.editPlayerData.posicionPrincipal,
      posicionSecundaria: this.editPlayerData.posicionSecundaria,
      piernaHabil: this.editPlayerData.piernaHabil,
      numeroDorsal: Number(this.editPlayerData.numeroDorsal),
      eps: this.editPlayerData.eps,
      estadoMatricula: this.editPlayerData.estadoMatricula,
      porcentajeBeca: Number(this.editPlayerData.porcentajeBeca) || 0,
      fotoUrl: this.editPlayerData.fotoUrl,
    }).subscribe({
      next: () => {
        this.savingPlayer = false;
        this.closeEditModal();
        this.loadJugadores();
        this.showToast('¡Ficha del jugador actualizada exitosamente!', false);
      },
      error: (err) => {
        this.savingPlayer = false;
        const msg = err?.error?.message || 'Error al actualizar ficha del jugador';
        this.showToast(msg, true);
      }
    });
  }

  // Retiro & Baja de Atleta
  openDeleteConfirmModal(player: any) {
    this.selectedPlayerToDelete.set(player);
    this.showDeleteConfirmModal.set(true);
  }

  closeDeleteConfirmModal() {
    this.showDeleteConfirmModal.set(false);
    this.selectedPlayerToDelete.set(null);
  }

  confirmRetireJugador() {
    const player = this.selectedPlayerToDelete();
    if (!player || !player.id) return;

    this.deletingPlayer.set(true);
    this.api.deleteJugador(player.id).subscribe({
      next: () => {
        this.deletingPlayer.set(false);
        this.closeDeleteConfirmModal();
        this.loadJugadores();
        this.showToast(`Jugador ${player.nombres} ${player.apellidos} retirado del club exitosamente`, false);
      },
      error: (err) => {
        this.deletingPlayer.set(false);
        const msg = err?.error?.message || 'Error al tramitar baja del jugador';
        this.showToast(msg, true);
      }
    });
  }

  retireJugador(player: any) {
    this.openDeleteConfirmModal(player);
  }

  // Helpers
  getEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 15;
    const birth = new Date(fechaNacimiento);
    const diff = Date.now() - birth.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  getImcClass(imc: number | string): string {
    const val = typeof imc === 'string' ? parseFloat(imc) : imc;
    if (val < 18.5) return 'bajo';
    if (val <= 24.9) return 'normal';
    return 'sobrepeso';
  }

  getImcLabel(imc: number | string): string {
    const val = typeof imc === 'string' ? parseFloat(imc) : imc;
    if (val < 18.5) return 'Bajo Peso';
    if (val <= 24.9) return 'Normal / Óptimo';
    if (val <= 29.9) return 'Sobrepeso';
    return 'Obesidad';
  }

  cleanPhone(phone: string): string {
    return (phone || '').replace(/[^0-9]/g, '');
  }

  getDefaultAvatar(genero: string): string {
    return genero === 'FEMENINO' 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
      : 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=120';
  }

  private showToast(msg: string, isError: boolean) {
    this.toastMsg.set(msg);
    this.isToastError.set(isError);
    setTimeout(() => {
      this.toastMsg.set('');
    }, 4000);
  }
}

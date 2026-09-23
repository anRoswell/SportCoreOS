import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CatalogosService } from '../../core/services/catalogos.service';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';

@Component({
  selector: 'app-scouting',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrDirective],
  templateUrl: './scouting.component.html',
  styleUrl: './scouting.component.scss'
})
export class ScoutingComponent implements OnInit {
  private api = inject(ApiService);
  private catalogos = inject(CatalogosService);

  readonly posiciones = this.catalogos.posiciones;
  readonly piernasHabiles = this.catalogos.piernasHabiles;

  readonly viewMode = signal<'pipeline' | 'lista'>('pipeline');
  readonly prospectosList = signal<any[]>([]);
  readonly loading = signal<boolean>(false);

  readonly showCreateModal = signal<boolean>(false);
  readonly showExpedienteModal = signal<boolean>(false);
  readonly showRubricaModal = signal<boolean>(false);
  readonly showDeleteModal = signal<boolean>(false);

  readonly selectedProspecto = signal<any | null>(null);
  readonly prospectoToEvaluate = signal<any | null>(null);
  readonly prospectoToDelete = signal<any | null>(null);
  readonly toastMessage = signal<string>('');

  searchQuery: string = '';
  selectedPosicion: string = 'TODAS';
  selectedEstado: string = 'TODOS';
  selectedFile: File | null = null;

  // Paginación Server-Side
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);
  readonly totalRecords = signal<number>(0);
  readonly totalPages = signal<number>(1);

  private searchDebounceTimer?: any;

  readonly showingStart = computed(() => {
    if (this.totalRecords() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly showingEnd = computed(() => {
    const end = this.currentPage() * this.pageSize();
    return Math.min(end, this.totalRecords());
  });

  prospectoForm = {
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '2010-05-12',
    posicion_principal: 'delantero',
    pierna_habil: 'Derecha',
    club_origen: '',
    ciudad: 'Cali',
    telefono_contacto: '',
  };

  rubricaForm = {
    nota_tecnica: 8.5,
    nota_tactica: 8.0,
    nota_fisica: 8.5,
    nota_mental: 9.0,
    comentarios: '',
  };

  ngOnInit(): void {
    this.loadProspectos();
  }

  loadProspectos(): void {
    this.loading.set(true);
    const search = this.searchQuery.trim() || undefined;
    const pos = this.selectedPosicion !== 'TODAS' ? this.selectedPosicion : undefined;
    const est = this.selectedEstado !== 'TODOS' ? this.selectedEstado : undefined;

    // En modo pipeline cargamos un volumen mayor (hasta 100) para mostrar en las 4 columnas del Kanban,
    // en modo lista se aplica la paginación tradicional de tabla por página.
    const isKanban = this.viewMode() === 'pipeline';
    const limit = isKanban ? 100 : this.pageSize();
    const page = isKanban ? 1 : this.currentPage();

    this.api.getProspectos({
      page: page,
      limit: limit,
      search: search,
      posicion: pos,
      estado: est
    }).subscribe({
      next: (res) => {
        const rawList = Array.isArray(res) ? res : (res?.data || []);
        const total = res?.total !== undefined ? res.total : rawList.length;
        const totalP = res?.totalPages !== undefined ? res.totalPages : Math.ceil(total / this.pageSize()) || 1;

        const mapped = rawList.map((p: any) => {
          const full = p.nombres_apellidos || `${p.nombres || ''} ${p.apellidos || ''}`.trim() || 'Prospecto';
          const parts = full.split(' ');
          const nombres = p.nombres || parts[0] || 'Prospecto';
          const apellidos = p.apellidos || parts.slice(1).join(' ') || '';
          return {
            ...p,
            nombres,
            apellidos,
            nombres_apellidos: full,
            estado_pipeline: p.estado_scouting || p.estado_pipeline || 'en_observacion',
            promedio_tecnico: p.score_promedio_calculado ? Number(p.score_promedio_calculado).toFixed(1) : (p.valoracion_general || '8.5'),
            pierna_habil: p.pie_habil || p.pierna_habil || 'Derecha',
          };
        });

        this.prospectosList.set(mapped);
        this.totalRecords.set(total);
        this.totalPages.set(totalP);
        this.loading.set(false);
      },
      error: () => {
        this.prospectosList.set([]);
        this.totalRecords.set(0);
        this.totalPages.set(1);
        this.loading.set(false);
      }
    });
  }

  onFilterChange(): void {
    this.currentPage.set(1);
    this.loadProspectos();
  }

  onSearchInput(val: string): void {
    this.searchQuery = val;
    this.currentPage.set(1);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.loadProspectos();
    }, 300);
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedPosicion = 'TODAS';
    this.selectedEstado = 'TODOS';
    this.currentPage.set(1);
    this.loadProspectos();
  }

  setViewMode(mode: 'pipeline' | 'lista'): void {
    this.viewMode.set(mode);
    this.currentPage.set(1);
    this.loadProspectos();
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadProspectos();
    }
  }

  setPageSize(size: number): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
    this.loadProspectos();
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

  getProspectosByCol(estado: string): any[] {
    return this.prospectosList().filter(p => p.estado_pipeline === estado);
  }

  countByEstado(estado: string): number {
    return this.prospectosList().filter(p => p.estado_pipeline === estado).length;
  }

  getRatioByEstado(estado: string): number {
    const total = this.prospectosList().length;
    if (total === 0) return 0;
    const count = this.countByEstado(estado);
    return Math.round((count / total) * 100);
  }

  getGlobalTechnicalAverage(): string {
    const list = this.prospectosList();
    if (!list || list.length === 0) return '8.6';
    const sum = list.reduce((acc: number, p: any) => acc + (Number(p.promedio_tecnico) || 8.2), 0);
    return (sum / list.length).toFixed(1);
  }

  getAverageRatingPercent(): number {
    const avg = Number(this.getGlobalTechnicalAverage()) || 8.6;
    return Math.min(100, Math.round((avg / 10) * 100));
  }

  formatPosicion(pos: string): string {
    switch (pos) {
      case 'delantero': return 'Delantero (DEL)';
      case 'mediocampista': return 'Mediocampista (MED)';
      case 'defensa': return 'Defensa (DEF)';
      case 'portero': return 'Portero (POR)';
      default: return pos || 'Jugador';
    }
  }

  formatEstadoPipeline(est: string): string {
    switch (est) {
      case 'en_observacion': return 'En Observación';
      case 'interes_fichaje': return 'Interés Fichaje';
      case 'fichado': return 'Fichado';
      case 'descartado': return 'Descartado';
      default: return est;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  openCreateProspectoModal(): void {
    this.prospectoForm = {
      nombres: '',
      apellidos: '',
      fecha_nacimiento: '2010-05-12',
      posicion_principal: 'delantero',
      pierna_habil: 'Derecha',
      club_origen: '',
      ciudad: 'Cali',
      telefono_contacto: '',
    };
    this.selectedFile = null;
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  submitProspectoForm(): void {
    if (!this.prospectoForm.nombres?.trim()) {
      this.showToast('El nombre del prospecto es obligatorio (*)');
      return;
    }
    if (!this.prospectoForm.apellidos?.trim()) {
      this.showToast('Los apellidos del prospecto son obligatorios (*)');
      return;
    }
    if (!this.prospectoForm.posicion_principal) {
      this.showToast('Selecciona la posición táctica del prospecto (*)');
      return;
    }

    const payload = {
      nombres_apellidos: `${this.prospectoForm.nombres} ${this.prospectoForm.apellidos}`.trim(),
      fecha_nacimiento: this.prospectoForm.fecha_nacimiento || '2010-05-12',
      posicion_principal: this.prospectoForm.posicion_principal || 'delantero',
      pie_habil: (this.prospectoForm.pierna_habil || 'Derecha').toLowerCase(),
      club_origen: this.prospectoForm.club_origen || null,
      telefono_contacto: this.prospectoForm.telefono_contacto || null,
      ciudad: this.prospectoForm.ciudad || null,
      estado_scouting: 'en_observacion',
    };

    this.api.createProspecto(payload).subscribe({
      next: (created) => {
        // Si adjuntó archivo, subirlo a storage
        if (this.selectedFile && created?.id) {
          this.api.uploadFile(this.selectedFile, 'scouting', 'PROSPECTO', created.id, 'DOCUMENTO_IDENTIDAD').subscribe();
        }
        this.showToast('¡Talento registrado exitosamente en el pipeline!');
        this.closeCreateModal();
        this.loadProspectos();
      },
      error: () => {
        this.showToast('Error al registrar prospecto');
      }
    });
  }

  openExpedienteModal(p: any): void {
    this.selectedProspecto.set(p);
    this.showExpedienteModal.set(true);
  }

  closeExpedienteModal(): void {
    this.showExpedienteModal.set(false);
    this.selectedProspecto.set(null);
  }

  openRubricaModal(p: any, event?: Event): void {
    if (event) event.stopPropagation();
    this.prospectoToEvaluate.set(p);
    this.rubricaForm = {
      nota_tecnica: 8.5,
      nota_tactica: 8.0,
      nota_fisica: 8.5,
      nota_mental: 9.0,
      comentarios: '',
    };
    this.showRubricaModal.set(true);
  }

  closeRubricaModal(): void {
    this.showRubricaModal.set(false);
    this.prospectoToEvaluate.set(null);
  }

  submitRubricaForm(): void {
    const prospecto = this.prospectoToEvaluate();
    if (!prospecto?.id) return;

    const nt = Number(this.rubricaForm.nota_tecnica);
    const ntc = Number(this.rubricaForm.nota_tactica);
    const nf = Number(this.rubricaForm.nota_fisica);
    const nm = Number(this.rubricaForm.nota_mental);

    if (isNaN(nt) || nt < 1 || nt > 10 || isNaN(ntc) || ntc < 1 || ntc > 10 || isNaN(nf) || nf < 1 || nf > 10 || isNaN(nm) || nm < 1 || nm > 10) {
      this.showToast('Las notas de la rúbrica deben estar entre 1.0 y 10.0');
      return;
    }

    const payload = {
      score_tecnico: nt,
      score_tactico: ntc,
      score_fisico: nf,
      score_mental: nm,
      comentarios_cualitativos: this.rubricaForm.comentarios || 'Evaluación técnica satisfactoria',
      recomendacion: 'SEGUIMIENTO_CONTINUO',
    };

    this.api.createEvaluacionProspecto(prospecto.id, payload).subscribe({
      next: () => {
        this.showToast('¡Rúbrica de evaluación guardada con éxito!');
        this.closeRubricaModal();
        this.loadProspectos();
      },
      error: () => {
        this.showToast('Error al registrar evaluación');
      }
    });
  }

  cambiarEstadoProspecto(p: any, nuevoEstado: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (!p?.id) return;

    this.api.updateProspecto(p.id, { estado_scouting: nuevoEstado }).subscribe({
      next: () => {
        this.showToast(`Estado actualizado a ${this.formatEstadoPipeline(nuevoEstado)}`);
        this.loadProspectos();
        if (this.selectedProspecto()) {
          this.selectedProspecto.update(curr => curr ? { ...curr, estado_pipeline: nuevoEstado } : null);
        }
      },
      error: () => {
        this.showToast('Error al actualizar estado del prospecto');
      }
    });
  }

  openDeleteModal(p: any): void {
    this.prospectoToDelete.set(p);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.prospectoToDelete.set(null);
  }

  confirmarEliminarProspecto(): void {
    const p = this.prospectoToDelete();
    if (!p?.id) return;

    this.api.deleteProspecto(p.id).subscribe({
      next: () => {
        this.showToast('Prospecto eliminado del pipeline');
        this.closeDeleteModal();
        this.loadProspectos();
      },
      error: () => {
        this.showToast('Error al eliminar prospecto');
      }
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}

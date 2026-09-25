import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CatalogosService } from '../../core/services/catalogos.service';
import {
  ProspectoItem,
  ProspectoFormData,
  RubricaFormData,
  ScoutingEstadoPipeline,
  ScoutingPosicionFiltro,
  SCOUTING_ESTADO_OPTIONS,
  SCOUTING_POSICION_OPTIONS
} from './data/scouting.constants';
import { ScoutingKpisComponent } from './components/scouting-kpis/scouting-kpis.component';
import { ScoutingPipelineComponent } from './components/scouting-pipeline/scouting-pipeline.component';
import { ScoutingTableComponent } from './components/scouting-table/scouting-table.component';
import { ScoutingFormModalComponent } from './components/scouting-form-modal/scouting-form-modal.component';
import { ScoutingExpedienteModalComponent } from './components/scouting-expediente-modal/scouting-expediente-modal.component';
import { ScoutingRubricaModalComponent } from './components/scouting-rubrica-modal/scouting-rubrica-modal.component';
import { ScoutingDeleteModalComponent } from './components/scouting-delete-modal/scouting-delete-modal.component';

@Component({
  selector: 'app-scouting',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ScoutingKpisComponent,
    ScoutingPipelineComponent,
    ScoutingTableComponent,
    ScoutingFormModalComponent,
    ScoutingExpedienteModalComponent,
    ScoutingRubricaModalComponent,
    ScoutingDeleteModalComponent
  ],
  templateUrl: './scouting.component.html',
  styleUrl: './scouting.component.scss'
})
export class ScoutingComponent implements OnInit {
  private api = inject(ApiService);
  private catalogos = inject(CatalogosService);

  readonly posiciones = this.catalogos.posiciones;
  readonly piernasHabiles = this.catalogos.piernasHabiles;

  readonly estadoOptions = SCOUTING_ESTADO_OPTIONS;
  readonly posicionOptions = SCOUTING_POSICION_OPTIONS;

  readonly viewMode = signal<'pipeline' | 'lista'>('pipeline');
  readonly prospectosList = signal<ProspectoItem[]>([]);
  readonly loading = signal<boolean>(false);

  readonly showCreateModal = signal<boolean>(false);
  readonly showExpedienteModal = signal<boolean>(false);
  readonly showRubricaModal = signal<boolean>(false);
  readonly showDeleteModal = signal<boolean>(false);

  readonly selectedProspecto = signal<ProspectoItem | null>(null);
  readonly prospectoToEvaluate = signal<ProspectoItem | null>(null);
  readonly prospectoToDelete = signal<ProspectoItem | null>(null);
  readonly toastMessage = signal<string>('');

  searchQuery: string = '';
  selectedPosicion: string = ScoutingPosicionFiltro.TODAS;
  selectedEstado: string = ScoutingEstadoPipeline.TODOS;

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

  ngOnInit(): void {
    this.loadProspectos();
  }

  loadProspectos(): void {
    this.loading.set(true);
    const search = this.searchQuery.trim() || undefined;
    const pos = this.selectedPosicion !== ScoutingPosicionFiltro.TODAS ? this.selectedPosicion : undefined;
    const est = this.selectedEstado !== ScoutingEstadoPipeline.TODOS ? this.selectedEstado : undefined;

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

        const mapped: ProspectoItem[] = rawList.map((p: any) => {
          const full = p.nombres_apellidos || `${p.nombres || ''} ${p.apellidos || ''}`.trim() || 'Prospecto';
          const parts = full.split(' ');
          const nombres = p.nombres || parts[0] || 'Prospecto';
          const apellidos = p.apellidos || parts.slice(1).join(' ') || '';
          return {
            ...p,
            nombres,
            apellidos,
            nombres_apellidos: full,
            estado_pipeline: p.estado_scouting || p.estado_pipeline || ScoutingEstadoPipeline.EN_OBSERVACION,
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
    this.selectedPosicion = ScoutingPosicionFiltro.TODAS;
    this.selectedEstado = ScoutingEstadoPipeline.TODOS;
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

  setPageSize(size: any): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
    this.loadProspectos();
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
    if (list.length === 0) return '8.5';
    const sum = list.reduce((acc, curr) => acc + (Number(curr.promedio_tecnico) || 8.0), 0);
    return (sum / list.length).toFixed(1);
  }

  getAverageRatingPercent(): number {
    const avg = Number(this.getGlobalTechnicalAverage()) || 8.5;
    return Math.min(100, Math.round(avg * 10));
  }

  openCreateProspectoModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  submitCreateProspecto(event: { form: ProspectoFormData; file: File | null }): void {
    const payload = {
      nombres_apellidos: `${event.form.nombres || ''} ${event.form.apellidos || ''}`.trim(),
      fecha_nacimiento: event.form.fecha_nacimiento || '2010-01-01',
      posicion_principal: event.form.posicion_principal || 'delantero',
      pie_habil: event.form.pierna_habil || 'Derecha',
      club_origen: event.form.club_origen || null,
      ciudad: event.form.ciudad || null,
      telefono_contacto: event.form.telefono_contacto || null,
      estado_scouting: 'en_observacion',
    };

    this.api.createProspecto(payload).subscribe({
      next: (created) => {
        if (event.file && created?.id) {
          this.api.uploadFile(event.file, 'scouting', 'PROSPECTO', created.id, 'DOCUMENTO_VISORIA').subscribe();
        }
        this.showToast('¡Prospecto añadido exitosamente al radar de visoría!');
        this.closeCreateModal();
        this.loadProspectos();
      },
      error: () => {
        this.showToast('Error al registrar prospecto');
      }
    });
  }

  openExpedienteModal(prospecto: ProspectoItem): void {
    this.selectedProspecto.set(prospecto);
    this.showExpedienteModal.set(true);
  }

  closeExpedienteModal(): void {
    this.showExpedienteModal.set(false);
    this.selectedProspecto.set(null);
  }

  openRubricaModal(prospecto: ProspectoItem): void {
    this.prospectoToEvaluate.set(prospecto);
    this.showRubricaModal.set(true);
  }

  closeRubricaModal(): void {
    this.showRubricaModal.set(false);
    this.prospectoToEvaluate.set(null);
  }

  submitRubricaForm(form: any): void {
    const prospecto = this.prospectoToEvaluate();
    if (!prospecto?.id) return;

    const payload = {
      score_tecnico: Number(form.nota_tecnica ?? form.score_tecnico) || 8.0,
      score_tactico: Number(form.nota_tactica ?? form.score_tactico) || 8.0,
      score_fisico: Number(form.nota_fisica ?? form.score_fisico) || 8.0,
      score_mental: Number(form.nota_mental ?? form.score_mental) || 8.0,
      comentarios_cualitativos: form.comentarios || form.comentarios_cualitativos || 'Evaluación de visoría',
      recomendacion: form.recomendacion || 'SEGUIMIENTO_CONTINUO',
    };

    this.api.createEvaluacionProspecto(prospecto.id, payload).subscribe({
      next: () => {
        this.showToast('¡Evaluación técnica guardada exitosamente!');
        this.closeRubricaModal();
        this.loadProspectos();
      },
      error: () => {
        this.showToast('Error al guardar rúbrica de visoría');
      }
    });
  }

  cambiarEstadoProspecto(event: { prospecto: ProspectoItem; estado: string }): void {
    if (!event.prospecto?.id) return;

    this.api.updateProspecto(event.prospecto.id, { estado_scouting: event.estado as any }).subscribe({
      next: () => {
        this.showToast(`Estado actualizado: ${event.prospecto.nombres} ahora está en ${event.estado}`);
        this.loadProspectos();
      },
      error: () => {
        this.showToast('Error al cambiar estado del prospecto');
      }
    });
  }

  openDeleteModal(prospecto: ProspectoItem): void {
    this.prospectoToDelete.set(prospecto);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.prospectoToDelete.set(null);
  }

  confirmarEliminarProspecto(prospecto: ProspectoItem): void {
    if (!prospecto?.id) return;

    this.api.deleteProspecto(prospecto.id).subscribe({
      next: () => {
        this.showToast('Prospecto retirado del pipeline de captación.');
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

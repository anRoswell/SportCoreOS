import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  ApiService,
  LandingPage,
  LandingLead,
  BloqueSeccionLanding,
  TipoContenidoLanding,
  TipoBloqueSeccion,
} from '../../core/services/api.service';
import {
  LandingBuilderTab,
  LandingDevicePreview,
  LandingEstadoFiltro,
  TipoBloqueLanding,
  TipoContenidoLandingEnum,
} from '../../core/enums/domain.enums';
import {
  ColorPreset,
  LANDING_COLOR_PRESETS,
  LANDING_CONTENT_TYPES,
  LANDING_AVAILABLE_BLOCKS,
} from './data/landing-builder.constants';
import { createDefaultLandingBlock } from './data/landing-blocks.factory';
import { getEmptyLanding, getDefaultLandingTemplate } from './data/landing-templates.data';
import { LandingKpiBarComponent } from './components/landing-kpi-bar/landing-kpi-bar.component';
import { LandingCatalogGridComponent } from './components/landing-catalog-grid/landing-catalog-grid.component';
import { LandingEditorModalComponent } from './components/landing-editor-modal/landing-editor-modal.component';
import { LandingLeadsModalComponent } from './components/landing-leads-modal/landing-leads-modal.component';
import { LandingDeleteDialogComponent } from './components/landing-delete-dialog/landing-delete-dialog.component';

export type { ColorPreset };

@Component({
  selector: 'app-landing-builder',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RouterModule,
    LandingKpiBarComponent,
    LandingCatalogGridComponent,
    LandingEditorModalComponent,
    LandingLeadsModalComponent,
    LandingDeleteDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing-builder.component.html',
  styleUrl: './landing-builder.component.scss',
})
export class LandingBuilderComponent implements OnInit {
  public api = inject(ApiService);

  readonly LandingEstadoFiltro = LandingEstadoFiltro;
  readonly LandingBuilderTab = LandingBuilderTab;
  readonly LandingDevicePreview = LandingDevicePreview;

  // Data signals
  landingsList = signal<LandingPage[]>([]);
  resumenStats = signal({
    total: 0,
    publicadas: 0,
    vistasTotales: 0,
    leadsTotales: 0,
    conversionPromedio: 0,
  });
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  toastMessage = signal<string>('');
  isToastError = signal<boolean>(false);

  // Filters
  searchQuery = signal<string>('');
  filterType = signal<string>('TODOS');
  filterStatus = signal<string>(LandingEstadoFiltro.TODOS);

  // Modal states
  showBuilderModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  builderActiveTab = signal<LandingBuilderTab>(LandingBuilderTab.GENERAL);
  selectedBlockIndex = signal<number>(0);

  // Simulator state
  previewDevice = signal<LandingDevicePreview>(LandingDevicePreview.DESKTOP);

  // Leads modal state
  showLeadsModal = signal<boolean>(false);
  currentLandingForLeads = signal<LandingPage | null>(null);
  landingLeadsList = signal<LandingLead[]>([]);
  loadingLeads = signal<boolean>(false);
  leadsSearchQuery = signal<string>('');

  // Delete modal state
  showDeleteModal = signal<boolean>(false);
  itemToDelete = signal<LandingPage | null>(null);

  // Static options & presets from modular data
  colorPresets: ColorPreset[] = LANDING_COLOR_PRESETS;
  contentTypes = LANDING_CONTENT_TYPES;
  availableBlockTypes = LANDING_AVAILABLE_BLOCKS;

  // Form model for editing
  currentForm: LandingPage = getEmptyLanding();

  // Filtered landings computed signal
  filteredLandings = computed(() => {
    const list = this.landingsList();
    const query = this.searchQuery().trim().toLowerCase();
    const type = this.filterType();
    const status = this.filterStatus();

    return list.filter((item) => {
      const matchesQuery =
        !query ||
        item.titulo.toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query) ||
        (item.subtitulo && item.subtitulo.toLowerCase().includes(query));

      const matchesType = type === 'TODOS' || item.tipo_contenido === type;
      const matchesStatus = status === 'TODOS' || item.estado === status;

      return matchesQuery && matchesType && matchesStatus;
    });
  });

  // Filtered leads computed signal
  filteredLeads = computed(() => {
    const leads = this.landingLeadsList();
    const query = this.leadsSearchQuery().trim().toLowerCase();
    if (!query) return leads;
    return leads.filter(
      (l) =>
        l.nombre_completo.toLowerCase().includes(query) ||
        l.email.toLowerCase().includes(query) ||
        l.telefono.includes(query) ||
        (l.nombre_deportista && l.nombre_deportista.toLowerCase().includes(query)) ||
        (l.categoria_interes && l.categoria_interes.toLowerCase().includes(query))
    );
  });

  ngOnInit(): void {
    this.loadLandings();
  }

  loadLandings(): void {
    this.loading.set(true);
    this.api.getLandings(this.filterType(), this.filterStatus()).subscribe({
      next: (res) => {
        this.landingsList.set(res.items);
        this.resumenStats.set(res.resumen);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar landings:', err);
        this.loading.set(false);
        this.showToast('Error al sincronizar las landings', true);
      },
    });
  }

  openCreateModal(tipoDefault: TipoContenidoLanding = TipoContenidoLandingEnum.LANDING_PAGE): void {
    this.isEditing.set(false);
    this.currentForm = getDefaultLandingTemplate(tipoDefault);
    this.builderActiveTab.set(LandingBuilderTab.GENERAL);
    this.selectedBlockIndex.set(0);
    this.showBuilderModal.set(true);
  }

  openEditModal(landing: LandingPage): void {
    this.isEditing.set(true);
    // Deep clone to allow safe editing
    this.currentForm = JSON.parse(JSON.stringify(landing));
    if (!this.currentForm.secciones_json) {
      this.currentForm.secciones_json = [];
    }
    this.builderActiveTab.set(LandingBuilderTab.GENERAL);
    this.selectedBlockIndex.set(0);
    this.showBuilderModal.set(true);
  }

  closeBuilderModal(): void {
    this.showBuilderModal.set(false);
  }

  saveLanding(): void {
    if (!this.currentForm.titulo || !this.currentForm.titulo.trim()) {
      this.showToast('El título de la experiencia es obligatorio', true);
      return;
    }
    if (!this.currentForm.slug || !this.currentForm.slug.trim()) {
      this.showToast('El slug URL es obligatorio', true);
      return;
    }

    // Sanitize slug
    this.currentForm.slug = this.currentForm.slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]/g, '-');

    this.saving.set(true);

    if (this.isEditing() && this.currentForm.id) {
      this.api.updateLanding(this.currentForm.id, this.currentForm).subscribe({
        next: () => {
          this.saving.set(false);
          this.showBuilderModal.set(false);
          this.showToast('¡Landing page actualizada con éxito!');
          this.loadLandings();
        },
        error: (err) => {
          this.saving.set(false);
          console.error('Error al actualizar landing:', err);
          this.showToast(err.error?.message || 'Error al guardar cambios', true);
        },
      });
    } else {
      this.api.createLanding(this.currentForm).subscribe({
        next: () => {
          this.saving.set(false);
          this.showBuilderModal.set(false);
          this.showToast('¡Landing page creada exitosamente!');
          this.loadLandings();
        },
        error: (err) => {
          this.saving.set(false);
          console.error('Error al crear landing:', err);
          this.showToast(err.error?.message || 'Error al crear la experiencia', true);
        },
      });
    }
  }

  toggleEstado(landing: LandingPage, event: Event): void {
    event.stopPropagation();
    this.api.toggleEstadoLanding(landing.id).subscribe({
      next: (updated) => {
        this.showToast(`Estado cambiado a ${updated.estado}`);
        this.loadLandings();
      },
      error: (err) => {
        console.error('Error al alternar estado:', err);
        this.showToast('Error al cambiar estado', true);
      },
    });
  }

  duplicateLanding(landing: LandingPage, event: Event): void {
    event.stopPropagation();
    this.api.duplicateLanding(landing.id).subscribe({
      next: () => {
        this.showToast('Plantilla duplicada como borrador');
        this.loadLandings();
      },
      error: (err) => {
        console.error('Error al duplicar:', err);
        this.showToast('Error al duplicar plantilla', true);
      },
    });
  }

  confirmDelete(landing: LandingPage, event: Event): void {
    event.stopPropagation();
    this.itemToDelete.set(landing);
    this.showDeleteModal.set(true);
  }

  deleteLandingConfirmed(): void {
    const item = this.itemToDelete();
    if (!item) return;

    this.api.deleteLanding(item.id).subscribe({
      next: () => {
        this.showDeleteModal.set(false);
        this.itemToDelete.set(null);
        this.showToast('Landing page eliminada');
        this.loadLandings();
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        this.showToast('Error al eliminar landing', true);
      },
    });
  }

  // Leads Modal management
  openLeadsModal(landing: LandingPage, event?: Event): void {
    if (event) event.stopPropagation();
    this.currentLandingForLeads.set(landing);
    this.showLeadsModal.set(true);
    this.loadingLeads.set(true);
    this.leadsSearchQuery.set('');

    this.api.getLandingLeads(landing.id).subscribe({
      next: (leads) => {
        this.landingLeadsList.set(leads);
        this.loadingLeads.set(false);
      },
      error: (err) => {
        console.error('Error al cargar leads:', err);
        this.loadingLeads.set(false);
      },
    });
  }

  closeLeadsModal(): void {
    this.showLeadsModal.set(false);
    this.currentLandingForLeads.set(null);
  }

  openWhatsAppLead(lead: LandingLead): void {
    const cleanPhone = lead.telefono.replace(/\D/g, '');
    const landingTitle = this.currentLandingForLeads()?.titulo || 'nuestra Academia';
    const text = encodeURIComponent(
      `¡Hola ${lead.nombre_completo}! 👋 Te escribimos del club respecto a tu pre-inscripción en "${landingTitle}". Nos gustaría coordinar tu clase de prueba para ${lead.nombre_deportista || 'el deportista'}. ¿Cómo estás?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  }

  copyPublicUrl(slug: string, event?: Event): void {
    if (event) event.stopPropagation();
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    this.showToast('¡Enlace público copiado al portapapeles!');
  }

  // Builder block helpers
  applyColorPreset(preset: ColorPreset): void {
    this.currentForm.tema_color = preset.color;
    this.currentForm.tema_gradient = preset.gradient;
  }

  generateSlug(): void {
    if (!this.currentForm.titulo) return;
    this.currentForm.slug = this.currentForm.titulo
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .concat('-2026');
  }

  addBlock(type: TipoBloqueSeccion): void {
    if (!this.currentForm.secciones_json) {
      this.currentForm.secciones_json = [];
    }

    const newBlock: BloqueSeccionLanding = createDefaultLandingBlock(type, this.currentForm.secciones_json.length + 1);
    this.currentForm.secciones_json.push(newBlock);
    this.selectedBlockIndex.set(this.currentForm.secciones_json.length - 1);
    this.showToast(`Bloque "${newBlock.titulo || type}" añadido`);
  }

  removeBlock(index: number, event?: Event): void {
    if (event) event.stopPropagation();
    if (!this.currentForm.secciones_json) return;
    this.currentForm.secciones_json.splice(index, 1);
    if (this.selectedBlockIndex() >= this.currentForm.secciones_json.length) {
      this.selectedBlockIndex.set(Math.max(0, this.currentForm.secciones_json.length - 1));
    }
  }

  moveBlock(index: number, direction: 'UP' | 'DOWN', event?: Event): void {
    if (event) event.stopPropagation();
    const sections = this.currentForm.secciones_json;
    if (!sections) return;

    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;

    // update orden values
    sections.forEach((sec, idx) => (sec.orden = idx + 1));
    this.selectedBlockIndex.set(targetIndex);
  }

  getSelectedBlock(): BloqueSeccionLanding | null {
    if (!this.currentForm.secciones_json || this.currentForm.secciones_json.length === 0) {
      return null;
    }
    const idx = this.selectedBlockIndex();
    return this.currentForm.secciones_json[idx] || null;
  }

  // Nested block item helpers (e.g. stats, programs, FAQs, plans)
  addStatItem(): void {
    const block = this.getSelectedBlock();
    if (!block || block.tipo !== TipoBloqueLanding.STATS) return;
    if (!block.datos['stats']) block.datos['stats'] = [];
    block.datos['stats'].push({
      numero: '+100',
      etiqueta: 'Nuevo Logro',
      icono: 'fa-solid fa-trophy',
    });
  }

  removeStatItem(idx: number): void {
    const block = this.getSelectedBlock();
    if (!block || !block.datos['stats']) return;
    block.datos['stats'].splice(idx, 1);
  }

  addProgramItem(): void {
    const block = this.getSelectedBlock();
    if (!block || block.tipo !== TipoBloqueLanding.PROGRAMAS) return;
    if (!block.datos['programas']) block.datos['programas'] = [];
    block.datos['programas'].push({
      titulo: 'Nueva Categoría',
      edades: 'Sub-13 (2013-2014)',
      horario: 'Mar y Jue 4:00 PM',
      cupos: '6 Cupos',
      precio: '$180.000 / mes',
      icono: 'fa-solid fa-futbol',
      tag: 'Competitivo',
    });
  }

  removeProgramItem(idx: number): void {
    const block = this.getSelectedBlock();
    if (!block || !block.datos['programas']) return;
    block.datos['programas'].splice(idx, 1);
  }

  addFaqItem(): void {
    const block = this.getSelectedBlock();
    if (!block || block.tipo !== TipoBloqueLanding.FAQ) return;
    if (!block.datos['preguntas']) block.datos['preguntas'] = [];
    block.datos['preguntas'].push({
      pregunta: '¿Cuáles son los requisitos de matrícula?',
      respuesta: 'Documento de identidad del deportista, certificado médico y carnet de EPS o seguro escolar.',
    });
  }

  removeFaqItem(idx: number): void {
    const block = this.getSelectedBlock();
    if (!block || !block.datos['preguntas']) return;
    block.datos['preguntas'].splice(idx, 1);
  }

  addPlanItem(): void {
    const block = this.getSelectedBlock();
    if (!block || block.tipo !== TipoBloqueLanding.PLANES) return;
    if (!block.datos['planes']) block.datos['planes'] = [];
    block.datos['planes'].push({
      nombre: 'Plan Trimestral Pro',
      precio: '$510.000',
      periodo: 'Trimestre (Ahorra 10%)',
      destacado: false,
      beneficios: [
        '3 Entrenamientos semanales',
        'Uniforme de entrenamiento oficial',
        'Evaluación biomecánica bimestral',
        'Acceso al Portal Familiar App',
      ],
      boton_texto: 'Inscribirme al Plan',
    });
  }

  removePlanItem(idx: number): void {
    const block = this.getSelectedBlock();
    if (!block || !block.datos['planes']) return;
    block.datos['planes'].splice(idx, 1);
  }

  addTestimonioItem(): void {
    const block = this.getSelectedBlock();
    if (!block || block.tipo !== TipoBloqueLanding.TESTIMONIOS) return;
    if (!block.datos['testimonios']) block.datos['testimonios'] = [];
    block.datos['testimonios'].push({
      nombre: 'Carlos Mendoza',
      rol: 'Padre de Mateo (Sub-11)',
      texto: 'El nivel técnico y el acompañamiento táctico con IA en SportCoreOS han transformado la confianza de mi hijo en la cancha.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120',
      estrellas: 5,
    });
  }

  removeTestimonioItem(idx: number): void {
    const block = this.getSelectedBlock();
    if (!block || !block.datos['testimonios']) return;
    block.datos['testimonios'].splice(idx, 1);
  }

  // Toast notifier
  showToast(message: string, isError = false): void {
    this.toastMessage.set(message);
    this.isToastError.set(isError);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 3800);
  }

  // Helpers
  getTypeBadgeClass(tipo: TipoContenidoLanding): string {
    switch (tipo) {
      case TipoContenidoLandingEnum.LANDING_PAGE: return 'badge-emerald';
      case TipoContenidoLandingEnum.PROMO_HERO: return 'badge-blue';
      case TipoContenidoLandingEnum.STORIES_REEL: return 'badge-purple';
      case TipoContenidoLandingEnum.BANNER_TOP: return 'badge-amber';
      case TipoContenidoLandingEnum.POPUP_MODAL: return 'badge-pink';
      default: return 'badge-gray';
    }
  }

  getTypeLabel(tipo: TipoContenidoLanding): string {
    const found = this.contentTypes.find((t) => t.id === tipo);
    return found ? found.label : tipo;
  }

  getTypeIcon(tipo: TipoContenidoLanding): string {
    const found = this.contentTypes.find((t) => t.id === tipo);
    return found ? found.icon : 'fa-solid fa-layer-group';
  }
}

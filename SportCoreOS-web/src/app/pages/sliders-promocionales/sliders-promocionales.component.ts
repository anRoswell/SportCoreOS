import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, SliderPromocional, SliderHighlight } from '../../core/services/api.service';
import { SliderModalTab, SliderPlataforma, SliderEstadoFiltro } from '../../core/enums/domain.enums';

// Subcomponents
import { SliderKpiBarComponent } from './components/slider-kpi-bar/slider-kpi-bar.component';
import { SliderCardsGridComponent } from './components/slider-cards-grid/slider-cards-grid.component';
import { SliderEditorModalComponent } from './components/slider-editor-modal/slider-editor-modal.component';
import { SliderSimulatorModalComponent } from './components/slider-simulator-modal/slider-simulator-modal.component';
import { SliderDeleteDialogComponent } from './components/slider-delete-dialog/slider-delete-dialog.component';

export type ISliderPromocional = SliderPromocional;
export type ISliderHighlight = SliderHighlight;

export interface PresetTheme {
  name: string;
  badgeColor: string;
  gradient: string;
}

export interface IconPreset {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sliders-promocionales',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SliderKpiBarComponent,
    SliderCardsGridComponent,
    SliderEditorModalComponent,
    SliderSimulatorModalComponent,
    SliderDeleteDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sliders-promocionales.component.html',
  styleUrl: './sliders-promocionales.component.scss',
})
export class SlidersPromocionalesComponent implements OnInit {
  private api = inject(ApiService);

  // Data signals
  slidersList = signal<SliderPromocional[]>([]);
  loading = signal<boolean>(false);
  saving = signal<boolean>(false);
  toastMessage = signal<string>('');
  isToastError = signal<boolean>(false);

  // Filters (using strict Enums)
  searchQuery = signal<string>('');
  filterPlatform = signal<SliderPlataforma>(SliderPlataforma.TODAS);
  filterStatus = signal<SliderEstadoFiltro>(SliderEstadoFiltro.TODOS);

  // Modal states
  showEditModal = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  modalActiveTab = signal<SliderModalTab>(SliderModalTab.GENERAL);
  
  // Mobile Simulator state
  showSimulatorModal = signal<boolean>(false);
  simulatorIndex = signal<number>(0);

  // Delete modal state
  showDeleteModal = signal<boolean>(false);
  itemToDelete = signal<SliderPromocional | null>(null);

  // Quick preset themes
  presetThemes: PresetTheme[] = [
    { name: 'Esmeralda Pro', badgeColor: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    { name: 'Azul Neón', badgeColor: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
    { name: 'Ámbar Élite', badgeColor: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' },
    { name: 'Púrpura VIP', badgeColor: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
    { name: 'Rosa Neón', badgeColor: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
    { name: 'Cian Futuro', badgeColor: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
  ];

  // Quick FontAwesome icons
  iconPresets: IconPreset[] = [
    { label: 'Gráficas / KPIs', icon: 'fa-solid fa-chart-line' },
    { label: 'Código QR', icon: 'fa-solid fa-qrcode' },
    { label: 'Tarjeta de Crédito', icon: 'fa-solid fa-credit-card' },
    { label: 'Trofeo / Copa', icon: 'fa-solid fa-trophy' },
    { label: 'Balón de Fútbol', icon: 'fa-solid fa-futbol' },
    { label: 'Medalla / Insignia', icon: 'fa-solid fa-award' },
    { label: 'Rayo / Velocidad', icon: 'fa-solid fa-bolt' },
    { label: 'Cerebro / Agilidad', icon: 'fa-solid fa-brain' },
    { label: 'Escudo / Seguridad', icon: 'fa-solid fa-shield-halved' },
  ];

  // Form model
  currentForm: {
    id?: string;
    titulo: string;
    subtitulo: string;
    tag: string;
    tag_icono: string;
    badge_color: string;
    accent_gradient: string;
    icono: string;
    stat_numero: string;
    stat_label: string;
    card_preview_titulo: string;
    card_preview_desc: string;
    highlights: SliderHighlight[];
    boton_cta_texto: string;
    boton_cta_url: string;
    orden: number;
    activo: boolean;
    plataforma_destino: string;
    fecha_inicio: string;
    fecha_fin: string;
  } = this.getEmptyForm();

  // Computed metrics
  totalSliders = computed(() => this.slidersList().length);
  activeSlidersCount = computed(() => this.slidersList().filter(s => s.activo).length);
  inactiveSlidersCount = computed(() => this.slidersList().filter(s => !s.activo).length);
  mobileSlidersCount = computed(() => this.slidersList().filter(s => s.plataforma_destino === SliderPlataforma.MOBILE_APP || s.plataforma_destino === SliderPlataforma.TODAS).length);

  // Filtered list
  filteredSliders = computed(() => {
    let list = this.slidersList();

    // Filter by platform
    const plat = this.filterPlatform();
    if (plat !== SliderPlataforma.TODAS) {
      list = list.filter(s => s.plataforma_destino === SliderPlataforma.TODAS || s.plataforma_destino === plat);
    }

    // Filter by status
    const stat = this.filterStatus();
    if (stat === SliderEstadoFiltro.ACTIVOS) {
      list = list.filter(s => s.activo);
    } else if (stat === SliderEstadoFiltro.INACTIVOS) {
      list = list.filter(s => !s.activo);
    }

    // Filter by search query
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(s =>
        s.titulo.toLowerCase().includes(q) ||
        (s.subtitulo && s.subtitulo.toLowerCase().includes(q)) ||
        s.tag.toLowerCase().includes(q) ||
        (s.stat_numero && s.stat_numero.toLowerCase().includes(q)) ||
        (s.card_preview_titulo && s.card_preview_titulo.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => a.orden - b.orden);
  });

  // Active sliders for mobile simulator
  activeSimulatorSliders = computed(() => {
    const active = this.slidersList().filter(s => s.activo && (s.plataforma_destino === SliderPlataforma.TODAS || s.plataforma_destino === SliderPlataforma.MOBILE_APP));
    return active.length > 0 ? active.sort((a, b) => a.orden - b.orden) : this.slidersList();
  });

  ngOnInit(): void {
    this.loadSliders();
  }

  loadSliders(): void {
    this.loading.set(true);
    this.api.getSliders().subscribe({
      next: (data) => {
        this.slidersList.set(data || []);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando sliders:', err);
        this.loading.set(false);
        this.showToast('Error al conectar con el servidor de sliders.', true);
      },
    });
  }

  openCreateModal(): void {
    this.isEditing.set(false);
    this.modalActiveTab.set(SliderModalTab.GENERAL);
    this.currentForm = {
      ...this.getEmptyForm(),
      orden: this.slidersList().length + 1,
    };
    this.showEditModal.set(true);
  }

  openEditModal(slider: SliderPromocional): void {
    this.isEditing.set(true);
    this.modalActiveTab.set(SliderModalTab.GENERAL);
    
    // Normalize highlights
    let highlights: SliderHighlight[] = [];
    if (Array.isArray(slider.highlights) && slider.highlights.length > 0) {
      highlights = JSON.parse(JSON.stringify(slider.highlights));
    } else if (Array.isArray(slider.highlights_json) && slider.highlights_json.length > 0) {
      highlights = JSON.parse(JSON.stringify(slider.highlights_json));
    } else {
      highlights = [
        { icon: '⚡', text: 'Beneficio Principal', subtext: 'Detalle del beneficio' },
        { icon: '👥', text: 'Acceso Multi-Sede', subtext: 'Control en tiempo real' },
        { icon: '🔒', text: 'Seguridad Blindada', subtext: 'Cifrado de datos' },
      ];
    }

    this.currentForm = {
      id: slider.id,
      titulo: slider.titulo,
      subtitulo: slider.subtitulo || '',
      tag: slider.tag || 'Ecosistema Cloud',
      tag_icono: slider.tag_icono || '🏆',
      badge_color: slider.badge_color || '#10b981',
      accent_gradient: slider.accent_gradient || 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      icono: slider.icono || 'fa-solid fa-chart-line',
      stat_numero: slider.stat_numero || '',
      stat_label: slider.stat_label || '',
      card_preview_titulo: slider.card_preview_titulo || slider.titulo,
      card_preview_desc: slider.card_preview_desc || slider.subtitulo || '',
      highlights: highlights,
      boton_cta_texto: slider.boton_cta_texto || 'Siguiente',
      boton_cta_url: slider.boton_cta_url || '/auth/login',
      orden: slider.orden || 1,
      activo: slider.activo !== undefined ? slider.activo : true,
      plataforma_destino: slider.plataforma_destino || SliderPlataforma.TODAS,
      fecha_inicio: slider.fecha_inicio || '',
      fecha_fin: slider.fecha_fin || '',
    };

    this.showEditModal.set(true);
  }

  duplicateSlider(slider: SliderPromocional): void {
    this.isEditing.set(false);
    this.modalActiveTab.set(SliderModalTab.GENERAL);

    let highlights: SliderHighlight[] = [];
    if (Array.isArray(slider.highlights)) {
      highlights = JSON.parse(JSON.stringify(slider.highlights));
    } else if (Array.isArray(slider.highlights_json)) {
      highlights = JSON.parse(JSON.stringify(slider.highlights_json));
    }

    this.currentForm = {
      titulo: `${slider.titulo} (Copia)`,
      subtitulo: slider.subtitulo || '',
      tag: slider.tag,
      tag_icono: slider.tag_icono || '✨',
      badge_color: slider.badge_color || '#3b82f6',
      accent_gradient: slider.accent_gradient || 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      icono: slider.icono || 'fa-solid fa-star',
      stat_numero: slider.stat_numero || '',
      stat_label: slider.stat_label || '',
      card_preview_titulo: slider.card_preview_titulo || '',
      card_preview_desc: slider.card_preview_desc || '',
      highlights: highlights.length > 0 ? highlights : [
        { icon: '✨', text: 'Nueva característica', subtext: 'Descripción del módulo' }
      ],
      boton_cta_texto: slider.boton_cta_texto || 'Siguiente',
      boton_cta_url: slider.boton_cta_url || '/auth/login',
      orden: this.slidersList().length + 1,
      activo: true,
      plataforma_destino: slider.plataforma_destino || SliderPlataforma.TODAS,
      fecha_inicio: '',
      fecha_fin: '',
    };

    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
  }

  applyThemePreset(theme: PresetTheme): void {
    this.currentForm.badge_color = theme.badgeColor;
    this.currentForm.accent_gradient = theme.gradient;
  }

  addHighlight(): void {
    if (this.currentForm.highlights.length < 5) {
      this.currentForm.highlights.push({
        icon: '⭐',
        text: 'Nuevo Beneficio',
        subtext: 'Descripción destacada',
      });
    }
  }

  removeHighlight(index: number): void {
    if (this.currentForm.highlights.length > 1) {
      this.currentForm.highlights.splice(index, 1);
    }
  }

  saveSlider(): void {
    if (!this.currentForm.titulo.trim() || !this.currentForm.tag.trim()) {
      this.showToast('Por favor completa los campos obligatorios (*).', true);
      return;
    }

    this.saving.set(true);

    const payload: Partial<SliderPromocional> = {
      titulo: this.currentForm.titulo,
      subtitulo: this.currentForm.subtitulo,
      tag: this.currentForm.tag,
      tag_icono: this.currentForm.tag_icono,
      badge_color: this.currentForm.badge_color,
      accent_gradient: this.currentForm.accent_gradient,
      icono: this.currentForm.icono,
      stat_numero: this.currentForm.stat_numero,
      stat_label: this.currentForm.stat_label,
      card_preview_titulo: this.currentForm.card_preview_titulo || this.currentForm.titulo,
      card_preview_desc: this.currentForm.card_preview_desc || this.currentForm.subtitulo,
      highlights: this.currentForm.highlights,
      highlights_json: this.currentForm.highlights,
      boton_cta_texto: this.currentForm.boton_cta_texto,
      boton_cta_url: this.currentForm.boton_cta_url,
      orden: Number(this.currentForm.orden) || 1,
      activo: this.currentForm.activo,
      plataforma_destino: this.currentForm.plataforma_destino as any,
      fecha_inicio: this.currentForm.fecha_inicio || null,
      fecha_fin: this.currentForm.fecha_fin || null,
    };

    if (this.isEditing() && this.currentForm.id) {
      this.api.updateSlider(this.currentForm.id, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeEditModal();
          this.loadSliders();
          this.showToast('¡Slider promocional actualizado exitosamente!');
        },
        error: (err) => {
          this.saving.set(false);
          console.error(err);
          this.showToast('Error al actualizar el slider promocional.', true);
        },
      });
    } else {
      this.api.createSlider(payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeEditModal();
          this.loadSliders();
          this.showToast('¡Nuevo slider promocional creado exitosamente!');
        },
        error: (err) => {
          this.saving.set(false);
          console.error(err);
          this.showToast('Error al crear el slider promocional.', true);
        },
      });
    }
  }

  toggleActivo(slider: SliderPromocional): void {
    this.api.toggleSliderActivo(slider.id).subscribe({
      next: () => {
        slider.activo = !slider.activo;
        this.showToast(`Slider '${slider.titulo}' ${slider.activo ? 'activado' : 'desactivado'}.`);
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error al cambiar estado del slider.', true);
      },
    });
  }

  onMoveOrder(event: { slider: SliderPromocional; direction: 'UP' | 'DOWN' }): void {
    this.moveOrder(event.slider, event.direction);
  }

  moveOrder(slider: SliderPromocional, direction: 'UP' | 'DOWN'): void {
    const list = [...this.filteredSliders()];
    const index = list.findIndex(s => s.id === slider.id);
    if (index === -1) return;

    if (direction === 'UP' && index > 0) {
      const temp = list[index - 1];
      list[index - 1] = list[index];
      list[index] = temp;
    } else if (direction === 'DOWN' && index < list.length - 1) {
      const temp = list[index + 1];
      list[index + 1] = list[index];
      list[index] = temp;
    } else {
      return;
    }

    const ids = list.map(s => s.id);
    this.api.reorderSliders(ids).subscribe({
      next: () => {
        this.loadSliders();
        this.showToast('Orden de sliders actualizado.');
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error al reordenar sliders.', true);
      },
    });
  }

  openDeleteModal(slider: SliderPromocional): void {
    this.itemToDelete.set(slider);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.itemToDelete.set(null);
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;

    this.api.deleteSlider(item.id).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.loadSliders();
        this.showToast(`Slider '${item.titulo}' eliminado exitosamente.`);
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error al eliminar el slider promocional.', true);
      },
    });
  }

  // Mobile Simulator controls
  openSimulator(): void {
    this.simulatorIndex.set(0);
    this.showSimulatorModal.set(true);
  }

  closeSimulator(): void {
    this.showSimulatorModal.set(false);
  }

  nextSimulatorSlide(): void {
    const max = this.activeSimulatorSliders().length - 1;
    this.simulatorIndex.update(i => (i < max ? i + 1 : 0));
  }

  prevSimulatorSlide(): void {
    const max = this.activeSimulatorSliders().length - 1;
    this.simulatorIndex.update(i => (i > 0 ? i - 1 : max));
  }

  setSimulatorSlide(idx: number): void {
    this.simulatorIndex.set(idx);
  }

  private getEmptyForm() {
    return {
      titulo: '',
      subtitulo: '',
      tag: 'Ecosistema Cloud',
      tag_icono: '🏆',
      badge_color: '#10b981',
      accent_gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      icono: 'fa-solid fa-chart-line',
      stat_numero: '100% Cloud',
      stat_label: 'Sincronización en vivo',
      card_preview_titulo: 'Panel Directivo & Metas',
      card_preview_desc: 'Visión consolidada de canteras, asistencias y alertas del club.',
      highlights: [
        { icon: '⚡', text: 'Dashboard con KPIs en Vivo', subtext: 'Métricas deportivas y operativas' },
        { icon: '👥', text: 'Multi-Sede & Categorías', subtext: 'Desde Sub-7 hasta Primera Élite' },
        { icon: '🔒', text: 'Perfiles Blindados SSL', subtext: 'Director DT, Deportista, Tutor' },
      ],
      boton_cta_texto: 'Siguiente',
      boton_cta_url: '/auth/login',
      orden: 1,
      activo: true,
      plataforma_destino: SliderPlataforma.TODAS,
      fecha_inicio: '',
      fecha_fin: '',
    };
  }

  private showToast(msg: string, isError = false): void {
    this.toastMessage.set(msg);
    this.isToastError.set(isError);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}

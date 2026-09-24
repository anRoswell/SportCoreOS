import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LandingDevicePreview, LandingBuilderTab, LandingThemeMode, TipoBloqueLanding, TipoContenidoLandingEnum } from '../../../../core/enums/domain.enums';
import { BloqueSeccionLanding, TipoContenidoLanding, TipoBloqueSeccion } from '../../../../core/services/api.service';
import { LandingPreviewSimulatorComponent } from '../landing-preview-simulator/landing-preview-simulator.component';

export interface ColorPreset {
  name: string;
  color: string;
  gradient: string;
}

@Component({
  selector: 'app-landing-editor-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LandingPreviewSimulatorComponent],
  templateUrl: './landing-editor-modal.component.html',
})
export class LandingEditorModalComponent {
  @Input({ required: true }) currentForm: any = null;
  @Input() isEditing = false;
  @Input() saving = false;
  @Input() activeTab: LandingBuilderTab = LandingBuilderTab.GENERAL;
  @Input() previewDevice: LandingDevicePreview = LandingDevicePreview.DESKTOP;
  @Input() selectedBlockIndex = 0;
  @Input() colorPresets: ColorPreset[] = [];
  @Input() contentTypes: { id: TipoContenidoLanding; label: string; icon: string; desc: string }[] = [];
  @Input() availableBlockTypes: { type: TipoBloqueSeccion; label: string; icon: string; desc: string }[] = [];

  @Output() activeTabChange = new EventEmitter<LandingBuilderTab>();
  @Output() previewDeviceChange = new EventEmitter<LandingDevicePreview>();
  @Output() selectedBlockIndexChange = new EventEmitter<number>();
  @Output() generateSlug = new EventEmitter<void>();
  @Output() applyColorPreset = new EventEmitter<ColorPreset>();
  @Output() addBlock = new EventEmitter<TipoBloqueSeccion>();
  @Output() moveBlock = new EventEmitter<{ index: number; direction: 'UP' | 'DOWN'; event: Event }>();
  @Output() removeBlock = new EventEmitter<{ index: number; event: Event }>();
  @Output() addStatItem = new EventEmitter<void>();
  @Output() removeStatItem = new EventEmitter<number>();
  @Output() addProgramItem = new EventEmitter<void>();
  @Output() removeProgramItem = new EventEmitter<number>();
  @Output() addPlanItem = new EventEmitter<void>();
  @Output() removePlanItem = new EventEmitter<number>();
  @Output() addTestimonioItem = new EventEmitter<void>();
  @Output() removeTestimonioItem = new EventEmitter<number>();
  @Output() addFaqItem = new EventEmitter<void>();
  @Output() removeFaqItem = new EventEmitter<number>();
  @Output() addImageItem = new EventEmitter<void>();
  @Output() removeImageItem = new EventEmitter<number>();
  @Output() addStoryItem = new EventEmitter<void>();
  @Output() removeStoryItem = new EventEmitter<number>();
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();

  readonly LandingBuilderTab = LandingBuilderTab;
  readonly LandingDevicePreview = LandingDevicePreview;
  readonly LandingThemeMode = LandingThemeMode;
  readonly TipoBloqueLanding = TipoBloqueLanding;
  readonly TipoContenidoLandingEnum = TipoContenidoLandingEnum;

  getSelectedBlock(): BloqueSeccionLanding | null {
    if (!this.currentForm || !this.currentForm.secciones_json) return null;
    const idx = this.selectedBlockIndex;
    return this.currentForm.secciones_json[idx] || this.currentForm.secciones_json[0] || null;
  }

  getTypeIcon(tipo: TipoContenidoLanding): string {
    switch (tipo) {
      case TipoContenidoLandingEnum.LANDING_PAGE: return 'fa-solid fa-globe';
      case TipoContenidoLandingEnum.PROMO_HERO: return 'fa-solid fa-wand-magic-sparkles';
      case TipoContenidoLandingEnum.STORIES_REEL: return 'fa-solid fa-mobile-screen';
      case TipoContenidoLandingEnum.BANNER_TOP: return 'fa-solid fa-bullhorn';
      case TipoContenidoLandingEnum.POPUP_MODAL: return 'fa-solid fa-window-maximize';
      default: return 'fa-solid fa-layer-group';
    }
  }
}

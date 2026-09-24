import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderModalTab } from '../../../../core/enums/domain.enums';
import type { ISliderHighlight, PresetTheme, IconPreset } from '../../sliders-promocionales.component';

@Component({
  selector: 'app-slider-editor-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './slider-editor-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderEditorModalComponent {
  @Input({ required: true }) showModal = false;
  @Input({ required: true }) isEditing = false;
  @Input({ required: true }) saving = false;
  @Input({ required: true }) modalActiveTab: SliderModalTab = SliderModalTab.GENERAL;
  @Input({ required: true }) currentForm!: {
    id?: string;
    titulo: string;
    subtitulo: string;
    tag: string;
    tag_icono: string;
    plataforma_destino: string;
    activo: boolean;
    orden: number;
    icono: string;
    badge_color: string;
    accent_gradient: string;
    card_preview_titulo: string;
    card_preview_desc: string;
    stat_numero: string;
    stat_label: string;
    highlights: ISliderHighlight[];
    boton_cta_texto: string;
    boton_cta_url: string;
  };
  @Input({ required: true }) presetThemes: PresetTheme[] = [];
  @Input({ required: true }) iconPresets: IconPreset[] = [];

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<void>();
  @Output() tabChange = new EventEmitter<SliderModalTab>();
  @Output() addHighlightEv = new EventEmitter<void>();
  @Output() removeHighlightEv = new EventEmitter<number>();
  @Output() applyPresetEv = new EventEmitter<PresetTheme>();

  readonly TabEnum = SliderModalTab;

  setTab(tab: SliderModalTab): void {
    this.tabChange.emit(tab);
  }

  onClose(): void {
    this.close.emit();
  }

  onSave(): void {
    this.save.emit();
  }

  onAddHighlight(): void {
    this.addHighlightEv.emit();
  }

  onRemoveHighlight(index: number): void {
    this.removeHighlightEv.emit(index);
  }

  onApplyTheme(preset: PresetTheme): void {
    this.applyPresetEv.emit(preset);
  }
}

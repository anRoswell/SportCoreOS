import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SliderPromocional, SliderHighlight } from '../../../../core/services/api.service';

@Component({
  selector: 'app-slider-simulator-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './slider-simulator-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SliderSimulatorModalComponent {
  @Input({ required: true }) sliders: SliderPromocional[] = [];
  @Input() activeIndex = 0;

  @Output() setSlide = new EventEmitter<number>();
  @Output() prevSlide = new EventEmitter<void>();
  @Output() nextSlide = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  get currentSlide(): SliderPromocional | null {
    if (!this.sliders || this.sliders.length === 0) return null;
    return this.sliders[this.activeIndex] || this.sliders[0] || null;
  }

  getSimulatorHighlights(slide: SliderPromocional): SliderHighlight[] {
    if (slide.highlights && Array.isArray(slide.highlights) && slide.highlights.length > 0) {
      return slide.highlights;
    }
    return [
      { icon: '⚡', text: 'Gestión Cloud Integral', subtext: 'Tiempo real' },
      { icon: '🛡️', text: 'Acceso Seguro y Biométrico', subtext: 'QR dinámico' },
      { icon: '🏆', text: 'Gamificación & Ecosistema PRO', subtext: 'Rating evolutivo' },
    ];
  }
}

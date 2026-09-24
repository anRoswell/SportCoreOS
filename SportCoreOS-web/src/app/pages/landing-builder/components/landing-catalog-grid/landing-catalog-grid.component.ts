import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LandingPage, TipoContenidoLanding } from '../../../../core/services/api.service';

@Component({
  selector: 'app-landing-catalog-grid',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-catalog-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingCatalogGridComponent {
  @Input({ required: true }) landings: LandingPage[] = [];
  @Input() loading = false;

  @Output() edit = new EventEmitter<LandingPage>();
  @Output() openLeads = new EventEmitter<{ item: LandingPage; event: Event }>();
  @Output() copyUrl = new EventEmitter<{ slug: string; event: Event }>();
  @Output() duplicate = new EventEmitter<{ item: LandingPage; event: Event }>();
  @Output() delete = new EventEmitter<{ item: LandingPage; event: Event }>();
  @Output() toggleEstado = new EventEmitter<{ item: LandingPage; event: Event }>();
  @Output() create = new EventEmitter<void>();

  getTypeBadgeClass(tipo: TipoContenidoLanding): string {
    switch (tipo) {
      case 'LANDING_PAGE': return 'badge-landing';
      case 'PROMO_HERO': return 'badge-promo';
      case 'STORIES_REEL': return 'badge-stories';
      case 'BANNER_TOP': return 'badge-banner';
      case 'POPUP_MODAL': return 'badge-popup';
      default: return 'badge-default';
    }
  }

  getTypeIcon(tipo: TipoContenidoLanding): string {
    switch (tipo) {
      case 'LANDING_PAGE': return 'fa-solid fa-globe';
      case 'PROMO_HERO': return 'fa-solid fa-wand-magic-sparkles';
      case 'STORIES_REEL': return 'fa-solid fa-mobile-screen';
      case 'BANNER_TOP': return 'fa-solid fa-bullhorn';
      case 'POPUP_MODAL': return 'fa-solid fa-window-maximize';
      default: return 'fa-solid fa-layer-group';
    }
  }

  getTypeLabel(tipo: TipoContenidoLanding): string {
    switch (tipo) {
      case 'LANDING_PAGE': return 'Landing Page';
      case 'PROMO_HERO': return 'Promo Hero';
      case 'STORIES_REEL': return 'Historias / Reels';
      case 'BANNER_TOP': return 'Banner Top';
      case 'POPUP_MODAL': return 'Popup Lead';
      default: return tipo;
    }
  }
}

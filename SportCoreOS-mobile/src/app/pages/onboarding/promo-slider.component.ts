import { Component, inject, signal, HostListener, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';

export interface PromoSlide {
  id: string | number;
  tag: string;
  tagIcon: string;
  badgeColor: string;
  accentGradient: string;
  title: string;
  subtitle: string;
  icon: string;
  highlights: { icon: string; text: string; subtext?: string }[];
  statNumber: string;
  statLabel: string;
  cardPreviewTitle: string;
  cardPreviewDesc: string;
  ctaText?: string;
  ctaUrl?: string;
}

const DEFAULT_PROMO_SLIDES: PromoSlide[] = [
  {
    id: 1,
    tag: 'Ecosistema Cloud 360°',
    tagIcon: '🏆',
    badgeColor: '#10b981',
    accentGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    title: 'Gestión Integral de Clubes',
    subtitle: 'Conecta a directores técnicos, deportistas y directivos con métricas en tiempo real y cero fricción operativa.',
    icon: 'fa-solid fa-chart-line',
    statNumber: '100% Cloud',
    statLabel: 'Sincronización en vivo',
    cardPreviewTitle: 'Panel Directivo & Metas',
    cardPreviewDesc: 'Visión consolidada de canteras, asistencias y alertas del club.',
    highlights: [
      { icon: '⚡', text: 'Dashboard con KPIs en Vivo', subtext: 'Métricas deportivas y operativas' },
      { icon: '👥', text: 'Multi-Sede & Categorías', subtext: 'Desde Sub-7 hasta Primera Élite' },
      { icon: '🔒', text: 'Perfiles Blindados SSL', subtext: 'Director DT, Deportista, Tutor' }
    ],
    ctaText: 'Siguiente',
    ctaUrl: '/auth/login'
  },
  {
    id: 2,
    tag: 'Planilla de Campo',
    tagIcon: '📋',
    badgeColor: '#3b82f6',
    accentGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
    title: 'Pase de Lista con Código QR',
    subtitle: 'Controla entrenamientos con check-in táctil o QR en cancha. Registra puntualidad, novedades y microciclos.',
    icon: 'fa-solid fa-qrcode',
    statNumber: 'Check-in QR',
    statLabel: 'Registro en segundos',
    cardPreviewTitle: 'Control de Asistencia DT',
    cardPreviewDesc: '8 Presentes, 1 Retraso justificado, 1 Novedad médica.',
    highlights: [
      { icon: '📲', text: 'Pase Táctil & Escáner QR', subtext: 'Sin planillas ni hojas de papel' },
      { icon: '⏱️', text: 'Puntualidad & Retrasos', subtext: 'Monitoreo de disciplina' },
      { icon: '💪', text: 'Microciclos & Cargas Físicas', subtext: 'Control de intensidad técnica' }
    ],
    ctaText: 'Siguiente',
    ctaUrl: '/auth/login'
  },
  {
    id: 3,
    tag: 'Finanzas & Recaudos',
    tagIcon: '💳',
    badgeColor: '#10b981',
    accentGradient: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)',
    title: 'Pagos Online PSE & Wompi',
    subtitle: 'Automatiza el recaudo de pensiones, matrículas y arbitrajes con pasarela segura y paz y salvo instantáneo.',
    icon: 'fa-solid fa-credit-card',
    statNumber: '$220,000 COP',
    statLabel: 'Cartera & extractos claros',
    cardPreviewTitle: 'Estado de Cuenta & Cartera',
    cardPreviewDesc: 'Pensión Mensual, Arbitrajes y Poliza con pago integrado.',
    highlights: [
      { icon: '💰', text: 'Pasarela PSE & Tarjetas', subtext: 'Pago directo sin desplazamientos' },
      { icon: '📄', text: 'Paz y Salvo Instantáneo', subtext: 'Certificado digital verificable' },
      { icon: '📊', text: 'Recibos & Trazabilidad', subtext: 'Historial bancario por familia' }
    ],
    ctaText: 'Siguiente',
    ctaUrl: '/auth/login'
  },
  {
    id: 4,
    tag: 'Gamificación & Retos',
    tagIcon: '🎮',
    badgeColor: '#f59e0b',
    accentGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    title: 'Modo Carrera & Carta FUT',
    subtitle: 'Motiva el talento con cartas digitales interactivas, retos físicos en cancha validados por el DT y niveles XP.',
    icon: 'fa-solid fa-trophy',
    statNumber: 'Nivel 7 • Oro',
    statLabel: 'XP acumulada en cancha',
    cardPreviewTitle: 'Modo Carrera: Evolution',
    cardPreviewDesc: 'Carlos • Extremo 84 (RIT 87, TIR 82, PAS 85, REG 86).',
    highlights: [
      { icon: '🌟', text: 'Carta FUT de Atributos', subtext: 'Ritmo, tiro, pase, regate y físico' },
      { icon: '🎯', text: 'Retos Físicos & Técnicos', subtext: 'Flexiones, tiros libres y sprint' },
      { icon: '🏆', text: 'Leaderboard del Club', subtext: 'Trivias tácticas y medallas pro' }
    ],
    ctaText: 'Siguiente',
    ctaUrl: '/auth/login'
  },
  {
    id: 5,
    tag: 'Escenarios & Especialización',
    tagIcon: '🏟️',
    badgeColor: '#ec4899',
    accentGradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    title: 'Clínicas Pro, Canchas & Tienda',
    subtitle: 'Reserva escenarios deportivos con iluminación nocturna, adquiere uniformes oficiales y participa en clínicas.',
    icon: 'fa-solid fa-futbol',
    statNumber: 'Todo en Uno',
    statLabel: 'Canchas, kits y clínicas',
    cardPreviewTitle: 'Infraestructura & Tienda',
    cardPreviewDesc: 'Canchas sintéticas, neuro-agilidad Fitlight y uniformes.',
    highlights: [
      { icon: '🏟️', text: 'Alquiler de Canchas & Luces', subtext: 'Disponibilidad horaria en tiempo real' },
      { icon: '🧠', text: 'Clínicas de Micro-Habilidades', subtext: 'Sensores láser y luces Fitlight' },
      { icon: '👕', text: 'Tienda Oficial de Indumentaria', subtext: 'Kits y dorsales personalizados' }
    ],
    ctaText: '¡Entrar a la Cancha! ⚡',
    ctaUrl: '/auth/login'
  }
];

@Component({
  selector: 'app-promo-slider',
  standalone: true,
  imports: [CommonModule, RouterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="onboarding-container" 
         (touchstart)="onTouchStart($event)" 
         (touchend)="onTouchEnd($event)">
      
      <!-- Top Ambient Dynamic Spotlight Glow -->
      <div class="ambient-glow" [style.background]="currentSlide().badgeColor"></div>

      <!-- Top Bar: Brand + Skip Button -->
      <header class="onboarding-header">
        <div class="brand-pill">
          <div class="logo-circle">
            <span class="logo-emoji">⚽</span>
          </div>
          <div class="brand-text">
            <span class="brand-name">SportCore<span class="os-tag">OS</span></span>
            <span class="brand-sub">Cloud Athletic Pro</span>
          </div>
        </div>

        <button class="skip-btn" (click)="omitir()" aria-label="Omitir presentación">
          <span>Omitir</span>
          <i class="fa-solid fa-angles-right"></i>
        </button>
      </header>

      <!-- Slides Carousel Wrapper -->
      <main class="slider-viewport">
        <div class="slides-track" [style.transform]="'translateX(' + (-currentIndex() * 100) + '%)'">
          
          @for (slide of slides(); track slide.id; let idx = $index) {
            <div class="slide-item" [class.active]="idx === currentIndex()">
              
              <!-- Slide Header Tag -->
              <div class="slide-badge" [style.borderColor]="slide.badgeColor" [style.color]="slide.badgeColor">
                <span class="badge-icon">{{ slide.tagIcon }}</span>
                <span class="badge-title">{{ slide.tag }}</span>
              </div>

              <!-- Main Slide Hero Card -->
              <div class="hero-mockup-card">
                <div class="mockup-glow" [style.borderColor]="slide.badgeColor + '55'">
                  
                  <!-- Top Card Bar -->
                  <div class="card-top-bar">
                    <div class="card-tag-pill">
                      <span class="pulse-dot" [style.backgroundColor]="slide.badgeColor"></span>
                      <span>{{ slide.cardPreviewTitle }}</span>
                    </div>
                    <span class="card-status-pill">En Vivo</span>
                  </div>

                  <!-- Visual Graphic Centerpiece -->
                  <div class="card-centerpiece">
                    <div class="icon-avatar" [style.background]="slide.accentGradient">
                      <i [class]="slide.icon"></i>
                    </div>
                    <div class="centerpiece-info">
                      <h3 class="centerpiece-title">{{ slide.title }}</h3>
                      <p class="centerpiece-desc">{{ slide.cardPreviewDesc }}</p>
                    </div>
                  </div>

                  <!-- Feature Highlight Chips -->
                  <div class="feature-chips">
                    @for (item of slide.highlights; track item.text) {
                      <div class="chip-item">
                        <span class="chip-icon">{{ item.icon }}</span>
                        <div class="chip-text">
                          <strong class="chip-main">{{ item.text }}</strong>
                          @if (item.subtext) {
                            <span class="chip-sub">{{ item.subtext }}</span>
                          }
                        </div>
                      </div>
                    }
                  </div>

                  <!-- Quick Metric Pill -->
                  <div class="metric-ribbon">
                    <div class="metric-number" [style.color]="slide.badgeColor">{{ slide.statNumber }}</div>
                    <div class="metric-label">{{ slide.statLabel }}</div>
                  </div>

                </div>
              </div>

              <!-- Text Content Details -->
              <div class="slide-text-content">
                <h2 class="slide-headline">{{ slide.title }}</h2>
                <p class="slide-subtitle">{{ slide.subtitle }}</p>
              </div>

            </div>
          }

        </div>
      </main>

      <!-- Bottom Controls & Pagination -->
      <footer class="onboarding-footer">
        
        <!-- Pagination Indicator Dots -->
        <div class="pagination-dots" role="tablist">
          @for (s of slides(); track s.id; let i = $index) {
            <button class="dot-btn" 
                    [class.active]="i === currentIndex()"
                    [style.backgroundColor]="i === currentIndex() ? currentSlide().badgeColor : '#334155'"
                    [style.boxShadow]="i === currentIndex() ? '0 0 12px ' + currentSlide().badgeColor : 'none'"
                    (click)="irASlide(i)"
                    [attr.aria-label]="'Ir a diapositiva ' + (i + 1)">
            </button>
          }
        </div>

        <!-- Navigation Buttons -->
        <div class="action-buttons">
          @if (currentIndex() > 0) {
            <button class="btn-prev" (click)="anterior()" aria-label="Diapositiva anterior">
              <i class="fa-solid fa-arrow-left"></i>
            </button>
          }

          <button class="btn-primary" 
                  [style.background]="currentSlide().accentGradient"
                  (click)="siguiente()">
            <span>{{ isLastSlide() ? (currentSlide().ctaText || '¡Entrar a la Cancha!') : 'Siguiente' }}</span>
            <i [class]="isLastSlide() ? 'fa-solid fa-bolt' : 'fa-solid fa-arrow-right'"></i>
          </button>
        </div>

      </footer>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      background-color: #060b14;
      color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      user-select: none;
    }

    .onboarding-container {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100vh;
      max-width: 540px;
      margin: 0 auto;
      background: linear-gradient(180deg, #090e1a 0%, #060a12 100%);
      overflow: hidden;
    }

    /* Ambient glow */
    .ambient-glow {
      position: absolute;
      top: -120px;
      left: 50%;
      transform: translateX(-50%);
      width: 320px;
      height: 320px;
      border-radius: 50%;
      opacity: 0.22;
      filter: blur(80px);
      pointer-events: none;
      transition: background 0.5s ease;
      z-index: 1;
    }

    /* Header */
    .onboarding-header {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px 8px;
    }

    .brand-pill {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 6px 14px;
      border-radius: 999px;
      backdrop-filter: blur(12px);
    }

    .logo-circle {
      width: 26px;
      height: 26px;
      background: linear-gradient(135deg, #10b981, #06b6d4);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 13px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #ffffff;
    }

    .os-tag {
      color: #10b981;
      margin-left: 2px;
    }

    .brand-sub {
      font-size: 9px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .skip-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(148, 163, 184, 0.2);
      color: #94a3b8;
      font-size: 12px;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 20px;
      cursor: pointer;
      backdrop-filter: blur(8px);
      transition: all 0.2s ease;
    }

    .skip-btn:hover {
      color: #ffffff;
      border-color: rgba(255, 255, 255, 0.4);
      background: rgba(51, 65, 85, 0.8);
    }

    /* Viewport & Track */
    .slider-viewport {
      position: relative;
      z-index: 5;
      flex: 1;
      display: flex;
      overflow: hidden;
      touch-action: pan-y pinch-zoom;
    }

    .slides-track {
      display: flex;
      width: 100%;
      height: 100%;
      transition: transform 0.45s cubic-bezier(0.25, 1, 0.5, 1);
      will-change: transform;
    }

    .slide-item {
      flex: 0 0 100%;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 10px 24px 16px;
      box-sizing: border-box;
      text-align: center;
    }

    /* Badge */
    .slide-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: 999px;
      border: 1.5px solid;
      background: rgba(15, 23, 42, 0.85);
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-bottom: 14px;
      backdrop-filter: blur(8px);
    }

    /* Hero Mockup Card */
    .hero-mockup-card {
      width: 100%;
      max-width: 360px;
      margin-bottom: 18px;
    }

    .mockup-glow {
      background: rgba(15, 23, 42, 0.75);
      border: 1.5px solid;
      border-radius: 24px;
      padding: 16px;
      backdrop-filter: blur(16px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
      transition: border-color 0.4s ease;
    }

    .card-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }

    .card-tag-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: #94a3b8;
      font-weight: 600;
    }

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      box-shadow: 0 0 8px currentColor;
      animation: pulseAnim 1.8s infinite;
    }

    @keyframes pulseAnim {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }

    .card-status-pill {
      font-size: 10px;
      font-weight: 700;
      color: #10b981;
      background: rgba(16, 185, 129, 0.15);
      padding: 2px 8px;
      border-radius: 8px;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    /* Centerpiece */
    .card-centerpiece {
      display: flex;
      align-items: center;
      gap: 14px;
      background: rgba(10, 15, 29, 0.85);
      padding: 12px 14px;
      border-radius: 16px;
      margin-bottom: 12px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      text-align: left;
    }

    .icon-avatar {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      color: #ffffff;
      flex-shrink: 0;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
    }

    .centerpiece-info {
      flex: 1;
      min-width: 0;
    }

    .centerpiece-title {
      font-size: 14px;
      font-weight: 700;
      color: #ffffff;
      margin: 0 0 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .centerpiece-desc {
      font-size: 11px;
      color: #94a3b8;
      margin: 0;
      line-height: 1.3;
    }

    /* Feature Chips */
    .feature-chips {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 12px;
    }

    .chip-item {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(30, 41, 59, 0.5);
      padding: 7px 12px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.04);
      text-align: left;
    }

    .chip-icon {
      font-size: 14px;
      line-height: 1;
    }

    .chip-text {
      display: flex;
      flex-direction: column;
      font-size: 11px;
    }

    .chip-main {
      color: #e2e8f0;
      font-weight: 600;
    }

    .chip-sub {
      color: #94a3b8;
      font-size: 10px;
    }

    /* Metric Ribbon */
    .metric-ribbon {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(10, 15, 29, 0.95);
      padding: 8px 14px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .metric-number {
      font-size: 15px;
      font-weight: 800;
      letter-spacing: 0.3px;
    }

    .metric-label {
      font-size: 11px;
      color: #94a3b8;
      font-weight: 500;
    }

    /* Text details */
    .slide-text-content {
      max-width: 380px;
    }

    .slide-headline {
      font-size: 20px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.25;
      margin: 0 0 6px;
      letter-spacing: -0.2px;
    }

    .slide-subtitle {
      font-size: 13px;
      color: #94a3b8;
      line-height: 1.45;
      margin: 0;
    }

    /* Footer */
    .onboarding-footer {
      position: relative;
      z-index: 10;
      padding: 12px 24px 28px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .pagination-dots {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
    }

    .dot-btn {
      height: 8px;
      width: 8px;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      padding: 0;
      transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    .dot-btn.active {
      width: 28px;
    }

    .action-buttons {
      display: flex;
      gap: 12px;
      align-items: center;
    }

    .btn-prev {
      width: 48px;
      height: 48px;
      border-radius: 16px;
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(148, 163, 184, 0.2);
      color: #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      cursor: pointer;
      backdrop-filter: blur(8px);
      transition: all 0.2s ease;
      flex-shrink: 0;
    }

    .btn-prev:hover {
      background: rgba(51, 65, 85, 0.9);
      color: #ffffff;
    }

    .btn-primary {
      flex: 1;
      height: 48px;
      border-radius: 16px;
      border: none;
      color: #ffffff;
      font-size: 15px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      transition: transform 0.2s ease, filter 0.2s ease;
    }

    .btn-primary:active {
      transform: scale(0.98);
      filter: brightness(0.92);
    }
  `]
})
export class PromoSliderComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  currentIndex = signal<number>(0);
  slides = signal<PromoSlide[]>(DEFAULT_PROMO_SLIDES);

  ngOnInit(): void {
    this.http.get<any>('http://localhost:3001/api/v1/sliders/publicos?plataforma=MOBILE_APP').subscribe({
      next: (res) => {
        const rawList = res?.data || res;
        if (Array.isArray(rawList) && rawList.length > 0) {
          const mapped: PromoSlide[] = rawList.map((item: any, idx: number) => {
            const highlights = Array.isArray(item.highlights) && item.highlights.length > 0
              ? item.highlights
              : (Array.isArray(item.highlights_json) && item.highlights_json.length > 0
                  ? item.highlights_json
                  : [
                      { icon: '⚡', text: item.titulo, subtext: item.subtitulo || '' }
                    ]);

            return {
              id: item.id || idx + 1,
              tag: item.tag || 'SportCoreOS Pro',
              tagIcon: item.tag_icono || '🏆',
              badgeColor: item.badge_color || '#10b981',
              accentGradient: item.accent_gradient || 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              title: item.titulo,
              subtitle: item.subtitulo || '',
              icon: item.icono || 'fa-solid fa-chart-line',
              statNumber: item.stat_numero || '100% Pro',
              statLabel: item.stat_label || 'Cloud Sync',
              cardPreviewTitle: item.card_preview_titulo || item.titulo,
              cardPreviewDesc: item.card_preview_desc || item.subtitulo || '',
              ctaText: item.boton_cta_texto,
              ctaUrl: item.boton_cta_url,
              highlights,
            };
          });
          this.slides.set(mapped);
        }
      },
      error: () => {
        // Keeps DEFAULT_PROMO_SLIDES as fallback
      }
    });
  }

  currentSlide = () => this.slides()[this.currentIndex()] || this.slides()[0];
  isLastSlide = () => this.currentIndex() === this.slides().length - 1;

  // Touch Swipe Handling
  private touchStartX = 0;
  private touchStartY = 0;

  onTouchStart(e: TouchEvent): void {
    this.touchStartX = e.changedTouches[0].clientX;
    this.touchStartY = e.changedTouches[0].clientY;
  }

  onTouchEnd(e: TouchEvent): void {
    const deltaX = e.changedTouches[0].clientX - this.touchStartX;
    const deltaY = e.changedTouches[0].clientY - this.touchStartY;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        this.siguiente();
      } else {
        this.anterior();
      }
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'ArrowRight') this.siguiente();
    if (e.key === 'ArrowLeft') this.anterior();
    if (e.key === 'Escape') this.omitir();
  }

  siguiente(): void {
    if (this.isLastSlide()) {
      this.finalizar();
    } else {
      this.currentIndex.update(i => Math.min(this.slides().length - 1, i + 1));
    }
  }

  anterior(): void {
    this.currentIndex.update(i => Math.max(0, i - 1));
  }

  irASlide(index: number): void {
    if (index >= 0 && index < this.slides().length) {
      this.currentIndex.set(index);
    }
  }

  omitir(): void {
    this.finalizar();
  }

  private finalizar(): void {
    try {
      localStorage.setItem('sportcore_seen_onboarding', 'true');
    } catch (_) {}

    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}

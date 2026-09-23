import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../core/services/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="mobile-loading-bar" [style.background]="'linear-gradient(90deg, ' + currentQuote().accentColor + ', ' + currentQuote().secondaryColor + ')'"></div>
      
      <div class="mobile-loading-backdrop">
        <div class="spinner-card" [style.boxShadow]="'0 12px 35px ' + currentQuote().glowColor">
          <!-- Insignia de Leyenda -->
          <div class="legend-badge" [style.borderColor]="currentQuote().accentColor" [style.color]="currentQuote().accentColor">
            <i class="fa-solid" [class]="currentQuote().icon"></i>
            <span>{{ currentQuote().badge }}</span>
          </div>

          <!-- Balón Animado SVG -->
          <div class="ball-stage">
            <svg class="ball-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#0f172a" stroke-width="3" />
              <polygon points="50,32 63,42 58,57 42,57 37,42" fill="#0f172a" />
              <path d="M 50 32 L 50 12" stroke="#0f172a" stroke-width="2.5" />
              <path d="M 63 42 L 82 36" stroke="#0f172a" stroke-width="2.5" />
              <path d="M 58 57 L 72 74" stroke="#0f172a" stroke-width="2.5" />
              <path d="M 42 57 L 28 74" stroke="#0f172a" stroke-width="2.5" />
              <path d="M 37 42 L 18 36" stroke="#0f172a" stroke-width="2.5" />
              <polygon points="50,12 36,4 24,14 30,26 50,12" fill="#1e293b" />
              <polygon points="82,36 94,44 92,60 78,58 63,42" fill="#1e293b" />
              <polygon points="72,74 76,90 60,96 52,84 58,57" fill="#1e293b" />
              <polygon points="28,74 24,90 40,96 48,84 42,57" fill="#1e293b" />
              <polygon points="18,36 6,44 8,60 22,58 37,42" fill="#1e293b" />
            </svg>
            <div class="aura-glow" [style.boxShadow]="'0 0 25px ' + currentQuote().accentColor"></div>
          </div>

          <div class="quote-box">
            <strong class="speaker-title">{{ currentQuote().character }}</strong>
            <p class="quote-text">{{ currentQuote().quote }}</p>
          </div>

          <div class="status-indicator">
            <div class="spin-ring" [style.borderTopColor]="currentQuote().accentColor"></div>
            <span class="loading-label">{{ loadingService.message() || currentQuote().actionText }}</span>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .mobile-loading-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      z-index: 99999;
      animation: barSlide 1.2s infinite ease-in-out;
    }

    .mobile-loading-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(11, 15, 25, 0.82);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      z-index: 99998;
      animation: fadeIn 0.2s ease-out forwards;
    }

    .spinner-card {
      width: 100%;
      max-width: 320px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 18px;
      padding: 1.5rem 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.85rem;
      animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .legend-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      border: 1px solid;
      background: rgba(255, 255, 255, 0.05);
    }

    .ball-stage {
      position: relative;
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0.25rem 0;
    }

    .ball-svg {
      width: 100%;
      height: 100%;
      animation: spinBall 3s linear infinite;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
    }

    .aura-glow {
      position: absolute;
      inset: 4px;
      border-radius: 50%;
      z-index: -1;
      animation: pulseGlow 1.5s infinite alternate ease-in-out;
    }

    .quote-box {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .speaker-title {
      font-size: 0.95rem;
      font-weight: 800;
      color: #ffffff;
    }

    .quote-text {
      font-size: 0.78rem;
      color: #94a3b8;
      font-style: italic;
      line-height: 1.35;
      margin: 0;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(0, 0, 0, 0.3);
      padding: 0.3rem 0.75rem;
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.06);

      .spin-ring {
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 50%;
        animation: spinRing 0.8s linear infinite;
      }

      .loading-label {
        font-size: 0.74rem;
        font-weight: 700;
        color: #f1f5f9;
      }
    }

    @keyframes spinBall {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes spinRing {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes pulseGlow {
      0% { transform: scale(0.9); opacity: 0.5; }
      100% { transform: scale(1.15); opacity: 0.9; }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes popIn {
      from { transform: scale(0.9); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    @keyframes barSlide {
      0% { width: 0%; left: 0; }
      50% { width: 70%; left: 30%; }
      100% { width: 0%; left: 100%; }
    }
  `]
})
export class LoadingSpinnerComponent {
  loadingService = inject(LoadingService);

  currentQuote() {
    return this.loadingService.currentQuote();
  }
}

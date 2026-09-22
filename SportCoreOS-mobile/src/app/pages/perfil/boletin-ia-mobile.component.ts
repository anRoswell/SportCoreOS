import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';

export interface MetricaRendimiento {
  label: string;
  valor: number;
  max: number;
  unidad: string;
  icono: string;
  color: string;
}

@Component({
  selector: 'app-boletin-ia-mobile',
  standalone: true,
  imports: [CommonModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  template: `
    <app-mobile-header></app-mobile-header>

    <div class="boletin-subbar">
      <div class="subbar-left">
        <a routerLink="/perfil" class="btn-back"><i class="fa-solid fa-arrow-left"></i></a>
        <h2>Boletín de Rendimiento IA</h2>
      </div>
      <button class="btn-icon-refresh" [class.spinning]="isRefreshing()" (click)="recargarBoletin()" title="Actualizar">
        <i class="fa-solid fa-arrows-rotate"></i>
      </button>
    </div>

    <main class="boletin-container">
      <!-- Tarjeta Resumen del Deportista -->
      <section class="athlete-card">
        <div class="athlete-avatar">
          <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80" alt="Mateo Morales" />
          <span class="dorsal">#10</span>
        </div>
        <div class="athlete-info">
          <h2>Mateo Morales</h2>
          <p>Delantero &bull; Categoría Sub-15 A</p>
          <div class="ia-score">
            <i class="fa-solid fa-bolt"></i> Overall Rating: <strong>88/100</strong>
          </div>
        </div>
      </section>

      <!-- Informe Generado por Inteligencia Artificial (Gemini) -->
      <section class="ia-insight-card">
        <div class="insight-header">
          <div class="ia-badge">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            <span>Análisis Táctico Gemini IA</span>
          </div>
          <span class="periodo">Mes: Septiembre 2026</span>
        </div>

        <div class="ia-content">
          <p class="summary-text">
            "Mateo demuestra una <strong>alta efectividad en transiciones ofensivas (85%)</strong> y aceleración en el último tercio de cancha. Se observa una notable mejora en el apoyo defensivo durante repliegue táctico."
          </p>

          <div class="highlight-pills">
            <div class="pill strong">
              <i class="fa-solid fa-circle-check"></i> Fortaleza: <strong>Definición & Uno contra Uno</strong>
            </div>
            <div class="pill focus">
              <i class="fa-solid fa-bullseye"></i> Foco de Trabajo: <strong>Orientación corporal en remate zurdo</strong>
            </div>
          </div>
        </div>
      </section>

      <!-- Métricas Físicas & Tácticas -->
      <section class="metrics-section">
        <h3>Métricas de Rendimiento en Campo</h3>
        <div class="metrics-grid">
          @for (m of metricas; track m.label) {
            <div class="metric-card">
              <div class="metric-top">
                <i [class]="m.icono" [style.color]="m.color"></i>
                <span class="m-val">{{ m.valor }} <small>{{ m.unidad }}</small></span>
              </div>
              <span class="m-title">{{ m.label }}</span>
              <div class="progress-bar-wrap">
                <div class="progress-bar-fill" [style.width.%]="(m.valor / m.max) * 100" [style.background]="m.color"></div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Estadísticas de Asistencia y Disciplina -->
      <section class="stats-summary-card">
        <h3>Asistencia & Minutos Jugados</h3>
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-num text-success">96%</span>
            <span class="stat-lbl">Asistencia</span>
          </div>
          <div class="stat-item">
            <span class="stat-num text-primary">540'</span>
            <span class="stat-lbl">Minutos Torneo</span>
          </div>
          <div class="stat-item">
            <span class="stat-num text-warning">6</span>
            <span class="stat-lbl">Goles</span>
          </div>
          <div class="stat-item">
            <span class="stat-num text-info">4</span>
            <span class="stat-lbl">Asistencias</span>
          </div>
        </div>
      </section>
    </main>

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .boletin-subbar {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 1rem;
      background: #fff;
      border-bottom: 1px solid var(--border-color, #e2e8f0);

      .btn-back {
        color: #0f172a;
        font-size: 1.1rem;
        text-decoration: none;
      }

      h2 {
        font-size: 1.1rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0;
      }
    }

    .boletin-container {
      padding: 1.25rem;
      padding-bottom: calc(75px + var(--safe-area-bottom));
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .athlete-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      padding: 1.25rem;
      border-radius: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;

      .athlete-avatar {
        position: relative;
        width: 65px;
        height: 65px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid #10b981;

        img { width: 100%; height: 100%; object-fit: cover; }

        .dorsal {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.7);
          color: #fff;
          font-size: 0.6rem;
          font-weight: 800;
          text-align: center;
        }
      }

      .athlete-info {
        h2 { font-size: 1.15rem; font-weight: 800; margin: 0 0 0.2rem 0; color: #0f172a; }
        p { font-size: 0.78rem; color: #64748b; margin: 0 0 0.4rem 0; }

        .ia-score {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          background: #ecfdf5;
          color: #047857;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
        }
      }
    }

    /* Tarjeta IA */
    .ia-insight-card {
      background: linear-gradient(135deg, #093322 0%, #064e3b 100%);
      color: #fff;
      padding: 1.35rem;
      border-radius: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      box-shadow: 0 10px 25px -5px rgba(6, 78, 59, 0.35);

      .insight-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .ia-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(16, 185, 129, 0.25);
          color: #6ee7b7;
          padding: 0.25rem 0.65rem;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 700;
        }

        .periodo {
          font-size: 0.7rem;
          opacity: 0.8;
        }
      }

      .summary-text {
        font-size: 0.85rem;
        line-height: 1.5;
        margin: 0;
        opacity: 0.95;
      }

      .highlight-pills {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 0.35rem;

        .pill {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.6rem 0.85rem;
          border-radius: 8px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;

          &.strong i { color: #34d399; }
          &.focus i { color: #fbbf24; }
        }
      }
    }

    /* Métricas */
    .metrics-section {
      h3 { font-size: 0.95rem; font-weight: 800; color: #0f172a; margin: 0 0 0.75rem 0; }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;

        .metric-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 0.85rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;

          .metric-top {
            display: flex;
            justify-content: space-between;
            align-items: center;

            i { font-size: 1.1rem; }
            .m-val { font-size: 1.05rem; font-weight: 800; color: #0f172a; small { font-size: 0.65rem; font-weight: 600; color: #64748b; } }
          }

          .m-title {
            font-size: 0.72rem;
            font-weight: 700;
            color: #64748b;
          }

          .progress-bar-wrap {
            height: 5px;
            background: #f1f5f9;
            border-radius: 4px;
            overflow: hidden;

            .progress-bar-fill {
              height: 100%;
              border-radius: 4px;
            }
          }
        }
      }
    }

    /* Resumen de Asistencia */
    .stats-summary-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 1.25rem;
      padding: 1.15rem;

      h3 { font-size: 0.95rem; font-weight: 800; color: #0f172a; margin: 0 0 0.85rem 0; }

      .stats-row {
        display: flex;
        justify-content: space-between;

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;

          .stat-num { font-size: 1.25rem; font-weight: 800; }
          .stat-lbl { font-size: 0.68rem; font-weight: 700; color: #64748b; }
        }
      }
    }

    .text-success { color: #10b981; }
    .text-primary { color: #047857; }
    .text-warning { color: #f59e0b; }
    .text-info { color: #0284c7; }
  `]
})
export class BoletinIaMobileComponent {
  auth = inject(AuthService);
  isRefreshing = signal<boolean>(false);

  recargarBoletin(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
    }, 600);
  }

  metricas: MetricaRendimiento[] = [
    { label: 'Velocidad Punta', valor: 28.4, max: 35, unidad: 'km/h', icono: 'fa-solid fa-gauge-high', color: '#0284c7' },
    { label: 'Precisión Pases', valor: 88, max: 100, unidad: '%', icono: 'fa-solid fa-arrows-split-up-and-left', color: '#10b981' },
    { label: 'Distancia x Partido', valor: 7.2, max: 10, unidad: 'km', icono: 'fa-solid fa-person-running', color: '#8b5cf6' },
    { label: 'Resistencia Aeróbica', valor: 92, max: 100, unidad: '%', icono: 'fa-solid fa-heart-pulse', color: '#f59e0b' }
  ];
}

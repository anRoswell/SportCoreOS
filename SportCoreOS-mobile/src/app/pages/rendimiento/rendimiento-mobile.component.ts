import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';

export interface TestBiometrico {
  fecha: string;
  pesoKg: number;
  estaturaCm: number;
  imc: number;
  grasaPct: number;
  velocidad30mSeg: number;
  saltoVerticalCm: number;
  vo2Max: number;
}

@Component({
  selector: 'app-rendimiento-mobile',
  standalone: true,
  imports: [CommonModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  template: `
    <app-mobile-header></app-mobile-header>

    <div class="rend-subbar">
      <div class="subbar-left">
        <a routerLink="/perfil" class="btn-back"><i class="fa-solid fa-arrow-left"></i></a>
        <h2>Biometría & Radar Físico</h2>
      </div>
      <div class="subbar-right">
        <button class="btn-icon-refresh" [class.spinning]="isRefreshing()" (click)="recargarBiometria()" title="Actualizar">
          <i class="fa-solid fa-arrows-rotate"></i>
        </button>
        <a routerLink="/perfil/boletin-ia" class="btn-ia-report">
          <i class="fa-solid fa-wand-magic-sparkles"></i> Boletín IA
        </a>
      </div>
    </div>

    <main class="rend-container">
      <!-- Tarjeta Atributos FIFA / Radar -->
      <section class="fifa-card">
        <div class="card-glow"></div>
        <div class="fifa-top">
          <div class="rating-box">
            <span class="overall">88</span>
            <span class="pos">EXT</span>
          </div>
          <div class="player-visual">
            <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80" alt="Mateo Morales" />
          </div>
        </div>

        <h3 class="player-name">MATEO MORALES</h3>
        <p class="club-label">SPORTCORE ACADEMY &bull; SUB-15 A</p>

        <div class="fifa-stats-grid">
          <div class="stat-col">
            <div class="stat-item"><span class="val">91</span> <span class="lbl">PAC (Ritmo)</span></div>
            <div class="stat-item"><span class="val">84</span> <span class="lbl">SHO (Tiro)</span></div>
            <div class="stat-item"><span class="val">87</span> <span class="lbl">PAS (Pases)</span></div>
          </div>
          <div class="stat-col">
            <div class="stat-item"><span class="val">89</span> <span class="lbl">DRI (Regate)</span></div>
            <div class="stat-item"><span class="val">62</span> <span class="lbl">DEF (Defensa)</span></div>
            <div class="stat-item"><span class="val">80</span> <span class="lbl">PHY (Físico)</span></div>
          </div>
        </div>
      </section>

      <!-- Resumen Antropométrico -->
      <section class="bio-section">
        <h3><i class="fa-solid fa-ruler-combined text-primary"></i> Medidas Antropométricas</h3>
        <div class="bio-grid">
          <div class="bio-card">
            <span class="label">ESTATURA</span>
            <span class="val">{{ testActual.estaturaCm }} <small>cm</small></span>
            <span class="badge-trend positive"><i class="fa-solid fa-arrow-up"></i> +2.5 cm vs Ene</span>
          </div>

          <div class="bio-card">
            <span class="label">PESO CORPORAL</span>
            <span class="val">{{ testActual.pesoKg }} <small>kg</small></span>
            <span class="badge-trend neutral">IMC: {{ testActual.imc }}</span>
          </div>

          <div class="bio-card">
            <span class="label">% GRASA</span>
            <span class="val">{{ testActual.grasaPct }} <small>%</small></span>
            <span class="badge-trend positive"><i class="fa-solid fa-circle-check"></i> Rango Óptimo</span>
          </div>

          <div class="bio-card">
            <span class="label">VO2 MÁXIMO</span>
            <span class="val">{{ testActual.vo2Max }} <small>ml/kg</small></span>
            <span class="badge-trend positive"><i class="fa-solid fa-bolt"></i> Élite Sub-15</span>
          </div>
        </div>
      </section>

      <!-- Tests de Campo Físicos -->
      <section class="tests-section">
        <h3><i class="fa-solid fa-stopwatch text-warning"></i> Tests de Velocidad & Potencia</h3>
        <div class="tests-list">
          <div class="test-row">
            <div class="test-info">
              <strong>Sprint 30 Metros Lanzado</strong>
              <span>Aceleración & Velocidad Punta</span>
            </div>
            <span class="test-record">{{ testActual.velocidad30mSeg }}s</span>
          </div>

          <div class="test-row">
            <div class="test-info">
              <strong>Salto Vertical (CMJ)</strong>
              <span>Potencia de Tren Inferior</span>
            </div>
            <span class="test-record">{{ testActual.saltoVerticalCm }} cm</span>
          </div>
        </div>
      </section>
    </main>

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .rend-subbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1rem;
      background: #fff;
      border-bottom: 1px solid var(--border-color, #e2e8f0);

      .subbar-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;

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

      .btn-ia-report {
        background: linear-gradient(135deg, #047857 0%, #065f46 100%);
        color: #fff;
        text-decoration: none;
        padding: 0.45rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 0.35rem;
        box-shadow: 0 2px 6px rgba(4, 120, 87, 0.25);
      }
    }

    .rend-container {
      padding: 1rem;
      padding-bottom: calc(75px + var(--safe-area-bottom));
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    /* FIFA Style Card */
    .fifa-card {
      position: relative;
      background: linear-gradient(145deg, #1e293b 0%, #0f172a 60%, #022c22 100%);
      color: #fff;
      border-radius: 1.5rem;
      padding: 1.5rem;
      box-shadow: 0 16px 32px -8px rgba(15, 23, 42, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.12);
      overflow: hidden;

      .card-glow {
        position: absolute;
        top: -40px;
        right: -40px;
        width: 140px;
        height: 140px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, transparent 70%);
      }

      .fifa-top {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .rating-box {
          display: flex;
          flex-direction: column;
          align-items: center;

          .overall {
            font-size: 2.5rem;
            font-weight: 900;
            line-height: 1;
            color: #6ee7b7;
          }
          .pos {
            font-size: 0.95rem;
            font-weight: 800;
            opacity: 0.85;
          }
        }

        .player-visual {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid #10b981;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);

          img { width: 100%; height: 100%; object-fit: cover; }
        }
      }

      .player-name {
        font-size: 1.25rem;
        font-weight: 900;
        letter-spacing: 0.5px;
        margin: 0.75rem 0 0.2rem 0;
        text-align: center;
      }

      .club-label {
        font-size: 0.7rem;
        letter-spacing: 1px;
        color: #a7f3d0;
        text-align: center;
        margin: 0 0 1.25rem 0;
      }

      .fifa-stats-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        border-top: 1px solid rgba(255, 255, 255, 0.15);
        padding-top: 0.85rem;

        .stat-col {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;

          .stat-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .val {
              font-size: 1.1rem;
              font-weight: 900;
              min-width: 26px;
              color: #34d399;
            }
            .lbl {
              font-size: 0.72rem;
              font-weight: 700;
              opacity: 0.85;
            }
          }
        }
      }
    }

    /* Medidas */
    .bio-section, .tests-section {
      h3 {
        font-size: 0.95rem;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 0.75rem 0;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .bio-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.75rem;

        .bio-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          padding: 0.85rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;

          .label { font-size: 0.65rem; font-weight: 800; color: #64748b; }
          .val {
            font-size: 1.2rem;
            font-weight: 900;
            color: #0f172a;
            small { font-size: 0.7rem; font-weight: 600; color: #64748b; }
          }

          .badge-trend {
            font-size: 0.65rem;
            font-weight: 700;
            padding: 0.15rem 0.45rem;
            border-radius: 4px;
            width: fit-content;

            &.positive { background: #dcfce7; color: #166534; }
            &.neutral { background: #f1f5f9; color: #475569; }
          }
        }
      }
    }

    .tests-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;

      .test-row {
        background: #fff;
        border: 1px solid #e2e8f0;
        padding: 0.85rem 1rem;
        border-radius: 12px;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .test-info {
          display: flex;
          flex-direction: column;
          strong { font-size: 0.85rem; color: #0f172a; }
          span { font-size: 0.72rem; color: #64748b; }
        }

        .test-record {
          font-size: 1.15rem;
          font-weight: 900;
          color: #047857;
        }
      }
    }
  `]
})
export class RendimientoMobileComponent {
  auth = inject(AuthService);
  isRefreshing = signal<boolean>(false);

  recargarBiometria(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
    }, 600);
  }

  testActual: TestBiometrico = {
    fecha: '15 de Septiembre 2026',
    pesoKg: 58.4,
    estaturaCm: 168.5,
    imc: 20.6,
    grasaPct: 11.2,
    velocidad30mSeg: 3.92,
    saltoVerticalCm: 44.5,
    vo2Max: 54.2
  };
}

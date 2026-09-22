import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  template: `
    <app-mobile-header></app-mobile-header>

    <main class="mobile-page-content">
      <!-- HERO BIENVENIDA -->
      <div class="welcome-banner">
        <div class="welcome-text">
          <h3>¡Hola, {{ auth.currentUser()?.nombres || 'Deportista' }}! 👋</h3>
          <p>Bienvenido al panel móvil de <strong>{{ auth.activeClub().nombre }}</strong></p>
        </div>
        <div class="quick-status-chip">
          <i class="fa-solid fa-signal text-emerald"></i> En Línea
        </div>
      </div>

      <!-- TARJETAS KPIS RÁPIDOS -->
      <div class="kpi-carousel">
        <div class="kpi-mini-card">
          <div class="kpi-icon-pill icon-emerald">
            <i class="fa-solid fa-futbol"></i>
          </div>
          <div class="kpi-info">
            <span class="kpi-num">3</span>
            <span class="kpi-lbl">Partidos Próximos</span>
          </div>
        </div>

        <div class="kpi-mini-card">
          <div class="kpi-icon-pill icon-blue">
            <i class="fa-solid fa-clipboard-check"></i>
          </div>
          <div class="kpi-info">
            <span class="kpi-num">1</span>
            <span class="kpi-lbl">Citación Activa</span>
          </div>
        </div>

        <div class="kpi-mini-card">
          <div class="kpi-icon-pill icon-amber">
            <i class="fa-solid fa-bell"></i>
          </div>
          <div class="kpi-info">
            <span class="kpi-num">0</span>
            <span class="kpi-lbl">Pendientes</span>
          </div>
        </div>
      </div>

      <!-- PRÓXIMO ENCUENTRO DESTACADO -->
      <section class="section-block">
        <div class="section-header">
          <h4><i class="fa-solid fa-trophy text-amber"></i> Próximo Encuentro</h4>
          <a routerLink="/partidos" class="section-link">Ver Fixture</a>
        </div>

        @if (proximoPartido()) {
          <div class="match-highlight-card mobile-card">
            <div class="match-meta-top">
              <span class="cat-badge">⚽ {{ proximoPartido()?.categoria_nombre || 'Sub-17 Élite' }}</span>
              <span class="match-time-tag"><i class="fa-regular fa-clock"></i> {{ proximoPartido()?.hora_partido }}</span>
            </div>

            <div class="vs-row">
              <div class="team-side">
                <div class="team-icon">{{ auth.activeClub().sigla }}</div>
                <span class="team-label">{{ auth.activeClub().nombre }}</span>
              </div>
              <div class="vs-pill">VS</div>
              <div class="team-side">
                <div class="team-icon rival-icon">⚔️</div>
                <span class="team-label">{{ proximoPartido()?.rival_nombre }}</span>
              </div>
            </div>

            <div class="match-venue-row">
              <i class="fa-solid fa-location-dot text-amber"></i>
              <span>{{ proximoPartido()?.sede_cancha }}</span>
            </div>

            <div class="match-actions-row">
              <a routerLink="/convocatorias" [queryParams]="{ partidoId: proximoPartido()?.id }" class="btn-primary btn-sm">
                <i class="fa-solid fa-users"></i> Ver Convocatoria & Citación
              </a>
            </div>
          </div>
        } @else {
          <div class="empty-highlight mobile-card">
            <i class="fa-regular fa-calendar-check"></i>
            <p>No hay partidos programados para esta semana.</p>
          </div>
        }
      </section>

      <!-- ACCESOS RÁPIDOS MÓVILES -->
      <section class="section-block">
        <div class="section-header">
          <h4><i class="fa-solid fa-bolt text-emerald"></i> Acciones Rápidas</h4>
        </div>

        <div class="quick-actions-grid">
          <a routerLink="/convocatorias" class="action-tile">
            <div class="tile-icon bg-emerald-subtle text-emerald">
              <i class="fa-solid fa-clipboard-user"></i>
            </div>
            <span>Convocatorias</span>
          </a>

          <a routerLink="/entrenamientos" class="action-tile">
            <div class="tile-icon bg-blue-subtle text-blue">
              <i class="fa-solid fa-stopwatch-20"></i>
            </div>
            <span>Asistencia Campo</span>
          </a>

          <a routerLink="/canchas" class="action-tile">
            <div class="tile-icon bg-emerald-subtle text-emerald">
              <i class="fa-solid fa-futbol"></i>
            </div>
            <span>Alquiler Canchas</span>
          </a>

          <a routerLink="/pagos" class="action-tile">
            <div class="tile-icon bg-blue-subtle text-blue">
              <i class="fa-solid fa-credit-card"></i>
            </div>
            <span>Mensualidades</span>
          </a>

          <a routerLink="/tienda" class="action-tile">
            <div class="tile-icon bg-amber-subtle text-amber">
              <i class="fa-solid fa-bag-shopping"></i>
            </div>
            <span>Tienda Oficial</span>
          </a>

          <a routerLink="/rendimiento" class="action-tile">
            <div class="tile-icon bg-purple-subtle text-pink">
              <i class="fa-solid fa-chart-simple"></i>
            </div>
            <span>Radar & Biometría</span>
          </a>

          <a routerLink="/noticias" class="action-tile">
            <div class="tile-icon bg-blue-subtle text-blue">
              <i class="fa-solid fa-newspaper"></i>
            </div>
            <span>Noticias & Circulares</span>
          </a>

          <a routerLink="/notificaciones" class="action-tile">
            <div class="tile-icon bg-amber-subtle text-amber">
              <i class="fa-solid fa-bell"></i>
            </div>
            <span>Notificaciones</span>
          </a>
        </div>
      </section>
    </main>

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .mobile-page-content {
      padding: 1rem;
      padding-bottom: calc(75px + var(--safe-area-bottom));
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .welcome-banner {
      background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-elevated) 100%);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1rem 1.1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .welcome-text {
        h3 {
          font-size: 1.1rem;
          margin-bottom: 0.2rem;
        }
        p {
          font-size: 0.78rem;
          color: var(--text-muted);
        }
      }

      .quick-status-chip {
        font-size: 0.7rem;
        font-weight: 700;
        background: var(--color-primary-subtle);
        color: var(--color-primary);
        padding: 0.3rem 0.6rem;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }
    }

    .kpi-carousel {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.6rem;

      .kpi-mini-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 0.75rem 0.65rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 0.4rem;

        .kpi-icon-pill {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;

          &.icon-emerald { background: var(--color-primary-subtle); color: var(--color-primary); }
          &.icon-blue { background: var(--color-blue-subtle); color: var(--color-blue); }
          &.icon-amber { background: var(--color-amber-subtle); color: var(--color-amber); }
        }

        .kpi-num {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--text-heading);
          line-height: 1;
        }

        .kpi-lbl {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 600;
        }
      }
    }

    .section-block {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h4 {
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .section-link {
          font-size: 0.75rem;
          color: var(--color-primary);
          text-decoration: none;
          font-weight: 700;
        }
      }
    }

    .match-highlight-card {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;

      .match-meta-top {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .cat-badge {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--color-blue);
        }

        .match-time-tag {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }
      }

      .vs-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--bg-surface);
        border-radius: var(--radius-md);
        padding: 0.75rem 0.5rem;

        .team-side {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          width: 42%;
          text-align: center;

          .team-icon {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            background: var(--color-primary-subtle);
            color: var(--color-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 0.8rem;

            &.rival-icon {
              background: rgba(245, 158, 11, 0.15);
            }
          }

          .team-label {
            font-size: 0.75rem;
            font-weight: 800;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }
        }

        .vs-pill {
          font-size: 0.8rem;
          font-weight: 900;
          color: var(--text-dim);
          background: var(--bg-card);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }

      .match-venue-row {
        font-size: 0.75rem;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .btn-sm {
        padding: 0.65rem 1rem;
        font-size: 0.82rem;
        text-decoration: none;
      }
    }

    .quick-actions-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.65rem;

      .action-tile {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 0.85rem;
        display: flex;
        align-items: center;
        gap: 0.65rem;
        text-decoration: none;
        color: var(--text-main);
        font-size: 0.78rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.15s ease;

        &:active {
          transform: scale(0.97);
          background: var(--bg-card-elevated);
        }

        .tile-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
        }
      }
    }

    .bg-emerald-subtle { background: var(--color-primary-subtle); }
    .bg-blue-subtle { background: var(--color-blue-subtle); }
    .bg-amber-subtle { background: var(--color-amber-subtle); }
    .bg-purple-subtle { background: rgba(236, 72, 153, 0.15); }
    .text-pink { color: #ec4899; }

    .empty-highlight {
      text-align: center;
      padding: 1.5rem;
      color: var(--text-muted);
      font-size: 0.8rem;
      i { font-size: 1.8rem; margin-bottom: 0.35rem; }
    }
  `]
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);
  alert = inject(AlertService);
  private http = inject(HttpClient);

  readonly proximoPartido = signal<any | null>(null);

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/partidos`).subscribe({
      next: (res) => {
        const partidos = Array.isArray(res) ? res : (res?.data || []);
        if (partidos.length > 0) {
          this.proximoPartido.set(partidos[0]);
        }
      },
      error: () => {
        // Fallback demo match si el backend offline
        this.proximoPartido.set({
          id: 'partido-demo-1',
          rival_nombre: 'Atlético Nacional Cantera',
          categoria_nombre: 'Sub-17 Élite',
          fecha_partido: '2026-10-15',
          hora_partido: '10:30 AM',
          hora_citacion: '09:30 AM',
          sede_cancha: 'Cancha Sintética Principal Los Arrayanes'
        });
      }
    });
  }

  onSupportClick(): void {
    this.alert.info('Conectando con la línea oficial de atención de tu club...', 'Atención al Deportista');
  }
}

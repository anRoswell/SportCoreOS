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
  selector: 'app-partidos-mobile',
  standalone: true,
  imports: [CommonModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  template: `
    <app-mobile-header></app-mobile-header>

    <div class="partidos-subbar">
      <div class="subbar-left">
        <a routerLink="/home" class="btn-back"><i class="fa-solid fa-arrow-left"></i></a>
        <h2>Calendario & Fixture</h2>
      </div>
      <button class="btn-icon-refresh" [class.spinning]="isRefreshing()" (click)="recargarPartidos()" title="Actualizar">
        <i class="fa-solid fa-arrows-rotate"></i>
      </button>
    </div>

    <main class="mobile-page-content">

      <div class="matches-list">
        @for (m of matches(); track m.id) {
          <div class="match-item-card mobile-card">
            <div class="match-card-top">
              <span class="badge badge-blue">{{ m.categoria_nombre }}</span>
              <span class="match-badge-cond" [class.badge-local]="m.condicion_juego === 'LOCAL'">
                {{ m.condicion_juego || 'LOCAL' }}
              </span>
            </div>

            <div class="match-versus-block">
              <div class="team-club">
                <div class="crest-small">{{ auth.activeClub().sigla }}</div>
                <strong>{{ auth.activeClub().nombre }}</strong>
              </div>
              <div class="vs-label">VS</div>
              <div class="team-club">
                <div class="crest-small rival-small">⚔️</div>
                <strong>{{ m.rival_nombre }}</strong>
              </div>
            </div>

            <div class="match-details-strip">
              <div class="detail-cell">
                <i class="fa-regular fa-calendar text-emerald"></i>
                <span>{{ m.fecha_partido }}</span>
              </div>
              <div class="detail-cell">
                <i class="fa-regular fa-clock text-blue"></i>
                <span>{{ m.hora_partido }} (Cit: {{ m.hora_citacion }})</span>
              </div>
            </div>

            <div class="venue-cell">
              <i class="fa-solid fa-location-dot text-amber"></i>
              <span>{{ m.sede_cancha }}</span>
            </div>

            <div class="match-card-footer">
              <a routerLink="/convocatorias" [queryParams]="{ partidoId: m.id }" class="btn-primary btn-sm">
                <i class="fa-solid fa-clipboard-user"></i> Convocatoria
              </a>
              <button class="btn-secondary btn-icon-only" (click)="openGps(m.sede_cancha)" title="Abrir GPS">
                <i class="fa-solid fa-map-location-dot"></i>
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty-matches mobile-card">
            <i class="fa-solid fa-calendar-xmark"></i>
            <p>No se encontraron partidos programados actualmente.</p>
          </div>
        }
      </div>
    </main>

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .mobile-page-content {
      padding: 1rem;
      padding-bottom: calc(75px + var(--safe-area-bottom));
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .page-title-row {
      h3 { font-size: 1.15rem; margin-bottom: 0.15rem; }
      .subtitle { font-size: 0.78rem; color: var(--text-muted); }
    }

    .matches-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .match-item-card {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .match-card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .match-badge-cond {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-muted);

          &.badge-local {
            background: var(--color-primary-subtle);
            color: var(--color-primary);
          }
        }
      }

      .match-versus-block {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: var(--bg-surface);
        border-radius: var(--radius-md);
        padding: 0.65rem 0.5rem;

        .team-club {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          width: 42%;

          .crest-small {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: var(--color-primary-subtle);
            color: var(--color-primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.7rem;
            font-weight: 800;

            &.rival-small {
              background: rgba(245, 158, 11, 0.15);
            }
          }

          strong {
            font-size: 0.75rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .vs-label {
          font-size: 0.75rem;
          font-weight: 900;
          color: var(--text-dim);
        }
      }

      .match-details-strip {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;

        .detail-cell {
          font-size: 0.72rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
      }

      .venue-cell {
        font-size: 0.72rem;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }

      .match-card-footer {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.25rem;

        .btn-sm {
          padding: 0.65rem;
          font-size: 0.8rem;
          text-decoration: none;
        }

        .btn-icon-only {
          width: 44px;
          padding: 0;
          flex-shrink: 0;
        }
      }
    }

    .empty-matches {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
      font-size: 0.85rem;
      i { font-size: 2rem; margin-bottom: 0.5rem; }
    }
  `]
})
export class PartidosMobileComponent implements OnInit {
  auth = inject(AuthService);
  alert = inject(AlertService);
  private http = inject(HttpClient);

  isRefreshing = signal<boolean>(false);
  readonly matches = signal<any[]>([]);

  ngOnInit(): void {
    this.cargarPartidos();
  }

  recargarPartidos(): void {
    this.isRefreshing.set(true);
    this.cargarPartidos(() => {
      this.isRefreshing.set(false);
      this.alert.success('Calendario y partidos actualizados.');
    });
  }

  cargarPartidos(callback?: () => void): void {
    this.http.get<any>(`${environment.apiUrl}/partidos`).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        this.matches.set(list);
        if (callback) callback();
      },
      error: () => {
        this.matches.set([
          {
            id: 'm1',
            rival_nombre: 'Academia Santa Fe Sub-15',
            categoria_nombre: 'Sub-15 Torneo Élite',
            fecha_partido: '2026-10-18',
            hora_partido: '09:00 AM',
            hora_citacion: '08:00 AM',
            sede_cancha: 'Cancha 1 Sede Deportiva Los Arrayanes',
            condicion_juego: 'LOCAL'
          }
        ]);
        if (callback) callback();
      }
    });
  }

  openGps(sede: string): void {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(sede)}`;
    window.open(url, '_blank');
  }
}

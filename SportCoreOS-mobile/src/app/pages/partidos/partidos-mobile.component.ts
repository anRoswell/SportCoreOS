import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { environment } from '../../../environments/environment';

export interface PartidoItem {
  id: string;
  rival_nombre: string;
  categoria_nombre: string;
  fecha_partido: string;
  hora_partido: string;
  hora_citacion: string;
  sede_cancha: string;
  condicion_juego: string;
  indumentaria_kit?: string;
  estado_partido?: string;
  goles_club?: number;
  goles_rival?: number;
}

@Component({
  selector: 'app-partidos-mobile',
  standalone: true,
  imports: [CommonModule, RouterModule, ScrollingModule, MobileHeaderComponent, BottomNavComponent],
  template: `
    <app-mobile-header></app-mobile-header>

    <div class="partidos-subbar">
      <div class="subbar-left">
        <a routerLink="/home" class="btn-back"><i class="fa-solid fa-arrow-left"></i></a>
        <h2>Calendario & Fixture</h2>
      </div>
      <div class="subbar-right">
        <span class="count-badge">{{ displayedMatches().length }} de {{ allMatches.length }}</span>
        <button class="btn-icon-refresh" [class.spinning]="isRefreshing()" (click)="recargarPartidos()" title="Actualizar">
          <i class="fa-solid fa-arrows-rotate"></i>
        </button>
      </div>
    </div>

    <main class="mobile-page-content">
      <!-- Cdk Virtual Scroll Viewport para Fixture Completo -->
      <cdk-virtual-scroll-viewport 
        itemSize="240" 
        class="matches-viewport"
        (scrolledIndexChange)="onScrollChange($event)">
        
        <div *cdkVirtualFor="let m of displayedMatches(); trackBy: trackById" class="match-item-wrapper">
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
              
              @if (m.estado_partido === 'FINALIZADO') {
                <div class="score-display">
                  <span>{{ m.goles_club }}</span> - <span>{{ m.goles_rival }}</span>
                </div>
              } @else {
                <div class="vs-label">VS</div>
              }

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
        </div>

        @if (isLoadingMore()) {
          <div class="infinite-indicator">
            <i class="fa-solid fa-circle-notch fa-spin text-primary"></i>
            <span>Cargando más fechas del fixture...</span>
          </div>
        } @else if (hasReachedEnd() && displayedMatches().length > 0) {
          <div class="infinite-end">
            <span>Fin de la temporada y fixture oficial</span>
          </div>
        }
      </cdk-virtual-scroll-viewport>
    </main>

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .partidos-subbar {
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
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
      }

      .subbar-right {
        display: flex;
        align-items: center;
        gap: 8px;

        .count-badge {
          font-size: 0.68rem;
          font-weight: 700;
          color: #475569;
          background: #f1f5f9;
          padding: 3px 8px;
          border-radius: 9999px;
        }

        .btn-icon-refresh {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #059669;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          &.spinning i {
            animation: spin 0.8s linear infinite;
          }
        }
      }
    }

    .mobile-page-content {
      height: calc(100vh - 135px - var(--safe-area-bottom));
      height: calc(100dvh - 135px - var(--safe-area-bottom));
      display: flex;
      flex-direction: column;
      background: #f8fafc;
    }

    .matches-viewport {
      flex: 1;
      width: 100%;
      padding: 0.75rem 1rem;
      box-sizing: border-box;
    }

    .match-item-wrapper {
      height: 240px;
      padding-bottom: 0.85rem;
      box-sizing: border-box;
    }

    .match-item-card {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      background: #ffffff;
      border-radius: 14px;
      border: 1px solid #e2e8f0;
      padding: 0.85rem;
      height: 100%;
      box-sizing: border-box;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }

    .match-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .badge-blue {
        background: #eff6ff;
        color: #1d4ed8;
        font-size: 0.68rem;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 6px;
      }

      .match-badge-cond {
        font-size: 0.65rem;
        font-weight: 800;
        background: #f1f5f9;
        color: #475569;
        padding: 2px 6px;
        border-radius: 4px;

        &.badge-local {
          background: #ecfdf5;
          color: #059669;
        }
      }
    }

    .match-versus-block {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8fafc;
      padding: 0.5rem 0.65rem;
      border-radius: 10px;

      .team-club {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.76rem;
        max-width: 42%;

        strong {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .crest-small {
          width: 26px;
          height: 26px;
          background: #059669;
          color: #fff;
          font-size: 0.65rem;
          font-weight: 900;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          &.rival-small {
            background: #cbd5e1;
            color: #0f172a;
          }
        }
      }

      .vs-label {
        font-size: 0.7rem;
        font-weight: 900;
        color: #94a3b8;
      }

      .score-display {
        font-size: 0.95rem;
        font-weight: 900;
        color: #0f172a;
        background: #e2e8f0;
        padding: 2px 8px;
        border-radius: 6px;
      }
    }

    .match-details-strip {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      color: #334155;
      font-weight: 600;

      .detail-cell {
        display: flex;
        align-items: center;
        gap: 4px;
      }
    }

    .venue-cell {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.72rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .match-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 0.35rem;
      border-top: 1px solid #f1f5f9;

      .btn-primary {
        background: #059669;
        color: #fff;
        padding: 0.45rem 0.85rem;
        border-radius: 8px;
        font-size: 0.74rem;
        font-weight: 800;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .btn-secondary {
        background: #f1f5f9;
        color: #0f172a;
        border: 1px solid #cbd5e1;
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
    }

    .infinite-indicator, .infinite-end {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0.75rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748b;
    }

    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class PartidosMobileComponent implements OnInit {
  auth = inject(AuthService);
  alert = inject(AlertService);
  http = inject(HttpClient);

  isRefreshing = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  hasReachedEnd = signal<boolean>(false);

  allMatches: PartidoItem[] = [];
  displayedMatches = signal<PartidoItem[]>([]);
  private pageSize = 6;
  private currentOffset = 0;

  ngOnInit(): void {
    this.generarFixtureData();
    this.cargarMas();
  }

  trackById(index: number, item: PartidoItem): string {
    return item.id;
  }

  private generarFixtureData(): void {
    const rivales = [
      'Academia Millonarios FC',
      'Santa Fe Divisiones Menores',
      'Deportivo Cali Filial Bogotá',
      'Envigado FC Cantera de Héroes',
      'Junior Barranquilla Sub-17',
      'Atlético Nacional Filial Sabana',
      'Fortaleza CEIF Semillero',
      'La Equidad Cantera Seguros'
    ];

    const canchas = [
      'Cancha Sintética 1 - Sede Principal',
      'Complejo Arrayanes Cancha 2',
      'Estadio Olaya Herrera',
      'Club Deportivo Compensar Cancha 4',
      'Sede Deportiva Maracaná Suba'
    ];

    this.allMatches = [];
    for (let i = 1; i <= 32; i++) {
      const isPast = i <= 6;
      this.allMatches.push({
        id: `match-fix-${i}`,
        rival_nombre: rivales[(i - 1) % rivales.length],
        categoria_nombre: i % 2 === 0 ? 'Sub-15 Élite' : 'Sub-17 Talentos',
        fecha_partido: `${(i % 28) + 1}/10/2026`,
        hora_partido: '09:30 AM',
        hora_citacion: '08:30 AM',
        sede_cancha: canchas[(i - 1) % canchas.length],
        condicion_juego: i % 2 === 0 ? 'LOCAL' : 'VISITANTE',
        estado_partido: isPast ? 'FINALIZADO' : 'PROGRAMADO',
        goles_club: isPast ? Math.floor(Math.random() * 4) : 0,
        goles_rival: isPast ? Math.floor(Math.random() * 3) : 0
      });
    }
  }

  cargarMas(): void {
    if (this.isLoadingMore() || this.hasReachedEnd()) return;

    this.isLoadingMore.set(true);
    setTimeout(() => {
      const nextBatch = this.allMatches.slice(this.currentOffset, this.currentOffset + this.pageSize);
      if (nextBatch.length > 0) {
        this.displayedMatches.update(curr => [...curr, ...nextBatch]);
        this.currentOffset += this.pageSize;
      }
      if (this.currentOffset >= this.allMatches.length) {
        this.hasReachedEnd.set(true);
      }
      this.isLoadingMore.set(false);
    }, 300);
  }

  onScrollChange(index: number): void {
    const total = this.displayedMatches().length;
    if (index >= total - 2 && !this.isLoadingMore() && !this.hasReachedEnd()) {
      this.cargarMas();
    }
  }

  recargarPartidos(): void {
    this.isRefreshing.set(true);
    this.currentOffset = 0;
    this.displayedMatches.set([]);
    this.hasReachedEnd.set(false);
    setTimeout(() => {
      this.cargarMas();
      this.isRefreshing.set(false);
    }, 450);
  }

  openGps(cancha: string): void {
    const query = encodeURIComponent(`Cancha ${cancha} Bogotá`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  }
}

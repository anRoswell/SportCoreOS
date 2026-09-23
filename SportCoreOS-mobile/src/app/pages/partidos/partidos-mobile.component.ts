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

    <!-- Filtros Rápidos de Fixture -->
    <div class="fixture-filter-pills">
      <button class="filter-pill" [class.active]="filtroEstado() === 'TODOS'" (click)="setFiltro('TODOS')">
        Todos
      </button>
      <button class="filter-pill" [class.active]="filtroEstado() === 'PROGRAMADO'" (click)="setFiltro('PROGRAMADO')">
        <span class="dot-prog"></span> Próximos
      </button>
      <button class="filter-pill" [class.active]="filtroEstado() === 'FINALIZADO'" (click)="setFiltro('FINALIZADO')">
        Resultados
      </button>
    </div>

    <main class="mobile-page-content">
      <!-- Cdk Virtual Scroll Viewport de Altura Controlada con Auto-Scroll -->
      <cdk-virtual-scroll-viewport 
        itemSize="255" 
        class="matches-viewport"
        (scrolledIndexChange)="onScrollChange($event)">
        
        <div *cdkVirtualFor="let m of displayedMatches(); trackBy: trackById" class="match-item-wrapper">
          <div class="match-item-card">
            <!-- Header de Categoría y Condición -->
            <div class="match-card-top">
              <span class="badge-cat-tag">⚽ {{ m.categoria_nombre }}</span>
              <span class="match-badge-cond" [class.badge-local]="m.condicion_juego === 'LOCAL'">
                {{ m.condicion_juego || 'LOCAL' }}
              </span>
            </div>

            <!-- Versus y Marcador -->
            <div class="match-versus-block">
              <div class="team-club">
                <div class="crest-small">{{ auth.activeClub().sigla }}</div>
                <strong class="club-title">{{ auth.activeClub().nombre }}</strong>
              </div>
              
              <div class="versus-center">
                @if (m.estado_partido === 'FINALIZADO') {
                  <div class="score-display">
                    <span>{{ m.goles_club }}</span> - <span>{{ m.goles_rival }}</span>
                  </div>
                  <span class="match-status-label finalizado">Finalizado</span>
                } @else {
                  <div class="vs-label">VS</div>
                  <span class="match-status-label programado">Programado</span>
                }
              </div>

              <div class="team-club">
                <div class="crest-small rival-small">⚔️</div>
                <strong class="club-title">{{ m.rival_nombre }}</strong>
              </div>
            </div>

            <!-- Datos de Fecha y Hora -->
            <div class="match-details-strip">
              <div class="detail-cell">
                <i class="fa-regular fa-calendar text-emerald"></i>
                <span>{{ m.fecha_partido }}</span>
              </div>
              <div class="detail-cell">
                <i class="fa-regular fa-clock text-blue"></i>
                <span>{{ m.hora_partido }}</span>
              </div>
              <div class="detail-cell citacion-cell">
                <span class="cit-tag">Cit: {{ m.hora_citacion }}</span>
              </div>
            </div>

            <!-- Sede Cancha -->
            <div class="venue-cell">
              <i class="fa-solid fa-location-dot text-amber"></i>
              <span class="venue-text">{{ m.sede_cancha }}</span>
            </div>

            <!-- Footer con Botón de Convocatoria y GPS -->
            <div class="match-card-footer">
              <a routerLink="/convocatorias" [queryParams]="{ partidoId: m.id }" class="btn-convocar-match">
                <i class="fa-solid fa-clipboard-user"></i>
                <span>Ver Convocatoria & Citación</span>
              </a>
              <button class="btn-gps-action" (click)="openGps(m.sede_cancha)" title="Abrir en GPS">
                <i class="fa-solid fa-diamond-turn-right"></i> GPS
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
            <i class="fa-solid fa-check-double text-emerald"></i>
            <span>Fin de la temporada y fixture oficial</span>
          </div>
        }
      </cdk-virtual-scroll-viewport>
    </main>

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      height: 100dvh;
      overflow: hidden;
      background: #0b1510;
      background: linear-gradient(180deg, #0b1510 0%, #0f172a 40%, #020617 100%);
    }

    .partidos-subbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: rgba(15, 23, 42, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      flex-shrink: 0;

      .subbar-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .btn-back {
          color: #ffffff;
          font-size: 1.1rem;
          text-decoration: none;
          display: flex;
          align-items: center;
        }

        h2 {
          font-size: 1rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          letter-spacing: -0.01em;
        }
      }

      .subbar-right {
        display: flex;
        align-items: center;
        gap: 8px;

        .count-badge {
          font-size: 0.65rem;
          font-weight: 700;
          color: #a7f3d0;
          background: rgba(6, 78, 59, 0.6);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .btn-icon-refresh {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.06);
          color: #34d399;
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

    .fixture-filter-pills {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(15, 23, 42, 0.6);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      flex-shrink: 0;

      .filter-pill {
        flex: 1;
        padding: 0.35rem 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: #94a3b8;
        font-size: 0.7rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        transition: all 0.2s;

        .dot-prog {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
        }

        &.active {
          background: #10b981;
          color: #ffffff;
          border-color: #34d399;
        }
      }
    }

    .mobile-page-content {
      flex: 1;
      height: 100%;
      min-height: 0;
      position: relative;
      overflow-x: hidden;
      overflow-y: hidden;
      width: 100%;
      max-width: 100vw;
      margin-bottom: calc(62px + var(--safe-area-bottom));
      box-sizing: border-box;
    }

    .matches-viewport {
      height: 100%;
      width: 100% !important;
      max-width: 100% !important;
      padding: 0.75rem 0.85rem;
      box-sizing: border-box !important;
      overflow-x: hidden !important;
    }

    .match-item-wrapper {
      height: 255px;
      padding-bottom: 0.85rem;
      box-sizing: border-box !important;
      width: 100% !important;
      max-width: 100% !important;
    }

    .match-item-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 0.85rem;
      height: 100%;
      box-sizing: border-box;
      box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.35);
    }

    .match-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .badge-cat-tag {
        background: rgba(56, 189, 248, 0.15);
        color: #38bdf8;
        border: 1px solid rgba(56, 189, 248, 0.3);
        font-size: 0.65rem;
        font-weight: 800;
        padding: 2px 8px;
        border-radius: 6px;
      }

      .match-badge-cond {
        font-size: 0.62rem;
        font-weight: 800;
        background: rgba(255, 255, 255, 0.08);
        color: #94a3b8;
        padding: 2px 6px;
        border-radius: 4px;

        &.badge-local {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
      }
    }

    .match-versus-block {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(15, 23, 42, 0.7);
      padding: 0.6rem 0.75rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.06);

      .team-club {
        display: flex;
        align-items: center;
        gap: 6px;
        width: 40%;

        .club-title {
          font-size: 0.74rem;
          font-weight: 800;
          color: #ffffff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .crest-small {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 900;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid #34d399;

          &.rival-small {
            background: #334155;
            border-color: #64748b;
          }
        }
      }

      .versus-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;

        .vs-label {
          font-size: 0.72rem;
          font-weight: 900;
          color: #34d399;
          background: #0f172a;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(52, 211, 153, 0.3);
        }

        .score-display {
          font-size: 0.95rem;
          font-weight: 900;
          color: #ffffff;
          background: #0f172a;
          padding: 2px 8px;
          border-radius: 6px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .match-status-label {
          font-size: 0.55rem;
          font-weight: 800;
          text-transform: uppercase;

          &.programado { color: #34d399; }
          &.finalizado { color: #94a3b8; }
        }
      }
    }

    .match-details-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.7rem;
      color: #cbd5e1;
      font-weight: 600;

      .detail-cell {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .cit-tag {
        font-size: 0.62rem;
        font-weight: 700;
        background: rgba(245, 158, 11, 0.2);
        color: #fbbf24;
        padding: 1px 6px;
        border-radius: 4px;
      }
    }

    .venue-cell {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.7rem;
      color: #94a3b8;

      .venue-text {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .match-card-footer {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      margin-top: 0.25rem;

      .btn-convocar-match {
        flex: 1;
        height: 36px;
        background: linear-gradient(135deg, #059669 0%, #047857 100%);
        color: #ffffff;
        border-radius: 10px;
        font-size: 0.75rem;
        font-weight: 800;
        text-decoration: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
      }

      .btn-gps-action {
        background: rgba(255, 255, 255, 0.08);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.3);
        height: 36px;
        padding: 0 10px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 0.72rem;
        font-weight: 800;
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
      color: #94a3b8;
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
  filtroEstado = signal<'TODOS' | 'PROGRAMADO' | 'FINALIZADO'>('TODOS');

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
      let filtered = this.allMatches;
      if (this.filtroEstado() !== 'TODOS') {
        filtered = this.allMatches.filter(m => m.estado_partido === this.filtroEstado());
      }

      const nextBatch = filtered.slice(this.currentOffset, this.currentOffset + this.pageSize);
      if (nextBatch.length > 0) {
        this.displayedMatches.update(curr => [...curr, ...nextBatch]);
        this.currentOffset += this.pageSize;
      }
      if (this.currentOffset >= filtered.length) {
        this.hasReachedEnd.set(true);
      }
      this.isLoadingMore.set(false);
    }, 250);
  }

  onScrollChange(index: number): void {
    const total = this.displayedMatches().length;
    if (index >= total - 2 && !this.isLoadingMore() && !this.hasReachedEnd()) {
      this.cargarMas();
    }
  }

  setFiltro(estado: 'TODOS' | 'PROGRAMADO' | 'FINALIZADO'): void {
    this.filtroEstado.set(estado);
    this.currentOffset = 0;
    this.displayedMatches.set([]);
    this.hasReachedEnd.set(false);
    this.cargarMas();
  }

  recargarPartidos(): void {
    this.isRefreshing.set(true);
    this.currentOffset = 0;
    this.displayedMatches.set([]);
    this.hasReachedEnd.set(false);
    setTimeout(() => {
      this.cargarMas();
      this.isRefreshing.set(false);
    }, 400);
  }

  openGps(cancha: string): void {
    const query = encodeURIComponent(`Cancha ${cancha} Bogotá`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  }
}

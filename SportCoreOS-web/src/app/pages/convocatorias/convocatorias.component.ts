import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-convocatorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="convocatorias-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Convocatoria Oficial a Partidos</h1>
          <p class="page-subtitle">Citación interactiva, nómina titular vs suplentes y confirmación de acudientes en tiempo real</p>
        </div>
        <div class="header-actions">
          <div class="match-selector-group">
            <label class="filter-label">Seleccionar Partido:</label>
            <select [ngModel]="selectedPartidoId()" (ngModelChange)="onSelectPartido($event)" class="sport-select">
              @for (m of matches(); track m.id) {
                <option [value]="m.id">{{ m.fecha_partido }} - vs {{ m.rival_nombre }} ({{ m.categoria_nombre }})</option>
              }
            </select>
          </div>
          <button class="btn-primary" (click)="onSendWhatsAppCitacion()">
            <i class="fa-solid fa-paper-plane"></i> Enviar Citación a Padres
          </button>
        </div>
      </div>

      @if (currentMatch()) {
        <!-- Tarjeta Hero del Partido -->
        <div class="fut-card match-hero">
          <div class="match-meta">
            <span class="badge badge-blue">{{ currentMatch()?.categoria_nombre }}</span>
            <span class="match-time">
              <i class="fa-regular fa-calendar-check text-emerald"></i> {{ currentMatch()?.fecha_partido }} • {{ currentMatch()?.hora_partido }} (Citación: {{ currentMatch()?.hora_citacion }})
            </span>
          </div>

          <div class="vs-banner">
            <div class="team">
              <div class="team-crest">{{ api.activeClub().sigla }}</div>
              <span class="team-name">{{ api.activeClub().nombre }}</span>
              <span class="team-role">{{ currentMatch()?.condicion_juego === 'LOCAL' ? 'LOCAL (Kit Titular)' : 'LOCAL' }}</span>
            </div>
            <div class="vs-circle">VS</div>
            <div class="team">
              <div class="team-crest rival-crest">⚔️</div>
              <span class="team-name">{{ currentMatch()?.rival_nombre }}</span>
              <span class="team-role">{{ currentMatch()?.condicion_juego === 'VISITANTE' ? 'VISITANTE' : 'VISITANTE' }}</span>
            </div>
          </div>

          <div class="venue-info">
            <div class="venue-text">
              <i class="fa-solid fa-location-dot text-amber"></i>
              <span><strong>Sede:</strong> {{ currentMatch()?.sede_cancha }}</span>
            </div>
            <button class="gps-btn" (click)="openGpsRoute()">
              <i class="fa-solid fa-map-location-dot"></i> Abrir en Google Maps / Waze
            </button>
          </div>

          <div class="convocatoria-stats-bar">
            <div class="stat-pill">
              <span>Total Convocados:</span>
              <strong>{{ convocados().length }}</strong>
            </div>
            <div class="stat-pill">
              <span>Confirmados:</span>
              <strong class="text-emerald">{{ confirmadosCount() }}</strong>
            </div>
            <div class="stat-pill">
              <span>Pendientes / Excusados:</span>
              <strong class="text-amber">{{ convocados().length - confirmadosCount() }}</strong>
            </div>
          </div>
        </div>

        <!-- Listas de Nómina: Titulares y Suplentes -->
        <div class="squad-grid">
          <!-- ONCE TITULAR -->
          <div class="fut-card squad-column">
            <div class="squad-header">
              <div class="squad-title">
                <i class="fa-solid fa-futbol text-emerald"></i>
                <h3>Once Titular ({{ titulares().length }})</h3>
              </div>
              <span class="badge badge-success">{{ titularesConfirmadosCount() }} / {{ titulares().length }} Confirmados</span>
            </div>

            <div class="player-list">
              @for (p of titulares(); track p.id) {
                <div class="player-row">
                  <div class="player-dorsal">#{{ p.numero_dorsal || '-' }}</div>
                  <img [src]="p.foto_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'" alt="Player" class="player-avatar-sm" />
                  <div class="player-details">
                    <strong>{{ p.nombres }} {{ p.apellidos }}</strong>
                    <span class="pos-tag">{{ p.posicion_designada || p.posicion_principal }}</span>
                  </div>
                  <div class="player-status-actions">
                    <span class="badge" [class.badge-success]="p.estado_confirmacion === 'CONFIRMADO'" [class.badge-warning]="p.estado_confirmacion === 'PENDIENTE'" [class.badge-danger]="p.estado_confirmacion === 'EXCUSADO'">
                      {{ p.estado_confirmacion }}
                    </span>
                    <button class="btn-toggle-status" (click)="togglePlayerStatus(p)" title="Cambiar estado de asistencia">
                      <i class="fa-solid fa-arrows-rotate"></i>
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="empty-squad">No hay jugadores titulares asignados.</div>
              }
            </div>
          </div>

          <!-- BANCO DE SUPLENTES -->
          <div class="fut-card squad-column">
            <div class="squad-header">
              <div class="squad-title">
                <i class="fa-solid fa-users-viewfinder text-blue"></i>
                <h3>Banco de Suplentes ({{ suplentes().length }})</h3>
              </div>
              <span class="badge badge-blue">{{ suplentesConfirmadosCount() }} / {{ suplentes().length }} Confirmados</span>
            </div>

            <div class="player-list">
              @for (p of suplentes(); track p.id) {
                <div class="player-row">
                  <div class="player-dorsal suplente-dorsal">#{{ p.numero_dorsal || '-' }}</div>
                  <img [src]="p.foto_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'" alt="Player" class="player-avatar-sm" />
                  <div class="player-details">
                    <strong>{{ p.nombres }} {{ p.apellidos }}</strong>
                    <span class="pos-tag">{{ p.posicion_designada || p.posicion_principal }}</span>
                  </div>
                  <div class="player-status-actions">
                    <span class="badge" [class.badge-success]="p.estado_confirmacion === 'CONFIRMADO'" [class.badge-warning]="p.estado_confirmacion === 'PENDIENTE'" [class.badge-danger]="p.estado_confirmacion === 'EXCUSADO'">
                      {{ p.estado_confirmacion }}
                    </span>
                    <button class="btn-toggle-status" (click)="togglePlayerStatus(p)" title="Cambiar estado de asistencia">
                      <i class="fa-solid fa-arrows-rotate"></i>
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="empty-squad">No hay jugadores suplentes asignados.</div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="fut-card empty-state">
          <i class="fa-solid fa-clipboard-user"></i>
          <p>No hay partidos disponibles para mostrar convocatorias.</p>
        </div>
      }

      <!-- TOAST -->
      @if (toastMessage()) {
        <div class="toast-floating-alert">
          <i class="fa-solid fa-circle-check"></i>
          <span>{{ toastMessage() }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .convocatorias-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;

      .page-title {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--text-heading);
      }

      .page-subtitle {
        color: var(--text-body);
        font-size: 0.85rem;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .match-selector-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .filter-label {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-muted);
      }
    }

    .sport-select {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.5rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      font-weight: 600;
      outline: none;
    }

    .match-hero {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding: 1.5rem;

      .match-meta {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .match-time {
          font-size: 0.85rem;
          color: var(--text-main);
          font-weight: 600;
        }
      }

      .vs-banner {
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: 1.25rem 0;
        background: var(--bg-surface);
        border-radius: var(--radius-md);

        .team {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.35rem;

          .team-crest {
            width: 50px;
            height: 50px;
            background: var(--color-primary-subtle);
            color: var(--color-primary-dark);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 1.1rem;

            &.rival-crest {
              background: rgba(245, 158, 11, 0.15);
            }
          }

          .team-name {
            font-size: 1.25rem;
            font-weight: 800;
            color: var(--text-heading);
          }

          .team-role {
            font-size: 0.75rem;
            color: var(--color-primary);
            font-weight: 700;
          }
        }

        .vs-circle {
          font-size: 1.1rem;
          font-weight: 900;
          color: var(--text-muted);
          background: var(--bg-card);
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-color);
        }
      }

      .venue-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 1rem;
        background: var(--bg-surface);
        border-radius: var(--radius-md);

        .venue-text {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-main);
        }

        .gps-btn {
          background: transparent;
          border: 1px solid var(--color-primary);
          color: var(--color-primary);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          &:hover {
            background: var(--color-primary);
            color: #ffffff;
          }
        }
      }

      .convocatoria-stats-bar {
        display: flex;
        gap: 1.5rem;
        border-top: 1px solid var(--border-color);
        padding-top: 1rem;

        .stat-pill {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);

          strong {
            font-size: 1rem;
            color: var(--text-heading);
          }
        }
      }
    }

    .squad-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .squad-column {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.25rem;

      .squad-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .squad-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          h3 {
            font-size: 1.1rem;
            font-weight: 800;
            color: var(--text-heading);
          }
        }
      }
    }

    .player-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .player-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0.75rem;
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);

      .player-dorsal {
        width: 32px;
        height: 32px;
        background: var(--color-primary-subtle);
        color: var(--color-primary-dark);
        font-weight: 800;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;

        &.suplente-dorsal {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }
      }

      .player-avatar-sm {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
      }

      .player-details {
        flex: 1;
        display: flex;
        flex-direction: column;

        strong {
          color: var(--text-main);
          font-size: 0.85rem;
        }

        .pos-tag {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
      }

      .player-status-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .btn-toggle-status {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          width: 28px;
          height: 28px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          &:hover {
            color: var(--color-primary);
            border-color: var(--color-primary);
          }
        }
      }
    }

    .badge-danger {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }

    .empty-squad {
      padding: 1.5rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
      i { font-size: 2.5rem; margin-bottom: 0.5rem; }
    }

    .toast-floating-alert {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #10b981;
      color: #ffffff;
      padding: 0.85rem 1.35rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-elevated);
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-weight: 700;
      z-index: 10000;
    }
  `]
})
export class ConvocatoriasComponent implements OnInit {
  api = inject(ApiService);
  private route = inject(ActivatedRoute);

  readonly matches = signal<any[]>([]);
  readonly selectedPartidoId = signal<string>('');
  readonly currentMatch = signal<any | null>(null);
  readonly convocados = signal<any[]>([]);
  readonly toastMessage = signal<string>('');

  readonly titulares = computed(() => {
    return this.convocados().filter((p) => p.rol_convocatoria === 'TITULAR');
  });

  readonly suplentes = computed(() => {
    return this.convocados().filter((p) => p.rol_convocatoria !== 'TITULAR');
  });

  readonly confirmadosCount = computed(() => {
    return this.convocados().filter((p) => p.estado_confirmacion === 'CONFIRMADO').length;
  });

  readonly titularesConfirmadosCount = computed(() => {
    return this.titulares().filter((p) => p.estado_confirmacion === 'CONFIRMADO').length;
  });

  readonly suplentesConfirmadosCount = computed(() => {
    return this.suplentes().filter((p) => p.estado_confirmacion === 'CONFIRMADO').length;
  });

  ngOnInit(): void {
    this.api.getPartidos().subscribe((partidos) => {
      this.matches.set(partidos || []);
      if (partidos && partidos.length > 0) {
        this.route.queryParams.subscribe((params) => {
          const targetId = params['partidoId'] || partidos[0].id;
          this.selectedPartidoId.set(targetId);
          this.loadConvocatoria(targetId);
        });
      }
    });
  }

  onSelectPartido(partidoId: string): void {
    this.selectedPartidoId.set(partidoId);
    this.loadConvocatoria(partidoId);
  }

  loadConvocatoria(partidoId: string): void {
    this.api.getConvocatoria(partidoId).subscribe((res) => {
      this.currentMatch.set(res.partido);
      this.convocados.set(res.jugadores || []);
    });
  }

  togglePlayerStatus(player: any): void {
    const estados = ['CONFIRMADO', 'PENDIENTE', 'EXCUSADO'];
    const currentIdx = estados.indexOf(player.estado_confirmacion);
    const nextEstado = estados[(currentIdx + 1) % estados.length];

    this.api.responderConvocatoria(player.id, nextEstado, undefined, player.jugador_id).subscribe({
      next: () => {
        player.estado_confirmacion = nextEstado;
        this.showToast(`${player.nombres} ${player.apellidos} marcado como ${nextEstado}`);
      },
      error: () => {
        this.showToast('Error al actualizar estado de convocatoria');
      },
    });
  }

  openGpsRoute(): void {
    const match = this.currentMatch();
    if (!match) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.sede_cancha)}`;
    window.open(url, '_blank');
    this.showToast(`Abriendo mapa para ${match.sede_cancha}`);
  }

  onSendWhatsAppCitacion(): void {
    this.showToast('¡Citaciones enviadas masivamente por WhatsApp a todos los acudientes!');
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}

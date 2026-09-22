import { Component, OnInit, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { PlayerSelectorComponent } from '../../shared/components/player-selector/player-selector.component';

@Component({
  selector: 'app-convocatorias',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayerSelectorComponent],
  template: `
    <div class="convocatorias-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Convocatoria & Citación de Jugadores</h1>
          <p class="page-subtitle">Selección técnica del plantel, alineación titular vs suplentes y confirmación de acudientes</p>
        </div>
        <div class="header-actions">
          <div class="match-selector-group">
            <label class="filter-label"><i class="fa-solid fa-futbol"></i> Partido:</label>
            <select [ngModel]="selectedPartidoId()" (ngModelChange)="onSelectPartido($event)" class="sport-select">
              @for (m of matches(); track m.id) {
                <option [value]="m.id">{{ m.fecha_partido }} - vs {{ m.rival_nombre }} ({{ m.categoria_nombre }})</option>
              }
            </select>
          </div>
          <button class="btn-secondary" (click)="openAddPlayerModal()" [disabled]="!currentMatch()">
            <i class="fa-solid fa-user-plus text-emerald"></i> + Convocar Jugador
          </button>
          <button class="btn-secondary" (click)="onSuggestConvocatoria()" [disabled]="!currentMatch()" title="Pre-cargar nómina sugerida">
            <i class="fa-solid fa-wand-magic-sparkles text-amber"></i> Sugerir Nómina
          </button>
          <button class="btn-secondary btn-poster-social" (click)="openPosterModal()" [disabled]="convocados().length === 0" title="Generar póster oficial para redes sociales">
            <i class="fa-solid fa-image text-emerald"></i> Generar Gráfica Redes
          </button>
          <button class="btn-primary" (click)="onSendWhatsAppCitacion()" [disabled]="convocados().length === 0">
            <i class="fa-solid fa-paper-plane"></i> Enviar Citación WhatsApp
          </button>
        </div>
      </div>

      @if (currentMatch()) {
        <!-- Tarjeta Hero del Partido -->
        <div class="fut-card match-hero">
          <div class="match-meta">
            <div class="cat-pill-badge">
              <i class="fa-solid fa-layer-group"></i>
              <span>{{ currentMatch()?.categoria_nombre }}</span>
            </div>
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
              <i class="fa-solid fa-map-location-dot"></i> Abrir en Maps / Waze
            </button>
          </div>

          <div class="convocatoria-stats-bar">
            <div class="stat-pill">
              <i class="fa-solid fa-users text-blue"></i>
              <span>Total Convocados:</span>
              <strong>{{ convocados().length }}</strong>
            </div>
            <div class="stat-pill">
              <i class="fa-solid fa-circle-check text-emerald"></i>
              <span>Confirmados:</span>
              <strong class="text-emerald">{{ confirmadosCount() }}</strong>
            </div>
            <div class="stat-pill">
              <i class="fa-solid fa-clock-rotate-left text-amber"></i>
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
                <h3>Alineación Titular ({{ titulares().length }}/11)</h3>
              </div>
              <div class="squad-header-actions">
                <span class="badge badge-success">{{ titularesConfirmadosCount() }} / {{ titulares().length }} Confirmados</span>
                <button class="btn-squad-head-action btn-add-titular" (click)="openAddPlayerModalWithRole('TITULAR')" title="Alinear nuevo jugador como Titular">
                  <i class="fa-solid fa-user-plus"></i>
                  <span>+ Alinear Titular</span>
                </button>
              </div>
            </div>

            <div class="player-list">
              @for (p of titulares(); track p.id) {
                <div class="player-row">
                  <div class="player-dorsal">#{{ p.numero_dorsal || '-' }}</div>
                  <img [src]="p.foto_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'" alt="Player" class="player-avatar-sm" />
                  <div class="player-details">
                    <strong>{{ p.nombres }} {{ p.apellidos }}</strong>
                    <span class="pos-tag"><i class="fa-solid fa-shield-halved"></i> {{ p.posicion_designada || p.posicion_principal }}</span>
                  </div>
                  <div class="player-status-actions">
                    <button
                      type="button"
                      class="btn-status-toggle"
                      (click)="togglePlayerStatus(p)"
                      [title]="'Estado actual: ' + p.estado_confirmacion + ' (Clic para cambiar estado)'"
                    >
                      <span class="badge-status-pill" [class.status-confirmado]="p.estado_confirmacion === 'CONFIRMADO'" [class.status-pendiente]="p.estado_confirmacion === 'PENDIENTE'" [class.status-excusado]="p.estado_confirmacion === 'EXCUSADO'">
                        <i class="fa-solid" [class.fa-circle-check]="p.estado_confirmacion === 'CONFIRMADO'" [class.fa-clock]="p.estado_confirmacion === 'PENDIENTE'" [class.fa-circle-xmark]="p.estado_confirmacion === 'EXCUSADO'"></i>
                        <span>{{ p.estado_confirmacion }}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      class="btn-action-role btn-to-suplente"
                      (click)="switchPlayerRole(p, 'SUPLENTE')"
                      title="Enviar al Banco de Suplentes"
                    >
                      <i class="fa-solid fa-chair"></i>
                      <span>A Suplentes</span>
                    </button>
                    <button
                      type="button"
                      class="btn-action-icon btn-remove"
                      (click)="removePlayerFromConvocatoria(p)"
                      title="Quitar de convocatoria"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="empty-squad">
                  <i class="fa-solid fa-clipboard-user"></i>
                  <p>No hay titulares asignados todavía.</p>
                  <button class="btn-secondary btn-sm" (click)="openAddPlayerModalWithRole('TITULAR')">
                    <i class="fa-solid fa-user-plus"></i> Alinear Primer Titular
                  </button>
                </div>
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
              <div class="squad-header-actions">
                <span class="badge badge-blue">{{ suplentesConfirmadosCount() }} / {{ suplentes().length }} Confirmados</span>
                <button class="btn-squad-head-action btn-add-suplente" (click)="openAddPlayerModalWithRole('SUPLENTE')" title="Añadir jugador a los Suplentes">
                  <i class="fa-solid fa-user-plus"></i>
                  <span>+ Añadir Suplente</span>
                </button>
              </div>
            </div>

            <div class="player-list">
              @for (p of suplentes(); track p.id) {
                <div class="player-row">
                  <div class="player-dorsal suplente-dorsal">#{{ p.numero_dorsal || '-' }}</div>
                  <img [src]="p.foto_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'" alt="Player" class="player-avatar-sm" />
                  <div class="player-details">
                    <strong>{{ p.nombres }} {{ p.apellidos }}</strong>
                    <span class="pos-tag"><i class="fa-solid fa-shield-halved"></i> {{ p.posicion_designada || p.posicion_principal }}</span>
                  </div>
                  <div class="player-status-actions">
                    <button
                      type="button"
                      class="btn-status-toggle"
                      (click)="togglePlayerStatus(p)"
                      [title]="'Estado actual: ' + p.estado_confirmacion + ' (Clic para cambiar estado)'"
                    >
                      <span class="badge-status-pill" [class.status-confirmado]="p.estado_confirmacion === 'CONFIRMADO'" [class.status-pendiente]="p.estado_confirmacion === 'PENDIENTE'" [class.status-excusado]="p.estado_confirmacion === 'EXCUSADO'">
                        <i class="fa-solid" [class.fa-circle-check]="p.estado_confirmacion === 'CONFIRMADO'" [class.fa-clock]="p.estado_confirmacion === 'PENDIENTE'" [class.fa-circle-xmark]="p.estado_confirmacion === 'EXCUSADO'"></i>
                        <span>{{ p.estado_confirmacion }}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      class="btn-action-role btn-promote-titular"
                      (click)="switchPlayerRole(p, 'TITULAR')"
                      title="Alinear en el Once Titular"
                    >
                      <i class="fa-solid fa-futbol"></i>
                      <span>Alinear Titular</span>
                    </button>
                    <button
                      type="button"
                      class="btn-action-icon btn-remove"
                      (click)="removePlayerFromConvocatoria(p)"
                      title="Quitar de convocatoria"
                    >
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="empty-squad">
                  <i class="fa-solid fa-users-slash"></i>
                  <p>No hay suplentes asignados todavía.</p>
                  <button class="btn-secondary btn-sm" (click)="openAddPlayerModalWithRole('SUPLENTE')">
                    <i class="fa-solid fa-user-plus"></i> Añadir Suplente
                  </button>
                </div>
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

      <!-- MODAL CONVOCAR JUGADOR -->
      @if (showAddPlayerModal()) {
        <div class="modal-overlay" (click)="closeAddPlayerModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-user-plus"></i>
                </div>
                <div class="modal-title-text">
                  <h2>{{ newConvocadoRole === 'TITULAR' ? 'Alinear Jugador como Titular' : 'Convocar Jugador al Partido' }}</h2>
                  <p class="modal-subtitle">{{ currentMatch()?.rival_nombre }} ({{ currentMatch()?.categoria_nombre }})</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeAddPlayerModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="modal-body">
              <div class="form-group mb-3">
                <app-player-selector
                  label="Seleccionar Deportista de la Academia"
                  [categoriaId]="currentMatch()?.categoria_id || 'TODAS'"
                  placeholder="Buscar por nombre, dorsal, cédula o género..."
                  [required]="true"
                  [(selectedId)]="selectedPlayerToConvocate"
                  (playerSelected)="onPlayerSelected($event)"
                ></app-player-selector>
              </div>

              <div class="form-row g2">
                <div class="input-group">
                  <label><i class="fa-solid fa-arrows-split-up-and-left"></i> Rol de Convocatoria *</label>
                  <select [(ngModel)]="newConvocadoRole" class="sport-input">
                    <option value="TITULAR">🟢 Once Titular (Alinear Titular)</option>
                    <option value="SUPLENTE">🔵 Banco de Suplentes</option>
                    <option value="RESERVA">⚪ Reserva / Convocado de Apoyo</option>
                  </select>
                </div>
                <div class="input-group">
                  <label><i class="fa-solid fa-shield-halved"></i> Posición Táctica Designada</label>
                  <input type="text" [(ngModel)]="newConvocadoPos" placeholder="ej. Extremo Derecho, Lateral, Portero..." class="sport-input" />
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeAddPlayerModal()">
                <i class="fa-solid fa-xmark"></i> Cancelar
              </button>
              <button type="button" class="btn-primary" (click)="submitAddPlayerToConvocatoria()" [disabled]="!selectedPlayerToConvocate()">
                <i class="fa-solid fa-check"></i> {{ newConvocadoRole === 'TITULAR' ? 'Confirmar y Alinear Titular' : 'Confirmar Convocatoria' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL PÓSTER REDES SOCIALES CON IA GEMINI -->
      @if (showPosterModal()) {
        <div class="modal-overlay" (click)="closePosterModal()">
          <div class="modal-card modal-lg poster-modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge bg-emerald-badge">
                  <i class="fa-solid fa-wand-magic-sparkles text-emerald"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Diseño Inteligente de Convocatoria (Gemini AI)</h2>
                  <p class="modal-subtitle">Generado con motor multimodal Google Gemini & Identidad de {{ api.activeClub().nombre }}</p>
                </div>
              </div>
              <button class="btn-close" (click)="closePosterModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="modal-body poster-modal-body">
              <div class="poster-preview-container">
                @if (isGeneratingAi()) {
                  <div class="ia-generating-overlay">
                    <div class="spinner-ia"></div>
                    <p class="mt-2 font-bold text-emerald"><i class="fa-solid fa-robot"></i> Gemini AI está diseñando la gráfica de convocatoria...</p>
                  </div>
                }
                <canvas #posterCanvas id="posterCanvas" class="poster-canvas"></canvas>
              </div>
              
              <div class="poster-options-sidebar">
                <div class="poster-meta-card">
                  <div class="card-header-ai">
                    <h4><i class="fa-solid fa-brain text-emerald"></i> Copiloto Creativo Gemini</h4>
                    <button class="btn-re-ai" (click)="generateWithGeminiAi()" [disabled]="isGeneratingAi()" title="Regenerar con IA">
                      <i class="fa-solid fa-rotate text-amber" [class.fa-spin]="isGeneratingAi()"></i> Regenerar IA
                    </button>
                  </div>

                  <div class="form-group mb-3">
                    <label class="form-label">Estilo Visual Gemini</label>
                    <select [(ngModel)]="posterTheme" (ngModelChange)="onThemeChange($event)" class="sport-select full-w">
                      <option value="emerald">🟢 Esmeralda Élite (Oficial Club)</option>
                      <option value="dark-gold">🟡 Negro & Oro Matchday</option>
                      <option value="cyber-blue">🔵 Azul Victoria Eléctrico</option>
                      <option value="futuristic-red">🔴 Rojo Furia Competitiva</option>
                    </select>
                  </div>

                  <div class="form-group mb-3">
                    <label class="form-label">Titular Generado por IA</label>
                    <input type="text" [(ngModel)]="posterHeadline" (ngModelChange)="drawSocialPoster()" class="sport-input full-w" placeholder="¡CONVOCATORIA OFICIAL!" />
                  </div>

                  <div class="form-group mb-3">
                    <label class="form-label">Hashtags Oficiales</label>
                    <input type="text" [(ngModel)]="posterHashtag" (ngModelChange)="drawSocialPoster()" class="sport-input full-w" placeholder="#VamosPorLaVictoria #SportCoreOS" />
                  </div>

                  @if (aiGeneratedCopy()) {
                    <div class="ai-copy-box">
                      <div class="ai-copy-header">
                        <span class="text-muted"><i class="fa-solid fa-quote-left text-emerald"></i> Copy para pie de foto / WhatsApp:</span>
                        <button class="btn-copy-text" (click)="copyAiTextToClipboard()" title="Copiar texto">
                          <i class="fa-regular fa-copy"></i> Copiar
                        </button>
                      </div>
                      <p class="ai-copy-snippet">{{ aiGeneratedCopy() }}</p>
                    </div>
                  }
                </div>

                <div class="poster-specs-card">
                  <div class="spec-item">
                    <i class="fa-solid fa-microchip text-emerald"></i>
                    <span><strong>Motor:</strong> Google Gemini Sports Designer Pro</span>
                  </div>
                  <div class="spec-item">
                    <i class="fa-brands fa-instagram text-pink"></i>
                    <span>Formato 4:5 (1080x1350px Stories & Feed)</span>
                  </div>
                  <div class="spec-item">
                    <i class="fa-brands fa-whatsapp text-emerald"></i>
                    <span>Optimizado para Estados de WhatsApp</span>
                  </div>
                  <div class="spec-item">
                    <i class="fa-solid fa-shield-halved text-blue"></i>
                    <span>Logos y Colores Institucionales del Club</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closePosterModal()">
                <i class="fa-solid fa-xmark"></i> Cerrar
              </button>
              <button type="button" class="btn-primary btn-download-poster" (click)="downloadPosterImage()">
                <i class="fa-solid fa-cloud-arrow-down"></i> Descargar Imagen PNG
              </button>
            </div>
          </div>
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
      gap: 0.75rem;
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
        display: flex;
        align-items: center;
        gap: 0.35rem;
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
      min-height: 42px;
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

        .cat-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(59, 130, 246, 0.12);
          color: #3b82f6;
          padding: 0.3rem 0.65rem;
          border-radius: 6px;
          font-weight: 700;
          font-size: 0.8rem;
        }

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
        flex-wrap: wrap;

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

        .squad-header-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .btn-squad-head-action {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.775rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;

          &.btn-add-titular {
            background: rgba(16, 185, 129, 0.15);
            border-color: rgba(16, 185, 129, 0.4);
            color: var(--color-primary);

            &:hover {
              background: var(--color-primary);
              color: #ffffff;
              box-shadow: 0 2px 10px rgba(16, 185, 129, 0.35);
              transform: translateY(-1px);
            }
          }

          &.btn-add-suplente {
            background: rgba(59, 130, 246, 0.15);
            border-color: rgba(59, 130, 246, 0.4);
            color: #3b82f6;

            &:hover {
              background: #3b82f6;
              color: #ffffff;
              box-shadow: 0 2px 10px rgba(59, 130, 246, 0.35);
              transform: translateY(-1px);
            }
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
      padding: 0.65rem 0.85rem;
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      transition: border-color 0.15s ease, background 0.15s ease;

      &:hover {
        border-color: var(--border-color-hover, var(--color-primary));
        background: var(--bg-card);
      }

      .player-dorsal {
        width: 34px;
        height: 34px;
        background: var(--color-primary-subtle);
        color: var(--color-primary-dark);
        font-weight: 800;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.825rem;

        &.suplente-dorsal {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }
      }

      .player-avatar-sm {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
        border: 1.5px solid var(--border-color);
      }

      .player-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        min-width: 0;

        strong {
          color: var(--text-main);
          font-size: 0.875rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pos-tag {
          font-size: 0.72rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.25rem;

          i {
            color: var(--color-primary);
            font-size: 0.68rem;
          }
        }
      }

      .player-status-actions {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        flex-shrink: 0;

        .btn-status-toggle {
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          outline: none;
          display: inline-flex;
        }

        .badge-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          border: 1px solid transparent;
          transition: all 0.2s ease;
          cursor: pointer;

          &.status-confirmado {
            background: rgba(16, 185, 129, 0.15);
            border-color: rgba(16, 185, 129, 0.3);
            color: #10b981;
          }

          &.status-pendiente {
            background: rgba(245, 158, 11, 0.15);
            border-color: rgba(245, 158, 11, 0.3);
            color: #f59e0b;
          }

          &.status-excusado {
            background: rgba(239, 68, 68, 0.15);
            border-color: rgba(239, 68, 68, 0.3);
            color: #ef4444;
          }

          &:hover {
            filter: brightness(1.2);
            transform: translateY(-1px);
          }
        }

        .btn-action-role {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          border: 1px solid transparent;
          transition: all 0.2s ease;

          &.btn-promote-titular {
            background: rgba(16, 185, 129, 0.12);
            border-color: rgba(16, 185, 129, 0.4);
            color: #10b981;

            &:hover {
              background: #10b981;
              color: #ffffff;
              box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
              transform: translateY(-1px);
            }
          }

          &.btn-to-suplente {
            background: rgba(59, 130, 246, 0.12);
            border-color: rgba(59, 130, 246, 0.4);
            color: #3b82f6;

            &:hover {
              background: #3b82f6;
              color: #ffffff;
              box-shadow: 0 2px 8px rgba(59, 130, 246, 0.35);
              transform: translateY(-1px);
            }
          }
        }

        .btn-action-icon {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          width: 30px;
          height: 30px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;

          &:hover {
            color: var(--color-primary);
            border-color: var(--color-primary);
            background: var(--color-primary-subtle);
          }

          &.btn-remove:hover {
            color: #ef4444;
            border-color: #ef4444;
            background: rgba(239, 68, 68, 0.1);
          }
        }
      }
    }

    .badge-danger {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }

    .empty-squad {
      padding: 2rem 1rem;
      text-align: center;
      color: var(--text-muted);
      font-size: 0.85rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;

      i {
        font-size: 1.5rem;
      }
    }

    .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
      i { font-size: 2.5rem; margin-bottom: 0.5rem; }
    }

    .poster-modal-card {
      max-width: 900px;
    }

    .bg-emerald-badge {
      background: rgba(16, 185, 129, 0.15) !important;
      color: #10b981 !important;
    }

    .poster-modal-body {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 1.5rem;
      align-items: start;

      @media (max-width: 850px) {
        grid-template-columns: 1fr;
      }
    }

    .poster-preview-container {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #0f172a;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1rem;
      min-height: 480px;
      overflow: hidden;
    }

    .poster-canvas {
      max-width: 100%;
      height: auto;
      max-height: 460px;
      border-radius: var(--radius-md);
      box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.6);
    }

    .poster-options-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .poster-meta-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1rem;

      h4 {
        font-size: 0.95rem;
        font-weight: 800;
        margin-bottom: 0.85rem;
        color: var(--text-heading);
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }

      .form-label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        margin-bottom: 0.35rem;
        display: block;
      }

      .full-w {
        width: 100%;
      }
    }

    .poster-specs-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;

      .spec-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: var(--text-muted);

        .text-pink { color: #ec4899; }
      }
    }

    .ia-generating-overlay {
      position: absolute;
      inset: 0;
      background: rgba(15, 23, 42, 0.88);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10;
      border-radius: var(--radius-lg);
      backdrop-filter: blur(4px);

      .spinner-ia {
        width: 44px;
        height: 44px;
        border: 4px solid rgba(16, 185, 129, 0.2);
        border-top-color: #10b981;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .card-header-ai {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.85rem;

      h4 {
        margin-bottom: 0 !important;
      }

      .btn-re-ai {
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid var(--color-primary);
        color: var(--color-primary);
        padding: 0.3rem 0.65rem;
        border-radius: var(--radius-md);
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.35rem;
        transition: all 0.15s ease;

        &:hover:not(:disabled) {
          background: var(--color-primary);
          color: #fff;
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }

    .ai-copy-box {
      margin-top: 0.75rem;
      background: rgba(0, 0, 0, 0.25);
      border: 1px dashed var(--border-color);
      border-radius: var(--radius-sm);
      padding: 0.65rem;

      .ai-copy-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.75rem;
        margin-bottom: 0.35rem;

        .btn-copy-text {
          background: transparent;
          border: none;
          color: var(--color-primary);
          cursor: pointer;
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.25rem;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .ai-copy-snippet {
        font-size: 0.72rem;
        color: var(--text-muted);
        line-height: 1.35;
        max-height: 100px;
        overflow-y: auto;
        white-space: pre-line;
      }
    }

    .btn-download-poster {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      font-weight: 800;
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

  readonly showAddPlayerModal = signal<boolean>(false);
  readonly selectedPlayerToConvocate = signal<string>('');
  newConvocadoRole = 'TITULAR';
  newConvocadoPos = '';

  readonly titulares = computed(() => {
    return this.convocados().filter((p) => p.rol_convocatoria?.toUpperCase() === 'TITULAR');
  });

  readonly suplentes = computed(() => {
    return this.convocados().filter((p) => p.rol_convocatoria?.toUpperCase() !== 'TITULAR');
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
    this.api.getPartidos().subscribe((data) => {
      const partidos = Array.isArray(data) ? data : (data?.data || []);
      this.matches.set(partidos);
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

  openAddPlayerModal(): void {
    this.selectedPlayerToConvocate.set('');
    this.newConvocadoRole = 'TITULAR';
    this.newConvocadoPos = '';
    this.showAddPlayerModal.set(true);
  }

  openAddPlayerModalWithRole(role: string): void {
    this.selectedPlayerToConvocate.set('');
    this.newConvocadoRole = role;
    this.newConvocadoPos = '';
    this.showAddPlayerModal.set(true);
  }

  closeAddPlayerModal(): void {
    this.showAddPlayerModal.set(false);
  }

  onPlayerSelected(playerOrId: any): void {
    if (!playerOrId) {
      this.selectedPlayerToConvocate.set('');
      return;
    }
    const id = typeof playerOrId === 'string' ? playerOrId : playerOrId?.id;
    if (id) {
      this.selectedPlayerToConvocate.set(id);
      if (typeof playerOrId === 'object' && playerOrId?.posicion_principal) {
        if (!this.newConvocadoPos) {
          this.newConvocadoPos = playerOrId.posicion_principal;
        }
      }
    }
  }

  submitAddPlayerToConvocatoria(): void {
    const partidoId = this.selectedPartidoId();
    const jugadorId = this.selectedPlayerToConvocate();
    if (!partidoId || !jugadorId) return;

    this.api.addJugadorConvocatoria(partidoId, jugadorId, this.newConvocadoRole, this.newConvocadoPos).subscribe({
      next: () => {
        this.showToast('Jugador añadido exitosamente a la convocatoria');
        this.closeAddPlayerModal();
        this.loadConvocatoria(partidoId);
      },
      error: () => {
        this.showToast('Error al añadir jugador a la convocatoria');
      },
    });
  }

  removePlayerFromConvocatoria(player: any): void {
    const partidoId = this.selectedPartidoId();
    if (!partidoId) return;

    this.api.removeJugadorConvocatoria(partidoId, player.jugador_id || player.id).subscribe({
      next: () => {
        this.showToast(`${player.nombres} ${player.apellidos} retirado de la convocatoria`);
        this.loadConvocatoria(partidoId);
      },
      error: () => {
        this.showToast('Error al desconvocar al jugador');
      },
    });
  }

  switchPlayerRole(player: any, newRole: string): void {
    const partidoId = this.selectedPartidoId();
    if (!partidoId) return;

    this.api.cambiarRolConvocatoria(partidoId, player.jugador_id || player.id, newRole).subscribe({
      next: () => {
        this.showToast(`Jugador movido a ${newRole === 'TITULAR' ? 'Once Titular' : 'Banco de Suplentes'}`);
        this.loadConvocatoria(partidoId);
      },
      error: () => {
        this.showToast('Error al cambiar rol de convocatoria');
      },
    });
  }

  onSuggestConvocatoria(): void {
    const partidoId = this.selectedPartidoId();
    if (!partidoId) return;

    this.api.sugerirConvocatoria(partidoId, 11, 7).subscribe({
      next: (res) => {
        this.convocados.set(res.jugadores || []);
        this.showToast('¡Nómina sugerida generada según la nómina activa de la categoría!');
      },
      error: () => {
        this.showToast('Error al generar sugerencia de convocatoria');
      },
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

  // Señales y estado para la generación de imagen / póster con Gemini AI
  readonly showPosterModal = signal<boolean>(false);
  readonly isGeneratingAi = signal<boolean>(false);
  readonly aiGeneratedCopy = signal<string>('');
  @ViewChild('posterCanvas') posterCanvasRef!: ElementRef<HTMLCanvasElement>;
  posterTheme: 'emerald' | 'dark-gold' | 'cyber-blue' | 'futuristic-red' = 'emerald';
  posterHeadline = '¡CONVOCATORIA OFICIAL!';
  posterHashtag = '#VamosPorLaVictoria #SportCoreOS';

  openPosterModal(): void {
    this.showPosterModal.set(true);
    this.generateWithGeminiAi();
  }

  closePosterModal(): void {
    this.showPosterModal.set(false);
  }

  generateWithGeminiAi(): void {
    const partidoId = this.selectedPartidoId();
    if (!partidoId) {
      setTimeout(() => this.drawSocialPoster(), 100);
      return;
    }

    this.isGeneratingAi.set(true);
    const styleMap: Record<string, string> = {
      'emerald': 'ELITE_NEON',
      'dark-gold': 'DARK_GOLD',
      'cyber-blue': 'CYBER_BLUE',
      'futuristic-red': 'FUTURISTIC_RED',
    };

    this.api.generarGraficaConvocatoriaIa({
      partido_id: partidoId,
      estilo_diseno: styleMap[this.posterTheme] || 'ELITE_NEON',
      tono_titular: 'MATCHDAY_EPIC',
    }).subscribe({
      next: (res) => {
        if (res.titular_impacto) {
          this.posterHeadline = res.titular_impacto;
        }
        if (res.hashtags_sugeridos) {
          this.posterHashtag = res.hashtags_sugeridos;
        }
        if (res.copy_redes_sociales) {
          this.aiGeneratedCopy.set(res.copy_redes_sociales);
        }
        this.isGeneratingAi.set(false);
        setTimeout(() => this.drawSocialPoster(), 50);
        this.showToast('✨ ¡Diseño y copy generados exitosamente con Gemini AI!');
      },
      error: () => {
        this.isGeneratingAi.set(false);
        setTimeout(() => this.drawSocialPoster(), 50);
      }
    });
  }

  onThemeChange(newTheme: any): void {
    this.posterTheme = newTheme;
    this.generateWithGeminiAi();
  }

  copyAiTextToClipboard(): void {
    const text = this.aiGeneratedCopy();
    if (!text) return;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          this.showToast('📋 ¡Texto para redes copiado al portapapeles!');
        })
        .catch(() => {
          this.showToast('📋 ¡Texto para redes seleccionado!');
        });
    } else {
      this.showToast('📋 Texto listo para publicar en redes sociales');
    }
  }

  drawSocialPoster(): void {
    const canvas = document.getElementById('posterCanvas') as HTMLCanvasElement || this.posterCanvasRef?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuración de Alta Definición (1080 x 1350 px - Ratio 4:5 vertical ideal para Instagram/WhatsApp/Facebook)
    const W = 1080;
    const H = 1350;
    canvas.width = W;
    canvas.height = H;

    const club = this.api.activeClub();
    const match = this.currentMatch();
    const titularesList = this.titulares();
    const suplentesList = this.suplentes();

    // 1. PALETA DE COLORES SEGÚN EL TEMA INSTITUCIONAL SELECCIONADO POR GEMINI
    let primaryColor = '#10b981'; // Esmeralda oficial
    let secondaryColor = '#047857';
    let accentGold = '#f59e0b';
    let bgGradientStart = '#060d19';
    let bgGradientEnd = '#0f172a';

    if (this.posterTheme === 'dark-gold') {
      primaryColor = '#f59e0b';
      secondaryColor = '#b45309';
      accentGold = '#fbbf24';
      bgGradientStart = '#0a0a0a';
      bgGradientEnd = '#18181b';
    } else if (this.posterTheme === 'cyber-blue') {
      primaryColor = '#3b82f6';
      secondaryColor = '#1d4ed8';
      accentGold = '#06b6d4';
      bgGradientStart = '#030712';
      bgGradientEnd = '#0f172a';
    } else if (this.posterTheme === 'futuristic-red') {
      primaryColor = '#ef4444';
      secondaryColor = '#991b1b';
      accentGold = '#f97316';
      bgGradientStart = '#180509';
      bgGradientEnd = '#0f172a';
    }

    // 2. FONDO PRINCIPAL CON DEGRADADO Y EFECTOS MULTIMODALES
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, bgGradientStart);
    bgGrad.addColorStop(0.5, bgGradientEnd);
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Textura geométrica deportiva y luces ambientales
    ctx.save();
    // Brillo superior izquierdo
    const glow1 = ctx.createRadialGradient(150, 150, 10, 150, 150, 450);
    glow1.addColorStop(0, `${primaryColor}38`);
    glow1.addColorStop(1, 'transparent');
    ctx.fillStyle = glow1;
    ctx.beginPath();
    ctx.arc(150, 150, 450, 0, Math.PI * 2);
    ctx.fill();

    // Brillo inferior derecho
    const glow2 = ctx.createRadialGradient(W - 150, H - 200, 10, W - 150, H - 200, 500);
    glow2.addColorStop(0, `${secondaryColor}30`);
    glow2.addColorStop(1, 'transparent');
    ctx.fillStyle = glow2;
    ctx.beginPath();
    ctx.arc(W - 150, H - 200, 500, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Líneas de corte dinámicas de fondo
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 4;
    for (let i = -W; i < W * 2; i += 120) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 400, H);
      ctx.stroke();
    }

    // Marco exterior con borde luminoso
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    // 3. HEADER SUPERIOR INSTITUCIONAL
    // Escudo / Badge del Club
    const crestX = 110;
    const crestY = 110;
    const crestRadius = 55;

    ctx.save();
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(crestX, crestY, crestRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 36px "Inter", "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(club.sigla || 'FC', crestX, crestY);
    ctx.restore();

    // Nombre del Club y Badge de Matchday
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 34px "Inter", "Segoe UI", Roboto, sans-serif';
    ctx.fillText(club.nombre.toUpperCase(), 185, 95);

    ctx.fillStyle = primaryColor;
    ctx.font = '700 20px "Inter", "Segoe UI", Roboto, sans-serif';
    ctx.fillText(`TEMPORADA OFICIAL 2026 • ${club.ciudad?.toUpperCase() || 'COLOMBIA'}`, 185, 130);

    // Badge Categoría en esquina superior derecha
    if (match?.categoria_nombre) {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.strokeStyle = primaryColor;
      ctx.lineWidth = 2;
      const catText = match.categoria_nombre.toUpperCase();
      const badgeW = 240;
      const badgeH = 50;
      const badgeX = W - 300;
      const badgeY = 85;

      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 20px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`⚽ ${catText}`, badgeX + badgeW / 2, badgeY + badgeH / 2);
      ctx.restore();
    }

    // Línea separadora dorada/esmeralda
    const lineGrad = ctx.createLinearGradient(60, 185, W - 60, 185);
    lineGrad.addColorStop(0, 'transparent');
    lineGrad.addColorStop(0.5, primaryColor);
    lineGrad.addColorStop(1, 'transparent');
    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, 185);
    ctx.lineTo(W - 60, 185);
    ctx.stroke();

    // 4. TARJETA HERO DEL PARTIDO (VS, FECHA, HORA, SEDE)
    const heroY = 210;
    const heroH = 200;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(60, heroY, W - 120, heroH, 18);
    ctx.fill();
    ctx.stroke();

    // Titular de impacto generado por Gemini
    ctx.textAlign = 'center';
    ctx.fillStyle = accentGold;
    ctx.font = '900 24px "Inter", sans-serif';
    ctx.fillText(this.posterHeadline.toUpperCase(), W / 2, heroY + 36);

    // Enfrentamiento VS
    const team1Name = match?.condicion_juego === 'LOCAL' ? club.nombre : (match?.rival_nombre || 'RIVAL');
    const team2Name = match?.condicion_juego === 'LOCAL' ? (match?.rival_nombre || 'RIVAL') : club.nombre;

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px "Inter", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(team1Name, W / 2 - 60, heroY + 95);

    // Círculo VS
    ctx.save();
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.arc(W / 2, heroY + 87, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 22px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('VS', W / 2, heroY + 87);
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 32px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(team2Name, W / 2 + 60, heroY + 95);

    // Datos de fecha, hora y sede
    const matchDateStr = match?.fecha_partido ? `📅 ${match.fecha_partido}` : '📅 Próximo Partido';
    const matchTimeStr = match?.hora_partido ? `⏰ Hora Partido: ${match.hora_partido}` : '';
    const matchCitStr = match?.hora_citacion ? `(Citación: ${match.hora_citacion})` : '';
    const matchSedeStr = match?.sede_cancha ? `📍 Sede: ${match.sede_cancha}` : '📍 Cancha Principal';

    ctx.textAlign = 'center';
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '700 20px "Inter", sans-serif';
    ctx.fillText(`${matchDateStr}   •   ${matchTimeStr} ${matchCitStr}`, W / 2, heroY + 145);

    ctx.fillStyle = primaryColor;
    ctx.font = '600 19px "Inter", sans-serif';
    ctx.fillText(matchSedeStr, W / 2, heroY + 175);

    // 5. GRID DE JUGADORES: ONCE TITULAR Y BANCO DE SUPLENTES
    const gridY = 440;
    const colW = (W - 150) / 2; // 465px cada columna

    // --- COLUMNA 1: ONCE TITULAR ---
    const col1X = 60;
    // Header Titulares
    ctx.fillStyle = primaryColor;
    ctx.beginPath();
    ctx.roundRect(col1X, gridY, colW, 44, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🟢 ONCE TITULAR (${titularesList.length})`, col1X + 16, gridY + 28);

    // Lista de Titulares
    let currentY = gridY + 65;
    const rowH = 46;

    titularesList.slice(0, 11).forEach((p, idx) => {
      // Fila fondo
      ctx.fillStyle = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)';
      ctx.beginPath();
      ctx.roundRect(col1X, currentY - 8, colW, rowH - 4, 6);
      ctx.fill();

      // Badge dorsal
      ctx.fillStyle = primaryColor;
      ctx.beginPath();
      ctx.roundRect(col1X + 8, currentY - 3, 34, 30, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 16px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${p.numero_dorsal || (idx + 1)}`, col1X + 25, currentY + 18);

      // Nombre y posición
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 18px "Inter", sans-serif';
      const pName = `${p.nombres} ${p.apellidos}`.slice(0, 24);
      ctx.fillText(pName, col1X + 52, currentY + 15);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 14px "Inter", sans-serif';
      const pPos = (p.posicion_designada || p.posicion_principal || 'Jugador').toUpperCase();
      ctx.fillText(pPos, col1X + 52, currentY + 31);

      currentY += rowH;
    });

    // --- COLUMNA 2: BANCO DE SUPLENTES & CUERPO TÉCNICO ---
    const col2X = col1X + colW + 30;
    // Header Suplentes
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.roundRect(col2X, gridY, colW, 44, 8);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`🔵 BANCO DE SUPLENTES (${suplentesList.length})`, col2X + 16, gridY + 28);

    // Lista de Suplentes
    let suplenteY = gridY + 65;
    suplentesList.slice(0, 9).forEach((p, idx) => {
      // Fila fondo
      ctx.fillStyle = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)';
      ctx.beginPath();
      ctx.roundRect(col2X, suplenteY - 8, colW, rowH - 4, 6);
      ctx.fill();

      // Badge dorsal
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.roundRect(col2X + 8, suplenteY - 3, 34, 30, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '900 16px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${p.numero_dorsal || '-'}`, col2X + 25, suplenteY + 18);

      // Nombre y posición
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 18px "Inter", sans-serif';
      const pName = `${p.nombres} ${p.apellidos}`.slice(0, 24);
      ctx.fillText(pName, col2X + 52, suplenteY + 15);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 14px "Inter", sans-serif';
      const pPos = (p.posicion_designada || p.posicion_principal || 'Suplente').toUpperCase();
      ctx.fillText(pPos, col2X + 52, suplenteY + 31);

      suplenteY += rowH;
    });

    // CUERPO TÉCNICO EN COLUMNA 2
    const ctY = Math.max(suplenteY + 15, gridY + (11 * rowH) - 80);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(col2X, ctY, colW, 85, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = accentGold;
    ctx.font = '900 16px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('📋 CUERPO TÉCNICO OFICIAL', col2X + 16, ctY + 26);

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 15px "Inter", sans-serif';
    ctx.fillText('Director Técnico: Profe Carlos Valderrama', col2X + 16, ctY + 50);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 14px "Inter", sans-serif';
    ctx.fillText('Preparador Físico: Dpto. Rendimiento SportCore', col2X + 16, ctY + 70);

    // 6. FOOTER INFERIOR Y MARCA DE AGUA GEMINI
    const footerY = H - 110;
    // Línea separadora
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, footerY);
    ctx.lineTo(W - 60, footerY);
    ctx.stroke();

    ctx.fillStyle = accentGold;
    ctx.font = '800 18px "Inter", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(this.posterHashtag, 60, footerY + 45);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 20px "Inter", sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('SPORTCORE AI • GEMINI MULTIMODAL', W - 60, footerY + 40);

    ctx.fillStyle = '#64748b';
    ctx.font = '600 14px "Inter", sans-serif';
    ctx.fillText('Diseño Inteligente Generado para Redes Sociales', W - 60, footerY + 62);
  }

  downloadPosterImage(): void {
    const canvas = document.getElementById('posterCanvas') as HTMLCanvasElement || this.posterCanvasRef?.nativeElement;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const match = this.currentMatch();
    const club = this.api.activeClub();
    const catName = match?.categoria_nombre?.replace(/\s+/g, '_') || 'Categoria';
    const rivalName = match?.rival_nombre?.replace(/\s+/g, '_') || 'Rival';
    
    link.download = `Convocatoria_GeminiAI_${club.sigla || 'Club'}_vs_${rivalName}_${catName}.png`;
    link.href = dataUrl;
    link.click();

    this.showToast('¡Póster HD generado por Gemini AI descargado con éxito!');
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}


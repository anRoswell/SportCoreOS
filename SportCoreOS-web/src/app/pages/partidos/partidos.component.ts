import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CatalogosService } from '../../core/services/catalogos.service';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';

@Component({
  selector: 'app-partidos',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrDirective],
  template: `
    <div class="partidos-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">Fixture & Calendario de Partidos</h1>
          <p class="page-subtitle">Torneos oficiales, partidos amistosos y actas digitales de juego en tiempo real</p>
        </div>
        <div class="header-actions">
          <div class="filter-group">
            <label class="filter-label">Categoría:</label>
            <select [ngModel]="selectedCategoriaId()" (ngModelChange)="selectedCategoriaId.set($event)" class="sport-select">
              <option value="TODAS">Todas las Categorías</option>
              @for (cat of categorias(); track cat.id) {
                <option [value]="cat.id">{{ cat.nombre }}</option>
              }
            </select>
          </div>
          <button class="btn-primary" (click)="openScheduleModal()">
            <i class="fa-solid fa-calendar-plus"></i> Programar Nuevo Partido
          </button>
        </div>
      </div>

      <!-- PARTIDOS TABLE -->
      <div class="fut-table-container">
        <table class="fut-table">
          <thead>
            <tr>
              <th>Fecha / Hora</th>
              <th>Categoría</th>
              <th>Rival</th>
              <th>Condición</th>
              <th>Sede / Cancha</th>
              <th>Uniforme</th>
              <th>Marcador</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (p of filteredPartidos(); track p.id) {
              <tr class="match-table-row">
                <td>
                  <div class="date-box">
                    <strong>{{ p.fecha_partido }}</strong>
                    <small><i class="fa-regular fa-clock"></i> {{ p.hora_partido }} (Cit: {{ p.hora_citacion || p.hora_partido }})</small>
                  </div>
                </td>
                <td>
                  <span class="badge badge-blue">{{ p.categoria_nombre || 'Categoría' }}</span>
                </td>
                <td>
                  <strong class="rival-name">{{ p.rival_nombre }}</strong>
                </td>
                <td>
                  <span class="badge" [class.badge-success]="p.condicion_juego === 'LOCAL'" [class.badge-warning]="p.condicion_juego === 'VISITANTE'">
                    {{ p.condicion_juego }}
                  </span>
                </td>
                <td>
                  <div class="sede-cell">
                    <span>{{ p.sede_cancha }}</span>
                    <button class="btn-gps-link" (click)="openGps(p)" title="Ver en Google Maps">
                      <i class="fa-solid fa-map-location-dot"></i>
                    </button>
                  </div>
                </td>
                <td>
                  <span class="kit-tag">{{ p.indumentaria_kit || 'Titular' }}</span>
                </td>
                <td>
                  <div class="score-badge">
                    <span>{{ p.goles_club !== null ? p.goles_club : 0 }}</span> - <span>{{ p.goles_rival !== null ? p.goles_rival : 0 }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge" [class.badge-success]="p.estado_partido === 'PROGRAMADO'" [class.badge-blue]="p.estado_partido === 'FINALIZADO'">
                    {{ p.estado_partido }}
                  </span>
                </td>
                <td>
                  <div class="actions-row">
                    <button class="btn-secondary btn-sm btn-edit-match" (click)="openEditModal(p)" title="Editar Partido">
                      <i class="fa-solid fa-pen-to-square"></i> Editar
                    </button>
                    <button class="btn-secondary btn-sm" (click)="goToConvocatoria(p)" title="Ver y gestionar convocatoria">
                      <i class="fa-solid fa-users"></i> Convocatoria
                    </button>
                    <button class="btn-primary btn-sm btn-acta" (click)="openActaModal(p)" title="Ver acta digital y eventos">
                      <i class="fa-solid fa-clipboard-list"></i> Acta
                    </button>
                    <button class="btn-secondary btn-sm btn-delete-match" (click)="openDeleteModal(p)" title="Eliminar / Cancelar Partido">
                      <i class="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="9" class="empty-table-cell">
                  <i class="fa-solid fa-futbol"></i>
                  <p>No hay partidos registrados para esta categoría.</p>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- MODAL PROGRAMAR PARTIDO -->
      @if (showScheduleModal()) {
        <div class="modal-overlay" (click)="closeScheduleModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-calendar-plus"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Programar Partido Oficial</h2>
                  <p class="modal-subtitle">Crea el compromiso en el fixture y habilita la convocatoria técnica</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeScheduleModal()" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form (ngSubmit)="submitSchedule()" class="modal-form">
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-shield-halved"></i> Datos del Encuentro</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-users"></i> Categoría *</label>
                    <select [(ngModel)]="newMatch.categoria_id" name="categoria_id" class="sport-input" required>
                      @for (cat of categorias(); track cat.id) {
                        <option [value]="cat.id">{{ cat.nombre }} ({{ cat.codigo_categoria }})</option>
                      }
                    </select>
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-shield-cat"></i> Equipo Rival *</label>
                    <input type="text" [(ngModel)]="newMatch.rival_nombre" name="rival_nombre" placeholder="ej. Santa Fe D.C." class="sport-input" required />
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-regular fa-clock"></i> Horarios & Citación</span>
                <div class="form-row g3">
                  <div class="input-group">
                    <label><i class="fa-regular fa-calendar"></i> Fecha de Juego *</label>
                    <input type="text" appFlatpickr placeholder="dd/mm/aaaa" [(ngModel)]="newMatch.fecha_partido" name="fecha_partido" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-regular fa-clock"></i> Hora Partido *</label>
                    <input type="time" [(ngModel)]="newMatch.hora_partido" name="hora_partido" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-stopwatch"></i> Hora Citación</label>
                    <input type="time" [(ngModel)]="newMatch.hora_citacion" name="hora_citacion" class="sport-input" required />
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-location-dot"></i> Logística & Cancha</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-map-pin"></i> Sede / Cancha *</label>
                    <input type="text" [(ngModel)]="newMatch.sede_cancha" name="sede_cancha" placeholder="ej. Arrayanes - Cancha Sintética 1" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-arrows-split-up-and-left"></i> Condición *</label>
                    <select [(ngModel)]="newMatch.condicion_juego" name="condicion_juego" class="sport-input">
                      <option value="LOCAL">LOCAL</option>
                      <option value="VISITANTE">VISITANTE</option>
                    </select>
                  </div>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-shirt"></i> Indumentaria / Uniforme</label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="newMatch.indumentaria_kit" name="indumentaria_kit" class="sport-input">
                        @for (kit of kitsIndumentaria(); track kit.codigo) {
                          <option [value]="kit.nombre">{{ kit.nombre }}</option>
                        }
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeScheduleModal()">
                  <i class="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  <i class="fa-solid fa-calendar-check"></i> Guardar y Convocar Plantel
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL EDITAR PARTIDO (CON BOTONES DE ACCIÓN) -->
      @if (showEditModal() && selectedMatchToEdit()) {
        <div class="modal-overlay" (click)="closeEditModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-amber">
                  <i class="fa-solid fa-pen-to-square"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Editar Compromiso Deportivo</h2>
                  <p class="modal-subtitle">Modifica horarios, marcador oficial, condición y sede de juego</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeEditModal()" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form (ngSubmit)="submitEditMatch()" class="modal-form">
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-shield-halved"></i> Datos del Encuentro</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-users"></i> Categoría *</label>
                    <select [(ngModel)]="editMatch.categoria_id" name="editCatId" class="sport-input" required>
                      @for (cat of categorias(); track cat.id) {
                        <option [value]="cat.id">{{ cat.nombre }} ({{ cat.codigo_categoria }})</option>
                      }
                    </select>
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-shield-cat"></i> Equipo Rival *</label>
                    <input type="text" [(ngModel)]="editMatch.rival_nombre" name="editRival" class="sport-input" required />
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-regular fa-clock"></i> Horarios & Citación</span>
                <div class="form-row g3">
                  <div class="input-group">
                    <label><i class="fa-regular fa-calendar"></i> Fecha de Juego *</label>
                    <input type="text" appFlatpickr placeholder="dd/mm/aaaa" [(ngModel)]="editMatch.fecha_partido" name="editFecha" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-regular fa-clock"></i> Hora Partido *</label>
                    <input type="time" [(ngModel)]="editMatch.hora_partido" name="editHora" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-stopwatch"></i> Hora Citación</label>
                    <input type="time" [(ngModel)]="editMatch.hora_citacion" name="editCitacion" class="sport-input" required />
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-location-dot"></i> Logística & Marcador</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-map-pin"></i> Sede / Cancha *</label>
                    <input type="text" [(ngModel)]="editMatch.sede_cancha" name="editSede" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-arrows-split-up-and-left"></i> Condición *</label>
                    <select [(ngModel)]="editMatch.condicion_juego" name="editCondicion" class="sport-input">
                      <option value="LOCAL">LOCAL</option>
                      <option value="VISITANTE">VISITANTE</option>
                    </select>
                  </div>
                </div>

                <div class="form-row g3">
                  <div class="input-group">
                    <label><i class="fa-solid fa-futbol"></i> Goles Club</label>
                    <input type="number" [(ngModel)]="editMatch.goles_club" name="editGolesClub" min="0" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-futbol"></i> Goles Rival</label>
                    <input type="number" [(ngModel)]="editMatch.goles_rival" name="editGolesRival" min="0" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-toggle-on"></i> Estado Partido</label>
                    <select [(ngModel)]="editMatch.estado_partido" name="editEstado" class="sport-input">
                      <option value="PROGRAMADO">PROGRAMADO</option>
                      <option value="EN_CURSO">EN CURSO</option>
                      <option value="FINALIZADO">FINALIZADO</option>
                      <option value="APLAZADO">APLAZADO</option>
                      <option value="CANCELADO">CANCELADO</option>
                    </select>
                  </div>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-shirt"></i> Indumentaria / Uniforme</label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="editMatch.indumentaria_kit" name="editIndumentaria" class="sport-input">
                        @for (kit of kitsIndumentaria(); track kit.codigo) {
                          <option [value]="kit.nombre">{{ kit.nombre }}</option>
                        }
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                </div>
              </div>

              <!-- BOTONES DE ACCIÓN (FOOTER) -->
              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeEditModal()">
                  <i class="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  <i class="fa-solid fa-floppy-disk"></i> Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL ACTA DIGITAL DE PARTIDO -->
      @if (showActaModal() && selectedPartido()) {
        <div class="modal-overlay" (click)="closeActaModal()">
          <div class="modal-card modal-lg modal-xl" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-blue">
                  <i class="fa-solid fa-clipboard-check"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Acta Digital de Juego</h2>
                  <p class="modal-subtitle">{{ selectedPartido()?.categoria_nombre }} • {{ api.activeClub().nombre }} vs {{ selectedPartido()?.rival_nombre }}</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeActaModal()" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="modal-body-scroll">
              <!-- Resumen del Partido -->
              <div class="acta-score-header">
                <div class="acta-team">
                  <span class="acta-team-name">{{ api.activeClub().nombre }}</span>
                  <span class="acta-score">{{ selectedPartido()?.goles_club || 0 }}</span>
                </div>
                <div class="acta-vs">VS</div>
                <div class="acta-team">
                  <span class="acta-score">{{ selectedPartido()?.goles_rival || 0 }}</span>
                  <span class="acta-team-name">{{ selectedPartido()?.rival_nombre }}</span>
                </div>
              </div>

              <!-- Registrar Nuevo Evento -->
              <div class="acta-event-form fut-card">
                <h4><i class="fa-solid fa-plus-circle text-emerald"></i> Registrar Incidencia / Evento</h4>
                <div class="form-row g3">
                  <div class="input-group">
                    <label><i class="fa-solid fa-stopwatch"></i> Minuto</label>
                    <input type="number" [(ngModel)]="newEvent.minuto_juego" name="minuto_juego" min="1" max="120" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-flag"></i> Tipo de Evento</label>
                    <select [(ngModel)]="newEvent.tipo_evento" name="tipo_evento" class="sport-input">
                      <option value="GOL">⚽ Gol</option>
                      <option value="TARJETA_AMARILLA">🟨 Tarjeta Amarilla</option>
                      <option value="TARJETA_ROJA">🟥 Tarjeta Roja</option>
                      <option value="ASISTENCIA">👟 Asistencia</option>
                    </select>
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-comment-dots"></i> Descripción / Detalle</label>
                    <input type="text" [(ngModel)]="newEvent.descripcion" name="descripcion" placeholder="ej. Remate cruzado al ángulo" class="sport-input" />
                  </div>
                </div>
                <button type="button" class="btn-primary btn-sm" (click)="submitAddEvent()">
                  <i class="fa-solid fa-plus"></i> Añadir Evento al Acta
                </button>
              </div>

              <!-- Línea de Tiempo de Eventos -->
              <div class="events-timeline">
                <h4><i class="fa-solid fa-timeline text-emerald"></i> Cronología Oficial de Eventos</h4>
                @if (actaEvents().length > 0) {
                  <div class="timeline-list">
                    @for (ev of actaEvents(); track ev.id) {
                      <div class="timeline-item">
                        <span class="minute-badge">{{ ev.minuto_juego }}'</span>
                        <div class="event-desc">
                          <strong>{{ ev.tipo_evento }}</strong>
                          <span *ngIf="ev.jugador_nombre"> - {{ ev.jugador_nombre }} (#{{ ev.numero_dorsal }})</span>
                          <small *ngIf="ev.descripcion">({{ ev.descripcion }})</small>
                        </div>
                      </div>
                    }
                  </div>
                } @else {
                  <p class="text-muted">No hay eventos registrados en el acta aún.</p>
                }
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeActaModal()">
                <i class="fa-solid fa-xmark"></i> Cerrar Acta
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL CONFIRMAR ELIMINACIÓN DE PARTIDO -->
      @if (showDeleteModal() && matchToDelete()) {
        <div class="modal-overlay" (click)="closeDeleteModal()">
          <div class="delete-confirm-modal-card" (click)="$event.stopPropagation()">
            <div class="delete-confirm-header">
              <div class="delete-confirm-icon-wrap">
                <i class="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div class="delete-confirm-title-wrap">
                <h3>¿Eliminar Partido del Calendario?</h3>
                <p>Estás a punto de anular este compromiso del fixture oficial del club</p>
              </div>
              <button class="btn-close" (click)="closeDeleteModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="delete-confirm-body">
              <div class="player-retire-preview">
                <div class="match-mini-icon">
                  <i class="fa-solid fa-futbol"></i>
                </div>
                <div class="player-retire-info">
                  <span class="retire-player-name">vs. {{ matchToDelete()?.rival_nombre }}</span>
                  <div class="retire-player-tags">
                    <span class="meta-tag"><i class="fa-solid fa-layer-group"></i> {{ matchToDelete()?.categoria_nombre || 'Categoría' }}</span>
                    <span class="meta-tag"><i class="fa-regular fa-calendar"></i> {{ matchToDelete()?.fecha_partido }} ({{ matchToDelete()?.hora_partido }})</span>
                    <span class="meta-tag"><i class="fa-solid fa-location-dot"></i> {{ matchToDelete()?.sede_cancha }}</span>
                  </div>
                </div>
              </div>

              <div class="warning-callout">
                <i class="fa-solid fa-triangle-exclamation warning-callout-icon"></i>
                <div class="warning-callout-content">
                  <h4>Consecuencias de la Operación:</h4>
                  <ul>
                    <li>Se anularán las convocatorias y citaciones asociadas a este encuentro.</li>
                    <li>Las estadísticas y eventos registrados en el acta no se contabilizarán en la tabla.</li>
                    <li>Esta acción es definitiva y retirará el evento del calendario de los padres y deportistas.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeDeleteModal()">
                <i class="fa-solid fa-arrow-left"></i> Conservar Partido
              </button>
              <button type="button" class="btn-confirm-delete" (click)="confirmDeleteMatch()">
                <i class="fa-solid fa-trash-can"></i> Sí, Eliminar Partido
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
    .partidos-page {
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
    }

    .filter-group {
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

    .date-box {
      display: flex;
      flex-direction: column;
      strong { color: var(--text-main); font-size: 0.85rem; }
      small { color: var(--color-primary); font-weight: 700; font-size: 0.75rem; }
    }

    .rival-name {
      font-size: 0.9rem;
      color: var(--text-heading);
    }

    .sede-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      .btn-gps-link {
        background: transparent;
        border: none;
        color: var(--color-primary);
        cursor: pointer;
        font-size: 0.95rem;
        &:hover { color: var(--color-primary-dark); }
      }
    }

    .kit-tag {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .score-badge {
      font-weight: 800;
      font-size: 0.9rem;
      color: var(--text-heading);
      background: var(--bg-surface);
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      display: inline-block;
    }

    .actions-row {
      display: flex;
      gap: 0.5rem;
    }

    .btn-sm {
      padding: 0.35rem 0.65rem;
      font-size: 0.75rem;
    }

    .btn-acta {
      background: #3b82f6;
      border-color: #3b82f6;
      &:hover { background: #2563eb; }
    }

    .empty-table-cell {
      padding: 3rem;
      text-align: center;
      color: var(--text-muted);
      i { font-size: 2rem; margin-bottom: 0.5rem; }
    }

    /* MODAL (inherits from global _modals.scss) */

    /* ACTA */
    .acta-score-header {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 2.5rem;
      padding: 1.35rem;
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;

      .acta-team {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.35rem;

        .acta-team-name {
          font-weight: 800;
          font-size: 1.05rem;
          color: var(--text-heading);
        }

        .acta-score {
          font-size: 2.4rem;
          font-weight: 800;
          color: var(--color-primary);
        }
      }

      .acta-vs {
        font-weight: 800;
        color: var(--text-muted);
        font-size: 1.3rem;
      }
    }

    .acta-event-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.35rem;
      margin-bottom: 1.5rem;
      border-radius: var(--radius-md);

      h4 {
        font-size: 0.925rem;
        font-weight: 800;
        color: var(--text-heading);
        margin-bottom: 0.25rem;
      }
    }

    .events-timeline {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 0.5rem;

      h4 {
        font-size: 0.925rem;
        font-weight: 800;
        color: var(--text-heading);
        margin-bottom: 0.25rem;
      }

      .timeline-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .timeline-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem;
        background: var(--bg-surface);
        border-radius: var(--radius-sm);
        border-left: 3px solid var(--color-primary);

        .minute-badge {
          font-weight: 800;
          color: var(--color-primary);
          font-size: 0.85rem;
        }

        .event-desc {
          font-size: 0.85rem;
          color: var(--text-main);
        }
      }
    }

    .btn-delete-match {
      color: #ef4444;
      &:hover {
        background: rgba(239, 68, 68, 0.15);
        border-color: #ef4444;
      }
    }

    .match-mini-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: rgba(239, 68, 68, 0.12);
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
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
export class PartidosComponent implements OnInit {
  api = inject(ApiService);
  private catalogos = inject(CatalogosService);
  private router = inject(Router);

  readonly kitsIndumentaria = this.catalogos.kitsIndumentaria;
  readonly partidos = signal<any[]>([]);
  readonly categorias = signal<any[]>([]);
  readonly selectedCategoriaId = signal<string>('TODAS');
  readonly showScheduleModal = signal<boolean>(false);
  readonly showEditModal = signal<boolean>(false);
  readonly selectedMatchToEdit = signal<any | null>(null);
  readonly showActaModal = signal<boolean>(false);
  readonly selectedPartido = signal<any | null>(null);
  readonly actaEvents = signal<any[]>([]);
  readonly showDeleteModal = signal<boolean>(false);
  readonly matchToDelete = signal<any | null>(null);
  readonly toastMessage = signal<string>('');

  newMatch = {
    categoria_id: '',
    rival_nombre: '',
    fecha_partido: new Date().toISOString().split('T')[0],
    hora_partido: '09:00',
    hora_citacion: '08:00',
    sede_cancha: '',
    condicion_juego: 'LOCAL',
    indumentaria_kit: 'Kit Titular Verde Esmeralda',
  };

  editMatch = {
    categoria_id: '',
    rival_nombre: '',
    fecha_partido: new Date().toISOString().split('T')[0],
    hora_partido: '09:00',
    hora_citacion: '08:00',
    sede_cancha: '',
    condicion_juego: 'LOCAL',
    indumentaria_kit: 'Kit Titular Verde Esmeralda',
    goles_club: 0,
    goles_rival: 0,
    estado_partido: 'PROGRAMADO',
  };

  newEvent = {
    minuto_juego: 15,
    tipo_evento: 'GOL',
    descripcion: '',
  };

  readonly filteredPartidos = computed(() => {
    const list = this.partidos();
    const catId = this.selectedCategoriaId();
    if (catId === 'TODAS') return list;
    return list.filter((p) => p.categoria_id === catId);
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.api.getCategorias().subscribe((cats) => {
      this.categorias.set(cats || []);
      if (cats && cats.length > 0 && !this.newMatch.categoria_id) {
        this.newMatch.categoria_id = cats[0].id;
      }
    });

    this.api.getPartidos().subscribe((data) => {
      const rows = Array.isArray(data) ? data : (data?.data || []);
      this.partidos.set(rows);
    });
  }

  openScheduleModal(): void {
    this.showScheduleModal.set(true);
  }

  closeScheduleModal(): void {
    this.showScheduleModal.set(false);
  }

  openEditModal(partido: any): void {
    this.selectedMatchToEdit.set(partido);
    this.editMatch = {
      categoria_id: partido.categoria_id || (this.categorias().length > 0 ? this.categorias()[0].id : ''),
      rival_nombre: partido.rival_nombre || '',
      fecha_partido: partido.fecha_partido ? partido.fecha_partido.substring(0, 10) : new Date().toISOString().split('T')[0],
      hora_partido: partido.hora_partido || '09:00',
      hora_citacion: partido.hora_citacion || '08:00',
      sede_cancha: partido.sede_cancha || '',
      condicion_juego: partido.condicion_juego || 'LOCAL',
      indumentaria_kit: partido.indumentaria_kit || 'Kit Titular',
      goles_club: partido.goles_club !== null ? Number(partido.goles_club) : 0,
      goles_rival: partido.goles_rival !== null ? Number(partido.goles_rival) : 0,
      estado_partido: partido.estado_partido || 'PROGRAMADO',
    };
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedMatchToEdit.set(null);
  }

  submitSchedule(): void {
    if (!this.newMatch.categoria_id) {
      this.showToast('Debes seleccionar una categoría (*)');
      return;
    }
    if (!this.newMatch.rival_nombre?.trim()) {
      this.showToast('El nombre del equipo rival es obligatorio (*)');
      return;
    }
    if (!this.newMatch.fecha_partido) {
      this.showToast('Indica la fecha del encuentro (*)');
      return;
    }
    if (!this.newMatch.hora_partido) {
      this.showToast('Indica la hora de inicio del partido (*)');
      return;
    }
    if (!this.newMatch.sede_cancha?.trim()) {
      this.showToast('La sede o cancha es obligatoria (*)');
      return;
    }

    this.api.createPartido(this.newMatch).subscribe({
      next: () => {
        this.showToast('¡Partido programado y convocatoria creada exitosamente!');
        this.closeScheduleModal();
        this.loadData();
      },
      error: () => {
        this.showToast('Error al programar partido.');
      },
    });
  }

  submitEditMatch(): void {
    const partido = this.selectedMatchToEdit();
    if (!partido || !partido.id) return;

    if (!this.editMatch.categoria_id) {
      this.showToast('Debes seleccionar una categoría (*)');
      return;
    }
    if (!this.editMatch.rival_nombre?.trim()) {
      this.showToast('El nombre del equipo rival es obligatorio (*)');
      return;
    }
    if (!this.editMatch.fecha_partido) {
      this.showToast('Indica la fecha del encuentro (*)');
      return;
    }
    if (!this.editMatch.hora_partido) {
      this.showToast('Indica la hora de inicio del partido (*)');
      return;
    }
    if (!this.editMatch.sede_cancha?.trim()) {
      this.showToast('La sede o cancha es obligatoria (*)');
      return;
    }

    this.api.updatePartido(partido.id, this.editMatch).subscribe({
      next: () => {
        this.showToast('¡Compromiso deportivo actualizado exitosamente!');
        this.closeEditModal();
        this.loadData();
      },
      error: () => {
        this.showToast('Error al actualizar el partido.');
      },
    });
  }

  goToConvocatoria(partido: any): void {
    this.router.navigate(['/convocatorias'], { queryParams: { partidoId: partido.id } });
  }

  openActaModal(partido: any): void {
    this.selectedPartido.set(partido);
    this.showActaModal.set(true);
    this.api.getDetallePartido(partido.id).subscribe((detalle) => {
      this.actaEvents.set(detalle?.eventosActa || []);
    });
  }

  closeActaModal(): void {
    this.showActaModal.set(false);
    this.selectedPartido.set(null);
    this.actaEvents.set([]);
  }

  submitAddEvent(): void {
    const partido = this.selectedPartido();
    if (!partido) return;

    this.api.addEventoPartido(partido.id, this.newEvent).subscribe({
      next: (created) => {
        this.showToast('¡Evento registrado en el acta digital!');
        this.actaEvents.update((evs) => [...evs, created]);
        this.newEvent.descripcion = '';
      },
      error: () => {
        this.showToast('Error al registrar evento');
      },
    });
  }

  openGps(partido: any): void {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(partido.sede_cancha)}`;
    window.open(url, '_blank');
    this.showToast(`Abriendo ubicación para ${partido.sede_cancha}`);
  }

  openDeleteModal(partido: any): void {
    this.matchToDelete.set(partido);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.matchToDelete.set(null);
  }

  confirmDeleteMatch(): void {
    const match = this.matchToDelete();
    if (!match || !match.id) return;

    this.api.deletePartido(match.id).subscribe({
      next: () => {
        this.showToast(`Partido vs ${match.rival_nombre} eliminado del calendario.`);
        this.closeDeleteModal();
        this.loadData();
      },
      error: () => {
        this.showToast('Error al eliminar el partido.');
      }
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}

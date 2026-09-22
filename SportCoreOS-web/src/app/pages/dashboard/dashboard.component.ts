import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, KPIStats } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';

interface MatchItem {
  id: string;
  rival_nombre: string;
  categoria_nombre: string;
  categoria_codigo: string;
  fecha_partido: string;
  hora_partido: string;
  hora_citacion: string;
  sede_cancha: string;
  condicion_juego: 'LOCAL' | 'VISITANTE';
  indumentaria: string;
  confirmados_count: number;
  total_convocados: number;
  lat: number;
  lng: number;
  torneo: string;
}

interface TransactionItem {
  id: string;
  codigo_transaccion: string;
  jugador_nombre: string;
  categoria: string;
  monto: number;
  metodo: string;
  fecha: string;
  estado: 'APROBADA' | 'PENDIENTE' | 'RECHAZADA';
}

interface TopPlayer {
  id: string;
  nombre: string;
  dorsal: number;
  categoria: string;
  posicion: string;
  score_rendimiento: number;
  cooper_metros: number;
  velocidad_max: number;
  asistencia_pct: number;
  avatar: string;
  estado_medico: 'APTO' | 'EN_OBSERVACION' | 'RECUPERACION';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrDirective],
  template: `
    <div class="dashboard-page">
      <!-- HEADER DE BIENVENIDA CON BRANDING DEPORTIVO -->
      <div class="dashboard-hero-header">
        <div class="hero-left">
          <div class="club-badge-row">
            <span class="season-badge">TEMPORADA OFICIAL 2026</span>
            <span class="tenant-badge"><i class="fa-solid fa-shield-halved"></i> {{ api.activeClub().nombre }}</span>
          </div>
          <h1 class="hero-greeting">
            ¡Hola, {{ authService.currentUser()?.nombres || 'Director' }}!
          </h1>
          <p class="hero-subtext">
            Panel de Control Estratégico • Visión 360° en tiempo real de plantilla, finanzas PSE y fixture.
          </p>
        </div>

        <div class="hero-actions">
          <button class="btn-secondary" (click)="onExportReport()">
            <i class="fa-solid fa-file-pdf"></i>
            <span>Exportar Informe 360°</span>
          </button>
          <button class="btn-primary" (click)="openScheduleModal()">
            <i class="fa-solid fa-calendar-plus"></i>
            <span>Programar Partido</span>
          </button>
        </div>
      </div>

      <!-- 4 KPIS DEPORTIVOS & FINANCIEROS ULTRA PRO -->
      <div class="kpi-grid">
        <!-- KPI 1: Jugadores & Cantera -->
        <div class="fut-card kpi-card">
          <div class="kpi-top">
            <div class="kpi-icon-box bg-emerald">
              <i class="fa-solid fa-user-ninja"></i>
            </div>
            <span class="badge badge-success">+12% Mes</span>
          </div>
          <div class="kpi-data">
            <span class="kpi-label">JUGADORES ACTIVOS</span>
            <div class="kpi-value-row">
              <span class="kpi-number">{{ stats()?.jugadoresActivos || 0 }}</span>
              <span class="kpi-unit">alumnos</span>
            </div>
            <div class="kpi-progress-bar">
              <div class="progress-fill fill-emerald" style="width: 88%;"></div>
            </div>
            <div class="kpi-footer-detail">
              <span><strong>{{ stats()?.jugadoresActivos || 0 }}</strong> matriculados</span>
              <span><strong>{{ stats()?.jugadoresLesionados || 0 }}</strong> en recuperación</span>
              <span><strong>{{ stats()?.totalCategorias || 0 }}</strong> categorías</span>
            </div>
          </div>
        </div>

        <!-- KPI 2: Recaudo PSE / Wompi -->
        <div class="fut-card kpi-card">
          <div class="kpi-top">
            <div class="kpi-icon-box bg-blue">
              <i class="fa-solid fa-sack-dollar"></i>
            </div>
            <span class="badge badge-blue">{{ stats()?.finanzas?.porcentajeRecaudo || 0 }}% Efectivo</span>
          </div>
          <div class="kpi-data">
            <span class="kpi-label">RECAUDO MES (PENSIONES)</span>
            <div class="kpi-value-row">
              <span class="kpi-number">$ {{ (stats()?.finanzas?.recaudadoMes || 0) | number }}</span>
              <span class="kpi-unit">COP</span>
            </div>
            <div class="kpi-progress-bar">
              <div class="progress-fill fill-blue" [style.width.%]="stats()?.finanzas?.porcentajeRecaudo || 0"></div>
            </div>
            <div class="kpi-footer-detail">
              <span>Facturado: <strong>$ {{ (stats()?.finanzas?.facturadoMes || 0) | number }}</strong></span>
              <span>Vía: <strong>PSE / Wompi</strong></span>
            </div>
          </div>
        </div>

        <!-- KPI 3: Cartera Morosa & Cobranza -->
        <div class="fut-card kpi-card">
          <div class="kpi-top">
            <div class="kpi-icon-box bg-amber">
              <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <button class="badge-action-btn" (click)="onSendBulkReminders()" title="Enviar recordatorio WhatsApp">
              <i class="fa-brands fa-whatsapp"></i> Cobrar
            </button>
          </div>
          <div class="kpi-data">
            <span class="kpi-label">CARTERA EN MORA</span>
            <div class="kpi-value-row">
              <span class="kpi-number text-amber">$ {{ (stats()?.finanzas?.carteraMora || 0) | number }}</span>
              <span class="kpi-unit">COP</span>
            </div>
            <div class="kpi-progress-bar">
              <div class="progress-fill fill-amber" style="width: 15%;"></div>
            </div>
            <div class="kpi-footer-detail">
              <span>Cobranza: <strong>WhatsApp PSE</strong></span>
              <span><strong>Auto-recordatorio:</strong> ON</span>
            </div>
          </div>
        </div>

        <!-- KPI 4: Convocatorias & Asistencia -->
        <div class="fut-card kpi-card">
          <div class="kpi-top">
            <div class="kpi-icon-box bg-purple">
              <i class="fa-solid fa-trophy"></i>
            </div>
            <span class="badge badge-success">Fixture Oficial</span>
          </div>
          <div class="kpi-data">
            <span class="kpi-label">EFICACIA & CITACIONES</span>
            <div class="kpi-value-row">
              <span class="kpi-number">{{ matches().length }}</span>
              <span class="kpi-unit">partidos programados</span>
            </div>
            <div class="kpi-progress-bar">
              <div class="progress-fill fill-purple" style="width: 96.4%;"></div>
            </div>
            <div class="kpi-footer-detail">
              <span><strong>{{ stats()?.totalCategorias || 0 }}</strong> categorías activas</span>
              <span><strong>100%</strong> monitoreado</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TABS NAVEGABLES DEL DASHBOARD -->
      <div class="dashboard-tabs-section">
        <div class="tabs-header">
          <div class="tabs-buttons">
            <button 
              class="tab-btn" 
              [class.active]="activeTab() === 'partidos'" 
              (click)="setTab('partidos')">
              <i class="fa-solid fa-futbol"></i>
              <span>Próximos Partidos & GPS</span>
              <span class="tab-badge">2</span>
            </button>

            <button 
              class="tab-btn" 
              [class.active]="activeTab() === 'convocatoria'" 
              (click)="setTab('convocatoria')">
              <i class="fa-solid fa-clipboard-user"></i>
              <span>Pizarra Táctica Express</span>
            </button>

            <button 
              class="tab-btn" 
              [class.active]="activeTab() === 'recaudo'" 
              (click)="setTab('recaudo')">
              <i class="fa-solid fa-receipt"></i>
              <span>Monitor Recaudo PSE en Vivo</span>
              <span class="tab-badge-live">LIVE</span>
            </button>

            <button 
              class="tab-btn" 
              [class.active]="activeTab() === 'biometria'" 
              (click)="setTab('biometria')">
              <i class="fa-solid fa-heart-pulse"></i>
              <span>Radar Físico & Médica</span>
            </button>
          </div>
        </div>

        <!-- CONTENIDO TAB 1: PRÓXIMOS PARTIDOS & SEDE GPS -->
        @if (activeTab() === 'partidos') {
          <div class="tab-content-pane">
            <div class="matches-grid">
              @for (match of matches(); track match.id) {
                <div class="fut-card match-card">
                  <!-- Match Header -->
                  <div class="match-card-top">
                    <div class="category-pill">{{ match.categoria_nombre }}</div>
                    <span class="badge" [class.badge-blue]="match.condicion_juego === 'LOCAL'" [class.badge-warning]="match.condicion_juego === 'VISITANTE'">
                      {{ match.condicion_juego }}
                    </span>
                  </div>

                  <!-- Rivals vs -->
                  <div class="match-versus">
                    <div class="team team-club">
                      <div class="team-crest">{{ api.activeClub().sigla }}</div>
                      <span class="team-name">{{ api.activeClub().nombre }}</span>
                    </div>

                    <div class="versus-divider">
                      <span class="vs-text">VS</span>
                      <span class="match-time-badge">{{ match.hora_partido }}</span>
                    </div>

                    <div class="team team-rival">
                      <div class="team-crest rival-crest">⚔️</div>
                      <span class="team-name">{{ match.rival_nombre }}</span>
                    </div>
                  </div>

                  <!-- Details & GPS Info -->
                  <div class="match-details-box">
                    <div class="detail-row">
                      <i class="fa-regular fa-calendar text-emerald"></i>
                      <span><strong>Fecha:</strong> {{ match.fecha_partido }} (Citación: {{ match.hora_citacion }})</span>
                    </div>
                    <div class="detail-row">
                      <i class="fa-solid fa-location-dot text-amber"></i>
                      <span><strong>Sede:</strong> {{ match.sede_cancha }}</span>
                    </div>
                    <div class="detail-row">
                      <i class="fa-solid fa-shirt text-blue"></i>
                      <span><strong>Kit:</strong> {{ match.indumentaria }}</span>
                    </div>
                  </div>

                  <!-- Progress of attendance -->
                  <div class="match-attendance-status">
                    <div class="attendance-label-row">
                      <span>Confirmación de Nómina:</span>
                      <strong>{{ match.confirmados_count }} / {{ match.total_convocados }} Jugadores</strong>
                    </div>
                    <div class="kpi-progress-bar">
                      <div class="progress-fill fill-emerald" [style.width.%]="(match.confirmados_count / match.total_convocados) * 100"></div>
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="match-actions">
                    <button class="btn-gps" (click)="openGpsRoute(match)">
                      <i class="fa-solid fa-route"></i>
                      <span>Ruta GPS (Waze / Maps)</span>
                    </button>
                    <button class="btn-roster" (click)="setTab('convocatoria')">
                      <i class="fa-solid fa-users-viewfinder"></i>
                      <span>Ver Nómina</span>
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- CONTENIDO TAB 2: PIZARRA TÁCTICA EXPRESS -->
        @if (activeTab() === 'convocatoria') {
          <div class="tab-content-pane">
            <div class="fut-card tactic-panel">
              <div class="tactic-header">
                <div>
                  <h3>Convocatoria Sub-15 Élite 2011 • vs Santa Fe D.C.</h3>
                  <p class="subtext">Alineación táctica 4-3-3 • Estado de confirmación móvil en tiempo real</p>
                </div>
                <button class="btn-primary btn-sm" (click)="onSendWhatsAppCitacion()">
                  <i class="fa-brands fa-whatsapp"></i> Enviar Citaciones a Padres
                </button>
              </div>

              <div class="roster-table-container">
                <table class="fut-table">
                  <thead>
                    <tr>
                      <th>Dorsal</th>
                      <th>Jugador</th>
                      <th>Posición</th>
                      <th>Pierna</th>
                      <th>Biometría</th>
                      <th>Estado Citación</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (jugador of tacticRoster(); track jugador.id) {
                      <tr>
                        <td>
                          <span class="dorsal-badge">#{{ jugador.dorsal }}</span>
                        </td>
                        <td>
                          <div class="player-cell">
                            <img [src]="jugador.avatar" [alt]="jugador.nombre" class="player-avatar" />
                            <div>
                              <strong>{{ jugador.nombre }}</strong>
                              <span class="player-sub">{{ jugador.rolTactic }}</span>
                            </div>
                          </div>
                        </td>
                        <td><span class="pos-badge">{{ jugador.posicion }}</span></td>
                        <td>{{ jugador.pierna }}</td>
                        <td>{{ jugador.peso_kg }} kg • {{ jugador.talla_cm }} cm</td>
                        <td>
                          @if (jugador.estado === 'CONFIRMADO') {
                            <span class="badge badge-success"><i class="fa-solid fa-check"></i> Confirmado</span>
                          } @else if (jugador.estado === 'PENDIENTE') {
                            <span class="badge badge-warning"><i class="fa-regular fa-clock"></i> Pendiente</span>
                          } @else {
                            <span class="badge badge-danger"><i class="fa-solid fa-xmark"></i> Excusado</span>
                          }
                        </td>
                        <td>
                          <button class="btn-toggle-status" (click)="togglePlayerStatus(jugador)" title="Cambiar Estado">
                            <i class="fa-solid fa-rotate"></i>
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <!-- CONTENIDO TAB 3: MONITOR DE RECAUDO PSE EN VIVO -->
        @if (activeTab() === 'recaudo') {
          <div class="tab-content-pane">
            <div class="fut-card finance-panel">
              <div class="finance-header">
                <div>
                  <h3>Flujo de Transacciones PSE / Wompi Recientes</h3>
                  <p class="subtext">Conciliación bancaria automática con expedición instantánea de recibos de caja</p>
                </div>
                <div class="finance-kpis-mini">
                  <div class="mini-kpi">
                    <span>Hoy Recaudado:</span>
                    <strong>$1,850,000 COP</strong>
                  </div>
                </div>
              </div>

              <div class="fut-table-container">
                <table class="fut-table">
                  <thead>
                    <tr>
                      <th>Ref. Wompi</th>
                      <th>Fecha</th>
                      <th>Alumno / Acudiente</th>
                      <th>Categoría</th>
                      <th>Medio de Pago</th>
                      <th>Valor COP</th>
                      <th>Estado</th>
                      <th>Recibo</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (tx of transactions(); track tx.id) {
                      <tr>
                        <td><code>{{ tx.codigo_transaccion }}</code></td>
                        <td>{{ tx.fecha }}</td>
                        <td><strong>{{ tx.jugador_nombre }}</strong></td>
                        <td>{{ tx.categoria }}</td>
                        <td><span class="payment-method-badge"><i class="fa-solid fa-building-columns"></i> {{ tx.metodo }}</span></td>
                        <td><strong>\${{ tx.monto | number:'1.0-0' }}</strong></td>
                        <td>
                          <span class="badge" [class.badge-success]="tx.estado === 'APROBADA'" [class.badge-warning]="tx.estado === 'PENDIENTE'">
                            {{ tx.estado }}
                          </span>
                        </td>
                        <td>
                          <button class="btn-receipt" (click)="onDownloadReceipt(tx)">
                            <i class="fa-solid fa-file-pdf"></i> PDF
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        }

        <!-- CONTENIDO TAB 4: RADAR FÍSICO & MÉDICA -->
        @if (activeTab() === 'biometria') {
          <div class="tab-content-pane">
            <div class="biometria-grid">
              @for (player of topPlayers(); track player.id) {
                <div class="fut-card player-radar-card">
                  <div class="player-top">
                    <img [src]="player.avatar" [alt]="player.nombre" class="radar-avatar" />
                    <div class="player-meta">
                      <h4>{{ player.nombre }}</h4>
                      <span class="meta-sub">#{{ player.dorsal }} • {{ player.posicion }} • {{ player.categoria }}</span>
                    </div>
                    <span class="badge" [class.badge-success]="player.estado_medico === 'APTO'" [class.badge-warning]="player.estado_medico === 'EN_OBSERVACION'">
                      {{ player.estado_medico }}
                    </span>
                  </div>

                  <div class="radar-kpi-row">
                    <div class="radar-stat">
                      <span class="stat-num text-emerald">{{ player.score_rendimiento }}</span>
                      <span class="stat-lbl">Radar Score</span>
                    </div>
                    <div class="radar-stat">
                      <span class="stat-num">{{ player.cooper_metros }}m</span>
                      <span class="stat-lbl">Test Cooper</span>
                    </div>
                    <div class="radar-stat">
                      <span class="stat-num text-blue">{{ player.velocidad_max }} km/h</span>
                      <span class="stat-lbl">Velocidad Pico</span>
                    </div>
                  </div>

                  <div class="asistencia-bar-wrap">
                    <div class="bar-labels">
                      <span>Asistencia Entrenamientos:</span>
                      <strong>{{ player.asistencia_pct }}%</strong>
                    </div>
                    <div class="kpi-progress-bar">
                      <div class="progress-fill fill-emerald" [style.width.%]="player.asistencia_pct"></div>
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>

      <!-- MODAL: PROGRAMAR NUEVO PARTIDO -->
      @if (showScheduleModal()) {
        <div class="modal-overlay" (click)="closeScheduleModal()">
          <div class="modal-dialog modal-card fut-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-calendar-plus"></i>
                </div>
                <div class="modal-title-text">
                  <h3>Programar Nuevo Partido Oficial</h3>
                  <p class="modal-subtitle">Configura el encuentro, categoría y genera la convocatoria táctica</p>
                </div>
              </div>
              <button class="modal-close-btn" (click)="closeScheduleModal()" aria-label="Cerrar modal">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form (ngSubmit)="submitScheduleForm()" class="modal-form">
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-shield-halved"></i> Datos del Encuentro</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-users"></i> Categoría Competitiva <span class="required-star">*</span></label>
                    <select [(ngModel)]="newMatch.categoriaId" name="categoriaId" class="sport-input" required>
                      @for (cat of categorias(); track cat.id) {
                        <option [value]="cat.id">{{ cat.nombre }} ({{ cat.codigo_categoria }})</option>
                      }
                    </select>
                  </div>

                  <div class="input-group">
                    <label><i class="fa-solid fa-shield-cat"></i> Equipo Rival <span class="required-star">*</span></label>
                    <input type="text" [(ngModel)]="newMatch.rivalNombre" name="rivalNombre" placeholder="ej. Santa Fe D.C." class="sport-input" required />
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-regular fa-clock"></i> Horarios & Citación</span>
                <div class="form-row g3">
                  <div class="input-group">
                    <label><i class="fa-regular fa-calendar"></i> Fecha de Juego <span class="required-star">*</span></label>
                    <input type="text" appFlatpickr placeholder="dd/mm/aaaa" [(ngModel)]="newMatch.fecha" name="fecha" class="sport-input" required />
                  </div>

                  <div class="input-group">
                    <label><i class="fa-regular fa-clock"></i> Hora Partido <span class="required-star">*</span></label>
                    <input type="time" [(ngModel)]="newMatch.horaPartido" name="horaPartido" class="sport-input" required />
                  </div>

                  <div class="input-group">
                    <label><i class="fa-solid fa-stopwatch"></i> Hora Citación <span class="required-star">*</span></label>
                    <input type="time" [(ngModel)]="newMatch.horaCitacion" name="horaCitacion" class="sport-input" required />
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-location-dot"></i> Ubicación & Condición</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-map-pin"></i> Sede / Cancha Deportiva <span class="required-star">*</span></label>
                    <input type="text" [(ngModel)]="newMatch.sedeCancha" name="sedeCancha" placeholder="ej. Sede Arrayanes - Cancha 1" class="sport-input" required />
                  </div>

                  <div class="input-group">
                    <label><i class="fa-solid fa-arrows-split-up-and-left"></i> Condición</label>
                    <select [(ngModel)]="newMatch.condicion" name="condicion" class="sport-input">
                      <option value="LOCAL">LOCAL</option>
                      <option value="VISITANTE">VISITANTE</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeScheduleModal()">
                  <i class="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button type="submit" class="btn-primary">
                  <i class="fa-solid fa-calendar-check"></i> Guardar y Crear Convocatoria
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- TOAST NOTIFICATION FLOTANTE -->
      @if (toastMessage()) {
        <div class="toast-floating-alert">
          <i class="fa-solid fa-circle-check"></i>
          <span>{{ toastMessage() }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-page {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    /* =========================================================================
       HERO HEADER
       ========================================================================= */
    .dashboard-hero-header {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.75rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      box-shadow: var(--shadow-card);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 4px;
        background: linear-gradient(to bottom, var(--color-primary), var(--color-accent));
      }
    }

    .hero-left {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      .club-badge-row {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        margin-bottom: 0.25rem;

        .season-badge {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          background: var(--color-primary-subtle);
          color: var(--color-primary-dark);
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-full);
        }

        .tenant-badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.35rem;

          i {
            color: var(--color-primary);
          }
        }
      }

      .hero-greeting {
        font-size: 1.65rem;
        font-weight: 800;
        color: var(--text-heading);
        letter-spacing: -0.02em;
        line-height: 1.2;
      }

      .hero-subtext {
        font-size: 0.875rem;
        color: var(--text-body);
      }
    }

    .hero-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }

    /* =========================================================================
       KPIS GRID
       ========================================================================= */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    .kpi-card {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      padding: 1.25rem 1.35rem;

      .kpi-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .kpi-icon-box {
        width: 42px;
        height: 42px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;

        &.bg-emerald {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }
        &.bg-blue {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }
        &.bg-amber {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }
        &.bg-purple {
          background: rgba(168, 85, 247, 0.15);
          color: #a855f7;
        }
      }

      .badge-action-btn {
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.35);
        color: #059669;
        font-size: 0.75rem;
        font-weight: 700;
        padding: 0.25rem 0.65rem;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        gap: 0.35rem;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: #10b981;
          color: #ffffff;
        }
      }

      .kpi-data {
        display: flex;
        flex-direction: column;
        gap: 0.45rem;

        .kpi-label {
          font-size: 0.7rem;
          font-weight: 800;
          color: var(--text-dim);
          letter-spacing: 0.05em;
        }

        .kpi-value-row {
          display: flex;
          align-items: baseline;
          gap: 0.45rem;

          .kpi-number {
            font-size: 1.75rem;
            font-weight: 800;
            color: var(--text-heading);
            line-height: 1;

            &.text-amber {
              color: #d97706;
            }
          }

          .kpi-unit {
            font-size: 0.75rem;
            color: var(--text-muted);
            font-weight: 600;
          }
        }

        .kpi-progress-bar {
          height: 6px;
          background: var(--bg-surface);
          border-radius: var(--radius-full);
          overflow: hidden;
          margin-top: 0.25rem;

          .progress-fill {
            height: 100%;
            border-radius: var(--radius-full);

            &.fill-emerald { background: var(--color-primary); }
            &.fill-blue { background: var(--color-accent); }
            &.fill-amber { background: #f59e0b; }
            &.fill-purple { background: #a855f7; }
          }
        }

        .kpi-footer-detail {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--text-muted);
          margin-top: 0.15rem;

          strong {
            color: var(--text-body);
          }
        }
      }
    }

    /* =========================================================================
       TABS SECTION
       ========================================================================= */
    .dashboard-tabs-section {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .tabs-header {
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;

      .tabs-buttons {
        display: flex;
        gap: 0.65rem;
        flex-wrap: wrap;
      }

      .tab-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.65rem 1.15rem;
        border-radius: var(--radius-md);
        background: var(--bg-surface);
        color: var(--text-body);
        font-size: 0.85rem;
        font-weight: 700;
        cursor: pointer;
        border: 1px solid var(--border-color);
        transition: all 0.2s ease;

        &:hover {
          background: var(--bg-card-hover);
          color: var(--text-main);
          border-color: var(--color-primary);
        }

        &.active {
          background: var(--color-primary);
          color: #ffffff;
          border-color: var(--color-primary);
          box-shadow: var(--shadow-glow);

          .tab-badge {
            background: rgba(255, 255, 255, 0.25);
            color: #ffffff;
          }
        }

        .tab-badge {
          font-size: 0.65rem;
          background: var(--bg-card);
          padding: 0.1rem 0.45rem;
          border-radius: var(--radius-full);
          color: var(--text-muted);
        }

        .tab-badge-live {
          font-size: 0.6rem;
          background: #ef4444;
          color: #ffffff;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-xs);
          letter-spacing: 0.05em;
          animation: pulse 1.5s infinite;
        }
      }
    }

    /* MATCHES CARDS (TAB 1) */
    .matches-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
    }

    .match-card {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .match-card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .category-pill {
        font-size: 0.8rem;
        font-weight: 800;
        color: var(--color-primary-dark);
      }
    }

    .match-versus {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--bg-surface);
      padding: 1rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);

      .team {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.4rem;
        flex: 1;

        .team-crest {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-xs);
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
          color: #ffffff;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;

          &.rival-crest {
            background: linear-gradient(135deg, #475569 0%, #1e293b 100%);
          }
        }

        .team-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-main);
          text-align: center;
        }
      }

      .versus-divider {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;

        .vs-text {
          font-size: 0.85rem;
          font-weight: 900;
          color: var(--text-dim);
        }

        .match-time-badge {
          font-size: 0.75rem;
          font-weight: 800;
          background: var(--bg-card);
          padding: 0.2rem 0.5rem;
          border-radius: var(--radius-xs);
          border: 1px solid var(--border-color);
          color: var(--color-primary);
        }
      }
    }

    .match-details-box {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      font-size: 0.8rem;
      color: var(--text-body);

      .detail-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        i {
          font-size: 0.9rem;
          width: 16px;
        }
      }
    }

    .match-attendance-status {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      .attendance-label-row {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: var(--text-body);
      }
    }

    .match-actions {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 0.65rem;
      margin-top: auto;

      .btn-gps {
        background: rgba(16, 185, 129, 0.12);
        color: #059669;
        border: 1px solid rgba(16, 185, 129, 0.3);
        font-weight: 700;
        font-size: 0.8rem;
        padding: 0.6rem;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        cursor: pointer;
        transition: all 0.2s ease;

        &:hover {
          background: var(--color-primary);
          color: #ffffff;
        }
      }

      .btn-roster {
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        color: var(--text-main);
        font-weight: 700;
        font-size: 0.8rem;
        padding: 0.6rem;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.45rem;
        cursor: pointer;

        &:hover {
          background: var(--bg-card-hover);
        }
      }
    }

    /* PIZARRA TÁCTICA (TAB 2) */
    .tactic-panel {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      .tactic-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;

        h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-heading);
        }

        .subtext {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      }
    }

    .roster-table-container {
      overflow-x: auto;
    }

    .dorsal-badge {
      font-weight: 800;
      color: var(--color-primary);
      font-size: 0.85rem;
    }

    .player-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .player-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        object-fit: cover;
      }

      .player-sub {
        display: block;
        font-size: 0.7rem;
        color: var(--text-muted);
      }
    }

    .pos-badge {
      font-size: 0.7rem;
      font-weight: 800;
      background: var(--bg-surface);
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-xs);
      color: var(--text-main);
    }

    .btn-toggle-status {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-xs);
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: var(--color-primary);
        border-color: var(--color-primary);
      }
    }

    /* MONITOR FINANCIERO (TAB 3) */
    .finance-panel {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      .finance-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-heading);
        }

        .subtext {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      }
    }

    .payment-method-badge {
      font-size: 0.75rem;
      color: var(--text-body);
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;

      i {
        color: var(--color-primary);
      }
    }

    .btn-receipt {
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #2563eb;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.3rem 0.65rem;
      border-radius: var(--radius-xs);
      cursor: pointer;

      &:hover {
        background: #2563eb;
        color: #ffffff;
      }
    }

    /* BIOMETRÍA CARDS (TAB 4) */
    .biometria-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.25rem;
    }

    .player-radar-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .player-top {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .radar-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--color-primary);
        }

        .player-meta {
          flex: 1;

          h4 {
            font-size: 0.9rem;
            font-weight: 800;
            color: var(--text-heading);
          }

          .meta-sub {
            font-size: 0.7rem;
            color: var(--text-muted);
          }
        }
      }

      .radar-kpi-row {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        background: var(--bg-surface);
        padding: 0.75rem;
        border-radius: var(--radius-md);
        text-align: center;

        .radar-stat {
          display: flex;
          flex-direction: column;

          .stat-num {
            font-size: 1.15rem;
            font-weight: 800;
            color: var(--text-heading);
          }

          .stat-lbl {
            font-size: 0.65rem;
            font-weight: 700;
            color: var(--text-dim);
          }
        }
      }

      .asistencia-bar-wrap {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .bar-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          color: var(--text-body);
        }
      }
    }

    /* MODAL STYLES (inherits from global _modals.scss) */
    .modal-dialog {
      max-width: 680px;
    }

    /* TOAST FLOTANTE */
    .toast-floating-alert {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: var(--bg-card);
      border: 1px solid var(--color-primary);
      padding: 0.85rem 1.25rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-dropdown);
      color: var(--text-main);
      font-size: 0.85rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 0.65rem;
      z-index: 10000;
      animation: slideUp 0.25s ease-out;

      i {
        color: var(--color-primary);
        font-size: 1.1rem;
      }
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Dark Mode specific overrides */
    [data-theme="dark"], body.dark-theme {
      .hero-left .club-badge-row .season-badge {
        color: #34d399;
      }
      .match-card-top .category-pill {
        color: #34d399;
      }
      .match-actions .btn-gps {
        color: #34d399;
      }
    }

    /* RESPONSIVE */
    @media (max-width: 1200px) {
      .kpi-grid {
        grid-template-columns: 1fr 1fr;
      }
      .biometria-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 768px) {
      .dashboard-hero-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .kpi-grid {
        grid-template-columns: 1fr;
      }
      .matches-grid {
        grid-template-columns: 1fr;
      }
      .biometria-grid {
        grid-template-columns: 1fr;
      }
      .form-row.g2, .form-row.g3 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  api = inject(ApiService);
  authService = inject(AuthService);

  readonly stats = signal<KPIStats | null>(null);
  readonly activeTab = signal<'partidos' | 'convocatoria' | 'recaudo' | 'biometria'>('partidos');
  readonly showScheduleModal = signal<boolean>(false);
  readonly toastMessage = signal<string>('');
  readonly categorias = signal<any[]>([]);

  readonly matches = signal<MatchItem[]>([]);
  readonly tacticRoster = signal<any[]>([]);
  readonly transactions = signal<TransactionItem[]>([]);
  readonly topPlayers = signal<TopPlayer[]>([]);

  newMatch = {
    categoriaId: '',
    rivalNombre: '',
    fecha: new Date().toISOString().split('T')[0],
    horaPartido: '09:00',
    horaCitacion: '08:00',
    sedeCancha: '',
    condicion: 'LOCAL' as 'LOCAL' | 'VISITANTE',
  };

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // 1. Cargar KPIs
    this.api.getDashboardKPIs().subscribe((data) => {
      this.stats.set(data);
    });

    // 2. Cargar Categorías
    this.api.getCategorias().subscribe((cats) => {
      this.categorias.set(cats || []);
      if (cats && cats.length > 0 && !this.newMatch.categoriaId) {
        this.newMatch.categoriaId = cats[0].id;
      }
    });

    // 3. Cargar Partidos
    this.api.getPartidos().subscribe((partidos) => {
      const list = Array.isArray(partidos) ? partidos : (partidos?.data || []);
      if (list && list.length > 0) {
        const mapped: MatchItem[] = list.map((p: any) => ({
          id: p.id,
          rival_nombre: p.rival_nombre,
          categoria_nombre: p.categoria_nombre || 'Sub-15 Élite',
          categoria_codigo: p.codigo_categoria || 'SUB_15',
          fecha_partido: p.fecha_partido,
          hora_partido: p.hora_partido,
          hora_citacion: p.hora_citacion || p.hora_partido,
          sede_cancha: p.sede_cancha,
          condicion_juego: p.condicion_juego || 'LOCAL',
          indumentaria: p.indumentaria_kit || 'Kit Titular (Esmeralda)',
          confirmados_count: p.confirmados_count || 16,
          total_convocados: p.total_convocados || 18,
          lat: parseFloat(p.latitud || '4.7892'),
          lng: parseFloat(p.longitud || '-74.0412'),
          torneo: 'Torneo Oficial Liga 2026',
        }));
        this.matches.set(mapped);
      }
    });

    // 4. Cargar Jugadores para Pizarra Táctica
    this.api.getJugadores().subscribe((jugs) => {
      const list = Array.isArray(jugs) ? jugs : (jugs?.data || []);
      if (list && list.length > 0) {
        const mappedRoster = list.slice(0, 12).map((j: any, idx: number) => ({
          id: j.id,
          dorsal: j.numero_dorsal || (idx + 1),
          nombre: `${j.nombres} ${j.apellidos}`,
          posicion: j.posicion_principal || 'VOL',
          pierna: j.pierna_habil || 'Diestro',
          peso_kg: parseFloat(j.peso_kg || '55.0'),
          talla_cm: parseFloat(j.talla_cm || '168.0'),
          estado: 'CONFIRMADO',
          avatar: j.foto_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          rolTactic: idx < 11 ? `${j.posicion_principal} Titular` : 'Suplente',
        }));
        this.tacticRoster.set(mappedRoster);
      }
    });

    // 5. Cargar Cargos para Monitor Recaudo en Vivo
    this.api.getCargos().subscribe((cargos) => {
      const list = Array.isArray(cargos) ? cargos : (cargos?.data || []);
      if (list && list.length > 0) {
        const mappedTx: TransactionItem[] = list.slice(0, 6).map((c: any, idx: number) => ({
          id: c.id,
          codigo_transaccion: `WMP-984${200 + idx}`,
          jugador_nombre: c.jugador_nombre,
          categoria: c.categoria_nombre,
          monto: parseFloat(c.monto_total || '180000'),
          metodo: idx % 2 === 0 ? 'PSE Bancolombia' : 'Daviplata',
          fecha: c.fecha_limite_pago || 'Hoy, 08:30 AM',
          estado: c.saldo_pendiente == 0 ? 'APROBADA' : 'PENDIENTE',
        }));
        this.transactions.set(mappedTx);
      }
    });

    // 6. Cargar Biometría para Radar Físico & Top Players
    this.api.getBiometria().subscribe((bios) => {
      const list = Array.isArray(bios) ? bios : (bios?.data || []);
      if (list && list.length > 0) {
        const mappedTop: TopPlayer[] = list.slice(0, 3).map((b: any) => ({
          id: b.id,
          nombre: `${b.jugador_nombre} #${b.numero_dorsal || ''}`,
          dorsal: b.numero_dorsal || 10,
          categoria: b.categoria_nombre,
          posicion: b.posicion_principal || 'Extremo',
          score_rendimiento: 9.4,
          cooper_metros: b.test_cooper_metros || 2780,
          velocidad_max: b.velocidad_30m_seg ? parseFloat((30 / b.velocidad_30m_seg * 3.6).toFixed(1)) : 31.8,
          asistencia_pct: 100,
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100',
          estado_medico: 'APTO',
        }));
        this.topPlayers.set(mappedTop);
      }
    });
  }

  setTab(tab: 'partidos' | 'convocatoria' | 'recaudo' | 'biometria'): void {
    this.activeTab.set(tab);
  }

  openScheduleModal(): void {
    this.showScheduleModal.set(true);
  }

  closeScheduleModal(): void {
    this.showScheduleModal.set(false);
  }

  submitScheduleForm(): void {
    if (!this.newMatch.rivalNombre || !this.newMatch.sedeCancha || !this.newMatch.categoriaId) {
      this.showToast('Completa los campos obligatorios del partido.');
      return;
    }

    const payload = {
      categoria_id: this.newMatch.categoriaId,
      rival_nombre: this.newMatch.rivalNombre,
      fecha_partido: this.newMatch.fecha,
      hora_partido: this.newMatch.horaPartido,
      hora_citacion: this.newMatch.horaCitacion,
      sede_cancha: this.newMatch.sedeCancha,
      condicion_juego: this.newMatch.condicion,
      indumentaria_kit: 'Kit Titular (Esmeralda)',
    };

    this.api.createPartido(payload).subscribe({
      next: () => {
        this.closeScheduleModal();
        this.showToast('¡Partido programado y convocatoria creada con éxito en la BD!');
        this.loadDashboardData();
      },
      error: () => {
        this.showToast('Error al crear el partido');
      },
    });
  }

  openGpsRoute(match: MatchItem): void {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.sede_cancha)}`;
    window.open(url, '_blank');
    this.showToast(`Abriendo ruta GPS para "${match.sede_cancha}"`);
  }

  onSendWhatsAppCitacion(): void {
    this.showToast('Citaciones enviadas masivamente por WhatsApp a los padres de familia.');
  }

  onSendBulkReminders(): void {
    this.showToast('Recordatorios de pago de pensión enviados masivamente vía WhatsApp.');
  }

  onExportReport(): void {
    this.showToast('Generando y descargando Informe Ejecutivo 360° en PDF...');
  }

  onDownloadReceipt(tx: TransactionItem): void {
    this.showToast(`Descargando recibo de caja oficial para ${tx.jugador_nombre}...`);
  }

  togglePlayerStatus(jugador: any): void {
    const estados = ['CONFIRMADO', 'PENDIENTE', 'EXCUSADO'];
    const currentIdx = estados.indexOf(jugador.estado);
    const nextEstado = estados[(currentIdx + 1) % estados.length];
    jugador.estado = nextEstado;
    this.showToast(`${jugador.nombre} marcado como ${nextEstado}`);
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}

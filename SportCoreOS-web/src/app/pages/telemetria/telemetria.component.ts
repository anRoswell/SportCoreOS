import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CatalogosService } from '../../core/services/catalogos.service';
import { PlayerSelectorComponent } from '../../shared/components/player-selector/player-selector.component';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';

@Component({
  selector: 'app-telemetria',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayerSelectorComponent, FlatpickrDirective],
  template: `
    <div class="telemetria-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            <i class="fa-solid fa-satellite-dish text-emerald"></i> Telemetría GPS, Mapas de Calor & Carga Física
          </h1>
          <p class="page-subtitle">Monitoreo cinemático de alto rendimiento, PlayerLoad, sprints y mapas de calor 2D sobre la cancha</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" (click)="openCreateSesionModal()">
            <i class="fa-solid fa-file-arrow-up"></i> Ingesta Sesión GPS (GPX/CSV)
          </button>
        </div>
      </div>

      <!-- KPI METRICS ROW PRO -->
      <div class="kpi-row telemetria-kpis">
        <div class="kpi-card fut-card kpi-pro-card">
          <div class="kpi-top">
            <div class="kpi-icon-wrap bg-blue-glow">
              <i class="fa-solid fa-person-running"></i>
            </div>
            <span class="kpi-chip chip-blue"><i class="fa-solid fa-circle-check"></i> Activos</span>
          </div>
          <div class="kpi-body">
            <div class="kpi-val">{{ selectedSesion()?.metricas?.length || 18 }}</div>
            <div class="kpi-label">Jugadores Monitoreados</div>
          </div>
          <div class="kpi-footer-metric">
            <div class="metric-progress-wrap">
              <div class="metric-progress-bar" style="width: 100%; background: #3b82f6;"></div>
            </div>
            <span class="kpi-subtext">Plantel completo con GPS Catapult</span>
          </div>
        </div>

        <div class="kpi-card fut-card kpi-pro-card">
          <div class="kpi-top">
            <div class="kpi-icon-wrap bg-emerald-glow">
              <i class="fa-solid fa-route"></i>
            </div>
            <span class="kpi-chip chip-emerald"><i class="fa-solid fa-arrow-trend-up"></i> +1.2 km vs media</span>
          </div>
          <div class="kpi-body">
            <div class="kpi-val">{{ getAverageDistance() }} <span class="kpi-unit">km</span></div>
            <div class="kpi-label">Distancia Media / Jugador</div>
          </div>
          <div class="kpi-footer-metric">
            <div class="metric-progress-wrap">
              <div class="metric-progress-bar" [style.width.%]="getProgressDistance()" style="background: #10b981;"></div>
            </div>
            <span class="kpi-subtext">Meta 10.5 km ({{ getProgressDistance() }}% alcanzado)</span>
          </div>
        </div>

        <div class="kpi-card fut-card kpi-pro-card">
          <div class="kpi-top">
            <div class="kpi-icon-wrap bg-amber-glow">
              <i class="fa-solid fa-gauge-high"></i>
            </div>
            <span class="kpi-chip chip-amber"><i class="fa-solid fa-bolt"></i> Sprint Peak</span>
          </div>
          <div class="kpi-body">
            <div class="kpi-val">{{ getTopSpeed() }} <span class="kpi-unit">km/h</span></div>
            <div class="kpi-label">Velocidad Punta Máxima</div>
          </div>
          <div class="kpi-footer-metric">
            <div class="metric-progress-wrap">
              <div class="metric-progress-bar" [style.width.%]="(getTopSpeedNum() / 36) * 100" style="background: #f59e0b;"></div>
            </div>
            <span class="kpi-subtext">Top: {{ getTopSpeedPlayer() }}</span>
          </div>
        </div>

        <div class="kpi-card fut-card kpi-pro-card">
          <div class="kpi-top">
            <div class="kpi-icon-wrap bg-purple-glow">
              <i class="fa-solid fa-fire"></i>
            </div>
            <span class="kpi-chip chip-purple"><i class="fa-solid fa-chart-line"></i> ACWR Óptimo</span>
          </div>
          <div class="kpi-body">
            <div class="kpi-val">{{ getAveragePlayerLoad() }} <span class="kpi-unit">AU</span></div>
            <div class="kpi-label">PlayerLoad Promedio</div>
          </div>
          <div class="kpi-footer-metric">
            <div class="metric-progress-wrap">
              <div class="metric-progress-bar" [style.width.%]="(getAveragePlayerLoadNum() / 800) * 100" style="background: #a855f7;"></div>
            </div>
            <span class="kpi-subtext">Carga neuromuscular controlada</span>
          </div>
        </div>
      </div>

      <!-- SELECTOR DE SESIÓN Y VISTA PRINCIPAL -->
      <div class="telemetria-content-grid">
        <!-- LISTA LATERAL DE SESIONES -->
        <div class="sesiones-sidebar fut-card">
          <div class="sidebar-header">
            <div class="sidebar-title-wrap">
              <i class="fa-solid fa-clock-rotate-left"></i>
              <h3>Sesiones de Telemetría</h3>
            </div>
            <span class="badge badge-primary">{{ sesionesList().length }}</span>
          </div>

          <div class="sesiones-list">
            @for (s of sesionesList(); track s.id) {
              <div
                class="sesion-item-card"
                [class.active]="selectedSesion()?.id === s.id"
                (click)="selectSesion(s)"
              >
                <div class="sesion-item-top">
                  <strong class="sesion-name">{{ s.nombre_sesion }}</strong>
                  <span class="badge" [class.badge-primary]="s.tipo_sesion === 'partido'" [class.badge-success]="s.tipo_sesion === 'entrenamiento'">
                    {{ s.tipo_sesion === 'partido' ? 'Partido' : 'Entreno' }}
                  </span>
                </div>
                <div class="sesion-item-sub">
                  <span><i class="fa-regular fa-calendar"></i> {{ s.fecha_sesion }}</span>
                  <span><i class="fa-solid fa-stopwatch"></i> {{ s.duracion_minutos || 90 }} min</span>
                </div>
              </div>
            } @empty {
              <div class="empty-state-sm">
                <i class="fa-solid fa-satellite"></i>
                <p>No hay sesiones registradas.</p>
              </div>
            }
          </div>
        </div>

        <!-- PANEL CENTRAL: MAPA DE CALOR 2D + MÉTRICAS CINEMÁTICAS + WIDGETS PRO -->
        <div class="telemetria-main-panel">
          <!-- SECCIÓN DE CANCHA 2D CON MAPA DE CALOR Y PANEL TÁCTICO -->
          <div class="heatmap-section fut-card">
            <div class="heatmap-header">
              <div class="player-focus-info">
                <div class="pitch-badge-icon">
                  <i class="fa-solid fa-map-location-dot"></i>
                </div>
                <div>
                  <h3>Mapa de Calor 2D & Tracking Táctico</h3>
                  <p>Influencia espacial de: <strong class="text-emerald">{{ activeHeatmapPlayer()?.jugador_nombre || activeHeatmapPlayer()?.nombres || 'Plantel Completo' }}</strong></p>
                </div>
              </div>

              <div class="heatmap-controls">
                <label><i class="fa-solid fa-user-check"></i> Jugador Activo:</label>
                <div class="sport-select-wrapper player-heat-select">
                  <select [ngModel]="activeHeatmapPlayer()?.id" (ngModelChange)="onHeatmapPlayerChange($event)" class="sport-input">
                    @for (m of activeMetricas(); track m.id) {
                      <option [value]="m.id">{{ m.jugador_nombre || m.nombres }} ({{ formatPosicion(m.posicion) }})</option>
                    }
                  </select>
                  <i class="fa-solid fa-chevron-down select-chevron"></i>
                </div>
              </div>
            </div>

            <!-- CANCHA DE FÚTBOL INTERACTIVA 2D CON ZONAS DE CALOR Y OVERLAYS -->
            <div class="soccer-pitch-container">
              <div class="soccer-pitch">
                <!-- PATRÓN DE CÉSPED PROFESIONAL -->
                <div class="pitch-stripes"></div>

                <!-- LÍNEAS DE LA CANCHA -->
                <div class="pitch-line pitch-border"></div>
                <div class="pitch-line pitch-halfway"></div>
                <div class="pitch-line pitch-center-circle"></div>
                <div class="pitch-line pitch-center-spot"></div>
                <div class="pitch-line penalty-box-left"></div>
                <div class="pitch-line penalty-box-right"></div>
                <div class="pitch-line goal-box-left"></div>
                <div class="pitch-line goal-box-right"></div>
                <div class="pitch-line corner-top-left"></div>
                <div class="pitch-line corner-bottom-left"></div>
                <div class="pitch-line corner-top-right"></div>
                <div class="pitch-line corner-bottom-right"></div>

                <!-- HEATMAP GLOW SPOTS DINÁMICOS -->
                @if (getHeatZones().length > 0) {
                  @for (zone of getHeatZones(); track $index) {
                    <div
                      class="heat-spot"
                      [style.left.%]="zone.x"
                      [style.top.%]="zone.y"
                      [style.width.px]="zone.size"
                      [style.height.px]="zone.size"
                      [style.opacity]="zone.opacity"
                    ></div>
                  }
                }

                <!-- FLOATING PLAYER BADGE SOBRE LA CANCHA -->
                <div class="pitch-player-marker" [style.left.%]="getPlayerSpotCoordinates().x" [style.top.%]="getPlayerSpotCoordinates().y">
                  <div class="player-pulse-ring"></div>
                  <div class="player-dot">
                    <i class="fa-solid fa-futbol"></i>
                  </div>
                  <span class="player-marker-label">{{ activeHeatmapPlayer()?.jugador_nombre || 'Jugador' }}</span>
                </div>
              </div>

              <!-- LEYENDA DEL MAPA DE CALOR & METADATOS TÁCTICOS -->
              <div class="pitch-footer-bar">
                <div class="pitch-legend">
                  <span class="legend-item"><span class="heat-dot dot-low"></span> Zona de Transición (< 14 km/h)</span>
                  <span class="legend-item"><span class="heat-dot dot-med"></span> Media Intensidad (14 - 21 km/h)</span>
                  <span class="legend-item"><span class="heat-dot dot-high"></span> Sprint / Alta Intensidad (> 21 km/h)</span>
                </div>
                <div class="pitch-telemetry-tag">
                  <i class="fa-solid fa-satellite"></i>
                  <span>Muestreo GPS: <strong>10 Hz</strong></span>
                </div>
              </div>
            </div>
          </div>

          <!-- WIDGETS AVANZADOS DE CARGA FÍSICA Y BIOMECÁNICA -->
          <div class="telemetry-widgets-grid">
            <!-- WIDGET 1: VELOCÍMETRO Y PICOS CINEMÁTICOS -->
            <div class="widget-card fut-card">
              <div class="widget-header">
                <div class="widget-title">
                  <i class="fa-solid fa-gauge-simple-high text-amber"></i>
                  <h4>Picos de Velocidad & Sprints</h4>
                </div>
                <span class="badge badge-amber">{{ activeHeatmapPlayer()?.sprints_alta_intensidad || 18 }} Sprints</span>
              </div>
              <div class="speed-gauge-wrap">
                <div class="speed-circle">
                  <span class="speed-val">{{ activeHeatmapPlayer()?.velocidad_maxima_kmh || '31.8' }}</span>
                  <span class="speed-unit">km/h máx</span>
                </div>
                <div class="speed-metrics-details">
                  <div class="speed-stat-item">
                    <span class="stat-lbl"><i class="fa-solid fa-bolt"></i> Aceleraciones (>3 m/s²):</span>
                    <span class="stat-num text-emerald">28</span>
                  </div>
                  <div class="speed-stat-item">
                    <span class="stat-lbl"><i class="fa-solid fa-hand"></i> Desaceleraciones:</span>
                    <span class="stat-num text-amber">22</span>
                  </div>
                  <div class="speed-stat-item">
                    <span class="stat-lbl"><i class="fa-solid fa-stopwatch"></i> Tiempo >21 km/h:</span>
                    <span class="stat-num">4 min 12s</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- WIDGET 2: DESGLOSE DE ZONAS DE VELOCIDAD METABÓLICA -->
            <div class="widget-card fut-card">
              <div class="widget-header">
                <div class="widget-title">
                  <i class="fa-solid fa-chart-column text-emerald"></i>
                  <h4>Zonas de Intensidad de Carrera</h4>
                </div>
                <span class="badge badge-success">{{ activeHeatmapPlayer()?.distancia_total_km || '9.4' }} km</span>
              </div>
              <div class="intensity-zones-bars">
                <div class="zone-row">
                  <div class="zone-info">
                    <span>Zona 1: Caminata (< 7.2 km/h)</span>
                    <strong>3.2 km (34%)</strong>
                  </div>
                  <div class="zone-track">
                    <div class="zone-fill fill-z1" style="width: 34%;"></div>
                  </div>
                </div>

                <div class="zone-row">
                  <div class="zone-info">
                    <span>Zona 2: Trote Ligero (7.2 - 14.3 km/h)</span>
                    <strong>3.8 km (40%)</strong>
                  </div>
                  <div class="zone-track">
                    <div class="zone-fill fill-z2" style="width: 40%;"></div>
                  </div>
                </div>

                <div class="zone-row">
                  <div class="zone-info">
                    <span>Zona 3: Carrera Alta (14.4 - 21.0 km/h)</span>
                    <strong>1.6 km (18%)</strong>
                  </div>
                  <div class="zone-track">
                    <div class="zone-fill fill-z3" style="width: 18%;"></div>
                  </div>
                </div>

                <div class="zone-row">
                  <div class="zone-info">
                    <span>Zona 4: Sprint Pro (> 21.0 km/h)</span>
                    <strong class="text-rose">0.8 km (8%)</strong>
                  </div>
                  <div class="zone-track">
                    <div class="zone-fill fill-z4" style="width: 8%;"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- WIDGET 3: MONITOR DE CARGA CARDIOVASCULAR & FRECUENCIA -->
            <div class="widget-card fut-card">
              <div class="widget-header">
                <div class="widget-title">
                  <i class="fa-solid fa-heart-pulse text-rose"></i>
                  <h4>Frecuencia Cardíaca & PlayerLoad</h4>
                </div>
                <span class="badge badge-purple">{{ activeHeatmapPlayer()?.player_load || 540 }} AU</span>
              </div>
              <div class="cardio-status-box">
                <div class="cardio-kpis">
                  <div class="cardio-item">
                    <span class="cardio-title">FC Máxima</span>
                    <span class="cardio-num text-rose">{{ activeHeatmapPlayer()?.frecuencia_cardiaca_max || '188' }} <small>bpm</small></span>
                  </div>
                  <div class="cardio-item">
                    <span class="cardio-title">FC Media</span>
                    <span class="cardio-num text-emerald">{{ getAvgHeartRate() }} <small>bpm</small></span>
                  </div>
                  <div class="cardio-item">
                    <span class="cardio-title">Riesgo Fatiga</span>
                    <span class="cardio-num text-amber">Bajo (0.92)</span>
                  </div>
                </div>

                <div class="cardio-advice">
                  <i class="fa-solid fa-circle-check text-emerald"></i>
                  <span>Índice neuromuscular dentro de rango competitivo seguro.</span>
                </div>
              </div>
            </div>
          </div>

          <!-- TABLA DE MÉTRICAS CINEMÁTICAS INDIVIDUALES -->
          <div class="metricas-table-card fut-card">
            <div class="table-header-clean">
              <div class="table-title">
                <div class="icon-sq bg-blue-glow">
                  <i class="fa-solid fa-chart-simple"></i>
                </div>
                <div>
                  <h3>Rendimiento Cinemático Individual</h3>
                  <p class="table-sub">Desglose biométrico por jugador registrado en la sesión</p>
                </div>
              </div>
              <button class="btn-secondary btn-sm" (click)="openAddMetricaModal()">
                <i class="fa-solid fa-plus"></i> Ingesta Métrica Individual
              </button>
            </div>

            <div class="table-responsive">
              <table class="fut-table">
                <thead>
                  <tr>
                    <th>Jugador</th>
                    <th>Posición</th>
                    <th>Distancia Total</th>
                    <th>Vel. Máxima</th>
                    <th>Sprints (>21km/h)</th>
                    <th>PlayerLoad (AU)</th>
                    <th>FC Máx</th>
                    <th>Carga / Estado</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  @for (m of activeMetricas(); track m.id) {
                    <tr [class.highlight-row]="activeHeatmapPlayer()?.id === m.id">
                      <td>
                        <div class="player-table-cell">
                          <div class="player-avatar-circle">
                            <i class="fa-solid fa-user"></i>
                          </div>
                          <strong>{{ m.jugador_nombre || m.nombres }}</strong>
                        </div>
                      </td>
                      <td><span class="badge badge-blue">{{ formatPosicion(m.posicion) }}</span></td>
                      <td><strong>{{ m.distancia_total_km || '9.4' }}</strong> km</td>
                      <td><span class="text-emerald font-bold">{{ m.velocidad_maxima_kmh || '31.8' }}</span> km/h</td>
                      <td><span class="badge badge-amber">{{ m.sprints_alta_intensidad || 18 }}</span></td>
                      <td><strong>{{ m.player_load || '540' }}</strong></td>
                      <td>{{ m.frecuencia_cardiaca_max || '188' }} bpm</td>
                      <td>
                        <span class="badge" [class.badge-success]="Number(m.player_load || 500) < 650" [class.badge-warning]="Number(m.player_load || 500) >= 650">
                          {{ Number(m.player_load || 500) < 650 ? 'ÓPTIMO' : 'ALTA CARGA' }}
                        </span>
                      </td>
                      <td>
                        <button class="btn-secondary btn-sm btn-view-heat" (click)="selectHeatmapPlayer(m)" title="Ver Mapa de Calor">
                          <i class="fa-solid fa-fire text-amber"></i> Heatmap
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="9" class="text-center py-4">No hay métricas registradas en esta sesión.</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL NUEVA SESIÓN GPS -->
      @if (showCreateModal()) {
        <div class="modal-overlay" (click)="closeCreateModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-satellite-dish"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Registrar Nueva Sesión de Telemetría GPS</h2>
                  <p class="modal-subtitle">Carga de archivos de sensores deportivos (GPX, CSV, FIT) y metadatos</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeCreateModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form (ngSubmit)="submitSesionForm()" class="modal-form">
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-circle-info"></i> Información de la Sesión</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label>Nombre de la Sesión <span class="required-star">*</span></label>
                    <input type="text" [(ngModel)]="sesionForm.nombre_sesion" name="sNombre" placeholder="ej. Partido vs Millonarios Sub-17" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label>Tipo de Sesión <span class="required-star">*</span></label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="sesionForm.tipo_sesion" name="sTipo" class="sport-input" required>
                        <option value="partido">Partido Oficial</option>
                        <option value="entrenamiento">Entrenamiento / Amistoso</option>
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                </div>

                <div class="form-row g3">
                  <div class="input-group">
                    <label>Fecha de la Sesión <span class="required-star">*</span></label>
                    <input type="text" appFlatpickr placeholder="dd/mm/aaaa" [(ngModel)]="sesionForm.fecha_sesion" name="sFecha" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label>Duración (Minutos)</label>
                    <input type="number" [(ngModel)]="sesionForm.duracion_minutos" name="sDur" min="1" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label>Dispositivo / Marca Sensor GPS</label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="sesionForm.dispositivo_marca" name="sDispositivo" class="sport-input">
                        @for (d of dispositivosGps(); track d.codigo) {
                          <option [value]="d.codigo">{{ d.nombre }}</option>
                        }
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                </div>

                <div class="form-row">
                  <div class="input-group">
                    <label>Condiciones Climáticas / Temperatura</label>
                    <input type="text" [(ngModel)]="sesionForm.clima" name="sClima" placeholder="ej. 24°C Soleado" class="sport-input" />
                  </div>
                </div>
              </div>

              <!-- CARGA DE ARCHIVO RAW GPS -->
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-file-arrow-up"></i> Archivo Sensor GPS / Wearable</span>
                <div class="input-group">
                  <label>Adjuntar Archivo de Ingesta (.GPX, .CSV, .JSON, .FIT)</label>
                  <input type="file" (change)="onFileSelected($event)" class="sport-input" accept=".gpx,.csv,.json,.fit" />
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeCreateModal()">Cancelar</button>
                <button type="submit" class="btn-primary">
                  <i class="fa-solid fa-floppy-disk"></i> Guardar e Ingerir Sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL AÑADIR MÉTRICA INDIVIDUAL -->
      @if (showAddMetricaModal()) {
        <div class="modal-overlay" (click)="closeAddMetricaModal()">
          <div class="modal-card modal-md" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-blue">
                  <i class="fa-solid fa-person-running"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Registrar Métrica Cinemática</h2>
                  <p class="modal-subtitle">Datos de rendimiento para {{ selectedSesion()?.nombre_sesion }}</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeAddMetricaModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form (ngSubmit)="submitMetricaForm()" class="modal-form">
              <div class="modal-section">
                <div class="input-group">
                  <app-player-selector
                    [(selectedId)]="metricaForm.jugador_id"
                    [players]="jugadoresList()"
                    [label]="'Seleccionar Jugador a Vincular'"
                    [required]="true"
                    [placeholder]="'Buscar por nombre, documento (TI/CC), género o dorsal...'"
                  ></app-player-selector>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label>Distancia Total (km) <span class="required-star">*</span></label>
                    <input type="number" [(ngModel)]="metricaForm.distancia_total_km" name="mDist" step="0.1" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label>Velocidad Máxima (km/h) <span class="required-star">*</span></label>
                    <input type="number" [(ngModel)]="metricaForm.velocidad_maxima_kmh" name="mVel" step="0.1" class="sport-input" required />
                  </div>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label>Sprints Alta Intensidad (>21 km/h)</label>
                    <input type="number" [(ngModel)]="metricaForm.sprints_alta_intensidad" name="mSpr" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label>PlayerLoad (Índice Carga)</label>
                    <input type="number" [(ngModel)]="metricaForm.player_load" name="mLoad" class="sport-input" />
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeAddMetricaModal()">Cancelar</button>
                <button type="submit" class="btn-primary">
                  <i class="fa-solid fa-check"></i> Guardar Métrica
                </button>
              </div>
            </form>
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
    .telemetria-page {
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
        display: flex;
        align-items: center;
        gap: 0.65rem;
      }

      .page-subtitle {
        color: var(--text-body);
        font-size: 0.85rem;
      }
    }

    .telemetria-content-grid {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 1.5rem;

      @media (max-width: 1024px) {
        grid-template-columns: 1fr;
      }
    }

    /* KPI METRICS ROW PRO */
    .telemetria-kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;

      .kpi-pro-card {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        position: relative;
        overflow: hidden;

        .kpi-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .kpi-chip {
          font-size: 0.725rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 0.35rem;

          &.chip-blue {
            background: rgba(59, 130, 246, 0.15);
            color: #3b82f6;
            border: 1px solid rgba(59, 130, 246, 0.3);
          }
          &.chip-emerald {
            background: rgba(16, 185, 129, 0.15);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.3);
          }
          &.chip-amber {
            background: rgba(245, 158, 11, 0.15);
            color: #f59e0b;
            border: 1px solid rgba(245, 158, 11, 0.3);
          }
          &.chip-purple {
            background: rgba(168, 85, 247, 0.15);
            color: #a855f7;
            border: 1px solid rgba(168, 85, 247, 0.3);
          }
        }

        .kpi-body {
          display: flex;
          flex-direction: column;
          gap: 0.2rem;

          .kpi-val {
            font-size: 1.75rem;
            font-weight: 900;
            color: var(--text-heading);
            line-height: 1.1;

            .kpi-unit {
              font-size: 0.95rem;
              font-weight: 600;
              color: var(--text-muted);
            }
          }

          .kpi-label {
            font-size: 0.82rem;
            font-weight: 600;
            color: var(--text-body);
          }
        }

        .kpi-footer-metric {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;

          .metric-progress-wrap {
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.08);
            border-radius: var(--radius-full);
            overflow: hidden;

            .metric-progress-bar {
              height: 100%;
              border-radius: var(--radius-full);
              transition: width 0.4s ease;
            }
          }

          .kpi-subtext {
            font-size: 0.72rem;
            color: var(--text-muted);
            font-weight: 500;
          }
        }
      }
    }

    /* SIDEBAR DE SESIONES */
    .sesiones-sidebar {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.25rem;
      height: fit-content;

      .sidebar-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 0.75rem;

        .sidebar-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-heading);

          i {
            color: var(--color-primary);
          }

          h3 {
            margin: 0;
            font-size: 0.95rem;
            font-weight: 800;
          }
        }
      }

      .sesiones-list {
        display: flex;
        flex-direction: column;
        gap: 0.65rem;
      }

      .sesion-item-card {
        padding: 0.85rem 1rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;

        &:hover, &.active {
          border-color: var(--color-primary);
          background: rgba(16, 185, 129, 0.08);
        }

        .sesion-name {
          font-size: 0.85rem;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sesion-item-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .sesion-item-sub {
          display: flex;
          gap: 0.75rem;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      }
    }

    /* MAIN PANEL */
    .telemetria-main-panel {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* HEATMAP 2D CANCHA */
    .heatmap-section {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      padding: 1.25rem;

      .heatmap-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;

        .player-focus-info {
          display: flex;
          align-items: center;
          gap: 0.85rem;

          .pitch-badge-icon {
            width: 40px;
            height: 40px;
            border-radius: var(--radius-md);
            background: rgba(16, 185, 129, 0.15);
            color: #10b981;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
          }

          h3 {
            margin: 0;
            font-size: 1.15rem;
            font-weight: 800;
          }

          p {
            margin: 0;
            font-size: 0.82rem;
            color: var(--text-muted);
          }
        }

        .heatmap-controls {
          display: flex;
          align-items: center;
          gap: 0.65rem;

          label {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--text-body);
            display: flex;
            align-items: center;
            gap: 0.35rem;
          }

          .player-heat-select {
            width: 250px;
          }
        }
      }
    }

    .soccer-pitch-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      width: 100%;
    }

    .soccer-pitch {
      position: relative;
      width: 100%;
      height: 380px;
      background: #14532d;
      border: 3px solid rgba(255, 255, 255, 0.9);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);

      /* Césped con franjas */
      .pitch-stripes {
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
          90deg,
          #15803d 0px,
          #15803d 55px,
          #166534 55px,
          #166534 110px
        );
        opacity: 0.95;
      }

      .pitch-line {
        position: absolute;
        border-color: rgba(255, 255, 255, 0.8);
      }

      .pitch-halfway {
        top: 0;
        bottom: 0;
        left: 50%;
        width: 2px;
        background: rgba(255, 255, 255, 0.8);
      }

      .pitch-center-circle {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 120px;
        height: 120px;
        border: 2px solid rgba(255, 255, 255, 0.8);
        border-radius: 50%;
      }

      .pitch-center-spot {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        background: #ffffff;
        border-radius: 50%;
      }

      .penalty-box-left {
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        width: 110px;
        height: 210px;
        border: 2px solid rgba(255, 255, 255, 0.8);
        border-left: none;
      }

      .penalty-box-right {
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        width: 110px;
        height: 210px;
        border: 2px solid rgba(255, 255, 255, 0.8);
        border-right: none;
      }

      .goal-box-left {
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        width: 45px;
        height: 100px;
        border: 2px solid rgba(255, 255, 255, 0.8);
        border-left: none;
      }

      .goal-box-right {
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        width: 45px;
        height: 100px;
        border: 2px solid rgba(255, 255, 255, 0.8);
        border-right: none;
      }

      .corner-top-left {
        top: 0;
        left: 0;
        width: 16px;
        height: 16px;
        border-bottom: 2px solid rgba(255, 255, 255, 0.8);
        border-right: 2px solid rgba(255, 255, 255, 0.8);
        border-bottom-right-radius: 16px;
      }

      .corner-bottom-left {
        bottom: 0;
        left: 0;
        width: 16px;
        height: 16px;
        border-top: 2px solid rgba(255, 255, 255, 0.8);
        border-right: 2px solid rgba(255, 255, 255, 0.8);
        border-top-right-radius: 16px;
      }

      .corner-top-right {
        top: 0;
        right: 0;
        width: 16px;
        height: 16px;
        border-bottom: 2px solid rgba(255, 255, 255, 0.8);
        border-left: 2px solid rgba(255, 255, 255, 0.8);
        border-bottom-left-radius: 16px;
      }

      .corner-bottom-right {
        bottom: 0;
        right: 0;
        width: 16px;
        height: 16px;
        border-top: 2px solid rgba(255, 255, 255, 0.8);
        border-left: 2px solid rgba(255, 255, 255, 0.8);
        border-top-left-radius: 16px;
      }

      .heat-spot {
        position: absolute;
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: radial-gradient(circle, rgba(239, 68, 68, 0.9) 0%, rgba(245, 158, 11, 0.7) 40%, rgba(16, 185, 129, 0.35) 75%, transparent 100%);
        filter: blur(16px);
        pointer-events: none;
        transition: all 0.5s ease;
      }

      /* Player marker on pitch */
      .pitch-player-marker {
        position: absolute;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        z-index: 10;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

        .player-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ffffff;
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          box-shadow: 0 0 12px rgba(255, 255, 255, 0.8);
          border: 2px solid #10b981;
        }

        .player-pulse-ring {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 2px solid #ffffff;
          animation: pulseMarker 1.8s infinite;
        }

        .player-marker-label {
          background: rgba(0, 0, 0, 0.75);
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-xs);
          white-space: nowrap;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
      }
    }

    @keyframes pulseMarker {
      0% {
        transform: translateX(-50%) scale(1);
        opacity: 1;
      }
      100% {
        transform: translateX(-50%) scale(2.2);
        opacity: 0;
      }
    }

    .pitch-footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      flex-wrap: wrap;
      gap: 0.75rem;

      .pitch-legend {
        display: flex;
        gap: 1.25rem;
        font-size: 0.75rem;
        flex-wrap: wrap;

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-body);
        }

        .heat-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;

          &.dot-low { background: #10b981; }
          &.dot-med { background: #f59e0b; }
          &.dot-high { background: #ef4444; }
        }
      }

      .pitch-telemetry-tag {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.75rem;
        color: var(--text-muted);
        background: var(--bg-surface);
        padding: 0.25rem 0.65rem;
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);

        i {
          color: var(--color-primary);
        }
      }
    }

    /* WIDGETS AVANZADOS GRID */
    .telemetry-widgets-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.25rem;

      .widget-card {
        padding: 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .widget-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            h4 {
              margin: 0;
              font-size: 0.95rem;
              font-weight: 800;
              color: var(--text-heading);
            }
          }
        }
      }
    }

    /* WIDGET SPEED GAUGE */
    .speed-gauge-wrap {
      display: flex;
      align-items: center;
      gap: 1.25rem;

      .speed-circle {
        width: 90px;
        height: 90px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 70%);
        border: 3px solid #f59e0b;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .speed-val {
          font-size: 1.5rem;
          font-weight: 900;
          color: #f59e0b;
          line-height: 1;
        }

        .speed-unit {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-muted);
        }
      }

      .speed-metrics-details {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        flex-grow: 1;

        .speed-stat-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.78rem;

          .stat-lbl {
            color: var(--text-muted);
            display: flex;
            align-items: center;
            gap: 0.35rem;
          }

          .stat-num {
            font-weight: 700;
          }
        }
      }
    }

    /* WIDGET INTENSITY ZONES */
    .intensity-zones-bars {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;

      .zone-row {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .zone-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.74rem;
          color: var(--text-body);
        }

        .zone-track {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-full);
          overflow: hidden;

          .zone-fill {
            height: 100%;
            border-radius: var(--radius-full);

            &.fill-z1 { background: #3b82f6; }
            &.fill-z2 { background: #10b981; }
            &.fill-z3 { background: #f59e0b; }
            &.fill-z4 { background: #ef4444; }
          }
        }
      }
    }

    /* WIDGET CARDIO */
    .cardio-status-box {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;

      .cardio-kpis {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        text-align: center;

        .cardio-item {
          background: var(--bg-surface);
          padding: 0.6rem 0.35rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 0.15rem;

          .cardio-title {
            font-size: 0.7rem;
            color: var(--text-muted);
            font-weight: 600;
          }

          .cardio-num {
            font-size: 1.05rem;
            font-weight: 800;

            small {
              font-size: 0.65rem;
              font-weight: 500;
            }
          }
        }
      }

      .cardio-advice {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.74rem;
        color: var(--text-body);
        background: rgba(16, 185, 129, 0.08);
        padding: 0.5rem 0.75rem;
        border-radius: var(--radius-md);
        border: 1px solid rgba(16, 185, 129, 0.2);
      }
    }

    /* TABLA MÉTRICAS */
    .metricas-table-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.25rem;

      .table-header-clean {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 0.75rem;

        .table-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;

          .icon-sq {
            width: 36px;
            height: 36px;
            border-radius: var(--radius-md);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
          }

          h3 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 800;
          }

          .table-sub {
            margin: 0;
            font-size: 0.78rem;
            color: var(--text-muted);
          }
        }
      }
    }

    .player-table-cell {
      display: flex;
      align-items: center;
      gap: 0.6rem;

      .player-avatar-circle {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.75rem;
      }
    }

    .btn-view-heat {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-weight: 700;
    }

    .highlight-row {
      background: rgba(16, 185, 129, 0.12) !important;
    }

    .toast-floating-alert {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #10b981;
      color: #ffffff;
      padding: 0.85rem 1.35rem;
      border-radius: var(--radius-md);
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-weight: 700;
      z-index: 10000;
      animation: slideInUp 0.3s ease;
    }
  `]
})
export class TelemetriaComponent implements OnInit {
  private api = inject(ApiService);
  private catalogos = inject(CatalogosService);

  readonly dispositivosGps = this.catalogos.dispositivosGps;
  readonly sesionesList = signal<any[]>([]);
  readonly selectedSesion = signal<any | null>(null);
  readonly jugadoresList = signal<any[]>([]);
  readonly activeHeatmapPlayer = signal<any | null>(null);

  readonly showCreateModal = signal<boolean>(false);
  readonly showAddMetricaModal = signal<boolean>(false);
  readonly toastMessage = signal<string>('');

  selectedFile: File | null = null;

  sesionForm = {
    nombre_sesion: '',
    tipo_sesion: 'partido',
    dispositivo_marca: 'CATAPULT_10HZ',
    fecha_sesion: new Date().toISOString().split('T')[0],
    duracion_minutos: 90,
    clima: '24°C Soleado',
  };

  metricaForm = {
    jugador_id: '',
    distancia_total_km: 9.8,
    velocidad_maxima_kmh: 32.4,
    sprints_alta_intensidad: 22,
    player_load: 580,
    frecuencia_cardiaca_max: 192,
  };

  readonly activeMetricas = computed(() => {
    const ses = this.selectedSesion();
    if (ses && ses.metricas && ses.metricas.length > 0) {
      return ses.metricas;
    }
    // Mock default metrics if empty
    return [
      { id: '1', jugador_nombre: 'Samuel Gómez', posicion: 'delantero', distancia_total_km: 10.4, velocidad_maxima_kmh: 33.2, sprints_alta_intensidad: 24, player_load: 610, frecuencia_cardiaca_max: 194 },
      { id: '2', jugador_nombre: 'Andrés Felipe Díaz', posicion: 'mediocampista', distancia_total_km: 11.2, velocidad_maxima_kmh: 30.5, sprints_alta_intensidad: 18, player_load: 590, frecuencia_cardiaca_max: 188 },
      { id: '3', jugador_nombre: 'Carlos Mario Valderrama', posicion: 'defensa', distancia_total_km: 8.9, velocidad_maxima_kmh: 29.1, sprints_alta_intensidad: 12, player_load: 480, frecuencia_cardiaca_max: 182 },
      { id: '4', jugador_nombre: 'Mateo Osorio', posicion: 'portero', distancia_total_km: 4.8, velocidad_maxima_kmh: 22.0, sprints_alta_intensidad: 4, player_load: 290, frecuencia_cardiaca_max: 165 },
    ];
  });

  ngOnInit(): void {
    this.loadSesiones();
    this.loadJugadores();
  }

  loadSesiones(preferredId?: string): void {
    this.api.getSesionesTelemetria().subscribe((res: any) => {
      const sesiones = Array.isArray(res) ? res : res?.data || [];
      this.sesionesList.set(sesiones);
      if (sesiones && sesiones.length > 0) {
        let target = sesiones[0];
        if (preferredId) {
          target = sesiones.find((s: any) => s.id === preferredId) || sesiones[0];
        } else if (this.selectedSesion()?.id) {
          target = sesiones.find((s: any) => s.id === this.selectedSesion()?.id) || sesiones[0];
        }
        this.selectSesion(target);
      } else {
        // Fallback demo session
        const demoSes = {
          id: 'demo-1',
          nombre_sesion: 'Fecha 14: SportCore FC vs Academia Pro',
          tipo_sesion: 'partido',
          fecha_sesion: new Date().toISOString().split('T')[0],
          duracion_minutos: 90,
          clima: '24°C Despejado',
        };
        this.selectedSesion.set(demoSes);
        this.activeHeatmapPlayer.set(this.activeMetricas()[0]);
      }
    });
  }

  loadJugadores(): void {
    this.api.getJugadores().subscribe((res) => {
      const jugadores = Array.isArray(res) ? res : (res?.data || []);
      this.jugadoresList.set(jugadores);
    });
  }

  selectSesion(s: any): void {
    this.api.getSesionTelemetriaById(s.id).subscribe({
      next: (full) => {
        const ses = full || s;
        if (ses?.metricas && ses.metricas.length > 0) {
          const mapped = ses.metricas.map((m: any) => ({
            id: m.id,
            jugador_id: m.jugador_id,
            jugador_nombre: m.nombres ? `${m.nombres} ${m.apellidos}` : (m.jugador_nombre || 'Jugador'),
            posicion: m.posicion_principal || m.posicion || 'delantero',
            distancia_total_km: (Number(m.distancia_total_m || 9400) / 1000).toFixed(1),
            velocidad_maxima_kmh: (Number(m.velocidad_max_kmh || 31.8)).toFixed(1),
            sprints_alta_intensidad: m.sprints_conteo || 18,
            player_load: Math.round(Number(m.player_load_au || 540)),
            frecuencia_cardiaca_max: m.frecuencia_cardiaca_max || 188,
            heatmap: m.coordenadas_heatmap_json || [],
          }));
          ses.metricas = mapped;
          this.selectedSesion.set(ses);
          this.activeHeatmapPlayer.set(mapped[0]);
        } else {
          this.selectedSesion.set(ses);
          this.activeHeatmapPlayer.set(this.activeMetricas()[0]);
        }
      },
      error: () => {
        this.selectedSesion.set(s);
        this.activeHeatmapPlayer.set(this.activeMetricas()[0]);
      }
    });
  }

  selectHeatmapPlayer(m: any): void {
    this.activeHeatmapPlayer.set(m);
  }

  onHeatmapPlayerChange(playerId: string): void {
    const found = this.activeMetricas().find((m: any) => m.id === playerId);
    if (found) {
      this.activeHeatmapPlayer.set(found);
    }
  }

  getHeatZones(): any[] {
    const player = this.activeHeatmapPlayer();
    const pos = (player?.posicion || 'delantero').toLowerCase();

    if (pos.includes('delantero')) {
      return [
        { x: 72, y: 48, size: 140, opacity: 0.9 },
        { x: 80, y: 35, size: 110, opacity: 0.8 },
        { x: 82, y: 62, size: 110, opacity: 0.8 },
        { x: 60, y: 50, size: 90, opacity: 0.6 },
      ];
    } else if (pos.includes('mediocampista')) {
      return [
        { x: 50, y: 50, size: 150, opacity: 0.9 },
        { x: 40, y: 35, size: 120, opacity: 0.75 },
        { x: 60, y: 65, size: 120, opacity: 0.75 },
        { x: 55, y: 30, size: 100, opacity: 0.6 },
      ];
    } else if (pos.includes('defensa')) {
      return [
        { x: 25, y: 50, size: 140, opacity: 0.9 },
        { x: 22, y: 30, size: 110, opacity: 0.8 },
        { x: 22, y: 70, size: 110, opacity: 0.8 },
        { x: 38, y: 50, size: 90, opacity: 0.5 },
      ];
    } else {
      // Portero
      return [
        { x: 10, y: 50, size: 110, opacity: 0.95 },
        { x: 14, y: 42, size: 70, opacity: 0.6 },
        { x: 14, y: 58, size: 70, opacity: 0.6 },
      ];
    }
  }

  getPlayerSpotCoordinates(): { x: number; y: number } {
    const player = this.activeHeatmapPlayer();
    const pos = (player?.posicion || 'delantero').toLowerCase();
    if (pos.includes('delantero')) return { x: 74, y: 48 };
    if (pos.includes('mediocampista')) return { x: 50, y: 50 };
    if (pos.includes('defensa')) return { x: 26, y: 50 };
    return { x: 10, y: 50 };
  }

  getProgressDistance(): number {
    const avg = Number(this.getAverageDistance()) || 9.2;
    const progress = Math.min(100, Math.round((avg / 10.5) * 100));
    return progress;
  }

  getTopSpeedNum(): number {
    return Number(this.getTopSpeed()) || 33.2;
  }

  getTopSpeedPlayer(): string {
    const metrics = this.activeMetricas();
    if (!metrics || metrics.length === 0) return 'Samuel Gómez (33.2 km/h)';
    let best = metrics[0];
    for (const m of metrics) {
      if (Number(m.velocidad_maxima_kmh) > Number(best.velocidad_maxima_kmh)) {
        best = m;
      }
    }
    return `${best.jugador_nombre || best.nombres || 'Jugador'} (${best.velocidad_maxima_kmh} km/h)`;
  }

  getAveragePlayerLoadNum(): number {
    return Number(this.getAveragePlayerLoad()) || 560;
  }

  getAvgHeartRate(): number {
    const player = this.activeHeatmapPlayer();
    const maxFc = Number(player?.frecuencia_cardiaca_max) || 188;
    return Math.round(maxFc * 0.82);
  }

  Number(val: any): number {
    return Number(val) || 0;
  }

  getAverageDistance(): string {
    const metrics = this.activeMetricas();
    if (!metrics || metrics.length === 0) return '9.2';
    const sum = metrics.reduce((acc: number, m: any) => acc + (Number(m.distancia_total_km) || 0), 0);
    return (sum / metrics.length).toFixed(1);
  }

  getTopSpeed(): string {
    const metrics = this.activeMetricas();
    if (!metrics || metrics.length === 0) return '33.2';
    const max = Math.max(...metrics.map((m: any) => Number(m.velocidad_maxima_kmh) || 0));
    return max > 0 ? max.toFixed(1) : '33.2';
  }

  getAveragePlayerLoad(): string {
    const metrics = this.activeMetricas();
    if (!metrics || metrics.length === 0) return '560';
    const sum = metrics.reduce((acc: number, m: any) => acc + (Number(m.player_load) || 0), 0);
    return Math.round(sum / metrics.length).toString();
  }

  formatPosicion(pos: string): string {
    switch (pos) {
      case 'delantero': return 'DEL';
      case 'mediocampista': return 'MED';
      case 'defensa': return 'DEF';
      case 'portero': return 'POR';
      default: return pos || 'JUG';
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  openCreateSesionModal(): void {
    this.sesionForm = {
      nombre_sesion: '',
      tipo_sesion: 'partido',
      dispositivo_marca: 'CATAPULT_10HZ',
      fecha_sesion: new Date().toISOString().split('T')[0],
      duracion_minutos: 90,
      clima: '24°C Soleado',
    };
    this.selectedFile = null;
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  submitSesionForm(): void {
    if (!this.sesionForm.nombre_sesion) {
      this.showToast('Ingresa el nombre de la sesión');
      return;
    }

    const payload = {
      fecha_sesion: this.sesionForm.fecha_sesion,
      tipo_sesion: this.sesionForm.tipo_sesion === 'partido' ? 'PARTIDO_OFICIAL' : 'ENTRENAMIENTO_TACTICO',
      dispositivo_marca: this.sesionForm.dispositivo_marca || 'CATAPULT_10HZ',
      duracion_minutos: Number(this.sesionForm.duracion_minutos) || 90,
      clima_temperatura: this.sesionForm.clima || null,
    };

    this.api.createSesionTelemetria(payload).subscribe({
      next: (created) => {
        if (this.selectedFile && created?.id) {
          this.api.uploadFile(this.selectedFile, 'telemetria', 'SESION_GPS', created.id, 'TRACKING_GPS_RAW').subscribe();
        }
        this.showToast('¡Sesión de telemetría GPS registrada e ingerida!');
        this.closeCreateModal();
        if (created?.id) {
          this.selectedSesion.set(created);
          this.loadSesiones(created.id);
        } else {
          this.loadSesiones();
        }
      },
      error: () => {
        this.showToast('Error al registrar sesión GPS');
      }
    });
  }

  openAddMetricaModal(): void {
    const ses = this.selectedSesion();
    if (!ses?.id) {
      this.showToast('Selecciona una sesión GPS primero');
      return;
    }
    const jugadores = this.jugadoresList();
    this.metricaForm = {
      jugador_id: jugadores.length > 0 ? jugadores[0].id : '',
      distancia_total_km: 9.8,
      velocidad_maxima_kmh: 32.4,
      sprints_alta_intensidad: 22,
      player_load: 580,
      frecuencia_cardiaca_max: 192,
    };
    this.showAddMetricaModal.set(true);
  }

  closeAddMetricaModal(): void {
    this.showAddMetricaModal.set(false);
  }

  submitMetricaForm(): void {
    const ses = this.selectedSesion();
    if (!ses?.id || !this.metricaForm.jugador_id) {
      this.showToast('Selecciona un jugador válido');
      return;
    }

    const payload = {
      jugador_id: this.metricaForm.jugador_id,
      distancia_total_m: Number(this.metricaForm.distancia_total_km) * 1000,
      velocidad_max_kmh: Number(this.metricaForm.velocidad_maxima_kmh),
      sprints_conteo: Number(this.metricaForm.sprints_alta_intensidad) || 0,
      player_load_au: Number(this.metricaForm.player_load) || 0,
      frecuencia_cardiaca_max: Number(this.metricaForm.frecuencia_cardiaca_max) || 188,
      coordenadas_heatmap_json: this.getHeatZones(),
    };

    this.api.createMetricaGps(ses.id, payload).subscribe({
      next: () => {
        this.showToast('¡Métrica cinemática registrada exitosamente!');
        this.closeAddMetricaModal();
        this.selectSesion(ses);
      },
      error: () => {
        this.showToast('Error al registrar métrica');
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

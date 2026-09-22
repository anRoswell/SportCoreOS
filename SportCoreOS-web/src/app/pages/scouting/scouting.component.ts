import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CatalogosService } from '../../core/services/catalogos.service';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';

@Component({
  selector: 'app-scouting',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrDirective],
  template: `
    <div class="scouting-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            <i class="fa-solid fa-binoculars text-emerald"></i> Scouting, Visoría & Captación
          </h1>
          <p class="page-subtitle">Pipeline de talentos observados en torneos externos, pruebas de admisión y rúbricas técnicas</p>
        </div>
        <div class="header-actions">
          <div class="view-mode-tabs">
            <button
              class="tab-btn"
              [class.active]="viewMode() === 'pipeline'"
              (click)="viewMode.set('pipeline')"
            >
              <i class="fa-solid fa-table-columns"></i> Tablero Pipeline
            </button>
            <button
              class="tab-btn"
              [class.active]="viewMode() === 'lista'"
              (click)="viewMode.set('lista')"
            >
              <i class="fa-solid fa-list-ul"></i> Directorio Completo
            </button>
          </div>
          <button class="btn-primary" (click)="openCreateProspectoModal()">
            <i class="fa-solid fa-user-plus"></i> Registrar Prospecto
          </button>
        </div>
      </div>

      <!-- KPI METRICS ROW PRO -->
      <div class="kpi-row scouting-kpis">
        <div class="kpi-card fut-card kpi-scout-card">
          <div class="kpi-top">
            <div class="kpi-icon-wrap bg-blue-glow">
              <i class="fa-solid fa-users-viewfinder"></i>
            </div>
            <span class="kpi-chip chip-blue"><i class="fa-solid fa-radar"></i> Pipeline Activo</span>
          </div>
          <div class="kpi-body">
            <div class="kpi-val">{{ prospectosList().length }}</div>
            <div class="kpi-label">Talentos en Seguimiento</div>
          </div>
          <div class="kpi-footer-metric">
            <div class="metric-progress-wrap">
              <div class="metric-progress-bar" style="width: 100%; background: #3b82f6;"></div>
            </div>
            <span class="kpi-subtext">Base de datos de visorías y captación</span>
          </div>
        </div>

        <div class="kpi-card fut-card kpi-scout-card">
          <div class="kpi-top">
            <div class="kpi-icon-wrap bg-amber-glow">
              <i class="fa-solid fa-star"></i>
            </div>
            <span class="kpi-chip chip-amber"><i class="fa-solid fa-fire"></i> Alta Prioridad</span>
          </div>
          <div class="kpi-body">
            <div class="kpi-val">{{ countByEstado('interes_fichaje') }}</div>
            <div class="kpi-label">Prioridad de Fichaje</div>
          </div>
          <div class="kpi-footer-metric">
            <div class="metric-progress-wrap">
              <div class="metric-progress-bar" [style.width.%]="getRatioByEstado('interes_fichaje')" style="background: #f59e0b;"></div>
            </div>
            <span class="kpi-subtext">{{ getRatioByEstado('interes_fichaje') }}% del pipeline en fase final</span>
          </div>
        </div>

        <div class="kpi-card fut-card kpi-scout-card">
          <div class="kpi-top">
            <div class="kpi-icon-wrap bg-emerald-glow">
              <i class="fa-solid fa-signature"></i>
            </div>
            <span class="kpi-chip chip-emerald"><i class="fa-solid fa-check-double"></i> Fichados</span>
          </div>
          <div class="kpi-body">
            <div class="kpi-val">{{ countByEstado('fichado') }}</div>
            <div class="kpi-label">Incorporados al Club</div>
          </div>
          <div class="kpi-footer-metric">
            <div class="metric-progress-wrap">
              <div class="metric-progress-bar" [style.width.%]="getRatioByEstado('fichado')" style="background: #10b981;"></div>
            </div>
            <span class="kpi-subtext">Matriculados en planteles oficiales</span>
          </div>
        </div>

        <div class="kpi-card fut-card kpi-scout-card">
          <div class="kpi-top">
            <div class="kpi-icon-wrap bg-purple-glow">
              <i class="fa-solid fa-clipboard-check"></i>
            </div>
            <span class="kpi-chip chip-purple"><i class="fa-solid fa-chart-line"></i> Rúbricas</span>
          </div>
          <div class="kpi-body">
            <div class="kpi-val">{{ getGlobalTechnicalAverage() }} <span class="kpi-unit">/ 10</span></div>
            <div class="kpi-label">Promedio Técnico Global</div>
          </div>
          <div class="kpi-footer-metric">
            <div class="metric-progress-wrap">
              <div class="metric-progress-bar" [style.width.%]="getAverageRatingPercent()" style="background: #a855f7;"></div>
            </div>
            <span class="kpi-subtext">Basado en evaluaciones 4-Pilares</span>
          </div>
        </div>
      </div>

      <!-- BARRA DE FILTROS & BÚSQUEDA -->
      <div class="filters-bar fut-card">
        <div class="search-input-wrap">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onFilterChange()"
            placeholder="Buscar por nombre, club de origen, ciudad o posición..."
            class="sport-input"
          />
        </div>

        <div class="filter-controls-row">
          <div class="filter-item">
            <label><i class="fa-solid fa-shirt"></i> Posición:</label>
            <div class="sport-select-wrapper">
              <select [(ngModel)]="selectedPosicion" (ngModelChange)="onFilterChange()" class="sport-input">
                <option value="TODAS">Todas las Posiciones</option>
                <option value="portero">Portero (POR)</option>
                <option value="defensa">Defensa (DEF)</option>
                <option value="mediocampista">Mediocampista (MED)</option>
                <option value="delantero">Delantero (DEL)</option>
              </select>
              <i class="fa-solid fa-chevron-down select-chevron"></i>
            </div>
          </div>

          <div class="filter-item">
            <label><i class="fa-solid fa-timeline"></i> Estado:</label>
            <div class="sport-select-wrapper">
              <select [(ngModel)]="selectedEstado" (ngModelChange)="onFilterChange()" class="sport-input">
                <option value="TODOS">Todos los Estados</option>
                <option value="en_observacion">En Observación</option>
                <option value="interes_fichaje">Interés de Fichaje</option>
                <option value="fichado">Fichado</option>
                <option value="descartado">Descartado</option>
              </select>
              <i class="fa-solid fa-chevron-down select-chevron"></i>
            </div>
          </div>

          <button class="btn-secondary btn-sm btn-reset-filters" (click)="resetFilters()" title="Limpiar Filtros">
            <i class="fa-solid fa-arrow-rotate-left"></i> Limpiar
          </button>
        </div>
      </div>

      <!-- VISTA 1: TABLERO KANBAN DE PIPELINE PRO -->
      @if (viewMode() === 'pipeline') {
        <div class="kanban-board-grid">
          <!-- COLUMNA 1: EN OBSERVACIÓN -->
          <div class="kanban-column col-observacion">
            <div class="kanban-col-header bg-col-blue">
              <div class="col-title-wrap">
                <div class="col-icon-badge bg-blue-glow"><i class="fa-solid fa-eye"></i></div>
                <div class="col-name-box">
                  <strong>En Observación</strong>
                  <span class="col-sub">Seguimiento inicial</span>
                </div>
              </div>
              <span class="col-count count-blue">{{ getProspectosByCol('en_observacion').length }}</span>
            </div>
            <div class="kanban-cards-list">
              @for (p of getProspectosByCol('en_observacion'); track p.id) {
                <div class="prospecto-card fut-card" (click)="openExpedienteModal(p)">
                  <div class="prospect-card-top">
                    <div class="prospect-avatar-wrap">
                      <img [src]="p.foto_url || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100'" alt="{{ p.nombres }}" />
                      <span class="pos-tag">{{ formatPosicion(p.posicion_principal) }}</span>
                    </div>
                    <div class="prospect-main-info">
                      <h4 class="prospect-name">{{ p.nombres }} {{ p.apellidos }}</h4>
                      <div class="prospect-tags-row">
                        <span class="meta-chip"><i class="fa-solid fa-shield"></i> {{ p.club_origen || 'Agente Libre' }}</span>
                        <span class="meta-chip"><i class="fa-solid fa-location-dot"></i> {{ p.ciudad || 'Colombia' }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="prospect-card-footer">
                    <div class="rating-badge rating-good">
                      <i class="fa-solid fa-star"></i>
                      <span>{{ p.promedio_tecnico || '8.2' }}</span>
                    </div>
                    <div class="card-quick-actions" (click)="$event.stopPropagation()">
                      <button class="btn-action-icon btn-eval" (click)="openRubricaModal(p, $event)" title="Evaluar Rúbrica">
                        <i class="fa-solid fa-chart-simple"></i>
                      </button>
                      <button class="btn-action-icon btn-promote" (click)="cambiarEstadoProspecto(p, 'interes_fichaje', $event)" title="Avanzar a Interés">
                        <i class="fa-solid fa-arrow-right"></i>
                      </button>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="empty-col">
                  <i class="fa-solid fa-user-clock"></i>
                  <p>Sin prospectos en observación</p>
                </div>
              }
            </div>
          </div>

          <!-- COLUMNA 2: INTERÉS DE FICHAJE -->
          <div class="kanban-column col-interes">
            <div class="kanban-col-header bg-col-amber">
              <div class="col-title-wrap">
                <div class="col-icon-badge bg-amber-glow"><i class="fa-solid fa-fire"></i></div>
                <div class="col-name-box">
                  <strong>Interés de Fichaje</strong>
                  <span class="col-sub">Prioridad de captación</span>
                </div>
              </div>
              <span class="col-count count-amber">{{ getProspectosByCol('interes_fichaje').length }}</span>
            </div>
            <div class="kanban-cards-list">
              @for (p of getProspectosByCol('interes_fichaje'); track p.id) {
                <div class="prospecto-card fut-card card-amber-highlight" (click)="openExpedienteModal(p)">
                  <div class="prospect-card-top">
                    <div class="prospect-avatar-wrap">
                      <img [src]="p.foto_url || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100'" alt="{{ p.nombres }}" />
                      <span class="pos-tag pos-amber">{{ formatPosicion(p.posicion_principal) }}</span>
                    </div>
                    <div class="prospect-main-info">
                      <h4 class="prospect-name">{{ p.nombres }} {{ p.apellidos }}</h4>
                      <div class="prospect-tags-row">
                        <span class="meta-chip"><i class="fa-solid fa-shield"></i> {{ p.club_origen || 'Agente Libre' }}</span>
                        <span class="meta-chip"><i class="fa-solid fa-phone"></i> {{ p.telefono_contacto || 'Contactar' }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="prospect-card-footer">
                    <div class="rating-badge rating-elite">
                      <i class="fa-solid fa-star"></i>
                      <span>{{ p.promedio_tecnico || '8.9' }}</span>
                    </div>
                    <div class="card-quick-actions" (click)="$event.stopPropagation()">
                      <button class="btn-fichar-mini" (click)="cambiarEstadoProspecto(p, 'fichado', $event)">
                        <i class="fa-solid fa-signature"></i> Fichar
                      </button>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="empty-col">
                  <i class="fa-solid fa-star-half-stroke"></i>
                  <p>Sin talentos con interés activo</p>
                </div>
              }
            </div>
          </div>

          <!-- COLUMNA 3: FICHADO / INCORPORADO -->
          <div class="kanban-column col-fichado">
            <div class="kanban-col-header bg-col-emerald">
              <div class="col-title-wrap">
                <div class="col-icon-badge bg-emerald-glow"><i class="fa-solid fa-circle-check"></i></div>
                <div class="col-name-box">
                  <strong>Fichado / Incorporado</strong>
                  <span class="col-sub">Plantel del Club</span>
                </div>
              </div>
              <span class="col-count count-emerald">{{ getProspectosByCol('fichado').length }}</span>
            </div>
            <div class="kanban-cards-list">
              @for (p of getProspectosByCol('fichado'); track p.id) {
                <div class="prospecto-card fut-card card-emerald-highlight" (click)="openExpedienteModal(p)">
                  <div class="prospect-card-top">
                    <div class="prospect-avatar-wrap">
                      <img [src]="p.foto_url || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100'" alt="{{ p.nombres }}" />
                      <span class="pos-tag pos-emerald">{{ formatPosicion(p.posicion_principal) }}</span>
                    </div>
                    <div class="prospect-main-info">
                      <h4 class="prospect-name">{{ p.nombres }} {{ p.apellidos }}</h4>
                      <div class="prospect-tags-row">
                        <span class="meta-chip text-emerald"><i class="fa-solid fa-award"></i> Oficial SportCore</span>
                      </div>
                    </div>
                  </div>

                  <div class="prospect-card-footer">
                    <span class="badge badge-success"><i class="fa-solid fa-check"></i> En Plantel</span>
                    <button class="btn-action-icon" (click)="openExpedienteModal(p)" title="Ver Ficha">
                      <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="empty-col">
                  <i class="fa-solid fa-trophy"></i>
                  <p>Sin fichajes completados aún</p>
                </div>
              }
            </div>
          </div>

          <!-- COLUMNA 4: DESCARTADO -->
          <div class="kanban-column col-descartado">
            <div class="kanban-col-header bg-col-gray">
              <div class="col-title-wrap">
                <div class="col-icon-badge"><i class="fa-solid fa-ban"></i></div>
                <div class="col-name-box">
                  <strong>Descartado</strong>
                  <span class="col-sub">No prioritario</span>
                </div>
              </div>
              <span class="col-count count-gray">{{ getProspectosByCol('descartado').length }}</span>
            </div>
            <div class="kanban-cards-list">
              @for (p of getProspectosByCol('descartado'); track p.id) {
                <div class="prospecto-card fut-card card-muted" (click)="openExpedienteModal(p)">
                  <div class="prospect-card-top">
                    <div class="prospect-avatar-wrap grayscale">
                      <img [src]="p.foto_url || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100'" alt="{{ p.nombres }}" />
                    </div>
                    <div class="prospect-main-info">
                      <h4 class="prospect-name text-muted">{{ p.nombres }} {{ p.apellidos }}</h4>
                      <div class="prospect-tags-row">
                        <span class="meta-chip text-muted">{{ formatPosicion(p.posicion_principal) }} • {{ p.club_origen || 'Libre' }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="prospect-card-footer">
                    <span class="badge badge-danger">Descartado</span>
                    <button class="btn-action-icon text-muted" (click)="cambiarEstadoProspecto(p, 'en_observacion', $event)" title="Reactivar">
                      <i class="fa-solid fa-rotate-left"></i>
                    </button>
                  </div>
                </div>
              } @empty {
                <div class="empty-col">
                  <i class="fa-solid fa-user-xmark"></i>
                  <p>Sin descartes registrados</p>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- VISTA 2: DIRECTORIO EN TABLA -->
      @if (viewMode() === 'lista') {
        <div class="directorio-section fut-card">
          <div class="table-responsive">
            <table class="fut-table">
              <thead>
                <tr>
                  <th>Prospecto</th>
                  <th>Posición</th>
                  <th>Club Origen</th>
                  <th>Ciudad</th>
                  <th>Pierna Hábil</th>
                  <th>Estado Pipeline</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @for (p of filteredProspectos(); track p.id) {
                  <tr>
                    <td>
                      <div class="player-cell">
                        <div class="player-avatar-sm">
                          <img [src]="p.foto_url || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100'" alt="{{ p.nombres }}" />
                        </div>
                        <div>
                          <strong>{{ p.nombres }} {{ p.apellidos }}</strong>
                          <div><small class="text-muted">{{ p.telefono_contacto || 'Sin teléfono' }}</small></div>
                        </div>
                      </div>
                    </td>
                    <td><span class="badge badge-blue">{{ formatPosicion(p.posicion_principal) }}</span></td>
                    <td><strong>{{ p.club_origen || 'Libre' }}</strong></td>
                    <td>{{ p.ciudad || 'Colombia' }}</td>
                    <td>{{ p.pierna_habil || 'Derecha' }}</td>
                    <td>
                      <span
                        class="badge"
                        [class.badge-primary]="p.estado_pipeline === 'en_observacion'"
                        [class.badge-warning]="p.estado_pipeline === 'interes_fichaje'"
                        [class.badge-success]="p.estado_pipeline === 'fichado'"
                        [class.badge-danger]="p.estado_pipeline === 'descartado'"
                      >
                        {{ formatEstadoPipeline(p.estado_pipeline) }}
                      </span>
                    </td>
                    <td>
                      <div class="table-actions-row">
                        <button class="btn-secondary btn-sm" (click)="openExpedienteModal(p)" title="Ver Ficha y Rúbricas">
                          <i class="fa-solid fa-eye"></i>
                        </button>
                        <button class="btn-secondary btn-sm" (click)="openRubricaModal(p, $event)" title="Añadir Evaluación">
                          <i class="fa-solid fa-star"></i>
                        </button>
                        <button class="btn-secondary btn-sm btn-danger-hover" (click)="openDeleteModal(p)" title="Eliminar Prospecto">
                          <i class="fa-solid fa-trash-can"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="text-center py-4">No se encontraron prospectos registrados con los filtros aplicados.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- MODAL NUEVO PROSPECTO -->
      @if (showCreateModal()) {
        <div class="modal-overlay" (click)="closeCreateModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-user-plus"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Registrar Nuevo Talento / Prospecto</h2>
                  <p class="modal-subtitle">Captación en visorías externas, pruebas de admisión y scouting</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeCreateModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form (ngSubmit)="submitProspectoForm()" class="modal-form">
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-id-card"></i> Datos Personales & Contacto</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label>Nombres <span class="required-star">*</span></label>
                    <input type="text" [(ngModel)]="prospectoForm.nombres" name="pNombres" placeholder="ej. Mateo" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label>Apellidos <span class="required-star">*</span></label>
                    <input type="text" [(ngModel)]="prospectoForm.apellidos" name="pApellidos" placeholder="ej. Gómez Rojas" class="sport-input" required />
                  </div>
                </div>

                <div class="form-row g3">
                  <div class="input-group">
                    <label>Fecha de Nacimiento</label>
                    <input type="text" appFlatpickr placeholder="dd/mm/aaaa" [(ngModel)]="prospectoForm.fecha_nacimiento" name="pFechaNac" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label>Ciudad de Origen</label>
                    <input type="text" [(ngModel)]="prospectoForm.ciudad" name="pCiudad" placeholder="ej. Cali, Valle" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label>Teléfono / WhatsApp</label>
                    <input type="tel" [(ngModel)]="prospectoForm.telefono_contacto" name="pTel" placeholder="+57 312..." class="sport-input" />
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-futbol"></i> Perfil Deportivo & Procedencia</span>
                <div class="form-row g3">
                  <div class="input-group">
                    <label>Posición Principal <span class="required-star">*</span></label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="prospectoForm.posicion_principal" name="pPos" class="sport-input" required>
                        @for (pos of posiciones(); track pos.codigo) {
                          <option [value]="pos.codigo">{{ pos.nombre }}</option>
                        }
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                  <div class="input-group">
                    <label>Pierna Hábil</label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="prospectoForm.pierna_habil" name="pPierna" class="sport-input">
                        @for (ph of piernasHabiles(); track ph.codigo) {
                          <option [value]="ph.codigo">{{ ph.nombre }}</option>
                        }
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                  <div class="input-group">
                    <label>Club / Escuela de Origen</label>
                    <input type="text" [(ngModel)]="prospectoForm.club_origen" name="pClubOrig" placeholder="ej. Academia Real Cali" class="sport-input" />
                  </div>
                </div>
              </div>

              <!-- SUBIDA DE ARCHIVO / DOCUMENTO DE VISORÍA -->
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-file-arrow-up"></i> Documento / Ficha Técnica Adjunta</span>
                <div class="input-group">
                  <label>Adjuntar Reporte de Visoría, Video o Ficha (PDF, Imagen)</label>
                  <input type="file" (change)="onFileSelected($event)" class="sport-input" accept=".pdf,.png,.jpg,.jpeg,.mp4" />
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeCreateModal()">Cancelar</button>
                <button type="submit" class="btn-primary">
                  <i class="fa-solid fa-floppy-disk"></i> Guardar Prospecto
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL EXPEDIENTE & RÚBRICAS TÉCNICAS -->
      @if (showExpedienteModal() && selectedProspecto()) {
        <div class="modal-overlay" (click)="closeExpedienteModal()">
          <div class="modal-card modal-lg modal-xl expediente-modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-blue">
                  <i class="fa-solid fa-id-card"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Expediente del Prospecto</h2>
                  <p class="modal-subtitle">{{ selectedProspecto()?.nombres }} {{ selectedProspecto()?.apellidos }} • {{ formatPosicion(selectedProspecto()?.posicion_principal) }}</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeExpedienteModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="modal-body-scroll">
              <div class="expediente-top-hero">
                <div class="hero-avatar">
                  <img [src]="selectedProspecto()?.foto_url || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120'" alt="Foto" />
                </div>
                <div class="hero-details">
                  <h3>{{ selectedProspecto()?.nombres }} {{ selectedProspecto()?.apellidos }}</h3>
                  <div class="hero-badges-row">
                    <span class="badge badge-blue">{{ formatPosicion(selectedProspecto()?.posicion_principal) }}</span>
                    <span class="badge badge-purple">Pierna: {{ selectedProspecto()?.pierna_habil || 'Derecha' }}</span>
                    <span class="badge badge-amber">Club: {{ selectedProspecto()?.club_origen || 'Agente Libre' }}</span>
                  </div>
                </div>
                <div class="hero-score-badge">
                  <span class="score-num">{{ selectedProspecto()?.promedio_tecnico || '8.5' }}</span>
                  <span class="score-lbl">Score Visoría</span>
                </div>
              </div>

              <!-- RÚBRICAS TÉCNICAS DE EVALUACIÓN -->
              <div class="modal-section">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                  <span class="modal-section-title" style="margin:0;"><i class="fa-solid fa-chart-radar"></i> Evaluación Técnica por Pilares (1 - 10)</span>
                  <button class="btn-primary btn-sm" (click)="openRubricaModal(selectedProspecto())">
                    <i class="fa-solid fa-plus"></i> Añadir Rúbrica
                  </button>
                </div>

                <div class="rubricas-radar-grid">
                  <div class="rubrica-pillar-card">
                    <div class="pillar-label">
                      <span>⚽ Técnica Individual</span>
                      <strong>8.8 / 10</strong>
                    </div>
                    <div class="pillar-bar"><div class="bar-fill bg-emerald" style="width: 88%;"></div></div>
                  </div>

                  <div class="rubrica-pillar-card">
                    <div class="pillar-label">
                      <span>🧠 Inteligencia Táctica</span>
                      <strong>8.2 / 10</strong>
                    </div>
                    <div class="pillar-bar"><div class="bar-fill bg-blue" style="width: 82%;"></div></div>
                  </div>

                  <div class="rubrica-pillar-card">
                    <div class="pillar-label">
                      <span>⚡ Condición Física</span>
                      <strong>8.5 / 10</strong>
                    </div>
                    <div class="pillar-bar"><div class="bar-fill bg-amber" style="width: 85%;"></div></div>
                  </div>

                  <div class="rubrica-pillar-card">
                    <div class="pillar-label">
                      <span>🛡️ Fortaleza Mental & Actitud</span>
                      <strong>9.0 / 10</strong>
                    </div>
                    <div class="pillar-bar"><div class="bar-fill bg-purple" style="width: 90%;"></div></div>
                  </div>
                </div>
              </div>

              <!-- CAMBIO RÁPIDO DE ESTADO DE PIPELINE -->
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-sliders"></i> Estado en el Pipeline</span>
                <div class="pipeline-actions-row">
                  <button class="btn-secondary" (click)="cambiarEstadoProspecto(selectedProspecto(), 'en_observacion')">
                    <i class="fa-solid fa-eye"></i> En Observación
                  </button>
                  <button class="btn-secondary text-amber" (click)="cambiarEstadoProspecto(selectedProspecto(), 'interes_fichaje')">
                    <i class="fa-solid fa-star"></i> Interés de Fichaje
                  </button>
                  <button class="btn-primary" (click)="cambiarEstadoProspecto(selectedProspecto(), 'fichado')">
                    <i class="fa-solid fa-circle-check"></i> Promover / Fichar al Club
                  </button>
                  <button class="btn-secondary text-danger" (click)="cambiarEstadoProspecto(selectedProspecto(), 'descartado')">
                    <i class="fa-solid fa-ban"></i> Descartar
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn-secondary" (click)="closeExpedienteModal()">Cerrar</button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL AÑADIR EVALUACIÓN / RÚBRICA -->
      @if (showRubricaModal() && prospectoToEvaluate()) {
        <div class="modal-overlay" (click)="closeRubricaModal()">
          <div class="modal-card modal-md modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-amber">
                  <i class="fa-solid fa-star"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Evaluar Rúbrica Deportiva</h2>
                  <p class="modal-subtitle">{{ prospectoToEvaluate()?.nombres }} {{ prospectoToEvaluate()?.apellidos }}</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeRubricaModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form (ngSubmit)="submitRubricaForm()" class="modal-form">
              <div class="modal-section">
                <div class="form-row g2">
                  <div class="input-group">
                    <label>Técnica Individual (1-10) <span class="required-star">*</span></label>
                    <input type="number" [(ngModel)]="rubricaForm.nota_tecnica" name="nTec" min="1" max="10" step="0.5" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label>Táctica & Posicionamiento (1-10) <span class="required-star">*</span></label>
                    <input type="number" [(ngModel)]="rubricaForm.nota_tactica" name="nTac" min="1" max="10" step="0.5" class="sport-input" required />
                  </div>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label>Físico & Velocidad (1-10) <span class="required-star">*</span></label>
                    <input type="number" [(ngModel)]="rubricaForm.nota_fisica" name="nFis" min="1" max="10" step="0.5" class="sport-input" required />
                  </div>
                  <div class="input-group">
                    <label>Mental & Disciplina (1-10) <span class="required-star">*</span></label>
                    <input type="number" [(ngModel)]="rubricaForm.nota_mental" name="nMen" min="1" max="10" step="0.5" class="sport-input" required />
                  </div>
                </div>

                <div class="input-group">
                  <label>Comentarios de la Observación</label>
                  <textarea [(ngModel)]="rubricaForm.comentarios" name="nCom" rows="3" placeholder="Observaciones detalladas sobre el desempeño del talento..." class="sport-input"></textarea>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeRubricaModal()">Cancelar</button>
                <button type="submit" class="btn-primary">
                  <i class="fa-solid fa-check"></i> Registrar Evaluación
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL CONFIRMAR ELIMINACIÓN DE PROSPECTO -->
      @if (showDeleteModal() && prospectoToDelete()) {
        <div class="modal-overlay" (click)="closeDeleteModal()">
          <div class="delete-confirm-modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header header-danger">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-danger-glow">
                  <i class="fa-solid fa-trash-can"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Eliminar Prospecto del Pipeline</h2>
                  <p class="modal-subtitle">Esta acción borrará el talento observado y su historial de visorías</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeDeleteModal()"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="delete-confirm-body">
              <div class="player-retire-card">
                <div class="retire-avatar-wrap">
                  <img [src]="prospectoToDelete()?.foto_url || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=100'" alt="{{ prospectoToDelete()?.nombres }}" />
                </div>
                <div class="retire-player-details">
                  <div class="retire-name-row">
                    <span class="retire-player-name">{{ prospectoToDelete()?.nombres }} {{ prospectoToDelete()?.apellidos }}</span>
                  </div>
                  <div class="retire-meta-row">
                    <span class="meta-tag"><i class="fa-solid fa-futbol"></i> {{ formatPosicion(prospectoToDelete()?.posicion_principal) }}</span>
                    <span class="meta-tag"><i class="fa-solid fa-shield"></i> {{ prospectoToDelete()?.club_origen || 'Libre' }}</span>
                  </div>
                </div>
              </div>

              <div class="warning-callout">
                <i class="fa-solid fa-triangle-exclamation warning-callout-icon"></i>
                <div class="warning-callout-content">
                  <h4>Advertencia de Eliminación:</h4>
                  <ul>
                    <li>Se eliminarán todas las rúbricas e informes técnicos asociados al talento.</li>
                    <li>Esta acción es permanente e irreversible.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeDeleteModal()">Cancelar</button>
              <button type="button" class="btn-confirm-delete" (click)="confirmarEliminarProspecto()">
                <i class="fa-solid fa-trash-can"></i> Sí, Eliminar Prospecto
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
    .scouting-page {
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

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    /* KPI METRICS ROW PRO */
    .scouting-kpis {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;

      .kpi-scout-card {
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
          &.chip-amber {
            background: rgba(245, 158, 11, 0.15);
            color: #f59e0b;
            border: 1px solid rgba(245, 158, 11, 0.3);
          }
          &.chip-emerald {
            background: rgba(16, 185, 129, 0.15);
            color: #10b981;
            border: 1px solid rgba(16, 185, 129, 0.3);
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

    /* FILTERS BAR */
    .filters-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.25rem;
      flex-wrap: wrap;

      .search-input-wrap {
        position: relative;
        flex: 1;
        min-width: 280px;

        i {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        input {
          width: 100%;
          padding-left: 2.5rem !important;
        }
      }

      .filter-controls-row {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-wrap: wrap;

        .filter-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;

          label {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--text-body);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 0.35rem;

            i {
              color: var(--color-primary);
            }
          }

          .sport-select-wrapper {
            width: 180px;
          }
        }

        .btn-reset-filters {
          height: var(--control-height-md);
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
      }
    }

    /* KANBAN BOARD */
    .kanban-board-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;

      @media (max-width: 1200px) {
        grid-template-columns: repeat(2, 1fr);
      }
      @media (max-width: 680px) {
        grid-template-columns: 1fr;
      }
    }

    .kanban-column {
      display: flex;
      flex-direction: column;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow: hidden;
      min-height: 540px;
      box-shadow: var(--shadow-sm);

      &.col-observacion { border-top: 3px solid #3b82f6; }
      &.col-interes { border-top: 3px solid #f59e0b; }
      &.col-fichado { border-top: 3px solid #10b981; }
      &.col-descartado { border-top: 3px solid #64748b; }

      .kanban-col-header {
        padding: 0.85rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--border-color);
        background: rgba(255, 255, 255, 0.02);

        .col-title-wrap {
          display: flex;
          align-items: center;
          gap: 0.65rem;

          .col-icon-badge {
            width: 28px;
            height: 28px;
            border-radius: var(--radius-xs);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
          }

          .col-name-box {
            display: flex;
            flex-direction: column;

            strong {
              font-size: 0.88rem;
              color: var(--text-heading);
            }

            .col-sub {
              font-size: 0.68rem;
              color: var(--text-muted);
            }
          }
        }

        .col-count {
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.15rem 0.55rem;
          border-radius: var(--radius-full);

          &.count-blue { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
          &.count-amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
          &.count-emerald { background: rgba(16, 185, 129, 0.15); color: #10b981; }
          &.count-gray { background: rgba(100, 116, 139, 0.15); color: #94a3b8; }
        }
      }

      .kanban-cards-list {
        padding: 0.85rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        flex: 1;
        overflow-y: auto;
      }

      .empty-col {
        text-align: center;
        padding: 3rem 1rem;
        color: var(--text-muted);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;

        i {
          font-size: 1.75rem;
          opacity: 0.5;
        }

        p {
          margin: 0;
          font-size: 0.8rem;
        }
      }
    }

    .prospecto-card {
      padding: 1rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      transition: all 0.2s ease;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);

      &:hover {
        transform: translateY(-2px);
        border-color: var(--color-primary);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
      }

      &.card-amber-highlight:hover {
        border-color: #f59e0b;
      }

      &.card-emerald-highlight:hover {
        border-color: #10b981;
      }

      &.card-muted {
        opacity: 0.65;
        &:hover { opacity: 1; }
      }

      .prospect-card-top {
        display: flex;
        gap: 0.75rem;
        align-items: flex-start;

        .prospect-avatar-wrap {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          overflow: visible;
          flex-shrink: 0;

          img {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--border-color);
          }

          &.grayscale img {
            filter: grayscale(1);
          }

          .pos-tag {
            position: absolute;
            bottom: -4px;
            right: -4px;
            font-size: 0.6rem;
            font-weight: 800;
            background: #3b82f6;
            color: #ffffff;
            padding: 0.1rem 0.35rem;
            border-radius: 4px;
            border: 1px solid var(--bg-card);

            &.pos-amber { background: #f59e0b; }
            &.pos-emerald { background: #10b981; }
          }
        }

        .prospect-main-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
          min-width: 0;

          .prospect-name {
            font-size: 0.9rem;
            font-weight: 800;
            margin: 0;
            color: var(--text-heading);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .prospect-tags-row {
            display: flex;
            flex-direction: column;
            gap: 0.15rem;

            .meta-chip {
              font-size: 0.72rem;
              color: var(--text-muted);
              display: flex;
              align-items: center;
              gap: 0.35rem;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;

              i {
                font-size: 0.7rem;
                width: 12px;
                color: var(--color-primary);
              }
            }
          }
        }
      }

      .prospect-card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 0.55rem;
        border-top: 1px solid var(--border-color);

        .rating-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.78rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-xs);

          &.rating-good {
            background: rgba(59, 130, 246, 0.12);
            color: #3b82f6;
          }
          &.rating-elite {
            background: rgba(245, 158, 11, 0.15);
            color: #f59e0b;
          }
        }

        .card-quick-actions {
          display: flex;
          align-items: center;
          gap: 0.35rem;

          .btn-action-icon {
            width: 28px;
            height: 28px;
            border-radius: var(--radius-xs);
            background: var(--bg-surface);
            border: 1px solid var(--border-color);
            color: var(--text-body);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;

            &:hover {
              border-color: var(--color-primary);
              color: var(--color-primary);
            }

            &.btn-eval:hover {
              border-color: #3b82f6;
              color: #3b82f6;
            }

            &.btn-promote:hover {
              background: rgba(245, 158, 11, 0.15);
              border-color: #f59e0b;
              color: #f59e0b;
            }
          }

          .btn-fichar-mini {
            padding: 0.25rem 0.6rem;
            font-size: 0.72rem;
            font-weight: 800;
            background: #10b981;
            color: #ffffff;
            border: none;
            border-radius: var(--radius-xs);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.3rem;
            transition: all 0.2s;

            &:hover {
              background: #059669;
              transform: scale(1.02);
            }
          }
        }
      }
    }

    /* EXPEDIENTE MODAL HERO & RÚBRICAS */
    .expediente-top-hero {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.25rem;
      margin-bottom: 1.25rem;

      .hero-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid var(--color-primary);
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .hero-details {
        flex: 1;

        h3 {
          font-size: 1.2rem;
          font-weight: 800;
          margin: 0 0 0.4rem 0;
          color: var(--text-heading);
        }

        .hero-badges-row {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
      }

      .hero-score-badge {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: rgba(16, 185, 129, 0.12);
        border: 1px solid rgba(16, 185, 129, 0.3);
        padding: 0.5rem 0.85rem;
        border-radius: var(--radius-md);

        .score-num {
          font-size: 1.6rem;
          font-weight: 900;
          color: var(--color-primary);
        }

        .score-lbl {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-muted);
        }
      }
    }

    .rubricas-radar-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;

      @media (max-width: 640px) {
        grid-template-columns: 1fr;
      }

      .rubrica-pillar-card {
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 0.85rem 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        .pillar-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-heading);
        }

        .pillar-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 4px;
          overflow: hidden;

          .bar-fill {
            height: 100%;
            border-radius: 4px;

            &.bg-emerald { background: #10b981; }
            &.bg-blue { background: #3b82f6; }
            &.bg-amber { background: #f59e0b; }
            &.bg-purple { background: #a855f7; }
          }
        }
      }
    }

    .pipeline-actions-row {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
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
export class ScoutingComponent implements OnInit {
  private api = inject(ApiService);
  private catalogos = inject(CatalogosService);

  readonly posiciones = this.catalogos.posiciones;
  readonly piernasHabiles = this.catalogos.piernasHabiles;

  readonly viewMode = signal<'pipeline' | 'lista'>('pipeline');
  readonly prospectosList = signal<any[]>([]);

  readonly showCreateModal = signal<boolean>(false);
  readonly showExpedienteModal = signal<boolean>(false);
  readonly showRubricaModal = signal<boolean>(false);
  readonly showDeleteModal = signal<boolean>(false);

  readonly selectedProspecto = signal<any | null>(null);
  readonly prospectoToEvaluate = signal<any | null>(null);
  readonly prospectoToDelete = signal<any | null>(null);
  readonly toastMessage = signal<string>('');

  searchQuery: string = '';
  selectedPosicion: string = 'TODAS';
  selectedEstado: string = 'TODOS';
  selectedFile: File | null = null;

  prospectoForm = {
    nombres: '',
    apellidos: '',
    fecha_nacimiento: '2010-05-12',
    posicion_principal: 'delantero',
    pierna_habil: 'Derecha',
    club_origen: '',
    ciudad: 'Cali',
    telefono_contacto: '',
  };

  rubricaForm = {
    nota_tecnica: 8.5,
    nota_tactica: 8.0,
    nota_fisica: 8.5,
    nota_mental: 9.0,
    comentarios: '',
  };

  readonly filteredProspectos = computed(() => {
    let list = this.prospectosList();
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(p => {
        const full = `${p.nombres || ''} ${p.apellidos || ''} ${p.nombres_apellidos || ''}`.toLowerCase();
        const club = (p.club_origen || '').toLowerCase();
        const ciudad = (p.ciudad || '').toLowerCase();
        return full.includes(q) || club.includes(q) || ciudad.includes(q);
      });
    }
    if (this.selectedPosicion !== 'TODAS') {
      list = list.filter(p => p.posicion_principal === this.selectedPosicion);
    }
    if (this.selectedEstado !== 'TODOS') {
      list = list.filter(p => p.estado_pipeline === this.selectedEstado);
    }
    return list;
  });

  ngOnInit(): void {
    this.loadProspectos();
  }

  loadProspectos(): void {
    this.api.getProspectos().subscribe((data) => {
      const rawList = Array.isArray(data) ? data : (data?.data || []);
      const mapped = rawList.map((p: any) => {
        const full = p.nombres_apellidos || `${p.nombres || ''} ${p.apellidos || ''}`.trim() || 'Prospecto';
        const parts = full.split(' ');
        const nombres = p.nombres || parts[0] || 'Prospecto';
        const apellidos = p.apellidos || parts.slice(1).join(' ') || '';
        return {
          ...p,
          nombres,
          apellidos,
          nombres_apellidos: full,
          estado_pipeline: p.estado_scouting || p.estado_pipeline || 'en_observacion',
          promedio_tecnico: p.score_promedio_calculado ? Number(p.score_promedio_calculado).toFixed(1) : (p.valoracion_general || '8.5'),
          pierna_habil: p.pie_habil || p.pierna_habil || 'Derecha',
        };
      });
      this.prospectosList.set(mapped);
    });
  }

  onFilterChange(): void {
    // Computed signal updates automatically
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedPosicion = 'TODAS';
    this.selectedEstado = 'TODOS';
  }

  getProspectosByCol(estado: string): any[] {
    return this.filteredProspectos().filter(p => p.estado_pipeline === estado);
  }

  countByEstado(estado: string): number {
    return this.prospectosList().filter(p => p.estado_pipeline === estado).length;
  }

  getRatioByEstado(estado: string): number {
    const total = this.prospectosList().length;
    if (total === 0) return 0;
    const count = this.countByEstado(estado);
    return Math.round((count / total) * 100);
  }

  getGlobalTechnicalAverage(): string {
    const list = this.prospectosList();
    if (!list || list.length === 0) return '8.6';
    const sum = list.reduce((acc: number, p: any) => acc + (Number(p.promedio_tecnico) || 8.2), 0);
    return (sum / list.length).toFixed(1);
  }

  getAverageRatingPercent(): number {
    const avg = Number(this.getGlobalTechnicalAverage()) || 8.6;
    return Math.min(100, Math.round((avg / 10) * 100));
  }

  formatPosicion(pos: string): string {
    switch (pos) {
      case 'delantero': return 'Delantero (DEL)';
      case 'mediocampista': return 'Mediocampista (MED)';
      case 'defensa': return 'Defensa (DEF)';
      case 'portero': return 'Portero (POR)';
      default: return pos || 'Jugador';
    }
  }

  formatEstadoPipeline(est: string): string {
    switch (est) {
      case 'en_observacion': return 'En Observación';
      case 'interes_fichaje': return 'Interés Fichaje';
      case 'fichado': return 'Fichado';
      case 'descartado': return 'Descartado';
      default: return est;
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  openCreateProspectoModal(): void {
    this.prospectoForm = {
      nombres: '',
      apellidos: '',
      fecha_nacimiento: '2010-05-12',
      posicion_principal: 'delantero',
      pierna_habil: 'Derecha',
      club_origen: '',
      ciudad: 'Cali',
      telefono_contacto: '',
    };
    this.selectedFile = null;
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  submitProspectoForm(): void {
    if (!this.prospectoForm.nombres?.trim()) {
      this.showToast('El nombre del prospecto es obligatorio (*)');
      return;
    }
    if (!this.prospectoForm.apellidos?.trim()) {
      this.showToast('Los apellidos del prospecto son obligatorios (*)');
      return;
    }
    if (!this.prospectoForm.posicion_principal) {
      this.showToast('Selecciona la posición táctica del prospecto (*)');
      return;
    }

    const payload = {
      nombres_apellidos: `${this.prospectoForm.nombres} ${this.prospectoForm.apellidos}`.trim(),
      fecha_nacimiento: this.prospectoForm.fecha_nacimiento || '2010-05-12',
      posicion_principal: this.prospectoForm.posicion_principal || 'delantero',
      pie_habil: (this.prospectoForm.pierna_habil || 'Derecha').toLowerCase(),
      club_origen: this.prospectoForm.club_origen || null,
      telefono_contacto: this.prospectoForm.telefono_contacto || null,
      ciudad: this.prospectoForm.ciudad || null,
      estado_scouting: 'en_observacion',
    };

    this.api.createProspecto(payload).subscribe({
      next: (created) => {
        // Si adjuntó archivo, subirlo a storage
        if (this.selectedFile && created?.id) {
          this.api.uploadFile(this.selectedFile, 'scouting', 'PROSPECTO', created.id, 'DOCUMENTO_IDENTIDAD').subscribe();
        }
        this.showToast('¡Talento registrado exitosamente en el pipeline!');
        this.closeCreateModal();
        this.loadProspectos();
      },
      error: () => {
        this.showToast('Error al registrar prospecto');
      }
    });
  }

  openExpedienteModal(p: any): void {
    this.selectedProspecto.set(p);
    this.showExpedienteModal.set(true);
  }

  closeExpedienteModal(): void {
    this.showExpedienteModal.set(false);
    this.selectedProspecto.set(null);
  }

  openRubricaModal(p: any, event?: Event): void {
    if (event) event.stopPropagation();
    this.prospectoToEvaluate.set(p);
    this.rubricaForm = {
      nota_tecnica: 8.5,
      nota_tactica: 8.0,
      nota_fisica: 8.5,
      nota_mental: 9.0,
      comentarios: '',
    };
    this.showRubricaModal.set(true);
  }

  closeRubricaModal(): void {
    this.showRubricaModal.set(false);
    this.prospectoToEvaluate.set(null);
  }

  submitRubricaForm(): void {
    const prospecto = this.prospectoToEvaluate();
    if (!prospecto?.id) return;

    const nt = Number(this.rubricaForm.nota_tecnica);
    const ntc = Number(this.rubricaForm.nota_tactica);
    const nf = Number(this.rubricaForm.nota_fisica);
    const nm = Number(this.rubricaForm.nota_mental);

    if (isNaN(nt) || nt < 1 || nt > 10 || isNaN(ntc) || ntc < 1 || ntc > 10 || isNaN(nf) || nf < 1 || nf > 10 || isNaN(nm) || nm < 1 || nm > 10) {
      this.showToast('Las notas de la rúbrica deben estar entre 1.0 y 10.0');
      return;
    }

    const payload = {
      score_tecnico: nt,
      score_tactico: ntc,
      score_fisico: nf,
      score_mental: nm,
      comentarios_cualitativos: this.rubricaForm.comentarios || 'Evaluación técnica satisfactoria',
      recomendacion: 'SEGUIMIENTO_CONTINUO',
    };

    this.api.createEvaluacionProspecto(prospecto.id, payload).subscribe({
      next: () => {
        this.showToast('¡Rúbrica de evaluación guardada con éxito!');
        this.closeRubricaModal();
        this.loadProspectos();
      },
      error: () => {
        this.showToast('Error al registrar evaluación');
      }
    });
  }

  cambiarEstadoProspecto(p: any, nuevoEstado: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (!p?.id) return;

    this.api.updateProspecto(p.id, { estado_scouting: nuevoEstado }).subscribe({
      next: () => {
        this.showToast(`Estado actualizado a ${this.formatEstadoPipeline(nuevoEstado)}`);
        this.loadProspectos();
        if (this.selectedProspecto()) {
          this.selectedProspecto.update(curr => curr ? { ...curr, estado_pipeline: nuevoEstado } : null);
        }
      },
      error: () => {
        this.showToast('Error al actualizar estado del prospecto');
      }
    });
  }

  openDeleteModal(p: any): void {
    this.prospectoToDelete.set(p);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.prospectoToDelete.set(null);
  }

  confirmarEliminarProspecto(): void {
    const p = this.prospectoToDelete();
    if (!p?.id) return;

    this.api.deleteProspecto(p.id).subscribe({
      next: () => {
        this.showToast('Prospecto eliminado del pipeline');
        this.closeDeleteModal();
        this.loadProspectos();
      },
      error: () => {
        this.showToast('Error al eliminar prospecto');
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

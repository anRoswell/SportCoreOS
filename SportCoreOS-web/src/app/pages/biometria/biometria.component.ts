import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PlayerSelectorComponent } from '../../shared/components/player-selector/player-selector.component';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';

export interface EvaluacionBiometrica {
  id: string;
  jugador_id: string;
  evaluador_id?: string;
  fecha_evaluacion: string;
  peso_kg: number;
  talla_cm: number;
  imc: string;
  test_cooper_metros?: number;
  velocidad_30m_seg?: number;
  salto_vertical_cm?: number;
  observaciones?: string;
  jugador_nombre: string;
  numero_dorsal?: number;
  posicion_principal?: string;
  categoria_id?: string;
  categoria_nombre?: string;
  codigo_categoria?: string;
  color_distintivo?: string;
  avatar_url?: string;
}

@Component({
  selector: 'app-biometria',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayerSelectorComponent, FlatpickrDirective],
  template: `
    <div class="biometria-page">
      <!-- HEADER DE LA PÁGINA -->
      <div class="page-header">
        <div class="header-titles">
          <div class="header-badge">
            <i class="fa-solid fa-heart-pulse"></i>
            <span>MÓDULO DE RENDIMIENTO & FISIOLOGÍA</span>
          </div>
          <h1 class="page-title">Biometría Deportiva & Test Físicos</h1>
          <p class="page-subtitle">
            Control antropométrico periódico, test de Cooper, velocidad anaeróbica y radar de aptitud atlética.
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" (click)="openCreateModal()">
            <i class="fa-solid fa-plus"></i>
            <span>Nueva Medición Antropométrica</span>
          </button>
        </div>
      </div>

      <!-- TARJETAS DE KPIs RÁPIDOS -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon emerald"><i class="fa-solid fa-clipboard-check"></i></div>
          <div class="kpi-info">
            <span class="kpi-value">{{ totalEvaluaciones() }}</span>
            <span class="kpi-label">Evaluaciones Registradas</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon blue"><i class="fa-solid fa-users"></i></div>
          <div class="kpi-info">
            <span class="kpi-value">{{ atletasMonitoreadosCount() }}</span>
            <span class="kpi-label">Deportistas Monitoreados</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon purple"><i class="fa-solid fa-gauge-high"></i></div>
          <div class="kpi-info">
            <span class="kpi-value">{{ promedioImc() }}</span>
            <span class="kpi-label">IMC Promedio Plantel</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon amber"><i class="fa-solid fa-medal"></i></div>
          <div class="kpi-info">
            <span class="kpi-value">{{ sobresalientesCount() }}</span>
            <span class="kpi-label">Nivel Sobresaliente</span>
          </div>
        </div>
      </div>

      <!-- BARRA DE FILTROS REACTIVOS & BÚSQUEDA -->
      <div class="filters-card">
        <div class="filters-top">
          <!-- Buscador de texto -->
          <div class="search-box">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input 
              type="text" 
              [ngModel]="searchQuery()" 
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar por jugador, dorsal o notas del PF..." 
              class="search-input" />
            @if (searchQuery()) {
              <button class="clear-search-btn" (click)="clearSearch()">
                <i class="fa-solid fa-xmark"></i>
              </button>
            }
          </div>

          <!-- Filtro por Diagnóstico / Nivel -->
          <div class="filter-select-wrap">
            <select [ngModel]="selectedDiagnostico()" (ngModelChange)="onDiagnosticoChange($event)" class="filter-select">
              <option value="TODOS">⚡ Todos los Diagnósticos</option>
              <option value="SOBRESALIENTE">🌟 Sobresaliente (Cooper ≥ 2800m)</option>
              <option value="OPTIMO">✅ Óptimo (Cooper ≥ 2400m)</option>
              <option value="DESARROLLO">📈 En Desarrollo (Cooper < 2400m)</option>
            </select>
            <i class="fa-solid fa-chevron-down select-chevron"></i>
          </div>

          <!-- Ordenamiento -->
          <div class="filter-select-wrap">
            <select [ngModel]="sortBy()" (ngModelChange)="onSortChange($event)" class="filter-select">
              <option value="FECHA_DESC">📅 Más Recientes Primero</option>
              <option value="FECHA_ASC">📅 Más Antiguas Primero</option>
              <option value="COOPER_DESC">🏃 Mayor Test Cooper</option>
              <option value="SALTO_DESC">🦘 Mayor Salto Vertical</option>
              <option value="TALLA_DESC">📏 Mayor Estatura</option>
              <option value="IMC_ASC">⚖️ Menor IMC</option>
            </select>
            <i class="fa-solid fa-chevron-down select-chevron"></i>
          </div>

          <!-- Botón de Limpiar Filtros -->
          @if (hasActiveFilters()) {
            <button class="btn-clear-all-filters" (click)="resetAllFilters()" title="Restablecer todos los filtros">
              <i class="fa-solid fa-filter-circle-xmark"></i>
              <span>Restablecer</span>
            </button>
          }
        </div>

        <!-- Categorías Pills Bar -->
        <div class="category-pills">
          <button 
            class="pill" 
            [class.active]="selectedCategoriaId() === 'TODAS'"
            (click)="selectCategoria('TODAS')">
            <span>Todas las Categorías</span>
            <span class="pill-count">({{ totalRecords() }})</span>
          </button>
          @for (cat of categorias(); track cat.id) {
            <button 
              class="pill" 
              [class.active]="selectedCategoriaId() === cat.id"
              (click)="selectCategoria(cat.id)">
              <span class="cat-dot" [style.background-color]="cat.color_distintivo || '#10B981'"></span>
              <span>{{ cat.nombre }}</span>
              <span class="pill-count">({{ getCategoryCount(cat.id) }})</span>
            </button>
          }
        </div>
      </div>

      <!-- TABLA DE EVALUACIONES CON LAZY LOADING & PAGINACIÓN -->
      <div class="fut-table-container">
        @if (loading()) {
          <div class="loading-state">
            <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
            <p>Cargando evaluaciones antropométricas y físicas...</p>
          </div>
        } @else if (filteredMediciones().length === 0) {
          <div class="empty-state">
            <div class="empty-icon"><i class="fa-solid fa-heart-pulse"></i></div>
            <h3>No se encontraron evaluaciones</h3>
            <p>No hay mediciones antropométricas que coincidan con los filtros seleccionados.</p>
            <div class="empty-actions">
              @if (hasActiveFilters()) {
                <button class="btn-secondary" (click)="resetAllFilters()">
                  <i class="fa-solid fa-rotate-left"></i> Restablecer Filtros
                </button>
              }
              <button class="btn-primary" (click)="openCreateModal()">
                <i class="fa-solid fa-plus"></i> Registrar Primera Medición
              </button>
            </div>
          </div>
        } @else {
          <table class="fut-table">
            <thead>
              <tr>
                <th>Deportista / Dorsal</th>
                <th>Categoría</th>
                <th>Fecha Medición</th>
                <th>Estatura</th>
                <th>Peso</th>
                <th>IMC</th>
                <th>Test Cooper</th>
                <th>Sprint 30m</th>
                <th>Salto Vertical</th>
                <th>Diagnóstico</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (b of paginatedMediciones(); track b.id) {
                <tr class="bio-row" (click)="openDetailModal(b)">
                  <td>
                    <div class="player-cell">
                      <div class="player-avatar-mini">
                        <img [src]="b.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80'" [alt]="b.jugador_nombre" />
                        @if (b.numero_dorsal) {
                          <span class="dorsal-tag">#{{ b.numero_dorsal }}</span>
                        }
                      </div>
                      <div class="player-text">
                        <strong class="player-name">{{ b.jugador_nombre }}</strong>
                        <small class="player-pos">{{ b.posicion_principal || 'Posición por asignar' }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="badge badge-blue">
                      {{ b.categoria_nombre || 'Categoría' }}
                    </span>
                  </td>
                  <td>
                    <div class="date-cell">
                      <i class="fa-regular fa-calendar"></i>
                      <span>{{ b.fecha_evaluacion | date:'dd/MM/yyyy' }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="measurement-val"><strong>{{ b.talla_cm }}</strong> <small>cm</small></span>
                  </td>
                  <td>
                    <span class="measurement-val"><strong>{{ b.peso_kg }}</strong> <small>kg</small></span>
                  </td>
                  <td>
                    <div class="imc-cell">
                      <strong class="imc-number">{{ b.imc }}</strong>
                      <span class="imc-status" [class]="getImcClass(b.imc)">{{ getImcLabel(b.imc) }}</span>
                    </div>
                  </td>
                  <td>
                    @if (b.test_cooper_metros) {
                      <span class="badge-cooper" [class.high]="b.test_cooper_metros >= 2800" [class.med]="b.test_cooper_metros >= 2400 && b.test_cooper_metros < 2800">
                        <i class="fa-solid fa-person-running"></i>
                        {{ b.test_cooper_metros }} m
                      </span>
                    } @else {
                      <span class="text-muted-dash">-</span>
                    }
                  </td>
                  <td>
                    @if (b.velocidad_30m_seg) {
                      <span class="metric-chip">
                        <i class="fa-solid fa-bolt"></i>
                        {{ b.velocidad_30m_seg }} s
                      </span>
                    } @else {
                      <span class="text-muted-dash">-</span>
                    }
                  </td>
                  <td>
                    @if (b.salto_vertical_cm) {
                      <span class="metric-chip">
                        <i class="fa-solid fa-arrows-up-down"></i>
                        {{ b.salto_vertical_cm }} cm
                      </span>
                    } @else {
                      <span class="text-muted-dash">-</span>
                    }
                  </td>
                  <td>
                    <span class="badge" [class.badge-success]="getDiagnostico(b).tipo === 'success'" [class.badge-blue]="getDiagnostico(b).tipo === 'blue'" [class.badge-warning]="getDiagnostico(b).tipo === 'warning'">
                      {{ getDiagnostico(b).label }}
                    </span>
                  </td>
                  <td class="text-right" (click)="$event.stopPropagation()">
                    <div class="table-actions">
                      <button class="action-btn btn-view" (click)="openDetailModal(b)" title="Ver Radar & Ficha Biométrica">
                        <i class="fa-solid fa-chart-pie"></i>
                        <span>Radar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

          <!-- BARRA DE PAGINACIÓN COMPLETA -->
          <div class="pagination-bar">
            <div class="pagination-info">
              <span>Mostrando <strong>{{ showingStart() }} - {{ showingEnd() }}</strong> de <strong>{{ totalFilteredCount() }}</strong> evaluaciones</span>
              <div class="page-size-selector">
                <label>Por página:</label>
                <select [ngModel]="pageSize()" (ngModelChange)="setPageSize($event)" class="page-size-select">
                  <option [value]="5">5</option>
                  <option [value]="10">10</option>
                  <option [value]="20">20</option>
                  <option [value]="50">50</option>
                </select>
              </div>
            </div>

            <div class="pagination-controls">
              <button 
                class="page-btn nav-btn" 
                [disabled]="currentPage() === 1" 
                (click)="setPage(1)" 
                title="Primera Página">
                <i class="fa-solid fa-angles-left"></i>
              </button>
              <button 
                class="page-btn nav-btn" 
                [disabled]="currentPage() === 1" 
                (click)="prevPage()" 
                title="Página Anterior">
                <i class="fa-solid fa-angle-left"></i>
                <span>Anterior</span>
              </button>

              <div class="page-numbers">
                @for (p of getVisiblePages(); track p) {
                  <button 
                    class="page-btn num-btn" 
                    [class.active]="currentPage() === p" 
                    (click)="setPage(p)">
                    {{ p }}
                  </button>
                }
              </div>

              <button 
                class="page-btn nav-btn" 
                [disabled]="currentPage() === totalPages()" 
                (click)="nextPage()" 
                title="Página Siguiente">
                <span>Siguiente</span>
                <i class="fa-solid fa-angle-right"></i>
              </button>
              <button 
                class="page-btn nav-btn" 
                [disabled]="currentPage() === totalPages()" 
                (click)="setPage(totalPages())" 
                title="Última Página">
                <i class="fa-solid fa-angles-right"></i>
              </button>
            </div>
          </div>
        }
      </div>

      <!-- MODAL DETALLE / RADAR BIOMÉTRICO -->
      @if (showDetailModal() && selectedMedicion()) {
        <div class="modal-overlay" (click)="closeDetailModal()">
          <div class="modal-card modal-xl" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-chart-line"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Ficha Antropométrica & Radar Físico</h2>
                  <p class="modal-subtitle">
                    {{ selectedMedicion()?.jugador_nombre }} • {{ selectedMedicion()?.categoria_nombre }}
                  </p>
                </div>
              </div>
              <button class="btn-close" (click)="closeDetailModal()" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div class="modal-body modal-body-detail">
              <!-- Resumen del Atleta -->
              <div class="detail-header-card">
                <div class="athlete-badge-row">
                  <div class="athlete-avatar-lg">
                    <img [src]="selectedMedicion()?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'" alt="Avatar" />
                  </div>
                  <div class="athlete-info-col">
                    <h3>{{ selectedMedicion()?.jugador_nombre }}</h3>
                    <div class="tags-row">
                      <span class="badge badge-blue">{{ selectedMedicion()?.categoria_nombre }}</span>
                      <span class="badge badge-dark">#{{ selectedMedicion()?.numero_dorsal || '-' }} • {{ selectedMedicion()?.posicion_principal }}</span>
                      <span class="badge" [class.badge-success]="getDiagnostico(selectedMedicion()).tipo === 'success'" [class.badge-blue]="getDiagnostico(selectedMedicion()).tipo === 'blue'" [class.badge-warning]="getDiagnostico(selectedMedicion()).tipo === 'warning'">
                        {{ getDiagnostico(selectedMedicion()).label }}
                      </span>
                    </div>
                  </div>
                  <div class="eval-date-badge">
                    <i class="fa-regular fa-calendar"></i>
                    <span>Evaluado el {{ selectedMedicion()?.fecha_evaluacion | date:'dd MMMM yyyy' }}</span>
                  </div>
                </div>
              </div>

              <!-- Grid de Métricas Antropométricas y Rendimiento en 2 Columnas Widescreen -->
              <div class="modal-form-grid-2col">
                <!-- Tarjeta Antropometría -->
                <div class="metric-box">
                  <div class="metric-box-header">
                    <i class="fa-solid fa-weight-scale"></i>
                    <span>Composición Corporal</span>
                  </div>
                  <div class="metric-box-content">
                    <div class="stat-row">
                      <span class="stat-label">Estatura / Talla:</span>
                      <strong class="stat-val">{{ selectedMedicion()?.talla_cm }} cm</strong>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">Peso Corporal:</span>
                      <strong class="stat-val">{{ selectedMedicion()?.peso_kg }} kg</strong>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">Índice Masa Corporal:</span>
                      <strong class="stat-val highlight">{{ selectedMedicion()?.imc }} ({{ getImcLabel(selectedMedicion()?.imc) }})</strong>
                    </div>
                  </div>
                </div>

                <!-- Tarjeta Batería de Tests -->
                <div class="metric-box">
                  <div class="metric-box-header">
                    <i class="fa-solid fa-gauge-high"></i>
                    <span>Pruebas Físicas & Tests</span>
                  </div>
                  <div class="metric-box-content">
                    <div class="stat-row">
                      <span class="stat-label">Test de Cooper:</span>
                      <strong class="stat-val">{{ selectedMedicion()?.test_cooper_metros ? selectedMedicion()?.test_cooper_metros + ' m' : 'No registrado' }}</strong>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">Velocidad Sprint 30m:</span>
                      <strong class="stat-val">{{ selectedMedicion()?.velocidad_30m_seg ? selectedMedicion()?.velocidad_30m_seg + ' s' : 'No registrado' }}</strong>
                    </div>
                    <div class="stat-row">
                      <span class="stat-label">Salto Vertical Pliométrico:</span>
                      <strong class="stat-val">{{ selectedMedicion()?.salto_vertical_cm ? selectedMedicion()?.salto_vertical_cm + ' cm' : 'No registrado' }}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Observaciones del Preparador Físico -->
              <div class="detail-section">
                <h4><i class="fa-solid fa-notes-medical"></i> Dictamen & Observaciones Fisiológicas</h4>
                <div class="observations-box">
                  <p>{{ selectedMedicion()?.observaciones || 'Sin observaciones adicionales registradas por el cuerpo técnico.' }}</p>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-primary" (click)="closeDetailModal()">
                <i class="fa-solid fa-check"></i> Entendido / Cerrar
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL NUEVA MEDICIÓN -->
      @if (showCreateModal()) {
        <div class="modal-overlay" (click)="closeCreateModal()">
          <div class="modal-card modal-xl" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-heart-pulse"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Nueva Evaluación Antropométrica & Test Físico</h2>
                  <p class="modal-subtitle">Registro de somatotipo, antropometría y rendimiento atlético</p>
                </div>
              </div>
              <button class="btn-close" (click)="closeCreateModal()" aria-label="Cerrar"><i class="fa-solid fa-xmark"></i></button>
            </div>

            <form (ngSubmit)="submitCreateBio()" class="modal-form">
              <div class="modal-form-grid-2col">
                <!-- Columna Izquierda: Deportista + Antropometría Básica -->
                <div class="modal-col">
                  <div class="modal-section">
                    <span class="modal-section-title"><i class="fa-solid fa-user-tag"></i> 1. Datos del Deportista & Fecha</span>
                    <div class="form-row g2">
                      <div class="input-group">
                        <app-player-selector
                          [(selectedId)]="newBio.jugadorId"
                          [players]="jugadores()"
                          [label]="'Deportista / Jugador'"
                          [required]="true"
                          [placeholder]="'Buscar por nombre, documento, género...'"
                        ></app-player-selector>
                      </div>
                      <div class="input-group">
                        <label><i class="fa-regular fa-calendar"></i> Fecha de Evaluación <span class="required-star">*</span></label>
                        <input type="text" appFlatpickr placeholder="dd/mm/aaaa" [(ngModel)]="newBio.fechaEvaluacion" name="fechaEvaluacion" class="sport-input" required />
                      </div>
                    </div>
                  </div>

                  <div class="modal-section">
                    <span class="modal-section-title"><i class="fa-solid fa-weight-scale"></i> 2. Antropometría Básica</span>
                    <div class="form-row g3">
                      <div class="input-group">
                        <label><i class="fa-solid fa-weight-hanging"></i> Peso (kg) <span class="required-star">*</span></label>
                        <input type="number" step="0.1" [(ngModel)]="newBio.pesoKg" (ngModelChange)="calcularImc()" name="pesoKg" placeholder="ej. 58.5" class="sport-input" required />
                      </div>
                      <div class="input-group">
                        <label><i class="fa-solid fa-ruler-vertical"></i> Talla (cm) <span class="required-star">*</span></label>
                        <input type="number" step="0.5" [(ngModel)]="newBio.tallaCm" (ngModelChange)="calcularImc()" name="tallaCm" placeholder="ej. 170.0" class="sport-input" required />
                      </div>
                      <div class="input-group">
                        <label><i class="fa-solid fa-calculator"></i> IMC Calculado</label>
                        <input type="text" [value]="calculatedImc()" class="sport-input readonly-input" readonly />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Columna Derecha: Batería de Pruebas Físicas + Observaciones -->
                <div class="modal-col">
                  <div class="modal-section">
                    <span class="modal-section-title"><i class="fa-solid fa-gauge-high"></i> 3. Batería de Pruebas Físicas</span>
                    <div class="form-row g3">
                      <div class="input-group">
                        <label><i class="fa-solid fa-person-running"></i> Test Cooper (m)</label>
                        <input type="number" [(ngModel)]="newBio.testCooperMetros" name="testCooperMetros" placeholder="ej. 2800" class="sport-input" />
                      </div>
                      <div class="input-group">
                        <label><i class="fa-solid fa-bolt"></i> Sprint 30m (s)</label>
                        <input type="number" step="0.01" [(ngModel)]="newBio.velocidad30mSeg" name="velocidad30mSeg" placeholder="ej. 4.15" class="sport-input" />
                      </div>
                      <div class="input-group">
                        <label><i class="fa-solid fa-arrows-up-down"></i> Salto Vert. (cm)</label>
                        <input type="number" step="0.5" [(ngModel)]="newBio.saltoVerticalCm" name="saltoVerticalCm" placeholder="ej. 45.0" class="sport-input" />
                      </div>
                    </div>
                  </div>

                  <div class="modal-section">
                    <span class="modal-section-title"><i class="fa-solid fa-clipboard-user"></i> 4. Observaciones & Diagnóstico</span>
                    <div class="input-group">
                      <label><i class="fa-solid fa-comment-medical"></i> Observaciones del Preparador Físico</label>
                      <textarea [(ngModel)]="newBio.observaciones" name="observaciones" rows="2" placeholder="ej. Excelente respuesta cardiovascular y potencia muscular" class="sport-input textarea-input"></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="closeCreateModal()">
                  <i class="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button type="submit" class="btn-primary" [disabled]="saving()">
                  @if (saving()) {
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <span>Guardando...</span>
                  } @else {
                    <i class="fa-solid fa-floppy-disk"></i>
                    <span>Guardar Evaluación</span>
                  }
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
    .biometria-page {
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

      .header-titles {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .header-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.725rem;
        font-weight: 800;
        letter-spacing: 0.05em;
        color: var(--color-primary);
        background: rgba(16, 185, 129, 0.1);
        padding: 0.25rem 0.65rem;
        border-radius: var(--radius-full);
        width: fit-content;
      }

      .page-title {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--text-heading);
        margin: 0;
      }

      .page-subtitle {
        color: var(--text-body);
        font-size: 0.85rem;
        margin: 0;
      }
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }

    .kpi-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.15rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--color-primary);
      }

      .kpi-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.35rem;

        &.emerald { background: rgba(16, 185, 129, 0.12); color: #10b981; }
        &.blue { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }
        &.purple { background: rgba(168, 85, 247, 0.12); color: #a855f7; }
        &.amber { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
      }

      .kpi-info {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;

        .kpi-value {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--text-heading);
          line-height: 1.1;
        }

        .kpi-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
        }
      }
    }

    /* Filters Card */
    .filters-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      box-shadow: var(--shadow-sm);
    }

    .filters-top {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .search-box {
      flex: 1;
      min-width: 250px;
      position: relative;
      display: flex;
      align-items: center;

      .search-icon {
        position: absolute;
        left: 0.85rem;
        color: var(--text-muted);
        font-size: 0.85rem;
        pointer-events: none;
      }

      .search-input {
        width: 100%;
        padding: 0.55rem 2rem 0.55rem 2.25rem;
        background: var(--bg-input);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        color: var(--text-main);
        font-size: 0.85rem;
        outline: none;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;

        &:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-glow);
        }
      }

      .clear-search-btn {
        position: absolute;
        right: 0.65rem;
        background: transparent;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.2rem;
        font-size: 0.8rem;

        &:hover { color: var(--text-main); }
      }
    }

    .filter-select-wrap {
      position: relative;
      display: flex;
      align-items: center;

      .filter-select {
        background: var(--bg-input);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 0.55rem 2rem 0.55rem 0.85rem;
        color: var(--text-main);
        font-size: 0.825rem;
        font-weight: 600;
        outline: none;
        appearance: none;
        cursor: pointer;
        min-width: 190px;

        &:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-glow);
        }
      }

      .select-chevron {
        position: absolute;
        right: 0.75rem;
        color: var(--text-muted);
        font-size: 0.75rem;
        pointer-events: none;
      }
    }

    .btn-clear-all-filters {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #ef4444;
      padding: 0.5rem 0.85rem;
      border-radius: var(--radius-md);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: #ef4444;
        color: #ffffff;
      }
    }

    /* Category Pills */
    .category-pills {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;

      .pill {
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-full);
        padding: 0.35rem 0.75rem;
        font-size: 0.775rem;
        font-weight: 600;
        color: var(--text-body);
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s ease;

        &:hover {
          background: var(--bg-card-hover);
          border-color: var(--color-primary);
        }

        &.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: #ffffff;

          .cat-dot {
            background: #ffffff !important;
          }

          .pill-count {
            background: rgba(255, 255, 255, 0.25);
            color: #ffffff;
          }
        }

        .cat-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .pill-count {
          font-size: 0.7rem;
          background: var(--bg-card);
          padding: 0.1rem 0.4rem;
          border-radius: var(--radius-full);
          color: var(--text-muted);
        }
      }
    }

    /* Table Container & States */
    .fut-table-container {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow-x: auto;
      box-shadow: var(--shadow-sm);
    }

    .loading-state, .empty-state {
      padding: 3.5rem 2rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-muted);

      i { color: var(--color-primary); }
    }

    .empty-state {
      .empty-icon {
        font-size: 2.5rem;
        color: var(--color-primary);
        background: rgba(16, 185, 129, 0.1);
        width: 70px;
        height: 70px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 0.5rem;
      }

      h3 {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-heading);
        margin: 0;
      }

      p {
        font-size: 0.85rem;
        color: var(--text-muted);
        max-width: 420px;
        margin: 0;
      }

      .empty-actions {
        display: flex;
        gap: 0.75rem;
        margin-top: 0.5rem;
      }
    }

    .fut-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.85rem;

      thead th {
        background: var(--bg-surface);
        color: var(--text-muted);
        font-weight: 700;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        padding: 0.85rem 1rem;
        border-bottom: 1px solid var(--border-color);
      }

      tbody tr {
        border-bottom: 1px solid var(--border-color);
        transition: background-color 0.15s ease;
        cursor: pointer;

        &:hover {
          background: var(--bg-card-hover);
        }

        &:last-child {
          border-bottom: none;
        }

        td {
          padding: 0.85rem 1rem;
          color: var(--text-main);
          vertical-align: middle;
        }
      }
    }

    .player-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .player-avatar-mini {
        position: relative;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .dorsal-tag {
          position: absolute;
          bottom: -4px;
          right: -4px;
          background: var(--color-primary);
          color: #ffffff;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.05rem 0.35rem;
          border-radius: var(--radius-full);
          border: 1.5px solid var(--bg-card);
        }
      }

      .player-text {
        display: flex;
        flex-direction: column;
        gap: 0.1rem;

        .player-name {
          font-size: 0.875rem;
          color: var(--text-heading);
        }

        .player-pos {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      }
    }

    .date-cell {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.825rem;
      color: var(--text-body);

      i { color: var(--color-primary); }
    }

    .measurement-val {
      font-size: 0.875rem;
      strong { color: var(--text-heading); }
      small { color: var(--text-muted); font-size: 0.75rem; }
    }

    .imc-cell {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;

      .imc-number {
        font-size: 0.9rem;
        color: var(--text-heading);
      }

      .imc-status {
        font-size: 0.7rem;
        font-weight: 700;

        &.normal { color: #10b981; }
        &.bajo { color: #3b82f6; }
        &.sobrepeso { color: #f59e0b; }
      }
    }

    .badge-cooper {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-full);
      font-weight: 700;
      font-size: 0.78rem;

      &.high {
        background: rgba(16, 185, 129, 0.15);
        color: #059669;
        font-weight: 800;
      }

      &.med {
        background: rgba(59, 130, 246, 0.1);
        color: #2563eb;
      }
    }

    .metric-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.825rem;
      font-weight: 700;
      color: var(--text-main);

      i { color: var(--color-primary); font-size: 0.75rem; }
    }

    .text-muted-dash {
      color: var(--text-dim);
    }

    .table-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-md);
      font-size: 0.775rem;
      font-weight: 700;
      cursor: pointer;
      border: 1px solid transparent;
      transition: all 0.2s ease;

      &.btn-view {
        background: rgba(59, 130, 246, 0.1);
        border-color: rgba(59, 130, 246, 0.3);
        color: #3b82f6;

        &:hover {
          background: #3b82f6;
          color: #ffffff;
        }
      }
    }

    /* Pagination Bar */
    .pagination-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1.25rem;
      border-top: 1px solid var(--border-color);
      flex-wrap: wrap;
      gap: 1rem;
      background: var(--bg-surface);
    }

    .pagination-info {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      font-size: 0.825rem;
      color: var(--text-body);

      .page-size-selector {
        display: flex;
        align-items: center;
        gap: 0.4rem;

        label {
          font-size: 0.775rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .page-size-select {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          padding: 0.25rem 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-main);
          outline: none;
        }
      }
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }

    .page-btn {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.35rem 0.65rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.15s ease;

      &:hover:not(:disabled) {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      &.num-btn {
        min-width: 32px;
        justify-content: center;

        &.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: #ffffff;
          font-weight: 800;
        }
      }
    }

    .page-numbers {
      display: flex;
      gap: 0.25rem;
    }

    /* MODAL DETALLE RADAR */
    .modal-body-detail {
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .detail-header-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.75rem 1rem;

      .athlete-badge-row {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .athlete-avatar-lg {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid var(--color-primary);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .athlete-info-col {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;

        h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-heading);
          margin: 0;
        }

        .tags-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
      }

      .eval-date-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.775rem;
        color: var(--text-muted);
        background: var(--bg-card);
        padding: 0.4rem 0.75rem;
        border-radius: var(--radius-full);
        border: 1px solid var(--border-color);
      }
    }

    .metrics-comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;

      @media (max-width: 768px) {
        grid-template-columns: 1fr;
      }
    }

    .metric-box {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      overflow: hidden;

      .metric-box-header {
        background: var(--bg-surface);
        padding: 0.65rem 1rem;
        border-bottom: 1px solid var(--border-color);
        font-weight: 700;
        font-size: 0.825rem;
        color: var(--text-heading);
        display: flex;
        align-items: center;
        gap: 0.5rem;

        i { color: var(--color-primary); }
      }

      .metric-box-content {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.65rem;

        .stat-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;

          .stat-label {
            color: var(--text-muted);
          }

          .stat-val {
            color: var(--text-heading);

            &.highlight {
              color: var(--color-primary);
            }
          }
        }
      }
    }

    .detail-section {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      h4 {
        font-size: 0.875rem;
        font-weight: 700;
        color: var(--text-heading);
        margin: 0;
        display: flex;
        align-items: center;
        gap: 0.4rem;

        i { color: var(--color-primary); }
      }

      .observations-box {
        background: var(--bg-surface);
        border: 1px dashed var(--border-color);
        border-radius: var(--radius-md);
        padding: 0.85rem 1.15rem;
        font-size: 0.85rem;
        color: var(--text-body);
        line-height: 1.45;

        p { margin: 0; }
      }
    }

    /* MODAL FORM */
    .readonly-input {
      background: var(--bg-card);
      color: var(--color-primary);
      font-weight: 800;
    }

    .textarea-input {
      resize: vertical;
      font-family: inherit;
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

    .badge-dark {
      background: rgba(148, 163, 184, 0.15);
      color: var(--text-main);
      border: 1px solid var(--border-color);
    }
  `]
})
export class BiometriaComponent implements OnInit {
  private api = inject(ApiService);

  readonly mediciones = signal<EvaluacionBiometrica[]>([]);
  readonly categorias = signal<any[]>([]);
  readonly jugadores = signal<any[]>([]);
  readonly loading = signal<boolean>(false);
  readonly saving = signal<boolean>(false);

  // Filtros
  readonly searchQuery = signal<string>('');
  readonly selectedCategoriaId = signal<string>('TODAS');
  readonly selectedDiagnostico = signal<string>('TODOS');
  readonly sortBy = signal<string>('FECHA_DESC');

  // Paginación
  readonly currentPage = signal<number>(1);
  readonly pageSize = signal<number>(10);

  // Modales
  readonly showCreateModal = signal<boolean>(false);
  readonly showDetailModal = signal<boolean>(false);
  readonly selectedMedicion = signal<EvaluacionBiometrica | null>(null);

  readonly toastMessage = signal<string>('');
  readonly calculatedImc = signal<string>('-');

  newBio = {
    jugadorId: '',
    fechaEvaluacion: new Date().toISOString().split('T')[0],
    pesoKg: 58.5,
    tallaCm: 170.0,
    testCooperMetros: 2800,
    velocidad30mSeg: 4.15,
    saltoVerticalCm: 45.0,
    observaciones: '',
  };

  // KPIs
  readonly totalEvaluaciones = computed(() => this.totalRecords());

  readonly promedioImc = computed(() => {
    const list = this.mediciones();
    if (!list || !Array.isArray(list) || list.length === 0) return '0.0';
    const sum = list.reduce((acc, m) => acc + (parseFloat(m.imc) || 0), 0);
    return (sum / list.length).toFixed(1);
  });

  readonly sobresalientesCount = computed(() => {
    const list = this.mediciones();
    if (!list || !Array.isArray(list)) return 0;
    return list.filter((m) => this.getDiagnostico(m).tipo === 'success').length;
  });

  readonly atletasMonitoreadosCount = computed(() => {
    const list = this.mediciones();
    if (!list || !Array.isArray(list)) return 0;
    const uniqueIds = new Set(list.map((m) => m.jugador_id));
    return uniqueIds.size;
  });

  // Filtros Activos
  readonly hasActiveFilters = computed(() => {
    return (
      this.searchQuery().trim() !== '' ||
      this.selectedCategoriaId() !== 'TODAS' ||
      this.selectedDiagnostico() !== 'TODOS' ||
      this.sortBy() !== 'FECHA_DESC'
    );
  });

  // Lista Filtrada y Ordenada
  // Paginación y Totales Server-Side
  totalRecords = signal<number>(0);
  totalPages = signal<number>(1);

  // Lista visible (cargada página a página desde la BD)
  readonly filteredMediciones = computed(() => this.mediciones());
  readonly paginatedMediciones = computed(() => this.mediciones());
  readonly totalFilteredCount = computed(() => this.totalRecords());

  readonly showingStart = computed(() => {
    return this.totalRecords() === 0 ? 0 : (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly showingEnd = computed(() => {
    return Math.min(this.currentPage() * this.pageSize(), this.totalRecords());
  });

  ngOnInit(): void {
    this.loadData();
    this.loadAuxData();
  }

  loadAuxData(): void {
    this.api.getCategorias().subscribe((cats) => {
      this.categorias.set(cats || []);
    });

    this.api.getJugadores().subscribe((res) => {
      let jugs: any[] = [];
      if (Array.isArray(res)) {
        jugs = res;
      } else if (res && Array.isArray(res.data)) {
        jugs = res.data;
      }
      this.jugadores.set(jugs);
      if (jugs && jugs.length > 0 && !this.newBio.jugadorId) {
        this.newBio.jugadorId = jugs[0].id;
      }
    });
  }

  loadData(): void {
    this.loading.set(true);
    this.api
      .getBiometria(
        this.currentPage(),
        this.pageSize(),
        this.searchQuery(),
        this.selectedCategoriaId(),
        this.selectedDiagnostico(),
        this.sortBy(),
      )
      .subscribe({
        next: (res) => {
          let rows: EvaluacionBiometrica[] = [];
          let total = 0;
          let totalPages = 1;

          if (Array.isArray(res)) {
            rows = res;
            total = res.length;
            totalPages = Math.max(1, Math.ceil(total / this.pageSize()));
          } else if (res && typeof res === 'object') {
            if (Array.isArray(res.data)) {
              rows = res.data;
              total = typeof res.total === 'number' ? res.total : rows.length;
              totalPages = typeof res.totalPages === 'number' ? res.totalPages : Math.max(1, Math.ceil(total / this.pageSize()));
            } else if (res.data && Array.isArray(res.data.data)) {
              rows = res.data.data;
              total = typeof res.data.total === 'number' ? res.data.total : rows.length;
              totalPages = typeof res.data.totalPages === 'number' ? res.data.totalPages : Math.max(1, Math.ceil(total / this.pageSize()));
            }
          }

          this.mediciones.set(rows);
          this.totalRecords.set(total);
          this.totalPages.set(totalPages);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error cargando biometría:', err);
          this.mediciones.set([]);
          this.totalRecords.set(0);
          this.totalPages.set(1);
          this.loading.set(false);
        },
      });
  }

  private searchDebounceTimer?: any;
  onSearchChange(val: string): void {
    this.searchQuery.set(val);
    this.currentPage.set(1);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.loadData();
    }, 300);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadData();
  }

  selectCategoria(catId: string): void {
    this.selectedCategoriaId.set(catId);
    this.currentPage.set(1);
    this.loadData();
  }

  onDiagnosticoChange(diag: string): void {
    this.selectedDiagnostico.set(diag);
    this.currentPage.set(1);
    this.loadData();
  }

  onSortChange(sort: string): void {
    this.sortBy.set(sort);
    this.loadData();
  }

  resetAllFilters(): void {
    this.searchQuery.set('');
    this.selectedCategoriaId.set('TODAS');
    this.selectedDiagnostico.set('TODOS');
    this.sortBy.set('FECHA_DESC');
    this.currentPage.set(1);
    this.loadData();
  }

  // Paginación
  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadData();
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
      this.loadData();
    }
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
      this.loadData();
    }
  }

  setPageSize(size: number): void {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
    this.loadData();
  }

  getVisiblePages(): number[] {
    const total = this.totalPages();
    const current = this.currentPage();
    const delta = 2;
    const range: number[] = [];

    for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
      range.push(i);
    }
    return range;
  }

  getCategoryCount(catId: string): number {
    const list = this.mediciones();
    if (!list || !Array.isArray(list)) return 0;
    return list.filter((m) => m.categoria_id === catId).length;
  }

  calcularImc(): void {
    const peso = Number(this.newBio.pesoKg);
    const talla = Number(this.newBio.tallaCm);
    if (peso > 0 && talla > 0) {
      const m = talla / 100;
      const imc = (peso / (m * m)).toFixed(1);
      this.calculatedImc.set(imc);
    } else {
      this.calculatedImc.set('-');
    }
  }

  openCreateModal(): void {
    this.calcularImc();
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  openDetailModal(medicion: EvaluacionBiometrica): void {
    this.selectedMedicion.set(medicion);
    this.showDetailModal.set(true);
  }

  closeDetailModal(): void {
    this.showDetailModal.set(false);
    this.selectedMedicion.set(null);
  }

  submitCreateBio(): void {
    if (!this.newBio.jugadorId) {
      this.showToast('Debes seleccionar un deportista (*)');
      return;
    }
    const peso = Number(this.newBio.pesoKg);
    if (!peso || peso < 20 || peso > 180) {
      this.showToast('El peso corporal debe estar entre 20 y 180 kg');
      return;
    }
    const talla = Number(this.newBio.tallaCm);
    if (!talla || talla < 80 || talla > 240) {
      this.showToast('La estatura debe estar entre 80 y 240 cm');
      return;
    }

    this.saving.set(true);
    this.api.registrarBiometria(this.newBio).subscribe({
      next: () => {
        this.saving.set(false);
        this.showToast('¡Evaluación biométrica registrada exitosamente!');
        this.closeCreateModal();
        this.loadData();
      },
      error: () => {
        this.saving.set(false);
        this.showToast('Error al registrar evaluación');
      },
    });
  }

  getDiagnostico(b: any): { label: string; tipo: string } {
    const imc = parseFloat(b?.imc || '0');
    const cooper = parseInt(b?.test_cooper_metros || '0', 10);

    if (cooper >= 2800 || (imc >= 19 && imc <= 22)) {
      return { label: 'Sobresaliente', tipo: 'success' };
    } else if (cooper >= 2400 || (imc >= 18 && imc <= 24)) {
      return { label: 'Óptimo', tipo: 'blue' };
    }
    return { label: 'En Desarrollo', tipo: 'warning' };
  }

  getImcLabel(imcVal: any): string {
    const num = parseFloat(imcVal);
    if (isNaN(num)) return '-';
    if (num < 18.5) return 'Bajo Peso';
    if (num <= 24.9) return 'Normal / Óptimo';
    if (num <= 29.9) return 'Sobrepeso';
    return 'Obesidad';
  }

  getImcClass(imcVal: any): string {
    const num = parseFloat(imcVal);
    if (isNaN(num)) return '';
    if (num < 18.5) return 'bajo';
    if (num <= 24.9) return 'normal';
    return 'sobrepeso';
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}


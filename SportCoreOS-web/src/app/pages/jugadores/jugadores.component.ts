import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, JugadorExpediente360 } from '../../core/services/api.service';
import { CatalogosService } from '../../core/services/catalogos.service';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';

@Component({
  selector: 'app-jugadores',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrDirective],
  template: `
    <div class="jugadores-page">
      <!-- HEADER DE LA PÁGINA & ACCIONES PRINCIPALES -->
      <div class="page-header">
        <div class="header-titles">
          <div class="header-badge">
            <i class="fa-solid fa-users"></i>
            <span>MÓDULO DEPORTIVO & PLANTEL</span>
          </div>
          <h1 class="page-title">Directorio de Jugadores & Fichas 360°</h1>
          <p class="page-subtitle">
            Control de dorsales únicos, expedientes biométricos, gestión familiar y estado de matrícula.
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" (click)="openCreateModal()">
            <i class="fa-solid fa-user-plus"></i>
            <span>Inscribir Nuevo Alumno</span>
          </button>
        </div>
      </div>

      <!-- TARJETAS DE KPIs RÁPIDOS -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-icon emerald"><i class="fa-solid fa-id-card"></i></div>
          <div class="kpi-info">
            <span class="kpi-value">{{ totalJugadores() }}</span>
            <span class="kpi-label">Total en Plantel</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon blue"><i class="fa-solid fa-circle-check"></i></div>
          <div class="kpi-info">
            <span class="kpi-value">{{ activosCount() }}</span>
            <span class="kpi-label">Matrículas Activas</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon rose"><i class="fa-solid fa-heart-pulse"></i></div>
          <div class="kpi-info">
            <span class="kpi-value">{{ lesionadosCount() }}</span>
            <span class="kpi-label">En Recuperación / Baja</span>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon amber"><i class="fa-solid fa-chart-line"></i></div>
          <div class="kpi-info">
            <span class="kpi-value">{{ evaluadosCount() }}</span>
            <span class="kpi-label">Con Radar Biométrico</span>
          </div>
        </div>
      </div>

      <!-- BARRA DE FILTROS & BÚSQUEDA REACTIVA LUXURY SUITE -->
      <div class="filters-card">
        <!-- Fila 1: Buscador Principal, Selector de Ordenamiento y Selector de Vista -->
        <div class="filters-main-row">
          <!-- Buscador de Texto Multicriterio con Lupa Prominente y Contador -->
          <div class="search-box luxury-search">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input 
              type="text" 
              [ngModel]="searchQuery()" 
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar por Nombre, Apellidos, Documento (TI/CC), Dorsal (#), Posición, EPS..." 
              class="search-input" />
            @if (searchQuery()) {
              <button class="clear-search-btn" (click)="clearSearch()" title="Borrar búsqueda">
                <i class="fa-solid fa-xmark"></i>
              </button>
            }
            @if (totalFilteredCount() > 0) {
              <span class="search-count-badge">
                {{ totalFilteredCount() }} {{ totalFilteredCount() === 1 ? 'jugador' : 'jugadores' }}
              </span>
            }
          </div>

          <!-- Selector de Criterio de Ordenación -->
          <div class="sort-selector-wrapper">
            <label class="filter-label"><i class="fa-solid fa-arrow-down-a-z"></i> Ordenar:</label>
            <div class="sport-select-wrapper filter-select-wrap">
              <select [ngModel]="selectedSortBy()" (ngModelChange)="onSortByChange($event)" class="filter-select">
                <option value="APELLIDO_ASC">🔤 Apellidos (A → Z)</option>
                <option value="NOMBRE_ASC">🔤 Nombres (A → Z)</option>
                <option value="DORSAL_ASC">🔢 Número Dorsal (#)</option>
                <option value="CREATED_DESC">✨ Más Recientes</option>
                <option value="TALLA_DESC">📏 Mayor Estatura</option>
              </select>
              <i class="fa-solid fa-chevron-down select-chevron"></i>
            </div>
          </div>

          <!-- Selector de Modo de Vista (Tabla vs Tarjetas Ficha 360°) -->
          <div class="view-mode-toggle">
            <button 
              type="button" 
              class="view-mode-btn" 
              [class.active]="viewMode() === 'TABLE'" 
              (click)="toggleViewMode('TABLE')"
              title="Vista de Tabla Detallada">
              <i class="fa-solid fa-table-list"></i>
              <span>Tabla</span>
            </button>
            <button 
              type="button" 
              class="view-mode-btn" 
              [class.active]="viewMode() === 'CARDS'" 
              (click)="toggleViewMode('CARDS')"
              title="Vista de Tarjetas Fichas 360°">
              <i class="fa-solid fa-id-card-clip"></i>
              <span>Fichas</span>
            </button>
          </div>
        </div>

        <!-- Fila 2: Filtros de Rama, Posición Táctica y Estado de Matrícula -->
        <div class="filters-secondary-row">
          <!-- Filtro Rama / Género -->
          <div class="filter-group">
            <span class="filter-group-label"><i class="fa-solid fa-venus-mars"></i> Rama:</span>
            <div class="segmented-filter-pills">
              <button 
                type="button" 
                class="seg-pill" 
                [class.active]="selectedGenero() === 'TODOS'"
                (click)="onGeneroFilterChange('TODOS')">
                Todas
              </button>
              <button 
                type="button" 
                class="seg-pill" 
                [class.active]="selectedGenero() === 'MASCULINO'"
                (click)="onGeneroFilterChange('MASCULINO')">
                <i class="fa-solid fa-mars"></i> Masc
              </button>
              <button 
                type="button" 
                class="seg-pill" 
                [class.active]="selectedGenero() === 'FEMENINO'"
                (click)="onGeneroFilterChange('FEMENINO')">
                <i class="fa-solid fa-venus"></i> Fem
              </button>
            </div>
          </div>

          <!-- Filtro Posición Táctica -->
          <div class="filter-group">
            <span class="filter-group-label"><i class="fa-solid fa-compass"></i> Posición:</span>
            <div class="sport-select-wrapper filter-select-wrap">
              <select [ngModel]="selectedPosicion()" (ngModelChange)="onPosicionFilterChange($event)" class="filter-select">
                <option value="TODAS">⚡ Todas las Posiciones</option>
                <option value="portero">🧤 Porteros / Arqueros</option>
                <option value="defensa">🛡️ Defensas (Central / Lateral)</option>
                <option value="volante">🎯 Volantes / Mediocampistas</option>
                <option value="delantero">⚽ Delanteros / Extremos</option>
              </select>
              <i class="fa-solid fa-chevron-down select-chevron"></i>
            </div>
          </div>

          <!-- Filtro Estado Matrícula -->
          <div class="filter-group">
            <span class="filter-group-label"><i class="fa-solid fa-toggle-on"></i> Estado:</span>
            <div class="segmented-filter-pills status-filter-pills">
              <button 
                type="button" 
                class="seg-pill" 
                [class.active]="selectedEstado() === 'TODOS'"
                (click)="onEstadoFilterChange('TODOS')">
                Todos
              </button>
              <button 
                type="button" 
                class="seg-pill pill-activo" 
                [class.active]="selectedEstado() === 'ACTIVO'"
                (click)="onEstadoFilterChange('ACTIVO')">
                <span class="dot-activo"></span> Activos
              </button>
              <button 
                type="button" 
                class="seg-pill pill-lesionado" 
                [class.active]="selectedEstado() === 'LESIONADO'"
                (click)="onEstadoFilterChange('LESIONADO')">
                <span class="dot-lesionado"></span> Lesión
              </button>
              <button 
                type="button" 
                class="seg-pill pill-inactivo" 
                [class.active]="selectedEstado() === 'INACTIVO'"
                (click)="onEstadoFilterChange('INACTIVO')">
                <span class="dot-inactivo"></span> Inactivos
              </button>
              <button 
                type="button" 
                class="seg-pill pill-retirado" 
                [class.active]="selectedEstado() === 'RETIRADO'"
                (click)="onEstadoFilterChange('RETIRADO')">
                <span class="dot-retirado"></span> Retirados
              </button>
            </div>
          </div>

          <!-- Botón de Limpiar Todo -->
          @if (hasActiveFilters()) {
            <button class="btn-clear-all-filters" (click)="resetAllFilters()" title="Restablecer todos los filtros y búsqueda">
              <i class="fa-solid fa-filter-circle-xmark"></i>
              <span>Limpiar Filtros</span>
            </button>
          }
        </div>

        <!-- Fila 3: Cinta de Categorías Deportivas con Pills Dinámicas -->
        <div class="category-pills-container">
          <span class="category-ribbon-label"><i class="fa-solid fa-layer-group"></i> Categoría:</span>
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
                @if (cat.codigo_categoria) {
                  <span class="cat-code-badge">{{ cat.codigo_categoria }}</span>
                }
                <span class="pill-count">({{ getCategoryCount(cat.id) }})</span>
              </button>
            }
          </div>
        </div>

        <!-- Fila 4 (Condicional): Chips de Filtros Activos para Descarte Rápido -->
        @if (hasActiveFilters()) {
          <div class="active-chips-bar">
            <span class="chips-title"><i class="fa-solid fa-sliders"></i> Filtros activos:</span>
            
            @if (searchQuery().trim()) {
              <span class="filter-chip">
                <i class="fa-solid fa-magnifying-glass"></i>
                "{{ searchQuery() }}"
                <button type="button" (click)="removeSearchFilter()"><i class="fa-solid fa-xmark"></i></button>
              </span>
            }

            @if (selectedCategoriaId() !== 'TODAS') {
              <span class="filter-chip">
                <i class="fa-solid fa-shield"></i>
                Cat: {{ getSelectedCategoryName() }}
                <button type="button" (click)="removeCategoriaFilter()"><i class="fa-solid fa-xmark"></i></button>
              </span>
            }

            @if (selectedGenero() !== 'TODOS') {
              <span class="filter-chip">
                <i class="fa-solid fa-venus-mars"></i>
                {{ selectedGenero() === 'MASCULINO' ? 'Masculino' : 'Femenino' }}
                <button type="button" (click)="removeGeneroFilter()"><i class="fa-solid fa-xmark"></i></button>
              </span>
            }

            @if (selectedPosicion() !== 'TODAS') {
              <span class="filter-chip">
                <i class="fa-solid fa-compass"></i>
                Pos: {{ selectedPosicion() }}
                <button type="button" (click)="removePosicionFilter()"><i class="fa-solid fa-xmark"></i></button>
              </span>
            }

            @if (selectedEstado() !== 'TODOS') {
              <span class="filter-chip">
                <i class="fa-solid fa-circle-info"></i>
                Estado: {{ selectedEstado() }}
                <button type="button" (click)="removeEstadoFilter()"><i class="fa-solid fa-xmark"></i></button>
              </span>
            }

            <button type="button" class="btn-text-clear" (click)="resetAllFilters()">Borrar todos</button>
          </div>
        }
      </div>

      <!-- CONTENEDOR DE JUGADORES (TABLA O TARJETAS 360°) -->
      <div class="fut-table-container">
        @if (loading()) {
          <div class="loading-state">
            <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
            <p>Cargando plantilla de jugadores...</p>
          </div>
        } @else if (jugadoresFiltrados().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">⚽</div>
            <h3>No se encontraron jugadores</h3>
            <p>
              @if (searchQuery().trim()) {
                No hay deportistas que coincidan con la búsqueda "<strong>{{ searchQuery() }}</strong>".
              } @else {
                No hay alumnos registrados que coincidan con los filtros seleccionados.
              }
            </p>
            <div class="empty-actions">
              @if (hasActiveFilters()) {
                <button class="btn-secondary" (click)="resetAllFilters()">
                  <i class="fa-solid fa-filter-circle-xmark"></i> Limpiar Búsqueda y Filtros
                </button>
              }
              <button class="btn-primary" (click)="openCreateModal()">
                <i class="fa-solid fa-user-plus"></i> Inscribir Nuevo Jugador
              </button>
            </div>
          </div>
        } @else {
          <!-- VISTA 1: TABLA DETALLADA -->
          @if (viewMode() === 'TABLE') {
            <div class="table-scroll-wrapper">
              <table class="fut-table">
                <thead>
                  <tr>
                    <th>Dorsal / Foto</th>
                    <th>Nombre del Jugador</th>
                    <th>Categoría</th>
                    <th>Posición</th>
                    <th>Rama</th>
                    <th>Documento</th>
                    <th>Estado</th>
                    <th>Beca</th>
                    <th class="text-right">Acciones 360°</th>
                  </tr>
                </thead>
                <tbody>
                  @for (j of paginatedJugadores(); track j.id) {
                    <tr class="player-row" [attr.data-doc]="j.numero_documento">
                      <!-- Dorsal / Foto -->
                      <td>
                        <div class="player-cell">
                          <div class="dorsal-tag">
                            <span class="dorsal-hash">#</span>{{ j.numero_dorsal || '-' }}
                          </div>
                          <div class="avatar-sm">
                            <img 
                              [src]="resolvePhotoUrl(j.foto_url, j.genero)" 
                              [alt]="j.nombres" />
                          </div>
                        </div>
                      </td>

                      <!-- Nombre -->
                      <td>
                        <div class="name-box">
                          <span class="player-name" (click)="openExpediente(j.id)">
                            {{ j.nombres }} {{ j.apellidos }}
                          </span>
                          <span class="player-sub">
                            {{ getEdad(j.fecha_nacimiento) }} años • {{ j.eps || 'EPS Sanitas' }}
                          </span>
                        </div>
                      </td>

                      <!-- Categoría -->
                      <td>
                        <span class="badge-cat" [style.background-color]="j.color_distintivo || '#10B981'">
                          <i class="fa-solid fa-shield"></i>
                          {{ j.categoria_nombre }}
                        </span>
                      </td>

                      <!-- Posición -->
                      <td>
                        <div class="pos-cell">
                          <i class="fa-solid fa-futbol"></i>
                          <span>{{ j.posicion_principal }}</span>
                        </div>
                      </td>

                      <!-- Rama / Género -->
                      <td>
                        <span class="gender-pill" [class]="j.genero ? j.genero.toLowerCase() : 'masculino'">
                          <i class="fa-solid" [class.fa-mars]="j.genero === 'MASCULINO'" [class.fa-venus]="j.genero === 'FEMENINO'"></i>
                          {{ j.genero === 'FEMENINO' ? 'Femenino' : 'Masculino' }}
                        </span>
                      </td>

                      <!-- Documento -->
                      <td>
                        <span class="doc-text">{{ j.tipo_documento }} {{ j.numero_documento }}</span>
                      </td>

                      <!-- Estado Matrícula -->
                      <td>
                        <span class="status-badge" [class]="j.estado_matricula ? j.estado_matricula.toLowerCase() : 'activo'">
                          <span class="status-dot"></span>
                          {{ j.estado_matricula || 'ACTIVO' }}
                        </span>
                      </td>

                      <!-- Beca -->
                      <td>
                        <span class="scholarship-pill" [class.has-beca]="j.porcentaje_beca > 0">
                          {{ j.porcentaje_beca > 0 ? (j.porcentaje_beca + '% Beca') : '100% Tarifa' }}
                        </span>
                      </td>

                      <!-- Acciones -->
                      <td>
                        <div class="table-actions">
                          <button class="action-btn btn-view" (click)="openExpediente(j.id)" title="Ver Expediente 360°">
                            <i class="fa-solid fa-folder-open"></i>
                          </button>
                          <button class="action-btn btn-edit" (click)="openEditModal(j)" title="Editar Jugador">
                            <i class="fa-solid fa-pen-to-square"></i>
                          </button>
                          <button class="action-btn btn-delete" (click)="openDeleteConfirmModal(j)" title="Retirar / Dar de Baja">
                            <i class="fa-solid fa-user-minus"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- VISTA DE TARJETAS (FICHAS 360°) -->
          @if (viewMode() === 'CARDS') {
            <div class="player-cards-grid">
              @for (j of paginatedJugadores(); track j.id) {
                <div class="player-fut-card" [class.player-card-elite]="j.categoria_nombre?.toLowerCase()?.includes('profesional') || j.categoria_nombre?.toLowerCase()?.includes('élite') || j.categoria_nombre?.toLowerCase()?.includes('elite')">
                  <!-- Header de la tarjeta: Categoría, Beca y Dorsal -->
                  <div class="pfc-top-bar">
                    <span class="pfc-cat-badge">
                      <span class="cat-dot" [style.background-color]="j.color_distintivo || '#10B981'"></span>
                      {{ j.categoria_nombre }}
                    </span>
                    <div class="pfc-top-tags">
                      @if (j.porcentaje_beca > 0) {
                        <span class="pfc-scholarship-tag">{{ j.porcentaje_beca }}% Beca</span>
                      }
                      <span class="pfc-dorsal-tag">#{{ j.numero_dorsal || '-' }}</span>
                    </div>
                  </div>

                  <!-- Cuerpo Principal: Foto, Nombre, Documento y Estado -->
                  <div class="pfc-body">
                    <div class="pfc-avatar-wrap" (click)="openExpediente(j.id)">
                      <img [src]="resolvePhotoUrl(j.foto_url, j.genero)" [alt]="j.nombres" />
                      <span class="pfc-status-dot" [class]="j.estado_matricula ? j.estado_matricula.toLowerCase() : 'activo'" [title]="j.estado_matricula"></span>
                    </div>
                    
                    <div class="pfc-player-info">
                      <h3 class="pfc-name" (click)="openExpediente(j.id)">{{ j.nombres }} {{ j.apellidos }}</h3>
                      <div class="pfc-meta-row">
                        <span class="pfc-doc">{{ j.tipo_documento }} {{ j.numero_documento }}</span>
                        <span class="pfc-age">• {{ getEdad(j.fecha_nacimiento) }} años</span>
                      </div>
                      <div class="pfc-eps-row">
                        <i class="fa-solid fa-hospital-user"></i> {{ j.eps || 'EPS Sanitas' }}
                      </div>
                    </div>
                  </div>

                  <!-- Posición & Perfil Táctico -->
                  <div class="pfc-tactics">
                    <div class="pfc-pos-pill">
                      <i class="fa-solid fa-futbol"></i>
                      <span>{{ j.posicion_principal }}</span>
                    </div>
                    @if (j.posicion_secundaria) {
                      <span class="pos-sec-badge" title="Posición Secundaria">
                        <i class="fa-solid fa-arrows-split-up-and-left"></i> {{ j.posicion_secundaria }}
                      </span>
                    }
                    <span class="pfc-foot-badge">
                      <i class="fa-solid fa-shoe-prints"></i> {{ j.pierna_habil || 'DIESTRO' }}
                    </span>
                  </div>

                  <!-- Radar Biométrico Resumen -->
                  <div class="pfc-bio-strip">
                    @if (j.talla_cm && j.peso_kg) {
                      <div class="pfc-bio-item">
                        <span class="lbl">Talla</span>
                        <strong>{{ j.talla_cm }} cm</strong>
                      </div>
                      <div class="pfc-bio-item">
                        <span class="lbl">Peso</span>
                        <strong>{{ j.peso_kg }} kg</strong>
                      </div>
                      <div class="pfc-bio-item">
                        <span class="lbl">IMC</span>
                        <span class="imc-badge" [class]="getImcClass(j.imc)">{{ j.imc }}</span>
                      </div>
                    } @else {
                      <button type="button" class="pfc-btn-add-bio" (click)="openBiometriaModal(j)">
                        <i class="fa-solid fa-plus"></i> Registrar Biometría
                      </button>
                    }
                  </div>

                  <!-- Footer con Acciones 360° -->
                  <div class="pfc-footer">
                    <button type="button" class="pfc-btn-view" (click)="openExpediente(j.id)">
                      <i class="fa-solid fa-id-card"></i>
                      <span>Ficha 360°</span>
                    </button>
                    <div class="pfc-sub-actions">
                      <button type="button" class="action-btn btn-bio" (click)="openBiometriaModal(j)" title="Registrar Biometría">
                        <i class="fa-solid fa-heart-pulse"></i>
                      </button>
                      <button type="button" class="action-btn btn-edit" (click)="openEditModal(j)" title="Editar Jugador">
                        <i class="fa-solid fa-pen"></i>
                      </button>
                      <button type="button" class="action-btn btn-delete" (click)="openDeleteConfirmModal(j)" title="Dar de Baja">
                        <i class="fa-solid fa-user-xmark"></i>
                      </button>
                    </div>
                  </div>
                </div>
              }
            </div>
          }

          <!-- BARRA DE PAGINACIÓN PROFESIONAL -->
          <div class="pagination-bar">
            <div class="pagination-info">
              <span>Mostrando <strong>{{ showingStart() }} - {{ showingEnd() }}</strong> de <strong>{{ totalFilteredCount() }}</strong> deportistas</span>
              <div class="page-size-selector">
                <label>Mostrar:</label>
                <select [ngModel]="pageSize()" (ngModelChange)="setPageSize($event)" class="page-size-select">
                  <option [value]="5">5 por pág</option>
                  <option [value]="10">10 por pág</option>
                  <option [value]="20">20 por pág</option>
                  <option [value]="50">50 por pág</option>
                </select>
              </div>
            </div>

            <div class="pagination-controls">
              <button 
                class="page-nav-btn btn-prev" 
                [disabled]="currentPage() <= 1" 
                (click)="goToPage(currentPage() - 1)"
                title="Página anterior">
                <i class="fa-solid fa-chevron-left"></i>
                <span>Anterior</span>
              </button>

              <div class="page-numbers">
                @for (p of visiblePages(); track p) {
                  @if (p === -1) {
                    <span class="page-ellipsis">...</span>
                  } @else {
                    <button 
                      class="page-num-btn" 
                      [class.active]="currentPage() === p"
                      (click)="goToPage(p)">
                      {{ p }}
                    </button>
                  }
                }
              </div>

              <button 
                class="page-nav-btn btn-next" 
                [disabled]="currentPage() >= totalPages()" 
                (click)="goToPage(currentPage() + 1)"
                title="Página siguiente">
                <span>Siguiente</span>
                <i class="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          </div>
        }
      </div>

      <!-- =====================================================================
           MODAL / DRAWER: EXPEDIENTE 360° DEL JUGADOR
           ===================================================================== -->
      @if (showExpedienteModal() && selectedExpediente()) {
        <div class="modal-backdrop" (click)="closeExpediente()">
          <div class="expediente-modal" (click)="$event.stopPropagation()">
            <!-- Header del Expediente -->
            <div class="exp-header">
              <div class="exp-player-banner">
                <div class="exp-avatar-wrap">
                  <img 
                    [src]="resolvePhotoUrl(selectedExpediente()!.jugador.foto_url, selectedExpediente()!.jugador.genero)" 
                    [alt]="selectedExpediente()!.jugador.nombres" />
                  <div class="exp-dorsal-tag">
                    #{{ selectedExpediente()!.jugador.numero_dorsal || '-' }}
                  </div>
                </div>
                <div class="exp-main-info">
                  <div class="exp-title-row">
                    <h2>{{ selectedExpediente()!.jugador.nombres }} {{ selectedExpediente()!.jugador.apellidos }}</h2>
                    <span class="status-badge" [class]="selectedExpediente()!.jugador.estado_matricula.toLowerCase()">
                      <span class="status-dot"></span>
                      {{ selectedExpediente()!.jugador.estado_matricula }}
                    </span>
                  </div>
                  <div class="exp-meta-pills">
                    <span class="meta-pill"><i class="fa-solid fa-shield"></i> {{ selectedExpediente()!.jugador.categoria_nombre }}</span>
                    <span class="meta-pill"><i class="fa-solid fa-id-card"></i> {{ selectedExpediente()!.jugador.tipo_documento }} {{ selectedExpediente()!.jugador.numero_documento }}</span>
                    <span class="meta-pill"><i class="fa-solid fa-cake-candles"></i> {{ getEdad(selectedExpediente()!.jugador.fecha_nacimiento) }} años ({{ selectedExpediente()!.jugador.fecha_nacimiento | date:'dd/MM/yyyy' }})</span>
                    <span class="meta-pill"><i class="fa-solid fa-hospital-user"></i> {{ selectedExpediente()!.jugador.eps }}</span>
                  </div>
                </div>
              </div>
              <button class="modal-close-btn" (click)="closeExpediente()">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <!-- Navegación por Pestañas del Expediente 360° -->
            <div class="exp-tabs-nav">
              <button 
                class="exp-tab-btn" 
                [class.active]="activeExpTab() === 'DEPORTIVO'"
                (click)="activeExpTab.set('DEPORTIVO')">
                <i class="fa-solid fa-futbol"></i>
                <span>1. Perfil Deportivo</span>
              </button>
              <button 
                class="exp-tab-btn" 
                [class.active]="activeExpTab() === 'FAMILIA'"
                (click)="activeExpTab.set('FAMILIA')">
                <i class="fa-solid fa-people-roof"></i>
                <span>2. Núcleo Familiar ({{ selectedExpediente()!.acudientes.length }})</span>
              </button>
              <button 
                class="exp-tab-btn" 
                [class.active]="activeExpTab() === 'BIOMETRIA'"
                (click)="activeExpTab.set('BIOMETRIA')">
                <i class="fa-solid fa-heart-pulse"></i>
                <span>3. Radar Biométrico ({{ selectedExpediente()!.historialBiometrico.length }})</span>
              </button>
              <button 
                class="exp-tab-btn" 
                [class.active]="activeExpTab() === 'FINANZAS'"
                (click)="activeExpTab.set('FINANZAS')">
                <i class="fa-solid fa-file-invoice-dollar"></i>
                <span>4. Estado Financiero</span>
              </button>
              <button 
                class="exp-tab-btn" 
                [class.active]="activeExpTab() === 'SERVICIOS'"
                (click)="activeExpTab.set('SERVICIOS')">
                <i class="fa-solid fa-graduation-cap text-amber"></i>
                <span>5. Clínicas & Insignias Pro ({{ selectedExpediente()!.clinicasInsignias?.length || 0 }})</span>
              </button>
            </div>

            <!-- Contenido de las Pestañas -->
            <div class="exp-tab-content">
              <!-- PESTAÑA 1: PERFIL DEPORTIVO -->
              @if (activeExpTab() === 'DEPORTIVO') {
                <div class="tab-pane">
                  <div class="profile-cards-grid">
                    <div class="info-card">
                      <div class="card-icon"><i class="fa-solid fa-compass"></i></div>
                      <div class="card-data">
                        <span class="data-label">Posición Principal / Roles</span>
                        <strong class="data-val">{{ selectedExpediente()!.jugador.posicion_principal }}</strong>
                        @if (selectedExpediente()!.jugador.posicion_secundaria) {
                          <span class="pos-sec-badge mt-1"><i class="fa-solid fa-arrows-split-up-and-left"></i> Sec: {{ selectedExpediente()!.jugador.posicion_secundaria }}</span>
                        }
                      </div>
                    </div>
                    <div class="info-card">
                      <div class="card-icon"><i class="fa-solid fa-shoe-prints"></i></div>
                      <div class="card-data">
                        <span class="data-label">Pierna Hábil</span>
                        <strong class="data-val">{{ selectedExpediente()!.jugador.pierna_habil || 'DIESTRO' }}</strong>
                      </div>
                    </div>
                    <div class="info-card">
                      <div class="card-icon"><i class="fa-solid fa-user-tie"></i></div>
                      <div class="card-data">
                        <span class="data-label">Director Técnico (DT)</span>
                        <strong class="data-val">{{ selectedExpediente()!.jugador.dt_nombre || 'Prof. Carlos Valderrama' }}</strong>
                      </div>
                    </div>
                    <div class="info-card">
                      <div class="card-icon"><i class="fa-solid fa-shirt"></i></div>
                      <div class="card-data">
                        <span class="data-label">Dorsal Asignado</span>
                        <strong class="data-val highlight">#{{ selectedExpediente()!.jugador.numero_dorsal || '-' }}</strong>
                      </div>
                    </div>
                  </div>

                  <div class="section-box mt-3">
                    <h4 class="box-title"><i class="fa-solid fa-notes-medical"></i> Información Médica & Cobertura</h4>
                    <div class="grid-3-col">
                      <div class="meta-item">
                        <span class="meta-label">Entidad Prestadora de Salud:</span>
                        <strong class="meta-value">{{ selectedExpediente()!.jugador.eps || 'EPS Sanitas' }}</strong>
                      </div>
                      <div class="meta-item">
                        <span class="meta-label">Género / Rama:</span>
                        <strong class="meta-value">{{ selectedExpediente()!.jugador.genero }}</strong>
                      </div>
                      <div class="meta-item">
                        <span class="meta-label">Fecha de Ingreso:</span>
                        <strong class="meta-value">{{ selectedExpediente()!.jugador.created_at | date:'mediumDate' }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- PESTAÑA 2: NÚCLEO FAMILIAR & ACUDIENTES -->
              @if (activeExpTab() === 'FAMILIA') {
                <div class="tab-pane">
                  <div class="pane-header-action">
                    <div>
                      <h3 class="pane-title">Padres de Familia y Contactos de Emergencia</h3>
                      <p class="pane-desc">Personas autorizadas para retiro del jugador y notificaciones WhatsApp.</p>
                    </div>
                    <button class="btn-primary-sm" (click)="toggleAddAcudienteForm()">
                      <i class="fa-solid" [class.fa-plus]="!showAddAcudienteForm" [class.fa-minus]="showAddAcudienteForm"></i>
                      <span>{{ showAddAcudienteForm ? 'Cancelar' : 'Vincular Acudiente' }}</span>
                    </button>
                  </div>

                  <!-- Formulario para agregar Acudiente -->
                  @if (showAddAcudienteForm) {
                    <form (ngSubmit)="submitAddAcudiente()" class="inline-form-card">
                      <h4>Vincular Nuevo Acudiente / Familiar</h4>
                      <div class="grid-3-col">
                        <div class="input-group">
                          <label>Nombres *</label>
                          <input type="text" [(ngModel)]="newAcudiente.nombres" name="acNombres" required class="sport-input" />
                        </div>
                        <div class="input-group">
                          <label>Apellidos *</label>
                          <input type="text" [(ngModel)]="newAcudiente.apellidos" name="acApellidos" required class="sport-input" />
                        </div>
                        <div class="input-group">
                          <label>No. Documento *</label>
                          <input type="text" [(ngModel)]="newAcudiente.numeroDocumento" name="acDoc" required class="sport-input" />
                        </div>
                      </div>
                      <div class="grid-3-col">
                        <div class="input-group">
                          <label>Teléfono Móvil (WhatsApp) *</label>
                          <input type="tel" [(ngModel)]="newAcudiente.telefonoMovil" name="acTel" placeholder="+57 300 123 4567" required class="sport-input" />
                        </div>
                        <div class="input-group">
                          <label>Correo Electrónico</label>
                          <input type="email" [(ngModel)]="newAcudiente.email" name="acEmail" class="sport-input" />
                        </div>
                        <div class="input-group">
                          <label>Parentesco</label>
                          <div class="sport-select-wrapper">
                            <select [(ngModel)]="newAcudiente.parentesco" name="acParentesco" class="sport-input">
                              @for (par of parentescos(); track par.codigo) {
                                <option [value]="par.codigo">{{ par.nombre }}</option>
                              }
                            </select>
                            <i class="fa-solid fa-chevron-down select-chevron"></i>
                          </div>
                        </div>
                      </div>
                      <div class="form-actions-right">
                        <button type="submit" class="btn-submit-sm" [disabled]="savingAcudiente">
                          <i class="fa-solid fa-save"></i> Guardar Acudiente
                        </button>
                      </div>
                    </form>
                  }

                  <!-- Lista de Acudientes -->
                  @if (selectedExpediente()!.acudientes.length === 0) {
                    <div class="empty-state-sm">
                      <i class="fa-solid fa-user-group"></i>
                      <p>No hay acudientes registrados para este jugador.</p>
                    </div>
                  } @else {
                    <div class="acudientes-list">
                      @for (a of selectedExpediente()!.acudientes; track a.id) {
                        <div class="acudiente-card">
                          <div class="acudiente-avatar">
                            <i class="fa-solid fa-user-tie"></i>
                          </div>
                          <div class="acudiente-info">
                            <div class="acudiente-header">
                              <strong>{{ a.nombres }} {{ a.apellidos }}</strong>
                              <span class="parentesco-badge">{{ a.parentesco }}</span>
                              @if (a.es_contacto_principal) {
                                <span class="badge-principal"><i class="fa-solid fa-star"></i> Principal</span>
                              }
                              @if (a.autorizado_recoger) {
                                <span class="badge-pickup"><i class="fa-solid fa-shield-check"></i> Autorizado Recoger</span>
                              }
                            </div>
                            <div class="acudiente-meta">
                              <span><i class="fa-solid fa-id-badge"></i> {{ a.tipo_documento }} {{ a.numero_documento }}</span>
                              <span><i class="fa-solid fa-phone"></i> {{ a.telefono_movil }}</span>
                              @if (a.email) {
                                <span><i class="fa-solid fa-envelope"></i> {{ a.email }}</span>
                              }
                            </div>
                          </div>
                          <div class="acudiente-actions">
                            <a 
                              [href]="'https://wa.me/' + cleanPhone(a.telefono_movil)" 
                              target="_blank" 
                              class="btn-whatsapp" 
                              title="Contactar por WhatsApp">
                              <i class="fa-brands fa-whatsapp"></i>
                              <span>WhatsApp</span>
                            </a>
                            <button 
                              class="btn-remove-ac" 
                              (click)="removeAcudiente(a.id)" 
                              title="Desvincular">
                              <i class="fa-solid fa-trash-can"></i>
                            </button>
                          </div>
                        </div>
                      }
                    </div>
                  }
                </div>
              }

              <!-- PESTAÑA 3: RADAR BIOMÉTRICO & TELEMETRÍA -->
              @if (activeExpTab() === 'BIOMETRIA') {
                <div class="tab-pane">
                  <div class="pane-header-action">
                    <div>
                      <h3 class="pane-title">Historial Antropométrico & Pruebas de Rendimiento</h3>
                      <p class="pane-desc">Evolución del peso, estatura, IMC y test aeróbicos/físicos del atleta.</p>
                    </div>
                    <button class="btn-primary-sm" (click)="openBiometriaModal(selectedExpediente()!.jugador)">
                      <i class="fa-solid fa-plus-circle"></i>
                      <span>Registrar Nueva Medición</span>
                    </button>
                  </div>

                  <!-- Métricas Actuales Resumen -->
                  @if (selectedExpediente()!.historialBiometrico.length > 0) {
                    @let latest = selectedExpediente()!.historialBiometrico[0];
                    <div class="biometria-kpi-grid">
                      <div class="bio-kpi-card">
                        <span class="bio-label">Estatura Actual</span>
                        <strong class="bio-val">{{ latest.talla_cm }} <small>cm</small></strong>
                      </div>
                      <div class="bio-kpi-card">
                        <span class="bio-label">Peso Corporal</span>
                        <strong class="bio-val">{{ latest.peso_kg }} <small>kg</small></strong>
                      </div>
                      <div class="bio-kpi-card">
                        <span class="bio-label">Índice Masa (IMC)</span>
                        <strong class="bio-val highlight">{{ latest.imc }}</strong>
                        <span class="imc-sub" [class]="getImcClass(latest.imc)">{{ getImcLabel(latest.imc) }}</span>
                      </div>
                      <div class="bio-kpi-card">
                        <span class="bio-label">Test de Cooper</span>
                        <strong class="bio-val">{{ latest.test_cooper_metros || '-' }} <small>m</small></strong>
                      </div>
                      <div class="bio-kpi-card">
                        <span class="bio-label">Sprint 30m</span>
                        <strong class="bio-val">{{ latest.velocidad_30m_seg || '-' }} <small>seg</small></strong>
                      </div>
                      <div class="bio-kpi-card">
                        <span class="bio-label">Salto Vertical</span>
                        <strong class="bio-val">{{ latest.salto_vertical_cm || '-' }} <small>cm</small></strong>
                      </div>
                    </div>
                  }

                  <!-- Historial de Evaluaciones -->
                  <div class="section-box mt-3">
                    <h4 class="box-title"><i class="fa-solid fa-clock-rotate-left"></i> Historial de Evaluaciones</h4>
                    @if (selectedExpediente()!.historialBiometrico.length === 0) {
                      <div class="empty-state-sm">
                        <p>No se han registrado evaluaciones antropométricas para este jugador.</p>
                      </div>
                    } @else {
                      <table class="fut-table-sub">
                        <thead>
                          <tr>
                            <th>Fecha</th>
                            <th>Talla</th>
                            <th>Peso</th>
                            <th>IMC</th>
                            <th>Cooper (m)</th>
                            <th>Sprint 30m</th>
                            <th>Salto</th>
                            <th>Evaluador / Observaciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (b of selectedExpediente()!.historialBiometrico; track b.id) {
                            <tr>
                              <td><strong>{{ b.fecha_evaluacion | date:'dd/MM/yyyy' }}</strong></td>
                              <td>{{ b.talla_cm }} cm</td>
                              <td>{{ b.peso_kg }} kg</td>
                              <td><span class="imc-pill" [class]="getImcClass(b.imc)">{{ b.imc }}</span></td>
                              <td>{{ b.test_cooper_metros || '-' }} m</td>
                              <td>{{ b.velocidad_30m_seg || '-' }} s</td>
                              <td>{{ b.salto_vertical_cm || '-' }} cm</td>
                              <td>
                                <span class="evaluador-tag">{{ b.evaluador_nombre || 'DT Principal' }}</span>
                                <small class="obs-text">{{ b.observaciones || 'Sin notas' }}</small>
                              </td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    }
                  </div>
                </div>
              }

              <!-- PESTAÑA 4: CONTROL FINANCIERO -->
              @if (activeExpTab() === 'FINANZAS') {
                <div class="tab-pane">
                  <div class="fin-summary-grid">
                    <div class="fin-stat-card">
                      <span class="fin-label">Total Facturado</span>
                      <strong class="fin-val">\${{ selectedExpediente()!.resumenFinanciero.totalFacturado | number }}</strong>
                    </div>
                    <div class="fin-stat-card">
                      <span class="fin-label">Total Recaudado</span>
                      <strong class="fin-val emerald">\${{ selectedExpediente()!.resumenFinanciero.totalPagado | number }}</strong>
                    </div>
                    <div class="fin-stat-card">
                      <span class="fin-label">Saldo Pendiente</span>
                      <strong class="fin-val" [class.rose]="selectedExpediente()!.resumenFinanciero.saldoPendiente > 0">
                        \${{ selectedExpediente()!.resumenFinanciero.saldoPendiente | number }}
                      </strong>
                    </div>
                    <div class="fin-stat-card">
                      <span class="fin-label">Estado de Cartera</span>
                      <span class="status-badge-lg" [class]="selectedExpediente()!.resumenFinanciero.estadoCuenta === 'AL_DIA' ? 'al-dia' : 'en-mora'">
                        {{ selectedExpediente()!.resumenFinanciero.estadoCuenta === 'AL_DIA' ? 'AL DÍA' : 'EN MORA' }}
                      </span>
                    </div>
                  </div>

                  <div class="section-box mt-3">
                    <h4 class="box-title"><i class="fa-solid fa-receipt"></i> Detalle de Mensualidades & Cargos</h4>
                    @if (selectedExpediente()!.historialFinanciero.length === 0) {
                      <div class="empty-state-sm">
                        <p>No hay cargos de pensión registrados actualmente.</p>
                      </div>
                    } @else {
                      <table class="fut-table-sub">
                        <thead>
                          <tr>
                            <th>Periodo</th>
                            <th>Concepto</th>
                            <th>Monto Total</th>
                            <th>Beca / Descuento</th>
                            <th>Pagado</th>
                            <th>Saldo</th>
                            <th>Estado</th>
                            <th>Vencimiento</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (f of selectedExpediente()!.historialFinanciero; track f.id) {
                            <tr>
                              <td><strong>{{ f.periodo_mes }}/{{ f.periodo_anio }}</strong></td>
                              <td>{{ f.concepto_nombre }}</td>
                              <td>\${{ f.monto_total | number }}</td>
                              <td>\${{ f.monto_descuento_beca | number }}</td>
                              <td>\${{ f.monto_pagado | number }}</td>
                              <td><strong>\${{ f.saldo_pendiente | number }}</strong></td>
                              <td>
                                <span class="badge" [class.badge-success]="f.estado_pago === 'PAGADO'" [class.badge-danger]="f.estado_pago === 'PENDIENTE'">
                                  {{ f.estado_pago }}
                                </span>
                              </td>
                              <td>{{ f.fecha_limite_pago | date:'dd/MM/yyyy' }}</td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    }
                  </div>
                </div>
              }

              <!-- PESTAÑA 5: CLÍNICAS ESPECIALIZADAS & INSIGNIAS PRO -->
              @if (activeExpTab() === 'SERVICIOS') {
                <div class="tab-pane">
                  <div class="pane-header-action">
                    <div>
                      <h3 class="pane-title">Clínicas de Micro-Habilidades & Insignias Élite</h3>
                      <p class="pane-desc">Programas de alto rendimiento completados, certificaciones y pases QR adquiridos.</p>
                    </div>
                    <a routerLink="/servicios" (click)="closeExpediente()" class="btn-primary-sm" style="text-decoration:none; display:inline-flex; align-items:center; gap:0.4rem;">
                      <i class="fa-solid fa-plus"></i>
                      <span>Inscribir a Clínica Élite</span>
                    </a>
                  </div>

                  <!-- INSIGNIAS DESBLOQUEADAS (BÓVEDA DE RECOMPENSAS FUT) -->
                  <div class="section-box mt-2">
                    <h4 class="box-title"><i class="fa-solid fa-award text-amber"></i> Insignias Deportivas Desbloqueadas en Ficha 360°</h4>
                    <div class="insignias-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(240px, 1fr)); gap:1rem; margin-top:0.75rem;">
                      <div class="insignia-card" style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.3); border-radius:12px; padding:1rem; display:flex; gap:0.75rem; align-items:center;">
                        <div style="font-size:1.8rem; background:rgba(16,185,129,0.2); width:48px; height:48px; border-radius:10px; display:flex; align-items:center; justify-content:center;">
                          ⚡
                        </div>
                        <div>
                          <strong style="color:#ffffff; font-size:0.95rem; display:block;">Rayo de Aceleración Sub-12</strong>
                          <span style="color:#10b981; font-size:0.8rem; font-weight:700;">+4 Pliometría & Sprint 5m</span>
                          <span style="display:inline-block; font-size:0.7rem; color:#a7f3d0; background:rgba(16,185,129,0.2); padding:0.15rem 0.4rem; border-radius:4px; margin-top:0.25rem;">Certificado</span>
                        </div>
                      </div>

                      <div class="insignia-card" style="background:rgba(6,182,212,0.08); border:1px solid rgba(6,182,212,0.3); border-radius:12px; padding:1rem; display:flex; gap:0.75rem; align-items:center;">
                        <div style="font-size:1.8rem; background:rgba(6,182,212,0.2); width:48px; height:48px; border-radius:10px; display:flex; align-items:center; justify-content:center;">
                          🧠
                        </div>
                        <div>
                          <strong style="color:#ffffff; font-size:0.95rem; display:block;">Visión Periférica 360°</strong>
                          <span style="color:#06b6d4; font-size:0.8rem; font-weight:700;">+5 Neuro-Agilidad Fitlight</span>
                          <span style="display:inline-block; font-size:0.7rem; color:#bae6fd; background:rgba(6,182,212,0.2); padding:0.15rem 0.4rem; border-radius:4px; margin-top:0.25rem;">Certificado</span>
                        </div>
                      </div>

                      <div class="insignia-card" style="background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.3); border-radius:12px; padding:1rem; display:flex; gap:0.75rem; align-items:center;">
                        <div style="font-size:1.8rem; background:rgba(245,158,11,0.2); width:48px; height:48px; border-radius:10px; display:flex; align-items:center; justify-content:center;">
                          🪄
                        </div>
                        <div>
                          <strong style="color:#ffffff; font-size:0.95rem; display:block;">Maestro del Desborde 1v1</strong>
                          <span style="color:#f59e0b; font-size:0.8rem; font-weight:700;">+6 Fintas & Cambio de Ritmo</span>
                          <span style="display:inline-block; font-size:0.7rem; color:#fde68a; background:rgba(245,158,11,0.2); padding:0.15rem 0.4rem; border-radius:4px; margin-top:0.25rem;">En Progreso</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- LISTADO DE CLÍNICAS / PASES REGISTRADOS -->
                  <div class="section-box mt-3">
                    <h4 class="box-title"><i class="fa-solid fa-ticket text-emerald"></i> Historial de Inscripciones & Pases QR Oficiales</h4>
                    @if (selectedExpediente()!.clinicasInsignias && selectedExpediente()!.clinicasInsignias!.length > 0) {
                      <div class="table-responsive">
                        <table class="exp-fin-table">
                          <thead>
                            <tr>
                              <th>Clínica Especializada</th>
                              <th>Entrenador / Sede</th>
                              <th>Plan</th>
                              <th>Valor Pagado</th>
                              <th>Pase QR Ticket</th>
                              <th>Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (c of selectedExpediente()!.clinicasInsignias!; track c.id) {
                              <tr>
                                <td>
                                  <div class="font-bold text-white">{{ c.servicio_titulo }}</div>
                                  <small class="text-amber">{{ c.insignia_obtenida }}</small>
                                </td>
                                <td>
                                  <div>{{ c.entrenador_nombre }}</div>
                                  <small class="text-muted">{{ c.cancha_nombre }}</small>
                                </td>
                                <td><span class="badge badge-info">{{ c.tipo_plan }}</span></td>
                                <td><strong>\${{ c.monto_pagado | number }}</strong></td>
                                <td>
                                  <span style="background:rgba(255,255,255,0.1); padding:0.2rem 0.5rem; border-radius:4px; font-family:monospace; font-size:0.8rem; color:#10b981;">
                                    <i class="fa-solid fa-qrcode"></i> {{ c.codigo_qr_ticket?.substring(0, 12) }}...
                                  </span>
                                </td>
                                <td>
                                  <span class="badge badge-success">{{ c.estado_pago }}</span>
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    } @else {
                      <div class="empty-tab-state" style="padding:2rem; text-align:center; color:#94a3b8;">
                        <i class="fa-solid fa-graduation-cap" style="font-size:2.5rem; margin-bottom:0.75rem; color:#64748b;"></i>
                        <p>No registra inscripciones directas a clínicas este mes. Puedes inscribirlo desde el catálogo de Servicios.</p>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>

            <!-- Footer del Expediente 360° con Botones de Acción -->
            <div class="modal-actions">
              <button type="button" class="btn-secondary" (click)="closeExpediente()">
                <i class="fa-solid fa-xmark"></i> Cerrar Expediente
              </button>
              <button type="button" class="btn-primary" (click)="openEditModal(selectedExpediente()!.jugador); closeExpediente()">
                <i class="fa-solid fa-pen-to-square"></i> Editar Ficha del Jugador
              </button>
            </div>
          </div>
        </div>
      }

      <!-- =====================================================================
           MODAL: EDITAR FICHA DE JUGADOR (CON BOTONES DE ACCIÓN)
           ===================================================================== -->
      @if (showEditModal() && selectedPlayerToEdit()) {
        <div class="modal-backdrop" (click)="closeEditModal()">
          <div class="form-modal-card modal-lg edit-modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-amber">
                  <i class="fa-solid fa-user-pen"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Editar Ficha de Jugador</h2>
                  <p class="modal-subtitle">Atleta: <strong>{{ editPlayerData.nombres }} {{ editPlayerData.apellidos }}</strong> (Doc: {{ editPlayerData.numeroDocumento }})</p>
                </div>
              </div>
              <button class="modal-close-btn btn-close" (click)="closeEditModal()" aria-label="Cerrar">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form (ngSubmit)="submitEditJugador()" class="modal-form">
              <!-- Fotografía Oficial del Deportista -->
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-camera"></i> Fotografía Oficial del Atleta</span>
                <div 
                  class="athlete-photo-uploader"
                  (paste)="handlePhotoBoxPaste($event, 'edit')"
                  (dragover)="$event.preventDefault()"
                  (drop)="handlePhotoBoxDrop($event, 'edit')">
                  <div class="photo-preview-box">
                    <img 
                      [src]="resolvePhotoUrl(editPlayerData.fotoUrl, editPlayerData.genero, 'edit')" 
                      (error)="onPhotoPreviewError($event, 'edit')"
                      alt="Foto Atleta" 
                      class="athlete-photo-img" />
                    @if (uploadingPhoto()) {
                      <div class="photo-loading-overlay">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                      </div>
                    }
                  </div>
                  <div class="photo-controls">
                    <div class="photo-actions-row">
                      <input 
                        type="file" 
                        #editFileInput 
                        (change)="onPhotoSelected($event, 'edit')" 
                        accept="image/*" 
                        style="display: none" />
                      <button 
                        type="button" 
                        class="btn-upload-photo" 
                        (click)="editFileInput.click()" 
                        [disabled]="uploadingPhoto()">
                        <i class="fa-solid fa-cloud-arrow-up"></i>
                        <span>{{ uploadingPhoto() ? 'Subiendo imagen...' : 'Seleccionar Archivo de Foto' }}</span>
                      </button>
                      @if (editPlayerData.fotoUrl) {
                        <button 
                          type="button" 
                          class="btn-remove-photo" 
                          (click)="removePhoto('edit')"
                          title="Quitar foto actual">
                          <i class="fa-solid fa-trash-can"></i>
                          <span>Quitar</span>
                        </button>
                      }
                    </div>
                    <p class="photo-hint">Formatos: PNG, JPG, WEBP. Arrastra una imagen o pega directamente (Ctrl+V).</p>
                    <div class="url-input-wrap">
                      <label><i class="fa-solid fa-link"></i> O ingresar / pegar URL directa de la imagen:</label>
                      <div class="url-input-inner">
                        <input 
                          type="text" 
                          [(ngModel)]="editPlayerData.fotoUrl" 
                          (ngModelChange)="onPhotoUrlChange($event, 'edit')"
                          (paste)="onPhotoUrlPaste($event, 'edit')"
                          name="epFotoUrl" 
                          placeholder="/uploads/... o https://ejemplo.com/atleta.jpg" 
                          class="sport-input url-input" />
                        <button 
                          type="button" 
                          class="btn-paste-clipboard" 
                          (click)="pasteFromClipboard('edit')"
                          title="Pegar desde el portapapeles">
                          <i class="fa-regular fa-clipboard"></i>
                          <span>Pegar</span>
                        </button>
                        @if (editPlayerData.fotoUrl) {
                          <button 
                            type="button" 
                            class="btn-clear-url" 
                            (click)="removePhoto('edit')"
                            title="Limpiar URL">
                            <i class="fa-solid fa-xmark"></i>
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sección 1: Datos Personales -->
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-id-card"></i> 1. Datos Personales & Identificación</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-user"></i> Nombres <span class="required-star">*</span></label>
                    <input type="text" [(ngModel)]="editPlayerData.nombres" name="epNombres" required class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-user"></i> Apellidos <span class="required-star">*</span></label>
                    <input type="text" [(ngModel)]="editPlayerData.apellidos" name="epApellidos" required class="sport-input" />
                  </div>
                </div>

                <div class="form-row g3">
                  <div class="input-group">
                    <label><i class="fa-solid fa-address-card"></i> Tipo Documento <span class="required-star">*</span></label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="editPlayerData.tipoDocumento" name="epTipoDoc" class="sport-input">
                        @for (td of tiposDocumento(); track td.codigo) {
                          <option [value]="td.codigo">{{ td.icono }} {{ td.nombre }}</option>
                        }
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-barcode"></i> No. Documento <span class="required-star">*</span></label>
                    <input type="text" [(ngModel)]="editPlayerData.numeroDocumento" name="epDoc" required class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-regular fa-calendar"></i> Fecha Nacimiento <span class="required-star">*</span></label>
                    <input type="text" appFlatpickr placeholder="dd/mm/aaaa" [(ngModel)]="editPlayerData.fechaNacimiento" name="epFechaNac" required class="sport-input" />
                  </div>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-venus-mars"></i> Género / Rama</label>
                    <div class="segmented-pill-selector">
                      <button type="button" class="pill-btn" [class.active]="editPlayerData.genero === 'MASCULINO'" (click)="editPlayerData.genero = 'MASCULINO'">
                        <i class="fa-solid fa-mars"></i> Masculino
                      </button>
                      <button type="button" class="pill-btn" [class.active]="editPlayerData.genero === 'FEMENINO'" (click)="editPlayerData.genero = 'FEMENINO'">
                        <i class="fa-solid fa-venus"></i> Femenino
                      </button>
                    </div>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="editPlayerData.genero" name="epGenero" class="sport-input">
                        <option value="MASCULINO">⚽ Rama Masculina</option>
                        <option value="FEMENINO">⚽ Rama Femenina</option>
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-hospital-user"></i> Entidad EPS / Seguro Médico</label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="editPlayerData.eps" name="epEps" class="sport-input">
                        <option value="">-- Seleccionar EPS / Seguro Médico --</option>
                        @for (eps of epsList(); track eps.codigo) {
                          <option [value]="eps.nombre">{{ eps.nombre }}</option>
                        }
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sección 2: Datos Deportivos & Matrícula -->
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-futbol"></i> 2. Perfil Deportivo & Estado de Matrícula</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-layer-group"></i> Categoría Deportiva <span class="required-star">*</span></label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="editPlayerData.categoriaId" name="epCat" class="sport-input" required>
                        @for (c of categorias(); track c.id) {
                          <option [value]="c.id">🏆 {{ c.nombre }} ({{ c.codigo_categoria }} • {{ c.anio_nacimiento_min }}-{{ c.anio_nacimiento_max }})</option>
                        }
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-toggle-on"></i> Estado de Matrícula <span class="required-star">*</span></label>
                    <div class="status-pills-selector">
                      <button type="button" class="status-btn" [class.active-activo]="editPlayerData.estadoMatricula === 'ACTIVO'" (click)="editPlayerData.estadoMatricula = 'ACTIVO'">
                        <span class="status-dot"></span> ACTIVO
                      </button>
                      <button type="button" class="status-btn" [class.active-lesionado]="editPlayerData.estadoMatricula === 'LESIONADO'" (click)="editPlayerData.estadoMatricula = 'LESIONADO'">
                        <span class="status-dot"></span> LESIÓN
                      </button>
                      <button type="button" class="status-btn" [class.active-inactivo]="editPlayerData.estadoMatricula === 'INACTIVO'" (click)="editPlayerData.estadoMatricula = 'INACTIVO'">
                        <span class="status-dot"></span> INACTIVO
                      </button>
                      <button type="button" class="status-btn" [class.active-retirado]="editPlayerData.estadoMatricula === 'RETIRADO'" (click)="editPlayerData.estadoMatricula = 'RETIRADO'">
                        <span class="status-dot"></span> RETIRO
                      </button>
                    </div>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="editPlayerData.estadoMatricula" name="epEstado" class="sport-input" required>
                        <option value="ACTIVO">🟢 ACTIVO — En competencia oficial</option>
                        <option value="INACTIVO">⚪ INACTIVO — En pausa administrativa</option>
                        <option value="LESIONADO">🟡 LESIONADO — En departamento médico</option>
                        <option value="RETIRADO">🔴 RETIRADO — Baja definitiva</option>
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-compass"></i> Posición Principal (Primaria) <span class="required-star">*</span></label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="editPlayerData.posicionPrincipal" name="epPos1" class="sport-input" required>
                        <optgroup label="🧤 PORTERÍA & ARQUEROS">
                          <option value="Arquero">🧤 Portero / Arquero Titular</option>
                          <option value="Portero">🧤 Guardameta</option>
                        </optgroup>
                        <optgroup label="🛡️ LÍNEA DEFENSIVA">
                          <option value="Defensa Central">🛡️ Defensa Central (Zaguero)</option>
                          <option value="Lateral Derecho">⚡ Lateral Derecho (Carrilero)</option>
                          <option value="Lateral Izquierdo">⚡ Lateral Izquierdo (Carrilero)</option>
                        </optgroup>
                        <optgroup label="⚙️ MEDIOCAMPO & CREACIÓN">
                          <option value="Volante de Marca">🛡️ Volante de Marca / Pivote (5)</option>
                          <option value="Volante Mixto">⚙️ Volante Mixto / Interior (8)</option>
                          <option value="Volante Ofensivo (10)">🎯 Volante Ofensivo / Enganche (10)</option>
                          <option value="Volante Creativo / 10">✨ Volante Creativo / Creador</option>
                        </optgroup>
                        <optgroup label="⚡ DELANTERA & ATAQUE">
                          <option value="Extremo Derecho">⚡ Extremo Derecho (Punta)</option>
                          <option value="Extremo Izquierdo">⚡ Extremo Izquierdo (Punta)</option>
                          <option value="Delantero Centro">⚽ Delantero Centro (9 de Área)</option>
                          <option value="Segundo Delantero">🎯 Segundo Delantero</option>
                        </optgroup>
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>

                  <div class="input-group">
                    <label><i class="fa-solid fa-location-crosshairs"></i> Posición Secundaria (Polifuncionalidad)</label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="editPlayerData.posicionSecundaria" name="epPosSec" class="sport-input">
                        <option value="">— Ninguna (Especialista Único) —</option>
                        <optgroup label="🧤 PORTERÍA & ARQUEROS">
                          <option value="Arquero">🧤 Portero / Arquero Alterno</option>
                        </optgroup>
                        <optgroup label="🛡️ LÍNEA DEFENSIVA">
                          <option value="Defensa Central">🛡️ Defensa Central (Zaguero)</option>
                          <option value="Lateral Derecho">⚡ Lateral Derecho (Carrilero)</option>
                          <option value="Lateral Izquierdo">⚡ Lateral Izquierdo (Carrilero)</option>
                        </optgroup>
                        <optgroup label="⚙️ MEDIOCAMPO & CREACIÓN">
                          <option value="Volante de Marca">🛡️ Volante de Marca / Pivote (5)</option>
                          <option value="Volante Mixto">⚙️ Volante Mixto / Interior (8)</option>
                          <option value="Volante Ofensivo (10)">🎯 Volante Ofensivo / Enganche (10)</option>
                          <option value="Volante Creativo / 10">✨ Volante Creativo</option>
                        </optgroup>
                        <optgroup label="⚡ DELANTERA & ATAQUE">
                          <option value="Extremo Derecho">⚡ Extremo Derecho (Punta)</option>
                          <option value="Extremo Izquierdo">⚡ Extremo Izquierdo (Punta)</option>
                          <option value="Delantero Centro">⚽ Delantero Centro (9 de Área)</option>
                          <option value="Segundo Delantero">🎯 Segundo Delantero</option>
                        </optgroup>
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-shoe-prints"></i> Pierna Hábil / Perfil</label>
                    <div class="segmented-pill-selector">
                      <button type="button" class="pill-btn" [class.active]="editPlayerData.piernaHabil === 'DIESTRO'" (click)="editPlayerData.piernaHabil = 'DIESTRO'">
                        <i class="fa-solid fa-shoe-prints"></i> Diestro
                      </button>
                      <button type="button" class="pill-btn" [class.active]="editPlayerData.piernaHabil === 'ZURDO'" (click)="editPlayerData.piernaHabil = 'ZURDO'">
                        <i class="fa-solid fa-shoe-prints fa-flip-horizontal"></i> Zurdo
                      </button>
                      <button type="button" class="pill-btn" [class.active]="editPlayerData.piernaHabil === 'AMBIDIESTRO'" (click)="editPlayerData.piernaHabil = 'AMBIDIESTRO'">
                        <i class="fa-solid fa-repeat"></i> Ambidextro
                      </button>
                    </div>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="editPlayerData.piernaHabil" name="epPierna" class="sport-input">
                        @for (ph of piernasHabiles(); track ph.codigo) {
                          <option [value]="ph.codigo">{{ ph.nombre }}</option>
                        }
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-shirt"></i> Número Dorsal Asignado</label>
                    <input type="number" [(ngModel)]="editPlayerData.numeroDorsal" name="epDorsal" min="1" max="99" class="sport-input" />
                  </div>
                </div>

                <div class="form-row">
                  <div class="input-group">
                    <label><i class="fa-solid fa-hand-holding-dollar"></i> Porcentaje de Beca (%)</label>
                    <input type="number" [(ngModel)]="editPlayerData.porcentajeBeca" name="epBeca" min="0" max="100" class="sport-input" />
                  </div>
                </div>
              </div>

              <!-- BOTONES DE ACCIÓN (FOOTER) -->
              <div class="modal-actions">
                <button type="button" class="btn-secondary btn-cancel" (click)="closeEditModal()">
                  <i class="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button type="submit" class="btn-primary btn-submit" [disabled]="savingPlayer">
                  <i class="fa-solid fa-floppy-disk"></i>
                  <span>{{ savingPlayer ? 'Guardando...' : 'Guardar Cambios' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- =====================================================================
           MODAL: INSCRIBIR NUEVO JUGADOR
           ===================================================================== -->
      <!-- =====================================================================
           MODAL: INSCRIBIR NUEVO JUGADOR (CON STEPPER DE 3 PASOS)
           ===================================================================== -->
      @if (showCreateModal()) {
        <div class="modal-backdrop" (click)="closeCreateModal()">
          <div class="form-modal-card modal-xl stepper-modal-card" (click)="$event.stopPropagation()">
            <!-- Header del Modal -->
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-user-plus"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Inscribir Nuevo Jugador</h2>
                  <p class="modal-subtitle">Ficha integral de matrícula deportiva en 3 sencillos pasos</p>
                </div>
              </div>
              <button class="modal-close-btn btn-close" (click)="closeCreateModal()" aria-label="Cerrar">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <!-- BARRA INDICADORA DEL STEPPER (3 PASOS) -->
            <div class="modal-stepper-nav">
              <div 
                class="step-item" 
                [class.active]="createStep() === 1" 
                [class.completed]="createStep() > 1"
                (click)="setCreateStep(1)">
                <div class="step-circle">
                  @if (createStep() > 1) {
                    <i class="fa-solid fa-check"></i>
                  } @else {
                    <span>1</span>
                  }
                </div>
                <div class="step-label-wrap">
                  <span class="step-number">PASO 1</span>
                  <span class="step-title">Datos Personales & Foto</span>
                </div>
              </div>

              <div class="step-connector" [class.filled]="createStep() > 1"></div>

              <div 
                class="step-item" 
                [class.active]="createStep() === 2" 
                [class.completed]="createStep() > 2"
                (click)="setCreateStep(2)">
                <div class="step-circle">
                  @if (createStep() > 2) {
                    <i class="fa-solid fa-check"></i>
                  } @else {
                    <span>2</span>
                  }
                </div>
                <div class="step-label-wrap">
                  <span class="step-number">PASO 2</span>
                  <span class="step-title">Perfil Deportivo & Dorsal</span>
                </div>
              </div>

              <div class="step-connector" [class.filled]="createStep() > 2"></div>

              <div 
                class="step-item" 
                [class.active]="createStep() === 3"
                (click)="setCreateStep(3)">
                <div class="step-circle">
                  <span>3</span>
                </div>
                <div class="step-label-wrap">
                  <span class="step-number">PASO 3</span>
                  <span class="step-title">Familia & Confirmación</span>
                </div>
              </div>
            </div>

            <!-- FORMULARIO CON VISTAS POR PASO -->
            <form (ngSubmit)="submitCreateJugador()" class="modal-form">
              <!-- PASO 1: DATOS PERSONALES, IDENTIFICACIÓN & FOTOGRAFÍA -->
              @if (createStep() === 1) {
                <div class="stepper-step-pane animate-fade">
                  <!-- Fotografía Oficial del Deportista -->
                  <div class="modal-section">
                    <span class="modal-section-title"><i class="fa-solid fa-camera"></i> Fotografía Oficial del Atleta</span>
                    <div 
                      class="athlete-photo-uploader"
                      (paste)="handlePhotoBoxPaste($event, 'create')"
                      (dragover)="$event.preventDefault()"
                      (drop)="handlePhotoBoxDrop($event, 'create')">
                      <div class="photo-preview-box">
                        <img 
                          [src]="resolvePhotoUrl(newPlayerData.fotoUrl, newPlayerData.genero, 'create')" 
                          (error)="onPhotoPreviewError($event, 'create')"
                          alt="Foto Atleta" 
                          class="athlete-photo-img" />
                        @if (uploadingPhoto()) {
                          <div class="photo-loading-overlay">
                            <i class="fa-solid fa-spinner fa-spin"></i>
                          </div>
                        }
                      </div>
                      <div class="photo-controls">
                        <div class="photo-actions-row">
                          <input 
                            type="file" 
                            #createFileInput 
                            (change)="onPhotoSelected($event, 'create')" 
                            accept="image/*" 
                            style="display: none" />
                          <button 
                            type="button" 
                            class="btn-upload-photo" 
                            (click)="createFileInput.click()" 
                            [disabled]="uploadingPhoto()">
                            <i class="fa-solid fa-cloud-arrow-up"></i>
                            <span>{{ uploadingPhoto() ? 'Subiendo imagen...' : 'Seleccionar Archivo de Foto' }}</span>
                          </button>
                          @if (newPlayerData.fotoUrl) {
                            <button 
                              type="button" 
                              class="btn-remove-photo" 
                              (click)="removePhoto('create')"
                              title="Quitar foto actual">
                              <i class="fa-solid fa-trash-can"></i>
                              <span>Quitar</span>
                            </button>
                          }
                        </div>
                        <p class="photo-hint">Formatos: PNG, JPG, WEBP. Arrastra una imagen o pega directamente (Ctrl+V).</p>
                        <div class="url-input-wrap">
                          <label><i class="fa-solid fa-link"></i> O ingresar / pegar URL directa de la imagen:</label>
                          <div class="url-input-inner">
                            <input 
                              type="text" 
                              [(ngModel)]="newPlayerData.fotoUrl" 
                              (ngModelChange)="onPhotoUrlChange($event, 'create')"
                              (paste)="onPhotoUrlPaste($event, 'create')"
                              name="npFotoUrl" 
                              placeholder="/uploads/... o https://ejemplo.com/atleta.jpg" 
                              class="sport-input url-input" />
                            <button 
                              type="button" 
                              class="btn-paste-clipboard" 
                              (click)="pasteFromClipboard('create')"
                              title="Pegar desde el portapapeles">
                              <i class="fa-regular fa-clipboard"></i>
                              <span>Pegar</span>
                            </button>
                            @if (newPlayerData.fotoUrl) {
                              <button 
                                type="button" 
                                class="btn-clear-url" 
                                (click)="removePhoto('create')"
                                title="Limpiar URL">
                                <i class="fa-solid fa-xmark"></i>
                              </button>
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Datos Personales & Documento -->
                  <div class="modal-section">
                    <span class="modal-section-title"><i class="fa-solid fa-id-card"></i> Datos Personales & Identificación Legal</span>
                    <div class="form-row g2">
                      <div class="input-group">
                        <label><i class="fa-solid fa-user"></i> Nombres <span class="required-star">*</span></label>
                        <input type="text" [(ngModel)]="newPlayerData.nombres" name="npNombres" placeholder="ej. Tomás Mateo" required class="sport-input" />
                      </div>
                      <div class="input-group">
                        <label><i class="fa-solid fa-user"></i> Apellidos <span class="required-star">*</span></label>
                        <input type="text" [(ngModel)]="newPlayerData.apellidos" name="npApellidos" placeholder="ej. Gómez Restrepo" required class="sport-input" />
                      </div>
                    </div>

                    <div class="form-row g3">
                      <div class="input-group">
                        <label><i class="fa-solid fa-address-card"></i> Tipo Documento <span class="required-star">*</span></label>
                        <div class="sport-select-wrapper">
                          <select [(ngModel)]="newPlayerData.tipoDocumento" name="npTipoDoc" class="sport-input">
                            @for (td of tiposDocumento(); track td.codigo) {
                              <option [value]="td.codigo">{{ td.icono }} {{ td.nombre }}</option>
                            }
                          </select>
                          <i class="fa-solid fa-chevron-down select-chevron"></i>
                        </div>
                      </div>
                      <div class="input-group">
                        <label><i class="fa-solid fa-barcode"></i> No. Documento <span class="required-star">*</span></label>
                        <input type="text" [(ngModel)]="newPlayerData.numeroDocumento" name="npDoc" placeholder="1023456789" required class="sport-input" />
                      </div>
                      <div class="input-group">
                        <label><i class="fa-regular fa-calendar"></i> Fecha Nacimiento <span class="required-star">*</span></label>
                        <input type="text" appFlatpickr placeholder="dd/mm/aaaa" [(ngModel)]="newPlayerData.fechaNacimiento" name="npFechaNac" required class="sport-input" />
                      </div>
                    </div>

                    <div class="form-row g2">
                      <div class="input-group">
                        <label><i class="fa-solid fa-venus-mars"></i> Rama / Género</label>
                        <div class="segmented-pill-selector">
                          <button type="button" class="pill-btn" [class.active]="newPlayerData.genero === 'MASCULINO'" (click)="newPlayerData.genero = 'MASCULINO'">
                            <i class="fa-solid fa-mars"></i> Masculino
                          </button>
                          <button type="button" class="pill-btn" [class.active]="newPlayerData.genero === 'FEMENINO'" (click)="newPlayerData.genero = 'FEMENINO'">
                            <i class="fa-solid fa-venus"></i> Femenino
                          </button>
                        </div>
                      </div>
                      <div class="input-group">
                        <label><i class="fa-solid fa-hospital-user"></i> Entidad EPS / Seguro Médico</label>
                        <div class="sport-select-wrapper">
                          <select [(ngModel)]="newPlayerData.eps" name="npEps" class="sport-input">
                            <option value="">-- Seleccionar EPS / Seguro Médico --</option>
                            @for (eps of epsList(); track eps.codigo) {
                              <option [value]="eps.nombre">{{ eps.nombre }}</option>
                            }
                          </select>
                          <i class="fa-solid fa-chevron-down select-chevron"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Footer del Paso 1 -->
                  <div class="modal-actions step-actions">
                    <button type="button" class="btn-secondary btn-cancel" (click)="closeCreateModal()">
                      <i class="fa-solid fa-xmark"></i> Cancelar
                    </button>
                    <button type="button" class="btn-primary" (click)="nextCreateStep()" [disabled]="!isStep1Valid()">
                      <span>Siguiente: Perfil Deportivo</span>
                      <i class="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              }

              <!-- PASO 2: PERFIL DEPORTIVO, CATEGORÍA, DORSAL & POSICIONES -->
              @if (createStep() === 2) {
                <div class="stepper-step-pane animate-fade">
                  <div class="modal-section">
                    <span class="modal-section-title"><i class="fa-solid fa-futbol"></i> Perfil Deportivo, Categoría & Dorsal</span>
                    
                    <div class="form-row g2">
                      <div class="input-group">
                        <label><i class="fa-solid fa-shield"></i> Categoría Deportiva <span class="required-star">*</span></label>
                        <div class="sport-select-wrapper">
                          <select [(ngModel)]="newPlayerData.categoriaId" name="npCat" required class="sport-input">
                            <option value="" disabled>Selecciona una categoría...</option>
                            @for (cat of categorias(); track cat.id) {
                              <option [value]="cat.id">🏆 {{ cat.nombre }} ({{ cat.codigo_categoria }} • {{ cat.anio_nacimiento_min }}-{{ cat.anio_nacimiento_max }})</option>
                            }
                          </select>
                          <i class="fa-solid fa-chevron-down select-chevron"></i>
                        </div>
                      </div>
                      <div class="input-group">
                        <label><i class="fa-solid fa-shirt"></i> Número Dorsal Asignado (1-99)</label>
                        <input type="number" [(ngModel)]="newPlayerData.numeroDorsal" name="npDorsal" min="1" max="99" placeholder="ej. 10" class="sport-input" />
                      </div>
                    </div>

                    <div class="form-row g2">
                      <div class="input-group">
                        <label><i class="fa-solid fa-compass"></i> Posición Principal (Táctica) <span class="required-star">*</span></label>
                        <div class="sport-select-wrapper">
                          <select [(ngModel)]="newPlayerData.posicionPrincipal" name="npPos" required class="sport-input">
                            <optgroup label="🧤 PORTERÍA & ARQUEROS">
                              <option value="Arquero">🧤 Portero / Arquero Titular</option>
                              <option value="Portero">🧤 Guardameta</option>
                            </optgroup>
                            <optgroup label="🛡️ LÍNEA DEFENSIVA">
                              <option value="Defensa Central">🛡️ Defensa Central (Zaguero)</option>
                              <option value="Lateral Derecho">⚡ Lateral Derecho (Carrilero)</option>
                              <option value="Lateral Izquierdo">⚡ Lateral Izquierdo (Carrilero)</option>
                            </optgroup>
                            <optgroup label="⚙️ MEDIOCAMPO & CREACIÓN">
                              <option value="Volante de Marca">🛡️ Volante de Marca / Pivote (5)</option>
                              <option value="Volante Mixto">⚙️ Volante Mixto / Interior (8)</option>
                              <option value="Volante Ofensivo (10)">🎯 Volante Ofensivo / Enganche (10)</option>
                            </optgroup>
                            <optgroup label="⚡ DELANTERA & ATAQUE">
                              <option value="Extremo Derecho">⚡ Extremo Derecho (Punta)</option>
                              <option value="Extremo Izquierdo">⚡ Extremo Izquierdo (Punta)</option>
                              <option value="Delantero Centro">⚽ Delantero Centro (9 de Área)</option>
                              <option value="Segundo Delantero">🎯 Segundo Delantero</option>
                            </optgroup>
                          </select>
                          <i class="fa-solid fa-chevron-down select-chevron"></i>
                        </div>
                      </div>
                      <div class="input-group">
                        <label><i class="fa-solid fa-location-crosshairs"></i> Posición Secundaria (Polifuncional)</label>
                        <div class="sport-select-wrapper">
                          <select [(ngModel)]="newPlayerData.posicionSecundaria" name="npPosSec" class="sport-input">
                            <option value="">— Ninguna (Especialista Único) —</option>
                            <option value="Arquero">🧤 Portero / Arquero</option>
                            <option value="Defensa Central">🛡️ Defensa Central</option>
                            <option value="Lateral Derecho">⚡ Lateral Derecho</option>
                            <option value="Lateral Izquierdo">⚡ Lateral Izquierdo</option>
                            <option value="Volante de Marca">🛡️ Volante de Marca (5)</option>
                            <option value="Volante Mixto">⚙️ Volante Mixto (8)</option>
                            <option value="Volante Ofensivo (10)">🎯 Volante Ofensivo (10)</option>
                            <option value="Extremo Derecho">⚡ Extremo Derecho</option>
                            <option value="Extremo Izquierdo">⚡ Extremo Izquierdo</option>
                            <option value="Delantero Centro">⚽ Delantero Centro</option>
                          </select>
                          <i class="fa-solid fa-chevron-down select-chevron"></i>
                        </div>
                      </div>
                    </div>

                    <div class="form-row g2">
                      <div class="input-group">
                        <label><i class="fa-solid fa-shoe-prints"></i> Pierna Hábil / Perfil</label>
                        <div class="segmented-pill-selector">
                          <button type="button" class="pill-btn" [class.active]="newPlayerData.piernaHabil === 'DIESTRO'" (click)="newPlayerData.piernaHabil = 'DIESTRO'">
                            <i class="fa-solid fa-shoe-prints"></i> Diestro
                          </button>
                          <button type="button" class="pill-btn" [class.active]="newPlayerData.piernaHabil === 'ZURDO'" (click)="newPlayerData.piernaHabil = 'ZURDO'">
                            <i class="fa-solid fa-shoe-prints fa-flip-horizontal"></i> Zurdo
                          </button>
                          <button type="button" class="pill-btn" [class.active]="newPlayerData.piernaHabil === 'AMBIDIESTRO'" (click)="newPlayerData.piernaHabil = 'AMBIDIESTRO'">
                            <i class="fa-solid fa-repeat"></i> Ambidextro
                          </button>
                        </div>
                      </div>
                      <div class="input-group">
                        <label><i class="fa-solid fa-toggle-on"></i> Estado Inicial de Matrícula</label>
                        <div class="sport-select-wrapper">
                          <select [(ngModel)]="newPlayerData.estadoMatricula" name="npEstado" class="sport-input">
                            <option value="ACTIVO">🟢 ACTIVO — En competencia oficial</option>
                            <option value="LESIONADO">🟡 LESIONADO — En departamento médico</option>
                            <option value="INACTIVO">⚪ INACTIVO — En pausa administrativa</option>
                          </select>
                          <i class="fa-solid fa-chevron-down select-chevron"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Footer del Paso 2 -->
                  <div class="modal-actions step-actions">
                    <button type="button" class="btn-secondary" (click)="prevCreateStep()">
                      <i class="fa-solid fa-arrow-left"></i>
                      <span>Atrás: Datos Personales</span>
                    </button>
                    <button type="button" class="btn-primary" (click)="nextCreateStep()" [disabled]="!isStep2Valid()">
                      <span>Siguiente: Núcleo Familiar</span>
                      <i class="fa-solid fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
              }

              <!-- PASO 3: NÚCLEO FAMILIAR & CONFIRMACIÓN FINAL -->
              @if (createStep() === 3) {
                <div class="stepper-step-pane animate-fade">
                  <!-- Datos del Acudiente Principal -->
                  <div class="modal-section">
                    <span class="modal-section-title"><i class="fa-solid fa-people-roof"></i> Acudiente / Contacto Familiar Principal (Recomendado)</span>
                    <div class="form-row g2">
                      <div class="input-group">
                        <label><i class="fa-solid fa-user-tie"></i> Nombres del Acudiente</label>
                        <input type="text" [(ngModel)]="newPlayerData.acudienteNombres" name="npAcNom" placeholder="ej. Carlos Eduardo" class="sport-input" />
                      </div>
                      <div class="input-group">
                        <label><i class="fa-solid fa-user-tie"></i> Apellidos del Acudiente</label>
                        <input type="text" [(ngModel)]="newPlayerData.acudienteApellidos" name="npAcApe" placeholder="ej. Gómez Palacio" class="sport-input" />
                      </div>
                    </div>

                    <div class="form-row g3">
                      <div class="input-group">
                        <label><i class="fa-solid fa-person-breastfeeding"></i> Parentesco</label>
                        <div class="sport-select-wrapper">
                          <select [(ngModel)]="newPlayerData.acudienteParentesco" name="npAcPar" class="sport-input">
                            @for (par of parentescos(); track par.codigo) {
                              <option [value]="par.codigo">{{ par.nombre }}</option>
                            }
                          </select>
                          <i class="fa-solid fa-chevron-down select-chevron"></i>
                        </div>
                      </div>
                      <div class="input-group">
                        <label><i class="fa-brands fa-whatsapp"></i> Teléfono Móvil (WhatsApp)</label>
                        <input type="tel" [(ngModel)]="newPlayerData.acudienteTelefono" name="npAcTel" placeholder="+57 310 123 4567" class="sport-input" />
                      </div>
                      <div class="input-group">
                        <label><i class="fa-solid fa-envelope"></i> Correo Electrónico</label>
                        <input type="email" [(ngModel)]="newPlayerData.acudienteEmail" name="npAcEmail" placeholder="padre.familia@gmail.com" class="sport-input" />
                      </div>
                    </div>
                  </div>

                  <!-- Resumen de Confirmación (Ficha Preview) -->
                  <div class="modal-section preview-section">
                    <span class="modal-section-title"><i class="fa-solid fa-clipboard-check"></i> Resumen de Ficha Deportiva Pre-Inscripción</span>
                    <div class="pre-inscription-summary-card">
                      <div class="pisc-avatar">
                        <img [src]="resolvePhotoUrl(newPlayerData.fotoUrl, newPlayerData.genero, 'create')" alt="Atleta" />
                        <span class="pisc-dorsal">#{{ newPlayerData.numeroDorsal || '-' }}</span>
                      </div>
                      <div class="pisc-info">
                        <div class="pisc-name-row">
                          <h4>{{ newPlayerData.nombres || 'Nombre Atleta' }} {{ newPlayerData.apellidos || 'Apellidos' }}</h4>
                          <span class="status-badge activo"><span class="status-dot"></span> {{ newPlayerData.estadoMatricula }}</span>
                        </div>
                        <div class="pisc-pills-row">
                          <span class="meta-pill"><i class="fa-solid fa-id-card"></i> {{ newPlayerData.tipoDocumento }} {{ newPlayerData.numeroDocumento || 'Sin documento' }}</span>
                          <span class="meta-pill"><i class="fa-solid fa-cake-candles"></i> {{ getEdad(newPlayerData.fechaNacimiento) }} años</span>
                          <span class="meta-pill"><i class="fa-solid fa-shield"></i> {{ getSelectedCategoryNameForId(newPlayerData.categoriaId) }}</span>
                          <span class="meta-pill"><i class="fa-solid fa-futbol"></i> {{ newPlayerData.posicionPrincipal }} ({{ newPlayerData.piernaHabil }})</span>
                        </div>
                        @if (newPlayerData.acudienteNombres) {
                          <div class="pisc-acudiente-note">
                            <i class="fa-solid fa-user-check"></i> Acudiente: <strong>{{ newPlayerData.acudienteNombres }} {{ newPlayerData.acudienteApellidos }}</strong> ({{ newPlayerData.acudienteParentesco }}) • Tel: {{ newPlayerData.acudienteTelefono || 'Sin tel' }}
                          </div>
                        }
                      </div>
                    </div>
                  </div>

                  <!-- Footer del Paso 3 -->
                  <div class="modal-actions step-actions">
                    <button type="button" class="btn-secondary" (click)="prevCreateStep()">
                      <i class="fa-solid fa-arrow-left"></i>
                      <span>Atrás: Perfil Deportivo</span>
                    </button>
                    <button type="submit" class="btn-primary btn-submit" [disabled]="savingPlayer">
                      <i class="fa-solid fa-user-check"></i>
                      <span>{{ savingPlayer ? 'Guardando en BD...' : '⚽ Confirmar e Inscribir Jugador' }}</span>
                    </button>
                  </div>
                </div>
              }
            </form>
          </div>
        </div>
      }

      <!-- =====================================================================
           MODAL: REGISTRAR MEDICIÓN BIOMÉTRICA
           ===================================================================== -->
      @if (showBiometriaModal() && selectedPlayerForBio()) {
        <div class="modal-backdrop" (click)="closeBiometriaModal()">
          <div class="bio-modal-card modal-xl" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-heart-pulse"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Evaluación Biométrica</h2>
                  <p class="modal-subtitle">Atleta: <strong>{{ selectedPlayerForBio()!.nombres }} {{ selectedPlayerForBio()!.apellidos }}</strong></p>
                </div>
              </div>
              <button class="modal-close-btn btn-close" (click)="closeBiometriaModal()" aria-label="Cerrar">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form (ngSubmit)="submitBiometria()" class="modal-form">
              <div class="modal-form-grid-2col">
                <!-- Columna Izquierda: Antropometría Básica & Preview IMC -->
                <div class="modal-col">
                  <div class="modal-section">
                    <span class="modal-section-title"><i class="fa-solid fa-weight-scale"></i> 1. Antropometría Básica</span>
                    <div class="form-row g2">
                      <div class="input-group">
                        <label><i class="fa-solid fa-ruler-vertical"></i> Estatura / Talla (cm) <span class="required-star">*</span></label>
                        <input 
                          type="number" 
                          step="0.1" 
                          [(ngModel)]="newBioData.tallaCm" 
                          name="bioTalla" 
                          placeholder="ej. 168.5" 
                          required 
                          class="sport-input" />
                      </div>
                      <div class="input-group">
                        <label><i class="fa-solid fa-weight-hanging"></i> Peso Corporal (Kg) <span class="required-star">*</span></label>
                        <input 
                          type="number" 
                          step="0.1" 
                          [(ngModel)]="newBioData.pesoKg" 
                          name="bioPeso" 
                          placeholder="ej. 58.2" 
                          required 
                          class="sport-input" />
                      </div>
                    </div>

                    <!-- IMC Preview Calculado en Vivo -->
                    @if (newBioData.tallaCm > 0 && newBioData.pesoKg > 0) {
                      <div class="imc-live-preview">
                        <span>Índice de Masa Corporal (IMC) Calculado:</span>
                        <strong>{{ calculateLiveImc() }}</strong>
                        <span class="imc-tag" [class]="getImcClass(calculateLiveImc())">
                          {{ getImcLabel(calculateLiveImc()) }}
                        </span>
                      </div>
                    }
                  </div>
                </div>

                <!-- Columna Derecha: Pruebas de Rendimiento & Observaciones -->
                <div class="modal-col">
                  <div class="modal-section">
                    <span class="modal-section-title"><i class="fa-solid fa-gauge-high"></i> 2. Pruebas de Rendimiento Físico</span>
                    <div class="form-row g3">
                      <div class="input-group">
                        <label><i class="fa-solid fa-person-running"></i> Test Cooper (m)</label>
                        <input type="number" [(ngModel)]="newBioData.testCooperMetros" name="bioCooper" placeholder="ej. 2800" class="sport-input" />
                      </div>
                      <div class="input-group">
                        <label><i class="fa-solid fa-bolt"></i> Sprint 30m (s)</label>
                        <input type="number" step="0.01" [(ngModel)]="newBioData.velocidad30mSeg" name="bioVel" placeholder="ej. 3.90" class="sport-input" />
                      </div>
                      <div class="input-group">
                        <label><i class="fa-solid fa-arrows-up-down"></i> Salto Vert. (cm)</label>
                        <input type="number" step="0.5" [(ngModel)]="newBioData.saltoVerticalCm" name="bioSalto" placeholder="ej. 45.0" class="sport-input" />
                      </div>
                    </div>
                  </div>

                  <div class="modal-section">
                    <span class="modal-section-title"><i class="fa-solid fa-clipboard-user"></i> 3. Observaciones del DT / Evaluador</span>
                    <div class="input-group">
                      <textarea 
                        [(ngModel)]="newBioData.observaciones" 
                        name="bioObs" 
                        rows="2" 
                        placeholder="Notas sobre el estado físico, potencia o nutrición..." 
                        class="sport-input"></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary btn-cancel" (click)="closeBiometriaModal()">
                  <i class="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button type="submit" class="btn-primary btn-submit" [disabled]="savingBio">
                  <i class="fa-solid fa-floppy-disk"></i>
                  <span>{{ savingBio ? 'Guardando...' : 'Registrar Medición' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- =====================================================================
           MODAL: CONFIRMACIÓN DE BAJA / RETIRO DE ATLETA
           ===================================================================== -->
      @if (showDeleteConfirmModal() && selectedPlayerToDelete()) {
        <div class="modal-backdrop" (click)="closeDeleteConfirmModal()">
          <div class="delete-confirm-modal-card modal-md" (click)="$event.stopPropagation()">
            <!-- Header Destructivo -->
            <div class="modal-header header-danger">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge badge-danger-glow">
                  <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Confirmar Retiro del Jugador</h2>
                  <p class="modal-subtitle">Trámite administrativo de baja deportiva y desafiliación del plantel</p>
                </div>
              </div>
              <button class="modal-close-btn btn-close" (click)="closeDeleteConfirmModal()" aria-label="Cerrar">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <!-- Contenido Principal -->
            <div class="delete-confirm-body">
              <!-- Tarjeta de Resumen del Deportista -->
              <div class="player-retire-card">
                <div class="retire-avatar-wrap">
                  <img 
                    [src]="resolvePhotoUrl(selectedPlayerToDelete()!.foto_url, selectedPlayerToDelete()!.genero)" 
                    [alt]="selectedPlayerToDelete()!.nombres" />
                  <div class="retire-dorsal-tag">
                    #{{ selectedPlayerToDelete()!.numero_dorsal || '-' }}
                  </div>
                </div>
                <div class="retire-player-details">
                  <div class="retire-name-row">
                    <span class="retire-player-name">
                      {{ selectedPlayerToDelete()!.nombres }} {{ selectedPlayerToDelete()!.apellidos }}
                    </span>
                    <span class="status-badge" [class]="selectedPlayerToDelete()!.estado_matricula ? selectedPlayerToDelete()!.estado_matricula.toLowerCase() : 'activo'">
                      {{ selectedPlayerToDelete()!.estado_matricula || 'ACTIVO' }}
                    </span>
                  </div>
                  <div class="retire-meta-row">
                    <span class="meta-tag"><i class="fa-solid fa-id-card"></i> {{ selectedPlayerToDelete()!.tipo_documento }} {{ selectedPlayerToDelete()!.numero_documento }}</span>
                    <span class="meta-tag"><i class="fa-solid fa-users"></i> {{ selectedPlayerToDelete()!.categoria_nombre }}</span>
                    <span class="meta-tag"><i class="fa-solid fa-futbol"></i> {{ selectedPlayerToDelete()!.posicion_principal }}</span>
                  </div>
                </div>
              </div>

              <!-- Advertencia y Consecuencias -->
              <div class="warning-callout">
                <div class="warning-callout-icon">
                  <i class="fa-solid fa-circle-exclamation"></i>
                </div>
                <div class="warning-callout-content">
                  <h4>¿Estás seguro de formalizar la baja del deportista?</h4>
                  <ul>
                    <li>El alumno cambiará su estado a <strong>RETIRADO</strong> y quedará inhabilitado para futuras convocatorias oficiales.</li>
                    <li>Su expediente deportivo, histórico biométrico y registros de pagos permanecerán archivados para consulta histórica.</li>
                    <li>Esta acción liberará su número de dorsal (#{{ selectedPlayerToDelete()!.numero_dorsal || 'N/A' }}) para nuevas inscripciones.</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Footer con Botones de Acción -->
            <div class="modal-footer">
              <button 
                type="button" 
                class="btn-cancel" 
                (click)="closeDeleteConfirmModal()"
                [disabled]="deletingPlayer()">
                <i class="fa-solid fa-xmark"></i>
                <span>Cancelar</span>
              </button>
              <button 
                type="button" 
                class="btn-confirm-delete" 
                (click)="confirmRetireJugador()"
                [disabled]="deletingPlayer()">
                @if (deletingPlayer()) {
                  <i class="fa-solid fa-spinner fa-spin"></i>
                  <span>Procesando Baja...</span>
                } @else {
                  <i class="fa-solid fa-user-minus"></i>
                  <span>Confirmar Retiro Definitivo</span>
                }
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Toast Feedback -->
      @if (toastMsg()) {
        <div class="toast-floating" [class.error]="isToastError()">
          <i class="fa-solid" [class.fa-check-circle]="!isToastError()" [class.fa-triangle-exclamation]="isToastError()"></i>
          <span>{{ toastMsg() }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .jugadores-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    /* Page Header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1.5rem;
      flex-wrap: wrap;

      .header-titles {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(16, 185, 129, 0.12);
          color: var(--color-primary);
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          font-size: 0.725rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          width: fit-content;
        }

        .page-title {
          font-size: 1.65rem;
          font-weight: 800;
          color: var(--text-heading);
          letter-spacing: -0.02em;
        }

        .page-subtitle {
          font-size: 0.875rem;
          color: var(--text-muted);
          max-width: 600px;
        }
      }

      .btn-primary {
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
        color: #ffffff;
        border: none;
        padding: 0.75rem 1.35rem;
        border-radius: var(--radius-md);
        font-weight: 700;
        font-size: 0.875rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        box-shadow: var(--shadow-glow);
        transition: all 0.2s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
        }
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
      padding: 1.15rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        border-color: var(--color-primary);
      }

      .kpi-icon {
        width: 44px;
        height: 44px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;

        &.emerald { background: rgba(16, 185, 129, 0.12); color: #10b981; }
        &.blue { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }
        &.rose { background: rgba(244, 63, 94, 0.12); color: #f43f5e; }
        &.amber { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
      }

      .kpi-info {
        display: flex;
        flex-direction: column;

        .kpi-value {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--text-heading);
          line-height: 1.1;
        }

        .kpi-label {
          font-size: 0.775rem;
          color: var(--text-muted);
          font-weight: 600;
        }
      }
    }

    /* Filters Card & Multi-Criteria Search Suite */
    .filters-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1.15rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      box-shadow: var(--shadow-sm);
    }

    .filters-main-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;

      .search-box.luxury-search {
        flex: 1;
        min-width: 280px;
        position: relative;
        display: flex;
        align-items: center;

        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--color-primary);
          font-size: 0.95rem;
        }

        .search-input {
          width: 100%;
          padding: 0.7rem 7rem 0.7rem 2.65rem;
          background: var(--bg-input);
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-main);
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s ease;

          &::placeholder {
            color: var(--text-muted);
            font-size: 0.825rem;
          }

          &:focus {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px var(--color-primary-glow);
            background: var(--bg-card);
          }
        }

        .clear-search-btn {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.85rem;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;

          &:hover { color: #ef4444; }
        }

        .search-count-badge {
          position: absolute;
          right: 2.25rem;
          background: rgba(16, 185, 129, 0.12);
          color: var(--color-primary);
          border: 1px solid rgba(16, 185, 129, 0.25);
          font-size: 0.725rem;
          font-weight: 700;
          padding: 0.15rem 0.55rem;
          border-radius: var(--radius-full);
          pointer-events: none;
          white-space: nowrap;
        }
      }

      .sort-selector-wrapper {
        display: flex;
        align-items: center;
        gap: 0.45rem;

        .filter-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
      }

      .view-mode-toggle {
        display: flex;
        align-items: center;
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 3px;
        gap: 3px;

        .view-mode-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          padding: 0.45rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s ease;

          &:hover:not(.active) {
            color: var(--text-main);
            background: var(--bg-card-hover);
          }

          &.active {
            background: var(--color-primary);
            color: #ffffff;
            box-shadow: 0 2px 6px var(--color-primary-glow);
          }
        }
      }
    }

    .filters-secondary-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;

      .filter-group {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .filter-group-label {
          font-size: 0.775rem;
          font-weight: 700;
          color: var(--text-muted);
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          white-space: nowrap;
        }
      }

      .segmented-filter-pills {
        display: flex;
        align-items: center;
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        padding: 3px;
        gap: 3px;

        .seg-pill {
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-body);
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          transition: all 0.15s ease;
          white-space: nowrap;

          &:hover:not(.active) {
            color: var(--text-main);
            background: var(--bg-card-hover);
          }

          &.active {
            background: var(--color-primary);
            color: #ffffff;
            box-shadow: 0 2px 6px var(--color-primary-glow);
          }

          .dot-activo, .dot-lesionado, .dot-inactivo, .dot-retirado {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            display: inline-block;
          }

          .dot-activo { background: #10b981; }
          .dot-lesionado { background: #ef4444; }
          .dot-inactivo { background: #94a3b8; }
          .dot-retirado { background: #f59e0b; }

          &.pill-activo.active {
            background: rgba(16, 185, 129, 0.18);
            border-color: #10b981;
            color: #10b981;
            box-shadow: none;
          }

          &.pill-lesionado.active {
            background: rgba(239, 68, 68, 0.18);
            border-color: #ef4444;
            color: #ef4444;
            box-shadow: none;
          }

          &.pill-inactivo.active {
            background: rgba(148, 163, 184, 0.18);
            border-color: #94a3b8;
            color: #94a3b8;
            box-shadow: none;
          }

          &.pill-retirado.active {
            background: rgba(245, 158, 11, 0.18);
            border-color: #f59e0b;
            color: #f59e0b;
            box-shadow: none;
          }
        }
      }

      .btn-clear-all-filters {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.45rem 0.85rem;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.25);
        color: #ef4444;
        border-radius: var(--radius-md);
        font-size: 0.775rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        white-space: nowrap;
        margin-left: auto;

        &:hover {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
        }
      }
    }

    .filter-select-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;

      .filter-select {
        padding: 0.55rem 2rem 0.55rem 0.85rem;
        background: var(--bg-input);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        color: var(--text-main);
        font-size: 0.825rem;
        font-weight: 600;
        outline: none;
        appearance: none;
        cursor: pointer;
        transition: all 0.2s ease;

        &:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px var(--color-primary-glow);
        }
      }

      .select-chevron {
        position: absolute;
        right: 0.75rem;
        pointer-events: none;
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    }

    .category-pills-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .category-ribbon-label {
        font-size: 0.775rem;
        font-weight: 700;
        color: var(--text-muted);
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }

      .category-pills {
        display: flex;
        gap: 0.5rem;
        overflow-x: auto;
        padding-bottom: 0.25rem;
        scrollbar-width: thin;

        .pill {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          color: var(--text-body);
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.775rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s ease;

          .cat-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
          }

          .cat-code-badge {
            background: rgba(255, 255, 255, 0.15);
            font-size: 0.65rem;
            padding: 1px 5px;
            border-radius: var(--radius-xs);
            font-weight: 800;
          }

          .pill-count {
            color: var(--text-muted);
            font-size: 0.7rem;
          }

          &:hover {
            background: var(--bg-card-hover);
            color: var(--text-main);
          }

          &.active {
            background: var(--color-primary);
            border-color: var(--color-primary);
            color: #ffffff;
            font-weight: 700;

            .cat-code-badge { background: rgba(0, 0, 0, 0.2); }
            .pill-count { color: rgba(255, 255, 255, 0.85); }
          }
        }
      }
    }

    .active-chips-bar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding-top: 0.65rem;
      border-top: 1px dashed var(--border-color);

      .chips-title {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-muted);
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
      }

      .filter-chip {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.25);
        color: var(--color-primary);
        padding: 0.2rem 0.55rem;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 700;

        button {
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 0.7rem;
          padding: 0;
          margin-left: 0.15rem;
          display: flex;
          align-items: center;

          &:hover { color: #ef4444; }
        }
      }

      .btn-text-clear {
        background: transparent;
        border: none;
        color: #ef4444;
        font-size: 0.75rem;
        font-weight: 700;
        cursor: pointer;
        text-decoration: underline;
        margin-left: 0.35rem;

        &:hover { opacity: 0.8; }
      }
    }

    /* Player Cards Grid (Fichas 360°) */
    .player-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
      padding: 1.25rem;
      background: var(--bg-card);

      .player-fut-card {
        position: relative;
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        border-top: 4px solid var(--color-primary);
        border-radius: var(--radius-lg);
        padding: 1.15rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
        box-shadow: var(--shadow-sm);
        transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;

        &:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
          border-color: rgba(16, 185, 129, 0.4);
        }

        /* CARD ÉLITE / PROFESIONAL (ESTILO HOLOGRÁFICO CHAMPAGNE / FUT PRISMATIC) */
        &.player-card-elite {
          border: 1.5px solid #eab308 !important;
          border-top: 4px solid #eab308 !important;
          background: linear-gradient(135deg, rgba(254, 240, 138, 0.12) 0%, rgba(234, 179, 8, 0.06) 50%, var(--bg-surface) 100%) !important;
          box-shadow: 0 4px 18px rgba(234, 179, 8, 0.15), 0 1px 3px rgba(0, 0, 0, 0.05) !important;
          overflow: hidden;

          /* Capa Holográfica Prisma Suave */
          &::before {
            content: '';
            position: absolute;
            top: -60%;
            left: -60%;
            width: 220%;
            height: 220%;
            background: linear-gradient(
              115deg,
              transparent 20%,
              rgba(255, 182, 193, 0.1) 32%,
              rgba(254, 240, 138, 0.18) 42%,
              rgba(167, 243, 208, 0.14) 52%,
              rgba(186, 230, 253, 0.18) 62%,
              rgba(221, 214, 254, 0.12) 72%,
              transparent 85%
            );
            transform: rotate(25deg);
            pointer-events: none;
            transition: transform 0.6s ease, opacity 0.4s ease;
            opacity: 0.65;
            background-size: 200% 200%;
          }

          &:hover {
            box-shadow: 0 10px 28px rgba(234, 179, 8, 0.28), 0 0 15px rgba(250, 204, 21, 0.3) !important;
            border-color: #ca8a04 !important;
            transform: translateY(-4px);

            &::before {
              opacity: 1;
              transform: rotate(25deg) translateY(-8%);
            }
          }

          .pfc-name {
            color: var(--text-heading) !important;
            font-weight: 800;

            &::before {
              content: '⭐ ';
              font-size: 0.75rem;
              color: #eab308;
            }
          }

          .pfc-dorsal-tag {
            background: linear-gradient(135deg, #fef08a 0%, #facc15 50%, #eab308 100%) !important;
            border: 1px solid #ca8a04 !important;
            color: #713f12 !important;
            font-weight: 900 !important;
            box-shadow: 0 2px 6px rgba(202, 138, 4, 0.25);
          }

          .pfc-cat-badge {
            color: #854d0e;
            font-weight: 800;
          }
        }

        .pfc-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;

          .pfc-cat-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            font-size: 0.75rem;
            font-weight: 800;
            color: var(--text-heading);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            .cat-dot {
              width: 7px;
              height: 7px;
              border-radius: 50%;
              flex-shrink: 0;
            }
          }

          .pfc-top-tags {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            flex-shrink: 0;

            .pfc-scholarship-tag {
              font-size: 0.68rem;
              font-weight: 800;
              color: #f59e0b;
              background: rgba(245, 158, 11, 0.12);
              border: 1px solid rgba(245, 158, 11, 0.3);
              padding: 0.12rem 0.45rem;
              border-radius: var(--radius-xs);
            }

            .pfc-dorsal-tag {
              font-size: 0.9rem;
              font-weight: 900;
              color: var(--color-primary);
              background: rgba(16, 185, 129, 0.12);
              border: 1px solid rgba(16, 185, 129, 0.3);
              padding: 0.15rem 0.55rem;
              border-radius: var(--radius-sm);
            }
          }
        }

        .pfc-body {
          display: flex;
          align-items: center;
          gap: 0.85rem;

          .pfc-avatar-wrap {
            width: 54px;
            height: 54px;
            border-radius: 50%;
            overflow: hidden;
            position: relative;
            cursor: pointer;
            border: 2px solid var(--border-color);
            background: var(--bg-card);
            flex-shrink: 0;
            transition: transform 0.2s ease, border-color 0.2s ease;

            &:hover {
              transform: scale(1.05);
              border-color: var(--color-primary);
            }

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }

            .pfc-status-dot {
              position: absolute;
              bottom: 1px;
              right: 1px;
              width: 12px;
              height: 12px;
              border-radius: 50%;
              border: 2px solid var(--bg-surface);

              &.activo { background: #10b981; }
              &.lesionado { background: #ef4444; }
              &.inactivo { background: #94a3b8; }
              &.retirado { background: #f59e0b; }
            }
          }

          .pfc-player-info {
            flex: 1;
            min-width: 0;

            .pfc-name {
              font-size: 0.95rem;
              font-weight: 800;
              color: var(--text-heading);
              margin: 0 0 0.15rem 0;
              cursor: pointer;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;

              &:hover {
                color: var(--color-primary);
                text-decoration: underline;
              }
            }

            .pfc-meta-row {
              font-size: 0.75rem;
              color: var(--text-muted);
              font-weight: 600;
              display: flex;
              gap: 0.35rem;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .pfc-eps-row {
              font-size: 0.7rem;
              color: var(--text-muted);
              margin-top: 0.15rem;
              display: flex;
              align-items: center;
              gap: 0.3rem;

              i {
                color: var(--color-primary);
                font-size: 0.65rem;
              }
            }
          }
        }

        .pfc-tactics {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.35rem;

          .pfc-pos-pill {
            background: rgba(59, 130, 246, 0.12);
            color: #3b82f6;
            padding: 0.22rem 0.55rem;
            border-radius: var(--radius-sm);
            font-size: 0.725rem;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
          }

          .pos-sec-badge {
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.2);
            color: var(--color-primary);
            font-size: 0.68rem;
            font-weight: 600;
            padding: 0.15rem 0.4rem;
            border-radius: var(--radius-xs);
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
          }

          .pfc-foot-badge {
            font-size: 0.7rem;
            color: var(--text-muted);
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;
            margin-left: auto;
          }
        }

        .pfc-bio-strip {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.45rem 0.75rem;
          display: flex;
          align-items: center;
          justify-content: space-around;

          .pfc-bio-item {
            display: flex;
            flex-direction: column;
            align-items: center;

            .lbl {
              font-size: 0.625rem;
              color: var(--text-muted);
              font-weight: 700;
              text-transform: uppercase;
            }

            strong {
              font-size: 0.8rem;
              font-weight: 800;
              color: var(--text-heading);
            }
          }

          .pfc-btn-add-bio {
            width: 100%;
            background: transparent;
            border: 1px dashed var(--border-color);
            color: var(--color-primary);
            padding: 0.3rem;
            border-radius: var(--radius-sm);
            font-size: 0.725rem;
            font-weight: 700;
            cursor: pointer;

            &:hover {
              background: rgba(16, 185, 129, 0.08);
              border-color: var(--color-primary);
            }
          }
        }

        .pfc-footer {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin-top: auto;
          padding-top: 0.65rem;
          border-top: 1px solid var(--border-color);

          .pfc-btn-view {
            flex: 1;
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: var(--color-primary);
            padding: 0.45rem 0.75rem;
            border-radius: var(--radius-md);
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            transition: all 0.2s ease;

            &:hover {
              background: var(--color-primary);
              color: #ffffff;
            }
          }

          .pfc-sub-actions {
            display: flex;
            align-items: center;
            gap: 0.25rem;

            .action-btn {
              width: 32px;
              height: 32px;
              padding: 0;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              border-radius: var(--radius-sm);
              border: 1px solid var(--border-color);
              background: var(--bg-card);
              color: var(--text-muted);
              font-size: 0.8rem;
              cursor: pointer;
              transition: all 0.2s ease;

              &:hover {
                transform: translateY(-1px);
              }

              &.btn-bio:hover { color: #3b82f6; border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
              &.btn-edit:hover { color: #f59e0b; border-color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
              &.btn-delete:hover { color: #ef4444; border-color: #ef4444; background: rgba(239, 68, 68, 0.1); }
            }
          }
        }
      }
    }

    .empty-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-top: 0.75rem;
      flex-wrap: wrap;
      justify-content: center;
    }

    /* Table Styles */
    .fut-table-container {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow-x: auto;
      box-shadow: var(--shadow-sm);
    }

    .fut-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 0.875rem;

      thead th {
        background: var(--bg-surface);
        padding: 0.85rem 1rem;
        font-weight: 800;
        font-size: 0.75rem;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid var(--border-color);
      }

      tbody td {
        padding: 0.85rem 1rem;
        border-bottom: 1px solid var(--border-color);
        color: var(--text-main);
        vertical-align: middle;
      }

      .player-row:hover td {
        background: var(--bg-card-hover);
      }
    }

    .player-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      .dorsal-tag {
        width: 32px;
        height: 32px;
        background: rgba(16, 185, 129, 0.12);
        color: var(--color-primary);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: var(--radius-sm);
        font-weight: 800;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        justify-content: center;

        .dorsal-hash {
          font-size: 0.65rem;
          opacity: 0.7;
        }
      }

      .avatar-sm {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        overflow: hidden;
        background: var(--bg-surface);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    .name-box {
      display: flex;
      flex-direction: column;

      .player-name {
        font-weight: 700;
        color: var(--text-heading);
        cursor: pointer;

        &:hover {
          color: var(--color-primary);
          text-decoration: underline;
        }
      }

      .player-sub {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    }

    .doc-badge {
      font-size: 0.775rem;
      font-family: monospace;
      color: var(--text-muted);
      background: var(--bg-surface);
      padding: 0.2rem 0.45rem;
      border-radius: var(--radius-xs);
      border: 1px solid var(--border-color);
    }

    .badge-cat {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.6rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid;
      background: var(--bg-surface);

      .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }
    }

    .position-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;

      .pos {
        font-weight: 700;
        color: var(--text-main);
      }

      .pos-sec-badge {
        font-size: 0.68rem;
        color: var(--color-primary);
        background: rgba(16, 185, 129, 0.08);
        border: 1px solid rgba(16, 185, 129, 0.2);
        border-radius: var(--radius-xs);
        padding: 0.1rem 0.35rem;
        width: fit-content;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
        font-weight: 600;
      }

      .foot {
        font-size: 0.7rem;
        color: var(--text-muted);
      }
    }

    .bio-info {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;

      .bio-metrics {
        font-size: 0.8rem;
        font-weight: 600;
      }

      .imc-badge {
        font-size: 0.7rem;
        font-weight: 700;

        &.normal { color: #10b981; }
        &.sobrepeso { color: #f59e0b; }
        &.bajo { color: #3b82f6; }
      }
    }

    .btn-add-bio-link {
      background: transparent;
      border: 1px dashed var(--border-color);
      color: var(--color-primary);
      padding: 0.3rem 0.6rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;

      &:hover {
        background: rgba(16, 185, 129, 0.1);
        border-color: var(--color-primary);
      }
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.25rem 0.65rem;
      border-radius: var(--radius-full);
      font-size: 0.725rem;
      font-weight: 800;
      letter-spacing: 0.03em;

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
      }

      &.activo { background: rgba(16, 185, 129, 0.12); color: #10b981; .status-dot { background: #10b981; } }
      &.lesionado { background: rgba(239, 68, 68, 0.12); color: #ef4444; .status-dot { background: #ef4444; } }
      &.suspendido { background: rgba(245, 158, 11, 0.12); color: #f59e0b; .status-dot { background: #f59e0b; } }
      &.retirado { background: rgba(148, 163, 184, 0.12); color: #94a3b8; .status-dot { background: #94a3b8; } }
    }

    .table-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.35rem;

      .action-btn {
        padding: 0.4rem 0.65rem;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-color);
        background: var(--bg-surface);
        color: var(--text-muted);
        font-size: 0.8rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        transition: all 0.2s ease;

        &:hover {
          transform: translateY(-1px);
        }

        &.btn-view {
          color: var(--color-primary);
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.08);
          font-weight: 700;

          &:hover { background: var(--color-primary); color: #ffffff; }
        }

        &.btn-bio:hover { color: #3b82f6; border-color: #3b82f6; }
        &.btn-edit:hover { color: #f59e0b; border-color: #f59e0b; }
        &.btn-delete:hover { color: #ef4444; border-color: #ef4444; }
      }
    }

    /* Professional Pagination Bar */
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      background: var(--bg-surface);
      border-top: 1px solid var(--border-color);
      flex-wrap: wrap;
      gap: 1rem;

      .pagination-info {
        display: flex;
        align-items: center;
        gap: 1.25rem;
        font-size: 0.825rem;
        color: var(--text-muted);

        strong {
          color: var(--text-heading);
          font-weight: 700;
        }

        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 0.45rem;

          label {
            font-size: 0.775rem;
            color: var(--text-muted);
            font-weight: 600;
          }

          .page-size-select {
            background: var(--bg-input);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            color: var(--text-main);
            padding: 0.25rem 0.5rem;
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
            outline: none;

            &:focus {
              border-color: var(--color-primary);
            }
          }
        }
      }

      .pagination-controls {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .page-nav-btn {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 0.45rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s ease;

          &:hover:not(:disabled) {
            background: var(--bg-card-hover);
            border-color: var(--color-primary);
            color: var(--color-primary);
          }

          &:disabled {
            opacity: 0.4;
            cursor: not-allowed;
          }
        }

        .page-numbers {
          display: flex;
          align-items: center;
          gap: 0.3rem;

          .page-num-btn {
            min-width: 32px;
            height: 32px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: var(--bg-input);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            color: var(--text-main);
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
              border-color: var(--color-primary);
              color: var(--color-primary);
            }

            &.active {
              background: var(--color-primary);
              border-color: var(--color-primary);
              color: #ffffff;
              box-shadow: 0 2px 8px var(--color-primary-glow);
            }
          }

          .page-ellipsis {
            padding: 0 0.35rem;
            color: var(--text-muted);
            font-weight: 700;
            font-size: 0.85rem;
          }
        }
      }
    }

    .btn-clear-all-filters {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.6rem 0.95rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.25);
      color: #ef4444;
      border-radius: var(--radius-md);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;

      &:hover {
        background: rgba(239, 68, 68, 0.2);
        border-color: #ef4444;
      }
    }

    /* Modal Backdrop & Common Cards */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(6px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      animation: fadeIn 0.2s ease;
    }

    /* =========================================================================
       MODAL STEPPER: INSCRIBIR NUEVO JUGADOR (3 PASOS)
       ========================================================================= */
    .modal-stepper-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.75rem;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      gap: 0.75rem;
      flex-wrap: nowrap;

      .step-item {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        cursor: pointer;
        user-select: none;
        transition: all 0.2s ease;

        .step-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 0.85rem;
          background: var(--bg-input);
          color: var(--text-muted);
          border: 2px solid var(--border-color);
          transition: all 0.25s ease;
        }

        .step-label-wrap {
          display: flex;
          flex-direction: column;

          .step-number {
            font-size: 0.625rem;
            font-weight: 800;
            color: var(--text-muted);
            letter-spacing: 0.05em;
          }

          .step-title {
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--text-body);
            transition: color 0.2s ease;
          }
        }

        &.active {
          .step-circle {
            background: var(--color-primary);
            color: #ffffff;
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px var(--color-primary-glow);
          }

          .step-label-wrap {
            .step-number { color: var(--color-primary); }
            .step-title { color: var(--text-heading); font-weight: 800; }
          }
        }

        &.completed {
          .step-circle {
            background: rgba(16, 185, 129, 0.15);
            color: #10b981;
            border-color: #10b981;
          }

          .step-label-wrap {
            .step-title { color: var(--text-heading); }
          }
        }
      }

      .step-connector {
        flex: 1;
        height: 2px;
        background: var(--border-color);
        margin: 0 0.5rem;
        transition: background 0.3s ease;

        &.filled {
          background: #10b981;
        }
      }
    }

    .stepper-step-pane {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      animation: fadeIn 0.25s ease;
    }

    .step-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 1.25rem;
      border-top: 1px solid var(--border-color);
      margin-top: 0.5rem;
    }

    .pre-inscription-summary-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-left: 4px solid var(--color-primary);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      display: flex;
      gap: 1.25rem;
      align-items: center;

      .pisc-avatar {
        width: 64px;
        height: 64px;
        border-radius: 50%;
        overflow: hidden;
        border: 2px solid var(--color-primary);
        position: relative;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .pisc-dorsal {
          position: absolute;
          bottom: 0;
          right: 0;
          background: var(--color-primary);
          color: #ffffff;
          font-size: 0.7rem;
          font-weight: 900;
          padding: 1px 4px;
          border-radius: var(--radius-xs);
        }
      }

      .pisc-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        .pisc-name-row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          h4 {
            font-size: 1.05rem;
            font-weight: 800;
            color: var(--text-heading);
            margin: 0;
          }
        }

        .pisc-pills-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .pisc-acudiente-note {
          font-size: 0.775rem;
          color: var(--text-muted);
          background: var(--bg-card);
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-xs);
          border: 1px dashed var(--border-color);
          margin-top: 0.25rem;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }
      }
    }

    .expediente-modal {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-xl);
      max-width: 960px;
      width: 100%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: slideUp 0.25s ease;
      overflow: hidden;
    }

    /* Expediente Header (Fijo dentro del modal) */
    .exp-header {
      padding: 1.5rem 2rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: var(--bg-surface);
      flex-shrink: 0;

      .exp-player-banner {
        display: flex;
        gap: 1.25rem;
        align-items: center;

        .exp-avatar-wrap {
          position: relative;
          width: 68px;
          height: 68px;
          border-radius: 50%;
          overflow: hidden;
          border: 3px solid var(--color-primary);

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .exp-dorsal-tag {
            position: absolute;
            bottom: 0;
            right: 0;
            background: var(--color-primary);
            color: #ffffff;
            font-size: 0.75rem;
            font-weight: 800;
            padding: 0.1rem 0.35rem;
            border-radius: var(--radius-sm);
          }
        }

        .exp-main-info {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;

          .exp-title-row {
            display: flex;
            align-items: center;
            gap: 0.75rem;

            h2 {
              font-size: 1.4rem;
              font-weight: 800;
              color: var(--text-heading);
            }
          }

          .exp-meta-pills {
            display: flex;
            gap: 0.5rem;
            flex-wrap: wrap;

            .meta-pill {
              font-size: 0.75rem;
              color: var(--text-body);
              background: var(--bg-card);
              padding: 0.2rem 0.55rem;
              border-radius: var(--radius-xs);
              border: 1px solid var(--border-color);
              display: inline-flex;
              align-items: center;
              gap: 0.35rem;

              i { color: var(--color-primary); }
            }
          }
        }
      }
    }

    /* Expediente Tabs Nav (Fijo) */
    .exp-tabs-nav {
      display: flex;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-card);
      padding: 0 1.5rem;
      gap: 0.5rem;
      overflow-x: auto;
      flex-shrink: 0;

      .exp-tab-btn {
        background: transparent;
        border: none;
        border-bottom: 2px solid transparent;
        padding: 0.85rem 1rem;
        color: var(--text-muted);
        font-weight: 700;
        font-size: 0.85rem;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        white-space: nowrap;

        &:hover {
          color: var(--text-main);
        }

        &.active {
          color: var(--color-primary);
          border-bottom-color: var(--color-primary);
        }
      }
    }

    /* Contenido con Scroll Independiente */
    .exp-tab-content {
      padding: 1.75rem 2rem;
      flex: 1;
      overflow-y: auto;
    }

    .profile-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .info-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.15rem;
      display: flex;
      align-items: center;
      gap: 1rem;

      .card-icon {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-sm);
        background: rgba(16, 185, 129, 0.1);
        color: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
      }

      .card-data {
        display: flex;
        flex-direction: column;

        .data-label {
          font-size: 0.725rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .data-val {
          font-size: 0.95rem;
          color: var(--text-heading);

          &.highlight { color: var(--color-primary); }
        }
      }
    }

    .section-box {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      margin-bottom: 1.5rem;

      .box-title {
        font-size: 0.875rem;
        font-weight: 800;
        color: var(--text-heading);
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;

        i { color: var(--color-primary); }
      }
    }

    .pane-header-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      .pane-title {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-heading);
      }

      .pane-desc {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
    }

    /* Acudientes */
    .acudientes-list {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
      margin-top: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .acudiente-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.15rem 1.4rem;
      display: flex;
      align-items: center;
      gap: 1.15rem;

      .acudiente-avatar {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: rgba(16, 185, 129, 0.1);
        color: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.25rem;
      }

      .acudiente-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;

        .acudiente-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;

          strong {
            font-size: 0.95rem;
            color: var(--text-heading);
          }

          .parentesco-badge {
            background: rgba(59, 130, 246, 0.12);
            color: #3b82f6;
            padding: 0.15rem 0.45rem;
            border-radius: var(--radius-xs);
            font-size: 0.7rem;
            font-weight: 700;
          }

          .badge-principal {
            background: rgba(245, 158, 11, 0.12);
            color: #f59e0b;
            padding: 0.15rem 0.45rem;
            border-radius: var(--radius-xs);
            font-size: 0.7rem;
            font-weight: 700;
          }

          .badge-pickup {
            background: rgba(16, 185, 129, 0.12);
            color: #10b981;
            padding: 0.15rem 0.45rem;
            border-radius: var(--radius-xs);
            font-size: 0.7rem;
            font-weight: 700;
          }
        }

        .acudiente-meta {
          display: flex;
          gap: 0.85rem;
          font-size: 0.775rem;
          color: var(--text-muted);

          span {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
          }
        }
      }

      .acudiente-actions {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .btn-whatsapp {
          background: #25d366;
          color: #ffffff;
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;

          &:hover { opacity: 0.9; }
        }

        .btn-remove-ac {
          background: transparent;
          border: 1px solid var(--border-color);
          color: #ef4444;
          padding: 0.4rem 0.6rem;
          border-radius: var(--radius-sm);
          cursor: pointer;

          &:hover { background: rgba(239, 68, 68, 0.1); }
        }
      }
    }

    /* Biometria KPI Grid */
    .biometria-kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1.15rem;
      margin-bottom: 1.5rem;
    }

    .bio-kpi-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1rem 1.15rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .bio-label {
        font-size: 0.725rem;
        color: var(--text-muted);
        font-weight: 600;
      }

      .bio-val {
        font-size: 1.25rem;
        color: var(--text-heading);

        small { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
        &.highlight { color: var(--color-primary); }
      }

      .imc-sub {
        font-size: 0.7rem;
        font-weight: 700;

        &.normal { color: #10b981; }
        &.sobrepeso { color: #f59e0b; }
        &.bajo { color: #3b82f6; }
      }
    }

    /* Finanzas Summary */
    .fin-summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }

    .fin-stat-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      .fin-label {
        font-size: 0.75rem;
        color: var(--text-muted);
        font-weight: 700;
      }

      .fin-val {
        font-size: 1.45rem;
        color: var(--text-heading);

        &.emerald { color: #10b981; }
        &.rose { color: #ef4444; }
      }

      .status-badge-lg {
        padding: 0.35rem 0.85rem;
        border-radius: var(--radius-full);
        font-size: 0.8rem;
        font-weight: 800;
        text-align: center;
        width: fit-content;

        &.al-dia { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        &.en-mora { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
      }
    }

    /* Sub Tables */
    .fut-table-sub {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.825rem;
      margin-top: 1.25rem;
      margin-bottom: 1.25rem;

      th {
        padding: 0.65rem 0.85rem;
        background: var(--bg-card);
        color: var(--text-muted);
        font-weight: 700;
        font-size: 0.725rem;
        border-bottom: 1px solid var(--border-color);
      }

      td {
        padding: 0.65rem 0.85rem;
        border-bottom: 1px solid var(--border-color);
      }

      .evaluador-tag {
        font-weight: 700;
        display: block;
      }

      .obs-text {
        color: var(--text-muted);
        font-size: 0.725rem;
      }
    }

    .imc-pill {
      padding: 0.15rem 0.45rem;
      border-radius: var(--radius-xs);
      font-weight: 700;
      font-size: 0.75rem;

      &.normal { background: rgba(16, 185, 129, 0.12); color: #10b981; }
      &.sobrepeso { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
      &.bajo { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }
    }

    .imc-live-preview {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 0.85rem 1.15rem;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.85rem;
      margin-top: 0.5rem;
      margin-bottom: 1.25rem;

      strong { font-size: 1.1rem; color: var(--color-primary); }
      .imc-tag { font-weight: 700; font-size: 0.775rem; }
    }

    .btn-primary-sm {
      background: var(--color-primary);
      color: #ffffff;
      border: none;
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;

      &:hover { opacity: 0.9; }
    }

    .inline-form-card {
      background: var(--bg-surface);
      border: 1px solid var(--color-primary);
      border-radius: var(--radius-md);
      padding: 1.25rem;
      margin-bottom: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;

      h4 { font-size: 0.9rem; font-weight: 800; color: var(--text-heading); }
      .form-actions-right { display: flex; justify-content: flex-end; }
      .btn-submit-sm {
        background: var(--color-primary);
        color: #ffffff;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: var(--radius-sm);
        font-weight: 700;
        font-size: 0.8rem;
        cursor: pointer;
      }
    }

    .toast-floating {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #059669;
      color: #ffffff;
      padding: 0.85rem 1.25rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      font-size: 0.875rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      z-index: 2000;
      animation: fadeIn 0.2s ease;

      &.error { background: #dc2626; }
    }

    .loading-state, .empty-state, .empty-state-sm {
      padding: 3rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-muted);

      .empty-icon { font-size: 2.5rem; }
      h3 { color: var(--text-heading); font-size: 1.15rem; }
    }

    .empty-state-sm { padding: 1.5rem; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

    @media (max-width: 1024px) {
      .filters-main-row {
        flex-direction: column;
        align-items: stretch;

        .search-box.luxury-search {
          min-width: 100%;
        }

        .sort-selector-wrapper, .view-mode-toggle {
          width: 100%;
          justify-content: space-between;
        }
      }

      .filters-secondary-row {
        flex-direction: column;
        align-items: flex-start;

        .btn-clear-all-filters {
          margin-left: 0;
          width: 100%;
          justify-content: center;
        }
      }
    }

    @media (max-width: 768px) {
      .grid-2-col, .grid-3-col { grid-template-columns: 1fr; }
      .player-cards-grid { grid-template-columns: 1fr; }
      .pagination-bar { flex-direction: column; align-items: stretch; gap: 0.75rem; }
      .pagination-controls { justify-content: center; width: 100%; }
    }
  `]
})
export class JugadoresComponent implements OnInit {
  private api = inject(ApiService);
  private catalogos = inject(CatalogosService);

  // Catálogos dinámicos desde Backend / Base de Datos
  epsList = this.catalogos.epsList;
  tiposDocumento = this.catalogos.tiposDocumento;
  parentescos = this.catalogos.parentescos;
  piernasHabiles = this.catalogos.piernasHabiles;
  posiciones = this.catalogos.posiciones;

  // Estados reactivos con Signals
  jugadores = signal<any[]>([]);
  categorias = signal<any[]>([]);
  loading = signal<boolean>(true);
  toastMsg = signal<string>('');
  isToastError = signal<boolean>(false);

  // Filtros Avanzados
  selectedCategoriaId = signal<string>('TODAS');
  searchQuery = signal<string>('');
  selectedEstado = signal<string>('TODOS');
  selectedPosicion = signal<string>('TODAS');
  selectedGenero = signal<string>('TODOS');
  selectedSortBy = signal<string>('APELLIDO_ASC');

  // Modo de visualización (Tabla o Fichas 360°)
  viewMode = signal<'TABLE' | 'CARDS'>('TABLE');

  // Paginación Reactiva
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  // Expediente 360°
  showExpedienteModal = signal<boolean>(false);
  selectedExpediente = signal<JugadorExpediente360 | null>(null);
  activeExpTab = signal<'DEPORTIVO' | 'FAMILIA' | 'BIOMETRIA' | 'FINANZAS' | 'SERVICIOS'>('DEPORTIVO');

  // Modal Inscribir Alumno (con Stepper de 3 Pasos)
  showCreateModal = signal<boolean>(false);
  createStep = signal<number>(1);
  uploadingPhoto = signal<boolean>(false);
  localPhotoPreviewCreate = signal<string | null>(null);
  localPhotoPreviewEdit = signal<string | null>(null);
  savingPlayer = false;
  newPlayerData = {
    categoriaId: '',
    nombres: '',
    apellidos: '',
    tipoDocumento: 'TI',
    numeroDocumento: '',
    fechaNacimiento: '2011-05-15',
    genero: 'MASCULINO',
    posicionPrincipal: 'Delantero Centro',
    posicionSecundaria: '',
    piernaHabil: 'DIESTRO',
    numeroDorsal: 9,
    eps: 'SURA EPS',
    estadoMatricula: 'ACTIVO',
    porcentajeBeca: 0,
    acudienteNombres: '',
    acudienteApellidos: '',
    acudienteTelefono: '',
    acudienteEmail: '',
    acudienteParentesco: 'PADRE',
    acudienteTipoDoc: 'CC',
    acudienteNumeroDoc: '',
    fotoUrl: '',
  };

  // Modal Editar Alumno
  showEditModal = signal<boolean>(false);
  selectedPlayerToEdit = signal<any | null>(null);
  editPlayerData = {
    categoriaId: '',
    nombres: '',
    apellidos: '',
    tipoDocumento: 'TI',
    numeroDocumento: '',
    fechaNacimiento: '2011-05-15',
    genero: 'MASCULINO',
    posicionPrincipal: 'Delantero Centro',
    posicionSecundaria: '',
    piernaHabil: 'DIESTRO',
    numeroDorsal: 10,
    eps: 'SURA EPS',
    estadoMatricula: 'ACTIVO',
    porcentajeBeca: 0,
    fotoUrl: '',
  };

  // Modal Biometría
  showBiometriaModal = signal<boolean>(false);
  selectedPlayerForBio = signal<any | null>(null);
  savingBio = false;

  // Modal Confirmación de Eliminación / Baja Deportiva
  showDeleteConfirmModal = signal<boolean>(false);
  selectedPlayerToDelete = signal<any | null>(null);
  deletingPlayer = signal<boolean>(false);
  newBioData = {
    pesoKg: 58.5,
    tallaCm: 168.0,
    testCooperMetros: 2850,
    velocidad30mSeg: 3.92,
    saltoVerticalCm: 44.0,
    observaciones: '',
  };

  // Acudientes Inline Form
  showAddAcudienteForm = false;
  savingAcudiente = false;
  newAcudiente = {
    nombres: '',
    apellidos: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    telefonoMovil: '',
    email: '',
    parentesco: 'PADRE',
  };

  // Totales y Paginación Server-Side
  totalRecords = signal<number>(0);
  totalPages = signal<number>(1);

  // KPIs Computados
  totalJugadores = computed(() => this.totalRecords());
  activosCount = computed(() => {
    const list = this.jugadores();
    if (!list || !Array.isArray(list)) return 0;
    return list.filter(j => j.estado_matricula === 'ACTIVO').length;
  });
  lesionadosCount = computed(() => {
    const list = this.jugadores();
    if (!list || !Array.isArray(list)) return 0;
    return list.filter(j => j.estado_matricula === 'LESIONADO').length;
  });
  evaluadosCount = computed(() => {
    const list = this.jugadores();
    if (!list || !Array.isArray(list)) return 0;
    return list.filter(j => j.talla_cm && j.peso_kg).length;
  });

  // Filtros Reactivos Activos Check
  hasActiveFilters = computed(() => {
    return this.searchQuery().trim() !== '' ||
      this.selectedCategoriaId() !== 'TODAS' ||
      this.selectedEstado() !== 'TODOS' ||
      this.selectedPosicion() !== 'TODAS' ||
      this.selectedGenero() !== 'TODOS';
  });

  // Nombre de categoría seleccionada para el chip
  getSelectedCategoryName = computed(() => {
    const catId = this.selectedCategoriaId();
    if (catId === 'TODAS') return 'Todas';
    const found = this.categorias().find(c => c.id === catId);
    return found ? found.nombre : 'Categoría';
  });

  // Lista visible (cargada página a página desde la BD)
  jugadoresFiltrados = computed(() => this.jugadores());
  paginatedJugadores = computed(() => this.jugadores());
  totalFilteredCount = computed(() => this.totalRecords());

  showingStart = computed(() => {
    if (this.totalFilteredCount() === 0) return 0;
    const cur = Math.min(Math.max(1, this.currentPage()), this.totalPages());
    return (cur - 1) * this.pageSize() + 1;
  });

  showingEnd = computed(() => {
    const cur = Math.min(Math.max(1, this.currentPage()), this.totalPages());
    return Math.min(cur * this.pageSize(), this.totalFilteredCount());
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const cur = Math.min(Math.max(1, this.currentPage()), total);
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: number[] = [];
    pages.push(1);
    if (cur > 3) pages.push(-1); // Ellipsis
    for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) {
      pages.push(p);
    }
    if (cur < total - 2) pages.push(-1); // Ellipsis
    pages.push(total);
    return pages;
  });

  ngOnInit() {
    this.loadCategorias();
    this.loadJugadores();
  }

  loadCategorias() {
    this.api.getCategorias().subscribe(cats => {
      const rows = Array.isArray(cats) ? cats : ((cats as any)?.data || []);
      this.categorias.set(rows);
      if (rows && rows.length > 0 && !this.newPlayerData.categoriaId) {
        this.newPlayerData.categoriaId = rows[0].id;
      }
    });
  }

  loadJugadores() {
    this.loading.set(true);
    this.api
      .getJugadores({
        page: this.currentPage(),
        limit: this.pageSize(),
        categoriaId: this.selectedCategoriaId(),
        search: this.searchQuery(),
        estado: this.selectedEstado(),
        posicion: this.selectedPosicion(),
        genero: this.selectedGenero(),
        sortBy: this.selectedSortBy(),
      })
      .subscribe({
        next: (res) => {
          let rows: any[] = [];
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

          this.jugadores.set(rows);
          this.totalRecords.set(total);
          this.totalPages.set(totalPages);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error cargando jugadores:', err);
          this.jugadores.set([]);
          this.totalRecords.set(0);
          this.totalPages.set(1);
          this.loading.set(false);
        },
      });
  }

  selectCategoria(catId: string) {
    this.selectedCategoriaId.set(catId);
    this.currentPage.set(1);
    this.loadJugadores();
  }

  private searchDebounceTimer?: any;
  onSearchChange(value: string) {
    this.searchQuery.set(value);
    this.currentPage.set(1);
    clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.loadJugadores();
    }, 300);
  }

  onSortByChange(value: string) {
    this.selectedSortBy.set(value);
    this.currentPage.set(1);
    this.loadJugadores();
  }

  toggleViewMode(mode: 'TABLE' | 'CARDS') {
    this.viewMode.set(mode);
  }

  onPosicionFilterChange(value: string) {
    this.selectedPosicion.set(value);
    this.currentPage.set(1);
    this.loadJugadores();
  }

  onGeneroFilterChange(value: string) {
    this.selectedGenero.set(value);
    this.currentPage.set(1);
    this.loadJugadores();
  }

  onEstadoFilterChange(value: string) {
    this.selectedEstado.set(value);
    this.currentPage.set(1);
    this.loadJugadores();
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadJugadores();
  }

  removeSearchFilter() {
    this.searchQuery.set('');
    this.currentPage.set(1);
    this.loadJugadores();
  }

  removeCategoriaFilter() {
    this.selectedCategoriaId.set('TODAS');
    this.currentPage.set(1);
    this.loadJugadores();
  }

  removeGeneroFilter() {
    this.selectedGenero.set('TODOS');
    this.currentPage.set(1);
    this.loadJugadores();
  }

  removePosicionFilter() {
    this.selectedPosicion.set('TODAS');
    this.currentPage.set(1);
    this.loadJugadores();
  }

  removeEstadoFilter() {
    this.selectedEstado.set('TODOS');
    this.currentPage.set(1);
    this.loadJugadores();
  }

  resetAllFilters() {
    this.searchQuery.set('');
    this.selectedCategoriaId.set('TODAS');
    this.selectedEstado.set('TODOS');
    this.selectedPosicion.set('TODAS');
    this.selectedGenero.set('TODOS');
    this.selectedSortBy.set('APELLIDO_ASC');
    this.currentPage.set(1);
    this.loadJugadores();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.loadJugadores();
    }
  }

  setPageSize(size: number | string) {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
    this.loadJugadores();
  }

  getCategoryCount(catId: string): number {
    const list = this.jugadores();
    if (!list || !Array.isArray(list)) return 0;
    return list.filter(j => j.categoria_id === catId).length;
  }

  // Manejo de Expediente 360°
  openExpediente(jugadorId: string) {
    this.api.getExpedienteJugador(jugadorId).subscribe({
      next: (exp) => {
        this.selectedExpediente.set(exp);
        this.activeExpTab.set('DEPORTIVO');
        this.showExpedienteModal.set(true);
        this.showAddAcudienteForm = false;
      },
      error: () => {
        this.showToast('Error al cargar expediente 360°', true);
      }
    });
  }

  closeExpediente() {
    this.showExpedienteModal.set(false);
    this.selectedExpediente.set(null);
  }

  // Inscribir Jugador
  // Inscribir Jugador
  openCreateModal() {
    this.createStep.set(1);
    this.localPhotoPreviewCreate.set(null);
    this.newPlayerData = {
      categoriaId: this.categorias().length > 0 ? this.categorias()[0].id : '',
      nombres: '',
      apellidos: '',
      tipoDocumento: 'TI',
      numeroDocumento: '',
      fechaNacimiento: '2011-05-15',
      genero: 'MASCULINO',
      posicionPrincipal: 'Delantero Centro',
      posicionSecundaria: '',
      piernaHabil: 'DIESTRO',
      numeroDorsal: (this.jugadores().length + 1) % 99 || 7,
      eps: 'SURA EPS',
      estadoMatricula: 'ACTIVO',
      porcentajeBeca: 0,
      acudienteNombres: '',
      acudienteApellidos: '',
      acudienteTelefono: '',
      acudienteEmail: '',
      acudienteParentesco: 'PADRE',
      acudienteTipoDoc: 'CC',
      acudienteNumeroDoc: '',
      fotoUrl: '',
    };
    this.showCreateModal.set(true);
  }

  getSelectedCategoryNameForId(id: string): string {
    if (!id) return 'Sin categoría';
    const cat = this.categorias().find(c => c.id === id);
    return cat ? cat.nombre : 'Categoría';
  }

  setCreateStep(step: number) {
    if (step === 2 && !this.isStep1Valid()) {
      this.showToast('Por favor completa los nombres, apellidos, documento y fecha de nacimiento', true);
      return;
    }
    if (step === 3 && (!this.isStep1Valid() || !this.isStep2Valid())) {
      this.showToast('Por favor selecciona la categoría deportiva y posición del jugador', true);
      return;
    }
    this.createStep.set(step);
  }

  nextCreateStep() {
    if (this.createStep() === 1) {
      if (!this.isStep1Valid()) {
        this.showToast('Por favor completa los campos obligatorios del Paso 1 (Nombres, Apellidos, Documento, Fecha)', true);
        return;
      }
      this.createStep.set(2);
    } else if (this.createStep() === 2) {
      if (!this.isStep2Valid()) {
        this.showToast('Por favor selecciona la categoría y posición principal del jugador', true);
        return;
      }
      this.createStep.set(3);
    }
  }

  prevCreateStep() {
    if (this.createStep() > 1) {
      this.createStep.update(s => s - 1);
    }
  }

  isStep1Valid(): boolean {
    return !!(
      this.newPlayerData.nombres?.trim() &&
      this.newPlayerData.apellidos?.trim() &&
      this.newPlayerData.numeroDocumento?.trim() &&
      this.newPlayerData.fechaNacimiento
    );
  }

  isStep2Valid(): boolean {
    return !!(
      this.newPlayerData.categoriaId &&
      this.newPlayerData.posicionPrincipal
    );
  }

  cleanImageUrl(rawUrl: string): string {
    if (!rawUrl) return '';
    let clean = rawUrl.trim();
    // Remover comillas dobles o simples envolventes
    if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
      clean = clean.slice(1, -1).trim();
    }
    // Formato Markdown: ![alt](https://...)
    const mdMatch = clean.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/i);
    if (mdMatch) clean = mdMatch[1];
    // Formato HTML: <img src="https://...">
    const htmlMatch = clean.match(/src=["'](https?:\/\/[^"']+)["']/i);
    if (htmlMatch) clean = htmlMatch[1];
    // Formato con brackets: <https://...> o (https://...)
    if ((clean.startsWith('<') && clean.endsWith('>')) || (clean.startsWith('(') && clean.endsWith(')'))) {
      clean = clean.slice(1, -1).trim();
    }
    // Si contiene /uploads/ con protocolo/host, extraer solo la ruta relativa /uploads/...
    const uploadsIdx = clean.indexOf('/uploads/');
    if (uploadsIdx !== -1 && (clean.startsWith('http://') || clean.startsWith('https://'))) {
      clean = clean.substring(uploadsIdx);
    }
    return clean;
  }

  onPhotoUrlChange(val: string, mode: 'create' | 'edit') {
    const clean = this.cleanImageUrl(val);
    if (mode === 'create') {
      this.newPlayerData.fotoUrl = clean;
      this.localPhotoPreviewCreate.set(null);
    } else {
      this.editPlayerData.fotoUrl = clean;
      this.localPhotoPreviewEdit.set(null);
    }
  }

  onPhotoUrlPaste(event: ClipboardEvent, mode: 'create' | 'edit') {
    const pastedText = event.clipboardData?.getData('text');
    if (pastedText) {
      event.preventDefault();
      const clean = this.cleanImageUrl(pastedText);
      if (mode === 'create') {
        this.newPlayerData.fotoUrl = clean;
        this.localPhotoPreviewCreate.set(null);
      } else {
        this.editPlayerData.fotoUrl = clean;
        this.localPhotoPreviewEdit.set(null);
      }
    }
  }

  async pasteFromClipboard(mode: 'create' | 'edit') {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const clean = this.cleanImageUrl(text);
          if (mode === 'create') {
            this.newPlayerData.fotoUrl = clean;
            this.localPhotoPreviewCreate.set(null);
          } else {
            this.editPlayerData.fotoUrl = clean;
            this.localPhotoPreviewEdit.set(null);
          }
        }
      }
    } catch {
      // Ignorar si el navegador no permite acceso directo al portapapeles
    }
  }

  handlePhotoBoxPaste(event: ClipboardEvent, mode: 'create' | 'edit') {
    if (event.clipboardData?.items) {
      for (let i = 0; i < event.clipboardData.items.length; i++) {
        const item = event.clipboardData.items[i];
        if (item.type.indexOf('image') !== -1) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) {
            this.processPhotoFile(file, mode);
            return;
          }
        }
      }
    }
    const text = event.clipboardData?.getData('text');
    if (text && (text.startsWith('http://') || text.startsWith('https://') || text.startsWith('data:image') || text.startsWith('/uploads/'))) {
      event.preventDefault();
      const clean = this.cleanImageUrl(text);
      if (mode === 'create') {
        this.newPlayerData.fotoUrl = clean;
        this.localPhotoPreviewCreate.set(null);
      } else {
        this.editPlayerData.fotoUrl = clean;
        this.localPhotoPreviewEdit.set(null);
      }
    }
  }

  handlePhotoBoxDrop(event: DragEvent, mode: 'create' | 'edit') {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.processPhotoFile(file, mode);
        return;
      }
    }
    const text = event.dataTransfer?.getData('text');
    if (text) {
      const clean = this.cleanImageUrl(text);
      if (mode === 'create') {
        this.newPlayerData.fotoUrl = clean;
        this.localPhotoPreviewCreate.set(null);
      } else {
        this.editPlayerData.fotoUrl = clean;
        this.localPhotoPreviewEdit.set(null);
      }
    }
  }

  processPhotoFile(file: File, mode: 'create' | 'edit') {
    if (file.size > 5 * 1024 * 1024) {
      this.showToast('La imagen supera el límite de 5 MB', true);
      return;
    }
    this.uploadingPhoto.set(true);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      if (mode === 'create') {
        this.localPhotoPreviewCreate.set(base64);
      } else {
        this.localPhotoPreviewEdit.set(base64);
      }
    };
    reader.readAsDataURL(file);

    this.api.uploadFile(file, 'avatars').subscribe({
      next: (res) => {
        this.uploadingPhoto.set(false);
        // Guardar y mostrar estrictamente la ruta relativa donde se cargó (ej: /uploads/clubes/...)
        const relativeUrl = res.url || (res.filename ? `/uploads/${res.filename}` : res.path) || '';
        if (relativeUrl) {
          if (mode === 'create') {
            this.newPlayerData.fotoUrl = relativeUrl;
            this.localPhotoPreviewCreate.set(null);
          } else {
            this.editPlayerData.fotoUrl = relativeUrl;
            this.localPhotoPreviewEdit.set(null);
          }
        }
        this.showToast('¡Fotografía cargada correctamente!', false);
      },
      error: () => {
        this.uploadingPhoto.set(false);
        this.showToast('Fotografía cargada en vista previa local', false);
      }
    });
  }

  resolvePhotoUrl(url: string | null | undefined, genero?: string, mode?: 'create' | 'edit'): string {
    if (mode === 'create' && this.localPhotoPreviewCreate()) {
      return this.localPhotoPreviewCreate()!;
    }
    if (mode === 'edit' && this.localPhotoPreviewEdit()) {
      return this.localPhotoPreviewEdit()!;
    }
    if (!url || !url.trim()) {
      return this.getDefaultAvatar(genero || 'MASCULINO');
    }
    return this.api.resolveFileUrl(url);
  }

  onPhotoSelected(event: Event, mode: 'create' | 'edit') {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.showToast('Por favor selecciona un archivo de imagen válido', true);
      return;
    }
    this.processPhotoFile(file, mode);
  }

  onPhotoPreviewError(event: Event, mode: 'create' | 'edit') {
    const img = event.target as HTMLImageElement;
    if (img) {
      const genero = mode === 'create' ? this.newPlayerData.genero : this.editPlayerData.genero;
      const fallback = this.getDefaultAvatar(genero);
      if (img.src !== fallback) {
        img.src = fallback;
      }
    }
  }

  removePhoto(mode: 'create' | 'edit') {
    if (mode === 'create') {
      this.newPlayerData.fotoUrl = '';
      this.localPhotoPreviewCreate.set(null);
    } else {
      this.editPlayerData.fotoUrl = '';
      this.localPhotoPreviewEdit.set(null);
    }
    this.showToast('Fotografía removida', false);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  submitCreateJugador() {
    if (!this.newPlayerData.nombres?.trim()) {
      this.showToast('El nombre del deportista es obligatorio (*)', true);
      return;
    }
    if (!this.newPlayerData.apellidos?.trim()) {
      this.showToast('Los apellidos del deportista son obligatorios (*)', true);
      return;
    }
    if (!this.newPlayerData.numeroDocumento?.trim()) {
      this.showToast('El número de documento de identidad es obligatorio (*)', true);
      return;
    }
    if (this.newPlayerData.numeroDocumento.trim().length < 5) {
      this.showToast('El número de documento debe tener al menos 5 caracteres', true);
      return;
    }
    if (!this.newPlayerData.categoriaId) {
      this.showToast('Debes seleccionar una categoría deportiva válida (*)', true);
      return;
    }
    if (this.newPlayerData.numeroDorsal && (this.newPlayerData.numeroDorsal < 1 || this.newPlayerData.numeroDorsal > 99)) {
      this.showToast('El número de dorsal debe estar entre 1 y 99', true);
      return;
    }

    this.savingPlayer = true;
    this.api.createJugador(this.newPlayerData).subscribe({
      next: (res) => {
        this.savingPlayer = false;
        this.closeCreateModal();
        if (res.jugador) {
          const fullJ = {
            ...res.jugador,
            categoria_nombre: this.categorias().find(c => c.id === res.jugador.categoria_id)?.nombre || 'Categoría',
            color_distintivo: this.categorias().find(c => c.id === res.jugador.categoria_id)?.color_distintivo || '#10B981',
          };
          this.jugadores.update(list => [fullJ, ...list]);
        }
        this.loadJugadores();
        this.showToast('¡Jugador inscrito exitosamente!', false);
      },
      error: (err) => {
        this.savingPlayer = false;
        const msg = err?.error?.message || 'Error al inscribir jugador. Verifica documento y dorsal.';
        this.showToast(msg, true);
      }
    });
  }

  // Biometría Modal
  openBiometriaModal(player: any) {
    this.selectedPlayerForBio.set(player);
    this.newBioData = {
      pesoKg: player.peso_kg ? parseFloat(player.peso_kg) : 58.5,
      tallaCm: player.talla_cm ? parseFloat(player.talla_cm) : 168.0,
      testCooperMetros: 2850,
      velocidad30mSeg: 3.92,
      saltoVerticalCm: 44.0,
      observaciones: '',
    };
    this.showBiometriaModal.set(true);
  }

  closeBiometriaModal() {
    this.showBiometriaModal.set(false);
    this.selectedPlayerForBio.set(null);
  }

  calculateLiveImc(): number {
    if (this.newBioData.tallaCm <= 0 || this.newBioData.pesoKg <= 0) return 0;
    const m = this.newBioData.tallaCm / 100;
    return parseFloat((this.newBioData.pesoKg / (m * m)).toFixed(1));
  }

  submitBiometria() {
    const player = this.selectedPlayerForBio();
    if (!player) return;

    if (!this.newBioData.pesoKg || this.newBioData.pesoKg < 20 || this.newBioData.pesoKg > 180) {
      this.showToast('Ingresa un peso corporal válido entre 20 y 180 kg', true);
      return;
    }
    if (!this.newBioData.tallaCm || this.newBioData.tallaCm < 80 || this.newBioData.tallaCm > 240) {
      this.showToast('Ingresa una estatura / talla válida entre 80 y 240 cm', true);
      return;
    }

    this.savingBio = true;
    const payload = {
      tallaCm: Number(this.newBioData.tallaCm),
      pesoKg: Number(this.newBioData.pesoKg),
      testCooperMetros: this.newBioData.testCooperMetros ? Number(this.newBioData.testCooperMetros) : undefined,
      velocidad30mSeg: this.newBioData.velocidad30mSeg ? Number(this.newBioData.velocidad30mSeg) : undefined,
      saltoVerticalCm: this.newBioData.saltoVerticalCm ? Number(this.newBioData.saltoVerticalCm) : undefined,
      observaciones: this.newBioData.observaciones || undefined,
    };

    this.api.addBiometria(player.id, payload).subscribe({
      next: (res) => {
        this.savingBio = false;
        this.closeBiometriaModal();
        const bio = res.evaluacion || res;
        this.jugadores.update(list => list.map(j => {
          if (j.id === player.id) {
            return {
              ...j,
              peso_kg: bio.peso_kg || payload.pesoKg,
              talla_cm: bio.talla_cm || payload.tallaCm,
              imc: bio.imc || this.calculateLiveImc(),
            };
          }
          return j;
        }));
        this.loadJugadores();
        if (this.showExpedienteModal() && this.selectedExpediente()?.jugador.id === player.id) {
          this.openExpediente(player.id);
        }
        this.showToast('¡Medición biométrica registrada exitosamente!', false);
      },
      error: (err) => {
        this.savingBio = false;
        const msg = err?.error?.message || 'Error al guardar medición biométrica';
        this.showToast(msg, true);
      }
    });
  }

  // Acudientes
  toggleAddAcudienteForm() {
    this.showAddAcudienteForm = !this.showAddAcudienteForm;
  }

  submitAddAcudiente() {
    const exp = this.selectedExpediente();
    if (!exp) return;

    if (!this.newAcudiente.nombres || !this.newAcudiente.numeroDocumento || !this.newAcudiente.telefonoMovil) {
      this.showToast('Por favor diligencia los datos del acudiente', true);
      return;
    }

    this.savingAcudiente = true;
    this.api.addAcudiente(exp.jugador.id, this.newAcudiente).subscribe({
      next: () => {
        this.savingAcudiente = false;
        this.showAddAcudienteForm = false;
        this.openExpediente(exp.jugador.id);
        this.showToast('¡Acudiente vinculado con éxito!', false);
      },
      error: (err) => {
        this.savingAcudiente = false;
        const msg = err?.error?.message || 'Error al vincular acudiente';
        this.showToast(msg, true);
      }
    });
  }

  removeAcudiente(acudienteId: string) {
    const exp = this.selectedExpediente();
    if (!exp) return;

    this.api.removeAcudiente(exp.jugador.id, acudienteId).subscribe({
      next: () => {
        this.openExpediente(exp.jugador.id);
        this.showToast('Acudiente desvinculado', false);
      },
      error: (err) => {
        this.showToast('Error al desvincular acudiente', true);
      }
    });
  }

  // Editar & Retirar
  openEditModal(player: any) {
    this.selectedPlayerToEdit.set(player);
    this.localPhotoPreviewEdit.set(null);
    this.editPlayerData = {
      categoriaId: player.categoria_id || (this.categorias().length > 0 ? this.categorias()[0].id : ''),
      nombres: player.nombres || '',
      apellidos: player.apellidos || '',
      tipoDocumento: player.tipo_documento || 'TI',
      numeroDocumento: player.numero_documento || '',
      fechaNacimiento: player.fecha_nacimiento ? player.fecha_nacimiento.substring(0, 10) : '2011-05-15',
      genero: player.genero || 'MASCULINO',
      posicionPrincipal: player.posicion_principal || 'Delantero Centro',
      posicionSecundaria: player.posicion_secundaria || '',
      piernaHabil: player.pierna_habil || 'DIESTRO',
      numeroDorsal: player.numero_dorsal ? Number(player.numero_dorsal) : 10,
      eps: player.eps || 'SURA EPS',
      estadoMatricula: player.estado_matricula || 'ACTIVO',
      porcentajeBeca: player.porcentaje_beca ? Number(player.porcentaje_beca) : 0,
      fotoUrl: player.foto_url || '',
    };
    this.showEditModal.set(true);
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.selectedPlayerToEdit.set(null);
  }

  submitEditJugador() {
    const player = this.selectedPlayerToEdit();
    if (!player || !player.id) return;

    if (!this.editPlayerData.nombres?.trim()) {
      this.showToast('El nombre del deportista es obligatorio (*)', true);
      return;
    }
    if (!this.editPlayerData.apellidos?.trim()) {
      this.showToast('Los apellidos del deportista son obligatorios (*)', true);
      return;
    }
    if (!this.editPlayerData.numeroDocumento?.trim()) {
      this.showToast('El número de documento es obligatorio (*)', true);
      return;
    }
    if (this.editPlayerData.numeroDocumento.trim().length < 5) {
      this.showToast('El número de documento debe tener al menos 5 caracteres', true);
      return;
    }
    if (!this.editPlayerData.categoriaId) {
      this.showToast('Debes seleccionar una categoría deportiva válida (*)', true);
      return;
    }
    if (this.editPlayerData.numeroDorsal && (this.editPlayerData.numeroDorsal < 1 || this.editPlayerData.numeroDorsal > 99)) {
      this.showToast('El número de dorsal debe estar entre 1 y 99', true);
      return;
    }
    if (this.editPlayerData.porcentajeBeca && (this.editPlayerData.porcentajeBeca < 0 || this.editPlayerData.porcentajeBeca > 100)) {
      this.showToast('El porcentaje de beca debe estar entre 0% y 100%', true);
      return;
    }

    this.savingPlayer = true;
    this.api.updateJugador(player.id, {
      categoriaId: this.editPlayerData.categoriaId,
      nombres: this.editPlayerData.nombres,
      apellidos: this.editPlayerData.apellidos,
      tipoDocumento: this.editPlayerData.tipoDocumento,
      numeroDocumento: this.editPlayerData.numeroDocumento,
      fechaNacimiento: this.editPlayerData.fechaNacimiento,
      genero: this.editPlayerData.genero,
      posicionPrincipal: this.editPlayerData.posicionPrincipal,
      posicionSecundaria: this.editPlayerData.posicionSecundaria,
      piernaHabil: this.editPlayerData.piernaHabil,
      numeroDorsal: Number(this.editPlayerData.numeroDorsal),
      eps: this.editPlayerData.eps,
      estadoMatricula: this.editPlayerData.estadoMatricula,
      porcentajeBeca: Number(this.editPlayerData.porcentajeBeca) || 0,
      fotoUrl: this.editPlayerData.fotoUrl,
    }).subscribe({
      next: () => {
        this.savingPlayer = false;
        this.closeEditModal();
        this.loadJugadores();
        this.showToast('¡Ficha del jugador actualizada exitosamente!', false);
      },
      error: (err) => {
        this.savingPlayer = false;
        const msg = err?.error?.message || 'Error al actualizar ficha del jugador';
        this.showToast(msg, true);
      }
    });
  }

  // Retiro & Baja de Atleta
  openDeleteConfirmModal(player: any) {
    this.selectedPlayerToDelete.set(player);
    this.showDeleteConfirmModal.set(true);
  }

  closeDeleteConfirmModal() {
    this.showDeleteConfirmModal.set(false);
    this.selectedPlayerToDelete.set(null);
  }

  confirmRetireJugador() {
    const player = this.selectedPlayerToDelete();
    if (!player || !player.id) return;

    this.deletingPlayer.set(true);
    this.api.deleteJugador(player.id).subscribe({
      next: () => {
        this.deletingPlayer.set(false);
        this.closeDeleteConfirmModal();
        this.loadJugadores();
        this.showToast(`Jugador ${player.nombres} ${player.apellidos} retirado del club exitosamente`, false);
      },
      error: (err) => {
        this.deletingPlayer.set(false);
        const msg = err?.error?.message || 'Error al tramitar baja del jugador';
        this.showToast(msg, true);
      }
    });
  }

  retireJugador(player: any) {
    this.openDeleteConfirmModal(player);
  }

  // Helpers
  getEdad(fechaNacimiento: string): number {
    if (!fechaNacimiento) return 15;
    const birth = new Date(fechaNacimiento);
    const diff = Date.now() - birth.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  getImcClass(imc: number | string): string {
    const val = typeof imc === 'string' ? parseFloat(imc) : imc;
    if (val < 18.5) return 'bajo';
    if (val <= 24.9) return 'normal';
    return 'sobrepeso';
  }

  getImcLabel(imc: number | string): string {
    const val = typeof imc === 'string' ? parseFloat(imc) : imc;
    if (val < 18.5) return 'Bajo Peso';
    if (val <= 24.9) return 'Normal / Óptimo';
    if (val <= 29.9) return 'Sobrepeso';
    return 'Obesidad';
  }

  cleanPhone(phone: string): string {
    return (phone || '').replace(/[^0-9]/g, '');
  }

  getDefaultAvatar(genero: string): string {
    return genero === 'FEMENINO' 
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120'
      : 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=120';
  }

  private showToast(msg: string, isError: boolean) {
    this.toastMsg.set(msg);
    this.isToastError.set(isError);
    setTimeout(() => {
      this.toastMsg.set('');
    }, 4000);
  }
}

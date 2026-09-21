import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, JugadorExpediente360 } from '../../core/services/api.service';

@Component({
  selector: 'app-jugadores',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

      <!-- BARRA DE FILTROS & BÚSQUEDA REACTIVA -->
      <div class="filters-card">
        <div class="filters-top">
          <!-- Buscador de texto global -->
          <div class="search-box">
            <i class="fa-solid fa-magnifying-glass search-icon"></i>
            <input 
              type="text" 
              [ngModel]="searchQuery()" 
              (ngModelChange)="onSearchChange($event)"
              placeholder="Buscar por nombre, apellido, documento o EPS..." 
              class="search-input" />
            @if (searchQuery()) {
              <button class="clear-search-btn" (click)="clearSearch()">
                <i class="fa-solid fa-xmark"></i>
              </button>
            }
          </div>

          <!-- Filtro por Posición Táctica -->
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

          <!-- Filtro por Rama / Género -->
          <div class="sport-select-wrapper filter-select-wrap">
            <select [ngModel]="selectedGenero()" (ngModelChange)="onGeneroFilterChange($event)" class="filter-select">
              <option value="TODOS">👥 Todas las Ramas</option>
              <option value="MASCULINO">♂️ Masculino</option>
              <option value="FEMENINO">♀️ Femenino</option>
            </select>
            <i class="fa-solid fa-chevron-down select-chevron"></i>
          </div>

          <!-- Selector de Estado -->
          <div class="estado-select-wrapper filter-select-wrap">
            <select [ngModel]="selectedEstado()" (ngModelChange)="onEstadoFilterChange($event)" class="filter-select">
              <option value="TODOS">Todos los Estados</option>
              <option value="ACTIVO">Activos</option>
              <option value="LESIONADO">Lesionados</option>
              <option value="SUSPENDIDO">Suspendidos</option>
              <option value="RETIRADO">Retirados</option>
            </select>
            <i class="fa-solid fa-chevron-down select-chevron"></i>
          </div>

          @if (hasActiveFilters()) {
            <button class="btn-clear-all-filters" (click)="resetAllFilters()" title="Limpiar todos los filtros aplicados">
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
            <span class="pill-count">({{ jugadores().length }})</span>
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

      <!-- TABLA DE JUGADORES -->
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
            <p>No hay alumnos registrados que coincidan con los filtros seleccionados.</p>
            <button class="btn-primary-sm" (click)="openCreateModal()">
              <i class="fa-solid fa-user-plus"></i> Inscribir Primer Jugador
            </button>
          </div>
        } @else {
          <table class="fut-table">
            <thead>
              <tr>
                <th>Dorsal / Foto</th>
                <th>Nombre del Jugador</th>
                <th>Documento</th>
                <th>Categoría</th>
                <th>Posición & Perfil</th>
                <th>Biometría (Talla / Peso / IMC)</th>
                <th>Estado</th>
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
                          [src]="j.foto_url || getDefaultAvatar(j.genero)" 
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

                  <!-- Documento -->
                  <td>
                    <span class="doc-badge">{{ j.tipo_documento }} {{ j.numero_documento }}</span>
                  </td>

                  <!-- Categoría -->
                  <td>
                    <span class="badge-cat" [style.border-color]="j.color_distintivo || '#10B981'">
                      <span class="dot" [style.background-color]="j.color_distintivo || '#10B981'"></span>
                      {{ j.categoria_nombre }}
                    </span>
                  </td>

                  <!-- Posición / Pierna -->
                  <td>
                    <div class="position-info">
                      <span class="pos">{{ j.posicion_principal }}</span>
                      @if (j.posicion_secundaria) {
                        <span class="pos-sec-badge" title="Posición Secundaria / Polifuncionalidad">
                          <i class="fa-solid fa-arrows-split-up-and-left"></i> {{ j.posicion_secundaria }}
                        </span>
                      }
                      <span class="foot">
                        <i class="fa-solid fa-shoe-prints"></i> {{ j.pierna_habil || 'DIESTRO' }}
                      </span>
                    </div>
                  </td>

                  <!-- Biometría -->
                  <td>
                    @if (j.talla_cm && j.peso_kg) {
                      <div class="bio-info">
                        <span class="bio-metrics">{{ j.talla_cm }} cm • {{ j.peso_kg }} kg</span>
                        <span class="imc-badge" [class]="getImcClass(j.imc)">
                          IMC: {{ j.imc }} ({{ getImcLabel(j.imc) }})
                        </span>
                      </div>
                    } @else {
                      <button class="btn-add-bio-link" (click)="openBiometriaModal(j)">
                        <i class="fa-solid fa-plus"></i> Registrar Talla/Peso
                      </button>
                    }
                  </td>

                  <!-- Estado Matrícula -->
                  <td>
                    <span class="status-badge" [class]="j.estado_matricula ? j.estado_matricula.toLowerCase() : 'activo'">
                      <span class="status-dot"></span>
                      {{ j.estado_matricula || 'ACTIVO' }}
                    </span>
                  </td>

                  <!-- Acciones -->
                  <td>
                    <div class="table-actions">
                      <button 
                        class="action-btn btn-view" 
                        (click)="openExpediente(j.id)"
                        title="Ver Expediente 360° Completo">
                        <i class="fa-solid fa-id-card"></i>
                        <span>Ficha 360°</span>
                      </button>
                      <button 
                        class="action-btn btn-bio" 
                        (click)="openBiometriaModal(j)"
                        title="Registrar Prueba Biométrica">
                        <i class="fa-solid fa-heart-pulse"></i>
                      </button>
                      <button 
                        class="action-btn btn-edit" 
                        (click)="openEditModal(j)"
                        title="Editar Jugador">
                        <i class="fa-solid fa-pen"></i>
                      </button>
                      <button 
                        class="action-btn btn-delete" 
                        (click)="openDeleteConfirmModal(j)"
                        title="Dar de Baja / Retirar Atleta">
                        <i class="fa-solid fa-user-xmark"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>

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
                    [src]="selectedExpediente()!.jugador.foto_url || getDefaultAvatar(selectedExpediente()!.jugador.genero)" 
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
                          <select [(ngModel)]="newAcudiente.parentesco" name="acParentesco" class="sport-input">
                            <option value="PADRE">Padre</option>
                            <option value="MADRE">Madre</option>
                            <option value="TUTOR">Tutor Legal</option>
                            <option value="ABUELO">Abuelo/a</option>
                            <option value="OTRO">Otro</option>
                          </select>
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
                <div class="athlete-photo-uploader">
                  <div class="photo-preview-box">
                    <img 
                      [src]="editPlayerData.fotoUrl || getDefaultAvatar(editPlayerData.genero)" 
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
                    <p class="photo-hint">Formatos aceptados: PNG, JPG, WEBP. Tamaño máximo: 5 MB.</p>
                    <div class="url-input-wrap">
                      <label><i class="fa-solid fa-link"></i> O ingresar URL directa de la imagen:</label>
                      <input 
                        type="url" 
                        [(ngModel)]="editPlayerData.fotoUrl" 
                        name="epFotoUrl" 
                        placeholder="https://ejemplo.com/fotos/atleta.jpg" 
                        class="sport-input" />
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
                        <option value="TI">🪪 Tarjeta de Identidad (TI)</option>
                        <option value="RC">📄 Registro Civil (RC)</option>
                        <option value="CC">💳 Cédula de Ciudadanía (CC)</option>
                        <option value="CE">🌍 Cédula de Extranjería (CE)</option>
                        <option value="PASAPORTE">✈️ Pasaporte Oficial</option>
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
                    <input type="date" [(ngModel)]="editPlayerData.fechaNacimiento" name="epFechaNac" required class="sport-input" />
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
                    <label><i class="fa-solid fa-hospital-user"></i> Entidad EPS</label>
                    <input type="text" [(ngModel)]="editPlayerData.eps" name="epEps" placeholder="ej. SURA, Sanitas, Compensar" class="sport-input" />
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
                        <option value="DIESTRO">⚡ DIESTRO (Pie Derecho)</option>
                        <option value="ZURDO">🎯 ZURDO (Pie Izquierdo)</option>
                        <option value="AMBIDIESTRO">🔄 AMBIDIESTRO (Ambos Perfiles)</option>
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-shirt"></i> Número Dorsal Asignado</label>
                    <input type="number" [(ngModel)]="editPlayerData.numeroDorsal" name="epDorsal" min="1" max="99" class="sport-input" />
                  </div>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-hand-holding-dollar"></i> Porcentaje de Beca (%)</label>
                    <input type="number" [(ngModel)]="editPlayerData.porcentajeBeca" name="epBeca" min="0" max="100" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-image"></i> URL Foto del Atleta</label>
                    <input type="url" [(ngModel)]="editPlayerData.fotoUrl" name="epFoto" placeholder="https://..." class="sport-input" />
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
      @if (showCreateModal()) {
        <div class="modal-backdrop" (click)="closeCreateModal()">
          <div class="form-modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-user-plus"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Inscribir Nuevo Jugador</h2>
                  <p class="modal-subtitle">Ficha integral de matrícula deportiva, datos personales y acudientes</p>
                </div>
              </div>
              <button class="modal-close-btn btn-close" (click)="closeCreateModal()" aria-label="Cerrar">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form (ngSubmit)="submitCreateJugador()" class="modal-form">
              <!-- Fotografía Oficial del Deportista -->
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-camera"></i> Fotografía Oficial del Atleta</span>
                <div class="athlete-photo-uploader">
                  <div class="photo-preview-box">
                    <img 
                      [src]="newPlayerData.fotoUrl || getDefaultAvatar(newPlayerData.genero)" 
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
                    <p class="photo-hint">Formatos aceptados: PNG, JPG, WEBP. Tamaño máximo: 5 MB.</p>
                    <div class="url-input-wrap">
                      <label><i class="fa-solid fa-link"></i> O ingresar URL directa de la imagen:</label>
                      <input 
                        type="url" 
                        [(ngModel)]="newPlayerData.fotoUrl" 
                        name="npFotoUrl" 
                        placeholder="https://ejemplo.com/fotos/atleta.jpg" 
                        class="sport-input" />
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
                    <input type="text" [(ngModel)]="newPlayerData.nombres" name="npNombres" placeholder="ej. Tomás" required class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-user"></i> Apellidos <span class="required-star">*</span></label>
                    <input type="text" [(ngModel)]="newPlayerData.apellidos" name="npApellidos" placeholder="ej. Gómez Palacio" required class="sport-input" />
                  </div>
                </div>

                <div class="form-row g3">
                  <div class="input-group">
                    <label><i class="fa-solid fa-address-card"></i> Tipo Documento <span class="required-star">*</span></label>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="newPlayerData.tipoDocumento" name="npTipoDoc" class="sport-input">
                        <option value="TI">🪪 Tarjeta de Identidad (TI)</option>
                        <option value="RC">📄 Registro Civil (RC)</option>
                        <option value="CC">💳 Cédula de Ciudadanía (CC)</option>
                        <option value="CE">🌍 Cédula de Extranjería (CE)</option>
                        <option value="PASAPORTE">✈️ Pasaporte Oficial</option>
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
                    <input type="date" [(ngModel)]="newPlayerData.fechaNacimiento" name="npFechaNac" required class="sport-input" />
                  </div>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-venus-mars"></i> Género / Rama</label>
                    <div class="segmented-pill-selector">
                      <button type="button" class="pill-btn" [class.active]="newPlayerData.genero === 'MASCULINO'" (click)="newPlayerData.genero = 'MASCULINO'">
                        <i class="fa-solid fa-mars"></i> Masculino
                      </button>
                      <button type="button" class="pill-btn" [class.active]="newPlayerData.genero === 'FEMENINO'" (click)="newPlayerData.genero = 'FEMENINO'">
                        <i class="fa-solid fa-venus"></i> Femenino
                      </button>
                    </div>
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="newPlayerData.genero" name="npGenero" class="sport-input">
                        <option value="MASCULINO">⚽ Rama Masculina</option>
                        <option value="FEMENINO">⚽ Rama Femenina</option>
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-hospital-user"></i> Entidad EPS</label>
                    <input type="text" [(ngModel)]="newPlayerData.eps" name="npEps" placeholder="ej. SURA, Sanitas, Compensar" class="sport-input" />
                  </div>
                </div>
              </div>

              <!-- Sección 2: Datos Deportivos -->
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-futbol"></i> 2. Perfil Deportivo & Categoría</span>
                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-shield"></i> Categoría a Asignar <span class="required-star">*</span></label>
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
                    <label><i class="fa-solid fa-shirt"></i> Número de Dorsal (1-99)</label>
                    <input type="number" [(ngModel)]="newPlayerData.numeroDorsal" name="npDorsal" min="1" max="99" placeholder="ej. 10" class="sport-input" />
                  </div>
                </div>

                <div class="form-row g3">
                  <div class="input-group">
                    <label><i class="fa-solid fa-compass"></i> Posición Principal <span class="required-star">*</span></label>
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
                        </optgroup>
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-location-crosshairs"></i> Posición Secundaria</label>
                    <input type="text" [(ngModel)]="newPlayerData.posicionSecundaria" name="npPosSec" placeholder="ej. Extremo Derecho" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-shoe-prints"></i> Pierna Hábil</label>
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
                    <div class="sport-select-wrapper">
                      <select [(ngModel)]="newPlayerData.piernaHabil" name="npPierna" class="sport-input">
                        <option value="DIESTRO">⚡ DIESTRO (Pie Derecho)</option>
                        <option value="ZURDO">🎯 ZURDO (Pie Izquierdo)</option>
                        <option value="AMBIDIESTRO">🔄 AMBIDIESTRO (Ambos Perfiles)</option>
                      </select>
                      <i class="fa-solid fa-chevron-down select-chevron"></i>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Sección 3: Acudiente Inicial (Opcional) -->
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-people-roof"></i> 3. Acudiente / Contacto Principal (Opcional)</span>
                <div class="form-row g3">
                  <div class="input-group">
                    <label><i class="fa-solid fa-user-tie"></i> Nombres Acudiente</label>
                    <input type="text" [(ngModel)]="newPlayerData.acudienteNombres" name="npAcNom" placeholder="ej. Carlos" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-user-tie"></i> Apellidos Acudiente</label>
                    <input type="text" [(ngModel)]="newPlayerData.acudienteApellidos" name="npAcApe" placeholder="ej. Gómez" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-brands fa-whatsapp"></i> Teléfono (WhatsApp)</label>
                    <input type="tel" [(ngModel)]="newPlayerData.acudienteTelefono" name="npAcTel" placeholder="+57 310 123 4567" class="sport-input" />
                  </div>
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary btn-cancel" (click)="closeCreateModal()">
                  <i class="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button type="submit" class="btn-primary btn-submit" [disabled]="savingPlayer">
                  <i class="fa-solid fa-user-check"></i>
                  <span>{{ savingPlayer ? 'Inscribiendo...' : 'Inscribir Jugador' }}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- =====================================================================
           MODAL: REGISTRAR MEDICIÓN BIOMÉTRICA
           ===================================================================== -->
      @if (showBiometriaModal() && selectedPlayerForBio()) {
        <div class="modal-backdrop" (click)="closeBiometriaModal()">
          <div class="bio-modal-card modal-lg" (click)="$event.stopPropagation()">
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
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-weight-scale"></i> Antropometría Básica</span>
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

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-gauge-high"></i> Pruebas de Rendimiento Físico</span>
                <div class="form-row g3">
                  <div class="input-group">
                    <label><i class="fa-solid fa-person-running"></i> Test Cooper (Metros)</label>
                    <input type="number" [(ngModel)]="newBioData.testCooperMetros" name="bioCooper" placeholder="ej. 2800" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-bolt"></i> Sprint 30m (Segundos)</label>
                    <input type="number" step="0.01" [(ngModel)]="newBioData.velocidad30mSeg" name="bioVel" placeholder="ej. 3.90" class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-arrows-up-down"></i> Salto Vertical (cm)</label>
                    <input type="number" step="0.5" [(ngModel)]="newBioData.saltoVerticalCm" name="bioSalto" placeholder="ej. 45.0" class="sport-input" />
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-clipboard-user"></i> Observaciones del Evaluador / DT</span>
                <div class="input-group">
                  <textarea 
                    [(ngModel)]="newBioData.observaciones" 
                    name="bioObs" 
                    rows="3" 
                    placeholder="Notas sobre el estado físico, potencia o recomendaciones de nutrición..." 
                    class="sport-input"></textarea>
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
                    [src]="selectedPlayerToDelete()!.foto_url || getDefaultAvatar(selectedPlayerToDelete()!.genero)" 
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
      gap: 1rem;
      align-items: center;

      .search-box {
        flex: 1;
        position: relative;
        display: flex;
        align-items: center;

        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .search-input {
          width: 100%;
          padding: 0.65rem 2.25rem 0.65rem 2.5rem;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-main);
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s ease;

          &:focus {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px var(--color-primary-glow);
          }
        }

        .clear-search-btn {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;

          &:hover { color: var(--text-main); }
        }
      }

      .estado-select-wrapper {
        position: relative;
        display: flex;
        align-items: center;

        .filter-select {
          padding: 0.65rem 2rem 0.65rem 1rem;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-main);
          font-size: 0.875rem;
          font-weight: 600;
          outline: none;
          appearance: none;
          cursor: pointer;
        }

        .select-chevron {
          position: absolute;
          right: 0.75rem;
          pointer-events: none;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      }
    }

    .category-pills {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;

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

          .pill-count { color: rgba(255, 255, 255, 0.8); }
        }
      }
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

    @media (max-width: 768px) {
      .grid-2-col, .grid-3-col { grid-template-columns: 1fr; }
      .filters-top { flex-direction: column; }
    }
  `]
})
export class JugadoresComponent implements OnInit {
  private api = inject(ApiService);

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

  // Paginación Reactiva
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  // Expediente 360°
  showExpedienteModal = signal<boolean>(false);
  selectedExpediente = signal<JugadorExpediente360 | null>(null);
  activeExpTab = signal<'DEPORTIVO' | 'FAMILIA' | 'BIOMETRIA' | 'FINANZAS'>('DEPORTIVO');

  // Modal Inscribir Alumno
  showCreateModal = signal<boolean>(false);
  uploadingPhoto = signal<boolean>(false);
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
    acudienteNombres: '',
    acudienteApellidos: '',
    acudienteTelefono: '',
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

  // KPIs Computados
  totalJugadores = computed(() => this.jugadores().length);
  activosCount = computed(() => this.jugadores().filter(j => j.estado_matricula === 'ACTIVO').length);
  lesionadosCount = computed(() => this.jugadores().filter(j => j.estado_matricula === 'LESIONADO').length);
  evaluadosCount = computed(() => this.jugadores().filter(j => j.talla_cm && j.peso_kg).length);

  // Filtros Reactivos Activos Check
  hasActiveFilters = computed(() => {
    return this.searchQuery().trim() !== '' ||
      this.selectedCategoriaId() !== 'TODAS' ||
      this.selectedEstado() !== 'TODOS' ||
      this.selectedPosicion() !== 'TODAS' ||
      this.selectedGenero() !== 'TODOS';
  });

  // Lista Filtrada Completa
  jugadoresFiltrados = computed(() => {
    let list = this.jugadores();

    // 1. Filtro por Categoría
    if (this.selectedCategoriaId() !== 'TODAS') {
      list = list.filter(j => j.categoria_id === this.selectedCategoriaId());
    }

    // 2. Filtro por Estado de Matrícula
    if (this.selectedEstado() !== 'TODOS') {
      list = list.filter(j => j.estado_matricula === this.selectedEstado());
    }

    // 3. Filtro por Posición Táctica
    if (this.selectedPosicion() !== 'TODAS') {
      const pos = this.selectedPosicion().toLowerCase();
      list = list.filter(j => {
        const p1 = (j.posicion_principal || '').toLowerCase();
        const p2 = (j.posicion_secundaria || '').toLowerCase();
        if (pos === 'portero') return p1.includes('portero') || p1.includes('arquero') || p2.includes('portero') || p2.includes('arquero');
        if (pos === 'defensa') return p1.includes('defensa') || p1.includes('central') || p1.includes('lateral') || p1.includes('carrilero') || p2.includes('defensa') || p2.includes('central') || p2.includes('lateral');
        if (pos === 'volante') return p1.includes('volante') || p1.includes('medio') || p1.includes('pivote') || p1.includes('interior') || p1.includes('enganche') || p2.includes('volante') || p2.includes('medio');
        if (pos === 'delantero') return p1.includes('delantero') || p1.includes('extremo') || p1.includes('punta') || p1.includes('ariete') || p2.includes('delantero') || p2.includes('extremo');
        return p1.includes(pos) || p2.includes(pos);
      });
    }

    // 4. Filtro por Rama / Género
    if (this.selectedGenero() !== 'TODOS') {
      list = list.filter(j => (j.genero || 'MASCULINO') === this.selectedGenero());
    }

    // 5. Búsqueda de texto (Nombre, Apellido, Documento, EPS, Dorsal, Posición)
    if (this.searchQuery().trim()) {
      const q = this.searchQuery().toLowerCase().trim();
      list = list.filter(j => 
        (j.nombres && j.nombres.toLowerCase().includes(q)) ||
        (j.apellidos && j.apellidos.toLowerCase().includes(q)) ||
        (j.numero_documento && j.numero_documento.toLowerCase().includes(q)) ||
        (j.eps && j.eps.toLowerCase().includes(q)) ||
        (j.posicion_principal && j.posicion_principal.toLowerCase().includes(q)) ||
        (j.posicion_secundaria && j.posicion_secundaria.toLowerCase().includes(q)) ||
        (j.numero_dorsal && j.numero_dorsal.toString().includes(q))
      );
    }

    return list;
  });

  // Paginación Reactiva
  totalFilteredCount = computed(() => this.jugadoresFiltrados().length);
  totalPages = computed(() => Math.max(1, Math.ceil(this.totalFilteredCount() / this.pageSize())));

  paginatedJugadores = computed(() => {
    const list = this.jugadoresFiltrados();
    const cur = Math.min(Math.max(1, this.currentPage()), this.totalPages());
    const start = (cur - 1) * this.pageSize();
    return list.slice(start, start + this.pageSize());
  });

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
      this.categorias.set(cats || []);
      if (cats && cats.length > 0 && !this.newPlayerData.categoriaId) {
        this.newPlayerData.categoriaId = cats[0].id;
      }
    });
  }

  loadJugadores() {
    this.loading.set(true);
    this.api.getJugadores().subscribe({
      next: (data) => {
        this.jugadores.set(data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  selectCategoria(catId: string) {
    this.selectedCategoriaId.set(catId);
    this.currentPage.set(1);
  }

  onSearchChange(value: string) {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  onPosicionFilterChange(value: string) {
    this.selectedPosicion.set(value);
    this.currentPage.set(1);
  }

  onGeneroFilterChange(value: string) {
    this.selectedGenero.set(value);
    this.currentPage.set(1);
  }

  onEstadoFilterChange(value: string) {
    this.selectedEstado.set(value);
    this.currentPage.set(1);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(1);
  }

  resetAllFilters() {
    this.searchQuery.set('');
    this.selectedCategoriaId.set('TODAS');
    this.selectedEstado.set('TODOS');
    this.selectedPosicion.set('TODAS');
    this.selectedGenero.set('TODOS');
    this.currentPage.set(1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  setPageSize(size: number | string) {
    this.pageSize.set(Number(size));
    this.currentPage.set(1);
  }

  getCategoryCount(catId: string): number {
    return this.jugadores().filter(j => j.categoria_id === catId).length;
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
  openCreateModal() {
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
      acudienteNombres: '',
      acudienteApellidos: '',
      acudienteTelefono: '',
      fotoUrl: '',
    };
    this.showCreateModal.set(true);
  }

  onPhotoSelected(event: Event, mode: 'create' | 'edit') {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      this.showToast('Por favor selecciona un archivo de imagen válido', true);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.showToast('La imagen supera el límite de 5 MB', true);
      return;
    }

    this.uploadingPhoto.set(true);

    // Live preview inmediata con FileReader
    const reader = new FileReader();
    reader.onload = () => {
      if (mode === 'create') {
        this.newPlayerData.fotoUrl = reader.result as string;
      } else {
        this.editPlayerData.fotoUrl = reader.result as string;
      }
    };
    reader.readAsDataURL(file);

    // Subida al backend mediante endpoint de almacenamiento
    this.api.uploadFile(file, 'avatars').subscribe({
      next: (res) => {
        this.uploadingPhoto.set(false);
        const uploadedUrl = res.url || res.filename;
        if (mode === 'create') {
          this.newPlayerData.fotoUrl = uploadedUrl;
        } else {
          this.editPlayerData.fotoUrl = uploadedUrl;
        }
        this.showToast('¡Fotografía cargada correctamente!', false);
      },
      error: () => {
        this.uploadingPhoto.set(false);
        this.showToast('Fotografía cargada en vista previa local', false);
      }
    });
  }

  removePhoto(mode: 'create' | 'edit') {
    if (mode === 'create') {
      this.newPlayerData.fotoUrl = '';
    } else {
      this.editPlayerData.fotoUrl = '';
    }
    this.showToast('Fotografía removida', false);
  }

  closeCreateModal() {
    this.showCreateModal.set(false);
  }

  submitCreateJugador() {
    if (!this.newPlayerData.nombres || !this.newPlayerData.apellidos || !this.newPlayerData.numeroDocumento || !this.newPlayerData.categoriaId) {
      this.showToast('Por favor completa los campos obligatorios (*)', true);
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

    if (!this.editPlayerData.nombres || !this.editPlayerData.apellidos || !this.editPlayerData.numeroDocumento || !this.editPlayerData.categoriaId) {
      this.showToast('Por favor completa los campos obligatorios (*)', true);
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

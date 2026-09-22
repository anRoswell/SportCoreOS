import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';

export interface TenantModuleItem {
  code: string;
  name: string;
  description: string;
  category: string;
  order: number;
  icon: string;
  enabled: boolean;
  isIndefinite: boolean;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  updatedAt: string | null;
}

@Component({
  selector: 'app-modulos-escuela',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrDirective],
  template: `
    <div class="modulos-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            <i class="fa-solid fa-cubes text-emerald"></i> Módulos Habilitados por Escuela
          </h1>
          <p class="page-subtitle">
            Gestión de licencias, activación modular y vigencia por suscripción para la academia
          </p>
        </div>
        <div class="header-actions">
          <div class="club-badge-active">
            <i class="fa-solid fa-shield-halved text-emerald"></i>
            <select 
              class="club-header-select" 
              [ngModel]="api.activeClub().id" 
              (ngModelChange)="onClubSwitch($event)">
              @for (c of api.availableClubs(); track c.id) {
                <option [value]="c.id">{{ c.nombre }} ({{ c.ciudad }})</option>
              }
            </select>
            <span class="badge-pill">{{ clubInfo()?.plan || api.activeClub().plan }}</span>
          </div>
          <button class="btn-secondary" (click)="enableAllModules(true)">
            <i class="fa-solid fa-toggle-on text-emerald"></i> Habilitar Todos
          </button>
          <button class="btn-primary" (click)="saveBulkState()">
            <i class="fa-solid fa-floppy-disk"></i> Guardar Configuración
          </button>
          <button class="btn-primary btn-create-school" (click)="openCreateSchoolModal()">
            <i class="fa-solid fa-plus-circle"></i> Nueva Escuela
          </button>
        </div>
      </div>

      <!-- KPI METRICS ROW -->
      <div class="kpi-row">
        <div class="kpi-card fut-card">
          <div class="kpi-icon-wrap bg-blue-glow">
            <i class="fa-solid fa-layer-group"></i>
          </div>
          <div>
            <div class="kpi-val">{{ modulesList().length }}</div>
            <div class="kpi-label">Total en Catálogo</div>
          </div>
        </div>

        <div class="kpi-card fut-card">
          <div class="kpi-icon-wrap bg-emerald-glow">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <div class="kpi-val">{{ activeModulesCount() }}</div>
            <div class="kpi-label">Módulos Activos</div>
          </div>
        </div>

        <div class="kpi-card fut-card">
          <div class="kpi-icon-wrap bg-amber-glow">
            <i class="fa-solid fa-circle-pause"></i>
          </div>
          <div>
            <div class="kpi-val">{{ inactiveModulesCount() }}</div>
            <div class="kpi-label">Módulos Inactivos</div>
          </div>
        </div>

        <div class="kpi-card fut-card">
          <div class="kpi-icon-wrap bg-purple-glow">
            <i class="fa-solid fa-certificate"></i>
          </div>
          <div>
            <div class="kpi-val">{{ activePercentage() }}%</div>
            <div class="kpi-label">Cobertura de Licencia</div>
          </div>
        </div>
      </div>

      <!-- BARRA DE FILTROS Y CATEGORÍAS -->
      <div class="filters-bar fut-card">
        <div class="search-input-wrap">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Buscar módulo por nombre o descripción..."
            class="sport-input"
          />
        </div>

        <div class="category-chips">
          <button
            class="chip-btn"
            [class.active]="selectedCategory() === 'TODOS'"
            (click)="selectedCategory.set('TODOS')"
          >
            Todos ({{ modulesList().length }})
          </button>
          @for (cat of categories(); track cat) {
            <button
              class="chip-btn"
              [class.active]="selectedCategory() === cat"
              (click)="selectedCategory.set(cat)"
            >
              {{ cat }} ({{ countByCategory(cat) }})
            </button>
          }
        </div>
      </div>

      <!-- LISTA DE MÓDULOS EN GRID DE TARJETAS -->
      <div class="modules-grid">
        @for (mod of filteredModules(); track mod.code) {
          <div class="module-card fut-card" [class.module-inactive]="!mod.enabled">
            <div class="module-card-header">
              <div class="module-icon-wrap" [class.icon-active]="mod.enabled">
                <i class="fa-solid" [ngClass]="mod.icon || 'fa-cubes'"></i>
              </div>
              <div class="module-title-wrap">
                <div class="module-name-row">
                  <h3 class="module-title">{{ mod.name }}</h3>
                  <span class="module-code-badge">{{ mod.code }}</span>
                </div>
                <span class="module-category-pill">{{ mod.category }}</span>
              </div>
              <!-- SWITCH REACTIVO -->
              <label class="switch-toggle" [title]="mod.enabled ? 'Deshabilitar módulo' : 'Habilitar módulo'">
                <input
                  type="checkbox"
                  [checked]="mod.enabled"
                  (change)="toggleModule(mod)"
                />
                <span class="slider round"></span>
              </label>
            </div>

            <p class="module-description">{{ mod.description }}</p>

            <div class="module-footer">
              <div class="vigencia-badge" [class.indefinido]="mod.isIndefinite">
                <i class="fa-regular fa-clock"></i>
                @if (mod.isIndefinite) {
                  <span>Vigencia Indefinida</span>
                } @else {
                  <span>{{ mod.startDate || 'Inicio' }} ➔ {{ mod.endDate || 'Vence' }}</span>
                }
              </div>

              <button
                class="btn-edit-license"
                (click)="openEditModal(mod)"
                title="Configurar vigencia o fechas de licencia"
              >
                <i class="fa-solid fa-sliders"></i> Ajustar Licencia
              </button>
            </div>
          </div>
        }
      </div>

      <!-- MODAL DE EDICIÓN DE LICENCIA Y VIGENCIA -->
      @if (showModal()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-sliders"></i>
                </div>
                <div>
                  <h2 class="modal-title">Configurar Licencia: {{ selectedModule()?.name }}</h2>
                  <p class="modal-subtitle">Establece la vigencia y activación para la escuela actual</p>
                </div>
              </div>
              <button class="modal-close-btn btn-close" (click)="closeModal()">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form (ngSubmit)="saveModuleConfig()" class="modal-form">
              <div class="input-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [(ngModel)]="editForm.habilitado"
                    name="habilitado"
                  />
                  <span class="custom-checkbox"></span>
                  <span class="label-text"><strong>Módulo Habilitado</strong> (Permitir acceso a usuarios)</span>
                </label>
              </div>

              <div class="input-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [(ngModel)]="editForm.esIndefinido"
                    name="esIndefinido"
                  />
                  <span class="custom-checkbox"></span>
                  <span class="label-text"><strong>Licencia Permanente / Indefinida</strong> (Sin fecha de caducidad)</span>
                </label>
              </div>

              @if (!editForm.esIndefinido) {
                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-regular fa-calendar"></i> Fecha de Inicio</label>
                    <input
                      type="text"
                      appFlatpickr
                      placeholder="dd/mm/aaaa"
                      [(ngModel)]="editForm.fechaInicio"
                      name="fechaInicio"
                      class="sport-input"
                    />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-regular fa-calendar-xmark"></i> Fecha de Expiración</label>
                    <input
                      type="text"
                      appFlatpickr
                      placeholder="dd/mm/aaaa"
                      [(ngModel)]="editForm.fechaFin"
                      name="fechaFin"
                      class="sport-input"
                    />
                  </div>
                </div>
              }

              <!-- BOTONES DE ACCIÓN -->
              <div class="modal-actions">
                <button type="button" class="btn-secondary btn-cancel" (click)="closeModal()">
                  <i class="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button type="submit" class="btn-primary btn-submit" [disabled]="saving()">
                  @if (saving()) {
                    <i class="fa-solid fa-spinner fa-spin"></i> Guardando...
                  } @else {
                    <i class="fa-solid fa-check"></i> Aplicar Cambios
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL CREAR NUEVA ESCUELA (EXCLUSIVO SUPER ADMIN) -->
      @if (showCreateSchoolModal()) {
        <div class="modal-backdrop" (click)="closeCreateSchoolModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <!-- Modal Header -->
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <h2 class="modal-title">Registrar Nueva Escuela de Fútbol</h2>
                  <p class="modal-subtitle">Exclusivo Super Administrador • Alta multi-tenant y asignación de DT</p>
                </div>
              </div>
              <button class="modal-close-btn btn-close" (click)="closeCreateSchoolModal()" aria-label="Cerrar">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <!-- Modal Form -->
            <form (ngSubmit)="submitCreateSchool()" class="modal-form">
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-building-flag"></i> 1. Información de la Academia</span>

                <div class="form-row g2">
                  <div class="input-group">
                    <label>Nombre de la Academia <span class="required-star">*</span></label>
                    <input 
                      type="text" 
                      [(ngModel)]="newSchoolData.clubNombre" 
                      name="clubNombre" 
                      placeholder="ej. Academia Leones FC" 
                      required 
                      class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label>Sigla / Código Corto <span class="required-star">*</span></label>
                    <input 
                      type="text" 
                      [(ngModel)]="newSchoolData.sigla" 
                      name="sigla" 
                      placeholder="ej. ALFC" 
                      maxlength="10" 
                      required 
                      class="sport-input" />
                  </div>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label>Ciudad Sede <span class="required-star">*</span></label>
                    <input 
                      type="text" 
                      [(ngModel)]="newSchoolData.ciudad" 
                      name="ciudad" 
                      placeholder="ej. Bogotá D.C., Medellín..." 
                      required 
                      class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label>Plan de Suscripción</label>
                    <select [(ngModel)]="newSchoolData.plan" name="plan" class="sport-select">
                      <option value="Plan Club Élite Pro">Plan Club Élite Pro</option>
                      <option value="Plan Semillero Oro">Plan Semillero Oro</option>
                      <option value="Plan Élite Liga">Plan Élite Liga</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-user-tie"></i> 2. Director Deportivo Inicial</span>

                <div class="form-row g2">
                  <div class="input-group">
                    <label>Nombres <span class="required-star">*</span></label>
                    <input 
                      type="text" 
                      [(ngModel)]="newSchoolData.adminNombre" 
                      name="adminNombre" 
                      placeholder="ej. Andrés" 
                      required 
                      class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label>Apellidos <span class="required-star">*</span></label>
                    <input 
                      type="text" 
                      [(ngModel)]="newSchoolData.adminApellido" 
                      name="adminApellido" 
                      placeholder="ej. Escobar" 
                      required 
                      class="sport-input" />
                  </div>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label>Correo Electrónico del DT <span class="required-star">*</span></label>
                    <input 
                      type="email" 
                      [(ngModel)]="newSchoolData.adminEmail" 
                      name="adminEmail" 
                      placeholder="ej. director@leonesfc.com" 
                      required 
                      class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label>Teléfono Móvil</label>
                    <input 
                      type="tel" 
                      [(ngModel)]="newSchoolData.adminTelefono" 
                      name="adminTelefono" 
                      placeholder="+57 300 123 4567" 
                      class="sport-input" />
                  </div>
                </div>

                <div class="input-group">
                  <label>Contraseña Temporal <span class="required-star">*</span> (Mínimo 6 caracteres)</label>
                  <input 
                    type="password" 
                    [(ngModel)]="newSchoolData.adminPassword" 
                    name="adminPassword" 
                    placeholder="••••••••••••" 
                    minlength="6" 
                    required 
                    class="sport-input" />
                </div>
              </div>

              <!-- Modal Actions -->
              <div class="modal-actions">
                <button type="button" class="btn-secondary btn-cancel" (click)="closeCreateSchoolModal()">
                  <i class="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button type="submit" class="btn-primary btn-submit" [disabled]="creatingSchool()">
                  @if (creatingSchool()) {
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <span>Creando Academia...</span>
                  } @else {
                    <i class="fa-solid fa-check-circle"></i>
                    <span>Crear Escuela Deportiva</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- TOAST FEEDBACK -->
      @if (toastMessage()) {
        <div class="toast-alert" [class.error]="isToastError()">
          <i class="fa-solid" [class.fa-circle-check]="!isToastError()" [class.fa-circle-exclamation]="isToastError()"></i>
          <span>{{ toastMessage() }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .modulos-page {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      animation: fadeIn 0.3s ease;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-title {
      font-size: 1.65rem;
      font-weight: 800;
      color: var(--text-main);
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .page-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 0.25rem;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .club-badge-active {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      padding: 0.45rem 0.85rem;
      border-radius: var(--radius-full);
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--text-main);

      .club-header-select {
        background: transparent;
        border: none;
        outline: none;
        font-size: 0.825rem;
        font-weight: 700;
        color: var(--text-main);
        cursor: pointer;

        option {
          background: var(--bg-card);
          color: var(--text-main);
        }
      }

      .badge-pill {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
        padding: 0.15rem 0.5rem;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 700;
      }
    }

    .kpi-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
    }

    .kpi-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
    }

    .kpi-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.35rem;
    }

    .bg-blue-glow { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
    .bg-emerald-glow { background: rgba(16, 185, 129, 0.15); color: #10b981; }
    .bg-amber-glow { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    .bg-purple-glow { background: rgba(168, 85, 247, 0.15); color: #a855f7; }

    .kpi-val {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.1;
    }

    .kpi-label {
      font-size: 0.775rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .filters-bar {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
    }

    .search-input-wrap {
      position: relative;
      display: flex;
      align-items: center;

      i {
        position: absolute;
        left: 0.85rem;
        color: var(--text-muted);
        font-size: 0.9rem;
      }

      .sport-input {
        width: 100%;
        padding-left: 2.35rem;
      }
    }

    .category-chips {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;

      .chip-btn {
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        color: var(--text-muted);
        padding: 0.4rem 0.85rem;
        border-radius: var(--radius-full);
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s ease;

        &:hover {
          border-color: var(--color-primary);
          color: var(--text-main);
        }

        &.active {
          background: rgba(16, 185, 129, 0.15);
          border-color: var(--color-primary);
          color: var(--color-primary);
          font-weight: 700;
        }
      }
    }

    .modules-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
    }

    .module-card {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      transition: all 0.2s ease;

      &.module-inactive {
        opacity: 0.65;
        border-style: dashed;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-card);
      }
    }

    .module-card-header {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .module-icon-wrap {
      width: 42px;
      height: 42px;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.15rem;
      color: var(--text-muted);

      &.icon-active {
        background: rgba(16, 185, 129, 0.15);
        color: var(--color-primary);
        border-color: rgba(16, 185, 129, 0.35);
      }
    }

    .module-title-wrap {
      flex: 1;
    }

    .module-name-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .module-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .module-code-badge {
      font-size: 0.65rem;
      background: var(--bg-surface);
      color: var(--text-muted);
      padding: 0.15rem 0.4rem;
      border-radius: var(--radius-xs);
      font-family: monospace;
      font-weight: 700;
    }

    .module-category-pill {
      font-size: 0.725rem;
      color: var(--text-muted);
      font-weight: 600;
    }

    .module-description {
      font-size: 0.825rem;
      color: var(--text-body);
      line-height: 1.5;
      flex: 1;
    }

    .module-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color);
      gap: 0.5rem;
    }

    .vigencia-badge {
      font-size: 0.725rem;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 0.35rem;

      &.indefinido {
        color: #10b981;
      }
    }

    .btn-edit-license {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-main);
      padding: 0.35rem 0.65rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: all 0.2s ease;

      &:hover {
        background: var(--bg-surface);
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
    }

    /* SWITCH TOGGLE */
    .switch-toggle {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;

      input {
        opacity: 0;
        width: 0;
        height: 0;

        &:checked + .slider {
          background-color: var(--color-primary);
        }

        &:checked + .slider:before {
          transform: translateX(20px);
        }
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #4b5563;
        transition: 0.25s;

        &.round {
          border-radius: 34px;
        }

        &.round:before {
          border-radius: 50%;
        }

        &:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.25s;
        }
      }
    }

    /* MODAL */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .modal-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 780px;
      box-shadow: var(--shadow-card);
      overflow: hidden;
      display: flex;
      flex-direction: column;

      &.modal-lg { max-width: 860px; width: 92vw; }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
    }

    .modal-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .modal-icon-badge {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      background: rgba(16, 185, 129, 0.15);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
    }

    .modal-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--text-main);
    }

    .modal-subtitle {
      font-size: 0.775rem;
      color: var(--text-muted);
    }

    .modal-close-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 1.25rem;
      cursor: pointer;

      &:hover { color: #ef4444; }
    }

    .modal-form {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
    }

    .toast-alert {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #064e3b;
      color: #34d399;
      border: 1px solid #059669;
      padding: 0.75rem 1.25rem;
      border-radius: var(--radius-md);
      font-size: 0.875rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: var(--shadow-card);
      z-index: 2000;
      animation: slideUp 0.3s ease;

      &.error {
        background: #7f1d1d;
        color: #f87171;
        border-color: #dc2626;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `],
})
export class ModulosEscuelaComponent implements OnInit {
  api = inject(ApiService);

  modulesList = signal<TenantModuleItem[]>([]);
  clubInfo = signal<any>(null);
  selectedCategory = signal<string>('TODOS');
  searchQuery = signal<string>('');
  showModal = signal<boolean>(false);
  selectedModule = signal<TenantModuleItem | null>(null);
  saving = signal<boolean>(false);
  toastMessage = signal<string>('');
  isToastError = signal<boolean>(false);

  // Modal para que el Super Administrador cree nuevas escuelas
  showCreateSchoolModal = signal<boolean>(false);
  creatingSchool = signal<boolean>(false);

  newSchoolData = {
    clubNombre: '',
    sigla: '',
    ciudad: 'Bogotá D.C.',
    pais: 'Colombia',
    plan: 'Plan Club Élite Pro',
    adminNombre: '',
    adminApellido: '',
    adminEmail: '',
    adminPassword: '',
    adminTelefono: '',
  };

  editForm = {
    habilitado: true,
    esIndefinido: true,
    fechaInicio: '',
    fechaFin: '',
  };

  categories = computed(() => {
    const set = new Set<string>();
    this.modulesList().forEach((m) => set.add(m.category));
    return Array.from(set);
  });

  filteredModules = computed(() => {
    let list = this.modulesList();
    if (this.selectedCategory() !== 'TODOS') {
      list = list.filter((m) => m.category === this.selectedCategory());
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q),
      );
    }
    return list;
  });

  activeModulesCount = computed(() => this.modulesList().filter((m) => m.enabled).length);
  inactiveModulesCount = computed(() => this.modulesList().filter((m) => !m.enabled).length);
  activePercentage = computed(() => {
    const total = this.modulesList().length;
    if (total === 0) return 100;
    return Math.round((this.activeModulesCount() / total) * 100);
  });

  ngOnInit(): void {
    this.api.loadClubs();
    this.loadModules();
  }

  onClubSwitch(clubId: string): void {
    this.api.selectClub(clubId);
    this.loadModules();
  }

  loadModules(): void {
    const clubId = this.api.activeClub().id;
    this.api.getClubModules(clubId).subscribe({
      next: (res) => {
        const data = res.data || res;
        this.clubInfo.set(data.club);
        this.modulesList.set(data.modules || []);
      },
      error: (err) => {
        console.error('Error cargando módulos de escuela:', err);
        this.showToast('Error cargando módulos de la escuela.', true);
      },
    });
  }

  countByCategory(cat: string): number {
    return this.modulesList().filter((m) => m.category === cat).length;
  }

  toggleModule(mod: TenantModuleItem): void {
    const nextState = !mod.enabled;
    mod.enabled = nextState;
    mod.isActive = nextState;

    const clubId = this.api.activeClub().id;
    this.api
      .updateClubModule(clubId, mod.code, {
        habilitado: nextState,
        esIndefinido: mod.isIndefinite,
        fechaInicio: mod.startDate,
        fechaFin: mod.endDate,
      })
      .subscribe({
        next: () => {
          this.showToast(`Módulo '${mod.name}' ${nextState ? 'activado' : 'desactivado'} con éxito.`);
        },
        error: (err) => {
          console.error(err);
          mod.enabled = !nextState; // revert
          this.showToast(`Error al actualizar estado del módulo.`, true);
        },
      });
  }

  enableAllModules(enabled: boolean): void {
    const updated = this.modulesList().map((m) => ({
      ...m,
      enabled,
      isActive: enabled,
    }));
    this.modulesList.set(updated);

    const clubId = this.api.activeClub().id;
    const codes = enabled ? updated.map((m) => m.code) : [];
    this.api.bulkUpdateClubModules(clubId, codes).subscribe({
      next: () => {
        this.showToast(
          enabled
            ? 'Todos los módulos han sido habilitados para la escuela.'
            : 'Todos los módulos han sido deshabilitados.',
        );
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error al actualizar módulos en bloque.', true);
      },
    });
  }

  saveBulkState(): void {
    const clubId = this.api.activeClub().id;
    const activeCodes = this.modulesList()
      .filter((m) => m.enabled)
      .map((m) => m.code);

    this.api.bulkUpdateClubModules(clubId, activeCodes).subscribe({
      next: () => {
        this.showToast('Configuración de módulos de la escuela guardada con éxito.');
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error guardando configuración.', true);
      },
    });
  }

  openEditModal(mod: TenantModuleItem): void {
    this.selectedModule.set(mod);
    this.editForm = {
      habilitado: mod.enabled,
      esIndefinido: mod.isIndefinite,
      fechaInicio: mod.startDate ? mod.startDate.slice(0, 10) : '',
      fechaFin: mod.endDate ? mod.endDate.slice(0, 10) : '',
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedModule.set(null);
  }

  saveModuleConfig(): void {
    const mod = this.selectedModule();
    if (!mod) return;

    if (!this.editForm.esIndefinido && this.editForm.fechaInicio && this.editForm.fechaFin && this.editForm.fechaInicio > this.editForm.fechaFin) {
      this.showToast('La fecha de vencimiento no puede ser anterior a la fecha de inicio.', true);
      return;
    }

    this.saving.set(true);
    const clubId = this.api.activeClub().id;

    this.api
      .updateClubModule(clubId, mod.code, {
        habilitado: this.editForm.habilitado,
        esIndefinido: this.editForm.esIndefinido,
        fechaInicio: this.editForm.esIndefinido ? null : this.editForm.fechaInicio || null,
        fechaFin: this.editForm.esIndefinido ? null : this.editForm.fechaFin || null,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadModules();
          this.showToast(`Licencia de '${mod.name}' actualizada exitosamente.`);
        },
        error: (err) => {
          this.saving.set(false);
          console.error(err);
          this.showToast(err.error?.message || 'Error al guardar vigencia de la licencia.', true);
        },
      });
  }

  openCreateSchoolModal(): void {
    this.newSchoolData = {
      clubNombre: '',
      sigla: '',
      ciudad: 'Bogotá D.C.',
      pais: 'Colombia',
      plan: 'Plan Club Élite Pro',
      adminNombre: '',
      adminApellido: '',
      adminEmail: '',
      adminPassword: '',
      adminTelefono: '',
    };
    this.showCreateSchoolModal.set(true);
  }

  closeCreateSchoolModal(): void {
    this.showCreateSchoolModal.set(false);
  }

  submitCreateSchool(): void {
    if (
      !this.newSchoolData.clubNombre ||
      !this.newSchoolData.sigla ||
      !this.newSchoolData.ciudad ||
      !this.newSchoolData.adminNombre ||
      !this.newSchoolData.adminApellido ||
      !this.newSchoolData.adminEmail ||
      !this.newSchoolData.adminPassword
    ) {
      this.showToast('Por favor completa todos los campos requeridos (*).', true);
      return;
    }

    if (this.newSchoolData.adminPassword.length < 6) {
      this.showToast('La contraseña debe tener mínimo 6 caracteres.', true);
      return;
    }

    this.creatingSchool.set(true);

    this.api.createClubWithDirector(this.newSchoolData).subscribe({
      next: (res) => {
        this.creatingSchool.set(false);
        this.closeCreateSchoolModal();
        this.showToast(`¡Academia '${this.newSchoolData.clubNombre}' creada exitosamente por el Super Administrador!`);
        
        // Recargar escuelas y seleccionar la nueva
        if (res.club?.id) {
          this.api.selectClub(res.club.id);
          setTimeout(() => {
            this.loadModules();
          }, 300);
        } else {
          this.api.loadClubs();
          this.loadModules();
        }
      },
      error: (err) => {
        this.creatingSchool.set(false);
        const errorMsg = err.error?.message || 'Error al crear la escuela deportiva.';
        this.showToast(errorMsg, true);
      },
    });
  }

  private showToast(msg: string, isError = false): void {
    this.toastMessage.set(msg);
    this.isToastError.set(isError);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}

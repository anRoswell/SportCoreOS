import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

export interface RoleCatalogItem {
  code: string;
  label: string;
  description: string;
}

export interface PermissionMatrixRow {
  modulo: string;
  accion: string;
  descripcion: string;
  roles: Record<string, { permitido: boolean; nivelAcceso: string }>;
}

export interface UserRoleItem {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  avatar_url?: string;
  telefono?: string;
  rol_club: string;
  miembro_desde?: string;
}

@Component({
  selector: 'app-roles-permisos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="roles-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            <i class="fa-solid fa-user-shield text-emerald"></i> Roles, Perfiles & Permisos (RBAC)
          </h1>
          <p class="page-subtitle">
            Matriz de control de acceso basada en roles, permisos por módulo y asignación a miembros del club
          </p>
        </div>
        <div class="header-actions">
          <div class="main-tabs">
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'matriz'"
              (click)="activeTab.set('matriz')"
            >
              <i class="fa-solid fa-table-cells"></i> Matriz de Permisos
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'usuarios'"
              (click)="activeTab.set('usuarios')"
            >
              <i class="fa-solid fa-users"></i> Usuarios & Asignación
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'catalogo'"
              (click)="activeTab.set('catalogo')"
            >
              <i class="fa-solid fa-id-badge"></i> Catálogo de Roles
            </button>
          </div>
        </div>
      </div>

      <!-- =========================================================================
           TAB 1: MATRIZ DE PERMISOS RBAC
           ========================================================================= -->
      @if (activeTab() === 'matriz') {
        <!-- KPI METRICS ROW -->
        <div class="kpi-row">
          <div class="kpi-card fut-card">
            <div class="kpi-icon-wrap bg-blue-glow">
              <i class="fa-solid fa-shield-halved"></i>
            </div>
            <div>
              <div class="kpi-val">{{ selectedRoleLabel() }}</div>
              <div class="kpi-label">Rol en Edición</div>
            </div>
          </div>

          <div class="kpi-card fut-card">
            <div class="kpi-icon-wrap bg-emerald-glow">
              <i class="fa-solid fa-key"></i>
            </div>
            <div>
              <div class="kpi-val">{{ currentRolePermittedCount() }} / {{ matrixRows().length }}</div>
              <div class="kpi-label">Acciones Habilitadas</div>
            </div>
          </div>

          <div class="kpi-card fut-card">
            <div class="kpi-icon-wrap bg-purple-glow">
              <i class="fa-solid fa-layer-group"></i>
            </div>
            <div>
              <div class="kpi-val">{{ modulosCount() }} Módulos</div>
              <div class="kpi-label">Alcance de Seguridad</div>
            </div>
          </div>

          <div class="kpi-card fut-card">
            <div class="kpi-icon-wrap bg-amber-glow">
              <i class="fa-solid fa-users-gear"></i>
            </div>
            <div>
              <div class="kpi-val">{{ usersCountWithSelectedRole() }}</div>
              <div class="kpi-label">Usuarios con este Rol</div>
            </div>
          </div>
        </div>

        <!-- BARRA DE SELECCIÓN DE ROL Y FILTROS -->
        <div class="filters-bar fut-card">
          <div class="role-selector-row">
            <div class="role-dropdown-wrap">
              <label><i class="fa-solid fa-user-tag"></i> Seleccionar Rol Objetivo:</label>
              <select
                [ngModel]="selectedRole()"
                (ngModelChange)="onRoleSelect($event)"
                class="sport-select select-role"
              >
                @for (r of rolesCatalog(); track r.code) {
                  <option [value]="r.code">{{ r.label }} ({{ r.code }})</option>
                }
              </select>
            </div>

            <div class="actions-inline">
              <button class="btn-secondary" (click)="toggleAllForCurrentRole(true)">
                <i class="fa-solid fa-check-double text-emerald"></i> Permitir Todo
              </button>
              <button class="btn-secondary" (click)="confirmResetRole()">
                <i class="fa-solid fa-rotate-left"></i> Restablecer Defecto
              </button>
              <button class="btn-primary" (click)="saveCurrentRoleMatrix()" [disabled]="saving()">
                @if (saving()) {
                  <i class="fa-solid fa-spinner fa-spin"></i> Guardando...
                } @else {
                  <i class="fa-solid fa-floppy-disk"></i> Guardar Permisos
                }
              </button>
            </div>
          </div>

          <div class="search-and-module-row">
            <div class="search-input-wrap">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="searchQuery.set($event)"
                placeholder="Buscar por módulo, acción o descripción..."
                class="sport-input"
              />
            </div>

            <div class="category-chips">
              <button
                class="chip-btn"
                [class.active]="selectedModulo() === 'TODOS'"
                (click)="selectedModulo.set('TODOS')"
              >
                Todos ({{ matrixRows().length }})
              </button>
              @for (mod of modulos(); track mod) {
                <button
                  class="chip-btn"
                  [class.active]="selectedModulo() === mod"
                  (click)="selectedModulo.set(mod)"
                >
                  {{ mod }} ({{ countByModulo(mod) }})
                </button>
              }
            </div>
          </div>
        </div>

        <!-- TABLA DE MATRIZ DE PERMISOS -->
        <div class="table-container fut-card">
          <table class="fut-table">
            <thead>
              <tr>
                <th style="width: 140px;">Módulo</th>
                <th style="width: 220px;">Acción del Sistema</th>
                <th>Descripción Funcional</th>
                <th style="width: 130px; text-align: center;">Permitido</th>
                <th style="width: 180px;">Nivel de Acceso</th>
              </tr>
            </thead>
            <tbody>
              @for (row of filteredMatrix(); track row.modulo + row.accion) {
                <tr [class.row-forbidden]="!getRolePerm(row).permitido">
                  <td>
                    <span class="module-badge">{{ row.modulo }}</span>
                  </td>
                  <td>
                    <strong class="action-key font-mono">{{ row.accion }}</strong>
                  </td>
                  <td>
                    <span class="action-desc">{{ row.descripcion }}</span>
                  </td>
                  <td style="text-align: center;">
                    <label class="switch-toggle">
                      <input
                        type="checkbox"
                        [checked]="getRolePerm(row).permitido"
                        (change)="togglePermission(row)"
                      />
                      <span class="slider round"></span>
                    </label>
                  </td>
                  <td>
                    <select
                      [(ngModel)]="getRolePerm(row).nivelAcceso"
                      [disabled]="!getRolePerm(row).permitido"
                      class="sport-select select-sm font-mono"
                    >
                      <option value="ALL">ALL (Total)</option>
                      <option value="RO">RO (Read Only)</option>
                      <option value="OWN">OWN (Propios)</option>
                      <option value="NONE">NONE (Sin acceso)</option>
                    </select>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- =========================================================================
           TAB 2: USUARIOS & ASIGNACIÓN DE ROLES
           ========================================================================= -->
      @if (activeTab() === 'usuarios') {
        <div class="users-tab-panel fut-card">
          <div class="users-header">
            <div>
              <h2 class="panel-title">Directorio de Usuarios de la Escuela</h2>
              <p class="panel-subtitle">Asigna y actualiza instantáneamente el rol y nivel de privilegio de cada colaborador</p>
            </div>
            <div class="user-stats">
              <span class="stat-pill"><i class="fa-solid fa-users"></i> {{ usersList().length }} Usuarios</span>
            </div>
          </div>

          <div class="table-container">
            <table class="fut-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Correo Electrónico</th>
                  <th>Teléfono</th>
                  <th>Rol Asignado</th>
                  <th>Miembro Desde</th>
                  <th style="text-align: right;">Acción</th>
                </tr>
              </thead>
              <tbody>
                @for (u of usersList(); track u.id) {
                  <tr>
                    <td>
                      <div class="user-cell">
                        <img
                          [src]="u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80'"
                          [alt]="u.nombre"
                          class="user-avatar-sm"
                        />
                        <div>
                          <strong class="user-name">{{ u.nombre }} {{ u.apellido }}</strong>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="font-mono text-muted">{{ u.email }}</span>
                    </td>
                    <td>
                      <span>{{ u.telefono || 'Sin registrar' }}</span>
                    </td>
                    <td>
                      <select
                        [(ngModel)]="u.rol_club"
                        (change)="onUserRoleChange(u)"
                        class="sport-select select-sm font-mono"
                      >
                        @for (r of rolesCatalog(); track r.code) {
                          <option [value]="r.code">{{ r.label }}</option>
                        }
                      </select>
                    </td>
                    <td>
                      <small class="text-muted">{{ u.miembro_desde ? (u.miembro_desde | date:'mediumDate') : 'Activo' }}</small>
                    </td>
                    <td style="text-align: right;">
                      <button
                        class="btn-icon-action"
                        (click)="saveUserRole(u)"
                        title="Guardar asignación de rol"
                      >
                        <i class="fa-solid fa-floppy-disk"></i>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- =========================================================================
           TAB 3: CATÁLOGO DE ROLES Y PERFILES
           ========================================================================= -->
      @if (activeTab() === 'catalogo') {
        <div class="roles-catalog-grid">
          @for (role of rolesCatalog(); track role.code) {
            <div class="role-card fut-card" (click)="selectRoleFromCatalog(role.code)">
              <div class="role-card-header">
                <div class="role-icon-wrap">
                  <i class="fa-solid fa-shield-halved"></i>
                </div>
                <div>
                  <h3 class="role-card-title">{{ role.label }}</h3>
                  <span class="role-card-code font-mono">{{ role.code }}</span>
                </div>
              </div>
              <p class="role-card-desc">{{ role.description }}</p>
              <div class="role-card-footer">
                <button class="btn-role-action">
                  <i class="fa-solid fa-sliders"></i> Ver Matriz de Permisos
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- MODAL CONFIRMAR RESET -->
      @if (showResetModal()) {
        <div class="modal-backdrop" (click)="closeResetModal()">
          <div class="modal-card modal-sm" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge bg-amber-glow text-amber">
                  <i class="fa-solid fa-rotate-left"></i>
                </div>
                <div>
                  <h2 class="modal-title">Restablecer Permisos</h2>
                  <p class="modal-subtitle">Rol: {{ selectedRoleLabel() }}</p>
                </div>
              </div>
              <button class="modal-close-btn btn-close" (click)="closeResetModal()">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div class="modal-body-delete">
              <p>
                ¿Deseas restablecer los permisos del rol
                <strong>{{ selectedRoleLabel() }}</strong> a la plantilla predeterminada del sistema?
              </p>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary btn-cancel" (click)="closeResetModal()">
                <i class="fa-solid fa-xmark"></i> Cancelar
              </button>
              <button type="button" class="btn-primary btn-submit" (click)="executeResetRole()" [disabled]="saving()">
                @if (saving()) {
                  <i class="fa-solid fa-spinner fa-spin"></i> Restableciendo...
                } @else {
                  <i class="fa-solid fa-check"></i> Confirmar Restablecimiento
                }
              </button>
            </div>
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
    .roles-page {
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

    .main-tabs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      padding: 0.3rem;
      border-radius: var(--radius-full);

      .tab-btn {
        background: transparent;
        border: none;
        color: var(--text-muted);
        padding: 0.45rem 0.95rem;
        border-radius: var(--radius-full);
        font-size: 0.825rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.4rem;
        transition: all 0.2s ease;

        &:hover { color: var(--text-main); }

        &.active {
          background: var(--color-primary);
          color: #ffffff;
        }
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
      font-size: 1.35rem;
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
      padding: 1.25rem;
    }

    .role-selector-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .role-dropdown-wrap {
      display: flex;
      align-items: center;
      gap: 0.75rem;

      label {
        font-size: 0.85rem;
        font-weight: 700;
        color: var(--text-main);
        display: flex;
        align-items: center;
        gap: 0.4rem;

        i { color: var(--color-primary); }
      }

      .select-role {
        min-width: 280px;
        font-weight: 700;
      }
    }

    .actions-inline {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .search-and-module-row {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
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
        padding: 0.35rem 0.75rem;
        border-radius: var(--radius-full);
        font-size: 0.775rem;
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

    .table-container {
      overflow-x: auto;
      padding: 0;
    }

    .fut-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;

      th {
        background: var(--bg-surface);
        padding: 0.85rem 1rem;
        text-align: left;
        font-weight: 700;
        color: var(--text-muted);
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-bottom: 1px solid var(--border-color);
      }

      td {
        padding: 0.85rem 1rem;
        border-bottom: 1px solid var(--border-color);
        color: var(--text-main);
        vertical-align: middle;
      }

      tr:hover td {
        background: var(--bg-surface);
      }

      tr.row-forbidden td {
        opacity: 0.65;
      }
    }

    .module-badge {
      font-size: 0.7rem;
      font-weight: 800;
      color: var(--color-primary);
      letter-spacing: 0.05em;
    }

    .action-key {
      font-size: 0.825rem;
      color: var(--text-main);
    }

    .action-desc {
      font-size: 0.8rem;
      color: var(--text-body);
    }

    .select-sm {
      padding: 0.35rem 0.5rem;
      font-size: 0.775rem;
    }

    /* TAB 2: USERS */
    .users-tab-panel {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .users-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 1rem;
    }

    .panel-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--text-main);
    }

    .panel-subtitle {
      font-size: 0.825rem;
      color: var(--text-muted);
    }

    .stat-pill {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      padding: 0.35rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-main);
    }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .user-avatar-sm {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
    }

    .user-name {
      font-size: 0.85rem;
      color: var(--text-main);
    }

    .btn-icon-action {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      width: 30px;
      height: 30px;
      border-radius: var(--radius-sm);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.8rem;

      &:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
    }

    /* TAB 3: ROLES CATALOG */
    .roles-catalog-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.25rem;
    }

    .role-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        border-color: var(--color-primary);
        box-shadow: var(--shadow-card);
      }
    }

    .role-card-header {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .role-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-md);
      background: rgba(16, 185, 129, 0.15);
      color: var(--color-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .role-card-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--text-main);
    }

    .role-card-code {
      font-size: 0.7rem;
      color: var(--text-muted);
    }

    .role-card-desc {
      font-size: 0.85rem;
      color: var(--text-body);
      line-height: 1.5;
      flex: 1;
    }

    .role-card-footer {
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color);
    }

    .btn-role-action {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--color-primary);
      width: 100%;
      padding: 0.45rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;

      &:hover {
        background: var(--color-primary);
        color: #ffffff;
      }
    }

    /* SWITCH TOGGLE */
    .switch-toggle {
      position: relative;
      display: inline-block;
      width: 38px;
      height: 20px;

      input {
        opacity: 0;
        width: 0;
        height: 0;

        &:checked + .slider {
          background-color: var(--color-primary);
        }

        &:checked + .slider:before {
          transform: translateX(18px);
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
          height: 14px;
          width: 14px;
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
      max-width: 500px;
      box-shadow: var(--shadow-card);
      overflow: hidden;
      display: flex;
      flex-direction: column;

      &.modal-sm { max-width: 420px; }
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

    .modal-body-delete {
      padding: 1.5rem;
      font-size: 0.9rem;
      color: var(--text-body);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
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
export class RolesPermisosComponent implements OnInit {
  api = inject(ApiService);

  activeTab = signal<'matriz' | 'usuarios' | 'catalogo'>('matriz');
  rolesCatalog = signal<RoleCatalogItem[]>([]);
  selectedRole = signal<string>('DIRECTOR_DEPORTIVO');
  selectedModulo = signal<string>('TODOS');
  searchQuery = signal<string>('');
  matrixRows = signal<PermissionMatrixRow[]>([]);
  usersList = signal<UserRoleItem[]>([]);
  saving = signal<boolean>(false);
  toastMessage = signal<string>('');
  isToastError = signal<boolean>(false);
  showResetModal = signal<boolean>(false);

  modulos = computed(() => {
    const set = new Set<string>();
    this.matrixRows().forEach((r) => set.add(r.modulo));
    return Array.from(set);
  });

  filteredMatrix = computed(() => {
    let list = this.matrixRows();
    if (this.selectedModulo() !== 'TODOS') {
      list = list.filter((r) => r.modulo === this.selectedModulo());
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(
        (r) =>
          r.modulo.toLowerCase().includes(q) ||
          r.accion.toLowerCase().includes(q) ||
          r.descripcion.toLowerCase().includes(q),
      );
    }
    return list;
  });

  selectedRoleLabel = computed(() => {
    const r = this.rolesCatalog().find((x) => x.code === this.selectedRole());
    return r ? r.label : this.selectedRole();
  });

  currentRolePermittedCount = computed(() => {
    const r = this.selectedRole();
    return this.matrixRows().filter((row) => row.roles[r]?.permitido).length;
  });

  modulosCount = computed(() => this.modulos().length);

  usersCountWithSelectedRole = computed(() => {
    const r = this.selectedRole();
    return this.usersList().filter((u) => u.rol_club === r).length;
  });

  ngOnInit(): void {
    this.loadCatalog();
    this.loadMatrix();
    this.loadUsers();
  }

  loadCatalog(): void {
    this.api.getRolesCatalog().subscribe({
      next: (roles) => {
        const rows = Array.isArray(roles) ? roles : ((roles as any)?.data || []);
        this.rolesCatalog.set(rows);
      },
      error: (err) => console.error(err),
    });
  }

  loadMatrix(): void {
    this.api.getPermissionsMatrix().subscribe({
      next: (res) => {
        const data = res?.data || res;
        this.matrixRows.set(data?.matrix || (Array.isArray(data) ? data : []));
      },
      error: (err) => {
        console.error('Error cargando matriz de permisos:', err);
        this.showToast('Error cargando permisos.', true);
      },
    });
  }

  loadUsers(): void {
    this.api.getUsersWithRoles().subscribe({
      next: (users) => {
        const rows = Array.isArray(users) ? users : ((users as any)?.data || []);
        this.usersList.set(rows);
      },
      error: (err) => console.error(err),
    });
  }

  onRoleSelect(roleCode: string): void {
    this.selectedRole.set(roleCode);
  }

  selectRoleFromCatalog(roleCode: string): void {
    this.selectedRole.set(roleCode);
    this.activeTab.set('matriz');
  }

  countByModulo(mod: string): number {
    return this.matrixRows().filter((r) => r.modulo === mod).length;
  }

  getRolePerm(row: PermissionMatrixRow): { permitido: boolean; nivelAcceso: string } {
    const r = this.selectedRole();
    if (!row.roles[r]) {
      row.roles[r] = { permitido: false, nivelAcceso: 'NONE' };
    }
    return row.roles[r];
  }

  togglePermission(row: PermissionMatrixRow): void {
    const perm = this.getRolePerm(row);
    perm.permitido = !perm.permitido;
    if (perm.permitido && perm.nivelAcceso === 'NONE') {
      perm.nivelAcceso = 'ALL';
    } else if (!perm.permitido) {
      perm.nivelAcceso = 'NONE';
    }
  }

  toggleAllForCurrentRole(permitido: boolean): void {
    const r = this.selectedRole();
    this.matrixRows().forEach((row) => {
      if (!row.roles[r]) {
        row.roles[r] = { permitido, nivelAcceso: permitido ? 'ALL' : 'NONE' };
      } else {
        row.roles[r].permitido = permitido;
        row.roles[r].nivelAcceso = permitido ? 'ALL' : 'NONE';
      }
    });
    this.showToast(
      permitido
        ? `Todas las acciones han sido habilitadas para ${this.selectedRoleLabel()}.`
        : `Todas las acciones han sido revocadas.`,
    );
  }

  saveCurrentRoleMatrix(): void {
    const r = this.selectedRole();
    this.saving.set(true);

    const permisos = this.matrixRows().map((row) => ({
      modulo: row.modulo,
      accion: row.accion,
      permitido: row.roles[r]?.permitido ?? false,
      nivelAcceso: row.roles[r]?.nivelAcceso ?? 'NONE',
    }));

    this.api.updateRolePermissions(r, permisos).subscribe({
      next: () => {
        this.saving.set(false);
        this.showToast(`Permisos del rol '${this.selectedRoleLabel()}' guardados exitosamente.`);
      },
      error: (err) => {
        this.saving.set(false);
        console.error(err);
        this.showToast(err.error?.message || 'Error al guardar permisos del rol.', true);
      },
    });
  }

  confirmResetRole(): void {
    this.showResetModal.set(true);
  }

  closeResetModal(): void {
    this.showResetModal.set(false);
  }

  executeResetRole(): void {
    const r = this.selectedRole();
    this.saving.set(true);

    this.api.resetRolePermissions(r).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeResetModal();
        this.loadMatrix();
        this.showToast(`Permisos de '${this.selectedRoleLabel()}' restablecidos a los valores predeterminados.`);
      },
      error: (err) => {
        this.saving.set(false);
        console.error(err);
        this.showToast('Error al restablecer permisos.', true);
      },
    });
  }

  onUserRoleChange(u: UserRoleItem): void {
    this.saveUserRole(u);
  }

  saveUserRole(u: UserRoleItem): void {
    this.api.assignUserRole(u.id, u.rol_club).subscribe({
      next: () => {
        this.showToast(`Rol de '${u.nombre} ${u.apellido}' actualizado a '${u.rol_club}'.`);
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error al actualizar rol del usuario.', true);
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

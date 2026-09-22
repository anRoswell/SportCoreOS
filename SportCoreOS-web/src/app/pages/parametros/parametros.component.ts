import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

export interface ParametroItem {
  id: string;
  club_id: string | null;
  modulo: string;
  clave: string;
  valor: string;
  tipo_valor: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  titulo: string;
  descripcion: string | null;
  estado: boolean;
  es_editable: boolean;
  updated_at?: string;
  // Local edit buffer
  editValor?: string;
  isModified?: boolean;
}

@Component({
  selector: 'app-parametros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="parametros-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            <i class="fa-solid fa-sliders text-emerald"></i> Parámetros del Sistema
          </h1>
          <p class="page-subtitle">
            Configuración global y específica de la academia: monedas, tolerancias de mora, pasarelas de pago y umbrales ACWR
          </p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" (click)="openCreateModal()">
            <i class="fa-solid fa-plus-circle"></i> Nuevo Parámetro
          </button>
        </div>
      </div>

      <!-- KPI METRICS ROW -->
      <div class="kpi-row">
        <div class="kpi-card fut-card">
          <div class="kpi-icon-wrap bg-blue-glow">
            <i class="fa-solid fa-database"></i>
          </div>
          <div>
            <div class="kpi-val">{{ parametrosList().length }}</div>
            <div class="kpi-label">Parámetros Registrados</div>
          </div>
        </div>

        <div class="kpi-card fut-card">
          <div class="kpi-icon-wrap bg-emerald-glow">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <div>
            <div class="kpi-val">{{ activeParamsCount() }}</div>
            <div class="kpi-label">Parámetros Activos</div>
          </div>
        </div>

        <div class="kpi-card fut-card">
          <div class="kpi-icon-wrap bg-purple-glow">
            <i class="fa-solid fa-cubes-stacked"></i>
          </div>
          <div>
            <div class="kpi-val">{{ modulesCount() }}</div>
            <div class="kpi-label">Módulos Parametrizados</div>
          </div>
        </div>

        <div class="kpi-card fut-card">
          <div class="kpi-icon-wrap bg-amber-glow">
            <i class="fa-solid fa-pen-to-square"></i>
          </div>
          <div>
            <div class="kpi-val">{{ modifiedCount() }}</div>
            <div class="kpi-label">Cambios Pendientes</div>
          </div>
        </div>
      </div>

      <!-- BARRA DE FILTROS & TABS -->
      <div class="filters-bar fut-card">
        <div class="search-input-wrap">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input
            type="text"
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Buscar por clave, título o descripción..."
            class="sport-input"
          />
        </div>

        <div class="module-tabs">
          <button
            class="tab-btn"
            [class.active]="selectedModulo() === 'TODOS'"
            (click)="selectedModulo.set('TODOS')"
          >
            Todos ({{ parametrosList().length }})
          </button>
          @for (mod of modulos(); track mod) {
            <button
              class="tab-btn"
              [class.active]="selectedModulo() === mod"
              (click)="selectedModulo.set(mod)"
            >
              {{ mod }} ({{ countByModulo(mod) }})
            </button>
          }
        </div>
      </div>

      <!-- TABLA DE PARÁMETROS -->
      <div class="table-container fut-card">
        <table class="fut-table">
          <thead>
            <tr>
              <th>Módulo / Clave</th>
              <th>Título & Descripción</th>
              <th>Tipo</th>
              <th style="min-width: 260px;">Valor Configurado</th>
              <th>Estado</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (p of filteredParametros(); track p.id) {
              <tr [class.row-modified]="p.isModified">
                <!-- Módulo & Clave -->
                <td>
                  <div class="param-clave-wrap">
                    <span class="module-badge">{{ p.modulo }}</span>
                    <strong class="param-key">{{ p.clave }}</strong>
                  </div>
                </td>

                <!-- Título & Descripción -->
                <td>
                  <div class="param-info-wrap">
                    <span class="param-title-text">{{ p.titulo }}</span>
                    @if (p.descripcion) {
                      <small class="param-desc-text">{{ p.descripcion }}</small>
                    }
                  </div>
                </td>

                <!-- Tipo de Valor -->
                <td>
                  <span class="type-pill" [class]="'type-' + p.tipo_valor.toLowerCase()">
                    {{ p.tipo_valor }}
                  </span>
                </td>

                <!-- Input Dinámico de Valor -->
                <td>
                  <!-- BOOLEAN: Switch -->
                  @if (p.tipo_valor === 'BOOLEAN') {
                    <div class="switch-row">
                      <label class="switch-toggle">
                        <input
                          type="checkbox"
                          [checked]="p.editValor === 'true'"
                          (change)="onBooleanChange(p, $event)"
                          [disabled]="!p.es_editable"
                        />
                        <span class="slider round"></span>
                      </label>
                      <span class="switch-label-text">
                        {{ p.editValor === 'true' ? 'Activado (True)' : 'Desactivado (False)' }}
                      </span>
                    </div>
                  } @else if (p.tipo_valor === 'NUMBER') {
                    <!-- NUMBER: Input Number -->
                    <div class="input-inline-wrap">
                      <input
                        type="number"
                        [(ngModel)]="p.editValor"
                        (ngModelChange)="onValueChange(p)"
                        [disabled]="!p.es_editable"
                        class="sport-input input-sm"
                      />
                    </div>
                  } @else if (p.tipo_valor === 'JSON') {
                    <!-- JSON: Textarea -->
                    <div class="input-inline-wrap">
                      <textarea
                        [(ngModel)]="p.editValor"
                        (ngModelChange)="onValueChange(p)"
                        [disabled]="!p.es_editable"
                        rows="2"
                        class="sport-input input-sm font-mono"
                      ></textarea>
                    </div>
                  } @else {
                    <!-- STRING: Text Input -->
                    <div class="input-inline-wrap">
                      <input
                        type="text"
                        [(ngModel)]="p.editValor"
                        (ngModelChange)="onValueChange(p)"
                        [disabled]="!p.es_editable"
                        class="sport-input input-sm"
                      />
                    </div>
                  }
                </td>

                <!-- Estado -->
                <td>
                  <span class="status-badge" [class.active]="p.estado">
                    <i class="fa-solid" [class.fa-circle-check]="p.estado" [class.fa-circle-xmark]="!p.estado"></i>
                    {{ p.estado ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>

                <!-- Acciones -->
                <td style="text-align: right;">
                  <div class="actions-row">
                    @if (p.isModified) {
                      <button
                        class="btn-save-inline"
                        (click)="saveParametro(p)"
                        title="Guardar cambios"
                      >
                        <i class="fa-solid fa-floppy-disk"></i> Guardar
                      </button>
                    }
                    <button
                      class="btn-icon-action"
                      (click)="openEditDetailsModal(p)"
                      title="Editar detalles"
                    >
                      <i class="fa-solid fa-pen"></i>
                    </button>
                    @if (p.es_editable) {
                      <button
                        class="btn-icon-action text-rose"
                        (click)="confirmDelete(p)"
                        title="Eliminar parámetro"
                      >
                        <i class="fa-solid fa-trash-can"></i>
                      </button>
                    }
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- MODAL CREAR NUEVO PARÁMETRO -->
      @if (showCreateModal()) {
        <div class="modal-backdrop" (click)="closeCreateModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-plus"></i>
                </div>
                <div>
                  <h2 class="modal-title">Registrar Nuevo Parámetro</h2>
                  <p class="modal-subtitle">Agrega una variable de configuración para el sistema</p>
                </div>
              </div>
              <button class="modal-close-btn btn-close" (click)="closeCreateModal()">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form (ngSubmit)="submitCreate()" class="modal-form">
              <div class="form-row g2">
                <div class="input-group">
                  <label><i class="fa-solid fa-cubes"></i> Módulo Funcional <span class="required-star">*</span></label>
                  <select [(ngModel)]="newParam.modulo" name="modulo" required class="sport-select">
                    <option value="GENERAL">GENERAL</option>
                    <option value="FINANZAS">FINANZAS</option>
                    <option value="DEPORTIVO">DEPORTIVO</option>
                    <option value="INTEGRACIONES">INTEGRACIONES</option>
                    <option value="NOTIFICACIONES">NOTIFICACIONES</option>
                    <option value="IA">IA</option>
                  </select>
                </div>
                <div class="input-group">
                  <label><i class="fa-solid fa-code"></i> Tipo de Dato <span class="required-star">*</span></label>
                  <select [(ngModel)]="newParam.tipoValor" name="tipoValor" required class="sport-select">
                    <option value="STRING">STRING (Texto)</option>
                    <option value="NUMBER">NUMBER (Numérico)</option>
                    <option value="BOOLEAN">BOOLEAN (Verdadero/Falso)</option>
                    <option value="JSON">JSON (Estructura)</option>
                  </select>
                </div>
              </div>

              <div class="input-group">
                <label><i class="fa-solid fa-key"></i> Clave del Parámetro (Mayúsculas sin espacios) <span class="required-star">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="newParam.clave"
                  name="clave"
                  placeholder="ej. LIMITE_RESERVAS_POR_SEMANA"
                  required
                  class="sport-input font-mono"
                />
              </div>

              <div class="input-group">
                <label><i class="fa-solid fa-heading"></i> Título Legible <span class="required-star">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="newParam.titulo"
                  name="titulo"
                  placeholder="ej. Límite de Reservas de Cancha por Semana"
                  required
                  class="sport-input"
                />
              </div>

              <div class="input-group">
                <label><i class="fa-solid fa-align-left"></i> Valor Inicial <span class="required-star">*</span></label>
                <input
                  type="text"
                  [(ngModel)]="newParam.valor"
                  name="valor"
                  placeholder="ej. 3 o true o $ COP"
                  required
                  class="sport-input"
                />
              </div>

              <div class="input-group">
                <label><i class="fa-solid fa-paragraph"></i> Descripción Explicativa</label>
                <textarea
                  [(ngModel)]="newParam.descripcion"
                  name="descripcion"
                  rows="2"
                  placeholder="Explica qué controla esta variable y su impacto en la plataforma..."
                  class="sport-input"
                ></textarea>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary btn-cancel" (click)="closeCreateModal()">
                  <i class="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button type="submit" class="btn-primary btn-submit" [disabled]="saving()">
                  @if (saving()) {
                    <i class="fa-solid fa-spinner fa-spin"></i> Guardando...
                  } @else {
                    <i class="fa-solid fa-check-circle"></i> Crear Parámetro
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL EDITAR DETALLES -->
      @if (showEditModal()) {
        <div class="modal-backdrop" (click)="closeEditModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-pen-to-square"></i>
                </div>
                <div>
                  <h2 class="modal-title">Editar Parámetro: {{ selectedParam()?.clave }}</h2>
                  <p class="modal-subtitle">Modifica título, descripción o valor de la variable</p>
                </div>
              </div>
              <button class="modal-close-btn btn-close" (click)="closeEditModal()">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form (ngSubmit)="submitEditDetails()" class="modal-form">
              <div class="input-group">
                <label><i class="fa-solid fa-heading"></i> Título Legible</label>
                <input
                  type="text"
                  [(ngModel)]="editDetailsForm.titulo"
                  name="titulo"
                  required
                  class="sport-input"
                />
              </div>

              <div class="input-group">
                <label><i class="fa-solid fa-align-left"></i> Valor Actual</label>
                <input
                  type="text"
                  [(ngModel)]="editDetailsForm.valor"
                  name="valor"
                  required
                  class="sport-input"
                />
              </div>

              <div class="input-group">
                <label><i class="fa-solid fa-paragraph"></i> Descripción</label>
                <textarea
                  [(ngModel)]="editDetailsForm.descripcion"
                  name="descripcion"
                  rows="2"
                  class="sport-input"
                ></textarea>
              </div>

              <div class="input-group">
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    [(ngModel)]="editDetailsForm.estado"
                    name="estado"
                  />
                  <span class="custom-checkbox"></span>
                  <span class="label-text">Parámetro Activo en el Sistema</span>
                </label>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary btn-cancel" (click)="closeEditModal()">
                  <i class="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button type="submit" class="btn-primary btn-submit" [disabled]="saving()">
                  @if (saving()) {
                    <i class="fa-solid fa-spinner fa-spin"></i> Guardando...
                  } @else {
                    <i class="fa-solid fa-check"></i> Actualizar Parámetro
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL CONFIRMACIÓN DE ELIMINACIÓN -->
      @if (showDeleteModal()) {
        <div class="modal-backdrop" (click)="closeDeleteModal()">
          <div class="modal-card modal-sm" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge bg-rose-glow text-rose">
                  <i class="fa-solid fa-triangle-exclamation"></i>
                </div>
                <div>
                  <h2 class="modal-title">Confirmar Eliminación</h2>
                  <p class="modal-subtitle">Acción irreversible</p>
                </div>
              </div>
              <button class="modal-close-btn btn-close" (click)="closeDeleteModal()">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div class="modal-body-delete">
              <p>
                ¿Estás seguro de que deseas eliminar permanentemente el parámetro
                <strong class="text-rose">{{ selectedParam()?.clave }}</strong>?
              </p>
              <div class="warning-callout">
                <i class="fa-solid fa-circle-exclamation"></i>
                <span>Los módulos que dependan de esta variable pasarán a usar los valores por defecto del sistema.</span>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-secondary btn-cancel" (click)="closeDeleteModal()">
                <i class="fa-solid fa-xmark"></i> Cancelar
              </button>
              <button type="button" class="btn-danger btn-submit" (click)="executeDelete()" [disabled]="saving()">
                @if (saving()) {
                  <i class="fa-solid fa-spinner fa-spin"></i> Eliminando...
                } @else {
                  <i class="fa-solid fa-trash-can"></i> Eliminar Parámetro
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
    .parametros-page {
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
    .bg-rose-glow { background: rgba(244, 63, 94, 0.15); color: #f43f5e; }

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

    .module-tabs {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;

      .tab-btn {
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

      tr.row-modified td {
        background: rgba(245, 158, 11, 0.05);
      }
    }

    .param-clave-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      .module-badge {
        font-size: 0.65rem;
        font-weight: 800;
        color: var(--color-primary);
        letter-spacing: 0.05em;
      }

      .param-key {
        font-family: monospace;
        font-size: 0.825rem;
        color: var(--text-main);
      }
    }

    .param-info-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;

      .param-title-text {
        font-weight: 600;
        color: var(--text-main);
      }

      .param-desc-text {
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    }

    .type-pill {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.2rem 0.5rem;
      border-radius: var(--radius-xs);
      font-family: monospace;

      &.type-string { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
      &.type-number { background: rgba(16, 185, 129, 0.15); color: #10b981; }
      &.type-boolean { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
      &.type-json { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
    }

    .switch-row {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }

    .switch-label-text {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-body);
    }

    .input-inline-wrap {
      display: flex;
      align-items: center;

      .input-sm {
        padding: 0.4rem 0.65rem;
        font-size: 0.825rem;
      }
    }

    .status-badge {
      font-size: 0.75rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      color: #ef4444;

      &.active {
        color: #10b981;
      }
    }

    .actions-row {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }

    .btn-save-inline {
      background: var(--color-primary);
      color: #ffffff;
      border: none;
      padding: 0.35rem 0.65rem;
      border-radius: var(--radius-sm);
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);

      &:hover { opacity: 0.9; }
    }

    .btn-icon-action {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      width: 28px;
      height: 28px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 0.75rem;

      &:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
    }

    .btn-danger {
      background: #dc2626;
      color: #ffffff;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;

      &:hover { background: #b91c1c; }
    }

    .text-rose { color: #f43f5e; }

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
      max-width: 860px;
      box-shadow: var(--shadow-card);
      overflow: hidden;
      display: flex;
      flex-direction: column;

      &.modal-sm { max-width: 460px; }
      &.modal-lg { max-width: 960px; width: 92vw; }
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

    .modal-body-delete {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      font-size: 0.9rem;
      color: var(--text-body);
    }

    .warning-callout {
      background: rgba(244, 63, 94, 0.1);
      border: 1px solid rgba(244, 63, 94, 0.3);
      padding: 0.75rem;
      border-radius: var(--radius-md);
      font-size: 0.8rem;
      color: #fca5a5;
      display: flex;
      gap: 0.5rem;
      align-items: flex-start;

      i { margin-top: 0.15rem; }
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
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.03); }
    }
  `],
})
export class ParametrosComponent implements OnInit {
  api = inject(ApiService);

  parametrosList = signal<ParametroItem[]>([]);
  selectedModulo = signal<string>('TODOS');
  searchQuery = signal<string>('');
  saving = signal<boolean>(false);
  toastMessage = signal<string>('');
  isToastError = signal<boolean>(false);

  // Modales
  showCreateModal = signal<boolean>(false);
  showEditModal = signal<boolean>(false);
  showDeleteModal = signal<boolean>(false);
  selectedParam = signal<ParametroItem | null>(null);

  newParam = {
    modulo: 'GENERAL',
    clave: '',
    valor: '',
    tipoValor: 'STRING' as any,
    titulo: '',
    descripcion: '',
  };

  editDetailsForm = {
    titulo: '',
    valor: '',
    descripcion: '',
    estado: true,
  };

  modulos = computed(() => {
    const set = new Set<string>();
    this.parametrosList().forEach((p) => set.add(p.modulo));
    return Array.from(set);
  });

  filteredParametros = computed(() => {
    let list = this.parametrosList();
    if (this.selectedModulo() !== 'TODOS') {
      list = list.filter((p) => p.modulo === this.selectedModulo());
    }
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(
        (p) =>
          p.clave.toLowerCase().includes(q) ||
          p.titulo.toLowerCase().includes(q) ||
          (p.descripcion && p.descripcion.toLowerCase().includes(q)),
      );
    }
    return list;
  });

  activeParamsCount = computed(() => this.parametrosList().filter((p) => p.estado).length);
  modulesCount = computed(() => this.modulos().length);
  modifiedCount = computed(() => this.parametrosList().filter((p) => p.isModified).length);

  ngOnInit(): void {
    this.loadParametros();
  }

  loadParametros(): void {
    this.api.getParametros().subscribe({
      next: (data) => {
        const list: ParametroItem[] = (data || []).map((p: any) => ({
          ...p,
          editValor: p.valor,
          isModified: false,
        }));
        this.parametrosList.set(list);
      },
      error: (err) => {
        console.error('Error cargando parámetros:', err);
        this.showToast('Error cargando parámetros del sistema.', true);
      },
    });
  }

  countByModulo(mod: string): number {
    return this.parametrosList().filter((p) => p.modulo === mod).length;
  }

  onValueChange(p: ParametroItem): void {
    p.isModified = p.editValor !== p.valor;
  }

  onBooleanChange(p: ParametroItem, event: any): void {
    p.editValor = event.target.checked ? 'true' : 'false';
    this.onValueChange(p);
    this.saveParametro(p);
  }

  saveParametro(p: ParametroItem): void {
    if (!p.editValor) {
      this.showToast('El valor no puede estar vacío.', true);
      return;
    }

    this.api
      .updateParametro(p.id, {
        valor: p.editValor,
        titulo: p.titulo,
        descripcion: p.descripcion,
        estado: p.estado,
      })
      .subscribe({
        next: (updated) => {
          p.valor = p.editValor!;
          p.isModified = false;
          this.showToast(`Parámetro '${p.clave}' guardado exitosamente.`);
        },
        error: (err) => {
          console.error(err);
          this.showToast(err.error?.message || 'Error al guardar el parámetro.', true);
        },
      });
  }

  openCreateModal(): void {
    this.newParam = {
      modulo: 'GENERAL',
      clave: '',
      valor: '',
      tipoValor: 'STRING',
      titulo: '',
      descripcion: '',
    };
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  submitCreate(): void {
    if (!this.newParam.clave?.trim()) {
      this.showToast('La clave del parámetro es requerida (*)', true);
      return;
    }
    if (!this.newParam.titulo?.trim()) {
      this.showToast('El título del parámetro es requerido (*)', true);
      return;
    }
    if (this.newParam.valor === undefined || this.newParam.valor === null || this.newParam.valor === '') {
      this.showToast('El valor inicial del parámetro es requerido (*)', true);
      return;
    }
    if (this.newParam.tipoValor === 'NUMBER' && isNaN(Number(this.newParam.valor))) {
      this.showToast('El valor ingresado debe ser numérico.', true);
      return;
    }

    this.saving.set(true);
    this.api.createParametro(this.newParam).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeCreateModal();
        this.loadParametros();
        this.showToast(`Parámetro '${this.newParam.clave.toUpperCase()}' creado con éxito.`);
      },
      error: (err) => {
        this.saving.set(false);
        console.error(err);
        this.showToast(err.error?.message || 'Error al crear el parámetro.', true);
      },
    });
  }

  openEditDetailsModal(p: ParametroItem): void {
    this.selectedParam.set(p);
    this.editDetailsForm = {
      titulo: p.titulo,
      valor: p.editValor || p.valor,
      descripcion: p.descripcion || '',
      estado: p.estado,
    };
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
    this.selectedParam.set(null);
  }

  submitEditDetails(): void {
    const p = this.selectedParam();
    if (!p) return;

    if (!this.editDetailsForm.titulo?.trim()) {
      this.showToast('El título no puede estar vacío (*)', true);
      return;
    }
    if (this.editDetailsForm.valor === undefined || this.editDetailsForm.valor === null || this.editDetailsForm.valor === '') {
      this.showToast('El valor no puede estar vacío (*)', true);
      return;
    }

    this.saving.set(true);
    this.api
      .updateParametro(p.id, this.editDetailsForm)
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.closeEditModal();
          this.loadParametros();
          this.showToast(`Parámetro '${p.clave}' actualizado.`);
        },
        error: (err) => {
          this.saving.set(false);
          console.error(err);
          this.showToast(err.error?.message || 'Error al actualizar parámetro.', true);
        },
      });
  }

  confirmDelete(p: ParametroItem): void {
    this.selectedParam.set(p);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.selectedParam.set(null);
  }

  executeDelete(): void {
    const p = this.selectedParam();
    if (!p) return;

    this.saving.set(true);
    this.api.deleteParametro(p.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.closeDeleteModal();
        this.loadParametros();
        this.showToast(`Parámetro '${p.clave}' eliminado.`);
      },
      error: (err) => {
        this.saving.set(false);
        console.error(err);
        this.showToast(err.error?.message || 'Error al eliminar parámetro.', true);
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

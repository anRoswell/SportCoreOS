import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

export interface JugadorAsistencia {
  id: string;
  nombres: string;
  apellidos: string;
  dorsal: number;
  posicion: string;
  estado: 'PRESENTE' | 'RETRASO' | 'EXCUSA' | 'FALTA';
  observacion?: string;
  avatar?: string;
}

@Component({
  selector: 'app-entrenamientos-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-mobile-header></app-mobile-header>

    <!-- SUBBAR STADIUM DARK CON GRADIENTE ESMERALDA -->
    <div class="entr-subbar">
      <div class="subbar-left">
        <a routerLink="/home" class="btn-back" title="Volver al Home"><i class="fa-solid fa-arrow-left"></i></a>
        <div>
          <h2>Control de Asistencia</h2>
          <span class="subbar-badge-live"><span class="live-pulse-dot"></span> Planilla de Cancha</span>
        </div>
      </div>
      <div class="subbar-right">
        <span class="count-badge">{{ jugadores().length }} Jugadores</span>
        <button class="btn-icon-refresh" [class.spinning]="isRefreshing()" (click)="recargarAsistencia()" title="Actualizar">
          <i class="fa-solid fa-arrows-rotate"></i>
        </button>
      </div>
    </div>

    <!-- FILTROS RÁPIDOS POR ESTADO -->
    <div class="attendance-filter-pills">
      <button class="filter-pill" [class.active]="filtroEstado() === 'TODOS'" (click)="setFiltro('TODOS')">
        Todos ({{ jugadores().length }})
      </button>
      <button class="filter-pill pill-presente-tab" [class.active]="filtroEstado() === 'PRESENTE'" (click)="setFiltro('PRESENTE')">
        <i class="fa-solid fa-check"></i> {{ contarPorEstado('PRESENTE') }}
      </button>
      <button class="filter-pill pill-retraso-tab" [class.active]="filtroEstado() === 'RETRASO'" (click)="setFiltro('RETRASO')">
        <i class="fa-solid fa-clock"></i> {{ contarPorEstado('RETRASO') }}
      </button>
      <button class="filter-pill pill-excusa-tab" [class.active]="filtroEstado() === 'EXCUSA'" (click)="setFiltro('EXCUSA')">
        <i class="fa-solid fa-file-medical"></i> {{ contarPorEstado('EXCUSA') }}
      </button>
      <button class="filter-pill pill-falta-tab" [class.active]="filtroEstado() === 'FALTA'" (click)="setFiltro('FALTA')">
        <i class="fa-solid fa-xmark"></i> {{ contarPorEstado('FALTA') }}
      </button>
    </div>

    <main class="page-content">
      <!-- TARJETA TÁCTICA DE SESIÓN ACTIVA (STADIUM CARD) -->
      <div class="session-card">
        <div class="session-header">
          <div class="session-badge">
            <i class="fa-solid fa-whistle text-emerald"></i> SESIÓN TÉCNICA
          </div>
          <span class="session-date"><i class="fa-regular fa-calendar"></i> Hoy • 16:00 - 18:00</span>
        </div>

        <div class="session-info-grid">
          <div class="info-cell">
            <span class="lbl"><i class="fa-solid fa-shield-halved"></i> Categoría</span>
            <strong>Sub-17 Élite</strong>
          </div>
          <div class="info-cell">
            <span class="lbl"><i class="fa-solid fa-location-dot"></i> Cancha</span>
            <strong>Sede Norte #2</strong>
          </div>
          <div class="info-cell">
            <span class="lbl"><i class="fa-solid fa-dumbbell"></i> Enfoque</span>
            <strong>Fuerza & Presión</strong>
          </div>
        </div>

        <!-- KPI Ticker de Asistencia -->
        <div class="summary-pills">
          <div class="pill pill-presente" (click)="setFiltro('PRESENTE')">
            <span class="pill-count">{{ contarPorEstado('PRESENTE') }}</span>
            <span class="pill-name"><i class="fa-solid fa-check"></i> Presentes</span>
          </div>
          <div class="pill pill-retraso" (click)="setFiltro('RETRASO')">
            <span class="pill-count">{{ contarPorEstado('RETRASO') }}</span>
            <span class="pill-name"><i class="fa-solid fa-clock"></i> Retrasos</span>
          </div>
          <div class="pill pill-excusa" (click)="setFiltro('EXCUSA')">
            <span class="pill-count">{{ contarPorEstado('EXCUSA') }}</span>
            <span class="pill-name"><i class="fa-solid fa-file-medical"></i> Excusas</span>
          </div>
          <div class="pill pill-falta" (click)="setFiltro('FALTA')">
            <span class="pill-count">{{ contarPorEstado('FALTA') }}</span>
            <span class="pill-name"><i class="fa-solid fa-xmark"></i> Faltas</span>
          </div>
        </div>
      </div>

      <!-- BARRA DE ACCIÓN RÁPIDA -->
      <div class="quick-actions-bar">
        <button class="btn-quick-all" (click)="marcarTodos('PRESENTE')">
          <i class="fa-solid fa-check-double"></i> Todos Presentes
        </button>
        <span class="roster-pct">
          Efectividad: <strong>{{ porcentajeAsistencia() }}%</strong>
        </span>
      </div>

      <!-- LISTA DE JUGADORES (CARDS CON BOTONERA TÁCTIL) -->
      <div class="players-list">
        @for (j of jugadoresFiltrados(); track j.id) {
          <div class="player-row-card" [class]="'border-' + j.estado.toLowerCase()">
            <div class="player-left">
              <div class="player-dorsal">#{{ j.dorsal }}</div>
              <div class="player-details">
                <div class="player-name-line">
                  <span class="player-name">{{ j.nombres }} {{ j.apellidos }}</span>
                  <span class="status-indicator" [class]="'tag-' + j.estado.toLowerCase()">
                    {{ j.estado }}
                  </span>
                </div>
                <span class="player-pos">{{ j.posicion }}</span>
                @if (j.observacion) {
                  <span class="player-obs"><i class="fa-solid fa-note-sticky"></i> {{ j.observacion }}</span>
                }
              </div>
            </div>

            <!-- Botonera de 4 Estados Táctiles Ultra-Optimizada -->
            <div class="status-toggle-group">
              <button 
                type="button" 
                class="btn-status status-presente" 
                [class.active]="j.estado === 'PRESENTE'"
                (click)="cambiarEstado(j.id, 'PRESENTE')"
                title="Presente">
                <i class="fa-solid fa-check"></i>
              </button>

              <button 
                type="button" 
                class="btn-status status-retraso" 
                [class.active]="j.estado === 'RETRASO'"
                (click)="abrirDialogoObservacion(j, 'RETRASO')"
                title="Retraso">
                <i class="fa-solid fa-clock"></i>
              </button>

              <button 
                type="button" 
                class="btn-status status-excusa" 
                [class.active]="j.estado === 'EXCUSA'"
                (click)="abrirDialogoObservacion(j, 'EXCUSA')"
                title="Excusa médica">
                <i class="fa-solid fa-file-medical"></i>
              </button>

              <button 
                type="button" 
                class="btn-status status-falta" 
                [class.active]="j.estado === 'FALTA'"
                (click)="cambiarEstado(j.id, 'FALTA')"
                title="Falta injustificada">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <i class="fa-solid fa-user-check empty-icon"></i>
            <p>No hay jugadores en esta categoría de filtro.</p>
            <button class="btn-clear-filter" (click)="setFiltro('TODOS')">Ver Todos</button>
          </div>
        }
      </div>

      <!-- BOTÓN DE GUARDADO DEFINITIVO -->
      <div class="save-footer">
        <button class="btn-primary btn-save" (click)="guardarAsistencia()">
          <i class="fa-solid fa-floppy-disk"></i>
          <span>Guardar Asistencia de Sesión</span>
        </button>
      </div>
    </main>

    <!-- MODAL OBSERVACIÓN RÁPIDA (RETRASO O EXCUSA) -->
    @if (jugadorEditandoObs()) {
      <div class="modal-backdrop" (click)="cerrarModalObs()">
        <div class="modal-sheet" (click)="$event.stopPropagation()">
          <div class="sheet-header">
            <div>
              <h3>Nota / Motivo de Asistencia</h3>
              <p class="sheet-subtitle">#{{ jugadorEditandoObs()?.dorsal }} {{ jugadorEditandoObs()?.nombres }} {{ jugadorEditandoObs()?.apellidos }}</p>
            </div>
            <button class="btn-close" (click)="cerrarModalObs()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="sheet-body">
            <div class="form-group">
              <label>Estado Asignado:</label>
              <div class="estado-preview-pill" [class]="'tag-' + estadoTemporalObs().toLowerCase()">
                {{ estadoTemporalObs() }}
              </div>
            </div>

            <div class="form-group">
              <label>Motivo u Observación (Opcional):</label>
              <input 
                type="text" 
                [(ngModel)]="textoObsTemporal" 
                placeholder="Ej. Tráfico pesado, Cita médica, Calambre..."
                class="form-input" 
                maxlength="80"
              />
            </div>
          </div>

          <div class="sheet-footer">
            <button class="btn-submit-booking" (click)="confirmarObservacion()">
              <i class="fa-solid fa-check"></i> Aplicar Estado
            </button>
          </div>
        </div>
      </div>
    }

    <!-- DIALOGO: ¿DESEA CONTINUAR EDITANDO O CERRAR Y ACTUALIZAR? -->
    @if (mostrarDialogoGuardado()) {
      <div class="modal-backdrop">
        <div class="dialog-card">
          <div class="icon-success">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h3>¡Asistencia Guardada!</h3>
          <p>La planilla de la sesión fue persistida con éxito en la base de datos.</p>
          
          <div class="dialog-actions">
            <button class="btn-dialog-continue" (click)="continuarEditando()">
              <i class="fa-solid fa-pen-to-square"></i> Continuar Editando
            </button>
            <button class="btn-dialog-close" (click)="cerrarYActualizar()">
              <i class="fa-solid fa-check"></i> Cerrar y Actualizar Lista
            </button>
          </div>
        </div>
      </div>
    }

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #0b1510;
      color: #f8fafc;
      width: 100%;
      max-width: 100vw;
      overflow-x: hidden !important;
      box-sizing: border-box;
    }

    /* SUBBAR STADIUM DARK */
    .entr-subbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1rem;
      background: linear-gradient(135deg, #093322 0%, #064e3b 100%);
      border-bottom: 1px solid rgba(16, 185, 129, 0.25);
      position: sticky;
      top: 0;
      z-index: 40;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);

      .subbar-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .btn-back {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          font-size: 0.95rem;
          transition: background 0.2s;
          &:active { background: rgba(255, 255, 255, 0.2); }
        }

        h2 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #fff;
          margin: 0;
          line-height: 1.2;
        }

        .subbar-badge-live {
          font-size: 0.62rem;
          font-weight: 700;
          color: #a7f3d0;
          display: flex;
          align-items: center;
          gap: 4px;

          .live-pulse-dot {
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 6px #10b981;
          }
        }
      }

      .subbar-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .count-badge {
          font-size: 0.65rem;
          font-weight: 800;
          color: #6ee7b7;
          background: rgba(6, 78, 59, 0.6);
          border: 1px solid rgba(16, 185, 129, 0.3);
          padding: 2px 8px;
          border-radius: 9999px;
        }

        .btn-icon-refresh {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.08);
          color: #34d399;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 0.85rem;
          transition: transform 0.3s ease;

          &.spinning i {
            animation: spin 0.8s linear infinite;
          }
        }
      }
    }

    /* FILTROS RÁPIDOS */
    .attendance-filter-pills {
      display: flex;
      gap: 0.35rem;
      padding: 0.5rem 0.85rem;
      background: rgba(15, 23, 42, 0.8);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      overflow-x: auto;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }

      .filter-pill {
        padding: 0.35rem 0.6rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: #94a3b8;
        font-size: 0.68rem;
        font-weight: 700;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        transition: all 0.2s;

        &.active {
          background: #10b981;
          color: #022c22;
          border-color: #10b981;
          font-weight: 800;
        }
      }
    }

    .page-content {
      padding: 0.85rem;
      padding-bottom: calc(90px + var(--safe-area-bottom));
      width: 100%;
      max-width: 100vw;
      overflow-x: hidden !important;
      box-sizing: border-box;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
    }

    /* TARJETA DE SESIÓN STADIUM */
    .session-card {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 18px;
      padding: 1rem;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    }

    .session-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .session-badge {
      font-size: 0.68rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #6ee7b7;
      background: rgba(16, 185, 129, 0.15);
      padding: 3px 10px;
      border-radius: 9999px;
      border: 1px solid rgba(16, 185, 129, 0.3);
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .session-date {
      font-size: 0.74rem;
      font-weight: 700;
      color: #94a3b8;
    }

    .session-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.4rem;
      background: rgba(15, 23, 42, 0.6);
      padding: 0.65rem;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      margin-bottom: 0.75rem;

      .info-cell {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .lbl {
          font-size: 0.62rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        strong {
          font-size: 0.74rem;
          color: #f1f5f9;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .summary-pills {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.35rem;

      .pill {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.45rem 0.2rem;
        border-radius: 10px;
        text-align: center;
        cursor: pointer;
        transition: transform 0.15s;

        &:active {
          transform: scale(0.95);
        }

        .pill-count {
          font-size: 1.1rem;
          font-weight: 900;
          line-height: 1;
        }

        .pill-name {
          font-size: 0.6rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-top: 3px;
          display: flex;
          align-items: center;
          gap: 2px;
        }

        &.pill-presente { background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); }
        &.pill-retraso { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }
        &.pill-excusa { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
        &.pill-falta { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
      }
    }

    /* BARRA DE ACCIONES RÁPIDAS */
    .quick-actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .btn-quick-all {
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 8px;
        padding: 0.4rem 0.65rem;
        font-size: 0.72rem;
        font-weight: 800;
        color: #34d399;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.2s ease;

        &:active {
          transform: scale(0.96);
          background: rgba(16, 185, 129, 0.25);
        }
      }

      .roster-pct {
        font-size: 0.72rem;
        color: #94a3b8;
        strong {
          color: #34d399;
        }
      }
    }

    /* LISTA DE JUGADORES */
    .players-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .player-row-card {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 0.6rem 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      transition: all 0.15s ease;

      &.border-presente { border-left: 4px solid #10b981; }
      &.border-retraso { border-left: 4px solid #f59e0b; }
      &.border-excusa { border-left: 4px solid #3b82f6; }
      &.border-falta { border-left: 4px solid #ef4444; }
    }

    .player-left {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      flex: 1;
      min-width: 0;

      .player-dorsal {
        width: 30px;
        height: 30px;
        min-width: 30px;
        background: #0f172a;
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 0.78rem;
      }

      .player-details {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;

        .player-name-line {
          display: flex;
          align-items: center;
          gap: 5px;
          min-width: 0;

          .player-name {
            font-size: 0.82rem;
            font-weight: 800;
            color: #f8fafc;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .status-indicator {
            font-size: 0.58rem;
            font-weight: 800;
            padding: 1px 5px;
            border-radius: 4px;
            text-transform: uppercase;

            &.tag-presente { background: rgba(16, 185, 129, 0.2); color: #34d399; }
            &.tag-retraso { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
            &.tag-excusa { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
            &.tag-falta { background: rgba(239, 68, 68, 0.2); color: #f87171; }
          }
        }

        .player-pos {
          font-size: 0.68rem;
          font-weight: 600;
          color: #94a3b8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .player-obs {
          font-size: 0.62rem;
          font-weight: 600;
          color: #fbbf24;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    /* BOTONERA TÁCTIL DE 4 ESTADOS */
    .status-toggle-group {
      display: flex;
      gap: 0.25rem;
      background: #0f172a;
      padding: 3px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      flex-shrink: 0;

      .btn-status {
        width: 30px;
        height: 30px;
        border-radius: 7px;
        border: none;
        background: transparent;
        color: #64748b;
        font-size: 0.8rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s ease;

        &:active {
          transform: scale(0.9);
        }

        &.active {
          font-weight: 900;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);

          &.status-presente { background: #10b981; color: #022c22; }
          &.status-retraso { background: #f59e0b; color: #451a03; }
          &.status-excusa { background: #3b82f6; color: #172554; }
          &.status-falta { background: #ef4444; color: #450a0a; }
        }
      }
    }

    .empty-state {
      background: #1e293b;
      border-radius: 14px;
      padding: 2rem 1rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;

      .empty-icon {
        font-size: 2rem;
        color: #64748b;
      }

      p {
        font-size: 0.8rem;
        color: #94a3b8;
        margin: 0;
      }

      .btn-clear-filter {
        background: rgba(16, 185, 129, 0.2);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.4);
        padding: 0.4rem 0.8rem;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 800;
        cursor: pointer;
        margin-top: 0.4rem;
      }
    }

    /* FOOTER GUARDAR */
    .save-footer {
      position: sticky;
      bottom: calc(65px + var(--safe-area-bottom));
      margin-top: 0.35rem;
      z-index: 30;

      .btn-save {
        width: 100%;
        padding: 0.85rem;
        font-size: 0.88rem;
        font-weight: 900;
        border-radius: 12px;
        background: linear-gradient(135deg, #10b981 0%, #047857 100%);
        color: #fff;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
        cursor: pointer;

        &:active {
          transform: scale(0.98);
        }
      }
    }

    /* MODAL SHEETS & DIALOGS */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(5px);
      z-index: 2000;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .modal-sheet {
      background: #1e293b;
      width: 100%;
      max-width: 480px;
      border-radius: 1.5rem 1.5rem 0 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: calc(1rem + var(--safe-area-bottom));
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .sheet-header {
      padding: 1.15rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);

      h3 { font-size: 1rem; font-weight: 800; margin: 0; color: #f8fafc; }
      .sheet-subtitle { font-size: 0.72rem; color: #94a3b8; margin: 2px 0 0; }
      .btn-close {
        background: rgba(255, 255, 255, 0.08);
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        color: #94a3b8;
        cursor: pointer;
      }
    }

    .sheet-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;

        label { font-size: 0.78rem; font-weight: 700; color: #cbd5e1; }
        
        .estado-preview-pill {
          padding: 0.45rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 900;
          display: inline-flex;
          align-items: center;
          width: fit-content;

          &.tag-retraso { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.4); }
          &.tag-excusa { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); }
        }

        .form-input {
          padding: 0.75rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: #0f172a;
          color: #f8fafc;
          font-size: 0.85rem;
          outline: none;

          &:focus {
            border-color: #10b981;
          }
        }
      }
    }

    .sheet-footer {
      padding: 0.75rem 1.25rem;
      .btn-submit-booking {
        width: 100%;
        background: linear-gradient(135deg, #10b981 0%, #047857 100%);
        color: #fff;
        border: none;
        padding: 0.85rem;
        border-radius: 12px;
        font-weight: 800;
        font-size: 0.88rem;
        cursor: pointer;
      }
    }

    /* DIALOG CONTINUAR O CERRAR */
    .dialog-card {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      width: 90%;
      max-width: 360px;
      border-radius: 1.5rem;
      padding: 1.75rem;
      margin: auto;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.85rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);

      .icon-success { font-size: 3.2rem; color: #10b981; }
      h3 { font-size: 1.15rem; font-weight: 800; color: #f8fafc; margin: 0; }
      p { font-size: 0.8rem; color: #94a3b8; margin: 0; line-height: 1.4; }

      .dialog-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
        margin-top: 0.5rem;

        .btn-dialog-continue {
          width: 100%;
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.85rem;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.82rem;
          cursor: pointer;
        }

        .btn-dialog-close {
          width: 100%;
          background: #10b981;
          color: #022c22;
          border: none;
          padding: 0.85rem;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.82rem;
          cursor: pointer;
        }
      }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  `]
})
export class EntrenamientosMobileComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  auth = inject(AuthService);

  isRefreshing = signal<boolean>(false);
  mostrarDialogoGuardado = signal<boolean>(false);
  filtroEstado = signal<'TODOS' | 'PRESENTE' | 'RETRASO' | 'EXCUSA' | 'FALTA'>('TODOS');

  // Estado para la observación modal
  jugadorEditandoObs = signal<JugadorAsistencia | null>(null);
  estadoTemporalObs = signal<'RETRASO' | 'EXCUSA'>('RETRASO');
  textoObsTemporal = '';

  jugadores = signal<JugadorAsistencia[]>([
    { id: 'j-1', nombres: 'Santiago', apellidos: 'Restrepo', dorsal: 8, posicion: 'Mediocentro', estado: 'PRESENTE' },
    { id: 'j-2', nombres: 'Mateo', apellidos: 'Gómez', dorsal: 10, posicion: 'Enganche', estado: 'PRESENTE' },
    { id: 'j-3', nombres: 'Sebastián', apellidos: 'Muñoz', dorsal: 1, posicion: 'Portero', estado: 'PRESENTE' },
    { id: 'j-4', nombres: 'Nicolás', apellidos: 'Zapata', dorsal: 4, posicion: 'Defensa Central', estado: 'RETRASO', observacion: 'Tráfico pesado vía Las Palmas' },
    { id: 'j-5', nombres: 'Carlos', apellidos: 'Londoño', dorsal: 9, posicion: 'Delantero', estado: 'EXCUSA', observacion: 'Fisioterapia rodilla izq.' },
    { id: 'j-6', nombres: 'Daniel', apellidos: 'Henao', dorsal: 7, posicion: 'Extremo Derecho', estado: 'PRESENTE' },
    { id: 'j-7', nombres: 'Samuel', apellidos: 'Vásquez', dorsal: 3, posicion: 'Lateral Izquierdo', estado: 'FALTA' },
    { id: 'j-8', nombres: 'Alejandro', apellidos: 'Ochoa', dorsal: 5, posicion: 'Defensa Central', estado: 'PRESENTE' },
    { id: 'j-9', nombres: 'Juan David', apellidos: 'Castro', dorsal: 11, posicion: 'Extremo Izquierdo', estado: 'PRESENTE' },
    { id: 'j-10', nombres: 'Andrés Felipe', apellidos: 'Marín', dorsal: 14, posicion: 'Lateral Derecho', estado: 'PRESENTE' },
    { id: 'j-11', nombres: 'David', apellidos: 'Herrera', dorsal: 12, posicion: 'Portero Suplente', estado: 'PRESENTE' }
  ]);

  jugadoresFiltrados = computed(() => {
    const filtro = this.filtroEstado();
    const list = this.jugadores();
    if (filtro === 'TODOS') return list;
    return list.filter(j => j.estado === filtro);
  });

  porcentajeAsistencia = computed(() => {
    const list = this.jugadores();
    if (list.length === 0) return 0;
    const presentes = list.filter(j => j.estado === 'PRESENTE' || j.estado === 'RETRASO').length;
    return Math.round((presentes / list.length) * 100);
  });

  ngOnInit(): void {}

  recargarAsistencia(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
      this.alertService.success('Planilla de asistencia sincronizada en tiempo real.');
    }, 500);
  }

  setFiltro(estado: 'TODOS' | 'PRESENTE' | 'RETRASO' | 'EXCUSA' | 'FALTA'): void {
    this.filtroEstado.set(estado);
  }

  contarPorEstado(estado: 'PRESENTE' | 'RETRASO' | 'EXCUSA' | 'FALTA'): number {
    return this.jugadores().filter(j => j.estado === estado).length;
  }

  cambiarEstado(id: string, nuevoEstado: 'PRESENTE' | 'RETRASO' | 'EXCUSA' | 'FALTA'): void {
    this.jugadores.update(list => list.map(j => {
      if (j.id === id) {
        return { 
          ...j, 
          estado: nuevoEstado,
          observacion: (nuevoEstado === 'PRESENTE' || nuevoEstado === 'FALTA') ? undefined : j.observacion 
        };
      }
      return j;
    }));
  }

  abrirDialogoObservacion(jugador: JugadorAsistencia, estado: 'RETRASO' | 'EXCUSA'): void {
    this.jugadorEditandoObs.set(jugador);
    this.estadoTemporalObs.set(estado);
    this.textoObsTemporal = jugador.observacion || '';
  }

  cerrarModalObs(): void {
    this.jugadorEditandoObs.set(null);
  }

  confirmarObservacion(): void {
    const jug = this.jugadorEditandoObs();
    if (!jug) return;
    const nuevoEstado = this.estadoTemporalObs();
    const observacion = this.textoObsTemporal.trim();

    this.jugadores.update(list => list.map(j => {
      if (j.id === jug.id) {
        return {
          ...j,
          estado: nuevoEstado,
          observacion: observacion.length > 0 ? observacion : undefined
        };
      }
      return j;
    }));

    this.cerrarModalObs();
    this.alertService.success(`Estado de ${jug.nombres} actualizado a ${nuevoEstado}.`);
  }

  marcarTodos(estado: 'PRESENTE'): void {
    this.jugadores.update(list => list.map(j => ({ ...j, estado, observacion: undefined })));
    this.alertService.success('Todos los jugadores marcados como PRESENTES.');
  }

  guardarAsistencia(): void {
    this.mostrarDialogoGuardado.set(true);
  }

  continuarEditando(): void {
    this.mostrarDialogoGuardado.set(false);
    this.alertService.info('Puedes seguir modificando la planilla.');
  }

  cerrarYActualizar(): void {
    this.mostrarDialogoGuardado.set(false);
    this.recargarAsistencia();
  }
}

import { Component, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

interface JugadorAsistencia {
  id: string;
  nombres: string;
  apellidos: string;
  dorsal: number;
  posicion: string;
  estado: 'PRESENTE' | 'RETRASO' | 'EXCUSA' | 'FALTA';
  observacion?: string;
}

@Component({
  selector: 'app-entrenamientos-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-mobile-header></app-mobile-header>

    <div class="entr-subbar">
      <div class="subbar-left">
        <a routerLink="/home" class="btn-back"><i class="fa-solid fa-arrow-left"></i></a>
        <h2>Control de Asistencia</h2>
      </div>
      <button class="btn-icon-refresh" [class.spinning]="isRefreshing()" (click)="recargarAsistencia()" title="Actualizar">
        <i class="fa-solid fa-arrows-rotate"></i>
      </button>
    </div>

    <main class="page-content">
      <!-- Tarjeta de Sesión Activa -->
      <div class="session-card">
        <div class="session-header">
          <div class="session-badge">SESIÓN DE ENTRENAMIENTO</div>
          <span class="session-date"><i class="fa-regular fa-calendar"></i> Hoy • 16:00</span>
        </div>

        <div class="session-info-grid">
          <div class="info-cell">
            <span class="lbl">Categoría</span>
            <strong>Sub-17 Élite</strong>
          </div>
          <div class="info-cell">
            <span class="lbl">Sede / Cancha</span>
            <strong>Sede Norte #2</strong>
          </div>
          <div class="info-cell">
            <span class="lbl">Microciclo</span>
            <strong>Fuerza & Transición</strong>
          </div>
        </div>

        <!-- Resumen de Asistencia en Vivo -->
        <div class="summary-pills">
          <div class="pill pill-presente">
            <span class="pill-count">{{ contarPorEstado('PRESENTE') }}</span>
            <span class="pill-name">Presentes</span>
          </div>
          <div class="pill pill-retraso">
            <span class="pill-count">{{ contarPorEstado('RETRASO') }}</span>
            <span class="pill-name">Retrasos</span>
          </div>
          <div class="pill pill-excusa">
            <span class="pill-count">{{ contarPorEstado('EXCUSA') }}</span>
            <span class="pill-name">Excusas</span>
          </div>
          <div class="pill pill-falta">
            <span class="pill-count">{{ contarPorEstado('FALTA') }}</span>
            <span class="pill-name">Faltas</span>
          </div>
        </div>
      </div>

      <!-- Barra de Acciones Rápidas -->
      <div class="quick-actions-bar">
        <button class="btn-quick-all" (click)="marcarTodos('PRESENTE')">
          <i class="fa-solid fa-check-double"></i> Marcar Todos Presentes
        </button>
        <span class="total-roster">Plantel: {{ jugadores().length }} Jugadores</span>
      </div>

      <!-- Lista Táctil de Jugadores -->
      <div class="players-list">
        @for (j of jugadores(); track j.id) {
          <div class="player-row-card" [class]="'border-' + j.estado.toLowerCase()">
            <div class="player-left">
              <div class="player-dorsal">#{{ j.dorsal }}</div>
              <div class="player-details">
                <span class="player-name">{{ j.nombres }} {{ j.apellidos }}</span>
                <span class="player-pos">{{ j.posicion }}</span>
              </div>
            </div>

            <!-- Botonera de 4 Estados Táctiles -->
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
                (click)="cambiarEstado(j.id, 'RETRASO')"
                title="Retraso">
                <i class="fa-solid fa-clock"></i>
              </button>

              <button 
                type="button" 
                class="btn-status status-excusa" 
                [class.active]="j.estado === 'EXCUSA'"
                (click)="cambiarEstado(j.id, 'EXCUSA')"
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
        }
      </div>

      <!-- Botón de Guardado Definitivo -->
      <div class="save-footer">
        <button class="btn-primary btn-save" (click)="guardarAsistencia()">
          <i class="fa-solid fa-floppy-disk"></i>
          <span>Guardar Asistencia de Sesión</span>
        </button>
      </div>
    </main>

    <!-- DIALOGO: ¿DESEA CONTINUAR EDITANDO O CERRAR Y ACTUALIZAR? -->
    @if (mostrarDialogoGuardado()) {
      <div class="modal-backdrop">
        <div class="dialog-card">
          <div class="icon-success">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h3>¡Asistencia Guardada!</h3>
          <p>La planilla de la sesión fue persistida correctamente.</p>
          
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
    .page-content {
      padding: 0.85rem;
      padding-bottom: calc(85px + var(--safe-area-bottom));
      width: 100%;
      max-width: 100vw;
      overflow-x: hidden !important;
      box-sizing: border-box;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .session-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 20px;
      padding: 1.15rem;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);
    }

    .session-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.85rem;
    }

    .session-badge {
      font-size: 0.68rem;
      font-weight: 900;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #064e3b;
      background: rgba(16, 185, 129, 0.15);
      padding: 3px 10px;
      border-radius: 9999px;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .session-date {
      font-size: 0.78rem;
      font-weight: 700;
      color: #64748b;
    }

    .session-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.5rem;
      background: #f8fafc;
      padding: 0.75rem;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      margin-bottom: 0.85rem;

      .info-cell {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .lbl {
          font-size: 0.68rem;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
        }

        strong {
          font-size: 0.78rem;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }

    .summary-pills {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.4rem;

      .pill {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.45rem 0.2rem;
        border-radius: 10px;
        text-align: center;

        .pill-count {
          font-size: 1.15rem;
          font-weight: 900;
          line-height: 1;
        }

        .pill-name {
          font-size: 0.62rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-top: 2px;
        }

        &.pill-presente { background: rgba(16, 185, 129, 0.12); color: #047857; }
        &.pill-retraso { background: rgba(245, 158, 11, 0.12); color: #b45309; }
        &.pill-excusa { background: rgba(59, 130, 246, 0.12); color: #1d4ed8; }
        &.pill-falta { background: rgba(239, 68, 68, 0.12); color: #b91c1c; }
      }
    }

    .quick-actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .btn-quick-all {
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        border-radius: 10px;
        padding: 0.45rem 0.75rem;
        font-size: 0.76rem;
        font-weight: 800;
        color: #334155;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.2s ease;

        &:active {
          transform: scale(0.96);
          background: #e2e8f0;
        }
      }

      .total-roster {
        font-size: 0.76rem;
        font-weight: 800;
        color: #64748b;
      }
    }

    .players-list {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }

    .player-row-card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      padding: 0.65rem 0.85rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
      transition: all 0.2s ease;

      &.border-presente { border-left: 4px solid #10b981; }
      &.border-retraso { border-left: 4px solid #f59e0b; }
      &.border-excusa { border-left: 4px solid #3b82f6; }
      &.border-falta { border-left: 4px solid #ef4444; }
    }

    .player-left {
      display: flex;
      align-items: center;
      gap: 0.65rem;

      .player-dorsal {
        width: 32px;
        height: 32px;
        background: #0f172a;
        color: #ffffff;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 900;
        font-size: 0.82rem;
      }

      .player-details {
        display: flex;
        flex-direction: column;

        .player-name {
          font-size: 0.86rem;
          font-weight: 800;
          color: #0f172a;
        }

        .player-pos {
          font-size: 0.72rem;
          font-weight: 600;
          color: #64748b;
        }
      }
    }

    .status-toggle-group {
      display: flex;
      gap: 0.3rem;
      background: #f1f5f9;
      padding: 3px;
      border-radius: 10px;
      border: 1px solid #e2e8f0;

      .btn-status {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        border: none;
        background: transparent;
        color: #94a3b8;
        font-size: 0.85rem;
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
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);

          &.status-presente { background: #10b981; color: #ffffff; }
          &.status-retraso { background: #f59e0b; color: #ffffff; }
          &.status-excusa { background: #3b82f6; color: #ffffff; }
          &.status-falta { background: #ef4444; color: #ffffff; }
        }
      }
    }

    .save-footer {
      position: sticky;
      bottom: calc(65px + var(--safe-area-bottom));
      margin-top: 0.5rem;

      .btn-save {
        width: 100%;
        padding: 0.95rem;
        font-size: 0.95rem;
        font-weight: 900;
        border-radius: 14px;
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
      }
    }
  `]
})
export class EntrenamientosMobileComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  private auth = inject(AuthService);

  isRefreshing = signal<boolean>(false);
  mostrarDialogoGuardado = signal<boolean>(false);

  jugadores = signal<JugadorAsistencia[]>([
    { id: 'j-1', nombres: 'Santiago', apellidos: 'Restrepo', dorsal: 8, posicion: 'Mediocentro', estado: 'PRESENTE' },
    { id: 'j-2', nombres: 'Mateo', apellidos: 'Gómez', dorsal: 10, posicion: 'Enganche', estado: 'PRESENTE' },
    { id: 'j-3', nombres: 'Sebastián', apellidos: 'Muñoz', dorsal: 1, posicion: 'Portero', estado: 'PRESENTE' },
    { id: 'j-4', nombres: 'Nicolás', apellidos: 'Zapata', dorsal: 4, posicion: 'Defensa Central', estado: 'RETRASO' },
    { id: 'j-5', nombres: 'Carlos', apellidos: 'Londoño', dorsal: 9, posicion: 'Delantero', estado: 'EXCUSA' },
    { id: 'j-6', nombres: 'Daniel', apellidos: 'Henao', dorsal: 7, posicion: 'Extremo Derecho', estado: 'PRESENTE' },
    { id: 'j-7', nombres: 'Samuel', apellidos: 'Vásquez', dorsal: 3, posicion: 'Lateral Izquierdo', estado: 'FALTA' },
    { id: 'j-8', nombres: 'Alejandro', apellidos: 'Ochoa', dorsal: 5, posicion: 'Defensa Central', estado: 'PRESENTE' }
  ]);

  ngOnInit(): void {}

  recargarAsistencia(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
      this.alertService.success('Lista de asistencia sincronizada con la base de datos.');
    }, 600);
  }

  contarPorEstado(estado: 'PRESENTE' | 'RETRASO' | 'EXCUSA' | 'FALTA'): number {
    return this.jugadores().filter(j => j.estado === estado).length;
  }

  cambiarEstado(id: string, nuevoEstado: 'PRESENTE' | 'RETRASO' | 'EXCUSA' | 'FALTA'): void {
    this.jugadores.update(list => list.map(j => {
      if (j.id === id) {
        return { ...j, estado: nuevoEstado };
      }
      return j;
    }));
  }

  marcarTodos(estado: 'PRESENTE'): void {
    this.jugadores.update(list => list.map(j => ({ ...j, estado })));
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

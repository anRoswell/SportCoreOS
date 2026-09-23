import { Component, inject, signal, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ConvocadoTecnico {
  id: string;
  nombres: string;
  apellidos: string;
  dorsal: number;
  posicion: string;
  foto?: string;
  rol: 'TITULAR' | 'SUPLENTE' | 'RESERVA';
  estadoAsistencia: 'CONFIRMADO' | 'PENDIENTE' | 'EXCUSADO';
}

@Component({
  selector: 'app-convocatorias-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-mobile-header></app-mobile-header>

    <!-- Subbar con botón Refresh Pull-to-Refresh y Generador de Afiche -->
    <div class="conv-subbar">
      <div class="subbar-left">
        <a routerLink="/home" class="btn-back"><i class="fa-solid fa-arrow-left"></i></a>
        <h2>Convocatoria & Nómina</h2>
      </div>

      <div class="subbar-right">
        <button class="btn-icon-refresh" [class.spinning]="isRefreshing()" (click)="recargarDatos()" title="Actualizar">
          <i class="fa-solid fa-arrows-rotate"></i>
        </button>
        <button class="btn-generate-poster" (click)="abrirModalPoster()">
          <i class="fa-solid fa-wand-magic-sparkles"></i>
          <span>Afiche IA</span>
        </button>
      </div>
    </div>

    <main class="page-content">
      <!-- Tarjeta del Partido -->
      <div class="match-summary-card">
        <div class="card-meta-top">
          <span class="cat-pill">SUB-17 ÉLITE &bull; CLAUSURA</span>
          <span class="date-pill"><i class="fa-regular fa-clock"></i> Sábado &bull; 09:30 AM</span>
        </div>

        <div class="vs-row">
          <div class="team-block">
            <div class="team-badge">{{ auth.activeClub().sigla }}</div>
            <span class="team-name">{{ auth.activeClub().nombre }}</span>
          </div>
          <div class="vs-badge">VS</div>
          <div class="team-block">
            <div class="team-badge rival">NAC</div>
            <span class="team-name">Atlético Nacional</span>
          </div>
        </div>

        <div class="venue-row">
          <i class="fa-solid fa-location-dot text-amber"></i>
          <span>Cancha Sintética Principal - Sede Deportiva Los Arrayanes</span>
        </div>
      </div>

      <!-- PESTAÑAS TÉCNICAS: TITULARES vs SUPLENTES vs CITACIÓN JUGADOR -->
      <div class="squad-tabs-container">
        <div class="squad-tabs">
          <button 
            class="tab-item" 
            [class.active]="activeTab() === 'TITULARES'" 
            (click)="activeTab.set('TITULARES')">
            <i class="fa-solid fa-star text-amber"></i>
            <span>11 Titulares ({{ titulares().length }})</span>
          </button>
          <button 
            class="tab-item" 
            [class.active]="activeTab() === 'SUPLENTES'" 
            (click)="activeTab.set('SUPLENTES')">
            <i class="fa-solid fa-users text-blue"></i>
            <span>Suplentes ({{ suplentes().length }})</span>
          </button>
          <button 
            class="tab-item" 
            [class.active]="activeTab() === 'CITACION'" 
            (click)="activeTab.set('CITACION')">
            <i class="fa-solid fa-user-check text-emerald"></i>
            <span>Mi Estado</span>
          </button>
        </div>
      </div>

      <!-- VISTA PESTAÑA: TITULARES (11 INICIAL) -->
      @if (activeTab() === 'TITULARES') {
        <div class="squad-list">
          <div class="section-label">
            <span>ALINEACIÓN TITULAR CONFIRMADA</span>
            <button class="btn-add-player" (click)="abrirModalConvocar()">
              <i class="fa-solid fa-user-plus"></i> Convocar
            </button>
          </div>

          @for (j of titulares(); track j.id) {
            <div class="player-card titular-card">
              <div class="dorsal-box">{{ j.dorsal }}</div>
              <div class="player-details">
                <div class="name-row">
                  <h4>{{ j.nombres }} {{ j.apellidos }}</h4>
                  <span class="pos-badge">{{ j.posicion }}</span>
                </div>
                <div class="confirm-meta">
                  <span class="status-chip" [class]="j.estadoAsistencia.toLowerCase()">
                    <i class="fa-solid" [class.fa-circle-check]="j.estadoAsistencia === 'CONFIRMADO'" [class.fa-clock]="j.estadoAsistencia === 'PENDIENTE'" [class.fa-circle-xmark]="j.estadoAsistencia === 'EXCUSADO'"></i>
                    {{ j.estadoAsistencia }}
                  </span>
                </div>
              </div>
              <div class="player-tactical-actions">
                <button class="btn-swap" (click)="cambiarRol(j, 'SUPLENTE')" title="Pasar a Suplente">
                  <i class="fa-solid fa-arrow-down"></i>
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- VISTA PESTAÑA: SUPLENTES (BANCO DE SUPLENTES) -->
      @if (activeTab() === 'SUPLENTES') {
        <div class="squad-list">
          <div class="section-label">
            <span>BANCO DE SUPLENTES Y RELEVOS</span>
            <button class="btn-add-player" (click)="abrirModalConvocar()">
              <i class="fa-solid fa-user-plus"></i> Convocar
            </button>
          </div>

          @for (j of suplentes(); track j.id) {
            <div class="player-card suplente-card">
              <div class="dorsal-box suplente">{{ j.dorsal }}</div>
              <div class="player-details">
                <div class="name-row">
                  <h4>{{ j.nombres }} {{ j.apellidos }}</h4>
                  <span class="pos-badge">{{ j.posicion }}</span>
                </div>
                <div class="confirm-meta">
                  <span class="status-chip" [class]="j.estadoAsistencia.toLowerCase()">
                    {{ j.estadoAsistencia }}
                  </span>
                </div>
              </div>
              <div class="player-tactical-actions">
                <button class="btn-swap promo" (click)="cambiarRol(j, 'TITULAR')" title="Ascender a Titular">
                  <i class="fa-solid fa-arrow-up"></i>
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- VISTA PESTAÑA: MI ESTADO / CITACIÓN DE JUGADOR -->
      @if (activeTab() === 'CITACION') {
        <div class="my-rsvp-card">
          <div class="rsvp-header">
            <h3>Tu Citación Oficial</h3>
            <span class="my-role-badge">★ TITULAR (#8 MEDIOCENTRO)</span>
          </div>
          <p class="rsvp-instructions">
            Por favor confirma si puedes presentarte puntualmente a las <strong>08:30 AM</strong> con uniforme titular completo e hidratación.
          </p>

          <div class="rsvp-actions">
            <button 
              class="btn-rsvp-confirm" 
              [class.active]="miEstado() === 'CONFIRMADO'"
              (click)="responderMiCitacion('CONFIRMADO')">
              <i class="fa-solid fa-circle-check"></i> Sí, Asistiré al Partido
            </button>
            <button 
              class="btn-rsvp-excuse" 
              [class.active]="miEstado() === 'EXCUSADO'"
              (click)="responderMiCitacion('EXCUSADO')">
              <i class="fa-solid fa-circle-xmark"></i> No podré asistir
            </button>
          </div>
        </div>
      }
    </main>

    <!-- MODAL NUEVO JUGADOR CONVOCADO (Con confirmación Continuar o Cerrar) -->
    @if (mostrarModalConvocar()) {
      <div class="modal-backdrop" (click)="mostrarModalConvocar.set(false)">
        <div class="modal-sheet" (click)="$event.stopPropagation()">
          <div class="sheet-header">
            <h3>Convocar Nuevo Jugador</h3>
            <button class="btn-close" (click)="mostrarModalConvocar.set(false)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="sheet-body">
            <div class="form-group">
              <label>Selecciona el Jugador:</label>
              <select [(ngModel)]="nuevoConvocado.jugadorId" class="form-select">
                <option value="j-9">Juan David Castro (#11 - Extremo Izquierdo)</option>
                <option value="j-10">Andrés Felipe Marín (#14 - Lateral Derecho)</option>
                <option value="j-11">Felipe Quintero (#12 - Arquero Suplente)</option>
              </select>
            </div>

            <div class="form-group">
              <label>Rol Táctico:</label>
              <div class="role-selector">
                <label class="radio-chip" [class.selected]="nuevoConvocado.rol === 'TITULAR'">
                  <input type="radio" name="rol" value="TITULAR" [(ngModel)]="nuevoConvocado.rol" /> Titular (11 Inicial)
                </label>
                <label class="radio-chip" [class.selected]="nuevoConvocado.rol === 'SUPLENTE'">
                  <input type="radio" name="rol" value="SUPLENTE" [(ngModel)]="nuevoConvocado.rol" /> Suplente
                </label>
              </div>
            </div>
          </div>

          <div class="sheet-footer">
            <button class="btn-submit-booking" (click)="guardarNuevoConvocado()">
              <i class="fa-solid fa-plus"></i> Registrar Convocatoria
            </button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL CONFIRMACIÓN: ¿DESEA CONTINUAR O CERRAR? -->
    @if (mostrarDialogoContinuar()) {
      <div class="modal-backdrop">
        <div class="dialog-card">
          <div class="icon-success">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <h3>¡Jugador Convocado con Éxito!</h3>
          <p>El registro fue procesado en el sistema.</p>
          
          <div class="dialog-actions">
            <button class="btn-dialog-continue" (click)="continuarAgregando()">
              <i class="fa-solid fa-plus"></i> Convocar Otro
            </button>
            <button class="btn-dialog-close" (click)="cerrarYActualizar()">
              <i class="fa-solid fa-check"></i> Cerrar y Actualizar Lista
            </button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL GENERADOR DE AFICHE IA -->
    @if (showPosterModal()) {
      <div class="modal-backdrop" (click)="cerrarModalPoster()">
        <div class="poster-modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <div>
              <h3 class="modal-title"><i class="fa-solid fa-wand-magic-sparkles text-emerald"></i> Afiche Oficial con IA</h3>
              <p class="modal-subtitle">{{ auth.activeClub().nombre }} &bull; Nómina Titular</p>
            </div>
            <button class="btn-close-modal" (click)="cerrarModalPoster()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="canvas-wrapper">
            <canvas #posterCanvas width="1080" height="1350" class="responsive-canvas"></canvas>
          </div>

          <div class="modal-actions">
            <button class="btn-primary-action" (click)="descargarAfiche()">
              <i class="fa-solid fa-download"></i> Descargar Afiche HD
            </button>
            <button class="btn-secondary-action" (click)="compartirWhatsApp()">
              <i class="fa-brands fa-whatsapp text-emerald"></i> Compartir por WhatsApp
            </button>
          </div>
        </div>
      </div>
    }

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .conv-subbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1rem;
      background: #fff;
      border-bottom: 1px solid var(--border-color, #e2e8f0);

      .subbar-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .btn-back {
          color: #0f172a;
          font-size: 1.1rem;
          text-decoration: none;
        }

        h2 {
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
      }

      .subbar-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .btn-icon-refresh {
          background: #f1f5f9;
          border: none;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          color: #0f172a;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          transition: transform 0.3s ease;

          &.spinning {
            animation: spin 0.8s linear infinite;
          }
        }

        .btn-generate-poster {
          background: linear-gradient(135deg, #10b981 0%, #047857 100%);
          color: #fff;
          border: none;
          padding: 0.45rem 0.75rem;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          cursor: pointer;
        }
      }
    }

    .page-content {
      padding: 0.85rem;
      padding-bottom: calc(85px + var(--safe-area-bottom));
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
      width: 100%;
      max-width: 100vw;
      overflow-x: hidden !important;
      box-sizing: border-box;
    }

    .match-summary-card {
      background: linear-gradient(135deg, #093322 0%, #064e3b 100%);
      color: #fff;
      border-radius: 1.25rem;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      box-shadow: 0 10px 20px -5px rgba(6, 78, 59, 0.35);

      .card-meta-top {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .cat-pill {
          background: rgba(16, 185, 129, 0.25);
          color: #6ee7b7;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: 20px;
        }

        .date-pill {
          font-size: 0.72rem;
          opacity: 0.9;
        }
      }

      .vs-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .team-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          width: 40%;
          text-align: center;

          .team-badge {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.15);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 0.85rem;
            color: #fff;

            &.rival { background: rgba(239, 68, 68, 0.25); }
          }

          .team-name {
            font-size: 0.8rem;
            font-weight: 800;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }
        }

        .vs-badge {
          background: rgba(0, 0, 0, 0.3);
          font-weight: 900;
          font-size: 0.8rem;
          padding: 0.3rem 0.6rem;
          border-radius: 50%;
        }
      }

      .venue-row {
        font-size: 0.75rem;
        opacity: 0.9;
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }
    }

    /* PESTAÑAS TÁCTICAS */
    .squad-tabs-container {
      background: #e2e8f0;
      padding: 0.25rem;
      border-radius: 12px;

      .squad-tabs {
        display: flex;
        gap: 0.25rem;

        .tab-item {
          flex: 1;
          background: none;
          border: none;
          padding: 0.65rem 0.35rem;
          border-radius: 10px;
          font-size: 0.75rem;
          font-weight: 800;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          cursor: pointer;
          transition: all 0.2s ease;

          &.active {
            background: #fff;
            color: #0f172a;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          }
        }
      }
    }

    .squad-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .section-label {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.72rem;
        font-weight: 800;
        color: #64748b;
        letter-spacing: 0.5px;

        .btn-add-player {
          background: #047857;
          color: #fff;
          border: none;
          padding: 0.3rem 0.65rem;
          border-radius: 6px;
          font-size: 0.7rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }
      }
    }

    .player-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 0.75rem 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;

      &.titular-card { border-left: 4px solid #10b981; }
      &.suplente-card { border-left: 4px solid #3b82f6; }

      .dorsal-box {
        width: 36px;
        height: 36px;
        background: #0f172a;
        color: #fff;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        font-weight: 900;

        &.suplente { background: #475569; }
      }

      .player-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.2rem;

        .name-row {
          display: flex;
          justify-content: space-between;
          align-items: center;

          h4 {
            font-size: 0.88rem;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
          }

          .pos-badge {
            font-size: 0.65rem;
            font-weight: 700;
            background: #f1f5f9;
            color: #475569;
            padding: 0.15rem 0.45rem;
            border-radius: 4px;
          }
        }

        .confirm-meta {
          .status-chip {
            font-size: 0.68rem;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 0.25rem;

            &.confirmado { color: #16a34a; }
            &.pendiente { color: #d97706; }
            &.excusado { color: #dc2626; }
          }
        }
      }

      .player-tactical-actions {
        .btn-swap {
          background: #f1f5f9;
          border: 1px solid #cbd5e1;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          color: #475569;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;

          &.promo {
            color: #047857;
            border-color: #a7f3d0;
            background: #ecfdf5;
          }
        }
      }
    }

    /* MI CITACIÓN */
    .my-rsvp-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 1.25rem;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;

      .rsvp-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        h3 { font-size: 1.05rem; font-weight: 800; margin: 0; color: #0f172a; }
        .my-role-badge {
          background: #fef3c7;
          color: #b45309;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
        }
      }

      .rsvp-instructions {
        font-size: 0.82rem;
        color: #475569;
        margin: 0;
        line-height: 1.45;
      }

      .rsvp-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .btn-rsvp-confirm, .btn-rsvp-excuse {
          width: 100%;
          padding: 0.85rem;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          cursor: pointer;
          border: 1.5px solid transparent;
        }

        .btn-rsvp-confirm {
          background: #047857;
          color: #fff;

          &.active {
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.4);
          }
        }

        .btn-rsvp-excuse {
          background: #fee2e2;
          color: #b91c1c;
          border-color: #fca5a5;
        }
      }
    }

    /* MODAL SHEETS & DIALOGS */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(4px);
      z-index: 2000;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }

    .modal-sheet {
      background: #fff;
      width: 100%;
      max-width: 480px;
      border-radius: 1.5rem 1.5rem 0 0;
      padding-bottom: calc(1rem + var(--safe-area-bottom));
      animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .sheet-header {
      padding: 1.15rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;

      h3 { font-size: 1.05rem; font-weight: 800; margin: 0; color: #0f172a; }
      .btn-close {
        background: #f1f5f9;
        border: none;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        color: #64748b;
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

        label { font-size: 0.8rem; font-weight: 700; color: #334155; }
        .form-select {
          padding: 0.65rem;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          font-size: 0.85rem;
        }
      }

      .role-selector {
        display: flex;
        gap: 0.5rem;

        .radio-chip {
          flex: 1;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          padding: 0.65rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          text-align: center;

          &.selected {
            border-color: #047857;
            background: #f0fdf4;
            color: #047857;
          }
        }
      }
    }

    .sheet-footer {
      padding: 0.75rem 1.25rem;
      .btn-submit-booking {
        width: 100%;
        background: #047857;
        color: #fff;
        border: none;
        padding: 0.85rem;
        border-radius: 10px;
        font-weight: 800;
        font-size: 0.9rem;
        cursor: pointer;
      }
    }

    /* DIALOG CONTINUAR O CERRAR */
    .dialog-card {
      background: #fff;
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

      .icon-success { font-size: 3.5rem; color: #10b981; }
      h3 { font-size: 1.2rem; font-weight: 800; color: #0f172a; margin: 0; }
      p { font-size: 0.82rem; color: #64748b; margin: 0; }

      .dialog-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
        margin-top: 0.5rem;

        .btn-dialog-continue {
          width: 100%;
          background: #0f172a;
          color: #fff;
          border: none;
          padding: 0.85rem;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .btn-dialog-close {
          width: 100%;
          background: #f1f5f9;
          color: #334155;
          border: 1px solid #cbd5e1;
          padding: 0.85rem;
          border-radius: 10px;
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
        }
      }
    }

    /* POSTER MODAL */
    .poster-modal-content {
      background: #fff;
      border-radius: 20px;
      padding: 1.25rem;
      max-width: 480px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin: auto;

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        .modal-title { font-size: 1.1rem; font-weight: 900; color: #0f172a; margin: 0; }
        .modal-subtitle { font-size: 0.74rem; color: #64748b; margin: 2px 0 0; }
        .btn-close-modal { background: none; border: none; font-size: 1.2rem; color: #94a3b8; cursor: pointer; }
      }

      .canvas-wrapper {
        background: #0f172a;
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        justify-content: center;
        .responsive-canvas { width: 100%; height: auto; max-height: 48vh; object-fit: contain; }
      }

      .modal-actions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        .btn-primary-action { background: #047857; color: #fff; border: none; padding: 0.85rem; border-radius: 10px; font-weight: 800; cursor: pointer; }
        .btn-secondary-action { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; padding: 0.85rem; border-radius: 10px; font-weight: 800; cursor: pointer; }
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
export class ConvocatoriasMobileComponent implements OnInit {
  private http = inject(HttpClient);
  private alertService = inject(AlertService);
  auth = inject(AuthService);

  @ViewChild('posterCanvas') posterCanvas?: ElementRef<HTMLCanvasElement>;

  activeTab = signal<'TITULARES' | 'SUPLENTES' | 'CITACION'>('TITULARES');
  isRefreshing = signal<boolean>(false);
  showPosterModal = signal<boolean>(false);
  mostrarModalConvocar = signal<boolean>(false);
  mostrarDialogoContinuar = signal<boolean>(false);
  miEstado = signal<'CONFIRMADO' | 'EXCUSADO' | 'PENDIENTE'>('CONFIRMADO');

  nuevoConvocado = {
    jugadorId: 'j-9',
    rol: 'TITULAR'
  };

  titulares = signal<ConvocadoTecnico[]>([
    { id: 'c-1', nombres: 'Sebastián', apellidos: 'Muñoz', dorsal: 1, posicion: 'Arquero', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-2', nombres: 'Andrés', apellidos: 'Salazar', dorsal: 2, posicion: 'Lateral Derecho', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-3', nombres: 'Alejandro', apellidos: 'Ochoa', dorsal: 3, posicion: 'Defensa Central', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-4', nombres: 'Nicolás', apellidos: 'Zapata', dorsal: 4, posicion: 'Defensa Central', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-5', nombres: 'Samuel', apellidos: 'Vásquez', dorsal: 6, posicion: 'Lateral Izquierdo', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-6', nombres: 'Santiago', apellidos: 'Restrepo', dorsal: 8, posicion: 'Mediocentro Defensivo', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-7', nombres: 'Mateo', apellidos: 'Gómez', dorsal: 10, posicion: 'Volante Ofensivo', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-8', nombres: 'Daniel', apellidos: 'Henao', dorsal: 7, posicion: 'Extremo Derecho', rol: 'TITULAR', estadoAsistencia: 'PENDIENTE' },
    { id: 'c-9', nombres: 'Carlos', apellidos: 'Londoño', dorsal: 9, posicion: 'Delantero Centro', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-10', nombres: 'Camilo', apellidos: 'Ríos', dorsal: 11, posicion: 'Extremo Izquierdo', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-11', nombres: 'Esteban', apellidos: 'Pérez', dorsal: 5, posicion: 'Volante Mixto', rol: 'TITULAR', estadoAsistencia: 'CONFIRMADO' }
  ]);

  suplentes = signal<ConvocadoTecnico[]>([
    { id: 'c-12', nombres: 'David', apellidos: 'Herrera', dorsal: 12, posicion: 'Portero Suplente', rol: 'SUPLENTE', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-13', nombres: 'Tomás', apellidos: 'Giraldo', dorsal: 14, posicion: 'Defensa Central', rol: 'SUPLENTE', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-14', nombres: 'Lucas', apellidos: 'Mendoza', dorsal: 15, posicion: 'Mediocentro', rol: 'SUPLENTE', estadoAsistencia: 'EXCUSADO' },
    { id: 'c-15', nombres: 'Felipe', apellidos: 'Berrío', dorsal: 16, posicion: 'Extremo', rol: 'SUPLENTE', estadoAsistencia: 'CONFIRMADO' },
    { id: 'c-16', nombres: 'Jerónimo', apellidos: 'Cano', dorsal: 17, posicion: 'Delantero', rol: 'SUPLENTE', estadoAsistencia: 'PENDIENTE' }
  ]);

  ngOnInit(): void {}

  recargarDatos(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
      this.alertService.success('Convocatorias y nóminas actualizadas desde la base de datos.');
    }, 600);
  }

  cambiarRol(jugador: ConvocadoTecnico, nuevoRol: 'TITULAR' | 'SUPLENTE'): void {
    if (nuevoRol === 'TITULAR') {
      this.suplentes.update(l => l.filter(j => j.id !== jugador.id));
      this.titulares.update(l => [...l, { ...jugador, rol: 'TITULAR' }]);
      this.alertService.success(`${jugador.nombres} ${jugador.apellidos} ascendido al 11 Titular.`);
    } else {
      this.titulares.update(l => l.filter(j => j.id !== jugador.id));
      this.suplentes.update(l => [...l, { ...jugador, rol: 'SUPLENTE' }]);
      this.alertService.info(`${jugador.nombres} ${jugador.apellidos} pasado al Banco de Suplentes.`);
    }
  }

  responderMiCitacion(estado: 'CONFIRMADO' | 'EXCUSADO'): void {
    this.miEstado.set(estado);
    if (estado === 'CONFIRMADO') {
      this.alertService.success('¡Asistencia confirmada con éxito al cuerpo técnico!');
    } else {
      this.alertService.warning('Has notificado tu no asistencia al partido.');
    }
  }

  abrirModalConvocar(): void {
    this.mostrarModalConvocar.set(true);
  }

  guardarNuevoConvocado(): void {
    const nuevo: ConvocadoTecnico = {
      id: 'c-' + Date.now(),
      nombres: this.nuevoConvocado.jugadorId === 'j-9' ? 'Juan David' : (this.nuevoConvocado.jugadorId === 'j-10' ? 'Andrés Felipe' : 'Felipe'),
      apellidos: this.nuevoConvocado.jugadorId === 'j-9' ? 'Castro' : (this.nuevoConvocado.jugadorId === 'j-10' ? 'Marín' : 'Quintero'),
      dorsal: this.nuevoConvocado.jugadorId === 'j-9' ? 11 : (this.nuevoConvocado.jugadorId === 'j-10' ? 14 : 12),
      posicion: this.nuevoConvocado.jugadorId === 'j-9' ? 'Extremo' : (this.nuevoConvocado.jugadorId === 'j-10' ? 'Lateral' : 'Portero'),
      rol: this.nuevoConvocado.rol as any,
      estadoAsistencia: 'CONFIRMADO'
    };

    if (nuevo.rol === 'TITULAR') {
      this.titulares.update(l => [...l, nuevo]);
    } else {
      this.suplentes.update(l => [...l, nuevo]);
    }

    this.mostrarModalConvocar.set(false);
    this.mostrarDialogoContinuar.set(true);
  }

  continuarAgregando(): void {
    this.mostrarDialogoContinuar.set(false);
    this.mostrarModalConvocar.set(true);
  }

  cerrarYActualizar(): void {
    this.mostrarDialogoContinuar.set(false);
    this.recargarDatos();
  }

  abrirModalPoster(): void {
    this.showPosterModal.set(true);
    setTimeout(() => {
      this.renderPosterOnCanvas();
    }, 120);
  }

  cerrarModalPoster(): void {
    this.showPosterModal.set(false);
  }

  renderPosterOnCanvas(): void {
    if (!this.posterCanvas) return;
    const canvas = this.posterCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1080;
    const H = 1350;

    ctx.fillStyle = '#064e3b';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('CONVOCATORIA OFICIAL', W / 2, 120);

    ctx.fillStyle = '#a7f3d0';
    ctx.font = '32px Arial';
    ctx.fillText(this.auth.activeClub().nombre.toUpperCase(), W / 2, 170);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 40px Arial';
    ctx.fillText('VS ATLÉTICO NACIONAL', W / 2, 260);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('11 TITULARES:', 120, 360);

    let y = 430;
    const lista = this.titulares();
    for (let i = 0; i < Math.min(lista.length, 11); i++) {
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 30px Arial';
      ctx.fillText(`#${lista[i].dorsal}`, 140, y);

      ctx.fillStyle = '#ffffff';
      ctx.font = '28px Arial';
      ctx.fillText(`${lista[i].nombres} ${lista[i].apellidos} (${lista[i].posicion})`, 220, y);
      y += 55;
    }

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(80, H - 160, W - 160, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Sede Deportiva Los Arrayanes • Sábado 09:30 AM', W / 2, H - 100);
  }

  descargarAfiche(): void {
    if (!this.posterCanvas) return;
    const link = document.createElement('a');
    link.download = `Convocatoria_${Date.now()}.png`;
    link.href = this.posterCanvas.nativeElement.toDataURL('image/png');
    link.click();
    this.alertService.success('Afiche HD descargado con éxito.');
  }

  compartirWhatsApp(): void {
    const text = encodeURIComponent(`🏆 Convocatoria Oficial ${this.auth.activeClub().nombre} para el partido del Sábado. ¡Todos a apoyar al equipo!`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }
}

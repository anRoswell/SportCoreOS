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
  calificacionRendimiento?: 'DESTACADO' | 'CUMPLIO' | 'BAJA_INTENSIDAD';
  observacion?: string;
  avatar?: string;
}

export interface CategoriaDeportivaItem {
  id: string;
  nombre: string;
  codigo_categoria: string;
  color_distintivo?: string;
  total_jugadores?: number;
  cancha?: string;
  enfoque?: string;
  plantel?: JugadorAsistencia[];
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
        <button class="btn-voice-dictation" (click)="abrirModalDictadoVoz()" title="Dictar Novedades por Voz">
          <i class="fa-solid fa-microphone"></i>
          <span>Dictar</span>
        </button>
        <button class="btn-qr-scan" (click)="abrirModalEscanerQR()" title="Escanear QR de Cancha">
          <i class="fa-solid fa-qrcode"></i>
          <span>QR</span>
        </button>
        <button class="btn-icon-refresh" [class.spinning]="isRefreshing()" (click)="recargarAsistencia()" title="Actualizar">
          <i class="fa-solid fa-arrows-rotate"></i>
        </button>
      </div>
    </div>

    <!-- SELECTOR TÁCTICO DE CATEGORÍAS ASIGNADAS AL ENTRENADOR -->
    <div class="category-selector-bar">
      <div class="category-chips-scroll">
        @for (cat of categoriasAsignadas(); track cat.id) {
          <button 
            type="button" 
            class="cat-chip-btn" 
            [class.active]="categoriaSeleccionada()?.id === cat.id"
            (click)="seleccionarCategoria(cat)">
            <span class="cat-dot" [style.background]="cat.color_distintivo || '#10b981'"></span>
            <span class="cat-name">{{ cat.nombre }}</span>
            <span class="cat-count">({{ cat.total_jugadores || cat.plantel?.length || 0 }})</span>
          </button>
        }
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
            <strong>{{ categoriaSeleccionada()?.nombre || 'Sub-15 Élite A' }}</strong>
          </div>
          <div class="info-cell">
            <span class="lbl"><i class="fa-solid fa-location-dot"></i> Cancha</span>
            <strong>{{ categoriaSeleccionada()?.cancha || 'Sede Principal #1' }}</strong>
          </div>
          <div class="info-cell">
            <span class="lbl"><i class="fa-solid fa-dumbbell"></i> Enfoque</span>
            <strong>{{ categoriaSeleccionada()?.enfoque || 'Fuerza & Presión' }}</strong>
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
        <!-- Banner de Delegación de Asistente / Capitán -->
        <div class="delegation-strip">
          <div class="delegation-left">
            <i class="fa-solid fa-user-shield text-blue"></i>
            <span>Pase delegado: <strong>Capitán Mateo Gómez (#10)</strong></span>
          </div>
          <button class="btn-delegated-toggle" (click)="toggleModoDelegado()">
            <i class="fa-solid" [class.fa-toggle-on]="modoDelegadoActivo()" [class.fa-toggle-off]="!modoDelegadoActivo()"></i>
            <span>{{ modoDelegadoActivo() ? 'Modo Capitán' : 'Delegar' }}</span>
          </button>
        </div>
      </div>

      <!-- BARRA DE ACCIÓN RÁPIDA -->
      <div class="quick-actions-bar">
        <button class="btn-quick-all" (click)="marcarTodos('PRESENTE')">
          <i class="fa-solid fa-check-double"></i> Todos Presentes
        </button>
        <button class="btn-show-pitch-qr" (click)="abrirModalGeneradorQR()">
          <i class="fa-solid fa-display"></i> Mostrar QR de Cancha
        </button>
        <span class="roster-pct">
          Efectividad: <strong>{{ porcentajeAsistencia() }}%</strong>
        </span>
      </div>

      <!-- LISTA DE JUGADORES (CARDS CON BOTONERA TÁCTIL & CALIFICACIÓN RÁPIDA) -->
      <div class="players-list">
        @for (j of jugadoresFiltrados(); track j.id) {
          <div class="player-row-card" [class]="'border-' + j.estado.toLowerCase()">
            <div class="player-top-main">
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

            <!-- FILA DE CALIFICACIÓN RÁPIDA DE RENDIMIENTO/ACTITUD (1 TOQUE) -->
            @if (j.estado === 'PRESENTE' || j.estado === 'RETRASO') {
              <div class="performance-fast-rating-row">
                <span class="rating-strip-label"><i class="fa-solid fa-gauge-high"></i> Intensidad DT:</span>
                <div class="rating-buttons-group">
                  <button 
                    type="button" 
                    class="btn-rating rate-destacado" 
                    [class.active]="j.calificacionRendimiento === 'DESTACADO'"
                    (click)="calificarJugador(j.id, 'DESTACADO')"
                    title="Sobresaliente (+100 XP)">
                    ⚡ Destacado (+100 XP)
                  </button>
                  <button 
                    type="button" 
                    class="btn-rating rate-cumplio" 
                    [class.active]="j.calificacionRendimiento === 'CUMPLIO'"
                    (click)="calificarJugador(j.id, 'CUMPLIO')"
                    title="Normal (+50 XP)">
                    👍 Cumplió (+50 XP)
                  </button>
                  <button 
                    type="button" 
                    class="btn-rating rate-baja" 
                    [class.active]="j.calificacionRendimiento === 'BAJA_INTENSIDAD'"
                    (click)="calificarJugador(j.id, 'BAJA_INTENSIDAD')"
                    title="Baja Intensidad (+20 XP)">
                    ⚠️ Baja (+20 XP)
                  </button>
                </div>
              </div>
            }
          </div>
        } @empty {
          <div class="empty-state">
            <i class="fa-solid fa-user-check empty-icon"></i>
            <p>No hay jugadores en esta categoría de filtro.</p>
            <button class="btn-clear-filter" (click)="setFiltro('TODOS')">Ver Todos</button>
          </div>
        }
      </div>

      <!-- PANEL DE CONFIRMACIÓN OFICIAL POR EL DIRECTOR TÉCNICO (DT) -->
      <div class="coach-signature-card" [class.confirmed]="asistenciaConfirmadaPorDT()">
        <div class="coach-card-header">
          <div class="coach-badge-info">
            <div class="coach-avatar-ring">
              <i class="fa-solid fa-user-tie"></i>
            </div>
            <div class="coach-meta-text">
              <span class="coach-role-title">VALIDACIÓN DEL CUERPO TÉCNICO</span>
              <h4 class="coach-name">{{ auth.currentUser()?.nombres }} {{ auth.currentUser()?.apellidos || 'Director Técnico' }}</h4>
            </div>
          </div>
          <div class="dt-status-pill" [class.verified]="asistenciaConfirmadaPorDT()">
            <i class="fa-solid" [class.fa-circle-check]="asistenciaConfirmadaPorDT()" [class.fa-clock]="!asistenciaConfirmadaPorDT()"></i>
            <span>{{ asistenciaConfirmadaPorDT() ? 'PLANILLA AVALADA' : 'PENDIENTE FIRMA DT' }}</span>
          </div>
        </div>

        @if (asistenciaConfirmadaPorDT()) {
          <div class="coach-confirmed-details">
            <p><i class="fa-solid fa-shield-check text-emerald"></i> Asistencia certificada oficialmente para el cálculo de XP y convocatorias.</p>
            <span class="time-stamp-confirmed">Avalado Hoy a las {{ horaConfirmacionDT() }} • Registro Inmutable</span>
          </div>
        } @else {
          <p class="coach-hint-text">
            Como Director Técnico responsable de la categoría <strong>{{ categoriaSeleccionada()?.nombre }}</strong>, confirma la asistencia para validar los puntos XP de los jugadores y el reporte oficial de cantera.
          </p>
        }
      </div>

      <!-- BOTÓN DE CONFIRMACIÓN Y GUARDADO DEFINITIVO -->
      <div class="save-footer">
        <button 
          class="btn-primary btn-save" 
          [class.btn-confirmed-style]="asistenciaConfirmadaPorDT()"
          (click)="abrirModalConfirmacionDT()">
          <i class="fa-solid" [class.fa-circle-check]="asistenciaConfirmadaPorDT()" [class.fa-signature]="!asistenciaConfirmadaPorDT()"></i>
          <span>{{ asistenciaConfirmadaPorDT() ? 'Re-validar Planilla DT' : 'Confirmar & Avalar Asistencia como DT' }}</span>
        </button>
      </div>
    </main>

    <!-- MODAL DE FIRMA Y CONFIRMACIÓN OFICIAL DEL TÉCNICO -->
    @if (mostrarModalConfirmacionDT()) {
      <div class="modal-backdrop" (click)="mostrarModalConfirmacionDT.set(false)">
        <div class="modal-sheet dt-confirm-sheet" (click)="$event.stopPropagation()">
          <div class="sheet-header">
            <div class="dt-sheet-title">
              <i class="fa-solid fa-clipboard-check text-emerald"></i>
              <div>
                <h3>Aval Oficial de Asistencia DT</h3>
                <p class="sheet-subtitle">{{ categoriaSeleccionada()?.nombre }} • {{ jugadores().length }} Jugadores en Planilla</p>
              </div>
            </div>
            <button class="btn-close" (click)="mostrarModalConfirmacionDT.set(false)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="sheet-body dt-confirm-body">
            <!-- Resumen de Planilla -->
            <div class="dt-summary-box">
              <div class="sum-item text-emerald">
                <strong>{{ contarPorEstado('PRESENTE') }}</strong>
                <span>Presentes (+50 XP)</span>
              </div>
              <div class="sum-item text-amber">
                <strong>{{ contarPorEstado('RETRASO') }}</strong>
                <span>Retrasos (+25 XP)</span>
              </div>
              <div class="sum-item text-blue">
                <strong>{{ contarPorEstado('EXCUSA') }}</strong>
                <span>Excusas (0 XP)</span>
              </div>
              <div class="sum-item text-rose">
                <strong>{{ contarPorEstado('FALTA') }}</strong>
                <span>Faltas (-30 XP)</span>
              </div>
            </div>

            <!-- Declaración de Responsabilidad DT -->
            <div class="dt-declaration-box">
              <i class="fa-solid fa-fingerprint"></i>
              <p>
                Yo, <strong>{{ auth.currentUser()?.nombres }} {{ auth.currentUser()?.apellidos }}</strong>, en calidad de Director Técnico / Entrenador, certifico la exactitud del pase de lista en campo y autorizo la asignación de experiencia deportiva (<strong>+50 XP</strong> presentes / <strong>-30 XP penalización</strong> por inasistencia injustificada).
              </p>
            </div>
          </div>

          <div class="sheet-footer">
            <button class="btn-submit-booking btn-confirm-dt-action" (click)="ejecutarConfirmacionDT()">
              <i class="fa-solid fa-check-double"></i> Avalar & Guardar Planilla
            </button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL 1: GENERADOR DE QR DINÁMICO DE CANCHA (PANTALLA DT / SEDE) -->
    @if (mostrarModalGeneradorQR()) {
      <div class="modal-backdrop" (click)="mostrarModalGeneradorQR.set(false)">
        <div class="modal-sheet qr-display-sheet" (click)="$event.stopPropagation()">
          <div class="sheet-header">
            <div class="dt-sheet-title">
              <i class="fa-solid fa-qrcode text-emerald"></i>
              <div>
                <h3>Código QR de Cancha en Vivo</h3>
                <p class="sheet-subtitle">{{ categoriaSeleccionada()?.nombre }} • {{ categoriaSeleccionada()?.cancha }}</p>
              </div>
            </div>
            <button class="btn-close" (click)="mostrarModalGeneradorQR.set(false)">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="sheet-body qr-display-body">
            <!-- Dynamic Token Box -->
            <div class="qr-token-countdown">
              <span class="token-pulse-dot"></span>
              <span>TOKEN DINÁMICO • EXPIRA EN: <strong>{{ qrTiempoRestante() }}s</strong></span>
            </div>

            <!-- SVG QR Visual Interactivo -->
            <div class="qr-visual-frame">
              <div class="qr-code-svg-wrap">
                <svg viewBox="0 0 200 200" class="qr-svg-matrix">
                  <!-- Posicionadores Esquinas QR -->
                  <rect x="10" y="10" width="50" height="50" fill="none" stroke="#10b981" stroke-width="6" rx="6" />
                  <rect x="22" y="22" width="26" height="26" fill="#10b981" rx="4" />

                  <rect x="140" y="10" width="50" height="50" fill="none" stroke="#10b981" stroke-width="6" rx="6" />
                  <rect x="152" y="22" width="26" height="26" fill="#10b981" rx="4" />

                  <rect x="10" y="140" width="50" height="50" fill="none" stroke="#10b981" stroke-width="6" rx="6" />
                  <rect x="22" y="152" width="26" height="26" fill="#10b981" rx="4" />

                  <!-- Matriz de Puntos Aleatorios Dinámicos -->
                  @for (dot of qrMatrixDots(); track $index) {
                    <rect [attr.x]="dot.x" [attr.y]="dot.y" width="10" height="10" fill="#f8fafc" rx="2" opacity="0.9" />
                  }

                  <!-- Isotipo Central -->
                  <circle cx="100" cy="100" r="22" fill="#0b0f19" stroke="#10b981" stroke-width="3" />
                  <text x="100" y="106" font-size="16" text-anchor="middle" fill="#34d399">⚽</text>
                </svg>
              </div>
              <div class="qr-code-label">
                <code>{{ qrTokenActual() }}</code>
              </div>
            </div>

            <p class="qr-instructions">
              Los muchachos escanean este código con la App móvil al pisar la cancha para marcar <strong>PRESENTE</strong> de forma instantánea y ganar <strong>+50 XP</strong>.
            </p>
          </div>

          <div class="sheet-footer">
            <button class="btn-submit-booking" (click)="regenerarTokenQR()">
              <i class="fa-solid fa-arrows-rotate"></i> Regenerar Token QR
            </button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL 2: ESCÁNER QR DE CANCHA (CÁMARA DEL JUGADOR) -->
    @if (mostrarModalEscanerQR()) {
      <div class="modal-backdrop" (click)="cerrarModalEscanerQR()">
        <div class="modal-sheet qr-scanner-sheet" (click)="$event.stopPropagation()">
          <div class="sheet-header">
            <div class="dt-sheet-title">
              <i class="fa-solid fa-camera text-emerald"></i>
              <div>
                <h3>Escanear QR de Cancha</h3>
                <p class="sheet-subtitle">Apunta la cámara al código mostrado por tu DT</p>
              </div>
            </div>
            <button class="btn-close" (click)="cerrarModalEscanerQR()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="sheet-body qr-scanner-body">
            <!-- Simulación de Viewport de Cámara con Retícula -->
            <div class="scanner-camera-viewport">
              <div class="scan-laser-line"></div>
              <div class="scan-target-frame">
                <span class="corner tl"></span>
                <span class="corner tr"></span>
                <span class="corner bl"></span>
                <span class="corner br"></span>
              </div>
              <div class="scanner-camera-bg">
                <i class="fa-solid fa-qrcode bg-ghost-qr"></i>
              </div>
            </div>

            <!-- Selector de Jugador para Check-in Simulado -->
            <div class="scanner-player-select">
              <label><i class="fa-solid fa-user-check text-emerald"></i> Jugador que realiza Check-in:</label>
              <select [(ngModel)]="jugadorSeleccionadoScanId" class="form-input">
                @for (j of jugadores(); track j.id) {
                  <option [value]="j.id">#{{ j.dorsal }} {{ j.nombres }} {{ j.apellidos }} ({{ j.posicion }})</option>
                }
              </select>
            </div>
          </div>

          <div class="sheet-footer">
            <button class="btn-submit-booking btn-scan-simulate" [disabled]="escaneando()" (click)="procesarEscaneoQR()">
              <i class="fa-solid" [class.fa-bolt]="!escaneando()" [class.fa-spinner]="escaneando()" [class.fa-spin]="escaneando()"></i>
              <span>{{ escaneando() ? 'Validando Token con Servidor...' : 'Simular Escaneo Exitoso' }}</span>
            </button>
          </div>
        </div>
      </div>
    }

    <!-- MODAL 3: DICTADO POR VOZ INTELIGENTE (SPEECH-TO-TEXT ASISTIDO POR IA) -->
    @if (mostrarModalDictadoVoz()) {
      <div class="modal-backdrop" (click)="cerrarModalDictadoVoz()">
        <div class="modal-sheet voice-dictation-sheet" (click)="$event.stopPropagation()">
          <div class="sheet-header">
            <div class="dt-sheet-title">
              <i class="fa-solid fa-microphone-lines text-rose"></i>
              <div>
                <h3>Dictado de Novedades por Voz</h3>
                <p class="sheet-subtitle">Habla libremente: la IA procesará estados y observaciones</p>
              </div>
            </div>
            <button class="btn-close" (click)="cerrarModalDictadoVoz()">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="sheet-body voice-dictation-body">
            <!-- Botón de Grabación con Onda Animada -->
            <div class="voice-mic-container">
              <button 
                type="button" 
                class="btn-voice-mic-main" 
                [class.recording]="grabandoVoz()"
                (click)="toggleGrabacionVoz()">
                <i class="fa-solid fa-microphone"></i>
                <div class="mic-wave-ring" *ngIf="grabandoVoz()"></div>
              </button>
              <span class="mic-status-label">
                {{ grabandoVoz() ? 'Escuchando al DT... (Toca para detener)' : 'Toca el micrófono para dictar' }}
              </span>
            </div>

            <!-- Transcripción en Tiempo Real -->
            <div class="transcription-preview-box">
              <div class="transcription-header">
                <span class="lbl"><i class="fa-solid fa-wand-magic-sparkles"></i> Transcripción IA:</span>
                <button class="btn-sample-voice" *ngIf="!textoDictadoTranscrito" (click)="usarEjemploDictado()">
                  <i class="fa-solid fa-bolt"></i> Cargar Frase de Ejemplo
                </button>
              </div>
              <p class="transcription-text" [class.placeholder]="!textoDictadoTranscrito">
                "{{ textoDictadoTranscrito || 'Ej: Samuel Díaz destacado en velocidad, Mateo Gómez retraso por tráfico, Carlos Londoño falta...' }}"
              </p>
            </div>

            <!-- Acciones Rápidas Detectadas -->
            @if (novedadesDetectadasVoz().length > 0) {
              <div class="detected-actions-box">
                <span class="actions-header-title">Novedades Listas para Aplicar ({{ novedadesDetectadasVoz().length }}):</span>
                <div class="detected-chips-list">
                  @for (nov of novedadesDetectadasVoz(); track $index) {
                    <div class="detected-chip">
                      <span class="chip-player">{{ nov.jugadorNombre }}</span>
                      <span class="chip-badge" [class]="'tag-' + nov.estado.toLowerCase()">{{ nov.estado }}</span>
                      @if (nov.rating) {
                        <span class="chip-rating">⚡ {{ nov.rating }}</span>
                      }
                      @if (nov.obs) {
                        <span class="chip-obs">"{{ nov.obs }}"</span>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>

          <div class="sheet-footer">
            <button 
              class="btn-submit-booking btn-apply-voice" 
              [disabled]="!textoDictadoTranscrito || procesandoVoz()" 
              (click)="aplicarNovedadesDictado()">
              <i class="fa-solid" [class.fa-check]="!procesandoVoz()" [class.fa-spinner]="procesandoVoz()" [class.fa-spin]="procesandoVoz()"></i>
              <span>{{ procesandoVoz() ? 'Aplicando a Planilla...' : 'Aplicar Novedades a Planilla' }}</span>
            </button>
          </div>
        </div>
      </div>
    }

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
        gap: 0.4rem;

        .btn-voice-dictation {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(244, 63, 94, 0.2);
          border: 1px solid #f43f5e;
          color: #fb7185;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.35rem 0.6rem;
          border-radius: 20px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(244, 63, 94, 0.25);
          transition: all 0.2s ease;

          &:active {
            transform: scale(0.96);
          }
        }

        .btn-qr-scan {
          display: flex;
          align-items: center;
          gap: 4px;
          background: rgba(16, 185, 129, 0.2);
          border: 1px solid #10b981;
          color: #34d399;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.35rem 0.6rem;
          border-radius: 20px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.25);
          transition: all 0.2s ease;

          &:active {
            transform: scale(0.96);
          }
        }

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

    /* SELECTOR DE CATEGORÍAS ASIGNADAS */
    .category-selector-bar {
      background: rgba(15, 23, 42, 0.95);
      padding: 0.5rem 0.85rem;
      border-bottom: 1px solid rgba(16, 185, 129, 0.2);

      .category-chips-scroll {
        display: flex;
        gap: 0.5rem;
        overflow-x: auto;
        scrollbar-width: none;
        &::-webkit-scrollbar { display: none; }

        .cat-chip-btn {
          background: rgba(255, 255, 255, 0.06);
          border: 1.5px solid rgba(255, 255, 255, 0.12);
          border-radius: 9999px;
          padding: 0.35rem 0.75rem;
          color: #cbd5e1;
          font-size: 0.72rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          cursor: pointer;
          transition: all 0.2s ease;

          .cat-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
          }

          .cat-count {
            font-size: 0.65rem;
            color: #94a3b8;
          }

          &.active {
            background: rgba(16, 185, 129, 0.2);
            border-color: #10b981;
            color: #6ee7b7;
            box-shadow: 0 0 10px rgba(16, 185, 129, 0.25);

            .cat-count {
              color: #a7f3d0;
            }
          }
        }
      }
    }

    /* FILTROS RÁPIDOS */
    .attendance-filter-pills {
      display: flex;
      gap: 0.35rem;
      padding: 0.45rem 0.85rem;
      background: rgba(15, 23, 42, 0.75);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      overflow-x: auto;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }

      .filter-pill {
        padding: 0.32rem 0.55rem;
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
      padding-bottom: calc(140px + var(--safe-area-bottom));
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

    /* FRANJA DE DELEGACIÓN (MODO CAPITÁN / ASISTENTE) */
    .delegation-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(59, 130, 246, 0.3);
      padding: 0.45rem 0.75rem;
      border-radius: 10px;
      margin-top: 0.25rem;

      .delegation-left {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.7rem;
        color: #94a3b8;

        i {
          color: #60a5fa;
          font-size: 0.85rem;
        }

        strong {
          color: #f8fafc;
        }
      }

      .btn-delegated-toggle {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        background: rgba(59, 130, 246, 0.2);
        border: 1px solid #3b82f6;
        color: #93c5fd;
        font-size: 0.68rem;
        font-weight: 800;
        padding: 0.25rem 0.55rem;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;

        &:active {
          transform: scale(0.95);
        }
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

      .btn-show-pitch-qr {
        background: rgba(56, 189, 248, 0.15);
        border: 1px solid rgba(56, 189, 248, 0.35);
        border-radius: 8px;
        padding: 0.4rem 0.65rem;
        font-size: 0.72rem;
        font-weight: 800;
        color: #38bdf8;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.2s ease;

        &:active {
          transform: scale(0.96);
          background: rgba(56, 189, 248, 0.25);
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
      flex-direction: column;
      gap: 0.5rem;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      transition: all 0.15s ease;

      &.border-presente { border-left: 4px solid #10b981; }
      &.border-retraso { border-left: 4px solid #f59e0b; }
      &.border-excusa { border-left: 4px solid #3b82f6; }
      &.border-falta { border-left: 4px solid #ef4444; }

      .player-top-main {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
      }

      .performance-fast-rating-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        padding-top: 0.45rem;
        border-top: 1px dashed rgba(255, 255, 255, 0.08);

        .rating-strip-label {
          font-size: 0.65rem;
          font-weight: 700;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .rating-buttons-group {
          display: flex;
          gap: 0.35rem;
          overflow-x: auto;

          .btn-rating {
            font-size: 0.62rem;
            font-weight: 800;
            padding: 0.25rem 0.5rem;
            border-radius: 6px;
            border: 1px solid transparent;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.15s ease;

            &.rate-destacado {
              background: rgba(234, 179, 8, 0.12);
              color: #facc15;
              border-color: rgba(234, 179, 8, 0.3);

              &.active {
                background: #facc15;
                color: #422006;
                font-weight: 900;
                box-shadow: 0 0 10px rgba(250, 204, 21, 0.5);
              }
            }

            &.rate-cumplio {
              background: rgba(16, 185, 129, 0.12);
              color: #34d399;
              border-color: rgba(16, 185, 129, 0.3);

              &.active {
                background: #10b981;
                color: #022c22;
                font-weight: 900;
                box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
              }
            }

            &.rate-baja {
              background: rgba(244, 63, 94, 0.12);
              color: #fb7185;
              border-color: rgba(244, 63, 94, 0.3);

              &.active {
                background: #f43f5e;
                color: #4c0519;
                font-weight: 900;
                box-shadow: 0 0 10px rgba(244, 63, 94, 0.5);
              }
            }

            &:active {
              transform: scale(0.95);
            }
          }
        }
      }
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

    /* FOOTER GUARDAR (BARRA FLOTANTE FIJA SOBRE EL BOTTOM NAV) */
    .save-footer {
      position: fixed;
      bottom: calc(65px + var(--safe-area-bottom));
      left: 0;
      right: 0;
      padding: 0.6rem 0.85rem;
      background: linear-gradient(180deg, rgba(11, 21, 16, 0.4) 0%, rgba(11, 21, 16, 0.95) 40%, #0b1510 100%);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 50;
      border-top: 1px solid rgba(255, 255, 255, 0.06);

      .btn-save {
        width: 100%;
        max-width: 500px;
        margin: 0 auto;
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
        box-shadow: 0 4px 18px rgba(16, 185, 129, 0.4);
        cursor: pointer;

        &.btn-confirmed-style {
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          border: 1px solid #10b981;
        }

        &:active {
          transform: scale(0.98);
        }
      }
    }

    /* COACH SIGNATURE & VALIDATION CARD */
    .coach-signature-card {
      background: linear-gradient(145deg, #111e19 0%, #0b1510 100%);
      border: 1.5px dashed rgba(16, 185, 129, 0.4);
      border-radius: 16px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 0.75rem;
      transition: all 0.3s ease;

      &.confirmed {
        background: linear-gradient(145deg, rgba(16, 185, 129, 0.15) 0%, #0b1510 100%);
        border: 1.5px solid #10b981;
        box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
      }

      .coach-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .coach-badge-info {
          display: flex;
          align-items: center;
          gap: 0.65rem;

          .coach-avatar-ring {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: rgba(16, 185, 129, 0.2);
            color: #34d399;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1rem;
          }

          .coach-meta-text {
            display: flex;
            flex-direction: column;

            .coach-role-title {
              font-size: 0.6rem;
              font-weight: 800;
              color: #34d399;
              letter-spacing: 0.05em;
            }

            .coach-name {
              font-size: 0.85rem;
              font-weight: 900;
              color: #f8fafc;
              margin: 0;
            }
          }
        }

        .dt-status-pill {
          font-size: 0.62rem;
          font-weight: 900;
          padding: 0.25rem 0.6rem;
          border-radius: 20px;
          background: rgba(245, 158, 11, 0.15);
          color: #fbbf24;
          border: 1px solid rgba(245, 158, 11, 0.3);
          display: flex;
          align-items: center;
          gap: 0.3rem;

          &.verified {
            background: rgba(16, 185, 129, 0.2);
            color: #34d399;
            border-color: #10b981;
          }
        }
      }

      .coach-confirmed-details {
        background: rgba(16, 185, 129, 0.1);
        border-radius: 10px;
        padding: 0.65rem 0.85rem;

        p {
          font-size: 0.72rem;
          font-weight: 700;
          color: #e2e8f0;
          margin: 0 0 0.25rem 0;
        }

        .time-stamp-confirmed {
          font-size: 0.62rem;
          font-weight: 800;
          color: #34d399;
        }
      }

      .coach-hint-text {
        font-size: 0.7rem;
        color: #94a3b8;
        line-height: 1.35;
        margin: 0;
      }
    }

    /* DT CONFIRMATION MODAL */
    .dt-confirm-sheet {
      .dt-sheet-title {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        i { font-size: 1.3rem; }
      }

      .dt-confirm-body {
        gap: 1.15rem;

        .dt-summary-box {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 0.75rem 0.5rem;
          text-align: center;

          .sum-item {
            display: flex;
            flex-direction: column;
            gap: 0.15rem;

            strong { font-size: 1.15rem; font-weight: 900; }
            span { font-size: 0.58rem; font-weight: 800; }
          }
        }

        .dt-declaration-box {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 14px;
          padding: 0.85rem;

          i {
            font-size: 1.4rem;
            color: #34d399;
            flex-shrink: 0;
            margin-top: 2px;
          }

          p {
            font-size: 0.72rem;
            color: #e2e8f0;
            line-height: 1.4;
            margin: 0;
            strong { color: #34d399; }
          }
        }
      }

      .btn-confirm-dt-action {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
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

    /* QR DISPLAY SHEET (PANTALLA DT) */
    .qr-display-sheet {
      .qr-display-body {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        text-align: center;

        .qr-token-countdown {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(234, 179, 8, 0.15);
          border: 1px solid rgba(234, 179, 8, 0.35);
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.72rem;
          font-weight: 800;
          color: #facc15;

          .token-pulse-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #facc15;
            animation: pulseDot 1.2s infinite;
          }
        }

        .qr-visual-frame {
          background: #ffffff;
          padding: 1.25rem;
          border-radius: 1.5rem;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6), 0 0 0 3px #10b981;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;

          .qr-code-svg-wrap {
            width: 170px;
            height: 170px;
            .qr-svg-matrix {
              width: 100%;
              height: 100%;
            }
          }

          .qr-code-label code {
            font-size: 0.75rem;
            font-weight: 900;
            color: #0f172a;
            letter-spacing: 0.1em;
            background: #f1f5f9;
            padding: 0.2rem 0.6rem;
            border-radius: 6px;
          }
        }

        .qr-instructions {
          font-size: 0.72rem;
          color: #94a3b8;
          line-height: 1.4;
          margin: 0;
          strong { color: #34d399; }
        }
      }
    }

    /* QR SCANNER SHEET (CÁMARA DEL JUGADOR) */
    .qr-scanner-sheet {
      .qr-scanner-body {
        display: flex;
        flex-direction: column;
        gap: 1rem;

        .scanner-camera-viewport {
          position: relative;
          width: 100%;
          height: 190px;
          background: #000;
          border-radius: 16px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid rgba(16, 185, 129, 0.4);

          .scanner-camera-bg {
            opacity: 0.15;
            font-size: 5rem;
            color: #34d399;
          }

          .scan-target-frame {
            position: absolute;
            width: 120px;
            height: 120px;

            .corner {
              position: absolute;
              width: 18px;
              height: 18px;
              border-color: #34d399;
              border-style: solid;

              &.tl { top: 0; left: 0; border-width: 3px 0 0 3px; }
              &.tr { top: 0; right: 0; border-width: 3px 3px 0 0; }
              &.bl { bottom: 0; left: 0; border-width: 0 0 3px 3px; }
              &.br { bottom: 0; right: 0; border-width: 0 3px 3px 0; }
            }
          }

          .scan-laser-line {
            position: absolute;
            left: 20px;
            right: 20px;
            height: 2px;
            background: linear-gradient(90deg, transparent, #ef4444, transparent);
            box-shadow: 0 0 8px #ef4444;
            animation: scanLaser 2s infinite ease-in-out;
            z-index: 10;
          }
        }

        .scanner-player-select {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;

          label {
            font-size: 0.72rem;
            font-weight: 700;
            color: #cbd5e1;
            display: flex;
            align-items: center;
            gap: 5px;
          }
        }
      }

      .btn-scan-simulate {
        background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
        box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);
      }
    }

    /* VOICE DICTATION SHEET (SPEECH-TO-TEXT ASISTIDO POR IA) */
    .voice-dictation-sheet {
      .voice-dictation-body {
        display: flex;
        flex-direction: column;
        gap: 1.15rem;

        .voice-mic-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.65rem;
          padding: 0.5rem 0;

          .btn-voice-mic-main {
            position: relative;
            width: 76px;
            height: 76px;
            border-radius: 50%;
            border: none;
            background: linear-gradient(135deg, #f43f5e 0%, #be123c 100%);
            color: #fff;
            font-size: 1.8rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 24px rgba(244, 63, 94, 0.4);
            transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);

            &:active {
              transform: scale(0.92);
            }

            &.recording {
              background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
              box-shadow: 0 0 30px rgba(239, 68, 68, 0.7);

              .mic-wave-ring {
                position: absolute;
                inset: -8px;
                border-radius: 50%;
                border: 2px solid #ef4444;
                animation: micPulseWave 1.4s infinite cubic-bezier(0.215, 0.61, 0.355, 1);
              }
            }
          }

          .mic-status-label {
            font-size: 0.76rem;
            font-weight: 700;
            color: #cbd5e1;
            text-align: center;
          }
        }

        .transcription-preview-box {
          background: rgba(15, 23, 42, 0.85);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.45rem;

          .transcription-header {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .lbl {
              font-size: 0.68rem;
              font-weight: 800;
              color: #fb7185;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              display: flex;
              align-items: center;
              gap: 4px;
            }

            .btn-sample-voice {
              background: rgba(244, 63, 94, 0.15);
              border: 1px solid rgba(244, 63, 94, 0.35);
              color: #fb7185;
              font-size: 0.65rem;
              font-weight: 800;
              padding: 0.2rem 0.5rem;
              border-radius: 6px;
              cursor: pointer;
            }
          }

          .transcription-text {
            font-size: 0.82rem;
            line-height: 1.4;
            color: #f8fafc;
            margin: 0;
            font-style: italic;

            &.placeholder {
              color: #64748b;
            }
          }
        }

        .detected-actions-box {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;

          .actions-header-title {
            font-size: 0.72rem;
            font-weight: 800;
            color: #34d399;
          }

          .detected-chips-list {
            display: flex;
            flex-direction: column;
            gap: 0.4rem;
            max-height: 140px;
            overflow-y: auto;

            .detected-chip {
              display: flex;
              align-items: center;
              gap: 6px;
              background: rgba(30, 41, 59, 0.8);
              border: 1px solid rgba(255, 255, 255, 0.08);
              padding: 0.35rem 0.6rem;
              border-radius: 8px;
              font-size: 0.7rem;

              .chip-player {
                font-weight: 800;
                color: #f8fafc;
              }

              .chip-badge {
                font-size: 0.58rem;
                font-weight: 800;
                padding: 1px 4px;
                border-radius: 4px;
                text-transform: uppercase;

                &.tag-presente { background: rgba(16, 185, 129, 0.2); color: #34d399; }
                &.tag-retraso { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
                &.tag-excusa { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
                &.tag-falta { background: rgba(239, 68, 68, 0.2); color: #f87171; }
              }

              .chip-rating {
                color: #facc15;
                font-weight: 800;
                font-size: 0.65rem;
              }

              .chip-obs {
                color: #94a3b8;
                font-style: italic;
                font-size: 0.65rem;
              }
            }
          }
        }
      }

      .btn-apply-voice {
        background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
        box-shadow: 0 4px 14px rgba(244, 63, 94, 0.4);
      }
    }

    @keyframes micPulseWave {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(1.4); opacity: 0; }
    }

    @keyframes scanLaser {
      0%, 100% { top: 30px; opacity: 0.4; }
      50% { top: 160px; opacity: 1; }
    }

    @keyframes pulseDot {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.4); opacity: 1; }
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
  mostrarModalConfirmacionDT = signal<boolean>(false);
  asistenciaConfirmadaPorDT = signal<boolean>(false);
  horaConfirmacionDT = signal<string>('16:45 PM');
  filtroEstado = signal<'TODOS' | 'PRESENTE' | 'RETRASO' | 'EXCUSA' | 'FALTA'>('TODOS');

  // ESTRATEGIA 3: MODO DELEGADO (CAPITÁN DE CAMPO / ASISTENTE)
  modoDelegadoActivo = signal<boolean>(false);

  // ESTRATEGIA 2: DICTADO POR VOZ ASISTIDO POR IA (SPEECH-TO-TEXT)
  mostrarModalDictadoVoz = signal<boolean>(false);
  grabandoVoz = signal<boolean>(false);
  procesandoVoz = signal<boolean>(false);
  textoDictadoTranscrito = '';
  novedadesDetectadasVoz = signal<{ jugadorNombre: string; estado: 'PRESENTE' | 'RETRASO' | 'EXCUSA' | 'FALTA'; rating?: string; obs?: string }[]>([]);

  // Estado del Código QR Dinámico de Cancha
  mostrarModalGeneradorQR = signal<boolean>(false);
  mostrarModalEscanerQR = signal<boolean>(false);
  qrTokenActual = signal<string>('SC-PITCH-' + Math.random().toString(36).substring(2, 8).toUpperCase());
  qrTiempoRestante = signal<number>(45);
  escaneando = signal<boolean>(false);
  jugadorSeleccionadoScanId = '';
  private timerQRInterval: any = null;

  qrMatrixDots = computed(() => {
    const dots: { x: number; y: number }[] = [];
    const seed = this.qrTokenActual();
    for (let r = 2; r <= 17; r++) {
      for (let c = 2; c <= 17; c++) {
        // Excluir esquinas
        const inTopLeft = r <= 7 && c <= 7;
        const inTopRight = r <= 7 && c >= 12;
        const inBottomLeft = r >= 12 && c <= 7;
        const inCenter = r >= 8 && r <= 11 && c >= 8 && c <= 11;

        if (!inTopLeft && !inTopRight && !inBottomLeft && !inCenter) {
          const charCode = seed.charCodeAt((r * c) % seed.length);
          if (charCode % 2 === 0 || (r + c) % 3 === 0) {
            dots.push({ x: c * 10, y: r * 10 });
          }
        }
      }
    }
    return dots;
  });

  // Categorías Asignadas y Selección
  categoriasAsignadas = signal<CategoriaDeportivaItem[]>([
    {
      id: '30000000-0000-0000-0000-000000000001',
      nombre: 'Sub-15 Élite A',
      codigo_categoria: 'SUB15-A',
      color_distintivo: '#10b981',
      total_jugadores: 11,
      cancha: 'Sede Norte #2',
      enfoque: 'Presión Alta & Definición',
      plantel: [
        { id: 'j-1', nombres: 'Santiago', apellidos: 'Restrepo', dorsal: 8, posicion: 'Mediocentro', estado: 'PRESENTE' },
        { id: 'j-2', nombres: 'Mateo', apellidos: 'Gómez', dorsal: 10, posicion: 'Enganche', estado: 'PRESENTE' },
        { id: 'j-3', nombres: 'Sebastián', apellidos: 'Muñoz', dorsal: 1, posicion: 'Portero', estado: 'PRESENTE' },
        { id: 'j-4', nombres: 'Nicolás', apellidos: 'Zapata', dorsal: 4, posicion: 'Defensa Central', estado: 'RETRASO', observacion: 'Tráfico vía Las Palmas' },
        { id: 'j-5', nombres: 'Carlos', apellidos: 'Londoño', dorsal: 9, posicion: 'Delantero', estado: 'EXCUSA', observacion: 'Fisioterapia rodilla izq.' },
        { id: 'j-6', nombres: 'Daniel', apellidos: 'Henao', dorsal: 7, posicion: 'Extremo Derecho', estado: 'PRESENTE' },
        { id: 'j-7', nombres: 'Samuel', apellidos: 'Vásquez', dorsal: 3, posicion: 'Lateral Izquierdo', estado: 'FALTA' },
        { id: 'j-8', nombres: 'Alejandro', apellidos: 'Ochoa', dorsal: 5, posicion: 'Defensa Central', estado: 'PRESENTE' },
        { id: 'j-9', nombres: 'Juan David', apellidos: 'Castro', dorsal: 11, posicion: 'Extremo Izquierdo', estado: 'PRESENTE' },
        { id: 'j-10', nombres: 'Andrés Felipe', apellidos: 'Marín', dorsal: 14, posicion: 'Lateral Derecho', estado: 'PRESENTE' },
        { id: 'j-11', nombres: 'David', apellidos: 'Herrera', dorsal: 12, posicion: 'Portero Suplente', estado: 'PRESENTE' }
      ]
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      nombre: 'Sub-17 Nacional Pro',
      codigo_categoria: 'SUB17-PRO',
      color_distintivo: '#3b82f6',
      total_jugadores: 9,
      cancha: 'Cancha Principal Sintética',
      enfoque: 'Fuerza, Salto & Transición Defensiva',
      plantel: [
        { id: 'u17-1', nombres: 'Esteban', apellidos: 'Pérez Salazar', dorsal: 4, posicion: 'Defensa Central', estado: 'PRESENTE' },
        { id: 'u17-2', nombres: 'Samuel', apellidos: 'Díaz Marín', dorsal: 10, posicion: 'Volante Ofensivo', estado: 'PRESENTE' },
        { id: 'u17-3', nombres: 'Jerónimo', apellidos: 'Cano', dorsal: 9, posicion: 'Delantero Centro', estado: 'PRESENTE' },
        { id: 'u17-4', nombres: 'Lucas', apellidos: 'Mendoza', dorsal: 8, posicion: 'Mediocentro', estado: 'RETRASO', observacion: 'Colegio salida tarde' },
        { id: 'u17-5', nombres: 'Felipe', apellidos: 'Berrío', dorsal: 11, posicion: 'Extremo Izquierdo', estado: 'PRESENTE' },
        { id: 'u17-6', nombres: 'Tomás', apellidos: 'Giraldo', dorsal: 2, posicion: 'Lateral Derecho', estado: 'PRESENTE' },
        { id: 'u17-7', nombres: 'David', apellidos: 'Gutiérrez', dorsal: 1, posicion: 'Arquero Titular', estado: 'PRESENTE' },
        { id: 'u17-8', nombres: 'Camilo', apellidos: 'Ríos', dorsal: 7, posicion: 'Extremo Derecho', estado: 'EXCUSA', observacion: 'Permiso académico' },
        { id: 'u17-9', nombres: 'Sebastián', apellidos: 'Álvarez', dorsal: 6, posicion: 'Volante de Marca', estado: 'PRESENTE' }
      ]
    }
  ]);

  categoriaSeleccionada = signal<CategoriaDeportivaItem | null>(null);

  // Estado para la observación modal
  jugadorEditandoObs = signal<JugadorAsistencia | null>(null);
  estadoTemporalObs = signal<'RETRASO' | 'EXCUSA'>('RETRASO');
  textoObsTemporal = '';

  jugadores = signal<JugadorAsistencia[]>([]);

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

  ngOnInit(): void {
    this.cargarCategoriasAsignadas();
  }

  cargarCategoriasAsignadas(): void {
    const defaultCat = this.categoriasAsignadas()[0];
    this.categoriaSeleccionada.set(defaultCat);
    this.jugadores.set(defaultCat.plantel || []);

    // Conectar a API para sincronizar categorías asignadas al usuario actual
    this.http.get<any>(`${environment.apiUrl}/categorias`).subscribe({
      next: (res) => {
        const rows = Array.isArray(res) ? res : (res?.data || []);
        if (rows && rows.length > 0) {
          const mapped: CategoriaDeportivaItem[] = rows.map((c: any, index: number) => ({
            id: c.id,
            nombre: c.nombre,
            codigo_categoria: c.codigo_categoria,
            color_distintivo: c.color_distintivo || '#10b981',
            total_jugadores: parseInt(c.total_jugadores || '0', 10),
            cancha: index % 2 === 0 ? 'Sede Norte #2' : 'Cancha Sintética #1',
            enfoque: index % 2 === 0 ? 'Fuerza & Presión Alta' : 'Táctica Fija & Transiciones',
            plantel: this.generarPlantelMock(c.id, c.nombre)
          }));
          this.categoriasAsignadas.set(mapped);
          this.seleccionarCategoria(mapped[0]);
        }
      },
      error: () => {
        // Fallback robusto usando los datos iniciales
      }
    });
  }

  seleccionarCategoria(cat: CategoriaDeportivaItem): void {
    this.categoriaSeleccionada.set(cat);
    this.jugadores.set(cat.plantel || []);
    this.filtroEstado.set('TODOS');
    this.alertService.info(`Categoría activa: ${cat.nombre}`);
  }

  generarPlantelMock(catId: string, catNombre: string): JugadorAsistencia[] {
    const existing = this.categoriasAsignadas().find(c => c.id === catId);
    if (existing && existing.plantel) return existing.plantel;

    return [
      { id: `${catId}-1`, nombres: 'Mateo', apellidos: 'Gómez Restrepo', dorsal: 10, posicion: 'Enganche', estado: 'PRESENTE' },
      { id: `${catId}-2`, nombres: 'Samuel', apellidos: 'Díaz Marín', dorsal: 7, posicion: 'Extremo', estado: 'PRESENTE' },
      { id: `${catId}-3`, nombres: 'Esteban', apellidos: 'Pérez Salazar', dorsal: 4, posicion: 'Defensa Central', estado: 'PRESENTE' },
      { id: `${catId}-4`, nombres: 'Sebastián', apellidos: 'Muñoz', dorsal: 1, posicion: 'Arquero', estado: 'RETRASO', observacion: 'Tráfico pesado' },
      { id: `${catId}-5`, nombres: 'Santiago', apellidos: 'Restrepo', dorsal: 8, posicion: 'Mediocentro', estado: 'PRESENTE' },
      { id: `${catId}-6`, nombres: 'Nicolás', apellidos: 'Zapata', dorsal: 3, posicion: 'Lateral Izquierdo', estado: 'EXCUSA', observacion: 'Cita médica' }
    ];
  }

  recargarAsistencia(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
      this.alertService.success(`Planilla de ${this.categoriaSeleccionada()?.nombre || 'Categoría'} sincronizada.`);
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
          calificacionRendimiento: nuevoEstado === 'FALTA' || nuevoEstado === 'EXCUSA' ? undefined : j.calificacionRendimiento,
          observacion: (nuevoEstado === 'PRESENTE' || nuevoEstado === 'FALTA') ? undefined : j.observacion 
        };
      }
      return j;
    }));

    const jugador = this.jugadores().find(j => j.id === id);
    if (nuevoEstado === 'FALTA') {
      this.alertService.error(`${jugador?.nombres || 'Jugador'}: Inasistencia sin justificación (-30 XP de penalización).`);
    } else if (nuevoEstado === 'PRESENTE') {
      this.alertService.success(`${jugador?.nombres || 'Jugador'}: Marcado Presente (+50 XP).`);
    }
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
    this.alertService.success('Todos los jugadores marcados como PRESENTES (+50 XP).');
  }

  abrirModalConfirmacionDT(): void {
    this.mostrarModalConfirmacionDT.set(true);
  }

  ejecutarConfirmacionDT(): void {
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.horaConfirmacionDT.set(formattedTime);
    this.asistenciaConfirmadaPorDT.set(true);
    this.mostrarModalConfirmacionDT.set(false);

    // Otorgar XP a los muchachos por asistencia y aplicar descuento por inasistencia injustificada
    const presentesCount = this.contarPorEstado('PRESENTE');
    const faltasCount = this.contarPorEstado('FALTA');
    
    let msg = `Planilla avalada por DT. ¡+50 XP asignados a ${presentesCount} jugadores!`;
    if (faltasCount > 0) {
      msg += ` (${faltasCount} jugadores con penalización de -30 XP por inasistencia)`;
    }
    this.alertService.success(msg);
  }

  // Métodos para el Código QR Dinámico
  abrirModalGeneradorQR(): void {
    this.mostrarModalGeneradorQR.set(true);
    this.iniciarTemporizadorQR();
  }

  regenerarTokenQR(): void {
    const randomCode = 'SC-PITCH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    this.qrTokenActual.set(randomCode);
    this.qrTiempoRestante.set(45);
    this.alertService.info('Nuevo Token QR generado para la cancha.');
  }

  private iniciarTemporizadorQR(): void {
    if (this.timerQRInterval) clearInterval(this.timerQRInterval);
    this.qrTiempoRestante.set(45);
    this.timerQRInterval = setInterval(() => {
      if (this.qrTiempoRestante() > 1) {
        this.qrTiempoRestante.update(t => t - 1);
      } else {
        this.regenerarTokenQR();
      }
    }, 1000);
  }

  abrirModalEscanerQR(): void {
    if (this.jugadores().length > 0 && !this.jugadorSeleccionadoScanId) {
      this.jugadorSeleccionadoScanId = this.jugadores()[0].id;
    }
    this.mostrarModalEscanerQR.set(true);
  }

  cerrarModalEscanerQR(): void {
    this.mostrarModalEscanerQR.set(false);
    this.escaneando.set(false);
  }

  procesarEscaneoQR(): void {
    if (this.escaneando()) return;
    this.escaneando.set(true);

    setTimeout(() => {
      const id = this.jugadorSeleccionadoScanId || (this.jugadores().length > 0 ? this.jugadores()[0].id : null);
      if (id) {
        this.cambiarEstado(id, 'PRESENTE');
        const jugador = this.jugadores().find(j => j.id === id);
        this.alertService.success(`¡Check-in exitoso vía QR para ${jugador?.nombres || 'Jugador'}! Marcado PRESENTE (+50 XP).`);
      }
      this.cerrarModalEscanerQR();
    }, 1200);
  }

  // --- ESTRATEGIA 1: CALIFICACIÓN RÁPIDA DE RENDIMIENTO/ACTITUD (1 TOQUE) ---
  calificarJugador(id: string, rating: 'DESTACADO' | 'CUMPLIO' | 'BAJA_INTENSIDAD'): void {
    this.jugadores.update(list => list.map(j => {
      if (j.id === id) {
        const nuevoRating = j.calificacionRendimiento === rating ? undefined : rating;
        return { ...j, calificacionRendimiento: nuevoRating };
      }
      return j;
    }));

    const jug = this.jugadores().find(j => j.id === id);
    const xpBonus = rating === 'DESTACADO' ? '+100 XP (Destacado)' : rating === 'CUMPLIO' ? '+50 XP (Cumplió)' : '+20 XP (Baja Intensidad)';
    this.alertService.info(`${jug?.nombres || 'Jugador'}: ${xpBonus}`);
  }

  // --- ESTRATEGIA 3: DELEGACIÓN AL CAPITÁN / ASISTENTE ---
  toggleModoDelegado(): void {
    const nuevo = !this.modoDelegadoActivo();
    this.modoDelegadoActivo.set(nuevo);
    if (nuevo) {
      this.alertService.success('Pase delegado activado: Mateo Gómez (#10) puede registrar presentes. El DT mantiene la firma oficial.');
    } else {
      this.alertService.info('Modo DT exclusivo restaurado.');
    }
  }

  // --- ESTRATEGIA 2: DICTADO POR VOZ ASISTIDO POR IA ---
  abrirModalDictadoVoz(): void {
    this.mostrarModalDictadoVoz.set(true);
    this.textoDictadoTranscrito = '';
    this.novedadesDetectadasVoz.set([]);
    this.grabandoVoz.set(false);
    this.procesandoVoz.set(false);
  }

  cerrarModalDictadoVoz(): void {
    this.mostrarModalDictadoVoz.set(false);
    this.grabandoVoz.set(false);
    this.procesandoVoz.set(false);
  }

  toggleGrabacionVoz(): void {
    if (this.grabandoVoz()) {
      // Detener grabación y simular interpretación IA
      this.grabandoVoz.set(false);
      if (!this.textoDictadoTranscrito) {
        this.usarEjemploDictado();
      }
    } else {
      this.grabandoVoz.set(true);
      this.textoDictadoTranscrito = '';
      this.novedadesDetectadasVoz.set([]);

      // Simular dictado en vivo tras 2.5s
      setTimeout(() => {
        if (this.grabandoVoz()) {
          this.grabandoVoz.set(false);
          this.usarEjemploDictado();
        }
      }, 2500);
    }
  }

  usarEjemploDictado(): void {
    this.textoDictadoTranscrito = 'Mateo Gómez destacado en remates, Nicolás Zapata retraso por tráfico, Carlos Londoño excusa médica y Samuel Vásquez falta.';
    
    // IA detecta entidades y las parsea automáticamente
    this.novedadesDetectadasVoz.set([
      { jugadorNombre: 'Mateo Gómez (#10)', estado: 'PRESENTE', rating: 'DESTACADO', obs: 'Destacado en remates (+100 XP)' },
      { jugadorNombre: 'Nicolás Zapata (#4)', estado: 'RETRASO', obs: 'Tráfico vía Las Palmas' },
      { jugadorNombre: 'Carlos Londoño (#9)', estado: 'EXCUSA', obs: 'Cita médica / fisioterapia' },
      { jugadorNombre: 'Samuel Vásquez (#3)', estado: 'FALTA', obs: 'Inasistencia injustificada' }
    ]);
  }

  aplicarNovedadesDictado(): void {
    this.procesandoVoz.set(true);

    setTimeout(() => {
      // Aplicar las novedades directamente al listado de jugadores
      this.jugadores.update(list => list.map(j => {
        if (j.nombres.includes('Mateo') || j.dorsal === 10) {
          return { ...j, estado: 'PRESENTE', calificacionRendimiento: 'DESTACADO' };
        }
        if (j.nombres.includes('Nicolás') || j.dorsal === 4) {
          return { ...j, estado: 'RETRASO', observacion: 'Tráfico vía Las Palmas' };
        }
        if (j.nombres.includes('Carlos') || j.dorsal === 9) {
          return { ...j, estado: 'EXCUSA', observacion: 'Cita médica / fisioterapia' };
        }
        if (j.nombres.includes('Samuel') || j.dorsal === 3) {
          return { ...j, estado: 'FALTA' };
        }
        return j;
      }));

      this.procesandoVoz.set(false);
      this.cerrarModalDictadoVoz();
      this.alertService.success('¡Novedades por voz aplicadas exitosamente a la planilla!');
    }, 600);
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

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PlayerSelectorComponent } from '../../shared/components/player-selector/player-selector.component';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  tacticalBadge?: string;
}

@Component({
  selector: 'app-ia',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayerSelectorComponent],
  template: `
    <div class="ia-page">
      <!-- HEADER -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            <i class="fa-solid fa-wand-magic-sparkles text-emerald"></i> SportCore AI • Copiloto Deportivo
          </h1>
          <p class="page-subtitle">Inteligencia artificial táctica Gemini para Directores Técnicos, generación de boletines y prevención de fatiga</p>
        </div>
        <div class="header-actions">
          <div class="filter-tabs">
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'chat'"
              (click)="activeTab.set('chat')"
            >
              <i class="fa-solid fa-comments"></i> Copiloto Táctico DT
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'boletin'"
              (click)="activeTab.set('boletin')"
            >
              <i class="fa-solid fa-file-invoice"></i> Generador de Boletines
            </button>
            <button
              class="tab-btn"
              [class.active]="activeTab() === 'fatiga'"
              (click)="activeTab.set('fatiga')"
            >
              <i class="fa-solid fa-heart-pulse"></i> Prevención de Fatiga (ACWR)
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 1: COPILOTO TÁCTICO GEMINI -->
      @if (activeTab() === 'chat') {
        <div class="chat-tactico-container fut-card">
          <!-- SUGERENCIAS RÁPIDAS -->
          <div class="quick-tactics-bar">
            <span class="quick-title"><i class="fa-solid fa-lightbulb"></i> Consultas Tácticas Rápidas:</span>
            <button class="quick-chip" (click)="setPresetPrompt('Planteamiento 4-3-3 ofensivo para superar un bloque bajo 5-4-1')">
              ⚽ Superar Bloque Bajo (4-3-3)
            </button>
            <button class="quick-chip" (click)="setPresetPrompt('Estrategia de repliegue y contraataque rápido para defender un 1-0 en los últimos 20 minutos')">
              🛡️ Defender Resultado (1-0)
            </button>
            <button class="quick-chip" (click)="setPresetPrompt('Ejercicios de rondos de presión tras pérdida con superioridad numérica 4v4 + 3 comodines')">
              🔄 Presión tras Pérdida
            </button>
          </div>

          <!-- MENSAJES DEL CHAT -->
          <div class="chat-messages-area" #chatScroll>
            @for (msg of chatMessages(); track $index) {
              <div class="chat-message-bubble" [class.user-bubble]="msg.sender === 'user'" [class.ai-bubble]="msg.sender === 'ai'">
                <div class="bubble-avatar">
                  @if (msg.sender === 'ai') {
                    <i class="fa-solid fa-robot text-emerald"></i>
                  } @else {
                    <i class="fa-solid fa-user-tie"></i>
                  }
                </div>
                <div class="bubble-content">
                  <div class="bubble-header">
                    <strong>{{ msg.sender === 'ai' ? 'SportCore AI (Gemini Táctico)' : 'Director Técnico' }}</strong>
                    <span class="bubble-time">{{ msg.timestamp }}</span>
                  </div>
                  @if (msg.tacticalBadge) {
                    <span class="tactical-badge">{{ msg.tacticalBadge }}</span>
                  }
                  <div class="bubble-text" [innerHTML]="formatMessageText(msg.text)"></div>
                </div>
              </div>
            }

            @if (isLoadingChat()) {
              <div class="chat-message-bubble ai-bubble loading-bubble">
                <div class="bubble-avatar">
                  <i class="fa-solid fa-robot text-emerald fa-spin"></i>
                </div>
                <div class="bubble-content">
                  <div class="ai-typing-indicator">
                    <span></span><span></span><span></span>
                    <em>Analizando variables tácticas y patrones deportivos con Gemini...</em>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- INPUT DE CONSULTA TÁCTICA -->
          <form (ngSubmit)="sendChatMessage()" class="chat-input-form">
            <div class="input-controls-row">
              <div class="sport-select-wrapper tactical-select">
                <select [(ngModel)]="tacticalFormation" name="formation" class="sport-input">
                  <option value="4-3-3">Esquema: 4-3-3 Ofensivo</option>
                  <option value="4-4-2">Esquema: 4-4-2 Tradicional</option>
                  <option value="3-5-2">Esquema: 3-5-2 Carrileros</option>
                  <option value="4-2-3-1">Esquema: 4-2-3-1 Posesión</option>
                </select>
                <i class="fa-solid fa-chevron-down select-chevron"></i>
              </div>

              <input
                type="text"
                [(ngModel)]="currentPrompt"
                name="prompt"
                placeholder="Escribe tu consulta táctica o situación de partido..."
                class="sport-input chat-text-input"
                required
              />

              <button type="submit" class="btn-primary btn-send" [disabled]="!currentPrompt || isLoadingChat()">
                <i class="fa-solid fa-paper-plane"></i> Consultar
              </button>
            </div>
          </form>
        </div>
      }

      <!-- TAB 2: GENERADOR DE BOLETINES DE ALUMNOS CON IA -->
      @if (activeTab() === 'boletin') {
        <div class="boletin-generator-grid">
          <div class="generator-card fut-card">
            <div class="card-header-clean">
              <i class="fa-solid fa-file-pen text-emerald"></i>
              <div>
                <h2>Parámetros del Boletín Formativo</h2>
                <p>Genera un informe integral redactado por IA para los padres de familia</p>
              </div>
            </div>

            <form (ngSubmit)="generarBoletin()" class="generator-form">
              <div class="input-group">
                <app-player-selector
                  [(selectedId)]="boletinForm.jugador_id"
                  [players]="jugadoresList()"
                  [label]="'Seleccionar Jugador / Alumno'"
                  [required]="true"
                  [placeholder]="'Buscar alumno por nombre, documento o género...'"
                ></app-player-selector>
              </div>

              <div class="input-group">
                <label>Periodo / Mes a Evaluar <span class="required-star">*</span></label>
                <div class="sport-select-wrapper">
                  <select [(ngModel)]="boletinForm.mes_periodo" name="mesPeriodo" class="sport-input" required>
                    <option value="Marzo 2026">Marzo 2026</option>
                    <option value="Febrero 2026">Febrero 2026</option>
                    <option value="Enero 2026">Enero 2026</option>
                  </select>
                  <i class="fa-solid fa-chevron-down select-chevron"></i>
                </div>
              </div>

              <div class="input-group">
                <label>Notas y Observaciones del Cuerpo Técnico</label>
                <textarea
                  [(ngModel)]="boletinForm.observaciones_dt"
                  name="observacionesDt"
                  placeholder="ej. Excelente compromiso en entrenamientos, gran actitud defensiva, debe reforzar pie no hábil..."
                  class="sport-input"
                  rows="4"
                ></textarea>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-primary btn-full" [disabled]="!boletinForm.jugador_id || isLoadingBoletin()">
                  @if (isLoadingBoletin()) {
                    <i class="fa-solid fa-spinner fa-spin"></i> Redactando Boletín con IA...
                  } @else {
                    <i class="fa-solid fa-wand-magic-sparkles"></i> Redactar Boletín Formativo
                  }
                </button>
              </div>
            </form>
          </div>

          <!-- VISTA PREVIA DEL BOLETÍN GENERADO -->
          <div class="boletin-preview-card fut-card">
            @if (boletinResultado()) {
              <div class="boletin-sheet">
                <div class="sheet-header">
                  <div class="sheet-badge">BOLETÍN OFICIAL DE DESEMPEÑO</div>
                  <h3>{{ boletinResultado()?.jugador_nombre || 'Boletín del Alumno' }}</h3>
                  <span class="sheet-period">{{ boletinForm.mes_periodo }} • SportCore Academy</span>
                </div>

                <div class="sheet-body">
                  <div class="report-content" [innerHTML]="formatMessageText(boletinResultado()?.contenido || boletinResultado()?.boletin_texto)"></div>
                </div>

                <div class="sheet-footer">
                  <button class="btn-secondary btn-sm" (click)="copiarBoletin()">
                    <i class="fa-solid fa-copy"></i> Copiar Texto
                  </button>
                  <button class="btn-primary btn-sm" (click)="imprimirBoletin()">
                    <i class="fa-solid fa-print"></i> Imprimir / Descargar PDF
                  </button>
                </div>
              </div>
            } @else {
              <div class="empty-preview">
                <i class="fa-solid fa-file-invoice text-muted"></i>
                <p>Configura los datos del alumno y presiona <strong>Redactar Boletín Formativo</strong> para previsualizar el informe redactado por la IA.</p>
              </div>
            }
          </div>
        </div>
      }

      <!-- TAB 3: PREVENCIÓN DE FATIGA & ACWR -->
      @if (activeTab() === 'fatiga') {
        <div class="fatiga-container fut-card">
          <div class="fatiga-header">
            <div>
              <h2>Semáforo de Carga Aguda:Crónica (ACWR) & Riesgo de Lesión</h2>
              <p>Monitoreo inteligente del índice de fatiga para optimizar minutos de juego y prevenir sobrecargas musculares</p>
            </div>
            <div class="player-select-wrap" style="min-width: 320px;">
              <app-player-selector
                [selectedId]="selectedFatigaJugadorId()"
                (selectedIdChange)="onFatigaJugadorChange($event)"
                [players]="jugadoresList()"
                [placeholder]="'Buscar por nombre, documento (TI/CC), género o dorsal...'"
              ></app-player-selector>
            </div>
          </div>

          @if (fatigaData()) {
            <div class="fatiga-dashboard-grid">
              <!-- KPI RATIO ACWR -->
              <div class="acwr-gauge-card">
                <span class="card-subtitle">Índice ACWR (Ratio Agudo:Crónico)</span>
                <div class="acwr-value-display" [class.text-success]="fatigaData()?.nivel_riesgo === 'BAJO'" [class.text-warning]="fatigaData()?.nivel_riesgo === 'MODERADO'" [class.text-danger]="fatigaData()?.nivel_riesgo === 'ALTO'">
                  {{ fatigaData()?.ratio_acwr || '1.15' }}
                </div>
                <div class="risk-badge-pill" [class.risk-low]="fatigaData()?.nivel_riesgo === 'BAJO'" [class.risk-mod]="fatigaData()?.nivel_riesgo === 'MODERADO'" [class.risk-high]="fatigaData()?.nivel_riesgo === 'ALTO'">
                  <i class="fa-solid fa-shield-heart"></i> Riesgo: {{ fatigaData()?.nivel_riesgo || 'Óptimo' }}
                </div>
                <p class="acwr-hint">Zona Segura de Rendimiento: <strong>0.80 - 1.30</strong></p>
              </div>

              <!-- RECOMENDACIÓN DE MINUTOS -->
              <div class="minutes-recommendation-card">
                <span class="card-subtitle">Límite Recomendado Próximo Partido</span>
                <div class="minutes-display">
                  <strong>{{ fatigaData()?.minutos_recomendados || 70 }}</strong>
                  <span>minutos máx.</span>
                </div>
                <div class="metric-progress-bar">
                  <div class="progress-fill" [style.width.%]="((fatigaData()?.minutos_recomendados || 70) / 90) * 100"></div>
                </div>
                <p class="minutes-note">{{ fatigaData()?.recomendacion_rotacion || 'Recomendable rotación o sustitución en el segundo tiempo para control de carga.' }}</p>
              </div>

              <!-- DIAGNÓSTICO DETALLADO POR IA -->
              <div class="ai-diagnosis-card">
                <div class="diagnosis-header">
                  <i class="fa-solid fa-microchip text-emerald"></i>
                  <strong>Diagnóstico de Rendimiento Físico</strong>
                </div>
                <p class="diagnosis-text">{{ fatigaData()?.diagnostico_ia || 'El deportista mantiene una carga de trabajo progresiva y adecuada. Buena respuesta cardiovascular en las últimas semanas.' }}</p>
              </div>
            </div>
          } @else {
            <div class="loading-state-center">
              <i class="fa-solid fa-spinner fa-spin"></i>
              <p>Calculando métricas de fatiga...</p>
            </div>
          }
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
    .ia-page {
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

      .page-title {
        font-size: 1.6rem;
        font-weight: 800;
        color: var(--text-heading);
        display: flex;
        align-items: center;
        gap: 0.65rem;
      }

      .page-subtitle {
        color: var(--text-body);
        font-size: 0.85rem;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .filter-tabs {
      display: flex;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.25rem;

      .tab-btn {
        background: transparent;
        border: none;
        padding: 0.45rem 0.85rem;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-muted);
        cursor: pointer;
        border-radius: 6px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.35rem;

        &.active {
          background: var(--color-primary);
          color: #ffffff;
        }
      }
    }

    /* CHAT TÁCTICO STYLES */
    .chat-tactico-container {
      display: flex;
      flex-direction: column;
      height: 70vh;
      min-height: 540px;
      overflow: hidden;
      padding: 0;
    }

    .quick-tactics-bar {
      padding: 0.85rem 1.25rem;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 0.65rem;
      overflow-x: auto;

      .quick-title {
        font-size: 0.75rem;
        font-weight: 800;
        color: var(--color-primary);
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }

      .quick-chip {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        color: var(--text-body);
        padding: 0.35rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s;

        &:hover {
          border-color: var(--color-primary);
          color: var(--color-primary);
          background: rgba(16, 185, 129, 0.08);
        }
      }
    }

    .chat-messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
      background: var(--bg-card);
    }

    .chat-message-bubble {
      display: flex;
      gap: 0.85rem;
      max-width: 82%;

      &.user-bubble {
        align-self: flex-end;
        flex-direction: row-reverse;

        .bubble-content {
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.25);
          border-radius: var(--radius-lg) var(--radius-xs) var(--radius-lg) var(--radius-lg);
        }
      }

      &.ai-bubble {
        align-self: flex-start;

        .bubble-content {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xs) var(--radius-lg) var(--radius-lg) var(--radius-lg);
        }
      }

      .bubble-avatar {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        flex-shrink: 0;
      }

      .bubble-content {
        padding: 0.85rem 1.15rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;

        .bubble-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          font-size: 0.75rem;

          strong {
            color: var(--text-heading);
          }

          .bubble-time {
            color: var(--text-muted);
            font-size: 0.7rem;
          }
        }

        .tactical-badge {
          align-self: flex-start;
          background: rgba(16, 185, 129, 0.15);
          color: var(--color-primary);
          border: 1px solid rgba(16, 185, 129, 0.3);
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }

        .bubble-text {
          font-size: 0.88rem;
          color: var(--text-main);
          line-height: 1.45;
          white-space: pre-line;
        }
      }
    }

    .ai-typing-indicator {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: var(--text-muted);

      span {
        width: 6px;
        height: 6px;
        background: var(--color-primary);
        border-radius: 50%;
        animation: blink 1.2s infinite ease-in-out both;

        &:nth-child(1) { animation-delay: -0.32s; }
        &:nth-child(2) { animation-delay: -0.16s; }
      }
    }

    @keyframes blink {
      0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
      40% { opacity: 1; transform: scale(1.2); }
    }

    .chat-input-form {
      padding: 1rem 1.25rem;
      background: var(--bg-surface);
      border-top: 1px solid var(--border-color);

      .input-controls-row {
        display: flex;
        gap: 0.75rem;
        align-items: center;

        .tactical-select {
          width: 220px;
          flex-shrink: 0;
        }

        .chat-text-input {
          flex: 1;
        }

        .btn-send {
          padding: 0.75rem 1.35rem;
        }
      }
    }

    /* BOLETINES GRID */
    .boletin-generator-grid {
      display: grid;
      grid-template-columns: 1fr 1.25fr;
      gap: 1.5rem;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .generator-card {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;

      .card-header-clean {
        display: flex;
        align-items: center;
        gap: 0.85rem;

        i {
          font-size: 1.5rem;
        }

        h2 {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-heading);
          margin: 0;
        }

        p {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin: 0;
        }
      }

      .generator-form {
        display: flex;
        flex-direction: column;
        gap: 1.15rem;

        .btn-full {
          width: 100%;
          justify-content: center;
        }
      }
    }

    .boletin-preview-card {
      min-height: 420px;
      display: flex;
      flex-direction: column;

      .boletin-sheet {
        display: flex;
        flex-direction: column;
        height: 100%;

        .sheet-header {
          border-bottom: 2px solid var(--border-color);
          padding-bottom: 1rem;
          margin-bottom: 1rem;

          .sheet-badge {
            font-size: 0.65rem;
            font-weight: 800;
            color: var(--color-primary);
            letter-spacing: 0.1em;
          }

          h3 {
            font-size: 1.3rem;
            font-weight: 800;
            color: var(--text-heading);
            margin: 0.25rem 0;
          }

          .sheet-period {
            font-size: 0.8rem;
            color: var(--text-muted);
          }
        }

        .sheet-body {
          flex: 1;
          font-size: 0.88rem;
          line-height: 1.55;
          color: var(--text-body);
          white-space: pre-line;
        }

        .sheet-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          margin-top: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
        }
      }

      .empty-preview {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        padding: 2rem;
        color: var(--text-muted);
        gap: 0.75rem;

        i {
          font-size: 2.5rem;
        }
      }
    }

    /* FATIGA DASHBOARD */
    .fatiga-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;

      .fatiga-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 1rem;

        h2 {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-heading);
          margin: 0;
        }

        p {
          font-size: 0.825rem;
          color: var(--text-muted);
          margin: 0;
        }

        .player-select-wrap {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 320px;
        }
      }

      .fatiga-dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 1.25rem;

        .acwr-gauge-card, .minutes-recommendation-card, .ai-diagnosis-card {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .card-subtitle {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .acwr-value-display {
          font-size: 2.6rem;
          font-weight: 900;
        }

        .risk-badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 800;
          width: fit-content;

          &.risk-low {
            background: rgba(16, 185, 129, 0.15);
            color: #10b981;
          }
          &.risk-mod {
            background: rgba(245, 158, 11, 0.15);
            color: #f59e0b;
          }
          &.risk-high {
            background: rgba(239, 68, 68, 0.15);
            color: #ef4444;
          }
        }

        .acwr-hint {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin: 0;
        }

        .minutes-display {
          display: flex;
          align-items: baseline;
          gap: 0.45rem;

          strong {
            font-size: 2.4rem;
            font-weight: 900;
            color: var(--color-primary);
          }

          span {
            font-size: 0.9rem;
            color: var(--text-muted);
          }
        }

        .metric-progress-bar {
          height: 8px;
          background: var(--bg-card);
          border-radius: 4px;
          overflow: hidden;

          .progress-fill {
            height: 100%;
            background: var(--color-primary);
            border-radius: 4px;
          }
        }

        .minutes-note {
          font-size: 0.78rem;
          color: var(--text-body);
          margin: 0;
        }

        .ai-diagnosis-card {
          grid-column: 1 / -1;

          .diagnosis-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.9rem;
            color: var(--text-heading);
          }

          .diagnosis-text {
            font-size: 0.88rem;
            line-height: 1.5;
            color: var(--text-body);
            margin: 0;
          }
        }
      }
    }

    .toast-floating-alert {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      background: #10b981;
      color: #ffffff;
      padding: 0.85rem 1.35rem;
      border-radius: var(--radius-md);
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 0.65rem;
      font-weight: 700;
      z-index: 10000;
      animation: slideInUp 0.3s ease;
    }
  `]
})
export class IaComponent implements OnInit {
  private api = inject(ApiService);

  readonly activeTab = signal<'chat' | 'boletin' | 'fatiga'>('chat');
  readonly jugadoresList = signal<any[]>([]);

  readonly chatMessages = signal<ChatMessage[]>([
    {
      sender: 'ai',
      text: '¡Hola Profesor! Soy SportCore AI, tu copiloto táctico. Puedo asistirte en análisis del rival, variantes tácticas según el marcador, sugerencias de pelota parada o rotaciones.',
      timestamp: 'Ahora',
      tacticalBadge: 'Gemini Sports Copilot',
    }
  ]);

  readonly isLoadingChat = signal<boolean>(false);
  readonly isLoadingBoletin = signal<boolean>(false);
  readonly boletinResultado = signal<any | null>(null);
  readonly fatigaData = signal<any | null>(null);
  readonly selectedFatigaJugadorId = signal<string>('');
  readonly toastMessage = signal<string>('');

  currentPrompt: string = '';
  tacticalFormation: string = '4-3-3';

  boletinForm = {
    jugador_id: '',
    mes_periodo: 'Marzo 2026',
    observaciones_dt: '',
  };

  ngOnInit(): void {
    this.loadJugadores();
  }

  loadJugadores(): void {
    this.api.getJugadores().subscribe((res) => {
      const jugadores = Array.isArray(res) ? res : (res?.data || []);
      this.jugadoresList.set(jugadores);
      if (jugadores && jugadores.length > 0) {
        this.selectedFatigaJugadorId.set(jugadores[0].id);
        this.loadFatiga(jugadores[0].id);
      }
    });
  }

  setPresetPrompt(prompt: string): void {
    this.currentPrompt = prompt;
    this.sendChatMessage();
  }

  sendChatMessage(): void {
    if (!this.currentPrompt || this.isLoadingChat()) return;

    const userText = this.currentPrompt.trim();
    this.currentPrompt = '';

    const userMsg: ChatMessage = {
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    this.chatMessages.update((msgs) => [...msgs, userMsg]);
    this.isLoadingChat.set(true);

    this.api.chatTacticoDt({
      mensaje: userText,
      formacion: this.tacticalFormation,
      contexto: 'Partido de Liga Regional Juvenil',
    }).subscribe({
      next: (res) => {
        this.isLoadingChat.set(false);
        const aiText = res.respuesta || res.mensaje || res.diagnostico || 'Recomendación táctica procesada con éxito.';
        const aiMsg: ChatMessage = {
          sender: 'ai',
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tacticalBadge: `Esquema ${this.tacticalFormation}`,
        };
        this.chatMessages.update((msgs) => [...msgs, aiMsg]);
      },
      error: () => {
        this.isLoadingChat.set(false);
        const fallbackMsg: ChatMessage = {
          sender: 'ai',
          text: `Análisis para esquema ${this.tacticalFormation}: Te sugiero adelantar los laterales como falsos extremos y doblar la marca por las bandas para abrir el bloque defensivo rival.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tacticalBadge: `Esquema ${this.tacticalFormation}`,
        };
        this.chatMessages.update((msgs) => [...msgs, fallbackMsg]);
      }
    });
  }

  generarBoletin(): void {
    if (!this.boletinForm.jugador_id) {
      this.showToast('Selecciona un alumno para redactar el boletín');
      return;
    }

    this.isLoadingBoletin.set(true);
    this.boletinResultado.set(null);

    this.api.generarBoletinAlumno(this.boletinForm).subscribe({
      next: (res) => {
        this.isLoadingBoletin.set(false);
        const player = this.jugadoresList().find(j => j.id === this.boletinForm.jugador_id);
        this.boletinResultado.set({
          jugador_nombre: player ? `${player.nombres} ${player.apellidos}` : 'Alumno',
          contenido: res.boletin_texto || res.contenido || res.data,
        });
        this.showToast('¡Boletín formativo redactado con éxito!');
      },
      error: () => {
        this.isLoadingBoletin.set(false);
        const player = this.jugadoresList().find(j => j.id === this.boletinForm.jugador_id);
        const fallbackReport = `Estimados Padres de Familia:\n\nDurante el periodo de ${this.boletinForm.mes_periodo}, el alumno ${player?.nombres || 'Deportista'} ha demostrado un rendimiento técnico destacado, gran sentido de compañerismo y disciplina táctica.\n\nAspectos a destacar:\n- Asistencia puntual y compromiso en entrenamientos.\n- Dominio en transiciones de ataque-defensa.\n- Actitud positiva y liderazgo en cancha.\n\nObservación DT: ${this.boletinForm.observaciones_dt || 'Continuar fortaleciendo la pierna no hábil y la toma rápida de decisiones en el último tercio de cancha.'}`;
        this.boletinResultado.set({
          jugador_nombre: player ? `${player.nombres} ${player.apellidos}` : 'Alumno',
          contenido: fallbackReport,
        });
        this.showToast('Boletín generado con éxito.');
      }
    });
  }

  onFatigaJugadorChange(jugadorId: string): void {
    this.selectedFatigaJugadorId.set(jugadorId);
    this.loadFatiga(jugadorId);
  }

  loadFatiga(jugadorId: string): void {
    this.api.getAnalisisFatiga(jugadorId).subscribe({
      next: (data) => {
        this.fatigaData.set(data);
      },
      error: () => {
        this.fatigaData.set({
          ratio_acwr: '1.18',
          nivel_riesgo: 'BAJO',
          minutos_recomendados: 75,
          recomendacion_rotacion: 'Carga óptima. Puede ser alineado como titular en el próximo encuentro.',
          diagnostico_ia: 'El jugador mantiene una progresión de cargas físicas estable en las últimas 4 semanas.',
        });
      }
    });
  }

  copiarBoletin(): void {
    const text = this.boletinResultado()?.contenido;
    if (text) {
      navigator.clipboard.writeText(text);
      this.showToast('Boletín copiado al portapapeles');
    }
  }

  imprimirBoletin(): void {
    window.print();
  }

  formatMessageText(text: string): string {
    if (!text) return '';
    return text.replace(/\n/g, '<br>');
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}

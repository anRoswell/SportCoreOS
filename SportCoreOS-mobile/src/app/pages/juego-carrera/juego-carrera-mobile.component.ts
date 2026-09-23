import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { GamificationSocketService, RankingSocketEvent } from '../../core/services/gamification-socket.service';

export type CardTier = 'BRONCE' | 'PLATA' | 'ORO' | 'ELITE';

export interface MobileRankItem {
  id: string;
  posicionRanking: number;
  posicionAnterior: number;
  nombres: string;
  apellidos: string;
  dorsal: number;
  posicionCampo: string;
  categoriaNombre: string;
  fotoUrl: string;
  tier: CardTier;
  nivel: number;
  overallRating: number;
  xpTotal: number;
  rachaEntrenamientos: number;
}

export interface TacticalQuestion {
  id: number;
  situacion: string;
  contexto: string;
  opciones: { texto: string; correcta: boolean; feedback: string }[];
  xpRecompensa: number;
}

export interface PlayerMission {
  id: string;
  tipo: 'ENTRENAMIENTO' | 'AMISTOSO' | 'OFICIAL' | 'TACTICA';
  titulo: string;
  descripcion: string;
  xp: number;
  progreso: number;
  meta: number;
  completada: boolean;
  icono: string;
  exigenciaBadge: string;
}

@Component({
  selector: 'app-juego-carrera-mobile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MobileHeaderComponent, BottomNavComponent],
  template: `
    <app-mobile-header></app-mobile-header>

    <!-- Subbarra superior de navegación -->
    <div class="career-subbar">
      <div class="subbar-left">
        <a routerLink="/home" class="btn-back"><i class="fa-solid fa-arrow-left"></i></a>
        <div class="subbar-title-wrap">
          <h2>Modo Carrera: Evolution</h2>
          <span class="subbar-league">SPORTCORE LEAGUE 2026</span>
        </div>
      </div>
      <div class="subbar-right">
        <div class="xp-pill-counter">
          <i class="fa-solid fa-bolt text-warning"></i>
          <span>{{ xpTotal() }} XP</span>
        </div>
      </div>
    </div>

    <main class="career-main-content">
      <!-- 1. CARTA FUT EVOLUTIVA DINÁMICA -->
      <section class="fut-evolution-section">
        <div class="fut-card-wrapper" [ngClass]="getTierClass(tier())">
          <!-- Brillo y Efecto Prisma Holograma -->
          <div class="fut-card-prism"></div>
          <div class="fut-card-glow"></div>

          <!-- Header de la Carta FUT -->
          <div class="fut-card-header">
            <div class="fut-ovr-box">
              <span class="fut-ovr-number">{{ overallRating() }}</span>
              <span class="fut-pos-code">EXT</span>
              <div class="fut-tier-pill">{{ tier() }}</div>
            </div>

            <div class="fut-avatar-frame">
              <img [src]="auth.currentUser()?.fotoUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80'" alt="Jugador" class="fut-player-img" />
              <span class="fut-flag">🇨🇴</span>
              <span class="fut-shield">{{ auth.activeClub().sigla }}</span>
            </div>
          </div>

          <!-- Nombre y Categoría -->
          <div class="fut-card-name-strip">
            <h3 class="fut-player-name">{{ auth.currentUser()?.nombres || 'SAMUEL DÍAZ' }}</h3>
            <span class="fut-club-subtitle">SPORTCORE ACADEMY • SUB-15 ÉLITE</span>
          </div>

          <!-- Atributos 6 Pilares FIFA -->
          <div class="fut-attributes-grid">
            <div class="fut-attr-item">
              <span class="attr-val">{{ stats().ritmo }}</span>
              <span class="attr-lbl">RIT</span>
            </div>
            <div class="fut-attr-item">
              <span class="attr-val">{{ stats().tiro }}</span>
              <span class="attr-lbl">TIR</span>
            </div>
            <div class="fut-attr-item">
              <span class="attr-val">{{ stats().pase }}</span>
              <span class="attr-lbl">PAS</span>
            </div>
            <div class="fut-attr-item">
              <span class="attr-val">{{ stats().regate }}</span>
              <span class="attr-lbl">REG</span>
            </div>
            <div class="fut-attr-item">
              <span class="attr-val">{{ stats().defensa }}</span>
              <span class="attr-lbl">DEF</span>
            </div>
            <div class="fut-attr-item">
              <span class="attr-val">{{ stats().fisico }}</span>
              <span class="attr-lbl">FÍS</span>
            </div>
          </div>

          <!-- Barra de Progreso al Siguiente Nivel -->
          <div class="fut-level-progress-box">
            <div class="level-info-row">
              <span class="lvl-badge"><i class="fa-solid fa-star"></i> NIVEL {{ nivel() }}</span>
              <span class="lvl-xp-text">{{ xpActualNivel() }} / {{ xpMetaNivel() }} XP</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" [style.width.%]="porcentajeProgreso()"></div>
            </div>
            <span class="next-tier-hint" *ngIf="tier() !== 'ELITE'">
              Siguiente Rango: <strong>{{ getSiguienteTier() }}</strong> (Nivel {{ getNivelSiguienteTier() }})
            </span>
            <span class="next-tier-hint elite-max" *ngIf="tier() === 'ELITE'">
              👑 ¡RANGO MÁXIMO ALCANZADO: LEYENDA ÉLITE!
            </span>
          </div>
        </div>
      </section>

      <!-- 2. SELECTOR DE PESTAÑAS: TÁCTICA / RETOS / ATRIBUTOS / RANKING LEADERBOARD -->
      <div class="game-tabs-bar">
        <button class="game-tab-btn" [class.active]="activeTab() === 'RANKING'" (click)="setTab('RANKING')">
          <i class="fa-solid fa-trophy text-amber"></i>
          <span>Leaderboard</span>
          <span class="live-dot-mini" title="En vivo por WebSocket"></span>
        </button>
        <button class="game-tab-btn" [class.active]="activeTab() === 'TACTICA'" (click)="setTab('TACTICA')">
          <i class="fa-solid fa-brain"></i>
          <span>Trivia Táctica</span>
        </button>
        <button class="game-tab-btn" [class.active]="activeTab() === 'MISIONES'" (click)="setTab('MISIONES')">
          <i class="fa-solid fa-bullseye"></i>
          <span>Exigencias</span>
        </button>
        <button class="game-tab-btn" [class.active]="activeTab() === 'TIRO_LIBRE'" (click)="setTab('TIRO_LIBRE')">
          <i class="fa-solid fa-futbol"></i>
          <span>Tiro Libre</span>
        </button>
      </div>

      <!-- 3. CONTENIDO DE PESTAÑA: TRIVIA TÁCTICA -->
      @if (activeTab() === 'TACTICA') {
        <section class="game-card-view">
          <div class="view-header">
            <div class="view-title">
              <i class="fa-solid fa-lightbulb text-warning"></i>
              <div>
                <h3>Academia de Decisiones Tácticas</h3>
                <p>Responde como un profesional en el campo y gana XP directo</p>
              </div>
            </div>
            <span class="streak-badge"><i class="fa-solid fa-fire"></i> Racha: {{ rachaTrivia() }}</span>
          </div>

          @if (!triviaFinalizada()) {
            <div class="tactical-question-card">
              <div class="question-header">
                <span class="q-number">SITUACIÓN TÁCTICA #{{ currentQuestionIndex() + 1 }}</span>
                <span class="q-xp-reward">+{{ currentQuestion().xpRecompensa }} XP</span>
              </div>

              <div class="situation-box">
                <p class="situation-context"><i class="fa-solid fa-diagram-project"></i> {{ currentQuestion().contexto }}</p>
                <h4 class="situation-text">{{ currentQuestion().situacion }}</h4>
              </div>

              <!-- Opciones de Respuesta -->
              <div class="options-list">
                @for (op of currentQuestion().opciones; track $index) {
                  <button 
                    class="option-btn"
                    [class.selected]="selectedOption() === $index"
                    [class.correct]="mostrarResultado() && op.correcta"
                    [class.incorrect]="mostrarResultado() && selectedOption() === $index && !op.correcta"
                    [disabled]="mostrarResultado()"
                    (click)="selectOption($index)">
                    <span class="opt-letter">{{ getLetter($index) }}</span>
                    <span class="opt-text">{{ op.texto }}</span>
                    <i class="fa-solid fa-circle-check opt-check" *ngIf="mostrarResultado() && op.correcta"></i>
                    <i class="fa-solid fa-circle-xmark opt-xmark" *ngIf="mostrarResultado() && selectedOption() === $index && !op.correcta"></i>
                  </button>
                }
              </div>

              <!-- Feedback del DT -->
              @if (mostrarResultado()) {
                <div class="feedback-coach-box" [class.success]="isRespuestaCorrecta()" [class.danger]="!isRespuestaCorrecta()">
                  <div class="coach-avatar"><i class="fa-solid fa-user-tie"></i></div>
                  <div class="coach-feedback-text">
                    <strong>{{ isRespuestaCorrecta() ? '¡Excelente Visión de Juego! (+50 XP)' : 'Consejo del Entrenador:' }}</strong>
                    <p>{{ feedbackMensaje() }}</p>
                  </div>
                </div>

                <button class="btn-next-question" (click)="siguientePregunta()">
                  <span>Siguiente Jugada</span>
                  <i class="fa-solid fa-arrow-right"></i>
                </button>
              } @else {
                <button 
                  class="btn-confirm-answer" 
                  [disabled]="selectedOption() === null" 
                  (click)="confirmarRespuesta()">
                  <i class="fa-solid fa-check"></i>
                  <span>Confirmar Decisión</span>
                </button>
              }
            </div>
          } @else {
            <div class="trivia-completed-box">
              <div class="trophy-bounce"><i class="fa-solid fa-trophy"></i></div>
              <h3>¡Sesión Táctica Completada!</h3>
              <p>Has sumado <strong>+150 XP</strong> para la evolución de tu tarjeta de jugador.</p>
              <button class="btn-restart" (click)="reiniciarTrivia()">
                <i class="fa-solid fa-rotate-right"></i> Jugar Otra Ronda Táctica
              </button>
            </div>
          }
        </section>
      }

      <!-- 4. CONTENIDO DE PESTAÑA: EXIGENCIAS & RETOS (ENTRENAMIENTOS / AMISTOSOS / OFICIALES) -->
      @if (activeTab() === 'MISIONES') {
        <section class="game-card-view">
          <div class="view-header">
            <div class="view-title">
              <i class="fa-solid fa-medal text-emerald"></i>
              <div>
                <h3>Exigencias de Rendimiento Real</h3>
                <p>Cumple metas en tus entrenamientos y partidos para subir de OVR</p>
              </div>
            </div>
          </div>

          <!-- Filtros de Misiones -->
          <div class="mission-type-chips">
            <button class="chip" [class.active]="filtroMision() === 'TODAS'" (click)="filtroMision.set('TODAS')">Todas</button>
            <button class="chip" [class.active]="filtroMision() === 'ENTRENAMIENTO'" (click)="filtroMision.set('ENTRENAMIENTO')">🏃 Entrenamientos</button>
            <button class="chip" [class.active]="filtroMision() === 'AMISTOSO'" (click)="filtroMision.set('AMISTOSO')">⚽ Amistosos</button>
            <button class="chip" [class.active]="filtroMision() === 'OFICIAL'" (click)="filtroMision.set('OFICIAL')">🏆 Torneo Oficial</button>
          </div>

          <!-- Lista de Retos / Misiones -->
          <div class="missions-list">
            @for (m of misionesFiltradas(); track m.id) {
              <div class="mission-card" [class.completed]="m.completada">
                <div class="mission-left-icon" [ngClass]="m.tipo.toLowerCase()">
                  <i [class]="m.icono"></i>
                </div>
                <div class="mission-body">
                  <div class="mission-top-row">
                    <span class="mission-badge" [ngClass]="m.tipo.toLowerCase()">{{ m.exigenciaBadge }}</span>
                    <span class="mission-xp">+{{ m.xp }} XP</span>
                  </div>
                  <h4 class="mission-title">{{ m.titulo }}</h4>
                  <p class="mission-desc">{{ m.descripcion }}</p>

                  <div class="mission-progress-row">
                    <div class="progress-bar-wrap">
                      <div class="bar-fill" [style.width.%]="(m.progreso / m.meta) * 100"></div>
                    </div>
                    <span class="progress-count">{{ m.progreso }}/{{ m.meta }}</span>
                  </div>
                </div>

                <div class="mission-action-btn">
                  @if (m.completada) {
                    <span class="badge-done"><i class="fa-solid fa-circle-check"></i> Reclamada</span>
                  } @else if (m.progreso >= m.meta) {
                    <button class="btn-claim-xp" (click)="reclamarMision(m)">
                      <i class="fa-solid fa-gift"></i> Reclamar
                    </button>
                  } @else {
                    <span class="badge-in-progress">En curso</span>
                  }
                </div>
              </div>
            }
          </div>
        </section>
      }

      <!-- 5. CONTENIDO DE PESTAÑA: MINIJUEGO TIRO DE PRECISIÓN -->
      @if (activeTab() === 'TIRO_LIBRE') {
        <section class="game-card-view">
          <div class="view-header">
            <div class="view-title">
              <i class="fa-solid fa-crosshairs text-rose"></i>
              <div>
                <h3>Diana de Precisión & Definición</h3>
                <p>Apunta al ángulo de la portería para sumar XP y afinar tu puntería</p>
              </div>
            </div>
            <span class="score-display">Goles: <strong>{{ golesMarcados() }}</strong> / 5</span>
          </div>

          <!-- Portería Interactiva -->
          <div class="target-goal-pitch">
            <div class="crossbar-top"></div>
            <div class="post-left"></div>
            <div class="post-right"></div>
            <div class="goal-netting"></div>

            <!-- Arquero animado -->
            <div class="keeper-character" [ngClass]="keeperPosicion()">
              <div class="keeper-body">🧤⚽</div>
            </div>

            <!-- 4 Zonas de Tiro / Ángulos -->
            <button class="target-zone top-left" (click)="disparar(1)" [disabled]="disparando()">
              <span>Ángulo Superior Izq</span>
              <strong>+40 XP</strong>
            </button>
            <button class="target-zone top-right" (click)="disparar(2)" [disabled]="disparando()">
              <span>Ángulo Superior Der</span>
              <strong>+40 XP</strong>
            </button>
            <button class="target-zone bottom-left" (click)="disparar(3)" [disabled]="disparando()">
              <span>Raso Esquinado Izq</span>
              <strong>+25 XP</strong>
            </button>
            <button class="target-zone bottom-right" (click)="disparar(4)" [disabled]="disparando()">
              <span>Raso Esquinado Der</span>
              <strong>+25 XP</strong>
            </button>
          </div>

          <!-- Mensaje de Resultado del Tiro -->
          @if (tiroResultadoMensaje()) {
            <div class="shot-result-banner" [class.goal]="esGol()" [class.saved]="!esGol()">
              <i class="fa-solid" [class.fa-futbol]="esGol()" [class.fa-hand]="!esGol()"></i>
              <span>{{ tiroResultadoMensaje() }}</span>
            </div>
          }
        </section>
      }

      <!-- 6. CONTENIDO DE PESTAÑA: LEADERBOARD GAMIFICADO EN TIEMPO REAL (WEBSOCKET) -->
      @if (activeTab() === 'RANKING') {
        <section class="game-card-view ranking-mobile-view">
          <!-- Banner de Conexión WebSocket en Vivo -->
          <div class="socket-live-strip">
            <div class="socket-status">
              <span class="pulse-dot-green"></span>
              <span>SOCKET EN VIVO: <strong>LEADERBOARD 2026-I</strong></span>
            </div>
            <span class="socket-count"><i class="fa-solid fa-signal text-emerald"></i> Sincronizado</span>
          </div>

          <!-- Toast Notificación de Último Evento WebSocket recibido -->
          @if (socketService.ultimoEvento(); as ev) {
            <div class="socket-event-toast" [class.gain]="ev.xpDelta > 0" [class.penalty]="ev.xpDelta < 0">
              <div class="event-icon">
                <i class="fa-solid" [class.fa-bolt]="ev.xpDelta > 0" [class.fa-circle-exclamation]="ev.xpDelta < 0"></i>
              </div>
              <div class="event-body">
                <div class="event-headline">
                  <strong>{{ ev.jugadorNombre }} (#{{ ev.dorsal }})</strong>
                  <span class="event-delta" [class.delta-plus]="ev.xpDelta > 0" [class.delta-minus]="ev.xpDelta < 0">
                    {{ ev.xpDelta > 0 ? '+' + ev.xpDelta : ev.xpDelta }} XP
                  </span>
                </div>
                <p class="event-desc">{{ ev.motivo }}</p>
                <span class="event-time"><i class="fa-regular fa-clock"></i> {{ ev.timestamp }}</span>
              </div>
            </div>
          }

          <!-- MINI PODIO TOP 3 MOBILE -->
          <div class="mobile-podium-row">
            <!-- #2 Plata -->
            @if (top3Alumnos()[1]; as p2) {
              <div class="podium-mini-col place-2" (click)="verDetalleAlumno(p2)">
                <div class="crown-pill silver">#2</div>
                <div class="avatar-podium silver-ring">
                  <img [src]="p2.fotoUrl" [alt]="p2.nombres" />
                </div>
                <span class="podium-name">{{ p2.nombres }}</span>
                <span class="podium-xp silver-text">{{ p2.xpTotal }} XP</span>
                <div class="pedestal-bar silver-bg">2</div>
              </div>
            }

            <!-- #1 Oro MVP -->
            @if (top3Alumnos()[0]; as p1) {
              <div class="podium-mini-col place-1" (click)="verDetalleAlumno(p1)">
                <div class="crown-pill gold"><i class="fa-solid fa-crown"></i> #1</div>
                <div class="avatar-podium gold-ring">
                  <img [src]="p1.fotoUrl" [alt]="p1.nombres" />
                </div>
                <span class="podium-name">{{ p1.nombres }}</span>
                <span class="podium-xp gold-text">{{ p1.xpTotal }} XP</span>
                <div class="pedestal-bar gold-bg">1</div>
              </div>
            }

            <!-- #3 Bronce -->
            @if (top3Alumnos()[2]; as p3) {
              <div class="podium-mini-col place-3" (click)="verDetalleAlumno(p3)">
                <div class="crown-pill bronze">#3</div>
                <div class="avatar-podium bronze-ring">
                  <img [src]="p3.fotoUrl" [alt]="p3.nombres" />
                </div>
                <span class="podium-name">{{ p3.nombres }}</span>
                <span class="podium-xp bronze-text">{{ p3.xpTotal }} XP</span>
                <div class="pedestal-bar bronze-bg">3</div>
              </div>
            }
          </div>

          <!-- LISTA DE ALUMNOS MOBILE CON SOCKET ANIMATION -->
          <div class="mobile-leaderboard-list">
            <div class="list-header-title">
              <span>CLASIFICACIÓN GENERAL ({{ leaderboardList().length }} ALUMNOS)</span>
              <span class="legend-hint"><i class="fa-solid fa-fire text-amber"></i> Racha DT</span>
            </div>

            @for (alumno of leaderboardList(); track alumno.id) {
              <div 
                class="mobile-player-rank-card" 
                [class.my-card]="alumno.id === 'alm-2'"
                [class.rank-gold]="alumno.posicionRanking === 1"
                (click)="verDetalleAlumno(alumno)">
                
                <!-- Posición y Tendencia -->
                <div class="rank-pos-box">
                  <span class="rank-badge" [ngClass]="'pos-' + alumno.posicionRanking">
                    {{ alumno.posicionRanking }}
                  </span>
                  @if (alumno.posicionAnterior > alumno.posicionRanking) {
                    <i class="fa-solid fa-caret-up text-emerald"></i>
                  } @else if (alumno.posicionAnterior < alumno.posicionRanking) {
                    <i class="fa-solid fa-caret-down text-rose"></i>
                  } @else {
                    <i class="fa-solid fa-minus text-slate"></i>
                  }
                </div>

                <!-- Foto y Datos -->
                <div class="player-mid-box">
                  <div class="avatar-circle" [ngClass]="'ring-' + alumno.tier.toLowerCase()">
                    <img [src]="alumno.fotoUrl" [alt]="alumno.nombres" />
                    <span class="dorsal-tag">#{{ alumno.dorsal }}</span>
                  </div>
                  <div class="player-info-lines">
                    <div class="name-line">
                      <span class="full-name">{{ alumno.nombres }} {{ alumno.apellidos }}</span>
                      @if (alumno.id === 'alm-2') {
                        <span class="you-badge">TÚ</span>
                      }
                    </div>
                    <span class="cat-pos-line">{{ alumno.categoriaNombre }} • {{ alumno.posicionCampo }}</span>
                    <div class="mini-badges-row">
                      <span class="tier-pill" [ngClass]="'tier-' + alumno.tier.toLowerCase()">{{ alumno.tier }} (Lv.{{ alumno.nivel }})</span>
                      <span class="streak-pill" *ngIf="alumno.rachaEntrenamientos > 0">
                        <i class="fa-solid fa-fire text-amber"></i> {{ alumno.rachaEntrenamientos }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- OVR & XP Total -->
                <div class="player-right-ovr">
                  <div class="ovr-circle">{{ alumno.overallRating }}</div>
                  <span class="xp-count-val">{{ alumno.xpTotal | number }} XP</span>
                </div>
              </div>
            }
          </div>
        </section>
      }
    </main>

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .career-subbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1rem;
      background: #0b0f19;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);

      .subbar-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .btn-back {
          color: #94a3b8;
          font-size: 1.1rem;
          text-decoration: none;
        }

        .subbar-title-wrap {
          display: flex;
          flex-direction: column;

          h2 {
            font-size: 1.05rem;
            font-weight: 900;
            color: #ffffff;
            margin: 0;
            letter-spacing: -0.02em;
          }

          .subbar-league {
            font-size: 0.65rem;
            font-weight: 800;
            color: #34d399;
            letter-spacing: 0.05em;
          }
        }
      }

      .xp-pill-counter {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        background: rgba(234, 179, 8, 0.15);
        border: 1px solid rgba(234, 179, 8, 0.35);
        padding: 0.35rem 0.75rem;
        border-radius: 20px;
        font-size: 0.82rem;
        font-weight: 900;
        color: #facc15;
      }
    }

    .career-main-content {
      padding: 1rem;
      padding-bottom: calc(80px + var(--safe-area-bottom));
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      background: #070b14;
      min-height: 100vh;
      color: #ffffff;
    }

    /* =========================================================================
       1. CARTA FUT EVOLUTIVA DINÁMICA
       ========================================================================= */
    .fut-evolution-section {
      display: flex;
      justify-content: center;
    }

    .fut-card-wrapper {
      position: relative;
      width: 100%;
      max-width: 360px;
      border-radius: 1.75rem;
      padding: 1.35rem;
      overflow: hidden;
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.6);
      transition: all 0.4s ease;

      /* Tier Bronce */
      &.tier-bronce {
        background: linear-gradient(145deg, #451a03 0%, #291508 50%, #170d06 100%);
        border: 2px solid #b45309;
        .fut-card-header .fut-ovr-box .fut-ovr-number { color: #f59e0b; }
      }

      /* Tier Plata */
      &.tier-plata {
        background: linear-gradient(145deg, #334155 0%, #1e293b 50%, #0f172a 100%);
        border: 2px solid #94a3b8;
        .fut-card-header .fut-ovr-box .fut-ovr-number { color: #e2e8f0; }
      }

      /* Tier Oro */
      &.tier-oro {
        background: linear-gradient(145deg, #713f12 0%, #3a2204 50%, #1c1002 100%);
        border: 2px solid #eab308;
        .fut-card-header .fut-ovr-box .fut-ovr-number { color: #facc15; }
      }

      /* Tier Élite / Holograma */
      &.tier-elite {
        background: linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(16, 185, 129, 0.2) 50%, #0b0f19 100%);
        border: 2px solid #10b981;
        box-shadow: 0 16px 40px rgba(16, 185, 129, 0.35), 0 0 20px rgba(6, 182, 212, 0.25);

        .fut-card-prism {
          position: absolute;
          inset: -50%;
          background: linear-gradient(
            115deg,
            transparent 20%,
            rgba(255, 182, 193, 0.12) 32%,
            rgba(254, 240, 138, 0.22) 42%,
            rgba(167, 243, 208, 0.18) 52%,
            rgba(186, 230, 253, 0.22) 62%,
            rgba(221, 214, 254, 0.15) 72%,
            transparent 85%
          );
          transform: rotate(25deg);
          pointer-events: none;
          animation: prismSweep 4s ease-in-out infinite alternate;
        }

        .fut-card-header .fut-ovr-box .fut-ovr-number {
          background: linear-gradient(135deg, #6ee7b7, #38bdf8, #fef08a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }

      .fut-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .fut-ovr-box {
          display: flex;
          flex-direction: column;
          align-items: center;

          .fut-ovr-number {
            font-size: 2.75rem;
            font-weight: 900;
            line-height: 1;
          }

          .fut-pos-code {
            font-size: 1rem;
            font-weight: 900;
            letter-spacing: 1px;
            color: #ffffff;
            opacity: 0.9;
          }

          .fut-tier-pill {
            font-size: 0.6rem;
            font-weight: 900;
            letter-spacing: 0.05em;
            background: rgba(255, 255, 255, 0.15);
            padding: 0.15rem 0.5rem;
            border-radius: 10px;
            margin-top: 0.2rem;
          }
        }

        .fut-avatar-frame {
          position: relative;
          width: 96px;
          height: 96px;
          border-radius: 50%;
          border: 3px solid rgba(255, 255, 255, 0.35);
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);

          .fut-player-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .fut-flag {
            position: absolute;
            bottom: 2px;
            left: 2px;
            font-size: 0.9rem;
          }

          .fut-shield {
            position: absolute;
            bottom: 2px;
            right: 2px;
            font-size: 0.6rem;
            font-weight: 900;
            background: #10b981;
            color: #0b0f19;
            padding: 0.1rem 0.35rem;
            border-radius: 4px;
          }
        }
      }

      .fut-card-name-strip {
        text-align: center;
        margin: 0.85rem 0 0.6rem 0;

        .fut-player-name {
          font-size: 1.25rem;
          font-weight: 900;
          letter-spacing: 0.5px;
          margin: 0;
          color: #ffffff;
        }

        .fut-club-subtitle {
          font-size: 0.68rem;
          font-weight: 700;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }
      }

      .fut-attributes-grid {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        background: rgba(0, 0, 0, 0.35);
        border-radius: 12px;
        padding: 0.65rem 0.4rem;
        margin-bottom: 0.85rem;
        text-align: center;

        .fut-attr-item {
          display: flex;
          flex-direction: column;
          gap: 0.1rem;

          .attr-val {
            font-size: 1.05rem;
            font-weight: 900;
            color: #34d399;
          }

          .attr-lbl {
            font-size: 0.62rem;
            font-weight: 800;
            color: #94a3b8;
          }
        }
      }

      .fut-level-progress-box {
        background: rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        padding: 0.65rem 0.75rem;

        .level-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.35rem;

          .lvl-badge {
            font-size: 0.72rem;
            font-weight: 900;
            color: #facc15;
          }

          .lvl-xp-text {
            font-size: 0.68rem;
            font-weight: 700;
            color: #94a3b8;
          }
        }

        .progress-track {
          width: 100%;
          height: 7px;
          background: rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          overflow: hidden;

          .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #10b981, #06b6d4, #facc15);
            border-radius: 10px;
            transition: width 0.5s ease;
          }
        }

        .next-tier-hint {
          display: block;
          font-size: 0.64rem;
          color: #94a3b8;
          margin-top: 0.35rem;
          text-align: center;

          &.elite-max {
            color: #34d399;
            font-weight: 800;
          }
        }
      }
    }

    @keyframes prismSweep {
      0% { transform: rotate(25deg) translateY(-8%); opacity: 0.6; }
      100% { transform: rotate(25deg) translateY(8%); opacity: 1; }
    }

    /* =========================================================================
       2. TABS BAR
       ========================================================================= */
    .game-tabs-bar {
      display: flex;
      gap: 0.5rem;
      background: #0f172a;
      padding: 0.35rem;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.08);

      .game-tab-btn {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        padding: 0.6rem 0.4rem;
        border-radius: 10px;
        background: transparent;
        border: none;
        color: #94a3b8;
        font-size: 0.75rem;
        font-weight: 800;
        cursor: pointer;
        transition: all 0.2s ease;

        i { font-size: 0.85rem; }

        &.active {
          background: #10b981;
          color: #0b0f19;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
      }
    }

    /* =========================================================================
       3. TARJETAS DE CONTENIDO / VISTAS DE JUEGO
       ========================================================================= */
    .game-card-view {
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1.25rem;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;

      .view-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .view-title {
          display: flex;
          align-items: center;
          gap: 0.6rem;

          i { font-size: 1.3rem; }

          h3 {
            font-size: 0.95rem;
            font-weight: 900;
            color: #ffffff;
            margin: 0;
          }

          p {
            font-size: 0.7rem;
            color: #94a3b8;
            margin: 0;
          }
        }

        .streak-badge, .score-display {
          font-size: 0.75rem;
          font-weight: 800;
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
          padding: 0.25rem 0.6rem;
          border-radius: 12px;
          border: 1px solid rgba(239, 68, 68, 0.3);
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .score-display {
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.3);
        }
      }
    }

    /* TACTICAL QUIZ */
    .tactical-question-card {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;

      .question-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .q-number {
          font-size: 0.68rem;
          font-weight: 800;
          color: #38bdf8;
          letter-spacing: 0.05em;
        }

        .q-xp-reward {
          font-size: 0.72rem;
          font-weight: 900;
          color: #facc15;
          background: rgba(234, 179, 8, 0.15);
          padding: 0.15rem 0.5rem;
          border-radius: 8px;
        }
      }

      .situation-box {
        background: rgba(255, 255, 255, 0.04);
        border-left: 3px solid #38bdf8;
        padding: 0.85rem;
        border-radius: 8px;

        .situation-context {
          font-size: 0.72rem;
          color: #38bdf8;
          font-weight: 700;
          margin: 0 0 0.35rem 0;
        }

        .situation-text {
          font-size: 0.92rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0;
          line-height: 1.35;
        }
      }

      .options-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .option-btn {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.75rem 0.85rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: #e2e8f0;
          font-size: 0.82rem;
          font-weight: 600;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s ease;

          .opt-letter {
            width: 24px;
            height: 24px;
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
            font-weight: 900;
            flex-shrink: 0;
          }

          .opt-text { flex: 1; }

          &.selected {
            background: rgba(56, 189, 248, 0.15);
            border-color: #38bdf8;
            color: #ffffff;

            .opt-letter {
              background: #38bdf8;
              color: #0b0f19;
            }
          }

          &.correct {
            background: rgba(16, 185, 129, 0.2) !important;
            border-color: #10b981 !important;
            color: #ffffff !important;
            .opt-letter { background: #10b981 !important; color: #0b0f19 !important; }
            .opt-check { color: #10b981; font-size: 1.1rem; }
          }

          &.incorrect {
            background: rgba(239, 68, 68, 0.2) !important;
            border-color: #ef4444 !important;
            color: #ffffff !important;
            .opt-letter { background: #ef4444 !important; color: #ffffff !important; }
            .opt-xmark { color: #ef4444; font-size: 1.1rem; }
          }
        }
      }

      .feedback-coach-box {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 0.85rem;
        border-radius: 12px;

        &.success {
          background: rgba(16, 185, 129, 0.15);
          border: 1px solid rgba(16, 185, 129, 0.35);
          strong { color: #34d399; }
        }

        &.danger {
          background: rgba(239, 68, 68, 0.15);
          border: 1px solid rgba(239, 68, 68, 0.35);
          strong { color: #f87171; }
        }

        .coach-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #1e293b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          color: #38bdf8;
          flex-shrink: 0;
        }

        .coach-feedback-text {
          font-size: 0.75rem;
          p { margin: 0.2rem 0 0 0; color: #cbd5e1; }
        }
      }

      .btn-confirm-answer, .btn-next-question {
        width: 100%;
        padding: 0.85rem;
        border-radius: 12px;
        border: none;
        font-size: 0.88rem;
        font-weight: 900;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .btn-confirm-answer {
        background: #38bdf8;
        color: #0b0f19;
        &:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      }

      .btn-next-question {
        background: #10b981;
        color: #0b0f19;
      }
    }

    .trivia-completed-box {
      text-align: center;
      padding: 1.5rem 0.5rem;

      .trophy-bounce {
        font-size: 3rem;
        color: #facc15;
        margin-bottom: 0.75rem;
        animation: bounce 1.5s infinite;
      }

      h3 { font-size: 1.15rem; font-weight: 900; color: #ffffff; margin-bottom: 0.3rem; }
      p { font-size: 0.82rem; color: #94a3b8; margin-bottom: 1rem; }

      .btn-restart {
        background: #10b981;
        color: #0b0f19;
        font-size: 0.85rem;
        font-weight: 900;
        border: none;
        padding: 0.75rem 1.25rem;
        border-radius: 12px;
        cursor: pointer;
      }
    }

    /* MISIONES & EXIGENCIAS */
    .mission-type-chips {
      display: flex;
      gap: 0.4rem;
      overflow-x: auto;
      padding-bottom: 0.25rem;

      .chip {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #94a3b8;
        font-size: 0.7rem;
        font-weight: 800;
        padding: 0.35rem 0.65rem;
        border-radius: 20px;
        white-space: nowrap;
        cursor: pointer;

        &.active {
          background: rgba(16, 185, 129, 0.2);
          border-color: #10b981;
          color: #34d399;
        }
      }
    }

    .missions-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .mission-card {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 0.85rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;

        &.completed {
          opacity: 0.6;
          border-color: rgba(16, 185, 129, 0.3);
        }

        .mission-left-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          flex-shrink: 0;

          &.entrenamiento { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
          &.amistoso { background: rgba(16, 185, 129, 0.15); color: #34d399; }
          &.oficial { background: rgba(234, 179, 8, 0.15); color: #facc15; }
          &.tactica { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
        }

        .mission-body {
          flex: 1;

          .mission-top-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.2rem;

            .mission-badge {
              font-size: 0.6rem;
              font-weight: 800;
              text-transform: uppercase;
              &.entrenamiento { color: #38bdf8; }
              &.amistoso { color: #34d399; }
              &.oficial { color: #facc15; }
            }

            .mission-xp {
              font-size: 0.72rem;
              font-weight: 900;
              color: #facc15;
            }
          }

          .mission-title {
            font-size: 0.82rem;
            font-weight: 800;
            color: #ffffff;
            margin: 0;
          }

          .mission-desc {
            font-size: 0.68rem;
            color: #94a3b8;
            margin: 0.15rem 0 0.4rem 0;
          }

          .mission-progress-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;

            .progress-bar-wrap {
              flex: 1;
              height: 5px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 6px;
              overflow: hidden;

              .bar-fill {
                height: 100%;
                background: #10b981;
                border-radius: 6px;
              }
            }

            .progress-count {
              font-size: 0.65rem;
              font-weight: 800;
              color: #cbd5e1;
            }
          }
        }

        .mission-action-btn {
          flex-shrink: 0;

          .btn-claim-xp {
            background: linear-gradient(135deg, #10b981, #059669);
            color: #0b0f19;
            font-size: 0.68rem;
            font-weight: 900;
            border: none;
            padding: 0.4rem 0.65rem;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
          }

          .badge-done {
            font-size: 0.65rem;
            font-weight: 800;
            color: #34d399;
          }

          .badge-in-progress {
            font-size: 0.65rem;
            color: #64748b;
            font-weight: 700;
          }
        }
      }
    }

    /* TIRO DE PRECISIÓN */
    .target-goal-pitch {
      position: relative;
      width: 100%;
      height: 220px;
      background: radial-gradient(circle at center, #1e293b 0%, #0b0f19 90%);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 1rem;
      overflow: hidden;

      .crossbar-top {
        position: absolute;
        top: 10px;
        left: 20px;
        right: 20px;
        height: 6px;
        background: #ffffff;
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
      }

      .post-left {
        position: absolute;
        top: 10px;
        bottom: 0;
        left: 20px;
        width: 6px;
        background: #ffffff;
      }

      .post-right {
        position: absolute;
        top: 10px;
        bottom: 0;
        right: 20px;
        width: 6px;
        background: #ffffff;
      }

      .goal-netting {
        position: absolute;
        inset: 16px 26px 0 26px;
        background-image: linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
        background-size: 16px 16px;
      }

      .keeper-character {
        position: absolute;
        bottom: 10px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 2.2rem;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 5;

        &.dive-left { transform: translateX(-120%) translateY(-20px) rotate(-25deg); }
        &.dive-right { transform: translateX(20%) translateY(-20px) rotate(25deg); }
        &.dive-center { transform: translateX(-50%) translateY(-40px); }
      }

      .target-zone {
        position: absolute;
        width: 75px;
        height: 55px;
        background: rgba(239, 68, 68, 0.2);
        border: 2px dashed #f87171;
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        cursor: pointer;
        z-index: 10;
        transition: all 0.2s ease;

        span { font-size: 0.55rem; font-weight: 700; text-align: center; }
        strong { font-size: 0.72rem; color: #facc15; }

        &:active { transform: scale(0.92); }

        &.top-left { top: 22px; left: 32px; }
        &.top-right { top: 22px; right: 32px; }
        &.bottom-left { bottom: 12px; left: 32px; }
        &.bottom-right { bottom: 12px; right: 32px; }
      }
    }

    .shot-result-banner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      border-radius: 12px;
      font-size: 0.85rem;
      font-weight: 900;
      animation: popIn 0.3s ease;

      &.goal {
        background: rgba(16, 185, 129, 0.2);
        border: 1px solid #10b981;
        color: #34d399;
      }

      &.saved {
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid #ef4444;
        color: #f87171;
      }
    }

    /* =========================================================================
       LEADERBOARD GAMIFICADO MOBILE & SOCKET EN VIVO
       ========================================================================= */
    .ranking-mobile-view {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;

      .socket-live-strip {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(16, 185, 129, 0.3);
        padding: 0.45rem 0.75rem;
        border-radius: 10px;

        .socket-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.68rem;
          font-weight: 800;
          color: #f8fafc;

          .pulse-dot-green {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 8px #10b981;
            animation: pulseDot 1.4s infinite;
          }
        }

        .socket-count {
          font-size: 0.65rem;
          font-weight: 800;
          color: #34d399;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }

      /* TOAST DE EVENTO WEBSOCKET EN VIVO */
      .socket-event-toast {
        display: flex;
        gap: 0.75rem;
        background: #1e293b;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        padding: 0.75rem;
        animation: slideDownFade 0.4s ease;

        &.gain {
          border-left: 4px solid #10b981;
          .event-icon { color: #10b981; background: rgba(16, 185, 129, 0.15); }
        }

        &.penalty {
          border-left: 4px solid #f43f5e;
          .event-icon { color: #f43f5e; background: rgba(244, 63, 94, 0.15); }
        }

        .event-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          flex-shrink: 0;
        }

        .event-body {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;

          .event-headline {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.78rem;
            color: #f8fafc;

            .event-delta {
              font-size: 0.72rem;
              font-weight: 900;
              padding: 1px 5px;
              border-radius: 4px;

              &.delta-plus { background: rgba(16, 185, 129, 0.2); color: #34d399; }
              &.delta-minus { background: rgba(244, 63, 94, 0.2); color: #fb7185; }
            }
          }

          .event-desc {
            font-size: 0.68rem;
            color: #cbd5e1;
            margin: 0;
            line-height: 1.3;
          }

          .event-time {
            font-size: 0.58rem;
            color: #64748b;
            margin-top: 2px;
          }
        }
      }

      /* MINI PODIO MOBILE */
      .mobile-podium-row {
        display: flex;
        justify-content: center;
        align-items: flex-end;
        gap: 0.65rem;
        padding-top: 0.5rem;

        .podium-mini-col {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          cursor: pointer;
          transition: transform 0.2s;

          &:active { transform: scale(0.96); }

          .crown-pill {
            font-size: 0.62rem;
            font-weight: 900;
            padding: 1px 6px;
            border-radius: 10px;
            margin-bottom: 4px;

            &.gold { background: #f59e0b; color: #451a03; }
            &.silver { background: #94a3b8; color: #0f172a; }
            &.bronze { background: #d97706; color: #451a03; }
          }

          .avatar-podium {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid #334155;

            &.gold-ring { width: 62px; height: 62px; border-color: #f59e0b; box-shadow: 0 0 12px rgba(245, 158, 11, 0.4); }
            &.silver-ring { border-color: #94a3b8; }
            &.bronze-ring { border-color: #d97706; }

            img { width: 100%; height: 100%; object-fit: cover; }
          }

          .podium-name {
            font-size: 0.72rem;
            font-weight: 800;
            color: #f8fafc;
            margin-top: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 80px;
            text-align: center;
          }

          .podium-xp {
            font-size: 0.64rem;
            font-weight: 900;
            margin-bottom: 4px;

            &.gold-text { color: #fbbf24; }
            &.silver-text { color: #cbd5e1; }
            &.bronze-text { color: #f59e0b; }
          }

          .pedestal-bar {
            width: 100%;
            border-radius: 8px 8px 0 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            font-weight: 900;
            color: rgba(255, 255, 255, 0.8);

            &.gold-bg { height: 48px; background: linear-gradient(180deg, #f59e0b 0%, #b45309 100%); }
            &.silver-bg { height: 36px; background: linear-gradient(180deg, #94a3b8 0%, #475569 100%); }
            &.bronze-bg { height: 26px; background: linear-gradient(180deg, #d97706 0%, #78350f 100%); }
          }
        }
      }

      /* LISTA DE ALUMNOS LEADERBOARD */
      .mobile-leaderboard-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .list-header-title {
          display: flex;
          justify-content: space-between;
          font-size: 0.68rem;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.04em;
          padding: 0 0.2rem;
        }

        .mobile-player-rank-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #1e293b;
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 0.6rem 0.75rem;
          gap: 0.65rem;
          cursor: pointer;
          transition: all 0.2s ease;

          &:active { transform: scale(0.98); }

          &.my-card {
            border: 1px solid #10b981;
            background: rgba(16, 185, 129, 0.08);
          }

          &.rank-gold {
            border-left: 4px solid #f59e0b;
          }

          .rank-pos-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1px;
            width: 24px;
            flex-shrink: 0;

            .rank-badge {
              font-size: 0.85rem;
              font-weight: 900;
              color: #cbd5e1;

              &.pos-1 { color: #f59e0b; }
              &.pos-2 { color: #cbd5e1; }
              &.pos-3 { color: #d97706; }
            }

            i { font-size: 0.65rem; }
          }

          .player-mid-box {
            display: flex;
            align-items: center;
            gap: 0.55rem;
            flex: 1;
            min-width: 0;

            .avatar-circle {
              position: relative;
              width: 38px;
              height: 38px;
              border-radius: 50%;
              overflow: hidden;
              border: 2px solid #334155;
              flex-shrink: 0;

              &.ring-oro { border-color: #f59e0b; }
              &.ring-plata { border-color: #94a3b8; }
              &.ring-bronce { border-color: #d97706; }

              img { width: 100%; height: 100%; object-fit: cover; }

              .dorsal-tag {
                position: absolute;
                bottom: 0;
                right: 0;
                background: #0f172a;
                color: #10b981;
                font-size: 0.52rem;
                font-weight: 900;
                padding: 1px 3px;
                border-radius: 4px;
              }
            }

            .player-info-lines {
              display: flex;
              flex-direction: column;
              min-width: 0;

              .name-line {
                display: flex;
                align-items: center;
                gap: 4px;

                .full-name {
                  font-size: 0.82rem;
                  font-weight: 800;
                  color: #f8fafc;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                }

                .you-badge {
                  background: #10b981;
                  color: #022c22;
                  font-size: 0.55rem;
                  font-weight: 900;
                  padding: 1px 4px;
                  border-radius: 4px;
                }
              }

              .cat-pos-line {
                font-size: 0.64rem;
                color: #94a3b8;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }

              .mini-badges-row {
                display: flex;
                align-items: center;
                gap: 4px;
                margin-top: 2px;

                .tier-pill {
                  font-size: 0.58rem;
                  font-weight: 800;
                  padding: 1px 4px;
                  border-radius: 4px;

                  &.tier-oro { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
                  &.tier-plata { background: rgba(148, 163, 184, 0.2); color: #cbd5e1; }
                  &.tier-bronce { background: rgba(217, 119, 6, 0.2); color: #f59e0b; }
                }

                .streak-pill {
                  font-size: 0.58rem;
                  font-weight: 800;
                  color: #cbd5e1;
                  background: rgba(15, 23, 42, 0.8);
                  padding: 1px 4px;
                  border-radius: 4px;
                }
              }
            }
          }

          .player-right-ovr {
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            gap: 2px;
            flex-shrink: 0;

            .ovr-circle {
              width: 28px;
              height: 28px;
              border-radius: 6px;
              background: #0f172a;
              border: 1px solid rgba(255, 255, 255, 0.1);
              color: #facc15;
              font-size: 0.8rem;
              font-weight: 900;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .xp-count-val {
              font-size: 0.65rem;
              font-weight: 800;
              color: #10b981;
            }
          }
        }
      }
    }

    .live-dot-mini {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
      animation: pulseDot 1.4s infinite;
    }

    @keyframes pulseDot {
      0%, 100% { transform: scale(1); opacity: 0.7; }
      50% { transform: scale(1.3); opacity: 1; }
    }

    @keyframes slideDownFade {
      from { transform: translateY(-8px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    @keyframes popIn {
      0% { transform: scale(0.8); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `]
})
export class JuegoCarreraMobileComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  alertService = inject(AlertService);
  socketService = inject(GamificationSocketService);

  private socketSub: Subscription | null = null;

  // Estado del Jugador en el Juego
  xpTotal = signal<number>(3120);
  rachaTrivia = signal<number>(4);
  activeTab = signal<'RANKING' | 'TACTICA' | 'MISIONES' | 'TIRO_LIBRE'>('RANKING');
  filtroMision = signal<string>('TODAS');

  // Lista Gamificada para el Leaderboard en Tiempo Real
  leaderboardList = signal<MobileRankItem[]>([
    {
      id: 'alm-1',
      posicionRanking: 1,
      posicionAnterior: 1,
      nombres: 'Mateo',
      apellidos: 'Gómez',
      dorsal: 10,
      posicionCampo: 'Volante Ofensivo',
      categoriaNombre: 'Sub-15 Élite',
      fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
      tier: 'ORO',
      nivel: 14,
      overallRating: 88,
      xpTotal: 3450,
      rachaEntrenamientos: 12
    },
    {
      id: 'alm-2',
      posicionRanking: 2,
      posicionAnterior: 3,
      nombres: 'Samuel',
      apellidos: 'Díaz',
      dorsal: 7,
      posicionCampo: 'Extremo Derecho',
      categoriaNombre: 'Sub-17 Pro',
      fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      tier: 'ORO',
      nivel: 13,
      overallRating: 86,
      xpTotal: 3120,
      rachaEntrenamientos: 9
    },
    {
      id: 'alm-3',
      posicionRanking: 3,
      posicionAnterior: 2,
      nombres: 'Esteban',
      apellidos: 'Pérez',
      dorsal: 4,
      posicionCampo: 'Defensa Central',
      categoriaNombre: 'Sub-17 Pro',
      fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      tier: 'PLATA',
      nivel: 12,
      overallRating: 83,
      xpTotal: 2850,
      rachaEntrenamientos: 8
    },
    {
      id: 'alm-4',
      posicionRanking: 4,
      posicionAnterior: 5,
      nombres: 'Sebastián',
      apellidos: 'Muñoz',
      dorsal: 1,
      posicionCampo: 'Arquero Titular',
      categoriaNombre: 'Sub-15 Élite',
      fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      tier: 'PLATA',
      nivel: 11,
      overallRating: 81,
      xpTotal: 2640,
      rachaEntrenamientos: 6
    },
    {
      id: 'alm-5',
      posicionRanking: 5,
      posicionAnterior: 4,
      nombres: 'Santiago',
      apellidos: 'Restrepo',
      dorsal: 8,
      posicionCampo: 'Mediocentro',
      categoriaNombre: 'Sub-15 Élite',
      fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
      tier: 'PLATA',
      nivel: 11,
      overallRating: 80,
      xpTotal: 2510,
      rachaEntrenamientos: 5
    },
    {
      id: 'alm-8',
      posicionRanking: 6,
      posicionAnterior: 7,
      nombres: 'Samuel',
      apellidos: 'Vásquez',
      dorsal: 11,
      posicionCampo: 'Extremo Izquierdo',
      categoriaNombre: 'Sub-15 Élite',
      fotoUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200',
      tier: 'BRONCE',
      nivel: 7,
      overallRating: 72,
      xpTotal: 1580,
      rachaEntrenamientos: 0
    }
  ]);

  top3Alumnos = computed(() => {
    return this.leaderboardList().slice(0, 3);
  });

  // Nivel y Cálculo de Tarjeta
  nivel = computed(() => Math.floor(this.xpTotal() / 500) + 1);
  xpActualNivel = computed(() => this.xpTotal() % 500);
  xpMetaNivel = signal<number>(500);
  porcentajeProgreso = computed(() => (this.xpActualNivel() / this.xpMetaNivel()) * 100);

  tier = computed<CardTier>(() => {
    const lvl = this.nivel();
    if (lvl <= 5) return 'BRONCE';
    if (lvl <= 15) return 'PLATA';
    if (lvl <= 25) return 'ORO';
    return 'ELITE';
  });

  overallRating = computed(() => {
    const base = 70;
    const bonus = Math.min(29, this.nivel() * 2);
    return base + bonus;
  });

  stats = computed(() => {
    const ovr = this.overallRating();
    return {
      ritmo: Math.min(99, ovr + 3),
      tiro: Math.min(99, ovr - 2),
      pase: Math.min(99, ovr + 1),
      regate: Math.min(99, ovr + 2),
      defensa: Math.max(55, ovr - 18),
      fisico: Math.min(99, ovr - 4)
    };
  });

  // Trivias Tácticas
  preguntas: TacticalQuestion[] = [
    {
      id: 1,
      contexto: 'Salida de presión rival en bloque alto (Minuto 35)',
      situacion: 'Tu lateral derecho está acorralado en la banda por dos rivales y tú eres el extremo desmarcado hacia adentro.',
      opciones: [
        { texto: 'Tirar una diagonal corta de apoyo para ofrecer pared y descargar en 1 toque.', correcta: true, feedback: '¡Excelente! Generas superioridad numérica y rompes la primera línea de presión.' },
        { texto: 'Quedarte pegado a la línea esperando un pelotazo largo por arriba.', correcta: false, feedback: 'El balón largo es impreciso bajo presión y facilita la intercepción defensiva.' },
        { texto: 'Gritarle al arquero para que salga de su área.', correcta: false, feedback: 'El arquero está demasiado lejos y no es una línea de pase segura en esa zona.' }
      ],
      xpRecompensa: 50
    },
    {
      id: 2,
      contexto: 'Contraataque veloz 3 vs 2 a favor (Minuto 78)',
      situacion: 'Conduces por el centro del campo y el defensa central rival sale a achicarte el espacio de tiro.',
      opciones: [
        { texto: 'Filtrar el pase al espacio para el extremo que pica en diagonal al segundo palo.', correcta: true, feedback: '¡Visión de crack! Aprovechas el arrastre de marca para dejar al compañero mano a mano.' },
        { texto: 'Patear inmediatamente desde 35 metros con marca encima.', correcta: false, feedback: 'Es un tiro forzado con baja probabilidad cuando tenías pase claro con ventaja.' },
        { texto: 'Frenar la jugada y esperar que todo el equipo suba.', correcta: false, feedback: 'Pierdes la ventaja de la transición rápida y permites que el rival se repliegue.' }
      ],
      xpRecompensa: 50
    },
    {
      id: 3,
      contexto: 'Defensa de Tiro de Esquina en contra (Minuto 89)',
      situacion: 'El rival cobra en corto buscando centro pasado al segundo poste.',
      opciones: [
        { texto: 'Bascular con la línea defensiva, perfilado para despejar hacia afuera de la cancha.', correcta: true, feedback: '¡Perfecto orden táctico! Evitas habilitar rivales y despejas a zona segura.' },
        { texto: 'Mirar fijamente solo el balón sin referenciar a tu marca asignada.', correcta: false, feedback: 'Grave error. Si pierdes de vista a tu jugador, puede anticiparte y cabecear solo.' },
        { texto: 'Salir corriendo hacia el medio campo antes de que cabeceen.', correcta: false, feedback: 'Dejas a tu arquero en inferioridad y regalas el segundo palo.' }
      ],
      xpRecompensa: 50
    }
  ];

  currentQuestionIndex = signal<number>(0);
  selectedOption = signal<number | null>(null);
  mostrarResultado = signal<boolean>(false);
  triviaFinalizada = signal<boolean>(false);

  currentQuestion = computed(() => this.preguntas[this.currentQuestionIndex()]);

  isRespuestaCorrecta = computed(() => {
    const sel = this.selectedOption();
    if (sel === null) return false;
    return this.currentQuestion().opciones[sel]?.correcta || false;
  });

  feedbackMensaje = computed(() => {
    const sel = this.selectedOption();
    if (sel === null) return '';
    return this.currentQuestion().opciones[sel]?.feedback || '';
  });

  // Misiones y Exigencias Reales
  misiones = signal<PlayerMission[]>([
    {
      id: 'm1',
      tipo: 'ENTRENAMIENTO',
      titulo: 'Racha de Asistencia Impecable',
      descripcion: 'Asistir puntualmente a 3 entrenamientos consecutivos esta semana.',
      xp: 150,
      progreso: 3,
      meta: 3,
      completada: false,
      icono: 'fa-solid fa-stopwatch-20',
      exigenciaBadge: 'Disciplina DT'
    },
    {
      id: 'm2',
      tipo: 'ENTRENAMIENTO',
      titulo: 'Récord de Velocidad 30m',
      descripcion: 'Bajar tu marca personal en el test de sprint con el preparador físico.',
      xp: 100,
      progreso: 1,
      meta: 1,
      completada: true,
      icono: 'fa-solid fa-bolt',
      exigenciaBadge: 'Test Biométrico'
    },
    {
      id: 'm3',
      tipo: 'AMISTOSO',
      titulo: 'Asistencia o Gol de Jugada',
      descripcion: 'Generar al menos 1 pase de gol o tiro a puerta en el partido de práctica.',
      xp: 120,
      progreso: 1,
      meta: 1,
      completada: false,
      icono: 'fa-solid fa-futbol',
      exigenciaBadge: 'Rendimiento Amistoso'
    },
    {
      id: 'm4',
      tipo: 'OFICIAL',
      titulo: 'Fair Play & Victoria de Liga',
      descripcion: 'Completar el partido oficial sin amonestaciones y sumar los 3 puntos.',
      xp: 250,
      progreso: 1,
      meta: 2,
      completada: false,
      icono: 'fa-solid fa-shield-halved',
      exigenciaBadge: 'Liga Oficial x2 XP'
    }
  ]);

  misionesFiltradas = computed(() => {
    const f = this.filtroMision();
    if (f === 'TODAS') return this.misiones();
    return this.misiones().filter(m => m.tipo === f);
  });

  // Minijuego Tiro Libre
  golesMarcados = signal<number>(3);
  keeperPosicion = signal<string>('center');
  disparando = signal<boolean>(false);
  tiroResultadoMensaje = signal<string | null>(null);
  esGol = signal<boolean>(true);

  ngOnInit(): void {
    // Suscripción a eventos WebSocket en tiempo real
    this.socketSub = this.socketService.getEvents$().subscribe((ev: RankingSocketEvent) => {
      this.procesarEventoSocket(ev);
    });
  }

  ngOnDestroy(): void {
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
  }

  private procesarEventoSocket(ev: RankingSocketEvent): void {
    this.leaderboardList.update(list => {
      const updated = list.map(item => {
        if (item.id === ev.jugadorId) {
          return {
            ...item,
            posicionAnterior: item.posicionRanking,
            xpTotal: ev.nuevoXpTotal,
            overallRating: ev.nuevoOvr,
            nivel: ev.nuevoNivel
          };
        }
        return item;
      });

      // Re-ordenar automáticamente por puntaje descendente
      return updated
        .sort((a, b) => b.xpTotal - a.xpTotal)
        .map((p, idx) => ({ ...p, posicionRanking: idx + 1 }));
    });

    // Si el evento afecta al usuario activo (Samuel Díaz #7)
    if (ev.jugadorId === 'alm-2') {
      this.xpTotal.set(ev.nuevoXpTotal);
      if (ev.xpDelta > 0) {
        this.alertService.success(`⚡ ¡Has ganado +${ev.xpDelta} XP! Nuevo total: ${ev.nuevoXpTotal}`);
      } else {
        this.alertService.error(`⚠️ Penalización aplicada: ${ev.xpDelta} XP.`);
      }
    }
  }

  setTab(tab: 'RANKING' | 'TACTICA' | 'MISIONES' | 'TIRO_LIBRE') {
    this.activeTab.set(tab);
  }

  verDetalleAlumno(alumno: MobileRankItem): void {
    this.alertService.info(`${alumno.nombres} ${alumno.apellidos}: Rank #${alumno.posicionRanking} • ${alumno.xpTotal} XP • OVR ${alumno.overallRating}`);
  }

  getTierClass(tier: CardTier): string {
    switch (tier) {
      case 'BRONCE': return 'tier-bronce';
      case 'PLATA': return 'tier-plata';
      case 'ORO': return 'tier-oro';
      case 'ELITE': return 'tier-elite';
    }
  }

  getSiguienteTier(): string {
    const t = this.tier();
    if (t === 'BRONCE') return 'PLATA';
    if (t === 'PLATA') return 'ORO';
    if (t === 'ORO') return 'ÉLITE PRO';
    return 'MÁXIMO';
  }

  getNivelSiguienteTier(): number {
    const t = this.tier();
    if (t === 'BRONCE') return 6;
    if (t === 'PLATA') return 16;
    if (t === 'ORO') return 26;
    return 50;
  }

  getLetter(idx: number): string {
    return ['A', 'B', 'C', 'D'][idx] || '';
  }

  selectOption(idx: number) {
    this.selectedOption.set(idx);
  }

  confirmarRespuesta() {
    this.mostrarResultado.set(true);
    if (this.isRespuestaCorrecta()) {
      this.xpTotal.update(x => x + this.currentQuestion().xpRecompensa);
      this.rachaTrivia.update(r => r + 1);
    } else {
      this.rachaTrivia.set(0);
    }
  }

  siguientePregunta() {
    this.mostrarResultado.set(false);
    this.selectedOption.set(null);
    if (this.currentQuestionIndex() < this.preguntas.length - 1) {
      this.currentQuestionIndex.update(i => i + 1);
    } else {
      this.triviaFinalizada.set(true);
    }
  }

  reiniciarTrivia() {
    this.currentQuestionIndex.set(0);
    this.selectedOption.set(null);
    this.mostrarResultado.set(false);
    this.triviaFinalizada.set(false);
  }

  reclamarMision(m: PlayerMission) {
    if (m.completada) return;
    this.xpTotal.update(x => x + m.xp);
    this.misiones.update(list =>
      list.map(item => item.id === m.id ? { ...item, completada: true } : item)
    );
  }

  disparar(zonaId: number) {
    if (this.disparando()) return;
    this.disparando.set(true);

    const opcionesKeeper = ['dive-left', 'dive-right', 'dive-center'];
    const keeperChoice = opcionesKeeper[Math.floor(Math.random() * opcionesKeeper.length)];
    this.keeperPosicion.set(keeperChoice);

    setTimeout(() => {
      // Determinación de gol
      const gol = (zonaId === 1 && keeperChoice !== 'dive-left') ||
                  (zonaId === 2 && keeperChoice !== 'dive-right') ||
                  (zonaId === 3 && keeperChoice !== 'dive-left') ||
                  (zonaId === 4 && keeperChoice !== 'dive-right');

      this.esGol.set(gol);
      if (gol) {
        this.golesMarcados.update(g => Math.min(5, g + 1));
        this.xpTotal.update(x => x + 40);
        this.tiroResultadoMensaje.set('¡GOOOLAZO AL ÁNGULO! +40 XP Ganados ⚽🔥');
      } else {
        this.tiroResultadoMensaje.set('¡Atajó el arquero con reflejos felinos! Intenta otro ángulo 🧤');
      }

      setTimeout(() => {
        this.disparando.set(false);
        this.keeperPosicion.set('center');
      }, 1500);
    }, 400);
  }
}

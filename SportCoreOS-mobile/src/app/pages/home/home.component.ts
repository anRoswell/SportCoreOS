import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  template: `
    <app-mobile-header></app-mobile-header>

    <main class="mobile-home-container">
      <!-- HERO PRINCIPAL DE IMPACTO TÁCTICO -->
      <section class="stadium-hero-card">
        <div class="hero-bg-glow"></div>
        <div class="hero-tactical-grid"></div>

        <div class="hero-top-row">
          <div class="user-greeting-wrap">
            <span class="greeting-subtitle">
              <span class="live-pulse-dot"></span> TEMPORADA 2026 • LIGA OFICIAL
            </span>
            <h2 class="greeting-title">
              ¡Hola, <span class="text-gradient">{{ getPrimerNombre() }}</span>! ⚽
            </h2>
          </div>

          <a routerLink="/notificaciones" class="bell-pill-badge" title="Notificaciones">
            <i class="fa-solid fa-bell"></i>
            <span class="notif-counter-badge">2</span>
          </a>
        </div>

        <!-- Tarjeta de Estado del Deportista / Carnet Mini -->
        <div class="athlete-quick-status">
          <div class="athlete-avatar-box">
            <img [src]="auth.demoPersonas[3].avatar" alt="Jugador" class="athlete-img" />
            <span class="dorsal-tag">#10</span>
          </div>
          <div class="athlete-info">
            <div class="athlete-name-row">
              <span class="athlete-name">Samuel Díaz Restrepo</span>
              <span class="cat-pill">Sub-15 Élite</span>
            </div>
            <div class="metrics-row">
              <div class="mini-stat">
                <i class="fa-solid fa-gauge-high text-emerald"></i>
                <span>Rendimiento: <strong>94%</strong></span>
              </div>
              <div class="mini-stat">
                <i class="fa-solid fa-circle-check text-blue"></i>
                <span>Paz y Salvo: <strong class="text-emerald">Al día</strong></span>
              </div>
            </div>
          </div>
        </div>

        <!-- KPI Ticker en 3 columnas -->
        <div class="hero-kpis-grid">
          <div class="hero-kpi-item">
            <div class="kpi-icon-wrap emerald">
              <i class="fa-solid fa-calendar-check"></i>
            </div>
            <div class="kpi-texts">
              <span class="kpi-value">3</span>
              <span class="kpi-label">Partidos</span>
            </div>
          </div>

          <div class="hero-kpi-item">
            <div class="kpi-icon-wrap blue">
              <i class="fa-solid fa-users"></i>
            </div>
            <div class="kpi-texts">
              <span class="kpi-value">11</span>
              <span class="kpi-label">Titular</span>
            </div>
          </div>

          <div class="hero-kpi-item">
            <div class="kpi-icon-wrap amber">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div class="kpi-texts">
              <span class="kpi-value">IA 4.8</span>
              <span class="kpi-label">Boletín</span>
            </div>
          </div>
        </div>
      </section>

      <!-- PRÓXIMO PARTIDO MATCHDAY CARD -->
      <section class="section-card-wrapper">
        <div class="section-header-row">
          <div class="header-left-title">
            <i class="fa-solid fa-trophy text-amber"></i>
            <h3>Próximo Encuentro Oficial</h3>
          </div>
          <a routerLink="/partidos" class="link-see-all">Ver Fixture <i class="fa-solid fa-chevron-right"></i></a>
        </div>

        @if (proximoPartido()) {
          <div class="match-live-card">
            <!-- Header del Match -->
            <div class="match-status-strip">
              <span class="match-category-tag">⚽ {{ proximoPartido()?.categoria_nombre || 'Sub-15 Élite' }}</span>
              <span class="countdown-badge">
                <i class="fa-regular fa-clock"></i> {{ proximoPartido()?.hora_partido }} (Citación: {{ proximoPartido()?.hora_citacion }})
              </span>
            </div>

            <!-- Versus Pitch -->
            <div class="versus-pitch-board">
              <div class="team-column">
                <div class="crest-frame club">
                  <span class="crest-sigla">{{ auth.activeClub().sigla }}</span>
                </div>
                <span class="team-title">{{ auth.activeClub().nombre }}</span>
                <span class="kit-badge">Uniforme Titular</span>
              </div>

              <div class="versus-center">
                <div class="vs-circle">VS</div>
                <span class="match-date-badge">{{ proximoPartido()?.fecha_partido }}</span>
              </div>

              <div class="team-column">
                <div class="crest-frame rival">
                  <span class="rival-icon">⚔️</span>
                </div>
                <span class="team-title">{{ proximoPartido()?.rival_nombre }}</span>
                <span class="kit-badge rival-kit">Visitante</span>
              </div>
            </div>

            <!-- Location & Navigation Bar -->
            <div class="pitch-venue-bar">
              <div class="venue-info">
                <i class="fa-solid fa-location-dot text-emerald"></i>
                <span>{{ proximoPartido()?.sede_cancha }}</span>
              </div>
              <button class="btn-gps-route" (click)="openGps(proximoPartido()?.sede_cancha)" title="Abrir en Waze / Google Maps">
                <i class="fa-solid fa-diamond-turn-right"></i> GPS
              </button>
            </div>

            <!-- Botones de Acción Rápida de Partido -->
            <div class="match-actions-grid">
              <a routerLink="/convocatorias" [queryParams]="{ partidoId: proximoPartido()?.id }" class="btn-action-primary">
                <i class="fa-solid fa-clipboard-user"></i>
                <span>Ver Convocatoria (Titulares / Suplentes)</span>
              </a>
            </div>
          </div>
        }
      </section>

      <!-- ACCIONES RÁPIDAS MODULARES CON DISEÑO DE ALTO IMPACTO -->
      <section class="section-card-wrapper">
        <div class="section-header-row">
          <div class="header-left-title">
            <i class="fa-solid fa-grip text-emerald"></i>
            <h3>Módulos & Operaciones Deportivas</h3>
          </div>
        </div>

        <div class="modules-grid-2col">
          <!-- Convocatorias -->
          <a routerLink="/convocatorias" class="module-card card-emerald">
            <div class="module-icon-box">
              <i class="fa-solid fa-clipboard-user"></i>
            </div>
            <div class="module-content">
              <h4>Convocatorias</h4>
              <p>11 Titulares, Suplentes & WhatsApp</p>
            </div>
            <i class="fa-solid fa-chevron-right arrow-icon"></i>
          </a>

          <!-- Asistencia Entrenamientos -->
          <a routerLink="/entrenamientos" class="module-card card-blue">
            <div class="module-icon-box">
              <i class="fa-solid fa-stopwatch-20"></i>
            </div>
            <div class="module-content">
              <h4>Asistencia Campo</h4>
              <p>Pase de lista y novedades</p>
            </div>
            <i class="fa-solid fa-chevron-right arrow-icon"></i>
          </a>

          <!-- Canchas y Sedes -->
          <a routerLink="/canchas" class="module-card card-teal">
            <div class="module-icon-box">
              <i class="fa-solid fa-futbol"></i>
            </div>
            <div class="module-content">
              <h4>Canchas & Sedes</h4>
              <p>Reserva sintética y GPS</p>
            </div>
            <i class="fa-solid fa-chevron-right arrow-icon"></i>
          </a>

          <!-- Pagos y Recaudos -->
          <a routerLink="/pagos" class="module-card card-purple">
            <div class="module-icon-box">
              <i class="fa-solid fa-credit-card"></i>
            </div>
            <div class="module-content">
              <h4>Pagos PSE & Recaudos</h4>
              <p>Mensualidades y extractos</p>
            </div>
            <i class="fa-solid fa-chevron-right arrow-icon"></i>
          </a>

          <!-- Tienda Oficial -->
          <a routerLink="/tienda" class="module-card card-amber">
            <div class="module-icon-box">
              <i class="fa-solid fa-bag-shopping"></i>
            </div>
            <div class="module-content">
              <h4>Tienda Oficial</h4>
              <p>Indumentaria, kits y dorsales</p>
            </div>
            <i class="fa-solid fa-chevron-right arrow-icon"></i>
          </a>

          <!-- Clínicas & Masterclasses Pro -->
          <a routerLink="/servicios" class="module-card card-emerald">
            <div class="module-icon-box">
              <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <div class="module-content">
              <h4>Clínicas & Masterclasses</h4>
              <p>Explosividad, regate y porteros</p>
            </div>
            <i class="fa-solid fa-chevron-right arrow-icon"></i>
          </a>

          <!-- Modo Carrera / Evolution Card -->
          <a routerLink="/juego-carrera" class="module-card card-gold">
            <div class="module-icon-box">
              <i class="fa-solid fa-gamepad"></i>
            </div>
            <div class="module-content">
              <h4>Modo Carrera: Evolution</h4>
              <p>Sube de nivel tu carta FUT con XP</p>
            </div>
            <i class="fa-solid fa-chevron-right arrow-icon"></i>
          </a>

          <!-- Radar Biométrico & IA -->
          <a routerLink="/rendimiento" class="module-card card-rose">
            <div class="module-icon-box">
              <i class="fa-solid fa-chart-simple"></i>
            </div>
            <div class="module-content">
              <h4>Radar & Biometría</h4>
              <p>Tests físicos y progresión</p>
            </div>
            <i class="fa-solid fa-chevron-right arrow-icon"></i>
          </a>

          <!-- Carnet Digital -->
          <a routerLink="/perfil/carnet" class="module-card card-indigo">
            <div class="module-icon-box">
              <i class="fa-solid fa-id-card"></i>
            </div>
            <div class="module-content">
              <h4>Carnet Digital</h4>
              <p>QR de acceso y ficha médica</p>
            </div>
            <i class="fa-solid fa-chevron-right arrow-icon"></i>
          </a>

          <!-- Boletín IA -->
          <a routerLink="/perfil/boletin-ia" class="module-card card-cyan">
            <div class="module-icon-box">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
            </div>
            <div class="module-content">
              <h4>Boletín Táctico IA</h4>
              <p>Informe predictivo con IA</p>
            </div>
            <i class="fa-solid fa-chevron-right arrow-icon"></i>
          </a>
        </div>
      </section>

      <!-- BANNER DE SOPORTE & ATENCIÓN AL CLUB -->
      <section class="support-banner" (click)="onSupportClick()">
        <div class="support-icon-circle">
          <i class="fa-solid fa-headset"></i>
        </div>
        <div class="support-text">
          <h5>Línea Directa de Atención al Club</h5>
          <p>Comunícate con la coordinación deportiva y médica 24/7</p>
        </div>
        <button class="btn-contact-pill">
          <i class="fa-brands fa-whatsapp"></i> Chat
        </button>
      </section>
    </main>

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .mobile-home-container {
      padding: 0.85rem 1rem calc(80px + var(--safe-area-bottom));
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
      background: #0b1510;
      background: linear-gradient(180deg, #0b1510 0%, #0f172a 40%, #020617 100%);
      min-height: calc(100vh - 60px);
    }

    /* HERO PRINCIPAL */
    .stadium-hero-card {
      position: relative;
      background: linear-gradient(145deg, rgba(6, 78, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%);
      border: 1px solid rgba(16, 185, 129, 0.35);
      border-radius: 20px;
      padding: 1.15rem;
      overflow: hidden;
      box-shadow: 0 12px 32px -8px rgba(5, 150, 105, 0.35);

      .hero-bg-glow {
        position: absolute;
        top: -30px;
        right: -30px;
        width: 140px;
        height: 140px;
        background: radial-gradient(circle, rgba(16, 185, 129, 0.35) 0%, transparent 70%);
        pointer-events: none;
      }

      .hero-tactical-grid {
        position: absolute;
        inset: 0;
        background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
        background-size: 16px 16px;
        pointer-events: none;
      }

      .hero-top-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.85rem;
        position: relative;
        z-index: 1;

        .user-greeting-wrap {
          .greeting-subtitle {
            font-size: 0.62rem;
            font-weight: 800;
            color: #a7f3d0;
            letter-spacing: 0.08em;
            display: flex;
            align-items: center;
            gap: 5px;
            margin-bottom: 2px;

            .live-pulse-dot {
              width: 6px;
              height: 6px;
              background: #10b981;
              border-radius: 50%;
              box-shadow: 0 0 8px #10b981;
            }
          }

          .greeting-title {
            font-size: 1.35rem;
            font-weight: 900;
            color: #ffffff;
            margin: 0;
            line-height: 1.2;

            .text-gradient {
              background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
          }
        }

        .bell-pill-badge {
          position: relative;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;

          .notif-counter-badge {
            position: absolute;
            top: -4px;
            right: -4px;
            background: #ef4444;
            color: #ffffff;
            font-size: 0.6rem;
            font-weight: 900;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1.5px solid #0f172a;
          }
        }
      }

      .athlete-quick-status {
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 14px;
        padding: 0.75rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.85rem;
        position: relative;
        z-index: 1;

        .athlete-avatar-box {
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          overflow: hidden;
          border: 2px solid #10b981;
          flex-shrink: 0;

          .athlete-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .dorsal-tag {
            position: absolute;
            bottom: 0;
            right: 0;
            background: #0f172a;
            color: #34d399;
            font-size: 0.58rem;
            font-weight: 900;
            padding: 1px 4px;
            border-top-left-radius: 4px;
          }
        }

        .athlete-info {
          flex: 1;
          min-width: 0;

          .athlete-name-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 3px;

            .athlete-name {
              font-size: 0.84rem;
              font-weight: 800;
              color: #ffffff;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .cat-pill {
              font-size: 0.6rem;
              font-weight: 800;
              color: #38bdf8;
              background: rgba(56, 189, 248, 0.15);
              padding: 1px 6px;
              border-radius: 4px;
              border: 1px solid rgba(56, 189, 248, 0.3);
            }
          }

          .metrics-row {
            display: flex;
            gap: 0.75rem;
            font-size: 0.68rem;
            color: #94a3b8;

            .mini-stat {
              display: flex;
              align-items: center;
              gap: 4px;

              strong { color: #f8fafc; font-weight: 700; }
            }
          }
        }
      }

      .hero-kpis-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
        position: relative;
        z-index: 1;

        .hero-kpi-item {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.55rem 0.4rem;
          display: flex;
          align-items: center;
          gap: 6px;

          .kpi-icon-wrap {
            width: 28px;
            height: 28px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            flex-shrink: 0;

            &.emerald { background: rgba(16, 185, 129, 0.2); color: #34d399; }
            &.blue { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
            &.amber { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
          }

          .kpi-texts {
            display: flex;
            flex-direction: column;

            .kpi-value {
              font-size: 0.88rem;
              font-weight: 900;
              color: #ffffff;
              line-height: 1;
            }

            .kpi-label {
              font-size: 0.58rem;
              font-weight: 700;
              color: #94a3b8;
            }
          }
        }
      }
    }

    /* MATCH CARD */
    .section-card-wrapper {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;

      .section-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-left-title {
          display: flex;
          align-items: center;
          gap: 6px;

          i { font-size: 0.95rem; }

          h3 {
            font-size: 0.92rem;
            font-weight: 800;
            color: #f8fafc;
            margin: 0;
            letter-spacing: -0.01em;
          }
        }

        .link-see-all {
          font-size: 0.72rem;
          font-weight: 700;
          color: #34d399;
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .match-live-card {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);

      .match-status-strip {
        background: rgba(15, 23, 42, 0.8);
        padding: 0.5rem 0.85rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);

        .match-category-tag {
          font-size: 0.72rem;
          font-weight: 800;
          color: #38bdf8;
        }

        .countdown-badge {
          font-size: 0.68rem;
          font-weight: 700;
          color: #fde68a;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }

      .versus-pitch-board {
        padding: 1rem 0.85rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: radial-gradient(circle at center, rgba(6, 78, 59, 0.3) 0%, transparent 80%);

        .team-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 38%;

          .crest-frame {
            width: 46px;
            height: 46px;
            border-radius: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 0.35rem;

            &.club {
              background: linear-gradient(135deg, #059669 0%, #047857 100%);
              border: 2px solid #34d399;
              box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);

              .crest-sigla {
                font-size: 0.88rem;
                font-weight: 900;
                color: #ffffff;
              }
            }

            &.rival {
              background: #334155;
              border: 2px solid #64748b;

              .rival-icon {
                font-size: 1.2rem;
              }
            }
          }

          .team-title {
            font-size: 0.78rem;
            font-weight: 800;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }

          .kit-badge {
            font-size: 0.58rem;
            font-weight: 700;
            color: #6ee7b7;
            background: rgba(5, 150, 105, 0.2);
            padding: 1px 6px;
            border-radius: 4px;
            margin-top: 2px;

            &.rival-kit {
              color: #94a3b8;
              background: rgba(148, 163, 184, 0.15);
            }
          }
        }

        .versus-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;

          .vs-circle {
            width: 32px;
            height: 32px;
            background: #0f172a;
            color: #34d399;
            font-size: 0.75rem;
            font-weight: 900;
            border-radius: 50%;
            border: 1.5px solid rgba(52, 211, 153, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .match-date-badge {
            font-size: 0.62rem;
            font-weight: 800;
            color: #94a3b8;
          }
        }
      }

      .pitch-venue-bar {
        padding: 0.6rem 0.85rem;
        background: rgba(15, 23, 42, 0.6);
        border-top: 1px solid rgba(255, 255, 255, 0.05);
        display: flex;
        justify-content: space-between;
        align-items: center;

        .venue-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          color: #cbd5e1;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 75%;
        }

        .btn-gps-route {
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(16, 185, 129, 0.35);
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 0.68rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 3px;
        }
      }

      .match-actions-grid {
        padding: 0.65rem 0.85rem;
        background: #1e293b;

        .btn-action-primary {
          width: 100%;
          height: 38px;
          background: linear-gradient(135deg, #059669 0%, #047857 100%);
          color: #ffffff;
          border-radius: 10px;
          font-size: 0.78rem;
          font-weight: 800;
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
        }
      }
    }

    /* ACCIONES RÁPIDAS EN GRID 2 COLUMNAS */
    .modules-grid-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.65rem;

      .module-card {
        background: #1e293b;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
        padding: 0.85rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        text-decoration: none;
        position: relative;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        &:active {
          transform: scale(0.97);
          background: #334155;
        }

        .module-icon-box {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }

        .module-content {
          h4 {
            font-size: 0.82rem;
            font-weight: 800;
            color: #ffffff;
            margin: 0 0 2px;
          }

          p {
            font-size: 0.66rem;
            color: #94a3b8;
            margin: 0;
            line-height: 1.3;
          }
        }

        .arrow-icon {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 0.65rem;
          color: rgba(255, 255, 255, 0.3);
        }

        &.card-emerald {
          border-left: 3px solid #10b981;
          .module-icon-box { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        }
        &.card-blue {
          border-left: 3px solid #3b82f6;
          .module-icon-box { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
        }
        &.card-teal {
          border-left: 3px solid #14b8a6;
          .module-icon-box { background: rgba(20, 184, 166, 0.15); color: #2dd4bf; }
        }
        &.card-purple {
          border-left: 3px solid #a855f7;
          .module-icon-box { background: rgba(168, 85, 247, 0.15); color: #c084fc; }
        }
        &.card-amber {
          border-left: 3px solid #f59e0b;
          .module-icon-box { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        }
        &.card-gold {
          border-left: 3px solid #eab308;
          background: linear-gradient(145deg, rgba(234, 179, 8, 0.08) 0%, #1e293b 100%);
          .module-icon-box { background: rgba(234, 179, 8, 0.2); color: #facc15; }
        }
        &.card-rose {
          border-left: 3px solid #f43f5e;
          .module-icon-box { background: rgba(244, 63, 94, 0.15); color: #fb7185; }
        }
        &.card-indigo {
          border-left: 3px solid #6366f1;
          .module-icon-box { background: rgba(99, 102, 241, 0.15); color: #818cf8; }
        }
        &.card-cyan {
          border-left: 3px solid #06b6d4;
          .module-icon-box { background: rgba(6, 182, 212, 0.15); color: #22d3ee; }
        }
      }
    }

    /* BANNER DE SOPORTE */
    .support-banner {
      background: linear-gradient(135deg, rgba(6, 78, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 16px;
      padding: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;

      .support-icon-circle {
        width: 38px;
        height: 38px;
        background: #059669;
        color: #ffffff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        flex-shrink: 0;
      }

      .support-text {
        flex: 1;

        h5 {
          font-size: 0.78rem;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 2px;
        }

        p {
          font-size: 0.64rem;
          color: #a7f3d0;
          margin: 0;
        }
      }

      .btn-contact-pill {
        background: #25d366;
        color: #ffffff;
        border: none;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 0.72rem;
        font-weight: 800;
        display: flex;
        align-items: center;
        gap: 4px;
        flex-shrink: 0;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  auth = inject(AuthService);
  alert = inject(AlertService);
  private http = inject(HttpClient);

  readonly proximoPartido = signal<any | null>(null);

  getPrimerNombre(): string {
    const nombres = this.auth.currentUser()?.nombres;
    if (!nombres) return 'Deportista';
    return nombres.split(' ')[0] || 'Deportista';
  }

  ngOnInit(): void {
    this.http.get<any>(`${environment.apiUrl}/partidos`).subscribe({
      next: (res) => {
        const partidos = Array.isArray(res) ? res : (res?.data || []);
        if (partidos.length > 0) {
          this.proximoPartido.set(partidos[0]);
        } else {
          this.setFallbackMatch();
        }
      },
      error: () => {
        this.setFallbackMatch();
      }
    });
  }

  private setFallbackMatch(): void {
    this.proximoPartido.set({
      id: 'partido-demo-1',
      rival_nombre: 'Atlético Nacional Cantera',
      categoria_nombre: 'Sub-15 Élite',
      fecha_partido: '28 de Septiembre, 2026',
      hora_partido: '10:30 AM',
      hora_citacion: '09:30 AM',
      sede_cancha: 'Cancha Sintética Principal Los Arrayanes'
    });
  }

  openGps(cancha?: string): void {
    const query = encodeURIComponent(`Cancha ${cancha || 'Los Arrayanes'} Bogotá`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  }

  onSupportClick(): void {
    this.alert.info('Conectando con la línea oficial de atención WhatsApp de tu club...', 'Atención al Deportista');
  }
}

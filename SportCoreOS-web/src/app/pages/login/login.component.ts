import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, DemoPersona } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <!-- Botón Flotante para cambiar Tema (Light / Dark) -->
      <button 
        class="theme-toggle-floating" 
        (click)="themeService.toggleTheme()" 
        [title]="themeService.isDark() ? 'Cambiar a Modo Claro (Limpio)' : 'Cambiar a Modo Oscuro (Dark Sport)'">
        @if (themeService.isDark()) {
          <i class="fa-solid fa-sun" style="color: #f59e0b;"></i>
          <span>Modo Claro</span>
        } @else {
          <i class="fa-solid fa-moon" style="color: #38bdf8;"></i>
          <span>Modo Oscuro</span>
        }
      </button>

      <div class="login-container">
        <!-- COLUMNA IZQUIERDA: HERO SPORT BRANDING -->
        <div class="login-hero">
          <div class="hero-content">
            <!-- Brand Badge -->
            <div class="brand-badge-pill">
              <span class="pulse-dot"></span>
              <span>PLATAFORMA SAAS DEPORTIVA</span>
            </div>

            <h1 class="hero-title">
              La Suite Integral para <span class="highlight">Academias de Fútbol</span> de Alto Rendimiento.
            </h1>

            <p class="hero-subtitle">
              Automatiza la cobranza de pensiones vía PSE/Wompi, organiza convocatorias por WhatsApp en 1 toque, gestiona expedientes 360° y visualiza biometría y telemetría de tus futuras estrellas.
            </p>

            <!-- Grid de Métricas de Confianza -->
            <div class="hero-stats-grid">
              <div class="stat-card">
                <div class="stat-number">+140</div>
                <div class="stat-label">Clubes & Escuelas</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">$1.2B</div>
                <div class="stat-label">Recaudo PSE / Mes</div>
              </div>
              <div class="stat-card">
                <div class="stat-number">98.6%</div>
                <div class="stat-label">Asistencia Confirmada</div>
              </div>
            </div>

            <!-- Features Highlights -->
            <div class="features-list">
              <div class="feature-item">
                <i class="fa-solid fa-circle-check"></i>
                <span>Gestión de Categorías Sub-7 a Sub-20 con control de dorsales únicos</span>
              </div>
              <div class="feature-item">
                <i class="fa-solid fa-circle-check"></i>
                <span>Portal Móvil para Padres con pago de mensualidades express</span>
              </div>
              <div class="feature-item">
                <i class="fa-solid fa-circle-check"></i>
                <span>Enrutamiento GPS a canchas deportivas con Waze y Google Maps</span>
              </div>
            </div>

            <!-- Trust Footer -->
            <div class="hero-trust-footer">
              <span>Tecnología certificada:</span>
              <div class="trust-badges">
                <span class="trust-badge"><i class="fa-solid fa-shield-halved"></i> SSL 256-bit</span>
                <span class="trust-badge"><i class="fa-solid fa-bolt"></i> Wompi / PSE</span>
                <span class="trust-badge"><i class="fa-brands fa-whatsapp"></i> Meta API</span>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMNA DERECHA: FORMULARIO DE ACCESO & PERSONAS DEMO -->
        <div class="login-form-panel">
          <div class="form-wrapper">
            <!-- Header del Formulario -->
            <div class="form-header">
              <div class="brand-header-row">
                <div class="brand-logo">
                  <div class="logo-icon">⚽</div>
                  <div class="logo-text">
                    <h2>SportCore<span class="badge-text">OS</span></h2>
                    <span class="tagline">Sport Management Cloud</span>
                  </div>
                </div>

                <div class="saas-secure-badge">
                  <i class="fa-solid fa-shield-halved"></i>
                  <span>Acceso Corporativo SaaS</span>
                </div>
              </div>

              <div class="welcome-row">
                <h3 class="welcome-heading">Bienvenido de nuevo</h3>
                <p class="welcome-desc">Ingresa tus credenciales o selecciona un rol demo para explorar.</p>
              </div>
            </div>

            <!-- Formulario Principal en 2 Columnas -->
            <form (ngSubmit)="onSubmit()" class="login-form">
              <div class="form-row-2col">
                <!-- Campo Email -->
                <div class="input-group">
                  <label for="email"><i class="fa-solid fa-envelope"></i> Correo Electrónico</label>
                  <div class="input-wrapper">
                    <input 
                      type="email" 
                      id="email" 
                      [(ngModel)]="email" 
                      name="email" 
                      placeholder="ej. carlos.valderrama@sportcore.com" 
                      required 
                      class="sport-input" />
                  </div>
                </div>

                <!-- Campo Contraseña -->
                <div class="input-group">
                  <div class="label-row">
                    <label for="password"><i class="fa-solid fa-lock"></i> Contraseña</label>
                    <a href="javascript:void(0)" (click)="onForgotPassword()" class="forgot-link">¿Olvidaste clave?</a>
                  </div>
                  <div class="input-wrapper">
                    <input 
                      [type]="showPassword() ? 'text' : 'password'" 
                      id="password" 
                      [(ngModel)]="password" 
                      name="password" 
                      placeholder="••••••••••••" 
                      required 
                      class="sport-input" />
                    <button type="button" class="btn-toggle-eye" (click)="togglePasswordVisibility()">
                      <i class="fa-regular" [class.fa-eye]="!showPassword()" [class.fa-eye-slash]="showPassword()"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Fila Submit y Recordar Sesión -->
              <div class="form-actions-bar">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe" />
                  <span class="custom-checkbox"></span>
                  <span class="label-text">Mantener sesión iniciada</span>
                </label>

                <button type="submit" class="btn-login" [disabled]="loading()">
                  @if (loading()) {
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <span>Autenticando...</span>
                  } @else {
                    <i class="fa-solid fa-arrow-right-to-bracket"></i>
                    <span>Iniciar Sesión</span>
                  }
                </button>
              </div>
            </form>

            <!-- Separador -->
            <div class="divider">
              <span>O ACCEDE EN 1 CLIC CON UN PERFIL DEMO</span>
            </div>

            <!-- Indicador de Colegio / Academia Demo -->
            <div class="demo-school-badge">
              <i class="fa-solid fa-school-flag"></i>
              <span class="badge-label">Colegio / Academia Demo:</span>
              <strong class="school-title">Club Deportivo Futuros Cracks FC</strong>
              <span class="badge-city">• Cartagena</span>
            </div>

            <!-- Personas Demo de Prueba -->
            <div class="demo-personas-grid">
              @for (persona of authService.demoPersonas; track persona.id) {
                <button 
                  type="button" 
                  class="persona-btn" 
                  [class]="'persona-' + persona.badgeColor"
                  (click)="loginWithPersona(persona.id)"
                  [title]="persona.descripcion">
                  <div class="persona-avatar">
                    <img [src]="persona.avatar" [alt]="persona.nombres" />
                    <span class="role-indicator"></span>
                  </div>
                  <div class="persona-info">
                    <span class="persona-label">{{ persona.label }}</span>
                    <span class="persona-name">{{ persona.nombres }} {{ persona.apellidos }}</span>
                    <span class="persona-desc">{{ persona.rolLabel }}</span>
                  </div>
                  <i class="fa-solid fa-chevron-right persona-arrow"></i>
                </button>
              }
            </div>

            <!-- Callout Informativo de Seguridad SaaS -->
            <div class="saas-info-callout">
              <div class="callout-icon">
                <i class="fa-solid fa-shield-halved"></i>
              </div>
              <div class="callout-content">
                <strong class="callout-title">Acceso Institucional Centralizado</strong>
                <span class="callout-desc">El registro de nuevas academias y la habilitación de licencias es administrado exclusivamente por el Super Administrador Global.</span>
              </div>
            </div>

            <!-- Toast / Feedback Message -->
            @if (toastMessage()) {
              <div class="toast-alert" [class.error]="isToastError()">
                <i class="fa-solid" [class.fa-circle-exclamation]="isToastError()" [class.fa-circle-check]="!isToastError()"></i>
                <span>{{ toastMessage() }}</span>
              </div>
            }

            <!-- Footer de la Empresa -->
            <div class="form-footer">
              <p>© 2026 SportCoreOS by SECTIC S.A.S. • Todos los derechos reservados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      height: 100vh;
      background: var(--bg-main);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow-x: hidden;
      overflow-y: auto;
      padding: 1rem 1.5rem;
      box-sizing: border-box;
      transition: background-color 0.25s ease;
    }

    /* Botón Flotante para cambiar Tema */
    .theme-toggle-floating {
      position: fixed;
      top: 1.25rem;
      right: 1.5rem;
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.45rem 0.9rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-full);
      color: var(--text-main);
      font-size: 0.8rem;
      font-weight: 600;
      box-shadow: var(--shadow-md);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        border-color: var(--color-primary);
        box-shadow: var(--shadow-glow);
      }

      i {
        color: var(--color-primary);
      }
    }

    .login-container {
      width: 100%;
      max-width: 1480px;
      height: calc(100vh - 2rem);
      max-height: 860px;
      min-height: 580px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-card);
      display: grid;
      grid-template-columns: 1.05fr 1.25fr;
      overflow: hidden;
      position: relative;
      transition: background-color 0.25s ease, border-color 0.25s ease;
    }

    /* =========================================================================
       HERO BRANDING (COLUMNA IZQUIERDA)
       ========================================================================= */
    .login-hero {
      background: linear-gradient(160deg, rgba(9, 15, 29, 0.88) 0%, rgba(13, 23, 46, 0.80) 50%, rgba(6, 78, 59, 0.82) 100%), 
                  url('/assets/images/login-sport-bg.jpg') center center / cover no-repeat;
      color: #ffffff;
      padding: 2.25rem 2.75rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      overflow-y: auto;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at 60% 30%, rgba(16, 185, 129, 0.18) 0%, transparent 65%);
        pointer-events: none;
      }
    }

    .hero-content {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }

    .brand-badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: #34d399;
      width: fit-content;

      .pulse-dot {
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
        box-shadow: 0 0 10px #10b981;
        animation: pulse 2s infinite;
      }
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.3); opacity: 0.6; }
    }

    .hero-title {
      font-size: clamp(1.6rem, 2.1vw, 2.25rem);
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin: 0;

      .highlight {
        background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .hero-subtitle {
      font-size: 0.875rem;
      line-height: 1.45;
      color: #cbd5e1;
      max-width: 540px;
      margin: 0;
    }

    .hero-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 0.85rem 1rem;
      border-radius: var(--radius-lg);
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      gap: 0.15rem;

      .stat-number {
        font-size: 1.45rem;
        font-weight: 800;
        color: #34d399;
        line-height: 1;
      }

      .stat-label {
        font-size: 0.725rem;
        color: #94a3b8;
        font-weight: 600;
      }
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 0.55rem;

      .feature-item {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        font-size: 0.825rem;
        color: #e2e8f0;

        i {
          color: #34d399;
          font-size: 0.9rem;
        }
      }
    }

    .hero-trust-footer {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      font-size: 0.75rem;
      color: #94a3b8;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);

      .trust-badges {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
      }

      .trust-badge {
        background: rgba(255, 255, 255, 0.08);
        padding: 0.2rem 0.55rem;
        border-radius: var(--radius-xs);
        font-size: 0.725rem;
        color: #cbd5e1;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;

        i {
          color: #34d399;
        }
      }
    }

    /* =========================================================================
       FORM PANEL (COLUMNA DERECHA)
       ========================================================================= */
    .login-form-panel {
      background: var(--bg-card);
      padding: 1.75rem 2.5rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      overflow-y: auto;
    }

    .form-wrapper {
      max-width: 620px;
      width: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .form-header {
      display: flex;
      flex-direction: column;
      gap: 0.45rem;

      .brand-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
      }

      .brand-logo {
        display: flex;
        align-items: center;
        gap: 0.65rem;

        .logo-icon {
          font-size: 1.75rem;
        }

        .logo-text {
          h2 {
            font-size: 1.35rem;
            font-weight: 800;
            color: var(--text-main);
            letter-spacing: -0.02em;
            margin: 0;

            .badge-text {
              color: var(--color-primary);
            }
          }

          .tagline {
            font-size: 0.68rem;
            font-weight: 700;
            color: var(--text-muted);
            letter-spacing: 0.05em;
          }
        }
      }

      .welcome-row {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;

        .welcome-heading {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--text-heading);
          letter-spacing: -0.01em;
          margin: 0;
        }

        .welcome-desc {
          font-size: 0.775rem;
          color: var(--text-muted);
          margin: 0;
        }
      }

      .btn-onboarding-link {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        color: var(--color-primary);
        padding: 0.35rem 0.75rem;
        border-radius: var(--radius-full);
        font-size: 0.75rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 0.35rem;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s ease;

        &:hover {
          background: var(--color-primary);
          color: #ffffff;
          transform: translateY(-1px);
        }
      }
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .form-row-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
    }

    .form-actions-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-top: 0.1rem;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      label {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--text-body);
        display: flex;
        align-items: center;
        gap: 0.35rem;

        i {
          color: var(--color-primary);
          font-size: 0.8rem;
        }
      }

      .label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .forgot-link {
          font-size: 0.725rem;
          color: var(--color-primary);
          font-weight: 600;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .input-wrapper {
        position: relative;
        display: flex;
        align-items: center;

        .sport-input {
          width: 100%;
          padding: 0.6rem 0.8rem;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-main);
          font-size: 0.85rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;

          &:focus {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px var(--color-primary-glow);
          }
        }

        .btn-toggle-eye {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.9rem;

          &:hover {
            color: var(--text-main);
          }
        }
      }
    }

    .sport-input {
      width: 100%;
      padding: 0.6rem 0.8rem;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-main);
      font-size: 0.85rem;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-glow);
      }
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      cursor: pointer;
      font-size: 0.775rem;
      color: var(--text-body);

      input {
        accent-color: var(--color-primary);
        width: 15px;
        height: 15px;
      }
    }

    .btn-login {
      flex: 0 0 auto;
      min-width: 170px;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
      color: #ffffff;
      font-size: 0.875rem;
      font-weight: 700;
      padding: 0.625rem 1.25rem;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.55rem;
      box-shadow: var(--shadow-glow);
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .divider {
      display: flex;
      align-items: center;
      text-align: center;
      color: var(--text-dim);
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      margin: 0.1rem 0;

      &::before, &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid var(--border-color);
      }

      span {
        padding: 0 0.75rem;
      }
    }

    .demo-school-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: var(--radius-full);
      padding: 0.25rem 0.85rem;
      margin: 0 auto;
      font-size: 0.72rem;
      width: fit-content;
      max-width: 100%;
      text-align: center;
      transition: all 0.2s ease;

      i {
        color: var(--color-primary);
        font-size: 0.75rem;
      }

      .badge-label {
        color: var(--text-muted);
        font-weight: 600;
      }

      .school-title {
        color: var(--color-primary);
        font-weight: 700;
      }

      .badge-city {
        color: var(--text-dim);
        font-weight: 500;
      }
    }

    /* Personas Demo Grid (3 cols) */
    .demo-personas-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.45rem;
    }

    .persona-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.45rem 0.55rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-align: left;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: var(--bg-card-hover);
        border-color: var(--color-primary);
        transform: translateY(-2px);
        box-shadow: var(--shadow-sm);
      }

      .persona-avatar {
        position: relative;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
        }

        .role-indicator {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 1.5px solid var(--bg-card);
        }
      }

      &.persona-rose .role-indicator { background: #f43f5e; }
      &.persona-emerald .role-indicator { background: #10b981; }
      &.persona-blue .role-indicator { background: #3b82f6; }
      &.persona-purple .role-indicator { background: #a855f7; }
      &.persona-amber .role-indicator { background: #f59e0b; }

      .persona-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;

        .persona-label {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .persona-name {
          font-size: 0.625rem;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .persona-desc {
          display: none;
        }
      }

      .persona-arrow {
        font-size: 0.6rem;
        color: var(--text-dim);
      }
    }

    /* Callout Informativo de Seguridad SaaS */
    .saas-info-callout {
      background: rgba(16, 185, 129, 0.06);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: var(--radius-md);
      padding: 0.6rem 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(16, 185, 129, 0.35);
      }

      .callout-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border-radius: var(--radius-sm);
        background: rgba(16, 185, 129, 0.15);
        color: var(--color-primary);
        font-size: 0.95rem;
        flex-shrink: 0;
      }

      .callout-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;

        .callout-title {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-heading);
          letter-spacing: -0.01em;
        }

        .callout-desc {
          font-size: 0.7rem;
          color: var(--text-muted);
          line-height: 1.35;
        }
      }
    }

    .toast-alert {
      padding: 0.65rem 0.85rem;
      border-radius: var(--radius-md);
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #059669;
      font-size: 0.8rem;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &.error {
        background: rgba(239, 68, 68, 0.12);
        border-color: rgba(239, 68, 68, 0.3);
        color: #dc2626;
      }
    }

    .form-footer {
      text-align: center;
      font-size: 0.68rem;
      color: var(--text-dim);
      margin-top: 0.1rem;
    }

    /* =========================================================================
       MODAL DE ONBOARDING (inherits from global _modals.scss)
       ========================================================================= */
    .btn-cancel {
      padding: 0.65rem 1.25rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-main);
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;

      &:hover {
        background: var(--bg-card-hover);
      }
    }

    .btn-submit {
      padding: 0.65rem 1.5rem;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
      border: none;
      border-radius: var(--radius-md);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      box-shadow: var(--shadow-glow);

      &:hover:not(:disabled) {
        transform: translateY(-1px);
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .login-container {
        grid-template-columns: 1fr;
        height: auto;
        max-height: none;
      }

      .login-hero {
        padding: 2rem;
      }

      .login-form-panel {
        padding: 2rem;
      }
    }

    @media (max-width: 640px) {
      .login-wrapper {
        padding: 0.75rem;
      }

      .login-hero {
        padding: 1.5rem;
      }

      .hero-stats-grid {
        grid-template-columns: 1fr;
      }

      .login-form-panel {
        padding: 1.5rem;
      }

      .form-row-2col {
        grid-template-columns: 1fr;
      }

      .form-actions-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .btn-login {
        width: 100%;
      }

      .demo-personas-grid {
        grid-template-columns: 1fr;
      }

      .grid-2-col {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  api = inject(ApiService);
  themeService = inject(ThemeService);
  router = inject(Router);

  email = 'carlos.valderrama@sportcore.com';
  password = 'sportcore2026';
  rememberMe = true;

  readonly showPassword = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly toastMessage = signal<string>('');
  readonly isToastError = signal<boolean>(false);

  ngOnInit(): void {
    this.api.loadClubs();
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((val) => !val);
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.showToast('Por favor diligencia el correo y la contraseña.', true);
      return;
    }

    this.loading.set(true);

    this.authService.login(this.email, this.password).subscribe({
      next: (user) => {
        this.api.setClubFromUser(user);
        this.loading.set(false);
        this.showToast(`¡Bienvenido ${user.nombres}! Redirigiendo...`, false);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 400);
      },
      error: (err) => {
        this.loading.set(false);
        const errorMsg = err?.error?.message || 'Credenciales inválidas. Verifica tu correo y clave.';
        this.showToast(errorMsg, true);
      },
    });
  }

  loginWithPersona(personaId: string): void {
    this.loading.set(true);

    this.authService.loginWithPersona(personaId).subscribe({
      next: (user) => {
        this.api.setClubFromUser(user);
        this.loading.set(false);
        this.showToast(`¡Bienvenido ${user.nombres}!`, false);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 300);
      },
      error: (err) => {
        this.loading.set(false);
        const errorMsg = err?.error?.message || 'Error al autenticar perfil demo.';
        this.showToast(errorMsg, true);
      },
    });
  }

  onForgotPassword(): void {
    this.showToast('Se ha enviado un enlace de restablecimiento a tu correo.', false);
  }

  private showToast(msg: string, isError: boolean): void {
    this.toastMessage.set(msg);
    this.isToastError.set(isError);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}

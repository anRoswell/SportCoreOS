import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, DemoPersona, OnboardingDto } from '../../core/services/auth.service';
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
              <div class="brand-logo">
                <div class="logo-icon">⚽</div>
                <div class="logo-text">
                  <h2>SportCore<span class="badge-text">OS</span></h2>
                  <span class="tagline">Sport Management Cloud</span>
                </div>
              </div>

              <div class="welcome-row">
                <div>
                  <h3 class="welcome-heading">Bienvenido de nuevo</h3>
                  <p class="welcome-desc">Ingresa tus credenciales o selecciona un rol demo.</p>
                </div>
                <button type="button" class="btn-onboarding-link" (click)="openOnboardingModal()">
                  <i class="fa-solid fa-plus-circle"></i>
                  <span>Registrar Academia</span>
                </button>
              </div>
            </div>

            <!-- Selector de Club / Escuela -->
            <div class="input-group club-select-group">
              <label for="clubSelect"><i class="fa-solid fa-shield-halved"></i> Seleccionar Academia / Club</label>
              <div class="select-wrapper">
                <select id="clubSelect" [(ngModel)]="selectedClubId" class="sport-select">
                  @for (club of api.availableClubs(); track club.id) {
                    <option [value]="club.id">{{ club.nombre }} ({{ club.ciudad }})</option>
                  }
                </select>
                <i class="fa-solid fa-chevron-down select-arrow"></i>
              </div>
            </div>

            <!-- Formulario Principal -->
            <form (ngSubmit)="onSubmit()" class="login-form">
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
                  <a href="javascript:void(0)" (click)="onForgotPassword()" class="forgot-link">¿Olvidaste tu clave?</a>
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

              <!-- Checkbox Recordar Sesión -->
              <div class="form-options">
                <label class="checkbox-label">
                  <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe" />
                  <span class="custom-checkbox"></span>
                  <span class="label-text">Mantener sesión iniciada</span>
                </label>
              </div>

              <!-- Botón Submit -->
              <button type="submit" class="btn-login" [disabled]="loading()">
                @if (loading()) {
                  <i class="fa-solid fa-spinner fa-spin"></i>
                  <span>Autenticando en SportCore...</span>
                } @else {
                  <i class="fa-solid fa-arrow-right-to-bracket"></i>
                  <span>Iniciar Sesión</span>
                }
              </button>
            </form>

            <!-- Separador -->
            <div class="divider">
              <span>O ACCEDE EN 1 CLIC CON UN PERFIL DEMO</span>
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

            <!-- Banner de Creación de Escuela -->
            <div class="onboarding-callout" (click)="openOnboardingModal()">
              <div class="callout-icon">🚀</div>
              <div class="callout-content">
                <strong>¿Fundador o Director Deportivo?</strong>
                <span>Registra tu propia academia en 1 minuto y empieza gratis</span>
              </div>
              <i class="fa-solid fa-arrow-right callout-arrow"></i>
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

      <!-- =========================================================================
           MODAL DE ONBOARDING: REGISTRO DE NUEVA ESCUELA / CLUB
           ========================================================================= -->
      @if (showOnboardingModal()) {
        <div class="modal-backdrop" (click)="closeOnboardingModal()">
          <div class="modal-card modal-lg" (click)="$event.stopPropagation()">
            <!-- Modal Header -->
            <div class="modal-header">
              <div class="modal-title-wrap">
                <div class="modal-icon-badge">
                  <i class="fa-solid fa-shield-halved"></i>
                </div>
                <div class="modal-title-text">
                  <h2>Registrar Escuela de Fútbol</h2>
                  <p class="modal-subtitle">Crea tu academia en FutCoreOS y configura tu cuenta de Director Deportivo</p>
                </div>
              </div>
              <button class="modal-close-btn btn-close" (click)="closeOnboardingModal()" aria-label="Cerrar">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>

            <!-- Modal Body Form -->
            <form (ngSubmit)="submitOnboarding()" class="modal-form">
              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-building-flag"></i> 1. Información de la Academia</span>

                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-school"></i> Nombre de la Academia <span class="required-star">*</span></label>
                    <input 
                      type="text" 
                      [(ngModel)]="onboardingData.clubNombre" 
                      name="clubNombre" 
                      placeholder="ej. Academia Leones FC" 
                      required 
                      class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-barcode"></i> Sigla / Código Corto <span class="required-star">*</span></label>
                    <input 
                      type="text" 
                      [(ngModel)]="onboardingData.sigla" 
                      name="sigla" 
                      placeholder="ej. LFC (máx 10 letras)" 
                      maxlength="10" 
                      required 
                      class="sport-input" />
                  </div>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-city"></i> Ciudad Sede Principal <span class="required-star">*</span></label>
                    <input 
                      type="text" 
                      [(ngModel)]="onboardingData.ciudad" 
                      name="ciudad" 
                      placeholder="ej. Bogotá D.C., Medellín..." 
                      required 
                      class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-globe"></i> País</label>
                    <input 
                      type="text" 
                      [(ngModel)]="onboardingData.pais" 
                      name="pais" 
                      placeholder="Colombia" 
                      class="sport-input" />
                  </div>
                </div>
              </div>

              <div class="modal-section">
                <span class="modal-section-title"><i class="fa-solid fa-user-tie"></i> 2. Director Deportivo Inicial</span>

                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-user"></i> Nombres <span class="required-star">*</span></label>
                    <input 
                      type="text" 
                      [(ngModel)]="onboardingData.adminNombre" 
                      name="adminNombre" 
                      placeholder="ej. Andrés" 
                      required 
                      class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-solid fa-user"></i> Apellidos <span class="required-star">*</span></label>
                    <input 
                      type="text" 
                      [(ngModel)]="onboardingData.adminApellido" 
                      name="adminApellido" 
                      placeholder="ej. Escobar" 
                      required 
                      class="sport-input" />
                  </div>
                </div>

                <div class="form-row g2">
                  <div class="input-group">
                    <label><i class="fa-solid fa-envelope"></i> Correo Electrónico <span class="required-star">*</span></label>
                    <input 
                      type="email" 
                      [(ngModel)]="onboardingData.adminEmail" 
                      name="adminEmail" 
                      placeholder="ej. director@futcore.com" 
                      required 
                      class="sport-input" />
                  </div>
                  <div class="input-group">
                    <label><i class="fa-brands fa-whatsapp"></i> Teléfono Móvil</label>
                    <input 
                      type="tel" 
                      [(ngModel)]="onboardingData.adminTelefono" 
                      name="adminTelefono" 
                      placeholder="+57 300 123 4567" 
                      class="sport-input" />
                  </div>
                </div>

                <div class="input-group">
                  <label><i class="fa-solid fa-key"></i> Contraseña de Acceso <span class="required-star">*</span> (Mínimo 6 caracteres)</label>
                  <input 
                    type="password" 
                    [(ngModel)]="onboardingData.adminPassword" 
                    name="adminPassword" 
                    placeholder="••••••••••••" 
                    minlength="6" 
                    required 
                    class="sport-input" />
                </div>
              </div>

              <!-- Modal Actions -->
              <div class="modal-actions">
                <button type="button" class="btn-secondary btn-cancel" (click)="closeOnboardingModal()">
                  <i class="fa-solid fa-xmark"></i> Cancelar
                </button>
                <button type="submit" class="btn-primary btn-submit" [disabled]="onboardingLoading()">
                  @if (onboardingLoading()) {
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    <span>Registrando Academia...</span>
                  } @else {
                    <i class="fa-solid fa-check-circle"></i>
                    <span>Crear Academia Deportiva</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      background: var(--bg-main);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow-x: hidden;
      padding: 1.5rem;
      transition: background-color 0.25s ease;
    }

    /* Botón Flotante para cambiar Tema */
    .theme-toggle-floating {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-full);
      color: var(--text-main);
      font-size: 0.85rem;
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
      max-width: 1280px;
      min-height: 750px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-card);
      display: grid;
      grid-template-columns: 1.15fr 1fr;
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
      padding: 3.5rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      overflow: hidden;

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
      gap: 1.75rem;
    }

    .brand-badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      padding: 0.35rem 0.85rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
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
      font-size: clamp(2rem, 3.2vw, 2.75rem);
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.02em;
      color: #ffffff;

      .highlight {
        background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .hero-subtitle {
      font-size: 1rem;
      line-height: 1.6;
      color: #cbd5e1;
      max-width: 520px;
    }

    .hero-stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 1.25rem;
      border-radius: var(--radius-lg);
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;

      .stat-number {
        font-size: 1.65rem;
        font-weight: 800;
        color: #34d399;
        line-height: 1;
      }

      .stat-label {
        font-size: 0.75rem;
        color: #94a3b8;
        font-weight: 600;
      }
    }

    .features-list {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;

      .feature-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-size: 0.9rem;
        color: #e2e8f0;

        i {
          color: #34d399;
          font-size: 1rem;
        }
      }
    }

    .hero-trust-footer {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.8rem;
      color: #94a3b8;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);

      .trust-badges {
        display: flex;
        gap: 0.65rem;
        flex-wrap: wrap;
      }

      .trust-badge {
        background: rgba(255, 255, 255, 0.08);
        padding: 0.25rem 0.6rem;
        border-radius: var(--radius-xs);
        font-size: 0.75rem;
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
      padding: 3.5rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
    }

    .form-wrapper {
      max-width: 440px;
      width: 100%;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 1.35rem;
    }

    .form-header {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;

      .brand-logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .logo-icon {
          font-size: 2rem;
        }

        .logo-text {
          h2 {
            font-size: 1.45rem;
            font-weight: 800;
            color: var(--text-main);
            letter-spacing: -0.02em;

            .badge-text {
              color: var(--color-primary);
            }
          }

          .tagline {
            font-size: 0.7rem;
            font-weight: 700;
            color: var(--text-muted);
            letter-spacing: 0.05em;
          }
        }
      }

      .welcome-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 0.5rem;

        .welcome-heading {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--text-heading);
          letter-spacing: -0.01em;
        }

        .welcome-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .btn-onboarding-link {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: var(--color-primary);
          padding: 0.4rem 0.75rem;
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
    }

    .club-select-group {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.65rem 0.85rem;
    }

    .select-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      .sport-select {
        width: 100%;
        background: transparent;
        border: none;
        outline: none;
        color: var(--text-main);
        font-size: 0.875rem;
        font-weight: 600;
        appearance: none;
        cursor: pointer;
        padding-right: 1.5rem;
      }

      .select-arrow {
        position: absolute;
        right: 0;
        pointer-events: none;
        font-size: 0.75rem;
        color: var(--text-muted);
      }
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      label {
        font-size: 0.775rem;
        font-weight: 700;
        color: var(--text-body);
        display: flex;
        align-items: center;
        gap: 0.4rem;

        i {
          color: var(--color-primary);
          font-size: 0.85rem;
        }
      }

      .label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .forgot-link {
          font-size: 0.75rem;
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
          padding: 0.7rem 0.85rem;
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-main);
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;

          &:focus {
            border-color: var(--color-primary);
            box-shadow: 0 0 0 3px var(--color-primary-glow);
          }
        }

        .btn-toggle-eye {
          position: absolute;
          right: 0.85rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 0.95rem;

          &:hover {
            color: var(--text-main);
          }
        }
      }
    }

    .sport-input {
      width: 100%;
      padding: 0.7rem 0.85rem;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-main);
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-glow);
      }
    }

    .form-options {
      display: flex;
      align-items: center;

      .checkbox-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        font-size: 0.8rem;
        color: var(--text-body);

        input {
          accent-color: var(--color-primary);
          width: 15px;
          height: 15px;
        }
      }
    }

    .btn-login {
      width: 100%;
      background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
      color: #ffffff;
      font-size: 0.925rem;
      font-weight: 700;
      padding: 0.8rem 1.25rem;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      box-shadow: var(--shadow-glow);
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      margin-top: 0.15rem;

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
      font-size: 0.675rem;
      font-weight: 800;
      letter-spacing: 0.06em;

      &::before, &::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid var(--border-color);
      }

      span {
        padding: 0 0.85rem;
      }
    }

    /* Personas Demo Grid */
    .demo-personas-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.55rem;
    }

    .persona-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.55rem 0.7rem;
      display: flex;
      align-items: center;
      gap: 0.6rem;
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
        width: 32px;
        height: 32px;
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
          width: 9px;
          height: 9px;
          border-radius: 50%;
          border: 2px solid var(--bg-card);
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
          font-size: 0.725rem;
          font-weight: 700;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .persona-name {
          font-size: 0.65rem;
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
        font-size: 0.65rem;
        color: var(--text-dim);
      }
    }

    /* Onboarding Callout */
    .onboarding-callout {
      background: rgba(16, 185, 129, 0.08);
      border: 1px dashed rgba(16, 185, 129, 0.4);
      border-radius: var(--radius-md);
      padding: 0.75rem 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(16, 185, 129, 0.15);
        border-color: var(--color-primary);
        transform: translateY(-1px);
      }

      .callout-icon {
        font-size: 1.25rem;
      }

      .callout-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.15rem;

        strong {
          font-size: 0.8rem;
          color: var(--text-heading);
        }

        span {
          font-size: 0.7rem;
          color: var(--text-muted);
        }
      }

      .callout-arrow {
        font-size: 0.8rem;
        color: var(--color-primary);
      }
    }

    .toast-alert {
      padding: 0.75rem 1rem;
      border-radius: var(--radius-md);
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #059669;
      font-size: 0.825rem;
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
      font-size: 0.725rem;
      color: var(--text-dim);
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
        min-height: auto;
      }

      .login-hero {
        padding: 2.5rem;
      }

      .login-form-panel {
        padding: 2.5rem;
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

      .demo-personas-grid {
        grid-template-columns: 1fr;
      }

      .grid-2-col {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  api = inject(ApiService);
  themeService = inject(ThemeService);
  router = inject(Router);

  email = 'carlos.valderrama@sportcore.com';
  password = 'sportcore2026';
  selectedClubId = '10000000-0000-0000-0000-000000000001';
  rememberMe = true;

  readonly showPassword = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly toastMessage = signal<string>('');
  readonly isToastError = signal<boolean>(false);

  // Modal de Onboarding
  readonly showOnboardingModal = signal<boolean>(false);
  readonly onboardingLoading = signal<boolean>(false);

  onboardingData: OnboardingDto = {
    clubNombre: '',
    sigla: '',
    ciudad: 'Bogotá D.C.',
    pais: 'Colombia',
    adminNombre: '',
    adminApellido: '',
    adminEmail: '',
    adminPassword: '',
    adminTelefono: '',
  };

  togglePasswordVisibility(): void {
    this.showPassword.update((val) => !val);
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.showToast('Por favor diligencia el correo y la contraseña.', true);
      return;
    }

    this.loading.set(true);
    this.api.selectClub(this.selectedClubId);

    this.authService.login(this.email, this.password, this.selectedClubId).subscribe({
      next: (user) => {
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
    this.api.selectClub(this.selectedClubId);

    this.authService.loginWithPersona(personaId, this.selectedClubId).subscribe({
      next: (user) => {
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

  openOnboardingModal(): void {
    this.onboardingData = {
      clubNombre: '',
      sigla: '',
      ciudad: 'Bogotá D.C.',
      pais: 'Colombia',
      adminNombre: '',
      adminApellido: '',
      adminEmail: '',
      adminPassword: '',
      adminTelefono: '',
    };
    this.showOnboardingModal.set(true);
  }

  closeOnboardingModal(): void {
    this.showOnboardingModal.set(false);
  }

  submitOnboarding(): void {
    if (
      !this.onboardingData.clubNombre ||
      !this.onboardingData.sigla ||
      !this.onboardingData.ciudad ||
      !this.onboardingData.adminNombre ||
      !this.onboardingData.adminApellido ||
      !this.onboardingData.adminEmail ||
      !this.onboardingData.adminPassword
    ) {
      this.showToast('Por favor completa todos los campos requeridos (*).', true);
      return;
    }

    if (this.onboardingData.adminPassword.length < 6) {
      this.showToast('La contraseña debe tener mínimo 6 caracteres.', true);
      return;
    }

    this.onboardingLoading.set(true);

    this.authService.registerClubOnboarding(this.onboardingData).subscribe({
      next: (user) => {
        this.onboardingLoading.set(false);
        this.showOnboardingModal.set(false);
        this.api.loadClubs();
        if (user.clubId) {
          this.api.selectClub(user.clubId);
        }
        this.showToast(`¡Academia creada con éxito! Bienvenido ${user.nombres}`, false);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      },
      error: (err) => {
        this.onboardingLoading.set(false);
        const errorMsg = err?.error?.message || 'Error al registrar la academia. Intenta nuevamente.';
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

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, DemoPersona } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="mobile-login-page">
      <!-- Imagen de fondo de Estadio de Fútbol -->
      <div class="stadium-bg-layer"></div>
      <div class="stadium-overlay"></div>

      <!-- Header de Impacto Deportivo con Brand Oficial -->
      <div class="login-brand-header">
        <div class="brand-crest-wrapper">
          <div class="crest-glow"></div>
          <div class="brand-crest">
            <img src="/assets/branding/sportcore_icon.jpg" alt="SportCoreOS" class="brand-crest-img" />
          </div>
        </div>
        <div class="brand-badge-tag">SISTEMA OFICIAL DE CANTERAS</div>
        <h1 class="brand-title">Sport<span class="text-primary">Core</span> <span class="badge-os">OS</span></h1>
        <p class="brand-subtitle">Gestión Integral de Clubes, Academias y Deportistas</p>
      </div>

      <!-- Tarjeta Principal de Login -->
      <div class="login-card-container">
        <div class="login-card">
          <!-- Selector de Personas Demo (Mismos Usuarios de la Web) -->
          <div class="demo-personas-section">
            <div class="demo-header-row">
              <span class="demo-section-title"><i class="fa-solid fa-users-gear text-primary"></i> Perfiles Demo Disponibles</span>
              <span class="demo-hint-badge">Click para autocompletar</span>
            </div>

            <div class="demo-personas-scroll">
              @for (persona of auth.demoPersonas; track persona.id) {
                <button 
                  type="button" 
                  class="demo-card-btn" 
                  [class.active]="selectedPersonaId() === persona.id"
                  (click)="selectPersona(persona)">
                  <div class="avatar-wrap">
                    <img [src]="persona.avatar" [alt]="persona.nombres" class="demo-avatar-img" />
                    <span class="role-mini-dot" [style.background-color]="persona.badgeColor"></span>
                  </div>
                  <div class="demo-info">
                    <span class="demo-name">{{ persona.nombres }} {{ persona.apellidos.split(' ')[0] }}</span>
                    <span class="demo-role-badge" [style.color]="persona.badgeColor">
                      <i [class]="persona.icon"></i> {{ persona.label }}
                    </span>
                  </div>
                </button>
              }
            </div>
          </div>

          <form (ngSubmit)="onSubmit()" class="login-form">
            <div class="form-floating-group">
              <label><i class="fa-regular fa-envelope"></i> Correo Electrónico</label>
              <div class="input-with-icon">
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  required
                  placeholder="ej. carlos.valderrama@sportcore.com"
                  class="stadium-input"
                />
              </div>
            </div>

            <div class="form-floating-group">
              <div class="label-row">
                <label><i class="fa-solid fa-lock"></i> Contraseña de Acceso</label>
                <a routerLink="/auth/forgot-password" class="link-forgot">¿Olvidaste tu clave?</a>
              </div>
              <div class="input-with-icon password-wrap">
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  [(ngModel)]="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  class="stadium-input"
                />
                <button type="button" class="btn-eye" (click)="toggleShowPassword()">
                  <i class="fa-solid" [class.fa-eye]="!showPassword()" [class.fa-eye-slash]="showPassword()"></i>
                </button>
              </div>
            </div>

            <button type="submit" class="btn-stadium-login" [disabled]="isSubmitting() || !email || !password">
              @if (isSubmitting()) {
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <span>Ingresando al Campo...</span>
              } @else {
                <i class="fa-solid fa-bolt"></i>
                <span>Entrar a la Cancha ({{ activePersonaLabel() }})</span>
              }
            </button>
          </form>

          <!-- Acceso Rápido / Hint Informativo -->
          <div class="demo-auto-hint">
            <i class="fa-solid fa-circle-check text-primary"></i>
            <span>Perfil seleccionado: <strong>{{ activePersonaLabel() }}</strong> ({{ email }})</span>
          </div>
        </div>

        <div class="stadium-footer">
          <p><i class="fa-solid fa-shield"></i> Conexión Cifrada SSL • SportCore Multi-Tenant</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mobile-login-page {
      min-height: 100vh;
      min-height: 100dvh;
      padding: calc(var(--safe-area-top) + 1rem) 1rem calc(var(--safe-area-bottom) + 1.25rem);
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      overflow-x: hidden;
      background-color: #0b1510;
    }

    /* Fondo de Estadio de Fútbol nítido */
    .stadium-bg-layer {
      position: absolute;
      inset: 0;
      background: url('/assets/images/stadium_login_bg.jpg') center center / cover no-repeat;
      opacity: 0.75;
      filter: saturate(1.15) brightness(0.98);
      transform: scale(1.02);
      z-index: 0;
    }

    .stadium-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        180deg,
        rgba(241, 245, 249, 0.25) 0%,
        rgba(248, 250, 252, 0.55) 45%,
        rgba(236, 253, 245, 0.78) 100%
      );
      backdrop-filter: blur(1.5px);
      pointer-events: none;
      z-index: 1;
    }

    .login-brand-header {
      text-align: center;
      margin-bottom: 0.85rem;
      position: relative;
      z-index: 2;

      .brand-crest-wrapper {
        position: relative;
        width: 68px;
        height: 68px;
        margin: 0 auto 0.5rem;

        .crest-glow {
          position: absolute;
          inset: -6px;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulseGlow 3s infinite ease-in-out;
        }

        .brand-crest {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 10px 25px -4px rgba(16, 185, 129, 0.45);
          border: 2px solid rgba(255, 255, 255, 0.85);

          .brand-crest-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }

      .brand-badge-tag {
        display: inline-block;
        font-size: 0.62rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        color: #065f46;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        padding: 2px 10px;
        border-radius: 9999px;
        margin-bottom: 0.25rem;
      }

      .brand-title {
        font-size: 1.65rem;
        font-weight: 900;
        color: #0f172a;
        margin: 0;
        line-height: 1.15;
        letter-spacing: -0.02em;

        .text-primary {
          color: #059669;
        }

        .badge-os {
          font-size: 0.75rem;
          background: #0f172a;
          color: #10b981;
          padding: 2px 6px;
          border-radius: 6px;
          vertical-align: middle;
          margin-left: 2px;
          border: 1px solid #334155;
        }
      }

      .brand-subtitle {
        font-size: 0.74rem;
        color: #475569;
        margin: 0.2rem 0 0;
        font-weight: 600;
      }
    }

    .login-card-container {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 440px;
      margin: 0 auto;
    }

    .login-card {
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(16px);
      border-radius: 20px;
      padding: 1.15rem;
      box-shadow: 0 20px 40px -10px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.7);
    }

    /* Personas Demo Selector */
    .demo-personas-section {
      margin-bottom: 1rem;

      .demo-header-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;

        .demo-section-title {
          font-size: 0.76rem;
          font-weight: 800;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .demo-hint-badge {
          font-size: 0.62rem;
          font-weight: 700;
          color: #059669;
          background: #d1fae5;
          padding: 2px 6px;
          border-radius: 6px;
        }
      }

      .demo-personas-scroll {
        display: flex;
        gap: 0.5rem;
        overflow-x: auto;
        padding-bottom: 4px;
        scrollbar-width: thin;

        &::-webkit-scrollbar {
          height: 4px;
        }
        &::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
      }

      .demo-card-btn {
        flex: 0 0 auto;
        min-width: 125px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        background: #f8fafc;
        border: 1.5px solid #e2e8f0;
        border-radius: 12px;
        text-align: left;
        cursor: pointer;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          background: #ffffff;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        &.active {
          background: #ecfdf5;
          border-color: #10b981;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
        }

        .avatar-wrap {
          position: relative;
          width: 32px;
          height: 32px;
          flex-shrink: 0;

          .demo-avatar-img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
          }

          .role-mini-dot {
            position: absolute;
            bottom: -1px;
            right: -1px;
            width: 9px;
            height: 9px;
            border-radius: 50%;
            border: 1.5px solid #ffffff;
          }
        }

        .demo-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;

          .demo-name {
            font-size: 0.72rem;
            font-weight: 800;
            color: #0f172a;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .demo-role-badge {
            font-size: 0.62rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 3px;
          }
        }
      }
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }

    .form-floating-group {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;

      label {
        font-size: 0.72rem;
        font-weight: 700;
        color: #334155;
        display: flex;
        align-items: center;
        gap: 5px;

        i {
          color: #059669;
        }
      }

      .label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .link-forgot {
          font-size: 0.7rem;
          font-weight: 700;
          color: #059669;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }

      .input-with-icon {
        position: relative;

        .stadium-input {
          width: 100%;
          height: 42px;
          padding: 0 0.85rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: #0f172a;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          outline: none;
          transition: all 0.2s ease;

          &:focus {
            background: #ffffff;
            border-color: #10b981;
            box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
          }

          &::placeholder {
            color: #94a3b8;
            font-weight: 500;
          }
        }

        &.password-wrap {
          .stadium-input {
            padding-right: 2.5rem;
          }

          .btn-eye {
            position: absolute;
            right: 0.5rem;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            color: #64748b;
            padding: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;

            &:hover {
              color: #0f172a;
            }
          }
        }
      }
    }

    .btn-stadium-login {
      width: 100%;
      height: 44px;
      margin-top: 0.25rem;
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      color: #ffffff;
      border: none;
      border-radius: 12px;
      font-size: 0.84rem;
      font-weight: 800;
      letter-spacing: 0.01em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      box-shadow: 0 10px 20px -5px rgba(5, 150, 105, 0.4);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 14px 24px -5px rgba(5, 150, 105, 0.5);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }
    }

    .demo-auto-hint {
      margin-top: 0.85rem;
      padding: 6px 10px;
      background: #f1f5f9;
      border-radius: 8px;
      font-size: 0.68rem;
      font-weight: 600;
      color: #475569;
      display: flex;
      align-items: center;
      gap: 6px;

      strong {
        color: #0f172a;
      }
    }

    .stadium-footer {
      text-align: center;
      margin-top: 1rem;

      p {
        font-size: 0.72rem;
        font-weight: 700;
        color: #1e293b;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);

        i {
          color: #059669;
        }
      }
    }

    @keyframes pulseGlow {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(1.15); opacity: 0.7; }
    }
  `]
})
export class LoginComponent {
  auth = inject(AuthService);
  alert = inject(AlertService);
  router = inject(Router);

  email = 'carlos.valderrama@sportcore.com';
  password = 'sportcore2026';
  selectedPersonaId = signal<string>('demo-dir');
  activePersonaLabel = signal<string>('Director Deportivo');
  isSubmitting = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  selectPersona(persona: DemoPersona): void {
    this.selectedPersonaId.set(persona.id);
    this.activePersonaLabel.set(persona.label);
    this.email = persona.email;
    this.password = persona.password;
  }

  toggleShowPassword(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.isSubmitting.set(true);

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.alert.success(`¡Bienvenido al campo, ${this.activePersonaLabel()}!`);
        this.router.navigate(['/home']);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}

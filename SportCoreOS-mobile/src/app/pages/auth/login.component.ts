import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
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

      <!-- Header de Impacto Deportivo -->
      <div class="login-brand-header">
        <div class="brand-crest-wrapper">
          <div class="crest-glow"></div>
          <div class="brand-crest">
            <i class="fa-solid fa-shield-halved crest-icon"></i>
            <i class="fa-solid fa-futbol ball-badge"></i>
          </div>
        </div>
        <div class="brand-badge-tag">SISTEMA OFICIAL DE CANTERAS</div>
        <h1 class="brand-title">Sport<span class="text-primary">Core</span> <span class="badge-os">OS</span></h1>
        <p class="brand-subtitle">Gestión Integral de Clubes, Academias y Deportistas</p>
      </div>

      <!-- Tarjeta Principal de Login -->
      <div class="login-card-container">
        <div class="login-card">
          <!-- Selector rápido de rol activo -->
          <div class="role-selector-header">
            <span class="role-header-title">¿Cuál es tu rol en el club?</span>
            <div class="role-pill-tabs">
              <button type="button" class="role-tab" [class.active]="selectedRole() === 'DIRECTOR'" (click)="selectPersona('DIRECTOR')">
                <i class="fa-solid fa-user-tie"></i> DT / Dir
              </button>
              <button type="button" class="role-tab" [class.active]="selectedRole() === 'ENTRENADOR'" (click)="selectPersona('ENTRENADOR')">
                <i class="fa-solid fa-stopwatch"></i> Profe
              </button>
              <button type="button" class="role-tab" [class.active]="selectedRole() === 'JUGADOR'" (click)="selectPersona('JUGADOR')">
                <i class="fa-solid fa-shirt"></i> Jugador
              </button>
              <button type="button" class="role-tab" [class.active]="selectedRole() === 'PADRE'" (click)="selectPersona('PADRE')">
                <i class="fa-solid fa-people-roof"></i> Acudiente
              </button>
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
                  placeholder="ej. director@futuroscracks.com"
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
                <span>Entrar a la Cancha</span>
              }
            </button>
          </form>

          <!-- Acceso Biométrico / Demo Rápido -->
          <div class="demo-auto-hint">
            <i class="fa-solid fa-circle-check text-primary"></i>
            <span>Credenciales cargadas para perfil <strong>{{ selectedRole() }}</strong></span>
          </div>
        </div>

        <div class="stadium-footer">
          <p><i class="fa-solid fa-shield"></i> Conexión Cifrada • SportCore Club ID: <strong>FUT-CRACKS</strong></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .mobile-login-page {
      min-height: 100vh;
      min-height: 100dvh;
      padding: calc(var(--safe-area-top) + 1.5rem) 1.25rem calc(var(--safe-area-bottom) + 1.5rem);
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      overflow: hidden;
      background-color: #0b1510;
    }

    /* Fondo de Estadio de Fútbol más visible y nítido */
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
      margin-bottom: 1.25rem;
      position: relative;
      z-index: 2;

      .brand-crest-wrapper {
        position: relative;
        width: 72px;
        height: 72px;
        margin: 0 auto 0.85rem;

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
          background: linear-gradient(145deg, #10b981 0%, #047857 100%);
          color: #ffffff;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          box-shadow: 0 10px 25px -4px rgba(16, 185, 129, 0.45);
          border: 2px solid rgba(255, 255, 255, 0.8);

          .crest-icon {
            font-size: 2.1rem;
            color: #ffffff;
          }

          .ball-badge {
            position: absolute;
            bottom: 4px;
            right: 4px;
            font-size: 0.95rem;
            background: #ffffff;
            color: #064e3b;
            border-radius: 50%;
            padding: 2px;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          }
        }
      }

      .brand-badge-tag {
        display: inline-block;
        font-size: 0.65rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #047857;
        background: rgba(16, 185, 129, 0.12);
        padding: 3px 10px;
        border-radius: 9999px;
        border: 1px solid rgba(16, 185, 129, 0.25);
        margin-bottom: 0.35rem;
      }

      .brand-title {
        font-size: 1.65rem;
        font-weight: 900;
        letter-spacing: -0.03em;
        color: #0f172a;
        margin: 0;

        .text-primary {
          color: #10b981;
        }

        .badge-os {
          font-size: 0.8rem;
          font-weight: 900;
          background: #0f172a;
          color: #ffffff;
          padding: 2px 6px;
          border-radius: 6px;
          vertical-align: middle;
        }
      }

      .brand-subtitle {
        font-size: 0.8rem;
        color: #64748b;
        margin-top: 0.2rem;
      }
    }

    .login-card-container {
      position: relative;
      z-index: 2;
      max-width: 440px;
      margin: 0 auto;
      width: 100%;
    }

    .login-card {
      background: rgba(255, 255, 255, 0.96);
      backdrop-filter: blur(12px);
      border: 1.5px solid rgba(226, 232, 240, 0.9);
      border-radius: 24px;
      padding: 1.4rem;
      box-shadow: 0 12px 35px -5px rgba(15, 23, 42, 0.15), 0 4px 14px -2px rgba(16, 185, 129, 0.1);
    }

    .role-selector-header {
      margin-bottom: 1.25rem;

      .role-header-title {
        display: block;
        font-size: 0.78rem;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #0f172a;
        margin-bottom: 0.6rem;
      }

      .role-pill-tabs {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 0.35rem;
        background: #e2e8f0;
        padding: 4px;
        border-radius: 14px;
        border: 1px solid #cbd5e1;

        .role-tab {
          background: transparent;
          border: none;
          padding: 8px 4px;
          border-radius: 10px;
          font-size: 0.76rem;
          font-weight: 800;
          color: #334155;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          transition: all 0.2s ease;

          i {
            font-size: 0.9rem;
          }

          &.active {
            background: #ffffff;
            color: #064e3b;
            font-weight: 900;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);
            border: 1.5px solid #10b981;
          }
        }
      }
    }

    .form-floating-group {
      margin-bottom: 1rem;

      label {
        display: block;
        font-size: 0.78rem;
        font-weight: 700;
        color: #334155;
        margin-bottom: 0.35rem;

        i {
          color: #10b981;
          margin-right: 3px;
        }
      }

      .label-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.35rem;

        .link-forgot {
          font-size: 0.72rem;
          font-weight: 700;
          color: #059669;
          text-decoration: none;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .stadium-input {
      width: 100%;
      background: #f8fafc;
      border: 1.5px solid #e2e8f0;
      border-radius: 12px;
      padding: 0.8rem 1rem;
      font-size: 0.92rem;
      font-weight: 500;
      color: #0f172a;
      outline: none;
      transition: all 0.2s ease;

      &:focus {
        background: #ffffff;
        border-color: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18);
      }

      &::placeholder {
        color: #94a3b8;
        font-weight: 400;
      }
    }

    .password-wrap {
      position: relative;

      .btn-eye {
        position: absolute;
        right: 0.85rem;
        top: 50%;
        transform: translateY(-50%);
        background: transparent;
        border: none;
        color: #64748b;
        font-size: 1rem;
        cursor: pointer;

        &:hover {
          color: #0f172a;
        }
      }
    }

    .btn-stadium-login {
      width: 100%;
      background: linear-gradient(135deg, #10b981 0%, #047857 100%);
      color: #ffffff;
      border: none;
      border-radius: 14px;
      padding: 0.95rem 1.25rem;
      font-size: 1rem;
      font-weight: 900;
      letter-spacing: 0.03em;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      margin-top: 1.35rem;
      box-shadow: 0 8px 22px rgba(16, 185, 129, 0.4);
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.5);
      }

      &:active:not(:disabled) {
        transform: scale(0.98);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .demo-auto-hint {
      margin-top: 1.1rem;
      padding: 0.55rem 0.85rem;
      background: rgba(16, 185, 129, 0.12);
      border-radius: 10px;
      border: 1.5px dashed rgba(16, 185, 129, 0.45);
      font-size: 0.76rem;
      font-weight: 700;
      color: #064e3b;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;

      strong {
        font-weight: 900;
      }
    }

    .stadium-footer {
      text-align: center;
      margin-top: 1.25rem;

      p {
        font-size: 0.74rem;
        font-weight: 700;
        color: #1e293b;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        text-shadow: 0 1px 2px rgba(255, 255, 255, 0.9);

        strong {
          color: #020617;
          font-weight: 900;
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

  email = 'director@futuroscracks.com';
  password = 'Admin123*';
  selectedRole = signal<'DIRECTOR' | 'ENTRENADOR' | 'PADRE' | 'JUGADOR'>('DIRECTOR');
  isSubmitting = signal<boolean>(false);
  showPassword = signal<boolean>(false);

  private roleCredentials: Record<string, { email: string; pass: string }> = {
    DIRECTOR: { email: 'director@futuroscracks.com', pass: 'Admin123*' },
    ENTRENADOR: { email: 'entrenador@futuroscracks.com', pass: 'Admin123*' },
    PADRE: { email: 'padre@futuroscracks.com', pass: 'Admin123*' },
    JUGADOR: { email: 'jugador@futuroscracks.com', pass: 'Admin123*' },
  };

  selectPersona(role: 'DIRECTOR' | 'ENTRENADOR' | 'PADRE' | 'JUGADOR'): void {
    this.selectedRole.set(role);
    const cred = this.roleCredentials[role];
    if (cred) {
      this.email = cred.email;
      this.password = cred.pass;
    }
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
        this.alert.success(`¡Bienvenido al campo, perfil ${this.selectedRole()}!`);
        this.router.navigate(['/home']);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  loginAs(persona: 'DIRECTOR' | 'ENTRENADOR' | 'PADRE' | 'JUGADOR'): void {
    this.selectPersona(persona);
    this.onSubmit();
  }
}

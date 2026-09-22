import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="mobile-auth-page">
      <div class="top-nav-row">
        <a routerLink="/auth/login" class="btn-back">
          <i class="fa-solid fa-arrow-left"></i>
        </a>
        <span class="top-title">Recuperación</span>
        <div class="placeholder-box"></div>
      </div>

      <div class="auth-card mobile-card">
        <div class="icon-header-badge">
          <i class="fa-solid fa-key"></i>
        </div>
        <h2 class="card-heading">¿Olvidaste tu contraseña?</h2>
        <p class="card-subheading">
          Ingresa el correo registrado con tu club para recibir un código de restablecimiento seguro.
        </p>

        <form (ngSubmit)="onSubmit()">
          <div class="mobile-input-group">
            <label><i class="fa-regular fa-envelope"></i> Correo Electrónico</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="ej. dt@club.com"
              class="mobile-input"
            />
          </div>

          <button type="submit" class="btn-primary mt-3" [disabled]="isSubmitting() || !email">
            <i class="fa-solid fa-paper-plane"></i>
            <span>{{ isSubmitting() ? 'Enviando...' : 'Enviar Código' }}</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .mobile-auth-page {
      min-height: 100vh;
      min-height: 100dvh;
      padding: calc(var(--safe-area-top) + 1rem) 1.25rem calc(var(--safe-area-bottom) + 2rem);
      display: flex;
      flex-direction: column;
      background: radial-gradient(circle at top, #141f38 0%, #070b14 70%);
    }

    .top-nav-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;

      .btn-back {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        color: var(--text-main);
        display: flex;
        align-items: center;
        justify-content: center;
        text-decoration: none;
      }

      .top-title {
        font-size: 0.9rem;
        font-weight: 800;
        color: var(--text-heading);
      }

      .placeholder-box { width: 38px; }
    }

    .icon-header-badge {
      width: 52px;
      height: 52px;
      border-radius: var(--radius-md);
      background: var(--color-amber-subtle);
      color: var(--color-amber);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
      margin-bottom: 1rem;
    }

    .card-heading {
      font-size: 1.2rem;
      font-weight: 800;
      margin-bottom: 0.35rem;
    }

    .card-subheading {
      font-size: 0.8rem;
      color: var(--text-muted);
      line-height: 1.4;
      margin-bottom: 1.5rem;
    }
  `]
})
export class ForgotPasswordComponent {
  auth = inject(AuthService);
  alert = inject(AlertService);
  router = inject(Router);

  email = '';
  isSubmitting = signal<boolean>(false);

  onSubmit(): void {
    if (!this.email) return;
    this.isSubmitting.set(true);

    this.auth.solicitarResetPassword(this.email).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.alert.success('Hemos enviado las instrucciones a tu correo.');
        this.router.navigate(['/auth/reset-password'], { queryParams: { email: this.email } });
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}

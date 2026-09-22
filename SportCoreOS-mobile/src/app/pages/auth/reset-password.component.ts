import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="mobile-auth-page">
      <div class="top-nav-row">
        <a routerLink="/auth/login" class="btn-back">
          <i class="fa-solid fa-arrow-left"></i>
        </a>
        <span class="top-title">Nueva Contraseña</span>
        <div class="placeholder-box"></div>
      </div>

      <div class="auth-card mobile-card">
        <div class="icon-header-badge">
          <i class="fa-solid fa-shield-halved"></i>
        </div>
        <h2 class="card-heading">Restablecer Contraseña</h2>
        <p class="card-subheading">
          Ingresa el código de 6 dígitos que enviamos a tu correo y tu nueva contraseña.
        </p>

        <form (ngSubmit)="onSubmit()">
          <div class="mobile-input-group">
            <label><i class="fa-solid fa-hashtag"></i> Código de Verificación</label>
            <input
              type="text"
              [(ngModel)]="code"
              name="code"
              required
              maxlength="6"
              placeholder="123456"
              class="mobile-input text-center tracking-wide"
            />
          </div>

          <div class="mobile-input-group">
            <label><i class="fa-solid fa-lock"></i> Nueva Contraseña</label>
            <input
              type="password"
              [(ngModel)]="newPassword"
              name="newPassword"
              required
              placeholder="Mínimo 8 caracteres"
              class="mobile-input"
            />
          </div>

          <div class="mobile-input-group">
            <label><i class="fa-solid fa-lock-open"></i> Confirmar Contraseña</label>
            <input
              type="password"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              required
              placeholder="Repite la contraseña"
              class="mobile-input"
            />
          </div>

          <button type="submit" class="btn-primary mt-3" [disabled]="isSubmitting() || !code || !newPassword || newPassword !== confirmPassword">
            <i class="fa-solid fa-check"></i>
            <span>{{ isSubmitting() ? 'Guardando...' : 'Cambiar Contraseña' }}</span>
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
      margin-bottom: 1.5rem;

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
      background: var(--color-primary-subtle);
      color: var(--color-primary);
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
      margin-bottom: 1.25rem;
    }

    .text-center { text-align: center; }
    .tracking-wide { letter-spacing: 0.25em; font-weight: 800; font-size: 1.1rem !important; }
  `]
})
export class ResetPasswordComponent implements OnInit {
  auth = inject(AuthService);
  alert = inject(AlertService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  email = '';
  code = '';
  newPassword = '';
  confirmPassword = '';
  isSubmitting = signal<boolean>(false);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
    });
  }

  onSubmit(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.alert.warning('Las contraseñas no coinciden');
      return;
    }

    this.isSubmitting.set(true);
    this.auth.confirmarResetPassword(this.code, this.newPassword).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.alert.success('Tu contraseña ha sido actualizada. Inicia sesión.');
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }
}

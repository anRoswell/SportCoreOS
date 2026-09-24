import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService, DemoPersona } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ThemeService } from '../../core/services/theme.service';
import { LandingPublicComponent } from '../landing-public/landing-public.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, LandingPublicComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  authService = inject(AuthService);
  api = inject(ApiService);
  themeService = inject(ThemeService);
  router = inject(Router);
  private route = inject(ActivatedRoute);

  email = 'carlos.valderrama@sportcore.com';
  password = 'sportcore2026';
  rememberMe = true;

  readonly showPassword = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly toastMessage = signal<string>('');
  readonly isToastError = signal<boolean>(false);
  readonly showLandingModal = signal<boolean>(false);

  ngOnInit(): void {
    this.api.loadClubs();
    this.route.queryParams.subscribe((params) => {
      if (params['landing'] === '1' || params['landing'] === 'true' || params['showLanding'] === 'true') {
        this.showLandingModal.set(true);
      }
    });
  }

  openLandingModal(): void {
    this.showLandingModal.set(true);
  }

  closeLandingModal(): void {
    this.showLandingModal.set(false);
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

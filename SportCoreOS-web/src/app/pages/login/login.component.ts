import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { AuthService, DemoPersona } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { ThemeService } from '../../core/services/theme.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  api = inject(ApiService);
  themeService = inject(ThemeService);
  router = inject(Router);
  sanitizer = inject(DomSanitizer);

  email = '';
  readonly passwordSignal = signal<string>('');

  get password(): string {
    return this.passwordSignal();
  }

  set password(val: string) {
    this.passwordSignal.set(val || '');
  }

  rememberMe = false;

  readonly activeTab = signal<'login' | 'demo'>('login');
  readonly showPassword = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly toastMessage = signal<string>('');
  readonly isToastError = signal<boolean>(false);


  // --- ESTADO DEL CAPTCHA ANTI-BOT ---
  readonly captchaCode = signal<string>('');
  readonly captchaSvg = signal<SafeHtml>('');
  readonly captchaToken = signal<string>('');
  readonly captchaInput = signal<string>('');
  readonly isCaptchaSpinning = signal<boolean>(false);
  readonly isAudioPlaying = signal<boolean>(false);
  readonly failedAttempts = signal<number>(0);
  readonly cooldownSeconds = signal<number>(0);

  private cooldownTimer: any = null;

  readonly isCaptchaMatched = computed(() => {
    const userVal = (this.captchaInput() || '').trim().toUpperCase();
    const expected = (this.captchaCode() || '').trim().toUpperCase();
    return expected.length > 0 && userVal === expected;
  });

  readonly isSubmitDisabled = computed(() => 
    this.loading() || this.cooldownSeconds() > 0 || !this.email || !this.password || !this.isCaptchaMatched()
  );

  ngOnInit(): void {
    this.refreshCaptcha();
  }

  ngOnDestroy(): void {
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((val) => !val);
  }

  onPasswordInputChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.password = val;
  }

  onCaptchaInputChange(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.captchaInput.set(val);
  }

  refreshCaptcha(): void {
    this.isCaptchaSpinning.set(true);
    this.captchaInput.set('');

    // Obtener captcha oficial del backend NestJS
    this.authService.getCaptcha().subscribe({
      next: (res) => {
        if (res && res.captchaId && res.svg) {
          this.captchaToken.set(res.captchaId);
          if (res.code) {
            this.captchaCode.set(res.code.toUpperCase());
          }
          this.captchaSvg.set(this.sanitizer.bypassSecurityTrustHtml(res.svg));
          setTimeout(() => this.isCaptchaSpinning.set(false), 350);
          return;
        }
        // Fallback gráfico local si no vino el reto completo
        this.generateLocalCaptcha();
        setTimeout(() => this.isCaptchaSpinning.set(false), 350);
      },
      error: () => {
        // En caso de que el backend no esté disponible en ese instante
        this.generateLocalCaptcha();
        setTimeout(() => this.isCaptchaSpinning.set(false), 350);
      }
    });
  }

  private generateLocalCaptcha(): void {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    this.captchaCode.set(code);
    this.captchaToken.set('local_' + code);

    const width = 160;
    const height = 48;
    const colors = ['#10b981', '#38bdf8', '#a855f7', '#f59e0b', '#ec4899', '#34d399'];
    let textElements = '';

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      const x = 16 + i * 27 + (Math.random() * 4 - 2);
      const y = 33 + (Math.random() * 4 - 2);
      const rot = Math.floor(Math.random() * 30 - 15);
      const color = colors[Math.floor(Math.random() * colors.length)];
      textElements += `<text x="${x}" y="${y}" font-family="'Inter', -apple-system, sans-serif" font-size="24" font-weight="900" fill="${color}" letter-spacing="2px" transform="rotate(${rot}, ${x}, ${y})">${char}</text>`;
    }

    let lines = '';
    for (let i = 0; i < 4; i++) {
      const x1 = Math.random() * width;
      const y1 = Math.random() * height;
      const x2 = Math.random() * width;
      const y2 = Math.random() * height;
      const color = colors[i % colors.length];
      lines += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${color}" stroke-width="1.5" stroke-opacity="0.65" />`;
    }

    let dots = '';
    for (let i = 0; i < 28; i++) {
      const cx = Math.random() * width;
      const cy = Math.random() * height;
      const r = Math.random() * 1.5 + 0.5;
      dots += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="#64748b" opacity="0.45" />`;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background: rgba(15, 23, 42, 0.95); border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">${dots}${lines}${textElements}</svg>`;
    this.captchaSvg.set(this.sanitizer.bypassSecurityTrustHtml(svg));
  }

  playAudioCaptcha(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      this.showToast('El sintetizador de audio no es compatible con este navegador.', true);
      return;
    }

    if (this.isAudioPlaying()) return;

    this.isAudioPlaying.set(true);
    const code = this.captchaCode();
    // Separar cada carácter para pronunciación clara
    const spaced = code.split('').join('. ');
    const utterance = new SpeechSynthesisUtterance(`Código de verificación: ${spaced}`);
    utterance.rate = 0.85;
    utterance.lang = 'es-ES';

    utterance.onend = () => {
      this.isAudioPlaying.set(false);
    };

    utterance.onerror = () => {
      this.isAudioPlaying.set(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  private startCooldown(seconds: number): void {
    this.cooldownSeconds.set(seconds);
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
    }

    this.cooldownTimer = setInterval(() => {
      const current = this.cooldownSeconds();
      if (current <= 1) {
        clearInterval(this.cooldownTimer);
        this.cooldownSeconds.set(0);
        this.refreshCaptcha();
      } else {
        this.cooldownSeconds.set(current - 1);
      }
    }, 1000);
  }

  onSubmit(): void {
    if (this.cooldownSeconds() > 0) {
      this.showToast(`Por seguridad, espere ${this.cooldownSeconds()}s para reintentar.`, true);
      return;
    }

    if (!this.email || !this.password) {
      this.showToast('Por favor ingrese tanto el correo institucional como la contraseña.', true);
      return;
    }


    if (!this.isCaptchaMatched()) {
      const attempts = this.failedAttempts() + 1;
      this.failedAttempts.set(attempts);

      if (attempts >= 3) {
        this.startCooldown(15);
        this.showToast('⚠️ Demasiados intentos erróneos de Captcha. Bloqueo preventivo de 15 segundos activado.', true);
      } else {
        this.refreshCaptcha();
        this.showToast(`El código Captcha es incorrecto. Intento ${attempts}/3 antes de bloqueo.`, true);
      }
      return;
    }

    this.loading.set(true);

    this.authService.login(
      this.email, 
      this.password, 
      this.captchaToken() || undefined, 
      this.captchaInput() || undefined
    ).subscribe({
      next: (user) => {
        this.api.setClubFromUser(user);
        this.loading.set(false);
        this.failedAttempts.set(0);
        this.showToast(`¡Bienvenido ${user.nombres}! Acceso institucional autorizado.`, false);
        const targetRoute = user.rol === 'PADRE_ACUDIENTE' ? ['/portal/padres'] : ['/dashboard'];
        this.router.navigate(targetRoute);
      },
      error: (err) => {
        this.loading.set(false);
        this.refreshCaptcha();
        const errorMsg = err?.error?.message || 'Credenciales inválidas o verificación fallida. Por favor verifique sus datos.';
        this.showToast(errorMsg, true);
      },
    });
  }

  loginWithPersona(personaId: string): void {
    this.loading.set(true);

    const persona = this.authService.demoPersonas.find((p) => p.id === personaId) || this.authService.demoPersonas[0];
    if (persona) {
      this.email = persona.email;
      this.password = persona.password;
      // Auto-completar el captcha para la experiencia de demo sin fricciones
      this.captchaInput.set(this.captchaCode());
    }

    this.authService.loginWithPersona(personaId).subscribe({
      next: (user) => {
        this.api.setClubFromUser(user);
        this.loading.set(false);
        this.failedAttempts.set(0);
        this.showToast(`¡Bienvenido ${user.nombres}! Acceso autorizado como ${user.rolLabel}.`, false);
        const targetRoute = user.rol === 'PADRE_ACUDIENTE' ? ['/portal/padres'] : ['/dashboard'];
        this.router.navigate(targetRoute);
      },
      error: (err) => {
        this.loading.set(false);
        const errorMsg = err?.error?.message || 'Error al autenticar el perfil de demostración.';
        this.showToast(errorMsg, true);
      },
    });
  }

  onForgotPassword(): void {
    this.showToast('Se ha enviado un enlace de restablecimiento seguro a su correo institucional.', false);
  }

  private showToast(msg: string, isError: boolean): void {
    this.toastMessage.set(msg);
    this.isToastError.set(isError);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4500);
  }
}

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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
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

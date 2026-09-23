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
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
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

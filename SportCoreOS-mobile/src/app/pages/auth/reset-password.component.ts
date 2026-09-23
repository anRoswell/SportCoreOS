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
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
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

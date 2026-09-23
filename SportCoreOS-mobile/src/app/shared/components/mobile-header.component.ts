import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './mobile-header.component.html',
  styleUrl: './mobile-header.component.scss'
})
export class MobileHeaderComponent {
  auth = inject(AuthService);

  formatRole(role: string): string {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'DIRECTOR_DEPORTIVO': return 'Director DT';
      case 'ENTRENADOR_DT': return 'Entrenador';
      case 'PADRE_ACUDIENTE': return 'Acudiente';
      case 'ADMIN_FINANCIERO': return 'Finanzas';
      default: return 'Mi Perfil';
    }
  }

  getPrimerNombre(nombres?: string): string {
    if (!nombres) return 'Usuario';
    return nombres.split(' ')[0] || 'Usuario';
  }
}

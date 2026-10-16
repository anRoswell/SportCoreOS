import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  api = inject(ApiService);
  authService = inject(AuthService);
  profileService = inject(ProfileService);

  logoError = signal<boolean>(false);

  constructor() {
    effect(() => {
      // Al cambiar el logo del club activo, resetear error de imagen
      const _ = this.api.activeClub().logo;
      this.logoError.set(false);
    });
  }

  resolveLogoUrl(url?: string): string {
    if (!url) return '';
    return this.api.resolveFileUrl(url);
  }

  onLogoError(event: Event): void {
    this.logoError.set(true);
  }
}

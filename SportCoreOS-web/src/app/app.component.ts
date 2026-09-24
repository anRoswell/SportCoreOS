import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { LoadingBarComponent } from './shared/components/loading-bar/loading-bar.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { ProfileModalComponent } from './shared/components/profile-modal/profile-modal.component';
import { ApiService } from './core/services/api.service';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    SidebarComponent,
    NavbarComponent,
    LoadingBarComponent,
    ToastContainerComponent,
    ProfileModalComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  api = inject(ApiService);
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  private router = inject(Router);

  currentUrl = signal<string>(this.router.url || '');

  constructor() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.currentUrl.set(event.urlAfterRedirects || event.url);
      }
    });
  }

  isPublicRoute = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/p/') || url.startsWith('/landings/') || url.startsWith('/login');
  });
}

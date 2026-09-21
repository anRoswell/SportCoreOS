import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
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
  template: `
    <!-- Barra Transversal de Carga Global -->
    <app-loading-bar></app-loading-bar>

    <!-- Contenedor Transversal de Notificaciones Toast -->
    <app-toast-container></app-toast-container>

    <!-- Modal Transversal de Edición de Perfil -->
    <app-profile-modal></app-profile-modal>

    @if (authService.isAuthenticated()) {
      <div class="app-layout">
        <app-sidebar></app-sidebar>
        <div class="main-wrapper" [class.sidebar-collapsed]="api.sidebarCollapsed()">
          <app-navbar></app-navbar>
          <main class="content-area">
            <router-outlet></router-outlet>
          </main>
        </div>
      </div>
    } @else {
      <div class="auth-fullscreen-layout">
        <router-outlet></router-outlet>
      </div>
    }
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-main);
      color: var(--text-main);
      transition: background-color 0.25s ease, color 0.25s ease;
    }

    .auth-fullscreen-layout {
      min-height: 100vh;
      width: 100%;
      background-color: var(--bg-main);
    }

    .main-wrapper {
      margin-left: 260px;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      transition: margin-left 0.25s ease;

      &.sidebar-collapsed {
        margin-left: 76px;
      }
    }

    .content-area {
      flex: 1;
      padding: 1.75rem 2rem;
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
    }

    @media (max-width: 768px) {
      .main-wrapper {
        margin-left: 0;
        &.sidebar-collapsed {
          margin-left: 0;
        }
      }
      .content-area {
        padding: 1rem;
      }
    }
  `]
})
export class AppComponent {
  api = inject(ApiService);
  themeService = inject(ThemeService);
  authService = inject(AuthService);
}

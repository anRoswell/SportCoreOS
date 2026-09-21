import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="navbar">
      <!-- Sección Izquierda: Toggle Sidebar + Búsqueda -->
      <div class="navbar-left">
        <button class="toggle-sidebar-btn" (click)="api.toggleSidebar()" title="Colapsar / Expandir Menú">
          <i class="fa-solid fa-bars-staggered"></i>
        </button>

        <div class="search-bar">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Buscar jugador, dorsal, categoría, partido..." />
          <span class="search-kbd">⌘K</span>
        </div>
      </div>

      <!-- Sección Derecha: Selector Club, Theme Switcher, Notificaciones, Acciones, Perfil -->
      <div class="navbar-actions">
        <!-- Selector Multi-Tenant de Clubes -->
        <div class="club-selector-wrap">
          <i class="fa-solid fa-shield-halved club-icon"></i>
          <select 
            class="club-select" 
            [value]="api.activeClub().id" 
            (change)="onClubChange($event)">
            @for (club of api.availableClubs(); track club.id) {
              <option [value]="club.id">
                {{ club.nombre }} ({{ club.ciudad }})
              </option>
            }
          </select>
        </div>

        <!-- Botón Selector de Tema (Light / Dark Mode) -->
        <button 
          class="theme-toggle-btn" 
          (click)="themeService.toggleTheme()" 
          [attr.aria-label]="themeService.isDark() ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'"
          [title]="themeService.isDark() ? 'Cambiar a Modo Claro (Limpio)' : 'Cambiar a Modo Oscuro (Dark Sport)'">
          <div class="theme-icon-wrap" [class.is-dark]="themeService.isDark()">
            @if (themeService.isDark()) {
              <i class="fa-solid fa-sun sun-icon"></i>
              <span class="theme-label">Modo Claro</span>
            } @else {
              <i class="fa-solid fa-moon moon-icon"></i>
              <span class="theme-label">Modo Oscuro</span>
            }
          </div>
        </button>

        <!-- Notificaciones -->
        <button class="icon-btn" title="Notificaciones del Sistema">
          <i class="fa-regular fa-bell"></i>
          <span class="dot"></span>
        </button>

        <!-- Menú de Usuario con Dropdown & Logout -->
        <div class="user-menu-container">
          <button class="user-profile-btn" (click)="toggleUserDropdown()">
            <img [src]="authService.currentUser()?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'" alt="Avatar" class="avatar" />
            <div class="user-details">
              <span class="user-name">{{ authService.currentUser()?.nombres }}</span>
              <span class="user-role">{{ authService.currentUser()?.rolLabel }}</span>
            </div>
            <i class="fa-solid fa-chevron-down caret-icon"></i>
          </button>

          <!-- Dropdown Popup -->
          @if (showDropdown()) {
            <div class="user-dropdown-card">
              <div class="dropdown-header">
                <div class="user-full-info">
                  <strong>{{ authService.currentUser()?.nombres }} {{ authService.currentUser()?.apellidos }}</strong>
                  <span class="email-sub">{{ authService.currentUser()?.email }}</span>
                </div>
                <span class="role-pill" [class.is-super-admin]="authService.currentUser()?.rol === 'SUPER_ADMIN'">
                  {{ authService.currentUser()?.rol }}
                </span>
              </div>

              <div class="dropdown-divider"></div>

              <div class="dropdown-actions">
                <button class="dropdown-item" (click)="onOpenProfile()">
                  <i class="fa-regular fa-id-badge"></i> Mi Perfil Deportivo
                </button>
                <button class="dropdown-item" (click)="closeDropdown()">
                  <i class="fa-solid fa-sliders"></i> Ajustes de la Escuela
                </button>
              </div>

              <div class="dropdown-divider"></div>

              <button class="dropdown-logout-btn" (click)="onLogout()">
                <i class="fa-solid fa-arrow-right-from-bracket"></i>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .navbar {
      height: 70px;
      background: var(--bg-header);
      border-bottom: 1px solid var(--border-color);
      padding: 0 1.75rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 40;
      transition: background-color 0.25s ease, border-color 0.25s ease;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .toggle-sidebar-btn {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-color);
      cursor: pointer;
      font-size: 1rem;
      transition: all 0.2s ease;

      &:hover {
        color: var(--color-primary);
        border-color: var(--color-primary);
      }
    }

    .search-bar {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-full);
      padding: 0.5rem 1rem;
      width: 340px;
      transition: all 0.2s ease;

      &:focus-within {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px var(--color-primary-glow);
        background: var(--bg-card);
      }

      i {
        color: var(--text-muted);
        font-size: 0.85rem;
      }

      input {
        background: transparent;
        border: none;
        outline: none;
        font-size: 0.825rem;
        color: var(--text-main);
        width: 100%;

        &::placeholder {
          color: var(--text-dim);
        }
      }

      .search-kbd {
        font-size: 0.65rem;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        padding: 0.15rem 0.4rem;
        border-radius: 4px;
        color: var(--text-dim);
        font-weight: 700;
      }
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .club-selector-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-full);
      padding: 0.4rem 0.85rem;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--color-primary);
      }

      .club-icon {
        color: var(--color-primary);
        font-size: 0.9rem;
      }

      .club-select {
        background: transparent;
        border: none;
        outline: none;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--text-main);
        cursor: pointer;
      }
    }

    /* Botón de Tema */
    .theme-toggle-btn {
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-full);
      padding: 0.35rem 0.75rem;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--color-primary);
        transform: translateY(-1px);
        box-shadow: var(--shadow-sm);
      }

      .theme-icon-wrap {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.75rem;
        font-weight: 700;

        .sun-icon {
          color: #f59e0b;
        }

        .moon-icon {
          color: #38bdf8;
        }

        .theme-label {
          color: var(--text-main);
        }
      }
    }

    .icon-btn {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        color: var(--text-main);
        border-color: var(--color-primary);
      }

      .dot {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 8px;
        height: 8px;
        background: var(--color-primary);
        border-radius: 50%;
        border: 2px solid var(--bg-header);
      }
    }

    /* Menú de Usuario */
    .user-menu-container {
      position: relative;
    }

    .user-profile-btn {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.35rem 0.65rem;
      border-radius: var(--radius-md);
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        border-color: var(--color-primary);
        background: var(--bg-card-hover);
      }

      .avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        object-fit: cover;
        border: 1.5px solid var(--color-primary);
      }

      .user-details {
        display: flex;
        flex-direction: column;
        text-align: left;

        .user-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1.2;
        }

        .user-role {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--color-primary);
        }
      }

      .caret-icon {
        font-size: 0.7rem;
        color: var(--text-muted);
      }
    }

    .user-dropdown-card {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 260px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-dropdown);
      padding: 1rem;
      z-index: 100;
      animation: fadeInDown 0.15s ease-out;
    }

    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dropdown-header {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;

      .user-full-info {
        display: flex;
        flex-direction: column;
        font-size: 0.85rem;
        color: var(--text-main);

        .email-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      }

      .role-pill {
        font-size: 0.65rem;
        font-weight: 800;
        background: var(--color-primary-subtle);
        color: var(--color-primary);
        padding: 0.2rem 0.5rem;
        border-radius: var(--radius-full);
        width: fit-content;

        &.is-super-admin {
          background: rgba(244, 63, 94, 0.15);
          color: #f43f5e;
          border: 1px solid rgba(244, 63, 94, 0.35);
        }
      }
    }

    .dropdown-divider {
      height: 1px;
      background: var(--border-color);
      margin: 0.75rem 0;
    }

    .dropdown-actions {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.5rem 0.65rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-body);
      width: 100%;
      text-align: left;
      cursor: pointer;
      background: transparent;

      &:hover {
        background: var(--bg-surface);
        color: var(--text-main);
      }

      i {
        font-size: 0.85rem;
        color: var(--text-muted);
      }
    }

    .dropdown-logout-btn {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.5rem 0.65rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      font-weight: 700;
      color: #ef4444;
      width: 100%;
      text-align: left;
      cursor: pointer;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      transition: all 0.2s ease;

      &:hover {
        background: rgba(239, 68, 68, 0.15);
      }
    }

    @media (max-width: 900px) {
      .search-bar {
        display: none;
      }
      .user-details {
        display: none;
      }
    }
  `]
})
export class NavbarComponent {
  api = inject(ApiService);
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  profileService = inject(ProfileService);

  readonly showDropdown = signal<boolean>(false);

  onClubChange(event: Event): void {
    const clubId = (event.target as HTMLSelectElement).value;
    this.api.selectClub(clubId);
  }

  toggleUserDropdown(): void {
    this.showDropdown.update((val) => !val);
  }

  closeDropdown(): void {
    this.showDropdown.set(false);
  }

  onOpenProfile(): void {
    this.closeDropdown();
    this.profileService.openProfileModal();
  }

  onLogout(): void {
    this.closeDropdown();
    this.authService.logout();
  }
}

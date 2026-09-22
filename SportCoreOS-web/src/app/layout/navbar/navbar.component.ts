import { Component, inject, signal, computed, OnInit, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { ApiService, Club } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { LanguageSelectorComponent } from '../../shared/components/language-selector/language-selector.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, LanguageSelectorComponent],
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

      <!-- Sección Derecha: Selector Club, Multiidioma, Theme Switcher, Notificaciones, Acciones, Perfil -->
      <div class="navbar-actions">
        <!-- Selector Multi-Tenant de Escuelas y Clubes (Dropdown Rico + Fallback Select) -->
        <div class="club-selector-container">
          <button 
            type="button" 
            class="club-trigger-btn" 
            (click)="toggleClubDropdown($event)"
            [title]="'Escuela activa: ' + api.activeClub().nombre + ' (' + api.activeClub().ciudad + ')'"
            aria-haspopup="true"
            [attr.aria-expanded]="isOpenClubDropdown()">
            <div class="club-icon-wrap">
              <i class="fa-solid fa-shield-halved club-icon"></i>
            </div>
            <div class="club-info-wrap">
              <span class="club-name">{{ api.activeClub().nombre }}</span>
              <span class="club-meta">{{ api.activeClub().ciudad }} • {{ api.activeClub().sigla }}</span>
            </div>
            <i class="fa-solid fa-chevron-down caret-arrow" [class.rotated]="isOpenClubDropdown()"></i>
          </button>

          <!-- Select nativo accesible para sincronización y pruebas automatizadas E2E -->
          <select 
            class="club-select visually-hidden-for-tests" 
            [ngModel]="api.activeClub().id" 
            (ngModelChange)="onClubChange($event)">
            @for (club of api.availableClubs(); track club.id) {
              <option [value]="club.id">
                {{ club.nombre }} ({{ club.ciudad }})
              </option>
            }
          </select>

          <!-- Dropdown Popup de Escuelas Disponibles -->
          @if (isOpenClubDropdown()) {
            <div class="club-dropdown-card">
              <div class="dropdown-header">
                <div class="header-title-row">
                  <span class="dropdown-title">
                    <i class="fa-solid fa-school text-emerald"></i> Academias & Escuelas ({{ api.availableClubs().length }})
                  </span>
                  <button type="button" class="btn-refresh-clubs" (click)="refreshClubs($event)" title="Actualizar lista de escuelas">
                    <i class="fa-solid fa-arrows-rotate" [class.fa-spin]="isRefreshing()"></i>
                  </button>
                </div>
                
                <!-- Buscador de Escuelas en Vivo -->
                <div class="club-search-input-wrap">
                  <i class="fa-solid fa-magnifying-glass"></i>
                  <input 
                    type="text" 
                    [ngModel]="searchClubQuery()" 
                    (ngModelChange)="searchClubQuery.set($event)"
                    placeholder="Filtrar por nombre o ciudad..." 
                    class="club-filter-input" 
                    (click)="$event.stopPropagation()" />
                </div>
              </div>

              <div class="dropdown-club-list">
                @for (club of filteredClubs(); track club.id) {
                  <button 
                    type="button" 
                    class="club-option-item" 
                    [class.is-active]="club.id === api.activeClub().id"
                    (click)="selectClubFromDropdown(club.id)">
                    <div class="club-opt-avatar">
                      @if (club.logo) {
                        <img [src]="club.logo" [alt]="club.nombre" />
                      } @else {
                        <i class="fa-solid fa-shield-halved"></i>
                      }
                    </div>
                    <div class="club-opt-details">
                      <div class="club-opt-name-row">
                        <strong class="club-opt-name">{{ club.nombre }}</strong>
                        <span class="club-sigla-pill">{{ club.sigla }}</span>
                      </div>
                      <div class="club-opt-sub">
                        <span><i class="fa-solid fa-location-dot"></i> {{ club.ciudad }}</span>
                        <span class="plan-tag">{{ club.plan }}</span>
                      </div>
                    </div>
                    @if (club.id === api.activeClub().id) {
                      <div class="active-indicator">
                        <i class="fa-solid fa-circle-check check-icon"></i>
                      </div>
                    }
                  </button>
                } @empty {
                  <div class="empty-clubs">
                    <i class="fa-solid fa-circle-info"></i>
                    <span>No se encontraron escuelas con '{{ searchClubQuery() }}'</span>
                  </div>
                }
              </div>

              <!-- Footer de Acciones Super Admin -->
              <div class="dropdown-footer">
                <button type="button" class="btn-manage-schools" (click)="goToSchoolManagement($event)">
                  <i class="fa-solid fa-cubes"></i>
                  <span>Administrar Módulos & Licencias</span>
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Selector Multiidioma (i18n) -->
        <app-language-selector></app-language-selector>

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
                <button class="dropdown-item" (click)="goToSchoolManagement($event)">
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
      width: 300px;
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
      gap: 0.85rem;
    }

    /* Selector Multi-Tenant de Clubes */
    .club-selector-container {
      position: relative;
      display: inline-block;
    }

    .club-trigger-btn {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-full);
      padding: 0.35rem 0.85rem 0.35rem 0.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      max-width: 280px;

      &:hover {
        border-color: var(--color-primary);
        background: var(--bg-card);
        box-shadow: var(--shadow-sm);
      }

      .club-icon-wrap {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: rgba(16, 185, 129, 0.12);
        color: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.85rem;
        flex-shrink: 0;
      }

      .club-info-wrap {
        display: flex;
        flex-direction: column;
        text-align: left;
        overflow: hidden;
        line-height: 1.15;

        .club-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .club-meta {
          font-size: 0.65rem;
          color: var(--text-muted);
          font-weight: 600;
        }
      }

      .caret-arrow {
        font-size: 0.65rem;
        color: var(--text-muted);
        transition: transform 0.2s ease;
        margin-left: 0.15rem;

        &.rotated {
          transform: rotate(180deg);
        }
      }
    }

    .visually-hidden-for-tests {
      position: absolute;
      opacity: 0;
      width: 1px;
      height: 1px;
      pointer-events: none;
    }

    .club-dropdown-card {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      width: 320px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-dropdown);
      padding: 0.75rem;
      z-index: 1000;
      animation: dropdownFadeIn 0.15s ease-out;

      .dropdown-header {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-bottom: 0.6rem;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 0.5rem;

        .header-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .dropdown-title {
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            gap: 0.4rem;

            .text-emerald {
              color: var(--color-primary);
            }
          }

          .btn-refresh-clubs {
            background: transparent;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 0.2rem 0.35rem;
            font-size: 0.8rem;
            border-radius: var(--radius-sm);
            transition: all 0.2s ease;

            &:hover {
              color: var(--color-primary);
              background: var(--bg-surface);
            }
          }
        }

        .club-search-input-wrap {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.35rem 0.65rem;

          i {
            font-size: 0.75rem;
            color: var(--text-muted);
          }

          .club-filter-input {
            background: transparent;
            border: none;
            outline: none;
            font-size: 0.775rem;
            color: var(--text-main);
            width: 100%;

            &::placeholder {
              color: var(--text-dim);
            }
          }
        }
      }

      .dropdown-club-list {
        max-height: 240px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }

      .club-option-item {
        display: flex;
        align-items: center;
        gap: 0.65rem;
        width: 100%;
        padding: 0.5rem 0.65rem;
        background: transparent;
        border: 1px solid transparent;
        border-radius: var(--radius-md);
        color: var(--text-main);
        text-align: left;
        cursor: pointer;
        transition: all 0.15s ease;

        &:hover {
          background: var(--bg-surface);
          border-color: var(--border-color);
        }

        &.is-active {
          background: rgba(16, 185, 129, 0.12);
          border-color: rgba(16, 185, 129, 0.3);

          .club-opt-name {
            color: var(--color-primary);
          }
        }

        .club-opt-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          i {
            color: var(--color-primary);
            font-size: 0.85rem;
          }
        }

        .club-opt-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
          overflow: hidden;

          .club-opt-name-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.35rem;

            .club-opt-name {
              font-size: 0.8rem;
              font-weight: 700;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .club-sigla-pill {
              font-size: 0.65rem;
              font-weight: 800;
              background: var(--bg-surface);
              border: 1px solid var(--border-color);
              padding: 0.1rem 0.35rem;
              border-radius: 4px;
              color: var(--text-muted);
            }
          }

          .club-opt-sub {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 0.675rem;
            color: var(--text-muted);

            .plan-tag {
              color: var(--color-primary);
              font-weight: 600;
            }
          }
        }

        .active-indicator {
          color: var(--color-primary);
          font-size: 0.85rem;
        }
      }

      .empty-clubs {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 1rem;
        font-size: 0.775rem;
        color: var(--text-muted);
        justify-content: center;
      }

      .dropdown-footer {
        padding-top: 0.6rem;
        margin-top: 0.5rem;
        border-top: 1px solid var(--border-color);

        .btn-manage-schools {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.45rem;
          width: 100%;
          padding: 0.45rem 0.75rem;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-main);
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            border-color: var(--color-primary);
            color: var(--color-primary);
            background: rgba(16, 185, 129, 0.08);
          }
        }
      }
    }

    @keyframes dropdownFadeIn {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
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
export class NavbarComponent implements OnInit {
  api = inject(ApiService);
  themeService = inject(ThemeService);
  authService = inject(AuthService);
  profileService = inject(ProfileService);
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  readonly showDropdown = signal<boolean>(false);
  readonly isOpenClubDropdown = signal<boolean>(false);
  readonly searchClubQuery = signal<string>('');
  readonly isRefreshing = signal<boolean>(false);

  readonly filteredClubs = computed<Club[]>(() => {
    const query = this.searchClubQuery().toLowerCase().trim();
    const list = this.api.availableClubs();
    if (!query) return list;
    return list.filter(
      (c) =>
        c.nombre.toLowerCase().includes(query) ||
        c.ciudad.toLowerCase().includes(query) ||
        c.sigla.toLowerCase().includes(query)
    );
  });

  ngOnInit(): void {
    this.api.loadClubs();
  }

  toggleClubDropdown(event?: Event): void {
    if (event) event.stopPropagation();
    this.isOpenClubDropdown.update((val) => !val);
    if (this.isOpenClubDropdown()) {
      this.showDropdown.set(false);
      this.searchClubQuery.set('');
    }
  }

  closeClubDropdown(): void {
    this.isOpenClubDropdown.set(false);
    this.searchClubQuery.set('');
  }

  selectClubFromDropdown(clubId: string): void {
    this.api.selectClub(clubId);
    this.closeClubDropdown();
  }

  onClubChange(clubIdOrEvent: string | Event): void {
    const clubId = typeof clubIdOrEvent === 'string' 
      ? clubIdOrEvent 
      : (clubIdOrEvent.target as HTMLSelectElement).value;
    this.api.selectClub(clubId);
  }

  refreshClubs(event: Event): void {
    event.stopPropagation();
    this.isRefreshing.set(true);
    this.api.loadClubs();
    setTimeout(() => {
      this.isRefreshing.set(false);
    }, 600);
  }

  goToSchoolManagement(event: Event): void {
    event.stopPropagation();
    this.closeClubDropdown();
    this.closeDropdown();
    this.router.navigate(['/modulos-escuela']);
  }

  toggleUserDropdown(): void {
    this.showDropdown.update((val) => !val);
    if (this.showDropdown()) {
      this.isOpenClubDropdown.set(false);
    }
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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeClubDropdown();
      this.closeDropdown();
    }
  }
}


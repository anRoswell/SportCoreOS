import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar" [class.collapsed]="api.sidebarCollapsed()">
      <!-- Logo de la Plataforma -->
      <div class="brand">
        <div class="logo-icon">⚽</div>
        <div class="brand-text" *ngIf="!api.sidebarCollapsed()">
          <span class="brand-name">SportCore<span class="brand-badge">OS</span></span>
          <span class="brand-sub">SECTIC S.A.S.</span>
        </div>
      </div>

      <!-- Club Activo Multi-Tenant -->
      <div class="active-club-badge" [title]="api.activeClub().nombre">
        <div class="club-avatar">{{ api.activeClub().sigla }}</div>
        <div class="club-info" *ngIf="!api.sidebarCollapsed()">
          <p class="club-name">{{ api.activeClub().nombre }}</p>
          <span class="club-plan">{{ api.activeClub().plan }}</span>
        </div>
      </div>

      <!-- Menú de Navegación -->
      <nav class="nav-menu">
        <div class="nav-group-title" *ngIf="!api.sidebarCollapsed()">GESTIÓN PRINCIPAL</div>
        
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" [title]="api.sidebarCollapsed() ? 'Dashboard & KPIs' : ''">
          <i class="fa-solid fa-chart-pie"></i>
          <span *ngIf="!api.sidebarCollapsed()">Dashboard & KPIs</span>
        </a>

        <a routerLink="/jugadores" routerLinkActive="active" class="nav-item" [title]="api.sidebarCollapsed() ? 'Jugadores & Fichas' : ''">
          <i class="fa-solid fa-users"></i>
          <span *ngIf="!api.sidebarCollapsed()">Jugadores & Fichas</span>
          <span class="nav-pill" *ngIf="!api.sidebarCollapsed()">142</span>
        </a>

        <a routerLink="/categorias" routerLinkActive="active" class="nav-item" [title]="api.sidebarCollapsed() ? 'Categorías' : ''">
          <i class="fa-solid fa-layer-group"></i>
          <span *ngIf="!api.sidebarCollapsed()">Categorías (Sub-7..20)</span>
        </a>

        <div class="nav-group-title" *ngIf="!api.sidebarCollapsed()">COMPETICIÓN & FIXTURE</div>

        <a routerLink="/partidos" routerLinkActive="active" class="nav-item" [title]="api.sidebarCollapsed() ? 'Partidos & Fixture' : ''">
          <i class="fa-solid fa-futbol"></i>
          <span *ngIf="!api.sidebarCollapsed()">Partidos & Fixture</span>
          <span class="nav-pill-dot" *ngIf="!api.sidebarCollapsed()" title="2 Partidos esta semana"></span>
        </a>

        <a routerLink="/convocatorias" routerLinkActive="active" class="nav-item" [title]="api.sidebarCollapsed() ? 'Convocatorias' : ''">
          <i class="fa-solid fa-clipboard-user"></i>
          <span *ngIf="!api.sidebarCollapsed()">Convocatorias</span>
        </a>

        <div class="nav-group-title" *ngIf="!api.sidebarCollapsed()">CIENCIAS DEL DEPORTE & RENDIMIENTO</div>

        <a routerLink="/biometria" routerLinkActive="active" class="nav-item" [title]="api.sidebarCollapsed() ? 'Biometría & Tests' : ''">
          <i class="fa-solid fa-heart-pulse"></i>
          <span *ngIf="!api.sidebarCollapsed()">Biometría & Tests</span>
        </a>

        <a routerLink="/telemetria" routerLinkActive="active" class="nav-item" [title]="api.sidebarCollapsed() ? 'Telemetría GPS & Heatmaps' : ''">
          <i class="fa-solid fa-satellite-dish"></i>
          <span *ngIf="!api.sidebarCollapsed()">Telemetría GPS & Carga</span>
        </a>

        <a routerLink="/scouting" routerLinkActive="active" class="nav-item" [title]="api.sidebarCollapsed() ? 'Scouting & Visorías' : ''">
          <i class="fa-solid fa-binoculars"></i>
          <span *ngIf="!api.sidebarCollapsed()">Scouting & Captación</span>
        </a>

        <div class="nav-group-title" *ngIf="!api.sidebarCollapsed()">INTELIGENCIA ARTIFICIAL</div>

        <a routerLink="/ia" routerLinkActive="active" class="nav-item ai-nav-item" [title]="api.sidebarCollapsed() ? 'SportCore AI (Gemini)' : ''">
          <i class="fa-solid fa-wand-magic-sparkles text-emerald"></i>
          <span *ngIf="!api.sidebarCollapsed()">Copiloto Táctico AI</span>
          <span class="badge-app" style="background:linear-gradient(135deg,#10b981,#059669);" *ngIf="!api.sidebarCollapsed()">Gemini</span>
        </a>

        <div class="nav-group-title" *ngIf="!api.sidebarCollapsed()">FINANZAS & COMERCIO</div>

        <a routerLink="/finanzas" routerLinkActive="active" class="nav-item" [title]="api.sidebarCollapsed() ? 'Cobros PSE / Cartera' : ''">
          <i class="fa-solid fa-credit-card"></i>
          <span *ngIf="!api.sidebarCollapsed()">Cobros PSE / Cartera</span>
        </a>

        <a routerLink="/canchas" routerLinkActive="active" class="nav-item" [title]="api.sidebarCollapsed() ? 'Alquiler de Canchas' : ''">
          <i class="fa-solid fa-calendar-days"></i>
          <span *ngIf="!api.sidebarCollapsed()">Alquiler Canchas & Sedes</span>
        </a>

        <a routerLink="/tienda" routerLinkActive="active" class="nav-item" [title]="api.sidebarCollapsed() ? 'Tienda & Indumentaria' : ''">
          <i class="fa-solid fa-shirt"></i>
          <span *ngIf="!api.sidebarCollapsed()">Tienda & Kits Oficiales</span>
        </a>

        <a routerLink="/servicios" routerLinkActive="active" class="nav-item" [title]="api.sidebarCollapsed() ? 'Clínicas & Masterclasses' : ''">
          <i class="fa-solid fa-graduation-cap text-amber"></i>
          <span *ngIf="!api.sidebarCollapsed()">Servicios & Clínicas</span>
          <span class="badge-app" style="background:linear-gradient(135deg,#f59e0b,#d97706);" *ngIf="!api.sidebarCollapsed()">Nuevo</span>
        </a>

        <div class="nav-group-title" *ngIf="!api.sidebarCollapsed()">PORTAL FAMILIAR</div>

        <a routerLink="/portal-padres" routerLinkActive="active" class="nav-item parent-portal-link" [title]="api.sidebarCollapsed() ? 'Portal Móvil Padres' : ''">
          <i class="fa-solid fa-mobile-screen-button"></i>
          <span *ngIf="!api.sidebarCollapsed()">Portal Móvil Padres</span>
          <span class="badge-app" *ngIf="!api.sidebarCollapsed()">App</span>
        </a>

        <div class="nav-group-title" *ngIf="!api.sidebarCollapsed()">CONFIGURACIÓN & SAAS</div>

        <a routerLink="/modulos-escuela" routerLinkActive="active" class="nav-item" [title]="api.sidebarCollapsed() ? 'Módulos Escuela' : ''">
          <i class="fa-solid fa-cubes"></i>
          <span *ngIf="!api.sidebarCollapsed()">Módulos Escuela</span>
        </a>

        <a routerLink="/parametros" routerLinkActive="active" class="nav-item" [title]="api.sidebarCollapsed() ? 'Parámetros Sistema' : ''">
          <i class="fa-solid fa-sliders"></i>
          <span *ngIf="!api.sidebarCollapsed()">Parámetros Sistema</span>
        </a>

        <a routerLink="/roles-permisos" routerLinkActive="active" class="nav-item" [title]="api.sidebarCollapsed() ? 'Roles & Permisos' : ''">
          <i class="fa-solid fa-user-shield"></i>
          <span *ngIf="!api.sidebarCollapsed()">Roles & Permisos</span>
        </a>

        <a routerLink="/idiomas" routerLinkActive="active" class="nav-item" [title]="api.sidebarCollapsed() ? 'Idiomas & i18n' : ''">
          <i class="fa-solid fa-globe"></i>
          <span *ngIf="!api.sidebarCollapsed()">Idiomas & i18n</span>
        </a>
      </nav>

      <!-- Footer Version -->
      <div class="sidebar-footer" *ngIf="!api.sidebarCollapsed()">
        <p class="version">v1.0.0 Pro • Clean & Multi-Tenant</p>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      height: 100vh;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 50;
      transition: width 0.25s ease, background-color 0.25s ease, border-color 0.25s ease;

      &.collapsed {
        width: 76px;

        .brand {
          justify-content: center;
          padding: 1.25rem 0.5rem;
        }

        .active-club-badge {
          justify-content: center;
          margin: 0.75rem 0.5rem;
          padding: 0.5rem;
        }

        .nav-item {
          justify-content: center;
          padding: 0.75rem 0;

          i {
            margin: 0;
          }
        }
      }
    }

    .brand {
      padding: 1.25rem 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      border-bottom: 1px solid var(--border-color);

      .logo-icon {
        font-size: 1.75rem;
      }

      .brand-name {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--text-main);
        letter-spacing: -0.02em;

        .brand-badge {
          color: var(--color-primary);
          font-weight: 900;
        }
      }

      .brand-sub {
        display: block;
        font-size: 0.65rem;
        font-weight: 700;
        color: var(--text-muted);
        letter-spacing: 0.05em;
      }
    }

    .active-club-badge {
      margin: 1rem 1rem 0.5rem;
      padding: 0.75rem;
      background: var(--bg-surface);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.2s ease;

      .club-avatar {
        width: 32px;
        height: 32px;
        border-radius: var(--radius-xs);
        background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
        color: #ffffff;
        font-weight: 800;
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .club-info {
        min-width: 0;
        flex: 1;

        .club-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-main);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .club-plan {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--color-primary);
        }
      }
    }

    .nav-menu {
      flex: 1;
      padding: 0.75rem 0.85rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .nav-group-title {
      font-size: 0.65rem;
      font-weight: 800;
      color: var(--text-dim);
      letter-spacing: 0.08em;
      padding: 0.85rem 0.65rem 0.35rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.85rem;
      color: var(--text-body);
      font-size: 0.85rem;
      font-weight: 600;
      border-radius: var(--radius-md);
      transition: all 0.2s ease;
      position: relative;

      i {
        font-size: 1rem;
        width: 20px;
        text-align: center;
        color: var(--text-muted);
        transition: color 0.2s ease;
      }

      &:hover {
        background: var(--bg-surface);
        color: var(--text-main);

        i {
          color: var(--color-primary);
        }
      }

      &.active {
        background: var(--color-primary-subtle);
        color: var(--color-primary-dark);
        font-weight: 700;

        i {
          color: var(--color-primary);
        }

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 15%;
          bottom: 15%;
          width: 3px;
          background: var(--color-primary);
          border-radius: 0 4px 4px 0;
        }
      }

      .nav-pill {
        margin-left: auto;
        font-size: 0.7rem;
        background: var(--bg-surface);
        border: 1px solid var(--border-color);
        padding: 0.1rem 0.45rem;
        border-radius: var(--radius-full);
        color: var(--text-muted);
      }

      .nav-pill-dot {
        margin-left: auto;
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
        box-shadow: 0 0 6px #10b981;
      }

      .badge-app {
        margin-left: auto;
        font-size: 0.65rem;
        font-weight: 800;
        background: rgba(59, 130, 246, 0.15);
        color: #2563eb;
        padding: 0.15rem 0.45rem;
        border-radius: var(--radius-xs);
        border: 1px solid rgba(59, 130, 246, 0.3);
      }
    }

    .parent-portal-link {
      background: rgba(16, 185, 129, 0.04);
      border: 1px dashed rgba(16, 185, 129, 0.25);
      margin-top: 0.5rem;

      &:hover {
        background: rgba(16, 185, 129, 0.08);
      }
    }

    .sidebar-footer {
      padding: 1rem 1.25rem;
      border-top: 1px solid var(--border-color);

      .version {
        font-size: 0.65rem;
        font-weight: 700;
        color: var(--text-dim);
      }
    }

    [data-theme="dark"], body.dark-theme {
      .nav-item.active {
        color: #34d399;
      }
      .parent-portal-link .badge-app {
        color: #60a5fa;
      }
    }
  `]
})
export class SidebarComponent {
  api = inject(ApiService);
  authService = inject(AuthService);
}

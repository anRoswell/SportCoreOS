import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="mobile-app-header">
      <div class="header-left">
        <div class="club-logo-crest">
          <img src="/assets/branding/sportcore_icon.jpg" alt="SportCoreOS Crest" class="crest-img" />
          <span class="live-dot-beacon"></span>
        </div>
        <div class="header-titles">
          <div class="club-title-row">
            <h2 class="club-name">{{ auth.activeClub().nombre }}</h2>
          </div>
          <span class="app-version-pill">
            <i class="fa-solid fa-bolt text-emerald"></i> SportCore Cloud OS
          </span>
        </div>
      </div>

      <div class="header-right">
        @if (auth.currentUser(); as user) {
          <a routerLink="/perfil" class="user-pill-link" [title]="(user.nombres || 'Usuario') + ' (' + user.rol + ')'">
            <div class="user-avatar-mini">
              <img [src]="user.fotoUrl || auth.demoPersonas[1].avatar" alt="Avatar" />
              <div class="role-badge-dot" [class]="'dot-' + user.rol"></div>
            </div>
            <div class="user-text-meta">
              <span class="user-name-short">{{ getPrimerNombre(user.nombres) }}</span>
              <span class="user-role-label">{{ formatRole(user.rol) }}</span>
            </div>
          </a>
        }
      </div>
    </header>
  `,
  styles: [`
    .mobile-app-header {
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      padding-top: calc(var(--safe-area-top) + 0.65rem);
      padding-bottom: 0.65rem;
      padding-left: 1rem;
      padding-right: 1rem;
      background: rgba(15, 23, 42, 0.92);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 999;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.65rem;

      .club-logo-crest {
        position: relative;
        width: 38px;
        height: 38px;
        border-radius: 12px;
        overflow: hidden;
        border: 1.5px solid rgba(16, 185, 129, 0.4);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);

        .crest-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .live-dot-beacon {
          position: absolute;
          bottom: 1px;
          right: 1px;
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          border: 1.5px solid #0f172a;
        }
      }

      .header-titles {
        display: flex;
        flex-direction: column;

        .club-name {
          font-size: 0.88rem;
          font-weight: 900;
          color: #ffffff;
          margin: 0;
          max-width: 160px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.01em;
        }

        .app-version-pill {
          font-size: 0.65rem;
          color: #34d399;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }
    }

    .header-right {
      .user-pill-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: rgba(30, 41, 59, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.1);
        padding: 4px 8px 4px 4px;
        border-radius: 9999px;
        text-decoration: none;
        transition: all 0.2s;

        &:active {
          transform: scale(0.96);
          background: rgba(51, 65, 85, 0.9);
        }

        .user-avatar-mini {
          position: relative;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;

          img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .role-badge-dot {
            position: absolute;
            bottom: 0;
            right: 0;
            width: 7px;
            height: 7px;
            border-radius: 50%;
            border: 1px solid #1e293b;

            &.dot-SUPER_ADMIN { background: #f43f5e; }
            &.dot-DIRECTOR_DEPORTIVO { background: #10b981; }
            &.dot-ENTRENADOR_DT { background: #3b82f6; }
            &.dot-PADRE_ACUDIENTE { background: #a855f7; }
            &.dot-ADMIN_FINANCIERO { background: #f59e0b; }
          }
        }

        .user-text-meta {
          display: flex;
          flex-direction: column;

          .user-name-short {
            font-size: 0.7rem;
            font-weight: 800;
            color: #ffffff;
            line-height: 1.1;
          }

          .user-role-label {
            font-size: 0.58rem;
            font-weight: 700;
            color: #94a3b8;
          }
        }
      }
    }
  `]
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

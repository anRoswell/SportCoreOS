import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-mobile-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="mobile-app-header">
      <div class="header-left">
        <div class="club-badge-circle">
          {{ auth.activeClub().sigla }}
        </div>
        <div class="header-titles">
          <h2 class="club-name">{{ auth.activeClub().nombre }}</h2>
          <span class="app-version-pill">SportCore Mobile • 2026</span>
        </div>
      </div>

      <div class="header-right">
        @if (auth.currentUser(); as user) {
          <div class="user-pill" [title]="user.nombres + ' (' + user.rol + ')'">
            <div class="role-dot" [class]="'dot-' + user.rol"></div>
            <span class="user-role-label">{{ formatRole(user.rol) }}</span>
          </div>
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
      background: rgba(255, 255, 255, 0.94);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 999;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 0.65rem;

      .club-badge-circle {
        width: 38px;
        height: 38px;
        background: var(--color-primary-subtle);
        color: var(--color-primary);
        border: 1px solid var(--color-primary);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 0.85rem;
      }

      .header-titles {
        display: flex;
        flex-direction: column;

        .club-name {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--text-heading);
          max-width: 170px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .app-version-pill {
          font-size: 0.68rem;
          color: var(--color-primary);
          font-weight: 700;
        }
      }
    }

    .header-right {
      .user-pill {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        padding: 0.35rem 0.65rem;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        gap: 0.35rem;

        .role-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-primary);

          &.dot-DIRECTOR_DEPORTIVO { background: #10b981; }
          &.dot-ENTRENADOR { background: #3b82f6; }
          &.dot-PADRE_FAMILIA { background: #f59e0b; }
          &.dot-JUGADOR { background: #ec4899; }
        }

        .user-role-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-main);
        }
      }
    }
  `]
})
export class MobileHeaderComponent {
  auth = inject(AuthService);

  formatRole(role: string): string {
    switch (role) {
      case 'DIRECTOR_DEPORTIVO': return 'Director';
      case 'ENTRENADOR': return 'DT / Profe';
      case 'PADRE_FAMILIA': return 'Acudiente';
      case 'JUGADOR': return 'Deportista';
      default: return 'Usuario';
    }
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="bottom-nav-bar">
      <a routerLink="/home" routerLinkActive="active" class="nav-tab">
        <div class="nav-icon-wrap">
          <i class="fa-solid fa-house"></i>
        </div>
        <span>Inicio</span>
      </a>

      <a routerLink="/partidos" routerLinkActive="active" class="nav-tab">
        <div class="nav-icon-wrap">
          <i class="fa-solid fa-calendar-days"></i>
        </div>
        <span>Partidos</span>
      </a>

      <a routerLink="/convocatorias" routerLinkActive="active" class="nav-tab">
        <div class="nav-icon-wrap">
          <i class="fa-solid fa-clipboard-user"></i>
        </div>
        <span>Convocatoria</span>
      </a>

      <a routerLink="/perfil" routerLinkActive="active" class="nav-tab">
        <div class="nav-icon-wrap">
          <i class="fa-solid fa-user-gear"></i>
        </div>
        <span>Perfil</span>
      </a>
    </nav>
  `,
  styles: [`
    .bottom-nav-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: calc(60px + var(--safe-area-bottom));
      padding-bottom: var(--safe-area-bottom);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      border-top: 1px solid var(--border-color);
      display: flex;
      justify-content: space-around;
      align-items: center;
      z-index: 1000;
      box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.04);
    }

    .nav-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      color: var(--text-dim);
      text-decoration: none;
      font-size: 0.7rem;
      font-weight: 700;
      transition: all 0.2s ease;
      width: 25%;

      .nav-icon-wrap {
        font-size: 1.15rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      &.active {
        color: var(--color-primary);

        .nav-icon-wrap {
          transform: translateY(-2px);
        }
      }
    }
  `]
})
export class BottomNavComponent {
  auth = inject(AuthService);
}

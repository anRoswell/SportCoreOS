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

      <a routerLink="/tienda" routerLinkActive="active" class="nav-tab">
        <div class="nav-icon-wrap">
          <i class="fa-solid fa-bag-shopping"></i>
        </div>
        <span>Tienda</span>
      </a>

      <a routerLink="/perfil" routerLinkActive="active" class="nav-tab">
        <div class="nav-icon-wrap">
          <i class="fa-solid fa-id-card-clip"></i>
        </div>
        <span>Carnet</span>
      </a>
    </nav>
  `,
  styles: [`
    .bottom-nav-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: calc(62px + var(--safe-area-bottom));
      padding-bottom: var(--safe-area-bottom);
      background: rgba(15, 23, 42, 0.94);
      backdrop-filter: blur(16px);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      justify-content: space-around;
      align-items: center;
      z-index: 1000;
      box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.35);
    }

    .nav-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.2rem;
      color: #94a3b8;
      text-decoration: none;
      font-size: 0.66rem;
      font-weight: 700;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      width: 20%;

      .nav-icon-wrap {
        font-size: 1.15rem;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 28px;
        border-radius: 8px;
        transition: all 0.2s ease;
      }

      &.active {
        color: #34d399;

        .nav-icon-wrap {
          background: rgba(16, 185, 129, 0.18);
          color: #10b981;
          transform: translateY(-2px);
        }

        span {
          font-weight: 800;
          color: #ffffff;
        }
      }
    }
  `]
})
export class BottomNavComponent {
  auth = inject(AuthService);
}

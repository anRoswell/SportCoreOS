import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';

@Component({
  selector: 'app-perfil-mobile',
  standalone: true,
  imports: [CommonModule, MobileHeaderComponent, BottomNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-mobile-header title="Mi Perfil" subtitle="Información de cuenta y carnet"></app-mobile-header>

    <main class="page-content">
      <!-- Digital ID Card -->
      <div class="digital-card">
        <div class="card-glass">
          <div class="card-header">
            <div class="club-brand">
              <i class="fas fa-shield-halved brand-icon"></i>
              <span class="club-title">SPORTCORE CLUB</span>
            </div>
            <span class="id-badge">SOCIO ACTIVO</span>
          </div>

          <div class="card-body">
            <div class="avatar-box">
              <i class="fas fa-user-circle avatar-placeholder"></i>
            </div>
            <div class="player-info">
              <h2 class="user-fullname">{{ currentUser()?.nombres || 'Santiago Restrepo' }}</h2>
              <p class="user-role-label">{{ currentUser()?.rol || 'JUGADOR ÉLITE' }}</p>
              <div class="sub-tags">
                <span class="tag"><i class="fas fa-id-card"></i> CC 1020495812</span>
                <span class="tag"><i class="fas fa-tshirt"></i> #8 Sub-17</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="qr-preview">
              <i class="fas fa-qrcode"></i>
            </div>
            <div class="validity-info">
              <span class="val-label">Vigencia Carnet:</span>
              <span class="val-date">Temporada 2026-2027</span>
            </div>
          </div>
        </div>
      </div>

      <!-- User Details & Settings -->
      <div class="menu-section">
        <h4 class="section-title">Datos Personales</h4>
        <div class="info-list">
          <div class="info-item">
            <div class="info-left">
              <i class="fas fa-envelope"></i>
              <span>Correo Electrónico</span>
            </div>
            <span class="info-val">{{ currentUser()?.email || 'santiago.restrepo@sportcore.club' }}</span>
          </div>
          <div class="info-item">
            <div class="info-left">
              <i class="fas fa-phone"></i>
              <span>Teléfono Contacto</span>
            </div>
            <span class="info-val">+57 300 456 7890</span>
          </div>
          <div class="info-item">
            <div class="info-left">
              <i class="fas fa-heartbeat"></i>
              <span>EPS / Seguro Médico</span>
            </div>
            <span class="info-val">SURA EPS (Póliza Activa)</span>
          </div>
        </div>
      </div>

      <div class="menu-section">
        <h4 class="section-title">Ajustes de Seguridad</h4>
        <div class="info-list">
          <button class="action-row" (click)="cambiarClave()">
            <div class="info-left">
              <i class="fas fa-key"></i>
              <span>Cambiar Contraseña</span>
            </div>
            <i class="fas fa-chevron-right arrow"></i>
          </button>
          <button class="action-row" (click)="toggleNotificaciones()">
            <div class="info-left">
              <i class="fas fa-bell"></i>
              <span>Notificaciones Push de Convocatoria</span>
            </div>
            <span class="status-toggle">ACTIVADO</span>
          </button>
        </div>
      </div>

      <div class="logout-section">
        <button class="btn-logout" (click)="logout()">
          <i class="fas fa-arrow-right-from-bracket"></i>
          Cerrar Sesión Segura
        </button>
      </div>
    </main>

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .page-content {
      padding: 16px;
      padding-bottom: 96px;
      max-width: 600px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .digital-card {
      background: linear-gradient(135deg, #064e3b 0%, #022c22 60%, #0f172a 100%);
      border-radius: 20px;
      padding: 2px;
      box-shadow: 0 10px 25px -5px rgba(6, 78, 59, 0.5);
    }

    .card-glass {
      background: rgba(15, 23, 42, 0.4);
      backdrop-filter: blur(10px);
      border-radius: 18px;
      padding: 18px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .club-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--primary);

      .brand-icon {
        font-size: 1.2rem;
      }

      .club-title {
        font-weight: 900;
        letter-spacing: 0.05em;
        font-size: 0.95rem;
      }
    }

    .id-badge {
      font-size: 0.68rem;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 20px;
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.4);
    }

    .card-body {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 16px;
    }

    .avatar-placeholder {
      font-size: 3.5rem;
      color: var(--primary);
    }

    .player-info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .user-fullname {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 800;
        color: #fff;
      }

      .user-role-label {
        margin: 0;
        font-size: 0.8rem;
        font-weight: 700;
        color: var(--primary);
      }

      .sub-tags {
        display: flex;
        gap: 6px;
        margin-top: 6px;

        .tag {
          font-size: 0.72rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--text-secondary);
        }
      }
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 12px;

      .qr-preview {
        font-size: 1.8rem;
        color: #fff;
      }

      .validity-info {
        display: flex;
        flex-direction: column;
        align-items: flex-end;

        .val-label {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .val-date {
          font-size: 0.78rem;
          font-weight: 700;
          color: #fff;
        }
      }
    }

    .menu-section {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 16px;
    }

    .section-title {
      margin: 0 0 12px 0;
      font-size: 0.85rem;
      font-weight: 800;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-item, .action-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);

      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
    }

    .action-row {
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: inherit;
      cursor: pointer;
      text-align: left;
      font-family: inherit;
    }

    .info-left {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.88rem;
      color: var(--text-primary);

      i {
        width: 16px;
        color: var(--primary);
      }
    }

    .info-val {
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .arrow {
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    .status-toggle {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--primary);
      background: rgba(16, 185, 129, 0.15);
      padding: 2px 8px;
      border-radius: 6px;
    }

    .logout-section {
      margin-top: 8px;
    }

    .btn-logout {
      width: 100%;
      padding: 14px;
      border-radius: 12px;
      border: 1px solid rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
      font-weight: 700;
      font-size: 0.92rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(239, 68, 68, 0.2);
      }
    }
  `]
})
export class PerfilMobileComponent {
  private authService = inject(AuthService);
  private alertService = inject(AlertService);

  currentUser = this.authService.currentUser;

  cambiarClave(): void {
    this.alertService.info('Se ha enviado un enlace de cambio de contraseña a tu correo registrado.');
  }

  toggleNotificaciones(): void {
    this.alertService.success('Preferencias de notificaciones actualizadas.');
  }

  logout(): void {
    this.authService.logout();
  }
}

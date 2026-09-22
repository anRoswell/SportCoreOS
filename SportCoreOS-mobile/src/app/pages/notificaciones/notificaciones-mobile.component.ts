import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';

export interface NotificacionItem {
  id: string;
  tipo: 'convocatoria' | 'pago' | 'medico' | 'general' | 'partido';
  titulo: string;
  mensaje: string;
  tiempo: string;
  leida: boolean;
  icono: string;
  color: string;
  ruta?: string;
}

@Component({
  selector: 'app-notificaciones-mobile',
  standalone: true,
  imports: [CommonModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  template: `
    <app-mobile-header></app-mobile-header>

    <div class="notif-subbar">
      <div class="subbar-left">
        <a routerLink="/home" class="btn-back"><i class="fa-solid fa-arrow-left"></i></a>
        <h2>Centro de Notificaciones</h2>
      </div>
      @if (sinLeerCount() > 0) {
        <button class="btn-mark-read" (click)="marcarTodasLeidas()">
          <i class="fa-solid fa-check-double"></i> Leer todas
        </button>
      }
    </div>

    <main class="notif-container">
      <!-- Selector de Filtros -->
      <div class="filter-tabs">
        <button 
          class="tab-btn" 
          [class.active]="filtro() === 'todas'"
          (click)="filtro.set('todas')">
          Todas ({{ notificaciones().length }})
        </button>
        <button 
          class="tab-btn" 
          [class.active]="filtro() === 'sin_leer'"
          (click)="filtro.set('sin_leer')">
          Sin Leer ({{ sinLeerCount() }})
        </button>
      </div>

      <!-- Lista de Notificaciones -->
      <div class="notif-list">
        @for (item of notificacionesFiltradas(); track item.id) {
          <div 
            class="notif-card" 
            [class.unread]="!item.leida"
            (click)="abrirNotificacion(item)">
            <div class="icon-wrap" [style.background]="item.color + '15'" [style.color]="item.color">
              <i [class]="item.icono"></i>
            </div>

            <div class="notif-content">
              <div class="notif-header-row">
                <h4>{{ item.titulo }}</h4>
                <span class="time-text">{{ item.tiempo }}</span>
              </div>
              <p class="notif-msg">{{ item.mensaje }}</p>
              @if (!item.leida) {
                <span class="unread-dot"></span>
              }
            </div>
          </div>
        } @empty {
          <div class="empty-notif">
            <i class="fa-regular fa-bell-slash"></i>
            <p>No tienes notificaciones pendientes.</p>
          </div>
        }
      </div>
    </main>

    <app-bottom-nav></app-bottom-nav>
  `,
  styles: [`
    .notif-subbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.85rem 1rem;
      background: #fff;
      border-bottom: 1px solid var(--border-color, #e2e8f0);

      .subbar-left {
        display: flex;
        align-items: center;
        gap: 0.75rem;

        .btn-back {
          color: #0f172a;
          font-size: 1.1rem;
          text-decoration: none;
        }

        h2 {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
      }

      .btn-mark-read {
        background: #f1f5f9;
        border: none;
        padding: 0.4rem 0.75rem;
        border-radius: 8px;
        font-size: 0.75rem;
        font-weight: 700;
        color: #047857;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.35rem;
      }
    }

    .notif-container {
      padding: 1rem;
      padding-bottom: calc(75px + var(--safe-area-bottom));
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .filter-tabs {
      display: flex;
      background: #e2e8f0;
      padding: 0.25rem;
      border-radius: 10px;
      gap: 0.25rem;

      .tab-btn {
        flex: 1;
        background: none;
        border: none;
        padding: 0.55rem;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 700;
        color: #64748b;
        cursor: pointer;

        &.active {
          background: #fff;
          color: #0f172a;
          box-shadow: 0 2px 4px rgba(0,0,0,0.06);
        }
      }
    }

    .notif-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .notif-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      padding: 0.95rem;
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      cursor: pointer;
      position: relative;
      transition: transform 0.2s ease;

      &.unread {
        border-color: #10b981;
        background: #f0fdf4;
      }

      .icon-wrap {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        flex-shrink: 0;
      }

      .notif-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;

        .notif-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;

          h4 {
            font-size: 0.88rem;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
            line-height: 1.25;
          }

          .time-text {
            font-size: 0.68rem;
            color: #94a3b8;
            white-space: nowrap;
          }
        }

        .notif-msg {
          font-size: 0.78rem;
          color: #475569;
          margin: 0;
          line-height: 1.4;
        }

        .unread-dot {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
        }
      }
    }

    .empty-notif {
      text-align: center;
      padding: 3rem 1rem;
      color: #94a3b8;
      i { font-size: 3rem; margin-bottom: 0.75rem; }
      p { font-size: 0.9rem; font-weight: 600; }
    }
  `]
})
export class NotificacionesMobileComponent {
  auth = inject(AuthService);
  filtro = signal<'todas' | 'sin_leer'>('todas');

  notificaciones = signal<NotificacionItem[]>([
    {
      id: 'n1',
      tipo: 'convocatoria',
      titulo: '¡Has sido convocado al partido!',
      mensaje: 'El DT te ha citado para el clásico Sub-15 vs Millonarios FC este Sábado 09:00 AM.',
      tiempo: 'Hace 10 min',
      leida: false,
      icono: 'fa-solid fa-clipboard-user',
      color: '#10b981',
      ruta: '/convocatorias'
    },
    {
      id: 'n2',
      tipo: 'pago',
      titulo: 'Mensualidad Septiembre Lista para Pago',
      mensaje: 'Tu recibo de pensión y entrenamiento ya está disponible para pago en línea por PSE o Wompi.',
      tiempo: 'Hace 2 horas',
      leida: false,
      icono: 'fa-solid fa-credit-card',
      color: '#2563eb',
      ruta: '/pagos'
    },
    {
      id: 'n3',
      tipo: 'medico',
      titulo: 'Boletín IA y Certificado Médico',
      mensaje: 'El equipo de rendimiento deportivo y Gemini IA han generado el nuevo reporte físico.',
      tiempo: 'Ayer',
      leida: true,
      icono: 'fa-solid fa-heart-pulse',
      color: '#ec4899',
      ruta: '/perfil/boletin-ia'
    },
    {
      id: 'n4',
      tipo: 'partido',
      titulo: 'Cambio de Sede de Entrenamiento',
      mensaje: 'El entrenamiento de mañana se traslada al Campo Sintético Sede Norte debido al mantenimiento de grama.',
      tiempo: 'Hace 2 días',
      leida: true,
      icono: 'fa-solid fa-futbol',
      color: '#f59e0b',
      ruta: '/entrenamientos'
    }
  ]);

  sinLeerCount = computed(() => this.notificaciones().filter(n => !n.leida).length);

  notificacionesFiltradas = computed(() => {
    if (this.filtro() === 'sin_leer') {
      return this.notificaciones().filter(n => !n.leida);
    }
    return this.notificaciones();
  });

  abrirNotificacion(item: NotificacionItem) {
    const list = this.notificaciones().map(n => n.id === item.id ? { ...n, leida: true } : n);
    this.notificaciones.set(list);
  }

  marcarTodasLeidas() {
    const list = this.notificaciones().map(n => ({ ...n, leida: true }));
    this.notificaciones.set(list);
  }
}

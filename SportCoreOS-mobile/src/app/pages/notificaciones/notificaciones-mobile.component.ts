import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
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
  imports: [CommonModule, RouterModule, ScrollingModule, MobileHeaderComponent, BottomNavComponent],
  template: `
    <app-mobile-header></app-mobile-header>

    <div class="notif-subbar">
      <div class="subbar-left">
        <a routerLink="/home" class="btn-back"><i class="fa-solid fa-arrow-left"></i></a>
        <h2>Notificaciones</h2>
      </div>
      <div class="subbar-right">
        <button class="btn-icon-refresh" [class.spinning]="isRefreshing()" (click)="recargarNotificaciones()" title="Actualizar">
          <i class="fa-solid fa-arrows-rotate"></i>
        </button>
        @if (sinLeerCount() > 0) {
          <button class="btn-mark-read" (click)="marcarTodasLeidas()">
            <i class="fa-solid fa-check-double"></i>
          </button>
        }
      </div>
    </div>

    <main class="notif-container">
      <!-- Selector de Filtros -->
      <div class="filter-tabs">
        <button 
          class="tab-btn" 
          [class.active]="filtro() === 'todas'"
          (click)="cambiarFiltro('todas')">
          Todas ({{ displayedItems().length }})
        </button>
        <button 
          class="tab-btn" 
          [class.active]="filtro() === 'sin_leer'"
          (click)="cambiarFiltro('sin_leer')">
          Sin Leer ({{ sinLeerCount() }})
        </button>
      </div>

      <!-- Virtual Scrolling Viewport para rendimiento fluido -->
      <cdk-virtual-scroll-viewport 
        itemSize="88" 
        class="notif-viewport"
        (scrolledIndexChange)="onScrollChange($event)">
        
        <div *cdkVirtualFor="let item of displayedItems(); trackBy: trackById" class="notif-item-wrapper">
          <div 
            class="notif-card" 
            [class.unread]="!item.leida"
            (click)="abrirNotificacion(item)">
            <div class="icon-wrap" [style.background]="item.color + '18'" [style.color]="item.color">
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
        </div>

        @if (isLoadingMore()) {
          <div class="infinite-indicator">
            <i class="fa-solid fa-circle-notch fa-spin text-primary"></i>
            <span>Cargando más alertas...</span>
          </div>
        } @else if (hasReachedEnd() && displayedItems().length > 0) {
          <div class="infinite-end">
            <span>Fin del historial de notificaciones</span>
          </div>
        } @else if (displayedItems().length === 0) {
          <div class="empty-notif">
            <i class="fa-regular fa-bell-slash"></i>
            <p>No tienes notificaciones en esta categoría.</p>
          </div>
        }
      </cdk-virtual-scroll-viewport>
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
          font-size: 1.05rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
      }

      .subbar-right {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        .btn-icon-refresh {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #059669;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;

          &.spinning i {
            animation: spin 0.8s linear infinite;
          }
        }

        .btn-mark-read {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
          padding: 0.35rem 0.65rem;
          border-radius: 8px;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
        }
      }
    }

    .notif-container {
      height: calc(100vh - 135px - var(--safe-area-bottom));
      height: calc(100dvh - 135px - var(--safe-area-bottom));
      display: flex;
      flex-direction: column;
      background: #f8fafc;
      width: 100%;
      max-width: 100vw;
      overflow-x: hidden !important;
      overflow-y: hidden;
      box-sizing: border-box;
    }

    .filter-tabs {
      display: flex;
      gap: 0.5rem;
      padding: 0.75rem 1rem 0.4rem;
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
      width: 100%;
      box-sizing: border-box;

      .tab-btn {
        flex: 1;
        padding: 0.5rem;
        background: #f1f5f9;
        border: none;
        border-radius: 10px;
        font-size: 0.76rem;
        font-weight: 700;
        color: #64748b;
        cursor: pointer;
        transition: all 0.2s;

        &.active {
          background: #0f172a;
          color: #fff;
        }
      }
    }

    .notif-viewport {
      flex: 1;
      width: 100% !important;
      max-width: 100% !important;
      padding: 0.65rem 0.85rem;
      box-sizing: border-box !important;
      overflow-x: hidden !important;
    }

    .notif-item-wrapper {
      height: 88px;
      padding-bottom: 0.5rem;
      box-sizing: border-box !important;
      width: 100% !important;
      max-width: 100% !important;
    }

    .notif-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 0.75rem;
      display: flex;
      gap: 0.75rem;
      align-items: center;
      height: 100%;
      box-sizing: border-box;
      position: relative;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.02);

      &.unread {
        border-color: #a7f3d0;
        background: #fafdfb;
      }

      .icon-wrap {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        flex-shrink: 0;
      }

      .notif-content {
        flex: 1;
        min-width: 0;

        .notif-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.2rem;

          h4 {
            font-size: 0.84rem;
            font-weight: 800;
            color: #0f172a;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .time-text {
            font-size: 0.66rem;
            color: #94a3b8;
            flex-shrink: 0;
            margin-left: 0.4rem;
          }
        }

        .notif-msg {
          font-size: 0.74rem;
          color: #475569;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .unread-dot {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 7px;
          height: 7px;
          background: #059669;
          border-radius: 50%;
        }
      }
    }

    .infinite-indicator, .infinite-end {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0.75rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: #64748b;
    }

    .empty-notif {
      text-align: center;
      padding: 3rem 1rem;
      color: #94a3b8;

      i { font-size: 2.2rem; margin-bottom: 0.75rem; }
      p { font-size: 0.85rem; font-weight: 600; margin: 0; }
    }

    @keyframes spin { 100% { transform: rotate(360deg); } }
  `]
})
export class NotificacionesMobileComponent implements OnInit {
  auth = inject(AuthService);
  filtro = signal<'todas' | 'sin_leer'>('todas');
  isRefreshing = signal<boolean>(false);
  isLoadingMore = signal<boolean>(false);
  hasReachedEnd = signal<boolean>(false);

  private allNotifications: NotificacionItem[] = [];
  displayedItems = signal<NotificacionItem[]>([]);
  private pageSize = 8;
  private currentOffset = 0;

  sinLeerCount = computed(() => this.allNotifications.filter(n => !n.leida).length);

  ngOnInit(): void {
    this.generarCatalogoNotificaciones();
    this.cargarMas();
  }

  trackById(index: number, item: NotificacionItem): string {
    return item.id;
  }

  private generarCatalogoNotificaciones(): void {
    const baseItems: NotificacionItem[] = [
      {
        id: 'notif-1',
        tipo: 'convocatoria',
        titulo: 'Convocatoria Oficial: vs Millonarios FC',
        mensaje: 'Has sido citado como Titular en la Cancha Sintética 1. Hora de citación: 08:30 AM.',
        tiempo: 'Hace 10 min',
        leida: false,
        icono: 'fa-solid fa-clipboard-user',
        color: '#059669',
        ruta: '/convocatorias'
      },
      {
        id: 'notif-2',
        tipo: 'pago',
        titulo: 'Recibo Generado: Pensión Septiembre 2026',
        mensaje: 'La mensualidad formativa de Septiembre se encuentra disponible para pago PSE/Wompi.',
        tiempo: 'Hace 1 hora',
        leida: false,
        icono: 'fa-solid fa-credit-card',
        color: '#d97706',
        ruta: '/pagos'
      },
      {
        id: 'notif-3',
        tipo: 'partido',
        titulo: 'Cambio de Sede: Fecha 4 Liga Departamental',
        mensaje: 'El partido de este sábado se jugará en el Complejo Deportivo Arrayanes Cancha 2.',
        tiempo: 'Hace 3 horas',
        leida: true,
        icono: 'fa-solid fa-futbol',
        color: '#2563eb',
        ruta: '/partidos'
      },
      {
        id: 'notif-4',
        tipo: 'medico',
        titulo: 'Actualización de Ficha Antropométrica',
        mensaje: 'El preparador físico registró nuevos valores de IMC y Test de Cooper.',
        tiempo: 'Ayer',
        leida: true,
        icono: 'fa-solid fa-heart-pulse',
        color: '#e11d48',
        ruta: '/rendimiento'
      },
      {
        id: 'notif-5',
        tipo: 'general',
        titulo: 'Boletín Táctico con Inteligencia Artificial',
        mensaje: 'Tu informe trimestral de progresión táctica ha sido generado exitosamente.',
        tiempo: 'Hace 2 días',
        leida: true,
        icono: 'fa-solid fa-wand-magic-sparkles',
        color: '#7c3aed',
        ruta: '/perfil/boletin-ia'
      }
    ];

    // Buffer de 40 notificaciones para scroll fluido
    this.allNotifications = [];
    for (let i = 0; i < 8; i++) {
      baseItems.forEach(item => {
        this.allNotifications.push({
          ...item,
          id: `${item.id}-${i}`,
          titulo: i === 0 ? item.titulo : `${item.titulo} (Historial ${i})`,
          leida: i > 0 || item.leida,
          tiempo: i === 0 ? item.tiempo : `Hace ${i + 2} días`
        });
      });
    }
  }

  cargarMas(): void {
    if (this.isLoadingMore() || this.hasReachedEnd()) return;

    this.isLoadingMore.set(true);
    setTimeout(() => {
      const filteredSource = this.filtro() === 'sin_leer' 
        ? this.allNotifications.filter(n => !n.leida) 
        : this.allNotifications;

      const nextBatch = filteredSource.slice(this.currentOffset, this.currentOffset + this.pageSize);
      if (nextBatch.length > 0) {
        this.displayedItems.update(curr => [...curr, ...nextBatch]);
        this.currentOffset += this.pageSize;
      }
      if (this.currentOffset >= filteredSource.length) {
        this.hasReachedEnd.set(true);
      }
      this.isLoadingMore.set(false);
    }, 300);
  }

  onScrollChange(index: number): void {
    const total = this.displayedItems().length;
    if (index >= total - 3 && !this.isLoadingMore() && !this.hasReachedEnd()) {
      this.cargarMas();
    }
  }

  cambiarFiltro(nuevoFiltro: 'todas' | 'sin_leer'): void {
    this.filtro.set(nuevoFiltro);
    this.currentOffset = 0;
    this.displayedItems.set([]);
    this.hasReachedEnd.set(false);
    this.cargarMas();
  }

  recargarNotificaciones(): void {
    this.isRefreshing.set(true);
    this.currentOffset = 0;
    this.displayedItems.set([]);
    this.hasReachedEnd.set(false);
    setTimeout(() => {
      this.cargarMas();
      this.isRefreshing.set(false);
    }, 450);
  }

  marcarTodasLeidas(): void {
    this.allNotifications = this.allNotifications.map(n => ({ ...n, leida: true }));
    this.displayedItems.update(items => items.map(n => ({ ...n, leida: true })));
  }

  abrirNotificacion(item: NotificacionItem): void {
    item.leida = true;
    this.displayedItems.update(items => items.map(n => n.id === item.id ? { ...n, leida: true } : n));
  }
}

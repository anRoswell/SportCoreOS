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
  templateUrl: './notificaciones-mobile.component.html',
  styleUrl: './notificaciones-mobile.component.scss'
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

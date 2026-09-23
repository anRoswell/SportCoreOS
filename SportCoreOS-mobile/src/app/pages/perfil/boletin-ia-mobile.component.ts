import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';

export interface MetricaRendimiento {
  label: string;
  valor: number;
  max: number;
  unidad: string;
  icono: string;
  color: string;
}

@Component({
  selector: 'app-boletin-ia-mobile',
  standalone: true,
  imports: [CommonModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  templateUrl: './boletin-ia-mobile.component.html',
  styleUrl: './boletin-ia-mobile.component.scss'
})
export class BoletinIaMobileComponent {
  auth = inject(AuthService);
  isRefreshing = signal<boolean>(false);

  recargarBoletin(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
    }, 600);
  }

  metricas: MetricaRendimiento[] = [
    { label: 'Velocidad Punta', valor: 28.4, max: 35, unidad: 'km/h', icono: 'fa-solid fa-gauge-high', color: '#0284c7' },
    { label: 'Precisión Pases', valor: 88, max: 100, unidad: '%', icono: 'fa-solid fa-arrows-split-up-and-left', color: '#10b981' },
    { label: 'Distancia x Partido', valor: 7.2, max: 10, unidad: 'km', icono: 'fa-solid fa-person-running', color: '#8b5cf6' },
    { label: 'Resistencia Aeróbica', valor: 92, max: 100, unidad: '%', icono: 'fa-solid fa-heart-pulse', color: '#f59e0b' }
  ];
}

import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';

export interface TestBiometrico {
  fecha: string;
  pesoKg: number;
  estaturaCm: number;
  imc: number;
  grasaPct: number;
  velocidad30mSeg: number;
  saltoVerticalCm: number;
  vo2Max: number;
}

@Component({
  selector: 'app-rendimiento-mobile',
  standalone: true,
  imports: [CommonModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  templateUrl: './rendimiento-mobile.component.html',
  styleUrl: './rendimiento-mobile.component.scss'
})
export class RendimientoMobileComponent {
  auth = inject(AuthService);
  isRefreshing = signal<boolean>(false);

  recargarBiometria(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
    }, 600);
  }

  testActual: TestBiometrico = {
    fecha: '15 de Septiembre 2026',
    pesoKg: 58.4,
    estaturaCm: 168.5,
    imc: 20.6,
    grasaPct: 11.2,
    velocidad30mSeg: 3.92,
    saltoVerticalCm: 44.5,
    vo2Max: 54.2
  };
}

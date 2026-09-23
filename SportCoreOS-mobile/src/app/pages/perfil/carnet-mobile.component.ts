import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';

export interface DeportistaCarnet {
  nombre: string;
  posicion: string;
  categoria: string;
  dorsal: number;
  socioId: string;
  vigencia: string;
  foto: string;
  eps: string;
  tipoSangre: string;
  contactoEmergencia: string;
  telefonoEmergencia: string;
  alergias: string;
  estadoMedico: 'Apto para Competencia' | 'En Observación' | 'Incapacitado';
}

@Component({
  selector: 'app-carnet-mobile',
  standalone: true,
  imports: [CommonModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  templateUrl: './carnet-mobile.component.html',
  styleUrl: './carnet-mobile.component.scss'
})
export class CarnetMobileComponent {
  auth = inject(AuthService);
  vistaActiva = signal<'carnet' | 'medica'>('carnet');
  isRefreshing = signal<boolean>(false);

  recargarCarnet(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
    }, 600);
  }

  deportista: DeportistaCarnet = {
    nombre: 'Mateo Morales Silva',
    posicion: 'Delantero Extremo',
    categoria: 'Sub-15 A',
    dorsal: 10,
    socioId: 'SC-2026-9482',
    vigencia: '31/DIC/2026',
    foto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    eps: 'Sura EPS / Poliza Allianz',
    tipoSangre: 'O Positivo (O+)',
    contactoEmergencia: 'Claudia Silva (Madre)',
    telefonoEmergencia: '+57 312 450 8899',
    alergias: 'Ninguna conocida / Apto sin restricciones cardiorrespiratorias.',
    estadoMedico: 'Apto para Competencia'
  };

  guardarEnBilletera() {
    alert('Pase digital exportado y sincronizado con Apple Wallet / Google Wallet.');
  }
}

import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';

export interface CanchaSede {
  id: string;
  nombre: string;
  tipo: 'Fútbol 11' | 'Fútbol 8' | 'Fútbol 5';
  superficie: 'Sintética Pro' | 'Césped Natural' | 'Coliseo Duela';
  precioHora: number;
  imagen: string;
  iluminacion: boolean;
  sede: string;
  horariosDisponibles: string[];
}

export interface ReservaActiva {
  id: string;
  canchaNombre: string;
  sede: string;
  fecha: string;
  hora: string;
  duracion: number;
  total: number;
  estado: 'CONFIRMADA' | 'PENDIENTE_PAGO';
  codigoAcceso: string;
}

@Component({
  selector: 'app-canchas-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  templateUrl: './canchas-mobile.component.html',
  styleUrl: './canchas-mobile.component.scss'
})
export class CanchasMobileComponent {
  auth = inject(AuthService);

  filtroTipo = signal<string>('todos');
  fechaSeleccionada = signal<string>('2026-09-23');
  metodoPago = signal<string>('PSE');

  isRefreshing = signal<boolean>(false);
  reservaModal = signal<{ cancha: CanchaSede; hora: string } | null>(null);
  mostrarMisReservas = signal<boolean>(false);
  reservaExitosa = signal<boolean>(false);
  codigoGenerado = '';

  recargarCanchas(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.isRefreshing.set(false);
    }, 600);
  }

  proximosDias = [
    { fechaStr: '2026-09-23', nombreDia: 'MIE', numDia: '23', mes: 'SEP' },
    { fechaStr: '2026-09-24', nombreDia: 'JUE', numDia: '24', mes: 'SEP' },
    { fechaStr: '2026-09-25', nombreDia: 'VIE', numDia: '25', mes: 'SEP' },
    { fechaStr: '2026-09-26', nombreDia: 'SAB', numDia: '26', mes: 'SEP' },
    { fechaStr: '2026-09-27', nombreDia: 'DOM', numDia: '27', mes: 'SEP' }
  ];

  readonly fallbackCanchaImg = 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&auto=format&fit=crop&q=80';

  onImgError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target && target.src !== this.fallbackCanchaImg) {
      target.src = this.fallbackCanchaImg;
    }
  }

  canchas = signal<CanchaSede[]>([
    {
      id: 'c1',
      nombre: 'Cancha Estadio El Prado (F11)',
      tipo: 'Fútbol 11',
      superficie: 'Césped Natural',
      precioHora: 190000,
      imagen: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600&auto=format&fit=crop&q=80',
      iluminacion: true,
      sede: 'Sede Principal - Campo A',
      horariosDisponibles: ['06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM']
    },
    {
      id: 'c2',
      nombre: 'Cancha Sintética Champions (F8)',
      tipo: 'Fútbol 8',
      superficie: 'Sintética Pro',
      precioHora: 140000,
      imagen: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&auto=format&fit=crop&q=80',
      iluminacion: true,
      sede: 'Sede Principal - Campo B',
      horariosDisponibles: ['05:00 PM', '06:00 PM', '07:00 PM', '09:00 PM']
    },
    {
      id: 'c3',
      nombre: 'Cancha Sintética Maracaná (F5)',
      tipo: 'Fútbol 5',
      superficie: 'Sintética Pro',
      precioHora: 95000,
      imagen: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&auto=format&fit=crop&q=80',
      iluminacion: true,
      sede: 'Sede Norte - Cancha 1',
      horariosDisponibles: ['04:00 PM', '05:00 PM', '08:00 PM', '10:00 PM']
    },
    {
      id: 'c4',
      nombre: 'Coliseo Cubierto Futsal',
      tipo: 'Fútbol 5',
      superficie: 'Coliseo Duela',
      precioHora: 85000,
      imagen: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=600&auto=format&fit=crop&q=80',
      iluminacion: true,
      sede: 'Sede Principal - Coliseo',
      horariosDisponibles: ['03:00 PM', '04:00 PM', '06:00 PM', '07:00 PM']
    }
  ]);

  misReservas = signal<ReservaActiva[]>([
    {
      id: 'r-101',
      canchaNombre: 'Cancha Sintética Champions (F8)',
      sede: 'Sede Principal - Campo B',
      fecha: '2026-09-24',
      hora: '07:00 PM',
      duracion: 60,
      total: 140000,
      estado: 'CONFIRMADA',
      codigoAcceso: 'RES-8491'
    }
  ]);

  canchasFiltradas = computed(() => {
    const f = this.filtroTipo();
    if (f === 'todos') return this.canchas();
    return this.canchas().filter(c => c.tipo === f);
  });

  seleccionarHorario(cancha: CanchaSede, hora: string) {
    this.reservaModal.set({ cancha, hora });
  }

  abrirMisReservas() {
    this.mostrarMisReservas.set(true);
  }

  confirmarReserva() {
    const r = this.reservaModal();
    if (!r) return;

    this.codigoGenerado = 'RES-' + Math.floor(1000 + Math.random() * 9000);

    const nuevaReserva: ReservaActiva = {
      id: 'r-' + Date.now(),
      canchaNombre: r.cancha.nombre,
      sede: r.cancha.sede,
      fecha: this.fechaSeleccionada(),
      hora: r.hora,
      duracion: 60,
      total: r.cancha.precioHora,
      estado: 'CONFIRMADA',
      codigoAcceso: this.codigoGenerado
    };

    this.misReservas.set([nuevaReserva, ...this.misReservas()]);
    this.reservaModal.set(null);
    this.reservaExitosa.set(true);
  }

  cancelarReserva(id: string) {
    if (confirm('¿Deseas cancelar esta reserva de cancha?')) {
      this.misReservas.set(this.misReservas().filter(r => r.id !== id));
    }
  }
}

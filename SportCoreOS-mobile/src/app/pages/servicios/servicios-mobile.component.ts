import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { environment } from '../../../environments/environment';

export interface ServicioMobile {
  id: string;
  titulo: string;
  subtitulo: string;
  categoria_servicio: string;
  icono?: string;
  color_tema?: string;
  entrenador_nombre: string;
  entrenador_avatar?: string;
  entrenador_badge?: string;
  cancha_nombre: string;
  cancha_direccion: string;
  cancha_gps_url?: string;
  dias_semana: string;
  horario_rango: string;
  duracion_minutos?: number;
  edad_min?: number;
  edad_max?: number;
  cupos_totales: number;
  cupos_ocupados: number;
  precio_sesion_individual: number | string;
  precio_paquete_mensual: number | string;
  descuento_hermanos_pct?: number;
  insignia_obtenida: string;
  descripcion: string;
  beneficios?: string[];
}

@Component({
  selector: 'app-servicios-mobile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MobileHeaderComponent, BottomNavComponent],
  templateUrl: './servicios-mobile.component.html',
  styleUrl: './servicios-mobile.component.scss'
})
export class ServiciosMobileComponent implements OnInit {
  private http = inject(HttpClient);
  public auth = inject(AuthService);
  private alert = inject(AlertService);

  private apiUrl = environment.apiUrl;
  defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face';

  // Signals
  servicios = signal<ServicioMobile[]>([]);
  misPases = signal<any[]>([]);
  searchQuery = signal<string>('');
  selectedCategoria = signal<string>('TODAS');
  isRefreshing = signal<boolean>(false);

  // Modal States
  modalInscripcion = signal<boolean>(false);
  modalMisPases = signal<boolean>(false);
  selectedServicio = signal<ServicioMobile | null>(null);

  // Form
  tipoPlan = signal<'PAQUETE_MENSUAL' | 'SESION_INDIVIDUAL'>('PAQUETE_MENSUAL');
  nombreJugador = 'Samuel Díaz Restrepo';
  nombreAcudiente = 'Carlos Díaz';
  telefonoAcudiente = '+57 310 987 6543';
  aplicaDescuentoHermano = false;
  metodoPago = signal<string>('WOMPI_PSE');
  comprobanteUrl = signal<string>('');
  referenciaTransaccion = 'NQ-849201';
  isSubmitting = signal<boolean>(false);
  ticketGenerado = signal<boolean>(false);
  ticketData = signal<any>(null);

  filteredServicios = computed(() => {
    let list = this.servicios();
    const cat = this.selectedCategoria();
    const q = this.searchQuery().toLowerCase().trim();

    if (cat !== 'TODAS') {
      list = list.filter(s => s.categoria_servicio === cat);
    }

    if (q) {
      list = list.filter(s =>
        s.titulo.toLowerCase().includes(q) ||
        s.subtitulo.toLowerCase().includes(q) ||
        s.entrenador_nombre.toLowerCase().includes(q) ||
        s.cancha_nombre.toLowerCase().includes(q)
      );
    }

    return list;
  });

  montoCalculado = computed(() => {
    const s = this.selectedServicio();
    if (!s) return 0;
    let base = this.tipoPlan() === 'PAQUETE_MENSUAL'
      ? Number(s.precio_paquete_mensual)
      : Number(s.precio_sesion_individual);

    if (this.aplicaDescuentoHermano && s.descuento_hermanos_pct) {
      base = base * (1 - (s.descuento_hermanos_pct / 100));
    }
    return Math.round(base);
  });

  ngOnInit() {
    this.recargarServicios();
  }

  recargarServicios() {
    this.isRefreshing.set(true);
    this.http.get<any>(`${this.apiUrl}/servicios`).subscribe({
      next: (res) => {
        this.servicios.set(res.data || res || []);
        this.isRefreshing.set(false);
      },
      error: (err) => {
        this.isRefreshing.set(false);
        console.error('Error cargando servicios:', err);
      }
    });
  }

  getCategoriaLabel(cat: string): string {
    switch (cat) {
      case 'VELOCIDAD_EXPLOSIVIDAD': return '⚡ Explosividad';
      case 'COORDINACION_AGILIDAD': return '🧠 Neuro-Agilidad';
      case 'TECNICA_REGATE': return '🪄 Regate 1v1';
      case 'ARQUEROS_ELITE': return '🧤 Porteros';
      case 'DEFINICION_TIRO': return '🎯 Definición';
      case 'PREVENCION_FISICA': return '🛡️ Fuerza';
      default: return 'Clínica Pro';
    }
  }

  formatNumber(val: any): string {
    if (!val) return '0';
    return Number(val).toLocaleString('es-CO');
  }

  resetFiltros() {
    this.selectedCategoria.set('TODAS');
    this.searchQuery.set('');
  }

  usarComprobanteDemoMobile() {
    this.comprobanteUrl.set('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
    if (!this.referenciaTransaccion) {
      this.referenciaTransaccion = 'NQ-' + Math.floor(100000 + Math.random() * 900000);
    }
    this.alert.info('Comprobante Nequi adjuntado correctamente');
  }

  copiarNumero(num: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(num);
      this.alert.success(`Número ${num} copiado`);
    }
  }

  abrirModalInscripcion(servicio: ServicioMobile) {
    this.selectedServicio.set(servicio);
    this.tipoPlan.set('PAQUETE_MENSUAL');
    this.ticketGenerado.set(false);
    this.ticketData.set(null);
    this.comprobanteUrl.set('');
    this.modalInscripcion.set(true);
  }

  cerrarModalInscripcion() {
    this.modalInscripcion.set(false);
    this.selectedServicio.set(null);
    this.ticketGenerado.set(false);
    this.ticketData.set(null);
    this.comprobanteUrl.set('');
  }

  confirmarInscripcion() {
    const s = this.selectedServicio();
    if (!s) return;

    this.isSubmitting.set(true);

    const dto: any = {
      nombre_jugador: this.nombreJugador,
      nombre_acudiente: this.nombreAcudiente,
      telefono_acudiente: this.telefonoAcudiente,
      tipo_plan: this.tipoPlan(),
      monto_pagado: this.montoCalculado(),
      metodo_pago: this.metodoPago(),
      comprobante_url: (this.metodoPago() === 'NEQUI' || this.metodoPago() === 'DAVIPLATA' || this.metodoPago() === 'TRANSFERENCIA') ? (this.comprobanteUrl() || undefined) : undefined,
      referencia_transaccion: this.referenciaTransaccion || undefined
    };

    this.http.post<any>(`${this.apiUrl}/servicios/${s.id}/inscribir`, dto).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.ticketGenerado.set(true);
        const data = res.data?.inscripcion || res.inscripcion || res;
        this.ticketData.set(data);
        
        // Agregar a mis pases
        const currentPases = this.misPases();
        this.misPases.set([
          {
            ...data,
            servicio_titulo: s.titulo,
            horario_rango: `${s.dias_semana} (${s.horario_rango})`
          },
          ...currentPases
        ]);

        this.alert.success('¡Inscripción exitosa! Pase digital generado.');
        this.recargarServicios();
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.alert.error(err?.error?.message || 'Error al procesar inscripción');
      }
    });
  }

  compartirWhatsApp() {
    const s = this.selectedServicio();
    const t = this.ticketData();
    if (!s || !t) return;

    const text = encodeURIComponent(
      `⚽ *Pase Digital SportCoreOS*\n` +
      `Clínica: *${s.titulo}*\n` +
      `Atleta: ${t.nombre_jugador}\n` +
      `Sede Cartagena: ${s.cancha_nombre}\n` +
      `Horario: ${s.dias_semana} (${s.horario_rango})\n` +
      `Pass Token: ${t.codigo_qr_ticket}`
    );

    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  abrirMisPases() {
    this.modalMisPases.set(true);
  }

  cerrarMisPases() {
    this.modalMisPases.set(false);
  }
}

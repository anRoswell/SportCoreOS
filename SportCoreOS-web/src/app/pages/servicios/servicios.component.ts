import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

export interface ServicioEspecializado {
  id: string;
  club_id: string;
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
  destacado?: boolean;
  activo?: boolean;
}

import { DigitalPassTicketComponent } from '../../shared/components/digital-pass-ticket/digital-pass-ticket.component';

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [CommonModule, FormsModule, DigitalPassTicketComponent],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.scss'
})

export class ServiciosComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face';

  // Signals
  servicios = signal<ServicioEspecializado[]>([]);
  searchQuery = signal<string>('');
  selectedCategoria = signal<string>('TODAS');

  // Modal States
  showInscribirModal = signal<boolean>(false);
  showParticipantesModal = signal<boolean>(false);
  showCrearModal = signal<boolean>(false);
  showTesoreriaModal = signal<boolean>(false);
  showComprobanteModal = signal<boolean>(false);
  showRechazoDialog = signal<boolean>(false);

  selectedServicio = signal<ServicioEspecializado | null>(null);
  inscripcionesList = signal<any[]>([]);
  inscripcionesPendientes = signal<any[]>([]);
  comprobanteModalData = signal<any>(null);
  inscripcionParaRechazar = signal<any>(null);

  // Form State Inscribir
  tipoPlan = signal<'PAQUETE_MENSUAL' | 'SESION_INDIVIDUAL'>('PAQUETE_MENSUAL');
  nombreJugador = signal<string>('');
  nombreAcudiente = signal<string>('');
  telefonoAcudiente = signal<string>('');
  emailAcudiente = signal<string>('');
  aplicaDescuentoHermano = signal<boolean>(false);
  metodoPago = signal<string>('WOMPI_PSE');
  comprobanteUrl = signal<string>('');
  comprobanteNombreArchivo = signal<string>('');
  referenciaManual = signal<string>('');

  filtroEstadoInscripciones = signal<string>('TODOS');
  motivoRechazoInput = signal<string>('');

  isSubmitting = signal<boolean>(false);
  isApproving = signal<boolean>(false);
  ticketGenerated = signal<boolean>(false);
  ticketData = signal<any>(null);

  // Form State Crear Clínica
  nuevoTitulo = signal<string>('');
  nuevoSubtitulo = signal<string>('');
  nuevaCategoria = signal<string>('VELOCIDAD_EXPLOSIVIDAD');
  nuevoEntrenador = signal<string>('');
  nuevaCanchaNombre = signal<string>('');
  nuevaCanchaDireccion = signal<string>('');
  nuevosDias = signal<string>('Martes y Jueves');
  nuevoHorario = signal<string>('04:30 PM - 06:00 PM');
  nuevosCupos = signal<number>(15);
  nuevaInsignia = signal<string>('');
  nuevoPrecioIndividual = signal<number>(38000);
  nuevoPrecioMensual = signal<number>(145000);
  nuevaDescripcion = signal<string>('');
  isSaving = signal<boolean>(false);

  // Computed
  filteredServicios = computed(() => {
    let list = this.servicios();
    const cat = this.selectedCategoria();
    const query = this.searchQuery().toLowerCase().trim();

    if (cat !== 'TODAS') {
      list = list.filter(s => s.categoria_servicio === cat);
    }

    if (query) {
      list = list.filter(s =>
        s.titulo.toLowerCase().includes(query) ||
        s.subtitulo.toLowerCase().includes(query) ||
        s.entrenador_nombre.toLowerCase().includes(query) ||
        s.cancha_nombre.toLowerCase().includes(query)
      );
    }

    return list;
  });

  totalCuposOcupados = computed(() => {
    return this.servicios().reduce((acc, s) => acc + Number(s.cupos_ocupados || 0), 0);
  });

  totalCuposDisponibles = computed(() => {
    return this.servicios().reduce((acc, s) => acc + Number(s.cupos_totales || 0), 0);
  });

  porcentajeOcupacion = computed(() => {
    const tot = this.totalCuposDisponibles();
    if (tot === 0) return 0;
    return Math.round((this.totalCuposOcupados() / tot) * 100);
  });

  totalPendientes = computed(() => {
    return this.inscripcionesPendientes().length;
  });

  pendientesCountModal = computed(() => {
    return this.inscripcionesList().filter(i => i.estado_pago === 'PENDIENTE_APROBACION').length;
  });

  filteredInscripcionesList = computed(() => {
    const filtro = this.filtroEstadoInscripciones();
    const list = this.inscripcionesList();
    if (filtro === 'TODOS') return list;
    return list.filter(i => (i.estado_pago || 'APROBADO') === filtro);
  });

  montoFinalCalculado = computed(() => {
    const s = this.selectedServicio();
    if (!s) return 0;
    let base = this.tipoPlan() === 'PAQUETE_MENSUAL'
      ? Number(s.precio_paquete_mensual)
      : Number(s.precio_sesion_individual);

    if (this.aplicaDescuentoHermano() && s.descuento_hermanos_pct) {
      base = base * (1 - (s.descuento_hermanos_pct / 100));
    }
    return Math.round(base);
  });

  ngOnInit() {
    this.cargarServicios();
    this.cargarPendientes();
  }

  cargarServicios() {
    this.api.getServicios().subscribe({
      next: (data) => {
        this.servicios.set(data || []);
      },
      error: (err: any) => {
        console.error('Error al cargar servicios especializados:', err);
      }
    });
  }

  cargarPendientes() {
    this.api.getInscripcionesPendientes().subscribe({
      next: (data) => {
        this.inscripcionesPendientes.set(data || []);
      },
      error: (err: any) => {
        console.error('Error al cargar inscripciones pendientes:', err);
      }
    });
  }

  getCategoriaLabel(cat: string): string {
    switch (cat) {
      case 'VELOCIDAD_EXPLOSIVIDAD': return '⚡ Velocidad & Sprint';
      case 'COORDINACION_AGILIDAD': return '🧠 Neuro-Motricidad';
      case 'TECNICA_REGATE': return '🪄 Regate 1v1 Pro';
      case 'ARQUEROS_ELITE': return '🧤 Guante de Oro';
      case 'DEFINICION_TIRO': return '🎯 Definición & Gol';
      case 'PREVENCION_FISICA': return '🛡️ Fuerza & Prevención';
      default: return 'Clínica Pro';
    }
  }

  formatNumber(val: any): string {
    if (!val) return '0';
    return Number(val).toLocaleString('es-CO');
  }

  resetFilters() {
    this.selectedCategoria.set('TODAS');
    this.searchQuery.set('');
  }

  copiarTexto(texto: string) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(texto);
      alert('Copiado al portapapeles: ' + texto);
    }
  }

  triggerFileInput() {
    const input = document.getElementById('comprobanteFileInput') as HTMLInputElement;
    if (input) input.click();
  }

  onFileSelected(event: any) {
    const file = event.target?.files?.[0];
    if (file) {
      this.comprobanteNombreArchivo.set(file.name);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.comprobanteUrl.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  usarComprobanteDemo() {
    this.comprobanteUrl.set('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
    this.comprobanteNombreArchivo.set('comprobante_nequi_transferencia.png');
    if (!this.referenciaManual()) {
      this.referenciaManual.set('NQ-' + Math.floor(100000 + Math.random() * 900000));
    }
  }

  quitarComprobante() {
    this.comprobanteUrl.set('');
    this.comprobanteNombreArchivo.set('');
  }

  // --- MODAL INSCRIBIRSE ---
  openInscribirModal(servicio: ServicioEspecializado) {
    this.selectedServicio.set(servicio);
    this.tipoPlan.set('PAQUETE_MENSUAL');
    this.nombreJugador.set('');
    this.nombreAcudiente.set('');
    this.telefonoAcudiente.set('');
    this.emailAcudiente.set('');
    this.aplicaDescuentoHermano.set(false);
    this.metodoPago.set('WOMPI_PSE');
    this.comprobanteUrl.set('');
    this.comprobanteNombreArchivo.set('');
    this.referenciaManual.set('');
    this.ticketGenerated.set(false);
    this.ticketData.set(null);
    this.showInscribirModal.set(true);
  }

  closeInscribirModal() {
    this.showInscribirModal.set(false);
    this.selectedServicio.set(null);
    this.ticketGenerated.set(false);
    this.ticketData.set(null);
  }

  submitInscripcion() {
    const s = this.selectedServicio();
    if (!s) return;

    this.isSubmitting.set(true);

    const dto: any = {
      nombre_jugador: this.nombreJugador(),
      nombre_acudiente: this.nombreAcudiente(),
      telefono_acudiente: this.telefonoAcudiente(),
      email_acudiente: this.emailAcudiente(),
      tipo_plan: this.tipoPlan(),
      monto_pagado: this.montoFinalCalculado(),
      metodo_pago: this.metodoPago(),
    };

    if (this.comprobanteUrl()) {
      dto.comprobante_url = this.comprobanteUrl();
    }
    if (this.referenciaManual()) {
      dto.referencia_transaccion = this.referenciaManual();
    }

    this.api.inscribirServicio(s.id, dto).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.ticketGenerated.set(true);
        this.ticketData.set(res.inscripcion || res);
        this.cargarServicios(); // Refrescar cupos
        this.cargarPendientes(); // Refrescar pendientes
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        alert(err?.error?.message || 'Ocurrió un error al procesar la inscripción');
      }
    });
  }

  shareWhatsApp() {
    const s = this.selectedServicio();
    const t = this.ticketData();
    if (!s || !t) return;

    const text = encodeURIComponent(
      '⚽ *Pase Digital SportCoreOS*\n' +
      'Clínica: *' + s.titulo + '*\n' +
      'Atleta: ' + t.nombre_jugador + '\n' +
      'Cancha: ' + s.cancha_nombre + '\n' +
      'Horario: ' + s.dias_semana + ' (' + s.horario_rango + ')\n' +
      'Ticket Pass: ' + t.codigo_qr_ticket + '\n' +
      'Estado: ' + (t.estado_pago || 'APROBADO') + '\n' +
      'Ref: ' + t.referencia_transaccion
    );

    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  // --- MODAL PARTICIPANTES ---
  openParticipantesModal(servicio: ServicioEspecializado) {
    this.selectedServicio.set(servicio);
    this.filtroEstadoInscripciones.set('TODOS');
    this.api.getInscripcionesServicio(servicio.id).subscribe({
      next: (data) => {
        this.inscripcionesList.set(data || []);
        this.showParticipantesModal.set(true);
      },
      error: (err: any) => {
        console.error('Error al cargar inscripciones:', err);
        this.inscripcionesList.set([]);
        this.showParticipantesModal.set(true);
      }
    });
  }

  closeParticipantesModal() {
    this.showParticipantesModal.set(false);
    this.selectedServicio.set(null);
    this.inscripcionesList.set([]);
  }

  // --- MODAL TESORERÍA ---
  openTesoreriaModal() {
    this.cargarPendientes();
    this.showTesoreriaModal.set(true);
  }

  closeTesoreriaModal() {
    this.showTesoreriaModal.set(false);
  }

  // --- LIGHTBOX COMPROBANTE ---
  openComprobanteModal(inc: any) {
    this.comprobanteModalData.set(inc);
    this.showComprobanteModal.set(true);
  }

  closeComprobanteModal() {
    this.showComprobanteModal.set(false);
    this.comprobanteModalData.set(null);
  }

  // --- ACCIONES TESORERÍA (APROBAR / RECHAZAR) ---
  aprobarPago(inscripcionId: string) {
    this.isApproving.set(true);
    this.api.aprobarInscripcion(inscripcionId, { estado: 'APROBADO' }).subscribe({
      next: () => {
        this.isApproving.set(false);
        const currentUser = this.auth.currentUser();
        const auditorName = currentUser?.nombres || 'Diana Morales (Tesorería)';

        // Actualizar lista de participantes
        this.inscripcionesList.update(list =>
          list.map(item => item.id === inscripcionId ? { ...item, estado_pago: 'APROBADO', aprobado_por_nombre: auditorName } : item)
        );

        // Remover de pendientes
        this.inscripcionesPendientes.update(list => list.filter(i => i.id !== inscripcionId));

        this.cargarServicios();
        if (this.showComprobanteModal()) {
          this.closeComprobanteModal();
        }
      },
      error: (err: any) => {
        this.isApproving.set(false);
        alert(err?.error?.message || 'Error al aprobar la inscripción');
      }
    });
  }

  solicitarRechazo(inc: any) {
    this.inscripcionParaRechazar.set(inc);
    this.motivoRechazoInput.set('');
    this.showRechazoDialog.set(true);
  }

  confirmarRechazo() {
    const inc = this.inscripcionParaRechazar();
    if (!inc) return;

    this.isApproving.set(true);
    const motivo = this.motivoRechazoInput() || 'Comprobante no válido o pago no reflejado';

    this.api.aprobarInscripcion(inc.id, {
      estado: 'RECHAZADO',
      motivo_rechazo: motivo
    }).subscribe({
      next: () => {
        this.isApproving.set(false);
        this.showRechazoDialog.set(false);
        this.inscripcionParaRechazar.set(null);

        // Actualizar lista de participantes
        this.inscripcionesList.update(list =>
          list.map(item => item.id === inc.id ? { ...item, estado_pago: 'RECHAZADO', motivo_rechazo: motivo } : item)
        );

        // Remover de pendientes
        this.inscripcionesPendientes.update(list => list.filter(i => i.id !== inc.id));

        this.cargarServicios();
        if (this.showComprobanteModal()) {
          this.closeComprobanteModal();
        }
      },
      error: (err: any) => {
        this.isApproving.set(false);
        alert(err?.error?.message || 'Error al rechazar inscripción');
      }
    });
  }

  // --- MODAL CREAR CLÍNICA ---
  openCrearModal() {
    this.nuevoTitulo.set('');
    this.nuevoSubtitulo.set('');
    this.nuevaCategoria.set('VELOCIDAD_EXPLOSIVIDAD');
    this.nuevoEntrenador.set('');
    this.nuevaCanchaNombre.set('');
    this.nuevaCanchaDireccion.set('');
    this.nuevosDias.set('Martes y Jueves');
    this.nuevoHorario.set('04:30 PM - 06:00 PM');
    this.nuevosCupos.set(15);
    this.nuevaInsignia.set('');
    this.nuevoPrecioIndividual.set(38000);
    this.nuevoPrecioMensual.set(145000);
    this.nuevaDescripcion.set('');
    this.showCrearModal.set(true);
  }

  closeCrearModal() {
    this.showCrearModal.set(false);
  }

  submitCrearServicio() {
    if (!this.nuevoTitulo() || !this.nuevoEntrenador() || !this.nuevaCanchaNombre()) {
      alert('Por favor completa todos los campos requeridos (*)');
      return;
    }

    this.isSaving.set(true);

    const dto = {
      titulo: this.nuevoTitulo(),
      subtitulo: this.nuevoSubtitulo(),
      categoria_servicio: this.nuevaCategoria(),
      entrenador_nombre: this.nuevoEntrenador(),
      cancha_nombre: this.nuevaCanchaNombre(),
      cancha_direccion: this.nuevaCanchaDireccion(),
      dias_semana: this.nuevosDias(),
      horario_rango: this.nuevoHorario(),
      cupos_totales: Number(this.nuevosCupos()) || 15,
      insignia_obtenida: this.nuevaInsignia() || '🏅 Atleta Élite Graduado',
      precio_sesion_individual: Number(this.nuevoPrecioIndividual()) || 35000,
      precio_paquete_mensual: Number(this.nuevoPrecioMensual()) || 140000,
      descripcion: this.nuevaDescripcion() || this.nuevoSubtitulo(),
      beneficios: [
        'Metodología de alto impacto',
        'Evaluación biomecánica continua',
        'Certificado e insignia para el perfil del atleta'
      ]
    };

    this.api.createServicio(dto).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeCrearModal();
        this.cargarServicios();
      },
      error: (err: any) => {
        this.isSaving.set(false);
        alert(err?.error?.message || 'Error al crear la clínica');
      }
    });
  }
}


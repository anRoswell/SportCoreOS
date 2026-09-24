import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CategoriaServicio, EstadoPago } from '../../core/enums/domain.enums';

// Subcomponentes modulares
import { ServicioCardComponent } from './components/servicio-card/servicio-card.component';
import { InscribirModalComponent } from './components/inscribir-modal/inscribir-modal.component';
import { ParticipantesModalComponent } from './components/participantes-modal/participantes-modal.component';
import { TesoreriaDrawerComponent } from './components/tesoreria-drawer/tesoreria-drawer.component';
import { CrearServicioModalComponent } from './components/crear-servicio-modal/crear-servicio-modal.component';
import { ComprobanteLightboxComponent } from './components/comprobante-lightbox/comprobante-lightbox.component';
import { RechazoDialogComponent } from './components/rechazo-dialog/rechazo-dialog.component';

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

@Component({
  selector: 'app-servicios',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ServicioCardComponent,
    InscribirModalComponent,
    ParticipantesModalComponent,
    TesoreriaDrawerComponent,
    CrearServicioModalComponent,
    ComprobanteLightboxComponent,
    RechazoDialogComponent
  ],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.scss'
})
export class ServiciosComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);

  readonly CategoriaServicio = CategoriaServicio;
  readonly EstadoPago = EstadoPago;

  defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face';

  // Signals
  servicios = signal<ServicioEspecializado[]>([]);
  searchQuery = signal<string>('');
  selectedCategoria = signal<CategoriaServicio>(CategoriaServicio.TODAS);

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

  isApproving = signal<boolean>(false);

  // Computed
  filteredServicios = computed(() => {
    let list = this.servicios();
    const cat = this.selectedCategoria();
    const query = this.searchQuery().toLowerCase().trim();

    if (cat !== CategoriaServicio.TODAS) {
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

  resetFilters() {
    this.selectedCategoria.set(CategoriaServicio.TODAS);
    this.searchQuery.set('');
  }

  // --- MODAL INSCRIBIRSE ---
  openInscribirModal(servicio: ServicioEspecializado) {
    this.selectedServicio.set(servicio);
    this.showInscribirModal.set(true);
  }

  closeInscribirModal() {
    this.showInscribirModal.set(false);
    this.selectedServicio.set(null);
  }

  onInscripcionExitosa() {
    this.cargarServicios();
    this.cargarPendientes();
  }

  // --- MODAL PARTICIPANTES ---
  openParticipantesModal(servicio: ServicioEspecializado) {
    this.selectedServicio.set(servicio);
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
    this.api.aprobarInscripcion(inscripcionId, { estado: EstadoPago.APROBADO }).subscribe({
      next: () => {
        this.isApproving.set(false);
        const currentUser = this.auth.currentUser();
        const auditorName = currentUser?.nombres || 'Diana Morales (Tesorería)';

        // Actualizar lista de participantes
        this.inscripcionesList.update(list =>
          list.map(item => item.id === inscripcionId ? { ...item, estado_pago: EstadoPago.APROBADO, aprobado_por_nombre: auditorName } : item)
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
    this.showRechazoDialog.set(true);
  }

  confirmarRechazo(motivo: string) {
    const inc = this.inscripcionParaRechazar();
    if (!inc) return;

    this.isApproving.set(true);
    const motivoFinal = motivo || 'Comprobante no válido o pago no reflejado';

    this.api.aprobarInscripcion(inc.id, {
      estado: EstadoPago.RECHAZADO,
      motivo_rechazo: motivoFinal
    }).subscribe({
      next: () => {
        this.isApproving.set(false);
        this.showRechazoDialog.set(false);
        this.inscripcionParaRechazar.set(null);

        // Actualizar lista de participantes
        this.inscripcionesList.update(list =>
          list.map(item => item.id === inc.id ? { ...item, estado_pago: EstadoPago.RECHAZADO, motivo_rechazo: motivoFinal } : item)
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
    this.showCrearModal.set(true);
  }

  closeCrearModal() {
    this.showCrearModal.set(false);
  }

  onServicioCreado() {
    this.cargarServicios();
  }
}

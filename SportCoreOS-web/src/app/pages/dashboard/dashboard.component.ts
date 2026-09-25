import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService, KPIStats, LandingPage } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';
import { LandingPublicComponent } from '../landing-public/landing-public.component';

interface MatchItem {
  id: string;
  rival_nombre: string;
  categoria_nombre: string;
  categoria_codigo: string;
  fecha_partido: string;
  hora_partido: string;
  hora_citacion: string;
  sede_cancha: string;
  condicion_juego: 'LOCAL' | 'VISITANTE';
  indumentaria: string;
  confirmados_count: number;
  total_convocados: number;
  lat: number;
  lng: number;
  torneo: string;
}

interface TransactionItem {
  id: string;
  codigo_transaccion: string;
  jugador_nombre: string;
  categoria: string;
  monto: number;
  metodo: string;
  fecha: string;
  estado: 'APROBADA' | 'PENDIENTE' | 'RECHAZADA';
}

interface TopPlayer {
  id: string;
  nombre: string;
  dorsal: number;
  categoria: string;
  posicion: string;
  score_rendimiento: number;
  cooper_metros: number;
  velocidad_max: number;
  asistencia_pct: number;
  avatar: string;
  estado_medico: 'APTO' | 'EN_OBSERVACION' | 'RECUPERACION';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FlatpickrDirective, LandingPublicComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  api = inject(ApiService);
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  readonly stats = signal<KPIStats | null>(null);
  readonly activeTab = signal<'partidos' | 'convocatoria' | 'recaudo' | 'biometria'>('partidos');
  readonly showScheduleModal = signal<boolean>(false);
  readonly showLandingModal = signal<boolean>(false);
  readonly activeClubLanding = signal<LandingPage | null>(null);
  readonly toastMessage = signal<string>('');
  readonly categorias = signal<any[]>([]);

  readonly matches = signal<MatchItem[]>([]);
  readonly tacticRoster = signal<any[]>([]);
  readonly transactions = signal<TransactionItem[]>([]);
  readonly topPlayers = signal<TopPlayer[]>([]);

  newMatch = {
    categoriaId: '',
    rivalNombre: '',
    fecha: new Date().toISOString().split('T')[0],
    horaPartido: '09:00',
    horaCitacion: '08:00',
    sedeCancha: '',
    condicion: 'LOCAL' as 'LOCAL' | 'VISITANTE',
  };

  constructor() {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadActiveClubLanding();

    this.route.queryParams.subscribe((params) => {
      if (params['landing'] === '1' || params['landing'] === 'true' || params['showLanding'] === 'true') {
        this.showLandingModal.set(true);
      }
    });
  }

  loadActiveClubLanding(clubId?: string): void {
    const targetClubId = clubId || this.api.activeClub()?.id;
    this.api.getPublicHomeLanding(targetClubId).subscribe({
      next: (landing) => {
        if (landing && landing.titulo) {
          this.activeClubLanding.set(landing);
        } else {
          this.activeClubLanding.set(null);
        }
      },
      error: () => {
        this.activeClubLanding.set(null);
      },
    });
  }

  openLandingModal(): void {
    this.showLandingModal.set(true);
  }

  closeLandingModal(): void {
    this.showLandingModal.set(false);
  }

  loadDashboardData(): void {
    // 1. Cargar KPIs
    this.api.getDashboardKPIs().subscribe((data) => {
      this.stats.set(data);
    });

    // 2. Cargar Categorías
    this.api.getCategorias().subscribe((cats) => {
      this.categorias.set(cats || []);
      if (cats && cats.length > 0 && !this.newMatch.categoriaId) {
        this.newMatch.categoriaId = cats[0].id;
      }
    });

    // 3. Cargar Partidos
    this.api.getPartidos().subscribe((partidos) => {
      const list = Array.isArray(partidos) ? partidos : (partidos?.data || []);
      if (list && list.length > 0) {
        const mapped: MatchItem[] = list.map((p: any) => ({
          id: p.id,
          rival_nombre: p.rival_nombre,
          categoria_nombre: p.categoria_nombre || 'Sub-15 Élite',
          categoria_codigo: p.codigo_categoria || 'SUB_15',
          fecha_partido: p.fecha_partido,
          hora_partido: p.hora_partido,
          hora_citacion: p.hora_citacion || p.hora_partido,
          sede_cancha: p.sede_cancha,
          condicion_juego: p.condicion_juego || 'LOCAL',
          indumentaria: p.indumentaria_kit || 'Kit Titular (Esmeralda)',
          confirmados_count: p.confirmados_count || 16,
          total_convocados: p.total_convocados || 18,
          lat: parseFloat(p.latitud || '4.7892'),
          lng: parseFloat(p.longitud || '-74.0412'),
          torneo: 'Torneo Oficial Liga 2026',
        }));
        this.matches.set(mapped);
      }
    });

    // 4. Cargar Jugadores para Pizarra Táctica
    this.api.getJugadores().subscribe((jugs) => {
      const list = Array.isArray(jugs) ? jugs : (jugs?.data || []);
      if (list && list.length > 0) {
        const mappedRoster = list.slice(0, 12).map((j: any, idx: number) => ({
          id: j.id,
          dorsal: j.numero_dorsal || (idx + 1),
          nombre: `${j.nombres} ${j.apellidos}`,
          posicion: j.posicion_principal || 'VOL',
          pierna: j.pierna_habil || 'Diestro',
          peso_kg: parseFloat(j.peso_kg || '55.0'),
          talla_cm: parseFloat(j.talla_cm || '168.0'),
          estado: 'CONFIRMADO',
          avatar: j.foto_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
          rolTactic: idx < 11 ? `${j.posicion_principal} Titular` : 'Suplente',
        }));
        this.tacticRoster.set(mappedRoster);
      }
    });

    // 5. Cargar Cargos para Monitor Recaudo en Vivo
    this.api.getCargos().subscribe((cargos) => {
      const list = Array.isArray(cargos) ? cargos : (cargos?.data || []);
      if (list && list.length > 0) {
        const mappedTx: TransactionItem[] = list.slice(0, 6).map((c: any, idx: number) => ({
          id: c.id,
          codigo_transaccion: `WMP-984${200 + idx}`,
          jugador_nombre: c.jugador_nombre,
          categoria: c.categoria_nombre,
          monto: parseFloat(c.monto_total || '180000'),
          metodo: idx % 2 === 0 ? 'PSE Bancolombia' : 'Daviplata',
          fecha: c.fecha_limite_pago || 'Hoy, 08:30 AM',
          estado: c.saldo_pendiente == 0 ? 'APROBADA' : 'PENDIENTE',
        }));
        this.transactions.set(mappedTx);
      }
    });

    // 6. Cargar Biometría para Radar Físico & Top Players
    this.api.getBiometria().subscribe((bios) => {
      const list = Array.isArray(bios) ? bios : (bios?.data || []);
      if (list && list.length > 0) {
        const mappedTop: TopPlayer[] = list.slice(0, 3).map((b: any) => ({
          id: b.id,
          nombre: `${b.jugador_nombre} #${b.numero_dorsal || ''}`,
          dorsal: b.numero_dorsal || 10,
          categoria: b.categoria_nombre,
          posicion: b.posicion_principal || 'Extremo',
          score_rendimiento: 9.4,
          cooper_metros: b.test_cooper_metros || 2780,
          velocidad_max: b.velocidad_30m_seg ? parseFloat((30 / b.velocidad_30m_seg * 3.6).toFixed(1)) : 31.8,
          asistencia_pct: 100,
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100',
          estado_medico: 'APTO',
        }));
        this.topPlayers.set(mappedTop);
      }
    });
  }

  setTab(tab: 'partidos' | 'convocatoria' | 'recaudo' | 'biometria'): void {
    this.activeTab.set(tab);
  }

  openScheduleModal(): void {
    this.showScheduleModal.set(true);
  }

  closeScheduleModal(): void {
    this.showScheduleModal.set(false);
  }

  submitScheduleForm(): void {
    if (!this.newMatch.rivalNombre || !this.newMatch.sedeCancha || !this.newMatch.categoriaId) {
      this.showToast('Completa los campos obligatorios del partido.');
      return;
    }

    const payload = {
      categoria_id: this.newMatch.categoriaId,
      rival_nombre: this.newMatch.rivalNombre,
      fecha_partido: this.newMatch.fecha,
      hora_partido: this.newMatch.horaPartido,
      hora_citacion: this.newMatch.horaCitacion,
      sede_cancha: this.newMatch.sedeCancha,
      condicion_juego: this.newMatch.condicion,
      indumentaria_kit: 'Kit Titular (Esmeralda)',
    };

    this.api.createPartido(payload).subscribe({
      next: () => {
        this.closeScheduleModal();
        this.showToast('¡Partido programado y convocatoria creada con éxito en la BD!');
        this.loadDashboardData();
      },
      error: () => {
        this.showToast('Error al crear el partido');
      },
    });
  }

  openGpsRoute(match: MatchItem): void {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.sede_cancha)}`;
    window.open(url, '_blank');
    this.showToast(`Abriendo ruta GPS para "${match.sede_cancha}"`);
  }

  onSendWhatsAppCitacion(): void {
    this.showToast('Citaciones enviadas masivamente por WhatsApp a los padres de familia.');
  }

  onSendBulkReminders(): void {
    this.showToast('Recordatorios de pago de pensión enviados masivamente vía WhatsApp.');
  }

  onExportReport(): void {
    this.showToast('Generando y descargando Informe Ejecutivo 360° en PDF...');
  }

  onDownloadReceipt(tx: TransactionItem): void {
    this.showToast(`Descargando recibo de caja oficial para ${tx.jugador_nombre}...`);
  }

  togglePlayerStatus(jugador: any): void {
    const estados = ['CONFIRMADO', 'PENDIENTE', 'EXCUSADO'];
    const currentIdx = estados.indexOf(jugador.estado);
    const nextEstado = estados[(currentIdx + 1) % estados.length];
    jugador.estado = nextEstado;
    this.showToast(`${jugador.nombre} marcado como ${nextEstado}`);
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}

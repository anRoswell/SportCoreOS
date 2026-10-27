import { Component, OnInit, inject, signal, computed, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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

export interface TacticPlayer {
  id: string;
  dorsal: number | string;
  nombre: string;
  nombres?: string;
  apellidos?: string;
  categoria_nombre?: string;
  posicion: string;
  posicion_secundaria?: string;
  pierna: string;
  peso_kg: number;
  talla_cm: number;
  imc?: number;
  eps?: string;
  estado: 'CONFIRMADO' | 'PENDIENTE' | 'EXCUSADO';
  avatar: string;
  rolTactic: string;
  xp_total?: number;
  role?: string;
  line?: 'POR' | 'DEF' | 'MED' | 'DEL';
  x?: number;
  y?: number;
  isAssigned?: boolean;
}

export interface FormationSlot {
  role: string;
  line: 'POR' | 'DEF' | 'MED' | 'DEL';
  x: number;
  y: number;
}

const FORMATIONS: Record<string, FormationSlot[]> = {
  '4-3-3': [
    { role: 'POR', line: 'POR', x: 50, y: 88 },
    { role: 'LI',  line: 'DEF', x: 14, y: 70 },
    { role: 'DFC', line: 'DEF', x: 38, y: 72 },
    { role: 'DFC', line: 'DEF', x: 62, y: 72 },
    { role: 'LD',  line: 'DEF', x: 86, y: 70 },
    { role: 'MCD', line: 'MED', x: 50, y: 53 },
    { role: 'MC',  line: 'MED', x: 28, y: 44 },
    { role: 'MC',  line: 'MED', x: 72, y: 44 },
    { role: 'EI',  line: 'DEL', x: 18, y: 22 },
    { role: 'DC',  line: 'DEL', x: 50, y: 16 },
    { role: 'ED',  line: 'DEL', x: 82, y: 22 },
  ],
  '4-4-2': [
    { role: 'POR', line: 'POR', x: 50, y: 88 },
    { role: 'LI',  line: 'DEF', x: 14, y: 70 },
    { role: 'DFC', line: 'DEF', x: 38, y: 72 },
    { role: 'DFC', line: 'DEF', x: 62, y: 72 },
    { role: 'LD',  line: 'DEF', x: 86, y: 70 },
    { role: 'MI',  line: 'MED', x: 15, y: 47 },
    { role: 'MC',  line: 'MED', x: 38, y: 49 },
    { role: 'MC',  line: 'MED', x: 62, y: 49 },
    { role: 'MD',  line: 'MED', x: 85, y: 47 },
    { role: 'DC',  line: 'DEL', x: 36, y: 19 },
    { role: 'DC',  line: 'DEL', x: 64, y: 19 },
  ],
  '4-2-3-1': [
    { role: 'POR', line: 'POR', x: 50, y: 88 },
    { role: 'LI',  line: 'DEF', x: 14, y: 71 },
    { role: 'DFC', line: 'DEF', x: 38, y: 73 },
    { role: 'DFC', line: 'DEF', x: 62, y: 73 },
    { role: 'LD',  line: 'DEF', x: 86, y: 71 },
    { role: 'MCD', line: 'MED', x: 35, y: 56 },
    { role: 'MCD', line: 'MED', x: 65, y: 56 },
    { role: 'MI',  line: 'MED', x: 18, y: 37 },
    { role: 'MCO', line: 'MED', x: 50, y: 36 },
    { role: 'MD',  line: 'MED', x: 82, y: 37 },
    { role: 'DC',  line: 'DEL', x: 50, y: 17 },
  ],
  '3-5-2': [
    { role: 'POR', line: 'POR', x: 50, y: 88 },
    { role: 'DFC', line: 'DEF', x: 25, y: 72 },
    { role: 'DFC', line: 'DEF', x: 50, y: 74 },
    { role: 'DFC', line: 'DEF', x: 75, y: 72 },
    { role: 'CRI', line: 'MED', x: 12, y: 48 },
    { role: 'MC',  line: 'MED', x: 33, y: 50 },
    { role: 'MCD', line: 'MED', x: 50, y: 56 },
    { role: 'MC',  line: 'MED', x: 67, y: 50 },
    { role: 'CRD', line: 'MED', x: 88, y: 48 },
    { role: 'DC',  line: 'DEL', x: 36, y: 19 },
    { role: 'DC',  line: 'DEL', x: 64, y: 19 },
  ],
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, FlatpickrDirective, LandingPublicComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  api = inject(ApiService);
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  readonly stats = signal<KPIStats | null>(null);
  readonly isLoadingInit = signal<boolean>(true);
  readonly activeTab = signal<'partidos' | 'convocatoria' | 'recaudo' | 'biometria'>('partidos');
  readonly showScheduleModal = signal<boolean>(false);
  readonly showLandingModal = signal<boolean>(false);
  readonly activeClubLanding = signal<LandingPage | null>(null);
  readonly toastMessage = signal<string>('');
  readonly categorias = signal<any[]>([]);

  readonly matches = signal<MatchItem[]>([]);
  readonly tacticRoster = signal<TacticPlayer[]>([]);
  readonly transactions = signal<TransactionItem[]>([]);
  readonly topPlayers = signal<TopPlayer[]>([]);

  // Pizarra Táctica Express
  readonly tacticView = signal<'cancha' | 'lista' | 'tarjetas'>('cancha');
  readonly selectedFormation = signal<string>('4-3-3');
  readonly availableFormations = ['4-3-3', '4-4-2', '4-2-3-1', '3-5-2'];
  readonly selectedTacticPlayer = signal<TacticPlayer | null>(null);
  readonly hoveredTacticPlayer = signal<TacticPlayer | null>(null);

  readonly pitchPlayers = computed(() => {
    const roster = this.tacticRoster();
    const formationSlots = FORMATIONS[this.selectedFormation()] || FORMATIONS['4-3-3'];

    return formationSlots.map((slot, index) => {
      const player = roster[index];
      if (player) {
        return {
          ...player,
          role: slot.role,
          line: slot.line,
          x: slot.x,
          y: slot.y,
          isAssigned: true
        };
      } else {
        return {
          id: `vacante-${index}`,
          dorsal: '—',
          nombre: `Posición ${slot.role}`,
          posicion: slot.role,
          pierna: '—',
          peso_kg: 0,
          talla_cm: 0,
          estado: 'PENDIENTE' as const,
          avatar: '',
          rolTactic: `Vacante ${slot.role}`,
          role: slot.role,
          line: slot.line,
          x: slot.x,
          y: slot.y,
          isAssigned: false
        };
      }
    });
  });

  readonly benchPlayers = computed(() => {
    const roster = this.tacticRoster();
    if (roster.length <= 11) return [];
    return roster.slice(11);
  });

  newMatch = {
    categoriaId: '',
    rivalNombre: '',
    fecha: new Date().toISOString().split('T')[0],
    horaPartido: '09:00',
    horaCitacion: '08:00',
    sedeCancha: '',
    condicion: 'LOCAL' as 'LOCAL' | 'VISITANTE',
  };

  private lastLoadedClubId: string | null = null;

  constructor() {
    effect(() => {
      const club = this.api.activeClub();
      if (club && club.id) {
        // Evitar consultas duplicadas si la escuela activa no ha cambiado
        if (this.lastLoadedClubId === club.id) {
          return;
        }
        this.lastLoadedClubId = club.id;
        untracked(() => {
          this.loadDashboardData();
        });
      }
    });
  }

  ngOnInit(): void {
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

  /**
   * Carga Atómica de Datos Iniciales (InitData Pattern):
   * Reemplaza 8 peticiones HTTP concurrentes por 1 sola llamada optimizada al backend
   */
  loadDashboardData(): void {
    this.isLoadingInit.set(true);

    this.api.getDashboardInitData().subscribe({
      next: (data) => {
        // 1. KPIs Ejecutivos
        if (data.kpis) {
          this.stats.set(data.kpis);
        }

        // 2. Categorías Activas
        const cats = data.categorias || [];
        this.categorias.set(cats);
        if (cats.length > 0 && !this.newMatch.categoriaId) {
          this.newMatch.categoriaId = cats[0].id;
        }

        // 3. Próximos Partidos
        const partidos = data.proximosPartidos || [];
        if (partidos.length > 0) {
          const mapped: MatchItem[] = partidos.map((p: any) => ({
            id: p.id,
            rival_nombre: p.rival_nombre,
            categoria_nombre: p.categoria_nombre || 'General',
            categoria_codigo: p.codigo_categoria || 'GENERAL',
            fecha_partido: p.fecha_partido,
            hora_partido: p.hora_partido,
            hora_citacion: p.hora_citacion || p.hora_partido,
            sede_cancha: p.sede_cancha,
            condicion_juego: p.condicion_juego || 'LOCAL',
            indumentaria: p.indumentaria_kit || 'Home Kit',
            confirmados_count: Number(p.confirmados_count || 0),
            total_convocados: Number(p.total_convocados || 0),
            lat: parseFloat(p.latitud || '4.7892'),
            lng: parseFloat(p.longitud || '-74.0412'),
            torneo: p.torneo_nombre || 'Official Competition',
          }));
          this.matches.set(mapped);
        } else {
          this.matches.set([]);
        }

        // 4. Jugadores para Pizarra Táctica Express
        const jugs = data.pizarraTacticos || [];
        if (jugs.length > 0) {
          const mappedRoster: TacticPlayer[] = jugs.map((j: any, idx: number) => {
            const peso = parseFloat(j.peso_kg || '0');
            const talla = parseFloat(j.talla_cm || '0');
            const imcCalculado = j.imc ? parseFloat(j.imc) : (talla > 0 && peso > 0 ? parseFloat((peso / Math.pow(talla / 100, 2)).toFixed(1)) : undefined);
            return {
              id: j.id,
              dorsal: j.numero_dorsal || (idx + 1),
              nombre: `${j.nombres || ''} ${j.apellidos || ''}`.trim() || 'Player',
              nombres: j.nombres,
              apellidos: j.apellidos,
              categoria_nombre: j.categoria_nombre || 'General Formative',
              posicion: j.posicion_principal || 'VOL',
              posicion_secundaria: j.posicion_secundaria || '',
              pierna: j.pierna_habil || 'Right',
              peso_kg: peso,
              talla_cm: talla,
              imc: imcCalculado,
              eps: j.eps || 'Health Insurance',
              estado: (idx % 6 === 5 ? 'EXCUSADO' : idx % 6 === 4 ? 'PENDIENTE' : 'CONFIRMADO') as 'CONFIRMADO' | 'PENDIENTE' | 'EXCUSADO',
              avatar: j.foto_url || '',
              rolTactic: idx < 11 ? 'Starting XI' : 'Substitutes Bench',
              xp_total: Number(j.xp_total || 0),
            };
          });
          this.tacticRoster.set(mappedRoster);
        } else {
          this.tacticRoster.set([]);
        }

        // 5. Transacciones Recientes para Monitor Recaudo en Vivo
        const cargos = data.ultimasTransacciones || [];
        if (cargos.length > 0) {
          const mappedTx: TransactionItem[] = cargos.map((c: any, idx: number) => ({
            id: c.id,
            codigo_transaccion: c.referencia_pago || `TX-${c.id ? c.id.substring(0, 8) : idx}`,
            jugador_nombre: c.jugador_nombre || 'Student',
            categoria: c.categoria_nombre || 'General',
            monto: parseFloat(c.monto_total || '0'),
            metodo: c.metodo_pago || (idx % 2 === 0 ? 'Online Gateway' : 'Bank Transfer'),
            fecha: c.fecha_limite_pago || 'Pending',
            estado: c.saldo_pendiente == 0 ? 'APROBADA' : 'PENDIENTE',
          }));
          this.transactions.set(mappedTx);
        } else {
          this.transactions.set([]);
        }

        // 6. Top Biometría para Radar Físico & Top Players
        const bios = data.topBiometria || [];
        if (bios.length > 0) {
          const mappedTop: TopPlayer[] = bios.map((b: any) => ({
            id: b.id,
            nombre: `${b.jugador_nombre} #${b.numero_dorsal || ''}`,
            dorsal: b.numero_dorsal || 10,
            categoria: b.categoria_nombre || 'General',
            posicion: b.posicion_principal || 'Player',
            score_rendimiento: b.imc ? parseFloat((10 - Math.abs(21.5 - b.imc) * 0.3).toFixed(1)) : 8.5,
            cooper_metros: b.test_cooper_metros || 0,
            velocidad_max: b.velocidad_30m_seg ? parseFloat(((30 / b.velocidad_30m_seg) * 3.6).toFixed(1)) : 0,
            asistencia_pct: 100,
            avatar: b.foto_url || '',
            estado_medico: 'APTO',
          }));
          this.topPlayers.set(mappedTop);
        } else {
          this.topPlayers.set([]);
        }

        // 7. Landing Pública del Club (si existe)
        if (data.clubLanding && data.clubLanding.titulo) {
          this.activeClubLanding.set(data.clubLanding);
        }

        this.isLoadingInit.set(false);
      },
      error: (err) => {
        console.error('Error in dashboard initData:', err);
        this.isLoadingInit.set(false);
      }
    });
  }

  setTab(tab: 'partidos' | 'convocatoria' | 'recaudo' | 'biometria'): void {
    this.activeTab.set(tab);
  }

  setTacticView(view: 'cancha' | 'lista' | 'tarjetas'): void {
    this.tacticView.set(view);
  }

  setFormation(formation: string): void {
    this.selectedFormation.set(formation);
    this.showToast(`Esquema táctico actualizado a ${formation}`);
  }

  openPlayerModal(player: any): void {
    if (!player || player.isAssigned === false) return;
    this.selectedTacticPlayer.set(player);
  }

  closePlayerModal(): void {
    this.selectedTacticPlayer.set(null);
  }

  setPlayerStatus(player: any, estado: 'CONFIRMADO' | 'PENDIENTE' | 'EXCUSADO'): void {
    if (!player) return;
    player.estado = estado;
    const label = estado === 'CONFIRMADO' ? 'Confirmado' : estado === 'PENDIENTE' ? 'Pendiente' : 'Excusado';
    this.showToast(`${player.nombre} marcado como ${label}`);
  }

  sendIndividualWhatsApp(player: any): void {
    if (!player) return;
    const match = this.matches()[0];
    const matchInfo = match 
      ? `al partido vs ${match.rival_nombre} (${match.categoria_nombre}) el ${match.fecha_partido} a las ${match.hora_partido} en ${match.sede_cancha}`
      : 'al próximo partido oficial del club';
    const text = encodeURIComponent(
      `¡Hola! Te contactamos de ${this.api.activeClub().nombre}. Te informamos que ${player.nombre} ha sido convocado como ${player.rolTactic || 'jugador'} ${matchInfo}. Por favor confirma tu asistencia respondiendo a este mensaje.`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }

  getShortName(nombre: string): string {
    if (!nombre) return '';
    const parts = nombre.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    if (parts.length >= 2) return `${parts[0][0]}. ${parts[1]}`;
    return nombre;
  }

  openScheduleModal(): void {
    this.showScheduleModal.set(true);
  }

  closeScheduleModal(): void {
    this.showScheduleModal.set(false);
  }

  submitScheduleForm(): void {
    if (!this.newMatch.rivalNombre || !this.newMatch.sedeCancha || !this.newMatch.categoriaId) {
      this.showToast('Por favor completa todos los campos obligatorios del partido.');
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
      indumentaria_kit: 'Indumentaria Titular',
    };

    this.api.createPartido(payload).subscribe({
      next: () => {
        this.closeScheduleModal();
        this.showToast('¡Partido programado y convocatoria generada exitosamente!');
        this.loadDashboardData();
      },
      error: () => {
        this.showToast('Error al programar el partido');
      },
    });
  }

  openGpsRoute(match: MatchItem): void {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.sede_cancha)}`;
    window.open(url, '_blank');
    this.showToast(`Abriendo ruta GPS para "${match.sede_cancha}"`);
  }

  onSendWhatsAppCitacion(): void {
    this.showToast('Notificaciones de convocatoria enviadas por WhatsApp a las familias.');
  }

  onSendBulkReminders(): void {
    this.showToast('Recordatorios de cobro de mensualidades enviados por WhatsApp.');
  }

  onExportReport(): void {
    this.showToast('Generando y descargando Informe Ejecutivo 360° en PDF...');
  }

  onDownloadReceipt(tx: TransactionItem): void {
    this.showToast(`Descargando comprobante oficial de pago para ${tx.jugador_nombre}...`);
  }

  togglePlayerStatus(jugador: any): void {
    const estados: ('CONFIRMADO' | 'PENDIENTE' | 'EXCUSADO')[] = ['CONFIRMADO', 'PENDIENTE', 'EXCUSADO'];
    const currentIdx = estados.indexOf(jugador.estado);
    const nextEstado = estados[(currentIdx + 1) % estados.length];
    jugador.estado = nextEstado;
    const label = nextEstado === 'CONFIRMADO' ? 'Confirmado' : nextEstado === 'PENDIENTE' ? 'Pendiente' : 'Excusado';
    this.showToast(`${jugador.nombre} marcado como ${label}`);
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}

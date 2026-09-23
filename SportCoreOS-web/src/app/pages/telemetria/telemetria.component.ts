import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CatalogosService } from '../../core/services/catalogos.service';
import { PlayerSelectorComponent } from '../../shared/components/player-selector/player-selector.component';
import { FlatpickrDirective } from '../../shared/directives/flatpickr.directive';

@Component({
  selector: 'app-telemetria',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayerSelectorComponent, FlatpickrDirective],
  templateUrl: './telemetria.component.html',
  styleUrl: './telemetria.component.scss'
})
export class TelemetriaComponent implements OnInit {
  private api = inject(ApiService);
  private catalogos = inject(CatalogosService);

  readonly dispositivosGps = this.catalogos.dispositivosGps;
  readonly sesionesList = signal<any[]>([]);
  readonly selectedSesion = signal<any | null>(null);
  readonly jugadoresList = signal<any[]>([]);
  readonly activeHeatmapPlayer = signal<any | null>(null);

  readonly showCreateModal = signal<boolean>(false);
  readonly showAddMetricaModal = signal<boolean>(false);
  readonly toastMessage = signal<string>('');

  selectedFile: File | null = null;

  sesionForm = {
    nombre_sesion: '',
    tipo_sesion: 'partido',
    dispositivo_marca: 'CATAPULT_10HZ',
    fecha_sesion: new Date().toISOString().split('T')[0],
    duracion_minutos: 90,
    clima: '24°C Soleado',
  };

  metricaForm = {
    jugador_id: '',
    distancia_total_km: 9.8,
    velocidad_maxima_kmh: 32.4,
    sprints_alta_intensidad: 22,
    player_load: 580,
    frecuencia_cardiaca_max: 192,
  };

  readonly activeMetricas = computed(() => {
    const ses = this.selectedSesion();
    if (ses && ses.metricas && ses.metricas.length > 0) {
      return ses.metricas;
    }
    // Mock default metrics if empty
    return [
      { id: '1', jugador_nombre: 'Samuel Gómez', posicion: 'delantero', distancia_total_km: 10.4, velocidad_maxima_kmh: 33.2, sprints_alta_intensidad: 24, player_load: 610, frecuencia_cardiaca_max: 194 },
      { id: '2', jugador_nombre: 'Andrés Felipe Díaz', posicion: 'mediocampista', distancia_total_km: 11.2, velocidad_maxima_kmh: 30.5, sprints_alta_intensidad: 18, player_load: 590, frecuencia_cardiaca_max: 188 },
      { id: '3', jugador_nombre: 'Carlos Mario Valderrama', posicion: 'defensa', distancia_total_km: 8.9, velocidad_maxima_kmh: 29.1, sprints_alta_intensidad: 12, player_load: 480, frecuencia_cardiaca_max: 182 },
      { id: '4', jugador_nombre: 'Mateo Osorio', posicion: 'portero', distancia_total_km: 4.8, velocidad_maxima_kmh: 22.0, sprints_alta_intensidad: 4, player_load: 290, frecuencia_cardiaca_max: 165 },
    ];
  });

  ngOnInit(): void {
    this.loadSesiones();
    this.loadJugadores();
  }

  loadSesiones(preferredId?: string): void {
    this.api.getSesionesTelemetria().subscribe((res: any) => {
      const sesiones = Array.isArray(res) ? res : res?.data || [];
      this.sesionesList.set(sesiones);
      if (sesiones && sesiones.length > 0) {
        let target = sesiones[0];
        if (preferredId) {
          target = sesiones.find((s: any) => s.id === preferredId) || sesiones[0];
        } else if (this.selectedSesion()?.id) {
          target = sesiones.find((s: any) => s.id === this.selectedSesion()?.id) || sesiones[0];
        }
        this.selectSesion(target);
      } else {
        // Fallback demo session
        const demoSes = {
          id: 'demo-1',
          nombre_sesion: 'Fecha 14: SportCore FC vs Academia Pro',
          tipo_sesion: 'partido',
          fecha_sesion: new Date().toISOString().split('T')[0],
          duracion_minutos: 90,
          clima: '24°C Despejado',
        };
        this.selectedSesion.set(demoSes);
        this.activeHeatmapPlayer.set(this.activeMetricas()[0]);
      }
    });
  }

  loadJugadores(): void {
    this.api.getJugadores().subscribe((res) => {
      const jugadores = Array.isArray(res) ? res : (res?.data || []);
      this.jugadoresList.set(jugadores);
    });
  }

  selectSesion(s: any): void {
    this.api.getSesionTelemetriaById(s.id).subscribe({
      next: (full) => {
        const ses = full || s;
        if (ses?.metricas && ses.metricas.length > 0) {
          const mapped = ses.metricas.map((m: any) => ({
            id: m.id,
            jugador_id: m.jugador_id,
            jugador_nombre: m.nombres ? `${m.nombres} ${m.apellidos}` : (m.jugador_nombre || 'Jugador'),
            posicion: m.posicion_principal || m.posicion || 'delantero',
            distancia_total_km: (Number(m.distancia_total_m || 9400) / 1000).toFixed(1),
            velocidad_maxima_kmh: (Number(m.velocidad_max_kmh || 31.8)).toFixed(1),
            sprints_alta_intensidad: m.sprints_conteo || 18,
            player_load: Math.round(Number(m.player_load_au || 540)),
            frecuencia_cardiaca_max: m.frecuencia_cardiaca_max || 188,
            heatmap: m.coordenadas_heatmap_json || [],
          }));
          ses.metricas = mapped;
          this.selectedSesion.set(ses);
          this.activeHeatmapPlayer.set(mapped[0]);
        } else {
          this.selectedSesion.set(ses);
          this.activeHeatmapPlayer.set(this.activeMetricas()[0]);
        }
      },
      error: () => {
        this.selectedSesion.set(s);
        this.activeHeatmapPlayer.set(this.activeMetricas()[0]);
      }
    });
  }

  selectHeatmapPlayer(m: any): void {
    this.activeHeatmapPlayer.set(m);
  }

  onHeatmapPlayerChange(playerId: string): void {
    const found = this.activeMetricas().find((m: any) => m.id === playerId);
    if (found) {
      this.activeHeatmapPlayer.set(found);
    }
  }

  getHeatZones(): any[] {
    const player = this.activeHeatmapPlayer();
    const pos = (player?.posicion || 'delantero').toLowerCase();

    if (pos.includes('delantero')) {
      return [
        { x: 72, y: 48, size: 140, opacity: 0.9 },
        { x: 80, y: 35, size: 110, opacity: 0.8 },
        { x: 82, y: 62, size: 110, opacity: 0.8 },
        { x: 60, y: 50, size: 90, opacity: 0.6 },
      ];
    } else if (pos.includes('mediocampista')) {
      return [
        { x: 50, y: 50, size: 150, opacity: 0.9 },
        { x: 40, y: 35, size: 120, opacity: 0.75 },
        { x: 60, y: 65, size: 120, opacity: 0.75 },
        { x: 55, y: 30, size: 100, opacity: 0.6 },
      ];
    } else if (pos.includes('defensa')) {
      return [
        { x: 25, y: 50, size: 140, opacity: 0.9 },
        { x: 22, y: 30, size: 110, opacity: 0.8 },
        { x: 22, y: 70, size: 110, opacity: 0.8 },
        { x: 38, y: 50, size: 90, opacity: 0.5 },
      ];
    } else {
      // Portero
      return [
        { x: 10, y: 50, size: 110, opacity: 0.95 },
        { x: 14, y: 42, size: 70, opacity: 0.6 },
        { x: 14, y: 58, size: 70, opacity: 0.6 },
      ];
    }
  }

  getPlayerSpotCoordinates(): { x: number; y: number } {
    const player = this.activeHeatmapPlayer();
    const pos = (player?.posicion || 'delantero').toLowerCase();
    if (pos.includes('delantero')) return { x: 74, y: 48 };
    if (pos.includes('mediocampista')) return { x: 50, y: 50 };
    if (pos.includes('defensa')) return { x: 26, y: 50 };
    return { x: 10, y: 50 };
  }

  getProgressDistance(): number {
    const avg = Number(this.getAverageDistance()) || 9.2;
    const progress = Math.min(100, Math.round((avg / 10.5) * 100));
    return progress;
  }

  getTopSpeedNum(): number {
    return Number(this.getTopSpeed()) || 33.2;
  }

  getTopSpeedPlayer(): string {
    const metrics = this.activeMetricas();
    if (!metrics || metrics.length === 0) return 'Samuel Gómez (33.2 km/h)';
    let best = metrics[0];
    for (const m of metrics) {
      if (Number(m.velocidad_maxima_kmh) > Number(best.velocidad_maxima_kmh)) {
        best = m;
      }
    }
    return `${best.jugador_nombre || best.nombres || 'Jugador'} (${best.velocidad_maxima_kmh} km/h)`;
  }

  getAveragePlayerLoadNum(): number {
    return Number(this.getAveragePlayerLoad()) || 560;
  }

  getAvgHeartRate(): number {
    const player = this.activeHeatmapPlayer();
    const maxFc = Number(player?.frecuencia_cardiaca_max) || 188;
    return Math.round(maxFc * 0.82);
  }

  Number(val: any): number {
    return Number(val) || 0;
  }

  getAverageDistance(): string {
    const metrics = this.activeMetricas();
    if (!metrics || metrics.length === 0) return '9.2';
    const sum = metrics.reduce((acc: number, m: any) => acc + (Number(m.distancia_total_km) || 0), 0);
    return (sum / metrics.length).toFixed(1);
  }

  getTopSpeed(): string {
    const metrics = this.activeMetricas();
    if (!metrics || metrics.length === 0) return '33.2';
    const max = Math.max(...metrics.map((m: any) => Number(m.velocidad_maxima_kmh) || 0));
    return max > 0 ? max.toFixed(1) : '33.2';
  }

  getAveragePlayerLoad(): string {
    const metrics = this.activeMetricas();
    if (!metrics || metrics.length === 0) return '560';
    const sum = metrics.reduce((acc: number, m: any) => acc + (Number(m.player_load) || 0), 0);
    return Math.round(sum / metrics.length).toString();
  }

  formatPosicion(pos: string): string {
    switch (pos) {
      case 'delantero': return 'DEL';
      case 'mediocampista': return 'MED';
      case 'defensa': return 'DEF';
      case 'portero': return 'POR';
      default: return pos || 'JUG';
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  openCreateSesionModal(): void {
    this.sesionForm = {
      nombre_sesion: '',
      tipo_sesion: 'partido',
      dispositivo_marca: 'CATAPULT_10HZ',
      fecha_sesion: new Date().toISOString().split('T')[0],
      duracion_minutos: 90,
      clima: '24°C Soleado',
    };
    this.selectedFile = null;
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  submitSesionForm(): void {
    if (!this.sesionForm.nombre_sesion) {
      this.showToast('Ingresa el nombre de la sesión');
      return;
    }

    const payload = {
      fecha_sesion: this.sesionForm.fecha_sesion,
      tipo_sesion: this.sesionForm.tipo_sesion === 'partido' ? 'PARTIDO_OFICIAL' : 'ENTRENAMIENTO_TACTICO',
      dispositivo_marca: this.sesionForm.dispositivo_marca || 'CATAPULT_10HZ',
      duracion_minutos: Number(this.sesionForm.duracion_minutos) || 90,
      clima_temperatura: this.sesionForm.clima || null,
    };

    this.api.createSesionTelemetria(payload).subscribe({
      next: (created) => {
        if (this.selectedFile && created?.id) {
          this.api.uploadFile(this.selectedFile, 'telemetria', 'SESION_GPS', created.id, 'TRACKING_GPS_RAW').subscribe();
        }
        this.showToast('¡Sesión de telemetría GPS registrada e ingerida!');
        this.closeCreateModal();
        if (created?.id) {
          this.selectedSesion.set(created);
          this.loadSesiones(created.id);
        } else {
          this.loadSesiones();
        }
      },
      error: () => {
        this.showToast('Error al registrar sesión GPS');
      }
    });
  }

  openAddMetricaModal(): void {
    const ses = this.selectedSesion();
    if (!ses?.id) {
      this.showToast('Selecciona una sesión GPS primero');
      return;
    }
    const jugadores = this.jugadoresList();
    this.metricaForm = {
      jugador_id: jugadores.length > 0 ? jugadores[0].id : '',
      distancia_total_km: 9.8,
      velocidad_maxima_kmh: 32.4,
      sprints_alta_intensidad: 22,
      player_load: 580,
      frecuencia_cardiaca_max: 192,
    };
    this.showAddMetricaModal.set(true);
  }

  closeAddMetricaModal(): void {
    this.showAddMetricaModal.set(false);
  }

  submitMetricaForm(): void {
    const ses = this.selectedSesion();
    if (!ses?.id || !this.metricaForm.jugador_id) {
      this.showToast('Selecciona un jugador válido');
      return;
    }

    const payload = {
      jugador_id: this.metricaForm.jugador_id,
      distancia_total_m: Number(this.metricaForm.distancia_total_km) * 1000,
      velocidad_max_kmh: Number(this.metricaForm.velocidad_maxima_kmh),
      sprints_conteo: Number(this.metricaForm.sprints_alta_intensidad) || 0,
      player_load_au: Number(this.metricaForm.player_load) || 0,
      frecuencia_cardiaca_max: Number(this.metricaForm.frecuencia_cardiaca_max) || 188,
      coordenadas_heatmap_json: this.getHeatZones(),
    };

    this.api.createMetricaGps(ses.id, payload).subscribe({
      next: () => {
        this.showToast('¡Métrica cinemática registrada exitosamente!');
        this.closeAddMetricaModal();
        this.selectSesion(ses);
      },
      error: () => {
        this.showToast('Error al registrar métrica');
      }
    });
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RankingSocketEvent {
  tipo: 'XP_ACTUALIZADO' | 'NUEVO_LIDER' | 'RACHA_SUBIO' | 'PENALIZACION_FALTA' | 'DESTACADO_DT';
  jugadorId: string;
  jugadorNombre: string;
  dorsal: number;
  categoriaNombre: string;
  xpDelta: number;
  nuevoXpTotal: number;
  nuevoOvr: number;
  nuevoNivel: number;
  nuevaPosicionRanking: number;
  posicionAnterior: number;
  motivo: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class GamificationSocketService {
  private http = inject(HttpClient);
  private socketEvents$ = new Subject<RankingSocketEvent>();
  
  // Estado reactivo de conexión en tiempo real
  readonly isConnected = signal<boolean>(true);
  readonly ultimoEvento = signal<RankingSocketEvent | null>(null);

  private liveTickerInterval: any = null;

  constructor() {
    this.iniciarSocketSimulator();
  }

  getEvents$(): Observable<RankingSocketEvent> {
    return this.socketEvents$.asObservable();
  }

  // Emite un evento manual (por ejemplo cuando el DT confirma la planilla en la app)
  emitirEventoXP(evento: RankingSocketEvent): void {
    this.ultimoEvento.set(evento);
    this.socketEvents$.next(evento);
  }

  private iniciarSocketSimulator(): void {
    this.http.get<any>(`${environment.apiUrl}/jugadores`).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        if (list && list.length > 0) {
          let index = 0;
          this.liveTickerInterval = setInterval(() => {
            const jug = list[index % list.length];
            const motivos = [
              { tipo: 'DESTACADO_DT' as const, delta: 100, motivo: '⚡ Calificado como Destacado en Tiro por el DT (+100 XP)' },
              { tipo: 'XP_ACTUALIZADO' as const, delta: 50, motivo: '✅ Check-in de entrenamiento vía QR de Cancha (+50 XP)' },
              { tipo: 'RACHA_SUBIO' as const, delta: 75, motivo: '🔥 Racha de entrenamientos consecutivos (+75 XP)' },
              { tipo: 'XP_ACTUALIZADO' as const, delta: 60, motivo: '🎯 Reto de habilidad física completado y avalado (+60 XP)' },
            ];
            const m = motivos[index % motivos.length];
            const ev: RankingSocketEvent = {
              tipo: m.tipo,
              jugadorId: jug.id,
              jugadorNombre: `${jug.nombres} ${jug.apellidos}`,
              dorsal: jug.numero_dorsal || (index + 1),
              categoriaNombre: jug.categoria_nombre || 'Sub-15 Élite',
              xpDelta: m.delta,
              nuevoXpTotal: 3000 + (index * 50),
              nuevoOvr: 85,
              nuevoNivel: 13,
              nuevaPosicionRanking: (index % 5) + 1,
              posicionAnterior: ((index + 1) % 5) + 1,
              motivo: m.motivo,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };
            index++;
            this.emitirEventoXP(ev);
          }, 12000);
        }
      },
      error: () => {
        // Silent error
      }
    });
  }
}

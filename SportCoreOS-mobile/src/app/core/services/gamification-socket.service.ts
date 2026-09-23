import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface RankingSocketEvent {
  tipo: 'XP_ACTUALIZADO' | 'NUEVO_LIDER' | 'RACHA_SUBIO' | 'PENALIZACION_FALTA' | 'DESTACADO_DT';
  jugadorId: string;
  jugadorNombre: string;
  dorsal: number;
  categoriaNombre: string;
  xpDelta: number; // Ej: +50, +100, -30
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
  private socketEvents$ = new Subject<RankingSocketEvent>();
  
  // Estado reactivo de conexión en tiempo real
  readonly isConnected = signal<boolean>(true);
  readonly ultimoEvento = signal<RankingSocketEvent | null>(null);

  // Simulación activa de eventos Socket.io de cancha en vivo
  private mockInterval: any = null;

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
    // Simula eventos de cancha en tiempo real que llegan por WebSocket
    const eventosMuestra: Omit<RankingSocketEvent, 'timestamp'>[] = [
      {
        tipo: 'DESTACADO_DT',
        jugadorId: 'alm-1',
        jugadorNombre: 'Mateo Gómez',
        dorsal: 10,
        categoriaNombre: 'Sub-15 Élite',
        xpDelta: 100,
        nuevoXpTotal: 3550,
        nuevoOvr: 89,
        nuevoNivel: 14,
        nuevaPosicionRanking: 1,
        posicionAnterior: 1,
        motivo: '⚡ Calificado como Destacado en Tiro por el DT (+100 XP)'
      },
      {
        tipo: 'XP_ACTUALIZADO',
        jugadorId: 'alm-2',
        jugadorNombre: 'Samuel Díaz',
        dorsal: 7,
        categoriaNombre: 'Sub-17 Pro',
        xpDelta: 50,
        nuevoXpTotal: 3170,
        nuevoOvr: 86,
        nuevoNivel: 13,
        nuevaPosicionRanking: 2,
        posicionAnterior: 3,
        motivo: '✅ Check-in de entrenamiento vía QR de Cancha (+50 XP)'
      },
      {
        tipo: 'RACHA_SUBIO',
        jugadorId: 'alm-3',
        jugadorNombre: 'Esteban Pérez',
        dorsal: 4,
        categoriaNombre: 'Sub-17 Pro',
        xpDelta: 75,
        nuevoXpTotal: 2925,
        nuevoOvr: 84,
        nuevoNivel: 12,
        nuevaPosicionRanking: 3,
        posicionAnterior: 2,
        motivo: '🔥 Racha de 9 entrenamientos consecutivos (+75 XP)'
      },
      {
        tipo: 'PENALIZACION_FALTA',
        jugadorId: 'alm-8',
        jugadorNombre: 'Samuel Vásquez',
        dorsal: 11,
        categoriaNombre: 'Sub-15 Élite',
        xpDelta: -30,
        nuevoXpTotal: 1550,
        nuevoOvr: 71,
        nuevoNivel: 7,
        nuevaPosicionRanking: 8,
        posicionAnterior: 7,
        motivo: '⚠️ Inasistencia sin justificación avalada por DT (-30 XP)'
      }
    ];

    let index = 0;
    // Disparar un socket update cada 12 segundos para vivacidad
    this.mockInterval = setInterval(() => {
      const base = eventosMuestra[index % eventosMuestra.length];
      const ev: RankingSocketEvent = {
        ...base,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      index++;
      this.emitirEventoXP(ev);
    }, 12000);
  }
}

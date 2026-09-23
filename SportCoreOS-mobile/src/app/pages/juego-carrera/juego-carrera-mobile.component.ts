import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { MobileHeaderComponent } from '../../shared/components/mobile-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { AuthService } from '../../core/services/auth.service';
import { AlertService } from '../../core/services/alert.service';
import { GamificationSocketService, RankingSocketEvent } from '../../core/services/gamification-socket.service';

export type CardTier = 'BRONCE' | 'PLATA' | 'ORO' | 'ELITE';

export interface MobileRankItem {
  id: string;
  posicionRanking: number;
  posicionAnterior: number;
  nombres: string;
  apellidos: string;
  dorsal: number;
  posicionCampo: string;
  categoriaNombre: string;
  fotoUrl: string;
  tier: CardTier;
  nivel: number;
  overallRating: number;
  xpTotal: number;
  rachaEntrenamientos: number;
}

export interface TacticalQuestion {
  id: number;
  situacion: string;
  contexto: string;
  opciones: { texto: string; correcta: boolean; feedback: string }[];
  xpRecompensa: number;
}

export interface PlayerMission {
  id: string;
  tipo: 'ENTRENAMIENTO' | 'AMISTOSO' | 'OFICIAL' | 'TACTICA';
  titulo: string;
  descripcion: string;
  xp: number;
  progreso: number;
  meta: number;
  completada: boolean;
  icono: string;
  exigenciaBadge: string;
}

export interface RetoNivelMobile {
  nivel: number;
  meta: number;
  unidad: string;
  xp: number;
  titulo: string;
  dificultad: 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO' | 'PRO' | 'ELITE';
}

export interface RetoCatalogoMobile {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  categoria: 'FISICO' | 'TECNICO' | 'RESISTENCIA' | 'POTENCIA' | 'PRECISION';
  icono: string;
  color: string;
  niveles: RetoNivelMobile[];
}

export interface RetoProgresoStatus {
  estado: 'DISPONIBLE' | 'COMPROBABLE' | 'APROBADO';
  fecha?: string;
  xpGanado?: number;
  evaluadorNombre?: string;
}

@Component({
  selector: 'app-juego-carrera-mobile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MobileHeaderComponent, BottomNavComponent],
  templateUrl: './juego-carrera-mobile.component.html',
  styleUrl: './juego-carrera-mobile.component.scss'
})
export class JuegoCarreraMobileComponent implements OnInit, OnDestroy {
  auth = inject(AuthService);
  alertService = inject(AlertService);
  socketService = inject(GamificationSocketService);

  private socketSub: Subscription | null = null;

  // Estado del Jugador en el Juego
  xpTotal = signal<number>(3120);
  rachaTrivia = signal<number>(4);
  activeTab = signal<'RANKING' | 'TACTICA' | 'MISIONES' | 'TIRO_LIBRE'>('MISIONES');
  filtroMision = signal<string>('TODAS');

  // Subpestaña en Exigencias y Retos
  subTabExigencias = signal<'RETOS_COMPROBABLES' | 'MISIONES_PARTIDO'>('RETOS_COMPROBABLES');
  filtroCategoriaReto = signal<string>('TODAS');

  // Catálogo de Retos Individuales Comprobables
  retosCatalogo = signal<RetoCatalogoMobile[]>([
    {
      id: 'reto-1',
      codigo: 'FLEXIONES_PECHO',
      titulo: 'Flexiones de Pecho Estrictas',
      descripcion: 'Pecho al suelo y extensión completa de brazos en postura recta comprobada por el DT.',
      categoria: 'FISICO',
      icono: 'fa-solid fa-person-walking-arrow-right',
      color: '#38bdf8',
      niveles: [
        { nivel: 1, meta: 5, unidad: 'flexiones', xp: 30, titulo: '5 Flexiones continuas', dificultad: 'PRINCIPIANTE' },
        { nivel: 2, meta: 10, unidad: 'flexiones', xp: 60, titulo: '10 Flexiones continuas', dificultad: 'INTERMEDIO' },
        { nivel: 3, meta: 15, unidad: 'flexiones', xp: 100, titulo: '15 Flexiones continuas', dificultad: 'INTERMEDIO' },
        { nivel: 4, meta: 25, unidad: 'flexiones', xp: 180, titulo: '25 Flexiones continuas', dificultad: 'AVANZADO' },
        { nivel: 5, meta: 50, unidad: 'flexiones', xp: 400, titulo: '50 Flexiones Modo Titan', dificultad: 'ELITE' }
      ]
    },
    {
      id: 'reto-2',
      codigo: 'DOMINADAS_21S',
      titulo: 'Dominadas y Control Aéreo (21s)',
      descripcion: 'Control continuo del balón sin que toque el césped (pies, muslos y cabeza).',
      categoria: 'TECNICO',
      icono: 'fa-solid fa-futbol',
      color: '#10b981',
      niveles: [
        { nivel: 1, meta: 10, unidad: 'toques', xp: 40, titulo: '10 Dominadas seguidas', dificultad: 'PRINCIPIANTE' },
        { nivel: 2, meta: 25, unidad: 'toques', xp: 80, titulo: '25 Dominadas seguidas', dificultad: 'INTERMEDIO' },
        { nivel: 3, meta: 50, unidad: 'toques', xp: 150, titulo: '50 Dominadas estilo libre', dificultad: 'AVANZADO' },
        { nivel: 4, meta: 100, unidad: 'toques', xp: 300, titulo: '100 Toques de Magia', dificultad: 'PRO' },
        { nivel: 5, meta: 200, unidad: 'toques', xp: 600, titulo: '200 Toques Master Class', dificultad: 'ELITE' }
      ]
    },
    {
      id: 'reto-3',
      codigo: 'PLANCHA_CORE',
      titulo: 'Plancha Isométrica de Core',
      descripcion: 'Mantener alineación perfecta de cadera y abdomen sin arquear la espalda.',
      categoria: 'RESISTENCIA',
      icono: 'fa-solid fa-shield-halved',
      color: '#f59e0b',
      niveles: [
        { nivel: 1, meta: 30, unidad: 'segundos', xp: 35, titulo: '30 seg Plancha sólida', dificultad: 'PRINCIPIANTE' },
        { nivel: 2, meta: 60, unidad: 'segundos', xp: 75, titulo: '60 seg (1 min) Resistencia', dificultad: 'INTERMEDIO' },
        { nivel: 3, meta: 90, unidad: 'segundos', xp: 120, titulo: '90 seg Core Blindado', dificultad: 'AVANZADO' },
        { nivel: 4, meta: 120, unidad: 'segundos', xp: 200, titulo: '2 minutos de Acero', dificultad: 'PRO' }
      ]
    },
    {
      id: 'reto-4',
      codigo: 'SENTADILLAS_SALTO',
      titulo: 'Sentadillas con Salto Explosivo',
      descripcion: 'Flexión profunda a 90° con despegue explosivo y caída controlada.',
      categoria: 'POTENCIA',
      icono: 'fa-solid fa-bolt',
      color: '#ec4899',
      niveles: [
        { nivel: 1, meta: 10, unidad: 'saltos', xp: 45, titulo: '10 Saltos Explosivos', dificultad: 'PRINCIPIANTE' },
        { nivel: 2, meta: 20, unidad: 'saltos', xp: 90, titulo: '20 Saltos Explosivos', dificultad: 'INTERMEDIO' },
        { nivel: 3, meta: 30, unidad: 'saltos', xp: 160, titulo: '30 Saltos Pura Potencia', dificultad: 'AVANZADO' },
        { nivel: 4, meta: 50, unidad: 'saltos', xp: 350, titulo: '50 Saltos Resistencia Máxima', dificultad: 'ELITE' }
      ]
    },
    {
      id: 'reto-5',
      codigo: 'TIRO_LARGUERO',
      titulo: 'Tiro al Larguero (Crossbar Challenge)',
      descripcion: 'Impactar el travesaño superior desde el borde de las 18 yardas ante el DT.',
      categoria: 'PRECISION',
      icono: 'fa-solid fa-crosshairs',
      color: '#a855f7',
      niveles: [
        { nivel: 1, meta: 1, unidad: 'impactos', xp: 50, titulo: '1 Larguero desde 18m', dificultad: 'INTERMEDIO' },
        { nivel: 2, meta: 3, unidad: 'impactos', xp: 150, titulo: '3 Largueros en 5 intentos', dificultad: 'PRO' },
        { nivel: 3, meta: 5, unidad: 'impactos', xp: 350, titulo: '5 Largueros Francotirador', dificultad: 'ELITE' }
      ]
    }
  ]);

  // Progreso individual del jugador (clave: `${retoCodigo}_L${nivel}`)
  retosProgreso = signal<Record<string, RetoProgresoStatus>>({
    'FLEXIONES_PECHO_L1': { estado: 'APROBADO', fecha: '2026-09-15', xpGanado: 30, evaluadorNombre: 'DT Carlos Valderrama' },
    'FLEXIONES_PECHO_L2': { estado: 'COMPROBABLE' },
    'DOMINADAS_21S_L1': { estado: 'APROBADO', fecha: '2026-09-18', xpGanado: 40, evaluadorNombre: 'DT Carlos Valderrama' },
    'PLANCHA_CORE_L1': { estado: 'COMPROBABLE' }
  });

  retosFiltrados = computed(() => {
    const cat = this.filtroCategoriaReto();
    if (cat === 'TODAS') return this.retosCatalogo();
    return this.retosCatalogo().filter(r => r.categoria === cat);
  });

  retosComprobablesPendientesCount = computed(() => {
    return Object.values(this.retosProgreso()).filter(p => p.estado === 'COMPROBABLE').length;
  });

  retosAprobadosCount = computed(() => {
    return Object.values(this.retosProgreso()).filter(p => p.estado === 'APROBADO').length;
  });

  xpRetosObtenido = computed(() => {
    let sum = 0;
    const progreso = this.retosProgreso();
    this.retosCatalogo().forEach(reto => {
      reto.niveles.forEach(lvl => {
        const key = `${reto.codigo}_L${lvl.nivel}`;
        if (progreso[key]?.estado === 'APROBADO') {
          sum += lvl.xp;
        }
      });
    });
    return sum;
  });

  xpRetosCatalogoTotal = computed(() => {
    let sum = 0;
    this.retosCatalogo().forEach(reto => {
      reto.niveles.forEach(lvl => {
        sum += lvl.xp;
      });
    });
    return sum;
  });

  porcentajeXpRetos = computed(() => {
    const total = this.xpTotal();
    const retosXp = this.xpRetosObtenido();
    if (total <= 0) return 0;
    return Math.min(100, Math.round((retosXp / total) * 100));
  });

  porcentajeCatalogoCompletado = computed(() => {
    const totalCat = this.xpRetosCatalogoTotal();
    const retosXp = this.xpRetosObtenido();
    if (totalCat <= 0) return 0;
    return Math.min(100, Math.round((retosXp / totalCat) * 100));
  });

  desgloseCategoriasRetos = computed(() => {
    const map = new Map<string, { categoria: string; totalXp: number; xpGanado: number; aprobados: number; totales: number; color: string; icono: string; titulo: string }>();
    const progreso = this.retosProgreso();

    this.retosCatalogo().forEach(reto => {
      if (!map.has(reto.categoria)) {
        map.set(reto.categoria, {
          categoria: reto.categoria,
          titulo: reto.titulo,
          totalXp: 0,
          xpGanado: 0,
          aprobados: 0,
          totales: 0,
          color: reto.color,
          icono: reto.icono
        });
      }
      const item = map.get(reto.categoria)!;
      reto.niveles.forEach(lvl => {
        item.totalXp += lvl.xp;
        item.totales += 1;
        const key = `${reto.codigo}_L${lvl.nivel}`;
        if (progreso[key]?.estado === 'APROBADO') {
          item.xpGanado += lvl.xp;
          item.aprobados += 1;
        }
      });
    });

    return Array.from(map.values()).map(c => ({
      ...c,
      porcentaje: c.totalXp > 0 ? Math.round((c.xpGanado / c.totalXp) * 100) : 0
    }));
  });

  // Lista Gamificada para el Leaderboard en Tiempo Real
  leaderboardList = signal<MobileRankItem[]>([
    {
      id: 'alm-1',
      posicionRanking: 1,
      posicionAnterior: 1,
      nombres: 'Mateo',
      apellidos: 'Gómez',
      dorsal: 10,
      posicionCampo: 'Volante Ofensivo',
      categoriaNombre: 'Sub-15 Élite',
      fotoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200',
      tier: 'ORO',
      nivel: 14,
      overallRating: 88,
      xpTotal: 3450,
      rachaEntrenamientos: 12
    },
    {
      id: 'alm-2',
      posicionRanking: 2,
      posicionAnterior: 3,
      nombres: 'Samuel',
      apellidos: 'Díaz',
      dorsal: 7,
      posicionCampo: 'Extremo Derecho',
      categoriaNombre: 'Sub-17 Pro',
      fotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
      tier: 'ORO',
      nivel: 13,
      overallRating: 86,
      xpTotal: 3120,
      rachaEntrenamientos: 9
    },
    {
      id: 'alm-3',
      posicionRanking: 3,
      posicionAnterior: 2,
      nombres: 'Esteban',
      apellidos: 'Pérez',
      dorsal: 4,
      posicionCampo: 'Defensa Central',
      categoriaNombre: 'Sub-17 Pro',
      fotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      tier: 'PLATA',
      nivel: 12,
      overallRating: 83,
      xpTotal: 2850,
      rachaEntrenamientos: 8
    },
    {
      id: 'alm-4',
      posicionRanking: 4,
      posicionAnterior: 5,
      nombres: 'Sebastián',
      apellidos: 'Muñoz',
      dorsal: 1,
      posicionCampo: 'Arquero Titular',
      categoriaNombre: 'Sub-15 Élite',
      fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      tier: 'PLATA',
      nivel: 11,
      overallRating: 81,
      xpTotal: 2640,
      rachaEntrenamientos: 6
    },
    {
      id: 'alm-5',
      posicionRanking: 5,
      posicionAnterior: 4,
      nombres: 'Santiago',
      apellidos: 'Restrepo',
      dorsal: 8,
      posicionCampo: 'Mediocentro',
      categoriaNombre: 'Sub-15 Élite',
      fotoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200',
      tier: 'PLATA',
      nivel: 11,
      overallRating: 80,
      xpTotal: 2510,
      rachaEntrenamientos: 5
    },
    {
      id: 'alm-8',
      posicionRanking: 6,
      posicionAnterior: 7,
      nombres: 'Samuel',
      apellidos: 'Vásquez',
      dorsal: 11,
      posicionCampo: 'Extremo Izquierdo',
      categoriaNombre: 'Sub-15 Élite',
      fotoUrl: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=200',
      tier: 'BRONCE',
      nivel: 7,
      overallRating: 72,
      xpTotal: 1580,
      rachaEntrenamientos: 0
    }
  ]);

  top3Alumnos = computed(() => {
    return this.leaderboardList().slice(0, 3);
  });

  // Nivel y Cálculo de Tarjeta
  nivel = computed(() => Math.floor(this.xpTotal() / 500) + 1);
  xpActualNivel = computed(() => this.xpTotal() % 500);
  xpMetaNivel = signal<number>(500);
  porcentajeProgreso = computed(() => (this.xpActualNivel() / this.xpMetaNivel()) * 100);

  tier = computed<CardTier>(() => {
    const lvl = this.nivel();
    if (lvl <= 5) return 'BRONCE';
    if (lvl <= 15) return 'PLATA';
    if (lvl <= 25) return 'ORO';
    return 'ELITE';
  });

  overallRating = computed(() => {
    const base = 70;
    const bonus = Math.min(29, this.nivel() * 2);
    return base + bonus;
  });

  stats = computed(() => {
    const ovr = this.overallRating();
    return {
      ritmo: Math.min(99, ovr + 3),
      tiro: Math.min(99, ovr - 2),
      pase: Math.min(99, ovr + 1),
      regate: Math.min(99, ovr + 2),
      defensa: Math.max(55, ovr - 18),
      fisico: Math.min(99, ovr - 4)
    };
  });

  // Trivias Tácticas
  preguntas: TacticalQuestion[] = [
    {
      id: 1,
      contexto: 'Salida de presión rival en bloque alto (Minuto 35)',
      situacion: 'Tu lateral derecho está acorralado en la banda por dos rivales y tú eres el extremo desmarcado hacia adentro.',
      opciones: [
        { texto: 'Tirar una diagonal corta de apoyo para ofrecer pared y descargar en 1 toque.', correcta: true, feedback: '¡Excelente! Generas superioridad numérica y rompes la primera línea de presión.' },
        { texto: 'Quedarte pegado a la línea esperando un pelotazo largo por arriba.', correcta: false, feedback: 'El balón largo es impreciso bajo presión y facilita la intercepción defensiva.' },
        { texto: 'Gritarle al arquero para que salga de su área.', correcta: false, feedback: 'El arquero está demasiado lejos y no es una línea de pase segura en esa zona.' }
      ],
      xpRecompensa: 50
    },
    {
      id: 2,
      contexto: 'Contraataque veloz 3 vs 2 a favor (Minuto 78)',
      situacion: 'Conduces por el centro del campo y el defensa central rival sale a achicarte el espacio de tiro.',
      opciones: [
        { texto: 'Filtrar el pase al espacio para el extremo que pica en diagonal al segundo palo.', correcta: true, feedback: '¡Visión de crack! Aprovechas el arrastre de marca para dejar al compañero mano a mano.' },
        { texto: 'Patear inmediatamente desde 35 metros con marca encima.', correcta: false, feedback: 'Es un tiro forzado con baja probabilidad cuando tenías pase claro con ventaja.' },
        { texto: 'Frenar la jugada y esperar que todo el equipo suba.', correcta: false, feedback: 'Pierdes la ventaja de la transición rápida y permites que el rival se repliegue.' }
      ],
      xpRecompensa: 50
    },
    {
      id: 3,
      contexto: 'Defensa de Tiro de Esquina en contra (Minuto 89)',
      situacion: 'El rival cobra en corto buscando centro pasado al segundo poste.',
      opciones: [
        { texto: 'Bascular con la línea defensiva, perfilado para despejar hacia afuera de la cancha.', correcta: true, feedback: '¡Perfecto orden táctico! Evitas habilitar rivales y despejas a zona segura.' },
        { texto: 'Mirar fijamente solo el balón sin referenciar a tu marca asignada.', correcta: false, feedback: 'Grave error. Si pierdes de vista a tu jugador, puede anticiparte y cabecear solo.' },
        { texto: 'Salir corriendo hacia el medio campo antes de que cabeceen.', correcta: false, feedback: 'Dejas a tu arquero en inferioridad y regalas el segundo palo.' }
      ],
      xpRecompensa: 50
    }
  ];

  currentQuestionIndex = signal<number>(0);
  selectedOption = signal<number | null>(null);
  mostrarResultado = signal<boolean>(false);
  triviaFinalizada = signal<boolean>(false);

  currentQuestion = computed(() => this.preguntas[this.currentQuestionIndex()]);

  isRespuestaCorrecta = computed(() => {
    const sel = this.selectedOption();
    if (sel === null) return false;
    return this.currentQuestion().opciones[sel]?.correcta || false;
  });

  feedbackMensaje = computed(() => {
    const sel = this.selectedOption();
    if (sel === null) return '';
    return this.currentQuestion().opciones[sel]?.feedback || '';
  });

  // Misiones y Exigencias Reales
  misiones = signal<PlayerMission[]>([
    {
      id: 'm1',
      tipo: 'ENTRENAMIENTO',
      titulo: 'Racha de Asistencia Impecable',
      descripcion: 'Asistir puntualmente a 3 entrenamientos consecutivos esta semana.',
      xp: 150,
      progreso: 3,
      meta: 3,
      completada: false,
      icono: 'fa-solid fa-stopwatch-20',
      exigenciaBadge: 'Disciplina DT'
    },
    {
      id: 'm2',
      tipo: 'ENTRENAMIENTO',
      titulo: 'Récord de Velocidad 30m',
      descripcion: 'Bajar tu marca personal en el test de sprint con el preparador físico.',
      xp: 100,
      progreso: 1,
      meta: 1,
      completada: true,
      icono: 'fa-solid fa-bolt',
      exigenciaBadge: 'Test Biométrico'
    },
    {
      id: 'm3',
      tipo: 'AMISTOSO',
      titulo: 'Asistencia o Gol de Jugada',
      descripcion: 'Generar al menos 1 pase de gol o tiro a puerta en el partido de práctica.',
      xp: 120,
      progreso: 1,
      meta: 1,
      completada: false,
      icono: 'fa-solid fa-futbol',
      exigenciaBadge: 'Rendimiento Amistoso'
    },
    {
      id: 'm4',
      tipo: 'OFICIAL',
      titulo: 'Fair Play & Victoria de Liga',
      descripcion: 'Completar el partido oficial sin amonestaciones y sumar los 3 puntos.',
      xp: 250,
      progreso: 1,
      meta: 2,
      completada: false,
      icono: 'fa-solid fa-shield-halved',
      exigenciaBadge: 'Liga Oficial x2 XP'
    }
  ]);

  misionesFiltradas = computed(() => {
    const f = this.filtroMision();
    if (f === 'TODAS') return this.misiones();
    return this.misiones().filter(m => m.tipo === f);
  });

  // Minijuego Tiro Libre
  golesMarcados = signal<number>(3);
  keeperPosicion = signal<string>('center');
  disparando = signal<boolean>(false);
  tiroResultadoMensaje = signal<string | null>(null);
  esGol = signal<boolean>(true);

  ngOnInit(): void {
    // Suscripción a eventos WebSocket en tiempo real
    this.socketSub = this.socketService.getEvents$().subscribe((ev: RankingSocketEvent) => {
      this.procesarEventoSocket(ev);
    });
  }

  ngOnDestroy(): void {
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
  }

  private procesarEventoSocket(ev: RankingSocketEvent): void {
    this.leaderboardList.update(list => {
      const updated = list.map(item => {
        if (item.id === ev.jugadorId) {
          return {
            ...item,
            posicionAnterior: item.posicionRanking,
            xpTotal: ev.nuevoXpTotal,
            overallRating: ev.nuevoOvr,
            nivel: ev.nuevoNivel
          };
        }
        return item;
      });

      // Re-ordenar automáticamente por puntaje descendente
      return updated
        .sort((a, b) => b.xpTotal - a.xpTotal)
        .map((p, idx) => ({ ...p, posicionRanking: idx + 1 }));
    });

    // Si el evento afecta al usuario activo (Samuel Díaz #7)
    if (ev.jugadorId === 'alm-2') {
      this.xpTotal.set(ev.nuevoXpTotal);
      if (ev.xpDelta > 0) {
        this.alertService.success(`⚡ ¡Has ganado +${ev.xpDelta} XP! Nuevo total: ${ev.nuevoXpTotal}`);
      } else {
        this.alertService.error(`⚠️ Penalización aplicada: ${ev.xpDelta} XP.`);
      }
    }
  }

  setTab(tab: 'RANKING' | 'TACTICA' | 'MISIONES' | 'TIRO_LIBRE') {
    this.activeTab.set(tab);
  }

  verDetalleAlumno(alumno: MobileRankItem): void {
    this.alertService.info(`${alumno.nombres} ${alumno.apellidos}: Rank #${alumno.posicionRanking} • ${alumno.xpTotal} XP • OVR ${alumno.overallRating}`);
  }

  getTierClass(tier: CardTier): string {
    switch (tier) {
      case 'BRONCE': return 'tier-bronce';
      case 'PLATA': return 'tier-plata';
      case 'ORO': return 'tier-oro';
      case 'ELITE': return 'tier-elite';
    }
  }

  getSiguienteTier(): string {
    const t = this.tier();
    if (t === 'BRONCE') return 'PLATA';
    if (t === 'PLATA') return 'ORO';
    if (t === 'ORO') return 'ÉLITE PRO';
    return 'MÁXIMO';
  }

  getNivelSiguienteTier(): number {
    const t = this.tier();
    if (t === 'BRONCE') return 6;
    if (t === 'PLATA') return 16;
    if (t === 'ORO') return 26;
    return 50;
  }

  getLetter(idx: number): string {
    return ['A', 'B', 'C', 'D'][idx] || '';
  }

  selectOption(idx: number) {
    this.selectedOption.set(idx);
  }

  confirmarRespuesta() {
    this.mostrarResultado.set(true);
    if (this.isRespuestaCorrecta()) {
      this.xpTotal.update(x => x + this.currentQuestion().xpRecompensa);
      this.rachaTrivia.update(r => r + 1);
    } else {
      this.rachaTrivia.set(0);
    }
  }

  siguientePregunta() {
    this.mostrarResultado.set(false);
    this.selectedOption.set(null);
    if (this.currentQuestionIndex() < this.preguntas.length - 1) {
      this.currentQuestionIndex.update(i => i + 1);
    } else {
      this.triviaFinalizada.set(true);
    }
  }

  reiniciarTrivia() {
    this.currentQuestionIndex.set(0);
    this.selectedOption.set(null);
    this.mostrarResultado.set(false);
    this.triviaFinalizada.set(false);
  }

  reclamarMision(m: PlayerMission) {
    if (m.completada) return;
    this.xpTotal.update(x => x + m.xp);
    this.misiones.update(list =>
      list.map(item => item.id === m.id ? { ...item, completada: true } : item)
    );
  }

  disparar(zonaId: number) {
    if (this.disparando()) return;
    this.disparando.set(true);

    const opcionesKeeper = ['dive-left', 'dive-right', 'dive-center'];
    const keeperChoice = opcionesKeeper[Math.floor(Math.random() * opcionesKeeper.length)];
    this.keeperPosicion.set(keeperChoice);

    setTimeout(() => {
      // Determinación de gol
      const gol = (zonaId === 1 && keeperChoice !== 'dive-left') ||
                  (zonaId === 2 && keeperChoice !== 'dive-right') ||
                  (zonaId === 3 && keeperChoice !== 'dive-left') ||
                  (zonaId === 4 && keeperChoice !== 'dive-right');

      this.esGol.set(gol);
      if (gol) {
        this.golesMarcados.update(g => Math.min(5, g + 1));
        this.xpTotal.update(x => x + 40);
        this.tiroResultadoMensaje.set('¡GOOOLAZO AL ÁNGULO! +40 XP Ganados ⚽🔥');
      } else {
        this.tiroResultadoMensaje.set('¡Atajó el arquero con reflejos felinos! Intenta otro ángulo 🧤');
      }

      setTimeout(() => {
        this.disparando.set(false);
        this.keeperPosicion.set('center');
      }, 1500);
    }, 400);
  }

  getProgresoRetoNivel(retoCodigo: string, nivel: number): RetoProgresoStatus {
    const key = `${retoCodigo}_L${nivel}`;
    return this.retosProgreso()[key] || { estado: 'DISPONIBLE' };
  }

  solicitarComprobacionReto(reto: RetoCatalogoMobile, lvl: RetoNivelMobile) {
    const key = `${reto.codigo}_L${lvl.nivel}`;
    this.retosProgreso.update(map => ({
      ...map,
      [key]: { estado: 'COMPROBABLE' }
    }));

    if (lvl.nivel > 1) {
      this.alertService.success(
        `🚀 ¡Salto de Reto Solicitado! Al superar ${lvl.meta} ${lvl.unidad} (Nivel ${lvl.nivel}) ante el DT, el sistema aprobará automáticamente todos los niveles anteriores y sumará el XP acumulado.`
      );
    } else {
      this.alertService.success(
        `⏳ ¡Reto "${lvl.titulo}" marcado como COMPROBABLE! En el próximo entrenamiento, realízalo ante tu DT (${lvl.meta} ${lvl.unidad}) para que sea aprobado y recibas +${lvl.xp} XP.`
      );
    }
  }

  aprobarRetoDirectoDTCascada(reto: RetoCatalogoMobile, lvl: RetoNivelMobile) {
    const targetNivel = lvl.nivel;
    const currentProg = this.retosProgreso();
    let totalXpAcumulado = 0;
    const newProg = { ...currentProg };
    const nivelesAprobados: number[] = [];

    // Iterar todos los niveles <= targetNivel
    for (let l = 1; l <= targetNivel; l++) {
      const lvlDef = reto.niveles.find(n => n.nivel === l);
      if (lvlDef) {
        const key = `${reto.codigo}_L${l}`;
        if (currentProg[key]?.estado !== 'APROBADO') {
          totalXpAcumulado += lvlDef.xp;
          newProg[key] = {
            estado: 'APROBADO',
            fecha: new Date().toISOString().split('T')[0],
            xpGanado: lvlDef.xp,
            evaluadorNombre: 'DT Carlos Valderrama'
          };
          nivelesAprobados.push(l);
        }
      }
    }

    this.retosProgreso.set(newProg);
    if (totalXpAcumulado > 0) {
      this.xpTotal.update(x => x + totalXpAcumulado);
    }

    if (nivelesAprobados.length > 1) {
      this.alertService.success(
        `🚀 ¡SALTO DE RETO EXITOSO! Al superar ${lvl.meta} ${lvl.unidad} (Nivel ${targetNivel}), el DT aprobó automáticamente ${nivelesAprobados.length} niveles anteriores con un total acumulado de +${totalXpAcumulado} XP.`
      );
    } else {
      this.alertService.success(
        `✅ ¡Reto "${lvl.titulo}" APROBADO por el DT! Sumaste +${totalXpAcumulado} XP a tu tarjeta FUT.`
      );
    }
  }
}

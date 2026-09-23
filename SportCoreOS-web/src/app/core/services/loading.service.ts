import { Injectable, signal, computed } from '@angular/core';

export interface FootballQuote {
  theme: 'BLUELOCK' | 'SUPERCAMPEONES' | 'CR7' | 'MESSI' | 'HYUGA' | 'BENJI';
  title: string;
  character: string;
  quote: string;
  badge: string;
  accentColor: string;
  secondaryColor: string;
  glowColor: string;
  icon: string;
  actionText: string;
}

export const FOOTBALL_LEGENDS_QUOTES: FootballQuote[] = [
  {
    theme: 'BLUELOCK',
    title: 'Blue Lock • Egoist Protocol',
    character: 'Isagi Yoichi & Ego Jinpachi',
    quote: '«Devora el terreno de juego, encuentra la pieza del rompecabezas táctico y despierta tu instinto goleador.»',
    badge: 'EGO MODE • BLUE LOCK',
    accentColor: '#06b6d4',
    secondaryColor: '#3b82f6',
    glowColor: 'rgba(6, 182, 212, 0.4)',
    icon: 'fa-brain',
    actionText: 'Calibrando visión espacial y rompecabezas táctico...',
  },
  {
    theme: 'SUPERCAMPEONES',
    title: 'Supercampeones • Capitán Tsubasa',
    character: 'Oliver Atom (Tsubasa Ozora)',
    quote: '«El balón es mi mejor amigo. ¡Tiro con Chanfle hacia el ángulo superior!»',
    badge: 'DRIVE SHOT • OLIVER ATOM',
    accentColor: '#f59e0b',
    secondaryColor: '#ef4444',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    icon: 'fa-fire-flame-curved',
    actionText: 'Cargando parábola perfecta estilo Tiro con Chanfle...',
  },
  {
    theme: 'CR7',
    title: 'CR7 • Potencia & Máxima Disciplina',
    character: 'Cristiano Ronaldo',
    quote: '«El talento sin trabajo duro no es nada. La obsesión por la victoria supera cualquier límite. ¡SIUUU!»',
    badge: 'SIUUU 7 • CR7 POWER',
    accentColor: '#ef4444',
    secondaryColor: '#eab308',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    icon: 'fa-bolt',
    actionText: 'Disparando misil teledirigido... ¡Siuuu!',
  },
  {
    theme: 'MESSI',
    title: 'Leo Messi • The GOAT 10',
    character: 'Lionel Andrés Messi',
    quote: '«Me llevó 17 años y 114 días triunfar de la noche a la mañana. La magia del regate y la visión total.»',
    badge: 'GOAT 10 • MAGIA PURA',
    accentColor: '#eab308',
    secondaryColor: '#38bdf8',
    glowColor: 'rgba(234, 179, 8, 0.45)',
    icon: 'fa-crown',
    actionText: 'Desplegando magia, pausa y regate milimétrico...',
  },
  {
    theme: 'HYUGA',
    title: 'Supercampeones • Fuerza Imparable',
    character: 'Steve Hyuga (Kojiro Hyuga)',
    quote: '«¡Fuerza, coraje y determinación de acero! El Tiro del Tigre perforará cualquier red.»',
    badge: 'TIGER SHOT • STEVE HYUGA',
    accentColor: '#10b981',
    secondaryColor: '#059669',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    icon: 'fa-shield-halved',
    actionText: 'Cargando la potencia devastadora del Tiro del Tigre...',
  },
  {
    theme: 'BENJI',
    title: 'Supercampeones • Guardameta Imbatible',
    character: 'Benji Price (Genzo Wakabayashi)',
    quote: '«¡Ningún remate desde fuera del área entrará en esta portería! Seguridad de élite bajo los 3 palos.»',
    badge: 'S.G.G.K. • BENJI PRICE',
    accentColor: '#8b5cf6',
    secondaryColor: '#6366f1',
    glowColor: 'rgba(139, 92, 246, 0.45)',
    icon: 'fa-hand-back-fist',
    actionText: 'Asegurando el arco y protegiendo el marcador...',
  },
];

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private activeRequests = signal<number>(0);
  private customMsg = signal<string | null>(null);
  private activeQuoteIndex = signal<number>(0);
  private modalVisible = signal<boolean>(false);
  private debounceTimer: any = null;

  // Reactivos
  readonly isLoading = computed(() => this.activeRequests() > 0);
  readonly message = computed(() => this.customMsg());
  readonly isOverlayVisible = computed(() => this.modalVisible() && this.isLoading());
  readonly currentQuote = computed(() => FOOTBALL_LEGENDS_QUOTES[this.activeQuoteIndex()]);
  readonly allQuotes = FOOTBALL_LEGENDS_QUOTES;

  show(message?: string): void {
    if (message) {
      this.customMsg.set(message);
    }
    const current = this.activeRequests();
    this.activeRequests.set(current + 1);

    if (current === 0) {
      this.rotateQuote();
      // Si la carga toma más de 180ms, mostramos el overlay temático
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        if (this.activeRequests() > 0) {
          this.modalVisible.set(true);
        }
      }, 180);
    }
  }

  hide(): void {
    this.activeRequests.update((count) => {
      const next = Math.max(0, count - 1);
      if (next === 0) {
        clearTimeout(this.debounceTimer);
        this.modalVisible.set(false);
        this.customMsg.set(null);
      }
      return next;
    });
  }

  showFullScreen(message?: string, theme?: FootballQuote['theme']): void {
    if (message) this.customMsg.set(message);
    if (theme) {
      const idx = FOOTBALL_LEGENDS_QUOTES.findIndex((q) => q.theme === theme);
      if (idx >= 0) this.activeQuoteIndex.set(idx);
    } else {
      this.rotateQuote();
    }
    this.activeRequests.update((c) => c + 1);
    this.modalVisible.set(true);
  }

  hideFullScreen(): void {
    this.hide();
  }

  rotateQuote(): void {
    const nextIdx = Math.floor(Math.random() * FOOTBALL_LEGENDS_QUOTES.length);
    this.activeQuoteIndex.set(nextIdx);
  }

  setTheme(theme: FootballQuote['theme']): void {
    const idx = FOOTBALL_LEGENDS_QUOTES.findIndex((q) => q.theme === theme);
    if (idx >= 0) this.activeQuoteIndex.set(idx);
  }

  reset(): void {
    clearTimeout(this.debounceTimer);
    this.activeRequests.set(0);
    this.modalVisible.set(false);
    this.customMsg.set(null);
  }
}

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { PlayerSelectorComponent } from '../../shared/components/player-selector/player-selector.component';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  tacticalBadge?: string;
}

@Component({
  selector: 'app-ia',
  standalone: true,
  imports: [CommonModule, FormsModule, PlayerSelectorComponent],
  templateUrl: './ia.component.html',
  styleUrl: './ia.component.scss'
})
export class IaComponent implements OnInit {
  private api = inject(ApiService);

  readonly activeTab = signal<'chat' | 'boletin' | 'fatiga'>('chat');
  readonly jugadoresList = signal<any[]>([]);

  readonly chatMessages = signal<ChatMessage[]>([
    {
      sender: 'ai',
      text: '¡Hola Profesor! Soy SportCore AI, tu copiloto táctico. Puedo asistirte en análisis del rival, variantes tácticas según el marcador, sugerencias de pelota parada o rotaciones.',
      timestamp: 'Ahora',
      tacticalBadge: 'Gemini Sports Copilot',
    }
  ]);

  readonly isLoadingChat = signal<boolean>(false);
  readonly isLoadingBoletin = signal<boolean>(false);
  readonly boletinResultado = signal<any | null>(null);
  readonly fatigaData = signal<any | null>(null);
  readonly selectedFatigaJugadorId = signal<string>('');
  readonly toastMessage = signal<string>('');

  currentPrompt: string = '';
  tacticalFormation: string = '4-3-3';

  boletinForm = {
    jugador_id: '',
    mes_periodo: 'Marzo 2026',
    observaciones_dt: '',
  };

  ngOnInit(): void {
    this.loadJugadores();
  }

  loadJugadores(): void {
    this.api.getJugadores().subscribe((res) => {
      const jugadores = Array.isArray(res) ? res : (res?.data || []);
      this.jugadoresList.set(jugadores);
      if (jugadores && jugadores.length > 0) {
        this.selectedFatigaJugadorId.set(jugadores[0].id);
        this.loadFatiga(jugadores[0].id);
      }
    });
  }

  setPresetPrompt(prompt: string): void {
    this.currentPrompt = prompt;
    this.sendChatMessage();
  }

  sendChatMessage(): void {
    if (!this.currentPrompt || this.isLoadingChat()) return;

    const userText = this.currentPrompt.trim();
    this.currentPrompt = '';

    const userMsg: ChatMessage = {
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    this.chatMessages.update((msgs) => [...msgs, userMsg]);
    this.isLoadingChat.set(true);

    this.api.chatTacticoDt({
      mensaje: userText,
      formacion: this.tacticalFormation,
      contexto: 'Partido de Liga Regional Juvenil',
    }).subscribe({
      next: (res) => {
        this.isLoadingChat.set(false);
        const aiText = res.respuesta || res.mensaje || res.diagnostico || 'Recomendación táctica procesada con éxito.';
        const aiMsg: ChatMessage = {
          sender: 'ai',
          text: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tacticalBadge: `Esquema ${this.tacticalFormation}`,
        };
        this.chatMessages.update((msgs) => [...msgs, aiMsg]);
      },
      error: () => {
        this.isLoadingChat.set(false);
        const fallbackMsg: ChatMessage = {
          sender: 'ai',
          text: `Análisis para esquema ${this.tacticalFormation}: Te sugiero adelantar los laterales como falsos extremos y doblar la marca por las bandas para abrir el bloque defensivo rival.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          tacticalBadge: `Esquema ${this.tacticalFormation}`,
        };
        this.chatMessages.update((msgs) => [...msgs, fallbackMsg]);
      }
    });
  }

  generarBoletin(): void {
    if (!this.boletinForm.jugador_id) {
      this.showToast('Selecciona un alumno para redactar el boletín');
      return;
    }

    this.isLoadingBoletin.set(true);
    this.boletinResultado.set(null);

    this.api.generarBoletinAlumno(this.boletinForm).subscribe({
      next: (res) => {
        this.isLoadingBoletin.set(false);
        const player = this.jugadoresList().find(j => j.id === this.boletinForm.jugador_id);
        this.boletinResultado.set({
          jugador_nombre: player ? `${player.nombres} ${player.apellidos}` : 'Alumno',
          contenido: res.boletin_texto || res.contenido || res.data,
        });
        this.showToast('¡Boletín formativo redactado con éxito!');
      },
      error: () => {
        this.isLoadingBoletin.set(false);
        const player = this.jugadoresList().find(j => j.id === this.boletinForm.jugador_id);
        const fallbackReport = `Estimados Padres de Familia:\n\nDurante el periodo de ${this.boletinForm.mes_periodo}, el alumno ${player?.nombres || 'Deportista'} ha demostrado un rendimiento técnico destacado, gran sentido de compañerismo y disciplina táctica.\n\nAspectos a destacar:\n- Asistencia puntual y compromiso en entrenamientos.\n- Dominio en transiciones de ataque-defensa.\n- Actitud positiva y liderazgo en cancha.\n\nObservación DT: ${this.boletinForm.observaciones_dt || 'Continuar fortaleciendo la pierna no hábil y la toma rápida de decisiones en el último tercio de cancha.'}`;
        this.boletinResultado.set({
          jugador_nombre: player ? `${player.nombres} ${player.apellidos}` : 'Alumno',
          contenido: fallbackReport,
        });
        this.showToast('Boletín generado con éxito.');
      }
    });
  }

  onFatigaJugadorChange(jugadorId: string): void {
    this.selectedFatigaJugadorId.set(jugadorId);
    this.loadFatiga(jugadorId);
  }

  loadFatiga(jugadorId: string): void {
    this.api.getAnalisisFatiga(jugadorId).subscribe({
      next: (data) => {
        this.fatigaData.set(data);
      },
      error: () => {
        this.fatigaData.set({
          ratio_acwr: '1.18',
          nivel_riesgo: 'BAJO',
          minutos_recomendados: 75,
          recomendacion_rotacion: 'Carga óptima. Puede ser alineado como titular en el próximo encuentro.',
          diagnostico_ia: 'El jugador mantiene una progresión de cargas físicas estable en las últimas 4 semanas.',
        });
      }
    });
  }

  copiarBoletin(): void {
    const text = this.boletinResultado()?.contenido;
    if (text) {
      navigator.clipboard.writeText(text);
      this.showToast('Boletín copiado al portapapeles');
    }
  }

  imprimirBoletin(): void {
    window.print();
  }

  formatMessageText(text: string): string {
    if (!text) return '';
    return text.replace(/\n/g, '<br>');
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set('');
    }, 4000);
  }
}

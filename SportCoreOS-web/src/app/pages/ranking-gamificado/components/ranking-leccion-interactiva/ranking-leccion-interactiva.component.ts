import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

type DecisionOption = {
  id: string;
  title: string;
  description: string;
  feedback: string;
  correct: boolean;
};

type DecisionStep = {
  id: string;
  title: string;
  prompt: string;
  context: string;
  hint: string;
  clip: {
    id: string;
    label: string;
    duration: string;
    summary: string;
    description: string;
  };
  options: DecisionOption[];
};

type PilotWeek = {
  number: number;
  title: string;
  activity: string;
  evidence: string;
};

type PilotRubricCriterion = {
  id: string;
  title: string;
  behavior: string;
};

const PILOT_WEEKS: PilotWeek[] = [
  {
    number: 1,
    title: 'Punto de partida',
    activity: 'Juego reducido 3v1: observar antes de corregir.',
    evidence: 'Registrar oportunidades de escaneo, perfil y primer toque.',
  },
  {
    number: 2,
    title: 'Escanear',
    activity: 'Buscar rival y espacio antes de que llegue el pase.',
    evidence: '¿Levanta la mirada antes del primer contacto?',
  },
  {
    number: 3,
    title: 'Orientar el control',
    activity: 'Recibir y salir por una puerta libre con presión gradual.',
    evidence: '¿El primer toque lo deja listo para la siguiente acción?',
  },
  {
    number: 4,
    title: 'Transferir al juego',
    activity: 'Aplicar el foco en un juego 3v3 o 4v4 y repetir la observación.',
    evidence: 'Comparar conductas con la línea base, no con otros niños.',
  },
];

const PILOT_RUBRIC: PilotRubricCriterion[] = [
  {
    id: 'scan',
    title: 'Escaneo',
    behavior: 'Mira alrededor antes de que llegue el pase.',
  },
  {
    id: 'body-profile',
    title: 'Perfil corporal',
    behavior: 'Se orienta para ver el balón y una opción de salida.',
  },
  {
    id: 'first-touch',
    title: 'Primer toque',
    behavior: 'Mantiene el control y lleva el balón hacia el espacio útil.',
  },
];

const PILOT_RUBRIC_LEVELS = [
  'Lo intenta con guía',
  'Lo aplica en algunas oportunidades',
  'Lo aplica en el juego sin recordatorio',
];

const DECISION_STEPS: DecisionStep[] = [
  {
    id: 'scan',
    title: 'Lee la jugada',
    prompt: 'El pase viene hacia ti y un rival se acerca. ¿Qué haces antes de recibir?',
    context: 'Tienes un compañero detrás y un espacio libre hacia tu derecha.',
    hint: 'Levanta la mirada un instante: ubica al rival y encuentra el espacio libre antes de que llegue el balón.',
    clip: {
      id: 'scan-before-receive',
      label: 'ESCENA 01 · ESCANEO ANTES DE RECIBIR',
      duration: '00:04',
      summary: 'El pase viaja hacia ti; revisa al rival y el espacio antes del primer contacto.',
      description: 'Escena uno: un compañero envía el balón al jugador amarillo, un rival presiona y el jugador mira por encima del hombro antes de recibir.',
    },
    options: [
      {
        id: 'scan',
        title: 'Miro por encima del hombro',
        description: 'Ubico la presión y el espacio antes de recibir.',
        feedback: '¡Buena lectura! Escanear antes de recibir te da tiempo para decidir y preparar el cuerpo.',
        correct: true,
      },
      {
        id: 'watch-ball',
        title: 'Miro solamente el balón',
        description: 'Espero el pase sin revisar lo que ocurre alrededor.',
        feedback: 'El balón importa, pero si no miras alrededor puedes descubrir al rival demasiado tarde. Intenta escanear antes del pase.',
        correct: false,
      },
      {
        id: 'call',
        title: 'Pido el balón y me quedo quieto',
        description: 'Aviso a mi compañero, pero no preparo una salida.',
        feedback: 'Comunicar ayuda, pero acompáñalo con una mirada y una posición que te permitan jugar hacia el espacio.',
        correct: false,
      },
    ],
  },
  {
    id: 'touch',
    title: 'Orienta el control',
    prompt: 'Ya viste el espacio a tu derecha. ¿Hacia dónde llevas el primer toque?',
    context: 'El defensor está cerrando el centro; la banda derecha está libre.',
    hint: 'Piensa en tu siguiente acción: el primer toque puede dejarte listo para avanzar, no solo detener el balón.',
    clip: {
      id: 'first-touch-exit',
      label: 'ESCENA 02 · PRIMER TOQUE Y SALIDA',
      duration: '00:06',
      summary: 'Ya recibiste: compara tres controles y elige cómo salir de la presión.',
      description: 'Escena dos: el jugador amarillo ya tiene el balón y aparecen tres opciones de primer toque: avanzar al espacio libre, llevarlo hacia el defensor o detenerlo.',
    },
    options: [
      {
        id: 'space',
        title: 'Hacia el espacio libre',
        description: 'Uso el pie más alejado del rival y quedo listo para avanzar.',
        feedback: '¡Exacto! El control orientado te ayuda a salir de la presión y ganar tiempo para la siguiente acción.',
        correct: true,
      },
      {
        id: 'pressure',
        title: 'Hacia el defensor',
        description: 'Llevo el balón al lugar donde está llegando la presión.',
        feedback: 'Ese toque acerca el balón al rival. Busca el espacio libre y usa el pie más alejado de la presión.',
        correct: false,
      },
      {
        id: 'stop',
        title: 'Debajo de mi cuerpo',
        description: 'Detengo el balón y después miro qué hacer.',
        feedback: 'Puedes proteger el balón si no hay salida, pero aquí el espacio está abierto. Orientar el toque te permite avanzar sin perder tiempo.',
        correct: false,
      },
    ],
  },
];

@Component({
  selector: 'app-ranking-leccion-interactiva',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ranking-leccion-interactiva.component.html',
  styleUrl: './ranking-leccion-interactiva.component.scss',
})
export class RankingLeccionInteractivaComponent {
  readonly pilotWeeks = PILOT_WEEKS;
  readonly pilotRubric = PILOT_RUBRIC;
  readonly pilotRubricLevels = PILOT_RUBRIC_LEVELS;
  readonly stage = signal<'decision' | 'practice' | 'complete'>('decision');
  readonly decisionIndex = signal(0);
  readonly selectedOptionId = signal<string | null>(null);
  readonly clipPlaying = signal(false);
  readonly showHint = signal(false);
  readonly completedDecisions = signal<string[]>([]);

  readonly activeDecision = computed(() => DECISION_STEPS[this.decisionIndex()]);
  readonly selectedOption = computed(() =>
    this.activeDecision().options.find((option) => option.id === this.selectedOptionId()) ?? null,
  );
  readonly decisionNumber = computed(() => this.decisionIndex() + 1);
  readonly progressPercent = computed(() => {
    if (this.stage() === 'complete') return 100;
    if (this.stage() === 'practice') return 82;
    return this.decisionIndex() === 0 ? 28 : 58;
  });
  readonly learningXp = computed(() => this.completedDecisions().length * 10);

  toggleClipPlayback(): void {
    this.clipPlaying.update((playing) => !playing);
  }

  toggleHint(): void {
    this.showHint.update((visible) => !visible);
  }

  chooseOption(optionId: string): void {
    this.selectedOptionId.set(optionId);
    this.showHint.set(false);
  }

  continueLesson(): void {
    const option = this.selectedOption();
    if (!option) return;

    if (option.correct) {
      const decisionId = this.activeDecision().id;
      this.completedDecisions.update((completed) =>
        completed.includes(decisionId) ? completed : [...completed, decisionId],
      );
    }

    this.clipPlaying.set(false);
    this.showHint.set(false);
    this.selectedOptionId.set(null);

    if (this.decisionIndex() < DECISION_STEPS.length - 1) {
      this.decisionIndex.update((index) => index + 1);
      return;
    }

    this.stage.set('practice');
  }

  completeLesson(): void {
    this.stage.set('complete');
    this.clipPlaying.set(false);
  }

  restartLesson(): void {
    this.stage.set('decision');
    this.decisionIndex.set(0);
    this.selectedOptionId.set(null);
    this.clipPlaying.set(false);
    this.showHint.set(false);
    this.completedDecisions.set([]);
  }
}

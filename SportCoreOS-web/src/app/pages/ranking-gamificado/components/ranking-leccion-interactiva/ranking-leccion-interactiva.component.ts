import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type DecisionOption = {
  id: string;
  title: string;
  description: string;
  feedback: string;
  correct: boolean;
};

export type DecisionStep = {
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
    videoUrl?: string;
    videoSource?: 'svg' | 'video' | 'youtube';
  };
  options: DecisionOption[];
};

export type PilotWeek = {
  number: number;
  title: string;
  activity: string;
  evidence: string;
};

export type PilotRubricCriterion = {
  id: string;
  title: string;
  behavior: string;
};

export type TacticalLesson = {
  id: string;
  title: string;
  eyebrow: string;
  subtitle: string;
  ageRange: string;
  category: string;
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  icon: string;
  xpReward: number;
  learningGoal: {
    title: string;
    steps: string[];
  };
  pilotWeeks: PilotWeek[];
  rubricCriteria: PilotRubricCriterion[];
  rubricLevels: string[];
  fieldChallenge: {
    title: string;
    subtitle: string;
    organization: string;
    mission: string;
    coachObservation: string;
    coachFocusSummary: string;
    rubricTitle: string;
    rubricSubtitle: string;
    note: string;
  };
  decisionSteps: DecisionStep[];
};

export const TACTICAL_LESSONS: TacticalLesson[] = [
  {
    id: 'control-orientado',
    title: 'Control orientado para salir de la presión',
    eyebrow: 'AULA TÁCTICA · PILOTO FORMATIVO 01',
    subtitle: 'Una habilidad que se observa, se practica y luego se transfiere al juego.',
    ageRange: '8–12 años · 4 semanas',
    category: 'Fundamento Técnico',
    difficulty: 'Básico',
    icon: 'fa-crosshairs',
    xpReward: 20,
    learningGoal: {
      title: 'Recibir con ventaja',
      steps: ['Mirar antes de recibir', 'Perfilar el cuerpo', 'Orientar el primer toque'],
    },
    pilotWeeks: [
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
    ],
    rubricCriteria: [
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
    ],
    rubricLevels: [
      'Lo intenta con guía',
      'Lo aplica en algunas oportunidades',
      'Lo aplica en el juego sin recordatorio',
    ],
    fieldChallenge: {
      title: 'Reto 3 contra 1: recibe y sal por la puerta libre',
      subtitle: 'Practica con tu equipo. Tu DT observa la técnica; aquí no cuenta quién hace más goles.',
      organization: '3 atacantes · 1 defensor · 2 puertas',
      mission: 'Completa 6 recepciones escaneando antes del pase y llevando el balón al espacio libre.',
      coachObservation: 'Mirada · perfil · control bajo presión graduada.',
      coachFocusSummary: '¿Miró antes de recibir? · ¿Abrió el cuerpo? · ¿Controló hacia el espacio?',
      rubricTitle: 'Qué observa el DT',
      rubricSubtitle: 'Usa las mismas señales en ambos juegos para ver si el jugador las transfiere bajo presión.',
      note: 'Registrar conductas por oportunidad observada, no comparar jugadores ni premiar solo el resultado de la jugada.',
    },
    decisionSteps: [
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
    ],
  },
  {
    id: 'pared-velocidad',
    title: 'La Pared (1-2) y Desmarque al Espacio',
    eyebrow: 'AULA TÁCTICA · JUGADA COLECTIVA 02',
    subtitle: 'Superar la marca individual combinando a un toque con el compañero de apoyo.',
    ageRange: '10–16 años · 3 semanas',
    category: 'Combinación Asociativa',
    difficulty: 'Intermedio',
    icon: 'fa-bolt',
    xpReward: 25,
    learningGoal: {
      title: 'Pared en velocidad',
      steps: ['Fijar al defensor antes de soltar', 'Acelerar sin balón tras el pase', 'Devolución de primera al espacio'],
    },
    pilotWeeks: [
      {
        number: 1,
        title: 'Fijación y timing',
        activity: 'Rondo 2v1: atraer al marcador hasta la distancia justa de entrega.',
        evidence: '¿El pasador compromete la posición del rival antes de descargar?',
      },
      {
        number: 2,
        title: 'Pase y cambio de ritmo',
        activity: 'Pared 1-2 con muñeco o poste: acelerar inmediatamente tras dar el pase.',
        evidence: '¿El jugador arranca sin esperar a ver dónde cae el balón?',
      },
      {
        number: 3,
        title: 'Toque de primera al hueco',
        activity: 'El apoyo asiste a un toque al espacio de carrera del compañero.',
        evidence: '¿La devolución tiene la fuerza y dirección justas para la carrera?',
      },
      {
        number: 4,
        title: 'Transferencia 2v2',
        activity: 'Duelo 2v2 con porterías pequeñas aplicando la pared en juego real.',
        evidence: '¿Reconocen el momento exacto para armar la pared?',
      },
    ],
    rubricCriteria: [
      {
        id: 'attract-defender',
        title: 'Fijación',
        behavior: 'Conduce hacia el defensor para fijarlo antes de descargar el pase.',
      },
      {
        id: 'burst-acceleration',
        title: 'Desmarque',
        behavior: 'Acelera al espacio libre inmediatamente después de dar el pase.',
      },
      {
        id: 'first-touch-return',
        title: 'Precisión del 1-2',
        behavior: 'El apoyo devuelve de primera hacia la carrera sin frenar la jugada.',
      },
    ],
    rubricLevels: [
      'Ejecuta con demora en la carrera',
      'Logra el 1-2 con oposición pasiva',
      'Rompe la marca en velocidad a un toque',
    ],
    fieldChallenge: {
      title: 'Reto 2 contra 1: pared en velocidad y remate',
      subtitle: 'Comunícate con tu apoyo, atrae al defensor y acelera a su espalda para recibir de primera.',
      organization: '2 atacantes · 1 defensor central · 1 portería',
      mission: 'Completa 6 paredes exitosas superando al defensor sin que toque el balón.',
      coachObservation: 'Velocidad de ejecución y distancia de fijación.',
      coachFocusSummary: '¿Fijó al rival? · ¿Aceleró al espacio? · ¿Devolvió de primera?',
      rubricTitle: 'Qué observa el DT',
      rubricSubtitle: 'Evalúa la sincronización entre el pasador que rompe líneas y el apoyo que descarga de primera.',
      note: 'El valor no está en el remate final, sino en la aceleración tras el primer pase.',
    },
    decisionSteps: [
      {
        id: 'wall-approach-step',
        title: 'Momento del primer pase',
        prompt: 'Un defensor sale a presionarte de frente a 3 metros. ¿Cuándo das el pase a tu apoyo?',
        context: 'Tu apoyo está perfilado a 45 grados listo para recibir.',
        hint: 'Si pasas demasiado pronto, el defensor no se compromete. Conduce hasta obligarlo a plantar los pies.',
        clip: {
          id: 'wall-pass-approach',
          label: 'ESCENA 01 · FIJACIÓN Y DESCARGA AL APOYO',
          duration: '00:05',
          summary: 'Conduce hacia el defensor para fijarlo y descarga hacia el compañero libre.',
          description: 'El jugador 10 conduce con balón, el defensa 4 sale a cortar y el delantero 9 ofrece línea de pase a un toque.',
        },
        options: [
          {
            id: 'fijar',
            title: 'Fijo al rival y suelto el pase en el momento justo',
            description: 'Espero a que el rival se comprometa hacia mí antes de descargar.',
            feedback: '¡Perfecto! Fijar al defensor lo saca de balance y le impide girar cuando aceleres.',
            correct: true,
          },
          {
            id: 'apurar',
            title: 'Paso el balón desde muy lejos',
            description: 'Me desprendo de la pelota sin atraer la presión.',
            feedback: 'Si pasas desde lejos, el defensor no se compromete y puede retroceder con facilidad.',
            correct: false,
          },
          {
            id: 'regate',
            title: 'Intento regatear directo al cuerpo del rival',
            description: 'Busco el choque físico en lugar de usar a mi apoyo.',
            feedback: 'El 1-2 busca evitar el choque mediante la velocidad del balón y el desmarque.',
            correct: false,
          },
        ],
      },
      {
        id: 'wall-return-step',
        title: 'El desmarque tras soltar el balón',
        prompt: 'Ya soltaste el balón hacia tu apoyo. ¿Qué haces de inmediato?',
        context: 'El defensor está girando lentamente su torso; la espalda está abierta.',
        hint: 'La clave de la pared no es el primer pase, sino el cambio de ritmo sin balón al espacio.',
        clip: {
          id: 'wall-pass-return',
          label: 'ESCENA 02 · DEVOLUCIÓN DE PRIMERA Y ACELERACIÓN',
          duration: '00:06',
          summary: 'El apoyo toca de primera al espacio vacío; el pasador rompe la espalda del zaguero.',
          description: 'El delantero 9 devuelve de primera hacia el hueco mientras el jugador 10 acelera a espaldas del defensor 4.',
        },
        options: [
          {
            id: 'sprint-space',
            title: 'Acelero al espacio a espaldas del marcador',
            description: 'Cambio de ritmo inmediato hacia el callejón libre para recibir en carrera.',
            feedback: '¡Brillante! El desmarque explosivo deja atrás al defensor y genera un mano a mano.',
            correct: true,
          },
          {
            id: 'frenar',
            title: 'Me freno a observar cómo controla mi compañero',
            description: 'Me quedo parado esperando a ver qué hace el apoyo.',
            feedback: 'Quedarse quieto destruye la ventaja del 1-2. Tu apoyo necesita dar el pase de primera a tu carrera.',
            correct: false,
          },
          {
            id: 'volver',
            title: 'Retrocedo hacia mi campo defensivo',
            description: 'Me alejo de la jugada ofensiva.',
            feedback: 'Retroceder le da tiempo a la defensa para rearmarse.',
            correct: false,
          },
        ],
      },
    ],
  },
  {
    id: 'desmarque-ruptura',
    title: 'Desmarque de Ruptura y Pase Filtrado',
    eyebrow: 'AULA TÁCTICA · ATAQUE AL ESPACIO 03',
    subtitle: 'Sincronizar la diagonal ofensiva al espacio ciego con la visión del pasador.',
    ageRange: '12–18 años · 4 semanas',
    category: 'Ataque al Espacio',
    difficulty: 'Avanzado',
    icon: 'fa-location-arrow',
    xpReward: 25,
    learningGoal: {
      title: 'Desmarque de ruptura',
      steps: ['Temporizar la carrera con el pasador', 'Atacar el punto ciego del central', 'Control orientado hacia el arco'],
    },
    pilotWeeks: [
      {
        number: 1,
        title: 'Lectura de la línea defensiva',
        activity: 'Identificar la altura de la zaga rival y la línea del fuera de juego.',
        evidence: '¿El delantero evita caer en offside antes del pase?',
      },
      {
        number: 2,
        title: 'Momento de partida (Timing)',
        activity: 'Coordinar el arranque en el instante exacto en que el volante arma la pierna.',
        evidence: '¿Inicia el sprint cuando el pasador tiene vista libre y pie armado?',
      },
      {
        number: 3,
        title: 'Trayectoria en diagonal',
        activity: 'Trazar diagonales de afuera hacia adentro al punto ciego del marcador.',
        evidence: '¿El central rival pierde de vista al atacante?',
      },
      {
        number: 4,
        title: 'Juego 3v2 + Portero',
        activity: 'Filtraciones entre centrales con definición rápida.',
        evidence: '¿Se logran remates sin que la defensa intercepte el pase filtrado?',
      },
    ],
    rubricCriteria: [
      {
        id: 'timing-rupture',
        title: 'Timing de carrera',
        behavior: 'Inicia el desmarque justo cuando el poseedor arma el pase, sin caer en offside.',
      },
      {
        id: 'blind-spot-route',
        title: 'Punto ciego',
        behavior: 'Ataca la espalda del zaguero por su lado débil donde no puede ver balón y rival.',
      },
      {
        id: 'first-touch-finish',
        title: 'Definición en velocidad',
        behavior: 'Controla hacia adelante o remata al primer toque sin frenar el impulso.',
      },
    ],
    rubricLevels: [
      'Arranca antes de tiempo (offside recurrente)',
      'Rompe bien pero con trayectoria muy abierta',
      'Sincronización milimétrica y ataque al punto ciego',
    ],
    fieldChallenge: {
      title: 'Reto 3 contra 2: pase filtrado y remate al primer toque',
      subtitle: 'El volante temporiza, el extremo amaga al pie y rompe en diagonal a la espalda del central.',
      organization: '3 atacantes · 2 centrales · 1 arquero',
      mission: 'Completa 5 asistencias filtradas a la carrera sin cometer fuera de juego.',
      coachObservation: 'Sincronización pasador-receptor y línea de fuera de juego.',
      coachFocusSummary: '¿Cabeza levantada del pasador? · ¿Diagonal al punto ciego? · ¿Remate rápido?',
      rubricTitle: 'Qué observa el DT',
      rubricSubtitle: 'Mide la capacidad de esperar el momento del pase antes de traspasar la línea de la zaga.',
      note: 'La clave táctica es no correr en línea recta sino en diagonal.',
    },
    decisionSteps: [
      {
        id: 'rupture-timing-step',
        title: 'Temporización y línea de fuera de juego',
        prompt: 'La defensa rival adelanta su bloque. ¿En qué momento exacto inicias tu carrera de ruptura?',
        context: 'Tu volante organizador está controlando el balón y levantando la cabeza.',
        hint: 'Si picas antes de que arme el pase, quedarás en offside. Espera a que arme la pierna.',
        clip: {
          id: 'rupture-timing',
          label: 'ESCENA 01 · SINCRONIZACIÓN Y ARMADO DE CARRERA',
          duration: '00:05',
          summary: 'El volante levanta la mirada; el atacante aguanta la línea y arranca en diagonal.',
          description: 'El volante 8 levanta la mirada con balón dominado; el atacante 11 aguanta la línea defensiva antes de acelerar.',
        },
        options: [
          {
            id: 'tempo-headup',
            title: 'Arranco en diagonal cuando el pasador arma la pierna',
            description: 'Sincronizo mi aceleración con el gesto técnico del pasador para no caer en offside.',
            feedback: '¡Gran sincronización! Partir en el momento exacto te permite llegar en máxima velocidad sin fuera de juego.',
            correct: true,
          },
          {
            id: 'early-sprint',
            title: 'Pico en línea recta antes de que el pasador controle',
            description: 'Salgo a máxima velocidad apenas mi equipo recupera.',
            feedback: 'Arrancar a ciegas te deja en fuera de juego antes de que el pasador pueda soltar la pelota.',
            correct: false,
          },
          {
            id: 'wait-static',
            title: 'Me quedo esperando parado en el centro',
            description: 'Pido el balón al pie contra los centrales.',
            feedback: 'Esperar parado facilita la anticipación de los centrales rivales.',
            correct: false,
          },
        ],
      },
      {
        id: 'rupture-trajectory-step',
        title: 'Trayectoria de ataque al espacio',
        prompt: 'El pase filtrado viaja al callejón entre central y lateral. ¿Cómo defines tu trayectoria?',
        context: 'El central está perfilado hacia el balón; su espalda derecha está desprotegida.',
        hint: 'El central no puede mirar dos cosas a la vez: ataca su punto ciego.',
        clip: {
          id: 'rupture-finish',
          label: 'ESCENA 02 · PENETRACIÓN AL PUNTO CIEGO Y REMATE',
          duration: '00:06',
          summary: 'La diagonal corta por detrás del central rival hacia el corazón del área.',
          description: 'El atacante 11 penetra a la espalda del central 4 recibiendo el balón filtrado directo a zona de gol.',
        },
        options: [
          {
            id: 'blind-spot',
            title: 'Gano la espalda por el punto ciego del central rival',
            description: 'Corro por detrás de su hombro para que pierda mi referencia visual.',
            feedback: '¡Impecable! Correr por el punto ciego impide que el zaguero pueda interceptar a tiempo.',
            correct: true,
          },
          {
            id: 'front-body',
            title: 'Corro pegado de frente al pecho del central',
            description: 'Busco forcejear hombro a hombro.',
            feedback: 'El central usará su corpulencia para frenarte legalmente.',
            correct: false,
          },
          {
            id: 'wide-out',
            title: 'Me abro pegado al córner lejos del arco',
            description: 'Me voy a la esquina para evitar el contacto.',
            feedback: 'Alejarse del área diluye la ocasión de gol.',
            correct: false,
          },
        ],
      },
    ],
  },
  {
    id: 'salida-balon',
    title: 'Salida Limpia de Balón (Salida Lavolpiana)',
    eyebrow: 'AULA TÁCTICA · FASE DE INICIACIÓN 04',
    subtitle: 'Generar superioridad numérica 3v2 incrustando al mediocentro entre los centrales abiertos.',
    ageRange: '12–18 años · 4 semanas',
    category: 'Iniciación de Juego',
    difficulty: 'Avanzado',
    icon: 'fa-shield-halved',
    xpReward: 30,
    learningGoal: {
      title: 'Salida Lavolpiana',
      steps: ['Abrir centrales a las bandas', 'Incrustar pivote defensivo', 'Buscar tercer hombre en lateral'],
    },
    pilotWeeks: [
      {
        number: 1,
        title: 'Geometría y amplitud',
        activity: 'Centrales van al borde del área grande; laterales avanzan a mediocampo.',
        evidence: '¿El equipo ocupa todo el ancho de cancha en saque de meta?',
      },
      {
        number: 2,
        title: 'Descenso del pivote',
        activity: 'El mediocentro defensivo desciende entre centrales formando una línea de 3.',
        evidence: '¿Se genera la superioridad 3v2 frente a los dos delanteros rivales?',
      },
      {
        number: 3,
        title: 'Concepto de Tercer Hombre',
        activity: 'Atraer con pivote para que el lateral libre reciba de cara hacia el frente.',
        evidence: '¿El pase encuentra al jugador libre sin rifar la posesión?',
      },
      {
        number: 4,
        title: 'Juego condicionado 5v4 en zona 1',
        activity: 'Superar la primera línea de presión en menos de 12 segundos hacia zona 2.',
        evidence: '¿Se logra la salida limpia sin recurrir a pelotazos divididos?',
      },
    ],
    rubricCriteria: [
      {
        id: 'positioning-width',
        title: 'Amplitud de inicio',
        behavior: 'Centrales se abren a los costados y el arquero actúa como apoyo activo.',
      },
      {
        id: 'pivot-drop',
        title: 'Incrustación del 5',
        behavior: 'El pivote baja a la línea de centrales para crear la superioridad 3v2.',
      },
      {
        id: 'third-man-concept',
        title: 'Tercer hombre',
        behavior: 'Usa un pase de atracción intermedio para habilitar al lateral libre.',
      },
    ],
    rubricLevels: [
      'Inicia con centrales muy juntos facilitando la presión',
      'Forma la línea de 3 pero con pases lentos y previsibles',
      'Salida fluida conectando con el tercer hombre en ventaja',
    ],
    fieldChallenge: {
      title: 'Reto 4 + Arquero vs 3 atacantes: salida limpia a zona 2',
      subtitle: 'Inicia desde el arquero, incrusta al 5, atrae la presión y conecta con el lateral avanzado.',
      organization: 'Arquero + 2 centrales + 1 pivote + 2 laterales vs 3 rivales en presión',
      mission: 'Logra 6 salidas consecutivas cruzando la línea de mediocampo con balón dominado.',
      coachObservation: 'Paciencia en la circulación y ubicación espacial del pivote.',
      coachFocusSummary: '¿Línea de 3 amplia? · ¿Arquero participa con los pies? · ¿Lateral libre?',
      rubricTitle: 'Qué observa el DT',
      rubricSubtitle: 'Comprueba si los defensores toman decisiones con calma bajo acoso rival.',
      note: 'El error en salida es parte del aprendizaje: corregir la posición, no castigar el fallo.',
    },
    decisionSteps: [
      {
        id: 'lavolpe-shape-step',
        title: 'Ocupación de espacios en salida',
        prompt: 'El rival presiona con 2 delanteros sobre nuestros 2 centrales. ¿Cómo nos posicionamos?',
        context: 'El arquero tiene el balón en los pies; la presión rival tapa el pase frontal directo.',
        hint: 'Para quebrar una presión de 2 rivales, necesitas formar una línea de 3 jugadores con el pivote.',
        clip: {
          id: 'lavolpiana-shape',
          label: 'ESCENA 01 · GENERACIÓN DE SUPERIORIDAD 3v2',
          duration: '00:05',
          summary: 'Centrales se abren a la línea de cal; el pivote 5 desciende al centro del área.',
          description: 'El arquero 1 apoya con los pies, el central 2 y 3 se abren ampliamente y el pivote 5 baja a formar la línea de tres.',
        },
        options: [
          {
            id: 'lavolpe-drop',
            title: 'El pivote (5) se incrusta entre centrales y los laterales suben',
            description: 'Generamos superioridad 3v2 en primera línea y estiramos el campo con laterales altos.',
            feedback: '¡Excelente estructura táctica! Los 2 delanteros rivales no pueden presionar a 3 defensores a la vez.',
            correct: true,
          },
          {
            id: 'kick-forward',
            title: 'El arquero lanza un pelotazo dividido al aire',
            description: 'Despejamos el balón hacia adelante a ver quién lo gana.',
            feedback: 'Dividir el balón regala el 50% de la posesión sin ninguna ventaja táctica construida.',
            correct: false,
          },
          {
            id: 'close-in',
            title: 'Todos los mediocampistas bajan juntos al área chica',
            description: 'Nos amontonamos cerca del arquero para pedir la pelota.',
            feedback: 'Amontonar jugadores atrae más presión rival y destruye los espacios para salir jugando.',
            correct: false,
          },
        ],
      },
      {
        id: 'lavolpe-exit-step',
        title: 'Romper la primera línea de presión',
        prompt: 'Un delantero rival va sobre el central derecho y el otro tapa al arquero. ¿Cuál es el pase limpio?',
        context: 'El pivote está ubicado en el centro y el lateral derecho está desmarcado por la banda.',
        hint: 'Aplica el principio del tercer hombre: juega con el pivote para que este libere al lateral.',
        clip: {
          id: 'lavolpiana-exit',
          label: 'ESCENA 02 · SALIDA LIMPIA POR TERCER HOMBRE',
          duration: '00:06',
          summary: 'Pase al pivote que descarga al lateral lanzado; superada la primera línea rival.',
          description: 'El central 2 toca al pivote 5 quien de primera habilita al lateral 4 libre por la banda derecha.',
        },
        options: [
          {
            id: 'third-man-pass',
            title: 'Pivote atrae y descarga hacia el lateral libre (Tercer hombre)',
            description: 'Atraemos a los delanteros al centro para habilitar la banda descubierta.',
            feedback: '¡Doctrina táctica pura! Romper la presión por tercer hombre permite salir al contragolpe con ventaja.',
            correct: true,
          },
          {
            id: 'central-force',
            title: 'Intentar filtrar un pase forzado entre las piernas del delantero',
            description: 'Pase raso de alto riesgo por el medio del área.',
            feedback: 'Un error en ese pase frontal te deja con el delantero rival mano a mano contra el arquero.',
            correct: false,
          },
          {
            id: 'clear-line',
            title: 'Patear el balón al saque lateral',
            description: 'Regalar el saque de banda para no arriesgar.',
            feedback: 'Regalar el saque de banda frena la construcción ofensiva de tu equipo.',
            correct: false,
          },
        ],
      },
    ],
  },
  {
    id: 'presion-perdida',
    title: 'Presión Alta tras Pérdida (Gegenpressing)',
    eyebrow: 'AULA TÁCTICA · TRANSICIÓN DEFENSIVA 05',
    subtitle: 'Acosar en bloque durante los primeros 5 segundos tras perder la posesión en campo rival.',
    ageRange: '12–18 años · 3 semanas',
    category: 'Transición Defensiva',
    difficulty: 'Avanzado',
    icon: 'fa-arrows-to-circle',
    xpReward: 30,
    learningGoal: {
      title: 'Presión tras pérdida',
      steps: ['Reaccionar en menos de 3 segundos', 'Cerrar líneas de pase en embudo', 'Recuperar o forzar despeje'],
    },
    pilotWeeks: [
      {
        number: 1,
        title: 'El chip de cambio de actitud',
        activity: 'Pasar instantáneamente de atacante a defensor al momento exacto de la pérdida.',
        evidence: '¿El jugador acosa sin lamentarse ni perder segundos?',
      },
      {
        number: 2,
        title: 'Acoso en jauría (2-3 jugadores)',
        activity: 'El jugador más cercano tapa el giro; los dos siguientes cortan apoyos inmediatos.',
        evidence: '¿Se forma un triángulo de presión alrededor del poseedor rival?',
      },
      {
        number: 3,
        title: 'Regla de los 5 segundos',
        activity: 'Recuperar antes de que el rival pueda armar la transición ofensiva.',
        evidence: '¿Se recupera la pelota en campo contrario en menos de 5 segundos?',
      },
      {
        number: 4,
        title: 'Juego reducido 5v5 con porterías',
        activity: 'Puntuación doble si el gol se produce tras robo en campo contrario.',
        evidence: '¿El equipo convierte las recuperaciones altas en ocasiones claras?',
      },
    ],
    rubricCriteria: [
      {
        id: 'reaction-speed',
        title: 'Tiempo de reacción',
        behavior: 'Inicia el acoso de inmediato sin dudar ni reclamar faltas.',
      },
      {
        id: 'closing-funnel',
        title: 'Cierre de líneas',
        behavior: 'Tapa los pases hacia adelante obligando al rival a rifar el balón.',
      },
      {
        id: 'collective-compactness',
        title: 'Bloque corto',
        behavior: 'La línea defensiva da un paso adelante para achicar la distancia entre líneas.',
      },
    ],
    rubricLevels: [
      'Se frena y vuelve caminando permitiendo el contragolpe',
      'Presiona solo sin apoyo coordinado de los compañeros',
      'Asfixia colectiva coordinada y recuperación en campo rival',
    ],
    fieldChallenge: {
      title: 'Reto 4 contra 4 + 2 comodines: recuperación relámpago',
      subtitle: 'Al perder el balón, los 4 atacantes tienen 5 segundos para recuperarlo antes de que el rival pase.',
      organization: 'Espacio reducido 25x20m · 2 equipos de 4 · cronómetro de 5s',
      mission: 'Logra 6 recuperaciones antes de que el rival complete 3 toques consecutivos.',
      coachObservation: 'Intensidad en la primera línea de presión y anticipación.',
      coachFocusSummary: '¿Reacción inmediata? · ¿Corte de línea de pase? · ¿Recuperación en 5 segundos?',
      rubricTitle: 'Qué observa el DT',
      rubricSubtitle: 'Mide la agresividad positiva y el compromiso defensivo colectivo.',
      note: 'Presionar no es hacer falta: es quitar tiempo y espacio al poseedor.',
    },
    decisionSteps: [
      {
        id: 'press-reaction-step',
        title: 'Reacción en los primeros 3 segundos',
        prompt: 'Acabamos de perder el balón en tres cuartos de cancha rival. ¿Cuál es la primera orden?',
        context: 'El rival acaba de interceptar el pase y aún está orientando su cuerpo hacia su arco.',
        hint: 'El rival es más vulnerable justo cuando recupera la pelota: no ha levantado la cabeza.',
        clip: {
          id: 'press-trap',
          label: 'ESCENA 01 · ASFIXIA INMEDIATA SOBRE POSEEDOR',
          duration: '00:05',
          summary: 'Los 3 atacantes más cercanos acosan en embudo al recuperador rival.',
          description: 'El atacante 9 y el extremo 11 cierran en pinza al rival 6 impidiéndole girar hacia el campo contrario.',
        },
        options: [
          {
            id: 'swarm-ball',
            title: 'Los jugadores más cercanos acosan inmediatamente al poseedor',
            description: 'Aprovechamos que el rival está de espaldas y no sabe dónde jugar.',
            feedback: '¡Regla de oro del Gegenpressing! Asfixiar al poseedor en los primeros 3 segundos provoca pérdidas inmediatas.',
            correct: true,
          },
          {
            id: 'drop-back',
            title: 'Todos los atacantes corren hacia nuestra propia área',
            description: 'Retrocedemos 50 metros a refugiarnos.',
            feedback: 'Ceder toda la cancha le da al rival tiempo y espacio para armar un contragolpe letal.',
            correct: false,
          },
          {
            id: 'foul-hard',
            title: 'Cometer una falta fuerte para cortar',
            description: 'Taclear al rival sin intentar quitar limpiamente el balón.',
            feedback: 'Genera tarjetas amarillas innecesarias y frena la posibilidad de robar y anotar.',
            correct: false,
          },
        ],
      },
      {
        id: 'press-cover-step',
        title: 'Cierre de líneas de pase y anticipación',
        prompt: 'Un compañero ya está tapando el remate directo del poseedor. ¿Qué hace el segundo jugador?',
        context: 'El poseedor busca desesperadamente a su mediocentro libre para descargar.',
        hint: 'No todos van a la pelota: el segundo jugador debe anticipar la línea de pase más lógica.',
        clip: {
          id: 'press-recover',
          label: 'ESCENA 02 · CORTE DE PASE Y RECUPERACIÓN',
          duration: '00:06',
          summary: 'El segundo jugador intercepta el pase forzado del rival y queda de cara al gol.',
          description: 'El jugador 8 lee la trayectoria del pase forzado, anticipa al volante rival y recupera a 20 metros del arco.',
        },
        options: [
          {
            id: 'intercept-lanes',
            title: 'Tapa la línea de pase al apoyo más cercano y anticipa',
            description: 'Leo hacia dónde forzará el pase el poseedor y corto la trayectoria.',
            feedback: '¡Asfixia perfecta! Forzar el pase defectuoso te permite recuperar el balón a metros del arco rival.',
            correct: true,
          },
          {
            id: 'ball-watcher',
            title: 'Se queda mirando la disputa sin moverse',
            description: 'Observo pasivamente el duelo 1v1.',
            feedback: 'Si no cortas la línea de escape, el rival encontrará un pase fácil y romperá la presión.',
            correct: false,
          },
          {
            id: 'retreat-alone',
            title: 'Se desentiende de la jugada',
            description: 'Da media vuelta y camina.',
            feedback: 'La presión solo funciona si todo el bloque se mueve en sincronía.',
            correct: false,
          },
        ],
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
  readonly tacticalLessons = TACTICAL_LESSONS;
  readonly selectedLessonId = signal<string>('control-orientado');

  readonly activeLesson = computed(() => {
    return this.tacticalLessons.find((l) => l.id === this.selectedLessonId()) ?? this.tacticalLessons[0];
  });

  readonly pilotWeeks = computed(() => this.activeLesson().pilotWeeks);
  readonly pilotRubric = computed(() => this.activeLesson().rubricCriteria);
  readonly pilotRubricLevels = computed(() => this.activeLesson().rubricLevels);

  readonly stage = signal<'decision' | 'practice' | 'complete'>('decision');
  readonly decisionIndex = signal(0);
  readonly selectedOptionId = signal<string | null>(null);
  readonly clipPlaying = signal(false);
  readonly showHint = signal(false);
  readonly completedDecisions = signal<string[]>([]);

  readonly activeDecision = computed(() => this.activeLesson().decisionSteps[this.decisionIndex()]);
  readonly selectedOption = computed(() =>
    this.activeDecision().options.find((option) => option.id === this.selectedOptionId()) ?? null,
  );
  readonly decisionNumber = computed(() => this.decisionIndex() + 1);
  readonly progressPercent = computed(() => {
    if (this.stage() === 'complete') return 100;
    if (this.stage() === 'practice') return 82;
    return this.decisionIndex() === 0 ? 28 : 58;
  });

  readonly learningXp = computed(() => {
    const totalSteps = this.activeLesson().decisionSteps.length || 1;
    const baseReward = this.activeLesson().xpReward;
    return Math.round((this.completedDecisions().length / totalSteps) * baseReward);
  });

  selectLesson(lessonId: string): void {
    if (this.selectedLessonId() === lessonId) return;
    this.selectedLessonId.set(lessonId);
    this.stage.set('decision');
    this.decisionIndex.set(0);
    this.selectedOptionId.set(null);
    this.clipPlaying.set(false);
    this.showHint.set(false);
    this.completedDecisions.set([]);
  }

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

    if (this.decisionIndex() < this.activeLesson().decisionSteps.length - 1) {
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

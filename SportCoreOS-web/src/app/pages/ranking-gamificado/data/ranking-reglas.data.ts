export interface ReglaEconomiaXP {
  id: string;
  titulo: string;
  descripcion: string;
  xpBadge: string;
  icono: string;
  tipo: 'gain' | 'penalty';
}

export const REGLAS_ECONOMIA_XP: ReglaEconomiaXP[] = [
  {
    id: 'asistencia',
    titulo: 'Asistencia a Entrenamiento',
    descripcion: 'Presentarse a tiempo y completar la sesión oficial con el Director Técnico.',
    xpBadge: '+50 XP',
    icono: 'fa-solid fa-calendar-check',
    tipo: 'gain',
  },
  {
    id: 'destacado',
    titulo: 'Jugador Destacado de la Sesión',
    descripcion: 'Bonificación por máxima intensidad, actitud y liderazgo en cancha otorgado por el DT.',
    xpBadge: '+100 XP Extra',
    icono: 'fa-solid fa-bolt',
    tipo: 'gain',
  },
  {
    id: 'inasistencia',
    titulo: 'Inasistencia Sin Justificación',
    descripcion: 'Faltar al entrenamiento sin excusa médica o académica previa avalada.',
    xpBadge: '-30 XP Descuento',
    icono: 'fa-solid fa-circle-xmark',
    tipo: 'penalty',
  },
  {
    id: 'minijuegos',
    titulo: 'Ronda Táctica & Minijuegos',
    descripcion: 'Acertar situaciones de juego en el Modo Carrera y desafíos de definición.',
    xpBadge: '+40 a +150 XP',
    icono: 'fa-solid fa-chess',
    tipo: 'gain',
  },
];

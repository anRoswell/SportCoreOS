export enum ScoutingEstadoPipeline {
  TODOS = 'TODOS',
  EN_OBSERVACION = 'en_observacion',
  INTERES_FICHAJE = 'interes_fichaje',
  FICHADO = 'fichado',
  DESCARTADO = 'descartado',
}

export enum ScoutingPosicionFiltro {
  TODAS = 'TODAS',
  PORTERO = 'portero',
  DEFENSA = 'defensa',
  MEDIOCAMPISTA = 'mediocampista',
  DELANTERO = 'delantero',
}

export interface ProspectoItem {
  id?: string;
  nombres: string;
  apellidos: string;
  nombres_apellidos?: string;
  fecha_nacimiento?: string;
  posicion_principal?: string;
  pierna_habil?: string;
  club_origen?: string;
  ciudad?: string;
  telefono_contacto?: string;
  foto_url?: string;
  estado_pipeline: ScoutingEstadoPipeline | string;
  promedio_tecnico?: string | number;
  valoracion_general?: string | number;
  documento_adjunto_url?: string;
}

export interface ProspectoFormData {
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  posicion_principal: string;
  pierna_habil: string;
  club_origen: string;
  ciudad: string;
  telefono_contacto: string;
}

export interface RubricaFormData {
  nota_tecnica: number;
  nota_tactica: number;
  nota_fisica: number;
  nota_mental: number;
  comentarios: string;
}

export const SCOUTING_ESTADO_OPTIONS = [
  { value: ScoutingEstadoPipeline.TODOS, label: 'Todos los Estados' },
  { value: ScoutingEstadoPipeline.EN_OBSERVACION, label: 'En Observación' },
  { value: ScoutingEstadoPipeline.INTERES_FICHAJE, label: 'Interés de Fichaje' },
  { value: ScoutingEstadoPipeline.FICHADO, label: 'Fichado' },
  { value: ScoutingEstadoPipeline.DESCARTADO, label: 'Descartado' },
];

export const SCOUTING_POSICION_OPTIONS = [
  { value: ScoutingPosicionFiltro.TODAS, label: 'Todas las Posiciones' },
  { value: ScoutingPosicionFiltro.PORTERO, label: 'Portero (POR)' },
  { value: ScoutingPosicionFiltro.DEFENSA, label: 'Defensa (DEF)' },
  { value: ScoutingPosicionFiltro.MEDIOCAMPISTA, label: 'Mediocampista (MED)' },
  { value: ScoutingPosicionFiltro.DELANTERO, label: 'Delantero (DEL)' },
];

export function formatPosicionScouting(pos: string | undefined): string {
  if (!pos) return 'DEL';
  const p = pos.toLowerCase();
  if (p.includes('portero') || p.includes('arquero') || p.includes('por')) return 'POR';
  if (p.includes('defensa') || p.includes('lateral') || p.includes('central') || p.includes('def')) return 'DEF';
  if (p.includes('medio') || p.includes('volante') || p.includes('med')) return 'MED';
  if (p.includes('delantero') || p.includes('extremo') || p.includes('punta') || p.includes('del')) return 'DEL';
  return pos.toUpperCase().substring(0, 3);
}

export function formatEstadoPipelineScouting(estado: string | undefined): string {
  switch (estado) {
    case ScoutingEstadoPipeline.EN_OBSERVACION: return 'En Observación';
    case ScoutingEstadoPipeline.INTERES_FICHAJE: return 'Interés Fichaje';
    case ScoutingEstadoPipeline.FICHADO: return 'Fichado';
    case ScoutingEstadoPipeline.DESCARTADO: return 'Descartado';
    default: return estado || 'En Observación';
  }
}

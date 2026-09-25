import { RolConvocatoria, EstadoConfirmacionConvocatoria } from '../../../core/enums/domain.enums';

export enum PosterThemeConvocatoria {
  EMERALD = 'emerald',
  DARK_GOLD = 'dark-gold',
  CYBER_BLUE = 'cyber-blue',
  FUTURISTIC_RED = 'futuristic-red',
}

export interface ConvocadoItem {
  id?: string;
  jugador_id: string;
  nombres: string;
  apellidos: string;
  numero_dorsal?: number | string;
  posicion_principal?: string;
  posicion_designada?: string;
  rol_convocatoria: RolConvocatoria | string;
  estado_confirmacion: EstadoConfirmacionConvocatoria | string;
  foto_url?: string;
  telefono_acudiente?: string;
}

export interface PartidoConvocatoria {
  id: string;
  categoria_id?: string;
  categoria_nombre?: string;
  fecha_partido?: string;
  hora_partido?: string;
  hora_citacion?: string;
  rival_nombre?: string;
  sede_cancha?: string;
  condicion_juego?: 'LOCAL' | 'VISITANTE' | string;
  ubicacion_gps?: string;
}

export const POSTER_THEME_OPTIONS = [
  { value: PosterThemeConvocatoria.EMERALD, label: '🟢 Esmeralda Élite (Oficial Club)' },
  { value: PosterThemeConvocatoria.DARK_GOLD, label: '🟡 Negro & Oro Matchday' },
  { value: PosterThemeConvocatoria.CYBER_BLUE, label: '🔵 Azul Victoria Eléctrico' },
  { value: PosterThemeConvocatoria.FUTURISTIC_RED, label: '🔴 Rojo Furia Competitiva' },
];

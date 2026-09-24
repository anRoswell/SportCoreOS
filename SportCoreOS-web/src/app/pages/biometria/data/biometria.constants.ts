import { BiometriaDiagnosticoFiltro, BiometriaSortBy } from '../../../core/enums/domain.enums';

export interface BiometriaFilterOption {
  id: string;
  label: string;
}

export const BIOMETRIA_DIAGNOSTICO_OPTIONS: { id: BiometriaDiagnosticoFiltro; label: string }[] = [
  { id: BiometriaDiagnosticoFiltro.TODOS, label: '⚡ Todos los Diagnósticos' },
  { id: BiometriaDiagnosticoFiltro.SOBRESALIENTE, label: '🌟 Sobresaliente (Cooper ≥ 2800m)' },
  { id: BiometriaDiagnosticoFiltro.OPTIMO, label: '✅ Óptimo (Cooper ≥ 2400m)' },
  { id: BiometriaDiagnosticoFiltro.DESARROLLO, label: '📈 En Desarrollo (Cooper < 2400m)' },
];

export const BIOMETRIA_SORT_OPTIONS: { id: BiometriaSortBy; label: string }[] = [
  { id: BiometriaSortBy.FECHA_DESC, label: '📅 Más Recientes Primero' },
  { id: BiometriaSortBy.FECHA_ASC, label: '📅 Más Antiguas Primero' },
  { id: BiometriaSortBy.COOPER_DESC, label: '🏃 Mayor Test Cooper' },
  { id: BiometriaSortBy.SALTO_DESC, label: '🦘 Mayor Salto Vertical' },
  { id: BiometriaSortBy.TALLA_DESC, label: '📏 Mayor Estatura' },
  { id: BiometriaSortBy.IMC_ASC, label: '⚖️ Menor IMC' },
];

export const BIOMETRIA_PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

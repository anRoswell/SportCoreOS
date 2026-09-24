import {
  RangoImcClasificacion,
  RangoImcCssClass,
  BiometriaDiagnosticoTipo,
  BiometriaDiagnosticoLabel,
} from '../../../core/enums/domain.enums';

export interface EvaluacionBiometrica {
  id: string;
  jugador_id: string;
  evaluador_id?: string;
  fecha_evaluacion: string;
  peso_kg: number;
  talla_cm: number;
  imc: string;
  test_cooper_metros?: number;
  velocidad_30m_seg?: number;
  salto_vertical_cm?: number;
  observaciones?: string;
  jugador_nombre: string;
  numero_dorsal?: number;
  posicion_principal?: string;
  categoria_id?: string;
  categoria_nombre?: string;
  codigo_categoria?: string;
  color_distintivo?: string;
  avatar_url?: string;
}

export interface DiagnosticoBiometrico {
  label: BiometriaDiagnosticoLabel;
  tipo: BiometriaDiagnosticoTipo;
}

/**
 * Calcula el diagnóstico de rendimiento según Test de Cooper e IMC
 */
export function calcularDiagnosticoBiometrico(b: Partial<EvaluacionBiometrica> | null | undefined): DiagnosticoBiometrico {
  if (!b) return { label: BiometriaDiagnosticoLabel.DESARROLLO, tipo: BiometriaDiagnosticoTipo.WARNING };
  const imc = parseFloat(b.imc || '0');
  const cooper = parseInt(String(b.test_cooper_metros || '0'), 10);

  if (cooper >= 2800 || (imc >= 19 && imc <= 22)) {
    return { label: BiometriaDiagnosticoLabel.SOBRESALIENTE, tipo: BiometriaDiagnosticoTipo.SUCCESS };
  } else if (cooper >= 2400 || (imc >= 18 && imc <= 24)) {
    return { label: BiometriaDiagnosticoLabel.OPTIMO, tipo: BiometriaDiagnosticoTipo.BLUE };
  }
  return { label: BiometriaDiagnosticoLabel.DESARROLLO, tipo: BiometriaDiagnosticoTipo.WARNING };
}

/**
 * Obtiene la etiqueta amigable de IMC
 */
export function obtenerEtiquetaImc(imcVal: string | number | null | undefined): string {
  const num = typeof imcVal === 'number' ? imcVal : parseFloat(String(imcVal || ''));
  if (isNaN(num) || num <= 0) return '-';
  if (num < 18.5) return RangoImcClasificacion.BAJO_PESO;
  if (num <= 24.9) return RangoImcClasificacion.PESO_NORMAL;
  if (num <= 29.9) return RangoImcClasificacion.SOBREPESO;
  return RangoImcClasificacion.OBESIDAD;
}

/**
 * Obtiene la clase CSS para el badge de IMC
 */
export function obtenerClaseImc(imcVal: string | number | null | undefined): string {
  const num = typeof imcVal === 'number' ? imcVal : parseFloat(String(imcVal || ''));
  if (isNaN(num) || num <= 0) return '';
  if (num < 18.5) return RangoImcCssClass.IMC_BAJO;
  if (num <= 24.9) return RangoImcCssClass.IMC_NORMAL;
  return RangoImcCssClass.IMC_SOBREPESO;
}

/**
 * Calcula el valor numérico de IMC
 */
export function calcularValorImc(pesoKg: number, tallaCm: number): string {
  if (pesoKg > 0 && tallaCm > 0) {
    const m = tallaCm / 100;
    return (pesoKg / (m * m)).toFixed(1);
  }
  return '-';
}

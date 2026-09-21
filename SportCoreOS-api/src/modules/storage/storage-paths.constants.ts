export const UPLOAD_MODULES = {
  JUGADORES: 'jugadores',
  CLUBES: 'clubes',
  TIENDA: 'tienda',
  SCOUTING: 'scouting',
  TELEMETRIA: 'telemetria',
  FINANZAS: 'finanzas',
  AVATARS: 'avatars',
  DOCUMENTOS: 'documentos',
  GENERAL: 'general',
} as const;

export type UploadModuleType = (typeof UPLOAD_MODULES)[keyof typeof UPLOAD_MODULES];

export type UploadOrigin = 'web' | 'movil';

/**
 * Genera la ruta estructurada para almacenar archivos físicos siguiendo el estándar:
 * /uploads/clubes/[clubId]/[modulo]/[anio]/[mes]/[dia]/
 */
export const generateUploadPath = (
  clubId: string,
  modulo: string,
  origen: UploadOrigin = 'web',
): string => {
  const date = new Date();
  const anio = String(date.getFullYear());
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');

  return `clubes/${clubId}/${origen}/${modulo}/${anio}/${mes}/${dia}`;
};

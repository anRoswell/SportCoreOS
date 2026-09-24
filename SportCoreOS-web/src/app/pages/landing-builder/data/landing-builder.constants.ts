import { TipoBloqueLanding, TipoContenidoLandingEnum } from '../../../core/enums/domain.enums';
import { TipoContenidoLanding, TipoBloqueSeccion } from '../../../core/services/api.service';

export interface ColorPreset {
  name: string;
  color: string;
  gradient: string;
}

export const LANDING_COLOR_PRESETS: ColorPreset[] = [
  { name: 'Esmeralda Pro', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  { name: 'Azul Élite', color: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' },
  { name: 'Oro Champions', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' },
  { name: 'Carmesí Furia', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' },
  { name: 'Púrpura VIP', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' },
  { name: 'Cian High-Tech', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0e7490 100%)' },
];

export const LANDING_CONTENT_TYPES: { id: TipoContenidoLanding; label: string; icon: string; desc: string }[] = [
  { id: TipoContenidoLandingEnum.LANDING_PAGE, label: 'Landing Page Completa', icon: 'fa-solid fa-globe', desc: 'Página web completa de captación con múltiples secciones y formulario' },
  { id: TipoContenidoLandingEnum.PROMO_HERO, label: 'Promo Hero Banner', icon: 'fa-solid fa-wand-magic-sparkles', desc: 'Experiencia visual enfocada en 1 oferta con CTA principal' },
  { id: TipoContenidoLandingEnum.STORIES_REEL, label: 'Historias / Reels', icon: 'fa-solid fa-mobile-screen', desc: 'Formato vertical interactivo para engagement móvil' },
  { id: TipoContenidoLandingEnum.BANNER_TOP, label: 'Banner Superior Flotante', icon: 'fa-solid fa-bullhorn', desc: 'Barra de anuncios con contador y botón de acción' },
  { id: TipoContenidoLandingEnum.POPUP_MODAL, label: 'Popup de Pre-Inscripción', icon: 'fa-solid fa-window-maximize', desc: 'Modal flotante para captura rápida de prospectos' },
];

export const LANDING_AVAILABLE_BLOCKS: { type: TipoBloqueSeccion; label: string; icon: string; desc: string }[] = [
  { type: TipoBloqueLanding.HERO, label: 'Hero Principal', icon: 'fa-solid fa-flag-checkered', desc: 'Titular de impacto, subtítulo, botones CTA y badge' },
  { type: TipoBloqueLanding.STATS, label: 'Métricas & Estadísticas', icon: 'fa-solid fa-chart-simple', desc: 'Contadores numéricos de éxito del club' },
  { type: TipoBloqueLanding.PROGRAMAS, label: 'Programas & Categorías', icon: 'fa-solid fa-layer-group', desc: 'Tarjetas de divisiones, edades y horarios' },
  { type: TipoBloqueLanding.FIXTURE, label: 'Próximos Partidos & Torneos', icon: 'fa-solid fa-futbol', desc: 'Calendario de eventos y torneos destacados' },
  { type: TipoBloqueLanding.PLANES, label: 'Planes & Tarifas', icon: 'fa-solid fa-tags', desc: 'Tabla de precios y beneficios de membresía' },
  { type: TipoBloqueLanding.TESTIMONIOS, label: 'Testimonios & Scouting', icon: 'fa-solid fa-star', desc: 'Reseñas de padres y cazatalentos' },
  { type: TipoBloqueLanding.LEAD_FORM, label: 'Formulario de Captación', icon: 'fa-solid fa-clipboard-list', desc: 'Formulario para captar prospectos y pre-inscripciones' },
  { type: TipoBloqueLanding.FAQ, label: 'Preguntas Frecuentes', icon: 'fa-solid fa-circle-question', desc: 'Acordeón interactivo con dudas comunes' },
  { type: TipoBloqueLanding.STORIES, label: 'Galería de Historias', icon: 'fa-solid fa-photo-film', desc: 'Reels y momentos deportivos en video/imagen' },
  { type: TipoBloqueLanding.FOOTER, label: 'Pie de Página & Sedes', icon: 'fa-solid fa-map-location-dot', desc: 'Dirección, horarios, redes y contacto' },
];

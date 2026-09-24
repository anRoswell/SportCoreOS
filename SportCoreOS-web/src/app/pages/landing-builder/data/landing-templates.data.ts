import { TipoBloqueLanding, TipoContenidoLandingEnum } from '../../../core/enums/domain.enums';
import { LandingPage, TipoContenidoLanding } from '../../../core/services/api.service';
import { createDefaultLandingBlock } from './landing-blocks.factory';

/**
 * Retorna la estructura inicial vacía de una Landing Page
 */
export function getEmptyLanding(): LandingPage {
  return {
    id: '',
    titulo: '',
    subtitulo: '',
    slug: '',
    tipo_contenido: TipoContenidoLandingEnum.LANDING_PAGE,
    estado: 'PUBLICADO',
    tema_color: '#10b981',
    tema_gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    tema_modo: 'DARK',
    meta_descripcion: 'Inscripciones abiertas para la academia de formación de fútbol élite.',
    boton_contacto_whatsapp: '+573001234567',
    email_notificaciones: 'admisiones@sportcoreos.com',
    secciones_json: [],
  };
}

/**
 * Genera plantillas pre-configuradas según el tipo de contenido
 */
export function getDefaultLandingTemplate(tipo: TipoContenidoLanding): LandingPage {
  const base = getEmptyLanding();
  base.tipo_contenido = tipo;

  if (tipo === TipoContenidoLandingEnum.LANDING_PAGE) {
    base.titulo = 'Academia de Fútbol Formativo Élite 2026';
    base.subtitulo = 'Metodología integral de alto rendimiento, análisis táctico con IA y torneos nacionales.';
    base.slug = `academia-elite-${Date.now().toString().slice(-4)}`;
    base.secciones_json = [
      createDefaultLandingBlock(TipoBloqueLanding.HERO, 1),
      createDefaultLandingBlock(TipoBloqueLanding.STATS, 2),
      createDefaultLandingBlock(TipoBloqueLanding.PROGRAMAS, 3),
      createDefaultLandingBlock(TipoBloqueLanding.PLANES, 4),
      createDefaultLandingBlock(TipoBloqueLanding.TESTIMONIOS, 5),
      createDefaultLandingBlock(TipoBloqueLanding.LEAD_FORM, 6),
      createDefaultLandingBlock(TipoBloqueLanding.FAQ, 7),
      createDefaultLandingBlock(TipoBloqueLanding.FOOTER, 8),
    ];
  } else if (tipo === TipoContenidoLandingEnum.PROMO_HERO) {
    base.titulo = 'Masterclass de Tecnificación & NeuroFútbol 2026';
    base.subtitulo = '2 Días de inmersión técnica con directores UEFA Pro y mediciones biométricas en tiempo real.';
    base.slug = `clinica-neurofutbol-${Date.now().toString().slice(-4)}`;
    base.tema_color = '#3b82f6';
    base.tema_gradient = 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)';
    base.secciones_json = [
      createDefaultLandingBlock(TipoBloqueLanding.HERO, 1),
      createDefaultLandingBlock(TipoBloqueLanding.STATS, 2),
      createDefaultLandingBlock(TipoBloqueLanding.LEAD_FORM, 3),
    ];
  } else if (tipo === TipoContenidoLandingEnum.STORIES_REEL) {
    base.titulo = 'Historias de la Cantera FC';
    base.subtitulo = 'Conoce el día a día de nuestros canteranos y entrenamientos de alta intensidad.';
    base.slug = `historias-cantera-${Date.now().toString().slice(-4)}`;
    base.tema_color = '#8b5cf6';
    base.tema_gradient = 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)';
    base.secciones_json = [
      createDefaultLandingBlock(TipoBloqueLanding.STORIES, 1),
      createDefaultLandingBlock(TipoBloqueLanding.LEAD_FORM, 2),
    ];
  } else if (tipo === TipoContenidoLandingEnum.BANNER_TOP) {
    base.titulo = '¡Últimos 15 Cupos Torneo Internacional Bogotá Cup!';
    base.subtitulo = 'Cierre de inscripciones este viernes. Separa tu cupo con 20% de descuento.';
    base.slug = `banner-bogota-cup-${Date.now().toString().slice(-4)}`;
    base.tema_color = '#f59e0b';
    base.tema_gradient = 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)';
    base.secciones_json = [
      createDefaultLandingBlock(TipoBloqueLanding.HERO, 1),
      createDefaultLandingBlock(TipoBloqueLanding.LEAD_FORM, 2),
    ];
  } else if (tipo === TipoContenidoLandingEnum.POPUP_MODAL) {
    base.titulo = 'Clase de Prueba Gratuita de Fútbol';
    base.subtitulo = 'Trae a tu hijo a una sesión completa con nuestros entrenadores profesionales.';
    base.slug = `prueba-gratis-${Date.now().toString().slice(-4)}`;
    base.secciones_json = [
      createDefaultLandingBlock(TipoBloqueLanding.LEAD_FORM, 1),
    ];
  }

  return base;
}

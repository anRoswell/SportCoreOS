import { TipoBloqueLanding } from '../../../core/enums/domain.enums';
import { BloqueSeccionLanding, TipoBloqueSeccion } from '../../../core/services/api.service';

/**
 * Fábrica pura para generar bloques por defecto con tipado estricto
 */
export function createDefaultLandingBlock(type: TipoBloqueSeccion, orden: number): BloqueSeccionLanding {
  switch (type) {
    case TipoBloqueLanding.HERO:
      return {
        id: `hero-${Date.now()}`,
        tipo: 'HERO',
        titulo: 'Formando a la Próxima Generación de Campeones',
        subtitulo: 'Entrenamientos de alta intensidad, seguimiento biométrico continuo y vitrina hacia clubes profesionales.',
        orden,
        visible: true,
        datos: {
          tag: 'Matrículas Abiertas Temporada 2026',
          tag_icono: 'fa-solid fa-bolt',
          boton_cta_1_texto: 'Separar Clase de Prueba Gratis',
          boton_cta_1_accion: 'SCROLL_FORM',
          boton_cta_2_texto: 'Ver Programas & Categorías',
          boton_cta_2_accion: 'SCROLL_PROGRAMS',
          imagen_fondo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200',
          video_url: '',
        },
      };

    case TipoBloqueLanding.STATS:
      return {
        id: `stats-${Date.now()}`,
        tipo: TipoBloqueLanding.STATS,
        titulo: 'Nuestras Cifras de Impacto',
        subtitulo: 'Resultados comprobados en el desarrollo de futbolistas íntegros.',
        orden,
        visible: true,
        datos: {
          stats: [
            { numero: '+380', etiqueta: 'Deportistas Activos', icono: 'fa-solid fa-users' },
            { numero: '14', etiqueta: 'Títulos & Copas Oficiales', icono: 'fa-solid fa-trophy' },
            { numero: '98%', etiqueta: 'Satisfacción de Padres', icono: 'fa-solid fa-star' },
            { numero: '6', etiqueta: 'Sedes Deportivas Pro', icono: 'fa-solid fa-location-dot' },
          ],
        },
      };

    case TipoBloqueLanding.PROGRAMAS:
      return {
        id: `programas-${Date.now()}`,
        tipo: TipoBloqueLanding.PROGRAMAS,
        titulo: 'Categorías & Programas Formativos',
        subtitulo: 'Metodología adaptada a cada etapa del desarrollo psicomotriz y táctico.',
        orden,
        visible: true,
        datos: {
          programas: [
            {
              titulo: 'Semillero Inicial (Sub-7 a Sub-9)',
              edades: '5 a 8 años',
              horario: 'Lunes y Miércoles 4:00 PM',
              cupos: '8 Cupos disponibles',
              precio: '$160.000 / mes',
              icono: 'fa-solid fa-child-reaching',
              tag: 'Iniciación',
            },
            {
              titulo: 'Academia Competitiva (Sub-11 a Sub-13)',
              edades: '9 a 12 años',
              horario: 'Mar, Jue y Sáb 8:00 AM',
              cupos: '5 Cupos disponibles',
              precio: '$190.000 / mes',
              icono: 'fa-solid fa-futbol',
              tag: 'Liga Departamental',
            },
            {
              titulo: 'Plantel Élite & Proyección (Sub-15 a Sub-18)',
              edades: '13 a 17 años',
              horario: 'Lunes a Viernes 3:30 PM',
              cupos: 'Últimos 3 Cupos',
              precio: '$230.000 / mes',
              icono: 'fa-solid fa-medal',
              tag: 'Alto Rendimiento',
            },
            {
              titulo: 'Academia de Arqueros Pro',
              edades: 'Todas las edades',
              horario: 'Miércoles y Viernes 5:30 PM',
              cupos: '4 Cupos',
              precio: '$180.000 / mes',
              icono: 'fa-solid fa-hands',
              tag: 'Especializado',
            },
          ],
        },
      };

    case TipoBloqueLanding.FIXTURE:
      return {
        id: `fixture-${Date.now()}`,
        tipo: TipoBloqueLanding.FIXTURE,
        titulo: 'Próximos Partidos & Torneos',
        subtitulo: 'Acompaña a nuestras selecciones en sus competencias oficiales.',
        orden,
        visible: true,
        datos: {
          partidos: [
            {
              torneo: 'Torneo Nacional de Canteras',
              rival: 'Academia Deportivo Cali',
              fecha: 'Sábado 28 Marzo - 10:00 AM',
              lugar: 'Cancha Principal Sede Norte',
              fase: 'Semifinal',
            },
            {
              torneo: 'Copa Élite Sub-15',
              rival: 'Independiente Santa Fe Filial',
              fecha: 'Domingo 29 Marzo - 2:30 PM',
              lugar: 'Estadio Metropolitano Auxiliar',
              fase: 'Jornada 7',
            },
          ],
        },
      };

    case TipoBloqueLanding.PLANES:
      return {
        id: `planes-${Date.now()}`,
        tipo: TipoBloqueLanding.PLANES,
        titulo: 'Planes de Membresía & Matrícula',
        subtitulo: 'Sin cláusulas de permanencia oculta. Incluye póliza médica y seguimiento integral.',
        orden,
        visible: true,
        datos: {
          planes: [
            {
              nombre: 'Plan Mensual Estándar',
              precio: '$190.000',
              periodo: 'mensual',
              destacado: false,
              beneficios: [
                '3 Sesiones de entrenamiento por semana',
                'Participación en partidos amistosos',
                'Acceso al portal familiar web',
                'Evaluación trimestral',
              ],
              boton_texto: 'Seleccionar Plan',
            },
            {
              nombre: 'Plan Semestral Élite',
              precio: '$980.000',
              periodo: 'semestre (Ahorra 15%)',
              destacado: true,
              beneficios: [
                'Entrenamiento de lunes a viernes',
                'Kit completo oficial de juego y viaje',
                'Torneos de Liga federados incluidos',
                'Reportes biomecánicos & IA mensuales',
                'Seguro médico y póliza deportiva',
              ],
              boton_texto: 'Apartar Cupo Élite',
            },
            {
              nombre: 'Plan Anual Campeones',
              precio: '$1.850.000',
              periodo: 'año completo',
              destacado: false,
              beneficios: [
                'Todo lo incluido en el Plan Élite',
                '2 Kits oficiales de competencia',
                'Clínica de Verano internacional',
                'Asesoría de nutrición deportiva',
              ],
              boton_texto: 'Inscripción Anual',
            },
          ],
        },
      };

    case TipoBloqueLanding.TESTIMONIOS:
      return {
        id: `testimonios-${Date.now()}`,
        tipo: TipoBloqueLanding.TESTIMONIOS,
        titulo: 'Lo que Dicen Nuestras Familias',
        subtitulo: 'Más de 500 familias confían en nosotros para el crecimiento deportivo y personal de sus hijos.',
        orden,
        visible: true,
        datos: {
          testimonios: [
            {
              nombre: 'Mariana Gómez',
              rol: 'Mamá de Juan David (Sub-9)',
              texto: 'La disciplina, los valores y la atención personalizada de los profes son inigualables. Mi hijo está feliz y ha mejorado notablemente su técnica.',
              avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120',
              estrellas: 5,
            },
            {
              nombre: 'Prof. Andrés Velásquez',
              rol: 'Scout Deportivo Nacional',
              texto: 'La formación táctica y la lectura de juego que muestran los deportistas de esta academia destacan en cada visoría oficial.',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120',
              estrellas: 5,
            },
          ],
        },
      };

    case TipoBloqueLanding.LEAD_FORM:
      return {
        id: `lead-form-${Date.now()}`,
        tipo: TipoBloqueLanding.LEAD_FORM,
        titulo: '¡Separa tu Clase de Prueba Gratuita!',
        subtitulo: 'Completa tus datos y nuestro coordinador deportivo se comunicará en menos de 2 horas para agendar tu primera sesión.',
        orden,
        visible: true,
        datos: {
          boton_cta_texto: '¡Quiero mi Clase de Prueba Gratis!',
          mostrar_edad: true,
          mostrar_categoria: true,
          mostrar_mensaje: true,
          texto_garantia: '🔒 Cupos limitados por categoría. Sin compromiso de pago inicial.',
        },
      };

    case TipoBloqueLanding.FAQ:
      return {
        id: `faq-${Date.now()}`,
        tipo: TipoBloqueLanding.FAQ,
        titulo: 'Preguntas Frecuentes',
        subtitulo: 'Resolvemos todas tus dudas sobre nuestro proceso formativo.',
        orden,
        visible: true,
        datos: {
          preguntas: [
            {
              pregunta: '¿Qué documentos se necesitan para la primera sesión?',
              respuesta: 'Únicamente documento de identidad del deportista y carnet de EPS o medicina prepagada. Nosotros proporcionamos los implementos y balones en la clase.',
            },
            {
              pregunta: '¿Tienen categorías para niñas?',
              respuesta: '¡Sí! Contamos con rama femenina formativa y competitiva desde la categoría Sub-8 hasta Sub-17 con entrenadoras especializadas.',
            },
            {
              pregunta: '¿Cómo funciona la clase de prueba gratuita?',
              respuesta: 'El deportista participa durante 90 minutos con su categoría respectiva. El cuerpo técnico evalúa su nivel y al finalizar entrega una retroalimentación detallada.',
            },
          ],
        },
      };

    case TipoBloqueLanding.STORIES:
      return {
        id: `stories-${Date.now()}`,
        tipo: TipoBloqueLanding.STORIES,
        titulo: 'Historias & Momentos en la Cancha',
        subtitulo: 'Vive la pasión de nuestros entrenamientos y celebraciones.',
        orden,
        visible: true,
        datos: {
          stories: [
            {
              titulo: 'Entrenamiento Táctico',
              categoria: 'Sub-15 Élite',
              imagen: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=600',
            },
            {
              titulo: 'Campeones Copa Oro',
              categoria: 'Sub-11',
              imagen: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600',
            },
            {
              titulo: 'Clínica de Arqueros',
              categoria: 'Especializada',
              imagen: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=600',
            },
          ],
        },
      };

    case TipoBloqueLanding.FOOTER:
      return {
        id: `footer-${Date.now()}`,
        tipo: TipoBloqueLanding.FOOTER,
        titulo: 'Contacto & Sedes',
        subtitulo: '',
        orden,
        visible: true,
        datos: {
          direccion: 'Complejo Deportivo SportCore Park - Cancha 1 y 2, Sede Norte',
          telefono: '+57 (300) 123-4567',
          email: 'contacto@academiafutbol.com',
          horario_atencion: 'Lunes a Sábado: 7:00 AM - 7:00 PM',
          instagram: 'https://instagram.com',
          facebook: 'https://facebook.com',
          youtube: 'https://youtube.com',
        },
      };

    default:
      return {
        id: `custom-${Date.now()}`,
        tipo: type,
        titulo: 'Nueva Sección',
        subtitulo: '',
        orden,
        visible: true,
        datos: {},
      };
  }
}

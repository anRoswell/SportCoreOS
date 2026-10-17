// ==========================================
// SPORTCOREOS - DOMAIN ENUMS (SINGLE SOURCE OF TRUTH)
// ==========================================

// ==========================================
// 1. ROLES Y AUTENTICACIÓN
// ==========================================
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DIRECTOR_DEPORTIVO = 'DIRECTOR_DEPORTIVO',
  ENTRENADOR_DT = 'ENTRENADOR_DT',
  PREPARADOR_FISICO = 'PREPARADOR_FISICO',
  MEDICO_FISIO = 'MEDICO_FISIO',
  ADMIN_FINANCIERO = 'ADMIN_FINANCIERO',
  RECEPCION_LOGISTICA = 'RECEPCION_LOGISTICA',
  PADRE_ACUDIENTE = 'PADRE_ACUDIENTE',
  JUGADOR = 'JUGADOR',
}

// ==========================================
// 2. PASARELAS & MÉTODOS DE PAGO
// ==========================================
export enum MetodoPago {
  WOMPI_PSE = 'WOMPI_PSE',
  WOMPI_CARD = 'WOMPI_CARD',
  STRIPE = 'STRIPE',
  EFECTIVO_CAJA = 'EFECTIVO_CAJA',
  TRANSFERENCIA = 'TRANSFERENCIA',
  DATAFONO = 'DATAFONO',
}

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  PARCIAL = 'PARCIAL',
  PAGADO = 'PAGADO',
  COMPLETADO = 'COMPLETADO',
  EXONERADO = 'EXONERADO',
  RECHAZADO = 'RECHAZADO',
  ANULADO = 'ANULADO',
}

export enum TipoMoneda {
  COP = 'COP',
  USD = 'USD',
  EUR = 'EUR',
}

// ==========================================
// 3. JUGADORES, FAMILIAS & FICHA DEPORTIVA
// ==========================================
export enum TipoDocumentoIdentidad {
  TI = 'TI',
  CC = 'CC',
  RC = 'RC',
  PASAPORTE = 'PASAPORTE',
  CE = 'CE',
  PEP = 'PEP',
  PPT = 'PPT',
  NUIP = 'NUIP',
}

export { TipoDocumentoIdentidad as TipoDocumento };

export enum Genero {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
  MIXTO = 'MIXTO',
}

export enum PiernaHabil {
  DIESTRO = 'DIESTRO',
  ZURDO = 'ZURDO',
  AMBIDIESTRO = 'AMBIDIESTRO',
}

export enum EstadoMatricula {
  ACTIVO = 'ACTIVO',
  SUSPENDIDO = 'SUSPENDIDO',
  LESIONADO = 'LESIONADO',
  RETIRADO = 'RETIRADO',
  EN_PRUEBA = 'EN_PRUEBA',
}

export enum Parentesco {
  PADRE = 'PADRE',
  MADRE = 'MADRE',
  TUTOR_LEGAL = 'TUTOR_LEGAL',
  ABUELO = 'ABUELO',
  TIO = 'TIO',
  HERMANO = 'HERMANO',
  OTRO = 'OTRO',
}

export enum PosicionJugador {
  PORTERO = 'PORTERO',
  DEFENSA = 'DEFENSA',
  DEFENSA_CENTRAL = 'DEFENSA_CENTRAL',
  LATERAL_DERECHO = 'LATERAL_DERECHO',
  LATERAL_IZQUIERDO = 'LATERAL_IZQUIERDO',
  MEDIOCAMPISTA = 'MEDIOCAMPISTA',
  VOLANTE_DEFENSIVO = 'VOLANTE_DEFENSIVO',
  VOLANTE_OFENSIVO = 'VOLANTE_OFENSIVO',
  EXTREMO_DERECHO = 'EXTREMO_DERECHO',
  EXTREMO_IZQUIERDO = 'EXTREMO_IZQUIERDO',
  DELANTERO = 'DELANTERO',
  SIN_DEFINIR = 'Sin definir',
}

// ==========================================
// 4. CATEGORÍAS & ESTRUCTURA DEPORTIVA
// ==========================================
export enum NivelCompetencia {
  FORMATIVO = 'FORMATIVO',
  COMPETITIVO = 'COMPETITIVO',
  ELITE = 'ELITE',
  RECREATIVO = 'RECREATIVO',
}

export enum RamaCategoria {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
  MIXTO = 'MIXTO',
}

// ==========================================
// 5. FINANZAS & ESTADO DE CUENTA
// ==========================================
export enum EstadoCuenta {
  AL_DIA = 'AL_DIA',
  EN_MORA = 'EN_MORA',
}

export enum PlanClub {
  PLAN_CLUB_ELITE_PRO = 'PLAN_CLUB_ELITE_PRO',
  PLAN_SEMILLERO_ORO = 'PLAN_SEMILLERO_ORO',
  PLAN_ACADEMIA_BASICO = 'PLAN_ACADEMIA_BASICO',
}

// ==========================================
// 6. COMPETICIÓN, PARTIDOS & FIXTURE
// ==========================================
export enum CondicionJuego {
  LOCAL = 'LOCAL',
  VISITANTE = 'VISITANTE',
  NEUTRAL = 'NEUTRAL',
}

export enum EstadoPartido {
  PROGRAMADO = 'PROGRAMADO',
  EN_JUEGO = 'EN_JUEGO',
  FINALIZADO = 'FINALIZADO',
  APLAZADO = 'APLAZADO',
  CANCELADO = 'CANCELADO',
}

export enum TipoEventoActa {
  GOL = 'GOL',
  AUTOGOL = 'AUTOGOL',
  TARJETA_AMARILLA = 'TARJETA_AMARILLA',
  TARJETA_ROJA = 'TARJETA_ROJA',
  CAMBIO_ENTRA = 'CAMBIO_ENTRA',
  CAMBIO_SALE = 'CAMBIO_SALE',
  ASISTENCIA = 'ASISTENCIA',
  LESION = 'LESION',
}

export enum RolConvocatoria {
  TITULAR = 'TITULAR',
  SUPLENTE = 'SUPLENTE',
  RESERVA = 'RESERVA',
  NO_CONVOCADO = 'NO_CONVOCADO',
}

export enum EstadoConfirmacionConvocatoria {
  CONFIRMADO = 'CONFIRMADO',
  PENDIENTE = 'PENDIENTE',
  RECHAZADO = 'RECHAZADO',
  JUSTIFICADO = 'JUSTIFICADO',
}

// ==========================================
// 7. ESCENARIOS & CANCHAS
// ==========================================
export enum TipoSuperficieCancha {
  SINTETICA_F5 = 'sintetica_f5',
  SINTETICA_F8 = 'sintetica_f8',
  NATURAL_F11 = 'natural_f11',
  FUTSAL_MADERA = 'futsal_madera',
  ARENA = 'arena',
}

export enum TipoReservaCancha {
  ALQUILER_PARTICULAR = 'alquiler_particular',
  ENTRENAMIENTO_CLUB = 'entrenamiento_club',
  PARTIDO_OFICIAL = 'partido_oficial',
  MANTENIMIENTO = 'mantenimiento',
}

export enum EstadoTurnoCancha {
  CONFIRMADO = 'confirmado',
  PENDIENTE = 'pendiente',
  CANCELADO = 'cancelado',
  EN_CURSO = 'en_curso',
  FINALIZADO = 'finalizado',
}

// ==========================================
// 8. TIENDA OFICIAL & INVENTARIO
// ==========================================
export enum CategoriaProductoTienda {
  UNIFORME_OFICIAL = 'uniforme_oficial',
  ENTRENAMIENTO = 'entrenamiento',
  ACCESORIOS = 'accesorios',
  BALONES = 'balones',
  CALZADO = 'calzado',
  MERCHANDISING = 'merchandising',
}

export enum EstadoDespachoPedido {
  PENDIENTE_ENTREGA = 'PENDIENTE_ENTREGA',
  EN_PREPARACION = 'EN_PREPARACION',
  ENTREGADO = 'ENTREGADO',
  CANCELADO = 'CANCELADO',
}

// ==========================================
// 9. SCOUTING & CAPTACIÓN
// ==========================================
export enum EstadoScouting {
  EN_OBSERVACION = 'en_observacion',
  INTERES_FICHAJE = 'interes_fichaje',
  FICHADO = 'fichado',
  DESCARTADO = 'descartado',
}

export enum RecomendacionScouting {
  FICHAR_YA = 'FICHAR_YA',
  SEGUIMIENTO_CONTINUO = 'SEGUIMIENTO_CONTINUO',
  PRUEBA_EN_PLANTEL = 'PRUEBA_EN_PLANTEL',
  DESCARTAR = 'DESCARTAR',
}

// ==========================================
// 10. TELEMETRÍA & RENDIMIENTO GPS
// ==========================================
export enum TipoSesionTelemetria {
  PARTIDO_OFICIAL = 'PARTIDO_OFICIAL',
  ENTRENAMIENTO_TACTICO = 'ENTRENAMIENTO_TACTICO',
  ENTRENAMIENTO_FISICO = 'ENTRENAMIENTO_FISICO',
  RECUPERACION = 'RECUPERACION',
}

export enum DispositivoSensorMarca {
  CATAPULT_10HZ = 'CATAPULT_10HZ',
  STATSPORTS_APEX = 'STATSPORTS_APEX',
  GPSPORT_15HZ = 'GPSPORT_15HZ',
  POLAR_TEAM_PRO = 'POLAR_TEAM_PRO',
  GENERIC_GPX = 'GENERIC_GPX',
}

// ==========================================
// 11. ALMACENAMIENTO DOCUMENTAL MULTI-TENANT
// ==========================================
export enum EntidadAlmacenamientoTipo {
  CLUB = 'CLUB',
  JUGADOR = 'JUGADOR',
  ACUDIENTE = 'ACUDIENTE',
  STAFF = 'STAFF',
  PARTIDO = 'PARTIDO',
  TIENDA_PRODUCTO = 'TIENDA_PRODUCTO',
  TIENDA_PEDIDO = 'TIENDA_PEDIDO',
  SESION_GPS = 'SESION_GPS',
  PROSPECTO = 'PROSPECTO',
  FINANZAS_RECIBO = 'FINANZAS_RECIBO',
}

export enum TipoDocumentoAdjunto {
  FOTO_PERFIL = 'FOTO_PERFIL',
  DOCUMENTO_IDENTIDAD = 'DOCUMENTO_IDENTIDAD',
  CERTIFICADO_MEDICO = 'CERTIFICADO_MEDICO',
  EPS_SEGURIDAD_SOCIAL = 'EPS_SEGURIDAD_SOCIAL',
  AUTORIZACION_MENOR = 'AUTORIZACION_MENOR',
  COMPROBANTE_PAGO = 'COMPROBANTE_PAGO',
  LOGO_CLUB = 'LOGO_CLUB',
  FOTO_PRODUCTO = 'FOTO_PRODUCTO',
  TRACKING_GPS_RAW = 'TRACKING_GPS_RAW',
  INFORME_SCOUTING_PDF = 'INFORME_SCOUTING_PDF',
}

// ==========================================
// 12. SERVICIOS, RETOS & NOTIFICACIONES
// ==========================================
export enum EstadoInscripcionServicio {
  PENDIENTE = 'PENDIENTE',
  PENDIENTE_APROBACION = 'PENDIENTE_APROBACION',
  APROBADO = 'APROBADO',
  APROBADA = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  RECHAZADA = 'RECHAZADO',
  COMPLETADA = 'COMPLETADA',
}

export enum EstadoRetoProgreso {
  DISPONIBLE = 'DISPONIBLE',
  COMPROBABLE = 'COMPROBABLE',
  PENDIENTE = 'PENDIENTE',
  EN_PROGRESO = 'EN_PROGRESO',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}


export enum TipoNotificacion {
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}

export enum ImportFilterMode {
  TODAS = 'TODAS',
  VALIDAS = 'VALIDAS',
  ADVERTENCIAS = 'ADVERTENCIAS',
  ERRORES = 'ERRORES',
}

export enum FiltroGeneral {
  TODAS = 'TODAS',
  TODOS = 'TODOS',
}

export enum DiagnosticoBiometricoFiltro {
  TODOS = 'TODOS',
  OPTIMO = 'OPTIMO',
  SOBREPESO = 'SOBREPESO',
  OBESIDAD = 'OBESIDAD',
  BAJOPESO = 'BAJOPESO',
}

export enum EstadoPagoReserva {
  PENDIENTE = 'pendiente',
  PARCIAL = 'parcial',
  COMPLETADO = 'completado',
  REEMBOLSADO = 'reembolsado',
}

export enum TipoValorParametro {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
}

export enum TipoContenidoLanding {
  LANDING_PAGE = 'LANDING_PAGE',
  PROMO_HERO = 'PROMO_HERO',
  STORIES_REEL = 'STORIES_REEL',
  BANNER_TOP = 'BANNER_TOP',
  POPUP_MODAL = 'POPUP_MODAL',
}

export enum EstadoLanding {
  PUBLICADO = 'PUBLICADO',
  BORRADOR = 'BORRADOR',
  ARCHIVADO = 'ARCHIVADO',
}

export enum FormModalMode {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
}


export enum EstadoUsuario {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
  SUSPENDIDO = 'SUSPENDIDO',
  PENDIENTE = 'PENDIENTE',
}

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

export { Role as RolUsuario };


export enum EstadoPago {
  TODOS = 'TODOS',
  PAGADO = 'PAGADO',
  PENDIENTE = 'PENDIENTE',
  PENDIENTE_APROBACION = 'PENDIENTE_APROBACION',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
  VENCIDO = 'VENCIDO',
  ANULADO = 'ANULADO',
  REEMBOLSADO = 'REEMBOLSADO',
}

export enum MetodoPago {
  EFECTIVO = 'EFECTIVO',
  TRANSFERENCIA = 'TRANSFERENCIA',
  TRANSFERENCIA_BANCARIA = 'TRANSFERENCIA_BANCARIA',
  WOMPI_PSE = 'WOMPI_PSE',
  NEQUI = 'NEQUI',
  DAVIPLATA = 'DAVIPLATA',
  TARJETA_CREDITO = 'TARJETA_CREDITO',
  TARJETA_DEBITO = 'TARJETA_DEBITO',
  PASARELA_WOMPI = 'PASARELA_WOMPI',
  PASARELA_EPAYCO = 'PASARELA_EPAYCO',
  OTRO = 'OTRO',
}

export enum TipoCancha {
  FUTBOL_11 = 'FUTBOL_11',
  FUTBOL_8 = 'FUTBOL_8',
  FUTBOL_5 = 'FUTBOL_5',
  SINTETICA = 'SINTETICA',
  NATURAL = 'NATURAL',
  COLISEO = 'COLISEO',
}

export enum EstadoReservaCancha {
  DISPONIBLE = 'DISPONIBLE',
  RESERVADA = 'RESERVADA',
  MANTENIMIENTO = 'MANTENIMIENTO',
  BLOQUEADA = 'BLOQUEADA',
}

export enum CategoriaEdad {
  SUB_5 = 'SUB_5',
  SUB_7 = 'SUB_7',
  SUB_9 = 'SUB_9',
  SUB_11 = 'SUB_11',
  SUB_13 = 'SUB_13',
  SUB_15 = 'SUB_15',
  SUB_17 = 'SUB_17',
  SUB_20 = 'SUB_20',
  MAYORES = 'MAYORES',
  SENIOR = 'SENIOR',
}

export enum RamaDeporte {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
  MIXTO = 'MIXTO',
}

export enum PosicionJugador {
  PORTERO = 'PORTERO',
  DEFENSA = 'DEFENSA',
  DEFENSA_CENTRAL = 'DEFENSA_CENTRAL',
  LATERAL_DERECHO = 'LATERAL_DERECHO',
  LATERAL_IZQUIERDO = 'LATERAL_IZQUIERDO',
  MEDIOCAMPISTA = 'MEDIOCAMPISTA',
  MEDIOCENTRO_DEFENSIVO = 'MEDIOCENTRO_DEFENSIVO',
  MEDIOCENTRO_OFENSIVO = 'MEDIOCENTRO_OFENSIVO',
  VOLANTE_DEFENSIVO = 'VOLANTE_DEFENSIVO',
  VOLANTE_OFENSIVO = 'VOLANTE_OFENSIVO',
  EXTREMO_DERECHO = 'EXTREMO_DERECHO',
  EXTREMO_IZQUIERDO = 'EXTREMO_IZQUIERDO',
  DELANTERO = 'DELANTERO',
  DELANTERO_CENTRO = 'DELANTERO_CENTRO',
  SEGUNDO_DELANTERO = 'SEGUNDO_DELANTERO',
  SIN_DEFINIR = 'Sin definir',
}

export enum PiernaHabil {
  DIESTRO = 'DIESTRO',
  ZURDO = 'ZURDO',
  AMBIDIESTRO = 'AMBIDIESTRO',
}

export { PiernaHabil as DominanciaPie };


export enum TipoServicio {
  MENSUALIDAD = 'MENSUALIDAD',
  MATRICULA = 'MATRICULA',
  UNIFORME = 'UNIFORME',
  CLASE_PERSONALIZADA = 'CLASE_PERSONALIZADA',
  TORNEO = 'TORNEO',
  TRANSPORTE = 'TRANSPORTE',
  SEGURO_MEDICO = 'SEGURO_MEDICO',
  OTRO = 'OTRO',
}

// ==========================================
// SERVICIOS & CLÍNICAS ESPECIALIZADAS
// ==========================================
export enum CategoriaServicio {
  TODAS = 'TODAS',
  VELOCIDAD_EXPLOSIVIDAD = 'VELOCIDAD_EXPLOSIVIDAD',
  COORDINACION_AGILIDAD = 'COORDINACION_AGILIDAD',
  TECNICA_REGATE = 'TECNICA_REGATE',
  ARQUEROS_ELITE = 'ARQUEROS_ELITE',
  DEFINICION_TIRO = 'DEFINICION_TIRO',
  PREVENCION_FISICA = 'PREVENCION_FISICA',
}

export enum TipoPlanServicio {
  SESION_INDIVIDUAL = 'SESION_INDIVIDUAL',
  PAQUETE_MENSUAL = 'PAQUETE_MENSUAL',
}

export enum EstadoPartido {
  PROGRAMADO = 'PROGRAMADO',
  EN_JUEGO = 'EN_JUEGO',
  FINALIZADO = 'FINALIZADO',
  APLAZADO = 'APLAZADO',
  CANCELADO = 'CANCELADO',
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
  EXCUSADO = 'EXCUSADO',
  RECHAZADO = 'RECHAZADO',
  JUSTIFICADO = 'JUSTIFICADO',
}

// ==========================================
// GAMIFICACIÓN & RANKING XP
// ==========================================
export enum TierRank {
  TODOS = 'TODOS',
  DIAMANTE = 'DIAMANTE',
  ORO = 'ORO',
  PLATA = 'PLATA',
  BRONCE = 'BRONCE',
}

export enum RankingFiltroPosicion {
  TODAS = 'TODAS',
  ARQUERO = 'Arquero',
  DEFENSA = 'Defensa',
  VOLANTE = 'Volante',
  DELANTERO = 'Delantero',
}

export enum RankingFiltroCategoria {
  TODAS = 'TODAS',
}

export enum TabRanking {

  LEADERBOARD = 'LEADERBOARD',
  RETOS = 'RETOS',
  CERTIFICACION_DT = 'CERTIFICACION_DT',
  AULA_INTERACTIVA = 'AULA_INTERACTIVA',
  LIGA = 'LIGA',
}

export enum FiltroTemporalRanking {
  TEMPORADA = 'TEMPORADA',
  MES = 'MES',
  SEMANA = 'SEMANA',
}

export enum EstadoRetoJugador {
  DISPONIBLE = 'DISPONIBLE',
  COMPROBABLE = 'COMPROBABLE',
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

export enum CategoriaHabilidadReto {
  TODOS = 'TODOS',
  FUERZA_CALISTENIA = 'FUERZA_CALISTENIA',
  TECNICA_CONTROL = 'TECNICA_CONTROL',
  POTENCIA_VELOCIDAD = 'POTENCIA_VELOCIDAD',
  RESISTENCIA_CORE = 'RESISTENCIA_CORE',
  PRECISION_TIRO = 'PRECISION_TIRO',
}

export enum TipoNotificacionToast {

  EXITO = 'exito',
  INFO = 'info',
  ALERTA = 'alerta',
  ERROR = 'error',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

// ==========================================
// SCOUTING & TALENT PIPELINE
// ==========================================
export enum ScoutingViewMode {
  PIPELINE = 'pipeline',
  LISTA = 'lista',
}

export enum ScoutingEstadoPipeline {
  TODOS = 'TODOS',
  EN_OBSERVACION = 'en_observacion',
  INTERES_FICHAJE = 'interes_fichaje',
  FICHADO = 'fichado',
  DESCARTADO = 'descartado',
}

export { ScoutingEstadoPipeline as ScoutingEstadoProspecto };


// ==========================================
// SLIDERS & CONTENIDO PROMOCIONAL
// ==========================================
export enum SliderPlataforma {
  TODAS = 'TODAS',
  MOBILE_APP = 'MOBILE_APP',
  WEB_PORTAL = 'WEB_PORTAL',
}

export enum SliderEstadoFiltro {
  TODOS = 'TODOS',
  ACTIVOS = 'ACTIVOS',
  INACTIVOS = 'INACTIVOS',
}

export enum SliderModalTab {
  GENERAL = 'GENERAL',
  DISENO = 'DISENO',
  BENEFICIOS = 'BENEFICIOS',
}

// ==========================================
// LANDING BUILDER & SIMULADOR
// ==========================================
export enum LandingDevicePreview {
  DESKTOP = 'DESKTOP',
  TABLET = 'TABLET',
  MOBILE = 'MOBILE',
}

export enum LandingBuilderTab {
  GENERAL = 'GENERAL',
  TEMA = 'TEMA',
  BLOQUES = 'BLOQUES',
}

export enum LandingThemeMode {
  DARK = 'DARK',
  LIGHT = 'LIGHT',
}

export enum LandingEstadoFiltro {
  TODOS = 'TODOS',
  PUBLICADO = 'PUBLICADO',
  BORRADOR = 'BORRADOR',
  ARCHIVADO = 'ARCHIVADO',
}

export enum TipoBloqueLanding {
  HERO = 'HERO',
  STATS = 'STATS',
  PROGRAMAS = 'PROGRAMAS',
  FIXTURE = 'FIXTURE',
  PLANES = 'PLANES',
  TESTIMONIOS = 'TESTIMONIOS',
  LEAD_FORM = 'LEAD_FORM',
  FAQ = 'FAQ',
  FOOTER = 'FOOTER',
  CUSTOM_HTML = 'CUSTOM_HTML',
  STORIES = 'STORIES',
  GALERIA = 'GALERIA',
  VIDEO_BANNER = 'VIDEO_BANNER',
}

export enum TipoContenidoLandingEnum {
  LANDING_PAGE = 'LANDING_PAGE',
  PROMO_HERO = 'PROMO_HERO',
  STORIES_REEL = 'STORIES_REEL',
  BANNER_TOP = 'BANNER_TOP',
  POPUP_MODAL = 'POPUP_MODAL',
}

// ==========================================
// JUGADORES & EXPEDIENTE
// ==========================================
export enum TabExpedienteJugador {
  DEPORTIVO = 'DEPORTIVO',
  FAMILIA = 'FAMILIA',
  BIOMETRIA = 'BIOMETRIA',
  FINANZAS = 'FINANZAS',
  SERVICIOS = 'SERVICIOS',
}

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

export enum Parentesco {
  PADRE = 'PADRE',
  MADRE = 'MADRE',
  TUTOR_LEGAL = 'TUTOR_LEGAL',
  ABUELO = 'ABUELO',
  TIO = 'TIO',
  HERMANO = 'HERMANO',
  OTRO = 'OTRO',
}

export { Parentesco as ParentescoAcudiente };


export enum RangoImcClasificacion {
  BAJO_PESO = 'Bajo Peso',
  PESO_NORMAL = 'Normal / Óptimo',
  SOBREPESO = 'Sobrepeso',
  OBESIDAD = 'Obesidad',
}

export enum RangoImcCssClass {
  IMC_BAJO = 'bajo',
  IMC_NORMAL = 'normal',
  IMC_SOBREPESO = 'sobrepeso',
  IMC_OBESIDAD = 'sobrepeso',
}

// ==========================================
// BIOMETRÍA & TESTS FÍSICOS
// ==========================================
export enum BiometriaCategoriaFiltro {
  TODAS = 'TODAS',
}

export enum BiometriaDiagnosticoFiltro {
  TODOS = 'TODOS',
  SOBRESALIENTE = 'SOBRESALIENTE',
  OPTIMO = 'OPTIMO',
  DESARROLLO = 'DESARROLLO',
}

export enum BiometriaSortBy {
  FECHA_DESC = 'FECHA_DESC',
  FECHA_ASC = 'FECHA_ASC',
  COOPER_DESC = 'COOPER_DESC',
  SALTO_DESC = 'SALTO_DESC',
  TALLA_DESC = 'TALLA_DESC',
  IMC_ASC = 'IMC_ASC',
}

export enum BiometriaDiagnosticoTipo {
  SUCCESS = 'success',
  BLUE = 'blue',
  WARNING = 'warning',
}

export enum BiometriaDiagnosticoLabel {
  SOBRESALIENTE = 'Sobresaliente',
  OPTIMO = 'Óptimo',
  DESARROLLO = 'En Desarrollo',
}

// ==========================================
// TIENDA & INDUMENTARIA OFICIAL
// ==========================================
export enum TiendaTab {
  CATALOGO = 'catalogo',
  PEDIDOS = 'pedidos',
  STOCK = 'stock',
}

export enum TiendaCategoriaProducto {
  TODAS = 'TODAS',
  UNIFORME_OFICIAL = 'uniforme_oficial',
  ENTRENAMIENTO = 'entrenamiento',
  BALONES = 'balones',
  ACCESORIOS = 'accesorios',
}

export enum EstadoDespachoPedido {
  ENTREGADO = 'ENTREGADO',
  PENDIENTE_ENTREGA = 'PENDIENTE_ENTREGA',
}

export enum MetodoPagoTienda {
  WOMPI_PSE = 'WOMPI_PSE',
  EFECTIVO_CAJA = 'EFECTIVO_CAJA',
  TRANSFERENCIA = 'TRANSFERENCIA',
}

export enum EstadoMatricula {
  ACTIVO = 'ACTIVO',
  SUSPENDIDO = 'SUSPENDIDO',
  LESIONADO = 'LESIONADO',
  RETIRADO = 'RETIRADO',
  EN_PRUEBA = 'EN_PRUEBA',
}

export enum Genero {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
  MIXTO = 'MIXTO',
}

export enum CondicionJuego {
  LOCAL = 'LOCAL',
  VISITANTE = 'VISITANTE',
  NEUTRAL = 'NEUTRAL',
}

export enum EstadoCuenta {
  AL_DIA = 'AL_DIA',
  EN_MORA = 'EN_MORA',
}


export enum ImportFilterMode {
  TODAS = 'TODAS',
  VALIDAS = 'VALIDAS',
  ADVERTENCIAS = 'ADVERTENCIAS',
  ERRORES = 'ERRORES',
}

export enum FormModalMode {
  CREATE = 'CREATE',
  EDIT = 'EDIT',
}

export enum FiltroGeneral {
  TODAS = 'TODAS',
  TODOS = 'TODOS',
}





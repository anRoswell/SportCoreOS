// ==========================================
// ROLES Y AUTENTICACIÓN
// ==========================================
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  DIRECTOR_DEPORTIVO = 'DIRECTOR_DEPORTIVO',
  ENTRENADOR_DT = 'ENTRENADOR_DT',
  PADRE_ACUDIENTE = 'PADRE_ACUDIENTE',
  ADMIN_FINANCIERO = 'ADMIN_FINANCIERO',
}

// ==========================================
// PASARELAS & MÉTODOS DE PAGO
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
// JUGADORES & FICHA DEPORTIVA
// ==========================================
export enum TipoDocumentoIdentidad {
  TI = 'TI',
  CC = 'CC',
  RC = 'RC',
  PASAPORTE = 'PASAPORTE',
  CE = 'CE',
  PEP = 'PEP',
}

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

// ==========================================
// COMPETICIÓN, PARTIDOS & FIXTURE
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
// ESCENARIOS & CANCHAS
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
// TIENDA OFICIAL & INVENTARIO
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
// SCOUTING & CAPTACIÓN
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
// TELEMETRÍA & RENDIMIENTO GPS
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
// ALMACENAMIENTO DOCUMENTAL MULTI-TENANT
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

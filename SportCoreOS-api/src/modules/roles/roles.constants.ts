export const SPORTCORE_ROLES = [
  'SUPER_ADMIN',
  'DIRECTOR_DEPORTIVO',
  'ENTRENADOR_DT',
  'PREPARADOR_FISICO',
  'MEDICO_FISIO',
  'ADMIN_FINANCIERO',
  'RECEPCION_LOGISTICA',
  'PADRE_ACUDIENTE',
  'JUGADOR',
] as const;

export type SportCoreRole = typeof SPORTCORE_ROLES[number];

export type PermissionAccessLevel = boolean | 'RO' | 'OWN' | 'NONE';

export interface PermissionTemplateItem {
  modulo: string;
  accion: string;
  descripcion: string;
  roles: Partial<Record<SportCoreRole, PermissionAccessLevel>>;
}

export const SPORTCORE_PERMISSION_TEMPLATE: PermissionTemplateItem[] = [
  // JUGADORES
  { modulo: 'JUGADORES', accion: 'VER_LISTADO', descripcion: 'Ver listado y tarjetas de jugadores', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ENTRENADOR_DT: true, PREPARADOR_FISICO: true, MEDICO_FISIO: true, ADMIN_FINANCIERO: 'RO' } },
  { modulo: 'JUGADORES', accion: 'CREAR_JUGADOR', descripcion: 'Inscribir nuevos jugadores y fichas técnicas', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ADMIN_FINANCIERO: true } },
  { modulo: 'JUGADORES', accion: 'EDITAR_FICHA', descripcion: 'Editar datos deportivos y personales', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ENTRENADOR_DT: true } },
  { modulo: 'JUGADORES', accion: 'ELIMINAR_JUGADOR', descripcion: 'Baja o desvinculación de jugadores', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true } },
  { modulo: 'JUGADORES', accion: 'EXPORTAR_DATOS', descripcion: 'Exportar planillas en Excel/PDF', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ADMIN_FINANCIERO: true } },

  // CATEGORIAS
  { modulo: 'CATEGORIAS', accion: 'VER_CATEGORIAS', descripcion: 'Consultar categorías y divisiones', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ENTRENADOR_DT: true, PREPARADOR_FISICO: true, MEDICO_FISIO: true, ADMIN_FINANCIERO: 'RO' } },
  { modulo: 'CATEGORIAS', accion: 'CREAR_CATEGORIA', descripcion: 'Apertura de nuevas categorías', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true } },
  { modulo: 'CATEGORIAS', accion: 'EDITAR_CATEGORIA', descripcion: 'Modificar rangos de edad y cupos', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true } },
  { modulo: 'CATEGORIAS', accion: 'ASIGNAR_CUERPO_TECNICO', descripcion: 'Designar Entrenador DT y PF a la categoría', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true } },

  // PARTIDOS
  { modulo: 'PARTIDOS', accion: 'VER_PARTIDOS', descripcion: 'Ver fixture, partidos y resultados', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ENTRENADOR_DT: true, PREPARADOR_FISICO: true, MEDICO_FISIO: true, PADRE_ACUDIENTE: 'RO', JUGADOR: 'RO' } },
  { modulo: 'PARTIDOS', accion: 'PROGRAMAR_PARTIDO', descripcion: 'Crear partidos y asignar rival/cancha', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ENTRENADOR_DT: true } },
  { modulo: 'PARTIDOS', accion: 'REGISTRAR_ACTA_GOLES', descripcion: 'Llenar acta, goles, tarjetas y sustituciones', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ENTRENADOR_DT: true } },
  { modulo: 'PARTIDOS', accion: 'CERRAR_PARTIDO', descripcion: 'Finalizar y sellar acta arbitral', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true } },

  // CONVOCATORIAS
  { modulo: 'CONVOCATORIAS', accion: 'VER_CONVOCATORIAS', descripcion: 'Ver llamados y estados de respuesta', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ENTRENADOR_DT: true, PREPARADOR_FISICO: true, PADRE_ACUDIENTE: 'OWN', JUGADOR: 'OWN' } },
  { modulo: 'CONVOCATORIAS', accion: 'CREAR_CONVOCATORIA', descripcion: 'Citar jugadores a partidos o microciclos', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ENTRENADOR_DT: true } },
  { modulo: 'CONVOCATORIAS', accion: 'RESPONDER_ASISTENCIA', descripcion: 'Confirmar o excusar citación', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ENTRENADOR_DT: true, PADRE_ACUDIENTE: 'OWN', JUGADOR: 'OWN' } },

  // BIOMETRIA
  { modulo: 'BIOMETRIA', accion: 'VER_MEDICIONES', descripcion: 'Ver historial antropométrico y físico', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ENTRENADOR_DT: true, PREPARADOR_FISICO: true, MEDICO_FISIO: true, PADRE_ACUDIENTE: 'OWN', JUGADOR: 'OWN' } },
  { modulo: 'BIOMETRIA', accion: 'REGISTRAR_ANTROPOMETRIA', descripcion: 'Ingresar pliegues, peso, talla y somatotipo', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, PREPARADOR_FISICO: true, MEDICO_FISIO: true } },
  { modulo: 'BIOMETRIA', accion: 'EDITAR_HISTORIAL_MEDICO', descripcion: 'Gestionar aptitud médica y lesiones', roles: { SUPER_ADMIN: true, MEDICO_FISIO: true } },

  // FINANZAS
  { modulo: 'FINANZAS', accion: 'VER_CARTERA_GLOBAL', descripcion: 'Ver balance general, recaudos y mora del club', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: 'RO', ADMIN_FINANCIERO: true } },
  { modulo: 'FINANZAS', accion: 'VER_ESTADO_PROPIO', descripcion: 'Ver recibos y pagos personales del jugador', roles: { PADRE_ACUDIENTE: 'OWN', JUGADOR: 'OWN', SUPER_ADMIN: true, ADMIN_FINANCIERO: true } },
  { modulo: 'FINANZAS', accion: 'REGISTRAR_PAGO', descripcion: 'Recibir pagos en caja o pasarela', roles: { SUPER_ADMIN: true, ADMIN_FINANCIERO: true } },
  { modulo: 'FINANZAS', accion: 'GENERAR_MENSUALIDADES', descripcion: 'Generación masiva de cobros de pensiones', roles: { SUPER_ADMIN: true, ADMIN_FINANCIERO: true } },
  { modulo: 'FINANZAS', accion: 'APLICAR_BECAS', descripcion: 'Asignar becas y descuentos a futbolistas', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ADMIN_FINANCIERO: true } },

  // CANCHAS
  { modulo: 'CANCHAS', accion: 'VER_CANCHAS', descripcion: 'Consultar escenarios y disponibilidad', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ENTRENADOR_DT: true, RECEPCION_LOGISTICA: true, PADRE_ACUDIENTE: 'RO' } },
  { modulo: 'CANCHAS', accion: 'CONFIGURAR_TARIFAS', descripcion: 'Definir precios diurnos/nocturnos', roles: { SUPER_ADMIN: true, ADMIN_FINANCIERO: true } },
  { modulo: 'CANCHAS', accion: 'CREAR_RESERVA', descripcion: 'Agendar turnos y reservas de cancha', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, RECEPCION_LOGISTICA: true, ENTRENADOR_DT: true } },
  { modulo: 'CANCHAS', accion: 'CANCELAR_RESERVA', descripcion: 'Anulación de reservas agendadas', roles: { SUPER_ADMIN: true, RECEPCION_LOGISTICA: true } },

  // TIENDA
  { modulo: 'TIENDA', accion: 'VER_CATALOGO', descripcion: 'Ver catálogo de indumentaria y artículos', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ENTRENADOR_DT: true, PADRE_ACUDIENTE: true, JUGADOR: true, RECEPCION_LOGISTICA: true, ADMIN_FINANCIERO: true } },
  { modulo: 'TIENDA', accion: 'GESTIONAR_PRODUCTOS', descripcion: 'Administrar stock, tallas y precios', roles: { SUPER_ADMIN: true, ADMIN_FINANCIERO: true, RECEPCION_LOGISTICA: true } },
  { modulo: 'TIENDA', accion: 'CREAR_PEDIDO', descripcion: 'Comprar o solicitar uniformes y balones', roles: { SUPER_ADMIN: true, PADRE_ACUDIENTE: true, JUGADOR: true, RECEPCION_LOGISTICA: true } },
  { modulo: 'TIENDA', accion: 'CAMBIAR_ESTADO_PEDIDO', descripcion: 'Marcar pedidos pagados o entregados', roles: { SUPER_ADMIN: true, ADMIN_FINANCIERO: true, RECEPCION_LOGISTICA: true } },

  // IA_GEMINI
  { modulo: 'IA_GEMINI', accion: 'GENERAR_PLANES_ENTRENAMIENTO', descripcion: 'Generar sesiones tácticas con IA', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ENTRENADOR_DT: true, PREPARADOR_FISICO: true } },
  { modulo: 'IA_GEMINI', accion: 'ANALISIS_TACTICO_PARTIDO', descripcion: 'Obtener insights tácticos post-partido', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ENTRENADOR_DT: true } },
  { modulo: 'IA_GEMINI', accion: 'PREDICCION_RENDIMIENTO', descripcion: 'Pronóstico de maduración y curva de forma', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, PREPARADOR_FISICO: true } },

  // SCOUTING
  { modulo: 'SCOUTING', accion: 'VER_PROSPECTOS', descripcion: 'Ver cantera externa y prospectos evaluados', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ENTRENADOR_DT: true } },
  { modulo: 'SCOUTING', accion: 'CREAR_PROSPECTO', descripcion: 'Registrar nuevo talento observado', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true } },
  { modulo: 'SCOUTING', accion: 'EVALUAR_HABILIDADES', descripcion: 'Calificar radar FIFA de 1 a 100', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ENTRENADOR_DT: true } },
  { modulo: 'SCOUTING', accion: 'APROBAR_FICHAJE', descripcion: 'Aprobar incorporación a categorías del club', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true } },

  // TELEMETRIA_GPS
  { modulo: 'TELEMETRIA_GPS', accion: 'VER_SESIONES_GPS', descripcion: 'Ver mapas de calor y distancias GPS', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true, ENTRENADOR_DT: true, PREPARADOR_FISICO: true, MEDICO_FISIO: true } },
  { modulo: 'TELEMETRIA_GPS', accion: 'IMPORTAR_DATOS_GPS', descripcion: 'Subir métricas de chalecos GPS', roles: { SUPER_ADMIN: true, PREPARADOR_FISICO: true, ENTRENADOR_DT: true } },
  { modulo: 'TELEMETRIA_GPS', accion: 'CONFIGURAR_UMBRALES_CARGA', descripcion: 'Ajustar índices de fatiga y ACWR', roles: { SUPER_ADMIN: true, PREPARADOR_FISICO: true } },

  // CONFIGURACION
  { modulo: 'CONFIGURACION', accion: 'GESTIONAR_MODULOS_ESCUELA', descripcion: 'Habilitar o desactivar módulos del club', roles: { SUPER_ADMIN: true } },
  { modulo: 'CONFIGURACION', accion: 'GESTIONAR_PARAMETROS', descripcion: 'Configurar parámetros globales y del club', roles: { SUPER_ADMIN: true, DIRECTOR_DEPORTIVO: true } },
  { modulo: 'CONFIGURACION', accion: 'GESTIONAR_ROLES_PERMISOS', descripcion: 'Modificar matriz RBAC de roles y accesos', roles: { SUPER_ADMIN: true } },
];

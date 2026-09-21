-- ============================================================================
-- FutCoreOS - ESQUEMA DE BASE DE DATOS POSTGRESQL (MULTI-TENANT)
-- Sistema Integral de Gestión para Escuelas, Clubes y Academias de Fútbol
-- Desarrollado por SECTIC S.A.S.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. ESQUEMA PÚBLICO: GESTIÓN MULTI-TENANT, USUARIOS Y AUTENTICACIÓN
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.clubes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    nit VARCHAR(30) UNIQUE,
    slug VARCHAR(60) UNIQUE NOT NULL,
    email_contacto VARCHAR(120) NOT NULL,
    telefono_contacto VARCHAR(30),
    ciudad VARCHAR(80) DEFAULT 'Bogotá D.C.',
    pais VARCHAR(50) DEFAULT 'Colombia',
    logo_url TEXT,
    color_primario VARCHAR(10) DEFAULT '#059669', -- Verde Esmeralda Fútbol
    color_secundario VARCHAR(10) DEFAULT '#0F172A',
    plan_suscripcion VARCHAR(30) DEFAULT 'PLAN_ACADEMIA_PRO', -- SEMILLERO, PRO, ELITE
    limite_jugadores INTEGER DEFAULT 180,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    documento_identidad VARCHAR(30),
    telefono VARCHAR(30),
    rol VARCHAR(40) NOT NULL, -- SUPER_ADMIN, DIRECTOR_CLUB, ENTRENADOR, PREPARADOR_FISICO, ACUDIENTE, JUGADOR
    avatar_url TEXT,
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.membresias_club (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    rol_en_club VARCHAR(40) NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_club_usuario UNIQUE (club_id, usuario_id)
);

-- ----------------------------------------------------------------------------
-- 2. INFRAESTRUCTURA DEPORTIVA: SEDES Y CANCHAS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.sedes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    nombre VARCHAR(120) NOT NULL,
    direccion VARCHAR(200) NOT NULL,
    ciudad VARCHAR(80) DEFAULT 'Bogotá D.C.',
    telefono VARCHAR(30),
    mapa_gps_url TEXT,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.canchas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sede_id UUID NOT NULL REFERENCES public.sedes(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    nombre VARCHAR(80) NOT NULL, -- Ej. Cancha Sintética 1, Cancha Césped Natural
    tipo_superficie VARCHAR(40) NOT NULL DEFAULT 'SINTETICA', -- SINTETICA, CESPED_NATURAL, COLISEO_MADERA, ARENA
    formato VARCHAR(20) NOT NULL DEFAULT 'FUTBOL_11', -- FUTBOL_5, FUTBOL_8, FUTBOL_9, FUTBOL_11
    tiene_iluminacion BOOLEAN DEFAULT true,
    es_techada BOOLEAN DEFAULT false,
    precio_hora_alquiler NUMERIC(12, 2) DEFAULT 0,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. GESTIÓN DEPORTIVA: CATEGORÍAS POR EDAD Y CUERPO TÉCNICO
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    nombre VARCHAR(80) NOT NULL, -- Ej. Sub-7 Semillero 2019, Sub-15 Élite 2011
    codigo_categoria VARCHAR(30) NOT NULL, -- SUB_7, SUB_9, SUB_11, SUB_13, SUB_15, SUB_17, SUB_20, MAYORES, FEMENINO
    anio_nacimiento_min INTEGER NOT NULL,
    anio_nacimiento_max INTEGER NOT NULL,
    rama VARCHAR(20) NOT NULL DEFAULT 'MASCULINO', -- MASCULINO, FEMENINO, MIXTO
    nivel_competencia VARCHAR(30) NOT NULL DEFAULT 'COMPETENCIA_LIGA', -- ESCUELA_BASE, COMPETENCIA_LIGA, ELITE_TORNEO
    director_tecnico_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    asistente_tecnico_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    color_distintivo VARCHAR(10) DEFAULT '#2563EB',
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 4. JUGADORES, FAMILIAS Y EXPEDIENTE MÉDICO/DEPORTIVO
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.jugadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    categoria_id UUID NOT NULL REFERENCES public.categorias(id) ON DELETE RESTRICT,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    nombres VARCHAR(80) NOT NULL,
    apellidos VARCHAR(80) NOT NULL,
    tipo_documento VARCHAR(20) DEFAULT 'TARJETA_IDENTIDAD', -- REGISTRO_CIVIL, TARJETA_IDENTIDAD, CEDULA_CIUDADANIA, PASAPORTE
    numero_documento VARCHAR(30) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(10) DEFAULT 'MASCULINO',
    foto_url TEXT,
    
    -- Perfil Técnico de Fútbol
    posicion_principal VARCHAR(40) NOT NULL, -- ARQUERO, DEF_CENTRAL, LAT_DERECHO, LAT_IZQUIERDO, VOL_MARCA, VOL_CREACION, EXT_DERECHO, EXT_IZQUIERDO, DEL_CENTRO
    posicion_secundaria VARCHAR(40),
    pierna_habil VARCHAR(20) NOT NULL DEFAULT 'DIESTRO', -- DIESTRO, ZURDO, AMBIDIESTRO
    numero_dorsal INTEGER,
    
    -- Datos Médicos y Seguro
    eps VARCHAR(80),
    poliza_accidentes VARCHAR(80),
    tipo_sangre_rh VARCHAR(10) DEFAULT 'O+',
    alergias_observaciones TEXT,
    
    -- Estado Administrativo
    estado_matricula VARCHAR(30) DEFAULT 'ACTIVO', -- ACTIVO, LESIONADO, SUSPENDIDO, RETIRADO
    fecha_ingreso DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_club_doc_jugador UNIQUE (club_id, numero_documento)
);

CREATE TABLE IF NOT EXISTS public.acudientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    usuario_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    nombres VARCHAR(80) NOT NULL,
    apellidos VARCHAR(80) NOT NULL,
    documento_identidad VARCHAR(30) NOT NULL,
    parentesco VARCHAR(30) DEFAULT 'PADRE', -- PADRE, MADRE, TUTOR_LEGAL, ABUELO, TIO, OTRO
    telefono_principal VARCHAR(30) NOT NULL,
    telefono_secundario VARCHAR(30),
    email VARCHAR(120),
    direccion_residencia VARCHAR(180),
    ocupacion VARCHAR(80),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.jugador_acudientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jugador_id UUID NOT NULL REFERENCES public.jugadores(id) ON DELETE CASCADE,
    acudiente_id UUID NOT NULL REFERENCES public.acudientes(id) ON DELETE CASCADE,
    es_contacto_principal BOOLEAN DEFAULT true,
    autorizado_recoger BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_jugador_acudiente UNIQUE (jugador_id, acudiente_id)
);

-- ----------------------------------------------------------------------------
-- 5. BIOMETRÍA Y EVALUACIÓN FÍSICO-TÉCNICA
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.evaluaciones_biometricas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    jugador_id UUID NOT NULL REFERENCES public.jugadores(id) ON DELETE CASCADE,
    evaluador_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    fecha_evaluacion DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Antropometría
    peso_kg NUMERIC(5, 2) NOT NULL,
    talla_cm NUMERIC(5, 2) NOT NULL,
    imc NUMERIC(4, 1) GENERATED ALWAYS AS (peso_kg / ((talla_cm / 100) * (talla_cm / 100))) STORED,
    envergadura_cm NUMERIC(5, 2),
    porcentaje_grasa NUMERIC(4, 1),
    
    -- Tests de Aptitud Física
    test_cooper_metros INTEGER, -- Resistencia aeróbica
    test_velocidad_30m_seg NUMERIC(4, 2), -- Sprint
    test_salto_vertical_cm NUMERIC(4, 1), -- Potencia tren inferior
    test_flexibilidad_cm NUMERIC(4, 1),
    ritmo_cardiaco_reposo_bpm INTEGER,
    
    observaciones_medicas TEXT,
    recomendaciones_nutricion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.evaluaciones_tecnicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    jugador_id UUID NOT NULL REFERENCES public.jugadores(id) ON DELETE CASCADE,
    evaluador_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    periodo_evaluado VARCHAR(30) NOT NULL, -- TRIMESTRE_1, TRIMESTRE_2, TRIMESTRE_3, SEMESTRE_FINAL
    fecha_evaluacion DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Calificaciones Escala 1.0 a 5.0
    pase_calificacion NUMERIC(2, 1) CHECK (pase_calificacion BETWEEN 1.0 AND 5.0),
    control_balon_calificacion NUMERIC(2, 1) CHECK (control_balon_calificacion BETWEEN 1.0 AND 5.0),
    remate_calificacion NUMERIC(2, 1) CHECK (remate_calificacion BETWEEN 1.0 AND 5.0),
    conduccion_calificacion NUMERIC(2, 1) CHECK (conduccion_calificacion BETWEEN 1.0 AND 5.0),
    vision_juego_calificacion NUMERIC(2, 1) CHECK (vision_juego_calificacion BETWEEN 1.0 AND 5.0),
    posicionamiento_taktico NUMERIC(2, 1) CHECK (posicionamiento_taktico BETWEEN 1.0 AND 5.0),
    disciplina_actitud NUMERIC(2, 1) CHECK (disciplina_actitud BETWEEN 1.0 AND 5.0),
    trabajo_equipo NUMERIC(2, 1) CHECK (trabajo_equipo BETWEEN 1.0 AND 5.0),
    
    promedio_general NUMERIC(3, 2),
    comentario_director_tecnico TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. TORNEOS, PARTIDOS, CONVOCATORIAS Y ACTAS DE JUEGO
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.torneos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    categoria_id UUID NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
    nombre VARCHAR(120) NOT NULL, -- Ej. Liga de Bogotá 2026, Torneo Arrayanes Sub-13
    entidad_organizadora VARCHAR(80) DEFAULT 'LIGA_DEPARTAMENTAL', -- DIFUTBOL, LIGA_BOGOTA, ARRAYANES, BABY_FUTBOL
    anio_temporada INTEGER DEFAULT 2026,
    estado VARCHAR(30) DEFAULT 'EN_CURSO', -- PROXIMO, EN_CURSO, FINALIZADO
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.partidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    torneo_id UUID REFERENCES public.torneos(id) ON DELETE SET NULL,
    categoria_id UUID NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
    rival_nombre VARCHAR(120) NOT NULL,
    rival_escudo_url TEXT,
    fecha_partido DATE NOT NULL,
    hora_partido TIME NOT NULL,
    hora_citacion_calentamiento TIME NOT NULL,
    sede_cancha VARCHAR(150) NOT NULL,
    direccion_cancha VARCHAR(200),
    mapa_gps_url TEXT,
    condicion_juego VARCHAR(20) DEFAULT 'LOCAL', -- LOCAL, VISITANTE, CANCHA_NEUTRAL
    uniforme_a_usar VARCHAR(30) DEFAULT 'TITULAR', -- TITULAR, ALTERNO, ENTRENAMIENTO
    goles_club INTEGER DEFAULT 0,
    goles_rival INTEGER DEFAULT 0,
    estado_partido VARCHAR(30) DEFAULT 'PROGRAMADO', -- PROGRAMADO, EN_JUEGO, FINALIZADO, APLAZADO, CANCELADO
    observaciones_dt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.convocatorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    partido_id UUID NOT NULL REFERENCES public.partidos(id) ON DELETE CASCADE,
    entrenador_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
    titulo VARCHAR(120) NOT NULL,
    mensaje_indicaciones TEXT,
    fecha_limite_confirmacion TIMESTAMP WITH TIME ZONE,
    creada_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.convocatoria_jugadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    convocatoria_id UUID NOT NULL REFERENCES public.convocatorias(id) ON DELETE CASCADE,
    jugador_id UUID NOT NULL REFERENCES public.jugadores(id) ON DELETE CASCADE,
    rol_convocatoria VARCHAR(30) NOT NULL DEFAULT 'TITULAR', -- TITULAR, SUPLENTE, RESERVA, NO_CONVOCADO
    dorsal_partido INTEGER,
    estado_confirmacion VARCHAR(30) DEFAULT 'PENDIENTE', -- PENDIENTE, CONFIRMADO, EXCUSADO_NO_ASISTE
    motivo_excusa TEXT,
    fecha_respuesta TIMESTAMP WITH TIME ZONE,
    CONSTRAINT uq_convocatoria_jugador UNIQUE (convocatoria_id, jugador_id)
);

CREATE TABLE IF NOT EXISTS public.actas_partido_eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partido_id UUID NOT NULL REFERENCES public.partidos(id) ON DELETE CASCADE,
    jugador_id UUID REFERENCES public.jugadores(id) ON DELETE SET NULL,
    tipo_evento VARCHAR(30) NOT NULL, -- GOL, ASISTENCIA, TARJETA_AMARILLA, TARJETA_ROJA, CAMBIO_ENTRA, CAMBIO_SALE, AUTOGOL, MVP_PARTIDO
    minuto_juego INTEGER CHECK (minuto_juego BETWEEN 1 AND 120),
    periodo VARCHAR(20) DEFAULT 'SEGUNDO_TIEMPO', -- PRIMER_TIEMPO, SEGUNDO_TIEMPO, TIEMPO_EXTRA, PENALES
    jugador_relacionado_id UUID REFERENCES public.jugadores(id) ON DELETE SET NULL, -- Para asistencias o cambios
    comentario TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. ENTRENAMIENTOS Y ASISTENCIAS
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.sesiones_entrenamiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    categoria_id UUID NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
    cancha_id UUID REFERENCES public.canchas(id) ON DELETE SET NULL,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    microciclo_tema VARCHAR(150), -- Ej. Transición Defensa-Ataque, Táctico Fijo
    intensidad VARCHAR(20) DEFAULT 'MEDIA', -- BAJA, MEDIA, ALTA, RECUPERACION
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.asistencia_entrenamientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sesion_id UUID NOT NULL REFERENCES public.sesiones_entrenamiento(id) ON DELETE CASCADE,
    jugador_id UUID NOT NULL REFERENCES public.jugadores(id) ON DELETE CASCADE,
    estado VARCHAR(30) NOT NULL DEFAULT 'PRESENTE', -- PRESENTE, AUSENTE_INJUSTIFICADO, EXCUSA_MEDICA, LESIONADO
    observacion VARCHAR(150),
    CONSTRAINT uq_sesion_jugador UNIQUE (sesion_id, jugador_id)
);

-- ----------------------------------------------------------------------------
-- 8. FINANZAS, FACTURACIÓN, COBROS PSE/WOMPI Y CARTERA
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.finanzas_conceptos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    codigo VARCHAR(30) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(30) NOT NULL, -- MATRICULA, PENSION_MENSUAL, ARBITRAJE, UNIFORME, CARNET_LIGA, SEGURO_MEDICO, TRANSPORTE
    valor_base NUMERIC(12, 2) NOT NULL,
    es_recurrente_mensual BOOLEAN DEFAULT false,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cargos_jugador (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    jugador_id UUID NOT NULL REFERENCES public.jugadores(id) ON DELETE CASCADE,
    concepto_id UUID NOT NULL REFERENCES public.finanzas_conceptos(id) ON DELETE RESTRICT,
    periodo_mes INTEGER CHECK (periodo_mes BETWEEN 1 AND 12),
    periodo_anio INTEGER NOT NULL,
    monto_total NUMERIC(12, 2) NOT NULL,
    monto_descuento_beca NUMERIC(12, 2) DEFAULT 0,
    monto_pagado NUMERIC(12, 2) DEFAULT 0,
    saldo_pendiente NUMERIC(12, 2) GENERATED ALWAYS AS (monto_total - monto_descuento_beca - monto_pagado) STORED,
    fecha_limite_pago DATE NOT NULL,
    estado_pago VARCHAR(30) DEFAULT 'PENDIENTE', -- PENDIENTE, PAGADO_PARCIAL, PAGADO_TOTAL, ANULADO, EN_MORA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pagos_recaudo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    cargo_id UUID NOT NULL REFERENCES public.cargos_jugador(id) ON DELETE CASCADE,
    acudiente_id UUID REFERENCES public.acudientes(id) ON DELETE SET NULL,
    monto_pagado NUMERIC(12, 2) NOT NULL,
    metodo_pago VARCHAR(40) NOT NULL, -- PSE, WOMPI, NEQUI, DAVIPLATA, TRANSFERENCIA_BANCARIA, EFECTIVO, TARJETA
    referencia_transaccion VARCHAR(100) UNIQUE,
    id_pasarela VARCHAR(100),
    estado_transaccion VARCHAR(30) DEFAULT 'APROBADA', -- APROBADA, PENDIENTE, RECHAZADA, REVERSADA
    comprobante_url TEXT,
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    usuario_registro_id UUID REFERENCES public.usuarios(id) ON DELETE SET NULL
);

-- ----------------------------------------------------------------------------
-- 9. TIENDA DE INDUMENTARIA Y CONTROL DE DORSALES
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.inventario_indumentaria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    nombre_articulo VARCHAR(100) NOT NULL,
    tipo_prenda VARCHAR(40) NOT NULL, -- KIT_TITULAR, KIT_ALTERNO, SUDADERA, PETO, MEDIAS, TULA_BALONES
    talla VARCHAR(20) NOT NULL, -- T4, T6, T8, T10, T12, T14, T16, S, M, L, XL
    stock_disponible INTEGER NOT NULL DEFAULT 0,
    precio_venta NUMERIC(12, 2) NOT NULL,
    activo BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.dorsales_categoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    categoria_id UUID NOT NULL REFERENCES public.categorias(id) ON DELETE CASCADE,
    numero_dorsal INTEGER NOT NULL CHECK (numero_dorsal BETWEEN 1 AND 99),
    jugador_id UUID NOT NULL REFERENCES public.jugadores(id) ON DELETE CASCADE,
    temporada_anio INTEGER DEFAULT 2026,
    asignado_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_categoria_dorsal UNIQUE (categoria_id, numero_dorsal, temporada_anio)
);

-- ----------------------------------------------------------------------------
-- 10. ÍNDICES DE ALTO RENDIMIENTO
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_jugadores_club_cat ON public.jugadores(club_id, categoria_id);
CREATE INDEX IF NOT EXISTS idx_jugadores_doc ON public.jugadores(numero_documento);
CREATE INDEX IF NOT EXISTS idx_cargos_jugador_estado ON public.cargos_jugador(club_id, estado_pago, fecha_limite_pago);
CREATE INDEX IF NOT EXISTS idx_partidos_club_fecha ON public.partidos(club_id, fecha_partido);
CREATE INDEX IF NOT EXISTS idx_convocatorias_partido ON public.convocatorias(partido_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_sesion ON public.asistencia_entrenamientos(sesion_id, jugador_id);
CREATE INDEX IF NOT EXISTS idx_biometria_jugador ON public.evaluaciones_biometricas(jugador_id, fecha_evaluacion DESC);

COMMENT ON TABLE public.clubes IS 'Tenants principales: Escuelas, Clubes y Academias de Fútbol';
COMMENT ON TABLE public.categorias IS 'Categorías por edades y años de nacimiento formativos (Sub-7 a Sub-20)';
COMMENT ON TABLE public.jugadores IS 'Ficha deportiva, técnica, médica y de matrícula del jugador';
COMMENT ON TABLE public.evaluaciones_biometricas IS 'Historial antropométrico y pruebas físicas (Cooper, velocidad, salto)';
COMMENT ON TABLE public.partidos IS 'Fixture oficial de partidos, convocatorias y actas digitales';
COMMENT ON TABLE public.cargos_jugador IS 'Cobro de pensiones mensuales, matrículas, arbitrajes y pasarelas PSE/Wompi';

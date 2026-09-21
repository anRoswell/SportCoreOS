-- ============================================================================
-- SPORTCOREOS - ESQUEMA MODULAR ENTERPRISE POSTGRESQL DDL
-- Arquitectura DDD (Domain-Driven Design) por Schemas Temáticos
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CREACIÓN DE ESQUEMAS MODULARES
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS deportivo;
CREATE SCHEMA IF NOT EXISTS competicion;
CREATE SCHEMA IF NOT EXISTS rendimiento;
CREATE SCHEMA IF NOT EXISTS finanzas;
CREATE SCHEMA IF NOT EXISTS operaciones;

-- ============================================================================
-- SCHEMA: core (Identidad, Clubes Multi-Tenant, Usuarios y Seguridad)
-- ============================================================================

-- 1.1 CLUBES / ACADEMIAS MULTI-TENANT
CREATE TABLE IF NOT EXISTS core.clubes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(150) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    sigla VARCHAR(10) NOT NULL,
    ciudad VARCHAR(100) NOT NULL DEFAULT 'Bogotá D.C.',
    pais VARCHAR(50) NOT NULL DEFAULT 'Colombia',
    logo_url TEXT,
    plan VARCHAR(50) NOT NULL DEFAULT 'Plan Élite Pro',
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    configuracion_json JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.2 USUARIOS DEL SISTEMA
CREATE TABLE IF NOT EXISTS core.usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'ENTRENADOR_DT',
    telefono VARCHAR(30),
    avatar_url TEXT,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3 MEMBRESÍAS / VÍNCULOS USUARIO - CLUB
CREATE TABLE IF NOT EXISTS core.membresias_club (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES core.usuarios(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES core.clubes(id) ON DELETE CASCADE,
    rol_club VARCHAR(50) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, club_id)
);

-- ============================================================================
-- SCHEMA: deportivo (Categorías, Fichas de Jugadores y Familias)
-- ============================================================================

-- 2.1 CATEGORÍAS DEPORTIVAS
CREATE TABLE IF NOT EXISTS deportivo.categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES core.clubes(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    codigo_categoria VARCHAR(30) NOT NULL,
    anio_nacimiento_min INT NOT NULL,
    anio_nacimiento_max INT NOT NULL,
    rama VARCHAR(20) NOT NULL DEFAULT 'MASCULINO',
    nivel_competencia VARCHAR(50) NOT NULL DEFAULT 'COMPETITIVO',
    color_distintivo VARCHAR(20) DEFAULT '#10B981',
    director_tecnico_id UUID REFERENCES core.usuarios(id) ON DELETE SET NULL,
    preparador_fisico_id UUID REFERENCES core.usuarios(id) ON DELETE SET NULL,
    cupo_maximo INT NOT NULL DEFAULT 25,
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(club_id, codigo_categoria)
);

-- 2.2 JUGADORES / ALUMNOS
CREATE TABLE IF NOT EXISTS deportivo.jugadores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES core.clubes(id) ON DELETE CASCADE,
    categoria_id UUID NOT NULL REFERENCES deportivo.categorias(id) ON DELETE RESTRICT,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    tipo_documento VARCHAR(20) NOT NULL DEFAULT 'TI',
    numero_documento VARCHAR(30) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    genero VARCHAR(20) NOT NULL DEFAULT 'MASCULINO',
    foto_url TEXT,
    posicion_principal VARCHAR(50) NOT NULL,
    posicion_secundaria VARCHAR(50),
    pierna_habil VARCHAR(20) NOT NULL DEFAULT 'DIESTRO',
    numero_dorsal INT CHECK(numero_dorsal >= 1 AND numero_dorsal <= 99),
    eps VARCHAR(100) DEFAULT 'EPS Sanitas',
    estado_matricula VARCHAR(30) NOT NULL DEFAULT 'ACTIVO',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(club_id, numero_documento),
    UNIQUE(club_id, categoria_id, numero_dorsal)
);

-- 2.3 ACUDIENTES / FAMILIAS
CREATE TABLE IF NOT EXISTS deportivo.acudientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES core.usuarios(id) ON DELETE SET NULL,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    tipo_documento VARCHAR(20) NOT NULL DEFAULT 'CC',
    numero_documento VARCHAR(30) NOT NULL,
    telefono_movil VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    parentesco VARCHAR(50) NOT NULL DEFAULT 'PADRE',
    direccion_residencia TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2.4 VÍNCULO: JUGADOR - ACUDIENTES
CREATE TABLE IF NOT EXISTS deportivo.jugador_acudientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jugador_id UUID NOT NULL REFERENCES deportivo.jugadores(id) ON DELETE CASCADE,
    acudiente_id UUID NOT NULL REFERENCES deportivo.acudientes(id) ON DELETE CASCADE,
    es_contacto_principal BOOLEAN NOT NULL DEFAULT TRUE,
    autorizado_recoger BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(jugador_id, acudiente_id)
);

-- ============================================================================
-- SCHEMA: competicion (Torneos, Fixture, Convocatorias y Actas en Vivo)
-- ============================================================================

-- 3.1 PARTIDOS & FIXTURE
CREATE TABLE IF NOT EXISTS competicion.partidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES core.clubes(id) ON DELETE CASCADE,
    categoria_id UUID NOT NULL REFERENCES deportivo.categorias(id) ON DELETE CASCADE,
    torneo_id UUID,
    rival_nombre VARCHAR(150) NOT NULL,
    fecha_partido DATE NOT NULL,
    hora_partido TIME NOT NULL,
    hora_citacion TIME NOT NULL,
    sede_cancha VARCHAR(150) NOT NULL,
    latitud NUMERIC(10,7),
    longitud NUMERIC(10,7),
    condicion_juego VARCHAR(20) NOT NULL DEFAULT 'LOCAL',
    indumentaria_kit VARCHAR(100) DEFAULT 'Kit Titular (Esmeralda)',
    estado_partido VARCHAR(30) NOT NULL DEFAULT 'PROGRAMADO',
    goles_club INT DEFAULT 0,
    goles_rival INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3.2 CONVOCATORIAS
CREATE TABLE IF NOT EXISTS competicion.convocatorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partido_id UUID NOT NULL REFERENCES competicion.partidos(id) ON DELETE CASCADE,
    jugador_id UUID NOT NULL REFERENCES deportivo.jugadores(id) ON DELETE CASCADE,
    rol_convocatoria VARCHAR(30) NOT NULL DEFAULT 'TITULAR',
    posicion_designada VARCHAR(50),
    estado_confirmacion VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    fecha_confirmacion TIMESTAMP WITH TIME ZONE,
    motivo_excusa TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(partido_id, jugador_id)
);

-- 3.3 EVENTOS DE ACTA DE PARTIDO
CREATE TABLE IF NOT EXISTS competicion.actas_partido_eventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partido_id UUID NOT NULL REFERENCES competicion.partidos(id) ON DELETE CASCADE,
    jugador_id UUID REFERENCES deportivo.jugadores(id) ON DELETE SET NULL,
    tipo_evento VARCHAR(50) NOT NULL, -- GOL, ASISTENCIA, TARJETA_AMARILLA, TARJETA_ROJA, CAMBIO
    minuto_juego INT NOT NULL,
    observacion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SCHEMA: rendimiento (Biometría, Antropometría & Telemetría)
-- ============================================================================

-- 4.1 EVALUACIONES BIOMÉTRICAS
CREATE TABLE IF NOT EXISTS rendimiento.evaluaciones_biometricas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    jugador_id UUID NOT NULL REFERENCES deportivo.jugadores(id) ON DELETE CASCADE,
    evaluador_id UUID REFERENCES core.usuarios(id) ON DELETE SET NULL,
    fecha_evaluacion DATE NOT NULL DEFAULT CURRENT_DATE,
    peso_kg NUMERIC(5,2) NOT NULL,
    talla_cm NUMERIC(5,2) NOT NULL,
    imc NUMERIC(4,1) NOT NULL,
    test_cooper_metros INT,
    velocidad_30m_seg NUMERIC(4,2),
    salto_vertical_cm NUMERIC(5,2),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- SCHEMA: finanzas (Conceptos, Cobros PSE/Wompi, Pensiones y Becas)
-- ============================================================================

-- 5.1 CONCEPTOS FINANCIEROS
CREATE TABLE IF NOT EXISTS finanzas.conceptos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES core.clubes(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'MENSUALIDAD',
    monto_base NUMERIC(12,2) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5.2 CARGOS POR JUGADOR / PENSIONES
CREATE TABLE IF NOT EXISTS finanzas.cargos_jugador (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES core.clubes(id) ON DELETE CASCADE,
    jugador_id UUID NOT NULL REFERENCES deportivo.jugadores(id) ON DELETE CASCADE,
    concepto_id UUID NOT NULL REFERENCES finanzas.conceptos(id) ON DELETE RESTRICT,
    periodo_mes INT NOT NULL,
    periodo_anio INT NOT NULL,
    monto_total NUMERIC(12,2) NOT NULL,
    monto_descuento_beca NUMERIC(12,2) NOT NULL DEFAULT 0,
    monto_pagado NUMERIC(12,2) NOT NULL DEFAULT 0,
    saldo_pendiente NUMERIC(12,2) NOT NULL,
    estado_pago VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
    fecha_emision DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_limite_pago DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(club_id, jugador_id, concepto_id, periodo_mes, periodo_anio)
);

-- ============================================================================
-- SCHEMA: deportivo (Extensiones: Canchas, Reservas, Tienda & Inventario)
-- ============================================================================

-- 6.1 CANCHAS & ESCENARIOS
CREATE TABLE IF NOT EXISTS deportivo.canchas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES core.clubes(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    tipo_superficie VARCHAR(50) NOT NULL DEFAULT 'sintetica_f8',
    precio_hora_diurna NUMERIC(12,2) NOT NULL DEFAULT 80000,
    precio_hora_nocturna NUMERIC(12,2) NOT NULL DEFAULT 120000,
    hora_apertura TIME NOT NULL DEFAULT '06:00',
    hora_cierre TIME NOT NULL DEFAULT '23:00',
    activa BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6.2 RESERVAS DE CANCHAS
CREATE TABLE IF NOT EXISTS deportivo.reservas_cancha (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cancha_id UUID NOT NULL REFERENCES deportivo.canchas(id) ON DELETE CASCADE,
    fecha_reserva DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    tipo_reserva VARCHAR(30) NOT NULL DEFAULT 'alquiler_particular',
    cliente_nombre VARCHAR(120),
    cliente_telefono VARCHAR(30),
    monto_total NUMERIC(12,2) NOT NULL DEFAULT 0,
    monto_anticipo NUMERIC(12,2) NOT NULL DEFAULT 0,
    estado_pago VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    estado_turno VARCHAR(30) NOT NULL DEFAULT 'confirmado',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6.3 PRODUCTOS DE TIENDA
CREATE TABLE IF NOT EXISTS deportivo.productos_tienda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES core.clubes(id) ON DELETE CASCADE,
    codigo_sku VARCHAR(50) NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    categoria VARCHAR(50) NOT NULL DEFAULT 'uniforme_oficial',
    precio_venta NUMERIC(12,2) NOT NULL DEFAULT 0,
    foto_url TEXT,
    personalizable BOOLEAN NOT NULL DEFAULT FALSE,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6.4 VARIANTES DE PRODUCTO (TALLAS & STOCK)
CREATE TABLE IF NOT EXISTS deportivo.variantes_producto (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID NOT NULL REFERENCES deportivo.productos_tienda(id) ON DELETE CASCADE,
    talla VARCHAR(10) NOT NULL,
    stock_actual INT NOT NULL DEFAULT 0,
    stock_minimo_alerta INT NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6.5 PEDIDOS DE TIENDA & DESPACHOS
CREATE TABLE IF NOT EXISTS deportivo.pedidos_tienda (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID NOT NULL REFERENCES core.clubes(id) ON DELETE CASCADE,
    variante_id UUID NOT NULL REFERENCES deportivo.variantes_producto(id) ON DELETE RESTRICT,
    jugador_id UUID REFERENCES deportivo.jugadores(id) ON DELETE SET NULL,
    cantidad INT NOT NULL DEFAULT 1,
    precio_unitario NUMERIC(12,2) NOT NULL,
    monto_total NUMERIC(12,2) NOT NULL,
    estampado_nombre VARCHAR(50),
    estampado_dorsal INT,
    comprador_nombre VARCHAR(120),
    comprador_telefono VARCHAR(30),
    estado_pago VARCHAR(30) NOT NULL DEFAULT 'PAGADO',
    estado_despacho VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE_ENTREGA',
    recibido_por VARCHAR(100),
    fecha_entrega TIMESTAMP WITH TIME ZONE,
    metodo_pago VARCHAR(50) DEFAULT 'WOMPI_PSE',
    codigo_qr VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


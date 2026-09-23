-- ============================================================================
-- SPORTCOREOS — SERVICIOS ESPECIALIZADOS, CLÍNICAS Y MASTERCLASSES PRO
-- Módulo de Upsell y Especialización Técnica/Física para Academias
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.servicios_especializados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    titulo VARCHAR(120) NOT NULL,
    subtitulo VARCHAR(150) NOT NULL,
    categoria_servicio VARCHAR(50) NOT NULL, -- VELOCIDAD_EXPLOSIVIDAD, COORDINACION_AGILIDAD, TECNICA_REGATE, ARQUEROS_ELITE, DEFINICION_TIRO, PREVENCION_FISICA
    icono VARCHAR(50) DEFAULT 'fa-bolt',
    color_tema VARCHAR(20) DEFAULT '#10b981',
    entrenador_nombre VARCHAR(100) NOT NULL,
    entrenador_avatar VARCHAR(255),
    entrenador_badge VARCHAR(80) DEFAULT 'Entrenador Certificado',
    cancha_nombre VARCHAR(120) NOT NULL,
    cancha_direccion VARCHAR(200) NOT NULL,
    cancha_gps_url TEXT,
    dias_semana VARCHAR(100) NOT NULL,
    horario_rango VARCHAR(60) NOT NULL,
    duracion_minutos INTEGER DEFAULT 90,
    edad_min INTEGER DEFAULT 7,
    edad_max INTEGER DEFAULT 16,
    cupos_totales INTEGER DEFAULT 15,
    cupos_ocupados INTEGER DEFAULT 0,
    precio_sesion_individual NUMERIC(12, 2) NOT NULL DEFAULT 35000,
    precio_paquete_mensual NUMERIC(12, 2) NOT NULL DEFAULT 140000,
    descuento_hermanos_pct INTEGER DEFAULT 15,
    insignia_obtenida VARCHAR(80) NOT NULL,
    descripcion TEXT NOT NULL,
    beneficios JSONB DEFAULT '[]'::jsonb,
    destacado BOOLEAN DEFAULT true,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inscripciones_servicios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    servicio_id UUID NOT NULL REFERENCES public.servicios_especializados(id) ON DELETE CASCADE,
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    jugador_id UUID REFERENCES public.jugadores(id) ON DELETE SET NULL,
    nombre_jugador VARCHAR(120) NOT NULL,
    nombre_acudiente VARCHAR(120) NOT NULL,
    telefono_acudiente VARCHAR(30) NOT NULL,
    email_acudiente VARCHAR(100),
    tipo_plan VARCHAR(30) NOT NULL DEFAULT 'PAQUETE_MENSUAL', -- SESION_INDIVIDUAL, PAQUETE_MENSUAL, BOOTCAMP_INTENSIVO
    monto_pagado NUMERIC(12, 2) NOT NULL,
    metodo_pago VARCHAR(40) NOT NULL DEFAULT 'WOMPI_PSE', -- WOMPI_PSE, NEQUI, DAVIPLATA, TARJETA_CREDITO, EFECTIVO_SEDE
    referencia_transaccion VARCHAR(100) NOT NULL,
    codigo_qr_ticket VARCHAR(100) NOT NULL,
    estado_pago VARCHAR(30) DEFAULT 'APROBADO', -- APROBADO, PENDIENTE, RECHAZADO
    fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_servicios_club ON public.servicios_especializados(club_id);
CREATE INDEX IF NOT EXISTS idx_servicios_categoria ON public.servicios_especializados(categoria_servicio);
CREATE INDEX IF NOT EXISTS idx_inscripciones_servicio ON public.inscripciones_servicios(servicio_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_club ON public.inscripciones_servicios(club_id);

-- ----------------------------------------------------------------------------
-- SEEDS: CLÍNICAS Y SERVICIOS DE ÉLITE INICIALES (CLUB FUTUROS CRACKS FC)
-- ----------------------------------------------------------------------------

DO $$
DECLARE
    v_club_id UUID;
BEGIN
    SELECT id INTO v_club_id FROM public.clubes LIMIT 1;

    IF v_club_id IS NOT NULL THEN
        -- 1. Explosividad para Niños (Sprint & Reacción Pura)
        INSERT INTO public.servicios_especializados (
            club_id, titulo, subtitulo, categoria_servicio, icono, color_tema,
            entrenador_nombre, entrenador_avatar, entrenador_badge,
            cancha_nombre, cancha_direccion, cancha_gps_url,
            dias_semana, horario_rango, duracion_minutos, edad_min, edad_max,
            cupos_totales, cupos_ocupados, precio_sesion_individual, precio_paquete_mensual,
            descuento_hermanos_pct, insignia_obtenida, descripcion, beneficios, destacado
        ) VALUES (
            v_club_id,
            'Explosividad & Sprint Pura para Niños',
            'Desarrollo de aceleración, reacción isométrica y primer paso devastador',
            'VELOCIDAD_EXPLOSIVIDAD',
            'fa-bolt',
            '#10b981',
            'Prof. Carlos Valderrama',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
            'Preparador Físico FIFA Pro',
            'Cancha de Fútbol Alameda La Victoria',
            'Alameda La Victoria Manzana 12, Cartagena',
            'https://maps.google.com/?q=10.389510,-75.488210',
            'Martes y Jueves',
            '04:30 PM - 06:00 PM',
            90, 7, 12,
            15, 11,
            38000, 145000, 15,
            '⚡ Rayo de Aceleración Sub-12',
            'Programa intensivo de bio-mecánica de carrera con fotocélulas láser y paracaídas de resistencia. Diseñado para ganar los duelos de velocidad en los primeros 5 metros.',
            '["Medición de velocidad con sensores fotoeléctricos", "Corrección de técnica de zancada y braceo", "Ejercicios pliométricos seguros para cartílago infantil", "Certificado de velocidad con percentil nacional"]'::jsonb,
            true
        );

        -- 2. Coordinación & Agilidad Neuro-Motriz Élite
        INSERT INTO public.servicios_especializados (
            club_id, titulo, subtitulo, categoria_servicio, icono, color_tema,
            entrenador_nombre, entrenador_avatar, entrenador_badge,
            cancha_nombre, cancha_direccion, cancha_gps_url,
            dias_semana, horario_rango, duracion_minutos, edad_min, edad_max,
            cupos_totales, cupos_ocupados, precio_sesion_individual, precio_paquete_mensual,
            descuento_hermanos_pct, insignia_obtenida, descripcion, beneficios, destacado
        ) VALUES (
            v_club_id,
            'Coordinación & Agilidad Neuro-Motriz Élite',
            'Reflejos visuales con luces estroboscópicas, escaleras y cambios de dirección 360°',
            'COORDINACION_AGILIDAD',
            'fa-brain',
            '#06b6d4',
            'Dra. Diana Morales',
            'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
            'Especialista en Neuro-Motricidad',
            'Cancha de Fútbol Manga / Polideportivo',
            'Calle 26 (Av. Miramar) con Carrera 21, Manga',
            'https://maps.google.com/?q=10.412810,-75.538520',
            'Lunes y Miércoles',
            '05:00 PM - 06:30 PM',
            90, 8, 15,
            12, 9,
            40000, 150000, 10,
            '🧠 Mente Ágil & Control 360°',
            'Entrenamiento cognitivo-motor usando pods de luces Fitlight. Estimula la toma de decisiones ultra-rápida bajo presión y la propiocepción del tren inferior.',
            '["Mejora del tiempo de reacción en un 35%", "Trabajo de apoyos rápidos y equilibrio dinámico", "Prevención activa de torceduras de tobillo", "Informe de agilidad cognitiva para acudientes"]'::jsonb,
            true
        );

        -- 3. Regateo & Dribbling a lo Ronaldo / Vinicius
        INSERT INTO public.servicios_especializados (
            club_id, titulo, subtitulo, categoria_servicio, icono, color_tema,
            entrenador_nombre, entrenador_avatar, entrenador_badge,
            cancha_nombre, cancha_direccion, cancha_gps_url,
            dias_semana, horario_rango, duracion_minutos, edad_min, edad_max,
            cupos_totales, cupos_ocupados, precio_sesion_individual, precio_paquete_mensual,
            descuento_hermanos_pct, insignia_obtenida, descripcion, beneficios, destacado
        ) VALUES (
            v_club_id,
            'Masterclass: Regateo 1v1 a lo Ronaldo & Vinicius',
            'Dominio de bicicletas, fintas de cadera, cambio de ritmo y desborde en el mano a mano',
            'TECNICA_REGATE',
            'fa-wand-magic-sparkles',
            '#f59e0b',
            'Prof. Mario Yepes',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
            'Director Técnico Conmebol Pro',
            'Cancha San Fernando (La Monumental)',
            'Calle 15 con Carrera 81, San Fernando',
            'https://maps.google.com/?q=10.392010,-75.489020',
            'Viernes y Sábados',
            '04:00 PM - 05:30 PM',
            90, 9, 17,
            14, 12,
            45000, 160000, 15,
            '🪄 Maestro del Desborde 1v1',
            'Clínica intensiva de fundamentos de regate sudamericano y europeo: amagues, pisadas de balón, conducción con empeine exterior y finalización tras desborde.',
            '["Secretos del 1v1 ofensivo en banda y pasillo central", "Uso del cuerpo para proteger la posesión", "Vídeo-análisis táctico de jugadas de regate", "Reto de habilidades con trofeo al MVP de la clínica"]'::jsonb,
            true
        );

        -- 4. Clínica de Arqueros: Reflejos & Guante de Oro
        INSERT INTO public.servicios_especializados (
            club_id, titulo, subtitulo, categoria_servicio, icono, color_tema,
            entrenador_nombre, entrenador_avatar, entrenador_badge,
            cancha_nombre, cancha_direccion, cancha_gps_url,
            dias_semana, horario_rango, duracion_minutos, edad_min, edad_max,
            cupos_totales, cupos_ocupados, precio_sesion_individual, precio_paquete_mensual,
            descuento_hermanos_pct, insignia_obtenida, descripcion, beneficios, destacado
        ) VALUES (
            v_club_id,
            'Clínica de Arqueros: Reflejos & Guante de Oro',
            'Vuelo lateral, achiques 1v1, juego con los pies y despejes en balones aéreos',
            'ARQUEROS_ELITE',
            'fa-mitten',
            '#ec4899',
            'Entrenador de Arqueros Pro',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
            'Especialista en Goleros FCF',
            'Cancha Sintética Pie de la Popa',
            'Calle 30 con Carrera 21, Pie de la Popa',
            'https://maps.google.com/?q=10.418210,-75.531020',
            'Sábados y Domingos',
            '07:30 AM - 09:00 AM',
            90, 8, 18,
            10, 6,
            45000, 165000, 10,
            '🧤 Muralla Imbatible de Oro',
            'Entrenamiento de élite específico para porteros con cañón lanza-balones neumático, trabajo de desvío con visión periférica y blocaje seguro en canchas mojadas/secas.',
            '["Técnica de estirada y caída sin impacto lesivo", "Juego moderno de distribución rápida con los pies", "Lectura de penales y colocación de barreras", "Guantes con descuento de patrocinador oficial"]'::jsonb,
            true
        );

        -- 5. Clínica de Definición & Tiro Libre a lo Messi
        INSERT INTO public.servicios_especializados (
            club_id, titulo, subtitulo, categoria_servicio, icono, color_tema,
            entrenador_nombre, entrenador_avatar, entrenador_badge,
            cancha_nombre, cancha_direccion, cancha_gps_url,
            dias_semana, horario_rango, duracion_minutos, edad_min, edad_max,
            cupos_totales, cupos_ocupados, precio_sesion_individual, precio_paquete_mensual,
            descuento_hermanos_pct, insignia_obtenida, descripcion, beneficios, destacado
        ) VALUES (
            v_club_id,
            'Técnica de Golpeo & Tiro Libre a lo Messi',
            'Efecto con borde interno, potencia con empeine total, voleas y tiros colocados al ángulo',
            'DEFINICION_TIRO',
            'fa-bullseye',
            '#8b5cf6',
            'Prof. Andrés Córdoba',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            'Ex-Goleador Profesional',
            'Cancha de Fútbol Los Calamares',
            'Manzana 40 con Transversal 54, Los Calamares',
            'https://maps.google.com/?q=10.398020,-75.499510',
            'Miércoles y Viernes',
            '06:00 PM - 07:30 PM',
            90, 10, 18,
            12, 10,
            42000, 155000, 15,
            '🎯 Francotirador del Gol',
            'Perfeccionamiento de la mecánica de disparo con barreras inflables profesionales y radar Doppler para medir la velocidad de impacto del balón (Km/h).',
            '["Biomecánica de la pierna de apoyo e inclinación de tronco", "Definición mano a mano frente al arquero en 1 segundo", "Medición de velocidad del disparo con radar", "Torneo interno de tiros libres con medalla"]'::jsonb,
            true
        );

    END IF;
END $$;

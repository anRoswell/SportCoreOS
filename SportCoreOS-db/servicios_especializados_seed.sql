-- ============================================================================
-- SPORTCOREOS — SERVICIOS ESPECIALIZADOS, CLÍNICAS Y MASTERCLASSES PRO
-- Módulo de Upsell y Especialización Técnica/Física para Academias (Cartagena)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.servicios_especializados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    titulo VARCHAR(120) NOT NULL,
    subtitulo VARCHAR(150) NOT NULL,
    categoria_servicio VARCHAR(50) NOT NULL, -- VELOCIDAD_EXPLOSIVIDAD, COORDINACION_AGILIDAD, TECNICA_REGATE, ARQUEROS_ELITE, DEFINICION_TIRO, PREVENCION_FISICA, TACTICA_VISION, DEFENSA_TACTICA, MENTAL_PENALTIS, SEMILLEROS_BASE
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
-- SEEDS: CATÁLOGO DE 10 CLÍNICAS DE ÉLITE EN CARTAGENA (CLUB FUTUROS CRACKS FC)
-- ----------------------------------------------------------------------------

DO $$
DECLARE
    v_club_id UUID;
BEGIN
    SELECT id INTO v_club_id FROM public.clubes LIMIT 1;

    IF v_club_id IS NOT NULL THEN
        -- Limpiar clínicas existentes para insertar el catálogo actualizado
        DELETE FROM public.inscripciones_servicios WHERE club_id = v_club_id;
        DELETE FROM public.servicios_especializados WHERE club_id = v_club_id;

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
            15, 4,
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
            'Calle 26 (Av. Miramar) con Carrera 21, Manga, Cartagena',
            'https://maps.google.com/?q=10.412810,-75.538520',
            'Lunes y Miércoles',
            '05:00 PM - 06:30 PM',
            90, 8, 15,
            12, 3,
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
            'Calle 15 con Carrera 81, San Fernando, Cartagena',
            'https://maps.google.com/?q=10.392010,-75.489020',
            'Viernes y Sábados',
            '04:00 PM - 05:30 PM',
            90, 9, 17,
            14, 5,
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
            'Calle 30 con Carrera 21, Pie de la Popa, Cartagena',
            'https://maps.google.com/?q=10.418210,-75.531020',
            'Sábados y Domingos',
            '07:30 AM - 09:00 AM',
            90, 8, 18,
            10, 3,
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
            'Manzana 40 con Transversal 54, Los Calamares, Cartagena',
            'https://maps.google.com/?q=10.398020,-75.499510',
            'Miércoles y Viernes',
            '06:00 PM - 07:30 PM',
            90, 10, 18,
            12, 4,
            42000, 155000, 15,
            '🎯 Francotirador del Gol',
            'Perfeccionamiento de la mecánica de disparo con barreras inflables profesionales y radar Doppler para medir la velocidad de impacto del balón (Km/h).',
            '["Biomecánica de la pierna de apoyo e inclinación de tronco", "Definición mano a mano frente al arquero en 1 segundo", "Medición de velocidad del disparo con radar", "Torneo interno de tiros libres con medalla"]'::jsonb,
            true
        );

        -- 6. Visión de Juego & Pase Filtrado De Bruyne (Táctica Cognitiva)
        INSERT INTO public.servicios_especializados (
            club_id, titulo, subtitulo, categoria_servicio, icono, color_tema,
            entrenador_nombre, entrenador_avatar, entrenador_badge,
            cancha_nombre, cancha_direccion, cancha_gps_url,
            dias_semana, horario_rango, duracion_minutos, edad_min, edad_max,
            cupos_totales, cupos_ocupados, precio_sesion_individual, precio_paquete_mensual,
            descuento_hermanos_pct, insignia_obtenida, descripcion, beneficios, destacado
        ) VALUES (
            v_club_id,
            'Visión de Juego & Pase Filtrado De Bruyne',
            'Escaneo visual de alta frecuencia (Scanning Rate), pases entre líneas y cambios de orientación',
            'COORDINACION_AGILIDAD',
            'fa-compass',
            '#14b8a6',
            'Lic. Mayer Candelo',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
            'Especialista en Táctica Europea UEFA',
            'Cancha Sintética El Socorro Campestre',
            'Plan 500 Manzana 24, El Socorro, Cartagena',
            'https://maps.google.com/?q=10.385010,-75.479520',
            'Lunes y Jueves',
            '05:30 PM - 07:00 PM',
            90, 9, 16,
            12, 2,
            40000, 150000, 15,
            '🧭 Brújula del Medio Campo',
            'Metodología de scanning visual de La Masía y Manchester City. Enseña al futbolista a escanear el terreno 3 a 5 veces antes de recibir el balón para ejecutar pases milimétricos al espacio.',
            '["Medición de tasa de escaneo visual con cámaras Go-Pro", "Técnica de pase con empeine interior y rosca inversa", "Orientación del cuerpo previa al control de balón", "Dossier táctico individual con mapa de pases"]'::jsonb,
            true
        );

        -- 7. Blindaje Defensivo & Duelo 1v1 Van Dijk / Puyol
        INSERT INTO public.servicios_especializados (
            club_id, titulo, subtitulo, categoria_servicio, icono, color_tema,
            entrenador_nombre, entrenador_avatar, entrenador_badge,
            cancha_nombre, cancha_direccion, cancha_gps_url,
            dias_semana, horario_rango, duracion_minutos, edad_min, edad_max,
            cupos_totales, cupos_ocupados, precio_sesion_individual, precio_paquete_mensual,
            descuento_hermanos_pct, insignia_obtenida, descripcion, beneficios, destacado
        ) VALUES (
            v_club_id,
            'Blindaje Defensivo & Duelo 1v1 Van Dijk',
            'Temporización defensiva, perfil de corte, tackle limpio y liderazgo de la zaga',
            'TECNICA_REGATE',
            'fa-shield-halved',
            '#3b82f6',
            'DT. Andrés Mosquera',
            'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
            'Ex-Zaguero Central Profesional',
            'Cancha Sintética Bocagrande Club',
            'Carrera 2da con Calle 6ta, Bocagrande, Cartagena',
            'https://maps.google.com/?q=10.404510,-75.556210',
            'Martes y Viernes',
            '05:00 PM - 06:30 PM',
            90, 10, 17,
            10, 3,
            38000, 140000, 15,
            '🛡️ Muro Infranqueable',
            'Clínica para defensores y volantes de marca. Desarrolla el arte de defender sin cometer faltas, temporización en retroceso, perfilamiento para orientar al rival y corte en el momento exacto.',
            '["Técnica de tackle deslizante seguro sin tarjeta", "Duelos 1v1 y 1v2 en desventaja numérica", "Comunicación y achique de línea de fuera de juego", "Evaluación de efectividad en duelos terrestres"]'::jsonb,
            true
        );

        -- 8. Poder Aéreo & Salto Vertical Cristiano Ronaldo
        INSERT INTO public.servicios_especializados (
            club_id, titulo, subtitulo, categoria_servicio, icono, color_tema,
            entrenador_nombre, entrenador_avatar, entrenador_badge,
            cancha_nombre, cancha_direccion, cancha_gps_url,
            dias_semana, horario_rango, duracion_minutos, edad_min, edad_max,
            cupos_totales, cupos_ocupados, precio_sesion_individual, precio_paquete_mensual,
            descuento_hermanos_pct, insignia_obtenida, descripcion, beneficios, destacado
        ) VALUES (
            v_club_id,
            'Poder Aéreo & Salto Vertical Cristiano Ronaldo',
            'Pliometría de despegue vertical, timming de suspensión y cabeceo frontal con potencia',
            'VELOCIDAD_EXPLOSIVIDAD',
            'fa-jet-fighter-up',
            '#f97316',
            'PF. Marcos Cardona',
            'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&h=150&fit=crop&crop=face',
            'Preparador Físico Certificado FIFA',
            'Cancha Sintética Comfenalco Zaragocilla',
            'Av. Pedro de Heredia con Calle 30, Zaragocilla, Cartagena',
            'https://maps.google.com/?q=10.401210,-75.501510',
            'Sábados y Domingos',
            '09:00 AM - 10:30 AM',
            90, 8, 16,
            14, 4,
            42000, 160000, 15,
            '🚀 Vuelo Imperial Sub-15',
            'Desarrollo de potencia vertical (salto CMJ) con plataformas de contacto Chronojump. Enseña el timming de elevación para ganar balones aéreos en ambas áreas a balón parado.',
            '["Medición de salto vertical en centímetros (CMJ)", "Técnica de impulso con brazos y arqueo lumbar", "Cabeceo ofensivo picado y despeje defensivo orientado", "Plan de fortalecimiento cervical y core"]'::jsonb,
            true
        );

        -- 9. Psicología de Penaltis & Resiliencia Mental bajo Presión
        INSERT INTO public.servicios_especializados (
            club_id, titulo, subtitulo, categoria_servicio, icono, color_tema,
            entrenador_nombre, entrenador_avatar, entrenador_badge,
            cancha_nombre, cancha_direccion, cancha_gps_url,
            dias_semana, horario_rango, duracion_minutos, edad_min, edad_max,
            cupos_totales, cupos_ocupados, precio_sesion_individual, precio_paquete_mensual,
            descuento_hermanos_pct, insignia_obtenida, descripcion, beneficios, destacado
        ) VALUES (
            v_club_id,
            'Psicología de Penaltis & Resiliencia Mental',
            'Control de respiración (VFC), rutina pre-disparo, sangre fría y fortaleza emocional',
            'DEFINICION_TIRO',
            'fa-snowflake',
            '#a855f7',
            'Psic. Carolina Herrera',
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
            'Psicóloga Deportiva de Alto Rendimiento',
            'Cancha Sintética Castillogrande Beach Club',
            'Calle 5ta con Carrera 14, Castillogrande, Cartagena',
            'https://maps.google.com/?q=10.395110,-75.558210',
            'Sábados',
            '04:00 PM - 05:30 PM',
            90, 8, 18,
            8, 2,
            50000, 180000, 10,
            '🧊 Mente de Acero (Ice in Veins)',
            'Taller intensivo de fortaleza mental y ejecución de penales bajo simulación de ruido de estadio y pulsómetro en vivo. Convierte el miedo a fallar en determinación competitiva.',
            '["Biofeedback cardíaco y técnicas de respiración 4-4-4", "Construcción de rutina pre-tiro inquebrantable", "Lenguaje corporal asertivo frente al portero/pateador", "Sesión de coaching mental para padres y atletas"]'::jsonb,
            true
        );

        -- 10. Biotipo & Psicomotricidad para Semilleros Sub-8
        INSERT INTO public.servicios_especializados (
            club_id, titulo, subtitulo, categoria_servicio, icono, color_tema,
            entrenador_nombre, entrenador_avatar, entrenador_badge,
            cancha_nombre, cancha_direccion, cancha_gps_url,
            dias_semana, horario_rango, duracion_minutos, edad_min, edad_max,
            cupos_totales, cupos_ocupados, precio_sesion_individual, precio_paquete_mensual,
            descuento_hermanos_pct, insignia_obtenida, descripcion, beneficios, destacado
        ) VALUES (
            v_club_id,
            'Psicomotricidad & Control Temprano Sub-8',
            'Lateralidad cruzada, coordinación viso-pédica y pasión lúdica por el balón',
            'COORDINACION_AGILIDAD',
            'fa-child-reaching',
            '#22c55e',
            'Lic. Maritza Valenzuela',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
            'Especialista en Fútbol Base & Pedagogía',
            'Cancha El Crespito Real Kids',
            'Calle 68 con Carrera 3ra, El Crespito, Cartagena',
            'https://maps.google.com/?q=10.435010,-75.522010',
            'Sábados y Domingos',
            '08:00 AM - 09:30 AM',
            90, 6, 8,
            12, 4,
            38000, 140000, 20,
            '⚡ Semillero Atómico Sub-8',
            'Clínica formativa lúdica diseñada para semilleros de 6 a 8 años. Desarrolla la lateralidad ambidiestra (uso de ambas piernas), equilibrio dinámico y amor por el juego limpio.',
            '["Circuitos psicomotores con aros, conos y miniarcos", "Juegos de reacción auditiva y visual con música", "Uso de balón número 3 adaptado a la morfología infantil", "Diploma oficial de Pequeño Crack al culminar el mes"]'::jsonb,
            true
        );

    END IF;
END $$;

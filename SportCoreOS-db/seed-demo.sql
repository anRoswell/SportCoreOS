-- ============================================================================
-- FutCoreOS - DATOS SEMILLA (SEED DEMO DATA)
-- Club Demostración: "Club Deportivo Futuros Cracks FC"
-- ============================================================================

DO $$
DECLARE
    v_club_id UUID := '11111111-1111-1111-1111-111111111111';
    v_admin_id UUID := '22222222-2222-2222-2222-222222222222';
    v_dt_sub11_id UUID := '33333333-3333-3333-3333-333333333333';
    v_dt_sub15_id UUID := '44444444-4444-4444-4444-444444444444';
    v_sede_id UUID := '55555555-5555-5555-5555-555555555555';
    v_cancha_f11 UUID := '66666666-6666-6666-6666-666666666666';
    v_cancha_f8 UUID := '66666666-6666-6666-6666-666666666667';
    
    v_cat_sub9 UUID := '77777777-7777-7777-7777-777777777771';
    v_cat_sub11 UUID := '77777777-7777-7777-7777-777777777772';
    v_cat_sub13 UUID := '77777777-7777-7777-7777-777777777773';
    v_cat_sub15 UUID := '77777777-7777-7777-7777-777777777774';
    
    v_jugador_1 UUID := '88888888-8888-8888-8888-888888888881';
    v_jugador_2 UUID := '88888888-8888-8888-8888-888888888882';
    v_jugador_3 UUID := '88888888-8888-8888-8888-888888888883';
    v_jugador_4 UUID := '88888888-8888-8888-8888-888888888884';
    
    v_acudiente_1 UUID := '99999999-9999-9999-9999-999999999991';
    v_acudiente_2 UUID := '99999999-9999-9999-9999-999999999992';
    
    v_torneo_id UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    v_partido_id UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    v_convocatoria_id UUID := 'cccccccc-cccc-cccc-cccc-cccccccccccc';
    
    v_concepto_mensualidad UUID := 'dddddddd-dddd-dddd-dddd-ddddddddddd1';
    v_concepto_matricula UUID := 'dddddddd-dddd-dddd-dddd-ddddddddddd2';
    v_concepto_arbitraje UUID := 'dddddddd-dddd-dddd-dddd-ddddddddddd3';
    
    v_cargo_1 UUID := 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee';
BEGIN
    -- 1. Crear Club Demo
    INSERT INTO public.clubes (id, nombre, nit, slug, email_contacto, telefono_contacto, ciudad, logo_url, color_primario, plan_suscripcion, limite_jugadores)
    VALUES (v_club_id, 'Club Deportivo Futuros Cracks FC', '901.884.321-7', 'futuros-cracks', 'contacto@futuroscracks.co', '+57 310 987 6543', 'Bogotá D.C.', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=200', '#059669', 'PLAN_CLUB_ELITE', 500)
    ON CONFLICT (id) DO NOTHING;

    -- 2. Crear Usuarios (Director, Entrenadores)
    -- Contraseña encriptada para 'Admin123*'
    INSERT INTO public.usuarios (id, email, password_hash, nombre, apellido, documento_identidad, telefono, rol, activo)
    VALUES 
    (v_admin_id, 'director@futuroscracks.co', crypt('Admin123*', gen_salt('bf')), 'Carlos Alberto', 'Valderrama', '19456789', '3151112233', 'DIRECTOR_CLUB', true),
    (v_dt_sub11_id, 'profe.mario@futuroscracks.co', crypt('Admin123*', gen_salt('bf')), 'Mario Alberto', 'Yepes', '79845123', '3162223344', 'ENTRENADOR', true),
    (v_dt_sub15_id, 'profe.radamel@futuroscracks.co', crypt('Admin123*', gen_salt('bf')), 'Radamel', 'García', '80123456', '3173334455', 'ENTRENADOR', true)
    ON CONFLICT (email) DO NOTHING;

    -- Membresías del Club
    INSERT INTO public.membresias_club (club_id, usuario_id, rol_en_club)
    VALUES 
    (v_club_id, v_admin_id, 'DIRECTOR_CLUB'),
    (v_club_id, v_dt_sub11_id, 'ENTRENADOR'),
    (v_club_id, v_dt_sub15_id, 'ENTRENADOR')
    ON CONFLICT (club_id, usuario_id) DO NOTHING;

    -- 3. Crear Sede y Canchas
    INSERT INTO public.sedes (id, club_id, nombre, direccion, ciudad, telefono, mapa_gps_url)
    VALUES (v_sede_id, v_club_id, 'Sede Campestre Arrayanes Norte', 'Autopista Norte Km 16 # 220-45', 'Bogotá D.C.', '3109876543', 'https://maps.google.com/?q=4.789,-74.032')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.canchas (id, sede_id, club_id, nombre, tipo_superficie, formato, tiene_iluminacion, precio_hora_alquiler)
    VALUES 
    (v_cancha_f11, v_sede_id, v_club_id, 'Cancha Principal Estadio (Fútbol 11)', 'SINTETICA', 'FUTBOL_11', true, 180000),
    (v_cancha_f8, v_sede_id, v_club_id, 'Cancha Semilleros (Fútbol 8)', 'CESPED_NATURAL', 'FUTBOL_8', true, 120000)
    ON CONFLICT (id) DO NOTHING;

    -- 4. Crear Categorías
    INSERT INTO public.categorias (id, club_id, nombre, codigo_categoria, anio_nacimiento_min, anio_nacimiento_max, rama, director_tecnico_id, color_distintivo)
    VALUES 
    (v_cat_sub9, v_club_id, 'Sub-9 Semillero 2017', 'SUB_9', 2017, 2018, 'MASCULINO', v_dt_sub11_id, '#10B981'),
    (v_cat_sub11, v_club_id, 'Sub-11 Promesas 2015', 'SUB_11', 2015, 2016, 'MASCULINO', v_dt_sub11_id, '#3B82F6'),
    (v_cat_sub13, v_club_id, 'Sub-13 Formativa 2013', 'SUB_13', 2013, 2014, 'MASCULINO', v_dt_sub15_id, '#8B5CF6'),
    (v_cat_sub15, v_club_id, 'Sub-15 Élite Liga 2011', 'SUB_15', 2011, 2012, 'MASCULINO', v_dt_sub15_id, '#F59E0B')
    ON CONFLICT (id) DO NOTHING;

    -- 5. Crear Acudientes y Jugadores
    INSERT INTO public.acudientes (id, club_id, nombres, apellidos, documento_identidad, parentesco, telefono_principal, email, direccion_residencia)
    VALUES 
    (v_acudiente_1, v_club_id, 'Fernando', 'Díaz Marulanda', '79888999', 'PADRE', '3114445566', 'fernando.diaz@gmail.com', 'Calle 134 # 19-45, Cedritos'),
    (v_acudiente_2, v_club_id, 'Patricia', 'Rodríguez Rubio', '52333444', 'MADRE', '3125556677', 'patricia.rubio@gmail.com', 'Carrera 58 # 127-10, Niza')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.jugadores (id, club_id, categoria_id, nombres, apellidos, tipo_documento, numero_documento, fecha_nacimiento, genero, posicion_principal, pierna_habil, numero_dorsal, eps, poliza_accidentes, estado_matricula)
    VALUES 
    (v_jugador_1, v_club_id, v_cat_sub15, 'Luis Fernando', 'Díaz Marulanda Jr.', 'TARJETA_IDENTIDAD', '1098765432', '2011-04-12', 'MASCULINO', 'EXT_IZQUIERDO', 'DIESTRO', 7, 'Sura EPS', 'Seguros Bolívar #POL-9874', 'ACTIVO'),
    (v_jugador_2, v_club_id, v_cat_sub15, 'James David', 'Rodríguez Rubio Jr.', 'TARJETA_IDENTIDAD', '1098765433', '2011-07-22', 'MASCULINO', 'VOL_CREACION', 'ZURDO', 10, 'Sanitas EPS', 'Seguros Bolívar #POL-9875', 'ACTIVO'),
    (v_jugador_3, v_club_id, v_cat_sub11, 'Radamel Falcao', 'García Jr.', 'TARJETA_IDENTIDAD', '1098765434', '2015-02-10', 'MASCULINO', 'DEL_CENTRO', 'AMBIDIESTRO', 9, 'Compensar EPS', 'Seguros Bolívar #POL-9876', 'ACTIVO'),
    (v_jugador_4, v_club_id, v_cat_sub11, 'David', 'Ospina Ramírez Jr.', 'TARJETA_IDENTIDAD', '1098765435', '2015-09-05', 'MASCULINO', 'ARQUERO', 'DIESTRO', 1, 'Famisanar EPS', 'Seguros Bolívar #POL-9877', 'ACTIVO')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.jugador_acudientes (jugador_id, acudiente_id, es_contacto_principal)
    VALUES 
    (v_jugador_1, v_acudiente_1, true),
    (v_jugador_2, v_acudiente_2, true)
    ON CONFLICT (jugador_id, acudiente_id) DO NOTHING;

    -- 6. Biometría y Evaluación Antropométrica
    INSERT INTO public.evaluaciones_biometricas (club_id, jugador_id, evaluador_id, fecha_evaluacion, peso_kg, talla_cm, envergadura_cm, porcentaje_grasa, test_cooper_metros, test_velocidad_30m_seg, test_salto_vertical_cm, observaciones_medicas)
    VALUES 
    (v_club_id, v_jugador_1, v_dt_sub15_id, CURRENT_DATE - INTERVAL '15 days', 56.4, 168.5, 170.0, 11.2, 2850, 4.12, 48.5, 'Excelente aceleración y velocidad punta. Tren inferior fuerte.'),
    (v_club_id, v_jugador_2, v_dt_sub15_id, CURRENT_DATE - INTERVAL '15 days', 58.1, 169.0, 167.5, 12.0, 2700, 4.35, 42.0, 'Gran capacidad de pase largo y visión. Trabajar resistencia aeróbica.')
    ON CONFLICT (id) DO NOTHING;

    -- 7. Torneo, Partido y Convocatoria
    INSERT INTO public.torneos (id, club_id, categoria_id, nombre, entidad_organizadora, anio_temporada, estado)
    VALUES (v_torneo_id, v_club_id, v_cat_sub15, 'Liga de Fútbol de Bogotá - Torneo Apertura Sub-15', 'LIGA_BOGOTA', 2026, 'EN_CURSO')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.partidos (id, club_id, torneo_id, categoria_id, rival_nombre, fecha_partido, hora_partido, hora_citacion_calentamiento, sede_cancha, direccion_cancha, condicion_juego, uniforme_a_usar, goles_club, goles_rival, estado_partido)
    VALUES (v_partido_id, v_club_id, v_torneo_id, v_cat_sub15, 'Santa Fe D.C. Academia', CURRENT_DATE + INTERVAL '3 days', '09:00:00', '08:00:00', 'Sede Deportiva Arrayanes - Cancha 1', 'Autopista Norte Km 16', 'LOCAL', 'TITULAR', 0, 0, 'PROGRAMADO')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.convocatorias (id, club_id, partido_id, entrenador_id, titulo, mensaje_indicaciones, fecha_limite_confirmacion)
    VALUES (v_convocatoria_id, v_club_id, v_partido_id, v_dt_sub15_id, 'Fecha 4 Liga: Futuros Cracks vs Santa Fe', 'Presentarse con uniforme titular verde, canilleras y carnet de liga. Puntualidad en el calentamiento.', NOW() + INTERVAL '2 days')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.convocatoria_jugadores (convocatoria_id, jugador_id, rol_convocatoria, dorsal_partido, estado_confirmacion)
    VALUES 
    (v_convocatoria_id, v_jugador_1, 'TITULAR', 7, 'CONFIRMADO'),
    (v_convocatoria_id, v_jugador_2, 'TITULAR', 10, 'CONFIRMADO')
    ON CONFLICT (convocatoria_id, jugador_id) DO NOTHING;

    -- 8. Finanzas y Cobro Mensualidad PSE
    INSERT INTO public.finanzas_conceptos (id, club_id, codigo, nombre, tipo, valor_base, es_recurrente_mensual)
    VALUES 
    (v_concepto_mensualidad, v_club_id, 'PENS-01', 'Mensualidad Entrenamiento Fútbol', 'PENSION_MENSUAL', 180000, true),
    (v_concepto_matricula, v_club_id, 'MATR-01', 'Matrícula Anual Formativa', 'MATRICULA', 250000, false),
    (v_concepto_arbitraje, v_club_id, 'ARB-LIGA', 'Cuota de Arbitraje Liga por Partido', 'ARBITRAJE', 25000, false)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.cargos_jugador (id, club_id, jugador_id, concepto_id, periodo_mes, periodo_anio, monto_total, monto_pagado, fecha_limite_pago, estado_pago)
    VALUES (v_cargo_1, v_club_id, v_jugador_1, v_concepto_mensualidad, EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER, 2026, 180000, 180000, CURRENT_DATE + INTERVAL '5 days', 'PAGADO_TOTAL')
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.pagos_recaudo (club_id, cargo_id, acudiente_id, monto_pagado, metodo_pago, referencia_transaccion, id_pasarela, estado_transaccion)
    VALUES (v_club_id, v_cargo_1, v_acudiente_1, 180000, 'PSE', 'PSE-FC-2026-987654', 'WOMPI_TRX_987456123', 'APROBADA');

    -- 9. Indumentaria e Inventario
    INSERT INTO public.inventario_indumentaria (club_id, nombre_articulo, tipo_prenda, talla, stock_disponible, precio_venta)
    VALUES 
    (v_club_id, 'Kit Oficial de Competencia (Camiseta + Pantaloneta + Medias)', 'KIT_TITULAR', 'T14', 25, 140000),
    (v_club_id, 'Kit Oficial de Competencia (Camiseta + Pantaloneta + Medias)', 'KIT_TITULAR', 'S', 30, 150000),
    (v_club_id, 'Sudadera Oficial de Viaje y Presentación', 'SUDADERA', 'S', 18, 190000);

    -- 10. Asignación de Dorsales
    INSERT INTO public.dorsales_categoria (club_id, categoria_id, numero_dorsal, jugador_id, temporada_anio)
    VALUES 
    (v_club_id, v_cat_sub15, 7, v_jugador_1, 2026),
    (v_club_id, v_cat_sub15, 10, v_jugador_2, 2026)
    ON CONFLICT (categoria_id, numero_dorsal, temporada_anio) DO NOTHING;

END $$;

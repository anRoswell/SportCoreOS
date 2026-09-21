-- ============================================================================
-- SPORTCOREOS - SEED DATA MODULAR (POSTGRESQL QA CON SCHEMAS DDD)
-- ============================================================================

-- 1. SCHEMA CORE: CLUBES
INSERT INTO core.clubes (id, nombre, slug, sigla, ciudad, pais, logo_url, plan, activo)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Club Deportivo Futuros Cracks FC', 'futuros-cracks-fc', 'FCFC', 'Bogotá D.C.', 'Colombia', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=120&auto=format&fit=crop&q=80', 'Plan Élite Pro', true),
  ('10000000-0000-0000-0000-000000000002', 'Academia Semillero Santa Fe', 'semillero-santa-fe', 'SSF', 'Medellín', 'Colombia', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=120&auto=format&fit=crop&q=80', 'Plan Élite Pro', true),
  ('10000000-0000-0000-0000-000000000003', 'Millonarios Cantera Norte', 'millonarios-cantera-norte', 'MCN', 'Cali', 'Colombia', 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=120&auto=format&fit=crop&q=80', 'Plan Élite Pro', true)
ON CONFLICT (id) DO NOTHING;

-- 2. SCHEMA CORE: USUARIOS (Password 'sportcore2026' bcrypt: $2b$10$Uhw2fuUfzHISncX.eq5rUOBObABSihJoXVqLtHy33roEOb8fHEjQ2)
INSERT INTO core.usuarios (id, email, password_hash, nombre, apellido, rol, telefono, avatar_url, activo)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'superadmin@sportcore.com', '$2b$10$Uhw2fuUfzHISncX.eq5rUOBObABSihJoXVqLtHy33roEOb8fHEjQ2', 'Super Administrador', 'Global', 'SUPER_ADMIN', '+57 300 000 0001', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', true),
  ('00000000-0000-0000-0000-000000000002', 'carlos.valderrama@sportcore.com', '$2b$10$Uhw2fuUfzHISncX.eq5rUOBObABSihJoXVqLtHy33roEOb8fHEjQ2', 'Carlos', 'Valderrama', 'DIRECTOR_DEPORTIVO', '+57 310 444 5555', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', true),
  ('00000000-0000-0000-0000-000000000003', 'mario.yepes@sportcore.com', '$2b$10$Uhw2fuUfzHISncX.eq5rUOBObABSihJoXVqLtHy33roEOb8fHEjQ2', 'Mario', 'Yepes', 'ENTRENADOR_DT', '+57 312 888 9999', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', true),
  ('00000000-0000-0000-0000-000000000004', 'padre.diaz@sportcore.com', '$2b$10$Uhw2fuUfzHISncX.eq5rUOBObABSihJoXVqLtHy33roEOb8fHEjQ2', 'Luis', 'Díaz Padre', 'PADRE_ACUDIENTE', '+57 315 777 6666', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80', true),
  ('00000000-0000-0000-0000-000000000005', 'finanzas@sportcore.com', '$2b$10$Uhw2fuUfzHISncX.eq5rUOBObABSihJoXVqLtHy33roEOb8fHEjQ2', 'Diana', 'Morales', 'ADMIN_FINANCIERO', '+57 320 111 2233', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80', true)
ON CONFLICT (id) DO NOTHING;

-- 3. SCHEMA CORE: MEMBRESIAS CLUB
INSERT INTO core.membresias_club (id, usuario_id, club_id, rol_club, activo)
VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'SUPER_ADMIN', true),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'DIRECTOR_DEPORTIVO', true),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'ENTRENADOR_DT', true),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'PADRE_ACUDIENTE', true),
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000001', 'ADMIN_FINANCIERO', true)
ON CONFLICT (usuario_id, club_id) DO NOTHING;

-- 4. SCHEMA DEPORTIVO: CATEGORÍAS
INSERT INTO deportivo.categorias (id, club_id, nombre, codigo_categoria, anio_nacimiento_min, anio_nacimiento_max, rama, nivel_competencia, color_distintivo, cupo_maximo, activa)
VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Sub-15 Élite A', 'SUB15-A', 2011, 2012, 'MASCULINO', 'COMPETITIVO', '#10B981', 25, true),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Sub-17 Nacional Pro', 'SUB17-PRO', 2009, 2010, 'MASCULINO', 'ALTO_RENDIMIENTO', '#3B82F6', 22, true),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Sub-13 Semillero Talentos', 'SUB13-TAL', 2013, 2014, 'MASCULINO', 'FORMATIVO', '#F59E0B', 28, true)
ON CONFLICT (id) DO NOTHING;

-- 5. SCHEMA DEPORTIVO: JUGADORES
INSERT INTO deportivo.jugadores (id, club_id, categoria_id, nombres, apellidos, tipo_documento, numero_documento, fecha_nacimiento, genero, posicion_principal, pierna_habil, numero_dorsal, eps, estado_matricula)
VALUES
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Mateo', 'Gómez Restrepo', 'TI', '1023456781', '2011-04-15', 'MASCULINO', 'Extremo Derecho', 'DIESTRO', 7, 'SURA EPS', 'ACTIVO'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Samuel', 'Díaz Marín', 'TI', '1023456782', '2011-08-20', 'MASCULINO', 'Volante Ofensivo (10)', 'ZURDO', 10, 'Sanitas EPS', 'ACTIVO'),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Esteban', 'Pérez Salazar', 'TI', '1023456783', '2011-01-10', 'MASCULINO', 'Defensa Central', 'DIESTRO', 4, 'Compensar EPS', 'ACTIVO')
ON CONFLICT (id) DO NOTHING;

-- 6. SCHEMA DEPORTIVO: ACUDIENTES
INSERT INTO deportivo.acudientes (id, usuario_id, nombres, apellidos, tipo_documento, numero_documento, telefono_movil, email, parentesco, direccion_residencia)
VALUES
  ('90000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000004', 'Luis Manuel', 'Díaz Jiménez', 'CC', '79845123', '+57 315 777 6666', 'padre.diaz@sportcore.com', 'PADRE', 'Calle 134 # 45-20, Bogotá D.C.')
ON CONFLICT (id) DO NOTHING;

-- 7. SCHEMA DEPORTIVO: VÍNCULO JUGADOR - ACUDIENTE
INSERT INTO deportivo.jugador_acudientes (id, jugador_id, acudiente_id, es_contacto_principal, autorizado_recoger)
VALUES
  ('a0000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '90000000-0000-0000-0000-000000000001', true, true)
ON CONFLICT (jugador_id, acudiente_id) DO NOTHING;

-- 8. SCHEMA COMPETICION: PARTIDOS & FIXTURE
INSERT INTO competicion.partidos (id, club_id, categoria_id, rival_nombre, fecha_partido, hora_partido, hora_citacion, sede_cancha, condicion_juego, indumentaria_kit, estado_partido, goles_club, goles_rival)
VALUES
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'Atlético Nacional Cantera Bogotá', CURRENT_DATE + INTERVAL '2 day', '10:00:00', '09:00:00', 'Cancha Sintética Sede Norte #2', 'LOCAL', 'Kit Titular (Esmeralda)', 'PROGRAMADO', 0, 0),
  ('50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'Deportivo Cali Filial Capital', CURRENT_DATE + INTERVAL '5 day', '14:30:00', '13:30:00', 'Complejo Deportivo Campincito', 'VISITANTE', 'Kit Alterno (Blanco)', 'PROGRAMADO', 0, 0)
ON CONFLICT (id) DO NOTHING;

-- 9. SCHEMA COMPETICION: CONVOCATORIAS
INSERT INTO competicion.convocatorias (id, partido_id, jugador_id, rol_convocatoria, posicion_designada, estado_confirmacion, fecha_confirmacion)
VALUES
  ('b0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'TITULAR', 'Extremo Derecho (7)', 'CONFIRMADO', NOW()),
  ('b0000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', 'TITULAR', 'Volante Ofensivo (10)', 'CONFIRMADO', NOW())
ON CONFLICT (partido_id, jugador_id) DO NOTHING;

-- 10. SCHEMA RENDIMIENTO: EVALUACIONES BIOMÉTRICAS
INSERT INTO rendimiento.evaluaciones_biometricas (id, jugador_id, evaluador_id, fecha_evaluacion, peso_kg, talla_cm, imc, test_cooper_metros, velocidad_30m_seg, salto_vertical_cm, observaciones)
VALUES
  ('70000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '2026-03-01', 56.40, 167.50, 20.1, 2850, 3.92, 42.50, 'Excelente potencia aeróbica y velocidad de arranque'),
  ('70000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '2026-03-01', 52.80, 162.00, 20.1, 2980, 3.88, 45.00, 'Gran capacidad de cambio de ritmo y visión de juego')
ON CONFLICT (id) DO NOTHING;

-- 11. SCHEMA FINANZAS: CONCEPTOS FINANCIEROS
INSERT INTO finanzas.conceptos (id, club_id, nombre, tipo, monto_base, activo)
VALUES
  ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Pensión Mensual Formativa', 'MENSUALIDAD', 220000.00, true),
  ('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Matrícula Anual Temporada 2026', 'MATRICULA', 350000.00, true),
  ('60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Kit de Indumentaria Oficial', 'UNIFORME', 180000.00, true)
ON CONFLICT (id) DO NOTHING;

-- 12. SCHEMA FINANZAS: CARGOS POR JUGADOR (PENSIONES)
INSERT INTO finanzas.cargos_jugador (id, club_id, jugador_id, concepto_id, periodo_mes, periodo_anio, monto_total, monto_descuento_beca, monto_pagado, saldo_pendiente, estado_pago, fecha_limite_pago)
VALUES
  ('80000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 3, 2026, 220000.00, 0.00, 220000.00, 0.00, 'PAGADO', '2026-03-10'),
  ('80000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', 3, 2026, 220000.00, 50000.00, 0.00, 170000.00, 'PENDIENTE', '2026-03-15')
ON CONFLICT (id) DO NOTHING;

-- 13. SCHEMA DEPORTIVO: CANCHAS
INSERT INTO deportivo.canchas (id, club_id, nombre, tipo_superficie, precio_hora_diurna, precio_hora_nocturna, hora_apertura, hora_cierre, activa)
VALUES
  ('c0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Cancha Sintética 8 - El Campín', 'sintetica_f8', 85000, 120000, '06:00:00', '23:00:00', true),
  ('c0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Cancha Sintética 5 - La Castellana', 'sintetica_f5', 60000, 90000, '06:00:00', '23:00:00', true),
  ('c0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'Cancha Grama Natural 11 - Sede Principal', 'natural_f11', 150000, 210000, '07:00:00', '22:00:00', true)
ON CONFLICT (id) DO NOTHING;

-- 14. SCHEMA DEPORTIVO: RESERVAS DE CANCHA
INSERT INTO deportivo.reservas_cancha (id, cancha_id, fecha_reserva, hora_inicio, hora_fin, tipo_reserva, cliente_nombre, cliente_telefono, monto_total, monto_anticipo, estado_pago, estado_turno)
VALUES
  ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', CURRENT_DATE, '17:00:00', '18:00:00', 'entrenamiento_club', 'Categoría Sub-15 Élite', NULL, 0, 0, 'exonerado', 'confirmado'),
  ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', CURRENT_DATE, '19:00:00', '20:00:00', 'alquiler_particular', 'Andrés Pérez (Torneo Nocturno)', '+57 310 999 8888', 120000, 60000, 'parcial', 'confirmado')
ON CONFLICT (id) DO NOTHING;

-- 15. SCHEMA DEPORTIVO: PRODUCTOS TIENDA
INSERT INTO deportivo.productos_tienda (id, club_id, codigo_sku, nombre, categoria, precio_venta, foto_url, personalizable, activo)
VALUES
  ('f0000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'KIT-TITULAR-2026', 'Kit Oficial Titular 2026 (Camisilla + Short + Medias)', 'uniforme_oficial', 145000, 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=300', true, true),
  ('f0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'KIT-ALTERNO-2026', 'Kit Oficial Alterno 2026 (Blanco Élite)', 'uniforme_oficial', 140000, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300', true, true),
  ('f0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'BALON-F5-PRO', 'Balón Oficial de Entrenamiento Golty FIFA Quality #4', 'balones', 89000, 'https://images.unsplash.com/photo-1614632537423-1e6c2e7e0aab?w=300', false, true),
  ('f0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'PETO-FLUO-SET', 'Set de 10 Petos Fluo de Entrenamiento (Reforzados)', 'entrenamiento', 65000, 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=300', false, true)
ON CONFLICT (id) DO NOTHING;

-- 16. SCHEMA DEPORTIVO: VARIANTES PRODUCTO
INSERT INTO deportivo.variantes_producto (id, producto_id, talla, stock_actual, stock_minimo_alerta)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', '8', 12, 4),
  ('d0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', '10', 18, 5),
  ('d0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000001', '12', 8, 5),
  ('d0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000001', 'M', 20, 5),
  ('d0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000002', '10', 10, 4),
  ('d0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000003', 'ÚNICA', 25, 6),
  ('d0000000-0000-0000-0000-000000000007', 'f0000000-0000-0000-0000-000000000004', 'ÚNICA', 9, 3)
ON CONFLICT (id) DO NOTHING;


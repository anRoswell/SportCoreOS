const { Client } = require('pg');

const client = new Client({
  host: process.env.DB_HOST || '100.120.112.79',
  port: parseInt(process.env.DB_PORT || '52132', 10),
  user: process.env.DB_USER || 'sportcore_user_qa',
  password: process.env.DB_PASSWORD || 'SportCoreQA2026*',
  database: process.env.DB_NAME || 'sportcoreos_db_qa',
});

async function seed() {
  await client.connect();
  console.log('Connected to PostgreSQL for database seeding...');

  const mainClubId = '10000000-0000-0000-0000-000000000001';
  const dtValderramaId = '00000000-0000-0000-0000-000000000002';
  const dtYepesId = '00000000-0000-0000-0000-000000000003';

  // 1. SEED SLIDERS PROMOCIONALES
  console.log('1. Seeding core.sliders_promocionales...');
  await client.query(`DELETE FROM core.sliders_promocionales WHERE club_id = $1 OR club_id IS NULL`, [mainClubId]);

  const sliders = [
    {
      id: 'c1000000-0000-0000-0001-000000000001',
      club_id: mainClubId,
      titulo: 'Campamento Internacional de Verano & Clínicas Pro 2026',
      subtitulo: 'Entrenamientos intensivos de micro-habilidades con tecnología láser Doppler, neuro-motricidad y directores técnicos de cantera europea. ¡Cupos limitados!',
      tag: 'Alta Especialización 2026',
      tag_icono: '🏆',
      badge_color: '#10b981',
      accent_gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      icono: 'fa-solid fa-trophy',
      stat_numero: '100% Pro',
      stat_label: 'Metodología Europea',
      card_preview_titulo: 'Clínicas & Masterclasses',
      card_preview_desc: '66 cupos disponibles con pase digital QR y evaluación física.',
      highlights_json: JSON.stringify([
        { icon: '⚡', text: 'Sensores de Velocidad Doppler', subtext: 'Medición de aceleración en 5m y 30m' },
        { icon: '🧠', text: 'Neuro-Agilidad Fitlight', subtext: 'Tiempo de reacción visual y toma de decisiones' },
        { icon: '🎟️', text: 'Pase Digital QR Inmediato', subtext: 'Acceso seguro en portería y cancha' }
      ]),
      boton_cta_texto: 'Ver Clínicas Pro',
      boton_cta_url: '/servicios',
      imagen_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
      orden: 1,
      activo: true,
      plataforma_destino: 'TODAS',
      fecha_inicio: '2026-01-01',
      fecha_fin: '2026-12-31'
    },
    {
      id: 'c1000000-0000-0000-0001-000000000002',
      club_id: mainClubId,
      titulo: 'Nueva Indumentaria Oficial & Kits de Cantera 2026/2027',
      subtitulo: 'Consigue la camiseta oficial de gala, kit de entrenamiento transpirable y accesorios con el escudo bordado y dorsal personalizado.',
      tag: 'Tienda Oficial SportCore',
      tag_icono: '👕',
      badge_color: '#3b82f6',
      accent_gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
      icono: 'fa-solid fa-shirt',
      stat_numero: '19 Productos',
      stat_label: 'Stock en Bodega',
      card_preview_titulo: 'Kits Oficiales & Merch',
      card_preview_desc: 'Despacho directo en utilería del club y pago online.',
      highlights_json: JSON.stringify([
        { icon: '👕', text: 'Uniforme Titular Esmeralda', subtext: 'Tejido dry-fit de alta transpirabilidad' },
        { icon: '🔢', text: 'Dorsal y Nombre Personalizado', subtext: 'Estampado térmico profesional' },
        { icon: '📦', text: 'Entrega Rápida en Cancha', subtext: 'Control de inventario en tiempo real' }
      ]),
      boton_cta_texto: 'Explorar Tienda',
      boton_cta_url: '/tienda',
      imagen_url: 'https://images.unsplash.com/photo-1511886929837-354d827aae26?w=800',
      orden: 2,
      activo: true,
      plataforma_destino: 'TODAS',
      fecha_inicio: '2026-01-01',
      fecha_fin: '2026-12-31'
    },
    {
      id: 'c1000000-0000-0000-0001-000000000003',
      club_id: mainClubId,
      titulo: 'Alquiler de Canchas Sintéticas con Iluminación LED Nocturna',
      subtitulo: 'Reserva turnos de Fútbol 11, Fútbol 8 y Fútbol 5 en la Sede Campestre Arrayanes y Bocagrande Club. Reserva online con Waze y Google Maps.',
      tag: 'Infraestructura & Sedes',
      tag_icono: '🏟️',
      badge_color: '#f59e0b',
      accent_gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      icono: 'fa-solid fa-futbol',
      stat_numero: '18 Canchas',
      stat_label: 'Disponibles 24/7',
      card_preview_titulo: 'Reserva Inmediata',
      card_preview_desc: 'Césped sintético monofilamento FIFA Quality Pro.',
      highlights_json: JSON.stringify([
        { icon: '💡', text: 'Luces LED Profesionales', subtext: 'Turnos nocturnos hasta las 11:00 PM' },
        { icon: '📍', text: 'Geolocalización GPS & Waze', subtext: 'Llega sin contratiempos a la sede' },
        { icon: '🛡️', text: 'Vestuarios & Zona Médica', subtext: 'Instalaciones de primer nivel' }
      ]),
      boton_cta_texto: 'Reservar Cancha',
      boton_cta_url: '/canchas',
      imagen_url: 'https://images.unsplash.com/photo-1529900245584-88b64c703058?w=800',
      orden: 3,
      activo: true,
      plataforma_destino: 'TODAS',
      fecha_inicio: '2026-01-01',
      fecha_fin: '2026-12-31'
    },
    {
      id: 'c1000000-0000-0000-0001-000000000004',
      club_id: mainClubId,
      titulo: 'Telemetría GPS, Chalecos Catapult & Mapas de Calor 2D',
      subtitulo: 'Monitorea el PlayerLoad, distancia recorrida, sprints a más de 21 km/h y frecuencia cardíaca de los atletas con muestreo de 10 Hz.',
      tag: 'Ciencias del Deporte',
      tag_icono: '📡',
      badge_color: '#8b5cf6',
      accent_gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      icono: 'fa-solid fa-satellite',
      stat_numero: '10 Hz GPS',
      stat_label: 'Muestreo Cinemático',
      card_preview_titulo: 'Tracking Táctico 2D',
      card_preview_desc: 'Heatmaps dinámicos sobre la cancha y prevención ACWR.',
      highlights_json: JSON.stringify([
        { icon: '🏃', text: 'Picos de Velocidad Máxima', subtext: 'Monitoreo de umbrales anaeróbicos' },
        { icon: '🔥', text: 'Mapas de Calor en Tiempo Real', subtext: 'Ocupación de espacios tácticos' },
        { icon: '📊', text: 'Índice de Carga PlayerLoad', subtext: 'Prevención de sobrecargas musculares' }
      ]),
      boton_cta_texto: 'Ver Telemetría',
      boton_cta_url: '/telemetria',
      imagen_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
      orden: 4,
      activo: true,
      plataforma_destino: 'TODAS',
      fecha_inicio: '2026-01-01',
      fecha_fin: '2026-12-31'
    },
    {
      id: 'c1000000-0000-0000-0001-000000000005',
      club_id: mainClubId,
      titulo: 'Ranking Gamificado FUT, Retos de Habilidad & XP',
      subtitulo: 'Comprueba retos individuales de técnica y fuerza ante el DT, desbloquea insignias en tu Ficha 360° y escala en el Leaderboard del club.',
      tag: 'Gamificación & XP',
      tag_icono: '⭐',
      badge_color: '#ec4899',
      accent_gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
      icono: 'fa-solid fa-award',
      stat_numero: '5 Tiers',
      stat_label: 'Bronce a Élite Pro',
      card_preview_titulo: 'Carta FUT 360°',
      card_preview_desc: 'Atributos de ritmo, tiro, pase, regate, defensa y físico.',
      highlights_json: JSON.stringify([
        { icon: '🎯', text: 'Retos Verificables en Cancha', subtext: 'Flexiones, 21s, salto vertical y tiro' },
        { icon: '🥇', text: 'Podio Semanal de Destacados', subtext: 'Reconocimiento al esfuerzo y asistencia' },
        { icon: '📱', text: 'Portal Móvil para Padres', subtext: 'Seguimiento del crecimiento formativo' }
      ]),
      boton_cta_texto: 'Ver Ranking XP',
      boton_cta_url: '/ranking',
      imagen_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800',
      orden: 5,
      activo: true,
      plataforma_destino: 'TODAS',
      fecha_inicio: '2026-01-01',
      fecha_fin: '2026-12-31'
    }
  ];

  for (const s of sliders) {
    await client.query(`
      INSERT INTO core.sliders_promocionales (
        id, club_id, titulo, subtitulo, tag, tag_icono, badge_color, accent_gradient,
        icono, stat_numero, stat_label, card_preview_titulo, card_preview_desc,
        highlights_json, boton_cta_texto, boton_cta_url, imagen_url, orden, activo,
        plataforma_destino, fecha_inicio, fecha_fin, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        titulo = EXCLUDED.titulo,
        subtitulo = EXCLUDED.subtitulo,
        highlights_json = EXCLUDED.highlights_json,
        updated_at = NOW()
    `, [
      s.id, s.club_id, s.titulo, s.subtitulo, s.tag, s.tag_icono, s.badge_color, s.accent_gradient,
      s.icono, s.stat_numero, s.stat_label, s.card_preview_titulo, s.card_preview_desc,
      s.highlights_json, s.boton_cta_texto, s.boton_cta_url, s.imagen_url, s.orden, s.activo,
      s.plataforma_destino, s.fecha_inicio, s.fecha_fin
    ]);
  }
  console.log('✓ Sliders promocionales seeded in core.sliders_promocionales');

  // 2. SEED RETOS CATALOGO
  console.log('2. Seeding rendimiento.retos_catalogo...');
  await client.query(`DELETE FROM rendimiento.retos_catalogo WHERE club_id = $1 OR club_id IS NULL`, [mainClubId]);

  const retos = [
    {
      id: 'a1000000-0000-0000-0000-000000000001',
      club_id: mainClubId,
      categoria_reto: 'FUERZA_CALISTENIA',
      nombre: 'Flexiones de Pecho (Push-Ups Estrictas)',
      descripcion: 'Dominio de fuerza corporal y estabilidad escapular. Realizar repeticiones con técnica estricta (pecho a 5cm del suelo) delante del DT.',
      icono: 'fa-solid fa-dumbbell',
      color_distintivo: '#10B981',
      niveles: JSON.stringify([
        { nivel: 1, meta: 5, unidad: 'flexiones', xp: 30, titulo: '5 Flexiones (Iniciación)', dificultad: 'PRINCIPIANTE' },
        { nivel: 2, meta: 10, unidad: 'flexiones', xp: 60, titulo: '10 Flexiones (Guerrero)', dificultad: 'INTERMEDIO' },
        { nivel: 3, meta: 15, unidad: 'flexiones', xp: 100, titulo: '15 Flexiones (Atleta)', dificultad: 'AVANZADO' },
        { nivel: 4, meta: 25, unidad: 'flexiones', xp: 180, titulo: '25 Flexiones (Pro Cantera)', dificultad: 'ELITE' },
        { nivel: 5, meta: 50, unidad: 'flexiones', xp: 350, titulo: '50 Flexiones (Bestia Blue Lock)', dificultad: 'LEYENDA' }
      ]),
      orden_display: 1,
      activo: true
    },
    {
      id: 'a1000000-0000-0000-0000-000000000002',
      club_id: mainClubId,
      categoria_reto: 'TECNICA_CONTROL',
      nombre: 'Dominadas de Balón (21s / Juggling Pro)',
      descripcion: 'Control y sensibilidad del balón sin que toque el césped. Alternando pie derecho e izquierdo frente al Director Técnico.',
      icono: 'fa-solid fa-futbol',
      color_distintivo: '#3B82F6',
      niveles: JSON.stringify([
        { nivel: 1, meta: 10, unidad: 'toques', xp: 40, titulo: '10 Toques Consecutivos', dificultad: 'PRINCIPIANTE' },
        { nivel: 2, meta: 25, unidad: 'toques', xp: 80, titulo: '25 Toques Alternados', dificultad: 'INTERMEDIO' },
        { nivel: 3, meta: 50, unidad: 'toques', xp: 150, titulo: '50 Toques Malabarista', dificultad: 'AVANZADO' },
        { nivel: 4, meta: 100, unidad: 'toques', xp: 300, titulo: '100 Toques Crack Élite', dificultad: 'ELITE' },
        { nivel: 5, meta: 200, unidad: 'toques', xp: 500, titulo: '200 Toques Rey Oliver Atom', dificultad: 'LEYENDA' }
      ]),
      orden_display: 2,
      activo: true
    },
    {
      id: 'a1000000-0000-0000-0000-000000000003',
      club_id: mainClubId,
      categoria_reto: 'POTENCIA_VELOCIDAD',
      nombre: 'Sentadillas con Salto Explosivo (Jump Squats)',
      descripcion: 'Potencia explosiva de tren inferior para mejorar el salto vertical y despegue en el remate de cabeza.',
      icono: 'fa-solid fa-bolt',
      color_distintivo: '#F59E0B',
      niveles: JSON.stringify([
        { nivel: 1, meta: 10, unidad: 'saltos', xp: 40, titulo: '10 Saltos Explosivos', dificultad: 'PRINCIPIANTE' },
        { nivel: 2, meta: 20, unidad: 'saltos', xp: 80, titulo: '20 Saltos Máxima Altura', dificultad: 'INTERMEDIO' },
        { nivel: 3, meta: 35, unidad: 'saltos', xp: 150, titulo: '35 Saltos Potencia CR7', dificultad: 'AVANZADO' },
        { nivel: 4, meta: 50, unidad: 'saltos', xp: 280, titulo: '50 Saltos Resistencia Titan', dificultad: 'ELITE' }
      ]),
      orden_display: 3,
      activo: true
    },
    {
      id: 'a1000000-0000-0000-0000-000000000004',
      club_id: mainClubId,
      categoria_reto: 'RESISTENCIA_CORE',
      nombre: 'Plancha Isométrica de Core (Core Plank)',
      descripcion: 'Estabilidad lumbo-pélvica y resistencia estática en apoyo de antebrazos sin quebrar la cadera.',
      icono: 'fa-solid fa-shield-halved',
      color_distintivo: '#8B5CF6',
      niveles: JSON.stringify([
        { nivel: 1, meta: 30, unidad: 'segundos', xp: 40, titulo: '30 Segundos de Plancha', dificultad: 'PRINCIPIANTE' },
        { nivel: 2, meta: 60, unidad: 'segundos', xp: 90, titulo: '60 Segundos Muralla', dificultad: 'INTERMEDIO' },
        { nivel: 3, meta: 120, unidad: 'segundos', xp: 200, titulo: '2 Minutos de Acero', dificultad: 'AVANZADO' },
        { nivel: 4, meta: 180, unidad: 'segundos', xp: 350, titulo: '3 Minutos Inquebrantable', dificultad: 'ELITE' }
      ]),
      orden_display: 4,
      activo: true
    },
    {
      id: 'a1000000-0000-0000-0000-000000000005',
      club_id: mainClubId,
      categoria_reto: 'PRECISION_TIRO',
      nombre: 'Tiro al Larguero (Crossbar Challenge)',
      descripcion: 'Impactar el travesaño desde el borde del área grande (16.5 metros) en presencia del entrenador.',
      icono: 'fa-solid fa-crosshairs',
      color_distintivo: '#EC4899',
      niveles: JSON.stringify([
        { nivel: 1, meta: 1, unidad: 'aciertos', xp: 60, titulo: '1 Impacto Directo al Larguero', dificultad: 'INTERMEDIO' },
        { nivel: 2, meta: 3, unidad: 'aciertos', xp: 180, titulo: '3 Impactos en 5 Intentos', dificultad: 'AVANZADO' },
        { nivel: 3, meta: 5, unidad: 'aciertos', xp: 350, titulo: '5 de 5 Francotirador Messi', dificultad: 'ELITE' }
      ]),
      orden_display: 5,
      activo: true
    },
    {
      id: 'a1000000-0000-0000-0000-000000000006',
      club_id: mainClubId,
      categoria_reto: 'POTENCIA_VELOCIDAD',
      nombre: 'Sprint 30 Metros Lanzado',
      descripcion: 'Velocidad pura en 30 metros medido con cronómetro láser / fotocélulas en pista o césped sintético.',
      icono: 'fa-solid fa-person-running',
      color_distintivo: '#06B6D4',
      niveles: JSON.stringify([
        { nivel: 1, meta: 5, unidad: 'segundos', xp: 50, titulo: 'Menos de 4.80s (Sub-13)', dificultad: 'PRINCIPIANTE' },
        { nivel: 2, meta: 4, unidad: 'segundos', xp: 100, titulo: 'Menos de 4.40s (Sub-15)', dificultad: 'INTERMEDIO' },
        { nivel: 3, meta: 4, unidad: 'segundos', xp: 200, titulo: 'Menos de 4.10s (Sub-17 Pro)', dificultad: 'AVANZADO' },
        { nivel: 4, meta: 3, unidad: 'segundos', xp: 400, titulo: 'Menos de 3.90s (Velocidad Mbappé)', dificultad: 'ELITE' }
      ]),
      orden_display: 6,
      activo: true
    }
  ];

  for (const r of retos) {
    await client.query(`
      INSERT INTO rendimiento.retos_catalogo (
        id, club_id, categoria_reto, nombre, descripcion, icono, color_distintivo,
        niveles, orden_display, activo, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
      ON CONFLICT (id) DO UPDATE SET
        nombre = EXCLUDED.nombre,
        descripcion = EXCLUDED.descripcion,
        niveles = EXCLUDED.niveles
    `, [
      r.id, r.club_id, r.categoria_reto, r.nombre, r.descripcion, r.icono,
      r.color_distintivo, r.niveles, r.orden_display, r.activo
    ]);
  }
  console.log('✓ Retos catalogo seeded in rendimiento.retos_catalogo');

  // 3. SEED RETOS JUGADOR PROGRESO
  console.log('3. Seeding rendimiento.retos_jugador_progreso for real players...');
  await client.query(`DELETE FROM rendimiento.retos_jugador_progreso WHERE club_id = $1`, [mainClubId]);

  const jugsRes = await client.query(`SELECT id, nombres, apellidos, categoria_id FROM deportivo.jugadores WHERE club_id = $1 ORDER BY numero_dorsal ASC LIMIT 15`, [mainClubId]);
  const realPlayers = jugsRes.rows;

  if (realPlayers.length > 0) {
    const progresoItems = [
      // Tomás Ángel
      {
        jugador_id: realPlayers[0].id,
        reto_id: retos[0].id, // Flexiones
        nivel_solicitado: 4,
        meta_cantidad: 25,
        unidad_medida: 'flexiones',
        xp_recompensa: 180,
        estado: 'APROBADO',
        evaluador_dt_id: dtValderramaId,
        evaluador_dt_nombre: 'Carlos Valderrama',
        observaciones_dt: 'Excelente cadencia y postura corporal perfecta.'
      },
      {
        jugador_id: realPlayers[0].id,
        reto_id: retos[1].id, // 21s
        nivel_solicitado: 3,
        meta_cantidad: 50,
        unidad_medida: 'toques',
        xp_recompensa: 150,
        estado: 'APROBADO',
        evaluador_dt_id: dtValderramaId,
        evaluador_dt_nombre: 'Carlos Valderrama',
        observaciones_dt: 'Buen manejo de ambos perfiles.'
      },
      {
        jugador_id: realPlayers[0].id,
        reto_id: retos[4].id, // Tiro al larguero
        nivel_solicitado: 2,
        meta_cantidad: 3,
        unidad_medida: 'aciertos',
        xp_recompensa: 180,
        estado: 'COMPROBABLE',
        evaluador_dt_id: null,
        evaluador_dt_nombre: null,
        observaciones_dt: null
      },
    ];

    if (realPlayers.length > 1) {
      // Yaser Asprilla
      progresoItems.push(
        {
          jugador_id: realPlayers[1].id,
          reto_id: retos[1].id, // 21s
          nivel_solicitado: 4,
          meta_cantidad: 100,
          unidad_medida: 'toques',
          xp_recompensa: 300,
          estado: 'APROBADO',
          evaluador_dt_id: dtValderramaId,
          evaluador_dt_nombre: 'Carlos Valderrama',
          observaciones_dt: 'Calidad técnica excepcional, 100 toques sin caer.'
        },
        {
          jugador_id: realPlayers[1].id,
          reto_id: retos[5].id, // Sprint 30m
          nivel_solicitado: 3,
          meta_cantidad: 4,
          unidad_medida: 'segundos',
          xp_recompensa: 200,
          estado: 'APROBADO',
          evaluador_dt_id: dtYepesId,
          evaluador_dt_nombre: 'Mario Yepes',
          observaciones_dt: 'Tiempo registrado: 3.98s en cancha sintética.'
        },
        {
          jugador_id: realPlayers[1].id,
          reto_id: retos[3].id, // Plancha
          nivel_solicitado: 3,
          meta_cantidad: 120,
          unidad_medida: 'segundos',
          xp_recompensa: 200,
          estado: 'COMPROBABLE',
          evaluador_dt_id: null,
          evaluador_dt_nombre: null,
          observaciones_dt: null
        }
      );
    }

    if (realPlayers.length > 2) {
      // 3rd player
      progresoItems.push(
        {
          jugador_id: realPlayers[2].id,
          reto_id: retos[0].id, // Flexiones
          nivel_solicitado: 2,
          meta_cantidad: 10,
          unidad_medida: 'flexiones',
          xp_recompensa: 60,
          estado: 'APROBADO',
          evaluador_dt_id: dtYepesId,
          evaluador_dt_nombre: 'Mario Yepes',
          observaciones_dt: 'Cumplió las 10 repeticiones completas.'
        },
        {
          jugador_id: realPlayers[2].id,
          reto_id: retos[2].id, // Jump squats
          nivel_solicitado: 2,
          meta_cantidad: 20,
          unidad_medida: 'saltos',
          xp_recompensa: 80,
          estado: 'COMPROBABLE',
          evaluador_dt_id: null,
          evaluador_dt_nombre: null,
          observaciones_dt: null
        }
      );
    }

    for (const p of progresoItems) {
      const fechaEval = p.estado === 'APROBADO' ? new Date() : null;
      await client.query(`
        INSERT INTO rendimiento.retos_jugador_progreso (
          club_id, jugador_id, reto_id, nivel_solicitado, meta_cantidad,
          unidad_medida, xp_recompensa, estado, fecha_solicitud, fecha_evaluacion,
          evaluador_dt_id, evaluador_dt_nombre, observaciones_dt, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, NOW() - INTERVAL '2 days', $9,
          $10, $11, $12, NOW(), NOW()
        )
      `, [
        mainClubId, p.jugador_id, p.reto_id, p.nivel_solicitado, p.meta_cantidad,
        p.unidad_medida, p.xp_recompensa, p.estado, fechaEval,
        p.evaluador_dt_id, p.evaluador_dt_nombre, p.observaciones_dt
      ]);
    }
    console.log(`✓ Seeded ${progresoItems.length} retos de progreso para jugadores reales`);
  }

  console.log('Seeding finished successfully!');
  await client.end();
}

seed().catch(err => {
  console.error('Seed Error:', err);
  process.exit(1);
});

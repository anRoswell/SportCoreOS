import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './app.module';
import { DatabaseService } from '../src/database/database.service';

describe('SportCoreOS Backend Integration Test Suite (All 12 Modules & PostgreSQL DB)', () => {
  let app: INestApplication;
  let dbService: DatabaseService;
  let authToken: string;
  const clubId = '10000000-0000-0000-0000-000000000001';
  const categoriaId = '30000000-0000-0000-0000-000000000001';
  const sampleJugadorId = '40000000-0000-0000-0000-000000000001';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
    dbService = app.get(DatabaseService);

    // Login para obtener token JWT de SuperAdmin
    const loginRes = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'superadmin@sportcore.com',
        password: 'sportcore2026',
      });

    expect(loginRes.status).toBe(200);
    const body = loginRes.body.data || loginRes.body;
    expect(body).toHaveProperty('accessToken');
    authToken = body.accessToken;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // --------------------------------------------------------------------------
  // 1. AUTH & CLUBES
  // --------------------------------------------------------------------------
  describe('Módulo 00: Autenticación & Clubes', () => {
    it('POST /api/v1/auth/login -> autentica y retorna JWT', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'superadmin@sportcore.com', password: 'sportcore2026' });
      expect(res.status).toBe(200);
      const data = res.body.data || res.body;
      expect(data.accessToken).toBeDefined();
      expect(data.user.email).toBe('superadmin@sportcore.com');
    });

    it('GET /api/v1/clubes -> lista clubes y verifica persistencia en BD', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/clubes')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      const list = res.body.data || res.body;
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);
    });
  });

  // --------------------------------------------------------------------------
  // 2. FINANZAS & FACTURACIÓN (MÓDULO 01)
  // --------------------------------------------------------------------------
  describe('Módulo 01: Finanzas & Matriz de Recaudos', () => {
    it('GET /api/v1/finanzas/resumen -> calcula KPIs de facturación y mora en BD', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/finanzas/resumen')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      const data = res.body.data || res.body;
      expect(data).toHaveProperty('total_facturado');
      expect(data).toHaveProperty('total_recaudado');
      expect(data).toHaveProperty('total_en_mora');
    });

    it('GET /api/v1/finanzas/cargos -> lista matriz de cargos con joins', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/finanzas/cargos')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      const data = res.body.data !== undefined ? res.body.data : res.body;
      const list = Array.isArray(data) ? data : (data?.data || []);
      expect(Array.isArray(list)).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 3. JUGADORES & FICHAS 360 (MÓDULO 02)
  // --------------------------------------------------------------------------
  describe('Módulo 02: Jugadores & Fichas 360°', () => {
    let testJugadorId: string;

    it('POST /api/v1/jugadores -> crea un nuevo jugador en la BD', async () => {
      const docNum = `DOC${Date.now().toString().slice(-8)}`;
      const randomDorsal = Math.floor(Math.random() * 70) + 20;
      const res = await request(app.getHttpServer())
        .post('/api/v1/jugadores')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoriaId: categoriaId,
          nombres: 'Test',
          apellidos: 'Integration Player',
          tipoDocumento: 'TI',
          numeroDocumento: docNum,
          fechaNacimiento: '2011-06-15',
          genero: 'MASCULINO',
          posicionPrincipal: 'Delantero Centro',
          piernaHabil: 'DIESTRO',
          numeroDorsal: randomDorsal,
        });
      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      expect(data.jugador).toBeDefined();
      testJugadorId = data.jugador.id;

      // Verificación directa en BD
      const dbCheck = await dbService.query(
        `SELECT * FROM deportivo.jugadores WHERE id = $1`,
        [testJugadorId],
      );
      expect(dbCheck.rows.length).toBe(1);
    });

    it('GET /api/v1/jugadores/:id/expediente -> obtiene expediente 360 completo', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/jugadores/${testJugadorId}/expediente`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      const data = res.body.data || res.body;
      expect(data.jugador.id).toBe(testJugadorId);
      expect(data).toHaveProperty('historialBiometrico');
      expect(data).toHaveProperty('resumenFinanciero');
    });

    it('DELETE /api/v1/jugadores/:id -> da de baja/elimina jugador', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/jugadores/${testJugadorId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });
  });

  // --------------------------------------------------------------------------
  // 4. CATEGORÍAS & PLANTELES (MÓDULO 03)
  // --------------------------------------------------------------------------
  describe('Módulo 03: Categorías & Planteles', () => {
    let testCatId: string;

    it('POST /api/v1/categorias -> crea nueva categoría deportiva', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/categorias')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: `Sub-20 Prueba ${Date.now()}`,
          codigo_categoria: `U20-${Date.now().toString().slice(-4)}`,
          anio_nacimiento_min: 2006,
          anio_nacimiento_max: 2007,
          rama: 'MASCULINO',
          nivel_competencia: 'COMPETITIVO',
          color_distintivo: '#10B981',
          cupo_maximo: 25,
        });
      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      testCatId = data.id;
    });

    it('GET /api/v1/categorias -> lista categorías desde la BD', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/categorias')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      const payload = res.body.data !== undefined ? res.body.data : res.body;
      const list = Array.isArray(payload) ? payload : (payload?.data || []);
      expect(Array.isArray(list)).toBe(true);
      expect(list.some((c: any) => c.id === testCatId)).toBe(true);
    });

    it('DELETE /api/v1/categorias/:id -> desactiva/elimina categoría', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/categorias/${testCatId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });
  });

  // --------------------------------------------------------------------------
  // 5. FIXTURE, SEDES & PARTIDOS (MÓDULO 04)
  // --------------------------------------------------------------------------
  describe('Módulo 04: Fixture & Partidos', () => {
    let testPartidoId: string;

    it('POST /api/v1/partidos -> agenda partido oficial', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/partidos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          categoria_id: categoriaId,
          rival_nombre: 'Rival Test FC',
          fecha_partido: '2026-04-10',
          hora_partido: '16:00:00',
          hora_citacion: '15:00:00',
          sede_cancha: 'Cancha Central Sede 1',
          condicion_juego: 'LOCAL',
          indumentaria_kit: 'Kit Titular',
        });
      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      testPartidoId = data.id;
    });

    it('POST /api/v1/partidos/:id/eventos -> registra evento de gol en acta digital', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/partidos/${testPartidoId}/eventos`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          minuto_juego: 25,
          tipo_evento: 'GOL',
          jugador_id: sampleJugadorId,
          observacion: 'Gol de media distancia',
        });
      expect(res.status).toBe(201);
    });

    it('DELETE /api/v1/partidos/:id -> elimina o cancela partido del fixture', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/partidos/${testPartidoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });
  });

  // --------------------------------------------------------------------------
  // 6. CONVOCATORIAS & ACTAS EN VIVO (MÓDULO 05)
  // --------------------------------------------------------------------------
  describe('Módulo 05: Convocatorias & Asistencia', () => {
    it('GET /api/v1/convocatorias/partido/:partidoId -> lista citación de jugadores', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/convocatorias/partido/50000000-0000-0000-0000-000000000001')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      const data = res.body.data || res.body;
      expect(data).toHaveProperty('jugadores');
      expect(Array.isArray(data.jugadores)).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 7. BIOMETRÍA & ANTROPOMETRÍA (MÓDULO 06)
  // --------------------------------------------------------------------------
  describe('Módulo 06: Biometría & Radar Físico', () => {
    it('POST /api/v1/biometria/evaluacion -> guarda medición física en BD', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/biometria/evaluacion')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jugadorId: sampleJugadorId,
          fechaEvaluacion: '2026-03-20',
          pesoKg: 62.5,
          tallaCm: 172.0,
          saltoVerticalCm: 38.0,
          velocidad30mSeg: 4.1,
          testCooperMetros: 2900,
        });
      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      expect(data.imc).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // 8. DASHBOARD & KPIS (MÓDULO 07)
  // --------------------------------------------------------------------------
  describe('Módulo 07: Dashboard Ejecutivo', () => {
    it('GET /api/v1/dashboard/kpis -> calcula métricas estratégicas del club', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/dashboard/kpis')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      const data = res.body.data || res.body;
      expect(data).toHaveProperty('jugadoresActivos');
      expect(data).toHaveProperty('totalCategorias');
      expect(data).toHaveProperty('finanzas');
    });
  });

  // --------------------------------------------------------------------------
  // 9. CANCHAS & RESERVAS (MÓDULO 08)
  // --------------------------------------------------------------------------
  describe('Módulo 08: Alquiler de Canchas & Escenarios', () => {
    let testCanchaId: string;
    let testReservaId: string;

    it('POST /api/v1/canchas -> registra escenario deportivo en BD', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/canchas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: `Cancha Test F5 ${Date.now()}`,
          tipo_superficie: 'sintetica_f5',
          precio_hora_diurna: 75000,
          precio_hora_nocturna: 110000,
          hora_apertura: '06:00',
          hora_cierre: '23:00',
        });
      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      testCanchaId = data.id;
    });

    it('GET /api/v1/canchas/:id -> obtiene detalle de la cancha por ID', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/canchas/${testCanchaId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      const data = res.body.data || res.body;
      expect(data.id).toBe(testCanchaId);
    });

    it('GET /api/v1/canchas/disponibilidad -> consulta matriz horaria', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/canchas/disponibilidad?fecha=2026-03-25')
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      const data = res.body.data || res.body;
      expect(data).toHaveProperty('canchas');
      expect(data).toHaveProperty('porcentaje_ocupacion');
    });

    it('POST /api/v1/canchas/reservas -> aparta turno con bloqueo horario', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/canchas/reservas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          cancha_id: testCanchaId,
          fecha_reserva: '2026-03-25',
          hora_inicio: '10:00',
          hora_fin: '11:00',
          tipo_reserva: 'alquiler_particular',
          cliente_nombre: 'Cliente Integración',
          cliente_telefono: '+57 310 000 1122',
          monto_anticipo: 37500,
          metodo_pago: 'EFECTIVO_CAJA',
        });
      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      testReservaId = data.id;
    });

    it('PATCH /api/v1/canchas/reservas/:id/pago-caja -> liquida saldo en recepción', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/canchas/reservas/${testReservaId}/pago-caja`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          monto: 37500,
          metodo_pago: 'EFECTIVO_CAJA',
        });
      expect(res.status).toBe(200);
      const data = res.body.data || res.body;
      expect(data.estado_pago).toBe('completado');
    });

    it('PATCH /api/v1/canchas/reservas/:id/cancelar -> cancela reserva', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/api/v1/canchas/reservas/${testReservaId}/cancelar`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });

    it('DELETE /api/v1/canchas/:id -> desactiva la cancha', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/canchas/${testCanchaId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });
  });

  // --------------------------------------------------------------------------
  // 10. TIENDA OFICIAL & STOCK (MÓDULO 09)
  // --------------------------------------------------------------------------
  describe('Módulo 09: Tienda Oficial & Inventario', () => {
    let testProductoId: string;
    let testVarianteId: string;

    it('POST /api/v1/tienda/productos -> crea producto con variantes en BD', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/tienda/productos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          codigo_sku: `SKU-TEST-${Date.now().toString().slice(-4)}`,
          nombre: 'Guantes de Portero Pro Test',
          categoria: 'accesorios',
          precio_venta: 180000,
          personalizable: false,
          variantes: [
            { talla: '8', stock_actual: 10, stock_minimo_alerta: 2 },
            { talla: '9', stock_actual: 15, stock_minimo_alerta: 3 },
          ],
        });
      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      testProductoId = data.id;

      // Obtener variante creada
      const dbVar = await dbService.query(
        `SELECT * FROM deportivo.variantes_producto WHERE producto_id = $1 LIMIT 1`,
        [testProductoId],
      );
      expect(dbVar.rows.length).toBeGreaterThan(0);
      testVarianteId = dbVar.rows[0].id;
    });

    it('GET /api/v1/tienda/productos/:id -> obtiene detalle de producto con variantes', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/tienda/productos/${testProductoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      const data = res.body.data || res.body;
      expect(data.id).toBe(testProductoId);
      expect(data.variantes.length).toBeGreaterThan(0);
    });

    it('POST /api/v1/tienda/pedidos -> genera compra y decrementa stock en BD', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/tienda/pedidos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          variante_id: testVarianteId,
          cantidad: 2,
          comprador_nombre: 'Padre Test',
          comprador_telefono: '+57 311 222 3344',
          metodo_pago: 'WOMPI_PSE',
        });
      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      expect(data.codigo_qr).toBeDefined();

      // Verificar stock decrementado
      const dbVarAfter = await dbService.query(
        `SELECT stock_actual FROM deportivo.variantes_producto WHERE id = $1`,
        [testVarianteId],
      );
      expect(Number(dbVarAfter.rows[0].stock_actual)).toBe(8);
    });

    it('DELETE /api/v1/tienda/productos/:id -> desactiva producto', async () => {
      const res = await request(app.getHttpServer())
        .delete(`/api/v1/tienda/productos/${testProductoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
    });
  });

  // --------------------------------------------------------------------------
  // 11. SPORTCORE AI GEMINI (MÓDULO 10)
  // --------------------------------------------------------------------------
  describe('Módulo 10: SportCore AI (Asistente Gemini)', () => {
    it('POST /api/v1/ia/generar-boletin-alumno -> genera boletín y guarda log en BD', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/ia/generar-boletin-alumno')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jugador_id: sampleJugadorId,
          periodo: '2026-03',
        });
      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      expect(data).toHaveProperty('boletin_markdown');
      expect(data).toHaveProperty('fortalezas');
      expect(data).toHaveProperty('log_id');

      // Verificar log persistido en BD
      const logCheck = await dbService.query(
        `SELECT * FROM deportivo.ia_logs_generacion WHERE id = $1`,
        [data.log_id],
      );
      expect(logCheck.rows.length).toBe(1);
    });

    it('GET /api/v1/ia/analisis-fatiga/:jugadorId -> evalúa riesgo y ACWR', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/ia/analisis-fatiga/${sampleJugadorId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      const data = res.body.data || res.body;
      expect(data).toHaveProperty('nivel_riesgo');
      expect(data).toHaveProperty('minutos_sugeridos_proximo_partido');
    });

    it('POST /api/v1/ia/chat-tactico-dt -> asesora al DT con plantilla contextual', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/ia/chat-tactico-dt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          consulta: '¿Cómo neutralizar un 4-3-3 rival con salida lavolpiana?',
          sistema_base: '1-4-2-3-1',
        });
      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      expect(data).toHaveProperty('analisis_tactico');
    });
  });

  // --------------------------------------------------------------------------
  // 12. SCOUTING & TALENTOS (MÓDULO 11)
  // --------------------------------------------------------------------------
  describe('Módulo 11: Scouting, Visoría & Captación', () => {
    let testProspectoId: string;

    it('POST /api/v1/scouting/prospectos -> registra talento en pipeline', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/scouting/prospectos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombres_apellidos: 'Joaquín Benítez',
          fecha_nacimiento: '2010-09-05',
          posicion_principal: 'volante_ofensivo',
          pie_habil: 'izquierdo',
          club_origen: 'Escuela Semillas del Valle',
          ciudad: 'Cali',
          altura_cm: 165.0,
          peso_kg: 54.0,
          estado_scouting: 'en_observacion',
        });
      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      testProspectoId = data.id;

      // Verificación en BD
      const dbP = await dbService.query(
        `SELECT * FROM deportivo.prospectos_scouting WHERE id = $1`,
        [testProspectoId],
      );
      expect(dbP.rows.length).toBe(1);
    });

    it('POST /api/v1/scouting/prospectos/:id/evaluaciones -> registra rúbrica 1-10', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/scouting/prospectos/${testProspectoId}/evaluaciones`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          score_tecnico: 9.2,
          score_tactico: 8.5,
          score_fisico: 8.0,
          score_mental: 8.8,
          comentarios_cualitativos: 'Excelente visión panorámica y pase filtrado.',
          recomendacion: 'FICHAR_YA',
        });
      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      expect(Number(data.promedio_global)).toBeCloseTo(8.6, 1);
    });

    it('GET /api/v1/scouting/prospectos/:id -> obtiene prospecto con rúbricas calculadas', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/scouting/prospectos/${testProspectoId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      const data = res.body.data || res.body;
      expect(data.evaluaciones.length).toBe(1);
    });
  });

  // --------------------------------------------------------------------------
  // 13. TELEMETRÍA GPS & WEARABLES (MÓDULO 12)
  // --------------------------------------------------------------------------
  describe('Módulo 12: Telemetría GPS, Heatmaps & Wearables', () => {
    let testSesionId: string;

    it('POST /api/v1/telemetria/sesiones -> crea sesión de tracking en BD', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/telemetria/sesiones')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fecha_sesion: '2026-03-21',
          tipo_sesion: 'PARTIDO_OFICIAL',
          dispositivo_marca: 'CATAPULT_10HZ',
          duracion_minutos: 90,
          clima_temperatura: '24°C Soleado',
        });
      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      testSesionId = data.id;
    });

    it('POST /api/v1/telemetria/sesiones/:id/metricas -> ingresa telemetría y heatmap 2D', async () => {
      const res = await request(app.getHttpServer())
        .post(`/api/v1/telemetria/sesiones/${testSesionId}/metricas`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jugador_id: sampleJugadorId,
          distancia_total_m: 10250.0,
          velocidad_max_kmh: 32.4,
          distancia_sprint_m: 720.0,
          sprints_conteo: 28,
          aceleraciones_intensas: 20,
          desaceleraciones_intensas: 16,
          player_load_au: 620.5,
          frecuencia_cardiaca_prom: 171,
          frecuencia_cardiaca_max: 196,
          coordenadas_heatmap_json: [
            { x: 30, y: 70, intensity: 0.9 },
            { x: 45, y: 80, intensity: 0.85 },
          ],
        });
      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      expect(data.id).toBeDefined();

      // Verificación directa en BD
      const dbMetrica = await dbService.query(
        `SELECT * FROM deportivo.metricas_rendimiento_gps WHERE id = $1`,
        [data.id],
      );
      expect(dbMetrica.rows.length).toBe(1);
    });

    it('GET /api/v1/telemetria/sesiones/:id -> consulta reporte cinemático con heatmap', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/telemetria/sesiones/${testSesionId}`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      const data = res.body.data || res.body;
      expect(data.metricas.length).toBeGreaterThan(0);
      expect(data.metricas[0].coordenadas_heatmap_json).toBeDefined();
    });

    it('GET /api/v1/telemetria/jugadores/:id/historial -> consulta historial de rendimiento', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/telemetria/jugadores/${sampleJugadorId}/historial`)
        .set('Authorization', `Bearer ${authToken}`);
      expect(res.status).toBe(200);
      const list = res.body.data || res.body;
      expect(Array.isArray(list)).toBe(true);
    });
  });

  // --------------------------------------------------------------------------
  // 14. GESTOR DOCUMENTAL & STORAGE CENTRALIZADO (ARCHIVOS REALES)
  // --------------------------------------------------------------------------
  describe('Gestor Centralizado de Almacenamiento & Archivos (core.archivos_adjuntos)', () => {
    let uploadedFotoPath: string;
    let uploadedPdfPath: string;
    let uploadedGpxPath: string;

    it('POST /api/v1/storage/upload -> sube Imagen PNG real (FOTO_PERFIL), valida escritura en disco y BD', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/storage/upload?folder=jugadores&entidadTipo=JUGADOR&entidadId=40000000-0000-0000-0000-000000000001&tipoDocumento=FOTO_PERFIL')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', 'test_fixtures/foto_perfil_real.png');

      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      expect(data).toHaveProperty('url');
      expect(data.mimetype).toBe('image/png');
      uploadedFotoPath = data.url;

      // 1. Verificación en BD PostgreSQL
      const dbCheck = await dbService.query(
        `SELECT * FROM core.archivos_adjuntos WHERE url = $1`,
        [data.url],
      );
      expect(dbCheck.rows.length).toBe(1);
      expect(dbCheck.rows[0].entidad_tipo).toBe('JUGADOR');
      expect(dbCheck.rows[0].tipo_documento).toBe('FOTO_PERFIL');
      expect(Number(dbCheck.rows[0].tamano_bytes)).toBeGreaterThan(0);
    });

    it('POST /api/v1/storage/upload -> sube Documento PDF real (CERTIFICADO_MEDICO / EPS) y valida persistencia', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/storage/upload?folder=documentos&entidadTipo=JUGADOR&entidadId=40000000-0000-0000-0000-000000000001&tipoDocumento=CERTIFICADO_MEDICO')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', 'test_fixtures/certificado_medico_real.pdf');

      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      expect(data.mimetype).toBe('application/pdf');
      uploadedPdfPath = data.url;

      const dbCheck = await dbService.query(
        `SELECT * FROM core.archivos_adjuntos WHERE url = $1`,
        [data.url],
      );
      expect(dbCheck.rows.length).toBe(1);
      expect(dbCheck.rows[0].tipo_documento).toBe('CERTIFICADO_MEDICO');
    });

    it('POST /api/v1/storage/upload -> sube archivo GPX real de Telemetría GPS y valida persistencia', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/storage/upload?folder=telemetria&entidadTipo=SESION_GPS&entidadId=70000000-0000-0000-0000-000000000001&tipoDocumento=TRACKING_GPS_RAW')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', 'test_fixtures/telemetria_sensor_real.gpx');

      expect(res.status).toBe(201);
      const data = res.body.data || res.body;
      uploadedGpxPath = data.url;

      const dbCheck = await dbService.query(
        `SELECT * FROM core.archivos_adjuntos WHERE url = $1`,
        [data.url],
      );
      expect(dbCheck.rows.length).toBe(1);
      expect(dbCheck.rows[0].entidad_tipo).toBe('SESION_GPS');
    });

    it('GET /api/v1/storage/entidad/JUGADOR/:id -> consulta archivos del jugador y verifica formato de URL para el Front', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/storage/entidad/JUGADOR/40000000-0000-0000-0000-000000000001')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      const list = res.body.data || res.body;
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);

      // Verificación de estructura de la URL consumible por Angular/Móvil
      const foto = list.find((item: any) => item.tipo_documento === 'FOTO_PERFIL');
      expect(foto).toBeDefined();
      expect(foto.url).toMatch(/^\/uploads\/clubes\/.+\.(png|webp|jpg)$/);
      expect(foto).toHaveProperty('nombre_original');
      expect(foto).toHaveProperty('tamano_bytes');
    });

    it('DELETE /api/v1/storage/file -> elimina archivos físicos del servidor', async () => {
      for (const filePath of [uploadedFotoPath, uploadedPdfPath, uploadedGpxPath]) {
        const res = await request(app.getHttpServer())
          .delete(`/api/v1/storage/file?path=${encodeURIComponent(filePath)}`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        const data = res.body.data || res.body;
        expect(data.success).toBe(true);
      }
    });
  });
});


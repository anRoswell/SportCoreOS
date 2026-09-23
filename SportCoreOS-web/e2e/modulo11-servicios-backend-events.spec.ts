import { test, expect } from '@playwright/test';
import { attachStrictErrorSniffer } from './helpers/error-sniffer';
import { queryDb } from './helpers/db-helper';

const API_BASE_URL = 'http://localhost:3001/api/v1';

test.describe('MÓDULO 11: EVENTOS BACKEND & SERVICIOS ESPECIALIZADOS - EXHAUSTIVO', () => {
  let authToken = '';
  let testClubId = '10000000-0000-0000-0000-000000000001';

  test.beforeAll(async ({ request }) => {
    // 1. Obtener Token JWT oficial del Director Deportivo (Carlos Valderrama)
    const loginRes = await request.post(`${API_BASE_URL}/auth/login`, {
      data: {
        email: 'carlos.valderrama@sportcore.com',
        password: 'sportcore2026',
      },
    });

    expect(loginRes.status()).toBe(200);
    const loginJson = await loginRes.json();
    const token = loginJson.data?.accessToken || loginJson.accessToken;
    expect(token).toBeTruthy();
    authToken = token;

    if (loginJson.data?.user?.clubId) {
      testClubId = loginJson.data.user.clubId;
    }
  });

  // ===========================================================================
  // SUITE 1: EVENTOS DE CONSULTA AL BACKEND (GET ENDPOINTS & FILTROS)
  // ===========================================================================
  test.describe('SUITE 1: Eventos de Consulta al Backend (GET)', () => {

    test('1.1. Evento GET /api/v1/servicios: Catálogo general, estructura de payload y consistencia con PostgreSQL', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/servicios`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status()).toBe(200);
      const json = await response.json();
      const servicios = json.data || json;
      expect(Array.isArray(servicios)).toBe(true);
      expect(servicios.length).toBeGreaterThanOrEqual(4);

      // Validar contrato de campos de la primera clínica
      const primerServicio = servicios[0];
      expect(primerServicio).toHaveProperty('id');
      expect(primerServicio).toHaveProperty('club_id');
      expect(primerServicio).toHaveProperty('titulo');
      expect(primerServicio).toHaveProperty('subtitulo');
      expect(primerServicio).toHaveProperty('categoria_servicio');
      expect(primerServicio).toHaveProperty('entrenador_nombre');
      expect(primerServicio).toHaveProperty('cancha_nombre');
      expect(primerServicio).toHaveProperty('dias_semana');
      expect(primerServicio).toHaveProperty('horario_rango');
      expect(primerServicio).toHaveProperty('cupos_totales');
      expect(primerServicio).toHaveProperty('cupos_ocupados');
      expect(primerServicio).toHaveProperty('precio_sesion_individual');
      expect(primerServicio).toHaveProperty('precio_paquete_mensual');
      expect(primerServicio).toHaveProperty('insignia_obtenida');
      expect(primerServicio).toHaveProperty('total_inscritos');

      // Verificación directa en base de datos PostgreSQL
      const dbCount = await queryDb(
        `SELECT COUNT(*) as total FROM public.servicios_especializados WHERE club_id = $1 AND activo = true`,
        [testClubId]
      );
      expect(Number(dbCount[0].total)).toBe(servicios.length);
    });

    test('1.2. Evento GET /api/v1/servicios?categoria=...: Filtrado reactivo en Backend por categorías especializadas', async ({ request }) => {
      const categorias = [
        'VELOCIDAD_EXPLOSIVIDAD',
        'ARQUEROS_ELITE',
        'TECNICA_REGATE',
        'DEFINICION_TIRO',
        'COORDINACION_AGILIDAD',
      ];

      for (const cat of categorias) {
        const response = await request.get(`${API_BASE_URL}/servicios?categoria=${cat}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        expect(response.status()).toBe(200);
        const json = await response.json();
        const servicios = json.data || json;
        expect(Array.isArray(servicios)).toBe(true);

        for (const s of servicios) {
          expect(s.categoria_servicio).toBe(cat);
        }
      }
    });

    test('1.3. Evento GET /api/v1/servicios?search=...: Búsqueda reactiva por título, entrenador o cancha', async ({ request }) => {
      const searchTerm = 'Arqueros';
      const response = await request.get(`${API_BASE_URL}/servicios?search=${encodeURIComponent(searchTerm)}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status()).toBe(200);
      const json = await response.json();
      const servicios = json.data || json;
      expect(Array.isArray(servicios)).toBe(true);
      expect(servicios.length).toBeGreaterThanOrEqual(1);

      for (const s of servicios) {
        const match =
          s.titulo.toLowerCase().includes('arqueros') ||
          s.subtitulo.toLowerCase().includes('arqueros') ||
          s.entrenador_nombre.toLowerCase().includes('arqueros') ||
          s.cancha_nombre.toLowerCase().includes('arqueros');
        expect(match).toBe(true);
      }
    });

    test('1.4. Evento GET /api/v1/servicios/:id: Detalle por UUID válido y validación de 404 en ID inexistente', async ({ request }) => {
      // 1. Obtener una clínica válida existente
      const listRes = await request.get(`${API_BASE_URL}/servicios`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const listJson = await listRes.json();
      const validService = (listJson.data || listJson)[0];
      expect(validService?.id).toBeTruthy();

      // 2. Consultar detalle por ID
      const detailRes = await request.get(`${API_BASE_URL}/servicios/${validService.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(detailRes.status()).toBe(200);
      const detailJson = await detailRes.json();
      const item = detailJson.data || detailJson;
      expect(item.id).toBe(validService.id);
      expect(item.titulo).toBe(validService.titulo);
      expect(item.entrenador_nombre).toBe(validService.entrenador_nombre);

      // 3. Consultar ID inexistente (debe retornar 404)
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const notFoundRes = await request.get(`${API_BASE_URL}/servicios/${fakeId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(notFoundRes.status()).toBe(404);
    });
  });

  // ===========================================================================
  // SUITE 2: EVENTOS DE MUTACIÓN Y TRANSACCIONALIDAD EN BACKEND (POST)
  // ===========================================================================
  test.describe('SUITE 2: Eventos de Mutación y Persistencia (POST & DB)', () => {

    test('2.1. Evento POST /api/v1/servicios: Creación de nueva clínica especializada y verificación en PostgreSQL', async ({ request }) => {
      const timestamp = Date.now().toString().slice(-4);
      const nuevoPayload = {
        titulo: `Masterclass E2E Tiro Libre Efecto Roberto Carlos ${timestamp}`,
        subtitulo: 'Técnica de golpeo con empeine exterior y efecto comba en balón parado',
        categoria_servicio: 'DEFINICION_TIRO',
        icono: 'fa-bullseye',
        color_tema: '#8b5cf6',
        entrenador_nombre: 'DT. Carlos Valderrama E2E',
        entrenador_badge: 'Leyenda del Fútbol Colombiano',
        cancha_nombre: 'Cancha Sintética Bocagrande Club',
        cancha_direccion: 'Carrera 2da con Calle 6ta, Bocagrande, Cartagena',
        cancha_gps_url: 'https://maps.google.com/?q=10.404510,-75.556210',
        dias_semana: 'Sábados y Domingos',
        horario_rango: '08:00 AM - 10:00 AM',
        duracion_minutos: 90,
        edad_min: 9,
        edad_max: 17,
        cupos_totales: 15,
        precio_sesion_individual: 45000,
        precio_paquete_mensual: 165000,
        descuento_hermanos_pct: 15,
        insignia_obtenida: `🎯 Francotirador de Élite ${timestamp}`,
        descripcion: 'Clínica de alta especialización en tiros libres directos y golpeo de comba.',
        beneficios: [
          'Grabación en alta velocidad (240fps) de la parábola del balón',
          'Balones profesionales con micro-sensores de rotación',
          'Insignia digital y diploma oficial de francotirador',
        ],
      };

      const response = await request.post(`${API_BASE_URL}/servicios`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: nuevoPayload,
      });

      expect(response.status()).toBe(201);
      const json = await response.json();
      const createdService = json.data || json;
      expect(createdService.id).toBeTruthy();
      expect(createdService.titulo).toBe(nuevoPayload.titulo);

      // Verificación directa en base de datos PostgreSQL
      const dbRow = await queryDb(
        `SELECT * FROM public.servicios_especializados WHERE id = $1`,
        [createdService.id]
      );
      expect(dbRow.length).toBe(1);
      expect(dbRow[0].titulo).toBe(nuevoPayload.titulo);
      expect(dbRow[0].entrenador_nombre).toBe(nuevoPayload.entrenador_nombre);
      expect(Number(dbRow[0].cupos_totales)).toBe(15);
      expect(Number(dbRow[0].cupos_ocupados)).toBe(0);
      expect(dbRow[0].activo).toBe(true);
    });

    test('2.2. Evento POST /api/v1/servicios/:id/inscribir: Transacción PSE, Pase QR e incremento atómico de cupos', async ({ request }) => {
      // 1. Crear una clínica temporal para la prueba de inscripción
      const clinicTitle = `Clínica Sprint Explosivo Test ${Date.now().toString().slice(-4)}`;
      const createRes = await request.post(`${API_BASE_URL}/servicios`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          titulo: clinicTitle,
          subtitulo: 'Test de checkout y generación de QR',
          categoria_servicio: 'VELOCIDAD_EXPLOSIVIDAD',
          entrenador_nombre: 'PF. Marcos Cardona',
          cancha_nombre: 'Cancha Sintética San Fernando',
          cancha_direccion: 'Cra 80 #30-45, San Fernando, Cartagena',
          dias_semana: 'Lunes y Miércoles',
          horario_rango: '04:00 PM - 05:30 PM',
          cupos_totales: 8,
          precio_sesion_individual: 35000,
          precio_paquete_mensual: 130000,
          descuento_hermanos_pct: 15,
          insignia_obtenida: '⚡ Velocidad Relámpago',
          descripcion: 'Prueba de checkout transaccional.',
          beneficios: ['Certificado digital'],
        },
      });
      expect(createRes.status()).toBe(201);
      const clinicData = (await createRes.json()).data || (await createRes.json());
      const clinicId = clinicData.id;

      // 2. Realizar inscripción con checkout PSE
      const playerName = `Atleta E2E Backend ${Date.now().toString().slice(-4)}`;
      const guardianName = 'Carlos Valderrama Acudiente';
      const inscripcionPayload = {
        nombre_jugador: playerName,
        nombre_acudiente: guardianName,
        telefono_acudiente: '+57 300 888 9999',
        email_acudiente: 'carlos.valderrama@sportcore.co',
        tipo_plan: 'PAQUETE_MENSUAL',
        monto_pagado: 130000,
        metodo_pago: 'WOMPI_PSE',
      };

      const inscribeRes = await request.post(`${API_BASE_URL}/servicios/${clinicId}/inscribir`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: inscripcionPayload,
      });

      expect(inscribeRes.status()).toBe(201);
      const inscribeJson = await inscribeRes.json();
      const inscribeData = inscribeJson.data || inscribeJson;
      const inscripcion = inscribeData.inscripcion || inscribeData;

      expect(inscripcion.nombre_jugador).toBe(playerName);
      expect(inscripcion.nombre_acudiente).toBe(guardianName);
      expect(inscripcion.estado_pago).toBe('APROBADO');
      expect(inscripcion.codigo_qr_ticket).toMatch(/^SPORT-PASS-[A-F0-9-]+$/i);
      expect(inscripcion.referencia_transaccion).toMatch(/^WOMPI-SPORT-[A-Z0-9-]+$/i);

      // 3. Verificación directa en base de datos PostgreSQL
      const dbInscripciones = await queryDb(
        `SELECT * FROM public.inscripciones_servicios WHERE servicio_id = $1 AND nombre_jugador = $2`,
        [clinicId, playerName]
      );
      expect(dbInscripciones.length).toBe(1);
      expect(dbInscripciones[0].codigo_qr_ticket).toBe(inscripcion.codigo_qr_ticket);
      expect(dbInscripciones[0].referencia_transaccion).toBe(inscripcion.referencia_transaccion);

      // 4. Verificar incremento atómico de cupos_ocupados en la tabla de servicios
      const dbServicio = await queryDb(
        `SELECT cupos_totales, cupos_ocupados FROM public.servicios_especializados WHERE id = $1`,
        [clinicId]
      );
      expect(Number(dbServicio[0].cupos_ocupados)).toBe(1);
    });

    test('2.3. Evento POST /api/v1/servicios/:id/inscribir: Validación estricta de cupos agotados (HTTP 400 Bad Request)', async ({ request }) => {
      // 1. Crear una clínica con exactamente 1 cupo total
      const createRes = await request.post(`${API_BASE_URL}/servicios`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          titulo: `Clínica Cupo Lleno Test ${Date.now().toString().slice(-4)}`,
          subtitulo: 'Prueba de desborde y bloqueo de cupos',
          categoria_servicio: 'ARQUEROS_ELITE',
          entrenador_nombre: 'DT. René Higuita',
          cancha_nombre: 'Cancha Castillogrande',
          cancha_direccion: 'Calle 5ta con Carrera 14, Castillogrande',
          dias_semana: 'Viernes',
          horario_rango: '05:00 PM - 06:30 PM',
          cupos_totales: 1, // EXACTAMENTE 1 CUPO
          precio_sesion_individual: 40000,
          precio_paquete_mensual: 150000,
          insignia_obtenida: '🧤 Portero Blindado',
          descripcion: 'Prueba de cupo agotado.',
        },
      });
      expect(createRes.status()).toBe(201);
      const clinicData = (await createRes.json()).data || (await createRes.json());
      const clinicId = clinicData.id;

      // 2. Inscribir al primer atleta (llena el 100% de cupos disponibles)
      const firstInscribe = await request.post(`${API_BASE_URL}/servicios/${clinicId}/inscribir`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          nombre_jugador: 'Atleta Titular Aceptado',
          nombre_acudiente: 'Carlos Valderrama',
          telefono_acudiente: '+57 300 111 2222',
          tipo_plan: 'SESION_INDIVIDUAL',
          monto_pagado: 40000,
          metodo_pago: 'WOMPI_PSE',
        },
      });
      expect(firstInscribe.status()).toBe(201);

      // 3. Intentar inscribir al segundo atleta cuando los cupos están agotados
      const secondInscribe = await request.post(`${API_BASE_URL}/servicios/${clinicId}/inscribir`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          nombre_jugador: 'Atleta Rechazado por Cupo Lleno',
          nombre_acudiente: 'Padre Rechazado',
          telefono_acudiente: '+57 300 333 4444',
          tipo_plan: 'SESION_INDIVIDUAL',
          monto_pagado: 40000,
          metodo_pago: 'WOMPI_PSE',
        },
      });

      // Debe retornar HTTP 400 Bad Request
      expect(secondInscribe.status()).toBe(400);
      const errorJson = await secondInscribe.json();
      const errorMessage = errorJson.message || errorJson.error;
      expect(errorMessage).toContain('agotado');

      // 4. Validar en PostgreSQL que no se insertó un registro huérfano
      const dbInscripciones = await queryDb(
        `SELECT COUNT(*) as total FROM public.inscripciones_servicios WHERE servicio_id = $1`,
        [clinicId]
      );
      expect(Number(dbInscripciones[0].total)).toBe(1);
    });

    test('2.4. Evento GET /api/v1/servicios/:id/inscripciones: Consulta del roster de atletas inscritos con join relacional', async ({ request }) => {
      // 1. Obtener la clínica con inscripciones
      const listRes = await request.get(`${API_BASE_URL}/servicios`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const listJson = await listRes.json();
      const servicios = listJson.data || listJson;
      const servicioConInscritos = servicios.find((s: any) => Number(s.cupos_ocupados) > 0) || servicios[0];

      // 2. Consultar inscripciones de esa clínica
      const inscripcionesRes = await request.get(`${API_BASE_URL}/servicios/${servicioConInscritos.id}/inscripciones`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(inscripcionesRes.status()).toBe(200);
      const json = await inscripcionesRes.json();
      const inscritos = json.data || json;
      expect(Array.isArray(inscritos)).toBe(true);

      if (inscritos.length > 0) {
        const first = inscritos[0];
        expect(first).toHaveProperty('id');
        expect(first).toHaveProperty('servicio_id');
        expect(first).toHaveProperty('nombre_jugador');
        expect(first).toHaveProperty('nombre_acudiente');
        expect(first).toHaveProperty('codigo_qr_ticket');
        expect(first).toHaveProperty('servicio_titulo');
        expect(first).toHaveProperty('horario_rango');
      }
    });
  });

  // ===========================================================================
  // SUITE 3: INTERCEPCIÓN E2E FRONTEND WEB DE EVENTOS QUE CONSULTAN EL BACKEND
  // ===========================================================================
  test.describe('SUITE 3: Intercepción E2E Frontend Web (Event Listeners & UI Sync)', () => {

    test.beforeEach(async ({ page }) => {
      // Login como Director Deportivo en la interfaz Web
      await page.goto('/login');
      await page.waitForLoadState('domcontentloaded');

      const demoDirBtn = page.locator('.persona-btn', { hasText: 'Carlos Valderrama' }).first();
      await expect(demoDirBtn).toBeVisible({ timeout: 15000 });
      await demoDirBtn.click({ force: true });
      await page.waitForURL('**/dashboard', { timeout: 15000 });
    });

    test('3.1. Intercepción en tiempo real de GET /api/v1/servicios al cargar la vista Web y cálculo de KPIs', async ({ page }) => {
      const sniffer = attachStrictErrorSniffer(page);

      // Monitorear respuesta de red de la API
      const [response] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/api/v1/servicios') && res.status() === 200),
        page.goto('/servicios'),
      ]);

      expect(response.status()).toBe(200);
      const json = await response.json();
      const data = json.data || json;
      expect(data.length).toBeGreaterThanOrEqual(1);

      // Validar que el conteo en los KPIs de la UI coincide con la respuesta del backend
      await expect(page.locator('.kpi-num').first()).toContainText(data.length.toString());

      sniffer.assertZeroErrors();
    });

    test('3.2. Intercepción en tiempo real de GET /api/v1/servicios/:id/inscripciones al abrir el modal de participantes', async ({ page }) => {
      const sniffer = attachStrictErrorSniffer(page);

      await page.goto('/servicios');
      await page.waitForLoadState('networkidle');

      const btnParticipantes = page.locator('.btn-participantes').first();
      await expect(btnParticipantes).toBeVisible();

      // Interceptar la petición de participantes al hacer click
      const [response] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/inscripciones') && res.status() === 200),
        btnParticipantes.click(),
      ]);

      expect(response.status()).toBe(200);
      const modal = page.locator('.modal-dialog');
      await expect(modal).toBeVisible();
      await expect(modal.locator('.modal-title')).toContainText('Participantes Inscritos');

      // Cerrar modal
      await modal.locator('.btn-secondary', { hasText: 'Cerrar' }).click();
      await page.waitForTimeout(200);

      sniffer.assertZeroErrors();
    });

    test('3.3. Intercepción en tiempo real de POST /api/v1/servicios/:id/inscribir y posterior recarga de cupos', async ({ page }) => {
      const sniffer = attachStrictErrorSniffer(page);

      await page.goto('/servicios');
      await page.waitForLoadState('networkidle');

      // Tomar una clínica con cupos disponibles
      const availableCard = page.locator('.servicio-card', { has: page.locator('.btn-inscribir:not([disabled])') }).first();
      await availableCard.locator('.btn-inscribir').click();

      const modal = page.locator('.modal-dialog');
      await expect(modal).toBeVisible();

      const testPlayer = `Mateo Valderrama Intercept ${Date.now().toString().slice(-4)}`;
      await modal.locator('input[placeholder*="Mateo Valderrama"]').fill(testPlayer);
      await modal.locator('input[placeholder*="Carlos Valderrama"]').fill('Carlos Valderrama');
      await modal.locator('input[placeholder*="300 123 4567"]').fill('+57 300 777 8888');

      // Enviar y capturar la petición POST /inscribir y la posterior recarga GET /servicios
      const [postResponse] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/inscribir') && res.request().method() === 'POST'),
        modal.locator('.modal-footer .btn-primary').click(),
      ]);

      expect(postResponse.status()).toBe(201);
      const postJson = await postResponse.json();
      const inscribeData = postJson.data || postJson;
      const inscripcion = inscribeData.inscripcion || inscribeData;
      expect(inscripcion.codigo_qr_ticket).toBeTruthy();

      // Validar que se despliega el Pase QR en pantalla
      const ticketCard = page.locator('.ticket-card');
      await expect(ticketCard).toBeVisible({ timeout: 8000 });
      await expect(ticketCard.locator('.ticket-status')).toContainText('INSCRIPCIÓN CONFIRMADA');
      await ticketCard.locator('.ticket-footer .btn-primary').click();

      sniffer.assertZeroErrors();
    });

    test('3.4. Intercepción en tiempo real de POST /api/v1/servicios al crear clínica desde modal', async ({ page }) => {
      const sniffer = attachStrictErrorSniffer(page);

      await page.goto('/servicios');
      await page.waitForLoadState('networkidle');

      await page.locator('.btn-create').click();
      const modal = page.locator('.modal-dialog');
      await expect(modal).toBeVisible();

      const testTitle = `Clínica E2E Intercept UI ${Date.now().toString().slice(-4)}`;
      await modal.locator('input[placeholder*="Potencia de Salto"]').fill(testTitle);
      await modal.locator('input[placeholder*="Técnica de salto"]').fill('Subtítulo de prueba para intercepción');
      await modal.locator('input[placeholder*="Iván Ramiro"]').fill('DT. Carlos Valderrama');
      await modal.locator('input[placeholder*="Cancha Sintética Pie"]').fill('Cancha San Fernando Cartagena');
      await modal.locator('input[placeholder*="Calle 30 con Carrera"]').fill('Cra 80 #30-45');
      await modal.locator('input[placeholder*="Torre Aérea"]').fill('🏅 Insignia Interceptada');

      // Enviar y capturar el POST /servicios
      const [createResponse] = await Promise.all([
        page.waitForResponse(res => res.url().endsWith('/servicios') && res.request().method() === 'POST'),
        modal.locator('.modal-footer .btn-primary').click(),
      ]);

      expect(createResponse.status()).toBe(201);
      await page.waitForTimeout(500);

      // Validar que la nueva clínica aparece visible en la lista
      const newCard = page.locator('.servicio-card', { hasText: testTitle });
      await expect(newCard).toBeVisible();

      sniffer.assertZeroErrors();
    });
  });

  // ===========================================================================
  // SUITE 4: INTERCEPCIÓN E2E MOBILE APP DE EVENTOS DE BACKEND (PORT 4203)
  // ===========================================================================
  test.describe('SUITE 4: Intercepción E2E Mobile App de Eventos de Backend', () => {

    test('4.1. Mobile: Carga de clínicas, botón de refresh (GET /servicios) y reserva con generación de Pase QR', async ({ page }) => {
      // 1. Inyectar sesión autenticada en localStorage de la app móvil
      await page.goto('http://localhost:4203/auth/login');
      await page.evaluate((token) => {
        localStorage.setItem('sportcore_token', token);
        localStorage.setItem('sportcore_user', JSON.stringify({
          id: '00000000-0000-0000-0000-000000000002',
          email: 'carlos.valderrama@sportcore.com',
          nombres: 'Carlos',
          apellidos: 'Valderrama',
          rol: 'DIRECTOR_DEPORTIVO',
          clubId: '10000000-0000-0000-0000-000000000001',
          clubNombre: 'Club Deportivo Futuros Cracks FC',
        }));
      }, authToken);

      // 2. Ir a la vista de Servicios & Clínicas Móvil
      const [mobileServiciosRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/api/v1/servicios') && res.status() === 200),
        page.goto('http://localhost:4203/servicios'),
      ]);
      expect(mobileServiciosRes.status()).toBe(200);
      await page.waitForLoadState('networkidle');

      // 3. Probar botón de refresh en la subbarra superior
      const btnRefresh = page.locator('.btn-icon-refresh');
      await expect(btnRefresh).toBeVisible();
      const [refreshRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/api/v1/servicios') && res.status() === 200),
        btnRefresh.click(),
      ]);
      expect(refreshRes.status()).toBe(200);

      // 4. Probar Reserva en la primera tarjeta disponible
      const firstBookBtn = page.locator('.clinica-card .btn-book:not([disabled])').first();
      await expect(firstBookBtn).toBeVisible();
      await firstBookBtn.click();

      // Validar apertura del Bottom Sheet Modal
      const sheetContent = page.locator('.sheet-content');
      await expect(sheetContent).toBeVisible();

      // Llenar formulario de checkout en Bottom Sheet
      const mobilePlayer = `Atleta Mobile E2E ${Date.now().toString().slice(-4)}`;
      await sheetContent.locator('input[placeholder*="Mateo Valderrama"]').fill(mobilePlayer);
      await sheetContent.locator('input[placeholder*="Carlos Valderrama"]').fill('Carlos Valderrama Acudiente');
      await sheetContent.locator('input[type="tel"]').fill('+57 300 444 5555');

      const btnPay = sheetContent.locator('.btn-pay-now');
      await btnPay.scrollIntoViewIfNeeded();
      await expect(btnPay).toBeEnabled();

      // Interceptar POST de inscripción
      const [inscribeMobileRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/inscribir') && res.request().method() === 'POST'),
        btnPay.click({ force: true }),
      ]);

      expect(inscribeMobileRes.status()).toBe(201);

      // Validar ticket QR generado en el Bottom Sheet
      const ticketView = page.locator('.ticket-view');
      await expect(ticketView).toBeVisible({ timeout: 6000 });
      await expect(ticketView.locator('h3')).toContainText('Inscripción Exitosa');
      await expect(ticketView.locator('.btn-whatsapp-share')).toBeVisible();

      // Cerrar ticket y abrir modal "Mis Pases"
      await ticketView.locator('.btn-close-sheet').click();
      await page.waitForTimeout(300);

      const btnMisPases = page.locator('.btn-mis-pases');
      await expect(btnMisPases).toBeVisible();
      await btnMisPases.click();

      const pasesOverlay = page.locator('.sheet-overlay', { has: page.locator('h3:has-text("Mis Pases QR")') });
      await expect(pasesOverlay).toBeVisible();

      // Cerrar modal de mis pases
      await pasesOverlay.locator('.btn-close-sheet').click();
      await page.waitForTimeout(200);
      await expect(pasesOverlay).not.toBeVisible();
    });
  });

});


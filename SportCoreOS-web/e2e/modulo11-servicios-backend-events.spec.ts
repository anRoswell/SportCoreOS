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

    test('1.5. Evento GET /api/v1/servicios/inscripciones/pendientes: Listado consolidado para tesorería', async ({ request }) => {
      const response = await request.get(`${API_BASE_URL}/servicios/inscripciones/pendientes`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(response.status()).toBe(200);
      const json = await response.json();
      const pendientes = json.data || json;
      expect(Array.isArray(pendientes)).toBe(true);

      for (const p of pendientes) {
        expect(p.estado_pago).toBe('PENDIENTE_APROBACION');
        expect(p).toHaveProperty('servicio_titulo');
        expect(p).toHaveProperty('cancha_nombre');
        expect(p).toHaveProperty('monto_pagado');
      }
    });
  });

  // ===========================================================================
  // SUITE 2: EVENTOS DE MUTACIÓN Y TRANSACCIONALIDAD EN BACKEND (POST & PATCH)
  // ===========================================================================
  test.describe('SUITE 2: Eventos de Mutación y Persistencia (POST, PATCH & DB)', () => {

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

    test('2.5. Evento POST con NEQUI y comprobante_url: Deja estado PENDIENTE_APROBACION y persiste soporte', async ({ request }) => {
      // 1. Obtener una clínica activa con cupos disponibles
      const listRes = await request.get(`${API_BASE_URL}/servicios`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const listJson = await listRes.json();
      const servicios = listJson.data || listJson;
      const validService = servicios.find((s: any) => Number(s.cupos_ocupados) < Number(s.cupos_totales)) || servicios[0];

      // 2. Inscribir con Nequi y comprobante
      const playerName = `Atleta Nequi Voucher ${Date.now().toString().slice(-4)}`;
      const voucherUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80';
      const refNum = `NQ-${Date.now().toString().slice(-6)}`;

      const inscribeRes = await request.post(`${API_BASE_URL}/servicios/${validService.id}/inscribir`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          nombre_jugador: playerName,
          nombre_acudiente: 'Juana Restrepo',
          telefono_acudiente: '+57 311 555 7777',
          email_acudiente: 'juana@example.com',
          tipo_plan: 'PAQUETE_MENSUAL',
          monto_pagado: Number(validService.precio_paquete_mensual),
          metodo_pago: 'NEQUI',
          comprobante_url: voucherUrl,
          referencia_transaccion: refNum,
        },
      });

      expect(inscribeRes.status()).toBe(201);
      const incJson = await inscribeRes.json();
      const inc = incJson.data?.inscripcion || incJson.inscripcion || incJson.data;

      expect(inc.estado_pago).toBe('PENDIENTE_APROBACION');
      expect(inc.comprobante_url).toBe(voucherUrl);

      // Verificación directa en base de datos PostgreSQL
      const dbRow = await queryDb(
        `SELECT * FROM public.inscripciones_servicios WHERE id = $1`,
        [inc.id]
      );
      expect(dbRow.length).toBe(1);
      expect(dbRow[0].estado_pago).toBe('PENDIENTE_APROBACION');
      expect(dbRow[0].comprobante_url).toBe(voucherUrl);
      expect(dbRow[0].referencia_transaccion).toBe(refNum);
    });

    test('2.6. Evento PATCH /api/v1/servicios/inscripciones/:id/aprobar (APROBADO): Validación por tesorería con auditoría', async ({ request }) => {
      // 1. Obtener una clínica activa para crear una inscripción pendiente
      const listRes = await request.get(`${API_BASE_URL}/servicios`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const listJson = await listRes.json();
      const servicios = listJson.data || listJson;
      const validService = servicios.find((s: any) => Number(s.cupos_ocupados) < Number(s.cupos_totales)) || servicios[0];

      // 2. Crear inscripción Nequi pendiente
      const inscribeRes = await request.post(`${API_BASE_URL}/servicios/${validService.id}/inscribir`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          nombre_jugador: `Atleta Por Aprobar ${Date.now().toString().slice(-4)}`,
          nombre_acudiente: 'Padre Para Aprobar',
          telefono_acudiente: '+57 320 111 9999',
          tipo_plan: 'PAQUETE_MENSUAL',
          monto_pagado: Number(validService.precio_paquete_mensual),
          metodo_pago: 'NEQUI',
          comprobante_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
        },
      });
      const inc = (await inscribeRes.json()).data?.inscripcion;
      expect(inc?.id).toBeTruthy();

      // 3. Tesorería aprueba el pago
      const approveRes = await request.patch(`${API_BASE_URL}/servicios/inscripciones/${inc.id}/aprobar`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          estado: 'APROBADO',
          notas_tesoreria: 'Validado contra extracto Bancolombia exitosamente',
        },
      });

      expect(approveRes.status()).toBe(200);
      const approveJson = await approveRes.json();
      const updated = approveJson.data?.inscripcion || approveJson.inscripcion || approveJson.data || approveJson;
      expect(updated.estado_pago).toBe('APROBADO');
      expect(updated.aprobado_por_nombre).toBeTruthy();

      // 4. Verificación directa en base de datos PostgreSQL
      const dbRow = await queryDb(
        `SELECT * FROM public.inscripciones_servicios WHERE id = $1`,
        [inc.id]
      );
      expect(dbRow.length).toBe(1);
      expect(dbRow[0].estado_pago).toBe('APROBADO');
      expect(dbRow[0].aprobado_por_nombre).toBeTruthy();
      expect(dbRow[0].fecha_aprobacion).toBeTruthy();
      expect(dbRow[0].notas_tesoreria).toContain('Validado');
    });

    test('2.7. Evento PATCH /api/v1/servicios/inscripciones/:id/aprobar (RECHAZADO): Motivo de rechazo y liberación atómica de cupo', async ({ request }) => {
      // 1. Crear una clínica temporal para medir decremento de cupos
      const createRes = await request.post(`${API_BASE_URL}/servicios`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          titulo: `Clínica Test Rechazo Cupo ${Date.now().toString().slice(-4)}`,
          subtitulo: 'Validación de liberación de cupo en rechazo',
          categoria_servicio: 'DEFINICION_TIRO',
          entrenador_nombre: 'DT. James Rodríguez',
          cancha_nombre: 'Cancha San Fernando',
          cancha_direccion: 'Cra 80 #30-45',
          dias_semana: 'Martes',
          horario_rango: '03:00 PM - 04:30 PM',
          cupos_totales: 5,
          precio_sesion_individual: 30000,
          precio_paquete_mensual: 110000,
          insignia_obtenida: '🎯 Tiro Certero',
          descripcion: 'Prueba de rechazo de soporte.',
        },
      });
      const clinic = (await createRes.json()).data;

      // 2. Inscribir con Nequi (incrementa cupos_ocupados a 1)
      const inscribeRes = await request.post(`${API_BASE_URL}/servicios/${clinic.id}/inscribir`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          nombre_jugador: 'Atleta Rechazado Test',
          nombre_acudiente: 'Padre Rechazado Test',
          telefono_acudiente: '+57 315 222 3333',
          tipo_plan: 'SESION_INDIVIDUAL',
          monto_pagado: 30000,
          metodo_pago: 'NEQUI',
          comprobante_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
        },
      });
      const inc = (await inscribeRes.json()).data?.inscripcion;

      // Comprobar cupo = 1
      const dbPre = await queryDb(`SELECT cupos_ocupados FROM public.servicios_especializados WHERE id = $1`, [clinic.id]);
      expect(Number(dbPre[0].cupos_ocupados)).toBe(1);

      // 3. Tesorería rechaza el pago
      const rejectRes = await request.patch(`${API_BASE_URL}/servicios/inscripciones/${inc.id}/aprobar`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        data: {
          estado: 'RECHAZADO',
          motivo_rechazo: 'Comprobante no coincide con extracto de Nequi',
        },
      });

      expect(rejectRes.status()).toBe(200);

      // 4. Verificación directa en base de datos PostgreSQL: estado RECHAZADO y cupos_ocupados decrementado a 0
      const dbInc = await queryDb(`SELECT * FROM public.inscripciones_servicios WHERE id = $1`, [inc.id]);
      expect(dbInc[0].estado_pago).toBe('RECHAZADO');
      expect(dbInc[0].motivo_rechazo).toContain('no coincide');

      const dbPost = await queryDb(`SELECT cupos_ocupados FROM public.servicios_especializados WHERE id = $1`, [clinic.id]);
      expect(Number(dbPost[0].cupos_ocupados)).toBe(0);
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

      // Monitorear respuesta de red de la API para el catálogo general
      const [response] = await Promise.all([
        page.waitForResponse(res => /\/api\/v1\/servicios(\?.*)?$/.test(res.url()) && res.status() === 200),
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
      await expect(modal.locator('.modal-title')).toContainText('Participantes');

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
      await modal.locator('input[placeholder*="Máxima elevación"]').fill('Subtítulo de prueba para intercepción');
      await modal.locator('input[placeholder*="Walter Restrepo"]').fill('DT. Carlos Valderrama');
      await modal.locator('input[placeholder*="Pie de la Popa"]').fill('Cancha San Fernando Cartagena');
      await modal.locator('input[placeholder*="Calle 30 con Carrera"]').fill('Cra 80 #30-45');
      await modal.locator('input[placeholder*="Misil Aéreo"]').fill('🏅 Insignia Interceptada');

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

    test('3.5. Intercepción E2E Web: Checkout Nequi con carga de soporte demo y banner de estado PENDIENTE', async ({ page }) => {
      const sniffer = attachStrictErrorSniffer(page);

      await page.goto('/servicios');
      await page.waitForLoadState('networkidle');

      // Abrir modal de inscripción
      const availableCard = page.locator('.servicio-card', { has: page.locator('.btn-inscribir:not([disabled])') }).first();
      await availableCard.locator('.btn-inscribir').click();

      const modal = page.locator('.modal-dialog');
      await expect(modal).toBeVisible();

      // Cambiar método a Nequi
      const nequiCard = modal.locator('.pay-method-card', { hasText: 'Nequi' });
      await nequiCard.click();

      // Llenar formulario
      const testPlayer = `Atleta Nequi UI ${Date.now().toString().slice(-4)}`;
      await modal.locator('input[placeholder*="Mateo Valderrama"]').fill(testPlayer);
      await modal.locator('input[placeholder*="Carlos Valderrama"]').fill('Carlos Valderrama');
      await modal.locator('input[placeholder*="300 123 4567"]').fill('+57 300 999 1111');
      await modal.locator('input[placeholder*="carlos.valderrama@gmail.com"]').fill('carlos.valderrama@gmail.com');

      // Cargar comprobante demo
      const btnDemoVoucher = modal.locator('.btn-dropzone-demo');
      await expect(btnDemoVoucher).toBeVisible();
      await btnDemoVoucher.click();

      // Verificar que se muestra la previsualización del comprobante
      await expect(modal.locator('.preview-filename')).toBeVisible();

      // Enviar inscripción
      const [postResponse] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/inscribir') && res.request().method() === 'POST'),
        modal.locator('.modal-footer .btn-primary').click(),
      ]);

      expect(postResponse.status()).toBe(201);

      // Validar ticket con banner de revisión de tesorería
      const ticketCard = page.locator('.ticket-card');
      await expect(ticketCard).toBeVisible({ timeout: 8000 });
      await expect(ticketCard.locator('.pending-approval-banner')).toBeVisible();
      await expect(ticketCard.locator('.ticket-status')).toContainText('PENDIENTE DE APROBACIÓN');

      // Cerrar ticket
      await ticketCard.locator('.ticket-footer .btn-primary').click();

      sniffer.assertZeroErrors();
    });

    test('3.6. Intercepción E2E Web: Modal Global de Tesorería, Lightbox de comprobante y Aprobación', async ({ page }) => {
      const sniffer = attachStrictErrorSniffer(page);

      await page.goto('/servicios');
      await page.waitForLoadState('networkidle');

      // Abrir modal de Tesorería desde el header
      const btnTesoreria = page.locator('.btn-tesoreria');
      await expect(btnTesoreria).toBeVisible();

      const [pendientesRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/pendientes') && res.status() === 200),
        btnTesoreria.click(),
      ]);
      expect(pendientesRes.status()).toBe(200);

      const modalTesoreria = page.locator('.modal-dialog', { has: page.locator('h2:has-text("Bandeja de Tesorería")') });
      await expect(modalTesoreria).toBeVisible();

      // Si hay registros pendientes, probar ver soporte y aprobar
      const btnVerSoporte = modalTesoreria.locator('.btn-view-voucher').first();
      if (await btnVerSoporte.isVisible()) {
        await btnVerSoporte.click();
        
        // Modal Lightbox
        const modalLightbox = page.locator('.modal-dialog', { has: page.locator('h2:has-text("Soporte de Transferencia")') });
        await expect(modalLightbox).toBeVisible();
        await expect(modalLightbox.locator('.lightbox-img')).toBeVisible();

        // Cerrar lightbox
        await modalLightbox.locator('.btn-secondary', { hasText: 'Cerrar' }).click();
        await page.waitForTimeout(300);
      }

      // Probar botón aprobar si hay fila pendiente
      const btnApprove = modalTesoreria.locator('.btn-approve-sm').first();
      if (await btnApprove.isVisible()) {
        const [approveRes] = await Promise.all([
          page.waitForResponse(res => res.url().includes('/aprobar') && res.request().method() === 'PATCH'),
          btnApprove.click(),
        ]);
        expect(approveRes.status()).toBe(200);
      }

      // Cerrar modal Tesorería
      await modalTesoreria.locator('.modal-footer .btn-secondary', { hasText: 'Cerrar' }).click();

      sniffer.assertZeroErrors();
    });

    test('3.7. Intercepción E2E Web: Modal Participantes con pestañas de filtro y lightbox', async ({ page }) => {
      const sniffer = attachStrictErrorSniffer(page);

      await page.goto('/servicios');
      await page.waitForLoadState('networkidle');

      // Abrir participantes de la primera tarjeta
      const btnParticipantes = page.locator('.btn-participantes').first();
      await btnParticipantes.click();

      const modal = page.locator('.modal-dialog', { has: page.locator('h2:has-text("Participantes")') });
      await expect(modal).toBeVisible();

      // Probar pestañas de filtro
      const tabPending = modal.locator('.tab-filter-btn.tab-pending');
      await tabPending.click();
      await page.waitForTimeout(200);

      const tabApproved = modal.locator('.tab-filter-btn.tab-approved');
      await tabApproved.click();
      await page.waitForTimeout(200);

      const tabTodos = modal.locator('.tab-filter-btn', { hasText: 'Todos' });
      await tabTodos.click();
      await page.waitForTimeout(200);

      // Cerrar modal
      await modal.locator('.btn-secondary', { hasText: 'Cerrar' }).click();

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
      const firstBookBtn = page.locator('.clinica-card', { has: page.locator('.btn-book:not([disabled])') }).first().locator('.btn-book');
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

    test('4.2. Mobile: Reserva con Nequi, adjunto de comprobante demo y verificación de pase EN REVISIÓN', async ({ page }) => {
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

      // 2. Ir a Servicios Móvil
      await page.goto('http://localhost:4203/servicios');
      await page.waitForLoadState('networkidle');

      // 3. Abrir Bottom Sheet
      const firstBookBtn = page.locator('.clinica-card', { has: page.locator('.btn-book:not([disabled])') }).first().locator('.btn-book');
      await firstBookBtn.click();

      const sheetContent = page.locator('.sheet-content');
      await expect(sheetContent).toBeVisible();

      // 4. Seleccionar Nequi
      const btnNequi = sheetContent.locator('.pay-btn', { hasText: 'Nequi' });
      await btnNequi.click();

      // Validar tarjeta Nequi móvil
      const nequiCard = sheetContent.locator('.nequi-card-mobile');
      await expect(nequiCard).toBeVisible();
      await expect(nequiCard.locator('.n-acc')).toContainText('310 987 6543');

      // Adjuntar comprobante demo
      const btnAttach = nequiCard.locator('.btn-attach-voucher');
      await btnAttach.click();

      // Llenar datos de atleta
      const mobilePlayer = `Atleta Nequi Mobile ${Date.now().toString().slice(-4)}`;
      await sheetContent.locator('input[placeholder*="Mateo Valderrama"]').fill(mobilePlayer);
      await sheetContent.locator('input[placeholder*="Carlos Valderrama"]').fill('Carlos Valderrama Acudiente');
      await sheetContent.locator('input[type="tel"]').fill('+57 300 555 6666');

      // Enviar
      const btnPay = sheetContent.locator('.btn-pay-now');
      const [inscribeRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/inscribir') && res.request().method() === 'POST'),
        btnPay.click({ force: true }),
      ]);

      expect(inscribeRes.status()).toBe(201);
      const incJson = await inscribeRes.json();
      expect(incJson.data?.inscripcion?.estado_pago || incJson.inscripcion?.estado_pago).toBe('PENDIENTE_APROBACION');

      // Validar ticket con aviso de revisión
      const ticketView = page.locator('.ticket-view');
      await expect(ticketView).toBeVisible({ timeout: 6000 });
      await expect(ticketView.locator('.ticket-header-success')).toContainText('Revisión');

      // Cerrar ticket
      await ticketView.locator('.btn-close-sheet').click();
      await page.waitForTimeout(300);

      // Abrir Mis Pases y verificar badge EN REVISIÓN
      const btnMisPases = page.locator('.btn-mis-pases');
      await btnMisPases.click();

      const pasesOverlay = page.locator('.sheet-overlay', { has: page.locator('h3:has-text("Mis Pases QR")') });
      await expect(pasesOverlay).toBeVisible();
      await expect(pasesOverlay.locator('.pase-badge.pase-pending').first()).toContainText('EN REVISIÓN');

      // Cerrar
      await pasesOverlay.locator('.btn-close-sheet').click();
    });
  });

});


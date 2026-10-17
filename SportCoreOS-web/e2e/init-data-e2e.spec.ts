import { test, expect } from '@playwright/test';
import { attachStrictErrorSniffer } from './helpers/error-sniffer';
import { queryDb } from './helpers/db-helper';

test.describe('TESTS E2E EXHAUSTIVOS: METODOLOGÍA INIT-DATA (FRONTEND -> API -> POSTGRESQL QA)', () => {
  const CLUB_ID = '10000000-0000-0000-0000-000000000001';

  test.beforeEach(async ({ page }) => {
    // 1. Iniciar sesión con Director Deportivo (Carlos Valderrama)
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const demoDirBtn = page.locator('.persona-btn', { hasText: 'Carlos Valderrama' }).first();
    await expect(demoDirBtn).toBeVisible({ timeout: 15000 });
    await demoDirBtn.click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('Módulo 1: Dashboard - Consumo atómico InitData & consistencia con BD', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    let initDataCalled = false;
    let initDataResponse: any = null;

    page.on('response', async (res) => {
      if (res.url().includes('/api/v1/dashboard/init-data') && res.status() === 200) {
        initDataCalled = true;
        try {
          const json = await res.json();
          initDataResponse = json.data || json;
        } catch {}
      }
    });

    // Forzar recarga completa para capturar init-data
    await page.reload({ waitUntil: 'networkidle' });

    // Validar en Base de Datos PostgreSQL
    const dbPlayers = await queryDb(
      `SELECT COUNT(*) as count FROM deportivo.jugadores WHERE club_id = $1 AND estado_matricula IN ('ACTIVO', 'LESIONADO')`,
      [CLUB_ID]
    );
    const totalJugadoresDb = parseInt(dbPlayers[0].count, 10);

    const dbPartidos = await queryDb(
      `SELECT COUNT(*) as count FROM competicion.partidos WHERE club_id = $1`,
      [CLUB_ID]
    );
    const totalPartidosDb = parseInt(dbPartidos[0].count, 10);

    expect(initDataCalled).toBe(true);
    expect(initDataResponse).toBeDefined();
    expect(initDataResponse.kpis.jugadoresActivos).toBe(totalJugadoresDb);
    expect(Array.isArray(initDataResponse.proximosPartidos)).toBe(true);
    expect(Array.isArray(initDataResponse.pizarraTacticos)).toBe(true);

    // Verificar que la vista cargó los elementos de UI
    const kpiCards = page.locator('.kpi-card');
    await expect(kpiCards.first()).toBeVisible({ timeout: 10000 });
    expect(await kpiCards.count()).toBeGreaterThanOrEqual(4);

    sniffer.assertZeroErrors();
  });

  test('Módulo 2: Convocatorias - InitData atómico & verificación directa con BD', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    let initDataCalled = false;
    let initDataResponse: any = null;

    page.on('response', async (res) => {
      if (res.url().includes('/api/v1/convocatorias/init-data') && res.status() === 200) {
        initDataCalled = true;
        try {
          const json = await res.json();
          initDataResponse = json.data || json;
        } catch {}
      }
    });

    await page.goto('/convocatorias', { waitUntil: 'networkidle' });

    expect(initDataCalled).toBe(true);
    expect(initDataResponse).toBeDefined();
    expect(Array.isArray(initDataResponse.partidos)).toBe(true);
    expect(initDataResponse.partidos.length).toBeGreaterThan(0);

    // Validar en Base de Datos que el primer partido existe y tiene datos idénticos
    const firstPartido = initDataResponse.partidos[0];
    const dbPartido = await queryDb(
      `SELECT id, rival_nombre, club_id FROM competicion.partidos WHERE id = $1`,
      [firstPartido.id]
    );
    expect(dbPartido.length).toBe(1);
    expect(dbPartido[0].rival_nombre).toBe(firstPartido.rival_nombre);
    expect(dbPartido[0].club_id).toBe(CLUB_ID);

    // Elemento UI de convocatorias
    await expect(page.locator('.convocatorias-container, .card, main')).toBeVisible();

    sniffer.assertZeroErrors();
  });

  test('Módulo 3: Partidos - InitData atómico & verificación directa con BD', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    let initDataCalled = false;
    let initDataResponse: any = null;

    page.on('response', async (res) => {
      if (res.url().includes('/api/v1/partidos/init-data') && res.status() === 200) {
        initDataCalled = true;
        try {
          const json = await res.json();
          initDataResponse = json.data || json;
        } catch {}
      }
    });

    await page.goto('/partidos', { waitUntil: 'networkidle' });

    const dbCount = await queryDb(
      `SELECT COUNT(*) as count FROM competicion.partidos WHERE club_id = $1`,
      [CLUB_ID]
    );
    const totalPartidosDb = parseInt(dbCount[0].count, 10);

    expect(initDataCalled).toBe(true);
    expect(initDataResponse).toBeDefined();
    expect(initDataResponse.total).toBe(totalPartidosDb);
    expect(Array.isArray(initDataResponse.categorias)).toBe(true);
    expect(initDataResponse.categorias.length).toBeGreaterThan(0);

    sniffer.assertZeroErrors();
  });

  test('Módulo 4: Finanzas - InitData atómico & verificación directa con BD', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    let initDataCalled = false;
    let initDataResponse: any = null;

    page.on('response', async (res) => {
      if (res.url().includes('/api/v1/finanzas/init-data') && res.status() === 200) {
        initDataCalled = true;
        try {
          const json = await res.json();
          initDataResponse = json.data || json;
        } catch {}
      }
    });

    await page.goto('/finanzas', { waitUntil: 'networkidle' });

    const dbCargos = await queryDb(
      `SELECT COUNT(*) as count, 
              COALESCE(SUM(cj.monto_total - cj.monto_descuento_beca), 0) as total_facturado 
       FROM finanzas.cargos_jugador cj 
       WHERE cj.club_id = $1`,
      [CLUB_ID]
    );
    const totalCargosDb = parseInt(dbCargos[0].count, 10);
    const totalFacturadoDb = parseFloat(dbCargos[0].total_facturado);

    expect(initDataCalled).toBe(true);
    expect(initDataResponse).toBeDefined();
    expect(initDataResponse.total).toBe(totalCargosDb);
    expect(parseFloat(initDataResponse.resumen.total_facturado)).toBe(totalFacturadoDb);
    expect(Array.isArray(initDataResponse.cargos)).toBe(true);

    sniffer.assertZeroErrors();
  });

  test('Módulo 5: Jugadores - InitData atómico & verificación directa con BD', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    let initDataCalled = false;
    let initDataResponse: any = null;

    page.on('response', async (res) => {
      if (res.url().includes('/api/v1/jugadores/init-data') && res.status() === 200) {
        initDataCalled = true;
        try {
          const json = await res.json();
          initDataResponse = json.data || json;
        } catch {}
      }
    });

    await page.goto('/jugadores', { waitUntil: 'networkidle' });

    const dbCount = await queryDb(
      `SELECT COUNT(*) as count FROM deportivo.jugadores WHERE club_id = $1`,
      [CLUB_ID]
    );
    const totalJugadoresDb = parseInt(dbCount[0].count, 10);

    expect(initDataCalled).toBe(true);
    expect(initDataResponse).toBeDefined();
    expect(initDataResponse.total).toBe(totalJugadoresDb);
    expect(Array.isArray(initDataResponse.categorias)).toBe(true);
    expect(Array.isArray(initDataResponse.jugadores)).toBe(true);

    sniffer.assertZeroErrors();
  });

  test('Módulo 6: Biometría - InitData atómico & verificación directa con BD', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    let initDataCalled = false;
    let initDataResponse: any = null;

    page.on('response', async (res) => {
      if (res.url().includes('/api/v1/biometria/init-data') && res.status() === 200) {
        initDataCalled = true;
        try {
          const json = await res.json();
          initDataResponse = json.data || json;
        } catch {}
      }
    });

    await page.goto('/biometria', { waitUntil: 'networkidle' });

    const dbCount = await queryDb(
      `SELECT COUNT(*) as count
       FROM rendimiento.evaluaciones_biometricas eb
       JOIN deportivo.jugadores j ON j.id = eb.jugador_id
       WHERE j.club_id = $1`,
      [CLUB_ID]
    );
    const totalBiometriaDb = parseInt(dbCount[0].count, 10);

    expect(initDataCalled).toBe(true);
    expect(initDataResponse).toBeDefined();
    expect(initDataResponse.total).toBe(totalBiometriaDb);
    expect(Array.isArray(initDataResponse.evaluaciones)).toBe(true);
    expect(Array.isArray(initDataResponse.categorias)).toBe(true);
    expect(Array.isArray(initDataResponse.jugadores)).toBe(true);

    sniffer.assertZeroErrors();
  });

  test('Módulo 7: Telemetría GPS - InitData atómico & verificación directa con BD', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    let initDataCalled = false;
    let initDataResponse: any = null;

    page.on('response', async (res) => {
      if (res.url().includes('/api/v1/telemetria/init-data') && res.status() === 200) {
        initDataCalled = true;
        try {
          const json = await res.json();
          initDataResponse = json.data || json;
        } catch {}
      }
    });

    await page.goto('/telemetria', { waitUntil: 'networkidle' });

    const dbCount = await queryDb(
      `SELECT COUNT(*) as count FROM deportivo.sesiones_gps WHERE club_id = $1`,
      [CLUB_ID]
    );
    const totalSesionesDb = parseInt(dbCount[0].count, 10);

    expect(initDataCalled).toBe(true);
    expect(initDataResponse).toBeDefined();
    expect(initDataResponse.total).toBe(totalSesionesDb);
    expect(Array.isArray(initDataResponse.sesiones)).toBe(true);
    expect(initDataResponse.activeSesion).toBeDefined();
    expect(Array.isArray(initDataResponse.jugadores)).toBe(true);

    sniffer.assertZeroErrors();
  });

  test('Módulo 8: Ranking Gamificado - InitData atómico & verificación directa con BD', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    let initDataCalled = false;
    let initDataResponse: any = null;

    page.on('response', async (res) => {
      if (res.url().includes('/api/v1/retos/init-data') && res.status() === 200) {
        initDataCalled = true;
        try {
          const json = await res.json();
          initDataResponse = json.data || json;
        } catch {}
      }
    });

    await page.goto('/ranking', { waitUntil: 'networkidle' });

    // Validar top 3 con BD
    const dbTop3 = await queryDb(
      `SELECT j.id, j.nombres, j.apellidos, COALESCE(j.xp_total, 0) as xp_total
       FROM deportivo.jugadores j
       WHERE j.club_id = $1 AND j.estado_matricula = 'ACTIVO'
       ORDER BY COALESCE(j.xp_total, 0) DESC, j.apellidos ASC
       LIMIT 3`,
      [CLUB_ID]
    );

    expect(initDataCalled).toBe(true);
    expect(initDataResponse).toBeDefined();
    expect(Array.isArray(initDataResponse.top3)).toBe(true);
    expect(initDataResponse.top3.length).toBe(dbTop3.length);
    if (dbTop3.length > 0) {
      expect(initDataResponse.top3[0].id).toBe(dbTop3[0].id);
    }
    expect(Array.isArray(initDataResponse.leaderboard)).toBe(true);
    expect(Array.isArray(initDataResponse.retosCatalogo)).toBe(true);
    expect(Array.isArray(initDataResponse.retosPendientesDT)).toBe(true);

    sniffer.assertZeroErrors();
  });
});

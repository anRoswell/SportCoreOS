import { test, expect, Page } from '@playwright/test';
import { attachStrictErrorSniffer } from './helpers/error-sniffer';
import { queryDb } from './helpers/db-helper';

const cleanupCompetitions: string[] = [];
const cleanupPlayers: string[] = [];

async function signInAndOpenRanking(page: Page) {
  const sniffer = attachStrictErrorSniffer(page);
  await page.goto('/login');
  await page.waitForLoadState('networkidle');
  const loginResponsePromise = page.waitForResponse(
    (response) => response.url().endsWith('/auth/login') && response.request().method() === 'POST',
    { timeout: 8000 },
  );
  await page.locator('.persona-btn', { hasText: 'Carlos Valderrama' }).first().click();
  const loginResponse = await loginResponsePromise;
  expect(loginResponse.status(), 'El endpoint de autenticación debe responder correctamente.').toBe(200);
  await page.waitForURL('**/dashboard', { timeout: 15000 });
  await page.goto('/ranking');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.main-gamification-nav')).toBeVisible();
  return sniffer;
}

async function selectCategoryAndPlayer(page: Page) {
  const categorySelect = page.locator('select[name="ligaCategoria"]');
  await expect(categorySelect).toBeVisible();
  await expect.poll(() => categorySelect.locator('option').count(), { timeout: 10000 }).toBeGreaterThan(1);
  const categoryIds = await categorySelect.locator('option').evaluateAll((options) =>
    options.map((option) => (option as HTMLOptionElement).value).filter(Boolean),
  );

  const emptyCategories: Array<{ id: string; club_id: string }> = [];
  let selection: { categoriaId: string; jugador: { id: string; numero_dorsal: number; nombres: string; apellidos: string } } | undefined;

  for (const categoriaId of categoryIds) {
    const players = await queryDb<{
      id: string;
      numero_dorsal: number;
      nombres: string;
      apellidos: string;
    }>(
      `SELECT id, numero_dorsal, nombres, apellidos
       FROM deportivo.jugadores
       WHERE categoria_id = $1 AND estado_matricula = 'ACTIVO'
       ORDER BY numero_dorsal NULLS LAST, apellidos, nombres`,
      [categoriaId],
    );
    if (players.length) {
      selection = { categoriaId, jugador: players[0] };
      break;
    }
    const category = await queryDb<{ id: string; club_id: string }>(
      'SELECT id, club_id FROM deportivo.categorias WHERE id = $1 AND activa = TRUE',
      [categoriaId],
    );
    if (category[0]) emptyCategories.push(category[0]);
  }

  // If QA has no roster fixture, create one clearly labelled synthetic athlete and always remove it.
  if (!selection) {
    for (const category of emptyCategories) {
      const usedNumbers = await queryDb<{ numero_dorsal: number }>(
        'SELECT numero_dorsal FROM deportivo.jugadores WHERE categoria_id = $1 AND numero_dorsal IS NOT NULL',
        [category.id],
      );
      const used = new Set(usedNumbers.map((row) => Number(row.numero_dorsal)));
      const dorsal = Array.from({ length: 99 }, (_, index) => index + 1).find((number) => !used.has(number));
      if (!dorsal) continue;
      const suffix = Date.now().toString();
      const inserted = await queryDb<{ id: string; numero_dorsal: number; nombres: string; apellidos: string }>(
        `INSERT INTO deportivo.jugadores
           (club_id, categoria_id, nombres, apellidos, numero_documento, fecha_nacimiento,
            genero, posicion_principal, pierna_habil, numero_dorsal, estado_matricula)
         VALUES ($1, $2, 'E2E', 'Jugador Ranking', $3, DATE '2012-01-01',
                 'MASCULINO', 'VOLANTE', 'DIESTRO', $4, 'ACTIVO')
         RETURNING id, numero_dorsal, nombres, apellidos`,
        [category.club_id, category.id, `E2E${suffix}`, dorsal],
      );
      if (inserted[0]) {
        cleanupPlayers.push(inserted[0].id);
        selection = { categoriaId: category.id, jugador: inserted[0] };
        break;
      }
    }
  }

  if (!selection) test.skip(true, 'No hay una categoría de pruebas con dorsal disponible para la captura CSV.');
  await categorySelect.selectOption('');
  await categorySelect.selectOption(selection!.categoriaId);
  const playerSelect = page.locator('select[name="ligaJugador"]');
  await expect(playerSelect.locator(`option[value="${selection!.jugador.id}"]`)).toHaveCount(1);
  return selection!;
}

async function cleanupMatch(competitionName: string) {
  const movements = await queryDb<{ jugador_id: string; xp_delta: number }>(
    `DELETE FROM rendimiento.xp_movimientos
     WHERE fuente_tipo = 'LIGA_PARTIDO'
       AND fuente_id IN (SELECT id FROM rendimiento.liga_partidos_externos WHERE competencia_nombre = $1)
     RETURNING jugador_id, xp_delta`,
    [competitionName],
  );
  for (const movement of movements) {
    await queryDb(
      `UPDATE deportivo.jugadores
       SET xp_total = GREATEST(0, COALESCE(xp_total, 0) - $1),
           xp_liga = GREATEST(0, COALESCE(xp_liga, 0) - $1)
       WHERE id = $2`,
      [movement.xp_delta, movement.jugador_id],
    );
  }
  await queryDb(
    `DELETE FROM rendimiento.liga_partidos_externos WHERE competencia_nombre = $1`,
    [competitionName],
  );
}

test.afterEach(async () => {
  while (cleanupCompetitions.length) {
    await cleanupMatch(cleanupCompetitions.pop()!);
  }
  while (cleanupPlayers.length) {
    await queryDb('DELETE FROM deportivo.jugadores WHERE id = $1', [cleanupPlayers.pop()!]);
  }
});

test.describe('MÓDULO 12: RENDIMIENTO / RANKING - E2E EXHAUSTIVO', () => {
  test('recorre Club, Juego y Liga; ejercita filtros, subpestañas, avisos y modal de reglas', async ({ page }) => {
    test.setTimeout(120000);
    const sniffer = await signInAndOpenRanking(page);

    const mainTabs = page.locator('.main-gamification-nav .nav-tab-btn');
    await expect(mainTabs).toHaveCount(3);

    // Club: chips, búsqueda, temporalidad, filtros, ordenación, paginación y ficha.
    await mainTabs.filter({ hasText: 'Club' }).click();
    const categoryChips = page.locator('.filter-group-chips .chip-btn');
    for (let i = 0; i < await categoryChips.count(); i++) await categoryChips.nth(i).click();
    const timeframeButtons = page.locator('.timeframe-selector .tf-btn');
    for (let i = 0; i < await timeframeButtons.count(); i++) await timeframeButtons.nth(i).click();

    await page.locator('.btn-refresh').click();
    await page.locator('.btn-primary-glow').click();
    const rulesModal = page.locator('.rules-modal-card');
    await expect(rulesModal).toBeVisible();
    await rulesModal.locator('.btn-close').click();
    await expect(rulesModal).not.toBeVisible();
    await page.locator('.btn-primary-glow').click();
    await rulesModal.locator('.modal-footer .btn-primary').click();
    await expect(rulesModal).not.toBeVisible();

    const table = page.locator('app-ranking-table');
    const selects = table.locator('.toolbar-select');
    for (let selectIndex = 0; selectIndex < await selects.count(); selectIndex++) {
      const select = selects.nth(selectIndex);
      const optionValues = await select.locator('option').evaluateAll((options) =>
        options.map((option) => (option as HTMLOptionElement).value),
      );
      for (const value of optionValues) {
        await select.selectOption(value);
      }
    }

    const tableSearch = table.locator('.table-search-input');
    await tableSearch.fill('e2e-no-match');
    await table.locator('.btn-clear').click();
    const resetToolbar = table.locator('.btn-reset-toolbar');
    if (await resetToolbar.count()) await resetToolbar.click();
    const sortableHeaders = table.locator('th.sortable');
    for (let i = 0; i < await sortableHeaders.count(); i++) await sortableHeaders.nth(i).click();

    const pageSize = page.locator('.select-page-size');
    for (const size of ['5', '8', '15', '25', '50']) await pageSize.selectOption(size);
    const pageButtons = page.locator('.pagination-controls .btn-page');
    for (let i = 0; i < await pageButtons.count(); i++) {
      const button = pageButtons.nth(i);
      if (await button.isEnabled()) await button.click();
    }

    const firstPlayer = page.locator('.player-row').first();
    if (await firstPlayer.count()) {
      await firstPlayer.locator('.btn-inspect').click();
      const drawer = page.locator('.fut-inspect-drawer');
      await expect(drawer).toBeVisible();
      await drawer.locator('.btn-close-drawer').click();
      await firstPlayer.locator('.btn-inspect').click();
      await drawer.locator('.drawer-footer .btn-primary').click();
      await expect(drawer).not.toBeVisible();
    }

    // Juego: se recorren todas las categorías y las dos vistas del submódulo.
    await mainTabs.filter({ hasText: 'Juego' }).click();
    const challengeFilters = page.locator('.retos-filter-bar .reto-chip');
    for (let i = 0; i < await challengeFilters.count(); i++) await challengeFilters.nth(i).click();
    await page.locator('.game-subnav button', { hasText: 'Validación DT' }).click();
    const returnToChallenges = page.locator('.btn-goto-retos');
    if (await returnToChallenges.count()) await returnToChallenges.click();
    await page.locator('.game-subnav button', { hasText: 'Validación DT' }).click();
    await page.locator('.game-subnav button', { hasText: 'Retos y misiones' }).click();

    // Liga: controles de consulta/captura, plantilla y validaciones locales del CSV.
    await mainTabs.filter({ hasText: 'Liga' }).click();
    await expect(page.locator('.liga-stats-view')).toBeVisible();
    await page.locator('.liga-refresh-btn').click();
    await page.locator('input[name="filtroTemporadaLiga"]').fill(`${new Date().getFullYear()}`);
    await page.locator('.liga-filter-btn').click();

    const ligaCategory = page.locator('select[name="ligaCategoria"]');
    const ligaCategoryIds = await ligaCategory.locator('option').evaluateAll((options) =>
      options.map((option) => (option as HTMLOptionElement).value).filter(Boolean),
    );
    for (const categoriaId of ligaCategoryIds) await ligaCategory.selectOption(categoriaId);

    await page.locator('.add-player-stat-btn').click();
    await expect(page.locator('.liga-feedback')).toContainText('Selecciona un jugador');
    await page.locator('.liga-feedback button[aria-label="Cerrar aviso"]').click();

    await page.locator('.liga-capture-switch button[role="tab"]', { hasText: 'Importar CSV' }).click();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('.download-template-btn').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('plantilla-estadisticas-liga.csv');
    await expect(page.locator('.liga-feedback')).toContainText('Plantilla CSV descargada');
    await page.locator('.liga-feedback button[aria-label="Cerrar aviso"]').click();

    await page.locator('input[type="file"][aria-label="Seleccionar archivo CSV"]').setInputFiles({
      name: 'invalid.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('dorsal,goles\n10,1'),
    });
    await expect(page.locator('.csv-error')).toBeVisible();
    await page.locator('.liga-capture-switch button[role="tab"]', { hasText: 'Manual' }).click();
    await expect(page.locator('.manual-entry-panel')).toBeVisible();
    await expect(page.locator('.submit-match-btn')).toBeDisabled();
    sniffer.assertZeroErrors();
  });

  test('registra, valida y acredita XP de un acta manual con persistencia y FK verificadas', async ({ page }) => {
    const sniffer = await signInAndOpenRanking(page);
    await page.locator('.main-gamification-nav .nav-tab-btn', { hasText: 'Liga' }).click();
    const { categoriaId, jugador } = await selectCategoryAndPlayer(page);
    const competencia = `E2E-Manual-${Date.now()}`;
    cleanupCompetitions.push(competencia);
    const temporada = `${new Date().getFullYear()}`;

    await page.locator('input[name="ligaCompetencia"]').fill(competencia);
    await page.locator('input[name="ligaTemporada"]').fill(temporada);
    await page.locator('input[name="ligaFecha"]').fill(new Date().toISOString().slice(0, 10));
    await page.locator('input[name="ligaRival"]').fill('Rival E2E');
    await page.locator('input[name="golesClub"]').fill('2');
    await page.locator('input[name="golesRival"]').fill('0');
    await page.locator('select[name="ligaJugador"]').selectOption(jugador.id);

    const stats: Array<[string, string]> = [
      ['statMinutos', '60'], ['statGoles', '1'], ['statAsistencias', '1'], ['statRemates', '4'],
      ['statRematesAPuerta', '2'], ['statPasesClave', '2'], ['statRegates', '1'],
      ['statRecuperaciones', '4'], ['statIntercepciones', '2'], ['statDuelos', '3'], ['statAtajadas', '0'],
    ];
    for (const [name, value] of stats) await page.locator(`input[name="${name}"]`).fill(value);

    await page.locator('.add-player-stat-btn').click();
    const addedRow = page.locator('.manual-player-row');
    await expect(addedRow).toContainText(jugador.nombres);
    await addedRow.locator('button[aria-label^="Quitar"]').click();
    await expect(page.locator('.manual-player-row')).toHaveCount(0);

    await page.locator('select[name="ligaJugador"]').selectOption(jugador.id);
    for (const [name, value] of stats) await page.locator(`input[name="${name}"]`).fill(value);
    await page.locator('.add-player-stat-btn').click();
    await page.locator('.submit-match-btn').click();
    await expect(page.locator('.liga-feedback')).toContainText('Acta guardada');

    const pending = await queryDb<{
      id: string;
      estado: string;
      categoria_id: string;
      club_id: string;
      jugador_id: string;
      goles: number;
    }>(
      `SELECT m.id, m.estado, m.categoria_id, m.club_id, s.jugador_id, s.goles
       FROM rendimiento.liga_partidos_externos m
       JOIN rendimiento.liga_estadisticas_jugador s ON s.partido_id = m.id
       WHERE m.competencia_nombre = $1`,
      [competencia],
    );
    expect(pending).toHaveLength(1);
    expect(pending[0].estado).toBe('PENDIENTE');
    expect(pending[0].categoria_id).toBe(categoriaId);
    expect(pending[0].jugador_id).toBe(jugador.id);
    expect(Number(pending[0].goles)).toBe(1);

    const beforeXp = await queryDb<{ xp_total: number; xp_liga: number }>(
      'SELECT xp_total, xp_liga FROM deportivo.jugadores WHERE id = $1',
      [jugador.id],
    );
    const movementsBefore = await queryDb<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM rendimiento.xp_movimientos
       WHERE fuente_tipo = 'LIGA_PARTIDO' AND fuente_id IN
         (SELECT id FROM rendimiento.liga_estadisticas_jugador WHERE partido_id = $1)`,
      [pending[0].id],
    );
    expect(Number(movementsBefore[0].count)).toBe(0);

    const matchCard = page.locator('.pending-match-card', { hasText: competencia });
    await expect(matchCard.locator('.match-status')).toContainText('PENDIENTE');
    await matchCard.locator('.validate-match-btn').click();
    await expect(page.locator('.liga-feedback')).toContainText('Acta validada');
    await expect(page.locator('.pending-match-card', { hasText: competencia }).locator('.validated-xp')).toBeVisible();

    const persisted = await queryDb<{
      estado: string;
      xp_acreditado: number;
      xp_total: number;
      xp_liga: number;
      movimiento_count: number;
      categoria_club: string;
      jugador_club: string;
    }>(
      `SELECT m.estado, s.xp_acreditado, j.xp_total, j.xp_liga,
              (SELECT COUNT(*)::int FROM rendimiento.xp_movimientos x WHERE x.fuente_tipo = 'LIGA_PARTIDO' AND x.fuente_id = s.id) AS movimiento_count,
              c.club_id AS categoria_club, j.club_id AS jugador_club
       FROM rendimiento.liga_partidos_externos m
       JOIN rendimiento.liga_estadisticas_jugador s ON s.partido_id = m.id
       JOIN deportivo.categorias c ON c.id = m.categoria_id
       JOIN deportivo.jugadores j ON j.id = s.jugador_id
       WHERE m.id = $1`,
      [pending[0].id],
    );
    expect(persisted).toHaveLength(1);
    expect(persisted[0].estado).toBe('VALIDADO');
    expect(Number(persisted[0].xp_acreditado)).toBe(55);
    expect(Number(persisted[0].xp_total) - Number(beforeXp[0].xp_total)).toBe(55);
    expect(Number(persisted[0].xp_liga) - Number(beforeXp[0].xp_liga)).toBe(55);
    expect(Number(persisted[0].movimiento_count)).toBe(1);
    expect(persisted[0].categoria_club).toBe(persisted[0].jugador_club);

    await expect(page.locator('.pending-match-card', { hasText: competencia }).locator('.validate-match-btn')).toHaveCount(0);
    sniffer.assertZeroErrors();
  });

  test('importa CSV de liga, deja el acta pendiente y valida sus métricas/XP en PostgreSQL', async ({ page }) => {
    const sniffer = await signInAndOpenRanking(page);
    await page.locator('.main-gamification-nav .nav-tab-btn', { hasText: 'Liga' }).click();
    const { jugador } = await selectCategoryAndPlayer(page);
    test.skip(!jugador.numero_dorsal, 'El jugador elegido necesita dorsal asignado para probar importación CSV.');
    const competencia = `E2E-CSV-${Date.now()}`;
    cleanupCompetitions.push(competencia);
    const temporada = `${new Date().getFullYear()}`;

    await page.locator('.liga-capture-switch button[role="tab"]', { hasText: 'Importar CSV' }).click();
    await page.locator('input[name="ligaCompetencia"]').fill(competencia);
    await page.locator('input[name="ligaTemporada"]').fill(temporada);
    await page.locator('input[name="ligaFecha"]').fill(new Date().toISOString().slice(0, 10));
    await page.locator('input[name="ligaRival"]').fill('Rival CSV E2E');
    const csv = [
      'dorsal,minutos,goles,asistencias,remates,remates_a_puerta,pases_clave,regates_exitosos,recuperaciones,intercepciones,duelos_ganados,atajadas',
      `${jugador.numero_dorsal},45,0,1,1,1,0,0,0,0,0,0`,
    ].join('\n');
    await page.locator('input[type="file"][aria-label="Seleccionar archivo CSV"]').setInputFiles({
      name: 'estadisticas-liga.csv', mimeType: 'text/csv', buffer: Buffer.from(csv),
    });
    await expect(page.locator('.csv-preview')).toContainText('1 registro');
    await page.locator('.submit-match-btn').click();
    await expect(page.locator('.liga-feedback')).toContainText('CSV importado');

    const pending = await queryDb<{
      id: string;
      estado: string;
      fuente: string;
      jugador_id: string;
      dorsal: number;
      minutos: number;
      asistencias: number;
    }>(
      `SELECT m.id, m.estado, m.fuente, s.jugador_id, j.numero_dorsal AS dorsal, s.minutos, s.asistencias
       FROM rendimiento.liga_partidos_externos m
       JOIN rendimiento.liga_estadisticas_jugador s ON s.partido_id = m.id
       JOIN deportivo.jugadores j ON j.id = s.jugador_id
       WHERE m.competencia_nombre = $1`,
      [competencia],
    );
    expect(pending).toHaveLength(1);
    expect(pending[0].estado).toBe('PENDIENTE');
    expect(pending[0].fuente).toBe('CSV');
    expect(Number(pending[0].dorsal)).toBe(Number(jugador.numero_dorsal));
    expect(Number(pending[0].minutos)).toBe(45);
    expect(Number(pending[0].asistencias)).toBe(1);

    const matchCard = page.locator('.pending-match-card', { hasText: competencia });
    await expect(matchCard.locator('.match-source')).toContainText('CSV');
    await matchCard.locator('.validate-match-btn').click();
    await expect(page.locator('.liga-feedback')).toContainText('Acta validada');
    await expect(page.locator('.liga-ranking-table')).toContainText(`${jugador.nombres} ${jugador.apellidos}`);

    const persisted = await queryDb<{ estado: string; xp_acreditado: number; movimientos: number }>(
      `SELECT m.estado, s.xp_acreditado,
              (SELECT COUNT(*)::int FROM rendimiento.xp_movimientos x WHERE x.fuente_tipo = 'LIGA_PARTIDO' AND x.fuente_id = s.id) AS movimientos
       FROM rendimiento.liga_partidos_externos m
       JOIN rendimiento.liga_estadisticas_jugador s ON s.partido_id = m.id
       WHERE m.id = $1`,
      [pending[0].id],
    );
    expect(persisted).toHaveLength(1);
    expect(persisted[0].estado).toBe('VALIDADO');
    expect(Number(persisted[0].xp_acreditado)).toBe(22);
    expect(Number(persisted[0].movimientos)).toBe(1);
    sniffer.assertZeroErrors();
  });
});

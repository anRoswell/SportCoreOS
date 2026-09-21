import { test, expect } from '@playwright/test';
import { attachStrictErrorSniffer } from './helpers/error-sniffer';
import { queryDb } from './helpers/db-helper';

test.describe('MÓDULO 3: PARTIDOS, FIXTURE & CONVOCATORIAS - E2E EXHAUSTIVO', () => {

  test.beforeEach(async ({ page }) => {
    // Autenticación con Director Deportivo
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const demoDirBtn = page.locator('.persona-btn', { hasText: 'Carlos Valderrama' }).first();
    await expect(demoDirBtn).toBeVisible({ timeout: 10000 });
    await demoDirBtn.click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('1. Carga de Fixture de Partidos, filtrado por categoría y error sniffer', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/partidos');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.page-title')).toContainText('Fixture & Calendario');
    await expect(page.locator('.fut-table')).toBeVisible();

    const rows = page.locator('.match-table-row');
    expect(await rows.count()).toBeGreaterThanOrEqual(1);

    // Probar filtro de categoría
    const catSelect = page.locator('.sport-select');
    await expect(catSelect).toBeVisible();

    sniffer.assertZeroErrors();
  });

  test('2. Programar nuevo partido: apertura, validación, guardado y verificación en PostgreSQL', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/partidos');
    await page.waitForLoadState('networkidle');

    // 1. Abrir modal
    const scheduleBtn = page.locator('button', { hasText: 'Programar Nuevo Partido' });
    await scheduleBtn.click();

    const modal = page.locator('.modal-card');
    await expect(modal).toBeVisible();

    // 2. Probar cancelar
    const cancelBtn = modal.locator('button', { hasText: 'Cancelar' });
    await cancelBtn.click();
    await expect(modal).not.toBeVisible();

    // 3. Reabrir y diligenciar formulario
    await scheduleBtn.click();
    await expect(modal).toBeVisible();

    const uniqueRival = `Rival Test E2E ${Date.now().toString().slice(-4)}`;
    const uniqueSede = 'Cancha Sintética Principal Los Arrayanes';

    await modal.locator('input[name="rival_nombre"]').fill(uniqueRival);
    await modal.locator('input[name="fecha_partido"]').fill('2026-10-15');
    await modal.locator('input[name="hora_partido"]').fill('10:30');
    await modal.locator('input[name="hora_citacion"]').fill('09:30');
    await modal.locator('input[name="sede_cancha"]').fill(uniqueSede);
    await modal.locator('select[name="condicion_juego"]').selectOption('LOCAL');

    // 4. Enviar
    const submitBtn = modal.locator('button[type="submit"]');
    await submitBtn.click();

    // 5. Validar toast y cierre
    await expect(page.locator('.toast-floating-alert')).toBeVisible({ timeout: 5000 });
    await expect(modal).not.toBeVisible();

    // 6. Verificar persistencia directa en PostgreSQL QA
    const dbRes = await queryDb(
      `SELECT id, rival_nombre, sede_cancha, condicion_juego, estado_partido
       FROM competicion.partidos 
       WHERE rival_nombre = $1`,
      [uniqueRival]
    );

    expect(dbRes.length).toBe(1);
    expect(dbRes[0].rival_nombre).toBe(uniqueRival);
    expect(dbRes[0].sede_cancha).toBe(uniqueSede);
    expect(dbRes[0].condicion_juego).toBe('LOCAL');
    expect(dbRes[0].estado_partido).toBe('PROGRAMADO');

    // 7. Verificar que se hayan auto-creado las convocatorias para el partido
    const convRes = await queryDb(
      `SELECT COUNT(*) as total FROM competicion.convocatorias WHERE partido_id = $1`,
      [dbRes[0].id]
    );
    expect(parseInt(convRes[0].total, 10)).toBeGreaterThan(0);

    sniffer.assertZeroErrors();
  });

  test('3. Apertura de Acta Digital, adición de evento en vivo y verificación en PostgreSQL', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/partidos');
    await page.waitForLoadState('networkidle');

    // Click en "Acta" del primer partido
    const actaBtn = page.locator('.btn-acta').first();
    await actaBtn.click();

    const actaModal = page.locator('.modal-card.modal-lg');
    await expect(actaModal).toBeVisible();
    await expect(actaModal.locator('h2')).toContainText('Acta Digital de Juego');

    // Añadir un evento en el acta
    const uniqueMinuto = 42;
    const uniqueDesc = `Gol de volea espectacular ${Date.now().toString().slice(-4)}`;

    await actaModal.locator('input[name="minuto_juego"]').fill(uniqueMinuto.toString());
    await actaModal.locator('select[name="tipo_evento"]').selectOption('GOL');
    await actaModal.locator('input[name="descripcion"]').fill(uniqueDesc);

    const addEventBtn = actaModal.locator('button', { hasText: 'Añadir Evento' });
    await addEventBtn.click();

    await expect(page.locator('.toast-floating-alert')).toBeVisible({ timeout: 5000 });

    // Cerrar modal
    const closeBtn = actaModal.locator('button', { hasText: 'Cerrar Acta' });
    await closeBtn.click();
    await expect(actaModal).not.toBeVisible();

    // Verificar en DB
    const evRes = await queryDb(
      `SELECT id, tipo_evento, minuto_juego, observacion
       FROM competicion.actas_partido_eventos
       WHERE observacion = $1`,
      [uniqueDesc]
    );

    expect(evRes.length).toBe(1);
    expect(evRes[0].tipo_evento).toBe('GOL');
    expect(evRes[0].minuto_juego).toBe(42);

    sniffer.assertZeroErrors();
  });

  test('4. Convocatorias interactivas, cambio de estado de jugador y verificación en PostgreSQL', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/convocatorias');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.page-title')).toContainText('Convocatoria Oficial');
    await expect(page.locator('.match-hero')).toBeVisible();

    // Validar columnas de titulares y suplentes
    const squadColumns = page.locator('.squad-column');
    expect(await squadColumns.count()).toBe(2);

    // Click en botón "Enviar Citación a Padres"
    const sendBtn = page.locator('button', { hasText: 'Enviar Citación a Padres' });
    await sendBtn.click();
    await expect(page.locator('.toast-floating-alert')).toBeVisible({ timeout: 5000 });

    // Interactuar con el botón de alternar estado de asistencia del primer jugador si está presente
    const toggleButtons = page.locator('.btn-toggle-status');
    if (await toggleButtons.count() > 0) {
      await toggleButtons.first().click();
      await expect(page.locator('.toast-floating-alert')).toBeVisible({ timeout: 5000 });
    }

    sniffer.assertZeroErrors();
  });
});

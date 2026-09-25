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
    const catSelect = page.locator('.sport-select').first();
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

  test('4. Convocatorias interactivas, botón + Convocar Jugador, Sugerir Nómina y WhatsApp', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/convocatorias');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.page-title')).toContainText('Convocatoria & Citación');
    await expect(page.locator('.match-hero')).toBeVisible();

    // Validar columnas de titulares y suplentes
    const squadColumns = page.locator('.squad-column');
    expect(await squadColumns.count()).toBe(2);

    // 1. Probar botón "Sugerir Nómina"
    const suggestBtn = page.locator('button', { hasText: 'Sugerir Nómina' });
    await expect(suggestBtn).toBeVisible();
    await suggestBtn.click();
    await expect(page.locator('.toast-floating-alert')).toBeVisible({ timeout: 5000 });

    // 2. Probar botón "+ Convocar Jugador"
    const convocarBtn = page.locator('button', { hasText: '+ Convocar Jugador' });
    await expect(convocarBtn).toBeVisible();
    await convocarBtn.click();

    const addModal = page.locator('.modal-overlay .modal-card');
    await expect(addModal).toBeVisible();
    await expect(addModal.locator('h2')).toContainText('Titular');

    // Cerrar modal de convocatoria
    const closeAddBtn = addModal.locator('button', { hasText: 'Cancelar' });
    await closeAddBtn.click();
    await expect(addModal).not.toBeVisible();

    // 3. Click en botón "Enviar Citación WhatsApp"
    const sendBtn = page.locator('button', { hasText: 'Enviar Citación WhatsApp' });
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();
    await expect(page.locator('.toast-floating-alert')).toBeVisible({ timeout: 5000 });

    // 4. Interactuar con los botones de acción por fila
    const actionButtons = page.locator('.btn-action-icon');
    if (await actionButtons.count() > 0) {
      await actionButtons.first().click();
      await expect(page.locator('.toast-floating-alert')).toBeVisible({ timeout: 5000 });
    }

    sniffer.assertZeroErrors();
  });

  test('5. Generación de Imagen y Póster Oficial para Redes Sociales con Gemini AI en Convocatorias', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/convocatorias');
    await page.waitForLoadState('networkidle');

    // Validar existencia del botón "Generar Gráfica Redes"
    const posterBtn = page.locator('button.btn-poster-social');
    await expect(posterBtn).toBeVisible();
    await expect(posterBtn).toContainText('Generar Gráfica Redes');

    // Click para abrir el modal de generación gráfica con IA Gemini
    await posterBtn.click();

    const posterModal = page.locator('.poster-modal-card');
    await expect(posterModal).toBeVisible();
    await expect(posterModal.locator('h2')).toContainText('Diseño Inteligente de Convocatoria (Gemini AI)');

    // Validar renderizado de Canvas HTML5
    const canvas = posterModal.locator('#posterCanvas');
    await expect(canvas).toBeVisible();

    // Probar botón de regeneración con IA Gemini
    const regenBtn = posterModal.locator('button.btn-re-ai');
    await expect(regenBtn).toBeVisible();
    await regenBtn.click();
    await page.waitForTimeout(600);

    // Probar cambio de tema institucional
    const themeSelect = posterModal.locator('select');
    await themeSelect.selectOption('dark-gold');
    await page.waitForTimeout(600);

    // Probar cambio de titular y hashtag
    const headlineInput = posterModal.locator('input').first();
    await headlineInput.fill('¡GRAN FINAL DE TEMPORADA!');
    await page.waitForTimeout(300);

    // Probar botón de copiar copy generado por IA
    const copyBtn = posterModal.locator('.btn-copy-text');
    if (await copyBtn.count() > 0) {
      await copyBtn.first().click();
      await expect(page.locator('.toast-floating-alert')).toBeVisible({ timeout: 5000 });
    }

    // Probar botón de descarga PNG
    const downloadBtn = posterModal.locator('button.btn-download-poster');
    await expect(downloadBtn).toBeVisible();
    await downloadBtn.click();
    await page.waitForTimeout(500);

    // Cerrar modal
    const closeBtn = posterModal.locator('button', { hasText: 'Cerrar' });
    await closeBtn.click();
    await expect(posterModal).not.toBeVisible();

    sniffer.assertZeroErrors();
  });
});

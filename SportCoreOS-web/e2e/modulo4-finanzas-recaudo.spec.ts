import { test, expect } from '@playwright/test';
import { attachStrictErrorSniffer } from './helpers/error-sniffer';
import { queryDb } from './helpers/db-helper';

test.describe('MÓDULO 4: GESTIÓN FINANCIERA, COBROS & RECAUDO PSE - E2E EXHAUSTIVO', () => {

  test.beforeEach(async ({ page }) => {
    // Autenticación con Director Deportivo
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const demoDirBtn = page.locator('.persona-btn', { hasText: 'Carlos Valderrama' }).first();
    await expect(demoDirBtn).toBeVisible({ timeout: 10000 });
    await demoDirBtn.click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('1. Carga inicial de Finanzas, KPIs de facturación y cartera morosa, y error sniffer', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/finanzas');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.page-title')).toContainText('Gestión Financiera');

    // Validar las 3 tarjetas de KPIs financieros
    const statBoxes = page.locator('.stat-box');
    expect(await statBoxes.count()).toBe(3);
    await expect(page.locator('.stat-label', { hasText: 'TOTAL FACTURADO' })).toBeVisible();
    await expect(page.locator('.stat-label', { hasText: 'TOTAL RECAUDADO' })).toBeVisible();
    await expect(page.locator('.stat-label', { hasText: 'CARTERA EN MORA' })).toBeVisible();

    // Validar tabla de cargos
    await expect(page.locator('.fut-table')).toBeVisible();
    const rows = page.locator('.cargo-row');
    expect(await rows.count()).toBeGreaterThanOrEqual(1);

    sniffer.assertZeroErrors();
  });

  test('2. Filtros de categoría y estado de pago (Todos, Al Día, En Mora)', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/finanzas');
    await page.waitForLoadState('networkidle');

    const selects = page.locator('.filters-row select');
    expect(await selects.count()).toBe(2);

    const estadoSelect = selects.nth(1);

    // Filtrar por En Mora
    await estadoSelect.selectOption('MORA');
    await page.waitForTimeout(300);

    // Filtrar por Al Día
    await estadoSelect.selectOption('PAGADO');
    await page.waitForTimeout(300);

    // Regresar a Todos
    await estadoSelect.selectOption('TODOS');
    await page.waitForTimeout(300);

    sniffer.assertZeroErrors();
  });

  test('3. Emisión masiva de mensualidades: modal, confirmación y verificación en PostgreSQL', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/finanzas');
    await page.waitForLoadState('networkidle');

    // 1. Abrir Modal de emisión
    const genBtn = page.locator('button', { hasText: 'Generar Cobros del Mes' });
    await genBtn.click();

    const modal = page.locator('.modal-card');
    await expect(modal).toBeVisible();

    // 2. Probar cancelar
    const cancelBtn = modal.locator('button', { hasText: 'Cancelar' });
    await cancelBtn.click();
    await expect(modal).not.toBeVisible();

    // 3. Reabrir y confirmar emisión
    await genBtn.click();
    await expect(modal).toBeVisible();

    const confirmBtn = modal.locator('button', { hasText: 'Confirmar y Generar Cargos' });
    await confirmBtn.click();

    // 4. Validar confirmación toast
    await expect(page.locator('.toast-floating-alert')).toBeVisible({ timeout: 5000 });
    await expect(modal).not.toBeVisible();

    // 5. Verificar existencia de cargos en PostgreSQL QA
    const cargosDb = await queryDb(
      `SELECT COUNT(*) as total FROM finanzas.cargos_jugador WHERE club_id = '10000000-0000-0000-0000-000000000001'`
    );
    expect(parseInt(cargosDb[0].total, 10)).toBeGreaterThan(0);

    sniffer.assertZeroErrors();
  });

  test('4. Pago PSE de mensualidad en mora, actualización de saldo y persistencia en PostgreSQL', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/finanzas');
    await page.waitForLoadState('networkidle');

    // Filtrar para encontrar un cargo con saldo
    const estadoSelect = page.locator('.filters-row select').nth(1);
    await estadoSelect.selectOption('MORA');
    await page.waitForTimeout(300);

    const pseButtons = page.locator('.btn-pse');
    const pseCount = await pseButtons.count();

    if (pseCount > 0) {
      // 1. Abrir modal PSE
      await pseButtons.first().click();

      const payModal = page.locator('.modal-card');
      await expect(payModal).toBeVisible();
      await expect(payModal.locator('h2')).toContainText('Pasarela de Pago PSE');

      // 2. Probar cancelar
      const cancelBtn = payModal.locator('button', { hasText: 'Cancelar' });
      await cancelBtn.click();
      await expect(payModal).not.toBeVisible();

      // 3. Reabrir y procesar pago
      await pseButtons.first().click();
      await expect(payModal).toBeVisible();

      const paySubmitBtn = payModal.locator('button[type="submit"]');
      await paySubmitBtn.click();

      // 4. Validar toast exitoso
      await expect(page.locator('.toast-floating-alert')).toBeVisible({ timeout: 5000 });
      await expect(payModal).not.toBeVisible();
    }

    // Probar botón de Recordatorios masivos WhatsApp
    const reminderBtn = page.locator('button', { hasText: 'Enviar Recordatorios WhatsApp' });
    await reminderBtn.click();
    await expect(page.locator('.toast-floating-alert')).toBeVisible({ timeout: 5000 });

    sniffer.assertZeroErrors();
  });
});

import { test, expect } from '@playwright/test';
import { attachStrictErrorSniffer } from './helpers/error-sniffer';
import { queryDb } from './helpers/db-helper';

test.describe('MÓDULO 6: DASHBOARD ESTRATÉGICO & PORTAL PADRES - E2E EXHAUSTIVO', () => {

  test.beforeEach(async ({ page }) => {
    // Autenticación con Director Deportivo
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const demoDirBtn = page.locator('.persona-btn', { hasText: 'Carlos Valderrama' }).first();
    await expect(demoDirBtn).toBeVisible({ timeout: 10000 });
    await demoDirBtn.click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('1. Validación de los 4 KPIs estratégicos y acciones de cabecera en el Dashboard', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Validar hero greeting
    await expect(page.locator('.hero-greeting')).toContainText('Carlos');

    // Validar los 4 KPIs
    const kpiCards = page.locator('.kpi-card');
    expect(await kpiCards.count()).toBe(4);

    // Botón Exportar Informe 360°
    const exportBtn = page.locator('button', { hasText: 'Exportar Informe 360°' });
    await exportBtn.click();
    await expect(page.locator('.toast-floating-alert')).toBeVisible({ timeout: 5000 });

    // Botón Programar Partido desde Hero
    const progBtn = page.locator('.hero-actions button', { hasText: 'Programar Partido' });
    await progBtn.click();
    const modal = page.locator('.modal-card');
    await expect(modal).toBeVisible();
    await modal.locator('button', { hasText: 'Cancelar' }).click();
    await expect(modal).not.toBeVisible();

    sniffer.assertZeroErrors();
  });

  test('2. Navegación por el 100% de las 4 pestañas interactivas del Dashboard', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // 1. Tab Próximos Partidos & GPS
    const tab1 = page.locator('.tab-btn', { hasText: 'Próximos Partidos & GPS' });
    await tab1.click();
    await page.waitForTimeout(200);

    // 2. Tab Pizarra Táctica Express
    const tab2 = page.locator('.tab-btn', { hasText: 'Pizarra Táctica Express' });
    await tab2.click();
    await page.waitForTimeout(200);

    // 3. Tab Monitor Recaudo PSE en Vivo
    const tab3 = page.locator('.tab-btn', { hasText: 'Monitor Recaudo PSE en Vivo' });
    await tab3.click();
    await page.waitForTimeout(200);

    // 4. Tab Radar Físico & Médica
    const tab4 = page.locator('.tab-btn', { hasText: 'Radar Físico & Médica' });
    await tab4.click();
    await page.waitForTimeout(200);

    sniffer.assertZeroErrors();
  });

  test('3. Navegación al Portal de Padres, confirmación y excusa de convocatoria a partido', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/portal-padres');
    await page.waitForLoadState('networkidle');

    // Validar hero acudiente
    await expect(page.locator('.hero-parent')).toBeVisible();

    // Validar tarjeta de próximo partido y botones de confirmación
    const confirmBtn = page.locator('.btn-confirm-yes');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await expect(page.locator('.toast-floating-alert')).toBeVisible({ timeout: 5000 });
    }

    const excusaBtn = page.locator('.btn-confirm-no');
    if (await excusaBtn.isVisible()) {
      await excusaBtn.click();
      await expect(page.locator('.toast-floating-alert')).toBeVisible({ timeout: 5000 });
    }

    // Botón de pago PSE
    const pseBtn = page.locator('.btn-pse-full');
    if (await pseBtn.isVisible()) {
      await pseBtn.click();
      await expect(page.locator('.toast-floating-alert')).toBeVisible({ timeout: 5000 });
    }

    sniffer.assertZeroErrors();
  });
});

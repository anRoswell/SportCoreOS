import { test, expect } from '@playwright/test';
import { attachStrictErrorSniffer } from './helpers/error-sniffer';
import { queryDb } from './helpers/db-helper';

test.describe('MÓDULO 5: BIOMETRÍA DEPORTIVA & TEST FÍSICOS - E2E EXHAUSTIVO', () => {

  test.beforeEach(async ({ page }) => {
    // Autenticación con Director Deportivo
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const demoDirBtn = page.locator('.persona-btn', { hasText: 'Carlos Valderrama' }).first();
    await expect(demoDirBtn).toBeVisible({ timeout: 10000 });
    await demoDirBtn.click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('1. Carga inicial de Biometría, tabla de mediciones y diagnóstico de aptitud', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/biometria');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('.page-title')).toContainText('Biometría Deportiva');
    await expect(page.locator('.fut-table')).toBeVisible();

    const rows = page.locator('.bio-row');
    expect(await rows.count()).toBeGreaterThanOrEqual(1);

    // Probar selector de categoría
    const catPills = page.locator('.category-pills .pill');
    await expect(catPills.first()).toBeVisible();

    sniffer.assertZeroErrors();
  });

  test('2. Registro de nueva evaluación antropométrica con cálculo reactivo de IMC y persistencia en PostgreSQL', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/biometria');
    await page.waitForLoadState('networkidle');

    // 1. Abrir Modal
    const newBtn = page.locator('button', { hasText: 'Nueva Medición Antropométrica' });
    await newBtn.click();

    const modal = page.locator('.modal-card.modal-xl');
    await expect(modal).toBeVisible();

    // 2. Probar Cancelar
    const cancelBtn = modal.locator('button', { hasText: 'Cancelar' });
    await cancelBtn.click();
    await expect(modal).not.toBeVisible();

    // 3. Reabrir y diligenciar formulario
    await newBtn.click();
    await expect(modal).toBeVisible();

    const uniqueObs = `Test E2E Rendimiento ${Date.now().toString().slice(-4)}`;

    await modal.locator('input[name="pesoKg"]').fill('57.5');
    await modal.locator('input[name="tallaCm"]').fill('171.0');

    // Validar cálculo automático de IMC: 57.5 / (1.71^2) = 19.7
    const imcInput = modal.locator('.readonly-input');
    await expect(imcInput).toHaveValue('19.7');

    await modal.locator('input[name="testCooperMetros"]').fill('2900');
    await modal.locator('input[name="velocidad30mSeg"]').fill('4.05');
    await modal.locator('input[name="saltoVerticalCm"]').fill('49.0');
    await modal.locator('textarea[name="observaciones"]').fill(uniqueObs);

    // 4. Enviar
    const submitBtn = modal.locator('button[type="submit"]');
    await submitBtn.click();

    // 5. Validar toast y cierre
    await expect(page.locator('.toast-floating-alert')).toBeVisible({ timeout: 5000 });
    await expect(modal).not.toBeVisible();

    // 6. Verificar persistencia directa en PostgreSQL QA
    const dbRes = await queryDb(
      `SELECT id, peso_kg, talla_cm, imc, test_cooper_metros, velocidad_30m_seg, salto_vertical_cm, observaciones
       FROM rendimiento.evaluaciones_biometricas
       WHERE observaciones = $1`,
      [uniqueObs]
    );

    expect(dbRes.length).toBe(1);
    expect(parseFloat(dbRes[0].peso_kg)).toBe(57.5);
    expect(parseFloat(dbRes[0].talla_cm)).toBe(171.0);
    expect(parseFloat(dbRes[0].imc)).toBe(19.7);
    expect(dbRes[0].test_cooper_metros).toBe(2900);
    expect(parseFloat(dbRes[0].velocidad_30m_seg)).toBe(4.05);

    sniffer.assertZeroErrors();
  });
});

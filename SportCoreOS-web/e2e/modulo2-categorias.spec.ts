import { test, expect } from '@playwright/test';
import { attachStrictErrorSniffer } from './helpers/error-sniffer';
import { queryDb } from './helpers/db-helper';

test.describe('MÓDULO 2: CATEGORÍAS & PLANTELES DEPORTIVOS - E2E EXHAUSTIVO', () => {

  test.beforeEach(async ({ page }) => {
    // Autenticación con Director Deportivo
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const demoDirBtn = page.locator('.persona-btn', { hasText: 'Carlos Valderrama' }).first();
    await expect(demoDirBtn).toBeVisible({ timeout: 10000 });
    await demoDirBtn.click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('1. Carga inicial de Categorías, tarjetas deportivas y ausencia estricta de errores JS', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/categorias');
    await page.waitForLoadState('networkidle');

    // Validar encabezado
    await expect(page.locator('.page-title')).toContainText('Categorías por Edades');

    // Validar tarjetas de categorías desde la BD
    const cards = page.locator('.cat-card');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(1);

    // Validar badges y DT
    await expect(page.locator('.cat-name').first()).toBeVisible();
    await expect(page.locator('.cat-dt').first()).toBeVisible();

    sniffer.assertZeroErrors();
  });

  test('2. Filtro por Rama (Masculino, Femenino, Mixto, Todas)', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/categorias');
    await page.waitForLoadState('networkidle');

    const ramaSelect = page.locator('.sport-select');
    await expect(ramaSelect).toBeVisible();

    // Filtrar por Masculino
    await ramaSelect.selectOption('MASCULINO');
    await page.waitForTimeout(300);
    const mascCards = page.locator('.cat-card');
    expect(await mascCards.count()).toBeGreaterThanOrEqual(1);

    // Filtrar por Femenino
    await ramaSelect.selectOption('FEMENINO');
    await page.waitForTimeout(300);

    // Regresar a Todas
    await ramaSelect.selectOption('TODAS');
    await page.waitForTimeout(300);
    const allCards = page.locator('.cat-card');
    expect(await allCards.count()).toBeGreaterThanOrEqual(1);

    sniffer.assertZeroErrors();
  });

  test('3. Ciclo de vida completo del Modal "Nueva Categoría" y persistencia directa en PostgreSQL', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/categorias');
    await page.waitForLoadState('networkidle');

    // 1. Abrir Modal
    const newBtn = page.locator('button', { hasText: 'Nueva Categoría' });
    await newBtn.click();

    const modal = page.locator('.modal-card');
    await expect(modal).toBeVisible();

    // 2. Probar Cancelar / Cerrar
    const cancelBtn = modal.locator('button', { hasText: 'Cancelar' });
    await cancelBtn.click();
    await expect(modal).not.toBeVisible();

    // 3. Reabrir y diligenciar formulario con código único
    await newBtn.click();
    await expect(modal).toBeVisible();

    const uniqueCode = 'SUB_E2E_' + Date.now().toString().slice(-4);
    const uniqueName = `Categoría E2E Test ${uniqueCode}`;

    await modal.locator('input[name="nombre"]').fill(uniqueName);
    await modal.locator('input[name="codigo_categoria"]').fill(uniqueCode);
    await modal.locator('input[name="anio_nacimiento_min"]').fill('2012');
    await modal.locator('input[name="anio_nacimiento_max"]').fill('2012');
    await modal.locator('select[name="rama"]').selectOption('MASCULINO');
    await modal.locator('select[name="nivel_competencia"]').selectOption('COMPETITIVO');
    await modal.locator('input[name="cupo_maximo"]').fill('22');

    // 4. Enviar formulario
    const saveBtn = modal.locator('button[type="submit"]');
    await saveBtn.click();

    // 5. Esperar confirmación
    await expect(page.locator('.toast-floating-alert')).toBeVisible({ timeout: 5000 });
    await expect(modal).not.toBeVisible();

    // 6. Verificar persistencia directa en PostgreSQL QA
    const dbRes = await queryDb(
      `SELECT id, nombre, codigo_categoria, rama, cupo_maximo, activa
       FROM deportivo.categorias 
       WHERE codigo_categoria = $1`,
      [uniqueCode]
    );

    expect(dbRes.length).toBe(1);
    expect(dbRes[0].nombre).toBe(uniqueName);
    expect(dbRes[0].codigo_categoria).toBe(uniqueCode);
    expect(dbRes[0].rama).toBe('MASCULINO');
    expect(dbRes[0].cupo_maximo).toBe(22);
    expect(dbRes[0].activa).toBe(true);

    sniffer.assertZeroErrors();
  });

  test('4. Apertura de Modal "Ver Plantel", consulta de jugadores y cierre de modal', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/categorias');
    await page.waitForLoadState('networkidle');

    // Click en "Ver Plantel" de la primera categoría
    const plantelBtn = page.locator('.cat-card').first().locator('button', { hasText: 'Ver Plantel' });
    await plantelBtn.click();

    // Validar modal de plantel
    const plantelModal = page.locator('.modal-card.modal-lg');
    await expect(plantelModal).toBeVisible();
    await expect(plantelModal.locator('h2')).toContainText('Plantel Oficial');

    // Cerrar modal
    const closeBtn = plantelModal.locator('button', { hasText: 'Cerrar' });
    await closeBtn.click();
    await expect(plantelModal).not.toBeVisible();

    sniffer.assertZeroErrors();
  });
});

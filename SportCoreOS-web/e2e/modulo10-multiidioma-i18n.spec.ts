import { test, expect } from '@playwright/test';
import { attachStrictErrorSniffer } from './helpers/error-sniffer';

test.describe('MÓDULO 10: MULTIIDIOMA (i18n) & VERIFICACIÓN DE FONDOS DE MODALES', () => {

  test.beforeEach(async ({ page }) => {
    attachStrictErrorSniffer(page);
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Autenticación con perfil Director Deportivo
    const demoDirBtn = page.locator('.persona-btn', { hasText: 'Carlos Valderrama' }).first();
    await expect(demoDirBtn).toBeVisible({ timeout: 10000 });
    await demoDirBtn.click();
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  test('1. Selector de Idioma en Navbar: cambio dinámico entre Español, English y Português', async ({ page }) => {
    // Localizar el selector de idioma en el navbar
    const langBtn = page.locator('app-language-selector .lang-current-btn');
    await expect(langBtn).toBeVisible({ timeout: 5000 });
    
    // Abrir dropdown
    await langBtn.click();
    const dropdown = page.locator('.lang-dropdown-card');
    await expect(dropdown).toBeVisible({ timeout: 3000 });

    // Cambiar a English
    const enOption = page.locator('.lang-option-btn', { hasText: 'English' });
    await expect(enOption).toBeVisible();
    await enOption.click();
    await page.waitForTimeout(400);

    // Verificar que el botón ahora muestra EN
    await expect(langBtn).toContainText('EN');

    // Cambiar a Português
    await langBtn.click();
    const ptOption = page.locator('.lang-option-btn', { hasText: 'Português' });
    await expect(ptOption).toBeVisible();
    await ptOption.click();
    await page.waitForTimeout(400);
    await expect(langBtn).toContainText('PT');

    // Regresar a Español
    await langBtn.click();
    const esOption = page.locator('.lang-option-btn', { hasText: 'Español' });
    await expect(esOption).toBeVisible();
    await esOption.click();
    await page.waitForTimeout(400);
    await expect(langBtn).toContainText('ES');
  });

  test('2. Navegación a la vista /idiomas, KPIs, explorador de diccionario y sandbox en vivo', async ({ page }) => {
    await page.goto('/idiomas');
    await page.waitForLoadState('networkidle');

    // 1. Validar Header & KPIs
    const title = page.locator('.page-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('Centro de Idiomas');

    const kpiCards = page.locator('.kpi-card');
    await expect(kpiCards).toHaveCount(4);

    // 2. Tarjetas de Selección de Idioma
    const langCards = page.locator('.lang-choice-card');
    await expect(langCards).toHaveCount(3);

    // Activar English desde la tarjeta
    const enChoice = page.locator('.lang-choice-card', { hasText: 'English' });
    await enChoice.click();
    await page.waitForTimeout(500);

    // Validar Toast de cambio de idioma
    const toast = page.locator('.toast-floating-alert');
    await expect(toast).toBeVisible();

    // 3. Sandbox de Componentes en Vivo
    const sandbox = page.locator('.sandbox-preview-container');
    await expect(sandbox).toBeVisible();
    await expect(sandbox).toContainText('Save');
    await expect(sandbox).toContainText('Active');

    // 4. Explorador del Diccionario & Filtros
    const searchInput = page.locator('.dictionary-search-box input');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('dashboard');
    await page.waitForTimeout(300);

    const rows = page.locator('.entry-row');
    expect(await rows.count()).toBeGreaterThan(0);
    await expect(rows.first()).toContainText('nav.dashboard');

    // Limpiar filtro y probar píldoras de categorías
    await searchInput.fill('');
    const catPill = page.locator('.category-filters-pills .pill', { hasText: 'Acciones' });
    await catPill.click();
    await page.waitForTimeout(300);
    await expect(page.locator('.entry-row').first()).toContainText('action.');

    // Regresar idioma a Español
    const esChoice = page.locator('.lang-choice-card', { hasText: 'Español' });
    await esChoice.click();
    await page.waitForTimeout(400);
  });

  test('3. Verificación de Fondos No Transparentes en Modales del Sistema', async ({ page }) => {
    // 1. Abrir modal en Jugadores
    await page.goto('/jugadores');
    await page.waitForLoadState('networkidle');

    const newPlayerBtn = page.locator('.header-actions .btn-primary');
    await newPlayerBtn.click();
    
    const modalCard = page.locator('.form-modal-card');
    await expect(modalCard).toBeVisible({ timeout: 5000 });

    // Validar estilos computados de fondo y opacidad
    const bg = await modalCard.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    const opacity = await modalCard.evaluate((el) => window.getComputedStyle(el).opacity);
    
    expect(bg).not.toBe('rgba(0, 0, 0, 0)');
    expect(bg).not.toBe('transparent');
    expect(opacity).toBe('1');

    // Cerrar modal
    const closeBtn = modalCard.locator('.modal-close-btn');
    await closeBtn.click();
    await expect(modalCard).not.toBeVisible();

    // 2. Abrir modal en Canchas
    await page.goto('/canchas');
    await page.waitForLoadState('networkidle');

    const nuevaCanchaBtn = page.locator('button', { hasText: 'Nueva Reserva' }).first();
    await nuevaCanchaBtn.click();

    const canchaModal = page.locator('.modal-card');
    await expect(canchaModal).toBeVisible({ timeout: 5000 });

    const canchaBg = await canchaModal.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(canchaBg).not.toBe('rgba(0, 0, 0, 0)');
    expect(canchaBg).not.toBe('transparent');

    const closeCanchaBtn = canchaModal.locator('.btn-close');
    await closeCanchaBtn.click();
    await expect(canchaModal).not.toBeVisible();
  });

});

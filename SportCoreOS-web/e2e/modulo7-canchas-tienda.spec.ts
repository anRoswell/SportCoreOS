import { test, expect } from '@playwright/test';
import { attachStrictErrorSniffer } from './helpers/error-sniffer';

test.describe('MÓDULO 08 & 09: CANCHAS & TIENDA DE INDUMENTARIA - E2E TEST', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Login rápido con Carlos Valderrama (Director Deportivo)
    const demoDirBtn = page.locator('.persona-btn', { hasText: 'Carlos Valderrama' }).first();
    await expect(demoDirBtn).toBeVisible({ timeout: 10000 });
    await demoDirBtn.click();
    await page.waitForURL('**/dashboard', { timeout: 10000 });
  });

  test('1. Módulo 08: Carga de Canchas, visualización de KPIs y matriz horaria de slots', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/canchas');
    await page.waitForLoadState('networkidle');

    // Validar título y métricas
    await expect(page.locator('.page-title')).toContainText('Alquiler de Canchas');
    await expect(page.locator('.kpi-card')).toHaveCount(4);

    // Validar tabla de matriz horaria
    const matrizTable = page.locator('.matriz-table');
    await expect(matrizTable).toBeVisible();

    // Validar columnas de canchas y slots
    const thCanchas = page.locator('.th-cancha');
    expect(await thCanchas.count()).toBeGreaterThanOrEqual(1);

    const slotCards = page.locator('.slot-card');
    expect(await slotCards.count()).toBeGreaterThanOrEqual(5);

    sniffer.assertZeroErrors();
  });

  test('2. Módulo 08: Ciclo de vida del Modal Nueva Reserva y Modal Cobro en Recepción', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/canchas');
    await page.waitForLoadState('networkidle');

    // 1. Abrir Modal de Nueva Reserva
    const btnNueva = page.locator('button', { hasText: 'Nueva Reserva' });
    await btnNueva.click();

    const modalReserva = page.locator('.modal-card');
    await expect(modalReserva).toBeVisible();

    // 2. Cerrar Modal
    const btnCancel = modalReserva.locator('button', { hasText: 'Cancelar' });
    await btnCancel.click();
    await expect(modalReserva).not.toBeVisible();

    // 3. Probar Modal de Gestión de Canchas
    const btnGestion = page.locator('button', { hasText: 'Gestionar Canchas' });
    await btnGestion.click();
    const modalGestion = page.locator('.modal-card.modal-lg');
    await expect(modalGestion).toBeVisible();

    await modalGestion.locator('button', { hasText: 'Cerrar' }).click();
    await expect(modalGestion).not.toBeVisible();

    sniffer.assertZeroErrors();
  });

  test('3. Módulo 09: Carga de Tienda Oficial, catálogo de productos y filtros por categoría', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/tienda');
    await page.waitForLoadState('networkidle');

    // Validar encabezado
    await expect(page.locator('.page-title')).toContainText('Tienda Oficial');

    // Validar pestañas
    const tabBtns = page.locator('.tab-btn');
    await expect(tabBtns).toHaveCount(3);

    // Validar productos del catálogo
    const productCards = page.locator('.product-card');
    expect(await productCards.count()).toBeGreaterThanOrEqual(1);

    // Probar filtro de categorías
    const btnUniformes = page.locator('.cat-filter-btn', { hasText: 'Uniformes Oficiales' });
    await btnUniformes.click();
    await page.waitForTimeout(200);

    const btnTodos = page.locator('.cat-filter-btn', { hasText: 'Todos los Artículos' });
    await btnTodos.click();
    await page.waitForTimeout(200);

    sniffer.assertZeroErrors();
  });

  test('4. Módulo 09: Navegación entre Pestañas (Pedidos & Despachos, Inventario Bodega)', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/tienda');
    await page.waitForLoadState('networkidle');

    // 1. Cambiar a Pestaña Despachos & Pedidos
    const btnTabPedidos = page.locator('.tab-btn', { hasText: 'Despachos & Pedidos' });
    await btnTabPedidos.click();

    const pedidosSection = page.locator('.pedidos-section');
    await expect(pedidosSection).toBeVisible();
    await expect(pedidosSection.locator('h2')).toContainText('Órdenes de Indumentaria');

    // 2. Cambiar a Pestaña Inventario & Bodega
    const btnTabStock = page.locator('.tab-btn', { hasText: 'Inventario & Bodega' });
    await btnTabStock.click();

    const stockSection = page.locator('.stock-section');
    await expect(stockSection).toBeVisible();
    await expect(stockSection.locator('h2')).toContainText('Control de Existencias');

    // 3. Probar Modal Nuevo Producto
    const btnNuevoProd = page.locator('button', { hasText: 'Nuevo Producto' });
    await btnNuevoProd.click();

    const modalProd = page.locator('.modal-card.modal-lg');
    await expect(modalProd).toBeVisible();
    await modalProd.locator('button', { hasText: 'Cancelar' }).click();
    await expect(modalProd).not.toBeVisible();

    sniffer.assertZeroErrors();
  });
});

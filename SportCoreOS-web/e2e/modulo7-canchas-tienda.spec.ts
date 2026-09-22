import { test, expect } from '@playwright/test';
import { attachStrictErrorSniffer } from './helpers/error-sniffer';
import { queryDb } from './helpers/db-helper';

test.describe('MÓDULO 08 & 09: CANCHAS & TIENDA DE INDUMENTARIA - E2E EXHAUSTIVO', () => {

  test.beforeEach(async ({ page }) => {
    // Autenticación inicial con Director Deportivo (Carlos Valderrama)
    await page.goto('/login');
    await page.waitForLoadState('domcontentloaded');

    const demoDirBtn = page.locator('.persona-btn', { hasText: 'Carlos Valderrama' }).first();
    await expect(demoDirBtn).toBeVisible({ timeout: 15000 });
    await demoDirBtn.click({ force: true });
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  // ===========================================================================
  // SUITE 1: CANCHAS - CARGA INICIAL, KPIS Y MATRIZ HORARIA DE SLOTS
  // ===========================================================================
  test('1. Módulo 08: Carga de Canchas, KPIs, selector de fecha y matriz horaria', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/canchas');
    await page.waitForLoadState('networkidle');

    // Validar títulos
    await expect(page.locator('.page-title')).toContainText('Alquiler de Canchas');
    await expect(page.locator('.page-subtitle')).toBeVisible();

    // Validar 4 KPIs
    const kpiCards = page.locator('.kpi-card');
    await expect(kpiCards).toHaveCount(4);
    await expect(page.locator('.kpi-label', { hasText: 'Ocupación del Día' })).toBeVisible();
    await expect(page.locator('.kpi-label', { hasText: 'Canchas Habilitadas' })).toBeVisible();

    // Validar matriz horaria
    const matrizTable = page.locator('.matriz-table');
    await expect(matrizTable).toBeVisible();

    const thCanchas = page.locator('.th-cancha');
    expect(await thCanchas.count()).toBeGreaterThanOrEqual(1);

    const slotCards = page.locator('.slot-card');
    expect(await slotCards.count()).toBeGreaterThanOrEqual(5);

    // Cambiar fecha en date picker
    const dateInput = page.locator('input.date-input');
    await dateInput.fill('2026-04-15');
    await page.waitForTimeout(400);
    await expect(page.locator('.matriz-title')).toContainText('2026-04-15');

    sniffer.assertZeroErrors();
  });

  // ===========================================================================
  // SUITE 2: CANCHAS - CICLO DE VIDA DE RESERVAS (CREACIÓN, COBRO, CANCELACIÓN)
  // ===========================================================================
  test('2. Módulo 08: Ciclo completo de reserva, cobro en recepción y cancelación con modal profesional', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);
    const testClient = `E2E Cliente Cancha ${Date.now()}`;

    await page.goto('/canchas');
    await page.waitForLoadState('networkidle');

    // 1. Abrir Modal de Nueva Reserva
    const btnNueva = page.locator('button', { hasText: 'Nueva Reserva' });
    await btnNueva.click();

    const modalReserva = page.locator('.modal-card');
    await expect(modalReserva).toBeVisible();

    // Llenar formulario de reserva
    await modalReserva.locator('input[name="cliente_nombre"]').fill(testClient);
    await modalReserva.locator('input[name="cliente_telefono"]').fill('+57 300 9876543');
    await modalReserva.locator('input[name="monto_anticipo"]').fill('40000');

    // Guardar reserva
    const submitBtn = modalReserva.locator('button[type="submit"]', { hasText: 'Confirmar Reserva' });
    await submitBtn.click();

    await page.waitForTimeout(600);

    // Verificar persistencia en base de datos PostgreSQL
    const reservasDb = await queryDb(
      `SELECT * FROM deportivo.reservas_cancha WHERE cliente_nombre = $1 ORDER BY created_at DESC LIMIT 1`,
      [testClient]
    );
    expect(reservasDb.length).toBe(1);
    const reservaId = reservasDb[0].id;
    expect(reservasDb[0].monto_anticipo).toBeDefined();

    // 2. Probar Cobro en Recepción si aparece el botón Cobrar en la matriz
    const slotCard = page.locator('.slot-card', { hasText: testClient }).first();
    if (await slotCard.isVisible()) {
      const btnCobrar = slotCard.locator('.btn-xs-pay');
      if (await btnCobrar.isVisible()) {
        await btnCobrar.click();

        const modalCobro = page.locator('.modal-card.modal-sm');
        await expect(modalCobro).toBeVisible();

        const submitCobro = modalCobro.locator('button[type="submit"]', { hasText: 'Registrar Cobro' });
        await submitCobro.click();
        await page.waitForTimeout(500);

        // Verificar DB estado de pago actualizado
        const updatedRes = await queryDb(`SELECT estado_pago FROM deportivo.reservas_cancha WHERE id = $1`, [reservaId]);
        expect(updatedRes[0].estado_pago).toBe('completado');
      }

      // 3. Probar Cancelación con el nuevo Modal Profesional de Cancelación
      const btnCancelarSlot = slotCard.locator('.btn-xs-cancel');
      if (await btnCancelarSlot.isVisible()) {
        await btnCancelarSlot.click();

        const modalCancel = page.locator('.delete-confirm-modal-card');
        await expect(modalCancel).toBeVisible();
        await expect(modalCancel.locator('h2')).toContainText('Cancelar Reserva de Turno');
        await expect(modalCancel.locator('.warning-callout')).toBeVisible();

        // Primero probar botón "Conservar Turno" (Cerrar modal)
        await modalCancel.locator('button', { hasText: 'Conservar Turno' }).click();
        await expect(modalCancel).not.toBeVisible();

        // Volver a abrir y confirmar cancelación
        await btnCancelarSlot.click();
        await expect(modalCancel).toBeVisible();
        await modalCancel.locator('.btn-confirm-delete', { hasText: 'Sí, Cancelar Turno' }).click();
        await page.waitForTimeout(500);

        // Verificar DB estado cancelado
        const cancelledRes = await queryDb(`SELECT estado_turno FROM deportivo.reservas_cancha WHERE id = $1`, [reservaId]);
        expect(cancelledRes[0].estado_turno).toBe('cancelado');
      }
    }

    // Limpieza posterior
    await queryDb(`DELETE FROM deportivo.reservas_cancha WHERE id = $1`, [reservaId]);

    sniffer.assertZeroErrors();
  });

  // ===========================================================================
  // SUITE 3: CANCHAS - GESTIÓN Y CRUD DE ESCENARIOS DEPORTIVOS
  // ===========================================================================
  test('3. Módulo 08: Modal de Gestión de Canchas, creación y edición de predios', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);
    const canchaTestNombre = `Cancha Sintética E2E ${Date.now()}`;

    await page.goto('/canchas');
    await page.waitForLoadState('networkidle');

    // 1. Abrir modal Gestionar Canchas
    const btnGestion = page.locator('button', { hasText: 'Gestionar Canchas' });
    await btnGestion.click();

    const modalGestion = page.locator('.modal-card.modal-lg');
    await expect(modalGestion).toBeVisible();

    // 2. Abrir modal Añadir Nueva Cancha
    const btnAddCancha = modalGestion.locator('button', { hasText: 'Añadir Nueva Cancha' });
    await btnAddCancha.click();

    const modalFormCancha = page.locator('.modal-card').filter({ has: page.locator('input[name="cNombre"]') });
    await expect(modalFormCancha).toBeVisible();

    // Llenar formulario
    await modalFormCancha.locator('input[name="cNombre"]').fill(canchaTestNombre);
    await modalFormCancha.locator('input[name="cDiurna"]').fill('95000');
    await modalFormCancha.locator('input[name="cNocturna"]').fill('140000');

    // Guardar cancha
    await modalFormCancha.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);

    // Verificar persistencia en base de datos
    const canchaDb = await queryDb(
      `SELECT * FROM deportivo.canchas WHERE nombre = $1 ORDER BY created_at DESC LIMIT 1`,
      [canchaTestNombre]
    );
    expect(canchaDb.length).toBe(1);
    expect(Number(canchaDb[0].precio_hora_diurna)).toBe(95000);

    // Limpieza posterior
    await queryDb(`DELETE FROM deportivo.canchas WHERE id = $1`, [canchaDb[0].id]);

    sniffer.assertZeroErrors();
  });

  // ===========================================================================
  // SUITE 4: TIENDA - CATÁLOGO, FILTROS Y CRUD DE PRODUCTOS
  // ===========================================================================
  test('4. Módulo 09: Catálogo de indumentaria, filtros, creación y desactivación con modal profesional', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);
    const skuTest = `SKU-E2E-${Date.now()}`;
    const prodNameTest = `Camiseta Competencia E2E ${Date.now()}`;

    await page.goto('/tienda');
    await page.waitForLoadState('networkidle');

    // Validar encabezados y pestañas
    await expect(page.locator('.page-title')).toContainText('Tienda Oficial');
    const tabBtns = page.locator('.tab-btn');
    await expect(tabBtns).toHaveCount(3);

    // Probar filtros por categoría
    const catBtns = page.locator('.cat-filter-btn');
    const catCount = await catBtns.count();
    expect(catCount).toBeGreaterThanOrEqual(4);

    for (let i = 0; i < catCount; i++) {
      await catBtns.nth(i).click();
      await page.waitForTimeout(150);
      await expect(catBtns.nth(i)).toHaveClass(/active/);
    }
    await catBtns.first().click();

    // 1. Crear Nuevo Producto
    const btnNuevo = page.locator('button', { hasText: 'Nuevo Producto' });
    await btnNuevo.click();

    const modalProd = page.locator('.modal-card.modal-lg');
    await expect(modalProd).toBeVisible();

    await modalProd.locator('input[name="pSku"]').fill(skuTest);
    await modalProd.locator('input[name="pNombre"]').fill(prodNameTest);
    await modalProd.locator('input[name="pPrecio"]').fill('135000');

    // Añadir una talla extra en el modal
    const btnAddTalla = modalProd.locator('button', { hasText: 'Añadir Talla' });
    await btnAddTalla.click();

    // Guardar
    await modalProd.locator('button[type="submit"]').click();
    await page.waitForTimeout(600);

    // Verificar persistencia en base de datos PostgreSQL
    const prodDb = await queryDb(
      `SELECT * FROM deportivo.productos_tienda WHERE codigo_sku = $1 LIMIT 1`,
      [skuTest]
    );
    expect(prodDb.length).toBe(1);
    const prodId = prodDb[0].id;
    expect(Number(prodDb[0].precio_venta)).toBe(135000);

    // 2. Probar Desactivación con el Modal Profesional de Confirmación
    const prodCard = page.locator('.product-card', { hasText: prodNameTest }).first();
    await expect(prodCard).toBeVisible();

    const btnTrash = prodCard.locator('.btn-danger-hover');
    await btnTrash.click();

    const modalDelete = page.locator('.delete-confirm-modal-card');
    await expect(modalDelete).toBeVisible();
    await expect(modalDelete.locator('h2')).toContainText('Desactivar Producto del Catálogo');
    await expect(modalDelete.locator('.warning-callout')).toBeVisible();

    // Probar botón "Conservar en Catálogo"
    await modalDelete.locator('button', { hasText: 'Conservar en Catálogo' }).click();
    await expect(modalDelete).not.toBeVisible();

    // Volver a abrir y confirmar desactivación
    await btnTrash.click();
    await expect(modalDelete).toBeVisible();
    await modalDelete.locator('.btn-confirm-delete', { hasText: 'Sí, Desactivar Artículo' }).click();
    await page.waitForTimeout(500);

    // Limpieza posterior
    await queryDb(`DELETE FROM deportivo.variantes_producto WHERE producto_id = $1`, [prodId]);
    await queryDb(`DELETE FROM deportivo.productos_tienda WHERE id = $1`, [prodId]);

    sniffer.assertZeroErrors();
  });

  // ===========================================================================
  // SUITE 5: TIENDA - REGISTRO DE PEDIDO Y FLUJO DE DESPACHO EN UTILERÍA
  // ===========================================================================
  test('5. Módulo 09: Registro de compra/pedido y despacho en utilería', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);
    const buyerName = `Padre Comprador E2E ${Date.now()}`;

    await page.goto('/tienda');
    await page.waitForLoadState('networkidle');

    // 1. Tomar el primer producto disponible y abrir modal Pedido
    const firstProdCard = page.locator('.product-card').first();
    await expect(firstProdCard).toBeVisible();

    const btnBuy = firstProdCard.locator('button.btn-buy');
    await btnBuy.click();

    const modalBuy = page.locator('.modal-card', { hasText: 'Registrar Pedido de Indumentaria' });
    await expect(modalBuy).toBeVisible();

    // Llenar datos de comprador
    await modalBuy.locator('input[name="comprador_nombre"]').fill(buyerName);
    await modalBuy.locator('input[name="comprador_telefono"]').fill('+57 311 5554321');

    // Confirmar orden
    await modalBuy.locator('button[type="submit"]').click();
    await page.waitForTimeout(600);

    // Verificar persistencia en base de datos PostgreSQL
    const orderDb = await queryDb(
      `SELECT * FROM deportivo.pedidos_tienda WHERE comprador_nombre = $1 ORDER BY created_at DESC LIMIT 1`,
      [buyerName]
    );
    expect(orderDb.length).toBe(1);
    const orderId = orderDb[0].id;
    expect(orderDb[0].estado_despacho).toBe('PENDIENTE_ENTREGA');

    // 2. Cambiar a Pestaña Despachos & Pedidos
    const btnTabPedidos = page.locator('.tab-btn', { hasText: 'Despachos & Pedidos' });
    await btnTabPedidos.click();

    const pedidosTable = page.locator('.pedidos-section table');
    await expect(pedidosTable).toBeVisible();

    const orderRow = page.locator('tr', { hasText: buyerName }).first();
    await expect(orderRow).toBeVisible();

    // Despachar pedido
    const btnDespachar = orderRow.locator('button', { hasText: 'Despachar' });
    await btnDespachar.click();

    const modalDespacho = page.locator('.modal-card.modal-sm', { hasText: 'Validar Despacho' });
    await expect(modalDespacho).toBeVisible();

    await modalDespacho.locator('input[name="recibidoPor"]').fill('E2E Utilería Encargado');
    await modalDespacho.locator('button[type="submit"]').click();
    await page.waitForTimeout(500);

    // Verificar DB estado despacho = ENTREGADO
    const updatedOrder = await queryDb(`SELECT estado_despacho, recibido_por FROM deportivo.pedidos_tienda WHERE id = $1`, [orderId]);
    expect(updatedOrder[0].estado_despacho).toBe('ENTREGADO');
    expect(updatedOrder[0].recibido_por).toBe('E2E Utilería Encargado');

    // Limpieza
    await queryDb(`DELETE FROM deportivo.pedidos_tienda WHERE id = $1`, [orderId]);

    sniffer.assertZeroErrors();
  });

  // ===========================================================================
  // SUITE 6: TIENDA - CONTROL DE INVENTARIO Y AJUSTE RÁPIDO DE STOCK
  // ===========================================================================
  test('6. Módulo 09: Gestión de inventario en bodega y ajuste rápido reactivo de existencias', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/tienda');
    await page.waitForLoadState('networkidle');

    // Cambiar a pestaña Inventario & Bodega
    const btnTabStock = page.locator('.tab-btn', { hasText: 'Inventario & Bodega' });
    await btnTabStock.click();

    const stockSection = page.locator('.stock-section');
    await expect(stockSection).toBeVisible();

    // Validar tabla y filas de variantes
    const stockRows = stockSection.locator('tbody tr');
    expect(await stockRows.count()).toBeGreaterThan(0);

    // Probar ajuste rápido (+ / -)
    const firstAdjust = page.locator('.quick-stock-adjust').first();
    await expect(firstAdjust).toBeVisible();

    const btnPlus = firstAdjust.locator('.btn-qty', { hasText: '+' });
    await btnPlus.click();
    await page.waitForTimeout(300);

    const btnMinus = firstAdjust.locator('.btn-qty', { hasText: '-' });
    await btnMinus.click();
    await page.waitForTimeout(300);

    sniffer.assertZeroErrors();
  });
});

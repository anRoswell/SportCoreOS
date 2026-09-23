import { test, expect } from '@playwright/test';
import { attachStrictErrorSniffer } from './helpers/error-sniffer';
import { queryDb } from './helpers/db-helper';

test.describe('MÓDULO 11: SERVICIOS ESPECIALIZADOS, CLÍNICAS PRO & PASES QR - E2E EXHAUSTIVO', () => {

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
  // SUITE 1: SERVICIOS - CARGA INICIAL, KPIS Y FILTROS DE CATEGORÍA
  // ===========================================================================
  test('1. Carga de Servicios Especializados, 4 KPIs, tabs de categoría y búsqueda interactiva', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/servicios');
    await page.waitForLoadState('networkidle');

    // Validar encabezado
    await expect(page.locator('.page-title')).toContainText('Clínicas Especializadas');
    await expect(page.locator('.page-subtitle')).toBeVisible();

    // Validar 4 KPIs
    const kpiCards = page.locator('.kpi-card');
    await expect(kpiCards).toHaveCount(4);
    await expect(page.locator('.kpi-label', { hasText: 'Clínicas Especializadas Activas' })).toBeVisible();
    await expect(page.locator('.kpi-label', { hasText: 'Cupos Ocupados' })).toBeVisible();
    await expect(page.locator('.kpi-label', { hasText: 'Sedes con GPS' })).toBeVisible();
    await expect(page.locator('.kpi-label', { hasText: 'Pases QR & Recaudo' })).toBeVisible();

    // Validar tarjetas de clínicas cargadas
    const clinicCards = page.locator('.servicio-card');
    const initialCount = await clinicCards.count();
    expect(initialCount).toBeGreaterThanOrEqual(3);

    // Validar cambio de categoría en chip buttons
    const chipTabs = page.locator('.chip-btn');
    expect(await chipTabs.count()).toBeGreaterThanOrEqual(4);

    // Click en tab '⚡ Explosividad & Sprint'
    const tabExplosividad = page.locator('.chip-btn', { hasText: 'Explosividad' });
    if (await tabExplosividad.isVisible()) {
      await tabExplosividad.click();
      await page.waitForTimeout(300);
      const filteredCards = page.locator('.servicio-card');
      expect(await filteredCards.count()).toBeGreaterThanOrEqual(1);
    }

    // Regresar a 'Todas'
    await page.locator('.chip-btn', { hasText: 'Todas' }).click();
    await page.waitForTimeout(300);

    // Búsqueda por texto
    const searchInput = page.locator('input.sport-input').first();
    await searchInput.fill('Arqueros');
    await page.waitForTimeout(300);
    const searchResults = page.locator('.servicio-card');
    expect(await searchResults.count()).toBeGreaterThanOrEqual(1);
    await expect(searchResults.first().locator('.servicio-title')).toContainText('Arqueros');

    // Limpiar búsqueda
    await page.locator('.btn-clear').click();
    await page.waitForTimeout(300);

    sniffer.assertZeroErrors();
  });

  // ===========================================================================
  // SUITE 2: CICLO COMPLETO DE INSCRIPCIÓN, DESCUENTO HERMANOS, CHECKOUT & QR PASS
  // ===========================================================================
  test('2. Ciclo de vida de Inscripción: Formulario, Descuento Hermanos, Pago PSE y Pase QR', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/servicios');
    await page.waitForLoadState('networkidle');

    // Seleccionar la primera tarjeta con cupos disponibles
    const firstCard = page.locator('.servicio-card').first();
    const serviceTitle = await firstCard.locator('.servicio-title').textContent();
    expect(serviceTitle).toBeTruthy();

    // Click en botón 'Inscribirse / Pago PSE'
    const btnInscribir = firstCard.locator('.btn-inscribir');
    await expect(btnInscribir).toBeVisible();
    await btnInscribir.click();

    // Validar apertura del Modal de Inscripción
    const modalDialog = page.locator('.modal-dialog');
    await expect(modalDialog).toBeVisible();
    await expect(modalDialog.locator('.modal-title')).toContainText('Inscripción & Pase Digital');

    // Llenar campos del jugador y acudiente
    const testPlayerName = `Mateo Valderrama E2E ${Date.now().toString().slice(-4)}`;
    const testGuardianName = 'Carlos Valderrama';
    const testEmail = 'carlos.valderrama@gmail.com';
    const testPhone = '+57 300 123 4567';

    await modalDialog.locator('input[placeholder*="Mateo Valderrama"]').fill(testPlayerName);
    await modalDialog.locator('input[placeholder*="Carlos Valderrama"]').fill(testGuardianName);
    await modalDialog.locator('input[placeholder*="300 123 4567"]').fill(testPhone);
    await modalDialog.locator('input[placeholder*="carlos.valderrama@gmail.com"]').fill(testEmail);

    // Toggle Descuento de Hermanos
    const siblingCheckbox = modalDialog.locator('.discount-toggle input[type="checkbox"]');
    await siblingCheckbox.check();
    await page.waitForTimeout(200);

    // Seleccionar método de pago PSE
    const payCard = modalDialog.locator('.pay-method-card', { hasText: 'PSE' });
    await payCard.click();

    // Enviar Inscripción
    const btnConfirmar = modalDialog.locator('.modal-footer .btn-primary');
    await expect(btnConfirmar).toBeEnabled();
    await btnConfirmar.click();

    // Validar que se abre el Ticket Pase QR
    await page.waitForTimeout(600);
    const ticketCard = page.locator('.ticket-card');
    await expect(ticketCard).toBeVisible({ timeout: 10000 });
    await expect(ticketCard.locator('.ticket-status')).toContainText('INSCRIPCIÓN CONFIRMADA');
    await expect(ticketCard.locator('.qr-code-text')).toBeVisible();

    // Validar botón de WhatsApp para compartir con la familia
    const btnWhatsApp = ticketCard.locator('.btn-whatsapp');
    await expect(btnWhatsApp).toBeVisible();

    // Cerrar ticket modal
    await ticketCard.locator('.ticket-footer .btn-primary').click();
    await page.waitForTimeout(400);

    // =========================================================================
    // VERIFICACIÓN DIRECTA EN BASE DE DATOS POSTGRESQL
    // =========================================================================
    const dbInscripcion = await queryDb(
      `SELECT id, nombre_jugador, nombre_acudiente, estado_pago, codigo_qr_ticket, metodo_pago 
       FROM public.inscripciones_servicios 
       WHERE nombre_jugador = $1 
       ORDER BY id DESC LIMIT 1`,
      [testPlayerName]
    );

    expect(dbInscripcion.length).toBe(1);
    expect(dbInscripcion[0].nombre_jugador).toBe(testPlayerName);
    expect(dbInscripcion[0].nombre_acudiente).toBe(testGuardianName);
    expect(dbInscripcion[0].estado_pago).toBe('APROBADO');
    expect(dbInscripcion[0].codigo_qr_ticket).toBeTruthy();

    sniffer.assertZeroErrors();
  });

  // ===========================================================================
  // SUITE 3: MODAL DE LISTA DE INSCRITOS Y DETALLE DE PARTICIPANTES
  // ===========================================================================
  test('3. Apertura y visualización de la lista de participantes inscritos', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/servicios');
    await page.waitForLoadState('networkidle');

    // Click en botón 'Ver inscritos' (icono de usuarios en la primera tarjeta)
    const btnParticipantes = page.locator('.btn-participantes').first();
    await expect(btnParticipantes).toBeVisible();
    await btnParticipantes.click();

    // Validar modal de participantes
    const modalDialog = page.locator('.modal-dialog');
    await expect(modalDialog).toBeVisible();
    await expect(modalDialog.locator('.modal-title')).toContainText('Participantes Inscritos');

    // Cerrar modal
    const btnCerrar = modalDialog.locator('.modal-footer .btn-secondary');
    await btnCerrar.click();
    await page.waitForTimeout(300);
    await expect(modalDialog).not.toBeVisible();

    sniffer.assertZeroErrors();
  });

  // ===========================================================================
  // SUITE 4: MODAL DE CREACIÓN DE NUEVA CLÍNICA (ADMIN / DT)
  // ===========================================================================
  test('4. Modal de Nueva Clínica: Ciclo de validación, apertura y cancelación', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/servicios');
    await page.waitForLoadState('networkidle');

    // Click en botón de acción superior 'Crear Nueva Clínica'
    const btnCrear = page.locator('.btn-create');
    await expect(btnCrear).toBeVisible();
    await btnCrear.click();

    // Validar modal de creación
    const modalDialog = page.locator('.modal-dialog');
    await expect(modalDialog).toBeVisible();
    await expect(modalDialog.locator('.modal-title')).toContainText('Crear Nueva Clínica Especializada');

    // Cancelar/cerrar modal
    const btnCancelar = modalDialog.locator('.btn-secondary', { hasText: 'Cancelar' });
    await btnCancelar.click();
    await page.waitForTimeout(300);
    await expect(modalDialog).not.toBeVisible();

    sniffer.assertZeroErrors();
  });

});

import { test, expect } from '@playwright/test';
import { attachStrictErrorSniffer } from './helpers/error-sniffer';
import { queryDb } from './helpers/db-helper';

test.describe('MÓDULO 1: JUGADORES & FICHAS 360° - E2E EXHAUSTIVO', () => {

  test.beforeEach(async ({ page }) => {
    // Autenticación inicial con perfil Director Deportivo (Carlos Valderrama)
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Click en perfil demo Carlos Valderrama
    const demoDirBtn = page.locator('.persona-btn', { hasText: 'Carlos Valderrama' }).first();
    await expect(demoDirBtn).toBeVisible({ timeout: 10000 });
    await demoDirBtn.click({ force: true });

    // Esperar redirección al dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  // ===========================================================================
  // SUITE 1: Carga inicial, KPIs y Sniffer
  // ===========================================================================
  test('1. Carga inicial de Jugadores, KPIs y ausencia estricta de excepciones JS', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/jugadores');
    await page.waitForLoadState('networkidle');

    // Validar título y subtítulo
    await expect(page.locator('.page-title')).toContainText('Directorio de Jugadores');

    // Validar KPIs de cabecera
    await expect(page.locator('.kpi-card')).toHaveCount(4);
    await expect(page.locator('.kpi-label', { hasText: 'Total en Plantel' })).toBeVisible();
    await expect(page.locator('.kpi-label', { hasText: 'Matrículas Activas' })).toBeVisible();

    // Validar tabla de datos
    await expect(page.locator('.fut-table')).toBeVisible();
    const rows = page.locator('.player-row');
    expect(await rows.count()).toBeGreaterThan(0);

    sniffer.assertZeroErrors();
  });

  // ===========================================================================
  // SUITE 2: Navegación por 100% de pestañas de categoría, filtros avanzados y paginación
  // ===========================================================================
  test('2. Navegación exhaustiva por categorías, buscador en vivo, filtros y paginación reactiva', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/jugadores');
    await page.waitForLoadState('networkidle');

    // 1. Iterar todas las pills de categorías
    const categoryPills = page.locator('.category-pills .pill');
    const pillCount = await categoryPills.count();
    expect(pillCount).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < pillCount; i++) {
      await categoryPills.nth(i).click();
      await page.waitForTimeout(200);
      await expect(categoryPills.nth(i)).toHaveClass(/active/);
    }

    // Regresar a 'Todas las Categorías'
    await categoryPills.first().click();

    // 2. Probar buscador de texto por nombre usando el primer jugador visible
    const firstPlayerNameEl = page.locator('.player-row .player-name').first();
    const fullFirstPlayerName = await firstPlayerNameEl.innerText();
    const searchKeyword = fullFirstPlayerName.trim().split(' ')[0];

    const searchInput = page.locator('.search-input');
    await searchInput.fill(searchKeyword);
    await page.waitForTimeout(400);
    const filteredRows = page.locator('.player-row');
    expect(await filteredRows.count()).toBeGreaterThan(0);
    await expect(page.locator('.player-name').first()).toContainText(searchKeyword);

    // Limpiar búsqueda con botón X
    const clearBtn = page.locator('.clear-search-btn');
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
    } else {
      await searchInput.clear();
    }
    await page.waitForTimeout(200);

    // 3. Probar buscador por número de documento
    const firstRowDoc = await page.locator('.player-row').first().getAttribute('data-doc');
    if (firstRowDoc) {
      await searchInput.fill(firstRowDoc);
      await page.waitForTimeout(300);
      await expect(page.locator('.player-row')).toHaveCount(1);
      await searchInput.clear();
      await page.waitForTimeout(200);
    }

    // 4. Probar filtro por posición táctica
    const posicionSelect = page.locator('.filter-group select');
    await posicionSelect.selectOption('Delantero Centro');
    await page.waitForTimeout(200);
    await posicionSelect.selectOption('TODAS');
    await page.waitForTimeout(200);

    // 5. Probar filtro por género/rama
    const mascPill = page.locator('.segmented-filter-pills .seg-pill', { hasText: 'Masc' });
    await mascPill.click();
    await page.waitForTimeout(200);
    const todasPill = page.locator('.segmented-filter-pills .seg-pill', { hasText: 'Todas' }).first();
    await todasPill.click();
    await page.waitForTimeout(200);

    // 6. Probar filtro por estado
    const activosPill = page.locator('.segmented-filter-pills .seg-pill', { hasText: 'Activos' });
    if (await activosPill.isVisible()) {
      await activosPill.click();
      await page.waitForTimeout(200);
    }

    // 7. Probar buscador y limpiar
    await searchInput.fill('TestSearchFilter');
    await page.waitForTimeout(200);
    if (await clearBtn.isVisible()) {
      await clearBtn.click();
      await page.waitForTimeout(200);
    } else {
      await searchInput.fill('');
    }

    // 8. Probar Controles de Paginación
    const paginationBar = page.locator('.pagination-bar');
    await expect(paginationBar).toBeVisible();
    await expect(page.locator('.pagination-info')).toContainText('Mostrando');

    // Selector de tamaño de página
    const pageSizeSelect = page.locator('.page-size-select');
    await pageSizeSelect.selectOption('5');
    await page.waitForTimeout(200);
    const rows5 = page.locator('.player-row');
    expect(await rows5.count()).toBeLessThanOrEqual(5);

    // Si hay más de 1 página, navegar a la página 2 y regresar a la 1
    const nextBtn = page.locator('.btn-next');
    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
      await page.waitForTimeout(200);
      const prevBtn = page.locator('.btn-prev');
      await expect(prevBtn).toBeEnabled();
      await prevBtn.click();
      await page.waitForTimeout(200);
    }

    // Restaurar a 10 por página
    await pageSizeSelect.selectOption('10');
    await page.waitForTimeout(200);

    sniffer.assertZeroErrors();
  });

  // ===========================================================================
  // SUITE 3: Barrido de Botones en Filas & Exploración de Expediente 360°
  // ===========================================================================
  test('3. Barrido de acciones en tabla y navegación por las 4 pestañas del Expediente 360°', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/jugadores');
    await page.waitForLoadState('networkidle');

    // Click en botón "Ficha 360°" de la primera fila
    const firstRow = page.locator('.player-row').first();
    const btnFicha = firstRow.locator('.btn-view');
    await btnFicha.click();

    // Validar apertura del Modal Expediente 360°
    const expModal = page.locator('.expediente-modal');
    await expect(expModal).toBeVisible({ timeout: 5000 });

    // Explorar Pestaña 1: Perfil Deportivo
    await expect(page.locator('.exp-tab-btn.active')).toContainText('Perfil Deportivo');
    await expect(page.locator('.info-card').first()).toBeVisible();

    // Explorar Pestaña 2: Núcleo Familiar
    const tabFamilia = page.locator('.exp-tab-btn', { hasText: 'Núcleo Familiar' });
    await tabFamilia.click();
    await page.waitForTimeout(250);
    await expect(tabFamilia).toHaveClass(/active/);
    await expect(page.locator('.pane-title', { hasText: 'Padres de Familia' })).toBeVisible();

    // Explorar Pestaña 3: Radar Biométrico
    const tabBio = page.locator('.exp-tab-btn', { hasText: 'Radar Biométrico' });
    await tabBio.click();
    await page.waitForTimeout(250);
    await expect(tabBio).toHaveClass(/active/);
    await expect(page.locator('.pane-title', { hasText: 'Historial Antropométrico' })).toBeVisible();

    // Explorar Pestaña 4: Estado Financiero
    const tabFin = page.locator('.exp-tab-btn', { hasText: 'Estado Financiero' });
    await tabFin.click();
    await page.waitForTimeout(250);
    await expect(tabFin).toHaveClass(/active/);
    await expect(page.locator('.fin-stat-card').first()).toBeVisible();

    // Explorar Pestaña 5: Clínicas & Insignias Pro
    const tabServicios = page.locator('.exp-tab-btn', { hasText: 'Clínicas & Insignias Pro' });
    await tabServicios.click();
    await page.waitForTimeout(250);
    await expect(tabServicios).toHaveClass(/active/);
    await expect(page.locator('.insignia-card').first()).toBeVisible();
    await expect(page.locator('.pane-title', { hasText: 'Clínicas de Micro-Habilidades' })).toBeVisible();

    // Cerrar Modal
    const btnClose = page.locator('.modal-close-btn');
    await btnClose.click();
    await expect(expModal).not.toBeVisible();

    sniffer.assertZeroErrors();
  });

  // ===========================================================================
  // SUITE 4: Ciclo de Vida de Modales (Inscribir Alumno y Medición Biométrica)
  // ===========================================================================
  test('4. Ciclo de vida completo (apertura, validación interactiva y cierre) de todos los modales', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/jugadores');
    await page.waitForLoadState('networkidle');

    // 1. Modal Inscribir Alumno
    const btnInscribir = page.locator('button:has-text("Inscribir Nuevo Alumno")');
    await btnInscribir.click();
    const createModal = page.locator('.form-modal-card');
    await expect(createModal).toBeVisible();

    // Probar botón Cancelar
    const btnCancelCreate = createModal.locator('.btn-cancel');
    await btnCancelCreate.click();
    await expect(createModal).not.toBeVisible();

    // 2. Modal Medición Biométrica (vía Expediente 360°)
    const firstRow = page.locator('.player-row').first();
    await firstRow.locator('.btn-view').click();
    const expModal = page.locator('.expediente-modal');
    await expect(expModal).toBeVisible({ timeout: 5000 });

    const tabBio = expModal.locator('.exp-tab-btn', { hasText: 'Radar Biométrico' });
    await tabBio.click();
    await page.waitForTimeout(200);

    const btnNewBio = expModal.locator('button', { hasText: 'Registrar Nueva Medición' });
    await btnNewBio.click();

    const bioModal = page.locator('.bio-modal-card');
    await expect(bioModal).toBeVisible();

    // Validar cálculo dinámico de IMC en vivo al escribir peso y talla
    const inputTalla = bioModal.locator('input[name="bioTalla"]');
    const inputPeso = bioModal.locator('input[name="bioPeso"]');
    await inputTalla.fill('170');
    await inputPeso.fill('60');
    await expect(bioModal.locator('.imc-live-preview')).toContainText('20.7');

    // Cancelar modal biometría
    const btnCancelBio = bioModal.locator('.btn-cancel');
    await btnCancelBio.click();
    await expect(bioModal).not.toBeVisible();

    // Cerrar Expediente
    await expModal.locator('.modal-close-btn').click();
    await expect(expModal).not.toBeVisible();

    sniffer.assertZeroErrors();
  });

  // ===========================================================================
  // SUITE 5: Transacción CRUD Completa con Verificación Directa en PostgreSQL QA
  // ===========================================================================
  test('5. Transacción CRUD de creación, biometría y baja con verificación directa en PostgreSQL QA', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/jugadores');
    await page.waitForLoadState('networkidle');

    const randomNum = Math.floor(100000000 + Math.random() * 900000000).toString();
    const testDoc = `TI-${randomNum}`;
    const testNombre = `Enzo Gabriel`;
    const testApellido = `Fernández ${randomNum.substring(0, 4)}`;
    
    // Buscar dorsal libre para evitar colisiones
    const existingDorsals = (await queryDb('SELECT numero_dorsal FROM deportivo.jugadores WHERE numero_dorsal IS NOT NULL')).map((r: any) => Number(r.numero_dorsal));
    let testDorsal = Math.floor(10 + Math.random() * 85);
    while (existingDorsals.includes(testDorsal) && testDorsal < 99) {
      testDorsal++;
    }

    // 1. Abrir modal e ingresar datos
    await page.locator('button:has-text("Inscribir Nuevo Alumno")').click();
    const modal = page.locator('.form-modal-card');
    await expect(modal).toBeVisible();

    // Paso 1: Datos Personales
    await modal.locator('input[name="npNombres"]').fill(testNombre);
    await modal.locator('input[name="npApellidos"]').fill(testApellido);
    await modal.locator('input[name="npDoc"]').fill(testDoc);
    await modal.locator('input[name="npFechaNac"]').fill('2011-07-20');
    await modal.locator('select[name="npEps"]').selectOption({ index: 1 });
    await modal.locator('button:has-text("Siguiente: Perfil Deportivo")').click();

    // Paso 2: Perfil Deportivo
    await modal.locator('select[name="npCat"]').selectOption({ index: 1 });
    await modal.locator('input[name="npDorsal"]').fill(testDorsal.toString());
    await modal.locator('select[name="npPos"]').selectOption('Extremo Derecho');
    await modal.locator('button:has-text("Siguiente: Núcleo Familiar")').click();

    // Paso 3: Datos del Acudiente
    await modal.locator('input[name="npAcNom"]').fill('Lorena');
    await modal.locator('input[name="npAcApe"]').fill('Ospina');
    await modal.locator('input[name="npAcTel"]').fill('+57 311 444 8899');

    // Enviar Formulario
    await modal.locator('button[type="submit"]').click();

    // Validar Toast Feedback o cierre de modal
    await expect(modal).not.toBeVisible({ timeout: 8000 });

    // 2. VERIFICACIÓN DIRECTA EN POSTGRESQL QA (Schema deportivo)
    const dbJugador = await queryDb(
      'SELECT id, nombres, apellidos, numero_documento, numero_dorsal, estado_matricula FROM deportivo.jugadores WHERE numero_documento = $1',
      [testDoc],
    );
    expect(dbJugador.length).toBe(1);
    expect(dbJugador[0].nombres).toBe(testNombre);
    expect(dbJugador[0].numero_dorsal).toBe(testDorsal);
    expect(dbJugador[0].estado_matricula).toBe('ACTIVO');

    const jugadorId = dbJugador[0].id;

    // 3. Registrar Medición Biométrica para el nuevo jugador desde la UI
    await page.locator('.search-input').fill(testDoc);
    await page.waitForTimeout(400);

    const newRow = page.locator('.player-row').first();
    await newRow.locator('.btn-bio').click();

    const bioModal = page.locator('.bio-modal-card');
    await expect(bioModal).toBeVisible();

    await bioModal.locator('input[name="bioTalla"]').fill('174.0');
    await bioModal.locator('input[name="bioPeso"]').fill('63.0');
    await bioModal.locator('input[name="bioCooper"]').fill('3150');
    await bioModal.locator('input[name="bioVel"]').fill('3.80');
    await bioModal.locator('textarea[name="bioObs"]').fill('Excelente resistencia en Test de Cooper.');

    await bioModal.locator('button[type="submit"]').click();
    await expect(bioModal).not.toBeVisible({ timeout: 8000 });

    // 4. VERIFICACIÓN DIRECTA EN POSTGRESQL QA (Schema rendimiento)
    const dbBio = await queryDb(
      'SELECT peso_kg, talla_cm, imc, test_cooper_metros FROM rendimiento.evaluaciones_biometricas WHERE jugador_id = $1',
      [jugadorId],
    );
    expect(dbBio.length).toBe(1);
    expect(parseFloat(dbBio[0].peso_kg)).toBe(63.0);
    expect(parseFloat(dbBio[0].talla_cm)).toBe(174.0);
    expect(parseFloat(dbBio[0].imc)).toBe(20.8);
    expect(dbBio[0].test_cooper_metros).toBe(3150);

    // 5. Probar Modal Profesional de Retiro / Eliminación de Atleta
    const deleteBtn = newRow.locator('.btn-delete');
    await deleteBtn.click();

    const deleteModal = page.locator('.delete-confirm-modal-card');
    await expect(deleteModal).toBeVisible({ timeout: 5000 });
    await expect(deleteModal.locator('.retire-player-name')).toContainText(testNombre);
    await expect(deleteModal.locator('.warning-callout')).toBeVisible();

    // Probar cancelar modal de eliminación
    const btnCancelDelete = deleteModal.locator('.btn-cancel');
    await btnCancelDelete.click();
    await expect(deleteModal).not.toBeVisible();

    // Reabrir y confirmar eliminación definitiva
    await deleteBtn.click();
    await expect(deleteModal).toBeVisible();
    const btnConfirmDelete = deleteModal.locator('.btn-confirm-delete');
    await btnConfirmDelete.click();
    await expect(deleteModal).not.toBeVisible({ timeout: 8000 });

    // 6. VERIFICACIÓN DIRECTA EN POSTGRESQL QA (Estado RETIRADO o eliminado)
    const dbDeleted = await queryDb(
      'SELECT estado_matricula FROM deportivo.jugadores WHERE id = $1',
      [jugadorId],
    );
    if (dbDeleted.length > 0) {
      expect(dbDeleted[0].estado_matricula).toBe('RETIRADO');
    }

    sniffer.assertZeroErrors();
  });

});

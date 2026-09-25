import { test, expect } from '@playwright/test';
import { attachStrictErrorSniffer } from './helpers/error-sniffer';
import { queryDb } from './helpers/db-helper';

test.describe('MÓDULO 9: LICENCIAS/MÓDULOS DE ESCUELA, PARÁMETROS & RBAC - E2E EXHAUSTIVO', () => {

  test.beforeEach(async ({ page }) => {
    // Autenticación inicial con perfil Director Deportivo (Carlos Valderrama)
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Click en perfil demo Carlos Valderrama
    const demoDirBtn = page.locator('.persona-btn', { hasText: 'Carlos Valderrama' }).first();
    await expect(demoDirBtn).toBeVisible({ timeout: 10000 });
    await demoDirBtn.click();

    // Esperar redirección al dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });
  });

  // ===========================================================================
  // SUITE 1: MÓDULOS HABILITADOS POR ESCUELA (TENANT MODULES)
  // ===========================================================================
  test('1. Gestión integral de módulos por escuela, switches reactivos, modal de licencia y DB', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/modulos-escuela');
    await page.waitForLoadState('networkidle');

    // 1. Validar Título y KPIs
    await expect(page.locator('.page-title')).toContainText('Módulos Habilitados por Escuela');
    await expect(page.locator('.kpi-card')).toHaveCount(4);
    await expect(page.locator('.kpi-label', { hasText: 'Total en Catálogo' })).toBeVisible();
    await expect(page.locator('.kpi-label', { hasText: 'Módulos Activos' })).toBeVisible();

    // 2. Probar Filtros de Categorías y Buscador
    const chips = page.locator('.category-chips .chip-btn');
    const chipCount = await chips.count();
    expect(chipCount).toBeGreaterThan(1);

    for (let i = 0; i < chipCount; i++) {
      await chips.nth(i).click();
      await page.waitForTimeout(100);
      const visibleCards = await page.locator('.module-card').count();
      expect(visibleCards).toBeGreaterThanOrEqual(0);
    }
    // Volver a Todos
    await chips.first().click();

    // Buscador
    const initialCardsCount = await page.locator('.module-card').count();
    const searchInput = page.locator('.search-input-wrap input');
    await searchInput.fill('Finanzas');
    await page.waitForTimeout(200);
    await expect(page.locator('.module-card')).toHaveCount(1);
    await searchInput.fill('');
    await page.waitForTimeout(200);
    await expect(page.locator('.module-card')).toHaveCount(initialCardsCount);

    // 3. Conmutar Switch de un Módulo y verificar persistencia en PostgreSQL
    const biometriaCard = page.locator('.module-card', { hasText: 'Biometría & Antropometría' }).first();
    await expect(biometriaCard).toBeVisible();
    await biometriaCard.scrollIntoViewIfNeeded();

    const switchInput = biometriaCard.locator('.switch-toggle input');
    const wasChecked = await switchInput.isChecked();

    // Click switch
    await switchInput.evaluate((el: HTMLInputElement) => el.click());
    await page.waitForTimeout(500);

    // Toast de confirmación
    await expect(page.locator('.toast-alert')).toBeVisible({ timeout: 5000 });

    // Verificar en Base de Datos PostgreSQL
    const dbRows = await queryDb(
      `SELECT habilitado FROM core.tenant_module_access 
       WHERE club_id = '10000000-0000-0000-0000-000000000001' AND modulo_codigo = 'BIOMETRIA'`,
    );
    expect(dbRows.length).toBe(1);
    expect(dbRows[0].habilitado).toBe(!wasChecked);

    // Restaurar estado activo
    if (!wasChecked === false) {
      await switchInput.evaluate((el: HTMLInputElement) => el.click());
      await page.waitForTimeout(500);
    }

    // 4. Modal Ajustar Licencia: Apertura, Validación y Guardado
    const editLicBtn = biometriaCard.locator('.btn-edit-license');
    await editLicBtn.click();
    await expect(page.locator('.modal-card')).toBeVisible();
    await expect(page.locator('.modal-title')).toContainText('Configurar Licencia: Biometría & Antropometría');

    // Desmarcar indefinido y poner fechas
    const undefCheckbox = page.locator('input[name="esIndefinido"]');
    if (await undefCheckbox.isChecked()) {
      await undefCheckbox.click();
    }

    const startDateInput = page.locator('input[name="fechaInicio"]');
    const endDateInput = page.locator('input[name="fechaFin"]');
    await expect(startDateInput).toBeVisible();
    await startDateInput.fill('2026-01-01');
    await endDateInput.fill('2026-12-31');

    // Guardar
    await page.locator('.modal-card button[type="submit"]').click();
    await page.waitForTimeout(600);
    await expect(page.locator('.modal-card')).not.toBeVisible();

    // Verificar en DB
    const dbUpdated = await queryDb(
      `SELECT es_indefinido, fecha_inicio, fecha_fin FROM core.tenant_module_access 
       WHERE club_id = '10000000-0000-0000-0000-000000000001' AND modulo_codigo = 'BIOMETRIA'`,
    );
    expect(dbUpdated[0].es_indefinido).toBe(false);

    // Restaurar a indefinido
    await queryDb(
      `UPDATE core.tenant_module_access SET es_indefinido = true, habilitado = true 
       WHERE club_id = '10000000-0000-0000-0000-000000000001' AND modulo_codigo = 'BIOMETRIA'`,
    );

    sniffer.assertZeroErrors();
  });

  // ===========================================================================
  // SUITE 2: PARÁMETROS DEL SISTEMA & CONFIGURACIÓN
  // ===========================================================================
  test('2. Parametrización del sistema, pestañas por módulo, CRUD dinámico y DB', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/parametros');
    await page.waitForLoadState('networkidle');

    // 1. Validar Título y KPIs
    await expect(page.locator('.page-title')).toContainText('Parámetros del Sistema');
    await expect(page.locator('.kpi-card')).toHaveCount(4);
    await expect(page.locator('.fut-table')).toBeVisible();

    // 2. Recorrer 100% de pestañas de módulos
    const tabs = page.locator('.module-tabs .tab-btn');
    const tabCount = await tabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(5);

    for (let i = 0; i < tabCount; i++) {
      await tabs.nth(i).click();
      await page.waitForTimeout(100);
      const rowsCount = await page.locator('.fut-table tbody tr').count();
      expect(rowsCount).toBeGreaterThanOrEqual(0);
    }
    // Volver a Todos
    await tabs.first().click();

    // 3. Edición en línea de un parámetro existente (ej. DIAS_TOLERANCIA_MORA)
    const moraRow = page.locator('tr', { hasText: 'DIAS_TOLERANCIA_MORA' }).first();
    await expect(moraRow).toBeVisible();

    const valInput = moraRow.locator('input[type="number"]');
    await valInput.fill('7');
    await valInput.dispatchEvent('input');
    await page.waitForTimeout(200);

    const saveBtn = moraRow.locator('.btn-save-inline');
    await expect(saveBtn).toBeVisible();
    await saveBtn.click();
    await page.waitForTimeout(500);

    // Verificar en DB
    const paramDb = await queryDb(
      `SELECT valor FROM core.parametros_sistema WHERE clave = 'DIAS_TOLERANCIA_MORA' AND club_id = '10000000-0000-0000-0000-000000000001'`,
    );
    expect(paramDb.length).toBe(1);
    expect(paramDb[0].valor).toBe('7');

    // 4. Modal Crear Nuevo Parámetro: Apertura, Validación, Creación y DB
    await page.locator('button', { hasText: 'Nuevo Parámetro' }).click();
    await expect(page.locator('.modal-card')).toBeVisible();
    await expect(page.locator('.modal-title')).toContainText('Registrar Nuevo Parámetro');

    // Llenar formulario
    const testKey = `TEST_PARAM_QA_${Date.now()}`;
    await page.locator('select[name="modulo"]').selectOption('DEPORTIVO');
    await page.locator('select[name="tipoValor"]').selectOption('STRING');
    await page.locator('input[name="clave"]').fill(testKey);
    await page.locator('input[name="titulo"]').fill('Parámetro Automatizado de Prueba E2E');
    await page.locator('input[name="valor"]').fill('ValorQA2026');
    await page.locator('textarea[name="descripcion"]').fill('Creado en prueba Playwright');

    // Guardar
    await page.locator('.modal-card button[type="submit"]').click();
    await page.waitForTimeout(600);
    await expect(page.locator('.modal-card')).not.toBeVisible();

    // Verificar creación en PostgreSQL
    const createdDb = await queryDb(
      `SELECT * FROM core.parametros_sistema WHERE clave = $1`,
      [testKey],
    );
    expect(createdDb.length).toBe(1);
    expect(createdDb[0].valor).toBe('ValorQA2026');

    // 5. Eliminar el parámetro de prueba creado
    const newParamRow = page.locator('tr', { hasText: testKey }).first();
    await expect(newParamRow).toBeVisible();
    await newParamRow.locator('.btn-icon-action.text-rose').click();

    await expect(page.locator('.modal-card')).toBeVisible();
    await expect(page.locator('.modal-title')).toContainText('Confirmar Eliminación');
    await page.locator('.modal-card .btn-danger').click();
    await page.waitForTimeout(600);

    // Verificar eliminación en PostgreSQL
    const deletedDb = await queryDb(
      `SELECT * FROM core.parametros_sistema WHERE clave = $1`,
      [testKey],
    );
    expect(deletedDb.length).toBe(0);

    sniffer.assertZeroErrors();
  });

  // ===========================================================================
  // SUITE 3: ROLES, PERFILES & PERMISOS RBAC
  // ===========================================================================
  test('3. Matriz RBAC de permisos por rol, asignación a usuarios, catálogo y DB', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/roles-permisos');
    await page.waitForLoadState('networkidle');

    // 1. Validar Título y Pestañas
    await expect(page.locator('.page-title')).toContainText('Roles, Perfiles & Permisos');
    await expect(page.locator('.main-tabs .tab-btn')).toHaveCount(3);

    // 2. TAB 1: Matriz de Permisos
    await expect(page.locator('.kpi-card')).toHaveCount(4);
    await expect(page.locator('.fut-table')).toBeVisible();

    // Cambiar de rol objetivo en el selector
    const roleSelect = page.locator('.select-role');
    await roleSelect.selectOption('ENTRENADOR_DT');
    await page.waitForTimeout(300);

    // Alternar switch de un permiso de la matriz (ej. CREAR_CONVOCATORIA)
    const permRow = page.locator('tr', { hasText: 'CREAR_CONVOCATORIA' }).first();
    await expect(permRow).toBeVisible();
    await permRow.scrollIntoViewIfNeeded();

    const permSwitch = permRow.locator('.switch-toggle');
    await permSwitch.click();
    await page.waitForTimeout(200);

    // Guardar permisos
    const saveMatrixBtn = page.locator('button', { hasText: 'Guardar Permisos' });
    await saveMatrixBtn.scrollIntoViewIfNeeded();
    await saveMatrixBtn.click();
    await page.waitForTimeout(600);
    await expect(page.locator('.toast-alert')).toBeVisible();

    // Verificar en PostgreSQL
    const permDb = await queryDb(
      `SELECT permitido FROM core.roles_permisos 
       WHERE rol = 'ENTRENADOR_DT' AND modulo = 'CONVOCATORIAS' AND accion = 'CREAR_CONVOCATORIA'
         AND club_id = '10000000-0000-0000-0000-000000000001'`,
    );
    expect(permDb.length).toBe(1);

    // Restaurar
    await queryDb(
      `UPDATE core.roles_permisos SET permitido = true, nivel_acceso = 'ALL' 
       WHERE rol = 'ENTRENADOR_DT' AND modulo = 'CONVOCATORIAS' AND accion = 'CREAR_CONVOCATORIA'
         AND club_id = '10000000-0000-0000-0000-000000000001'`,
    );

    // 3. TAB 2: Directorio de Usuarios & Asignación de Roles
    await page.locator('.main-tabs .tab-btn', { hasText: 'Usuarios & Asignación' }).click();
    await page.waitForTimeout(300);
    await expect(page.locator('.panel-title')).toContainText('Directorio de Usuarios de la Escuela');

    const userRows = page.locator('.users-tab-panel tbody tr');
    expect(await userRows.count()).toBeGreaterThan(0);

    // Cambiar rol a un usuario
    const firstUserRow = userRows.first();
    const userRoleSelect = firstUserRow.locator('select');
    await userRoleSelect.selectOption('DIRECTOR_DEPORTIVO');
    await page.waitForTimeout(200);

    const saveUserBtn = firstUserRow.locator('.btn-icon-action');
    await saveUserBtn.click();
    await page.waitForTimeout(500);

    // 4. TAB 3: Catálogo de Roles
    await page.locator('.main-tabs .tab-btn', { hasText: 'Catálogo de Roles' }).click();
    await expect(page.locator('.role-card')).toHaveCount(9);

    // Click en una tarjeta de rol para navegar a la matriz
    await page.locator('.role-card').nth(2).click();
    await expect(page.locator('.role-selector-row')).toBeVisible();

    sniffer.assertZeroErrors();
  });

  // ===========================================================================
  // SUITE 4: MODAL NUEVA ESCUELA CON BUSCADOR Y LISTA DESPLEGABLE DE CIUDAD SEDE
  // ===========================================================================
  test('4. Modal Nueva Escuela: Buscador interactivo y lista desplegable de Ciudad Sede', async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto('/modulos-escuela');
    await page.waitForLoadState('networkidle');

    // 1. Abrir Modal de Nueva Escuela
    const newSchoolBtn = page.locator('button', { hasText: 'Nueva Escuela' }).first();
    await expect(newSchoolBtn).toBeVisible();
    await newSchoolBtn.click();

    // 2. Verificar Modal visible
    const modal = page.locator('.modal-card.modal-lg');
    await expect(modal).toBeVisible();
    await expect(modal.locator('.modal-title')).toContainText('Registrar Nueva Escuela');

    // 3. Probar Buscador y Lista Desplegable de Ciudad Sede
    const cityInput = modal.locator('.city-input-field');
    await expect(cityInput).toBeVisible();

    // Abrir dropdown haciendo click en el botón desplegable
    const toggleBtn = modal.locator('.btn-toggle-dropdown');
    await toggleBtn.click();

    // Validar que el menú desplegable esté visible con opciones
    const dropdownMenu = modal.locator('.city-dropdown-menu');
    await expect(dropdownMenu).toBeVisible();

    await expect(dropdownMenu.locator('.city-option-item').first()).toBeVisible({ timeout: 5000 });
    const optionItems = dropdownMenu.locator('.city-option-item');
    expect(await optionItems.count()).toBeGreaterThan(5);

    // Escribir en el buscador interno del dropdown
    const searchInput = dropdownMenu.locator('.dropdown-search-input');
    await searchInput.fill('Cartagena');
    await page.waitForTimeout(200);

    const filteredItem = dropdownMenu.locator('.city-option-item', { hasText: 'Cartagena de Indias' }).first();
    await expect(filteredItem).toBeVisible();
    await filteredItem.click();

    // Validar que el input principal ahora tiene "Cartagena de Indias"
    await expect(cityInput).toHaveValue('Cartagena de Indias');
    await expect(dropdownMenu).not.toBeVisible();

    // Probar búsqueda directa por texto en el input principal
    await cityInput.fill('Bucaramanga');
    await page.waitForTimeout(200);
    await expect(dropdownMenu).toBeVisible();

    const bucaraOption = dropdownMenu.locator('.city-option-item', { hasText: 'Bucaramanga' }).first();
    await expect(bucaraOption).toBeVisible();
    await bucaraOption.click();
    await expect(cityInput).toHaveValue('Bucaramanga');

    // 4. Cerrar Modal
    const cancelBtn = modal.locator('button', { hasText: 'Cancelar' });
    await cancelBtn.click();
    await expect(modal).not.toBeVisible();

    sniffer.assertZeroErrors();
  });

});

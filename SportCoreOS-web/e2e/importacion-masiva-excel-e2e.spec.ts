import { test, expect } from '@playwright/test';

const API_BASE_URL = 'http://localhost:3001/api/v1';

test.describe('E2E: Importación Masiva Excel & Onboarding Dinámico de Alumnos y Familias', () => {
  let authToken = '';
  const testSuffix = Date.now().toString().slice(-6);

  const docAtletaMenor = `9100${testSuffix}`;
  const docAtletaMayor = `9200${testSuffix}`;
  const docAcudiente1 = `1010${testSuffix}`;
  const docAcudiente2 = `1020${testSuffix}`;
  const catNueva = `Sub-15 Importada ${testSuffix}`;

  test.beforeAll(async ({ request }) => {
    // 1. Obtener Token JWT oficial del Director Deportivo
    const loginRes = await request.post(`${API_BASE_URL}/auth/login`, {
      data: {
        email: 'carlos.valderrama@sportcore.com',
        password: 'sportcore2026',
      },
    });

    expect(loginRes.status()).toBe(200);
    const loginJson = await loginRes.json();
    authToken = loginJson.data?.accessToken || loginJson.accessToken;
    expect(authToken).toBeTruthy();
  });

  test('1. Backend: GET /api/v1/jugadores/plantilla-excel descarga plantilla binaria .xlsx oficial', async ({ request }) => {
    const res = await request.get(`${API_BASE_URL}/jugadores/plantilla-excel`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const body = await res.body();
    expect(body.length).toBeGreaterThan(5000);
  });

  test('2. Backend: POST /api/v1/jugadores/importar-masivo/preview valida reglas de negocio, edades y categorías', async ({ request }) => {
    const res = await request.post(`${API_BASE_URL}/jugadores/importar-masivo/preview`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        filas: [
          {
            nombres: 'Daniel',
            apellidos: 'Ruiz',
            tipo_documento: 'TI',
            numero_documento: docAtletaMenor,
            fecha_nacimiento: '2016-04-10', // 10 años (menor de 14)
            categoria: catNueva,
            posicion_principal: 'Extremo Izquierdo',
            numero_dorsal: 11,
            nombres_acudiente: 'Mario',
            apellidos_acudiente: 'Ruiz',
            documento_acudiente: docAcudiente1,
            email_acudiente: `mario_${testSuffix}@familia.com`,
          },
          {
            nombres: 'Yaser',
            apellidos: 'Asprilla',
            tipo_documento: 'TI',
            numero_documento: docAtletaMayor,
            fecha_nacimiento: '2009-11-20', // ~16-17 años (mayor de 14)
            categoria: catNueva,
            posicion_principal: 'Mediocampista Ofensivo',
            numero_dorsal: 10,
            nombres_acudiente: 'Gloria',
            apellidos_acudiente: 'Asprilla',
            documento_acudiente: docAcudiente2,
            email_acudiente: `gloria_${testSuffix}@familia.com`,
          },
        ],
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    const data = body.data;

    expect(data.totalFilas).toBe(2);
    expect(data.filasValidasCount).toBe(2);
    expect(data.filasConErrorCount).toBe(0);
    expect(data.nuevasCategorias).toContain(catNueva);

    // Regla de negocio de cuentas:
    // Daniel (10 años): crearUsuarioJugador === false
    // Yaser (16 años): crearUsuarioJugador === true
    expect(data.estimadoUsuariosJugador).toBe(1);
    expect(data.estimadoUsuariosAcudiente).toBe(2);

    const fila1 = data.detalle.find((d: any) => d.numeroDocumento === docAtletaMenor);
    expect(fila1.crearUsuarioJugador).toBe(false);
    expect(fila1.tieneAcudiente).toBe(true);
    expect(fila1.esNuevaCategoria).toBe(true);

    const fila2 = data.detalle.find((d: any) => d.numeroDocumento === docAtletaMayor);
    expect(fila2.crearUsuarioJugador).toBe(true);
    expect(fila2.tieneAcudiente).toBe(true);
  });

  test('3. Backend: POST /api/v1/jugadores/importar-masivo/ejecutar realiza ingesta atómica y genera credenciales', async ({ request }) => {
    const res = await request.post(`${API_BASE_URL}/jugadores/importar-masivo/ejecutar`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      data: {
        filas: [
          {
            nombres: 'Daniel',
            apellidos: 'Ruiz',
            tipo_documento: 'TI',
            numero_documento: docAtletaMenor,
            fecha_nacimiento: '2016-04-10',
            categoria: catNueva,
            posicion_principal: 'Extremo Izquierdo',
            numero_dorsal: 11,
            nombres_acudiente: 'Mario',
            apellidos_acudiente: 'Ruiz',
            documento_acudiente: docAcudiente1,
            email_acudiente: `mario_${testSuffix}@familia.com`,
          },
          {
            nombres: 'Yaser',
            apellidos: 'Asprilla',
            tipo_documento: 'TI',
            numero_documento: docAtletaMayor,
            fecha_nacimiento: '2009-11-20',
            categoria: catNueva,
            posicion_principal: 'Mediocampista Ofensivo',
            numero_dorsal: 10,
            nombres_acudiente: 'Gloria',
            apellidos_acudiente: 'Asprilla',
            documento_acudiente: docAcudiente2,
            email_acudiente: `gloria_${testSuffix}@familia.com`,
          },
        ],
      },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    const data = body.data;

    expect(data.resumen.totalProcesados).toBe(2);
    expect(data.resumen.jugadoresCreados).toBe(2);
    expect(data.resumen.categoriasCreadas).toBeGreaterThanOrEqual(1);
    expect(data.resumen.acudientesCreados).toBe(2);
    expect(data.resumen.cuentasCreadasTotal).toBe(3); // 2 acudientes + 1 atleta >= 14

    // Validar estructura de credenciales generadas
    const credPadre1 = data.credencialesGeneradas.find((c: any) => c.documento === docAcudiente1);
    expect(credPadre1).toBeTruthy();
    expect(credPadre1.tipo).toBe('PADRE_ACUDIENTE');
    expect(credPadre1.passwordPlano).toBe(`Familia${docAcudiente1}`);

    const credAtleta = data.credencialesGeneradas.find((c: any) => c.documento === docAtletaMayor);
    expect(credAtleta).toBeTruthy();
    expect(credAtleta.tipo).toBe('JUGADOR');
    expect(credAtleta.passwordPlano).toBe(`Atleta${docAtletaMayor}`);
  });

  test('4. Frontend UI: El botón de Importación Masiva Excel abre el modal interactivo con stepper y controles', async ({ page }) => {
    // Iniciar sesión en el portal Web
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Click en perfil demo Carlos Valderrama
    const demoDirBtn = page.locator('.persona-btn', { hasText: 'Carlos Valderrama' }).first();
    await expect(demoDirBtn).toBeVisible({ timeout: 10000 });
    await demoDirBtn.click({ force: true });

    // Esperar redirección al dashboard
    await page.waitForURL('**/dashboard', { timeout: 15000 });

    // Navegar al módulo de Jugadores
    await page.goto('/jugadores');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.page-title')).toContainText('Directorio de Jugadores', { timeout: 15000 });

    // Verificar que existe el botón de Importación Masiva Excel en el header
    const importBtn = page.locator('.luxury-import-btn');
    await expect(importBtn).toBeVisible();
    await expect(importBtn).toContainText('Importación Masiva Excel');

    // Hacer clic en el botón de Importación Masiva Excel
    await importBtn.click();

    // Verificar que el modal interactivo se despliega
    const modal = page.locator('.import-modal-container');
    await expect(modal).toBeVisible();

    // Verificar elementos del Stepper y controles del Paso 1
    await expect(modal.locator('.modal-title')).toContainText('Importación Masiva de Jugadores & Familias');
    await expect(modal.locator('.step-item.active')).toContainText('Carga de Archivo');
    await expect(modal.locator('.btn-download-template')).toBeVisible();
    await expect(modal.locator('.drop-zone')).toBeVisible();
    await expect(modal.locator('.business-rules-grid')).toBeVisible();

    // Cerrar modal
    await modal.locator('.close-btn').click();
    await expect(modal).not.toBeVisible();
  });
});

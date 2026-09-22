# Estándar Institucional de Pruebas E2E Exhaustivas (Anti-Regression Framework)

Este estándar es de obligatorio cumplimiento para el desarrollo, refactorización y prueba de cualquier módulo en cualquier aplicación del ecosistema (`EduCoreOS`, `ContaCoreOS`, `POSCoreOS`, `ConjuntOS`, etc.).

---

## 1. Principio Fundamental: Cero "Smoke Tests" Superficiales

Un test que solo verifica si la página carga o si un título está visible **NO es suficiente**.
Cada vista del sistema contiene botones de acción, filtros, modales y flujos transaccionales. Si el test automatizado no ejercita cada uno de estos elementos, el usuario o desarrollador tendrá que probarlos manualmente, causando retrasos críticos.

---

## 2. Regla de Oro: Escuchador Estricto de Errores (Error Sniffer)

Toda prueba E2E debe registrar un *Error Sniffer* antes de interactuar con la interfaz. La prueba **debe fallar automáticamente** si ocurre cualquiera de los siguientes eventos:
1. **Excepción JavaScript no controlada** en el navegador (`page.on('pageerror')`).
2. **Error en consola** (`console.error`), como errores de Signals en Angular, propiedades `undefined`, fallos de inyección de dependencias.
3. **Fallo HTTP en API** (`response.status() >= 400`) para peticiones operativas no esperadas.

### Implementación Reutilizable (Playwright)
```typescript
import { Page, expect } from '@playwright/test';

export function attachStrictErrorSniffer(page: Page) {
  const errors: string[] = [];

  page.on('pageerror', (err) => {
    errors.push(`[JS Exception] ${err.message}`);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`[Console Error] ${msg.text()}`);
    }
  });

  page.on('response', (response) => {
    if (response.status() >= 400 && !response.url().includes('/auth/refresh') && !response.url().includes('/favicon.ico')) {
      errors.push(`[HTTP ${response.status()}] ${response.request().method()} en ${response.url()}`);
    }
  });

  return {
    assertZeroErrors: () => {
      expect(errors, `Se detectaron errores en la vista:\n${errors.join('\n')}`).toEqual([]);
    },
    getErrors: () => errors,
    clear: () => { errors.length = 0; }
  };
}
```

---

## 3. Matriz Obligatoria de Interacciones por Vista

Antes de dar un módulo por probado, el desarrollador o agente de IA debe extraer el **Inventario de Interacción** y garantizar que la suite E2E cubra cada grupo:

```
[ Vista / Componente ]
 ├── 1. Cabecera (Header Actions): Botones de configuración, exportación, creación (+ Nuevo).
 ├── 2. Filtros y Búsqueda: Selects de estado, filtros por fecha, inputs de texto, paginación.
 ├── 3. Pestañas (Tabs): Navegación entre todas las pestañas comprobando carga de sub-vistas.
 ├── 4. Acciones de Fila (Row Actions): Cada botón en la primera fila de datos (Ver, Editar, Pagar, Anular, PDF).
 ├── 5. Ciclo de Vida de Modales (Modal Lifecycle):
 │      ├── Disparar apertura
 │      ├── Validar renderizado
 │      ├── Probar cancelación / cierre sin error
 │      └── Llenar formulario y enviar (Happy Path)
 └── 6. Persistencia en Base de Datos: Verificación SQL de que los datos cambiaron en PostgreSQL.
```

---

## 4. Las 5 Suites Obligatorias en cada archivo `.spec.ts`

### Suite 1: Carga, KPIs y Sniffer
```typescript
test('1. Carga inicial, KPIs y ausencia de excepciones en consola', async ({ page }) => {
  const sniffer = attachStrictErrorSniffer(page);
  await page.goto('/modulo-ruta');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('h1')).toBeVisible();
  // Validar KPIs / tarjetas informativas
  sniffer.assertZeroErrors();
});
```

### Suite 2: Navegación de Pestañas y Filtros
```typescript
test('2. Navegación por el 100% de pestañas y aplicación de filtros', async ({ page }) => {
  const sniffer = attachStrictErrorSniffer(page);
  await page.goto('/modulo-ruta');
  await page.waitForLoadState('networkidle');

  // Iterar todas las pestañas
  const tabButtons = page.locator('.tabs-nav-bar button, .tab-btn');
  const count = await tabButtons.count();
  for (let i = 0; i < count; i++) {
    await tabButtons.nth(i).click();
    await page.waitForTimeout(200);
  }

  // Probar buscador y selectores
  const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"]').first();
  if (await searchInput.isVisible()) {
    await searchInput.fill('Prueba');
    await page.waitForTimeout(300);
    await searchInput.clear();
  }

  sniffer.assertZeroErrors();
});
```

### Suite 3: Barrido de Botones en Filas de Tablas (Row Action Sweep)
```typescript
test('3. Barrido de todos los botones de acción en filas de datos', async ({ page }) => {
  const sniffer = attachStrictErrorSniffer(page);
  await page.goto('/modulo-ruta');
  await page.waitForLoadState('networkidle');

  const primeraFila = page.locator('table tbody tr').first();
  if (await primeraFila.isVisible()) {
    const actionButtons = primeraFila.locator('button');
    const btnCount = await actionButtons.count();

    for (let i = 0; i < btnCount; i++) {
      const btn = actionButtons.nth(i);
      const text = (await btn.innerText() || await btn.getAttribute('title') || '').trim();
      
      // No disparar botones destructivos directos sin confirmación en el barrido básico
      if (!text.toLowerCase().includes('eliminar') && !text.toLowerCase().includes('borrar')) {
        await btn.click();
        await page.waitForTimeout(300);
        
        // Si abrió un modal, cerrarlo inmediatamente
        const modal = page.locator('.modal-open, .modal.active, app-modal, dialog[open]').first();
        if (await modal.isVisible()) {
          const closeBtn = modal.locator('button:has-text("Cancelar"), .close-btn, button:has-text("Cerrar")').first();
          if (await closeBtn.isVisible()) {
            await closeBtn.click();
          }
        }
      }
    }
  }

  sniffer.assertZeroErrors();
});
```

### Suite 4: Ciclo de Vida de Modales (Apertura, Validación y Cierre)
```typescript
test('4. Apertura y cierre de cada modal del módulo sin excepciones', async ({ page }) => {
  const sniffer = attachStrictErrorSniffer(page);
  await page.goto('/modulo-ruta');
  await page.waitForLoadState('networkidle');

  // Para cada botón que dispara un modal (ej. "+ Nuevo Registro")
  const btnNuevo = page.locator('button:has-text("Nuevo"), button:has-text("Crear")').first();
  if (await btnNuevo.isVisible()) {
    await btnNuevo.click();
    
    // Verificar que el modal abra
    const modal = page.locator('.modal-card, dialog[open], .modal-box').first();
    await expect(modal).toBeVisible();

    // Probar botón de cancelar / cerrar
    const btnCancelar = modal.locator('button:has-text("Cancelar"), .close-btn').first();
    await btnCancelar.click();
    await expect(modal).not.toBeVisible();
  }

  sniffer.assertZeroErrors();
});
```

### Suite 5: Transacción Completa y Verificación en Base de Datos (PostgreSQL)
```typescript
test('5. Creación/Edición con persistencia comprobada en PostgreSQL', async ({ page }) => {
  const sniffer = attachStrictErrorSniffer(page);
  await page.goto('/modulo-ruta');
  await page.waitForLoadState('networkidle');

  // Realizar la acción de negocio completa...
  // (Ej. registrar pago, crear factura, guardar acuerdo)

  // Validar feedback al usuario
  await expect(page.locator('.toast-card, .toast-success')).toBeVisible({ timeout: 5000 });

  // Validar persistencia directa en DB
  const dbRecord = await queryDb('SELECT * FROM mi_tabla WHERE id = $1', [testId]);
  expect(dbRecord.length).toBe(1);

  sniffer.assertZeroErrors();
});
```

---

## 5. Checklist de Entrega (Definition of Done)

Ningún módulo o funcionalidad se da por finalizada si no cumple la siguiente lista:
- [ ] Se ejecutó `attachStrictErrorSniffer` y no hubo ningún `JS Exception` ni `console.error`.
- [ ] No hubo peticiones HTTP a la API con status `400`, `404` o `500`.
- [ ] Se clickearon y validaron todos los botones de la vista principal y de las filas de datos.
- [ ] Todos los modales del componente fueron abiertos y cerrados limpiamente.
- [ ] Se verificó la mutación final en PostgreSQL mediante consulta directa de BD.

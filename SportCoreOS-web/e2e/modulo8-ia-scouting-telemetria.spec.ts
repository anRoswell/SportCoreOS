import { test, expect } from "@playwright/test";
import { attachStrictErrorSniffer } from "./helpers/error-sniffer";
import { queryDb } from "./helpers/db-helper";
import * as path from "path";
import * as fs from "fs";

test.describe("MÓDULOS 10, 11 & 12: SPORTCORE AI, SCOUTING & TELEMETRÍA GPS - E2E EXHAUSTIVO", () => {

  test.beforeEach(async ({ page }) => {
    // Autenticación inicial con Director Deportivo (Carlos Valderrama)
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");

    const demoDirBtn = page.locator(".persona-btn", { hasText: "Carlos Valderrama" }).first();
    await expect(demoDirBtn).toBeVisible({ timeout: 15000 });
    await demoDirBtn.click();
    await page.waitForURL("**/dashboard", { timeout: 20000 });
    await page.waitForLoadState("networkidle");
  });

  // ===========================================================================
  // SUITE 1: MÓDULO 10 - SPORTCORE AI (COPILOTO TÁCTICO, BOLETINES & FATIGA)
  // ===========================================================================
  test("1. Módulo 10: Copiloto Táctico Gemini, Generador de Boletines & Semáforo ACWR", async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);

    await page.goto("/ia");
    await page.waitForLoadState("networkidle");

    // Validar encabezado principal
    await expect(page.locator(".page-title")).toContainText("SportCore AI");
    await expect(page.locator(".page-subtitle")).toBeVisible();

    // 1.1 TAB 1: COPILOTO TÁCTICO GEMINI
    const tabChat = page.locator(".filter-tabs .tab-btn", { hasText: "Copiloto Táctico" });
    await expect(tabChat).toBeVisible();
    await tabChat.click();

    // Validar chips de sugerencias rápidas
    const quickChips = page.locator(".quick-chip");
    expect(await quickChips.count()).toBeGreaterThanOrEqual(3);
    await quickChips.first().click();
    await page.waitForTimeout(600);

    // Enviar consulta personalizada con cambio de esquema táctico
    const tacticalSelect = page.locator(".tactical-select select");
    await tacticalSelect.selectOption("3-5-2");

    const chatInput = page.locator("input.chat-text-input");
    await chatInput.fill("¿Cómo presionar alto con carrileros adelantados frente a un 4-3-3?");

    const btnSend = page.locator(".btn-send");
    await expect(btnSend).toBeEnabled();
    await btnSend.click();
    await page.waitForTimeout(800);

    const messageBubbles = page.locator(".chat-message-bubble");
    expect(await messageBubbles.count()).toBeGreaterThanOrEqual(2);

    // 1.2 TAB 2: GENERADOR DE BOLETINES FORMATIVOS
    const tabBoletin = page.locator(".filter-tabs .tab-btn", { hasText: "Generador de Boletines" });
    await tabBoletin.click();

    await expect(page.locator(".generator-card")).toBeVisible();
    
    // Seleccionar alumno usando el nuevo app-player-selector
    const playerSelector = page.locator("app-player-selector").first();
    await expect(playerSelector).toBeVisible();
    await playerSelector.locator(".empty-trigger-box, .selected-player-box").click();
    await page.waitForTimeout(300);

    const firstPlayerOption = page.locator(".player-option-item").first();
    if (await firstPlayerOption.isVisible()) {
      await firstPlayerOption.click();
      await page.waitForTimeout(300);
    }

    const selectPeriodo = page.locator("select[name=\"mesPeriodo\"]");
    await selectPeriodo.selectOption("Marzo 2026");

    const textObs = page.locator("textarea[name=\"observacionesDt\"]");
    await textObs.fill("E2E Test: Gran desenvolvimiento técnico, excelente visión de juego y compañerismo.");

    const btnGenerarBoletin = page.locator("button[type=\"submit\"]", { hasText: "Redactar Boletín" });
    await btnGenerarBoletin.click();
    await page.waitForTimeout(800);

    // Validar hoja de previsualización del boletín
    const boletinSheet = page.locator(".boletin-sheet");
    await expect(boletinSheet).toBeVisible();
    await expect(page.locator(".sheet-badge")).toContainText("BOLETÍN OFICIAL");

    // Botones de acción del boletín (Copiar texto)
    const btnCopiar = page.locator("button", { hasText: "Copiar Texto" });
    await expect(btnCopiar).toBeVisible();
    await btnCopiar.click();
    await page.waitForTimeout(300);

    // 1.3 TAB 3: PREVENCIÓN DE FATIGA & ACWR
    const tabFatiga = page.locator(".filter-tabs .tab-btn", { hasText: "Prevención de Fatiga" });
    await tabFatiga.click();

    await expect(page.locator(".fatiga-container")).toBeVisible();
    await expect(page.locator(".acwr-gauge-card")).toBeVisible();
    await expect(page.locator(".minutes-recommendation-card")).toBeVisible();
    await expect(page.locator(".ai-diagnosis-card")).toBeVisible();

    // Cambiar de jugador en el semáforo
    const selectFatigaJugador = page.locator(".player-select-wrap select");
    if (await selectFatigaJugador.isVisible()) {
      const fatigaOpts = await selectFatigaJugador.locator("option").all();
      if (fatigaOpts.length > 1) {
        await selectFatigaJugador.selectOption({ index: fatigaOpts.length - 1 });
        await page.waitForTimeout(500);
      }
    }

    sniffer.assertZeroErrors();
  });

  // ===========================================================================
  // SUITE 2: MÓDULO 11 - SCOUTING, VISORÍA & CAPTACIÓN DE TALENTOS
  // ===========================================================================
  test("2. Módulo 11: Pipeline Kanban, registro de prospecto con documento, rúbricas 1-10 y eliminación", async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);
    const uniqueProspectoName = `Mateo E2E ${Date.now()}`;
    const uniqueLastName = "Gómez Visoría";

    await page.goto("/scouting");
    await page.waitForLoadState("networkidle");

    // Validar encabezado y KPIs
    await expect(page.locator(".page-title")).toContainText("Scouting");
    const kpiCards = page.locator(".kpi-card");
    await expect(kpiCards).toHaveCount(4);

    // 2.1 Conmutar entre Tablero Kanban y Directorio en Tabla
    const tabLista = page.locator(".view-mode-tabs .tab-btn", { hasText: "Directorio Completo" });
    await tabLista.click();
    await expect(page.locator(".directorio-section")).toBeVisible();

    const tabPipeline = page.locator(".view-mode-tabs .tab-btn", { hasText: "Tablero Pipeline" });
    await tabPipeline.click();
    await expect(page.locator(".kanban-board-grid")).toBeVisible();

    // 2.2 Probar filtros de búsqueda y posición
    const searchInput = page.locator(".search-input-wrap input");
    await searchInput.fill("Medellín");
    await page.waitForTimeout(300);

    const selectPosicion = page.locator(".filter-controls-row select").first();
    await selectPosicion.selectOption("delantero");
    await page.waitForTimeout(300);

    const btnLimpiar = page.locator("button", { hasText: "Limpiar" });
    await btnLimpiar.click();
    await page.waitForTimeout(300);

    // 2.3 Abrir Modal de Registro de Prospecto y Adjuntar Documento
    const btnRegistrar = page.locator("button", { hasText: "Registrar Prospecto" });
    await btnRegistrar.click();

    const modalCreate = page.locator(".modal-card.modal-lg");
    await expect(modalCreate).toBeVisible();

    // Llenar formulario
    await modalCreate.locator("input[name=\"pNombres\"]").fill(uniqueProspectoName);
    await modalCreate.locator("input[name=\"pApellidos\"]").fill(uniqueLastName);
    await modalCreate.locator("input[name=\"pFechaNac\"]").fill("2010-06-15");
    await modalCreate.locator("input[name=\"pCiudad\"]").fill("Cali, Valle");
    await modalCreate.locator("input[name=\"pTel\"]").fill("+57 311 888 9900");
    await modalCreate.locator("select[name=\"pPos\"]").selectOption("delantero");
    await modalCreate.locator("select[name=\"pPierna\"]").selectOption("Derecha");
    await modalCreate.locator("input[name=\"pClubOrig\"]").fill("Academia Cali Stars");

    // Adjuntar archivo dummy de visoría
    const tempFilePath = path.join(__dirname, `dummy_scouting_${Date.now()}.pdf`);
    fs.writeFileSync(tempFilePath, "%PDF-1.4 dummy scouting report for e2e test");
    const fileInput = modalCreate.locator("input[type=\"file\"]");
    await fileInput.setInputFiles(tempFilePath);

    // Guardar prospecto
    const btnSubmitProspecto = modalCreate.locator("button[type=\"submit\"]", { hasText: "Guardar Prospecto" });
    await btnSubmitProspecto.click();
    await page.waitForTimeout(800);

    // Limpiar archivo temporal
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);

    // Verificar en Base de Datos PostgreSQL
    const prospectosDb = await queryDb(
      `SELECT * FROM deportivo.prospectos_scouting WHERE nombres_apellidos ILIKE $1 ORDER BY created_at DESC LIMIT 1`,
      [`%${uniqueProspectoName}%`]
    );
    expect(prospectosDb.length).toBe(1);
    const prospectoId = prospectosDb[0].id;
    expect(prospectosDb[0].posicion_principal).toBe("delantero");

    // 2.4 Abrir Expediente del Prospecto y Registrar Rúbrica Técnica 1-10
    await page.locator(".view-mode-tabs .tab-btn", { hasText: "Directorio Completo" }).click();
    await searchInput.fill(uniqueProspectoName);
    await page.waitForTimeout(400);

    const rowProspecto = page.locator("tbody tr", { hasText: uniqueProspectoName }).first();
    await expect(rowProspecto).toBeVisible();

    // Abrir Modal de Rúbrica desde botón estrella
    const btnRubrica = rowProspecto.locator("button[title=\"Añadir Evaluación\"]");
    await btnRubrica.click();

    const modalRubrica = page.locator(".modal-card.modal-md");
    await expect(modalRubrica).toBeVisible();

    // Llenar notas de los 4 pilares
    await modalRubrica.locator("input[name=\"nTec\"]").fill("9.5");
    await modalRubrica.locator("input[name=\"nTac\"]").fill("8.8");
    await modalRubrica.locator("input[name=\"nFis\"]").fill("9.0");
    await modalRubrica.locator("input[name=\"nMen\"]").fill("9.2");
    await modalRubrica.locator("textarea[name=\"nCom\"]").fill("Desequilibrio individual sobresaliente y excelente toma de decisiones.");

    const btnSubmitRubrica = modalRubrica.locator("button[type=\"submit\"]", { hasText: "Registrar Evaluación" });
    await btnSubmitRubrica.click();
    await page.waitForTimeout(800);

    // Verificar persistencia de la evaluación en PostgreSQL
    const evaluacionesDb = await queryDb(
      `SELECT * FROM deportivo.evaluaciones_scouting WHERE prospecto_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [prospectoId]
    );
    expect(evaluacionesDb.length).toBe(1);
    expect(Number(evaluacionesDb[0].score_tecnico)).toBe(9.5);

    // 2.5 Abrir Expediente Completo y Cambiar Estado en Pipeline
    const freshRow = page.locator("tbody tr", { hasText: uniqueProspectoName }).first();
    await expect(freshRow).toBeVisible();
    const btnVerExpediente = freshRow.locator("button[title=\"Ver Ficha y Rúbricas\"]");
    await btnVerExpediente.click();

    const modalExpediente = page.locator(".modal-card.modal-lg");
    await expect(modalExpediente).toBeVisible();
    await expect(modalExpediente.locator(".rubricas-radar-grid")).toBeVisible();

    // Cambiar a Interés de Fichaje
    const btnInteres = modalExpediente.locator("button", { hasText: "Interés de Fichaje" });
    await btnInteres.click();
    await page.waitForTimeout(600);

    // Cerrar modal
    const btnCerrarExpediente = modalExpediente.locator("button", { hasText: "Cerrar" });
    await btnCerrarExpediente.click();
    await page.waitForTimeout(300);

    // 2.6 Eliminar Prospecto con Modal Profesional
    const rowToDelete = page.locator("tbody tr", { hasText: uniqueProspectoName }).first();
    await rowToDelete.locator("button[title=\"Eliminar Prospecto\"]").click();
    const modalDelete = page.locator(".delete-confirm-modal-card");
    await expect(modalDelete).toBeVisible();

    // Probar cancelar primero
    await modalDelete.locator("button", { hasText: "Cancelar" }).click();
    await expect(modalDelete).not.toBeVisible();

    // Reabrir y confirmar eliminación
    const rowToDeleteAgain = page.locator("tbody tr", { hasText: uniqueProspectoName }).first();
    await rowToDeleteAgain.locator("button[title=\"Eliminar Prospecto\"]").click();
    await expect(modalDelete).toBeVisible();
    const btnConfirmDelete = modalDelete.locator("button.btn-confirm-delete");
    await btnConfirmDelete.click();
    await page.waitForTimeout(800);

    // Verificar eliminación en PostgreSQL
    const checkDeletedDb = await queryDb(
      `SELECT * FROM deportivo.prospectos_scouting WHERE id = $1`,
      [prospectoId]
    );
    expect(checkDeletedDb.length).toBe(0);

    sniffer.assertZeroErrors();
  });

  // ===========================================================================
  // SUITE 3: MÓDULO 12 - TELEMETRÍA GPS, HEATMAPS & CARGA FÍSICA
  // ===========================================================================
  test("3. Módulo 12: Ingesta de Sesión GPS con archivo sensor, renderizado de Heatmap 2D y métricas cinemáticas", async ({ page }) => {
    const sniffer = attachStrictErrorSniffer(page);
    const uniqueSessionName = `Sesión GPS E2E ${Date.now()}`;

    await page.goto("/telemetria");
    await page.waitForLoadState("networkidle");

    // Validar encabezado y KPIs cinemáticos
    await expect(page.locator(".page-title")).toContainText("Telemetría GPS");
    const kpiCards = page.locator(".kpi-card");
    await expect(kpiCards).toHaveCount(4);

    // Validar cancha 2D y leyenda
    const soccerPitch = page.locator(".soccer-pitch");
    await expect(soccerPitch).toBeVisible();
    await expect(page.locator(".pitch-legend")).toBeVisible();

    // 3.1 Probar cambio de jugador en Heatmap 2D
    const heatSpots = page.locator(".heat-spot");
    expect(await heatSpots.count()).toBeGreaterThanOrEqual(1);

    const playerHeatSelect = page.locator(".player-heat-select select");
    if (await playerHeatSelect.isVisible()) {
      const heatOpts = await playerHeatSelect.locator("option").all();
      if (heatOpts.length > 1) {
        await playerHeatSelect.selectOption({ index: 1 });
        await page.waitForTimeout(400);
      }
    }

    // 3.2 Crear Nueva Sesión GPS con Ingesta de Archivo Wearable
    const btnNuevaSesion = page.locator("button", { hasText: "Ingesta Sesión GPS" });
    await btnNuevaSesion.click();

    const modalSesion = page.locator(".modal-card.modal-lg");
    await expect(modalSesion).toBeVisible();

    await modalSesion.locator("input[name=\"sNombre\"]").fill(uniqueSessionName);
    await modalSesion.locator("select[name=\"sTipo\"]").selectOption("partido");
    await modalSesion.locator("input[name=\"sFecha\"]").fill("2026-03-22");
    await modalSesion.locator("input[name=\"sDur\"]").fill("90");
    await modalSesion.locator("input[name=\"sClima\"]").fill("26°C Soleado");

    // Adjuntar archivo sensor dummy (.gpx)
    const tempGpsPath = path.join(__dirname, `dummy_track_${Date.now()}.gpx`);
    fs.writeFileSync(tempGpsPath, "<gpx version=\"1.1\"><trk><trkseg><trkpt lat=\"4.6097\" lon=\"-74.0817\"></trkpt></trkseg></trk></gpx>");
    const fileInputGps = modalSesion.locator("input[type=\"file\"]");
    await fileInputGps.setInputFiles(tempGpsPath);

    const btnSubmitSesion = modalSesion.locator("button[type=\"submit\"]", { hasText: "Guardar e Ingerir" });
    await btnSubmitSesion.click();
    await page.waitForTimeout(800);

    if (fs.existsSync(tempGpsPath)) fs.unlinkSync(tempGpsPath);

    // Verificar persistencia de la sesión en PostgreSQL
    const sesionesDb = await queryDb(
      `SELECT * FROM deportivo.sesiones_gps ORDER BY created_at DESC LIMIT 1`
    );
    expect(sesionesDb.length).toBe(1);
    const sesionId = sesionesDb[0].id;
    expect(sesionesDb[0].dispositivo_marca).toBe("CATAPULT_10HZ");

    // Seleccionar explícitamente la sesión recién creada en la lista lateral si está visible
    const sesionCard = page.locator(".sesion-item-card", { hasText: uniqueSessionName }).first();
    if (await sesionCard.isVisible()) {
      await sesionCard.click();
      await page.waitForTimeout(400);
    }

    // 3.3 Registrar Métrica Cinemática Individual
    const btnAddMetrica = page.locator("button", { hasText: "Ingesta Métrica" });
    await btnAddMetrica.click();

    const modalMetrica = page.locator(".modal-card.modal-md");
    await expect(modalMetrica).toBeVisible();

    const selectMetricaJugador = modalMetrica.locator("select[name=\"mJugador\"]");
    const jugadorOpts = await selectMetricaJugador.locator("option").all();
    if (jugadorOpts.length > 1) {
      await selectMetricaJugador.selectOption({ index: 1 });
    }

    await modalMetrica.locator("input[name=\"mDist\"]").fill("10.5");
    await modalMetrica.locator("input[name=\"mVel\"]").fill("33.8");
    await modalMetrica.locator("input[name=\"mSpr\"]").fill("28");
    await modalMetrica.locator("input[name=\"mLoad\"]").fill("620");

    const btnSubmitMetrica = modalMetrica.locator("button[type=\"submit\"]", { hasText: "Guardar Métrica" });
    await btnSubmitMetrica.click();
    await page.waitForTimeout(800);

    // Verificar persistencia de la métrica cinemática en PostgreSQL
    const metricasDb = await queryDb(
      `SELECT * FROM deportivo.metricas_rendimiento_gps WHERE sesion_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [sesionId]
    );
    expect(metricasDb.length).toBe(1);
    expect(Number(metricasDb[0].velocidad_max_kmh)).toBe(33.8);

    // 3.4 Probar botón "Heatmap" en la tabla cinemática
    const btnHeatmapRow = page.locator(".fut-table button", { hasText: "Heatmap" }).first();
    if (await btnHeatmapRow.isVisible()) {
      await btnHeatmapRow.click();
      await page.waitForTimeout(400);
      expect(await page.locator(".heat-spot").count()).toBeGreaterThanOrEqual(1);
    }

    sniffer.assertZeroErrors();
  });
});

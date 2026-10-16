import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { SKILL_DIR, TMP_DIR, RUNTIME_PYTHON } = process.env;
if (![SKILL_DIR, TMP_DIR, RUNTIME_PYTHON].every((value) => path.isAbsolute(value ?? ""))) {
  throw new Error("Set absolute SKILL_DIR, TMP_DIR and RUNTIME_PYTHON paths");
}

const { resolvePresentationFont, finalizePresentation } = await import(
  pathToFileURL(path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs")).href,
);

const FINAL_PPTX = path.join(ROOT, "output/presentation/PRESENTACION_COMERCIAL_SPORTCOREOS_SIN_RANKING_v3.pptx");
const ASSETS = path.join(ROOT, "marketing/assets/screenshots");
const fontFamily = resolvePresentationFont();
const C = {
  navy: "#0B1220",
  ink: "#172338",
  paper: "#F5F8FA",
  white: "#FFFFFF",
  green: "#00A979",
  deepGreen: "#047857",
  mint: "#DDF7EE",
  cyan: "#0EA5B7",
  amber: "#F2A93B",
  muted: "#64748B",
  line: "#D7E1E8",
  paleBlue: "#EAF2F7",
};

const pptx = Presentation.create({ slideSize: { width: 1280, height: 720 } });

function rect(slide, x, y, w, h, fill, radius = false, lineFill = "none") {
  return slide.shapes.add({
    geometry: radius ? "roundRect" : "rect",
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { fill: lineFill, width: lineFill === "none" ? 0 : 1 },
  });
}

function text(slide, value, x, y, w, h, opts = {}) {
  const shape = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { fill: "none", width: 0 },
  });
  shape.text = value;
  shape.text.style = {
    typeface: fontFamily,
    fontSize: opts.size ?? 22,
    bold: opts.bold ?? false,
    color: opts.color ?? C.ink,
    alignment: opts.align ?? "left",
    verticalAlignment: opts.valign ?? "middle",
    autoFit: "none",
    wrap: true,
  };
  return shape;
}

function base(title, eyebrow, page, dark = false) {
  const slide = pptx.slides.add();
  slide.background.fill = dark ? C.navy : C.paper;
  const primary = dark ? C.white : C.ink;
  const secondary = dark ? "#C2D0DE" : C.muted;
  text(slide, eyebrow.toUpperCase(), 68, 29, 700, 24, {
    size: 13, bold: true, color: dark ? "#57D8B2" : C.deepGreen,
  });
  text(slide, title, 68, 59, 1110, 68, { size: 36, bold: true, color: primary });
  rect(slide, 68, 137, 58, 4, C.green);
  text(slide, "SportCoreOS  ·  Gestión deportiva y administrativa", 68, 680, 740, 20, {
    size: 12, color: secondary,
  });
  text(slide, String(page).padStart(2, "0"), 1155, 680, 56, 20, {
    size: 12, color: secondary, align: "right",
  });
  return slide;
}

async function addImage(slide, relativePath, x, y, w, h, alt, crop = undefined) {
  const fullPath = path.join(ASSETS, relativePath);
  const blob = new Uint8Array(await fs.readFile(fullPath));
  slide.images.add({
    blob,
    contentType: "image/png",
    alt,
    fit: "contain",
    position: { left: x, top: y, width: w, height: h },
    ...(crop ? { crop } : {}),
  });
}

function chip(slide, label, x, y, w, opts = {}) {
  const fill = opts.fill ?? C.mint;
  rect(slide, x, y, w, opts.h ?? 28, fill, true);
  text(slide, label, x + 10, y + 2, w - 20, (opts.h ?? 28) - 4, {
    size: opts.size ?? 12, bold: true, color: opts.color ?? C.deepGreen, align: opts.align ?? "center",
  });
}

function notes(slide, value) {
  slide.speakerNotes.textFrame.setText(value);
}

// 1. Cover: product promise plus an editable operating-model diagram.
{
  const slide = pptx.slides.add();
  slide.background.fill = C.navy;
  rect(slide, 0, 0, 14, 720, C.green);
  const logo = new Uint8Array(await fs.readFile(path.join(ROOT, "branding/sportcore_logo.jpg")));
  slide.images.add({
    blob: logo,
    contentType: "image/jpeg",
    alt: "Logotipo SportCoreOS",
    fit: "contain",
    position: { left: 68, top: 44, width: 92, height: 92 },
  });
  text(slide, "SportCoreOS", 174, 61, 250, 46, { size: 25, bold: true, color: C.white });
  text(slide, "La operación del club,\nmejor conectada", 68, 180, 575, 150, {
    size: 48, bold: true, color: C.white,
  });
  text(slide, "De la coordinación dispersa a una gestión deportiva y administrativa más clara.",
    72, 355, 520, 88, { size: 24, color: "#C2D0DE" });
  chip(slide, "PRESENTACIÓN PARA CLUBES", 72, 504, 248, {
    fill: "#123B39", color: "#6EE7B7", h: 34, size: 13,
  });

  // A simple editable map of the connected work, not a decorative dashboard.
  rect(slide, 730, 155, 430, 428, "#101E2D", true, "#254256");
  text(slide, "Una referencia para el día a día", 765, 185, 360, 34, {
    size: 22, bold: true, color: C.white,
  });
  const nodes = [
    { label: "PLANTEL", x: 772, y: 255, w: 138 },
    { label: "COMPETENCIA", x: 966, y: 255, w: 154 },
    { label: "FINANZAS", x: 772, y: 381, w: 138 },
    { label: "SEGUIMIENTO", x: 966, y: 381, w: 154 },
  ];
  for (const node of nodes) {
    rect(slide, node.x, node.y, node.w, 66, "#172A3B", true, "#365163");
    text(slide, node.label, node.x + 8, node.y + 8, node.w - 16, 48, {
      size: 13, bold: true, color: node.x < 900 ? "#81E6C2" : "#7DD9E5", align: "center",
    });
  }
  rect(slide, 913, 284, 46, 2, C.green);
  rect(slide, 839, 337, 2, 42, C.green);
  rect(slide, 1038, 337, 2, 42, C.cyan);
  rect(slide, 913, 411, 46, 2, C.green);
  rect(slide, 833, 485, 206, 54, C.green, true);
  text(slide, "SportCoreOS", 845, 491, 182, 42, { size: 20, bold: true, color: C.white, align: "center" });
  text(slide, "Módulos e integraciones sujetos a disponibilidad y configuración.", 72, 644, 780, 25, {
    size: 13, color: "#AABAC8",
  });
  notes(slide, "Portada de ventas enfocada en gestión deportiva y administrativa. El módulo de ranking queda fuera del alcance de esta presentación. La disponibilidad depende de módulos activos y configuración.");
}

// 2. The current operating reality: relatable, qualified and specific.
{
  const slide = base("Cuando cada proceso vive en un lugar distinto", "La operación hoy", 2);
  text(slide, "En muchos clubes, la jornada se coordina entre herramientas que no comparten el mismo contexto.",
    68, 163, 1090, 55, { size: 23, color: C.muted });
  const rows = [
    ["01", "Inscripciones y plantel", "Formularios, hojas de cálculo y datos que se vuelven a pedir."],
    ["02", "Partidos y convocatorias", "Fixture en un archivo; nómina y confirmaciones en mensajes."],
    ["03", "Cobros y comprobantes", "Transferencias, recibos y cartera revisados por separado."],
    ["04", "Seguimiento deportivo", "Notas y mediciones difíciles de comparar entre sesiones."],
  ];
  let y = 250;
  for (const [number, heading, body] of rows) {
    text(slide, number, 72, y, 48, 37, { size: 17, bold: true, color: C.green });
    text(slide, heading, 143, y, 330, 38, { size: 21, bold: true, color: C.ink });
    text(slide, body, 505, y, 635, 44, { size: 18, color: C.muted });
    rect(slide, 143, y + 55, 997, 1, C.line);
    y += 94;
  }
  rect(slide, 68, 642, 1100, 1, C.line);
  text(slide, "Es un punto de partida para conversar con cada club, no una descripción universal.",
    68, 650, 1060, 20, { size: 12, color: C.muted });
  notes(slide, "Presentar como escenario frecuente para validar con el cliente. Preguntar cuáles de estos pasos hoy dependen de hojas, chats o registros separados. No afirmar que todos los clubes operan igual.");
}

// 3. A before/after story built around matchday coordination.
{
  const slide = base("De perseguir información a revisar un flujo", "Un ejemplo concreto · día de partido", 3);
  const leftX = 68;
  const rightX = 666;
  rect(slide, leftX, 176, 525, 418, C.white, true, C.line);
  rect(slide, rightX, 176, 544, 418, C.navy, true);
  chip(slide, "HOY", leftX + 28, 199, 80, { fill: "#FDE8D7", color: "#A14D12", h: 30 });
  chip(slide, "CON SPORTCOREOS", rightX + 28, 199, 190, {
    fill: "#123B39", color: "#6EE7B7", h: 30,
  });
  const today = [
    ["1", "Buscar la lista", "Datos del plantel en varios archivos."],
    ["2", "Armar la nómina", "La convocatoria se recompone para cada partido."],
    ["3", "Confirmar por chat", "Las respuestas quedan en distintos hilos."],
  ];
  const withProduct = [
    ["1", "Abrir el equipo", "Jugadores y categorías disponibles en el módulo."],
    ["2", "Revisar el partido", "Fixture y convocatoria dentro del flujo deportivo."],
    ["3", "Dar seguimiento", "Consultar la información reunida para esa actividad."],
  ];
  for (let i = 0; i < 3; i += 1) {
    const yy = 254 + (i * 100);
    text(slide, today[i][0], leftX + 28, yy, 38, 42, { size: 17, bold: true, color: C.amber });
    text(slide, today[i][1], leftX + 78, yy, 400, 34, { size: 20, bold: true, color: C.ink });
    text(slide, today[i][2], leftX + 78, yy + 39, 402, 45, { size: 16, color: C.muted });
    text(slide, withProduct[i][0], rightX + 28, yy, 38, 42, { size: 17, bold: true, color: "#70E0BA" });
    text(slide, withProduct[i][1], rightX + 78, yy, 400, 34, { size: 20, bold: true, color: C.white });
    text(slide, withProduct[i][2], rightX + 78, yy + 39, 425, 45, { size: 16, color: "#C2D0DE" });
  }
  text(slide, "Menos pasos dispersos por validar durante un piloto.", rightX + 28, 547, 467, 30, {
    size: 14, bold: true, color: "#70E0BA",
  });
  notes(slide, "Flujo comparativo conceptual basado en las rutas disponibles de jugadores, categorías, partidos y convocatorias. Evitar afirmar automatización o integración automática con chat; el beneficio esperado debe medirse en el piloto.");
}

// 4. Two distinct sports screens: calendar and roster.
{
  const slide = base("Del calendario a la convocatoria", "Gestión deportiva", 4);
  text(slide, "Parte de la actividad del equipo se puede consultar desde módulos conectados a la operación deportiva.",
    68, 163, 440, 104, { size: 22, color: C.muted });
  const benefits = [
    "Partidos y fixture por categoría",
    "Nómina titular y suplentes",
    "Estado de convocatoria visible para revisión",
  ];
  let y = 314;
  for (const [i, item] of benefits.entries()) {
    rect(slide, 70, y + 11, 8, 8, i === 1 ? C.cyan : C.green, true);
    text(slide, item, 96, y, 410, 48, { size: 18, color: C.ink });
    y += 69;
  }
  text(slide, "Pantallas de muestra", 68, 571, 220, 23, { size: 13, bold: true, color: C.deepGreen });
  text(slide, "Los equipos, nombres y marcadores son datos ficticios.", 68, 596, 450, 34, { size: 12, color: C.muted });
  rect(slide, 553, 157, 285, 505, C.white, true, C.line);
  rect(slide, 859, 157, 285, 505, C.white, true, C.line);
  await addImage(slide, "screenshot_03_partidos_calendario_1080x1920.png", 561, 162, 269, 495,
    "Vista ilustrativa del calendario y fixture de partidos");
  await addImage(slide, "screenshot_04_convocatorias_tactica_1080x1920.png", 867, 162, 269, 495,
    "Vista ilustrativa de una convocatoria y nómina de equipo");
  chip(slide, "PARTIDOS", 618, 632, 153, { fill: C.paleBlue, color: C.ink, h: 24, size: 11 });
  chip(slide, "CONVOCATORIA", 917, 632, 169, { fill: C.paleBlue, color: C.ink, h: 24, size: 11 });
  notes(slide, "Capturas de demostración de los módulos de partidos y convocatorias. No corresponden a un club cliente ni representan marcadores o datos reales. Rutas de producto verificadas en SportCoreOS-web/src/app/app.routes.ts.");
}

// 5. Administration: account and collection status.
{
  const slide = base("Consultar recaudo sin reconstruir la historia", "Administración", 5);
  text(slide, "De los comprobantes por separado a una vista para revisar estados de cuenta y cartera.",
    68, 163, 570, 76, { size: 25, bold: true, color: C.ink });
  text(slide, "La administración puede consultar conceptos, vencimientos y estados de pago según los módulos y medios habilitados.",
    68, 264, 535, 100, { size: 19, color: C.muted });
  rect(slide, 68, 402, 540, 1, C.line);
  text(slide, "En vez de", 68, 424, 162, 29, { size: 15, bold: true, color: "#A14D12" });
  text(slide, "Cruzar extractos, mensajes y listas manuales.", 68, 455, 480, 50, { size: 18, color: C.ink });
  text(slide, "El club puede revisar", 68, 524, 260, 29, { size: 15, bold: true, color: C.deepGreen });
  text(slide, "Pendientes, pagos e historial en la vista habilitada.", 68, 555, 500, 50, { size: 18, color: C.ink });
  rect(slide, 700, 153, 438, 507, C.white, true, C.line);
  await addImage(slide, "crops/recaudo-enfoque.png", 707, 160, 424, 493,
    "Pantalla ilustrativa de estado de cuenta, cartera y recaudos");
  chip(slide, "CAPTURA DE DEMOSTRACIÓN · DATOS FICTICIOS", 743, 616, 350, {
    fill: "#FFF1D6", color: "#875615", h: 27, size: 10,
  });
  text(slide, "Las pasarelas y medios de pago dependen de disponibilidad y configuración.",
    68, 626, 575, 35, { size: 12, color: C.muted });
  notes(slide, "La captura de cartera es ilustrativa e incluye nombres, montos y fechas ficticias. No usar como tarifa, cotización o caso de cliente. La interfaz contiene opción PSE/Wompi, pero disponibilidad y operación de pasarelas deben validarse con el equipo antes de comprometerlas comercialmente.");
}

// 6. Fields and scheduling as a second administrative workflow.
{
  const slide = base("Los escenarios también se administran", "Espacios y servicios", 6);
  text(slide, "La gestión de canchas y horarios puede formar parte del mismo panorama operativo del club.",
    68, 163, 560, 88, { size: 25, bold: true, color: C.ink });
  const items = [
    ["Disponibilidad", "Consulta de escenarios y franjas de horario."],
    ["Reservas", "Organización del uso de espacios deportivos."],
    ["Servicios", "Oferta visible según configuración del club."],
  ];
  let y = 301;
  for (const [heading, body] of items) {
    text(slide, heading, 68, y, 210, 31, { size: 18, bold: true, color: C.deepGreen });
    text(slide, body, 281, y, 340, 47, { size: 16, color: C.muted });
    rect(slide, 68, y + 59, 553, 1, C.line);
    y += 94;
  }
  text(slide, "Hoy", 68, 592, 54, 22, { size: 13, bold: true, color: C.ink });
  text(slide, "Disponibilidad coordinada entre calendarios y mensajes.", 119, 590, 500, 30, {
    size: 14, color: C.muted,
  });
  rect(slide, 700, 151, 438, 511, C.white, true, C.line);
  await addImage(slide, "crops/canchas-enfoque.png", 707, 158, 424, 465,
    "Vista ilustrativa del módulo de alquiler y disponibilidad de canchas");
  chip(slide, "SEDE, HORARIOS Y TARIFAS DE MUESTRA", 752, 617, 332, {
    fill: "#FFF1D6", color: "#875615", h: 27, size: 10,
  });
  notes(slide, "La captura de canchas es demostrativa. El nombre de la sede, fechas, tarifas y disponibilidad visibles son ficticios. No presentar el valor mostrado como precio real. Las capacidades comerciales dependen de módulos activos.");
}

// 7. Sports development and context, with explicit disclaimer for demo data.
{
  const slide = base("El seguimiento deportivo gana continuidad", "Desarrollo del deportista", 7);
  text(slide, "Una historia deportiva se construye con observaciones y mediciones registradas a lo largo del proceso.",
    68, 163, 1090, 62, { size: 23, color: C.muted });
  rect(slide, 68, 260, 485, 344, C.white, true, C.line);
  const modules = [
    ["Evaluaciones", "Biometría y pruebas físicas"],
    ["Entrenamiento", "Telemetría GPS"],
    ["Observación", "Scouting e informes"],
  ];
  let y = 292;
  for (let i = 0; i < modules.length; i += 1) {
    const [heading, body] = modules[i];
    text(slide, `0${i + 1}`, 94, y, 52, 36, { size: 16, bold: true, color: i === 1 ? C.cyan : C.green });
    text(slide, heading, 156, y, 315, 34, { size: 20, bold: true, color: C.ink });
    text(slide, body, 156, y + 38, 340, 40, { size: 16, color: C.muted });
    y += 96;
  }
  text(slide, "La lectura y las decisiones siguen en manos del cuerpo técnico.", 94, 566, 408, 25, {
    size: 13, bold: true, color: C.deepGreen,
  });
  rect(slide, 612, 248, 526, 390, C.white, true, C.line);
  await addImage(slide, "crops/seguimiento-enfoque.png", 620, 254, 510, 345,
    "Informe deportivo de demostración con datos sintéticos");
  chip(slide, "MUESTRA FICTICIA · NO ES UNA EVALUACIÓN REAL", 691, 604, 370, {
    fill: "#FFF1D6", color: "#875615", h: 26, size: 10,
  });
  notes(slide, "La captura de boletín incluye perfil, texto de análisis y métricas generadas para una muestra; ningún valor ni interpretación se presenta como evaluación real. El módulo debe validarse con información autorizada, metodología del club y revisión del equipo técnico. No es diagnóstico médico.");
}

// 8. Explain audience-specific operational value without quantified claims.
{
  const slide = base("Una vista útil para cada rol", "Valor para el club", 8);
  text(slide, "La misma plataforma puede ordenar conversaciones distintas, con acceso según el perfil habilitado.",
    68, 163, 1060, 64, { size: 23, color: C.muted });
  const rows = [
    ["Dirección", "Panorama de equipos, actividad y procesos administrativos."],
    ["Cuerpo técnico", "Contexto del plantel, partidos, convocatoria y seguimiento."],
    ["Administración", "Consulta de recaudo, cartera y servicios habilitados."],
    ["Familias", "Un canal digital para la información que el club decida compartir."],
  ];
  let y = 269;
  for (const [role, value] of rows) {
    rect(slide, 68, y, 232, 62, y === 269 || y === 419 ? C.navy : "#E9F5F1", true);
    text(slide, role, 84, y + 7, 202, 47, { size: 18, bold: true, color: y === 269 || y === 419 ? C.white : C.deepGreen });
    text(slide, value, 336, y + 3, 796, 55, { size: 19, color: C.ink });
    rect(slide, 336, y + 68, 796, 1, C.line);
    y += 93;
  }
  text(slide, "El alcance se define con el club: módulos activos, permisos y datos que se compartirán.",
    68, 653, 1080, 20, { size: 13, color: C.muted });
  notes(slide, "El portal para padres está identificado como módulo. Presentar como canal para información que el club decida habilitar; no asegurar comunicaciones automáticas. Definir roles, permisos y tratamiento de datos de menores antes de la puesta en marcha.");
}

// 9. Close with an evidence-oriented pilot proposal.
{
  const slide = base("Demostrar el valor en la operación real", "Siguiente paso · piloto", 9, true);
  text(slide, "Antes de prometer resultados, acordemos qué medir con el club.", 68, 163, 1065, 53, {
    size: 25, color: "#D7E4EC",
  });
  const phases = [
    ["01", "Línea base", "Describir cómo se hacen hoy tres procesos prioritarios."],
    ["02", "Uso guiado", "Configurar el flujo y acompañar a los roles participantes."],
    ["03", "Revisión", "Comparar tiempos, registros completos y puntos de fricción."],
  ];
  const xs = [68, 454, 840];
  for (let i = 0; i < phases.length; i += 1) {
    const [number, heading, detail] = phases[i];
    rect(slide, xs[i], 276, 350, 253, "#122236", true, "#2B4558");
    text(slide, number, xs[i] + 25, 299, 60, 44, { size: 19, bold: true, color: "#70E0BA" });
    text(slide, heading, xs[i] + 25, 356, 295, 44, { size: 22, bold: true, color: C.white });
    text(slide, detail, xs[i] + 25, 409, 292, 82, { size: 17, color: "#C2D0DE" });
  }
  text(slide, "Indicadores posibles", 68, 573, 212, 27, { size: 15, bold: true, color: "#70E0BA" });
  text(slide, "Tiempo para preparar convocatorias  ·  visibilidad de cartera  ·  registros deportivos completos",
    284, 570, 848, 37, { size: 15, color: C.white });
  text(slide, "Las metas se acuerdan con el club; el resultado dependerá del uso y la configuración.",
    68, 638, 1040, 24, { size: 13, color: "#AABAC8" });
  notes(slide, "Cierre comercial: proponer seleccionar de 2 a 3 procesos para un piloto y levantar la línea base antes de configurar. Los indicadores son propuestas, no resultados garantizados. Definir duración, responsables y objetivos con el cliente.");
}

await fs.mkdir(TMP_DIR, { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });
const candidatePath = path.join(TMP_DIR, "candidate-v3.pptx");
await (await PresentationFile.exportPptx(pptx)).save(candidatePath);
for (let i = 0; i < pptx.slides.items.length; i += 1) {
  const slide = pptx.slides.items[i];
  const preview = await pptx.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(path.join(TMP_DIR, `v3-slide-${String(i + 1).padStart(2, "0")}.png`),
    new Uint8Array(await preview.arrayBuffer()));
}

const stagingDir = path.join(ROOT, ".codex/marketing-build/finalizer");
await fs.mkdir(stagingDir, { recursive: true });
const result = await finalizePresentation({
  explicitTotalSlideCount: 9,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  workspaceDir: ROOT,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-heading-fit"],
  fontPolicy: { basis: "design", families: [fontFamily] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, "PRESENTACION_COMERCIAL_SPORTCOREOS_SIN_RANKING_v3.validation.json"),
});
console.log(JSON.stringify({ finalPath: FINAL_PPTX, fontFamily, slideCount: pptx.slides.items.length, result }, null, 2));

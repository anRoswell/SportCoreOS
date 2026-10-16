import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { SKILL_DIR, TMP_DIR, RUNTIME_PYTHON } = process.env;
if (!path.isAbsolute(SKILL_DIR ?? "") || !path.isAbsolute(TMP_DIR ?? "") || !path.isAbsolute(RUNTIME_PYTHON ?? "")) {
  throw new Error("Set absolute SKILL_DIR, TMP_DIR and RUNTIME_PYTHON paths");
}

const { resolvePresentationFont, finalizePresentation } = await import(
  pathToFileURL(path.join(SKILL_DIR, "container_tools/artifact_tool_utils.mjs")).href,
);

const FINAL_PPTX = path.join(ROOT, "output/presentation/PRESENTACION_COMERCIAL_SPORTCOREOS_SIN_RANKING_v2.pptx");
const logoPath = path.join(ROOT, "branding/sportcore_logo.jpg");
const callupPath = path.join(ROOT, "marketing/assets/screenshots/screenshot_04_convocatorias_tactica_1080x1920.png");
const fontFamily = resolvePresentationFont();

const C = {
  bg: "#0B0F19",
  surface: "#111827",
  white: "#F8FAFC",
  muted: "#B8C4D4",
  green: "#10B981",
  cyan: "#06B6D4",
  gold: "#F59E0B",
  line: "#374151",
};

const pptx = Presentation.create({ slideSize: { width: 1280, height: 720 } });

function addBox(slide, x, y, w, h, fill = "none", geometry = "rect") {
  return slide.shapes.add({
    geometry,
    position: { left: x, top: y, width: w, height: h },
    fill,
    line: { fill: "none", width: 0 },
  });
}

function addText(slide, text, x, y, w, h, options = {}) {
  const box = slide.shapes.add({
    geometry: "textbox",
    position: { left: x, top: y, width: w, height: h },
    fill: "none",
    line: { fill: "none", width: 0 },
  });
  box.text = text;
  box.text.style = {
    typeface: fontFamily,
    fontSize: options.size ?? 24,
    bold: options.bold ?? false,
    color: options.color ?? C.white,
    alignment: options.align ?? "left",
    verticalAlignment: options.valign ?? "middle",
    autoFit: "none",
    wrap: true,
  };
  return box;
}

function baseSlide(title, pageNumber) {
  const slide = pptx.slides.add();
  slide.background.fill = C.bg;
  addBox(slide, 0, 0, 12, 720, C.green);
  addText(slide, title, 72, 44, 1080, 60, { size: 38, bold: true });
  addBox(slide, 72, 116, 64, 4, C.cyan);
  addText(slide, "SportCoreOS  |  Presentación para clubes y escuelas", 72, 676, 900, 24, { size: 14, color: C.muted });
  addText(slide, String(pageNumber).padStart(2, "0"), 1150, 676, 54, 24, { size: 14, color: C.muted, align: "right" });
  return slide;
}

function note(slide, text) {
  slide.speakerNotes.textFrame.setText(text);
}

// 1. Minimal cover with the original brand asset.
{
  const slide = pptx.slides.add();
  slide.background.fill = C.bg;
  addBox(slide, 0, 0, 14, 720, C.green);
  addText(slide, "SportCoreOS", 72, 176, 650, 80, { size: 58, bold: true });
  addText(slide, "Gestión deportiva y administrativa para clubes", 76, 270, 625, 112, { size: 34, bold: true, color: C.muted });
  addText(slide, "Una plataforma para organizar la operación diaria y acompañar el trabajo deportivo.", 76, 414, 565, 90, { size: 23, color: C.white });
  addText(slide, "Presentación para clubes y escuelas deportivas", 76, 613, 540, 28, { size: 17, color: C.muted });
  const logo = new Uint8Array(await fs.readFile(logoPath));
  slide.images.add({
    blob: logo,
    contentType: "image/jpeg",
    alt: "Logotipo SportCoreOS",
    fit: "contain",
    position: { left: 810, top: 108, width: 360, height: 360 },
  });
  note(slide, "Portada comercial de SportCoreOS. Las funciones de la presentación deben mostrarse según módulos habilitados y configuración acordada con cada club.");
}

// 2. Product scope in plain language.
{
  const slide = baseSlide("Una plataforma para la operación del club", 2);
  addText(slide, "El club coordina información deportiva, actividad de los equipos y procesos administrativos.", 72, 154, 1050, 94, { size: 31, bold: true });
  const cols = [
    { x: 72, y: 316, heading: "Gestión deportiva", body: "Jugadores, fichas y categorías organizados para el trabajo de los planteles." },
    { x: 660, y: 316, heading: "Agenda y competencia", body: "Partidos, convocatorias y actividad del equipo en los módulos correspondientes." },
    { x: 72, y: 474, heading: "Seguimiento", body: "Biometría, pruebas físicas, telemetría GPS y scouting disponibles según la operación." },
    { x: 660, y: 474, heading: "Administración", body: "Cobros, escenarios, tienda, servicios y portal familiar según configuración." },
  ];
  for (const col of cols) {
    addText(slide, col.heading, col.x, col.y, 520, 40, { size: 25, bold: true, color: C.green });
    addText(slide, col.body, col.x, col.y + 48, 500, 66, { size: 21, color: C.muted });
  }
  note(slide, "Capacidades basadas en las rutas del producto: SportCoreOS-web/src/app/app.routes.ts. La disponibilidad depende de los módulos activos y de la configuración del club.");
}

// 3. Product proof, labeled as a sample environment.
{
  const slide = baseSlide("Gestión deportiva y competencia", 3);
  addText(slide, "De la ficha del deportista a la actividad del equipo", 72, 156, 590, 84, { size: 32, bold: true });
  const bullets = [
    "Registro de jugadores y organización por categorías.",
    "Consulta de fixture y partidos.",
    "Preparación de convocatorias y nóminas.",
    "Información de asistencia disponible en el flujo del club.",
  ];
  let y = 278;
  for (const line of bullets) {
    addBox(slide, 76, y + 10, 10, 10, C.cyan, "ellipse");
    addText(slide, line, 102, y, 520, 56, { size: 22, color: C.white });
    y += 77;
  }
  const capture = new Uint8Array(await fs.readFile(callupPath));
  slide.images.add({
    blob: capture,
    contentType: "image/png",
    alt: "Captura ilustrativa del módulo de convocatorias con información de demostración",
    fit: "contain",
    position: { left: 845, top: 155, width: 310, height: 500 },
  });
  addText(slide, "Interfaz ilustrativa, datos de demostración", 690, 126, 465, 22, { size: 14, color: C.muted, align: "right" });
  note(slide, "La captura proviene de SportCoreOS/marketing/assets/screenshots/screenshot_04_convocatorias_tactica_1080x1920.png. Los nombres y equipos visibles son de demostración, no representan un caso real. Las rutas del producto identifican jugadores, categorías, partidos y convocatorias.");
}

// 4. Sports performance tools and responsible use.
{
  const slide = baseSlide("Seguimiento deportivo", 4);
  addText(slide, "Herramientas para acompañar el trabajo del cuerpo técnico", 72, 155, 1060, 74, { size: 32, bold: true });
  addText(slide, "La plataforma permite registrar y consultar información deportiva según el flujo que utilice el club.", 72, 240, 1030, 62, { size: 22, color: C.muted });
  addText(slide, "Biometría y pruebas físicas", 72, 352, 430, 42, { size: 25, bold: true, color: C.green });
  addText(slide, "Mediciones y evaluaciones registradas para dar contexto a la evolución del deportista.", 72, 400, 470, 78, { size: 20, color: C.white });
  addText(slide, "Telemetría GPS y scouting", 660, 352, 485, 42, { size: 25, bold: true, color: C.cyan });
  addText(slide, "Sesiones GPS y observaciones de scouting para apoyar el seguimiento deportivo.", 660, 400, 485, 78, { size: 20, color: C.white });
  addText(slide, "Copiloto de IA", 72, 518, 430, 42, { size: 25, bold: true, color: C.gold });
  addText(slide, "Asistencia de consulta dentro del módulo técnico habilitado.", 72, 564, 470, 54, { size: 20, color: C.white });
  addText(slide, "La interpretación permanece en manos del equipo técnico. No sustituye una valoración profesional.", 660, 528, 490, 78, { size: 19, color: C.muted });
  note(slide, "Módulos identificados en app.routes.ts: biometría, telemetría GPS, scouting y copiloto de IA. La disponibilidad y dispositivos requeridos deben verificarse en la demo. No presentar la herramienta como diagnóstico médico.");
}

// 5. Administrative and infrastructure modules.
{
  const slide = baseSlide("Administración y recursos del club", 5);
  addText(slide, "Los procesos administrativos también forman parte de la operación deportiva.", 72, 158, 1060, 82, { size: 31, bold: true });
  addText(slide, "Finanzas", 72, 300, 260, 40, { size: 25, bold: true, color: C.green });
  addText(slide, "Cobros, pensiones y estados de recaudo para consulta y gestión.", 72, 350, 455, 83, { size: 21, color: C.white });
  addText(slide, "Escenarios y servicios", 660, 300, 450, 40, { size: 25, bold: true, color: C.cyan });
  addText(slide, "Canchas, tienda y servicios deportivos según los módulos disponibles para el club.", 660, 350, 470, 83, { size: 21, color: C.white });
  addBox(slide, 72, 487, 1058, 2, C.line);
  addText(slide, "La disponibilidad de pasarelas, medios de pago y otros servicios debe confirmarse para cada implementación.", 72, 526, 1030, 72, { size: 20, color: C.muted });
  note(slide, "Rutas de producto: finanzas/recaudo, canchas, tienda y servicios en SportCoreOS-web/src/app/app.routes.ts. Se incluye una salvedad porque la activación de integraciones y medios de pago puede depender de la configuración comercial y técnica.");
}

// 6. Family portal.
{
  const slide = baseSlide("Una experiencia digital para las familias", 6);
  addText(slide, "Un portal móvil asociado a la actividad del club", 72, 164, 1080, 80, { size: 34, bold: true });
  addText(slide, "El portal para padres abre un espacio digital para que las familias consulten la información que el club habilite para ellas.", 72, 278, 990, 108, { size: 26, color: C.muted });
  addText(slide, "Cada club define qué información comparte, qué perfiles acceden y cómo acompaña a las familias durante la temporada.", 72, 431, 990, 90, { size: 23, color: C.white });
  addText(slide, "El tratamiento de datos de deportistas menores requiere permisos y autorizaciones definidos por el club.", 72, 571, 990, 58, { size: 18, color: C.green });
  note(slide, "El portal móvil para padres aparece como módulo PORTAL_PADRES en SportCoreOS-web/src/app/app.routes.ts. Las prácticas de permisos, comunicación y uso de datos deben validarse con el club.");
}

// 7. Club-level benefits phrased as potential operational value, not guaranteed outcomes.
{
  const slide = baseSlide("Ventajas para la organización", 7);
  addText(slide, "Una referencia común puede ayudar al club a coordinar sus procesos con mayor contexto.", 72, 164, 1050, 118, { size: 34, bold: true });
  addText(slide, "Más claridad", 72, 355, 340, 40, { size: 24, bold: true, color: C.green });
  addText(slide, "Consulta las áreas deportivas y administrativas dentro del entorno habilitado.", 72, 407, 430, 90, { size: 20, color: C.white });
  addText(slide, "Acceso por perfiles", 660, 355, 430, 40, { size: 24, bold: true, color: C.cyan });
  addText(slide, "Organiza la experiencia de acuerdo con los roles de dirección, cuerpo técnico y administración.", 660, 407, 465, 90, { size: 20, color: C.white });
  addText(slide, "El resultado depende de los módulos activos, la calidad de los datos y la adopción del equipo.", 72, 560, 1045, 56, { size: 19, color: C.muted });
  note(slide, "Las ventajas se presentan como valor potencial de organización, no como resultados medidos ni garantizados. La configuración de roles forma parte de las rutas y permisos del producto.");
}

// 8. Sales close.
{
  const slide = baseSlide("Una demostración basada en tu club", 8);
  addText(slide, "Empecemos por la operación que quieres organizar.", 72, 164, 1060, 78, { size: 36, bold: true });
  addText(slide, "En una demo personalizada podemos recorrer los módulos que respondan a las prioridades de tu escuela y revisar qué hace falta configurar.", 72, 271, 1030, 92, { size: 24, color: C.muted });
  addText(slide, "Solicita una demostración personalizada", 72, 427, 980, 55, { size: 30, bold: true, color: C.green });
  addText(slide, "Exploramos el plantel, una jornada deportiva y los procesos administrativos de interés.", 72, 501, 1055, 46, { size: 20, color: C.white });
  addText(slide, "Funciones e integraciones sujetas a disponibilidad y configuración.", 72, 594, 950, 32, { size: 16, color: C.muted });
  note(slide, "Llamado a la acción genérico porque el canal oficial de contacto debe confirmarse antes de distribuir la presentación. No se inventa correo, teléfono, precio o URL.");
}

await fs.mkdir(TMP_DIR, { recursive: true });
await fs.mkdir(path.dirname(FINAL_PPTX), { recursive: true });

// Draft export and previews used for visual inspection.
const candidatePath = path.join(TMP_DIR, "candidate.pptx");
await (await PresentationFile.exportPptx(pptx)).save(candidatePath);
for (let i = 0; i < pptx.slides.items.length; i += 1) {
  const slide = pptx.slides.items[i];
  const preview = await pptx.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(path.join(TMP_DIR, `slide-${String(i + 1).padStart(2, "0")}.png`), new Uint8Array(await preview.arrayBuffer()));
}

const stagingDir = path.join(ROOT, ".codex/marketing-build/finalizer");
await fs.mkdir(stagingDir, { recursive: true });
const result = await finalizePresentation({
  explicitTotalSlideCount: 8,
  requiredNativeTableOwnerSlides: [],
  requiredNativeChartOwnerSlides: [],
  workspaceDir: ROOT,
  candidatePath,
  finalPath: FINAL_PPTX,
  pythonExecutable: RUNTIME_PYTHON,
  integrityValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(SKILL_DIR, "container_tools/inspect_presentation_layout_geometry.py"),
  layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-heading-fit"],
  requiredNativeTableOwnerSlides: [],
  fontPolicy: { basis: "design", families: [fontFamily] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, "PRESENTACION_COMERCIAL_SPORTCOREOS_SIN_RANKING_v2.validation.json"),
});
console.log(JSON.stringify({ finalPath: FINAL_PPTX, fontFamily, slideCount: pptx.slides.items.length, result }, null, 2));

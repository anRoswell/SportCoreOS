import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, PresentationFile } from "@oai/artifact-tool";

const root = "/Users/sectic/Documents/Codigos Fuentes/SportCoreOS";
const finalPath = path.join(root, "output/presentation/PRESENTACION_COMERCIAL_SPORTCOREOS_SIN_RANKING_v3.pptx");
const renderDir = path.join(root, ".codex/marketing-build/final-render-v3");
await fs.mkdir(renderDir, { recursive: true });
const presentation = await PresentationFile.importPptx(await FileBlob.load(finalPath));
for (let i = 0; i < presentation.slides.items.length; i += 1) {
  const slide = presentation.slides.items[i];
  const preview = await presentation.export({ slide, format: "png", scale: 1 });
  await fs.writeFile(path.join(renderDir, `slide-${String(i + 1).padStart(2, "0")}.png`), new Uint8Array(await preview.arrayBuffer()));
}
console.log(`Rendered ${presentation.slides.items.length} final slides to ${renderDir}`);

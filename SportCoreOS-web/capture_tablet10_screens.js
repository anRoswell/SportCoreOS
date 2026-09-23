const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUTPUT_DIR = path.resolve(__dirname, '../assets/screenshots/tablet10');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const ROUTES = [
  { name: '01_tablet10_inicio_dashboard_raw.png', url: 'http://localhost:4203/home' },
  { name: '02_tablet10_entrenamientos_asistencia_raw.png', url: 'http://localhost:4203/entrenamientos' },
  { name: '03_tablet10_partidos_calendario_raw.png', url: 'http://localhost:4203/partidos' },
  { name: '04_tablet10_convocatorias_tactica_raw.png', url: 'http://localhost:4203/convocatorias' },
  { name: '05_tablet10_canchas_alquiler_raw.png', url: 'http://localhost:4203/canchas' },
  { name: '06_tablet10_boletin_rendimiento_ia_raw.png', url: 'http://localhost:4203/perfil/boletin-ia' },
  { name: '07_tablet10_carnet_digital_jugador_raw.png', url: 'http://localhost:4203/perfil/carnet' },
  { name: '08_tablet10_tienda_kits_oficiales_raw.png', url: 'http://localhost:4203/tienda' },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  // 10" Tablet Viewport (800 x 1422 @ 2x pixel ratio gives high-DPI 1600 x 2844)
  const context = await browser.newContext({
    viewport: { width: 800, height: 1422 },
    deviceScaleFactor: 2,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-X800 Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/115.0.5790.138 Safari/537.36',
  });

  const page = await context.newPage();

  console.log('Navigating to login page...');
  await page.goto('http://localhost:4203/auth/login', { waitUntil: 'networkidle' });

  // Fill credentials if inputs exist
  const emailInput = await page.$('input[type="email"], input[formcontrolname="email"], input[name="email"]');
  const passInput = await page.$('input[type="password"], input[formcontrolname="password"], input[name="password"]');

  if (emailInput && passInput) {
    console.log('Entering credentials...');
    await emailInput.fill('admin@sportcore.io');
    await passInput.fill('Admin123*');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
    }
  } else {
    console.log('Already authenticated or inputs not found.');
  }

  for (const item of ROUTES) {
    console.log(`Capturing: ${item.name} from ${item.url}`);
    try {
      await page.goto(item.url, { waitUntil: 'networkidle', timeout: 10000 });
    } catch (e) {
      console.log(`Timeout navigation on ${item.url}, waiting 2s...`);
    }
    await page.waitForTimeout(1500);

    const outPath = path.join(OUTPUT_DIR, item.name);
    await page.screenshot({ path: outPath, fullPage: false });
    console.log(`Saved: ${outPath}`);
  }

  await browser.close();
  console.log('All 10-inch tablet captures finished successfully!');
})();

import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { chromium } from 'playwright';

const baseUrl = process.env.PORTFOLIO_URL ?? 'http://localhost:5173/';
const outputDir = new URL('../test-results/', import.meta.url);

async function inspectPage(page, label) {
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.locator('canvas').waitFor({ state: 'visible', timeout: 15000 });
  await page.screenshot({
    fullPage: true,
    path: fileURLToPath(new URL(`${label}.png`, outputDir)),
  });

  const canvasLocator = page.locator('canvas');
  const canvasPng = PNG.sync.read(await canvasLocator.screenshot());
  let brightSamples = 0;
  let totalSamples = 0;

  for (let y = 0; y < canvasPng.height; y += 24) {
    for (let x = 0; x < canvasPng.width; x += 24) {
      const index = (canvasPng.width * y + x) << 2;
      const brightness =
        canvasPng.data[index] + canvasPng.data[index + 1] + canvasPng.data[index + 2];
      if (brightness > 96) {
        brightSamples += 1;
      }
      totalSamples += 1;
    }
  }

  const canvasState = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    if (!(canvas instanceof HTMLCanvasElement)) {
      return { ok: false, reason: 'missing canvas' };
    }

    const rect = canvas.getBoundingClientRect();

    return {
      cssHeight: Math.round(rect.height),
      cssWidth: Math.round(rect.width),
      ok: rect.width > 280 && rect.height > 260,
    };
  });

  await page.evaluate(() => window.scrollTo(0, 0));
  const interactionText = await page
    .getByRole('button', { name: /Hardware/i })
    .click({ force: true })
    .then(() => page.getByText(/Robots, gardens, sensors/i).isVisible());

  return {
    ...canvasState,
    brightSamples,
    interactionText,
    ok:
      canvasState.ok &&
      interactionText &&
      brightSamples > Math.max(8, totalSamples * 0.015),
    pixelHeight: canvasPng.height,
    pixelWidth: canvasPng.width,
    totalSamples,
  };
}

await mkdir(outputDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

try {
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  results.push(['desktop', await inspectPage(desktop, 'desktop')]);
  await desktop.close();

  const mobile = await browser.newPage({
    isMobile: true,
    viewport: { width: 390, height: 844 },
  });
  results.push(['mobile', await inspectPage(mobile, 'mobile')]);
  await mobile.close();
} finally {
  await browser.close();
}

for (const [label, result] of results) {
  console.log(`${label}: ${JSON.stringify(result)}`);
  if (!result.ok) {
    process.exitCode = 1;
  }
}

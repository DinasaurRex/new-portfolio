import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const outputDir = new URL('../test-results/', import.meta.url);
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch();
const errors = [];
try {
  for (const [label, viewport] of [['wide', { width: 1920, height: 1080 }], ['portrait', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.PORTFOLIO_URL ?? 'http://localhost:5176/', { waitUntil: 'networkidle' });
    await page.locator('canvas[data-ready="true"]').waitFor();
    await page.locator('[data-testid="contact-screen"]').waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Wave to the penguin', exact: true }).waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Wave to the bear', exact: true }).waitFor({ state: 'visible' });
    for (const state of ['overview', 'desk', 'computer', 'projects', 'hardware', 'contact']) {
      const buttons = { desk: 'Sit at the desk', computer: 'Open Computer', projects: 'Open 3DS', hardware: 'Open Cassette player', contact: 'Open Turntable' };
      if (buttons[state]) await page.getByRole('button', { name: buttons[state], exact: true }).click();
      const selectors = { computer: 'computer', projects: 'project', hardware: 'hardware', contact: 'contact' };
      if (selectors[state]) {
        const screen = page.locator(`[data-testid="${selectors[state]}-screen"]`);
        await screen.waitFor({ state: 'visible' });
        const box = await screen.boundingBox();
        assert(box.x >= -2 && box.y > 40 && box.x + box.width <= viewport.width + 2 && box.y + box.height < viewport.height - 58, `${label}: ${state} is outside the viewport`);
      }
      await page.screenshot({ path: fileURLToPath(new URL(`${label}-daylight-${state}.png`, outputDir)) });
      if (state === 'desk') {
        const penguin = await page.getByRole('button', { name: 'Wave to the penguin', exact: true }).boundingBox();
        const bear = await page.getByRole('button', { name: 'Wave to the bear', exact: true }).boundingBox();
        const monitor = await page.locator('[data-testid="computer-screen"]').boundingBox();
        const center = monitor.x + monitor.width / 2;
        assert(penguin.x + penguin.width < center && bear.x > center, `${label}: plush toys are not on opposite sides of the computer`);
        const frame = PNG.sync.read(await page.locator('canvas').screenshot());
        const colors = new Set();
        for (let i = 0; i < frame.data.length; i += 400) colors.add(`${frame.data[i] >> 4},${frame.data[i + 1] >> 4},${frame.data[i + 2] >> 4}`);
        assert(colors.size > 30, `${label}: the 3D scene is blank`);
      }
    }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight), `${label}: page overflow`);
    await page.close();
    console.log(`${label}: room entrance, daylight rendering, and all device frames passed`);
  }
  assert.deepEqual(errors, [], 'Browser runtime errors');
} finally {
  await browser.close();
}

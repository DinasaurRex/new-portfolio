import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const output = new URL('../test-results/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const errors = [];
function brightness(buffer) {
  const png = PNG.sync.read(buffer);
  let total = 0;
  let samples = 0;
  const colors = new Set();
  for (let i = 0; i < png.data.length; i += 400) {
    total += (png.data[i] + png.data[i + 1] + png.data[i + 2]) / 3;
    samples++;
    colors.add(`${png.data[i] >> 4},${png.data[i + 1] >> 4},${png.data[i + 2] >> 4}`);
  }
  assert(colors.size > 30, '3D canvas is blank');
  return total / samples;
}
try {
  for (const [label, viewport] of [['wide', { width: 1920, height: 1080 }], ['portrait', { width: 390, height: 844 }]]) {
    const page = await browser.newPage({ viewport, reducedMotion: 'reduce' });
    page.setDefaultTimeout(90000);
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(process.env.PORTFOLIO_URL ?? 'http://127.0.0.1:5176/', { waitUntil: 'networkidle' });
    await page.locator('canvas[data-ready="true"]').waitFor();
    await page.locator('[data-testid="contact-screen"]').waitFor({ state: 'visible' });
    await page.getByRole('button', { name: 'Wave to the penguin', exact: true }).waitFor({ state: 'visible' });
    const capture = async name => {
      await page.waitForTimeout(350);
      const bounds = await page.locator('canvas').boundingBox();
      const frame = await page.screenshot({ clip: bounds, path: fileURLToPath(new URL(`${label}-lighting-${name}.png`, output)) });
      return brightness(frame);
    };
    const day = await capture('day');
    await page.getByRole('button', { name: 'Night lighting', exact: true }).click();
    await page.locator('main[data-lighting="night"]').waitFor();
    const night = await capture('night');
    assert(night < day * 0.9, `${label}: night lighting is not visibly darker (${day}, ${night})`);
    const lamp = page.getByRole('switch', { name: 'Desk lamp', exact: true });
    assert.equal(await lamp.getAttribute('aria-checked'), 'true');
    await lamp.click();
    assert.equal(await lamp.getAttribute('aria-checked'), 'false');
    const unlit = await capture('lamp-off');
    assert(night > unlit + 0.5, `${label}: lamp does not illuminate the room`);
    await lamp.click();
    for (const [state, button, screen] of [
      ['desk', 'Sit at the desk', null],
      ['computer', 'Open Computer', 'computer'],
      ['projects', 'Open 3DS', 'project'],
      ['hardware', 'Open Cassette player', 'hardware'],
      ['contact', 'Open Turntable', 'contact'],
    ]) {
      await page.getByRole('button', { name: button, exact: true }).click();
      if (screen) {
        const element = page.locator(`[data-testid="${screen}-screen"]`);
        await element.waitFor({ state: 'visible' });
        const box = await element.boundingBox();
        assert(box.x >= -2 && box.y > 40 && box.x + box.width <= viewport.width + 2 && box.y + box.height < viewport.height - 58, `${label}: ${state} screen is clipped`);
      }
      await capture(state);
      const mode = await page.locator('main').getAttribute('data-mode');
      await page.getByRole('button', { name: 'Day lighting', exact: true }).click();
      assert.equal(await page.locator('main').getAttribute('data-mode'), mode, 'Lighting reset the selected device');
      await page.getByRole('button', { name: 'Night lighting', exact: true }).click();
    }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight), `${label}: page overflow`);
    const brand = await page.getByRole('button', { name: 'Dina Saab desk', exact: true }).boundingBox();
    const dayButton = await page.getByRole('button', { name: 'Day lighting', exact: true }).boundingBox();
    assert(brand.x + brand.width <= dayButton.x, `${label}: header controls overlap`);
    console.log(`${label}: day ${day.toFixed(1)}, night ${night.toFixed(1)}, lamp off ${unlit.toFixed(1)}; controls and all device views passed`);
    await page.close();
  }
  assert.deepEqual(errors, [], 'Browser runtime errors');
} finally {
  await browser.close();
}

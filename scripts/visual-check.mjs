import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { PNG } from 'pngjs';

const baseUrl = process.env.PORTFOLIO_URL ?? 'http://localhost:5174/';
const outputDir = new URL('../test-results/', import.meta.url);
await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch();
const errors = [];

async function capture(page, label) {
  await page.screenshot({ path: fileURLToPath(new URL(`${label}.png`, outputDir)) });
}

async function focus(page, name, mode) {
  await page.getByRole('button', { name, exact: true }).click();
  await page.locator(`main[data-mode="${mode}"]`).waitFor();
  // The camera eases toward the selected device.
  await page.waitForTimeout(1400);
}

async function assertVisibleFrame(page, selector) {
  const box = await page.locator(selector).boundingBox();
  const viewport = page.viewportSize();
  assert(box && box.width > 100 && box.height > 60, `Empty device: ${selector}`);
  assert(box.x >= -2 && box.y >= 40 && box.x + box.width <= viewport.width + 2 && box.y + box.height < viewport.height - 58, `Device outside viewport: ${selector}: ${JSON.stringify(box)}`);
}

async function inspect(label, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1, isMobile: label === 'mobile' });
  page.on('pageerror', error => errors.push(`${label}: ${error.message}`));
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.locator('canvas[data-ready="true"]').waitFor();
  await page.waitForTimeout(500);
  await capture(page, `${label}-room`);
  const canvas = PNG.sync.read(await page.locator('canvas').screenshot());
  const colors = new Set();
  for (let y = 0; y < canvas.height; y += 17) for (let x = 0; x < canvas.width; x += 17) {
    const i = (y * canvas.width + x) * 4;
    colors.add(`${canvas.data[i] >> 4},${canvas.data[i + 1] >> 4},${canvas.data[i + 2] >> 4}`);
  }
  assert(colors.size > 30, `Canvas appears blank (${colors.size} colors)`);
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth && document.documentElement.scrollHeight <= innerHeight), 'Page overflows viewport');

  // Click the actual room object label, then use the device's physical buttons.
  await page.getByRole('button', { name: 'Projects 3DS', exact: true }).click();
  await page.waitForTimeout(1400);
  await assertVisibleFrame(page, '[data-testid="project-screen"]');
  await assertVisibleFrame(page, '.ds-lower-screen');
  assert.equal(await page.locator('.project-heading h2').textContent(), 'Trakkit');
  await capture(page, `${label}-3ds`);
  const names = ['BuildWith', 'Henry Jr.', 'Self-sustainable garden', 'MissedDay', 'Binomial theorem in Lean', 'Rock-paper-scissors', 'Feathers Pandemonium', 'Trakkit'];
  for (const name of names) {
    await page.getByRole('button', { name: '3DS next project', exact: true }).click();
    assert.equal(await page.locator('.project-heading h2').textContent(), name);
    assert((await page.locator('.project-description').textContent()).length > 60);
  }
  await page.getByRole('button', { name: '3DS previous project', exact: true }).click();
  assert.equal(await page.locator('.project-heading h2').textContent(), 'Feathers Pandemonium');
  await page.getByRole('button', { name: '3DS project details', exact: true }).click();
  assert(await page.locator('.project-facts').isVisible());
  assert.equal(await page.getByRole('link', { name: '3DS open Feathers Pandemonium', exact: true }).getAttribute('href'), 'https://github.com/DinasaurRex/Plumes-et-pandemonium');
  await page.getByRole('button', { name: '3DS next project', exact: true }).click();
  assert.equal(await page.getByRole('link', { name: 'Visit Trakkit' }).getAttribute('href'), 'https://tracker.littlerayofdina.com');

  await focus(page, 'Open Computer', 'about');
  await assertVisibleFrame(page, '[data-testid="computer-screen"]');
  await page.getByRole('button', { name: 'Experience', exact: true }).click();
  assert.equal(await page.locator('.experience-entry h2').textContent(), 'McGill Robotics');
  await page.getByRole('button', { name: 'Next entry', exact: true }).click();
  assert.equal(await page.locator('.experience-entry h3').textContent(), 'Web Developer');
  assert((await page.locator('.experience-entry').textContent()).includes('35%'));
  await page.getByRole('button', { name: 'Education', exact: true }).click();
  await page.getByRole('button', { name: 'Next entry', exact: true }).click();
  assert.equal(await page.locator('.experience-entry h2').textContent(), 'John Abbott College');
  assert.equal(await page.getByRole('link', { name: 'LinkedIn', exact: true }).getAttribute('href'), 'https://www.linkedin.com/in/dinasaab/');
  await capture(page, `${label}-computer`);

  await focus(page, 'Open Cassette player', 'hardware');
  await assertVisibleFrame(page, '[data-testid="hardware-screen"]');
  await page.getByRole('button', { name: 'Next hardware project', exact: true }).click();
  assert.equal(await page.locator('.cassette-display h2').textContent(), 'Self-sustainable garden');
  await page.getByRole('button', { name: 'Pause cassette', exact: true }).click();
  assert(await page.getByRole('button', { name: 'Play cassette', exact: true }).isVisible());
  await page.getByRole('button', { name: 'Play cassette', exact: true }).click();
  await capture(page, `${label}-cassette`);

  await focus(page, 'Open Turntable', 'contact');
  await assertVisibleFrame(page, '[data-testid="contact-screen"]');
  assert.equal(await page.getByRole('link', { name: 'Open Email', exact: true }).getAttribute('href'), 'mailto:dina07.saab@gmail.com');
  await page.getByRole('button', { name: 'Next contact', exact: true }).click();
  assert.equal(await page.getByRole('link', { name: 'Open GitHub', exact: true }).getAttribute('href'), 'https://github.com/DinasaurRex');
  await capture(page, `${label}-turntable`);
  const frame1 = PNG.sync.read(await page.locator('canvas').screenshot());
  await page.waitForTimeout(350);
  const frame2 = PNG.sync.read(await page.locator('canvas').screenshot());
  let changed = 0;
  for (let i = 0; i < frame1.data.length; i += 16) if (Math.abs(frame1.data[i] - frame2.data[i]) > 10) changed++;
  assert(changed > 10, 'The turntable does not animate');

  await focus(page, 'Open 3DS', 'projects');
  assert.equal(await page.locator('.project-heading h2').textContent(), 'Trakkit', 'Project position was lost');
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('.project-heading h2').textContent(), 'BuildWith');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('main').getAttribute('data-mode'), 'desk');
  console.log(`${label}: 3D rendered (${colors.size} sampled colors), animation (${changed} changed pixels), all device navigation and links passed`);
  await page.close();
}

try {
  await inspect('desktop', { width: 1440, height: 900 });
  await inspect('mobile', { width: 390, height: 844 });
  assert.deepEqual(errors, [], 'Browser runtime errors');
} finally { if (errors.length) console.log('Browser errors:', errors); await browser.close(); }

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
  return await page.screenshot({ path: fileURLToPath(new URL(`${label}.png`, outputDir)) });
}

async function waitForCamera(page) {
  let previous = [];
  let stableFrames = 0;
  for (let attempt = 0; attempt < 80; attempt++) {
    await page.waitForTimeout(150);
    const bounds = await page.locator('.device-focused').evaluateAll(elements => elements.flatMap(element => {
      const { x, y, width, height } = element.getBoundingClientRect();
      return [x, y, width, height];
    }));
    if (bounds.length && bounds.length === previous.length && bounds.every((value, i) => Math.abs(value - previous[i]) < 0.25)) stableFrames++;
    else stableFrames = 0;
    if (stableFrames >= 3) return;
    previous = bounds;
  }
  assert.fail('Device camera did not settle');
}

async function focus(page, name, mode) {
  await page.getByRole('button', { name, exact: true }).click();
  await page.locator(`main[data-mode="${mode}"]`).waitFor();
  await waitForCamera(page);
}

async function assertVisibleFrame(page, selector) {
  const box = await page.locator(selector).boundingBox();
  const viewport = page.viewportSize();
  assert(box && box.width > 100 && box.height > 60, `Empty device: ${selector}`);
  assert(box.x >= -2 && box.y >= 40 && box.x + box.width <= viewport.width + 2 && box.y + box.height < viewport.height - 58, `Device outside viewport: ${selector}: ${JSON.stringify(box)}`);
}

async function assertStandbyControls(page) {
  for (const selector of ['.physical-circle-pad', '.physical-dpad', '.physical-ab', '.physical-home']) {
    // Drei may cull a control behind the camera, but switching modes must not hide its surface.
    const enabled = await page.locator(selector).evaluate(element => element.closest('.device-surface').parentElement.style.display === 'block');
    assert(enabled, `Physical controls disappeared with the screen off: ${selector}`);
  }
  for (const selector of ['[data-testid="project-screen"]', '.ds-lower-screen']) {
    assert.equal(await page.locator(selector).isVisible(), false, `Standby display is still on: ${selector}`);
  }
}

async function inspect(label, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1, isMobile: label === 'mobile' });
  page.on('pageerror', error => errors.push(`${label}: ${error.message}`));
  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.locator('canvas[data-ready="true"]').waitFor();
  await page.waitForTimeout(500);
  await capture(page, `${label}-room`);
  const roomComputer = await page.locator('[data-testid="computer-screen"]').boundingBox();
  const roomProjects = await page.locator('[data-testid="project-screen"]').boundingBox();
  const roomHardware = await page.locator('[data-testid="hardware-screen"]').boundingBox();
  assert(roomComputer && roomProjects && roomHardware, 'Room device screens are missing');
  assert(roomProjects.width < roomComputer.width * 0.7, 'The handheld is oversized beside the monitor');
  assert(roomHardware.width < roomComputer.width * 0.65, 'The cassette player is oversized beside the monitor');
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
  await waitForCamera(page);
  await capture(page, `${label}-3ds`);
  await assertVisibleFrame(page, '[data-testid="project-screen"]');
  assert((await page.locator('[data-testid="project-screen"]').boundingBox()).width > roomProjects.width * 1.8, 'The smaller handheld does not zoom in enough');
  await assertVisibleFrame(page, '.ds-lower-screen');
  const lowerScreen = await page.locator('.ds-lower-screen').boundingBox();
  assert(lowerScreen.height >= (label === 'mobile' ? 140 : 230), 'Lower screen is too foreshortened to read');
  assert.equal(await page.locator('.project-heading h2').textContent(), 'Trakkit');
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
  assert(await page.locator('.project-facts').evaluate(element => parseFloat(getComputedStyle(element).fontSize) >= 18), 'Project details text is too small');
  await capture(page, `${label}-3ds-details`);
  assert.equal(await page.getByRole('link', { name: '3DS open Feathers Pandemonium', exact: true }).getAttribute('href'), 'https://github.com/DinasaurRex/Plumes-et-pandemonium');
  await page.getByRole('button', { name: '3DS next project', exact: true }).click();
  assert.equal(await page.getByRole('link', { name: 'Visit Trakkit' }).getAttribute('href'), 'https://tracker.littlerayofdina.com');
  await page.getByRole('button', { name: '3DS X previous project', exact: true }).click();
  assert.equal(await page.locator('.project-heading h2').textContent(), 'Feathers Pandemonium');
  await page.getByRole('button', { name: '3DS Y next project', exact: true }).click();
  await page.getByRole('button', { name: '3DS circle pad next project', exact: true }).click();
  assert.equal(await page.locator('.project-heading h2').textContent(), 'BuildWith');
  await page.getByRole('button', { name: '3DS show details', exact: true }).click();
  assert(await page.locator('.project-facts').isVisible());
  await page.getByRole('button', { name: '3DS show stack', exact: true }).click();
  assert(await page.locator('.project-stack').isVisible());
  await page.getByRole('button', { name: '3DS X previous project', exact: true }).click();
  await capture(page, `${label}-3ds`);

  await focus(page, 'Open Computer', 'about');
  await assertVisibleFrame(page, '[data-testid="computer-screen"]');
  await assertStandbyControls(page);
  assert.equal(await page.locator('[data-testid="contact-screen"]').isVisible(), false);
  await capture(page, `${label}-standby`);
  await page.getByRole('button', { name: '3DS return to desk', exact: true }).dispatchEvent('click');
  assert.equal(await page.locator('main').getAttribute('data-mode'), 'desk', 'Standby Home button reopens the 3DS');
  await focus(page, 'Open Computer', 'about');
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
  await assertStandbyControls(page);
  await assertVisibleFrame(page, '[data-testid="hardware-screen"]');
  const cassetteProjection = await page.locator('[data-testid="hardware-screen"]').evaluate(element => {
    const bounds = element.getBoundingClientRect();
    return { projected: bounds.width / bounds.height, native: element.offsetWidth / element.offsetHeight };
  });
  assert(Math.abs(cassetteProjection.projected / cassetteProjection.native - 1) < 0.02, 'Cassette close-up is foreshortened instead of facing its screen');
  assert((await page.locator('[data-testid="hardware-screen"]').boundingBox()).width > roomHardware.width * 1.8, 'The smaller cassette player does not zoom in enough');
  await page.getByRole('button', { name: 'Next hardware project', exact: true }).click();
  assert.equal(await page.locator('.cassette-display h2').textContent(), 'Self-sustainable garden');
  await page.getByRole('button', { name: 'Pause cassette', exact: true }).click();
  assert(await page.getByRole('button', { name: 'Play cassette', exact: true }).isVisible());
  await page.getByRole('button', { name: 'Play cassette', exact: true }).click();
  await capture(page, `${label}-cassette`);

  await focus(page, 'Open Turntable', 'contact');
  await assertStandbyControls(page);
  await assertVisibleFrame(page, '[data-testid="contact-screen"]');
  const glassBox = await page.locator('[data-testid="contact-screen"]').boundingBox();
  const contactScreen = page.locator('[data-testid="contact-screen"]');
  await contactScreen.evaluate(element => { element.style.visibility = 'hidden'; });
  let glassFrame;
  try {
    glassFrame = PNG.sync.read(await page.locator('canvas').screenshot());
    await capture(page, `${label}-turntable-standby`);
  } finally {
    await contactScreen.evaluate(element => { element.style.removeProperty('visibility'); });
  }
  const glassPixel = (Math.floor(glassBox.y + glassBox.height / 2) * glassFrame.width + Math.floor(glassBox.x + glassBox.width / 2)) * 4;
  assert(Math.max(...glassFrame.data.subarray(glassPixel, glassPixel + 3)) < 90, 'The turntable has no dark physical screen behind its content');
  assert.equal(await page.getByRole('link', { name: 'Open Email', exact: true }).getAttribute('href'), 'mailto:dina07.saab@gmail.com');
  await page.getByRole('button', { name: 'Next contact', exact: true }).click();
  assert.equal(await page.getByRole('link', { name: 'Open GitHub', exact: true }).getAttribute('href'), 'https://github.com/DinasaurRex');
  const contactFrame = PNG.sync.read(await capture(page, `${label}-turntable`));
  const contactBox = await page.locator('[data-testid="contact-screen"]').boundingBox();
  let visibleVinyl = 0;
  // The record must remain visible below the screen, not behind the HTML overlay.
  for (let y = Math.ceil(contactBox.y + contactBox.height); y < contactFrame.height - 65; y++) {
    for (let x = Math.max(0, Math.floor(contactBox.x - contactBox.width * 0.15)); x < Math.min(contactFrame.width, contactBox.x + contactBox.width * 1.15); x++) {
      const i = (y * contactFrame.width + x) * 4;
      if (contactFrame.data[i] < 60 && contactFrame.data[i + 1] < 60 && contactFrame.data[i + 2] < 65) visibleVinyl++;
    }
  }
  assert(visibleVinyl > viewport.width * viewport.height * 0.003, `${label}: the contact screen hides the vinyl`);
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
  await page.getByRole('button', { name: '3DS return to desk', exact: true }).click();
  assert.equal(await page.locator('main').getAttribute('data-mode'), 'desk');
  await focus(page, 'Open 3DS', 'projects');
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

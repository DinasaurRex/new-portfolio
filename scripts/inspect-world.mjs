import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', error => console.log('ERROR', error.message));
page.on('console', message => { if (message.type() === 'error' || message.type() === 'warn') console.log(message.text()); });
await page.goto('http://localhost:5174/', { waitUntil: 'networkidle' });
await page.locator('canvas[data-ready="true"]').waitFor();
await page.waitForTimeout(2000);
console.log('SCREENS', await page.locator('.device-surface').allTextContents());
await page.getByRole('button', { name: 'Open Computer', exact: true }).click();
await page.waitForTimeout(1600);
await page.screenshot({ path: 'test-results/computer-debug.png' });
console.log('AFTER', await page.locator('.device-surface').allTextContents());
console.log(await page.locator('[data-testid="computer-screen"]').evaluate(el => {
  const result = [];
  for (let node = el; node && result.length < 6; node = node.parentElement) { const s = getComputedStyle(node); result.push({ class: node.className, display: s.display, opacity: s.opacity, transform: s.transform, zIndex: s.zIndex, rect: node.getBoundingClientRect().toJSON() }); }
  return result;
}));
await page.getByRole('button', { name: 'Open Computer', exact: true }).click();
await page.waitForTimeout(1600);
await page.screenshot({ path: 'test-results/computer-debug.png' });
console.log(await page.locator('[data-testid="computer-screen"]').boundingBox());
await browser.close();

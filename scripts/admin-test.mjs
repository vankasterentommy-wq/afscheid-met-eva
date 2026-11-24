// Test visual editing in /admin (lokaal, tinacms dev op :4321). Maakt ook screenshots voor de handleiding.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = '_controle/admin';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', (e) => console.log('pageerror:', e.message));

await page.goto('http://localhost:4321/admin/index.html#/~/kosten', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
await page.screenshot({ path: `${OUT}/00-inloggen.png` });
const enter = page.getByRole('button', { name: /Enter Edit Mode/i });
if (await enter.count()) await enter.click();
await page.waitForTimeout(8000);
await page.screenshot({ path: `${OUT}/01-admin-kosten.png` });

const frame = page.frameLocator('iframe').first();
const h1 = frame.locator('h1').first();
console.log('preview h1:', await h1.textContent({ timeout: 20000 }));
const forms = await page.frames().map((f) => f.url());
console.log('frames:', forms);

// klik op de titel in de preview → het juiste veld moet focus krijgen
await h1.click();
await page.waitForTimeout(2500);
await page.screenshot({ path: `${OUT}/02-klik-op-titel.png` });
const focused = await page.evaluate(() => {
  const a = document.activeElement;
  return a ? { tag: a.tagName, name: a.getAttribute('name'), value: a.value } : null;
});
console.log('focus na klik:', focused);

// tekst aanpassen via het veld en kijken of de preview meebeweegt
const input = page.locator('input[name$="titel"]').filter({ hasText: '' }).first();
const target = (await page.locator(`input[value="Heldere kosten, vooraf"]`).count())
  ? page.locator(`input[value="Heldere kosten, vooraf"]`).first()
  : input;
await target.fill('Heldere kosten, vooraf TEST');
await page.waitForTimeout(4000);
console.log('preview h1 na bewerken:', await frame.locator('h1').first().textContent());
await page.screenshot({ path: `${OUT}/03-na-bewerken.png` });
await browser.close();

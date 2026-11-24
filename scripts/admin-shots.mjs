// Screenshots van /admin voor HANDLEIDING-EVA.md (lokaal; niets wordt opgeslagen).
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
const OUT = 'docs/img';
mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
await page.goto('http://localhost:4321/admin/index.html#/~/over-eva', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const enter = page.getByRole('button', { name: /Enter Edit Mode/i });
if (await enter.count()) await enter.click();
await page.waitForTimeout(7000);
await shot('01-scherm-overzicht');
const frame = page.frameLocator('iframe').first();
// 2. tekst aanpassen: klik op een alinea
await frame.locator('p.lead').first().click();
await page.waitForTimeout(2000);
await shot('02-tekst-aanpassen');
// 3. foto wisselen: klik op de foto
await frame.locator('img.fam').first().click();
await page.waitForTimeout(2000);
await shot('03-foto-veld');
await page.locator('input[name$="foto"]').count();
// 4. blokkenlijst
await page.goto('http://localhost:4321/admin/index.html#/~/over-eva', { waitUntil: 'networkidle' });
await page.waitForTimeout(6000);
await shot('04-blokkenlijst');
await browser.close();

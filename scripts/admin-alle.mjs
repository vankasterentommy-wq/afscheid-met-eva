// Visual editing op elke pagina: klik op de hoofdkop → veld krijgt focus → wijziging zichtbaar in preview (niet opslaan).
import { chromium } from 'playwright';
const slugs = process.argv.slice(2).length ? process.argv.slice(2) : ['home', 'overlijden-melden', 'uitvaart-regelen', 'kosten', 'voor-overlijden', 'over-eva', 'contact', 'privacy', 'voorwaarden'];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://localhost:4321/admin/index.html#/~/', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);
const enter = page.getByRole('button', { name: /Enter Edit Mode/i });
if (await enter.count()) await enter.click();
for (const s of slugs) {
  await page.goto(`http://localhost:4321/admin/index.html#/~/${s === 'home' ? '' : s}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(5000);
  const frame = page.frameLocator('iframe').first();
  const h1 = frame.locator('h1').first();
  const voor = (await h1.textContent({ timeout: 15000 })).trim();
  await h1.click();
  await page.waitForTimeout(1500);
  const veld = await page.evaluate(() => document.activeElement?.getAttribute('name'));
  await page.keyboard.press('End');
  await page.keyboard.type(' ✎');
  await page.waitForTimeout(3500);
  const na = (await h1.textContent()).trim();
  console.log(`${s.padEnd(18)} veld=${veld}  preview bijgewerkt=${na === voor + ' ✎' ? 'JA' : 'NEE (' + na + ')'}`);
  const reset = page.getByRole('button', { name: /^Reset$/ });
  if (await reset.count()) { await reset.click(); const ok = page.getByRole('button', { name: /^(Reset|Confirm|Yes)$/ }).last(); if (await ok.count()) await ok.click().catch(() => {}); }
}
await browser.close();

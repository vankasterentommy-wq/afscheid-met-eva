// Maakt de PDF-handleiding voor Eva uit docs/handleiding/handleiding.html
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const html = pathToFileURL(resolve('docs/handleiding/handleiding.html')).href;
const out = process.argv[2] || resolve('..', 'Handleiding website Eva.pdf');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(html, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
// Controle-afbeeldingen per pagina
if (process.argv[3]) {
  await page.setViewportSize({ width: 794, height: 1123 });
  await page.emulateMedia({ media: 'print' });
  const n = await page.locator('.pagina').count();
  for (let i = 0; i < n; i++) await page.locator('.pagina').nth(i).screenshot({ path: `${process.argv[3]}/p${i + 1}.png` });
  console.log('pagina\'s:', n);
}
await browser.close();
console.log(out);

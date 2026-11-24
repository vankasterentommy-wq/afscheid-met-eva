// Test cookiemelding: geen Google-verzoeken vóór toestemming; na "Akkoord" wel; conversies bij klik.
import { chromium } from 'playwright';
const B = process.env.NEW ?? 'http://localhost:4500';
const browser = await chromium.launch();
for (const [w, h, m] of [[390, 844, true], [1440, 900, false]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: m, hasTouch: m });
  const page = await ctx.newPage();
  const google = [];
  page.on('request', (r) => { if (/google|doubleclick/.test(r.url())) google.push(r.url()); });
  await page.route(/googletagmanager\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  await page.goto(B + '/', { waitUntil: 'networkidle' });
  const zichtbaar = await page.locator('#consent').isVisible();
  await page.screenshot({ path: `_controle/consent-${w}.png` });
  console.log(`${w}: melding zichtbaar=${zichtbaar}, Google-verzoeken vóór keuze=${google.length}`);
  if (w === 390) {
    const c = await page.locator('#consent').boundingBox(); const mb = await page.locator('.mbar').boundingBox();
    console.log(`   melding onderkant=${Math.round(c.y + c.height)} belbalk bovenkant=${Math.round(mb.y)} (vrij=${c.y + c.height <= mb.y})`);
  }
  await page.getByRole('button', { name: 'Liever niet' }).click();
  await page.reload({ waitUntil: 'networkidle' });
  console.log(`   na "Liever niet" + herladen: melding=${await page.locator('#consent').isVisible()}, Google-verzoeken=${google.length}`);
  await page.locator('[data-consent-open]').first().click();
  await page.getByRole('button', { name: 'Akkoord' }).click();
  await page.waitForTimeout(500);
  const dl = await page.evaluate(() => (window.dataLayer || []).map((a) => Array.from(a).map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(' ')));
  console.log(`   na "Akkoord": gtag-script geladen=${google.some((u) => u.includes('gtag/js'))}`);
  await page.evaluate(() => { document.querySelector('a[href^="tel:"]').addEventListener('click', (e) => e.preventDefault(), { once: true }); });
  await page.locator('.mbar a[href^="tel:"], .hero a[href^="tel:"]').first().click({ force: true }).catch(() => {});
  const na = await page.evaluate(() => (window.dataLayer || []).map((a) => Array.from(a).map((x) => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(' ')));
  console.log('   dataLayer:', na.filter((x) => /config|conversion|bel_klik/.test(x)).join(' | '));
  await ctx.close();
}
await browser.close();

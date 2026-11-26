// Screenshots voor de PDF-handleiding van Eva (lokale admin; er wordt niets opgeslagen).
// Gebruik: npm run dev (in een ander venster), daarna: node scripts/handleiding-shots.mjs
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const OUT = 'docs/handleiding';
mkdirSync(OUT, { recursive: true });
const ADMIN = 'http://localhost:4321/admin/index.html';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 860 }, deviceScaleFactor: 1.5 });
const wacht = (ms) => page.waitForTimeout(ms);

// De melding "You are in local mode" ziet Eva niet; voor de screenshots verbergen.
const verbergLokaal = () =>
  page.evaluate(() => {
    for (const el of document.querySelectorAll('body *')) {
      if (el.children.length === 0 && /local mode/i.test(el.textContent || '')) {
        // omhoog tot het hele (smalle) meldingsvakje, inclusief rand en icoontje
        let b = el;
        while (b.parentElement && b.parentElement.getBoundingClientRect().width < 340) b = b.parentElement;
        b.style.visibility = 'hidden';
      }
    }
  });
const shot = async (naam, clip) => { await verbergLokaal(); await page.screenshot({ path: `${OUT}/${naam}.png`, clip }); console.log('✓', naam); };

// 0. Inlogscherm op de live site
await page.goto('https://afscheid-met-eva.netlify.app/admin', { waitUntil: 'networkidle' });
await wacht(2500);
await page.screenshot({ path: `${OUT}/00-inloggen.png` });
console.log('✓ 00-inloggen');

// 1. Overzicht: homepage in de editor
await page.goto(`${ADMIN}#/~/`, { waitUntil: 'networkidle' });
await wacht(3000);
const enter = page.getByRole('button', { name: /Enter Edit Mode/i });
if (await enter.count()) await enter.click();
await wacht(7000);
await shot('01-overzicht');

const frame = page.frameLocator('iframe').first();

// 2. Tekst aanpassen: klik op de introtekst van de hero
await frame.locator('.hero-txt p').first().click();
await wacht(2500);
await shot('02-tekst');

// 3. Foto: klik op de hero-foto
await page.goto('about:blank');
await page.goto(`${ADMIN}#/~/`, { waitUntil: 'networkidle' });
await wacht(7000);
await frame.locator('.hero img.arch').first().click();
await wacht(2500);
await shot('03-foto');

// 4. Blokkenlijst (zelfde pagina, vers geladen)
await page.goto('about:blank');
await page.goto(`${ADMIN}#/~/`, { waitUntil: 'networkidle' });
await wacht(7000);
await shot('04-blokken', { x: 0, y: 0, width: 440, height: 860 });

// 5. Opslaan-knoppen (linksonder)
await shot('05-opslaan', { x: 0, y: 760, width: 440, height: 100 });

// 7. Instellingen-formulier (contactgegevens)
await page.goto(`${ADMIN}#/collections/edit/instellingen/site`, { waitUntil: 'networkidle' });
await wacht(5000);
await shot('07-instellingen');

await browser.close();

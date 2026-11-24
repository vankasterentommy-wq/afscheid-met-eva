// Visuele vergelijking bron ↔ nieuwe build.
// Vereist: node scripts/serve.mjs dist 4500  én  node scripts/serve.mjs _bron 4501
// Gebruik: node scripts/compare.mjs [uitvoermap]
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { mkdirSync, writeFileSync } from 'node:fs';

const OUT = process.argv[2] ?? '_controle';
mkdirSync(OUT, { recursive: true });
const SRC = 'http://localhost:4501/index.html';
const NEW = 'http://localhost:4500';
const pages = [
  ['home', '#home', '/'],
  ['overlijden-melden', '#overlijden', '/overlijden-melden'],
  ['uitvaart-regelen', '#uitvaart', '/uitvaart-regelen'],
  ['kosten', '#kosten', '/kosten'],
  ['voor-overlijden', '#voor-overlijden', '/voor-overlijden'],
  ['over-eva', '#over-eva', '/over-eva'],
  ['contact', '#contact', '/contact'],
];
const widths = [
  { w: 390, h: 844, mobile: true },
  { w: 1440, h: 900, mobile: false },
];

const settle = async (page) => {
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); }
    window.scrollTo(0, 0);
    // verborgen lazy-afbeeldingen (display:none) laden nooit: maximaal 3 s wachten
    const wait = Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
    await Promise.race([wait, new Promise((r) => setTimeout(r, 3000))]);
    await document.fonts.ready;
  });
  await page.waitForTimeout(300);
};

const browser = await chromium.launch();
const results = [];
for (const vp of widths) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: vp.mobile, hasTouch: vp.mobile, deviceScaleFactor: 1 });
  for (const [name, hash, path] of pages) {
    const a = await ctx.newPage();
    await a.goto(SRC + hash, { waitUntil: 'networkidle' });
    await a.addStyleTag({ content: '.preview{display:none!important}' });
    await settle(a);
    const bufA = await a.screenshot({ fullPage: true });
    const b = await ctx.newPage();
    await b.goto(NEW + path, { waitUntil: 'networkidle' });
    await settle(b);
    const bufB = await b.screenshot({ fullPage: true });
    const overflow = await b.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await a.close(); await b.close();

    const A = PNG.sync.read(bufA), B = PNG.sync.read(bufB);
    const w = Math.min(A.width, B.width), h = Math.min(A.height, B.height);
    const crop = (img) => { const o = new PNG({ width: w, height: h }); PNG.bitblt(img, o, 0, 0, w, h, 0, 0); return o; };
    const ca = crop(A), cb = crop(B), diff = new PNG({ width: w, height: h });
    const n = pixelmatch(ca.data, cb.data, diff.data, w, h, { threshold: 0.1 });
    // naast elkaar: bron | nieuw | verschil
    const side = new PNG({ width: w * 3 + 40, height: Math.max(A.height, B.height) });
    side.data.fill(255);
    PNG.bitblt(A, side, 0, 0, A.width, A.height, 0, 0);
    PNG.bitblt(B, side, 0, 0, B.width, B.height, w + 20, 0);
    PNG.bitblt(diff, side, 0, 0, w, h, 2 * w + 40, 0);
    const tag = `${name}-${vp.w}`;
    writeFileSync(`${OUT}/${tag}-bron.png`, bufA);
    writeFileSync(`${OUT}/${tag}-nieuw.png`, bufB);
    writeFileSync(`${OUT}/${tag}-naast-elkaar.png`, PNG.sync.write(side));
    const r = { pagina: name, breedte: vp.w, hoogteBron: A.height, hoogteNieuw: B.height, verschilPx: n, verschilPct: +((n / (w * h)) * 100).toFixed(3), overflow };
    results.push(r);
    console.log(JSON.stringify(r));
  }
  await ctx.close();
}
await browser.close();
writeFileSync(`${OUT}/resultaat.json`, JSON.stringify(results, null, 2));

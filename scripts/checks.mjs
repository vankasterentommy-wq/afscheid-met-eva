// Automatische controles op de build. Vereist: node scripts/serve.mjs dist 4500 (+ _bron op 4501 voor de tekstcontrole)
import { chromium } from 'playwright';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';

const NEW = 'http://localhost:4500';
const paths = ['/', '/overlijden-melden', '/uitvaart-regelen', '/kosten', '/voor-overlijden', '/over-eva', '/contact', '/privacy', '/voorwaarden', '/bedankt', '/404'];
const browser = await chromium.launch();
const report = { overflow: [], tikvlakken: [], hero: null, tekst: null };

// 1. Horizontale overflow
for (const w of [360, 390, 768, 1100, 1440]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 844 }, isMobile: w < 861, hasTouch: w < 861 });
  const page = await ctx.newPage();
  for (const p of paths) {
    await page.goto(NEW + p, { waitUntil: 'load' });
    const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    report.overflow.push({ breedte: w, pagina: p, overflowPx: o });
    // 2. Tikvlakken (alleen mobiel 390): zichtbare links/knoppen lager dan 44px
    if (w === 390) {
      const small = await page.evaluate(() =>
        [...document.querySelectorAll('a[href], button, summary, input[type=radio]')]
          .filter((el) => el.offsetParent !== null && !el.closest('.hp'))
          .map((el) => { const r = (el.closest('label') ?? el).getBoundingClientRect(); return { t: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 40), h: Math.round(r.height), w: Math.round(r.width) }; })
          .filter((x) => x.h < 44 || x.w < 44)
      );
      small.forEach((s) => report.tikvlakken.push({ pagina: p, ...s }));
    }
  }
  await ctx.close();
}

// 3. Hero-knop vs. vaste belbalk op 390×844
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(NEW + '/', { waitUntil: 'load' });
  report.hero = await page.evaluate(() => {
    const btn = document.querySelector('.hero .btns .btn').getBoundingClientRect();
    const bar = document.querySelector('.mbar').getBoundingClientRect();
    return { knopOnderkant: Math.round(btn.bottom), belbalkBovenkant: Math.round(bar.top), vrij: btn.bottom <= bar.top };
  });
  await ctx.close();
}

// 4. Tekstcontrole: elke tekst uit de bron moet letterlijk in de nieuwe build staan
{
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4501/index.html', { waitUntil: 'load' });
  const bron = await page.evaluate(() => {
    const sel = 'p, li, h1, h2, h3, summary, q, strong, small, b, legend, label, span, a, button';
    return [...document.querySelectorAll(sel)]
      .filter((el) => !el.closest('.preview') && ![...el.children].some((c) => c.matches('p, li, div, span, b, small, strong, h3')))
      .map((el) => { const c = el.cloneNode(true); c.querySelectorAll('br').forEach((b) => b.replaceWith(' ')); return c.textContent; });
  });
  const nieuw = paths.map((p) => readFileSync(`dist${p === '/' ? '/index' : p}.html`, 'utf8')).join('\n');
  // HTML → platte tekst (tags weg, entities terug)
  const plat = norm(
    nieuw.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
  );
  const uniek = [...new Set(bron.map(norm).filter(Boolean))];
  const ontbreekt = uniek.filter((t) => !plat.includes(t));
  report.tekst = { gecontroleerd: uniek.length, gevonden: uniek.length - ontbreekt.length, ontbreekt };
  await ctx.close();
}
await browser.close();

writeFileSync('_controle/checks.json', JSON.stringify(report, null, 2));
const maxO = Math.max(...report.overflow.map((o) => o.overflowPx));
console.log(`Overflow: max ${maxO}px over ${report.overflow.length} pagina×breedte-combinaties`, report.overflow.filter((o) => o.overflowPx > 0));
console.log('Tikvlakken < 44px (390):', report.tikvlakken.length ? report.tikvlakken : 'geen');
console.log('Hero-knop vs belbalk:', report.hero);
console.log(`Tekst: ${report.tekst.gevonden}/${report.tekst.gecontroleerd} bronteksten letterlijk gevonden`);
report.tekst.ontbreekt.forEach((t) => console.log('  ONTBREEKT:', t));

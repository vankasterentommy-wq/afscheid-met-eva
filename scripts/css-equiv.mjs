// Controleert of de omgezette CSS (src/styles/global.css, zonder de Astro-aanvullingen)
// exact dezelfde computed styles geeft als de bron-CSS, op de bron-DOM, voor alle pagina's.
// Vereist: node scripts/serve.mjs _bron 4501
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const css = readFileSync('src/styles/global.css', 'utf8').split('/* ---------- Astro-versie')[0];
const pages = ['home', 'overlijden', 'uitvaart', 'kosten', 'voor-overlijden', 'over-eva', 'contact'];
const PROPS = ['display', 'position', 'width', 'height', 'margin-top', 'margin-bottom', 'margin-left', 'padding-top', 'padding-bottom', 'padding-left', 'padding-right',
  'font-size', 'font-family', 'font-weight', 'line-height', 'color', 'background-color', 'gap', 'row-gap', 'column-gap', 'grid-template-columns', 'flex-direction',
  'text-align', 'border-top-width', 'border-bottom-color', 'opacity', 'top', 'left', 'right', 'bottom', 'object-position', 'order', 'justify-content', 'align-items'];

const collect = (page, props) => page.evaluate((props) => {
  const out = [];
  document.querySelectorAll('body *').forEach((el, i) => {
    if (el.closest('main[hidden]') || el.closest('svg') || el.closest('.preview')) return;
    const cs = getComputedStyle(el);
    const pseudo = (p) => { const s = getComputedStyle(el, p); return s.content === 'none' ? '' : `${s.content}|${s.display}|${s.width}`; };
    out.push({ i, tag: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ').join('.') : ''),
      v: props.map((p) => cs.getPropertyValue(p)).join('§') + '§' + pseudo('::before') + '§' + pseudo('::after') });
  });
  return out;
}, props);

const browser = await chromium.launch();
let total = 0;
for (const vp of [{ w: 360, m: true }, { w: 390, m: true }, { w: 768, m: true }, { w: 1100, m: false }, { w: 1440, m: false }]) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: 900 }, isMobile: vp.m, hasTouch: vp.m });
  for (const p of pages) {
    const a = await ctx.newPage();
    await a.goto(`http://localhost:4501/index.html#${p}`, { waitUntil: 'load' });
    const A = await collect(a, PROPS);
    // zelfde DOM, maar met de omgezette CSS en zonder de html.m-klasse/zoom
    await a.evaluate((css) => {
      document.documentElement.classList.remove('m'); document.documentElement.style.zoom = '';
      document.querySelector('style').textContent = css;
    }, css);
    const B = await collect(a, PROPS);
    const diffs = A.filter((x, k) => x.v !== B[k].v);
    total += diffs.length;
    for (const d of diffs.slice(0, 8)) {
      const b = B.find((y) => y.i === d.i);
      const va = d.v.split('§'), vb = b.v.split('§');
      const names = [...PROPS, '::before', '::after'];
      const changed = names.map((n, k) => (va[k] !== vb[k] ? `${n}: ${va[k]} → ${vb[k]}` : null)).filter(Boolean);
      console.log(`${vp.w} #${p} <${d.tag}> ${changed.join('; ')}`);
    }
    if (diffs.length > 8) console.log(`  … nog ${diffs.length - 8} elementen op #${p} @${vp.w}`);
    await a.close();
  }
  await ctx.close();
}
await browser.close();
console.log(total === 0 ? 'OK: computed styles identiek op alle breedtes' : `Verschillen: ${total}`);

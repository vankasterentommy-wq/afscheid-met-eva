// Mini static server voor lokale controles: node scripts/serve.mjs <map> <poort>
// - "mooie" URL's (/kosten → kosten.html) zoals Netlify
// - gzip voor tekst en cache-headers zoals Netlify
// - emulatie van de Netlify Image CDN (/.netlify/images?url=…&w=…) met sharp → WebP
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { gzipSync } from 'node:zlib';
import sharp from 'sharp';

const root = process.argv[2] ?? 'dist';
const port = Number(process.argv[3] ?? 4500);
const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.webp': 'image/webp', '.avif': 'image/avif',
};
const tryFile = async (p) => { try { const s = await stat(p); return s.isFile() ? p : null; } catch { return null; } };
const cache = new Map();

createServer(async (req, res) => {
  const u = new URL(req.url, 'http://x');
  const url = decodeURIComponent(u.pathname);

  if (url === '/.netlify/images') {
    const key = u.search;
    if (!cache.has(key)) {
      const src = join(root, normalize(u.searchParams.get('url') ?? '').replace(/^([/\\])+/, ''));
      const w = Number(u.searchParams.get('w')) || undefined;
      cache.set(key, await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 75 }).toBuffer());
    }
    res.writeHead(200, { 'content-type': 'image/webp', 'cache-control': 'public, max-age=31536000' });
    return res.end(cache.get(key));
  }

  const base = join(root, normalize(url).replace(/^([/\\])+/, ''));
  const file = (await tryFile(base)) || (await tryFile(base + '.html')) || (await tryFile(join(base, 'index.html')));
  if (!file) {
    const nf = await tryFile(join(root, '404.html'));
    res.writeHead(404, { 'content-type': types['.html'] });
    return res.end(nf ? await readFile(nf) : 'Not found');
  }
  const type = types[extname(file)] ?? 'application/octet-stream';
  let body = await readFile(file);
  const headers = { 'content-type': type };
  if (url.startsWith('/_astro/')) headers['cache-control'] = 'public, max-age=31536000, immutable';
  else if (url.startsWith('/img/')) headers['cache-control'] = 'public, max-age=86400';
  if (/text|javascript|json|xml|svg/.test(type) && /gzip/.test(req.headers['accept-encoding'] ?? '')) {
    body = gzipSync(body);
    headers['content-encoding'] = 'gzip';
  }
  res.writeHead(200, headers);
  res.end(body);
}).listen(port, () => console.log(`serving ${root} on http://localhost:${port}`));

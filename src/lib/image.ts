import { openSync, readSync, closeSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const MEDIA_ROOT = '/img'; // = media.tina.mediaRoot in tina/config.ts

/**
 * TinaCloud geeft foto's terug als https://assets.tina.io/<clientId>/x.jpg (pad relatief
 * aan de mediamap). Zet dat terug naar het lokale bestand /img/x.jpg, zodat de foto via
 * de Netlify Image CDN geoptimaliseerd wordt. Bestaat het lokale bestand niet (bv. net
 * geüpload in de bewerkpreview), dan blijft het TinaCloud-adres staan.
 */
export const toLocalPath = (src?: string | null): string | null => {
  if (!src) return null;
  if (src.startsWith('/')) return src;
  const m = src.match(/^https:\/\/assets\.tina\.io\/[^/]+(\/.+)$/);
  if (!m) return null;
  const rest = m[1];
  if (rest.startsWith(`${MEDIA_ROOT}/`)) return rest;
  const withRoot = `${MEDIA_ROOT}${rest}`;
  return existsSync(join(process.cwd(), 'public', decodeURIComponent(withRoot))) ? withRoot : rest;
};

/** Leest breedte/hoogte uit de kop van een JPEG- of PNG-bestand in public/. */
export const readDims = (publicPath: string): { width: number; height: number } | null => {
  const file = join(process.cwd(), 'public', decodeURIComponent(publicPath));
  if (!existsSync(file)) return null;
  const fd = openSync(file, 'r');
  try {
    const buf = Buffer.alloc(65536);
    const n = readSync(fd, buf, 0, buf.length, 0);
    if (buf.readUInt32BE(0) === 0x89504e47) return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < n - 9) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1];
        const len = buf.readUInt16BE(i + 2);
        if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
          return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
        }
        i += 2 + len;
      }
    }
    return null;
  } finally {
    closeSync(fd);
  }
};

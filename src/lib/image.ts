import { openSync, readSync, closeSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/** Tina-media kan als https://assets.tina.io/<id>/img/x.jpg terugkomen: terug naar /img/x.jpg. */
export const toLocalPath = (src?: string | null): string | null => {
  if (!src) return null;
  if (src.startsWith('/')) return src;
  const m = src.match(/^https:\/\/assets\.tina\.io\/[^/]+(\/.+)$/);
  return m ? m[1] : null;
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

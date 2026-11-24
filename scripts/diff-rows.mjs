// Toont y-bereiken met verschillen uit een *-naast-elkaar.png (derde kolom).
import { PNG } from 'pngjs';
import { readFileSync } from 'node:fs';
const [file, w] = [process.argv[2], Number(process.argv[3])];
const img = PNG.sync.read(readFileSync(file));
const x0 = 2 * w + 40, ranges = [];
let start = -1;
for (let y = 0; y < img.height; y++) {
  let hit = 0;
  for (let x = x0; x < x0 + w; x += 2) { const i = (y * img.width + x) * 4; if (img.data[i] > 200 && img.data[i + 1] < 60 && img.data[i + 2] < 60) hit++; }
  if (hit > 2 && start < 0) start = y;
  if (hit <= 2 && start >= 0) { if (y - start > 3) ranges.push([start, y]); start = -1; }
}
console.log(file.split('/').pop(), JSON.stringify(ranges.slice(0, 12)));

// Eenmalig: haalt de CSS uit de bron en vervangt de html:not(.m)-truc door gewone media queries.
import { readFileSync, writeFileSync } from 'node:fs';
const html = readFileSync(process.argv[2], 'utf8');
let css = html.match(/<style>([\s\S]*?)<\/style>/)[1];
css = css.replace(/html:not\(\.m\)\{/g, ':root{');
css = css.replace(/html:not\(\.m\) /g, '');
css = css.replace(/^\.preview\{.*\}\n/m, '');
// leesbaarder: één regel per desktop-regel
css = css.replace(/@media \(min-width: 861px\)\{([^\n]*)/g, (m, body) => '@media (min-width: 861px){\n' + body.replace(/\}(?=[^}])/g, '}\n'));
writeFileSync(process.argv[3], css.trim() + '\n');
console.log('lines', css.split('\n').length, 'leftover .m:', /\.m\b|not\(/.test(css));

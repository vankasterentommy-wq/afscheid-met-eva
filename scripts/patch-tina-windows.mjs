// Workaround voor een Windows-bug in @tinacms/cli: de glob voor GraphQL-queries wordt
// als absoluut pad gebouwd. Staat er een spatie in het pad (zoals "Website eva"), dan crasht
// `tinacms dev/build` met "Failed to parse the GraphQL document". Op Linux/macOS (Netlify) doet dit script niets.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

if (process.platform !== 'win32') process.exit(0);
const file = 'node_modules/@tinacms/cli/dist/index.js';
if (!existsSync(file)) process.exit(0);

let src = readFileSync(file, 'utf8');
const marker = '/* eva-win-glob-patch */';
if (src.includes(marker)) process.exit(0);

const fix = (name, folder, glob) => {
  const re = new RegExp(`this\\.${name} = path6\\.join\\(\\s*this\\.${folder},\\s*"${glob.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}"\\s*\\);`);
  if (!re.test(src)) throw new Error(`Tina-patch: ${name} niet gevonden (andere CLI-versie?)`);
  src = src.replace(re, `this.${name} = path6.relative(process.cwd(), path6.join(this.${folder}, "${glob}")).split(path6.sep).join("/"); ${marker}`);
};
fix('userQueriesAndFragmentsGlob', 'tinaFolderPath', 'queries/**/*.{graphql,gql}');
fix('generatedQueriesAndFragmentsGlob', 'generatedFolderPath', '*.{graphql,gql}');
writeFileSync(file, src);
console.log('Tina CLI: Windows-globpatch toegepast');

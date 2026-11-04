// Checks the byte budgets of the built `dist` of Pool Figures (`@maestro-calc/site-kit/check-site`).
// Usage: node apps/pool/scripts/check-site.ts [dist-directory]
import { resolve } from 'node:path';
import { checkSite } from '@maestro-calc/site-kit/check-site';
import { CALCULATOR_PAGES } from '../src/site-check/pages.ts';

const given = process.argv[2];
const dist = given === undefined ? resolve(import.meta.dirname, '../dist') : resolve(given);
const { pages, problems } = checkSite(dist, CALCULATOR_PAGES);
for (const { file, bytes } of pages) console.log(`${file}: ${bytes.toLocaleString('en-US')} B`);
if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`check:site: ${String(pages.length)} pages within budget`);

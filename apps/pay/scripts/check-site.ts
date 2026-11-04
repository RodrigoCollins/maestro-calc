// Checks the built `dist` of Cuenta Horas: the byte budgets (`@maestro-calc/site-kit/check-site`),
// then the rules that make each embed safe to frame and invisible to search (`.../embed`).
// Usage: node apps/pay/scripts/check-site.ts [dist-directory]
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { checkSite } from '@maestro-calc/site-kit/check-site';
import { embedPageProblems, moduleScriptsOf } from '@maestro-calc/site-kit/embed';
import { EMBEDS } from '../src/embed/embeds.ts';
import { CALCULATOR_PAGES } from '../src/site-check/pages.ts';
import { SITE } from '../src/site.config.ts';

const given = process.argv[2];
const dist = given === undefined ? resolve(import.meta.dirname, '../dist') : resolve(given);
const { pages, problems } = checkSite(dist, CALCULATOR_PAGES);
const read = (path: string): string | undefined => {
  const file = join(dist, `${path.slice(1)}.html`);
  return existsSync(file) ? readFileSync(file, 'utf8') : undefined;
};
const all = [
  ...problems,
  ...EMBEDS.flatMap(({ path, page, other }) => {
    const html = read(path);
    if (html === undefined) return [`${path}: an embed the build does not hold`];
    return embedPageProblems(html, {
      canonical: canonicalUrl(page, SITE.origin),
      scripts: moduleScriptsOf(read(page) ?? ''),
      other,
    }).map((message) => `${path}: ${message}`);
  }),
];
for (const { file, bytes } of pages) console.log(`${file}: ${bytes.toLocaleString('en-US')} B`);
if (all.length > 0) {
  console.error(all.join('\n'));
  process.exit(1);
}
console.log(
  `check:site: ${String(pages.length)} pages within budget, ${String(EMBEDS.length)} embeds`,
);

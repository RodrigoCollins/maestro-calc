// Checks the built `dist` of Pool Figures: the byte budgets (`@maestro-calc/site-kit/check-site`),
// then the link preview and the JSON-LD of every indexable page (`@maestro-calc/site-kit/seo-check`)
// and the rules that make each embed safe to frame and invisible to search (`.../embed`).
// Usage: node apps/pool/scripts/check-site.ts [dist-directory]
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { checkSite } from '@maestro-calc/site-kit/check-site';
import { embedPageProblems, moduleScriptsOf } from '@maestro-calc/site-kit/embed';
import { imageProblems, seoProblems } from '@maestro-calc/site-kit/seo-check';
import { EMBEDS } from '../src/embed.ts';
import { ogTypeOf, pageKindOf, schemaTypeOf } from '../src/seo/json-ld.ts';
import { CALCULATOR_PAGES } from '../src/site-check/pages.ts';
import { SITE } from '../src/site.config.ts';

const given = process.argv[2];
const dist = given === undefined ? resolve(import.meta.dirname, '../dist') : resolve(given);
const { pages, problems } = checkSite(dist, CALCULATOR_PAGES);
const html = new Map(pages.map(({ file }) => [file, readFileSync(join(dist, file), 'utf8')]));
const image = join(dist, 'og.png');
const all = [
  ...problems,
  ...seoProblems(html, {
    origin: SITE.origin,
    image: '/og.png',
    typesOf: (path) => {
      const kind = pageKindOf(path);
      return { og: ogTypeOf(kind), schema: schemaTypeOf(kind) };
    },
  }),
  ...EMBEDS.flatMap(({ path, page }) => {
    const embed = html.get(`${path.slice(1)}.html`);
    if (embed === undefined) return [`${path}: an embed the build does not hold`];
    return embedPageProblems(embed, {
      canonical: new URL(page, SITE.origin).href,
      scripts: moduleScriptsOf(html.get(`${page.slice(1)}.html`) ?? ''),
    }).map((message) => `${path}: ${message}`);
  }),
  ...imageProblems('og.png', existsSync(image) ? readFileSync(image) : undefined),
];
for (const { file, bytes } of pages) console.log(`${file}: ${bytes.toLocaleString('en-US')} B`);
if (all.length > 0) {
  console.error(all.join('\n'));
  process.exit(1);
}
console.log(
  `check:site: ${String(pages.length)} pages within budget, each with its link preview, ${String(EMBEDS.length)} embeds`,
);

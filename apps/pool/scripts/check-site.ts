// Checks the built `dist` of Pool Figures: the byte budgets (`@maestro-calc/site-kit/check-site`),
// then the link preview and the JSON-LD of every indexable page (`@maestro-calc/site-kit/seo-check`)
// the rules that make each embed safe to frame and invisible to search (`.../embed`), and the
// internal links between calculators, job pages and guides (`src/site-check/links.ts`).
// Usage: node apps/pool/scripts/check-site.ts [dist-directory]
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { checkSite } from '@maestro-calc/site-kit/check-site';
import { embedPageProblems, moduleScriptsOf } from '@maestro-calc/site-kit/embed';
import { imageProblems, seoProblems } from '@maestro-calc/site-kit/seo-check';
import { EMBEDS } from '../src/embed.ts';
import { GUIDES } from '../src/guide.ts';
import { JOB_PAGES, neighborsOf } from '../src/jobs.ts';
import { ogTypeOf, pageKindOf, schemaTypeOf } from '../src/seo/json-ld.ts';
import { canonicalPath } from '../src/seo/sitemap.ts';
import { linkProblems } from '../src/site-check/links.ts';
import { CALCULATOR_PAGES } from '../src/site-check/pages.ts';
import { SITE } from '../src/site.config.ts';

const given = process.argv[2];
const dist = given === undefined ? resolve(import.meta.dirname, '../dist') : resolve(given);
const { pages, problems } = checkSite(dist, CALCULATOR_PAGES);
const html = new Map(pages.map(({ file }) => [file, readFileSync(join(dist, file), 'utf8')]));
const image = join(dist, 'og.png');
const sitemapFile = join(dist, 'sitemap.xml');
const sitemap = [
  ...(existsSync(sitemapFile) ? readFileSync(sitemapFile, 'utf8') : '').matchAll(
    /<loc>([^<]+)<\/loc>/g,
  ),
].map(([, loc = '']) => new URL(loc).pathname);
const site = new Map([...html].map(([file, text]) => [canonicalPath(`/${file}`), text]));
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
      canonical: canonicalUrl(page, SITE.origin),
      scripts: moduleScriptsOf(html.get(`${page.slice(1)}.html`) ?? ''),
    }).map((message) => `${path}: ${message}`);
  }),
  ...(sitemap.length === 0 ? ['sitemap.xml: no page listed'] : []),
  ...linkProblems(site, {
    origin: SITE.origin,
    sitemap,
    jobs: JOB_PAGES.map((page) => ({
      path: page.path,
      calculator: page.calculator.path,
      neighbors: neighborsOf(page).map(({ href }) => href),
    })),
    guides: GUIDES.map(({ path, calculators }) => ({ path, calculators })),
  }),
  ...imageProblems('og.png', existsSync(image) ? readFileSync(image) : undefined),
];
for (const { file, bytes } of pages) console.log(`${file}: ${bytes.toLocaleString('en-US')} B`);
if (all.length > 0) {
  console.error(all.join('\n'));
  process.exit(1);
}
console.log(
  `check:site: ${String(pages.length)} pages within budget, each with its link preview, ${String(EMBEDS.length)} embeds, ${String(sitemap.length)} sitemap pages linked`,
);

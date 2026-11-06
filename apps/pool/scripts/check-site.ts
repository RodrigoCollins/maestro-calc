// Checks the built `dist` of Pool Figures: the byte budgets (`@maestro-calc/site-kit/check-site`),
// then the link preview and the JSON-LD of every indexable page (`@maestro-calc/site-kit/seo-check`)
// the rules that make each embed safe to frame and invisible to search (`.../embed`), the
// internal links between calculators, job pages and guides (`src/site-check/links.ts`), and the
// search rules of `src/site-check/seo.ts`: unique, measured titles and descriptions, the sitemap
// equal to the indexable pages, the size and the breadcrumb of each job page, robots.txt, and the
// hreflang pairs of the Spanish rollout.
// Usage: node apps/pool/scripts/check-site.ts [dist-directory]
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { checkSite } from '@maestro-calc/site-kit/check-site';
import { embedPageProblems, embedPathOf, moduleScriptsOf } from '@maestro-calc/site-kit/embed';
import { imageProblems, seoProblems } from '@maestro-calc/site-kit/seo-check';
import { CHARTS_INDEXES, DATA_PAGES_OF } from '../src/charts.ts';
import { ALL_EMBEDS } from '../src/embed.ts';
import { langOf, localHrefOf, routeOf } from '../src/routes.ts';
import { GUIDES } from '../src/guide.ts';
import { JOB_PAGES, neighborsOf } from '../src/jobs.ts';
import { ogTypeOf, pageKindOf, schemaTypeOf } from '../src/seo/json-ld.ts';
import { canonicalPath } from '../src/seo/sitemap.ts';
import { linkProblems } from '../src/site-check/links.ts';
import { CALCULATOR_PAGES } from '../src/site-check/pages.ts';
import { pairProblems, seoAuditProblems } from '../src/site-check/seo.ts';
import { SITE } from '../src/site.config.ts';

const given = process.argv[2];
const dist = given === undefined ? resolve(import.meta.dirname, '../dist') : resolve(given);
const { pages, problems } = checkSite(dist, CALCULATOR_PAGES);
const html = new Map(pages.map(({ file }) => [file, readFileSync(join(dist, file), 'utf8')]));
const image = join(dist, 'og.png');
const sitemapFile = join(dist, 'sitemap.xml');
const sitemapText = existsSync(sitemapFile) ? readFileSync(sitemapFile, 'utf8') : '';
const sitemap = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  ([, loc = '']) => new URL(loc).pathname,
);
const site = new Map([...html].map(([file, text]) => [canonicalPath(`/${file}`), text]));
const robotsFile = join(dist, 'robots.txt');
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
  ...ALL_EMBEDS.flatMap(({ path, page }) => {
    const embed = html.get(`${path.slice(1)}.html`);
    if (embed === undefined) return [`${path}: an embed the build does not hold`];
    // a calculator with its twin switches language inside the frame, to the twin's embed
    const route = routeOf(page);
    const twin = route?.es === undefined ? undefined : page === route.en ? route.es : route.en;
    return embedPageProblems(embed, {
      canonical: canonicalUrl(page, SITE.origin),
      scripts: moduleScriptsOf(html.get(`${page.slice(1)}.html`) ?? ''),
      other: twin === undefined ? undefined : embedPathOf(twin),
    }).map((message) => `${path}: ${message}`);
  }),
  ...(sitemap.length === 0 ? ['sitemap.xml: no page listed'] : []),
  // the guide for AI answer engines, built from the same lists (`src/llms.ts`)
  ...(existsSync(join(dist, 'llms.txt')) ? [] : ['llms.txt: not in the build']),
  ...linkProblems(site, {
    origin: SITE.origin,
    sitemap,
    jobs: JOB_PAGES.map((page) => ({
      path: page.path,
      calculator: page.calculator.path,
      neighbors: neighborsOf(page).map(({ href }) => href),
      ...(page.guide === undefined ? {} : { guide: page.guide.href }),
    })),
    guides: GUIDES.map(({ path, calculators }) => ({ path, calculators })),
    // a Spanish footer links the Spanish twin of a guide once it is built
    localize: (target, path) => localHrefOf(target, langOf(path)),
    // each language's footer links the data index of that language
    data: (['en', 'es'] as const).map((lang) => ({
      index: CHARTS_INDEXES[lang].path,
      pages: DATA_PAGES_OF[lang].map(({ path }) => path),
      footers: sitemap.filter((path) => langOf(path) === lang),
    })),
  }),
  ...seoAuditProblems(site, {
    origin: SITE.origin,
    sitemap,
    jobs: JOB_PAGES.map((page) => ({ path: page.path, calculator: page.calculator.path })),
    robots: existsSync(robotsFile) ? readFileSync(robotsFile, 'utf8') : undefined,
  }),
  // the hreflang pairs that exist, both ways and in the sitemap; a page with no twin names none
  ...pairProblems(html, sitemapText),
  ...imageProblems('og.png', existsSync(image) ? readFileSync(image) : undefined),
];
for (const { file, bytes } of pages) console.log(`${file}: ${bytes.toLocaleString('en-US')} B`);
// `exitCode`, never `process.exit`: exiting drops what a full pipe still has queued.
if (all.length > 0) {
  console.error(all.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `check:site: ${String(pages.length)} pages within budget, each with its link preview and its own title and description, ${String(ALL_EMBEDS.length)} embeds, ${String(sitemap.length)} sitemap pages linked`,
  );
}

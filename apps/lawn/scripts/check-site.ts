// Checks the built `dist` of Lawn Figures: the byte budgets (`@maestro-calc/site-kit/check-site`),
// then the link preview and the JSON-LD of every page (`@maestro-calc/site-kit/seo-check`, run on
// each page as it will read once the site is open, `src/site-check/launch.ts`), the internal links
// (`src/site-check/links.ts`), the search rules of `src/site-check/seo.ts` (noindex while the site
// is closed, the sitemap equal to the pages, robots.txt), the byline of every guide and frost
// page, and the files every page of the site relies on.
// Usage: node apps/lawn/scripts/check-site.ts [dist-directory]
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { affiliateLinkProblems } from '@maestro-calc/site-kit/affiliate';
import { checkSite } from '@maestro-calc/site-kit/check-site';
import { imageProblems, seoProblems } from '@maestro-calc/site-kit/seo-check';
import { BYLINE_PAGES } from '../src/bylines.ts';
import { CALCULATORS } from '../src/calculators.ts';
import { FROST_PAGES } from '../src/frost.ts';
import { GUIDES } from '../src/guide.ts';
import { ogTypeOf, pageKindOf, schemaTypeOf } from '../src/seo/json-ld.ts';
import { canonicalPath } from '../src/seo/sitemap.ts';
import { bylineProblems } from '../src/site-check/byline.ts';
import { asLaunched } from '../src/site-check/launch.ts';
import { linkProblems } from '../src/site-check/links.ts';
import { CALCULATOR_PAGES } from '../src/site-check/pages.ts';
import { seoAuditProblems } from '../src/site-check/seo.ts';
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
// every page but the 404, as it will read once the owner opens the site
// a function, so the closed site's literal `false` does not narrow the open branch away
const isOpen = (): boolean => SITE.indexable;
const launched = new Map(
  [...html]
    .filter(([file]) => file !== '404.html')
    .map(([file, text]) => [
      file,
      isOpen() ? text : asLaunched(text, canonicalPath(`/${file}`), SITE.origin),
    ]),
);
const required = [
  'llms.txt',
  'robots.txt',
  'sitemap.xml',
  '_headers',
  `${SITE.indexNowKey}.txt`,
  ...FROST_PAGES.map(({ state }) => `data/frost/${state.slug}.json`),
  ...Array.from({ length: 10 }, (_, digit) => `data/frost/zip-${String(digit)}.json`),
].filter((file) => !existsSync(join(dist, file)));
const all = [
  ...problems,
  // every sponsored link sits in the recommendation block, next to its disclosure
  ...[...html].flatMap(([file, text]) => affiliateLinkProblems(file, text)),
  ...seoProblems(launched, {
    origin: SITE.origin,
    image: '/og.png',
    typesOf: (path) => {
      const kind = pageKindOf(path);
      return { og: ogTypeOf(kind), schema: schemaTypeOf(kind) };
    },
    breadcrumbHomeOf: (path) => (pageKindOf(path) === 'home' ? undefined : '/'),
  }),
  ...required.map((file) => `${file}: not in the build`),
  ...(sitemap.length === 0 ? ['sitemap.xml: no page listed'] : []),
  ...linkProblems(site, {
    origin: SITE.origin,
    sitemap,
    guides: GUIDES.map(({ path, calculators }) => ({ path, calculators })),
    calculators: CALCULATORS.map(({ path }) => path),
    methodology: '/methodology',
    frost: {
      index: '/frost-dates',
      states: [...new Set(FROST_PAGES.map(({ state }) => state.slug))].map((slug) => ({
        slug,
        pages: FROST_PAGES.filter(({ state }) => state.slug === slug).map(({ path }) => path),
      })),
    },
  }),
  ...seoAuditProblems(site, {
    origin: SITE.origin,
    sitemap,
    robots: existsSync(robotsFile) ? readFileSync(robotsFile, 'utf8') : undefined,
    indexable: isOpen(),
  }),
  // the byline of the editorial team under the h1 of every guide and frost page
  ...bylineProblems(site, BYLINE_PAGES),
  ...imageProblems('og.png', existsSync(image) ? readFileSync(image) : undefined),
];
const largest = pages.reduce((a, b) => (b.bytes > a.bytes ? b : a));
console.log(`largest page: ${largest.file}: ${largest.bytes.toLocaleString('en-US')} B`);
// `exitCode`, never `process.exit`: exiting drops what a full pipe still has queued.
if (all.length > 0) {
  console.error(all.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `check:site: ${String(pages.length)} pages within budget, each with its link preview and JSON-LD as it will read at launch, ${String(sitemap.length)} sitemap pages linked`,
  );
}

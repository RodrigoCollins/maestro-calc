// Checks the built `dist` of Bowl Figures: the byte budgets (`@maestro-calc/site-kit/check-site`),
// then the link preview and the JSON-LD of every indexable page (`@maestro-calc/site-kit/seo-check`,
// which reads open sites only), the internal links (`src/site-check/links.ts`), the search rules of
// `src/site-check/seo.ts` (unique, measured titles and descriptions, the sitemap equal to the
// pages, robots.txt, and noindex while the site is closed), and the byline of every guide and
// data page. The German pages under /de stay noindex, out of the sitemap and with no hreflang pair
// until `SITE.deIndexable`; once open, every pair names both pages and x-default both ways.
// Usage: node apps/pets/scripts/check-site.ts [dist-directory]
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { affiliateLinkProblems } from '@maestro-calc/site-kit/affiliate';
import { checkSite } from '@maestro-calc/site-kit/check-site';
import { headProblems, imageProblems, seoProblems } from '@maestro-calc/site-kit/seo-check';
import { BYLINE_PAGES, BYLINE_PAGES_DE } from '../src/bylines.ts';
import { hrefOf, langOf, ROUTES } from '../src/routes.ts';
import { ogTypeOf, pageKindOf, schemaTypeOf } from '../src/seo/json-ld.ts';
import { canonicalPath } from '../src/seo/sitemap.ts';
import { bylineProblems } from '../src/site-check/byline.ts';
import { linkProblems } from '../src/site-check/links.ts';
import { CALCULATOR_PAGES } from '../src/site-check/pages.ts';
import { DESCRIPTION_RANGE, seoAuditProblems, TITLE_MAX } from '../src/site-check/seo.ts';
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
// the files of `public` a page may link without being a page itself
const files = new Set(readdirSync(dist).map((name) => `/${name}`));
const calculators = ROUTES.filter(({ kind }) => kind === 'calculator').map(({ path }) => path);
const open = SITE.indexable;
const deOpen = SITE.indexable && SITE.deIndexable;
const all = [
  ...problems,
  // every sponsored link sits in the recommendation block, next to its disclosure
  ...[...html].flatMap(([file, text]) => affiliateLinkProblems(file, text)),
  ...seoProblems(html, {
    origin: SITE.origin,
    image: '/og.png',
    typesOf: (path) => {
      const kind = pageKindOf(path);
      return { og: ogTypeOf(kind), schema: schemaTypeOf(kind) };
    },
    breadcrumbHomeOf: (path) =>
      pageKindOf(path) === 'home' ? undefined : hrefOf('home', langOf(path)),
  }),
  ...(sitemap.length === 0 ? ['sitemap.xml: no page listed'] : []),
  // the guide for AI answer engines, built from the same route table (`src/llms.ts`)
  ...(existsSync(join(dist, 'llms.txt')) ? [] : ['llms.txt: not in the build']),
  ...linkProblems(
    site,
    {
      origin: SITE.origin,
      sitemap,
      // every calculator shows where its figures come from; every guide and data page credits the team
      must: [
        ...calculators.map((path) => ({ path, targets: [hrefOf('methodology')] })),
        ...BYLINE_PAGES.map(({ path }) => ({ path, targets: [hrefOf('editorial')] })),
        ...BYLINE_PAGES_DE.map(({ path }) => ({ path, targets: [hrefOf('editorial', 'de')] })),
      ],
    },
    files,
  ),
  ...seoAuditProblems(site, {
    origin: SITE.origin,
    indexable: SITE.indexable,
    closed: (path) => langOf(path) === 'de' && !SITE.deIndexable,
    sitemap,
    robots: existsSync(robotsFile) ? readFileSync(robotsFile, 'utf8') : undefined,
  }),
  // the byline of the editorial team under the h1 of every guide and data page
  ...bylineProblems(site, BYLINE_PAGES, hrefOf('editorial'), SITE.indexable),
  ...bylineProblems(site, BYLINE_PAGES_DE, hrefOf('editorial', 'de'), deOpen),
  // the hreflang pairs: none while German is closed, then en, de and x-default both ways
  ...headProblems(html, {
    languages: ['en', 'de'],
    title: { max: TITLE_MAX },
    description: { min: DESCRIPTION_RANGE[0], max: DESCRIPTION_RANGE[1] },
    sitemap: sitemapText,
    partial: true,
  }),
  ...imageProblems('og.png', existsSync(image) ? readFileSync(image) : undefined),
];
for (const { file, bytes } of pages) console.log(`${file}: ${bytes.toLocaleString('en-US')} B`);
// `exitCode`, never `process.exit`: exiting drops what a full pipe still has queued.
if (all.length > 0) {
  console.error(all.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `check:site: ${String(pages.length)} pages within budget, each with its own title and description, ${String(sitemap.length)} sitemap pages linked, ${open ? 'open to' : 'closed to'} search engines, German ${deOpen ? 'open' : 'closed (noindex)'}`,
  );
}

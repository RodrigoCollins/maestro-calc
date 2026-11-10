// Checks the built `dist` of Cuánto Le Cobro: the byte budgets (`@maestro-calc/site-kit/check-site`),
// the rules that make each embed safe to frame and invisible to search (`.../embed`), the
// internal links between calculators, wage pages, guides and the footers (`../src/site-check/links.ts`),
// what search reads of every page (`../src/site-check/seo.ts`: the launch switch, unique measured
// titles and descriptions, the es-US / en-US pairs, link previews, JSON-LD and the sitemap), the
// byline of the editorial team under the h1 of every guide and wage page (`byline.ts`), and the
// WhatsApp share link of every calculator and wage page (`share.ts`).
// Usage: node apps/cobro/scripts/check-site.ts [dist-directory]
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { affiliateLinkProblems } from '@maestro-calc/site-kit/affiliate';
import { checkSite } from '@maestro-calc/site-kit/check-site';
import { embedPageProblems, embedPathOf, moduleScriptsOf } from '@maestro-calc/site-kit/embed';
import { imageProblems } from '@maestro-calc/site-kit/seo-check';
import { BYLINE_PAGES } from '../src/bylines.ts';
import { EMBEDS } from '../src/embed.ts';
import { ROUTES, routeOf } from '../src/routes.ts';
import { bylineProblems } from '../src/site-check/byline.ts';
import { linkProblems } from '../src/site-check/links.ts';
import { CALCULATOR_PAGES } from '../src/site-check/pages.ts';
import { robotsProblems, siteSeoProblems } from '../src/site-check/seo.ts';
import { shareProblems } from '../src/site-check/share.ts';
import { canonicalPath } from '../src/seo/sitemap.ts';
import { SITE } from '../src/site.config.ts';

const given = process.argv[2];
const dist = given === undefined ? resolve(import.meta.dirname, '../dist') : resolve(given);
const { pages, problems } = checkSite(dist, CALCULATOR_PAGES);
const html = new Map(pages.map(({ file }) => [file, readFileSync(join(dist, file), 'utf8')]));
const site = new Map([...html].map(([file, text]) => [canonicalPath(`/${file}`), text]));
const read = (name: string): string | undefined =>
  existsSync(join(dist, name)) ? readFileSync(join(dist, name), 'utf8') : undefined;
const sitemapText = read('sitemap.xml') ?? '';
const sitemap = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
  ([, loc = '']) => new URL(loc).pathname,
);
const image = join(dist, 'og.png');
const all = [
  ...problems,
  // every sponsored link sits in the recommendation block, next to its disclosure
  ...[...html].flatMap(([file, text]) => affiliateLinkProblems(file, text)),
  ...siteSeoProblems(html, SITE.origin, sitemapText, SITE.indexable),
  ...(sitemap.length === ROUTES.length * 2
    ? []
    : [
        `sitemap.xml: lists ${String(sitemap.length)} pages, the route table has ${String(ROUTES.length * 2)}`,
      ]),
  ...robotsProblems(read('robots.txt'), SITE.origin),
  ...(read('llms.txt') === undefined ? ['llms.txt: not in the build'] : []),
  ...(read(`${SITE.indexNowKey}.txt`) === SITE.indexNowKey
    ? []
    : [`${SITE.indexNowKey}.txt: the IndexNow key file is missing or holds another text`]),
  ...EMBEDS.flatMap(({ path, page }) => {
    const embed = html.get(`${path.slice(1)}.html`);
    if (embed === undefined) return [`${path}: an embed the build does not hold`];
    const route = routeOf(page);
    const twin = route === undefined ? undefined : page === route.es ? route.en : route.es;
    return embedPageProblems(embed, {
      canonical: canonicalUrl(page, SITE.origin),
      scripts: moduleScriptsOf(html.get(`${page.slice(1)}.html`) ?? ''),
      other: twin === undefined ? undefined : embedPathOf(twin),
    }).map((message) => `${path}: ${message}`);
  }),
  ...linkProblems(site, sitemap, SITE.origin),
  ...bylineProblems(site, BYLINE_PAGES),
  // every calculator and every wage page shares itself on WhatsApp, with no script to build the link
  ...shareProblems(
    site,
    SITE.origin,
    ROUTES.filter(({ kind, id }) => kind === 'calculator' || id.startsWith('wage')).flatMap(
      ({ es, en }) => [es, en],
    ),
  ),
  ...imageProblems('og.png', existsSync(image) ? readFileSync(image) : undefined),
];
for (const { file, bytes } of pages) console.log(`${file}: ${bytes.toLocaleString('en-US')} B`);
// `exitCode`, never `process.exit`: exiting drops what a full pipe still has queued.
if (all.length > 0) {
  console.error(all.join('\n'));
  process.exitCode = 1;
} else {
  console.log(
    `check:site: ${String(pages.length)} pages within budget, each with its link preview and its own title and description, ${String(EMBEDS.length)} embeds, ${String(sitemap.length)} sitemap pages linked`,
  );
}

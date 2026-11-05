// Checks the built `dist` of Cuenta Horas: the byte budgets (`@maestro-calc/site-kit/check-site`),
// then the rules that make each embed safe to frame and invisible to search (`.../embed`), and the
// internal links of every page of the sitemap (`../src/site-check/links.ts`).
// Usage: node apps/pay/scripts/check-site.ts [dist-directory]
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { checkSite } from '@maestro-calc/site-kit/check-site';
import { embedPageProblems, moduleScriptsOf } from '@maestro-calc/site-kit/embed';
import { EMBEDS } from '../src/embed/embeds.ts';
import { GUIDE_RULES, HUBS, LONG_TAIL_RULES, SITEMAP_PATHS } from '../src/site-check/link-rules.ts';
import { inboundOf, linkProblems } from '../src/site-check/links.ts';
import { CALCULATOR_PAGES } from '../src/site-check/pages.ts';
import { SITE } from '../src/site.config.ts';

const given = process.argv[2];
const dist = given === undefined ? resolve(import.meta.dirname, '../dist') : resolve(given);
const { pages, problems } = checkSite(dist, CALCULATOR_PAGES);
const read = (path: string): string | undefined => {
  const file = join(dist, path === '/' ? 'index.html' : `${path.slice(1)}.html`);
  return existsSync(file) ? readFileSync(file, 'utf8') : undefined;
};
const sitemapPages = new Map(
  SITEMAP_PATHS.flatMap((path) => {
    const html = read(path);
    return html === undefined ? [] : [[path, html] as const];
  }),
);
const inbound = inboundOf(sitemapPages, SITE.origin);
const all = [
  ...problems,
  ...SITEMAP_PATHS.filter((path) => !sitemapPages.has(path)).map(
    (path) => `${path}: a page of the sitemap the build does not hold`,
  ),
  ...linkProblems({
    origin: SITE.origin,
    pages: sitemapPages,
    longTail: LONG_TAIL_RULES,
    guides: GUIDE_RULES,
    hubs: HUBS,
  }),
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
const fewest = [...inbound].sort(([, a], [, b]) => a - b).slice(0, 3);
console.log(
  `check:site: inbound links, fewest ${fewest.map(([path, count]) => `${path} ${String(count)}`).join(', ')}`,
);
if (all.length > 0) {
  console.error(all.join('\n'));
  process.exit(1);
}
console.log(
  `check:site: ${String(pages.length)} pages within budget, ${String(EMBEDS.length)} embeds, ${String(sitemapPages.size)} pages linked as the rules say`,
);

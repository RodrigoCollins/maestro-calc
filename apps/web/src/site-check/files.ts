import { parse } from 'node-html-parser';
import { LOCALES, NOT_FOUND_ID, notFoundPathOf, pathOf, urlOf } from '../routing/routes.ts';
import type { RouteTable } from '../routing/routes.ts';
import { problem } from './types.ts';
import type { CheckContext, Dist, Page, Problem, Site } from './types.ts';

/** The built file of a table path: `/` is `index.html`, `/es/x` is `es/x.html`. */
export const fileOf = (path: string): string =>
  path === '/' ? 'index.html' : `${path.slice(1)}.html`;

/** The absolute URL of a routable page: the canonical and the sitemap `<loc>`. */
export const urlOfPage = (page: Page, site: Site): string =>
  urlOf(pathOf(page.id, page.locale, site.routes));

interface Entry {
  readonly file: string;
  readonly id: string;
  readonly locale: Page['locale'];
  readonly routable: boolean;
}

const entriesOf = (routes: RouteTable): Entry[] => [
  ...Object.keys(routes).flatMap((id) =>
    LOCALES.map((locale) => ({
      file: fileOf(pathOf(id, locale, routes)),
      id,
      locale,
      routable: true,
    })),
  ),
  ...LOCALES.map((locale) => ({
    file: fileOf(notFoundPathOf(locale)),
    id: NOT_FOUND_ID,
    locale,
    routable: false,
  })),
];

/** Every HTML file the build must hold: two per route id plus the two not-found pages. */
export const expectedFiles = (routes: RouteTable): string[] =>
  entriesOf(routes).map(({ file }) => file);

/** How many pages the build holds: `2 × ids + 2` (site-seo › [SE14]). */
export const pageCount = (routes: RouteTable): number => expectedFiles(routes).length;

/** Orphan HTML files and missing pages, each named (site-routing-i18n › [SR1]). */
export const fileSetProblems = ({ dist, site }: CheckContext): Problem[] => {
  const expected = new Set(expectedFiles(site.routes));
  const built = [...dist.keys()].filter((file) => file.endsWith('.html'));
  return [
    ...built
      .filter((file) => !expected.has(file))
      .map((file) => problem(file, 'file-set', 'orphan page: no route builds this file')),
    ...[...expected]
      .filter((file) => !dist.has(file))
      .map((file) => problem(file, 'file-set', 'missing page: the route table expects it')),
  ];
};

/** The expected pages that exist in `dist`, parsed; a missing file is `fileSetProblems`' concern. */
export const pagesOf = (dist: Dist, routes: RouteTable): Page[] =>
  entriesOf(routes).flatMap((entry) => {
    const html = dist.get(entry.file);
    return html === undefined ? [] : [{ ...entry, html, root: parse(html, { comment: true }) }];
  });

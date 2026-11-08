import { headProblems, seoProblems } from '@maestro-calc/site-kit/seo-check';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';
import { hrefOf, langOf, routeOf, type PageKind } from '../routes.ts';

const NOINDEX = /<meta name="robots" content="noindex"\s*\/?>/;

/** The pages that are never indexed, launch or not: the 404 and the embeds. */
export const alwaysNoindex = (file: string): boolean =>
  file === '404.html' || file.startsWith('embed/');

/**
 * What the site would publish once `SITE.indexable` is flipped: the pages as built, with the
 * `noindex` of the launch switch taken off every page that is meant to be indexed. The head,
 * JSON-LD and hreflang rules only read indexable pages, so without this the closed site would
 * check nothing.
 */
export const asLaunched = (pages: ReadonlyMap<string, string>): ReadonlyMap<string, string> =>
  new Map(
    [...pages].map(([file, html]) => [
      file,
      alwaysNoindex(file) ? html : html.replace(NOINDEX, ''),
    ]),
  );

/** The launch switch holds: a closed site is `noindex` everywhere; an open one only on the 404 and the embeds. */
export const switchProblems = (pages: ReadonlyMap<string, string>, indexable: boolean): string[] =>
  [...pages].flatMap(([file, html]) => {
    const closed = NOINDEX.test(html);
    const expected = !indexable || alwaysNoindex(file);
    return closed === expected
      ? []
      : [
          `${file}: ${expected ? 'must be noindex' : 'must not be noindex'} while indexable is ${String(indexable)}`,
        ];
  });

const SCHEMA = {
  home: 'WebSite',
  calculator: 'WebApplication',
  article: 'Article',
  collection: 'CollectionPage',
} as const satisfies Record<PageKind, string>;

/** The robots.txt must let crawlers in and name the sitemap. */
export const robotsProblems = (robots: string | undefined, origin: string): string[] => {
  if (robots === undefined) return ['robots.txt: not in the build'];
  return [
    ...(/^Allow: \/$/m.test(robots) ? [] : ['robots.txt: must allow /']),
    ...(robots.includes(`Sitemap: ${origin}/sitemap.xml`)
      ? []
      : [`robots.txt: must name ${origin}/sitemap.xml`]),
  ];
};

/**
 * The search rules of the site as it will launch: unique, measured titles and descriptions; the
 * es-US / en-US pairs with x-default at the Spanish page; a sitemap equal to the indexable pages;
 * and the link preview and JSON-LD of each page, by the kind of its route.
 */
export const siteSeoProblems = (
  pages: ReadonlyMap<string, string>,
  origin: string,
  sitemap: string,
  indexable: boolean,
): string[] => {
  const launched = asLaunched(pages);
  return [
    ...switchProblems(pages, indexable),
    ...headProblems(launched, {
      languages: ['es-US', 'en-US'],
      title: { max: TITLE_MAX },
      description: DESCRIPTION,
      sitemap,
    }),
    ...seoProblems(launched, {
      origin,
      image: '/og.png',
      typesOf: (path) => {
        const kind = routeOf(path)?.kind ?? 'article';
        return { og: kind === 'article' ? 'article' : 'website', schema: SCHEMA[kind] };
      },
      breadcrumbHomeOf: (path) => {
        const route = routeOf(path);
        return route === undefined || route.kind === 'home'
          ? undefined
          : hrefOf('home', langOf(path));
      },
    }),
  ];
};

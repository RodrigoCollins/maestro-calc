import { headProblems, seoProblems } from '@maestro-calc/site-kit/seo-check';
import type { Route } from '../routes.ts';
import { DESCRIPTION, TITLE_MAX } from '../seo/meta.ts';

/** What the search check of the built site reads. */
export interface SeoSite {
  readonly origin: string;
  /** The route table: the kind of each page, so the schema.org type its JSON-LD must have. */
  readonly routes: readonly Route[];
  /** Every built page, by its file in `dist`, and its HTML. */
  readonly pages: ReadonlyMap<string, string>;
  /** The text of `sitemap.xml`. */
  readonly sitemap: string;
  /** The path of every long-tail page. */
  readonly longTail: readonly string[];
}

const SCHEMA = { home: 'WebSite', calculator: 'WebApplication', article: 'Article' } as const;

const HOMES = new Set(['/', '/es']);

const first = (html: string, pattern: RegExp): string => pattern.exec(html)?.[1] ?? '';

/**
 * Everything search reads of the built site (`scripts/check-site.ts`): the link preview of every
 * indexable page and its one JSON-LD block, of the type of its route, with the breadcrumb from the
 * home of its language on every page but a home, and no FAQ or HowTo markup
 * (`@maestro-calc/site-kit/seo-check`); a title and a description a result shows whole, each its
 * own in the site; the hreflang pair both ways with x-default, the `<html lang>` and the sitemap
 * that lists exactly these pages with their alternates; and the numbers of each long-tail page's
 * address in its title and its description.
 */
export const siteSeoProblems = ({
  origin,
  routes,
  pages,
  sitemap,
  longTail,
}: SeoSite): string[] => {
  const kindOf = (path: string): Route['kind'] | undefined =>
    routes.find(({ en, es }) => en === path || es === path)?.kind;
  const byPath = new Map(
    [...pages.values()].map((html) => {
      const canonical = first(html, /<link rel="canonical" href="([^"]*)"/);
      return [canonical === '' ? '' : new URL(canonical).pathname, html] as const;
    }),
  );
  return [
    ...seoProblems(pages, {
      origin,
      image: '/og.png',
      typesOf: (path) => {
        const kind = kindOf(path);
        return { og: 'website', schema: kind === undefined ? 'a route' : SCHEMA[kind] };
      },
      breadcrumbHomeOf: (path) =>
        HOMES.has(path) ? undefined : path.startsWith('/es/') ? '/es' : '/',
    }),
    ...headProblems(pages, {
      languages: ['en-US', 'es-US'],
      title: { max: TITLE_MAX },
      description: DESCRIPTION,
      sitemap,
    }),
    ...longTailTextProblems(
      longTail.map((path) => {
        const html = byPath.get(path) ?? '';
        return {
          path,
          title: first(html, /<title>([^<]*)<\/title>/),
          description: first(html, /<meta name="description" content="([^"]*)"/),
        };
      }),
    ),
  ];
};

/** The whole numbers of a text, a thousands comma (`$100,000`) read inside its number. */
export const numbersOf = (text: string): ReadonlySet<string> =>
  new Set(text.replace(/(\d),(?=\d{3})/g, '$1').match(/\d+/g) ?? []);

/** What a long-tail page says in its result: its path, its title and its description. */
export interface LongTailText {
  readonly path: string;
  readonly title: string;
  readonly description: string;
}

/**
 * Every long-tail page of one family shares one template, so its title and its description must
 * each carry the numbers of its own address (the rate, the shift, the days): a result that leaves
 * one out reads as the page of its sibling.
 */
export const longTailTextProblems = (pages: readonly LongTailText[]): string[] =>
  pages.flatMap(({ path, title, description }) => {
    const wanted = [...numbersOf(path)];
    return Object.entries({ title, description }).flatMap(([what, text]) => {
      const said = numbersOf(text);
      const missing = wanted.filter((number) => !said.has(number));
      return missing.length === 0
        ? []
        : [`${path}: the ${what} does not say ${missing.join(', ')}`];
    });
  });

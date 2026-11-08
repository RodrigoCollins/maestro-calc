import { describe, expect, it } from 'vitest';
import { hrefOf, ROUTES, TRADE_PATHS } from '../routes.ts';
import { alternatesOf, embedHeadOf, headOf } from './head.ts';
import { jsonLdOf, nameOf } from './json-ld.ts';
import { canonicalPath, sitemapXml } from './sitemap.ts';

const ORIGIN = 'https://cuantolecobro.com';
const TEXT = { title: 'Cuánto cobrar | Cuánto Le Cobro', description: 'Una descripción.' };
const route = (id: string) => {
  const found = ROUTES.find((each) => each.id === id);
  if (found === undefined) throw new Error(id);
  return found;
};

describe('alternatesOf', () => {
  it('pairs es-US and en-US with x-default at the Spanish page, from either address', () => {
    const expected = [
      { hreflang: 'es-US', href: `${ORIGIN}/cuanto-cobrar-por-pintar-una-casa` },
      { hreflang: 'en-US', href: `${ORIGIN}/en/how-much-to-charge-to-paint-a-house` },
      { hreflang: 'x-default', href: `${ORIGIN}/cuanto-cobrar-por-pintar-una-casa` },
    ];
    expect(alternatesOf(TRADE_PATHS.painting.es, ORIGIN)).toEqual(expected);
    expect(alternatesOf(TRADE_PATHS.painting.en, ORIGIN)).toEqual(expected);
  });

  it('names no alternate for a page that is not a route', () => {
    expect(alternatesOf('/nope', ORIGIN)).toEqual([]);
  });
});

describe('headOf', () => {
  it('keeps a page noindex until the site is indexable, canonical either way', () => {
    const closed = headOf('/x', TEXT, true, { origin: ORIGIN, indexable: false });
    expect(closed.robots).toBe('noindex');
    expect(closed.canonical).toBe(`${ORIGIN}/x`);
    const open = headOf('/x', TEXT, true, { origin: ORIGIN, indexable: true });
    expect(open.robots).toBeUndefined();
    expect(open.canonical).toBe(`${ORIGIN}/x`);
  });

  it('never indexes the 404 and gives it no canonical', () => {
    const missing = headOf('/x', TEXT, false, { origin: ORIGIN, indexable: true });
    expect(missing.robots).toBe('noindex');
    expect(missing.canonical).toBeUndefined();
  });

  it('points an embed at its full page and keeps it noindex', () => {
    const head = embedHeadOf('/embed/cuanto-cobrar-por-jardineria', TEXT, { origin: ORIGIN });
    expect(head).toMatchObject({
      page: '/cuanto-cobrar-por-jardineria',
      canonical: `${ORIGIN}/cuanto-cobrar-por-jardineria`,
      robots: 'noindex',
    });
    expect(() => embedHeadOf('/cuanto-cobrar-por-jardineria', TEXT, { origin: ORIGIN })).toThrow(
      'not an embed',
    );
  });
});

describe('jsonLdOf', () => {
  const editorial = hrefOf('editorial', 'en');
  const parse = (route_: ReturnType<typeof route>, lang: 'es' | 'en', extras = {}) =>
    JSON.parse(jsonLdOf(route_, lang, TEXT, ORIGIN, editorial, extras)) as Record<string, unknown>;

  it('describes the home as the web site and its publishing organization', () => {
    const graph = parse(route('home'), 'es')['@graph'] as Record<string, unknown>[];
    expect(graph.map((node) => node['@type'])).toEqual(['WebSite', 'Organization']);
    expect(graph[0]).toMatchObject({ url: `${ORIGIN}/`, inLanguage: 'es-US' });
    expect(graph[1]).toMatchObject({
      publishingPrinciples: `${ORIGIN}/en/editorial-policy`,
    });
  });

  it('describes a calculator as a free web application with a breadcrumb', () => {
    const graph = parse(route('quote-painting'), 'en')['@graph'] as Record<string, unknown>[];
    expect(graph.map((node) => node['@type'])).toEqual(['WebApplication', 'BreadcrumbList']);
    expect(graph[0]).toMatchObject({ inLanguage: 'en-US', isAccessibleForFree: true });
    const crumbs = graph[1]?.['itemListElement'] as { item: string }[];
    expect(crumbs[0]?.item).toBe(`${ORIGIN}/en`);
  });

  it('describes a guide as an article by the organization, with its review date', () => {
    const graph = parse(route('markup-guide'), 'es', { modified: '2026-11-08' })[
      '@graph'
    ] as Record<string, unknown>[];
    expect(graph[0]).toMatchObject({
      '@type': 'Article',
      dateModified: '2026-11-08',
      author: { '@type': 'Organization', name: 'Cuánto Le Cobro' },
    });
  });

  it('describes a list as a collection page listing its items, under a parent crumb', () => {
    const graph = parse(route('wages'), 'es', {
      parent: { name: 'Inicio', path: '/' },
      items: [{ name: 'Pintores', path: '/cuanto-gana-un-pintor' }],
    })['@graph'] as Record<string, unknown>[];
    expect(graph[0]).toMatchObject({
      '@type': 'CollectionPage',
      mainEntity: { itemListElement: [{ position: 1, url: `${ORIGIN}/cuanto-gana-un-pintor` }] },
    });
    expect((graph[1]?.['itemListElement'] as unknown[]).length).toBe(3);
  });

  it('lists nothing for a collection given no items, and drops the site suffix of a title', () => {
    const graph = parse(route('wages'), 'en')['@graph'] as Record<string, unknown>[];
    expect(graph[0]).toMatchObject({ mainEntity: { itemListElement: [] } });
    expect(nameOf('Pintores | Cuánto Le Cobro')).toBe('Pintores');
  });
});

describe('sitemap', () => {
  const xml = sitemapXml(ROUTES, ORIGIN);

  it('lists every route in both languages, each with its pair', () => {
    expect(xml.match(/<url>/g)?.length).toBe(ROUTES.length * 2);
    expect(xml).toContain(`<xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}/"/>`);
  });

  it('names a page as the build does', () => {
    expect(canonicalPath('/metodologia.html')).toBe('/metodologia');
    expect(canonicalPath('/index.html')).toBe('/');
    expect(canonicalPath('/en/index')).toBe('/en/');
  });
});

import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routes.ts';
import { jsonLdOf, nameOf, ogTypeOf, pageKindOf, schemaTypeOf } from './json-ld.ts';

const ORIGIN = 'https://bowlfigures.com';
const parse = (text: string): { '@graph': Record<string, unknown>[] } =>
  JSON.parse(
    text.replaceAll('\\u003c', '<').replaceAll('\\u003e', '>').replaceAll('\\u0026', '&'),
  ) as { '@graph': Record<string, unknown>[] };

describe('page kinds', () => {
  it('reads the kind of a route, and any other address is an article', () => {
    expect(pageKindOf('/')).toBe('home');
    expect(pageKindOf('/dog-food-calculator')).toBe('calculator');
    expect(pageKindOf('/methodology')).toBe('article');
    expect(pageKindOf('/anything')).toBe('article');
  });

  it('gives an article an Open Graph article and the others a website', () => {
    expect(ogTypeOf('article')).toBe('article');
    expect(ogTypeOf('calculator')).toBe('website');
    expect(ogTypeOf('home')).toBe('website');
  });

  it('maps the kinds to schema.org types', () => {
    expect([schemaTypeOf('home'), schemaTypeOf('calculator'), schemaTypeOf('article')]).toEqual([
      'WebSite',
      'WebApplication',
      'Article',
    ]);
  });

  it('drops the site from a title', () => {
    expect(nameOf('Dog Food Calculator | Bowl Figures')).toBe('Dog Food Calculator');
    expect(nameOf('No suffix')).toBe('No suffix');
  });
});

describe('jsonLdOf', () => {
  it('gives the home the WebSite and the Organization, with its editorial policy', () => {
    const graph = parse(jsonLdOf('/', { title: 'Home | Bowl Figures', description: 'd' }, ORIGIN));
    expect(graph['@graph'].map((node) => node['@type'])).toEqual(['WebSite', 'Organization']);
    expect(graph['@graph'][0]).toMatchObject({ url: `${ORIGIN}/`, inLanguage: 'en-US' });
    expect(graph['@graph'][1]).toMatchObject({
      name: 'Bowl Figures',
      publishingPrinciples: `${ORIGIN}/editorial-policy`,
    });
  });

  it('gives a calculator a free WebApplication and its breadcrumb', () => {
    const graph = parse(
      jsonLdOf(
        '/dog-food-calculator',
        { title: 'Dog Food Calculator | Bowl Figures', description: 'd' },
        ORIGIN,
      ),
    );
    expect(graph['@graph'].map((node) => node['@type'])).toEqual([
      'WebApplication',
      'BreadcrumbList',
    ]);
    expect(graph['@graph'][0]).toMatchObject({
      url: `${ORIGIN}/dog-food-calculator`,
      isAccessibleForFree: true,
    });
    const items = graph['@graph'][1]?.['itemListElement'] as { item: string; position: number }[];
    expect(items.map(({ item }) => item)).toEqual([`${ORIGIN}/`, `${ORIGIN}/dog-food-calculator`]);
  });

  it('gives an article the editorial team as author and publisher, and the review day', () => {
    const graph = parse(
      jsonLdOf(
        '/methodology',
        { title: 'How we work it out | Bowl Figures', description: 'd', modified: '2026-11-07' },
        ORIGIN,
      ),
    );
    expect(graph['@graph'][0]).toMatchObject({
      '@type': 'Article',
      dateModified: '2026-11-07',
      author: { '@type': 'Organization', name: 'Bowl Figures' },
      publisher: { name: 'Bowl Figures' },
    });
  });

  it('leaves out the review day when the page has none', () => {
    const graph = parse(
      jsonLdOf('/about', { title: 'About | Bowl Figures', description: 'd' }, ORIGIN),
    );
    expect(graph['@graph'][0]).not.toHaveProperty('dateModified');
  });

  it('makes a document of every route that starts with the node its kind promises', () => {
    for (const { path, kind } of ROUTES) {
      const graph = parse(jsonLdOf(path, { title: 'T | Bowl Figures', description: 'd' }, ORIGIN));
      expect(graph['@graph'][0]?.['@type'], path).toBe(schemaTypeOf(kind));
    }
  });
});

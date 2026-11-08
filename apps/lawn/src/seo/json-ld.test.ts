import { describe, expect, it } from 'vitest';
import { jsonLdOf, ogTypeOf, pageKindOf, schemaTypeOf } from './json-ld.ts';

const ORIGIN = 'https://x.test';
const text = { title: 'Sod Calculator | Lawn Figures', description: 'Sod for your lawn.' };
const parsed = (path: string, ...rest: [Record<string, unknown>?]) =>
  JSON.parse(jsonLdOf(path, { ...text, ...rest[0] }, ORIGIN)) as Record<string, unknown>;

describe('page kinds', () => {
  it('reads the kind from the route table, and takes any other path for an article', () => {
    expect(pageKindOf('/')).toBe('home');
    expect(pageKindOf('/sod-calculator')).toBe('calculator');
    expect(pageKindOf('/methodology')).toBe('article');
    expect(pageKindOf('/frost-dates/texas/2')).toBe('article');
    expect(pageKindOf('/nope')).toBe('article');
  });

  it('maps a kind to its Open Graph and schema.org types', () => {
    expect(['home', 'calculator', 'article'].map((kind) => schemaTypeOf(kind as 'home'))).toEqual([
      'WebSite',
      'WebApplication',
      'Article',
    ]);
    expect(ogTypeOf('article')).toBe('article');
    expect(ogTypeOf('calculator')).toBe('website');
    expect(ogTypeOf('home')).toBe('website');
  });
});

describe('jsonLdOf', () => {
  it('describes a calculator as a free WebApplication named without the site', () => {
    expect(parsed('/sod-calculator')).toMatchObject({
      '@type': 'WebApplication',
      name: 'Sod Calculator',
      url: 'https://x.test/sod-calculator',
      inLanguage: 'en-US',
    });
  });

  it('joins the WebSite and the Organization of the home in one graph', () => {
    const graph = (parsed('/')['@graph'] ?? []) as Record<string, unknown>[];
    expect(graph.map((node) => node['@type'])).toEqual(['WebSite', 'Organization']);
    expect(graph[1]).toMatchObject({
      name: 'Lawn Figures',
      url: 'https://x.test/',
      publishingPrinciples: 'https://x.test/editorial-policy',
    });
  });

  it('credits an article to the organization, with its review day when it has one', () => {
    const article = parsed('/methodology', { modified: '2026-11-07' });
    expect(article).toMatchObject({
      '@type': 'Article',
      dateModified: '2026-11-07',
      author: { '@type': 'Organization', name: 'Lawn Figures' },
      publisher: { '@type': 'Organization', name: 'Lawn Figures' },
    });
    expect(parsed('/methodology')).not.toHaveProperty('dateModified');
  });

  it('adds the BreadcrumbList to the graph', () => {
    const json = jsonLdOf(
      '/frost-dates/texas',
      {
        title: 'Frost Dates in Texas | Lawn Figures',
        description: 'Frost dates.',
      },
      ORIGIN,
      [
        { name: 'Lawn Figures', path: '/' },
        { name: 'Frost dates', path: '/frost-dates' },
      ],
    );
    const graph = (JSON.parse(json) as { '@graph': Record<string, unknown>[] })['@graph'];
    expect(graph.map((node) => node['@type'])).toEqual(['Article', 'BreadcrumbList']);
  });
});

import { describe, expect, it } from 'vitest';
import { jsonLdOf, ogTypeOf, pageKindOf, schemaTypeOf } from './json-ld.ts';

const page = { title: 'Pool Salt Calculator: How Many Bags? | Pool Figures', description: 'Salt.' };
const ORIGIN = 'https://poolfigures.com';

describe('pageKindOf', () => {
  it('names the home, every calculator by its path, and every other page an article', () => {
    expect(pageKindOf('/')).toBe('home');
    expect(pageKindOf('/pool-salt-calculator')).toBe('calculator');
    expect(pageKindOf('/opening-your-pool')).toBe('article');
    expect(pageKindOf('/methodology')).toBe('article');
    expect(pageKindOf('/404')).toBe('article');
  });

  // the kind is the route's, so a Spanish slug (calculadora-de-...) is a calculator too
  it('reads the kind from the route table, not from the end of the address', () => {
    expect(pageKindOf('/how-much-salt-for-a-10000-gallon-pool')).toBe('article');
    expect(pageKindOf('/pool-volume-calculator')).toBe('calculator');
    expect(pageKindOf('/es/calculadora-de-sal-para-piscina')).toBe('calculator');
  });
});

describe('ogTypeOf and schemaTypeOf', () => {
  it('make an article an Open Graph article and the other pages a website', () => {
    expect(['home', 'calculator', 'article'].map((kind) => ogTypeOf(kind as never))).toEqual([
      'website',
      'website',
      'article',
    ]);
  });

  it('give each kind its schema.org type', () => {
    expect(['home', 'calculator', 'article'].map((kind) => schemaTypeOf(kind as never))).toEqual([
      'WebSite',
      'WebApplication',
      'Article',
    ]);
  });
});

describe('jsonLdOf', () => {
  it('describes the home as the web site', () => {
    expect(JSON.parse(jsonLdOf('/', page, ORIGIN))).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Pool Figures',
      url: 'https://poolfigures.com/',
      inLanguage: 'en-US',
    });
  });

  it('describes a calculator as a free utility, named by its title without the site', () => {
    expect(JSON.parse(jsonLdOf('/pool-salt-calculator', page, ORIGIN))).toMatchObject({
      '@type': 'WebApplication',
      name: 'Pool Salt Calculator: How Many Bags?',
      description: 'Salt.',
      url: 'https://poolfigures.com/pool-salt-calculator',
      applicationCategory: 'UtilitiesApplication',
      isAccessibleForFree: true,
    });
  });

  it('describes a guide as an article Pool Figures publishes', () => {
    const guide = { title: 'Opening your pool | Pool Figures', description: 'Steps.' };
    expect(JSON.parse(jsonLdOf('/opening-your-pool', guide, ORIGIN))).toMatchObject({
      '@type': 'Article',
      headline: 'Opening your pool',
      url: 'https://poolfigures.com/opening-your-pool',
    });
  });

  // E-E-A-T: the organization, never a person, writes and publishes every article, and names the
  // English editorial policy as its publishing principles
  it('names the Pool Figures organization as author and publisher, with its editorial policy', () => {
    const team = {
      '@type': 'Organization',
      name: 'Pool Figures',
      url: 'https://poolfigures.com/',
      publishingPrinciples: 'https://poolfigures.com/editorial-policy',
    };
    const guide = { title: 'Opening your pool | Pool Figures', description: 'Steps.' };
    for (const path of ['/opening-your-pool', '/es/como-abrir-tu-piscina']) {
      const node = JSON.parse(jsonLdOf(path, guide, ORIGIN)) as Record<string, unknown>;
      expect(node['author'], path).toEqual(team);
      expect(node['publisher'], path).toEqual(team);
    }
  });

  it('gives an article the day it was last reviewed only when the page carries one', () => {
    const chart = { title: 'Chart | Pool Figures', description: 'C.', modified: '2026-11-05' };
    expect(JSON.parse(jsonLdOf('/pool-volume-chart', chart, ORIGIN))).toMatchObject({
      dateModified: '2026-11-05',
    });
    const guide = { title: 'Opening your pool | Pool Figures', description: 'Steps.' };
    expect(JSON.parse(jsonLdOf('/opening-your-pool', guide, ORIGIN))).not.toHaveProperty(
      'dateModified',
    );
  });

  it('gives a calculator the day its cited answers were checked, when the page carries one', () => {
    const calculator = { title: 'Salt | Pool Figures', description: 'S.', modified: '2026-11-10' };
    expect(JSON.parse(jsonLdOf('/pool-salt-calculator', calculator, ORIGIN))).toMatchObject({
      '@type': 'WebApplication',
      dateModified: '2026-11-10',
    });
    expect(JSON.parse(jsonLdOf('/pool-salt-calculator', page, ORIGIN))).not.toHaveProperty(
      'dateModified',
    );
  });

  it('gives a page with a trail its node and the BreadcrumbList of the trail, in one @graph', () => {
    const job = {
      title: 'How Much Salt for a 5,000 Gallon Pool? | Pool Figures',
      description: 'D.',
    };
    const trail = [
      { name: 'Pool Figures', path: '/' },
      { name: 'Pool salt calculator', path: '/pool-salt-calculator' },
      { name: 'How Much Salt for a 5,000 Gallon Pool?', path: '/salt-5000' },
    ];
    expect(JSON.parse(jsonLdOf('/salt-5000', job, ORIGIN, trail))).toEqual({
      '@context': 'https://schema.org',
      '@graph': [
        expect.objectContaining({ '@type': 'Article', url: `${ORIGIN}/salt-5000` }),
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Pool Figures', item: `${ORIGIN}/` },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Pool salt calculator',
              item: `${ORIGIN}/pool-salt-calculator`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: 'How Much Salt for a 5,000 Gallon Pool?',
              item: `${ORIGIN}/salt-5000`,
            },
          ],
        },
      ],
    });
  });

  it('says the language of the address: en-US, or es-US under /es', () => {
    const about = { title: 'Acerca de | Pool Figures', description: 'Quiénes somos.' };
    expect(JSON.parse(jsonLdOf('/about', about, ORIGIN))).toMatchObject({ inLanguage: 'en-US' });
    expect(JSON.parse(jsonLdOf('/es/acerca', about, ORIGIN))).toMatchObject({
      '@type': 'Article',
      headline: 'Acerca de',
      inLanguage: 'es-US',
    });
  });

  it('describes a Spanish calculator in Spanish, named by its title without the site', () => {
    const salt = { title: 'Calculadora de sal para piscina | Pool Figures', description: 'Sal.' };
    expect(JSON.parse(jsonLdOf('/es/calculadora-de-sal-para-piscina', salt, ORIGIN))).toMatchObject(
      {
        '@type': 'WebApplication',
        name: 'Calculadora de sal para piscina',
        inLanguage: 'es-US',
        url: `${ORIGIN}/es/calculadora-de-sal-para-piscina`,
      },
    );
  });

  it('cannot break out of its script element', () => {
    const text = jsonLdOf('/methodology', { title: '</script>', description: '' }, ORIGIN);
    expect(text).not.toContain('</script>');
  });
});

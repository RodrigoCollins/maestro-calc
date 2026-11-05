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
      publisher: { '@type': 'Organization', name: 'Pool Figures' },
    });
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

  it('cannot break out of its script element', () => {
    const text = jsonLdOf('/methodology', { title: '</script>', description: '' }, ORIGIN);
    expect(text).not.toContain('</script>');
  });
});

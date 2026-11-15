import { describe, expect, it } from 'vitest';
import { pathsOf, ROUTES } from '../routes.ts';
import { canonicalPath, sitemapXml } from './sitemap.ts';

describe('canonicalPath', () => {
  it('names a built file by its public path', () => {
    expect(canonicalPath('/methodology.html')).toBe('/methodology');
    expect(canonicalPath('/index.html')).toBe('/');
    expect(canonicalPath('/')).toBe('/');
    expect(canonicalPath('/dog-food-calculator')).toBe('/dog-food-calculator');
  });
});

describe('sitemapXml', () => {
  const xml = sitemapXml(ROUTES, 'https://bowlfigures.com');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);

  it('lists every route once, by address', () => {
    expect(locs).toHaveLength(ROUTES.length);
    expect(locs).toContain('https://bowlfigures.com/dog-food-calculator');
    expect(locs).toContain('https://bowlfigures.com/');
  });

  it('is sorted by address', () => {
    const paths = locs.map((loc) => new URL(loc ?? '').pathname);
    expect(paths).toEqual([...paths].sort());
  });

  it('leaves the German pages and every hreflang out while German is closed', () => {
    expect(locs.some((loc) => loc?.includes('/de'))).toBe(false);
    expect(xml).not.toContain('hreflang');
  });
});

describe('sitemapXml, German open', () => {
  const open = { origin: 'https://bowlfigures.com', indexable: true, deIndexable: true };
  const xml = sitemapXml(ROUTES, open.origin, open);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);

  it('lists every English and German page once', () => {
    expect(locs).toHaveLength(ROUTES.flatMap(pathsOf).length);
    expect(locs).toContain('https://bowlfigures.com/de/hundejahre-rechner');
    expect(new Set(locs).size).toBe(locs.length);
  });

  it('gives both twins the pair and x-default at English, and a page with no twin none', () => {
    const urlOf = (loc: string): string =>
      xml.split('<url>').find((url) => url.includes(`<loc>${loc}</loc>`)) ?? '';
    for (const loc of [
      'https://bowlfigures.com/dog-age-calculator',
      'https://bowlfigures.com/de/hundejahre-rechner',
    ]) {
      const url = urlOf(loc);
      expect(url).toContain('hreflang="de" href="https://bowlfigures.com/de/hundejahre-rechner"');
      expect(url).toContain(
        'hreflang="x-default" href="https://bowlfigures.com/dog-age-calculator"',
      );
    }
    expect(urlOf('https://bowlfigures.com/dog-food-calculator')).not.toContain('hreflang');
  });
});

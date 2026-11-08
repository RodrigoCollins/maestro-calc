import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routes.ts';
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
});

import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routes.ts';
import { SITE } from '../site.config.ts';
import { canonicalPath, sitemapXml } from './sitemap.ts';

describe('canonicalPath', () => {
  it('names a built file by its public address', () => {
    expect(canonicalPath('/methodology.html')).toBe('/methodology');
    expect(canonicalPath('/index.html')).toBe('/');
    expect(canonicalPath('/frost-dates/index.html')).toBe('/frost-dates/');
    expect(canonicalPath('/frost-dates/texas/2.html')).toBe('/frost-dates/texas/2');
    expect(canonicalPath('/')).toBe('/');
  });
});

describe('sitemapXml', () => {
  const xml = sitemapXml(ROUTES, SITE.origin);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc = '']) => loc);

  it('lists every route once, sorted, at the site origin', () => {
    expect(locs).toHaveLength(ROUTES.length);
    expect(new Set(locs).size).toBe(ROUTES.length);
    expect(locs).toEqual([...locs].sort());
    expect(locs[0]).toBe('https://lawnfigures.com/');
    expect(locs).toContain('https://lawnfigures.com/frost-dates/texas/2');
  });

  it('names no page that is not a route', () => {
    expect(locs.some((loc) => loc.includes('404'))).toBe(false);
  });
});

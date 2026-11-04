import { describe, expect, it } from 'vitest';
import { canonicalPath, pagePaths, sitemapXml } from './sitemap.ts';

describe('pagePaths', () => {
  it('turns the page files into paths, the home as /, and leaves the 404 out', () => {
    expect(
      pagePaths([
        './index.astro',
        './pool-salt-calculator.astro',
        './404.astro',
        './methodology.astro',
      ]),
    ).toEqual(['/', '/methodology', '/pool-salt-calculator']);
  });

  it('lists the paths a dynamic page file builds, and refuses one it was not told', () => {
    expect(
      pagePaths(['./index.astro', './[job].astro'], { './[job].astro': ['/b', '/a'] }),
    ).toEqual(['/', '/a', '/b']);
    expect(() => pagePaths(['./[job].astro'])).toThrow('./[job].astro');
  });
});

describe('sitemapXml', () => {
  it('lists every path once on the origin, the home with its slash', () => {
    const xml = sitemapXml(['/', '/methodology'], 'https://poolfigures.com');
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml.match(/<loc>/g)).toHaveLength(2);
    expect(xml).toContain('<loc>https://poolfigures.com/</loc>');
    expect(xml).toContain('<loc>https://poolfigures.com/methodology</loc>');
  });
});

describe('canonicalPath', () => {
  it('gives a built page its public path: no .html, and the home as /', () => {
    expect(canonicalPath('/index.html')).toBe('/');
    expect(canonicalPath('/')).toBe('/');
    expect(canonicalPath('/methodology.html')).toBe('/methodology');
    expect(canonicalPath('/methodology')).toBe('/methodology');
  });
});

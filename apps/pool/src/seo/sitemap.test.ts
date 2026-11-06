import { describe, expect, it } from 'vitest';
import { canonicalUrl } from '@maestro-calc/site-kit/canonical';
import { ROUTES, type Route } from '../routes.ts';
import { canonicalPath, sitemapXml } from './sitemap.ts';

const ORIGIN = 'https://poolfigures.com';
const english: readonly Route[] = [
  { id: 'methodology', kind: 'article', en: '/methodology' },
  { id: 'home', kind: 'home', en: '/' },
];
const paired: readonly Route[] = [
  ...english,
  { id: 'salt', kind: 'calculator', en: '/pool-salt-calculator', es: '/es/sal' },
];

describe('sitemapXml', () => {
  it('lists every page once on the origin, sorted, the home with its slash', () => {
    const xml = sitemapXml(english, ORIGIN);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
    expect(xml).not.toContain('xhtml');
    expect([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc)).toEqual([
      `${ORIGIN}/`,
      `${ORIGIN}/methodology`,
    ]);
  });

  it('gives a page with a twin both addresses, each with the pair and x-default at English', () => {
    const xml = sitemapXml(paired, ORIGIN);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml.match(/<loc>/g)).toHaveLength(4);
    const alternates = [
      `<xhtml:link rel="alternate" hreflang="en-US" href="${ORIGIN}/pool-salt-calculator"/>`,
      `<xhtml:link rel="alternate" hreflang="es-US" href="${ORIGIN}/es/sal"/>`,
      `<xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}/pool-salt-calculator"/>`,
    ];
    for (const loc of ['/pool-salt-calculator', '/es/sal']) {
      const block = new RegExp(`<url>\\s*<loc>${ORIGIN}${loc}</loc>([\\s\\S]*?)</url>`).exec(xml);
      expect(block?.[1]?.trim().split(/\s+(?=<)/), loc).toEqual(alternates);
    }
  });

  // a page with no twin yet names no alternate: never one to a page that does not exist
  it('leaves a page with no twin plain', () => {
    expect(sitemapXml(paired, ORIGIN)).toContain(`<url><loc>${ORIGIN}/methodology</loc></url>`);
  });

  it('lists the English site as it did before the route table: every page and job page, sorted', () => {
    const paths = ROUTES.map(({ en }) => en).sort();
    const before = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...paths.map((path) => `  <url><loc>${canonicalUrl(path, ORIGIN)}</loc></url>`),
      '</urlset>',
      '',
    ].join('\n');
    expect(
      sitemapXml(
        ROUTES.map(({ id, kind, en }) => ({ id, kind, en })),
        ORIGIN,
      ),
    ).toBe(before);
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

import { describe, expect, it } from 'vitest';
import { alternatesOf, ROUTES, urlOf } from '../routing/routes.ts';
import { sitemapXml } from './sitemap.ts';

const blocksOf = (xml: string): string[] => xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
const locsOf = (xml: string): string[] =>
  Array.from(xml.matchAll(/<loc>([^<]*)<\/loc>/g), (match) => match[1] ?? '');

const fixture = {
  about: { en: '/about', es: '/es/sobre-nosotros' },
  'a&b': { en: '/a&b', es: '/es/a<b' },
} as const;

describe('sitemap (site-seo › Sitemap)', () => {
  // spec: site-seo › [SE10] derived form, [SE11] source side
  it('has one url block per routable page with the three alternates', () => {
    const xml = sitemapXml();
    const ids = Object.keys(ROUTES);
    expect(blocksOf(xml)).toHaveLength(2 * ids.length);
    expect(locsOf(xml)).toEqual(
      ids.flatMap((id) => Object.values(ROUTES[id as keyof typeof ROUTES]).map(urlOf)),
    );
    for (const block of blocksOf(xml)) {
      const links = Array.from(
        block.matchAll(/<xhtml:link rel="alternate" hreflang="([^"]+)" href="([^"]+)"\/>/g),
        (match) => ({ hreflang: match[1], href: match[2] }),
      );
      expect(links, block).toEqual(alternatesOf('home'));
    }
  });

  it('writes the home block exactly', () => {
    expect(blocksOf(sitemapXml())[0]).toBe(
      '<url><loc>https://maestrocalc.com/</loc>' +
        '<xhtml:link rel="alternate" hreflang="en-US" href="https://maestrocalc.com/"/>' +
        '<xhtml:link rel="alternate" hreflang="es-US" href="https://maestrocalc.com/es"/>' +
        '<xhtml:link rel="alternate" hreflang="x-default" href="https://maestrocalc.com/"/></url>',
    );
  });

  it('declares the XML and xhtml namespaces and lists no 404 and no query', () => {
    const xml = sitemapXml();
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset ')).toBe(true);
    expect(xml).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml.replace(/^<\?xml[^>]*\?>/, '')).not.toMatch(/404|\?/);
  });

  it('follows an injected table and escapes XML special characters', () => {
    const xml = sitemapXml(fixture);
    expect(locsOf(xml)).toEqual([
      'https://maestrocalc.com/about',
      'https://maestrocalc.com/es/sobre-nosotros',
      'https://maestrocalc.com/a&amp;b',
      'https://maestrocalc.com/es/a&lt;b',
    ]);
    expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;)/);
    expect(xml).not.toContain('<b');
  });
});

describe('sitemap escaping', () => {
  it('escapes quotes and greater-than signs in locations as well', () => {
    const xml = sitemapXml({ q: { en: '/a"b>c', es: '/es/q' } });
    expect(xml).toContain('<loc>https://maestrocalc.com/a&quot;b&gt;c</loc>');
  });
});

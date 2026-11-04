import { describe, expect, it } from 'vitest';
import { localizedUrls, sitemapXml } from './sitemap.ts';

const PAIR = [
  { hreflang: 'en-US', href: 'https://example.com/' },
  { hreflang: 'es-US', href: 'https://example.com/es' },
  { hreflang: 'x-default', href: 'https://example.com/' },
] as const;

describe('localizedUrls', () => {
  it('lists one URL per language of a page, in order, each with the whole set of alternates', () => {
    expect(localizedUrls(PAIR)).toEqual([
      { loc: 'https://example.com/', alternates: PAIR },
      { loc: 'https://example.com/es', alternates: PAIR },
    ]);
  });

  it('never lists x-default as a URL of its own', () => {
    expect(localizedUrls([{ hreflang: 'x-default', href: 'https://example.com/' }])).toEqual([]);
  });
});

describe('sitemapXml, lines layout (the default)', () => {
  it('writes a plain page on one line, without the xhtml namespace when no page has alternates', () => {
    expect(sitemapXml([{ loc: 'https://example.com/' }, { loc: 'https://example.com/a' }])).toBe(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        '  <url><loc>https://example.com/</loc></url>',
        '  <url><loc>https://example.com/a</loc></url>',
        '</urlset>',
        '',
      ].join('\n'),
    );
  });

  it('writes a page with alternates one element per line, and declares the xhtml namespace', () => {
    expect(sitemapXml(localizedUrls(PAIR).slice(0, 1))).toBe(
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        '  <url>',
        '    <loc>https://example.com/</loc>',
        '    <xhtml:link rel="alternate" hreflang="en-US" href="https://example.com/"/>',
        '    <xhtml:link rel="alternate" hreflang="es-US" href="https://example.com/es"/>',
        '    <xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/"/>',
        '  </url>',
        '</urlset>',
        '',
      ].join('\n'),
    );
  });

  it('writes an empty urlset when there is no page', () => {
    expect(sitemapXml([])).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        '</urlset>\n',
    );
  });
});

describe('sitemapXml, compact layout', () => {
  it('writes every page on the urlset line, with no whitespace between elements', () => {
    expect(sitemapXml(localizedUrls(PAIR), 'compact')).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">' +
        '<url><loc>https://example.com/</loc>' +
        '<xhtml:link rel="alternate" hreflang="en-US" href="https://example.com/"/>' +
        '<xhtml:link rel="alternate" hreflang="es-US" href="https://example.com/es"/>' +
        '<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/"/>' +
        '</url>' +
        '<url><loc>https://example.com/es</loc>' +
        '<xhtml:link rel="alternate" hreflang="en-US" href="https://example.com/"/>' +
        '<xhtml:link rel="alternate" hreflang="es-US" href="https://example.com/es"/>' +
        '<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/"/>' +
        '</url>' +
        '</urlset>\n',
    );
  });

  it('writes a plain page without alternates and without the xhtml namespace', () => {
    expect(sitemapXml([{ loc: 'https://example.com/' }], 'compact')).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
        '<url><loc>https://example.com/</loc></url>' +
        '</urlset>\n',
    );
  });
});

describe('sitemapXml escaping', () => {
  it('escapes the XML specials of every URL, the ampersand first so no entity is escaped twice', () => {
    const xml = sitemapXml(
      [
        {
          loc: 'https://example.com/?a=1&b="2"',
          alternates: [{ hreflang: 'en', href: 'https://example.com/<x>&amp;' }],
        },
      ],
      'compact',
    );
    expect(xml).toContain('<loc>https://example.com/?a=1&amp;b=&quot;2&quot;</loc>');
    expect(xml).toContain('href="https://example.com/&lt;x&gt;&amp;amp;"');
  });
});

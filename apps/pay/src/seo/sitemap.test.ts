import { describe, expect, it } from 'vitest';
import { sitemapXml } from './sitemap.ts';

const ROUTES = [
  { id: 'home', en: '/', es: '/es' },
  { id: 'time-card', en: '/time-card-calculator', es: '/es/calculadora-de-horas-trabajadas' },
];

describe('sitemapXml', () => {
  const xml = sitemapXml(ROUTES, 'https://cuentahoras.com');

  it('lists both languages of every route, English first', () => {
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);
    expect(locs).toEqual([
      'https://cuentahoras.com/',
      'https://cuentahoras.com/es',
      'https://cuentahoras.com/time-card-calculator',
      'https://cuentahoras.com/es/calculadora-de-horas-trabajadas',
    ]);
  });

  it('gives every URL its en-US, es-US and x-default alternates', () => {
    const blocks = xml.split('<url>').slice(1);
    expect(blocks).toHaveLength(4);
    for (const block of blocks) {
      expect(block.match(/hreflang="en-US"/g)).toHaveLength(1);
      expect(block.match(/hreflang="es-US"/g)).toHaveLength(1);
      expect(block.match(/hreflang="x-default"/g)).toHaveLength(1);
    }
    expect(blocks[1]).toContain(
      '<xhtml:link rel="alternate" hreflang="x-default" href="https://cuentahoras.com/"/>',
    );
  });

  it('is a urlset with the xhtml namespace', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset')).toBe(true);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
  });
});

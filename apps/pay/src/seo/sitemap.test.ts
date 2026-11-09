import { describe, expect, it } from 'vitest';
import { sitemapXml } from './sitemap.ts';

const ROUTES = [
  { id: 'home', kind: 'home', en: '/', es: '/es' },
  {
    id: 'time-card',
    kind: 'calculator',
    en: '/time-card-calculator',
    es: '/es/calculadora-de-horas-trabajadas',
  },
] as const;

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

  it('lists an English-only page as one plain URL, with no alternates', () => {
    const single = sitemapXml(
      [{ id: 'military-time-1500', kind: 'article', en: '/military-time/1500' }],
      'https://cuentahoras.com',
    );
    expect([...single.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc)).toEqual([
      'https://cuentahoras.com/military-time/1500',
    ]);
    expect(single).not.toContain('hreflang');
  });

  it('lists a Spanish-only page as one plain URL, with no alternates', () => {
    const single = sitemapXml(
      [{ id: 'navidad', kind: 'article', es: '/es/fechas/cuantos-dias-faltan-para-navidad' }],
      'https://cuentahoras.com',
    );
    expect([...single.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc)).toEqual([
      'https://cuentahoras.com/es/fechas/cuantos-dias-faltan-para-navidad',
    ]);
    expect(single).not.toContain('hreflang');
  });

  it('is a urlset with the xhtml namespace', () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<urlset')).toBe(true);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml.trimEnd().endsWith('</urlset>')).toBe(true);
  });
});

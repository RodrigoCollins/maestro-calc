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

describe('sitemapXml, every twin language closed', () => {
  const closed = {
    origin: 'https://bowlfigures.com',
    indexable: true,
    deIndexable: false,
    frIndexable: false,
    esIndexable: false,
  };
  const xml = sitemapXml(ROUTES, closed.origin, closed);
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

  it('leaves the twin pages and every hreflang out while their languages are closed', () => {
    expect(locs.some((loc) => loc?.includes('/es'))).toBe(false);
    expect(locs.some((loc) => loc?.includes('/de'))).toBe(false);
    expect(locs.some((loc) => loc?.includes('/fr'))).toBe(false);
    expect(xml).not.toContain('hreflang');
  });
});

describe('sitemapXml, German open', () => {
  const open = {
    origin: 'https://bowlfigures.com',
    indexable: true,
    deIndexable: true,
    frIndexable: false,
    esIndexable: false,
  };
  const xml = sitemapXml(ROUTES, open.origin, open);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);

  it('lists every English and German page once', () => {
    expect(locs).toHaveLength(ROUTES.length + ROUTES.filter(({ de }) => de !== undefined).length);
    expect(locs).toContain('https://bowlfigures.com/de/hundejahre-rechner');
    expect(locs.some((loc) => loc?.includes('/fr'))).toBe(false);
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

describe('sitemapXml, German and French open', () => {
  const open = {
    origin: 'https://bowlfigures.com',
    indexable: true,
    deIndexable: true,
    frIndexable: true,
    esIndexable: true,
  };
  const xml = sitemapXml(ROUTES, open.origin, open);
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);

  it('lists every English, German, French and Spanish page once', () => {
    expect(locs).toHaveLength(ROUTES.flatMap(pathsOf).length);
    expect(locs).toContain('https://bowlfigures.com/fr/age-chien-en-humain');
    expect(new Set(locs).size).toBe(locs.length);
  });

  it('gives each of the three twins all three languages and x-default at English', () => {
    const url =
      xml
        .split('<url>')
        .find((block) =>
          block.includes('<loc>https://bowlfigures.com/fr/age-chien-en-humain</loc>'),
        ) ?? '';
    expect(url).toContain('hreflang="de" href="https://bowlfigures.com/de/hundejahre-rechner"');
    expect(url).toContain('hreflang="fr" href="https://bowlfigures.com/fr/age-chien-en-humain"');
    expect(url).toContain('hreflang="x-default" href="https://bowlfigures.com/dog-age-calculator"');
  });
});

describe('sitemapXml, as shipped: Spanish open, German and French closed', () => {
  const xml = sitemapXml(ROUTES, 'https://bowlfigures.com');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);

  it('lists every English and Spanish page once, and no German or French one', () => {
    expect(locs).toHaveLength(ROUTES.length + ROUTES.filter(({ es }) => es !== undefined).length);
    expect(locs).toContain('https://bowlfigures.com/es/los-perros-pueden-comer-fresas');
    // by the first segment: a Spanish slug may hold the letters (/es/dedalera-…)
    expect(locs.some((loc) => loc?.includes('bowlfigures.com/de'))).toBe(false);
    expect(locs.some((loc) => loc?.includes('bowlfigures.com/fr'))).toBe(false);
  });

  it('pairs each Spanish page with its English twin and x-default, and names no closed twin', () => {
    const url =
      xml
        .split('<url>')
        .find((block) =>
          block.includes(
            '<loc>https://bowlfigures.com/es/que-pasa-si-un-perro-come-chocolate</loc>',
          ),
        ) ?? '';
    expect(url).toContain('hreflang="en" href="https://bowlfigures.com/my-dog-ate-chocolate"');
    expect(url).toContain(
      'hreflang="x-default" href="https://bowlfigures.com/my-dog-ate-chocolate"',
    );
    expect(xml).not.toContain('hreflang="de"');
    expect(xml).not.toContain('hreflang="fr"');
  });
});

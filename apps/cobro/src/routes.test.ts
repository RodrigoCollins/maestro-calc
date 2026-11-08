import { describe, expect, it } from 'vitest';
import {
  hrefOf,
  langOf,
  ROUTES,
  routeOf,
  TRADE_PATHS,
  wageAreasOf,
  wagePathOf,
  WAGE_STEMS,
} from './routes.ts';
import { OCCUPATIONS } from './wages/occupations.ts';

describe('routes', () => {
  // a published address is a public contract: it is written out here on purpose
  it('pins the five calculator pages in both languages', () => {
    expect(OCCUPATIONS.map(({ id }) => TRADE_PATHS[id])).toEqual([
      {
        es: '/cuanto-cobrar-por-limpiar-una-casa',
        en: '/en/how-much-to-charge-to-clean-a-house',
      },
      { es: '/cuanto-cobrar-por-pintar-una-casa', en: '/en/how-much-to-charge-to-paint-a-house' },
      {
        es: '/cuanto-cobrar-por-instalar-drywall',
        en: '/en/how-much-to-charge-to-install-drywall',
      },
      {
        es: '/cuanto-cobrar-por-pie-cuadrado-de-concreto',
        en: '/en/how-much-to-charge-for-concrete',
      },
      { es: '/cuanto-cobrar-por-jardineria', en: '/en/how-much-to-charge-for-landscaping' },
    ]);
  });

  it('pins the home pair: Spanish at the root, English under /en', () => {
    expect(ROUTES[0]).toEqual({ id: 'home', kind: 'home', es: '/', en: '/en' });
  });

  it('names a state page after its trade and state, in each language', () => {
    expect(wagePathOf('painting', '48', 'es')).toBe('/cuanto-gana-un-pintor-en-texas');
    expect(wagePathOf('painting', '48', 'en')).toBe('/en/how-much-does-a-painter-make-in-texas');
    expect(wagePathOf('cleaning', '35', 'es')).toBe(
      '/cuanto-gana-un-trabajador-de-limpieza-en-nuevo-mexico',
    );
  });

  it('refuses a state it does not know', () => {
    expect(() => wagePathOf('painting', '99', 'es')).toThrow('no area 99');
  });

  it('gives a page to each trade and state that has both figures, and to no other', () => {
    for (const { id } of OCCUPATIONS) {
      const areas = wageAreasOf(id);
      expect(areas.length).toBeGreaterThan(40);
      for (const { fips } of areas) {
        expect(routeOf(wagePathOf(id, fips, 'es'))?.id).toBe(`wage-${id}-${fips}`);
      }
      expect(routeOf(WAGE_STEMS[id].es)?.id).toBe(`wages-${id}`);
    }
  });

  it('never repeats an address, in either language', () => {
    const paths = ROUTES.flatMap(({ es, en }) => [es, en]);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it('puts every Spanish page at the root and every English one under /en', () => {
    for (const { es, en } of ROUTES) {
      expect(langOf(es)).toBe('es');
      expect(langOf(en)).toBe('en');
      expect(es.startsWith('/en')).toBe(false);
    }
  });

  it('reads the language of an embed from its path', () => {
    expect(langOf('/embed/cuanto-cobrar-por-jardineria')).toBe('es');
    expect(langOf('/embed/en/how-much-to-charge-for-landscaping')).toBe('en');
  });

  it('finds a route by either address, and the address of a route by id', () => {
    expect(routeOf('/en/markup-vs-margin')?.id).toBe('markup-guide');
    expect(routeOf('/nope')).toBeUndefined();
    expect(hrefOf('markup-guide', 'es')).toBe('/recargo-o-margen');
    expect(() => hrefOf('nope', 'es')).toThrow('no route nope');
  });
});

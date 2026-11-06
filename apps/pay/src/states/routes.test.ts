import { describe, expect, it } from 'vitest';
import { MINIMUM_WAGE_STATES } from '../guide/minimum-wage-states.ts';
import { OVERTIME_STATES } from '../guide/overtime-states.ts';
import { TIPPED_STATES } from '../guide/tipped-states.ts';
import { ROUTES } from '../routes.ts';
import { slugOf, STATE_ROUTES, STATE_SLUGS, statePathOf, STATES_INDEX_PATHS } from './routes.ts';

const LANGS = ['en', 'es'] as const;

describe('STATE_SLUGS (one page per state and DC)', () => {
  it('has the 50 states and DC', () => {
    expect(STATE_SLUGS).toHaveLength(51);
  });

  it.each([
    ['tipped', TIPPED_STATES],
    ['minimum wage', MINIMUM_WAGE_STATES],
    ['overtime', OVERTIME_STATES],
  ] as const)('names the same states, in order, as the %s table, in both languages', (_, rows) => {
    for (const lang of LANGS)
      expect(STATE_SLUGS.map((slug) => slug[lang])).toEqual(
        rows.map(({ name }) => slugOf(name[lang])),
      );
  });

  it('writes a slug in plain lowercase ASCII words joined by hyphens', () => {
    expect(slugOf('District of Columbia')).toBe('district-of-columbia');
    expect(slugOf('Hawái')).toBe('hawai');
    expect(slugOf('Nuevo México')).toBe('nuevo-mexico');
    for (const slug of STATE_SLUGS)
      for (const lang of LANGS) expect(slug[lang]).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  it('gives every state a page in both languages, English at /states and Spanish at /es/estados', () => {
    expect(STATE_ROUTES).toHaveLength(51);
    for (const route of STATE_ROUTES) {
      expect(route.en).toMatch(/^\/states\/[a-z-]+$/);
      expect(route.es).toMatch(/^\/es\/estados\/[a-z-]+$/);
      expect(ROUTES).toContainEqual(route);
    }
    expect(statePathOf('California', 'en')).toBe('/states/california');
    expect(statePathOf('Nueva York', 'es')).toBe('/es/estados/nueva-york');
  });

  it('routes the index of the state pages as a collection', () => {
    expect(STATES_INDEX_PATHS).toEqual({ en: '/states', es: '/es/estados' });
    expect(ROUTES).toContainEqual({ id: 'states', kind: 'collection', ...STATES_INDEX_PATHS });
  });

  it('refuses a name that is no state of the table', () => {
    expect(() => statePathOf('Puerto Rico', 'en')).toThrow(/no state page/);
  });
});

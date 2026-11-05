import { describe, expect, it } from 'vitest';
import { NEIGHBORS } from '../long-tail/nearest.ts';
import { LONG_TAIL_ROUTES } from '../long-tail/routes.ts';
import { ROUTES } from '../routes.ts';
import {
  GUIDE_CALCULATORS,
  GUIDE_RULES,
  HUBS,
  LONG_TAIL_RULES,
  SITEMAP_PATHS,
} from './link-rules.ts';

const both = (routes: readonly { en: string; es: string }[]): string[] =>
  routes.flatMap(({ en, es }) => [en, es]);
const calculators = both(ROUTES.filter(({ kind }) => kind === 'calculator'));

describe('LONG_TAIL_RULES', () => {
  it('holds every long-tail page once, in each language', () => {
    expect(LONG_TAIL_RULES.map(({ path }) => path).sort()).toEqual(both(LONG_TAIL_ROUTES).sort());
  });

  it('gives each a calculator of the route table and at most NEIGHBORS nearest siblings of its language', () => {
    for (const { path, calculator, siblings } of LONG_TAIL_RULES) {
      expect(calculators, path).toContain(calculator);
      expect(siblings.length, path).toBeGreaterThan(0);
      expect(siblings.length, path).toBeLessThanOrEqual(NEIGHBORS);
      expect(siblings, path).not.toContain(path);
      const prefix = path.startsWith('/es/') ? '/es/pago/' : '/pay/';
      for (const sibling of siblings) expect(sibling.startsWith(prefix), sibling).toBe(true);
      expect(calculator.startsWith('/es/'), path).toBe(path.startsWith('/es/'));
    }
  });

  it('keeps a family on one calculator: the $20 an hour page is the hourly to salary one', () => {
    expect(LONG_TAIL_RULES).toContainEqual(
      expect.objectContaining({
        path: '/pay/20-an-hour-is-how-much-a-year',
        calculator: '/hourly-to-salary-calculator',
      }),
    );
    expect(LONG_TAIL_RULES).toContainEqual(
      expect.objectContaining({
        path: '/es/pago/tiempo-doble-de-20-la-hora',
        calculator: '/es/calculadora-de-horas-extra',
      }),
    );
  });
});

describe('GUIDE_RULES', () => {
  it('holds every guide of the route table, each explaining calculators of it', () => {
    const guides = ROUTES.filter(({ id }) => id.endsWith('-guide'));
    expect(Object.keys(GUIDE_CALCULATORS).sort()).toEqual(guides.map(({ id }) => id).sort());
    expect(GUIDE_RULES.map(({ path }) => path).sort()).toEqual(both(guides).sort());
    for (const { path, calculators: explained } of GUIDE_RULES) {
      expect(explained.length, path).toBeGreaterThan(0);
      for (const calculator of explained) {
        expect(calculators, path).toContain(calculator);
        expect(calculator.startsWith('/es/'), path).toBe(path.startsWith('/es/'));
      }
    }
  });
});

describe('HUBS and SITEMAP_PATHS', () => {
  it('are the two homes and every route of the table in both languages', () => {
    expect(HUBS).toEqual(['/', '/es']);
    expect(SITEMAP_PATHS).toEqual(both(ROUTES));
  });
});

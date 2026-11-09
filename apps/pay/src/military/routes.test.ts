import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routes.ts';
import {
  MILITARY_CHART_PATHS,
  MILITARY_CONVERTER_PATHS,
  MILITARY_TIME_ROUTES,
  MILITARY_TIMES,
  militaryPathOf,
} from './routes.ts';

describe('the military time routes', () => {
  it('pairs the converter, a calculator, and the chart, an article, in both languages', () => {
    expect(ROUTES).toContainEqual({
      id: 'military-time-converter',
      kind: 'calculator',
      en: '/military-time-converter',
      es: '/es/convertidor-de-hora-militar',
    });
    expect(ROUTES).toContainEqual({
      id: 'military-time-chart',
      kind: 'article',
      en: '/military-time-chart',
      es: '/es/tabla-de-hora-militar',
    });
    expect(MILITARY_CONVERTER_PATHS.en).toBe('/military-time-converter');
    expect(MILITARY_CHART_PATHS.es).toBe('/es/tabla-de-hora-militar');
  });

  it('has one page per hour and half hour of the day, 0000 to 2330, in order', () => {
    expect(MILITARY_TIMES).toHaveLength(48);
    expect(MILITARY_TIMES.map(({ minutes }) => minutes)).toEqual(
      Array.from({ length: 48 }, (_, i) => i * 30),
    );
    expect(MILITARY_TIMES.slice(0, 3).map(({ slug }) => slug)).toEqual(['0000', '0030', '0100']);
    expect(MILITARY_TIMES.at(-1)?.slug).toBe('2330');
  });

  it('serves each time in English only, at /military-time/ and its four digits', () => {
    const [first] = MILITARY_TIMES;
    if (first === undefined) throw new Error('no military time page');
    expect(militaryPathOf(first)).toBe('/military-time/0000');
    expect(MILITARY_TIME_ROUTES[30]).toEqual({
      id: 'military-time-1500',
      kind: 'article',
      en: '/military-time/1500',
    });
    for (const route of MILITARY_TIME_ROUTES) {
      expect(route).not.toHaveProperty('es');
      expect(ROUTES).toContainEqual(route);
    }
  });
});

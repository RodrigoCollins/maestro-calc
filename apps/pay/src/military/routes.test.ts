import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routes.ts';
import {
  MILITARY_CHART_PATHS,
  MILITARY_CONVERTER_PATHS,
  MILITARY_TIME_ROUTES,
  MILITARY_TIMES,
  militaryPathOf,
  SPANISH_TIMES,
  spanishPathOf,
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

  it('serves each time in English at /military-time/ and its four digits', () => {
    const [first] = MILITARY_TIMES;
    if (first === undefined) throw new Error('no military time page');
    expect(militaryPathOf(first)).toBe('/military-time/0000');
    expect(MILITARY_TIME_ROUTES[2]).toEqual({
      id: 'military-time-0100',
      kind: 'article',
      en: '/military-time/0100',
    });
    for (const route of MILITARY_TIME_ROUTES) expect(ROUTES).toContainEqual(route);
  });

  it('pairs midnight and every time from noon on with its Spanish twin, "las 19 horas"', () => {
    expect(SPANISH_TIMES.map(({ slug }) => slug)).toEqual([
      '0000',
      '0030',
      ...Array.from({ length: 24 }, (_, i) => {
        const minutes = 720 + i * 30;
        return `${String(Math.floor(minutes / 60))}${minutes % 60 === 0 ? '00' : '30'}`;
      }),
    ]);
    expect(MILITARY_TIME_ROUTES[38]).toEqual({
      id: 'military-time-1900',
      kind: 'article',
      en: '/military-time/1900',
      es: '/es/hora/las-19-horas',
    });
    const at = (slug: string) => SPANISH_TIMES.find((job) => job.slug === slug);
    const paths = ['0000', '0030', '1200', '1830'].map((slug) => {
      const job = at(slug);
      if (job === undefined) throw new Error(`no Spanish page ${slug}`);
      return spanishPathOf(job);
    });
    expect(paths).toEqual([
      '/es/hora/las-00-horas',
      '/es/hora/las-00-30-horas',
      '/es/hora/las-12-horas',
      '/es/hora/las-18-30-horas',
    ]);
    const spanish = MILITARY_TIME_ROUTES.filter((route) => route.es !== undefined);
    expect(spanish).toHaveLength(26);
    expect(MILITARY_TIME_ROUTES.filter((route) => route.es === undefined)).toHaveLength(22);
  });
});

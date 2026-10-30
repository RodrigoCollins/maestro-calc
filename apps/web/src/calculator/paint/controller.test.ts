import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enPaint } from '@maestro-calc/i18n/catalogs/en/paint';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esPaint } from '@maestro-calc/i18n/catalogs/es/paint';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { pageViewOf } from '../../lib/page-view.ts';
import { controllerOf, type Environment } from '../controller.ts';
import { paintPage } from './page.ts';

const envOf = (locale: 'en' | 'es'): Environment => {
  const catalog: Record<string, string> =
    locale === 'en'
      ? { ...enCommon, ...enPaint, ...enSite }
      : { ...esCommon, ...esPaint, ...esSite };
  return {
    messages: Object.fromEntries(pageViewOf(paintPage, locale, catalog).messages),
    origin: 'https://maestrocalc.com',
    path: '/paint-calculator',
    switchPath: '/es/calculadora-de-pintura',
    helps: new Set(),
  };
};

const viewOf = (locale: 'en' | 'es', search: string) =>
  controllerOf(paintPage).start(envOf(locale), search).view;

/*
 * Hand-verified (calc-paint › [PA2]–[PA5]): 2 × (12 + 12) × 8 = 384 ft² of walls, less 1 door and
 * 2 windows (50 ft²) = 334 ft²; 2 coats at 350 ft² a gallon = 334/175 = 1.91 gal = 7.22 L, so 2
 * gallon cans; at $40 a gallon, $80.00. Three coats: 2.86 gal, 3 cans.
 */
describe('paint page: the answer through the controller (calc-paint)', () => {
  it.each([
    [
      'en',
      '?v=1',
      'A 12 ft by 12 ft room with 8 ft walls needs 1.91 gallons of paint for 2 coats: 2 gallon cans.',
    ],
    [
      'es',
      '?v=1',
      'Un cuarto de 12 ft por 12 ft con paredes de 8 ft lleva 1.91 galones de pintura para 2 manos: 2 latas de un galón.',
    ],
    [
      'en',
      '?v=1&c=3',
      'A 12 ft by 12 ft room with 8 ft walls needs 2.86 gallons of paint for 3 coats: 3 gallon cans.',
    ],
    [
      'en',
      '?v=1&u=m',
      'A 3.66 m by 3.66 m room with 2.44 m walls needs 7.22 liters of paint for 2 coats: 2 gallon cans.',
    ],
  ] as const)('says the %s answer of %s', (locale, search, sentence) => {
    expect(viewOf(locale, search).answer).toBe(sentence);
  });

  it('shows the gallons as the large figure and one gallon line', () => {
    const view = viewOf('en', '?v=1');
    expect(view.panel.primary).toMatchObject({ key: 'gallons', value: '1.91' });
    expect(view.panel.figures).toMatchObject({
      liters: '7.22',
      paintArea: '334.00',
      wallArea: '384.00',
    });
    expect(view.panel.shopping).toEqual([
      { material: 'paint', unit: 'gallon', fills: {}, qty: '2' },
    ]);
  });

  it('shows the cost once the price is typed', () => {
    expect(viewOf('en', '?v=1&gp=40').panel.figures).toMatchObject({ cost: '$80.00' });
    expect(viewOf('en', '?v=1&gp=40').panel.costs).toEqual({ cost: true });
    expect(viewOf('en', '?v=1').panel.costs).toEqual({ cost: false });
  });

  it('names the drawing with the answer and writes the wall note in each language', () => {
    for (const [locale, note] of [
      ['en', '8 ft walls'],
      ['es', 'paredes de 8 ft'],
    ] as const) {
      const view = viewOf(locale, '?v=1');
      expect(view.plan?.name).toBe(view.answer);
      expect(view.plan?.labels.map(({ text }) => text)).toEqual(['12 ft', '12 ft', note]);
    }
  });
});

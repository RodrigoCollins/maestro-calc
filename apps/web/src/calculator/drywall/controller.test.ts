import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enDrywall } from '@maestro-calc/i18n/catalogs/en/drywall';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esDrywall } from '@maestro-calc/i18n/catalogs/es/drywall';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { pageViewOf } from '../../lib/page-view.ts';
import { controllerOf, type Environment } from '../controller.ts';
import { drywallPage } from './page.ts';

const envOf = (locale: 'en' | 'es'): Environment => {
  const catalog: Record<string, string> =
    locale === 'en'
      ? { ...enCommon, ...enDrywall, ...enSite }
      : { ...esCommon, ...esDrywall, ...esSite };
  return {
    messages: Object.fromEntries(pageViewOf(drywallPage, locale, catalog).messages),
    origin: 'https://maestrocalc.com',
    path: '/drywall-calculator',
    switchPath: '/es/calculadora-de-drywall',
    helps: new Set(),
  };
};

const viewOf = (locale: 'en' | 'es', search: string) =>
  controllerOf(drywallPage).start(envOf(locale), search).view;

/*
 * Hand-verified (calc-drywall › [DW2]–[DW6]): 384 ft² of walls, less 50 ft² of openings, plus the
 * 144 ft² ceiling = 478 ft² (44.41 m²); 525.8 ft² with 10 % extra ÷ 32 = 16.4, so 17 sheets of
 * 4 × 8 ft (11 of 4 × 12 ft); 4.30 gallons of compound, 1 pail; 176.86 ft of tape, 1 roll. Walls
 * only: 334 ft², 12 sheets. At $12 a sheet, $204.00.
 */
describe('drywall page: the answer through the controller (calc-drywall)', () => {
  it.each([
    [
      'en',
      '?v=1',
      'A 12 ft by 12 ft room with 8 ft walls has 478.00 square feet of walls and ceiling to cover. Sheets of 4 × 8 ft: 17.',
    ],
    [
      'es',
      '?v=1',
      'Un cuarto de 12 ft por 12 ft con paredes de 8 ft tiene 478.00 pies cuadrados de paredes y techo para cubrir. Placas de 4 × 8 ft: 17.',
    ],
    [
      'en',
      '?v=1&sf=walls&sz=4x12',
      'A 12 ft by 12 ft room with 8 ft walls has 334.00 square feet of walls to cover. Sheets of 4 × 12 ft: 8.',
    ],
    [
      'es',
      '?v=1&sf=walls',
      'Un cuarto de 12 ft por 12 ft con paredes de 8 ft tiene 334.00 pies cuadrados de paredes para cubrir. Placas de 4 × 8 ft: 12.',
    ],
    [
      'en',
      '?v=1&u=m',
      'A 3.66 m by 3.66 m room with 2.44 m walls has 44.41 square meters of walls and ceiling to cover. Sheets of 4 × 8 ft: 17.',
    ],
  ] as const)('says the %s answer of %s', (locale, search, sentence) => {
    expect(viewOf(locale, search).answer).toBe(sentence);
  });

  it('shows the area as the large figure and the three lines', () => {
    const view = viewOf('en', '?v=1');
    expect(view.panel.primary).toMatchObject({ key: 'areaFt2', value: '478.00' });
    expect(view.panel.figures).toMatchObject({ areaM2: '44.41', compound: '4.30', tape: '176.86' });
    expect(view.panel.shopping).toEqual([
      { material: 'drywall', unit: 'sheet-4x8', fills: { size: '4 × 8 ft' }, qty: '17' },
      { material: 'joint-compound', unit: 'pail', fills: {}, qty: '1' },
      { material: 'joint-tape', unit: 'roll', fills: {}, qty: '1' },
    ]);
  });

  it('shows the cost once the price is typed', () => {
    expect(viewOf('en', '?v=1&sp=12').panel.figures).toMatchObject({ cost: '$204.00' });
    expect(viewOf('en', '?v=1&sp=12').panel.costs).toEqual({ cost: true });
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

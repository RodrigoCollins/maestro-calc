import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enMulch } from '@maestro-calc/i18n/catalogs/en/mulch';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esMulch } from '@maestro-calc/i18n/catalogs/es/mulch';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { pageViewOf } from '../../lib/page-view.ts';
import { controllerOf, type Environment } from '../controller.ts';
import { mulchPage } from './page.ts';

const envOf = (locale: 'en' | 'es'): Environment => {
  const catalog: Record<string, string> =
    locale === 'en'
      ? { ...enCommon, ...enMulch, ...enSite }
      : { ...esCommon, ...esMulch, ...esSite };
  return {
    messages: Object.fromEntries(pageViewOf(mulchPage, locale, catalog).messages),
    origin: 'https://maestrocalc.com',
    path: '/mulch-calculator',
    switchPath: '/es/calculadora-de-mulch',
    helps: new Set(),
  };
};

const viewOf = (locale: 'en' | 'es', search: string) =>
  controllerOf(mulchPage).start(envOf(locale), search).view;

/*
 * Hand-verified (calc-mulch › [MU2], [MU3]): 20 ft × 4 ft × 3 in + 5 % = 21 ft³ = 0.78 yd³ =
 * 0.59 m³, 11 bags of 2 cu ft or 7 of 3 cu ft; at $5 a bag 7 bags cost $35.00, and at $36 a yard
 * the bulk cost is $28.00.
 */
describe('mulch page: the answer through the controller (calc-mulch)', () => {
  it.each([
    [
      'en',
      '?v=1',
      'A 20 ft by 4 ft bed, 3 in deep, needs 0.78 cubic yards of mulch: 11 bags of 2 cu ft.',
    ],
    [
      'es',
      '?v=1',
      'Un área de 20 ft por 4 ft, de 3 in de profundidad, lleva 0.78 yardas cúbicas de mulch: 11 bolsas de 2 cu ft.',
    ],
    [
      'en',
      '?v=1&bg=3',
      'A 20 ft by 4 ft bed, 3 in deep, needs 0.78 cubic yards of mulch: 7 bags of 3 cu ft.',
    ],
    [
      'en',
      '?v=1&u=m',
      'A 6.10 m by 1.22 m bed, 7.62 cm deep, needs 0.59 cubic meters of mulch: 11 bags of 2 cu ft.',
    ],
  ] as const)('says the %s answer of %s', (locale, search, sentence) => {
    expect(viewOf(locale, search).answer).toBe(sentence);
  });

  it('shows the cubic yards as the large figure and one bag line', () => {
    const view = viewOf('en', '?v=1');
    expect(view.panel.primary).toMatchObject({ key: 'volumeYd3', value: '0.78' });
    expect(view.panel.figures).toMatchObject({
      volumeFt3: '21.00',
      volumeM3: '0.59',
      netVolume: '20.00',
    });
    expect(view.panel.shopping).toEqual([
      { material: 'mulch', unit: 'bag-2', fills: { size: '2' }, qty: '11' },
    ]);
  });

  it('shows each cost once its price is typed', () => {
    const view = viewOf('en', '?v=1&bg=3&bp=5&yp=36');
    expect(view.panel.figures).toMatchObject({ bagCost: '$35.00', bulkCost: '$28.00' });
    expect(view.panel.costs).toEqual({ bagCost: true, bulkCost: true });
    expect(viewOf('en', '?v=1').panel.costs).toEqual({ bagCost: false, bulkCost: false });
  });

  it('names the drawing with the answer and writes the depth note in each language', () => {
    for (const [locale, note] of [
      ['en', '3 in deep'],
      ['es', '3 in de profundidad'],
    ] as const) {
      const view = viewOf(locale, '?v=1');
      expect(view.plan?.name).toBe(view.answer);
      expect(view.plan?.labels.map(({ text }) => text)).toEqual(['20 ft', '4 ft', note]);
    }
  });
});

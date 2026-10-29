import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enTopsoil } from '@maestro-calc/i18n/catalogs/en/topsoil';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esTopsoil } from '@maestro-calc/i18n/catalogs/es/topsoil';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { pageViewOf } from '../../lib/page-view.ts';
import { controllerOf, type Environment } from '../controller.ts';
import { topsoilPage } from './page.ts';

const envOf = (locale: 'en' | 'es'): Environment => {
  const catalog: Record<string, string> =
    locale === 'en'
      ? { ...enCommon, ...enTopsoil, ...enSite }
      : { ...esCommon, ...esTopsoil, ...esSite };
  return {
    messages: Object.fromEntries(pageViewOf(topsoilPage, locale, catalog).messages),
    origin: 'https://maestrocalc.com',
    path: '/topsoil-calculator',
    switchPath: '/es/calculadora-de-tierra',
    helps: new Set(),
  };
};

const viewOf = (locale: 'en' | 'es', search: string) =>
  controllerOf(topsoilPage).start(envOf(locale), search).view;

/*
 * Hand-verified (calc-topsoil › [TS2], [TS3], [TS5]): 10 ft × 10 ft × 4 in + 10 % = 110/3 ft³ =
 * 1.36 yd³ = 1.04 m³; 49 bags of 0.75 cu ft or 25 of 1.5 cu ft; 37 bags of 1 cu ft at $4 cost
 * $148.00, and at $45 a yard the bulk cost is 110/81 × 45 = $61.11.
 */
describe('topsoil page: the answer through the controller (calc-topsoil)', () => {
  it.each([
    [
      'en',
      '?v=1',
      'A 10 ft by 10 ft area, 4 in deep, needs 1.36 cubic yards of topsoil: 49 bags of 0.75 cu ft.',
    ],
    [
      'es',
      '?v=1',
      'Un área de 10 ft por 10 ft, de 4 in de profundidad, lleva 1.36 yardas cúbicas de tierra: 49 bolsas de 0.75 cu ft.',
    ],
    [
      'en',
      '?v=1&bg=1-5',
      'A 10 ft by 10 ft area, 4 in deep, needs 1.36 cubic yards of topsoil: 25 bags of 1.5 cu ft.',
    ],
    [
      'en',
      '?v=1&u=m',
      'A 3.05 m by 3.05 m area, 10.16 cm deep, needs 1.04 cubic meters of topsoil: 49 bags of 0.75 cu ft.',
    ],
  ] as const)('says the %s answer of %s', (locale, search, sentence) => {
    expect(viewOf(locale, search).answer).toBe(sentence);
  });

  it('shows the cubic yards as the large figure and one bag line', () => {
    const view = viewOf('en', '?v=1');
    expect(view.panel.primary).toMatchObject({ key: 'volumeYd3', value: '1.36' });
    expect(view.panel.figures).toMatchObject({
      volumeFt3: '36.67',
      volumeM3: '1.04',
      netVolume: '33.33',
    });
    expect(view.panel.shopping).toEqual([
      { material: 'topsoil', unit: 'bag-0-75', fills: { size: '0.75' }, qty: '49' },
    ]);
  });

  it('shows each cost once its price is typed', () => {
    const view = viewOf('en', '?v=1&bg=1&bp=4&yp=45');
    expect(view.panel.figures).toMatchObject({ bagCost: '$148.00', bulkCost: '$61.11' });
    expect(view.panel.costs).toEqual({ bagCost: true, bulkCost: true });
  });

  it('names the drawing with the answer and writes the depth note in each language', () => {
    for (const [locale, note] of [
      ['en', '4 in deep'],
      ['es', '4 in de profundidad'],
    ] as const) {
      const view = viewOf(locale, '?v=1');
      expect(view.plan?.name).toBe(view.answer);
      expect(view.plan?.labels.map(({ text }) => text)).toEqual(['10 ft', '10 ft', note]);
    }
  });
});

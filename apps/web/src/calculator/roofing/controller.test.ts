import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enRoofing } from '@maestro-calc/i18n/catalogs/en/roofing';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esRoofing } from '@maestro-calc/i18n/catalogs/es/roofing';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { pageViewOf } from '../../lib/page-view.ts';
import { controllerOf, type Environment } from '../controller.ts';
import { roofingPage } from './page.ts';

const envOf = (locale: 'en' | 'es'): Environment => {
  const catalog: Record<string, string> =
    locale === 'en'
      ? { ...enCommon, ...enRoofing, ...enSite }
      : { ...esCommon, ...esRoofing, ...esSite };
  return {
    messages: Object.fromEntries(pageViewOf(roofingPage, locale, catalog).messages),
    origin: 'https://maestrocalc.com',
    path: '/roofing-calculator',
    switchPath: '/es/calculadora-de-tejas',
    helps: new Set(),
  };
};

const viewOf = (locale: 'en' | 'es', search: string) =>
  controllerOf(roofingPage).start(envOf(locale), search).view;

/*
 * Hand-verified (calc-roofing › [RF2]–[RF6]): a 40 ft by 30 ft footprint at 6 in 12 is 1,200 ×
 * 1.1180339887… = 1,341.64 ft² of roof, 13.42 squares, 124.64 m²; with 10 % extra 45 bundles and 2
 * rolls. At 3 in 12: 1,236.93 ft² (12.37 squares), 41 bundles, 3 rolls in two layers. At 1 in 12
 * below the 2 in 12 minimum. At $35 a bundle $1,575.00, at $90 a roll $180.00.
 */
describe('roofing page: the answer through the controller (calc-roofing)', () => {
  it.each([
    [
      'en',
      '?v=1',
      'A 40 ft by 30 ft footprint at 6 in 12 has 13.42 squares of roof. Bundles of shingles: 45. Rolls of underlayment: 2.',
    ],
    [
      'es',
      '?v=1',
      'Una planta de 40 ft por 30 ft con pendiente de 6 en 12 tiene 13.42 cuadrados de techo. Paquetes de tejas: 45. Rollos de fieltro: 2.',
    ],
    [
      'en',
      '?v=1&p=3',
      'A 40 ft by 30 ft footprint at 3 in 12 has 12.37 squares of roof. Bundles of shingles: 41. Rolls of underlayment in two layers, as the IRC asks below 4 in 12: 3.',
    ],
    [
      'es',
      '?v=1&p=3',
      'Una planta de 40 ft por 30 ft con pendiente de 3 en 12 tiene 12.37 cuadrados de techo. Paquetes de tejas: 41. Rollos de fieltro en dos capas, como pide el IRC debajo de 4 en 12: 3.',
    ],
    [
      'en',
      '?v=1&p=1',
      'A 40 ft by 30 ft footprint at 1 in 12 has 12.04 squares of roof. That is below the IRC minimum of 2 in 12 for asphalt shingles: choose another covering.',
    ],
    [
      'es',
      '?v=1&p=1',
      'Una planta de 40 ft por 30 ft con pendiente de 1 en 12 tiene 12.04 cuadrados de techo. Está por debajo del mínimo del IRC de 2 en 12 para tejas asfálticas: elige otra cubierta.',
    ],
    [
      'en',
      '?v=1&u=m',
      'A 12.19 m by 9.14 m footprint at 6 in 12 has 124.64 m² of roof. Bundles of shingles: 45. Rolls of underlayment: 2.',
    ],
  ] as const)('says the %s answer of %s', (locale, search, sentence) => {
    expect(viewOf(locale, search).answer).toBe(sentence);
  });

  it('shows the squares as the large figure and the two lines', () => {
    const view = viewOf('en', '?v=1');
    expect(view.panel.primary).toMatchObject({ key: 'squares', value: '13.42' });
    expect(view.panel.figures).toMatchObject({ areaFt2: '1,341.64', areaM2: '124.64' });
    expect(view.panel.shopping).toEqual([
      { material: 'shingles', unit: 'bundle', fills: {}, qty: '45' },
      { material: 'underlayment', unit: 'roll', fills: {}, qty: '2' },
    ]);
  });

  it('shows each cost once its price is typed', () => {
    const priced = viewOf('en', '?v=1&bp=35&rp=90');
    expect(priced.panel.figures).toMatchObject({
      shinglesCost: '$1,575.00',
      underlaymentCost: '$180.00',
    });
    expect(priced.panel.costs).toEqual({ shinglesCost: true, underlaymentCost: true });
    expect(viewOf('en', '?v=1&bp=35').panel.costs).toEqual({
      shinglesCost: true,
      underlaymentCost: false,
    });
  });

  it('names the drawing with the answer and writes the pitch note in each language', () => {
    for (const [locale, note] of [
      ['en', '6 in 12 pitch'],
      ['es', 'pendiente de 6 en 12'],
    ] as const) {
      const view = viewOf(locale, '?v=1');
      expect(view.plan?.name).toBe(view.answer);
      expect(view.plan?.labels.map(({ text }) => text)).toEqual(['40 ft', '30 ft', note]);
    }
  });
});

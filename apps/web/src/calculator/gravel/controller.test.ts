import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enGravel } from '@maestro-calc/i18n/catalogs/en/gravel';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esGravel } from '@maestro-calc/i18n/catalogs/es/gravel';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { pageViewOf } from '../../lib/page-view.ts';
import { controllerOf, type Environment } from '../controller.ts';
import { gravelPage } from './page.ts';

/** The environment of the page in a locale: the messages are the page view's own templates. */
const envOf = (locale: 'en' | 'es'): Environment => {
  const catalog: Record<string, string> =
    locale === 'en'
      ? { ...enCommon, ...enGravel, ...enSite }
      : { ...esCommon, ...esGravel, ...esSite };
  return {
    messages: Object.fromEntries(pageViewOf(gravelPage, locale, catalog).messages),
    origin: 'https://maestrocalc.com',
    path: '/gravel-calculator',
    switchPath: '/es/calculadora-de-grava',
    helps: new Set(),
  };
};

const viewOf = (locale: 'en' | 'es', search: string) =>
  controllerOf(gravelPage).start(envOf(locale), search).view;

/*
 * Hand-verified (calc-gravel › [GR2], [GR3]): 20 ft × 10 ft × 4 in with 5 % extra is 70 ft³; at
 * 1.83 t/yd³ that is 4.74 tons (4.30 metric tonnes), at 1.29 t/yd³ loose 3.34 tons; a 30 ft by
 * 3 ft path 3 in deep, loose: 22.5 ft³ × 1.05 = 23.625 ft³ = 0.875 yd³ × 1.29 = 1.13 tons.
 */
describe('gravel page: the answer through the controller (calc-gravel)', () => {
  it.each([
    ['en', '?v=1', 'A 20 ft by 10 ft area, 4 in deep and compacted, needs 4.74 tons of gravel.'],
    [
      'es',
      '?v=1',
      'Un área de 20 ft por 10 ft, de 4 in de profundidad y compactada, lleva 4.74 toneladas de grava.',
    ],
    [
      'en',
      '?v=1&pl=loose',
      'A 20 ft by 10 ft area, 4 in deep and loose, needs 3.34 tons of gravel.',
    ],
    [
      'es',
      '?v=1&pl=loose',
      'Un área de 20 ft por 10 ft, de 4 in de profundidad y suelta, lleva 3.34 toneladas de grava.',
    ],
    [
      'en',
      '?v=1&l=360&w=36&d=3&pl=loose',
      'A 30 ft by 3 ft area, 3 in deep and loose, needs 1.13 tons of gravel.',
    ],
    [
      'en',
      '?v=1&u=m',
      'A 6.10 m by 3.05 m area, 10.16 cm deep and compacted, needs 4.30 metric tonnes of gravel.',
    ],
  ] as const)('says the %s answer of %s', (locale, search, sentence) => {
    expect(viewOf(locale, search).answer).toBe(sentence);
  });

  it('shows the weight as the large figure and the volume to order among the figures', () => {
    const view = viewOf('en', '?v=1');
    expect(view.panel.primary).toMatchObject({ key: 'tons', value: '4.74' });
    expect(view.panel.figures).toMatchObject({
      tonnes: '4.30',
      orderYd3: '3.68',
      orderM3: '2.81',
      placedYd3: '2.47',
    });
  });

  it('shows the cost once a price per ton is typed: $45 × 4.744… = $213.50', () => {
    const view = viewOf('en', '?v=1&tp=45');
    expect(view.panel.figures.cost).toBe('$213.50');
    expect(view.panel.costs).toEqual({ cost: true });
    expect(viewOf('en', '?v=1').panel.costs).toEqual({ cost: false });
  });

  it('names the drawing with the answer and writes the depth note in each language', () => {
    for (const [locale, note] of [
      ['en', '4 in deep'],
      ['es', '4 in de profundidad'],
    ] as const) {
      const view = viewOf(locale, '?v=1');
      expect(view.plan?.name).toBe(view.answer);
      expect(view.plan?.labels.map(({ text }) => text)).toEqual(['20 ft', '10 ft', note]);
    }
  });
});

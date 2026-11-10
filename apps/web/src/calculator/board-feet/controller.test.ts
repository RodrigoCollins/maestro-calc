import { enBoardFeet } from '@maestro-calc/i18n/catalogs/en/board-feet';
import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esBoardFeet } from '@maestro-calc/i18n/catalogs/es/board-feet';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { pageViewOf } from '../../lib/page-view.ts';
import { controllerOf, type Environment } from '../controller.ts';
import { boardFeetPage } from './page.ts';

const envOf = (locale: 'en' | 'es'): Environment => {
  const catalog: Record<string, string> =
    locale === 'en'
      ? { ...enCommon, ...enBoardFeet, ...enSite }
      : { ...esCommon, ...esBoardFeet, ...esSite };
  return {
    messages: Object.fromEntries(pageViewOf(boardFeetPage, locale, catalog).messages),
    origin: 'https://maestrocalc.com',
    path: '/board-feet-calculator',
    switchPath: '/es/calculadora-de-pies-tablares',
    helps: new Set(),
  };
};

const viewOf = (locale: 'en' | 'es', search: string) =>
  controllerOf(boardFeetPage).start(envOf(locale), search).view;

/*
 * Hand-verified (calc-board-feet › [BF2]–[BF5]): a 2x4x8 is 2 × 4 × 8 ÷ 12 = 5.33 board feet,
 * 0.44 ft³ and 0.013 m³ (4/9 × 0.028316846592 = 0.01258…); ten of them are 53.33 board feet, 4.44 ft³
 * and 0.126 m³, at $1.50 a board foot $80.00; a 2x12 12 ft long is 2 × 12 × 12 ÷ 12 = 24; in metric
 * 2 in is 5.08 cm, 4 in 10.16 cm and 8 ft 2.44 m.
 */
describe('board feet page: the answer through the controller (calc-board-feet)', () => {
  it.each([
    ['en', '?v=1', 'A 2 in by 4 in board 8 ft long is 5.33 board feet.'],
    ['es', '?v=1', 'Una pieza de 2 in por 4 in y 8 ft de largo tiene 5.33 pies tablares.'],
    [
      'en',
      '?v=1&n=10',
      '10 boards of 2 in by 4 in, 8 ft long, are 53.33 board feet: 5.33 board feet each.',
    ],
    [
      'es',
      '?v=1&n=10',
      '10 piezas de 2 in por 4 in y 8 ft de largo tienen 53.33 pies tablares: 5.33 pies tablares cada una.',
    ],
    ['en', '?v=1&w=12&l=144', 'A 2 in by 12 in board 12 ft long is 24.00 board feet.'],
    ['en', '?v=1&t=3/2&w=7/2', 'A 1 1/2 in by 3 1/2 in board 8 ft long is 3.50 board feet.'],
    ['en', '?v=1&u=m', 'A 5.08 cm by 10.16 cm board 2.44 m long is 5.33 board feet.'],
  ] as const)('says the %s answer of %s', (locale, search, sentence) => {
    expect(viewOf(locale, search).answer).toBe(sentence);
  });

  it('shows the board feet as the large figure, the volume beside it and the cost once priced', () => {
    const view = viewOf('en', '?v=1&n=10&pp=3/2');
    expect(view.panel.primary).toMatchObject({ key: 'boardFeet', value: '53.33' });
    expect(view.panel.figures).toMatchObject({
      boardFeetEach: '5.33',
      volumeFt3: '4.44',
      volumeM3: '0.126',
      cost: '$80.00',
    });
    expect(view.panel.costs).toEqual({ cost: true });
    expect(viewOf('en', '?v=1').panel.costs).toEqual({ cost: false });
  });

  it('names the drawing with the answer and writes the thickness note in each language', () => {
    for (const [locale, note] of [
      ['en', '2 in thick'],
      ['es', '2 in de grosor'],
    ] as const) {
      const view = viewOf(locale, '?v=1');
      expect(view.plan?.name).toBe(view.answer);
      expect(view.plan?.labels.map(({ text }) => text)).toEqual(['8 ft', '4 in', note]);
    }
  });
});

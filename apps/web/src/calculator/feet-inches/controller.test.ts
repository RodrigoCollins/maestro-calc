import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enFeetInches } from '@maestro-calc/i18n/catalogs/en/feet-inches';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esFeetInches } from '@maestro-calc/i18n/catalogs/es/feet-inches';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { pageViewOf } from '../../lib/page-view.ts';
import { controllerOf, type Environment } from '../controller.ts';
import { feetInchesPage } from './page.ts';

const envOf = (locale: 'en' | 'es'): Environment => {
  const catalog: Record<string, string> =
    locale === 'en'
      ? { ...enCommon, ...enFeetInches, ...enSite }
      : { ...esCommon, ...esFeetInches, ...esSite };
  return {
    messages: Object.fromEntries(pageViewOf(feetInchesPage, locale, catalog).messages),
    origin: 'https://maestrocalc.com',
    path: '/feet-and-inches-calculator',
    switchPath: '/es/calculadora-de-pies-y-pulgadas',
    helps: new Set(),
  };
};

const viewOf = (locale: 'en' | 'es', search: string) =>
  controllerOf(feetInchesPage).start(envOf(locale), search).view;

/*
 * Hand-verified (calc-feet-inches › [FI2]–[FI5]): 150 + 44.25 = 194.25 in = 16 ft 2 1/4 in
 * (4.93395 m); 150 − 44.25 = 105.75 in = 8 ft 9 3/4 in; 150 × 2 = 300 in = 25 ft; 150 ÷ 7 =
 * 21.43 in, nearest 1/16: 1 ft 9 7/16 in; 150 − 120 = 30 in = 2 ft 6 in.
 */
describe('feet and inches page: the answer through the controller (calc-feet-inches)', () => {
  it.each([
    ['en', '?v=1', '12 ft 6 in plus 3 ft 8 1/4 in is 16 ft 2 1/4 in.'],
    ['es', '?v=1', '12 ft 6 in más 3 ft 8 1/4 in da 16 ft 2 1/4 in.'],
    ['en', '?v=1&o=subtract', '12 ft 6 in minus 3 ft 8 1/4 in is 8 ft 9 3/4 in.'],
    ['es', '?v=1&o=subtract', '12 ft 6 in menos 3 ft 8 1/4 in da 8 ft 9 3/4 in.'],
    ['en', '?v=1&o=subtract&a=120&b=150', '12 ft 6 in is longer than 10 ft by 2 ft 6 in.'],
    ['es', '?v=1&o=subtract&a=120&b=150', '12 ft 6 in es más larga que 10 ft por 2 ft 6 in.'],
    // a decimal to feet and inches: 11.65 ft = 139.8 in = 11 ft 7.8 in, nearest 1/16: 7 13/16 in (the length echoes 7 51/64 in)
    ['en', '?v=1&a=699/5&o=multiply&n=1', '11 ft 7 51/64 in times 1 is 11 ft 7 13/16 in.'],
    ['en', '?v=1&o=multiply', '12 ft 6 in times 2 is 25 ft.'],
    ['es', '?v=1&o=multiply', '12 ft 6 in por 2 da 25 ft.'],
    ['en', '?v=1&o=divide&n=7', '12 ft 6 in divided into 7 equal parts is 1 ft 9 7/16 in each.'],
    [
      'es',
      '?v=1&o=divide&n=7',
      '12 ft 6 in dividido en 7 partes iguales da 1 ft 9 7/16 in cada una.',
    ],
    ['en', '?v=1&u=m', '3.81 m plus 1.12 m is 4.934 m.'],
    // calc-feet-inches › [FI7]: 240 / 16 = 15, nothing left; 240 / 7 = 34.2857, 34 pieces, 2 in
    // left; 150 / 44.25 = 3.3898, 3 pieces, 17.25 in left; 120 / 100 = 1.2, 1 piece, 20 in left;
    // 120 / 150 = 0.8, none, 120 in left. The quotient is cut, not rounded, to two places.
    ['en', '?v=1&o=fit&a=240&b=16', '20 ft ÷ 1 ft 4 in = 15: 15 whole pieces and 0 in left over.'],
    [
      'es',
      '?v=1&o=fit&a=240&b=16',
      '20 ft ÷ 1 ft 4 in = 15: 15 piezas enteras y un sobrante de 0 in.',
    ],
    ['en', '?v=1&o=fit&a=240&b=7', '20 ft ÷ 7 in = 34.28: 34 whole pieces and 2 in left over.'],
    [
      'en',
      '?v=1&o=fit',
      '12 ft 6 in ÷ 3 ft 8 1/4 in = 3.38: 3 whole pieces and 1 ft 5 1/4 in left over.',
    ],
    [
      'en',
      '?v=1&o=fit&a=120&b=100',
      '10 ft ÷ 8 ft 4 in = 1.2: 1 whole piece and 1 ft 8 in left over.',
    ],
    [
      'es',
      '?v=1&o=fit&a=120&b=100',
      '10 ft ÷ 8 ft 4 in = 1.2: 1 pieza entera y un sobrante de 1 ft 8 in.',
    ],
    [
      'en',
      '?v=1&o=fit&a=120&b=150',
      '10 ft ÷ 12 ft 6 in = 0.8: 0 whole pieces and 10 ft left over.',
    ],
    ['en', '?v=1&o=fit&b=0', 'Enter a second length above 0 to see how many fit in 12 ft 6 in.'],
    [
      'es',
      '?v=1&o=fit&b=0',
      'Ingresa una segunda medida mayor que 0 para ver cuántas caben en 12 ft 6 in.',
    ],
    [
      'en',
      '?v=1&u=m&o=fit&a=240&b=16',
      '6.10 m ÷ 40.64 cm = 15: 15 whole pieces and 0.000 m left over.',
    ],
    // a quotient that rounds up to the next whole is cut: 1199/600 = 1.9983, one piece
    [
      'en',
      '?v=1&o=fit&a=1199&b=600',
      '99 ft 11 in ÷ 50 ft = 1.99: 1 whole piece and 49 ft 11 in left over.',
    ],
  ] as const)('says the %s answer of %s', (locale, search, sentence) => {
    expect(viewOf(locale, search).answer).toBe(sentence);
  });

  it('shows the result in feet and inches as the large figure, and in inches and meters', () => {
    const view = viewOf('en', '?v=1');
    expect(view.panel.primary).toMatchObject({ key: 'result', value: '16 ft 2 1/4 in' });
    expect(view.panel.figures).toMatchObject({ resultIn: '194.25', resultM: '4.934' });
    expect(view.panel.shopping).toEqual([]);
  });

  // calc-feet-inches › [FI7]: how many fit is the question, so the pieces are the large figure
  it.each([
    ['en', '?v=1&o=fit&a=240&b=7', '34', ' pieces'],
    ['es', '?v=1&o=fit&a=240&b=7', '34', ' piezas'],
    ['en', '?v=1&u=m&o=fit&a=240&b=16', '15', ' pieces'],
    ['en', '?v=1&o=fit&a=120&b=150', '0', ' pieces'],
    ['en', '?v=1&o=fit&b=0', '0', ' pieces'],
    ['en', '?v=1&o=fit&a=120&b=100', '1', ' piece'],
    ['es', '?v=1&u=m&o=fit&a=120&b=100', '1', ' pieza'],
  ] as const)(
    'shows the pieces of the %s fit %s as the large figure',
    (locale, search, value, after) => {
      expect(viewOf(locale, search).panel.primary).toEqual({
        key: 'pieces',
        before: '',
        value,
        after,
      });
    },
  );

  it('shows what is left of a fit in the three rows, the result row no longer hidden', () => {
    const view = viewOf('en', '?v=1&o=fit&a=240&b=7');
    expect(view.panel.figures).toEqual({
      result: '2 in',
      resultIn: '2.00',
      resultM: '0.051',
      pieces: '34',
    });
  });

  it('keeps the result as the large figure of the other operations', () => {
    expect(viewOf('en', '?v=1&o=divide&n=7').panel.primary).toMatchObject({ key: 'result' });
    expect(viewOf('en', '?v=1&u=m&o=subtract').panel.primary).toMatchObject({
      key: 'resultM',
      value: '2.686',
      after: ' m',
    });
  });
});

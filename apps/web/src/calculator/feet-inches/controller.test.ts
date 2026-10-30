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
    ['en', '?v=1&o=multiply', '12 ft 6 in times 2 is 25 ft.'],
    ['es', '?v=1&o=multiply', '12 ft 6 in por 2 da 25 ft.'],
    ['en', '?v=1&o=divide&n=7', '12 ft 6 in divided into 7 equal parts is 1 ft 9 7/16 in each.'],
    [
      'es',
      '?v=1&o=divide&n=7',
      '12 ft 6 in dividido en 7 partes iguales da 1 ft 9 7/16 in cada una.',
    ],
    ['en', '?v=1&u=m', '3.81 m plus 1.12 m is 4.934 m.'],
  ] as const)('says the %s answer of %s', (locale, search, sentence) => {
    expect(viewOf(locale, search).answer).toBe(sentence);
  });

  it('shows the result in feet and inches as the large figure, and in inches and meters', () => {
    const view = viewOf('en', '?v=1');
    expect(view.panel.primary).toMatchObject({ key: 'result', value: '16 ft 2 1/4 in' });
    expect(view.panel.figures).toMatchObject({ resultIn: '194.25', resultM: '4.934' });
    expect(view.panel.shopping).toEqual([]);
  });
});

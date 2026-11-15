import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enFence } from '@maestro-calc/i18n/catalogs/en/fence';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esFence } from '@maestro-calc/i18n/catalogs/es/fence';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { describe, expect, it } from 'vitest';
import { pageViewOf } from '../../lib/page-view.ts';
import { controllerOf, type Environment } from '../controller.ts';
import { fencePage } from './page.ts';

const envOf = (locale: 'en' | 'es'): Environment => {
  const catalog: Record<string, string> =
    locale === 'en'
      ? { ...enCommon, ...enFence, ...enSite }
      : { ...esCommon, ...esFence, ...esSite };
  return {
    messages: Object.fromEntries(pageViewOf(fencePage, locale, catalog).messages),
    origin: 'https://maestrocalc.com',
    path: '/fence-calculator',
    switchPath: '/es/calculadora-de-cercas',
    helps: new Set(),
  };
};

const viewOf = (locale: 'en' | 'es', search: string) =>
  controllerOf(fencePage).start(envOf(locale), search).view;

/*
 * Hand-verified (calc-fence › [FN5]–[FN13]): 100 ft with posts every 8 ft is 12.5 sections, so 13
 * sections, 14 posts and 39 rails; board-on-board, 2 × 1,200 in ÷ (5.5 + 4) in = 252.6, so 253
 * boards; the hole is 10.5 in wide and 36 + 6 = 42 in deep, the post 9 ft long; the concrete is
 * 14 × (π × 5.25² − 3.5²) × 36 in³ = 21.68 ft³, ÷ 0.6 = 36.1, so 37 bags of 80 lb; the gravel 4.21
 * ft³. A 4 ft picket fence: pickets of 5.5 in and 2.5 in gaps, 1,200 ÷ 8 = 150 pickets, 25 bags.
 */
describe('fence page: the answer through the controller (calc-fence)', () => {
  it.each([
    [
      'en',
      '?v=1',
      'Privacy fence 100 ft long and 6 ft high, posts every 8 ft: 14 posts, 39 rails, 253 boards and 37 bags of 80 lb concrete.',
    ],
    [
      'es',
      '?v=1',
      'Cerca de privacidad de 100 ft y 6 ft de alto, postes cada 8 ft: 14 postes, 39 travesaños, 253 tablas y 37 bolsas de 80 lb.',
    ],
    [
      'en',
      '?v=1&h=48&s=picket',
      'Picket fence 100 ft long and 4 ft high, posts every 8 ft: 14 posts, 39 rails, 150 pickets and 25 bags of 80 lb concrete.',
    ],
    [
      'es',
      '?v=1&h=48&s=rail&r=2',
      'Cerca de travesaños de 100 ft y 4 ft de alto, postes cada 8 ft: 14 postes, 26 travesaños y 25 bolsas de 80 lb.',
    ],
  ] as const)('says the %s answer of %s', (locale, search, sentence) => {
    expect(viewOf(locale, search).answer).toBe(sentence);
  });

  it('shows the posts as the large figure, the holes and the four lines', () => {
    const view = viewOf('en', '?v=1');
    expect(view.panel.primary).toMatchObject({ key: 'posts', value: '14' });
    expect(view.panel.figures).toMatchObject({
      holeDiameter: '10 1/2 in',
      holeDepth: '42 in',
      concreteFt3: '21.68',
      gravelFt3: '4.21',
    });
    expect(view.panel.shopping).toEqual([
      { material: 'fence-post', unit: 'post', fills: { length: '9 ft' }, qty: '14' },
      { material: 'fence-rail', unit: 'rail', fills: { length: '8 ft' }, qty: '39' },
      { material: 'fence-board', unit: 'board', fills: { length: '6 ft' }, qty: '253' },
      {
        material: 'concrete-mix',
        unit: 'bag-80',
        fills: { yield: '0.60' },
        qty: '37',
      },
    ]);
  });

  it('shows each cost once its price is typed', () => {
    const view = viewOf('en', '?v=1&pp=20&rp=8&bp=3&cp=6');
    expect(view.panel.figures).toMatchObject({
      postCost: '$280.00',
      railCost: '$312.00',
      boardCost: '$759.00',
      bagCost: '$222.00',
    });
    expect(view.panel.costs).toEqual({
      postCost: true,
      railCost: true,
      boardCost: true,
      bagCost: true,
    });
    expect(viewOf('en', '?v=1&pp=20').panel.costs).toEqual({
      postCost: true,
      railCost: false,
      boardCost: false,
      bagCost: false,
    });
  });

  it('names the drawing with the answer and writes the post note in each language', () => {
    for (const [locale, note] of [
      ['en', 'Posts every 8 ft'],
      ['es', 'Postes cada 8 ft'],
    ] as const) {
      const view = viewOf(locale, '?v=1');
      expect(view.plan?.name).toBe(view.answer);
      expect(view.plan?.labels.map(({ text }) => text)).toEqual(['100 ft', '6 ft', note]);
    }
  });
});

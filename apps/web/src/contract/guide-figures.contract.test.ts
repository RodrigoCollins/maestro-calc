import { describe, expect, it } from 'vitest';
import type { GuideId } from '../routing/guides.ts';
import { LOCALES, pathOf, ROUTES } from '../routing/routes.ts';
import type { CalculatorPageId } from '../routing/templates.ts';
import { CONTENT_ROWS } from './__testing__/calculator-rows.ts';
import { shownFigures } from './__testing__/shown-figures.ts';
import { readEntries } from './content.ts';
import { fromRoot } from './root.ts';

/*
 * The worked examples of the guides that show calculator figures (guides › [GU16], [GU17], [GU18], [GU19], [GU20]): each
 * case is a link the calculator page loads, with the figures that page shows for it, hand-verified
 * and pinned here. The engine must still show them, and the guide must print every one of them, in
 * both languages, next to a link to the calculator that computes it.
 */

/** One worked example: the calculator, the query that loads it and the figures it shows. */
interface GuideCase {
  readonly calculator: CalculatorPageId;
  readonly query: string;
  /** Panel figures by output key. */
  readonly figures: Readonly<Record<string, string>>;
  /** The first shopping quantity (the bags), when the guide quotes it. */
  readonly bags?: string;
}

const GUIDE_CASES: Readonly<
  Record<
    Extract<
      GuideId,
      | 'guide-mulch'
      | 'guide-cubic-yards'
      | 'guide-concrete-bag-coverage'
      | 'guide-paint-coverage'
      | 'guide-gravel-coverage'
    >,
    readonly GuideCase[]
  >
> = {
  'guide-mulch': [
    // 20 ft × 4 ft at 3 in, the page's starting values: 20 ft³, 21 ft³ with 5 percent extra
    {
      calculator: 'mulch',
      query: '',
      figures: { netVolume: '20.00', volumeFt3: '21.00', volumeYd3: '0.78' },
      bags: '11',
    },
    { calculator: 'mulch', query: '?v=1&bg=3', figures: { volumeYd3: '0.78' }, bags: '7' },
    // the same bed at 2 in
    {
      calculator: 'mulch',
      query: '?v=1&d=2',
      figures: { netVolume: '13.33', volumeFt3: '14.00', volumeYd3: '0.52' },
      bags: '7',
    },
    // 30 ft × 10 ft at 3 in
    {
      calculator: 'mulch',
      query: '?v=1&l=360&w=120',
      figures: { netVolume: '75.00', volumeFt3: '78.75', volumeYd3: '2.92' },
      bags: '40',
    },
  ],
  'guide-cubic-yards': [
    // a 10 ft × 10 ft slab, 4 in thick, with the concrete calculator's 10 percent extra
    {
      calculator: 'concrete',
      query: '?v=1&l=120',
      figures: { netVolume: '33.33', volumeFt3: '36.67', volumeYd3: '1.36' },
    },
    // a 12 in column, 8 ft tall: the circle
    {
      calculator: 'concrete',
      query: '?v=1&sh=column',
      figures: { netVolume: '6.28', volumeYd3: '0.26' },
    },
    // a driveway layer 60 ft × 10 ft × 4 in: the volume in place, before any extra
    { calculator: 'gravel', query: '?v=1&l=720', figures: { placedYd3: '7.41' } },
    // a raised bed 8 ft × 4 ft filled 12 in deep, no extra
    {
      calculator: 'topsoil',
      query: '?v=1&l=96&w=48&d=12&ws=0',
      figures: { volumeFt3: '32.00', volumeYd3: '1.19' },
    },
    // a mulch bed 20 ft × 4 ft at 3 in, no extra
    { calculator: 'mulch', query: '?v=1&ws=0', figures: { volumeYd3: '0.74' } },
  ],
  'guide-concrete-bag-coverage': [
    // a 10 ft × 10 ft slab, 4 in thick, no extra: 33.33 ft³ over 0.60 ft³ a bag is 55.6, 56 bags
    {
      calculator: 'concrete',
      query: '?v=1&l=120&ws=0',
      figures: { netVolume: '33.33' },
      bags: '56',
    },
    // the same slab with the default 10 percent extra, in each bag size
    {
      calculator: 'concrete',
      query: '?v=1&l=120',
      figures: { volumeFt3: '36.67', volumeYd3: '1.36' },
      bags: '62',
    },
    { calculator: 'concrete', query: '?v=1&l=120&bg=60', figures: {}, bags: '82' },
    { calculator: 'concrete', query: '?v=1&l=120&bg=40', figures: {}, bags: '123' },
    // the same slab at 6 in, with the extra
    {
      calculator: 'concrete',
      query: '?v=1&l=120&t=6',
      figures: { volumeFt3: '55.00' },
      bags: '92',
    },
  ],
  'guide-paint-coverage': [
    // the page's starting room: 12 ft × 12 ft, 8 ft walls, one door, two windows, two coats at
    // 350 ft² a gallon: 384 ft² of walls, 334 ft² to paint, 668 ÷ 350 = 1.91 gal, 2 cans
    {
      calculator: 'paint',
      query: '',
      figures: { wallArea: '384.00', paintArea: '334.00', gallons: '1.91', liters: '7.22' },
      bags: '2',
    },
    // the same room in one coat and in three
    { calculator: 'paint', query: '?v=1&c=1', figures: { gallons: '0.95' }, bags: '1' },
    { calculator: 'paint', query: '?v=1&c=3', figures: { gallons: '2.86' }, bags: '3' },
    // a 10 ft × 10 ft room and a 12 ft × 16 ft room, same walls and openings, two coats
    {
      calculator: 'paint',
      query: '?v=1&l=120&w=120',
      figures: { paintArea: '270.00', gallons: '1.54' },
      bags: '2',
    },
    {
      calculator: 'paint',
      query: '?v=1&w=192',
      figures: { paintArea: '398.00', gallons: '2.27' },
      bags: '3',
    },
  ],
  'guide-gravel-coverage': [
    // 10 ft × 10 ft, compacted, no extra, at 2, 3 and 4 in: 100 ft² × depth ÷ 27 × 1.83 t/yd³
    { calculator: 'gravel', query: '?v=1&l=120&d=2&ws=0', figures: { tons: '1.13' } },
    { calculator: 'gravel', query: '?v=1&l=120&d=3&ws=0', figures: { tons: '1.69' } },
    { calculator: 'gravel', query: '?v=1&l=120&ws=0', figures: { tons: '2.26' } },
    // the same area at 3 in, spread loose: 0.93 yd³ × 1.29 t/yd³
    { calculator: 'gravel', query: '?v=1&l=120&d=3&pl=loose&ws=0', figures: { tons: '1.19' } },
    // a path 50 ft × 3 ft at 3 in, loose, with the 5 percent extra: 1.46 yd³, 1.88 t
    {
      calculator: 'gravel',
      query: '?v=1&l=600&w=36&d=3&pl=loose',
      figures: { tons: '1.88', orderYd3: '1.46' },
    },
    // the page's starting driveway, 20 ft × 10 ft at 4 in, compacted, 5 percent extra
    {
      calculator: 'gravel',
      query: '',
      figures: { placedYd3: '2.47', tons: '4.74', orderYd3: '3.68' },
    },
  ],
};

const moduleOf = (id: CalculatorPageId) => CONTENT_ROWS[id].module;

/** What a case's calculator shows that differs from the pinned figures, one line each. */
const caseProblems = (
  cases: readonly GuideCase[],
  shown: (guideCase: GuideCase) => ReturnType<typeof shownFigures>,
): string[] =>
  cases.flatMap((guideCase) => {
    const { figures, shopping } = shown(guideCase);
    const label = `${guideCase.calculator} ${guideCase.query || 'default'}`;
    return [
      ...Object.entries(guideCase.figures).flatMap(([key, pinned]) =>
        figures[key] === pinned ? [] : [`${label}: ${key} ${pinned} is ${figures[key] ?? ''}`],
      ),
      ...(guideCase.bags === undefined || shopping[0] === guideCase.bags
        ? []
        : [`${label}: bags ${guideCase.bags} is ${shopping[0] ?? ''}`]),
    ];
  });

const real = (guideCase: GuideCase) =>
  shownFigures(moduleOf(guideCase.calculator), guideCase.query);

const entries = readEntries(fromRoot('apps/web/src/content/pages'));
const bodyOf = (id: string, locale: string): string =>
  entries.find((entry) => entry.path === `${locale}/${id}.md`)?.body ?? '';

const GUIDES_WITH_CASES = Object.entries(GUIDE_CASES);
const PAIRS = GUIDES_WITH_CASES.flatMap(([id, cases]) =>
  LOCALES.map((locale) => [id, locale, cases] as const),
);

describe('guide worked examples (guides › [GU16], [GU17], [GU18], [GU19], [GU20])', () => {
  it.each(GUIDES_WITH_CASES)('the engine shows the pinned figures of %s', (_id, cases) => {
    expect(caseProblems(cases, real)).toEqual([]);
  });

  it('reports a pinned figure the engine no longer shows', () => {
    const drifted = (guideCase: GuideCase) => {
      const shown = real(guideCase);
      return { ...shown, figures: { ...shown.figures, volumeYd3: '9.99' } };
    };
    const [first] = GUIDE_CASES['guide-mulch'];
    if (first === undefined) throw new Error('no mulch case');
    expect(caseProblems([first], drifted)).toEqual(['mulch default: volumeYd3 0.78 is 9.99']);
  });

  it.each(PAIRS)('%s prints every pinned figure in %s', (id, locale, cases) => {
    const body = bodyOf(id, locale);
    expect(body.length).toBeGreaterThan(0);
    const figures = cases.flatMap((guideCase) => [
      ...Object.values(guideCase.figures),
      ...(guideCase.bags === undefined ? [] : [guideCase.bags]),
    ]);
    expect(figures.filter((figure) => !body.includes(figure))).toEqual([]);
  });

  it.each(PAIRS)('%s links every calculator it works an example in, in %s', (id, locale, cases) => {
    const body = bodyOf(id, locale);
    const paths = [...new Set(cases.map(({ calculator }) => pathOf(calculator, locale, ROUTES)))];
    expect(paths.filter((path) => !body.includes(`](${path})`))).toEqual([]);
  });
});

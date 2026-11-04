import { describe, expect, it } from 'vitest';
import type { GuideId } from '../routing/guides.ts';
import { LOCALES, pathOf, ROUTES } from '../routing/routes.ts';
import type { CalculatorPageId } from '../routing/templates.ts';
import { CONTENT_ROWS } from './__testing__/calculator-rows.ts';
import { shownFigures } from './__testing__/shown-figures.ts';
import { readEntries } from './content.ts';
import { fromRoot } from './root.ts';

/*
 * The worked examples of the guides that show calculator figures (guides › [GU16], [GU17]): each
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
  Record<Extract<GuideId, 'guide-mulch' | 'guide-cubic-yards'>, readonly GuideCase[]>
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

describe('guide worked examples (guides › [GU16], [GU17])', () => {
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

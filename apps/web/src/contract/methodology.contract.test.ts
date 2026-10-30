import { concreteMix } from '@maestro-calc/data';
import { CONCRETE_MIX_YIELDS } from '@maestro-calc/data/yields/concrete-mix';
import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { ft3, PI } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { definePage } from '../calculator/page-module.ts';
import { volumeText } from '../calculator/present.ts';
import { LOCALES } from '../routing/routes.ts';
import { hasWord } from '../site-check/dom.ts';
import { CONTENT_ROWS, rowOf } from './__testing__/calculator-rows.ts';
import { METHODOLOGY_ROWS, type MethodologyRow } from './__testing__/methodology-rows.ts';
import { shownFigures } from './__testing__/shown-figures.ts';
import { h1Count, h2Count, h2Ids, readEntries, sectionOf } from './content.ts';
import { fromRoot } from './root.ts';

type Locale = (typeof LOCALES)[number];
const entries = readEntries(fromRoot('apps/web/src/content/pages'));
const bodyOf = (locale: Locale): string =>
  entries.find((entry) => entry.path === `${locale}/methodology.md`)?.body ?? '';
const IDS = Object.keys(METHODOLOGY_ROWS);
const PAIRS = IDS.flatMap((id) => LOCALES.map((locale) => [id, locale] as const));
const rowFor = (id: string): MethodologyRow => {
  const row = Object.entries(METHODOLOGY_ROWS).find(([key]) => key === id)?.[1];
  if (row === undefined) throw new Error(`no methodology row for ${id}`);
  return row;
};
const sectionFor = (id: string, locale: Locale): string =>
  sectionOf(bodyOf(locale), rowFor(id).anchor[locale]);
const concreteSection = (locale: Locale): string => sectionFor('concrete', locale);

describe('methodology: one section per row (trust-pages › [TP22], [TP26], [TP9], [TP25])', () => {
  // spec: trust-pages › [TP22] the anchor exists once, on a heading
  it.each(PAIRS)('anchors the %s section once, on a heading, in %s', (id, locale) => {
    const { anchor } = rowFor(id);
    expect(h2Ids(bodyOf(locale)).filter((found) => found === anchor[locale])).toHaveLength(1);
    expect(sectionFor(id, locale)).toMatch(/^<h2 id="[^"]+">[^<]+<\/h2>/);
  });

  // spec: trust-pages › [TP22] the calculator entries link to the anchor
  it.each(PAIRS)('is linked from the %s calculator entry in %s', async (id, locale) => {
    const { readFileSync } = await import('node:fs');
    const entry = readFileSync(
      fromRoot(`apps/web/src/content/calculators/${locale}/${id}.md`),
      'utf8',
    );
    expect(entry).toContain(`](${rowOf(id)?.methodologyLink[locale] ?? ''})`);
  });

  // the section opens with a link to the page, which the route table now holds
  it.each(PAIRS)('links the calculator page from the %s section in %s', (id, locale) => {
    expect(sectionFor(id, locale)).toContain(rowFor(id).pageLink[locale]);
  });

  // spec: trust-pages › [TP26] the methodology no longer says that nothing is published
  it.each(LOCALES)('does not say that no calculator is published in %s', (locale) => {
    const body = bodyOf(locale).toLowerCase();
    expect(body).not.toContain('no calculator is published yet');
    expect(body).not.toContain('todavía no hay ninguna calculadora publicada');
    expect(body).not.toMatch(/no calculator (is|has been) (published|live)/);
  });

  // spec: trust-pages › [TP41] the first paragraph speaks of every calculator, not of one
  it.each([
    ['en', /formulas, the constants and the test cases of every calculator we publish\./],
    ['es', /fórmulas, las constantes y los casos de prueba de cada calculadora que publicamos\./],
  ] as const)('introduces every published calculator in %s', (locale, every) => {
    const intro = /^# .+\n+(.+)$/m.exec(bodyOf(locale))?.[1] ?? '';
    expect(intro).toMatch(every);
    expect(intro).not.toMatch(/the calculator we publish today|la calculadora que publicamos hoy/);
  });

  // spec: trust-pages › [TP25] the methodology names no unpublished calculator
  it.each(LOCALES)('names no calculator other than the published ones in %s', (locale) => {
    const others = ['roofing', 'drywall', 'paint', 'mulch', 'topsoil', 'techado', 'pintura'];
    expect(others.filter((word) => hasWord(bodyOf(locale), word))).toEqual([]);
  });

  // spec: trust-pages › [TP9] still one H1, at least two h2, the corrections link, no certification claim
  it.each(LOCALES)('keeps one H1 and at least two h2 in %s', (locale) => {
    expect(h1Count(bodyOf(locale))).toBe(1);
    expect(h2Count(bodyOf(locale))).toBeGreaterThanOrEqual(2);
  });
});

describe('methodology: formulas and honesty per row (trust-pages › [TP23], [TP38])', () => {
  // spec: trust-pages › [TP23] the formulas, as written
  it.each(PAIRS)('states the formulas of %s in %s', (id, locale) => {
    const section = sectionFor(id, locale);
    const { formulas } = rowFor(id);
    expect(formulas[locale].length).toBeGreaterThan(0);
    for (const formula of formulas[locale]) expect(section, formula).toContain(formula);
  });

  // spec: trust-pages › [TP23] the extra comes before the bags, bags are rounded up, the text is honest
  it.each(PAIRS)('states what the section of %s must say in %s', (id, locale) => {
    const section = sectionFor(id, locale);
    const { honesty } = rowFor(id);
    expect(honesty[locale].length).toBeGreaterThan(0);
    for (const pattern of honesty[locale]) expect(section).toMatch(pattern);
  });
});

describe('methodology: concrete yields and pi (trust-pages › [TP23])', () => {
  // spec: trust-pages › [TP23], material-data-contract › [MDC4] the yields and their source, read from the record
  it.each(LOCALES)('states the three yields and the source of concreteMix in %s', (locale) => {
    const section = concreteSection(locale);
    const { name, url = '', retrieved } = concreteMix.source;
    expect(url.startsWith('https://')).toBe(true);
    expect(retrieved).toBe('2026-10-25');
    // the page names the source and prints its address as code: a trust page links nowhere outside the site
    expect(section).toContain(`${name}, \`${url}\``);
    expect(section).toContain(retrieved);
    const yields = Object.values(CONCRETE_MIX_YIELDS).map((volume) => volumeText(volume, ft3));
    expect(yields).toEqual(['0.30', '0.45', '0.60']);
    for (const figure of yields) expect(section, figure).toContain(figure);
  });

  // spec: trust-pages › [TP23] pi to 35 digits, with its error
  it.each(LOCALES)('discloses pi to 35 digits and its error in %s', (locale) => {
    const section = concreteSection(locale);
    // PI is a reduced fraction whose decimal expansion ends at the 35th place
    expect((PI.num * 10n ** 35n) % PI.den).toBe(0n);
    const digits = String((PI.num * 10n ** 35n) / PI.den).replace(/^(\d)/, '$1.');
    expect(digits).toBe('3.14159265358979323846264338327950288');
    expect(section).toContain(digits);
    expect(section).toContain('10⁻³⁵');
    expect(section).not.toContain('10^-35');
  });
});

/** The row of the published cases table: the query that loads the case, then the displayed figures. */
interface Case {
  readonly query: string;
  readonly figures: readonly string[];
}

/** The row of the page's starting values carries no query: its label ends in this marker. */
const STARTING = /^\|.*\((starting values|valores iniciales)\)/;

/** The rows of the first table of a section: a query in backticks (or the starting values), then `columns` figures. */
const casesOf = (section: string, columns: number): Case[] =>
  section
    .split('\n')
    .filter((line) => /^\|.*`\?v=1[^`]*`/.test(line) || STARTING.test(line))
    .map((line) => {
      const cells = line.split('|').map((cell) => cell.trim());
      const query = /`(\?v=1[^`]*)`/.exec(cells[1] ?? '')?.[1] ?? '';
      return { query, figures: cells.slice(2, 2 + columns) };
    });

/** What the page shows for a case, in the order of the table columns, from the page's own controller. */
const figuresOfCase = (id: string, row: MethodologyRow, query: string): readonly string[] =>
  row.figuresOf(shownFigures(moduleOf(id), query));

const moduleOf = (id: string) => {
  const found = Object.entries(CONTENT_ROWS).find(([key]) => key === id)?.[1];
  if (found === undefined) throw new Error(`no content row for ${id}`);
  return found.module;
};

/** The cases whose published figures differ from the engine, each as `query: column published is engine`. */
const caseProblems = (
  cases: readonly Case[],
  row: MethodologyRow,
  figuresFor: (query: string) => readonly string[],
): string[] =>
  cases.flatMap((published) => {
    const engine = figuresFor(published.query);
    return row.columns.flatMap((column, index) =>
      published.figures[index] === engine[index]
        ? []
        : [
            `${published.query || 'default'}: ${column} ${published.figures[index] ?? ''} is ${engine[index] ?? ''}`,
          ],
    );
  });

const realFigures = (id: string, row: MethodologyRow) => (query: string) =>
  figuresOfCase(id, row, query);

describe('methodology: published cases (trust-pages › [TP24], [TP40])', () => {
  // spec: trust-pages › [TP24] the published table, parsed from the Markdown, equals the engine
  it.each(PAIRS)(
    'publishes the hand-verified cases of %s that the engine reproduces in %s',
    (id, locale) => {
      const row = rowFor(id);
      const cases = casesOf(sectionFor(id, locale), row.columns.length);
      expect(cases).toEqual(row.published);
      expect(caseProblems(cases, row, realFigures(id, row))).toEqual([]);
    },
  );

  // spec: trust-pages › [TP24] the test fails when a figure changes in the Markdown or in the engine alone
  it.each(IDS)('fails when one figure of %s changes in the Markdown alone', (id) => {
    const row = rowFor(id);
    const [first, second, ...rest] = row.published;
    if (first === undefined || second === undefined) throw new Error('fewer than two cases');
    const [figure = '', ...others] = second.figures;
    const changed = [first, { ...second, figures: [`${figure}9`, ...others] }, ...rest];
    expect(caseProblems(changed, row, realFigures(id, row))).toEqual([
      `${second.query || 'default'}: ${row.columns[0] ?? ''} ${figure}9 is ${figure}`,
    ]);
  });

  it.each(IDS)('fails when one figure of %s changes in the engine alone', (id) => {
    const row = rowFor(id);
    // the starting values are published, and the first case drifts, whatever its query
    expect(row.published.some(({ query }) => query === '')).toBe(true);
    const [first] = row.published;
    if (first === undefined) throw new Error('no published case');
    const last = row.columns.length - 1;
    const drifted = (query: string): readonly string[] =>
      figuresOfCase(id, row, query).map((figure, index) =>
        query === first.query && index === last ? `${figure}9` : figure,
      );
    const figure = first.figures[last] ?? '';
    expect(caseProblems(row.published, row, drifted)).toEqual([
      `${first.query || 'default'}: ${row.columns[last] ?? ''} ${figure} is ${figure}9`,
    ]);
  });
});

// spec: trust-pages › [TP38] the square footage section states exact conversions: no yield, no pi
describe('methodology: square footage constants (trust-pages › [TP38])', () => {
  it.each(LOCALES)('names no yield and no pi in the square footage section in %s', (locale) => {
    const section = sectionFor('rectangle-area', locale);
    expect(section).not.toContain('π');
    expect(section).not.toMatch(/\byields?\b|rendimiento/i);
  });
});

// spec: trust-pages › [TP40] the rectangle-area cases, as data: a changed figure fails on the slot-free module too
describe('methodology: the rectangle-area cases as a fixture (trust-pages › [TP24], [TP40])', () => {
  const area = definePage({ calculator: rectangleArea });
  const fixture: MethodologyRow = {
    anchor: { en: 'square-footage', es: 'pies-cuadrados' },
    pageLink: { en: '', es: '' },
    formulas: { en: [], es: [] },
    honesty: { en: [], es: [] },
    columns: ['ft2', 'yd2', 'm2'],
    figuresOf: ({ figures }) => [
      figures['areaFt2'] ?? '',
      figures['areaYd2'] ?? '',
      figures['areaM2'] ?? '',
    ],
    published: [
      { query: '?v=1&l=144', figures: ['120.00', '13.33', '11.15'] },
      { query: '', figures: ['100.00', '11.11', '9.29'] },
      { query: '?v=1&l=150', figures: ['125.00', '13.89', '11.61'] },
      { query: '?v=1&l=240&w=180', figures: ['300.00', '33.33', '27.87'] },
    ],
  };
  const real = (query: string) => fixture.figuresOf(shownFigures(area, query));

  it('reproduces the four cases of the published table', () => {
    expect(caseProblems(fixture.published, fixture, real)).toEqual([]);
  });

  it('fails when one figure changes in the table alone', () => {
    const changed = fixture.published.map((row, index) =>
      index === 2 ? { ...row, figures: ['125.00', '13.88', '11.61'] } : row,
    );
    expect(caseProblems(changed, fixture, real)).toEqual(['?v=1&l=150: yd2 13.88 is 13.89']);
  });

  it('reads a table of three figures per row', () => {
    const table = [
      '| Case | ft² | yd² | m² |',
      '| --- | --- | --- | --- |',
      '| 12 ft × 10 ft `?v=1&l=144` | 120.00 | 13.33 | 11.15 |',
      '| 10 ft × 10 ft (starting values) | 100.00 | 11.11 | 9.29 |',
    ].join('\n');
    expect(casesOf(table, 3)).toEqual([
      { query: '?v=1&l=144', figures: ['120.00', '13.33', '11.15'] },
      { query: '', figures: ['100.00', '11.11', '9.29'] },
    ]);
  });
});

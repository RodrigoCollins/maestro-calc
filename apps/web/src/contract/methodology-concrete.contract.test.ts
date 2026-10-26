import { concreteMix } from '@maestro-calc/data';
import { CONCRETE_MIX_YIELDS } from '@maestro-calc/data/yields/concrete-mix';
import { decode, ft3, PI, type Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { required } from '../calculator/controller.ts';
import { groupedInteger, outputText, volumeText } from '../calculator/present.ts';
import { concrete } from '../lib/concrete.ts';
import { hasWord } from '../site-check/dom.ts';
import { h1Count, h2Count, h2Ids, readEntries, sectionOf } from './content.ts';
import { fromRoot } from './root.ts';

const LOCALES = ['en', 'es'] as const;
const entries = readEntries(fromRoot('apps/web/src/content/pages'));
const bodyOf = (locale: 'en' | 'es'): string =>
  entries.find((entry) => entry.path === `${locale}/methodology.md`)?.body ?? '';
const sectionIds = { en: 'concrete', es: 'concreto' } as const;
const concreteSection = (locale: 'en' | 'es'): string =>
  sectionOf(bodyOf(locale), sectionIds[locale]);

describe('methodology: the concrete section (trust-pages › [TP22], [TP26], [TP9], [TP25])', () => {
  // spec: trust-pages › [TP22] the anchor exists once, on a heading
  it.each(LOCALES)('anchors the concrete section once, on a heading, in %s', (locale) => {
    const ids = h2Ids(bodyOf(locale));
    expect(ids.filter((id) => id === sectionIds[locale])).toHaveLength(1);
    expect(concreteSection(locale)).toMatch(/^<h2 id="[^"]+">[^<]+<\/h2>/);
  });

  // spec: trust-pages › [TP22] the calculator entries link to the anchor
  it.each([
    ['en', '](/methodology#concrete)'],
    ['es', '](/es/metodologia#concreto)'],
  ] as const)('is linked from the %s calculator entry', async (locale, link) => {
    const { readFileSync } = await import('node:fs');
    const entry = readFileSync(
      fromRoot(`apps/web/src/content/calculators/${locale}/concrete.md`),
      'utf8',
    );
    expect(entry).toContain(link);
  });

  // the section opens with a link to the page, which the route table now holds
  it.each([
    ['en', '[concrete calculator](/concrete-calculator)'],
    ['es', '[calculadora de concreto](/es/calculadora-de-concreto)'],
  ] as const)('links the calculator page from the %s section', (locale, link) => {
    expect(concreteSection(locale)).toContain(link);
  });

  // spec: trust-pages › [TP26] the methodology no longer says that nothing is published
  it.each(LOCALES)('does not say that no calculator is published in %s', (locale) => {
    const body = bodyOf(locale).toLowerCase();
    expect(body).not.toContain('no calculator is published yet');
    expect(body).not.toContain('todavía no hay ninguna calculadora publicada');
    expect(body).not.toMatch(/no calculator (is|has been) (published|live)/);
  });

  // spec: trust-pages › [TP25] the methodology names no unpublished calculator
  it.each(LOCALES)('names no calculator other than the concrete one in %s', (locale) => {
    const others = [
      'roofing',
      'drywall',
      'paint',
      'gravel',
      'mulch',
      'topsoil',
      'techado',
      'pintura',
      'grava',
    ];
    expect(others.filter((word) => hasWord(bodyOf(locale), word))).toEqual([]);
  });

  // spec: trust-pages › [TP9] still one H1, at least two h2, the corrections link, no certification claim
  it.each(LOCALES)('keeps one H1 and at least two h2 in %s', (locale) => {
    expect(h1Count(bodyOf(locale))).toBe(1);
    expect(h2Count(bodyOf(locale))).toBeGreaterThanOrEqual(2);
  });
});

describe('methodology: formulas, yields and pi (trust-pages › [TP23])', () => {
  // spec: trust-pages › [TP23] the four formulas, as written
  it.each([
    [
      'en',
      [
        'length × width × thickness',
        'length × width × depth × pieces',
        'π × (diameter / 2)² × height × pieces',
        'step width × run × rise × N(N+1)/2',
      ],
    ],
    [
      'es',
      [
        'largo × ancho × espesor',
        'largo × ancho × profundidad × piezas',
        'π × (diámetro / 2)² × altura × piezas',
        'ancho de los escalones × profundidad (run) × altura (rise) × N(N+1)/2',
      ],
    ],
  ] as const)('states the four formulas in %s', (locale, formulas) => {
    const section = concreteSection(locale);
    for (const formula of formulas) expect(section, formula).toContain(formula);
  });

  // spec: trust-pages › [TP23] the extra comes before the bags, bags are rounded up
  it.each([
    [
      'en',
      /extra for waste is added to the volume before the bags are counted/i,
      /rounded up/i,
      /rule of thumb/i,
      /approximately/i,
    ],
    [
      'es',
      /extra por desperdicio se suma al volumen antes de contar las bolsas/i,
      /hacia arriba/i,
      /regla general/i,
      /aproximadamente/i,
    ],
  ] as const)(
    'orders the waste before the bags, rounds up and is honest in %s',
    (locale, before, up, rule, approx) => {
      const section = concreteSection(locale);
      expect(section).toMatch(before);
      expect(section).toMatch(up);
      expect(section).toMatch(rule);
      expect(section).toMatch(approx);
    },
  );

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

/** One row of the published cases table: the query that loads the case, then the four displayed figures. */
interface Case {
  readonly query: string;
  readonly net: string;
  readonly total: string;
  readonly yards: string;
  readonly bags: string;
}

/** The row of the page's starting values carries no query: its label ends in this marker. */
const STARTING = /^\|.*\((starting values|valores iniciales)\)/;

/** The rows of the first table of a section: a query in backticks (or the starting values), then net, total, yards and bags. */
const casesOf = (section: string): Case[] =>
  section
    .split('\n')
    .filter((line) => /^\|.*`\?v=1[^`]*`/.test(line) || STARTING.test(line))
    .map((line) => {
      const cells = line.split('|').map((cell) => cell.trim());
      const query = /`(\?v=1[^`]*)`/.exec(cells[1] ?? '')?.[1] ?? '';
      const [, , net = '', total = '', yards = '', bags = ''] = cells;
      return { query, net, total, yards, bags };
    });

/** What the engine shows for a case at the displayed precision: net and total ft³, yd³ and bags. */
const engineFigures = (query: string) => {
  const decoded = decode(concrete, query);
  const raw = { ...decoded.state, waste: (decoded.state.waste satisfies Rational).toString() };
  const result = concrete.run(raw);
  if (!result.ok) throw new Error('the case does not run');
  const shown = (key: string): string =>
    outputText(
      required(
        concrete.outputs.find((output) => output.key === key),
        key,
      ),
      required(
        result.value.outputs.find((output) => output.key === key),
        key,
      ).value,
    );
  return {
    net: shown('netVolume'),
    total: shown('volumeFt3'),
    yards: shown('volumeYd3'),
    bags: groupedInteger(required(result.value.shopping[0], 'shopping line').qty),
  };
};

/** The cases whose published figures differ from the engine, each as `query: figure`. */
const caseProblems = (
  cases: readonly Case[],
  figuresFor: (query: string) => ReturnType<typeof engineFigures> = engineFigures,
): string[] =>
  cases.flatMap((published) => {
    const engine = figuresFor(published.query);
    return (['net', 'total', 'yards', 'bags'] as const)
      .filter((key) => published[key] !== engine[key])
      .map((key) => `${published.query || 'default'}: ${key} ${published[key]} is ${engine[key]}`);
  });

const PUBLISHED = [
  { query: '', net: '40.00', total: '44.00', yards: '1.63', bags: '74' },
  { query: '?v=1&sh=footing&l=216&n=3', net: '48.00', total: '52.80', yards: '1.96', bags: '88' },
  { query: '?v=1&sh=column', net: '6.28', total: '6.91', yards: '0.26', bags: '12' },
  { query: '?v=1&sh=steps', net: '12.83', total: '14.12', yards: '0.52', bags: '24' },
] as const;

describe('methodology: published cases (trust-pages › [TP24])', () => {
  // spec: trust-pages › [TP24] the published table, parsed from the Markdown, equals the engine
  it.each(LOCALES)(
    'publishes the four hand-verified cases that the engine reproduces in %s',
    (locale) => {
      const cases = casesOf(concreteSection(locale));
      expect(cases).toEqual(PUBLISHED);
      expect(caseProblems(cases)).toEqual([]);
    },
  );

  // spec: trust-pages › [TP24] the test fails when a figure changes in the Markdown or in the engine alone
  it('fails when one figure changes in the Markdown alone', () => {
    const changed = PUBLISHED.map((row, index) => (index === 1 ? { ...row, total: '52.81' } : row));
    expect(caseProblems(changed)).toEqual(['?v=1&sh=footing&l=216&n=3: total 52.81 is 52.80']);
  });

  it('fails when one figure changes in the engine alone', () => {
    const drifted = (query: string) => {
      const real = engineFigures(query);
      return query === '' ? { ...real, bags: '75' } : real;
    };
    expect(caseProblems(PUBLISHED, drifted)).toEqual(['default: bags 74 is 75']);
  });
});

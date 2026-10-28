import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { concreteMix } from '@maestro-calc/data';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { fieldsOf } from '../__testing__/page-fixtures.ts';
import { calculatorSchema, registryIds } from '../content/schema.ts';
import { faqOf } from '../content/faq.ts';
import { FAQ_MAX_ANSWER } from '../content/faq-shape.ts';
import { concrete } from '../lib/concrete.ts';
import { pageView } from '../lib/pages.ts';
import { calculators } from '../lib/calculators.ts';
import { LOCALES } from '../routing/routes.ts';
import { CALCULATOR_PAGES, PAGELESS } from '../routing/templates.ts';
import { OWNER_REVIEW_MARKERS } from '../site-check/content.ts';
import { hasWord } from '../site-check/dom.ts';
import { CONTENT_ROWS, rowOf, setProblems } from './__testing__/calculator-rows.ts';
import { h2Ids, sectionOf } from './content.ts';
import type { Entry } from './content.ts';
import { fromRoot } from './root.ts';
import { registerProblems } from './register.ts';

const DIRECTORY = fromRoot('apps/web/src/content/calculators');
const IDS = calculators.map(({ id }) => id);
type Locale = (typeof LOCALES)[number];

/** One calculator entry: its path, its parsed frontmatter and its Markdown body. */
interface CalculatorEntry extends Entry {
  readonly data: unknown;
}

const split = (path: string, text: string): CalculatorEntry => {
  const [, header = '', body = ''] = /^---\n(.*?)\n---\n(.*)$/s.exec(text) ?? [];
  return { path, fields: {}, body, data: parse(header) };
};

const entries: CalculatorEntry[] = globSync('*/*.md', { cwd: DIRECTORY })
  .sort()
  .map((file) => split(file, readFileSync(`${DIRECTORY}/${file}`, 'utf8')));

const entryOf = (id: string, locale: Locale): CalculatorEntry => {
  const found = entries.find((entry) => entry.path === `${locale}/${id}.md`);
  if (found === undefined) throw new Error(`no entry ${locale}/${id}.md`);
  return found;
};

const schema = calculatorSchema(registryIds(IDS));
const frontmatterOf = (entry: CalculatorEntry) => schema.parse(entry.data);

/** The id, locale and review state of an entry, as the set check reads them. */
const recordOf = (entry: CalculatorEntry) => {
  const { id, locale, ownerReview } = frontmatterOf(entry);
  return { id, locale, ownerReview };
};

/** One `(id, locale)` pair per row of the table: the generic checks run over every pair. */
const PAIRS = Object.keys(CONTENT_ROWS).flatMap((id) =>
  LOCALES.map((locale) => [id, locale] as const),
);
const rowFor = (id: string) => {
  const row = rowOf(id);
  if (row === undefined) throw new Error(`no content row for ${id}`);
  return row;
};

/** Whether `figure` stands alone in `text`: not inside a longer number (`1.63` is not in `11.635`). */
const hasFigure = (text: string, figure: string): boolean =>
  new RegExp(`(?<![\\d.,])${figure.replaceAll('.', '\\.')}(?!\\d|[.,]\\d)`).test(text);

/** What is wrong with a worked example: it differs from the engine, or a figure is not in Formulas. */
const exampleProblems = (
  example: Readonly<Record<string, unknown>>,
  engine: Readonly<Record<string, unknown>>,
  figures: readonly string[],
  formulas: string,
): string[] => [
  ...(isDeepStrictEqual(example, engine) ? [] : ['the worked example differs from the engine']),
  ...figures
    .filter((figure) => !hasFigure(formulas, figure))
    .map((figure) => `${figure} is missing from the Formulas section`),
];

const SECTION_IDS = {
  en: ['how-to-use', 'formulas', 'tips', 'faq', 'sources'],
  es: ['como-usar', 'formulas', 'consejos', 'preguntas-frecuentes', 'fuentes'],
} as const;

/** Words of an entry body: the prose, without markup, headings' ids or link targets. */
const wordsOf = (body: string): number =>
  body
    .replaceAll(/<[^>]+>/g, ' ')
    .replaceAll(/\]\([^)]*\)/g, ' ')
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word)).length;

const recordsOf = (list: readonly CalculatorEntry[]) => list.map(recordOf);
const ROWS = CONTENT_ROWS;
const ROUTED = CALCULATOR_PAGES;

describe('calculator entries (calculator-page › [CP5]–[CP10], [CP69]; material-data-contract › [MDC4])', () => {
  // spec: calculator-page › [CP7] a missing counterpart fails, naming the calculator and the locale
  it('has one entry per row of the table and locale, and names a missing counterpart', () => {
    expect(setProblems(recordsOf(entries), ROWS, ROUTED, PAGELESS)).toEqual([]);
    const withoutSpanish = entries.filter((entry) => entry.path !== 'es/concrete.md');
    expect(setProblems(recordsOf(withoutSpanish), ROWS, ROUTED, PAGELESS)).toEqual([
      'missing entry concrete/es',
    ]);
  });

  // seeded: fixtures prove each rule of the set check whichever calculator goes live next
  describe('set check on fixtures', () => {
    const approved = (id: string, locale: Locale) => ({ id, locale, ownerReview: 'approved' });
    const pending = (id: string, locale: Locale) => ({ id, locale, ownerReview: 'pending' });
    const rows = { concrete: {}, staged: {} };
    const both = (make: typeof approved, id: string) => [make(id, 'en'), make(id, 'es')];

    // spec: calculator-page › [CP69] a staged entry (a row, in PAGELESS, pending) passes
    it.each([
      ['pending', pending],
      ['approved', approved],
    ])('accepts a staged %s entry whose id is in PAGELESS', (_name, make) => {
      const list = [...both(approved, 'concrete'), ...both(make, 'staged')];
      expect(setProblems(list, rows, ['concrete'], ['staged'])).toEqual([]);
    });

    // spec: calculator-page › [CP69] an entry whose id is in neither the page list nor a row fails
    it('names an entry whose id is in neither the page list nor a row', () => {
      const list = [
        ...both(approved, 'concrete'),
        ...both(pending, 'staged'),
        pending('third', 'en'),
      ];
      expect(setProblems(list, rows, ['concrete'], ['staged'])).toEqual([
        'unexpected entry third/en',
      ]);
    });

    it('names a routed entry that is still pending', () => {
      const list = [
        pending('concrete', 'en'),
        approved('concrete', 'es'),
        ...both(pending, 'staged'),
      ];
      expect(setProblems(list, rows, ['concrete'], ['staged'])).toEqual([
        'concrete/en: a routed entry must be approved, it is pending',
      ]);
    });

    it('names a routed id that has no row', () => {
      const list = both(approved, 'concrete');
      expect(setProblems(list, { staged: {} }, ['concrete'], ['staged'])).toEqual([
        'concrete: routed id has no content row',
        'missing entry staged/en',
        'missing entry staged/es',
      ]);
    });

    it('names a row that is neither routed nor in PAGELESS', () => {
      const list = [...both(approved, 'concrete'), ...both(pending, 'staged')];
      expect(setProblems(list, rows, ['concrete'], [])).toEqual([
        'staged: row is neither routed nor in PAGELESS',
      ]);
    });

    // spec: calculator-page › [CP7] per id, the missing counterpart and a duplicate fail naming the id
    it.each(['concrete', 'staged'])('names the missing es counterpart of %s', (id) => {
      const list = [...both(approved, 'concrete'), ...both(pending, 'staged')].filter(
        (entry) => !(entry.id === id && entry.locale === 'es'),
      );
      expect(setProblems(list, rows, ['concrete'], ['staged'])).toEqual([`missing entry ${id}/es`]);
    });

    it.each(['concrete', 'staged'])('names a duplicate (%s, en)', (id) => {
      const list = [
        ...both(approved, 'concrete'),
        ...both(pending, 'staged'),
        id === 'concrete' ? approved(id, 'en') : pending(id, 'en'),
      ];
      expect(setProblems(list, rows, ['concrete'], ['staged'])).toEqual([
        `duplicate entry ${id}/en`,
      ]);
    });
  });

  // spec: calculator-page › [CP7] a duplicate (id, locale) fails
  it('has no duplicate (id, locale) among the real entries', () => {
    const keys = recordsOf(entries).map(({ id, locale }) => `${id}/${locale}`);
    expect(keys.filter((key, index) => keys.indexOf(key) !== index)).toEqual([]);
  });

  it('lists a calculator id of the registry for every row', () => {
    expect(IDS).toEqual(expect.arrayContaining(Object.keys(ROWS)));
    expect(entries.map((entry) => entry.path)).toEqual(
      Object.keys(ROWS)
        .flatMap((id) => LOCALES.map((locale) => `${locale}/${id}.md`))
        .sort(),
    );
  });

  // spec: calculator-page › [CP6] the frontmatter parses with the strict schema and agrees with its path
  it.each(PAIRS)('parses the frontmatter of %s/%s and agrees with the path', (id, locale) => {
    const front = frontmatterOf(entryOf(id, locale));
    expect(front.id).toBe(id);
    expect(front.locale).toBe(locale);
    expect(front.updated).toBe(rowFor(id).updated);
    if (ROUTED.some((page) => page === id)) expect(front.ownerReview).toBe('approved');
  });

  // spec: calculator-page › [CP5] source side: five h2 ids in order
  it.each(PAIRS)('has the five section ids of %s/%s in order', (id, locale) => {
    expect(h2Ids(entryOf(id, locale).body)).toEqual(SECTION_IDS[locale]);
  });

  // spec: calculator-page › [CP8], material-data-contract › [MDC4] sources
  it.each(PAIRS)('lists the sources of the row in %s/%s', (id, locale) => {
    const { sources } = frontmatterOf(entryOf(id, locale));
    const wanted = rowFor(id).sources(locale);
    expect(wanted.length).toBeGreaterThan(0);
    for (const { name, url } of wanted) {
      expect(
        sources.some(
          (source) =>
            source.url === url &&
            (typeof name === 'string' ? source.name === name : name.test(source.name)),
        ),
        `${id}/${locale}: ${url}`,
      ).toBe(true);
    }
    for (const source of sources) expect(source.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // spec: calculator-page › [CP8] the review state never reaches the reader
  it.each(PAIRS)('names no review state in the body of %s/%s', (id, locale) => {
    const { body } = entryOf(id, locale);
    for (const marker of OWNER_REVIEW_MARKERS) expect(hasWord(body, marker), marker).toBe(false);
  });

  // spec: calculator-page › [CP9] the worked example is the engine's, and the Formulas section shows it
  it.each(PAIRS)(
    'keeps the worked example of %s/%s equal to the engine and in Formulas',
    (id, locale) => {
      const entry = entryOf(id, locale);
      const { workedExample } = frontmatterOf(entry);
      const row = rowFor(id);
      expect(
        exampleProblems(
          workedExample,
          row.engine(workedExample),
          row.figures(workedExample),
          sectionOf(entry.body, 'formulas'),
        ),
      ).toEqual([]);
    },
  );

  // spec: calculator-page › [CP9] changing one side alone fails the check
  it.each(PAIRS)(
    'fails when the frontmatter, the Markdown or the engine of %s/%s changes alone',
    (id, locale) => {
      const entry = entryOf(id, locale);
      const { workedExample } = frontmatterOf(entry);
      const example: Readonly<Record<string, unknown>> = workedExample;
      const row = rowFor(id);
      const formulas = sectionOf(entry.body, 'formulas');
      const engine = row.engine(workedExample);
      const figures = row.figures(workedExample);
      const [first = ''] = figures;
      const key = Object.keys(example).find((name) => String(example[name]) === first) ?? '';
      expect(key).not.toBe('');
      // the frontmatter alone: the figure moves, the engine and the Markdown do not
      const moved = { ...example, [key]: typeof example[key] === 'number' ? 999_999 : '999999.99' };
      const movedFigure = String(moved[key]);
      expect(exampleProblems(moved, engine, [movedFigure, ...figures.slice(1)], formulas)).toEqual([
        'the worked example differs from the engine',
        `${movedFigure} is missing from the Formulas section`,
      ]);
      // the Markdown alone: the figure is gone from Formulas
      expect(exampleProblems(example, engine, figures, formulas.replaceAll(first, 'x'))).toEqual([
        `${first} is missing from the Formulas section`,
      ]);
      // the engine alone: it answers another figure
      expect(exampleProblems(example, { ...engine, [key]: 'other' }, figures, formulas)).toEqual([
        'the worked example differs from the engine',
      ]);
    },
  );

  // spec: calculator-page › [CP10] length and parity
  it('reads a figure as a whole token, not as part of a longer number', () => {
    const entry = entryOf('concrete', 'en');
    const { workedExample } = frontmatterOf(entry);
    const row = rowFor('concrete');
    const engine = row.engine(workedExample);
    const figures = row.figures(workedExample);
    const only = (text: string) => exampleProblems(workedExample, engine, figures, text);
    const all = '40.00 44.00 1.63 74 80';
    expect(only(all)).toEqual([]);
    expect(only('40.00 44.00 1.63, then 74. Use 80!')).toEqual([]);
    expect(only('40.00 44.00 11.63 74 80')).toEqual(['1.63 is missing from the Formulas section']);
    expect(only('40.00 44.00 1.635 74 80')).toEqual(['1.63 is missing from the Formulas section']);
    expect(only('40.00 44.00 1.63 1074 80')).toEqual(['74 is missing from the Formulas section']);
    expect(only('40.00 44.00 1.63 74.5 80')).toEqual(['74 is missing from the Formulas section']);
    expect(only('40.00 44.00 1.63 74 8000')).toEqual(['80 is missing from the Formulas section']);
    expect(only('140.00 44.00 1.63 74 80')).toEqual(['40.00 is missing from the Formulas section']);
  });

  it.each(PAIRS)('has between 800 and 1,500 words in %s/%s', (id, locale) => {
    const words = wordsOf(entryOf(id, locale).body);
    expect(words).toBeGreaterThanOrEqual(800);
    expect(words).toBeLessThanOrEqual(1_500);
  });

  it.each(Object.keys(ROWS))(
    'has the same number of h2 headings and FAQ items in both locales of %s',
    (id) => {
      expect(h2Ids(entryOf(id, 'en').body)).toHaveLength(h2Ids(entryOf(id, 'es').body).length);
      expect(faqOf(entryOf(id, 'en').body)).toHaveLength(faqOf(entryOf(id, 'es').body).length);
    },
  );

  it.each(PAIRS)(
    'has eight plain-text FAQ items of at most 450 characters in %s/%s',
    (id, locale) => {
      const faq = faqOf(entryOf(id, locale).body);
      expect(faq).toHaveLength(8);
      expect(faq.every(({ answer }) => answer.length <= FAQ_MAX_ANSWER)).toBe(true);
    },
  );

  // spec: calculator-page › Page anatomy: the Spanish register
  it.each(Object.keys(ROWS))('passes the Spanish register check for %s', (id) => {
    expect(registerProblems(entryOf(id, 'es').body)).toEqual([]);
  });

  // spec: calculator-page › [CP70] the entry links to its methodology section
  it.each(PAIRS)('links %s/%s to its methodology section', (id, locale) => {
    expect(entryOf(id, locale).body).toContain(`](${rowFor(id).methodologyLink[locale]})`);
  });
});

describe('concrete prose (calculator-page › [CP9], [CP10]; material-data-contract › [MDC4])', () => {
  it.each(LOCALES)('writes the %s worked example as the hand-verified figures', (locale) => {
    expect(frontmatterOf(entryOf('concrete', locale)).workedExample).toEqual({
      netFt3: '40.00',
      totalFt3: '44.00',
      yd3: '1.63',
      bags: 74,
      bagLb: 80,
    });
  });

  // the entry records the retrieval date of the data sheet that the material record carries
  it.each(LOCALES)('cites the QUIKRETE data sheet and NIST SP 811 in the %s entry', (locale) => {
    const { sources } = frontmatterOf(entryOf('concrete', locale));
    expect(sources).toContainEqual({
      name: concreteMix.source.name,
      url: concreteMix.source.url,
      retrieved: concreteMix.source.retrieved,
    });
    const nist = sources.find((source) => source.url.includes('nist.gov'));
    expect(nist?.name).toMatch(/^NIST SP 811, Appendix B\b/);
  });

  // spec: calculator-page › [CP10] the FAQ answers state the figure before the extra, then the bags with it
  it.each([
    [
      'en',
      /12\.83 cubic feet before the extra\. With 10 percent extra, that is 24 bags of 80 lb\./,
    ],
    [
      'es',
      /12\.83 pies cúbicos antes del extra\. Con 10 por ciento de extra, son 24 bolsas de 80 lb\./,
    ],
  ] as const)(
    'writes the steps answer of the %s entry in the figure-then-extra order',
    (locale, sentence) => {
      const steps = faqOf(entryOf('concrete', locale).body).find(({ answer }) =>
        answer.includes('12.83'),
      );
      expect(steps?.answer).toMatch(sentence);
    },
  );

  it('asks the Spanish slab question in the natural verb and states the slab as having its volume', () => {
    const faq = faqOf(entryOf('concrete', 'es').body);
    expect(faq.map(({ question }) => question)).toContain(
      '¿Cuántas yardas cúbicas de concreto lleva una losa de 4 in?',
    );
    expect(faq[0]?.answer).toContain('La losa tiene 40 pies cúbicos');
    expect(faq[1]?.answer).toContain('Una losa de 12 ft por 10 ft tiene 40 pies cúbicos');
  });

  // spec: calculator-page › Form controls: the copy names every field that reads a bare number in feet or meters
  it.each([
    ['en', 'feet for', 'meters for', ' and '],
    ['es', 'pies para', 'metros para', ' y '],
  ] as const)(
    'names every long-dimension field when it says which unit a plain number is read in (%s)',
    (locale, feet, meters, joiner) => {
      const long = new Set<string>(
        concrete.inputs
          .filter((input) => input.kind === 'length' && input.defaultUnit === 'ft')
          .map((input) => input.key),
      );
      const labels = fieldsOf(pageView('concrete', locale).form)
        .filter((field) => long.has(field.key))
        .map((field) => field.label.toLowerCase());
      // the list is the labels in form order, the last one joined with "and"
      const list = `${labels.slice(0, -1).join(', ')}${joiner}${labels.at(-1) ?? ''}`;
      expect(long.size).toBeGreaterThan(0);
      expect(labels).toHaveLength(long.size);
      const { body } = entryOf('concrete', locale);
      expect(body).toContain(`${feet} ${list}`);
      expect(body).toContain(`${meters} ${list}`);
      // the old list named three of the six inch fields only
      expect(body).not.toMatch(/thickness, depth and rise|espesor, la profundidad y la altura/);
    },
  );

  // spec: calculator-page › Page anatomy: the waste default is a rule of thumb, yields are approximate
  it.each([
    ['en', 'rule of thumb', 'about'],
    ['es', 'regla general', 'aproximadamente'],
  ] as const)(
    'describes the waste and the yields honestly in the %s entry',
    (locale, rule, approx) => {
      const body = entryOf('concrete', locale).body.toLowerCase();
      expect(body).toContain(rule);
      expect(body).toContain(approx);
    },
  );
});

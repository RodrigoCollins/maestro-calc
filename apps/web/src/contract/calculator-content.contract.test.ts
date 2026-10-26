import { readFileSync } from 'node:fs';
import { concreteMix } from '@maestro-calc/data';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { calculatorSchema } from '../content/schema.ts';
import { faqOf } from '../content/faq.ts';
import { FAQ_MAX_ANSWER } from '../content/faq-shape.ts';
import { concrete } from '../lib/concrete.ts';
import { concreteView } from '../lib/concrete-page.ts';
import { calculators } from '../lib/calculators.ts';
import { OWNER_REVIEW_MARKERS } from '../site-check/content.ts';
import { hasWord } from '../site-check/dom.ts';
import { h2Ids, sectionOf, setProblems } from './content.ts';
import type { Entry } from './content.ts';
import { fromRoot } from './root.ts';
import { registerProblems } from './register.ts';
import { globSync } from 'node:fs';

const DIRECTORY = fromRoot('apps/web/src/content/calculators');
const IDS = calculators.map(({ id }) => id);
const LOCALES = ['en', 'es'] as const;

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

const entryOf = (locale: (typeof LOCALES)[number]): CalculatorEntry => {
  const found = entries.find((entry) => entry.path === `${locale}/concrete.md`);
  if (found === undefined) throw new Error(`no entry ${locale}/concrete.md`);
  return found;
};

const frontmatterOf = (entry: CalculatorEntry) => calculatorSchema(['concrete']).parse(entry.data);

/** The default state through the page builder, which runs the registry calculator. */
const engineExample = () => {
  const { result } = concreteView('en');
  const { shopping } = result;
  return {
    netFt3: result.rows.find((row) => row.key === 'netVolume')?.value,
    totalFt3: result.rows.find((row) => row.key === 'volumeFt3')?.value,
    yd3: result.primary.value,
    bags: Number(shopping.qty),
    bagLb: Number(shopping.unit.replace('bag-', '')),
  };
};

/** Whether `figure` stands alone in `text`: not inside a longer number (`1.63` is not in `11.635`). */
const hasFigure = (text: string, figure: string): boolean =>
  new RegExp(`(?<![\\d.,])${figure.replaceAll('.', '\\.')}(?!\\d|[.,]\\d)`).test(text);

/** What is wrong with a worked example: it differs from the engine, or a figure is not in Formulas. */
const exampleProblems = (
  example: Readonly<Record<string, unknown>>,
  engine: Readonly<Record<string, unknown>>,
  formulas: string,
): string[] => [
  ...(JSON.stringify(example) === JSON.stringify(engine)
    ? []
    : ['the worked example differs from the engine']),
  ...Object.values(example)
    .map(String)
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

describe('calculator entries (calculator-page › [CP5]–[CP10]; material-data-contract › [MDC4])', () => {
  // spec: calculator-page › [CP7] a missing counterpart fails, naming the calculator and the locale
  it('has one entry per calculator and locale, and names a missing counterpart', () => {
    expect(setProblems(entries, ['concrete'], LOCALES)).toEqual([]);
    expect(
      setProblems(
        entries.filter((entry) => entry.path !== 'es/concrete.md'),
        ['concrete'],
        LOCALES,
      ),
    ).toEqual(['missing entry concrete/es']);
  });

  // spec: calculator-page › [CP7] a duplicate (id, locale) fails
  it('names a duplicate (concrete, en)', () => {
    const keys = (list: readonly CalculatorEntry[]): string[] =>
      list.map((entry) => {
        const { id, locale } = frontmatterOf(entry);
        return `${id}/${locale}`;
      });
    const duplicates = (list: readonly CalculatorEntry[]): string[] =>
      keys(list).filter((key, index, all) => all.indexOf(key) !== index);
    expect(duplicates(entries)).toEqual([]);
    expect(duplicates([...entries, entryOf('en')])).toEqual(['concrete/en']);
  });

  it('lists a calculator id of the registry for every entry', () => {
    expect(IDS).toContain('concrete');
    expect(entries.map((entry) => entry.path)).toEqual(['en/concrete.md', 'es/concrete.md']);
  });

  // spec: calculator-page › [CP6] the frontmatter parses with the strict schema and agrees with its path
  it.each(LOCALES)('parses the %s frontmatter and agrees with the path', (locale) => {
    const front = frontmatterOf(entryOf(locale));
    expect(front.id).toBe('concrete');
    expect(front.locale).toBe(locale);
    expect(front.updated).toBe('2026-10-25');
    expect(front.ownerReview).toBe('approved');
  });

  // spec: calculator-page › [CP5] source side: five h2 ids in order
  it.each(LOCALES)('has the five section ids of the %s page in order', (locale) => {
    expect(h2Ids(entryOf(locale).body)).toEqual(SECTION_IDS[locale]);
  });

  // spec: calculator-page › [CP8], material-data-contract › [MDC4] sources
  it.each(LOCALES)('cites the QUIKRETE data sheet and NIST SP 811 in the %s entry', (locale) => {
    const { sources } = frontmatterOf(entryOf(locale));
    expect(sources).toContainEqual({
      name: concreteMix.source.name,
      url: concreteMix.source.url,
      retrieved: concreteMix.source.retrieved,
    });
    const nist = sources.find((source) => source.url.includes('nist.gov'));
    expect(nist?.name).toMatch(/^NIST SP 811, Appendix B\b/);
    expect(nist?.retrieved).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  // spec: calculator-page › [CP8] the review state never reaches the reader
  it.each(LOCALES)('names no review state in the body of the %s entry', (locale) => {
    const body = entryOf(locale).body;
    for (const marker of OWNER_REVIEW_MARKERS) expect(hasWord(body, marker), marker).toBe(false);
  });

  // spec: calculator-page › [CP9] the worked example is the engine's, and the Formulas section shows it
  it.each(LOCALES)(
    'keeps the %s worked example equal to the engine and written in Formulas',
    (locale) => {
      const entry = entryOf(locale);
      const { workedExample } = frontmatterOf(entry);
      expect(workedExample).toEqual({
        netFt3: '40.00',
        totalFt3: '44.00',
        yd3: '1.63',
        bags: 74,
        bagLb: 80,
      });
      expect(
        exampleProblems(workedExample, engineExample(), sectionOf(entry.body, 'formulas')),
      ).toEqual([]);
    },
  );

  // spec: calculator-page › [CP9] changing one side alone fails the check
  it('fails when the frontmatter, the Markdown or the engine changes alone', () => {
    const entry = entryOf('en');
    const { workedExample } = frontmatterOf(entry);
    const formulas = sectionOf(entry.body, 'formulas');
    expect(exampleProblems({ ...workedExample, bags: 75 }, engineExample(), formulas)).toEqual([
      'the worked example differs from the engine',
      '75 is missing from the Formulas section',
    ]);
    expect(
      exampleProblems(workedExample, engineExample(), formulas.replaceAll('1.63', '1.64')),
    ).toEqual(['1.63 is missing from the Formulas section']);
    expect(exampleProblems(workedExample, { ...engineExample(), bags: 75 }, formulas)).toEqual([
      'the worked example differs from the engine',
    ]);
  });

  // spec: calculator-page › [CP10] length and parity
  it('reads a figure as a whole token, not as part of a longer number', () => {
    const entry = entryOf('en');
    const { workedExample } = frontmatterOf(entry);
    const engine = engineExample();
    const only = (text: string) => exampleProblems(workedExample, engine, text);
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

  it.each(LOCALES)('has between 800 and 1,500 words in the %s entry', (locale) => {
    const words = wordsOf(entryOf(locale).body);
    expect(words).toBeGreaterThanOrEqual(800);
    expect(words).toBeLessThanOrEqual(1_500);
  });

  it('has the same number of h2 headings and FAQ items in both locales', () => {
    expect(h2Ids(entryOf('en').body)).toHaveLength(h2Ids(entryOf('es').body).length);
    expect(faqOf(entryOf('en').body)).toHaveLength(faqOf(entryOf('es').body).length);
  });

  it.each(LOCALES)(
    'has eight plain-text FAQ items of at most 450 characters in the %s entry',
    (locale) => {
      const faq = faqOf(entryOf(locale).body);
      expect(faq).toHaveLength(8);
      expect(faq.every(({ answer }) => answer.length <= FAQ_MAX_ANSWER)).toBe(true);
    },
  );

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
      const steps = faqOf(entryOf(locale).body).find(({ answer }) => answer.includes('12.83'));
      expect(steps?.answer).toMatch(sentence);
    },
  );

  it('asks the Spanish slab question in the natural verb and states the slab as having its volume', () => {
    const faq = faqOf(entryOf('es').body);
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
      const labels = concreteView(locale)
        .form.fields.filter((field) => long.has(field.key))
        .map((field) => field.label.toLowerCase());
      // the list is the labels in form order, the last one joined with "and"
      const list = `${labels.slice(0, -1).join(', ')}${joiner}${labels.at(-1) ?? ''}`;
      expect(long.size).toBeGreaterThan(0);
      expect(labels).toHaveLength(long.size);
      const body = entryOf(locale).body;
      expect(body).toContain(`${feet} ${list}`);
      expect(body).toContain(`${meters} ${list}`);
      // the old list named three of the six inch fields only
      expect(body).not.toMatch(/thickness, depth and rise|espesor, la profundidad y la altura/);
    },
  );

  // spec: calculator-page › Page anatomy: the Spanish register
  it('passes the Spanish register check', () => {
    expect(registerProblems(entryOf('es').body)).toEqual([]);
  });

  // spec: calculator-page › Page anatomy: the waste default is a rule of thumb, yields are approximate
  it.each([
    ['en', 'rule of thumb', 'about', '/methodology#concrete'],
    ['es', 'regla general', 'aproximadamente', '/es/metodologia#concreto'],
  ] as const)(
    'describes the waste and the yields honestly in the %s entry',
    (locale, rule, approx, link) => {
      const body = entryOf(locale).body;
      expect(body.toLowerCase()).toContain(rule);
      expect(body.toLowerCase()).toContain(approx);
      expect(body).toContain(`](${link})`);
    },
  );
});

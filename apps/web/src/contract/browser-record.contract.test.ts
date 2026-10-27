import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { calculators } from '../lib/calculators.ts';
import { LOCALES, ROUTES } from '../routing/routes.ts';
import { CALCULATOR_PAGES } from '../routing/templates.ts';
import { stringsIn, stripComments } from './__testing__/source-text.ts';
import { fromRoot, importFromRoot } from './root.ts';

/**
 * The browser suites run over a typed per-calculator record (site-quality › [SQ29], [SQ30]). The
 * browser job has no root install, so the record reaches the workspace only by relative path.
 */
const E2E_DIR = 'tooling/site-browser/e2e';
const read = (file: string): string => readFileSync(fromRoot(E2E_DIR, file), 'utf8');

/** The shape of the record module the tests load (its own types stay in the browser package). */
interface RecordModule {
  readonly calculatorPages: readonly {
    readonly id: string;
    readonly locale: string;
    readonly path: string;
    readonly other: string;
  }[];
  readonly paramOf: (
    choice: { readonly key: string; readonly initial: string },
    option: { readonly value: string; readonly param?: string },
  ) => string;
}

const record = await importFromRoot<RecordModule>(`${E2E_DIR}/calculator-pages.ts`);

describe('the typed browser record (site-quality › [SQ29], [SQ30])', () => {
  const table = read('calculator-pages.ts');

  // spec: site-quality › [SQ29] a missing row is a type error
  it('declares E2E as a Record over every calculator page id', () => {
    expect(table).toMatch(
      /export const E2E\b[^=]*=\s*\{[\s\S]*?\}\s*as const satisfies\s*Record<\s*CalculatorPageId,\s*E2eSpec\s*>/,
    );
    expect(table).toMatch(
      /import type \{[^}]*\bCalculatorPageId\b[^}]*\} from '[^']*routing\/templates\.ts'/,
    );
  });

  // spec: site-quality › [SQ30] the browser job has no root install (m-11)
  it('has no runtime import from a workspace package', () => {
    for (const file of ['calculator-pages.ts', 'concrete-pages.ts']) {
      const runtime = read(file)
        .split('\n')
        .filter((line) => /^import\s+(?!type\b)/.test(line));
      expect(
        runtime.filter((line) => line.includes('@maestro-calc/')),
        file,
      ).toEqual([]);
    }
  });

  it('documents the record on E2eSpec and on the E2E table', () => {
    const doc = String.raw`/\*\*(?:(?!\*/)[\s\S])*\[SQ29\](?:(?!\*/)[\s\S])*\*/\n`;
    expect(table).toMatch(new RegExp(`${doc}export interface E2eSpec\\b`));
    expect(table).toMatch(new RegExp(`${doc}export const E2E\\b`));
    expect(table).not.toMatch(new RegExp(`${doc}export type E2eLanguage\\b`));
  });

  it('exports concrete as one spec and nothing else', () => {
    const exported = read('concrete-pages.ts')
      .split('\n')
      .filter((line) => line.startsWith('export '));
    expect(exported).toEqual(['export const CONCRETE: E2eSpec = {']);
  });

  it('derives the page paths from ROUTES for both locales', () => {
    expect(
      record.calculatorPages.map(({ id, locale, path, other }) => ({ id, locale, path, other })),
    ).toEqual(
      CALCULATOR_PAGES.flatMap((id) =>
        LOCALES.map((locale) => ({
          id,
          locale,
          path: ROUTES[id][locale],
          other: ROUTES[id][locale === 'en' ? 'es' : 'en'],
        })),
      ),
    );
  });
});

describe('the query parameter of an option (site-quality › [SQ30])', () => {
  const shape = { key: 'shape', initial: 'slab' };

  it('is the param the option declares', () => {
    expect(record.paramOf(shape, { value: 'footing', param: 'sh=footing' })).toBe('sh=footing');
  });

  // only the initial option may leave it out: its link is `?v=1`
  it('names the option and the group when a non-initial option declares none', () => {
    expect(() => record.paramOf(shape, { value: 'footing' })).toThrow(
      'the option "footing" of the choice group "shape" declares no param (only the initial option "slab" may leave it out)',
    );
  });
});

/** The generic suites: they read the record and name no calculator, path or group of its own. */
const SUITES = [
  'calculator.spec.ts',
  'a11y.spec.ts',
  'layout.spec.ts',
  'csp.spec.ts',
  'locators.ts',
];

/** The four generic suites: every one opens a page of the record and holds no page path. */
const SPEC_SUITES = ['calculator.spec.ts', 'a11y.spec.ts', 'layout.spec.ts', 'csp.spec.ts'];

/** Every calculator of the registry, routed or not: no suite may name one. */
const IDS = calculators.map(({ id }) => id);

/** The path of every calculator page in both locales: no suite may hold one. */
const PATHS = CALCULATOR_PAGES.flatMap((id) => LOCALES.map((locale) => ROUTES[id][locale]));
const [firstPath = ''] = PATHS;

/** The names a source imports from `./locators.ts`. */
const importsFromLocators = (source: string): string[] =>
  (/import \{([^}]*)\} from '\.\/locators\.ts'/.exec(source)?.[1] ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);

/** A string literal that is a page path or a route glob (an asset glob such as `**\/_astro/*.js` is not). */
const pathProblems = (code: string): string[] =>
  stringsIn(stripComments(code))
    .filter((text) => /^(?:\*\*)?\/(?!_astro)\S/.test(text))
    .map((text) => `holds the path "${text}"`);

/** What a string literal of a generic suite may not hold: a registry id, a page path or concrete's group. */
const suiteProblems = (code: string): string[] =>
  stringsIn(stripComments(code)).flatMap((text) => [
    ...IDS.filter((id) => text.includes(id)).map(
      (id) => `names the calculator "${id}" in "${text}"`,
    ),
    ...PATHS.filter((path) => text.includes(path)).map(
      (path) => `holds the calculator path "${path}" in "${text}"`,
    ),
    ...(text.includes('data-choice="shape"') ? [`names the shape group in "${text}"`] : []),
    ...(text === 'shape' ? ['names the shape group as a literal'] : []),
  ]);

describe('the generic suites hold no calculator literal (site-quality › [SQ30]; calculator-web-core › [CWC34])', () => {
  it.each(SUITES)('%s names no calculator, path or shape', (file) => {
    expect(suiteProblems(read(file))).toEqual([]);
  });

  it.each([
    ['a calculator id', "const id = 'concrete';", 'names the calculator "concrete" in "concrete"'],
    [
      'the id of a pageless calculator',
      "const id = 'rectangle-area';",
      'names the calculator "rectangle-area" in "rectangle-area"',
    ],
    [
      'an English path',
      "await page.goto('/concrete-calculator');",
      'holds the calculator path "/concrete-calculator" in "/concrete-calculator"',
    ],
    [
      'a Spanish path',
      "await page.goto('/es/calculadora-de-concreto');",
      'holds the calculator path "/es/calculadora-de-concreto" in "/es/calculadora-de-concreto"',
    ],
    [
      'the first path of the route table',
      `await page.route('**${firstPath}', run);`,
      `holds the calculator path "${firstPath}" in "**${firstPath}"`,
    ],
    [
      'the shape selector',
      'const group = `[data-choice="shape"] [value="${option}"]`;',
      'names the shape group in "[data-choice="shape"] [value="${option}"]"',
    ],
    ['the shape literal', "const key = 'shape';", 'names the shape group as a literal'],
  ])('flags %s', (_what, code, problem) => {
    expect(suiteProblems(code)).toContain(problem);
  });

  it('does not flag a comment, a longer word or a record read', () => {
    const code = [
      '// the concrete page, shape by shape, next to rectangle-area',
      "const title = 'shows the fields of each shape';",
      'const label = calculator.catalog[`calc.${calculator.id}.inputs.${name}`];',
    ].join('\n');
    expect(suiteProblems(code)).toEqual([]);
  });

  it('scans for every registry id and every calculator path of both locales', () => {
    expect(IDS).toEqual(expect.arrayContaining(['concrete', 'rectangle-area']));
    expect(PATHS).toEqual(expect.arrayContaining([ROUTES.concrete.en, ROUTES.concrete.es]));
    expect(PATHS).toHaveLength(CALCULATOR_PAGES.length * LOCALES.length);
  });
});

describe('the axe, layout and CSP suites run over the record (site-quality › [SQ17], [SQ19], [SQ32])', () => {
  it.each(SPEC_SUITES)('%s imports the page list and holds no page path', (file) => {
    const source = read(file);
    expect(source).toMatch(
      /import \{[^}]*\bcalculatorPages\b[^}]*\} from '\.\/calculator-pages\.ts'/,
    );
    expect(pathProblems(source)).toEqual([]);
  });

  it.each([
    ['holds a page path', "await page.goto('/concrete-calculator');", '/concrete-calculator'],
    [
      'holds a route glob',
      "await page.route('**/concrete-calculator', run);",
      '**/concrete-calculator',
    ],
  ])('flags a suite that %s', (_what, code, path) => {
    expect(pathProblems(code)).toEqual([`holds the path "${path}"`]);
  });

  it('does not flag an asset glob, a template path or a lone slash', () => {
    expect(
      pathProblems(
        "await page.route('**/_astro/*.js', run); const a = `${path}${query}`; const b = '/';",
      ),
    ).toEqual([]);
  });

  // spec: site-quality › [SQ32] the CSP suite loops the record: typing, a choice press, the copy, the language switch
  it('loops the CSP suite over the record and uses the choices, the copy and the language switch', () => {
    const source = read('csp.spec.ts');
    expect(source).toMatch(/for \(const calculator of calculatorPages\)/);
    expect(source).toMatch(/\bchoices\b/);
    expect(importsFromLocators(source)).toEqual(
      expect.arrayContaining(['copyButton', 'languageSwitch']),
    );
    expect(source).toContain('copyButton(page)');
    expect(source).toContain('languageSwitch(page)');
    expect(source).toContain('representativePaths');
  });

  // spec: site-quality › [SQ19] the layout queries come from the record
  it('reads the layout queries and the link state from the record', () => {
    const source = read('layout.spec.ts');
    expect(source).toContain('.layoutQueries');
    expect(source).not.toMatch(/\?v=1&sh=/);
  });

  // spec: site-quality › [SQ17] one axe state per option of each choice group, the invalid field, metric, prices
  it('derives the axe states from the record', () => {
    const source = read('a11y.spec.ts');
    for (const part of [
      '.choices',
      '.prices',
      '.initial',
      "'error'",
      "'metric'",
      "'copy failed'",
    ]) {
      expect(source, part).toContain(part);
    }
  });
});

/** The page knowledge the suites share, held once in `locators.ts`: a locator name and its selector. */
const SHARED_LOCATORS = {
  copyButton: '[data-copy]',
  languageSwitch: 'header a[hreflang]',
  notRunning: '[data-not-running]',
  answer: '[data-answer]',
} as const;

/** The literals of the shared helpers that no suite spells again (the denied clipboard, the readiness). */
const SHARED_LITERALS = [...Object.values(SHARED_LOCATORS), 'denied'];

/** The shared literals a suite holds, each named (exact string literals only). */
const sharedProblems = (code: string): string[] =>
  stringsIn(stripComments(code))
    .filter((text) => SHARED_LITERALS.includes(text))
    .map((text) => `spells the shared literal "${text}"`);

describe('the shared page knowledge lives in locators.ts (site-quality › [SQ31])', () => {
  const locators = read('locators.ts');

  it.each(Object.entries(SHARED_LOCATORS))('defines the %s locator as %s', (name, selector) => {
    const escaped = selector.replaceAll(/[[\]]/g, '\\$&');
    expect(locators).toMatch(new RegExp(`export const ${name} = [^\\n]*'${escaped}'`));
  });

  it('opens a page with one readiness signal: the note hidden and the ready input enabled', () => {
    const open = /export const open = [\s\S]*?\n\};/.exec(locators)?.[0] ?? '';
    expect(open).toContain('notRunning(page)).toBeHidden()');
    expect(open).toContain('toBeEnabled()');
    expect(locators).toMatch(/export const denyClipboard = /);
  });

  it.each(SPEC_SUITES)(
    '%s opens its pages through the shared helper and spells no shared literal',
    (file) => {
      const source = read(file);
      expect(importsFromLocators(source)).toContain('open');
      expect(source).not.toMatch(/^const open = /m);
      expect(sharedProblems(source)).toEqual([]);
    },
  );

  it.each(['calculator.spec.ts', 'a11y.spec.ts'])(
    '%s denies the clipboard through the shared helper',
    (file) => {
      expect(importsFromLocators(read(file))).toContain('denyClipboard');
    },
  );

  it.each(['calculator.spec.ts', 'layout.spec.ts'])(
    '%s reads the answer only when the record declares it',
    (file) => {
      expect(read(file)).toMatch(/answer !== undefined/);
    },
  );

  it.each([
    ['the copy button', "await page.locator('[data-copy]').click();", '[data-copy]'],
    ['the language switch', "page.locator('header a[hreflang]')", 'header a[hreflang]'],
    [
      'the not-running note',
      "expect(page.locator('[data-not-running]')).toBeHidden()",
      '[data-not-running]',
    ],
    ['the answer', "page.locator('[data-answer]')", '[data-answer]'],
    ['the denied clipboard', "Promise.reject(new Error('denied'))", 'denied'],
  ])('flags a suite that spells %s', (_what, code, literal) => {
    expect(sharedProblems(code)).toEqual([`spells the shared literal "${literal}"`]);
  });

  it('does not flag a longer selector or a record read', () => {
    expect(
      sharedProblems("page.locator('[data-copy-status]'); const key = `calc-${typed.key}`;"),
    ).toEqual([]);
  });
});

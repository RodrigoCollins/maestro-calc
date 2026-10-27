import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ROUTES } from '../routing/routes.ts';
import { CALCULATOR_PAGES } from '../routing/templates.ts';
import { stringsIn, stripComments } from './__testing__/source-text.ts';
import { fromRoot } from './root.ts';

/**
 * The browser suites run over a typed per-calculator record (site-quality › [SQ29], [SQ30]). The
 * browser job has no root install, so the record reaches the workspace only by relative path.
 */
const E2E_DIR = 'tooling/site-browser/e2e';
const read = (file: string): string => readFileSync(fromRoot(E2E_DIR, file), 'utf8');

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

  it('derives the page paths from ROUTES for both locales', () => {
    expect(table).toContain("from '../../../apps/web/src/routing/routes.ts'");
    expect(table).toContain('CALCULATOR_PAGES');
    expect(table).toMatch(/ROUTES\[id\]/);
    expect(CALCULATOR_PAGES.every((id) => id in ROUTES)).toBe(true);
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

/** The suites that take their pages from the record alone: no page path of any kind. */
const PAGE_SUITES = ['a11y.spec.ts', 'layout.spec.ts', 'csp.spec.ts'];

/** A string literal that is a page path or a route glob (an asset glob such as `**\/_astro/*.js` is not). */
const pathProblems = (code: string): string[] =>
  stringsIn(stripComments(code))
    .filter((text) => /^(?:\*\*)?\/(?!_astro)\S/.test(text))
    .map((text) => `holds the path "${text}"`);

/** What a string literal of a generic suite may not hold: a calculator's name, path or group. */
const suiteProblems = (code: string): string[] =>
  stringsIn(stripComments(code)).flatMap((text) => [
    ...(/concret[eo]/i.test(text) ? [`names the concrete calculator in "${text}"`] : []),
    ...(text.includes('data-choice="shape"') ? [`names the shape group in "${text}"`] : []),
    ...(text === 'shape' ? ['names the shape group as a literal'] : []),
  ]);

describe('the generic suites hold no calculator literal (site-quality › [SQ30]; calculator-web-core › [CWC34])', () => {
  it.each(SUITES)('%s names no calculator, path or shape', (file) => {
    expect(suiteProblems(read(file))).toEqual([]);
  });

  it.each([
    ['a calculator id', "const id = 'concrete';", 'names the concrete calculator in "concrete"'],
    [
      'an English path',
      "await page.goto('/concrete-calculator');",
      'names the concrete calculator in "/concrete-calculator"',
    ],
    [
      'a Spanish path',
      "await page.goto('/es/calculadora-de-concreto');",
      'names the concrete calculator in "/es/calculadora-de-concreto"',
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
      '// the concrete page, shape by shape',
      "const title = 'shows the fields of each shape';",
      'const label = calculator.catalog[`calc.${calculator.id}.inputs.${name}`];',
    ].join('\n');
    expect(suiteProblems(code)).toEqual([]);
  });
});

describe('the axe, layout and CSP suites run over the record (site-quality › [SQ17], [SQ19], [SQ32])', () => {
  it.each(PAGE_SUITES)('%s imports the page list and holds no page path', (file) => {
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
    expect(source).toContain('[data-copy]');
    expect(source).toContain('header a[hreflang]');
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

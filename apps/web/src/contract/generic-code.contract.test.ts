import { globSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { calculators } from '../lib/calculators.ts';
import { stringsIn, stripComments } from './__testing__/source-text.ts';
import { fromRoot } from './root.ts';

/**
 * The generic web layer names no calculator and reaches no browser API (calculator-web-core
 * [CWC9], [CWC34]). The browser scan covers every non-test source under `apps/web/src/calculator/`,
 * the per-id folders included (they are in the client bundle too). The id scan covers the generic
 * code only: every such source outside the folder of a registry calculator.
 */
const IDS = calculators.map(({ id }) => id);

const isTest = (file: string): boolean => /\.test(-d)?\.ts$/.test(file);

const sourceFiles = (): string[] =>
  globSync('apps/web/src/calculator/**/*.ts', { cwd: fromRoot('.') }).filter(
    (file) => !isTest(file) && !file.includes('/__testing__/'),
  );

const genericFiles = (): string[] =>
  sourceFiles().filter(
    (file) => !IDS.some((id) => file.startsWith(`apps/web/src/calculator/${id}/`)),
  );

/** The generic components, the page builder and the generic mount: they name no calculator either (the builder takes its catalog as an argument, the mount its page module). */
const pageFiles = (): string[] => [
  ...globSync('apps/web/src/components/calculator/*.astro', { cwd: fromRoot('.') }).sort(),
  'apps/web/src/lib/page-view.ts',
  'apps/web/src/client/mount.ts',
];

/** An Astro file without its markup comments, then without its script comments. */
const stripMarkupComments = (source: string): string => source.replaceAll(/<!--[\s\S]*?-->/g, '');

/** What a generic file may not do: reach the page, or the catalogs and their text. */
const browserProblems = (code: string): string[] => [
  ...Array.from(
    code.matchAll(/\b(document|window|navigator)\b/g),
    ([name = '']) => `reads ${name}`,
  ),
  ...(/from\s+'[^']*(?:@maestro-calc\/i18n|catalogs)[^']*'/.test(code)
    ? ['imports a catalog']
    : []),
];

/** A registry id as a whole token of a string literal or a path segment of an import. */
const idProblems = (code: string, ids: readonly string[]): string[] =>
  stringsIn(code).flatMap((text) =>
    ids
      .filter((id) => new RegExp(`(^|[^\\w-])${id}([^\\w-]|$)`).test(text))
      .map((id) => `names ${id} in "${text}"`),
  );

describe('generic code names no calculator and no browser API (calculator-web-core › [CWC9], [CWC34])', () => {
  const files = genericFiles();
  const sources = sourceFiles();

  it('scans the browser-facing files, the per-calculator folders included', () => {
    expect(sources).toContain('apps/web/src/calculator/concrete/page.ts');
    expect(sources).toContain('apps/web/src/calculator/rectangle-area/page.ts');
    expect(sources).toEqual(expect.arrayContaining(files));
  });

  it('scans the generic files for ids and leaves the per-calculator folders out', () => {
    expect(files).toContain('apps/web/src/calculator/controller.ts');
    expect(files).toContain('apps/web/src/calculator/slots/choices.ts');
    expect(files.some((file) => file.includes('/concrete/'))).toBe(false);
    expect(files.some((file) => file.includes('/rectangle-area/'))).toBe(false);
    expect(IDS).toEqual(expect.arrayContaining(['concrete', 'rectangle-area']));
  });

  // spec: calculator-web-core › [CWC9] no DOM, no window, no catalog
  it.each(sources)('%s reads no document, window or navigator and imports no catalog', (file) => {
    expect(browserProblems(stripComments(readFileSync(fromRoot(file), 'utf8')))).toEqual([]);
  });

  // spec: calculator-web-core › [CWC34] no calculator id in a string literal or a path
  it.each(files)('%s names no registry calculator in a string or a path', (file) => {
    expect(idProblems(stripComments(readFileSync(fromRoot(file), 'utf8')), IDS)).toEqual([]);
  });

  // spec: calculator-web-core › [CWC34] the generic components, the page builder and the mount join the scan
  it('scans the generic components, the page builder and the mount for ids', () => {
    expect(pageFiles()).toEqual(
      expect.arrayContaining([
        'apps/web/src/components/calculator/CalculatorBody.astro',
        'apps/web/src/components/calculator/CalculatorForm.astro',
        'apps/web/src/components/calculator/ResultPanel.astro',
        'apps/web/src/components/calculator/ShoppingLine.astro',
        'apps/web/src/lib/page-view.ts',
        'apps/web/src/client/mount.ts',
      ]),
    );
  });

  it.each(pageFiles())('%s names no registry calculator in a string or a path', (file) => {
    const code = stripComments(stripMarkupComments(readFileSync(fromRoot(file), 'utf8')));
    expect(idProblems(code, IDS)).toEqual([]);
  });
});

describe('the scan finds what it forbids (seeded)', () => {
  it.each([
    ['a document read', 'const a = document.body;', 'reads document'],
    ['a window read', 'const w = window;', 'reads window'],
    ['a navigator read', 'void navigator.clipboard;', 'reads navigator'],
    [
      'a catalog import',
      `import { c } from '@maestro-calc/i18n/catalogs/en/common';`,
      'imports a catalog',
    ],
    ['a catalog path', `import { c } from '../catalogs/x.ts';`, 'imports a catalog'],
  ])('flags %s', (_what, code, problem) => {
    expect(browserProblems(stripComments(code))).toContain(problem);
  });

  it.each([
    ['a string literal', `const id = 'concrete';`, 'names concrete in "concrete"'],
    [
      'a path segment',
      `import { s } from '../concrete/shapes.ts';`,
      'names concrete in "../concrete/shapes.ts"',
    ],
    [
      'a template literal',
      'const key = `calc.rectangle-area.${x}`;',
      'names rectangle-area in "calc.rectangle-area.${x}"',
    ],
  ])('flags a registry id in %s', (_what, code, problem) => {
    expect(idProblems(stripComments(code), IDS)).toContain(problem);
  });

  it('does not flag an id in a markup comment of a component', () => {
    const markup = '<!-- the concrete page -->\n<p class="calc-note">Text</p>';
    expect(idProblems(stripComments(stripMarkupComments(markup)), IDS)).toEqual([]);
    expect(
      idProblems(stripComments(`<p data-calculator="concrete">x</p>\nconst a = 'concrete';`), IDS),
    ).toContain('names concrete in "concrete"');
  });

  it('does not flag an id in a comment, a longer id or a plain word', () => {
    const code = [
      '// the concrete page and window and document',
      '/* concrete: rectangle-area, navigator */',
      `const m = 'concrete-mix'; const u = 'https://maestrocalc.com/concrete-calculator';`,
      `const c = 'concreteness';`,
    ].join('\n');
    expect(idProblems(stripComments(code), IDS)).toEqual([]);
    expect(browserProblems(stripComments(code))).toEqual([]);
  });
});

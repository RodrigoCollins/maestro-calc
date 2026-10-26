import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { buildClient } from './__testing__/client-build.ts';
import { graphViolations, reaches, shortPath } from './__testing__/client-graph.ts';
import { fromRoot } from './root.ts';

const ENTRY = fromRoot('apps/web/src/client/entries/concrete.ts');
const ENTRY_SOURCE = `import '${ENTRY}';`;

/** The module specifiers a source imports, sorted (`import … from 'x'` and `import 'x'`). */
const importsOf = (source: string): string[] =>
  Array.from(
    source.matchAll(/^\s*import\b[^'"]*['"]([^'"]+)['"]/gm),
    ([, specifier = '']) => specifier,
  ).sort();

describe('concrete client entry: its own imports (calculator-page › [CP48]; calculator-web-core › [CWC25])', () => {
  // spec: calculator-page › [CP48] the entry imports the generic mount and its page module, nothing else
  it('imports exactly the generic mount and the concrete page module', () => {
    expect(importsOf(readFileSync(ENTRY, 'utf8'))).toEqual([
      '../../calculator/concrete/page.ts',
      '../mount.ts',
    ]);
  });

  it('reads the specifiers of an entry, whatever the import form', () => {
    expect(importsOf(`import { a } from './a.ts';\nimport './b.ts';\nconst c = 'x';`)).toEqual([
      './a.ts',
      './b.ts',
    ]);
  });
});

describe('concrete client entry: source graph (calculator-page › [CP48])', () => {
  // spec: calculator-page › [CP48] the entry never reaches the registry, another calculator or the data root
  it('reaches the concrete calculator and the yields subpath, and nothing it must not', async () => {
    const { modules } = await buildClient(ENTRY_SOURCE);
    expect(reaches(modules, '/apps/web/src/client/entries/concrete.ts')).toBe(true);
    expect(reaches(modules, '/apps/web/src/lib/concrete.ts')).toBe(true);
    expect(reaches(modules, '/packages/data/src/yields/concrete-mix.ts')).toBe(true);
    expect(reaches(modules, '/packages/core/src/calculators/concrete/concrete.ts')).toBe(true);
    expect(graphViolations(modules)).toEqual([]);
  });

  // spec: calculator-web-core › [CWC2], [CWC25] the slots and the concrete files come in through the page module, the builder never
  it('reaches the slots and the concrete files through the page module and no builder or catalog', async () => {
    const { modules } = await buildClient(ENTRY_SOURCE);
    for (const file of ['page', 'shapes', 'present']) {
      expect(reaches(modules, `/apps/web/src/calculator/concrete/${file}.ts`), file).toBe(true);
    }
    for (const slot of ['choices', 'steppers', 'shopping', 'costs', 'answer']) {
      expect(reaches(modules, `/apps/web/src/calculator/slots/${slot}.ts`), slot).toBe(true);
    }
    expect(reaches(modules, '/apps/web/src/client/mount.ts')).toBe(true);
    expect(modules.filter((id) => id.includes('/apps/web/src/lib/')).map(shortPath)).toEqual([
      'apps/web/src/lib/concrete.ts',
    ]);
    expect(modules.some((id) => id.includes('/packages/i18n/'))).toBe(false);
  });

  // seeded graphs: each violation is found and named by its path
  it.each([
    [
      'the registry',
      `export { calculators } from '${fromRoot('apps/web/src/lib/calculators.ts')}';`,
      'apps/web/src/lib/calculators.ts: the registry of every calculator',
    ],
    [
      'another calculator of core',
      `export * from '${fromRoot('packages/core/src/calculators/rectangle-area/index.ts')}';`,
      'packages/core/src/calculators/rectangle-area/index.ts: another calculator directory of core',
    ],
    [
      'the data root',
      `export { concreteMix } from '@maestro-calc/data';`,
      'packages/data/src/index.ts: the root entry of @maestro-calc/data',
    ],
  ])('names %s when the entry imports it', async (_name, extra, expected) => {
    const { modules } = await buildClient(`${ENTRY_SOURCE}\n${extra}`);
    expect(graphViolations(modules)).toContain(expected);
  });
});

describe('rectangle-area proof entry: source graph (calculator-web-core › [CWC1], [CWC9])', () => {
  const PROOF_ENTRY = `
    import { controllerOf } from '${fromRoot('apps/web/src/calculator/controller.ts')}';
    import { rectangleAreaPage } from '${fromRoot('apps/web/src/calculator/rectangle-area/page.ts')}';
    export const controller = controllerOf(rectangleAreaPage);
  `;

  // spec: calculator-web-core › [CWC1] a module with no slot carries no slot code and no other calculator's files
  it('reaches the controller and no slot file and no concrete file', async () => {
    const { modules } = await buildClient(PROOF_ENTRY);
    expect(reaches(modules, '/apps/web/src/calculator/controller.ts')).toBe(true);
    expect(reaches(modules, '/apps/web/src/calculator/rectangle-area/page.ts')).toBe(true);
    expect(modules.filter((id) => /\/calculator\/(slots|concrete)\//.test(id))).toEqual([]);
  });

  it('is found when the entry imports a slot', async () => {
    const { modules } = await buildClient(
      `${PROOF_ENTRY}\nexport { answerSlot } from '${fromRoot('apps/web/src/calculator/slots/answer.ts')}';`,
    );
    expect(modules.some((id) => id.includes('/calculator/slots/'))).toBe(true);
  });
});

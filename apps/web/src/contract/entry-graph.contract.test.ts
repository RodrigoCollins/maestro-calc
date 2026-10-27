import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { calculators } from '../lib/calculators.ts';
import { CALCULATOR_PAGES } from '../routing/templates.ts';
import { buildClient } from './__testing__/client-build.ts';
import {
  entryPathOf,
  entrySourceOf,
  graphViolations,
  reaches,
  shortPath,
} from './__testing__/client-graph.ts';
import { fromRoot } from './root.ts';

/** The module specifiers a source imports, sorted (`import … from 'x'` and `import 'x'`). */
const importsOf = (source: string): string[] =>
  Array.from(
    source.matchAll(/^\s*import\b[^'"]*['"]([^'"]+)['"]/gm),
    ([, specifier = '']) => specifier,
  ).sort();

describe.each(CALCULATOR_PAGES)(
  '%s client entry: its own imports (calculator-page › [CP48]; calculator-web-core › [CWC25], [CWC37])',
  (id) => {
    // spec: calculator-page › [CP48] the entry imports the generic mount and its page module, nothing else
    it('imports exactly the generic mount and its own page module', () => {
      expect(importsOf(readFileSync(entryPathOf(id), 'utf8'))).toEqual([
        `../../calculator/${id}/page.ts`,
        '../mount.ts',
      ]);
    });
  },
);

describe('the import reader', () => {
  it('reads the specifiers of an entry, whatever the import form', () => {
    expect(importsOf(`import { a } from './a.ts';\nimport './b.ts';\nconst c = 'x';`)).toEqual([
      './a.ts',
      './b.ts',
    ]);
  });
});

describe.each(CALCULATOR_PAGES)(
  '%s client entry: source graph (calculator-page › [CP48]; calculator-web-core › [CWC37])',
  (id) => {
    // spec: calculator-page › [CP48] the entry never reaches the registry, another calculator or the data root
    it('reaches its calculator, its page module and the mount, and nothing it must not', async () => {
      const { modules } = await buildClient(entrySourceOf(id));
      expect(reaches(modules, `/apps/web/src/client/entries/${id}.ts`)).toBe(true);
      expect(reaches(modules, `/apps/web/src/calculator/${id}/page.ts`)).toBe(true);
      expect(reaches(modules, '/apps/web/src/client/mount.ts')).toBe(true);
      expect(reaches(modules, `/packages/core/src/calculators/${id}/${id}.ts`)).toBe(true);
      expect(graphViolations(modules, id)).toEqual([]);
    });

    // spec: calculator-web-core › [CWC25] no builder, no catalog and no lib file but its own composition root
    it('reaches no page builder, catalog or lib file but its own composition root', async () => {
      const { modules } = await buildClient(entrySourceOf(id));
      expect(
        modules
          .filter((module) => module.includes('/apps/web/src/lib/'))
          .map(shortPath)
          .filter((path) => path !== `apps/web/src/lib/${id}.ts`),
      ).toEqual([]);
      expect(modules.some((module) => module.includes('/packages/i18n/'))).toBe(false);
    });
  },
);

describe('concrete client entry: the factory calculator and its slots (calculator-web-core › [CWC2])', () => {
  const source = entrySourceOf('concrete');

  // spec: calculator-page › [CP48] the composition root and the yields subpath, never the data root
  it('reaches the composition root and the yields subpath', async () => {
    const { modules } = await buildClient(source);
    expect(reaches(modules, '/apps/web/src/lib/concrete.ts')).toBe(true);
    expect(reaches(modules, '/packages/data/src/yields/concrete-mix.ts')).toBe(true);
  });

  // spec: calculator-web-core › [CWC2] the slots and the concrete files come in through the page module
  it('reaches the five slots and the concrete files through the page module', async () => {
    const { modules } = await buildClient(source);
    for (const file of ['page', 'shapes', 'present']) {
      expect(reaches(modules, `/apps/web/src/calculator/concrete/${file}.ts`), file).toBe(true);
    }
    for (const slot of ['choices', 'steppers', 'shopping', 'costs', 'answer']) {
      expect(reaches(modules, `/apps/web/src/calculator/slots/${slot}.ts`), slot).toBe(true);
    }
    expect(modules.filter((id) => id.includes('/apps/web/src/lib/')).map(shortPath)).toEqual([
      'apps/web/src/lib/concrete.ts',
    ]);
  });
});

describe('the source graph check finds what it forbids (seeded)', () => {
  const FIRST = CALCULATOR_PAGES[0];
  const OTHER = calculators.map(({ id }) => id).find((id) => id !== FIRST) ?? '';
  const ENTRY_SOURCE = entrySourceOf(FIRST);

  // seeded graphs: each violation is found and named by its path
  it.each([
    [
      'the registry',
      `export { calculators } from '${fromRoot('apps/web/src/lib/calculators.ts')}';`,
      'apps/web/src/lib/calculators.ts: the registry of every calculator',
    ],
    [
      'another calculator of core',
      `export * from '${fromRoot(`packages/core/src/calculators/${OTHER}/index.ts`)}';`,
      `packages/core/src/calculators/${OTHER}/index.ts: another calculator directory of core`,
    ],
    [
      "another calculator's web folder",
      `export * from '${fromRoot(`apps/web/src/calculator/${OTHER}/page.ts`)}';`,
      `apps/web/src/calculator/${OTHER}/page.ts: another calculator's web folder`,
    ],
    [
      'the data root',
      `export { concreteMix } from '@maestro-calc/data';`,
      'packages/data/src/index.ts: the root entry of @maestro-calc/data',
    ],
  ])('names %s when the entry imports it', async (_name, extra, expected) => {
    const { modules } = await buildClient(`${ENTRY_SOURCE}\n${extra}`);
    expect(graphViolations(modules, FIRST)).toContain(expected);
  });
});

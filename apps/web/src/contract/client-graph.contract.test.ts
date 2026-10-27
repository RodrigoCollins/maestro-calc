import { describe, expect, it } from 'vitest';
import { entryPathOf, graphViolations, shortPath } from './__testing__/client-graph.ts';
import { fromRoot } from './root.ts';

const web = (path: string): string => fromRoot(`apps/web/src/${path}`);
const core = (path: string): string => fromRoot(`packages/core/src/calculators/${path}`);

describe('what a calculator entry must not reach, from its own id (calculator-web-core › [CWC37]; calculator-page › [CP48])', () => {
  // spec: calculator-web-core › [CWC37] another calculator's web folder is forbidden, the generic folders are not
  it("flags another calculator's web folder for each entry and names the file", () => {
    expect(graphViolations([web('calculator/rectangle-area/page.ts')], 'concrete')).toEqual([
      "apps/web/src/calculator/rectangle-area/page.ts: another calculator's web folder",
    ]);
    expect(graphViolations([web('calculator/concrete/page.ts')], 'rectangle-area')).toEqual([
      "apps/web/src/calculator/concrete/page.ts: another calculator's web folder",
    ]);
  });

  it('allows the entry, its own folder, the slots and the generic files', () => {
    const own = [
      web('client/entries/concrete.ts'),
      web('calculator/concrete/page.ts'),
      web('calculator/concrete/shapes.ts'),
      web('calculator/slots/choices.ts'),
      web('calculator/slots/answer.ts'),
      web('calculator/controller.ts'),
      web('calculator/ids.ts'),
      web('lib/concrete.ts'),
      core('concrete/concrete.ts'),
    ];
    expect(graphViolations(own, 'concrete')).toEqual([]);
    expect(graphViolations([web('calculator/slots/answer.ts')], 'rectangle-area')).toEqual([]);
  });

  // spec: calculator-page › [CP48] another calculator's core directory, derived from the own id
  it("flags another calculator's core directory and allows the own one", () => {
    expect(graphViolations([core('rectangle-area/index.ts')], 'concrete')).toEqual([
      'packages/core/src/calculators/rectangle-area/index.ts: another calculator directory of core',
    ]);
    expect(graphViolations([core('concrete/concrete.ts')], 'rectangle-area')).toEqual([
      'packages/core/src/calculators/concrete/concrete.ts: another calculator directory of core',
    ]);
    expect(graphViolations([core('rectangle-area/index.ts')], 'rectangle-area')).toEqual([]);
  });

  it.each([
    [
      'the registry',
      web('lib/calculators.ts'),
      'apps/web/src/lib/calculators.ts: the registry of every calculator',
    ],
    [
      'the data root',
      fromRoot('packages/data/src/index.ts'),
      'packages/data/src/index.ts: the root entry of @maestro-calc/data',
    ],
    [
      'a material record',
      fromRoot('packages/data/src/materials/concrete-mix.ts'),
      'packages/data/src/materials/concrete-mix.ts: the material records of @maestro-calc/data',
    ],
  ])('flags %s for every entry', (_what, id, expected) => {
    expect(graphViolations([id], 'concrete')).toEqual([expected]);
    expect(graphViolations([id], 'rectangle-area')).toEqual([expected]);
  });
});

describe('the entry of a page id (calculator-web-core › [CWC37])', () => {
  // spec: calculator-web-core › [CWC37] a new entry is covered with no test edit
  it.each([['concrete'], ['rectangle-area']])('reads the entry of %s from the id', (id) => {
    expect(shortPath(entryPathOf(id))).toBe(`apps/web/src/client/entries/${id}.ts`);
  });
});

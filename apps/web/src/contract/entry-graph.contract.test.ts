import { describe, expect, it } from 'vitest';
import { buildClient } from './__testing__/client-build.ts';
import { graphViolations, reaches } from './__testing__/client-graph.ts';
import { fromRoot } from './root.ts';

const ENTRY = fromRoot('apps/web/src/client/entries/concrete.ts');
const ENTRY_SOURCE = `import '${ENTRY}';`;

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

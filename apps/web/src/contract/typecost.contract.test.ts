import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

/** The most type instantiations the core sources may cost (the measured baseline is far lower). */
const INSTANTIATION_BUDGET = 100_000;

const instantiationsOf = (project: string): number => {
  const run = spawnSync(
    process.execPath,
    [
      fromRoot('node_modules/typescript/bin/tsc'),
      '-p',
      fromRoot(project),
      '--noEmit',
      '--extendedDiagnostics',
    ],
    { cwd: fromRoot(), encoding: 'utf8' },
  );
  expect(run.status, run.stdout).toBe(0);
  const count = /^Instantiations:\s+(\d+)$/m.exec(run.stdout)?.[1];
  expect(count, 'tsc printed no Instantiations line').toBeDefined();
  return Number(count);
};

// design: Performance levers — type-level dimension arithmetic must stay cheap. Before the guard
// on `AddVec`/`SubVec` it cost 1,354,888 instantiations (27 percent of the TS2589 budget, and
// growing with every base dimension); a regression shows up here long before TS2589 does.
describe('type-check cost of core (quality-gates › Typecheck gate, design: Performance levers)', () => {
  it(`instantiates fewer than ${String(INSTANTIATION_BUDGET)} types`, () => {
    expect(instantiationsOf('packages/core/tsconfig.src.json')).toBeLessThan(INSTANTIATION_BUDGET);
  }, 30_000);
});

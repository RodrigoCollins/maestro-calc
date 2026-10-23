import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';
import { fromRoot } from './root.ts';

/** The calculators core ships: one directory each under `src/calculators`. */
const CALCULATORS = readdirSync(fromRoot('packages/core/src/calculators'), {
  withFileTypes: true,
}).filter((entry) => entry.isDirectory()).length;

/**
 * The most type instantiations the core sources may cost: a base of 30,000 (measured: 22,631 with
 * one calculator, 20,866 after PR 10) plus 250 per calculator (measured: about 177 per calculator
 * in the sources, with headroom). A flat cap would be crossed by growth the design expects, and
 * raising it by hand would hide a real regression; this one moves only with the catalog.
 */
const SOURCE_BUDGET = 30_000 + 250 * CALCULATORS;
/**
 * The same for the test program, which adds the property and type tests: a base of 135,000
 * (measured: 119,771 with one calculator) plus 2,000 per calculator (measured: about 1,497 per
 * calculator). A flat 150,000 would be crossed near the 22nd calculator.
 */
const TEST_BUDGET = 135_000 + 2_000 * CALCULATORS;

const tsc = createRequire(import.meta.url).resolve('typescript/bin/tsc');

/**
 * The instantiation count of `tsc --extendedDiagnostics` output. With the `m` flag `$` already
 * matches before a CR, so CRLF output (Windows) needs no `\r?`; the control test pins it.
 */
const countIn = (output: string): number | undefined => {
  const count = /^Instantiations:\s+(\d+)$/m.exec(output)?.[1];
  return count === undefined ? undefined : Number(count);
};

const instantiationsOf = (project: string): number => {
  const run = spawnSync(
    process.execPath,
    [tsc, '-p', fromRoot(project), '--noEmit', '--extendedDiagnostics'],
    { cwd: fromRoot(), encoding: 'utf8' },
  );
  expect(run.status, run.stdout).toBe(0);
  const count = countIn(run.stdout);
  if (count === undefined) throw new Error('tsc printed no Instantiations line');
  return count;
};

// design: Performance levers — type-level dimension arithmetic must stay cheap. Before the guard
// on `AddVec`/`SubVec` it cost 1,354,888 instantiations (27 percent of the TS2589 budget, and
// growing with every base dimension); a regression shows up here long before TS2589 does.
describe('type-check cost of core (quality-gates › Typecheck gate, design: Performance levers)', () => {
  it(`instantiates fewer than ${String(SOURCE_BUDGET)} types in the sources`, () => {
    expect(instantiationsOf('packages/core/tsconfig.src.json')).toBeLessThan(SOURCE_BUDGET);
  }, 30_000);

  it(`instantiates fewer than ${String(TEST_BUDGET)} types with the tests`, () => {
    expect(instantiationsOf('packages/core/tsconfig.test.json')).toBeLessThan(TEST_BUDGET);
  }, 30_000);

  it('reads the count from LF and CRLF output (control)', () => {
    expect(countIn('Types:   10\nInstantiations:   1234\nMemory used: 1K')).toBe(1234);
    expect(countIn('Types:   10\r\nInstantiations:   1234\r\nMemory used: 1K')).toBe(1234);
    expect(countIn('Instantiations: 7')).toBe(7);
    expect(countIn('Types: 10')).toBeUndefined();
  });
});

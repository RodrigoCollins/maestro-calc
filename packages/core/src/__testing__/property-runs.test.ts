import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { numRuns, STRYKER_SEED } from './property-runs.ts';

describe('property run budget (quality-gates › Coverage gate, mutation)', () => {
  const underStryker = process.env['STRYKER'] === '1';

  // spec: quality-gates › property tests run 1000 cases, 50 under STRYKER
  it('is 1000 runs normally and 50 when STRYKER is set', () => {
    expect(numRuns).toBe(underStryker ? 50 : 1000);
  });

  // spec: quality-gates › Mutation gate: the same inputs for the same content hash
  it('pins the fast-check seed under STRYKER and keeps random seeds otherwise', () => {
    expect(Number.isInteger(STRYKER_SEED)).toBe(true);
    const { seed } = fc.readConfigureGlobal();
    expect(seed).toBe(underStryker ? STRYKER_SEED : undefined);
  });
});

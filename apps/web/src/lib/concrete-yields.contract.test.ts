import { ft3, quantity, Rational } from '@maestro-calc/core';
import { CONCRETE_YIELDS } from '@maestro-calc/core/testing/concrete-yields';
import { concreteMix } from '@maestro-calc/data';
import { CONCRETE_MIX_YIELDS } from '@maestro-calc/data/yields/concrete-mix';
import { describe, expect, it } from 'vitest';
import { yieldDrift, yieldsOfRecord } from '../contract/yield-drift.ts';

const sides = () => ({
  core: CONCRETE_YIELDS,
  data: CONCRETE_MIX_YIELDS,
  record: yieldsOfRecord(concreteMix),
});

describe('yield drift guard (calc-concrete › [CC6] Yield drift guard)', () => {
  // spec: calc-concrete › [CC6]: the core fixture, the yields-only module and the record agree
  it('has 3/10, 9/20 and 3/5 ft3 in the core fixture, the yields module and the record', () => {
    expect(yieldDrift(sides())).toEqual([]);
  });

  // spec: calc-concrete › [CC6]: the test fails when any side changes alone (seeded copies)
  it.each(['core', 'data', 'record'] as const)(
    'reports the %s side when it alone changes',
    (side) => {
      const drifted = { ...CONCRETE_YIELDS, 'bag-80': quantity(Rational.of(3, 6), ft3) };
      expect(yieldDrift({ ...sides(), [side]: drifted })).toEqual([
        `${side}: bag-80 is 1/2 ft3, expected 3/5 ft3`,
      ]);
    },
  );

  it('reports a missing size', () => {
    const partial = { 'bag-40': CONCRETE_YIELDS['bag-40'], 'bag-80': CONCRETE_YIELDS['bag-80'] };
    expect(yieldDrift({ ...sides(), core: partial })).toEqual(['core: bag-60 is missing']);
  });
});

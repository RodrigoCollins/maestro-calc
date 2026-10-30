import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { roofPitchStateArb } from '../../__testing__/roof-pitch-arbitraries.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import { Rational } from '../../rational/rational.ts';
import { inch } from '../../units/catalog.ts';
import { add } from '../../units/ops.ts';
import { isQuantityOf, valueIn } from '../../units/quantity.ts';
import { roofPitch } from './index.ts';

const ULP = Rational.of(1n, 10n ** 20n);

describe('roof pitch properties (calc-roof-pitch › Pitch and rafter)', () => {
  // the rafter r and its horizontal run h satisfy r² = h² (1 + t²) within the root's bound
  it('gives a rafter whose square is the run squared plus the rise over it squared', () => {
    fc.assert(
      fc.property(roofPitchStateArb, (state) => {
        const { rafter, pitch } = roofPitch.compute(state).outputs;
        if (!isQuantityOf(rafter, 'length') || !isQuantityOf(pitch, 'length'))
          throw new Error('shape');
        const h = valueIn(add(state.rafterRun, state.overhang), inch);
        const t = valueIn(pitch, inch).div(Rational.of(12));
        const factor = valueIn(rafter, inch).div(h.isZero() ? Rational.ONE : h);
        const exact = Rational.ONE.add(t.mul(t));
        if (h.isZero()) return;
        expect(factor.mul(factor).compare(exact)).toBeLessThanOrEqual(0);
        expect(factor.add(ULP).mul(factor.add(ULP)).compare(exact)).toBe(1);
      }),
      { numRuns },
    );
  });
});

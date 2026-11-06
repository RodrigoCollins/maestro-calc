import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { feetInchesStateArb } from '../../__testing__/feet-inches-arbitraries.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import { Rational } from '../../rational/rational.ts';
import { inch } from '../../units/catalog.ts';
import { isQuantityOf, valueIn } from '../../units/quantity.ts';
import { feetInches } from './index.ts';

describe('feet and inches properties (calc-feet-inches › Operations)', () => {
  it('computes exactly what the operation says, never below zero', () => {
    fc.assert(
      fc.property(feetInchesStateArb, (state) => {
        const { outputs, warnings } = feetInches.compute(state);
        const { result, resultIn, pieces, ratio } = outputs;
        if (!isQuantityOf(result, 'length') || !isQuantityOf(resultIn, 'length'))
          throw new Error('shape');
        const [a, b, n] = [
          valueIn(state.first, inch),
          valueIn(state.second, inch),
          Rational.of(state.factor),
        ];
        const quotient = b.isZero() ? Rational.ZERO : a.div(b);
        const whole = Rational.of(quotient.floor());
        const expected = {
          add: a.add(b),
          subtract: a.sub(b).abs(),
          multiply: a.mul(n),
          divide: a.div(n),
          fit: b.isZero() ? a : a.sub(whole.mul(b)),
        }[state.operation];
        expect(valueIn(result, inch)).toEqual(expected);
        expect(valueIn(resultIn, inch)).toEqual(expected);
        expect(ratio).toEqual(quotient);
        expect(pieces).toEqual(whole);
        const longer = state.operation === 'subtract' && b.compare(a) === 1;
        const zero = state.operation === 'fit' && b.isZero();
        expect(warnings.map(({ code }) => code)).toEqual(
          longer ? ['secondLonger'] : zero ? ['zeroPiece'] : [],
        );
      }),
      { numRuns },
    );
  });

  // spec: calc-feet-inches › [FI7] the pieces and what is left make up the first length
  it('fits whole pieces whose total and the leftover give back the first length', () => {
    fc.assert(
      fc.property(feetInchesStateArb, (state) => {
        const { outputs } = feetInches.compute({ ...state, operation: 'fit' });
        const [a, b] = [valueIn(state.first, inch), valueIn(state.second, inch)];
        const left = valueIn(outputs.result, inch);
        expect(left.sign()).not.toBe(-1);
        if (b.isZero()) return;
        expect(outputs.pieces.isInteger()).toBe(true);
        expect(outputs.pieces.mul(b).add(left)).toEqual(a);
        expect(left.compare(b)).toBe(-1);
      }),
      { numRuns },
    );
  });
});

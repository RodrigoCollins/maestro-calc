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
        const { result, resultIn } = outputs;
        if (!isQuantityOf(result, 'length') || !isQuantityOf(resultIn, 'length'))
          throw new Error('shape');
        const [a, b, n] = [
          valueIn(state.first, inch),
          valueIn(state.second, inch),
          Rational.of(state.factor),
        ];
        const expected = {
          add: a.add(b),
          subtract: a.sub(b).abs(),
          multiply: a.mul(n),
          divide: a.div(n),
        }[state.operation];
        expect(valueIn(result, inch)).toEqual(expected);
        expect(valueIn(resultIn, inch)).toEqual(expected);
        const longer = state.operation === 'subtract' && b.compare(a) === 1;
        expect(warnings.map(({ code }) => code)).toEqual(longer ? ['secondLonger'] : []);
      }),
      { numRuns },
    );
  });
});

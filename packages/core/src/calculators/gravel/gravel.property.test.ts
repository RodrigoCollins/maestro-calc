import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { GRAVEL_DENSITIES } from '../../__testing__/gravel-yields.ts';
import { gravelStateArb } from '../../__testing__/gravel-arbitraries.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, ft3, lb } from '../../units/catalog.ts';
import { isQuantityOf, valueIn } from '../../units/quantity.ts';
import { createGravel } from './index.ts';

const gravel = createGravel(GRAVEL_DENSITIES);

/** The state `compute` takes: a validated record of the 6 inputs. */
type State = Parameters<typeof gravel.compute>[0];

/** The weight in pounds and the volume to order in cubic feet of a state. */
const run = (state: State) => {
  const { outputs } = gravel.compute(state);
  const { tons, orderYd3 } = outputs;
  if (!isQuantityOf(tons, 'mass') || !isQuantityOf(orderYd3, 'volume')) throw new Error('shape');
  return { pounds: valueIn(tons, lb), order: valueIn(orderYd3, ft3) };
};

/** The total volume of a state with its extra, in cubic feet, computed by hand. */
const totalOf = ({ length, width, depth, waste }: State): Rational =>
  valueIn(length, ft)
    .mul(valueIn(width, ft))
    .mul(valueIn(depth, ft))
    .mul(Rational.ONE.add(waste.div(Rational.of(100))));

/** Pounds per cubic foot of a placement: the fixture's pounds per cubic yard over 27. */
const PER_FT3 = { compacted: Rational.of(3660, 27), loose: Rational.of(2580, 27) } as const;

describe('gravel properties (calc-gravel › Weight and volume)', () => {
  it('weighs the total volume at the density of its placement', () => {
    fc.assert(
      fc.property(gravelStateArb, (state) => {
        expect(run(state).pounds).toEqual(totalOf(state).mul(PER_FT3[state.placement]));
      }),
      { numRuns },
    );
  });

  it('orders a loose layer by its own total volume, and a compacted one by more', () => {
    fc.assert(
      fc.property(gravelStateArb, (state) => {
        const loose = run({ ...state, placement: 'loose' });
        const compacted = run({ ...state, placement: 'compacted' });
        expect(loose.order).toEqual(totalOf(state));
        expect(compacted.order.compare(loose.order)).toBeGreaterThanOrEqual(0);
        expect(compacted.pounds.compare(loose.pounds)).toBeGreaterThanOrEqual(0);
      }),
      { numRuns },
    );
  });
});

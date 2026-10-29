import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { topsoilStateArb } from '../../__testing__/topsoil-arbitraries.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, ft3 } from '../../units/catalog.ts';
import { isQuantityOf, valueIn } from '../../units/quantity.ts';
import { topsoil } from './index.ts';

/** The state `compute` takes: a validated record of the 7 inputs. */
type State = Parameters<typeof topsoil.compute>[0];

/** The total volume of a state with its extra, in cubic feet, computed by hand. */
const totalOf = ({ length, width, depth, waste }: State): Rational =>
  valueIn(length, ft)
    .mul(valueIn(width, ft))
    .mul(valueIn(depth, ft))
    .mul(Rational.ONE.add(waste.div(Rational.of(100))));

/** The volume of each bag size, in cubic feet. */
const BAG = { '0-75': Rational.of(3, 4), '1': Rational.ONE, '1-5': Rational.of(3, 2) } as const;

describe('topsoil properties (calc-topsoil › Volume, bags and costs)', () => {
  it('gives the total volume and the fewest whole bags that hold it', () => {
    fc.assert(
      fc.property(topsoilStateArb, (state) => {
        const { outputs, shopping } = topsoil.compute(state);
        const total = outputs.volumeFt3;
        if (!isQuantityOf(total, 'volume')) throw new Error('shape');
        expect(valueIn(total, ft3)).toEqual(totalOf(state));
        const qty = shopping[0]?.qty ?? -1n;
        const bag = BAG[state.bag];
        // the bags hold the total, and one bag fewer would not
        expect(Rational.of(qty).mul(bag).compare(totalOf(state))).toBeGreaterThanOrEqual(0);
        if (qty > 0n)
          expect(
            Rational.of(qty - 1n)
              .mul(bag)
              .compare(totalOf(state)),
          ).toBe(-1);
      }),
      { numRuns },
    );
  });
});

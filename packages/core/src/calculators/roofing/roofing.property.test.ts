import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { numRuns } from '../../__testing__/property-runs.ts';
import { roofingStateArb } from '../../__testing__/roofing-arbitraries.ts';
import { ROOFING_COVERAGE } from '../../__testing__/roofing-yields.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, ft2 } from '../../units/catalog.ts';
import { isQuantityOf, valueIn } from '../../units/quantity.ts';
import { createRoofing } from './index.ts';

const roofing = createRoofing(ROOFING_COVERAGE);

/** The state `compute` takes: a validated record of the 6 inputs. */
type State = Parameters<typeof roofing.compute>[0];

/** The footprint of a state in square feet. */
const footprintOf = ({ length, width }: State): Rational =>
  valueIn(length, ft).mul(valueIn(width, ft));

/** The area to buy for: the roof with its extra. */
const withExtra = (state: State, area: Rational): Rational =>
  area.mul(Rational.ONE.add(state.waste.div(Rational.of(100))));

/** The fewest whole units that hold `needed`: at least it, and one less falls short. */
const fewest = (qty: bigint | undefined, needed: Rational) => {
  const units = Rational.of(qty ?? -1n);
  expect(units.compare(needed)).toBeGreaterThanOrEqual(0);
  expect(units.sub(Rational.ONE).compare(needed)).toBeLessThan(0);
};

describe('roofing properties (calc-roofing › Roof area and materials)', () => {
  it('lays the footprint on the slope: area² = footprint² (1 + (p/12)²), within the root bound', () => {
    fc.assert(
      fc.property(roofingStateArb, (state) => {
        const { areaFt2 } = roofing.compute(state).outputs;
        if (!isQuantityOf(areaFt2, 'area')) throw new Error('shape');
        const area = valueIn(areaFt2, ft2);
        const footprint = footprintOf(state);
        const t = Rational.of(state.pitch, 12);
        const exactSquare = footprint.mul(footprint).mul(Rational.ONE.add(t.mul(t)));
        // the factor is never above the root and less than 10^-20 below it
        expect(area.mul(area).compare(exactSquare)).toBeLessThanOrEqual(0);
        const upper = area.add(footprint.mul(Rational.of(1n, 10n ** 20n)));
        expect(upper.mul(upper).compare(exactSquare)).toBeGreaterThanOrEqual(0);
      }),
      { numRuns },
    );
  });

  it('buys the fewest bundles and rolls that cover the roof with its extra', () => {
    fc.assert(
      fc.property(roofingStateArb, (state) => {
        const { outputs, shopping } = roofing.compute(state);
        const { areaFt2 } = outputs;
        if (!isQuantityOf(areaFt2, 'area')) throw new Error('shape');
        const needed = withExtra(state, valueIn(areaFt2, ft2));
        fewest(shopping[0]?.qty, needed.mul(Rational.of(3, 100)));
        // one layer lapped 2 in from 4 in 12, two layers below: 46 or 23 in of a 48 in roll
        const exposure = state.pitch >= 4 ? 46 : 23;
        const roll = Rational.of(2996 * exposure, 144);
        fewest(shopping[1]?.qty, needed.div(roll));
      }),
      { numRuns },
    );
  });
});

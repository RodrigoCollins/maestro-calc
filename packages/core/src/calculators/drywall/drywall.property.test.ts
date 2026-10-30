import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { drywallStateArb } from '../../__testing__/drywall-arbitraries.ts';
import { DRYWALL_FINISHING } from '../../__testing__/drywall-yields.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, ft2, gal } from '../../units/catalog.ts';
import { isQuantityOf, valueIn } from '../../units/quantity.ts';
import { createDrywall } from './index.ts';

const drywall = createDrywall(DRYWALL_FINISHING);

/** The state `compute` takes: a validated record of the 9 inputs. */
type State = Parameters<typeof drywall.compute>[0];

/** The area of a state in square feet, computed by hand. */
const areaOf = ({ length, width, height, doors, windows, surfaces }: State): Rational => {
  const [l, w] = [valueIn(length, ft), valueIn(width, ft)];
  const walls = l.add(w).mul(valueIn(height, ft)).mul(Rational.of(2));
  const left = walls.sub(Rational.of(20 * doors + 15 * windows));
  const wallArea = left.sign() === 1 ? left : Rational.ZERO;
  return surfaces === 'walls-ceiling' ? wallArea.add(l.mul(w)) : wallArea;
};

describe('drywall properties (calc-drywall › Area and materials)', () => {
  it('covers the walls less the openings, and the ceiling when chosen', () => {
    fc.assert(
      fc.property(drywallStateArb, (state) => {
        const { areaFt2 } = drywall.compute(state).outputs;
        if (!isQuantityOf(areaFt2, 'area')) throw new Error('shape');
        expect(valueIn(areaFt2, ft2)).toEqual(areaOf(state));
      }),
      { numRuns },
    );
  });

  it('buys the fewest whole sheets that cover the area with its extra, and finishes the bare area', () => {
    fc.assert(
      fc.property(drywallStateArb, (state) => {
        const { outputs, shopping } = drywall.compute(state);
        const per = state.sheet === '4x8' ? 32 : 48;
        const needed = areaOf(state)
          .mul(Rational.ONE.add(state.waste.div(Rational.of(100))))
          .div(Rational.of(per));
        const sheets = Rational.of(shopping[0]?.qty ?? -1n);
        expect(sheets.compare(needed)).toBeGreaterThanOrEqual(0);
        expect(sheets.sub(Rational.ONE).compare(needed)).toBeLessThan(0);
        const { compound } = outputs;
        if (!isQuantityOf(compound, 'volume')) throw new Error('shape');
        expect(valueIn(compound, gal)).toEqual(areaOf(state).mul(Rational.of(9, 1000)));
      }),
      { numRuns },
    );
  });
});

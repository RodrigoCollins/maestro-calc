import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { paintStateArb } from '../../__testing__/paint-arbitraries.ts';
import { PAINT_COVERAGE } from '../../__testing__/paint-yields.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, ft2, gal } from '../../units/catalog.ts';
import { isQuantityOf, valueIn } from '../../units/quantity.ts';
import { createPaint } from './index.ts';

const paint = createPaint(PAINT_COVERAGE);

/** The state `compute` takes: a validated record of the 7 inputs. */
type State = Parameters<typeof paint.compute>[0];

/** The paint area in square feet and the gallons of a state. */
const run = (state: State) => {
  const { outputs, shopping } = paint.compute(state);
  const { paintArea, gallons } = outputs;
  if (!isQuantityOf(paintArea, 'area') || !isQuantityOf(gallons, 'volume'))
    throw new Error('shape');
  return { area: valueIn(paintArea, ft2), gallons: valueIn(gallons, gal), cans: shopping[0]?.qty };
};

/** The paint area of a state in square feet, computed by hand: walls less openings, at least 0. */
const areaOf = ({ length, width, height, doors, windows }: State): Rational => {
  const walls = valueIn(length, ft)
    .add(valueIn(width, ft))
    .mul(valueIn(height, ft))
    .mul(Rational.of(2));
  const left = walls.sub(Rational.of(20 * doors + 15 * windows));
  return left.sign() === 1 ? left : Rational.ZERO;
};

describe('paint properties (calc-paint › Area and gallons)', () => {
  it('paints the walls less the openings, coats times over, at 350 ft² a gallon', () => {
    fc.assert(
      fc.property(paintStateArb, (state) => {
        const { area, gallons } = run(state);
        expect(area).toEqual(areaOf(state));
        expect(gallons).toEqual(areaOf(state).mul(Rational.of(state.coats)).div(Rational.of(350)));
      }),
      { numRuns },
    );
  });

  it('buys the fewest whole cans that hold the gallons', () => {
    fc.assert(
      fc.property(paintStateArb, (state) => {
        const { gallons, cans } = run(state);
        const whole = Rational.of(cans ?? -1n);
        expect(whole.compare(gallons)).toBeGreaterThanOrEqual(0);
        expect(whole.sub(Rational.ONE).compare(gallons)).toBeLessThan(0);
      }),
      { numRuns },
    );
  });
});

import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { boardFeetStateArb } from '../../__testing__/board-feet-arbitraries.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import { requireMoney } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { bdft, ft, ft3, inch } from '../../units/catalog.ts';
import { isQuantityOf, valueIn } from '../../units/quantity.ts';
import { boardFeet } from './index.ts';

/** The state `compute` takes: a validated record of the 5 inputs. */
type State = Parameters<typeof boardFeet.compute>[0];

/** The board feet of one piece by the lumber rule, thickness (in) × width (in) × length (ft) ÷ 12. */
const eachOf = ({ thickness, width, length }: State): Rational =>
  valueIn(thickness, inch).mul(valueIn(width, inch)).mul(valueIn(length, ft)).div(Rational.of(12));

describe('board feet properties (calc-board-feet › Board feet, volume and cost)', () => {
  it('gives the lumber rule per piece, times the pieces, a twelfth of a cubic foot each, at the price', () => {
    fc.assert(
      fc.property(boardFeetStateArb, (state) => {
        const { outputs } = boardFeet.compute(state);
        const { boardFeet: total, boardFeetEach: each, volumeFt3, cost } = outputs;
        if (!isQuantityOf(total, 'volume') || !isQuantityOf(each, 'volume'))
          throw new Error('shape');
        if (!isQuantityOf(volumeFt3, 'volume')) throw new Error('shape');
        const expected = eachOf(state).mul(Rational.of(state.pieces));
        expect(valueIn(each, bdft)).toEqual(eachOf(state));
        expect(valueIn(total, bdft)).toEqual(expected);
        expect(valueIn(volumeFt3, ft3).mul(Rational.of(12))).toEqual(expected);
        expect(requireMoney(cost)).toEqual(requireMoney(state.price).mul(expected));
      }),
      { numRuns },
    );
  });
});

import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { CONCRETE_YIELDS } from '../../__testing__/concrete-yields.ts';
import { fenceStateArb } from '../../__testing__/fence-arbitraries.ts';
import { numRuns } from '../../__testing__/property-runs.ts';
import { PI } from '../../geometry/pi.ts';
import { requireMoney } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { in3, inch } from '../../units/catalog.ts';
import { isQuantityOf, valueIn } from '../../units/quantity.ts';
import { createFence } from './index.ts';

const fence = createFence(CONCRETE_YIELDS);

type State = Parameters<typeof fence.compute>[0];

type LengthKey =
  'length' | 'height' | 'spacing' | 'boardWidth' | 'gap' | 'boardSpace' | 'postWidth';

const at = (state: State, key: LengthKey): Rational => valueIn(state[key], inch);

/** The counts by the rules of the spec, worked in plain inches. */
const countsOf = (state: State) => {
  const sections = at(state, 'length').div(at(state, 'spacing')).ceil();
  const posts = sections + 1n + BigInt(state.gates);
  const width = at(state, 'boardWidth');
  const boards = {
    rail: 0n,
    picket: at(state, 'length')
      .div(width.add(at(state, 'gap')))
      .ceil(),
    privacy: at(state, 'length')
      .mul(Rational.of(2))
      .div(width.add(at(state, 'boardSpace')))
      .ceil(),
  }[state.style];
  return { posts, rails: sections * BigInt(state.rails), boards };
};

describe('fence properties (calc-fence › Materials, Holes and cost)', () => {
  // spec: calc-fence › [FN15] every count, hole and cost follows the rules for any valid state
  it('counts posts, rails and boards, fills the holes and prices the lines', () => {
    fc.assert(
      fc.property(fenceStateArb, (state) => {
        const { outputs, shopping } = fence.compute(state);
        const { posts, rails, boards } = countsOf(state);
        const radius = at(state, 'postWidth').mul(Rational.of(3, 2));
        const hole = PI.mul(radius).mul(radius);
        const buried = at(state, 'height').div(Rational.of(2));
        const post = at(state, 'postWidth');
        const concrete = hole.sub(post.mul(post)).mul(buried).mul(Rational.of(posts));
        if (!isQuantityOf(outputs.concreteFt3, 'volume')) throw new Error('shape');
        if (!isQuantityOf(outputs.gravelFt3, 'volume')) throw new Error('shape');
        expect(valueIn(outputs.concreteFt3, in3)).toEqual(concrete);
        expect(valueIn(outputs.gravelFt3, in3)).toEqual(
          hole.mul(Rational.of(6)).mul(Rational.of(posts)),
        );
        const bags = concrete.div(valueIn(CONCRETE_YIELDS[`bag-${state.bag}`], in3)).ceil();
        expect(shopping.map(({ qty }) => qty)).toEqual([posts, rails, boards, bags]);
        expect(outputs.posts).toEqual(Rational.of(posts));
        expect(valueIn(outputs.holeDiameter, inch)).toEqual(post.mul(Rational.of(3)));
        expect(valueIn(outputs.holeDepth, inch)).toEqual(buried.add(Rational.of(6)));
        expect(valueIn(outputs.postLength, inch)).toEqual(at(state, 'height').add(buried));
        expect(requireMoney(outputs.postCost)).toEqual(
          requireMoney(state.postPrice).mul(Rational.of(posts)),
        );
        expect(requireMoney(outputs.railCost)).toEqual(
          requireMoney(state.railPrice).mul(Rational.of(rails)),
        );
        expect(requireMoney(outputs.boardCost)).toEqual(
          requireMoney(state.boardPrice).mul(Rational.of(boards)),
        );
        expect(requireMoney(outputs.bagCost)).toEqual(
          requireMoney(state.bagPrice).mul(Rational.of(bags)),
        );
      }),
      { numRuns },
    );
  });
});

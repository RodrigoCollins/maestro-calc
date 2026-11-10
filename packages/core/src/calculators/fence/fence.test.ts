import { describe, expect, it } from 'vitest';
import { CONCRETE_YIELDS } from '../../__testing__/concrete-yields.ts';
import { PI } from '../../geometry/pi.ts';
import { usd } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, ft3, in3, inch } from '../../units/catalog.ts';
import { isQuantityOf, quantity, valueIn } from '../../units/quantity.ts';
import { createFence } from './index.ts';

const fence = createFence(CONCRETE_YIELDS);

/** The result of a run; a failed run is a failed test. */
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = fence.run(raw);
  if (!result.ok) throw new Error(`run failed: ${JSON.stringify(result.errors)}`);
  return result.value;
};

const output = (raw: Readonly<Record<string, unknown>>, key: string): unknown =>
  ran(raw).outputs.find((found) => found.key === key)?.value;

/** The shopping quantities in the engine's order: posts, rails, boards, bags. */
const lines = (raw: Readonly<Record<string, unknown>>): bigint[] =>
  ran(raw).shopping.map(({ qty }) => qty);

const volumeIn = (raw: Readonly<Record<string, unknown>>, key: string, unit = in3): Rational => {
  const value = output(raw, key);
  if (!isQuantityOf(value, 'volume')) throw new Error(`${key} is not a volume`);
  return valueIn(value, unit);
};

const lengthIn = (raw: Readonly<Record<string, unknown>>, key: string, unit = inch): Rational => {
  const value = output(raw, key);
  if (!isQuantityOf(value, 'length')) throw new Error(`${key} is not a length`);
  return valueIn(value, unit);
};

/** `a·π − b` cubic inches, exact with the PI of core. */
const piLess = (a: number, b: number): Rational =>
  PI.mul(Rational.of(a * 16, 16)).sub(Rational.of(b));

describe('fence defaults (calc-fence › Inputs)', () => {
  // spec: calc-fence › [FN4] a 100 ft privacy fence, 6 ft high, posts every 8 ft, 4x4 posts
  it('reads the defaults', () => {
    const state = fence.validate({});
    expect(state.ok && state.value).toEqual({
      length: quantity(1200, inch),
      height: quantity(72, inch),
      spacing: quantity(96, inch),
      style: 'privacy',
      boardWidth: quantity(Rational.of(11, 2), inch),
      gap: quantity(Rational.of(5, 2), inch),
      boardSpace: quantity(4, inch),
      rails: 3,
      gates: 0,
      postWidth: quantity(Rational.of(7, 2), inch),
      postPrice: usd(0),
      railPrice: usd(0),
      boardPrice: usd(0),
      bagPrice: usd(0),
    });
  });
});

/*
 * Hand-verified, the default fence: 1,200 in ÷ 96 in = 12.5, so 13 sections and 14 posts; 13 × 3 =
 * 39 rails; board-on-board, each layer's 5.5 in boards stand 4 in apart, so two boards cover
 * 9.5 in: 2 × 1,200 ÷ 9.5 = 252.6, so 253 boards. The hole is 3 × 3.5 = 10.5 in wide; the post is buried half the height
 * above ground (a third of its length), 36 in, on 6 in of gravel: 42 in deep, and the post is
 * 72 + 36 = 108 in (9 ft) long. The concrete of a hole is (π × 5.25² − 3.5²) × 36 = 992.25π − 441
 * in³; 14 holes take 13,891.5π − 6,174 in³ = 21.68 ft³, ÷ 0.6 = 36.1, so 37 bags of 80 lb. The gravel is π × 5.25² × 6 = 165.375π in³ a hole, 2,315.25π in³ = 4.21 ft³.
 */
describe('the default fence (calc-fence › Materials, Holes)', () => {
  // spec: calc-fence › [FN5] posts, rails, boards and bags of the default fence
  it('gives 14 posts, 39 rails, 253 boards and 37 bags of 80 lb', () => {
    expect(output({}, 'posts')).toEqual(Rational.of(14));
    expect(lines({})).toEqual([14n, 39n, 253n, 37n]);
  });

  // spec: calc-fence › [FN6] the hole and the post of the default fence
  it('sizes a 10.5 in hole 42 in deep and a 9 ft post', () => {
    expect(lengthIn({}, 'holeDiameter')).toEqual(Rational.of(21, 2));
    expect(lengthIn({}, 'holeDepth')).toEqual(Rational.of(42));
    expect(lengthIn({}, 'postLength', ft)).toEqual(Rational.of(9));
  });

  // spec: calc-fence › [FN7] the concrete and the gravel of the holes, exact
  it('gives the concrete around the posts and the gravel under them', () => {
    expect(volumeIn({}, 'concreteFt3')).toEqual(piLess(13891.5, 6174));
    expect(volumeIn({}, 'gravelFt3')).toEqual(PI.mul(Rational.of(231525, 100)));
    expect(volumeIn({}, 'concreteFt3', ft3).toNumber()).toBeCloseTo(21.6825, 4);
    expect(volumeIn({}, 'gravelFt3', ft3).toNumber()).toBeCloseTo(4.2092, 4);
  });
});

describe('fence styles, lengths and gates (calc-fence › Materials)', () => {
  // spec: calc-fence › [FN8] the lengths of the cost page: 50, 100, 150 and 200 ft
  it.each([
    ['50ft', [8n, 21n, 127n, 21n]],
    ['100ft', [14n, 39n, 253n, 37n]],
    ['150ft', [20n, 57n, 379n, 52n]],
    ['200ft', [26n, 75n, 506n, 68n]],
  ])('gives a %s privacy fence its posts, rails, boards and bags', (length, expected) => {
    expect(lines({ length })).toEqual(expected);
  });

  // spec: calc-fence › [FN9] a 4 ft picket fence: pickets of 5.5 in with 2.5 in gaps cover 8 in
  it('counts pickets at their width plus the gap, and buries a 4 ft fence 24 in', () => {
    const raw = { style: 'picket', height: '4ft' };
    expect(lines(raw)).toEqual([14n, 39n, 150n, 25n]);
    expect(lengthIn(raw, 'holeDepth')).toEqual(Rational.of(30));
    expect(lengthIn(raw, 'postLength', ft)).toEqual(Rational.of(6));
  });

  // spec: calc-fence › [FN10] a rail fence has rails and no boards
  it('gives a rail fence no boards', () => {
    expect(lines({ style: 'rail', height: '4ft', rails: '2' })).toEqual([14n, 26n, 0n, 25n]);
  });

  // spec: calc-fence › [FN11] each gate adds a post and its hole
  it('adds one post and one hole per gate', () => {
    expect(lines({ gates: '2' })).toEqual([16n, 39n, 253n, 42n]);
  });

  // spec: calc-fence › [FN12] posts every 6 ft
  it('gives more posts and rails for posts every 6 ft', () => {
    expect(lines({ spacing: '6ft' })).toEqual([18n, 51n, 253n, 47n]);
  });

  it('counts a length that is a whole number of sections without an extra one', () => {
    expect(lines({ length: '96ft' })).toEqual([13n, 36n, 243n, 34n]);
  });
});

describe('fence cost (calc-fence › Cost)', () => {
  // spec: calc-fence › [FN13] each line at its price: $20 posts, $8 rails, $3 boards, $6 bags
  it('prices each line by its count', () => {
    const raw = { postPrice: '20', railPrice: '8', boardPrice: '3', bagPrice: '6' };
    expect(output(raw, 'postCost')).toEqual(usd(280));
    expect(output(raw, 'railCost')).toEqual(usd(312));
    expect(output(raw, 'boardCost')).toEqual(usd(759));
    expect(output(raw, 'bagCost')).toEqual(usd(222));
  });

  it('leaves every cost at zero with no price', () => {
    for (const key of ['postCost', 'railCost', 'boardCost', 'bagCost']) {
      expect(output({}, key)).toEqual(usd(0));
    }
  });
});

describe('fence validation (calc-fence › Validation)', () => {
  const rejected = (raw: Readonly<Record<string, unknown>>) => {
    const result = fence.run(raw);
    if (result.ok) throw new Error(`expected a rejection for ${JSON.stringify(raw)}`);
    return result.errors.map(({ field, code }) => [field, code]);
  };

  // spec: calc-fence › [FN14] the bounds that keep every division above zero
  it.each([
    [{ length: '0' }, ['length', 'BELOW_MIN']],
    [{ spacing: '0' }, ['spacing', 'BELOW_MIN']],
    [{ boardWidth: '0.5in' }, ['boardWidth', 'BELOW_MIN']],
    [{ boardSpace: '13in' }, ['boardSpace', 'ABOVE_MAX']],
    [{ rails: '0' }, ['rails', 'BELOW_MIN']],
    [{ gates: '51' }, ['gates', 'ABOVE_MAX']],
    [{ style: 'wire' }, ['style', 'UNKNOWN_OPTION']],
  ])('rejects %j', (raw, expected) => {
    expect(rejected(raw)).toEqual([expected]);
  });
});

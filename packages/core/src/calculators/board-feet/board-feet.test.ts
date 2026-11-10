import { describe, expect, it } from 'vitest';
import { usd } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { bdft, ft3, inch, m3 } from '../../units/catalog.ts';
import { isQuantityOf, quantity, valueIn } from '../../units/quantity.ts';
import { boardFeet } from './index.ts';

/** The result of a run; a failed run is a failed test. */
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = boardFeet.run(raw);
  if (!result.ok) throw new Error(`run failed: ${JSON.stringify(result.errors)}`);
  return result.value;
};

const output = (raw: Readonly<Record<string, unknown>>, key: string): unknown =>
  ran(raw).outputs.find((found) => found.key === key)?.value;

/** The exact value of a volume output in a unit (board feet unless named). */
const volume = (raw: Readonly<Record<string, unknown>>, key: string, unit = bdft): Rational => {
  const value = output(raw, key);
  if (!isQuantityOf(value, 'volume')) throw new Error(`${key} is not a volume`);
  return valueIn(value, unit);
};

/** A piece of `thickness` by `width` inches and `length` feet, as a visitor types it. */
const piece = (thickness: string, width: string, length: string) => ({
  thickness: `${thickness}in`,
  width: `${width}in`,
  length: `${length}ft`,
});

describe('board feet defaults (calc-board-feet › Inputs)', () => {
  // spec: calc-board-feet › [BF1] one 2 in by 4 in piece, 8 ft long, with no price
  it('reads the defaults', () => {
    const state = boardFeet.validate({});
    expect(state.ok && state.value).toEqual({
      thickness: quantity(2, inch),
      width: quantity(4, inch),
      length: quantity(96, inch),
      pieces: 1,
      price: usd(0),
    });
  });
});

/*
 * Hand-verified (DOC PS 20-20, 2.2 Board measure: thickness in inches × width in feet × length in
 * feet): a 2x4x8 is 2 × 4/12 × 8 = 16/3 = 5.33 board feet, 16/3 ÷ 12 = 4/9 ft³ (0.44) and
 * 4/9 × 0.028316846592 = 0.012585… m³ (0.013); a 2x6x10 is 2 × 6 × 10 / 12 = 10; a 4x4x8 is
 * 128/12 = 32/3 (10.67); a 1x6x8 is 48/12 = 4; a 2x12 12 ft long is 288/12 = 24; the actual dry
 * size of a 2x4x8, 1 1/2 by 3 1/2 in (PS 20-20, Table 3), is 42/12 = 3.5; a 1x8 10 ft long is
 * 80/12 = 20/3 (6.67).
 */
describe('board feet of a piece (calc-board-feet › Board feet, volume and cost)', () => {
  // spec: calc-board-feet › [BF2] the default 2x4x8
  it('gives 5.33 board feet for a 2x4x8, 0.44 cubic feet and 0.013 cubic meters', () => {
    expect(volume({}, 'boardFeet')).toEqual(Rational.of(16, 3));
    expect(volume({}, 'boardFeetEach')).toEqual(Rational.of(16, 3));
    expect(volume({}, 'volumeFt3', ft3)).toEqual(Rational.of(4, 9));
    expect(Number(volume({}, 'volumeM3', m3).toNumber().toFixed(3))).toBe(0.013);
  });

  // spec: calc-board-feet › [BF3] the common nominal sizes of the question pages
  it.each([
    ['2', '6', '10', Rational.of(10)],
    ['4', '4', '8', Rational.of(32, 3)],
    ['1', '6', '8', Rational.of(4)],
    ['2', '12', '12', Rational.of(24)],
    ['1.5', '3.5', '8', Rational.of(7, 2)],
    ['1', '8', '10', Rational.of(20, 3)],
  ])(
    'gives a %s by %s in piece %s ft long its board feet',
    (thickness, width, length, expected) => {
      expect(volume(piece(thickness, width, length), 'boardFeet')).toEqual(expected);
    },
  );

  it('gives no board feet for a piece of no thickness', () => {
    expect(volume({ thickness: '0' }, 'boardFeet')).toEqual(Rational.ZERO);
  });
});

describe('board feet of a lot and its cost (calc-board-feet › Board feet, volume and cost)', () => {
  // spec: calc-board-feet › [BF4] ten 2x4x8 at $1.50 a board foot: 160/3 board feet, $80
  it('multiplies by the pieces and prices the total', () => {
    const raw = { pieces: '10', price: '1.50' };
    expect(volume(raw, 'boardFeet')).toEqual(Rational.of(160, 3));
    expect(volume(raw, 'boardFeetEach')).toEqual(Rational.of(16, 3));
    expect(output(raw, 'cost')).toEqual(usd(80));
  });

  // spec: calc-board-feet › [BF5] the cost stays exact: one 2x4x8 at $2 is 32/3 dollars ($10.67)
  it('keeps the cost exact and leaves it at zero with no price', () => {
    expect(output({ price: '2' }, 'cost')).toEqual(usd(Rational.of(32, 3)));
    expect(output({}, 'cost')).toEqual(usd(0));
  });
});

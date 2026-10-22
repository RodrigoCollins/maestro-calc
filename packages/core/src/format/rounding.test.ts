import { describe, expect, it } from 'vitest';
import { thrownCode } from '../__testing__/thrown-code.ts';
import { Rational } from '../rational/rational.ts';
import { roundToFraction, type RoundingMode } from './rounding.ts';

const MODES: readonly RoundingMode[] = ['nearest', 'up', 'down'];

// Hand-verified with exact fractions (v x d floor/ceil/half-away), then checked against the spec.
// spec: fraction-format › Fraction rounding policy (table, inches)
const TABLE: readonly (readonly [string, number, number, number, number])[] = [
  // value, denominator, nearest, up, down
  ['1/128', 64, 1, 1, 0],
  ['-1/128', 64, -1, 0, -1],
  ['3/128', 64, 2, 2, 1],
  ['-3/128', 64, -2, -1, -2],
  ['1/3', 16, 5, 6, 5],
  ['2/3', 16, 11, 11, 10],
  ['-1/3', 16, -5, -5, -6],
  ['3/4', 16, 12, 12, 12],
  ['5/4', 2, 3, 3, 2],
  ['1/2', 3, 2, 2, 1],
  ['0', 7, 0, 0, 0],
];

const rational = (text: string): Rational => {
  const parsed = Rational.fromString(text);
  if (!parsed.ok) throw new Error(`bad fixture ${text}`);
  return parsed.value;
};

describe('roundToFraction (fraction-format › Fraction rounding policy)', () => {
  // spec: Directed modes on ties and non-ties [FF2]
  it.each(TABLE)('rounds %s at denominator %i: nearest %i, up %i, down %i', (text, d, ...ticks) => {
    expect(MODES.map((mode) => roundToFraction(rational(text), d, mode))).toEqual(
      ticks.map(BigInt),
    );
  });

  // spec: Tie at 1/128 inch rounds away from zero [FF1]
  it('rounds the tie at 1/128 away from zero in both signs', () => {
    expect(roundToFraction(Rational.of(1, 128), 64, 'nearest')).toBe(1n);
    expect(roundToFraction(Rational.of(-1, 128), 64, 'nearest')).toBe(-1n);
  });

  // spec: Non-power-of-two denominator [FF3]
  it('rounds 1/2 at denominator 3 to k = 2 (the value 2/3)', () => {
    expect(roundToFraction(Rational.of(1, 2), 3, 'nearest')).toBe(2n);
  });

  it('uses nearest when no mode is given', () => {
    expect(roundToFraction(Rational.of(1, 128), 64)).toBe(1n);
    expect(roundToFraction(Rational.of(-1, 3), 16)).toBe(-5n);
  });

  // spec: Invalid denominators [FF4]
  it.each([0, 1, 65, -2, 2.5, Number.NaN, Number.POSITIVE_INFINITY, -64])(
    'rejects denominator %s with INVALID_DENOMINATOR',
    (denominator) => {
      expect(thrownCode(() => roundToFraction(Rational.ONE, denominator))).toBe(
        'INVALID_DENOMINATOR',
      );
    },
  );

  // spec: Invalid rounding mode: an own-property lookup, so inherited names are rejected too
  it.each(['toString', 'constructor', '__proto__', 'banana', ''])(
    'rejects mode %j with INVALID_MODE',
    (mode) => {
      expect(thrownCode(() => roundToFraction(Rational.ONE, 4, mode as RoundingMode))).toBe(
        'INVALID_MODE',
      );
    },
  );

  it('checks the denominator before the mode', () => {
    expect(thrownCode(() => roundToFraction(Rational.ONE, 1, 'banana' as RoundingMode))).toBe(
      'INVALID_DENOMINATOR',
    );
  });

  // spec: Invalid denominators [FF4] (boundaries are inclusive)
  it('accepts the boundary denominators 2 and 64', () => {
    expect(roundToFraction(Rational.of(1, 4), 2)).toBe(1n);
    expect(roundToFraction(Rational.of(1, 4), 64)).toBe(16n);
  });

  // spec: A value that is already a multiple is returned unchanged in every mode
  it.each(MODES)('keeps a multiple of 1/d unchanged in %s mode', (mode) => {
    expect(roundToFraction(Rational.of(3, 4), 16, mode)).toBe(12n);
    expect(roundToFraction(Rational.of(-3, 4), 16, mode)).toBe(-12n);
    expect(roundToFraction(Rational.of(7), 5, mode)).toBe(35n);
  });

  it('handles magnitudes far beyond a double', () => {
    // value = 10^30 + 1/3
    const value = Rational.of(3n * 10n ** 30n + 1n, 3n);
    expect(roundToFraction(value, 3, 'nearest')).toBe(3n * 10n ** 30n + 1n);
    // 2 x (10^30 + 1/3) = 2 x 10^30 + 2/3 rounds to the next integer
    expect(roundToFraction(value, 2, 'nearest')).toBe(2n * 10n ** 30n + 1n);
    // floor(-64 x 10^30 / 7)
    expect(roundToFraction(Rational.of(-(10n ** 30n), 7n), 64, 'down')).toBe(
      -9142857142857142857142857142858n,
    );
  });
});

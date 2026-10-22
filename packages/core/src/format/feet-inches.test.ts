import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { rationalArb } from '../__testing__/arbitraries.ts';
import { numRuns } from '../__testing__/property-runs.ts';
import { thrownCode } from '../__testing__/thrown-code.ts';
import { Rational } from '../rational/rational.ts';
import { ft, in2, inch } from '../units/catalog.ts';
import { add } from '../units/ops.ts';
import { quantity, type Quantity } from '../units/quantity.ts';
import { formatFeetInches } from './feet-inches.ts';
import { roundToFraction, type RoundingMode } from './rounding.ts';

const inches = (value: Rational): Quantity<'length'> => quantity(value, inch);
// `exactOptionalPropertyTypes` forbids `{ mode: undefined }`, so an absent mode omits the key.
const text = (value: Rational, denominator: number, mode?: RoundingMode): string =>
  formatFeetInches(inches(value), mode === undefined ? { denominator } : { denominator, mode })
    .text;

describe('formatFeetInches (fraction-format › Feet-inch-fraction formatting)', () => {
  // Every expected value below was recomputed with exact fractions (round the signed total in
  // ticks, then split into feet, inches and a reduced fraction) before it was written down.

  // spec: Mixed number [FF12]
  it('formats 127/2 in at denominator 16 as a mixed number with parts', () => {
    expect(formatFeetInches(inches(Rational.of(127, 2)), { denominator: 16 })).toEqual({
      text: `5' 3 1/2"`,
      parts: {
        negative: false,
        feet: 5n,
        inches: 3n,
        fraction: { numerator: 1n, denominator: 2n },
      },
    });
  });

  // spec: Carry at the foot boundary (11 15/16" + 1/16") [FF13]
  it('carries from inches into feet when the sum reaches a foot', () => {
    expect(text(Rational.of(191, 16), 16)).toBe(`0' 11 15/16"`);
    const sum = add(inches(Rational.of(191, 16)), inches(Rational.of(1, 16)));
    expect(formatFeetInches(sum, { denominator: 16 }).text).toBe(`1' 0"`);
  });

  // spec: Rounding carries across inch and foot [FF14]
  it('rounds ties up across the inch and foot boundaries', () => {
    expect(text(Rational.of(383, 32), 16)).toBe(`1' 0"`);
    expect(text(Rational.of(9215, 64), 32)).toBe(`12' 0"`);
    expect(text(Rational.of(9215, 64), 64)).toBe(`11' 11 63/64"`);
  });

  // spec: Zero [FF15]
  it('formats zero as 0\' 0" without a sign at any denominator', () => {
    for (const denominator of [2, 7, 64]) {
      expect(formatFeetInches(inches(Rational.ZERO), { denominator })).toEqual({
        text: `0' 0"`,
        parts: {
          negative: false,
          feet: 0n,
          inches: 0n,
          fraction: { numerator: 0n, denominator: 1n },
        },
      });
    }
  });

  // spec: Negative values [FF16]
  it('puts the sign in front of the feet and rounds ties away from zero', () => {
    expect(formatFeetInches(inches(Rational.of(-127, 2)), { denominator: 16 })).toEqual({
      text: `-5' 3 1/2"`,
      parts: {
        negative: true,
        feet: 5n,
        inches: 3n,
        fraction: { numerator: 1n, denominator: 2n },
      },
    });
    expect(text(Rational.of(-1, 128), 64)).toBe(`-0' 1/64"`);
    expect(text(Rational.of(-23).sub(Rational.of(1, 2)), 2)).toBe(`-1' 11 1/2"`);
    expect(text(Rational.of(-12), 2)).toBe(`-1' 0"`);
  });

  // spec: No negative zero [FF17]
  it('reports no negative zero when a small negative value rounds to zero', () => {
    const formatted = formatFeetInches(inches(Rational.of(-1, 200)), { denominator: 64 });
    expect(formatted.text).toBe(`0' 0"`);
    expect(formatted.parts.negative).toBe(false);
  });

  // spec: Exact feet and large values [FF18]
  it('formats exact feet and values beyond 100 feet', () => {
    expect(text(Rational.of(144), 2)).toBe(`12' 0"`);
    expect(text(Rational.of(2401, 2), 2)).toBe(`100' 1/2"`);
    // 10^14 in = 8333333333333 ft 4 in; far beyond a double's exact integer range for ticks
    expect(text(Rational.of(10n ** 14n), 64)).toBe(`8333333333333' 4"`);
  });

  // spec: Reduced fractions and non-binary denominators [FF19]
  it('reduces the fraction and accepts non-binary denominators', () => {
    expect(text(Rational.of(3, 4), 8)).toBe(`0' 3/4"`);
    expect(text(Rational.of(1, 2), 3)).toBe(`0' 2/3"`);
    expect(text(Rational.of(1537, 64), 64)).toBe(`2' 1/64"`);
  });

  // spec: Directed modes [FF20]
  it('applies the directed modes to the signed total', () => {
    expect(text(Rational.of(1, 128), 64, 'up')).toBe(`0' 1/64"`);
    expect(text(Rational.of(1, 128), 64, 'down')).toBe(`0' 0"`);
    expect(text(Rational.of(-1, 128), 64, 'up')).toBe(`0' 0"`);
    expect(text(Rational.of(-1, 128), 64, 'down')).toBe(`-0' 1/64"`);
  });

  // spec: Thirds of a foot [FF21]
  it('converts other length units before rounding', () => {
    expect(formatFeetInches(quantity(Rational.of(1, 3), ft), { denominator: 16 }).text).toBe(
      `0' 4"`,
    );
    expect(text(Rational.of(1, 3), 16)).toBe(`0' 5/16"`);
  });

  // spec: Fraction rounding policy — INVALID_DENOMINATOR [FF4]
  it.each([0, 1, 65, 2.5, Number.NaN])('rejects denominator %s', (denominator) => {
    expect(thrownCode(() => formatFeetInches(inches(Rational.ONE), { denominator }))).toBe(
      'INVALID_DENOMINATOR',
    );
  });

  // units-quantities › Same-dimension arithmetic: runtime guard for untyped callers
  it('rejects a quantity that is not a length', () => {
    const area = quantity(1, in2) as unknown as Quantity<'length'>;
    expect(thrownCode(() => formatFeetInches(area, { denominator: 16 }))).toBe(
      'DIMENSION_MISMATCH',
    );
  });

  // spec: Invalid rounding mode (checked by the shared kernel)
  it('rejects an unknown mode with INVALID_MODE', () => {
    expect(
      thrownCode(() =>
        formatFeetInches(inches(Rational.ONE), {
          denominator: 16,
          mode: 'toString' as RoundingMode,
        }),
      ),
    ).toBe('INVALID_MODE');
  });

  // spec: Feet-inch-fraction formatting — parts recompose to the signed rounded total
  it('recomposes to the rounded total with 0 <= inches <= 11 and a reduced fraction', () => {
    fc.assert(
      fc.property(
        rationalArb,
        fc.integer({ min: 2, max: 64 }),
        fc.constantFrom('nearest', 'up', 'down'),
        (value, denominator, mode) => {
          const {
            negative,
            feet,
            inches: whole,
            fraction,
          } = formatFeetInches(inches(value), {
            denominator,
            mode,
          }).parts;
          const reduced = Rational.of(fraction.numerator, fraction.denominator);
          const magnitude = Rational.of(feet * 12n + whole).add(reduced);
          const ticks = roundToFraction(value, denominator, mode);
          return (
            whole >= 0n &&
            whole <= 11n &&
            fraction.numerator >= 0n &&
            fraction.numerator < fraction.denominator &&
            reduced.num === fraction.numerator &&
            reduced.den === fraction.denominator &&
            (negative ? magnitude.neg() : magnitude).equals(Rational.of(ticks, denominator)) &&
            (!negative || ticks < 0n)
          );
        },
      ),
      { numRuns },
    );
  });
});

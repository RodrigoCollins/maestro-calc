import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { rationalArb } from '../__testing__/arbitraries.ts';
import { numRuns } from '../__testing__/property-runs.ts';
import { thrownCode } from '../__testing__/thrown-code.ts';
import { Rational } from '../rational/rational.ts';
import { toDecimalParts, type DecimalParts } from './decimal-parts.ts';
import type { RoundingMode } from './rounding.ts';

const MODES: readonly RoundingMode[] = ['nearest', 'up', 'down'];

const rational = (text: string): Rational => {
  const parsed = Rational.fromString(text);
  if (!parsed.ok) throw new Error(`bad fixture ${text}`);
  return parsed.value;
};

/** `[-]integer[.fraction]`, the readable form the spec table uses. */
const render = ({ negative, integer, fraction }: DecimalParts): string =>
  `${negative ? '-' : ''}${String(integer)}${fraction === '' ? '' : `.${fraction}`}`;

// Hand-verified with exact fractions (v x 10^p, then floor/ceil/half-away), then checked against
// the spec. spec: fraction-format › Decimal display rounding (table)
const TABLE: readonly (readonly [string, number, string, string, string])[] = [
  // value, places, nearest, up, down
  ['1/3', 2, '0.33', '0.34', '0.33'],
  ['2/3', 2, '0.67', '0.67', '0.66'],
  ['1/8', 2, '0.13', '0.13', '0.12'],
  ['-1/8', 2, '-0.13', '-0.12', '-0.13'],
  ['5/2', 0, '3', '3', '2'],
  ['-5/2', 0, '-3', '-2', '-3'],
  ['1/20', 1, '0.1', '0.1', '0.0'],
  ['-1/1000', 2, '0.00', '0.00', '-0.01'],
  ['145161/12500', 2, '11.61', '11.62', '11.61'],
  ['145161/12500', 4, '11.6129', '11.6129', '11.6128'],
  ['7', 3, '7.000', '7.000', '7.000'],
];

describe('toDecimalParts (fraction-format › Decimal display rounding)', () => {
  // spec: Decimal table [FF6]
  it.each(TABLE)(
    'renders %s at %i places: nearest %s, up %s, down %s',
    (text, places, ...cells) => {
      expect(MODES.map((mode) => render(toDecimalParts(rational(text), places, mode)))).toEqual(
        cells,
      );
    },
  );

  // spec: Decimal table [FF6] (exact parts)
  it('returns exact parts', () => {
    expect(toDecimalParts(Rational.of(-1, 8), 2, 'nearest')).toEqual({
      negative: true,
      integer: 0n,
      fraction: '13',
    });
    expect(toDecimalParts(Rational.of(7), 3, 'nearest')).toEqual({
      negative: false,
      integer: 7n,
      fraction: '000',
    });
    expect(toDecimalParts(rational('145161/12500'), 2, 'up')).toEqual({
      negative: false,
      integer: 11n,
      fraction: '62',
    });
  });

  it('uses nearest when no mode is given', () => {
    expect(render(toDecimalParts(Rational.of(1, 8), 2))).toBe('0.13');
    expect(render(toDecimalParts(Rational.of(-1, 8), 2))).toBe('-0.13');
  });

  // spec: No negative zero in decimals [FF7]
  it('never reports a negative zero', () => {
    const tiny = Rational.of(-1, 1000);
    expect(toDecimalParts(tiny, 2, 'nearest')).toEqual({
      negative: false,
      integer: 0n,
      fraction: '00',
    });
    expect(toDecimalParts(tiny, 2, 'up')).toEqual({ negative: false, integer: 0n, fraction: '00' });
    expect(toDecimalParts(tiny, 2, 'down')).toEqual({
      negative: true,
      integer: 0n,
      fraction: '01',
    });
    expect(toDecimalParts(Rational.ZERO, 3, 'down')).toEqual({
      negative: false,
      integer: 0n,
      fraction: '000',
    });
  });

  // spec: Places boundaries [FF8]
  it('keeps exactly `places` digits at the boundaries', () => {
    expect(toDecimalParts(Rational.of(1, 3), 12, 'nearest')).toEqual({
      negative: false,
      integer: 0n,
      fraction: '333333333333',
    });
    expect(toDecimalParts(Rational.of(5, 2), 0, 'nearest')).toEqual({
      negative: false,
      integer: 3n,
      fraction: '',
    });
    expect(toDecimalParts(Rational.of(1, 3), 0, 'nearest')).toEqual({
      negative: false,
      integer: 0n,
      fraction: '',
    });
  });

  it('is exact beyond a double (never passes through number)', () => {
    // 10^25 + 1/3 at 3 places: 10^25 . 333
    expect(render(toDecimalParts(Rational.of(3n * 10n ** 25n + 1n, 3n), 3, 'nearest'))).toBe(
      `1${'0'.repeat(25)}.333`,
    );
  });

  // spec: Places boundaries [FF8]
  it.each([-1, 13, 1.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects places %s with INVALID_PLACES',
    (places) => {
      expect(thrownCode(() => toDecimalParts(Rational.ONE, places, 'nearest'))).toBe(
        'INVALID_PLACES',
      );
    },
  );

  it('accepts the boundary places 0 and 12', () => {
    expect(thrownCode(() => toDecimalParts(Rational.ONE, 0, 'nearest'))).toBeUndefined();
    expect(thrownCode(() => toDecimalParts(Rational.ONE, 12, 'nearest'))).toBeUndefined();
  });

  // spec: Invalid rounding mode (the kernel rejects inherited names such as `toString` as well)
  it.each(['toString', 'banana'])('rejects mode %j with INVALID_MODE', (mode) => {
    expect(thrownCode(() => toDecimalParts(Rational.ONE, 2, mode as RoundingMode))).toBe(
      'INVALID_MODE',
    );
  });

  // spec: Decimal display rounding (properties, mirroring rounding.property.test.ts)
  describe('properties', () => {
    const reassemble = (
      { negative, integer, fraction }: DecimalParts,
      places: number,
    ): Rational => {
      const scale = 10n ** BigInt(places);
      const magnitude = integer * scale + BigInt(fraction === '' ? '0' : fraction);
      return Rational.of(negative ? -magnitude : magnitude, scale);
    };
    const forAll = (check: (x: Rational, places: number) => boolean): void => {
      fc.assert(
        fc.property(rationalArb, fc.integer({ min: 0, max: 12 }), (x, places) => check(x, places)),
        { numRuns },
      );
    };

    it('writes exactly `places` digits in every mode', () => {
      forAll((x, places) =>
        MODES.every((mode) => toDecimalParts(x, places, mode).fraction.length === places),
      );
    });

    it('lands within half a unit in the last place in nearest mode', () => {
      forAll((x, places) => {
        const error = x.sub(reassemble(toDecimalParts(x, places, 'nearest'), places)).abs();
        return error.compare(Rational.of(1, 2n * 10n ** BigInt(places))) <= 0;
      });
    });

    it('brackets the value: down <= x <= up, at most one unit apart, nearest between', () => {
      forAll((x, places) => {
        const down = reassemble(toDecimalParts(x, places, 'down'), places);
        const up = reassemble(toDecimalParts(x, places, 'up'), places);
        const nearest = reassemble(toDecimalParts(x, places, 'nearest'), places);
        const gap = up.sub(down);
        return (
          down.compare(x) <= 0 &&
          x.compare(up) <= 0 &&
          (gap.sign() === 0 || gap.compare(Rational.of(1, 10n ** BigInt(places))) === 0) &&
          down.compare(nearest) <= 0 &&
          nearest.compare(up) <= 0
        );
      });
    });
  });
});

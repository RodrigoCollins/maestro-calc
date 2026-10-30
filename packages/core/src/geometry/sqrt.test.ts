import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { numRuns } from '../__testing__/property-runs.ts';
import { CoreError } from '../errors.ts';
import { Rational } from '../rational/rational.ts';
import { SQRT_PLACES, squareRoot } from './sqrt.ts';

const ULP = Rational.of(1n, 10n ** BigInt(SQRT_PLACES));

describe('squareRoot (core-geometry › Square root)', () => {
  it('keeps twenty decimals', () => {
    expect(SQRT_PLACES).toBe(20);
  });

  it('is exact for a perfect square', () => {
    expect(squareRoot(Rational.ZERO)).toEqual(Rational.ZERO);
    expect(squareRoot(Rational.of(4))).toEqual(Rational.of(2));
    expect(squareRoot(Rational.of(1, 4))).toEqual(Rational.of(1, 2));
    expect(squareRoot(Rational.of(169, 100))).toEqual(Rational.of(13, 10));
    // the smallest scaled values: 10^-40 · 1, 2 and 4 have the roots 10^-20 · 1, 1 and 2
    expect(squareRoot(Rational.of(1n, 10n ** 40n))).toEqual(ULP);
    expect(squareRoot(Rational.of(2n, 10n ** 40n))).toEqual(ULP);
    expect(squareRoot(Rational.of(4n, 10n ** 40n))).toEqual(ULP.mul(Rational.of(2)));
  });

  // √2 = 1.41421356237309504880 168…, √1.25 = 1.11803398874989484820 458…
  it('truncates an irrational root to twenty decimals', () => {
    expect(squareRoot(Rational.of(2))).toEqual(Rational.of(141421356237309504880n, 10n ** 20n));
    expect(squareRoot(Rational.of(5, 4))).toEqual(Rational.of(111803398874989484820n, 10n ** 20n));
  });

  // the bound: r ≤ √x < r + 10^-20, so r² ≤ x < (r + 10^-20)²
  it('is never above the root and less than 10^-20 below it', () => {
    fc.assert(
      fc.property(
        fc.bigInt({ min: 0n, max: 10n ** 12n }),
        fc.bigInt({ min: 1n, max: 10n ** 6n }),
        (num, den) => {
          const x = Rational.of(num, den);
          const r = squareRoot(x);
          expect(r.mul(r).compare(x)).toBeLessThanOrEqual(0);
          const above = r.add(ULP);
          expect(above.mul(above).compare(x)).toBeGreaterThan(0);
        },
      ),
      { numRuns },
    );
  });

  it('refuses a negative number', () => {
    expect(() => squareRoot(Rational.of(-1))).toThrow(CoreError);
    expect(() => squareRoot(Rational.of(-1))).toThrow('NEGATIVE_QUANTITY');
  });
});

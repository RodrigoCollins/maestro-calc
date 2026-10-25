import { describe, expect, it } from 'vitest';
import { Rational } from '../rational/rational.ts';
import { PI } from './pi.ts';

describe('PI (core-geometry › Rational pi)', () => {
  // spec: core-geometry › [GEO1] Exact value
  it('is the first 35 decimals of pi as an exact Rational', () => {
    expect(PI.equals(Rational.of(314159265358979323846264338327950288n, 10n ** 35n))).toBe(true);
  });

  // spec: core-geometry › [GEO2] Error bound against a longer literal
  it('undershoots a 40-decimal pi by less than 10^-35', () => {
    const longer = Rational.of(31415926535897932384626433832795028841971n, 10n ** 40n);
    const error = longer.sub(PI);
    expect(error.equals(Rational.of(41971n, 10n ** 40n))).toBe(true);
    expect(error.compare(Rational.ZERO)).toBe(1);
    expect(error.compare(Rational.of(1n, 10n ** 35n))).toBe(-1);
  });
});

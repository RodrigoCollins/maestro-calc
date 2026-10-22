import * as fc from 'fast-check';
import { describe, it } from 'vitest';
import { rationalArb } from '../__testing__/arbitraries.ts';
import { numRuns } from '../__testing__/property-runs.ts';
import { Rational } from '../rational/rational.ts';
import { roundToFraction } from './rounding.ts';

const denominatorArb = fc.integer({ min: 2, max: 64 });

const forAll = (check: (x: Rational, d: number) => boolean): void => {
  // fast-check prints the seed and the counterexample when a property fails.
  fc.assert(
    fc.property(rationalArb, denominatorArb, (x, d) => check(x, d)),
    { numRuns },
  );
};

const tick = (k: bigint, d: number): Rational => Rational.of(k, d);

describe('roundToFraction properties (fraction-format › Idempotence and symmetry properties)', () => {
  // spec: Idempotence and symmetry properties [FF5]
  it('is idempotent: rounding a rounded value returns the same tick', () => {
    forAll((x, d) => {
      const k = roundToFraction(x, d, 'nearest');
      return roundToFraction(tick(k, d), d, 'nearest') === k;
    });
  });

  it('is odd in nearest mode: round(-x) = -round(x)', () => {
    forAll((x, d) => roundToFraction(x.neg(), d, 'nearest') === -roundToFraction(x, d, 'nearest'));
  });

  it('lands within half a tick in nearest mode', () => {
    forAll((x, d) => {
      const error = x.sub(tick(roundToFraction(x, d, 'nearest'), d)).abs();
      return error.compare(Rational.of(1, 2 * d)) <= 0;
    });
  });

  it('brackets the value: down <= x <= up, at most one tick apart', () => {
    forAll((x, d) => {
      const down = roundToFraction(x, d, 'down');
      const up = roundToFraction(x, d, 'up');
      return (
        tick(down, d).compare(x) <= 0 &&
        x.compare(tick(up, d)) <= 0 &&
        (up - down === 0n || up - down === 1n)
      );
    });
  });

  it('keeps the nearest tick between down and up', () => {
    forAll((x, d) => {
      const nearest = roundToFraction(x, d, 'nearest');
      return roundToFraction(x, d, 'down') <= nearest && nearest <= roundToFraction(x, d, 'up');
    });
  });
});

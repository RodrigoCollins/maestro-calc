import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { numRuns } from '../__testing__/property-runs.ts';
import { Rational } from '../rational/rational.ts';
import { ATAN_PLACES, arctangentDegrees } from './atan.ts';

/** |a − b| < 10^-places. */
const within = (a: Rational, b: Rational, places = ATAN_PLACES) =>
  a
    .sub(b)
    .abs()
    .compare(Rational.of(1n, 10n ** BigInt(places))) < 0;

const decimal = (text: string): Rational => {
  const [whole = '', fraction = ''] = text.split('.');
  return Rational.of(BigInt(whole + fraction), 10n ** BigInt(fraction.length));
};

describe('arctangentDegrees (core-geometry › Arctangent)', () => {
  it('keeps twenty decimals of a degree', () => {
    expect(ATAN_PLACES).toBe(20);
  });

  it('is zero at zero and odd', () => {
    expect(arctangentDegrees(Rational.ZERO)).toEqual(Rational.ZERO);
    expect(arctangentDegrees(Rational.of(-1, 2))).toEqual(
      arctangentDegrees(Rational.of(1, 2)).neg(),
    );
  });

  // references to 24 decimals (computed with 60-digit decimal arithmetic): the roof pitches
  // 1, 2, 2½, 3, 4, 6, 7, 12 and 24 in 12
  it.each([
    ['1/12', '4.763641690726177581327327'],
    ['2/12', '9.462322208025617391140070'],
    ['5/24', '11.768288932020644543488152'],
    ['3/12', '14.036243467926478582892320'],
    ['4/12', '18.434948822922010648427806'],
    ['6/12', '26.565051177077989351572193'],
    ['7/12', '30.256437163529264838608545'],
    ['12/12', '45'],
    ['24/12', '63.434948822922010648427806'],
  ])('gives atan(%s) to twenty decimals', (ratio, degrees) => {
    const [rise = '', run = ''] = ratio.split('/');
    expect(
      within(arctangentDegrees(Rational.of(BigInt(rise), BigInt(run))), decimal(degrees)),
    ).toBe(true);
  });

  it('adds up to 90 degrees with the reciprocal, and grows with the slope', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100_000 }),
        fc.integer({ min: 1, max: 100_000 }),
        (rise, run) => {
          const t = Rational.of(rise, run);
          const a = arctangentDegrees(t);
          expect(
            within(a.add(arctangentDegrees(Rational.of(run, rise))), Rational.of(90), 19),
          ).toBe(true);
          expect(a.sign()).toBe(1);
          expect(a.compare(Rational.of(90))).toBe(-1);
          expect(arctangentDegrees(Rational.of(rise + 1, run)).compare(a)).toBe(1);
        },
      ),
      { numRuns },
    );
  });
});

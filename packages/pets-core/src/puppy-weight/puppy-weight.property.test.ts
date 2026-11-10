import { Rational } from '@maestro-calc/core';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { puppyWeight, PUPPY_SIZES, shareAt } from './puppy-weight.ts';

const numRuns = 100;

/** An age of 6 to 104 weeks, to the tenth. */
const weeks = fc.integer({ min: 60, max: 1_040 }).map((tenths) => Rational.of(tenths, 10));

/** A weight of 0.5 to 250, to the tenth. */
const weights = fc.integer({ min: 5, max: 2_500 }).map((tenths) => Rational.of(tenths, 10));

const sizes = fc.constantFrom(...PUPPY_SIZES);

const text = (value: Rational): string => value.toNumber().toString();

const figures = (raw: Readonly<Record<string, unknown>>): Map<string, Rational> => {
  const result = puppyWeight.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return new Map(
    result.value.outputs.map(({ key, value }) => {
      if (!(value instanceof Rational)) throw new Error(`${key} is not a number`);
      return [key, value];
    }),
  );
};

const at = (out: Map<string, Rational>, key: string): Rational => {
  const value = out.get(key);
  if (value === undefined) throw new Error(key);
  return value;
};

const monthsOf = (age: Rational): Rational => age.mul(Rational.of(12, 52));

describe('puppy-weight properties', () => {
  it('gives back the weight now, exactly, as the share of the adult weight', () => {
    fc.assert(
      fc.property(weights, weeks, sizes, (weight, age, size) => {
        const out = figures({ weight: text(weight), age: text(age), size });
        const share = at(out, 'share').div(Rational.of(100));
        expect(at(out, 'adult').mul(share).equals(weight)).toBe(true);
        expect(at(out, 'months').equals(monthsOf(age))).toBe(true);
      }),
      { numRuns },
    );
  });

  it('never lets a share go back as a puppy ages, nor past 100%', () => {
    fc.assert(
      fc.property(weeks, weeks, sizes, (a, b, size) => {
        const [young, old] = a.compare(b) !== 1 ? [a, b] : [b, a];
        const first = shareAt(monthsOf(young), size);
        const second = shareAt(monthsOf(old), size);
        expect(first.compare(second)).not.toBe(1);
        expect(second.compare(Rational.ONE)).not.toBe(1);
      }),
      { numRuns },
    );
  });

  it('keeps the estimate inside its range, and the bigger class above the smaller', () => {
    fc.assert(
      fc.property(weights, weeks, sizes, (weight, age, size) => {
        const out = figures({ weight: text(weight), age: text(age), size });
        expect(at(out, 'low').compare(at(out, 'adult'))).not.toBe(1);
        expect(at(out, 'adult').compare(at(out, 'high'))).not.toBe(1);
        const adult = (each: string) =>
          at(figures({ weight: text(weight), age: text(age), size: each }), 'adult');
        expect(adult('small').compare(adult('large'))).not.toBe(1);
        expect(adult('large').compare(adult('giant'))).not.toBe(1);
      }),
      { numRuns },
    );
  });

  it('gives the same dog in either unit', () => {
    fc.assert(
      fc.property(weights, weeks, sizes, (weight, age, size) => {
        const lb = figures({ weight: text(weight), unit: 'lb', age: text(age), size });
        const kg = figures({ weight: text(weight), unit: 'kg', age: text(age), size });
        // the same share either way: adult / other is the unit ratio in both
        expect(
          at(lb, 'adult')
            .mul(at(kg, 'adult'))
            .equals(at(lb, 'adultOther').mul(at(kg, 'adultOther'))),
        ).toBe(true);
        expect(at(lb, 'adultOther').compare(at(lb, 'adult'))).toBe(-1);
        expect(at(kg, 'adultOther').compare(at(kg, 'adult'))).toBe(1);
      }),
      { numRuns },
    );
  });
});

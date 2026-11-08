import { Rational } from '@maestro-calc/core';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { dogFood } from './dog-food.ts';

const numRuns = 100;

/** A weight of 0.1 to 500 with two decimals, a status, and a label's calories. */
const weight = fc.integer({ min: 10, max: 50_000 }).map((hundredths) => String(hundredths / 100));
const status = fc.constantFrom(
  'neutered',
  'intact',
  'inactive',
  'weight-loss',
  'puppy-young',
  'puppy-older',
);
const unit = fc.constantFrom('lb', 'kg');
const kcal = fc.integer({ min: 100, max: 8000 }).map(String);

const ran = (raw: Readonly<Record<string, unknown>>): Map<string, Rational> => {
  const result = dogFood.run(raw);
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

describe('dog-food properties', () => {
  it('feeds exactly the day: portion x calories per cup is the maintenance energy', () => {
    fc.assert(
      fc.property(weight, unit, status, kcal, (w, u, s, k) => {
        const out = ran({ weight: w, unit: u, status: s, kcal: k });
        expect(
          at(out, 'portion')
            .mul(Rational.of(BigInt(k)))
            .equals(at(out, 'mer')),
        ).toBe(true);
      }),
      { numRuns },
    );
  });

  it('keeps the maintenance energy inside the range of the sources', () => {
    fc.assert(
      fc.property(weight, unit, status, (w, u, s) => {
        const out = ran({ weight: w, unit: u, status: s });
        expect(at(out, 'low').compare(at(out, 'mer'))).not.toBe(1);
        expect(at(out, 'mer').compare(at(out, 'high'))).not.toBe(1);
      }),
      { numRuns },
    );
  });

  it('never feeds a heavier dog less', () => {
    fc.assert(
      fc.property(weight, weight, status, (a, b, s) => {
        const [light, heavy] = Number(a) <= Number(b) ? [a, b] : [b, a];
        const lighter = at(ran({ weight: light, status: s }), 'mer');
        const heavier = at(ran({ weight: heavy, status: s }), 'mer');
        expect(lighter.compare(heavier)).not.toBe(1);
      }),
      { numRuns },
    );
  });

  it('halves the portion when the food holds twice the calories', () => {
    fc.assert(
      fc.property(weight, status, kcal, (w, s, k) => {
        const one = at(ran({ weight: w, status: s, kcal: k }), 'portion');
        const two = at(ran({ weight: w, status: s, kcal: String(Number(k) * 2) }), 'portion');
        expect(one.equals(two.mul(Rational.of(2)))).toBe(true);
      }),
      { numRuns },
    );
  });

  it('allows a tenth of the day in treats and feeds nine tenths of the portion with them', () => {
    fc.assert(
      fc.property(weight, unit, status, (w, u, s) => {
        const out = ran({ weight: w, unit: u, status: s });
        expect(at(out, 'treats').equals(at(out, 'mer').div(Rational.of(10)))).toBe(true);
        expect(
          at(out, 'portionWithTreats').equals(at(out, 'portion').mul(Rational.of(9, 10))),
        ).toBe(true);
      }),
      { numRuns },
    );
  });
});

import { Rational } from '@maestro-calc/core';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { catFood } from './cat-food.ts';

const numRuns = 100;

const weight = fc.integer({ min: 10, max: 10_000 }).map((hundredths) => String(hundredths / 100));
const status = fc.constantFrom('neutered', 'intact', 'inactive', 'weight-loss', 'kitten');
const unit = fc.constantFrom('lb', 'kg');
const kcal = fc.integer({ min: 20, max: 8000 }).map(String);
const share = fc.integer({ min: 0, max: 100 }).map(String);

const ran = (raw: Readonly<Record<string, unknown>>): Map<string, Rational> => {
  const result = catFood.run(raw);
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

describe('cat-food properties', () => {
  it('feeds exactly the day: cups x dry kcal + cans x wet kcal is the maintenance energy', () => {
    fc.assert(
      fc.property(weight, unit, status, kcal, kcal, share, (w, u, s, d, c, ws) => {
        const out = ran({ weight: w, unit: u, status: s, dryKcal: d, wetKcal: c, wetShare: ws });
        const fed = at(out, 'cups')
          .mul(Rational.of(BigInt(d)))
          .add(at(out, 'cans').mul(Rational.of(BigInt(c))));
        expect(fed.equals(at(out, 'mer'))).toBe(true);
      }),
      { numRuns },
    );
  });

  it('moves calories from the cup to the can as the wet share grows', () => {
    fc.assert(
      fc.property(weight, status, share, share, (w, s, a, b) => {
        const [less, more] = Number(a) <= Number(b) ? [a, b] : [b, a];
        const few = ran({ weight: w, status: s, wetShare: less });
        const many = ran({ weight: w, status: s, wetShare: more });
        expect(at(few, 'cups').compare(at(many, 'cups'))).not.toBe(-1);
        expect(at(few, 'cans').compare(at(many, 'cans'))).not.toBe(1);
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

  it('allows a tenth of the day in treats and feeds nine tenths of each amount with them', () => {
    fc.assert(
      fc.property(weight, unit, status, share, (w, u, s, ws) => {
        const out = ran({ weight: w, unit: u, status: s, wetShare: ws });
        expect(at(out, 'treats').equals(at(out, 'mer').div(Rational.of(10)))).toBe(true);
        expect(at(out, 'cupsWithTreats').equals(at(out, 'cups').mul(Rational.of(9, 10)))).toBe(
          true,
        );
        expect(at(out, 'cansWithTreats').equals(at(out, 'cans').mul(Rational.of(9, 10)))).toBe(
          true,
        );
      }),
      { numRuns },
    );
  });
});

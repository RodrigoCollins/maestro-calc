import { parseDecimal, Rational } from '@maestro-calc/core';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { dogChocolate } from './dog-chocolate.ts';

const numRuns = 100;

const weight = fc.integer({ min: 10, max: 50_000 }).map((hundredths) => String(hundredths / 100));
const amount = fc.integer({ min: 0, max: 1_000_000 }).map((hundredths) => String(hundredths / 100));
const type = fc.constantFrom('white', 'milk', 'dark', 'baking', 'cocoa-powder', 'hulls');
const unit = fc.constantFrom('lb', 'kg');
const amountUnit = fc.constantFrom('oz', 'g');

/** The mg of theobromine and caffeine per gram of each kind (Merck), as exact fractions. */
const MG_PER_GRAM = {
  white: Rational.of(4, 100),
  milk: Rational.of(23, 10),
  dark: Rational.of(56, 10),
  baking: Rational.of(155, 10),
  'cocoa-powder': Rational.of(285, 10),
  hulls: Rational.of(9),
} as const;

const ran = (raw: Readonly<Record<string, unknown>>): Map<string, Rational> => {
  const result = dogChocolate.run(raw);
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

const kilograms = (text: string, unitName: string): Rational => {
  const parsed = parseDecimal(text);
  if (!parsed.ok) throw new Error(text);
  return unitName === 'lb' ? parsed.value.mul(Rational.of(45_359_237, 100_000_000)) : parsed.value;
};

describe('dog-chocolate properties', () => {
  it('is the total over the weight in kilograms, exactly', () => {
    fc.assert(
      fc.property(weight, unit, type, amount, amountUnit, (w, u, t, a, au) => {
        const out = ran({ weight: w, weightUnit: u, type: t, amount: a, amountUnit: au });
        expect(at(out, 'dose').mul(kilograms(w, u)).equals(at(out, 'totalMg'))).toBe(true);
      }),
      { numRuns },
    );
  });

  it('never gives a heavier dog a bigger dose of the same chocolate', () => {
    fc.assert(
      fc.property(weight, weight, type, amount, (a, b, t, eaten) => {
        const [light, heavy] = Number(a) <= Number(b) ? [a, b] : [b, a];
        const small = ran({ weight: light, type: t, amount: eaten, amountUnit: 'g' });
        const large = ran({ weight: heavy, type: t, amount: eaten, amountUnit: 'g' });
        expect(at(large, 'dose').compare(at(small, 'dose'))).not.toBe(1);
      }),
      { numRuns },
    );
  });

  it('counts the band as the number of thresholds the dose has reached', () => {
    fc.assert(
      fc.property(weight, unit, type, amount, amountUnit, (w, u, t, a, au) => {
        const out = ran({ weight: w, weightUnit: u, type: t, amount: a, amountUnit: au });
        const dose = at(out, 'dose');
        const reached = [20, 40, 60].filter((limit) => dose.compare(Rational.of(limit)) !== -1);
        expect(at(out, 'band')).toEqual(Rational.of(reached.length));
      }),
      { numRuns },
    );
  });

  it('puts the grams of each band in the ratio 1 : 2 : 3, each at its limit in mg/kg', () => {
    fc.assert(
      fc.property(weight, unit, type, (w, u, t) => {
        const out = ran({ weight: w, weightUnit: u, type: t, amountUnit: 'g' });
        expect(at(out, 'reach40').equals(at(out, 'reach20').mul(Rational.of(2)))).toBe(true);
        expect(at(out, 'reach60').equals(at(out, 'reach20').mul(Rational.of(3)))).toBe(true);
        expect(
          at(out, 'reach20')
            .mul(MG_PER_GRAM[t])
            .equals(kilograms(w, u).mul(Rational.of(20))),
        ).toBe(true);
      }),
      { numRuns },
    );
  });
});

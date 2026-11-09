import { Rational } from '@maestro-calc/core';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { dogAge, dogYearsOf, humanYearsOf } from './dog-age.ts';

const numRuns = 100;

const dogYears = fc.integer({ min: 50, max: 2_000 }).map((hundredths) => String(hundredths / 100));
const size = fc.constantFrom(
  'small' as const,
  'medium' as const,
  'large' as const,
  'giant' as const,
);

const figures = (raw: Readonly<Record<string, unknown>>): Map<string, Rational> => {
  const result = dogAge.run(raw);
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

describe('dog-age properties', () => {
  it('works back to the same dog age, exactly', () => {
    fc.assert(
      fc.property(dogYears, size, (age, s) => {
        const human = at(figures({ from: 'dog', age, size: s }), 'answer');
        expect(dogYearsOf(human, s).equals(at(figures({ age, size: s }), 'dogAge'))).toBe(true);
        expect(humanYearsOf(dogYearsOf(human, s), s).equals(human)).toBe(true);
      }),
      { numRuns },
    );
  });

  it('never makes an older dog younger in human years', () => {
    fc.assert(
      fc.property(dogYears, dogYears, size, (a, b, s) => {
        const [young, old] = Number(a) <= Number(b) ? [a, b] : [b, a];
        const first = at(figures({ age: young, size: s }), 'answer');
        const second = at(figures({ age: old, size: s }), 'answer');
        expect(first.compare(second)).not.toBe(1);
      }),
      { numRuns },
    );
  });

  it('ages a bigger dog at least as fast as a smaller one', () => {
    fc.assert(
      fc.property(dogYears, (age) => {
        const [small, medium, large, giant] = ['small', 'medium', 'large', 'giant'].map((s) =>
          at(figures({ age, size: s }), 'answer'),
        );
        if (!small || !medium || !large || !giant) throw new Error('no answer');
        expect(small.compare(medium)).not.toBe(1);
        expect(medium.compare(large)).not.toBe(1);
        expect(large.compare(giant)).not.toBe(1);
      }),
      { numRuns },
    );
  });

  it('keeps the DNA clock within a millionth of 16 ln(age) + 31', () => {
    fc.assert(
      fc.property(dogYears, size, (age, s) => {
        const wang = at(figures({ age, size: s }), 'wang').toNumber();
        expect(Math.abs(wang - (16 * Math.log(Number(age)) + 31))).toBeLessThanOrEqual(1e-6);
      }),
      { numRuns },
    );
  });
});

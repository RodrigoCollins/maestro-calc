import { Rational } from '@maestro-calc/core';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  catAge,
  catYearsOf,
  cornellCatYearsOf,
  cornellHumanYearsOf,
  humanYearsOf,
} from './cat-age.ts';

const numRuns = 100;

/** A cat age of 0 to 30 years, to the hundredth. */
const catYears = fc
  .integer({ min: 0, max: 3_000 })
  .map((hundredths) => Rational.of(hundredths, 100));

const figures = (raw: Readonly<Record<string, unknown>>): Map<string, Rational> => {
  const result = catAge.run(raw);
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

const text = (value: Rational): string => value.toNumber().toString();

describe('cat-age properties', () => {
  it('works back to the same cat age, exactly, on both lines', () => {
    fc.assert(
      fc.property(catYears, (cat) => {
        expect(catYearsOf(humanYearsOf(cat)).equals(cat)).toBe(true);
        expect(cornellCatYearsOf(cornellHumanYearsOf(cat)).equals(cat)).toBe(true);
        const human = at(figures({ age: text(cat) }), 'answer');
        expect(human.equals(humanYearsOf(cat))).toBe(true);
      }),
      { numRuns },
    );
  });

  it('never makes an older cat younger in human years', () => {
    fc.assert(
      fc.property(catYears, catYears, (a, b) => {
        const [young, old] = a.compare(b) !== 1 ? [a, b] : [b, a];
        const first = at(figures({ age: text(young) }), 'answer');
        const second = at(figures({ age: text(old) }), 'answer');
        expect(first.compare(second)).not.toBe(1);
      }),
      { numRuns },
    );
  });

  it('keeps the life stage from going back as a cat ages', () => {
    fc.assert(
      fc.property(catYears, catYears, (a, b) => {
        const [young, old] = a.compare(b) !== 1 ? [a, b] : [b, a];
        for (const key of ['stage', 'careStage', 'visits'])
          expect(
            at(figures({ age: text(young) }), key).compare(at(figures({ age: text(old) }), key)),
          ).not.toBe(1);
      }),
      { numRuns },
    );
  });

  it('stays within 3 human years of Cornell from the first birthday on', () => {
    fc.assert(
      fc.property(catYears, (cat) => {
        if (cat.compare(Rational.ONE) === -1) return;
        const gap = humanYearsOf(cat).sub(cornellHumanYearsOf(cat)).abs();
        expect(gap.compare(Rational.of(3))).not.toBe(1);
      }),
      { numRuns },
    );
  });
});

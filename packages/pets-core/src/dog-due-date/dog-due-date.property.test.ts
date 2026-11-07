import { Rational } from '@maestro-calc/core';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { dogDueDate } from './dog-due-date.ts';

const numRuns = 100;

const method = fc.constantFrom('breeding', 'lh', 'diestrus');
const year = fc.integer({ min: 1970, max: 2100 }).map(String);
const month = fc.integer({ min: 1, max: 12 }).map(String);
const day = fc.integer({ min: 1, max: 31 }).map(String);

const figures = (raw: Readonly<Record<string, unknown>>): Map<string, number> => {
  const result = dogDueDate.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return new Map(
    result.value.outputs.map(({ key, value }) => {
      if (!(value instanceof Rational)) throw new Error(`${key} is not a number`);
      return [key, value.toNumber()];
    }),
  );
};

const at = (out: Map<string, number>, key: string): number => {
  const value = out.get(key);
  if (value === undefined) throw new Error(key);
  return value;
};

describe('dog-due-date properties', () => {
  it('is a window: the earliest day is never after the latest, and both follow the start', () => {
    fc.assert(
      fc.property(method, year, month, day, (m, y, mo, d) => {
        const out = figures({ method: m, year: y, month: mo, day: d });
        expect(at(out, 'earliest')).toBe(at(out, 'from') + at(out, 'minDays'));
        expect(at(out, 'latest')).toBe(at(out, 'from') + at(out, 'maxDays'));
        expect(at(out, 'earliest')).toBeLessThanOrEqual(at(out, 'latest'));
      }),
      { numRuns },
    );
  });

  it('moves a day later when the start moves a day later', () => {
    fc.assert(
      fc.property(method, year, month, fc.integer({ min: 1, max: 27 }), (m, y, mo, d) => {
        const first = figures({ method: m, year: y, month: mo, day: String(d) });
        const second = figures({ method: m, year: y, month: mo, day: String(d + 1) });
        expect(at(second, 'earliest')).toBe(at(first, 'earliest') + 1);
        expect(at(second, 'latest')).toBe(at(first, 'latest') + 1);
      }),
      { numRuns },
    );
  });

  it('gives the LH window inside the breeding window and the diestrus window inside it too', () => {
    fc.assert(
      fc.property(year, month, day, (y, mo, d) => {
        const breeding = figures({ method: 'breeding', year: y, month: mo, day: d });
        for (const narrow of ['lh', 'diestrus']) {
          const out = figures({ method: narrow, year: y, month: mo, day: d });
          expect(at(out, 'maxDays') - at(out, 'minDays')).toBeLessThan(
            at(breeding, 'maxDays') - at(breeding, 'minDays'),
          );
        }
      }),
      { numRuns },
    );
  });
});

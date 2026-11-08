import { Rational } from '@maestro-calc/core';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { pounds, ran } from '../__testing__/run.ts';
import { lawnLime } from './lawn-lime.ts';

const NUM_RUNS = 200;
const cases = fc.record({
  area: fc.integer({ min: 0, max: 200_000 }),
  rate: fc.integer({ min: 0, max: 200 }),
  cce: fc.integer({ min: 1, max: 200 }),
  bag: fc.integer({ min: 1, max: 100 }),
});
const run = (c: { area: number; rate: number; cce: number; bag: number }) =>
  ran(lawnLime, {
    area: String(c.area),
    rate: String(c.rate),
    cce: String(c.cce),
    bag: String(c.bag),
  });

describe('lawn-lime properties', () => {
  it('delivers exactly the recommended CCE on the area', () => {
    fc.assert(
      fc.property(cases, (c) => {
        const want = Rational.of(c.rate).mul(Rational.of(c.area)).div(Rational.of(1000));
        const delivered = pounds(run(c), 'pounds').mul(Rational.of(c.cce, 100));
        expect(delivered).toEqual(want);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it('buys the fewest whole bags that hold the product', () => {
    fc.assert(
      fc.property(cases, (c) => {
        const result = run(c);
        const bag = Rational.of(c.bag);
        const qty = result.shopping[0]?.qty ?? -1n;
        const need = pounds(result, 'pounds');
        expect(Rational.of(qty).mul(bag).compare(need)).not.toBe(-1);
        if (qty > 0n)
          expect(
            Rational.of(qty - 1n)
              .mul(bag)
              .compare(need),
          ).toBe(-1);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

import { Rational } from '@maestro-calc/core';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { figure, pounds, ran } from '../__testing__/run.ts';
import { lawnFertilizer } from './lawn-fertilizer.ts';

const NUM_RUNS = 200;
const THOUSAND = Rational.of(1000);

/** The form text and the exact numbers behind it, the target in hundredths of a pound. */
const cases = fc
  .record({
    area: fc.integer({ min: 1, max: 200_000 }),
    nitrogen: fc.integer({ min: 1, max: 100 }),
    phosphate: fc.integer({ min: 0, max: 100 }),
    potash: fc.integer({ min: 0, max: 100 }),
    hundredths: fc.integer({ min: 0, max: 100 }),
    bag: fc.integer({ min: 1, max: 100 }),
  })
  .map((c) => ({
    ...c,
    raw: {
      area: String(c.area),
      nitrogen: String(c.nitrogen),
      phosphate: String(c.phosphate),
      potash: String(c.potash),
      target: String(c.hundredths / 100),
      bag: String(c.bag),
    },
  }));

describe('lawn-fertilizer properties', () => {
  it('delivers exactly the target nitrogen on the area', () => {
    fc.assert(
      fc.property(cases, (c) => {
        const run = ran(lawnFertilizer, c.raw);
        const want = Rational.of(c.area).mul(Rational.of(c.hundredths, 100)).div(THOUSAND);
        expect(pounds(run, 'nitrogenPounds')).toEqual(want);
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it('buys the fewest whole bags that hold the product', () => {
    fc.assert(
      fc.property(cases, (c) => {
        const run = ran(lawnFertilizer, c.raw);
        const bag = Rational.of(c.bag);
        const qty = run.shopping[0]?.qty ?? -1n;
        const need = pounds(run, 'pounds');
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

  it('covers, bag for bag, the area one bag spreads at the rate', () => {
    fc.assert(
      fc.property(cases, (c) => {
        const run = ran(lawnFertilizer, c.raw);
        if (pounds(run, 'perThousand').isZero()) return;
        const spread = figure(run, 'bagCoverage').mul(pounds(run, 'perThousand')).div(THOUSAND);
        expect(spread).toEqual(Rational.of(c.bag));
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

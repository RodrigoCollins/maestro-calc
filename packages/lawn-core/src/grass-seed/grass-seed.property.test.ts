import { Rational } from '@maestro-calc/core';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { figure, pounds, ran } from '../__testing__/run.ts';
import { grassSeed } from './grass-seed.ts';
import { SEED_SOURCES, SEED_SPECIES, seedRateOf } from './rates.ts';

const NUM_RUNS = 200;
const THOUSAND = Rational.of(1000);
const cases = fc.record({
  area: fc.integer({ min: 0, max: 200_000 }),
  species: fc.constantFrom(...SEED_SPECIES),
  source: fc.constantFrom(...SEED_SOURCES),
  bag: fc.integer({ min: 1, max: 100 }),
});
const run = (c: { area: number; species: string; source: string; bag: number }) =>
  ran(grassSeed, { ...c, area: String(c.area), bag: String(c.bag) });

describe('grass-seed properties', () => {
  it('seeds the area at the low and the high rate of its source, exactly', () => {
    fc.assert(
      fc.property(cases, (c) => {
        const [low, high] = seedRateOf(c.species, c.source);
        const result = run(c);
        expect(pounds(result, 'lowPounds')).toEqual(low.mul(Rational.of(c.area)).div(THOUSAND));
        expect(pounds(result, 'highPounds')).toEqual(high.mul(Rational.of(c.area)).div(THOUSAND));
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it('never has the low end above the high end, and sows half in each direction', () => {
    fc.assert(
      fc.property(cases, (c) => {
        const result = run(c);
        expect(pounds(result, 'lowPounds').compare(pounds(result, 'highPounds'))).not.toBe(1);
        expect(pounds(result, 'lowPerPass').mul(Rational.of(2))).toEqual(
          pounds(result, 'lowPounds'),
        );
        expect(pounds(result, 'highPerPass').mul(Rational.of(2))).toEqual(
          pounds(result, 'highPounds'),
        );
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it('buys the fewest whole bags at each end of the range', () => {
    fc.assert(
      fc.property(cases, (c) => {
        const result = run(c);
        const bag = Rational.of(c.bag);
        for (const [need, bags] of [
          [pounds(result, 'lowPounds'), figure(result, 'lowBags')],
          [pounds(result, 'highPounds'), figure(result, 'highBags')],
        ] as const) {
          expect(bags.mul(bag).compare(need)).not.toBe(-1);
          if (!bags.isZero()) expect(bags.sub(Rational.of(1)).mul(bag).compare(need)).toBe(-1);
        }
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

import { Rational } from '@maestro-calc/core';
import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { figure, ran } from '../__testing__/run.ts';
import { sod } from './sod.ts';

const NUM_RUNS = 200;
const cases = fc.record({
  area: fc.integer({ min: 0, max: 500_000 }),
  waste: fc.integer({ min: 0, max: 100 }),
  pallet: fc.constantFrom(400, 450, 500),
});
const run = (c: { area: number; waste: number; pallet: number }) =>
  ran(sod, { area: String(c.area), waste: String(c.waste), pallet: String(c.pallet) });

describe('sod properties', () => {
  it('orders the area plus its waste, exactly', () => {
    fc.assert(
      fc.property(cases, (c) => {
        const want = Rational.of(c.area).mul(Rational.of(100 + c.waste, 100));
        expect(figure(run(c), 'order')).toEqual(want);
        expect(figure(run(c), 'extra')).toEqual(want.sub(Rational.of(c.area)));
      }),
      { numRuns: NUM_RUNS },
    );
  });

  it('buys the fewest whole pallets and slabs that cover the order', () => {
    fc.assert(
      fc.property(cases, (c) => {
        const result = run(c);
        const order = figure(result, 'order');
        const pallets = figure(result, 'pallets');
        const slabs = figure(result, 'slabs');
        expect(pallets.mul(Rational.of(c.pallet)).compare(order)).not.toBe(-1);
        if (!pallets.isZero())
          expect(pallets.sub(Rational.of(1)).mul(Rational.of(c.pallet)).compare(order)).toBe(-1);
        const slab = Rational.of(8, 3);
        expect(slabs.mul(slab).compare(order)).not.toBe(-1);
        if (!slabs.isZero()) expect(slabs.sub(Rational.of(1)).mul(slab).compare(order)).toBe(-1);
      }),
      { numRuns: NUM_RUNS },
    );
  });
});

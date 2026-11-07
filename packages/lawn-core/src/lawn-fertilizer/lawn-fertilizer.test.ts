import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { figure, pounds, ran } from '../__testing__/run.ts';
import { lawnFertilizer } from './lawn-fertilizer.ts';

// pounds of product per 1,000 sq ft = target lb N / (N% / 100); total = that x area / 1,000.
// Purdue (Reicher, 2004): 0.75 lb N with 16-8-8 = 4.69 lb per 1,000 sq ft, 37 lb for 8,000 sq ft
// (the source rounds 4.69 x 8 = 37.52 down to 37; the exact figure is 37.5).
// Penn State Extension (Landschoot, 2025): 1.0 lb N with 26-5-10 = 3.8 lb; a 50 lb bag covers
// 13,200 sq ft (the source divides by the rounded 3.8; exactly 50 / (50/13) x 1,000 = 13,000).
describe('lawn fertilizer', () => {
  it('reads the defaults: 5,000 sq ft, 24-0-6, 1.0 lb N, a 15 lb bag', () => {
    const state = lawnFertilizer.validate({});
    expect(state.ok && state.value).toEqual({
      area: Rational.of(5000),
      nitrogen: Rational.of(24),
      phosphate: Rational.ZERO,
      potash: Rational.of(6),
      target: Rational.of(1),
      bag: Rational.of(15),
    });
  });

  // 1 / 0.24 = 25/6 lb per 1,000 sq ft; x 5 = 125/6 = 20.83 lb; two 15 lb bags
  it('puts 20.8 lb on 5,000 sq ft by default: two 15 lb bags', () => {
    const run = ran(lawnFertilizer);
    expect(pounds(run, 'perThousand')).toEqual(Rational.of(25, 6));
    expect(pounds(run, 'pounds')).toEqual(Rational.of(125, 6));
    expect(run.shopping).toEqual([{ materialId: 'lawn-fertilizer', purchaseUnit: 'bag', qty: 2n }]);
    expect(pounds(run, 'nitrogenPounds')).toEqual(Rational.of(5));
    expect(pounds(run, 'phosphatePounds')).toEqual(Rational.ZERO);
    expect(pounds(run, 'potashPounds')).toEqual(Rational.of(5, 4));
    expect(run.warnings).toEqual([]);
  });

  it('works the Purdue example: 0.75 lb N of 16-8-8 on 8,000 sq ft', () => {
    const run = ran(lawnFertilizer, {
      area: '8000',
      nitrogen: '16',
      phosphate: '8',
      potash: '8',
      target: '0.75',
      bag: '50',
    });
    expect(pounds(run, 'perThousand')).toEqual(Rational.of(75, 16));
    expect(pounds(run, 'pounds')).toEqual(Rational.of(75, 2));
    expect(pounds(run, 'phosphatePounds')).toEqual(Rational.of(3));
    expect(pounds(run, 'potashPounds')).toEqual(Rational.of(3));
    expect(run.shopping[0]?.qty).toBe(1n);
  });

  it('works the Penn State example: 1.0 lb N of 26-5-10 and a 50 lb bag', () => {
    const raw = { nitrogen: '26', phosphate: '5', potash: '10', bag: '50' };
    const run = ran(lawnFertilizer, { ...raw, area: '1000' });
    expect(pounds(run, 'perThousand')).toEqual(Rational.of(50, 13));
    expect(figure(run, 'bagCoverage')).toEqual(Rational.of(13_000));
    // exactly one bag covers 13,000 sq ft; one more square foot needs a second
    expect(ran(lawnFertilizer, { ...raw, area: '13000' }).shopping[0]?.qty).toBe(1n);
    expect(ran(lawnFertilizer, { ...raw, area: '13001' }).shopping[0]?.qty).toBe(2n);
  });

  it('warns above the 1.0 lb N limit of one application, and not at it', () => {
    expect(ran(lawnFertilizer, { target: '1' }).warnings).toEqual([]);
    expect(ran(lawnFertilizer, { target: '1.5' }).warnings).toEqual([
      { code: 'overLimit', params: {} },
    ]);
  });

  it('puts nothing on a zero rate', () => {
    const run = ran(lawnFertilizer, { target: '0' });
    expect(pounds(run, 'pounds')).toEqual(Rational.ZERO);
    expect(run.shopping[0]?.qty).toBe(0n);
  });

  it('rejects a bag with no nitrogen, a zero bag, a negative area and over 100 percent', () => {
    expect(lawnFertilizer.run({ nitrogen: '0' }).ok).toBe(false);
    expect(lawnFertilizer.run({ bag: '0' }).ok).toBe(false);
    expect(lawnFertilizer.run({ area: '-1' }).ok).toBe(false);
    expect(lawnFertilizer.run({ nitrogen: '101' }).ok).toBe(false);
  });
});

import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { pounds, ran } from '../__testing__/run.ts';
import { lawnLime } from './lawn-lime.ts';

// Penn State AASL: turf lime recommendations are pounds of calcium carbonate equivalent (CCE) per
// 1,000 sq ft, adjusted when the limestone is not 100 percent CCE:
// product per 1,000 sq ft = recommendation x 100 / label CCE; total = that x area / 1,000.
describe('lawn lime', () => {
  it('reads the defaults: 5,000 sq ft, 30 lb CCE per 1,000 sq ft, 100 percent CCE, a 40 lb bag', () => {
    const state = lawnLime.validate({});
    expect(state.ok && state.value).toEqual({
      area: Rational.of(5000),
      rate: Rational.of(30),
      cce: Rational.of(100),
      bag: Rational.of(40),
    });
  });

  // 30 x 100 / 100 = 30 lb per 1,000 sq ft; x 5 = 150 lb; 3.75 bags, so four
  it('puts the recommendation on as it is at 100 percent CCE: 150 lb, four bags', () => {
    const run = ran(lawnLime);
    expect(pounds(run, 'perThousand')).toEqual(Rational.of(30));
    expect(pounds(run, 'pounds')).toEqual(Rational.of(150));
    expect(run.shopping).toEqual([{ materialId: 'lawn-lime', purchaseUnit: 'bag', qty: 4n }]);
  });

  // 30 x 100 / 90 = 100/3 lb per 1,000 sq ft; x 5 = 500/3 = 166.67 lb; 4.17 bags, so five
  it('adjusts a limestone below 100 percent CCE: 90 percent takes 166.7 lb', () => {
    const run = ran(lawnLime, { cce: '90' });
    expect(pounds(run, 'perThousand')).toEqual(Rational.of(100, 3));
    expect(pounds(run, 'pounds')).toEqual(Rational.of(500, 3));
    expect(run.shopping[0]?.qty).toBe(5n);
  });

  it('takes less of a limestone above 100 percent CCE', () => {
    expect(pounds(ran(lawnLime, { cce: '120' }), 'perThousand')).toEqual(Rational.of(25));
  });

  it('puts nothing on a zero recommendation', () => {
    const run = ran(lawnLime, { rate: '0' });
    expect(pounds(run, 'pounds')).toEqual(Rational.ZERO);
    expect(run.shopping[0]?.qty).toBe(0n);
  });

  it('rejects a zero CCE, a zero bag and a negative rate', () => {
    expect(lawnLime.run({ cce: '0' }).ok).toBe(false);
    expect(lawnLime.run({ bag: '0' }).ok).toBe(false);
    expect(lawnLime.run({ rate: '-1' }).ok).toBe(false);
  });
});

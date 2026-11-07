import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { figure, ran } from '../__testing__/run.ts';
import { sod } from './sod.ts';

// Plain geometry: square feet to order = area x (1 + waste / 100); pallets = ceil(order / pallet
// sq ft); slabs = ceil(order / slab sq ft), a 16 x 24 in slab being 384 / 144 = 8/3 sq ft.
describe('sod', () => {
  it('reads the defaults: 1,000 sq ft, no waste, a 450 sq ft pallet', () => {
    const state = sod.validate({});
    expect(state.ok && state.value).toEqual({
      area: Rational.of(1000),
      waste: Rational.ZERO,
      pallet: '450',
    });
  });

  // 1,000 / 450 = 2.22 pallets, so three; 1,000 x 3/8 = 375 slabs exactly
  it('orders 1,000 sq ft as it is with no waste: three pallets, 375 slabs', () => {
    const run = ran(sod);
    expect(figure(run, 'order')).toEqual(Rational.of(1000));
    expect(figure(run, 'extra')).toEqual(Rational.ZERO);
    expect(figure(run, 'pallets')).toEqual(Rational.of(3));
    expect(figure(run, 'slabs')).toEqual(Rational.of(375));
    expect(run.shopping).toEqual([{ materialId: 'sod', purchaseUnit: 'pallet', qty: 3n }]);
  });

  // 1,000 x 1.10 = 1,100 sq ft: 2.44 pallets, three; 1,100 x 3/8 = 412.5 slabs, 413
  it('adds the waste the user sets: 10 percent is 1,100 sq ft, 413 slabs', () => {
    const run = ran(sod, { waste: '10' });
    expect(figure(run, 'order')).toEqual(Rational.of(1100));
    expect(figure(run, 'extra')).toEqual(Rational.of(100));
    expect(figure(run, 'pallets')).toEqual(Rational.of(3));
    expect(figure(run, 'slabs')).toEqual(Rational.of(413));
  });

  it('rounds the pallets up at the size the supplier names', () => {
    expect(figure(ran(sod, { pallet: '500' }), 'pallets')).toEqual(Rational.of(2));
    expect(figure(ran(sod, { pallet: '400', area: '800' }), 'pallets')).toEqual(Rational.of(2));
    expect(figure(ran(sod, { pallet: '400', area: '801' }), 'pallets')).toEqual(Rational.of(3));
    expect(figure(ran(sod, { pallet: '400', area: '0' }), 'pallets')).toEqual(Rational.ZERO);
  });

  it('rejects a pallet size that is not offered, negative waste and a negative area', () => {
    expect(sod.run({ pallet: '425' }).ok).toBe(false);
    expect(sod.run({ waste: '-1' }).ok).toBe(false);
    expect(sod.run({ area: '-1' }).ok).toBe(false);
  });
});

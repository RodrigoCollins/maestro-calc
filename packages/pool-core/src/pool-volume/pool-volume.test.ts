import {
  ft,
  ft3,
  gal,
  inch,
  isQuantityOf,
  liter,
  PI,
  quantity,
  Rational,
  valueIn,
} from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { poolVolume } from './pool-volume.ts';

// A US gallon is exactly 231 in3, so one cubic foot is 1728/231 gallons. Rectangles are exact;
// round and oval pools carry the core's 35-digit Rational pi.
const outputsOf = (raw: Readonly<Record<string, unknown>>) => {
  const ran = poolVolume.run(raw);
  if (!ran.ok) throw new Error(JSON.stringify(ran.errors));
  return Object.fromEntries(ran.value.outputs.map(({ key, value }) => [key, value]));
};

const gallonsOf = (raw: Readonly<Record<string, unknown>>): Rational => {
  const value = outputsOf(raw)['gallons'];
  if (!isQuantityOf(value, 'volume')) throw new Error('gallons is not a volume');
  return valueIn(value, gal);
};

describe('pool volume', () => {
  it('reads the defaults: a 32 by 16 ft rectangle, 3 ft 6 in shallow and 8 ft deep', () => {
    const state = poolVolume.validate({});
    expect(state.ok && state.value).toEqual({
      shape: 'rectangle',
      length: quantity(32, ft),
      width: quantity(16, ft),
      shallow: quantity(42, inch),
      deep: quantity(8, ft),
    });
  });

  // 32 x 16 x 5.75 ft = 2,944 ft3 = 2,944 x 1,728 / 231 gal = 22,022.65 gal
  it('fills a rectangle to its average depth: 22,022.65 gallons by default', () => {
    expect(gallonsOf({})).toEqual(Rational.of(1_695_744, 77));
    const out = outputsOf({});
    expect(isQuantityOf(out['cubicFeet'], 'volume') && valueIn(out['cubicFeet'], ft3)).toEqual(
      Rational.of(2944),
    );
    const liters = isQuantityOf(out['liters'], 'volume') ? valueIn(out['liters'], liter) : null;
    expect(liters?.toNumber()).toBeCloseTo(83_364.8, 1);
  });

  // pi x 12 x 12 x 4 ft3 = 576 pi ft3 = 331,776 pi / 77 gal = 13,536.4 gal
  it('reads the length as the diameter of a round pool and ignores the width', () => {
    const raw = { shape: 'round', length: '24 ft', width: '99 ft', shallow: '4 ft', deep: '4 ft' };
    expect(gallonsOf(raw)).toEqual(PI.mul(Rational.of(331_776, 77)));
    expect(gallonsOf(raw).toNumber()).toBeCloseTo(13_536.4, 1);
  });

  // pi x 15 x 7.5 x 4 ft3 = 450 pi ft3 = 259,200 pi / 77 gal = 10,575.3 gal
  it('fills an oval as an ellipse of the length and the width', () => {
    const raw = { shape: 'oval', length: '30 ft', width: '15 ft', shallow: '4 ft', deep: '4 ft' };
    expect(gallonsOf(raw)).toEqual(PI.mul(Rational.of(259_200, 77)));
    expect(gallonsOf(raw).toNumber()).toBeCloseTo(10_575.3, 1);
  });

  it('averages the two depths in either order', () => {
    const swapped = { shallow: '8 ft', deep: '3 ft 6 in' };
    expect(gallonsOf(swapped)).toEqual(gallonsOf({}));
  });

  it('reads metric lengths: 10 x 5 m, 1.5 m deep is 75,000 liters', () => {
    const raw = { length: '10 m', width: '5 m', shallow: '1.5 m', deep: '1.5 m' };
    const out = outputsOf(raw);
    expect(isQuantityOf(out['liters'], 'volume') && valueIn(out['liters'], liter)).toEqual(
      Rational.of(75_000),
    );
  });

  it('gives no water for a pool with no depth', () => {
    expect(gallonsOf({ shallow: '0', deep: '0' })).toEqual(Rational.ZERO);
  });

  it('rejects a negative length', () => {
    expect(poolVolume.run({ length: '-1 ft' }).ok).toBe(false);
  });
});

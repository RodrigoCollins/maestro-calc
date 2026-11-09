import { decode, encode, isQuantityOf, kg, Rational, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { poolSalt } from './pool-salt.ts';

// Metric: 1 ppm is 1 mg/L, so kilograms = litres x (target - current) / 1,000,000. AstralPool's
// VX 3 Series manual (Inst.245 V07.20): "the recommended level is 4000ppm therefore add 4kgs of
// salt for every 1000 litres of water (a typical pool of around 50,000 litres requires 200kg)".
// Australian pool salt comes in 20 kg bags.
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = poolSalt.run({ units: 'metric', ...raw });
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
};

const kilograms = (raw: Readonly<Record<string, unknown>>, key = 'pounds'): Rational => {
  const value = ran(raw).outputs.find((output) => output.key === key)?.value;
  if (!isQuantityOf(value, 'mass')) throw new Error(`${key} is not a mass`);
  return valueIn(value, kg);
};

describe('pool salt in metric', () => {
  it('fills a 50,000 L pool to 4,000 ppm with 200 kg, Astral’s own example: ten 20 kg bags', () => {
    const raw = { gallons: '50000', current: '0', target: '4000' };
    expect(kilograms(raw)).toEqual(Rational.of(200));
    expect(kilograms(raw, 'kilograms')).toEqual(Rational.of(200));
    expect(kilograms(raw, 'firstAddition')).toEqual(Rational.of(150));
    expect(ran(raw).shopping).toEqual([
      { materialId: 'pool-salt', purchaseUnit: 'bag-20kg', qty: 10n },
    ]);
  });

  it('gives 4 kg per 1,000 L at 4,000 ppm: 160 kg for 40,000 L, 320 kg for 80,000 L', () => {
    expect(kilograms({ gallons: '40000', current: '0', target: '4000' })).toEqual(Rational.of(160));
    expect(kilograms({ gallons: '80000', current: '0', target: '4000' })).toEqual(Rational.of(320));
  });

  // 60,000 x 1,000 / 1e6 = 60 kg: three bags; 45,000 x 500 / 1e6 = 22.5 kg: two bags, rounded up
  it('tops a reading up and rounds the bags up', () => {
    const top = { gallons: '60000', current: '3000', target: '4000' };
    expect(kilograms(top)).toEqual(Rational.of(60));
    expect(ran(top).shopping[0]?.qty).toBe(3n);
    const half = { gallons: '45000', current: '3500', target: '4000' };
    expect(kilograms(half)).toEqual(Rational.of(45, 2));
    expect(ran(half).shopping[0]?.qty).toBe(2n);
  });

  it('adds nothing over the target and says to drain', () => {
    const raw = { gallons: '50000', current: '4500', target: '4000' };
    expect(kilograms(raw)).toEqual(Rational.ZERO);
    expect(ran(raw).shopping).toEqual([
      { materialId: 'pool-salt', purchaseUnit: 'bag-20kg', qty: 0n },
    ]);
    expect(ran(raw).warnings).toEqual([{ code: 'drainToLower', params: {} }]);
  });

  it('keeps US gallons, pounds and 40 lb bags when the choice is us', () => {
    const us = poolSalt.run({ units: 'us' });
    expect(us.ok && us.value.shopping).toEqual([
      { materialId: 'pool-salt', purchaseUnit: 'bag-40', qty: 4n },
    ]);
  });

  it('round-trips the choice as m=metric, and a link without m opens on us', () => {
    const state = poolSalt.validate({ gallons: '50000', units: 'metric' });
    if (!state.ok) throw new Error('invalid');
    expect(encode(poolSalt, state.value)).toBe('v=1&g=50000&m=metric');
    expect(decode(poolSalt, 'v=1&g=50000&m=metric').state.units).toBe('metric');
    expect(decode(poolSalt, 'v=1&g=50000').state.units).toBe('us');
  });
});

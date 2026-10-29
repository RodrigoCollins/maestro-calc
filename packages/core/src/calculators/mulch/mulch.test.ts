import { describe, expect, it } from 'vitest';
import { usd } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { ft3, inch, m3, yd3 } from '../../units/catalog.ts';
import { isQuantityOf, quantity, valueIn } from '../../units/quantity.ts';
import { mulch } from './index.ts';

/** The result of a run; a failed run is a failed test. */
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = mulch.run(raw);
  if (!result.ok) throw new Error(`run failed: ${JSON.stringify(result.errors)}`);
  return result.value;
};

const output = (raw: Readonly<Record<string, unknown>>, key: string): unknown =>
  ran(raw).outputs.find((found) => found.key === key)?.value;

/** The exact value of a volume output in a unit. */
const volume = (raw: Readonly<Record<string, unknown>>, key: string, unit = ft3): Rational => {
  const value = output(raw, key);
  if (!isQuantityOf(value, 'volume')) throw new Error(`${key} is not a volume`);
  return valueIn(value, unit);
};

describe('mulch defaults (calc-mulch › Inputs)', () => {
  // spec: calc-mulch › [MU1] 20 ft by 4 ft by 3 in, 5 % extra, 2 cu ft bags, no prices
  it('reads the defaults', () => {
    const state = mulch.validate({});
    expect(state.ok && state.value).toEqual({
      length: quantity(240, inch),
      width: quantity(48, inch),
      depth: quantity(3, inch),
      waste: Rational.of(5),
      bag: '2',
      bagPrice: usd(0),
      yardPrice: usd(0),
    });
  });
});

/*
 * Hand-verified: 20 ft × 4 ft × 3 in = 20 × 4 × 1/4 = 20 ft³ net; with 5 % extra, 21 ft³ = 7/9 yd³
 * (0.78) = 0.5946… m³ (0.59). Bags of 2 cu ft: 21 ÷ 2 = 10.5, so 11; of 3 cu ft: 21 ÷ 3 = 7.
 */
describe('mulch volume, bags and costs (calc-mulch › Volume, bags and costs)', () => {
  // spec: calc-mulch › [MU2] the default bed
  it('gives the default bed in cubic feet, yards and meters, and 11 bags of 2 cu ft', () => {
    expect(volume({}, 'netVolume')).toEqual(Rational.of(20));
    expect(volume({}, 'volumeFt3')).toEqual(Rational.of(21));
    expect(volume({}, 'volumeYd3', yd3)).toEqual(Rational.of(7, 9));
    expect(Number(volume({}, 'volumeM3', m3).toNumber().toFixed(2))).toBe(0.59);
    expect(ran({}).shopping).toEqual([{ materialId: 'mulch', purchaseUnit: 'bag-2', qty: 11n }]);
  });

  // spec: calc-mulch › [MU3] 3 cu ft bags at $5 and bulk at $36 a yard
  it('counts 7 bags of 3 cu ft and costs them, and the same volume in bulk', () => {
    const raw = { bag: '3', bagPrice: '5', yardPrice: '36' };
    expect(ran(raw).shopping).toEqual([{ materialId: 'mulch', purchaseUnit: 'bag-3', qty: 7n }]);
    expect(output(raw, 'bagCost')).toEqual(usd(35));
    expect(output(raw, 'bulkCost')).toEqual(usd(28));
  });

  it('needs no bag for an empty bed and adds no extra at 0 %', () => {
    expect(ran({ depth: '0' }).shopping[0]?.qty).toBe(0n);
    expect(volume({ waste: '0' }, 'volumeFt3')).toEqual(Rational.of(20));
    expect(output({}, 'bagCost')).toEqual(usd(0));
  });
});

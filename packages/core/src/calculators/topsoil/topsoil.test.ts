import { describe, expect, it } from 'vitest';
import { usd } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { ft3, inch, m3, yd3 } from '../../units/catalog.ts';
import { isQuantityOf, quantity, valueIn } from '../../units/quantity.ts';
import { topsoil } from './index.ts';

/** The result of a run; a failed run is a failed test. */
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = topsoil.run(raw);
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

describe('topsoil defaults (calc-topsoil › Inputs)', () => {
  // spec: calc-topsoil › [TS1] 10 ft by 10 ft by 4 in, 10 % extra, 0.75 cu ft bags, no prices
  it('reads the defaults', () => {
    const state = topsoil.validate({});
    expect(state.ok && state.value).toEqual({
      length: quantity(120, inch),
      width: quantity(120, inch),
      depth: quantity(4, inch),
      waste: Rational.of(10),
      bag: '0-75',
      bagPrice: usd(0),
      yardPrice: usd(0),
    });
  });
});

/*
 * Hand-verified: 10 ft × 10 ft × 4 in = 100/3 ft³ net; with 10 % extra, 110/3 ft³ = 110/81 yd³
 * (1.36) = 1.038… m³ (1.04). Bags: 110/3 ÷ 3/4 = 440/9 = 48.9, so 49; ÷ 1 = 36.7, so 37; ÷ 3/2 =
 * 220/9 = 24.4, so 25.
 */
describe('topsoil volume, bags and costs (calc-topsoil › Volume, bags and costs)', () => {
  // spec: calc-topsoil › [TS2] the default bed
  it('gives the default bed and 49 bags of 0.75 cu ft', () => {
    expect(volume({}, 'netVolume')).toEqual(Rational.of(100, 3));
    expect(volume({}, 'volumeFt3')).toEqual(Rational.of(110, 3));
    expect(volume({}, 'volumeYd3', yd3)).toEqual(Rational.of(110, 81));
    expect(Number(volume({}, 'volumeM3', m3).toNumber().toFixed(2))).toBe(1.04);
    expect(ran({}).shopping).toEqual([
      { materialId: 'topsoil', purchaseUnit: 'bag-0-75', qty: 49n },
    ]);
  });

  it.each([
    ['1', 37n],
    ['1-5', 25n],
  ] as const)('counts the bags of %s cu ft', (bag, qty) => {
    expect(ran({ bag }).shopping).toEqual([
      { materialId: 'topsoil', purchaseUnit: `bag-${bag}`, qty },
    ]);
  });

  // spec: calc-topsoil › [TS3] 37 bags at $4 = $148; 110/81 yd³ at $45 = $61.11…
  it('costs the bags and the same volume in bulk', () => {
    const raw = { bag: '1', bagPrice: '4', yardPrice: '45' };
    expect(output(raw, 'bagCost')).toEqual(usd(148));
    expect(output(raw, 'bulkCost')).toEqual(usd(Rational.of(4950, 81)));
  });

  it('needs no bag for an empty bed', () => {
    expect(ran({ depth: '0' }).shopping[0]?.qty).toBe(0n);
  });
});

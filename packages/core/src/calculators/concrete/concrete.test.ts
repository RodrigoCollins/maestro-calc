import { describe, expect, it } from 'vitest';
import { CONCRETE_YIELDS } from '../../__testing__/concrete-yields.ts';
import { toDecimalParts } from '../../format/decimal-parts.ts';
import { DEFINITION_REASONS } from '../../calculator/define.ts';
import { CoreError } from '../../errors.ts';
import { usd } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, ft3, in3, m3, yd3 } from '../../units/catalog.ts';
import { isQuantityOf, quantity, valueIn, type Quantity } from '../../units/quantity.ts';
import type { ValidateOptions } from '../../calculator/descriptors.ts';
import { PI } from '../../geometry/pi.ts';
import { createConcrete } from './index.ts';

const concrete = createConcrete(CONCRETE_YIELDS);

/** The outputs of a run, by key; a failed run is a failed test. */
const outputs = (raw: Readonly<Record<string, unknown>>, options?: ValidateOptions) => {
  const result = concrete.run(raw, options);
  if (!result.ok) throw new Error(`run failed: ${JSON.stringify(result.errors)}`);
  return Object.fromEntries(result.value.outputs.map(({ key, value }) => [key, value]));
};

const VOLUME_KEYS = ['volumeYd3', 'volumeFt3', 'volumeM3', 'netVolume'] as const;

/** The four volume outputs of a run, each a volume quantity. */
const volumes = (raw: Readonly<Record<string, unknown>>, options?: ValidateOptions) => {
  const all = outputs(raw, options);
  const pick = (key: (typeof VOLUME_KEYS)[number]): Quantity<'volume'> => {
    const value = all[key];
    if (!isQuantityOf(value, 'volume')) throw new Error(`${key} is not a volume`);
    return value;
  };
  return {
    volumeYd3: pick('volumeYd3'),
    volumeFt3: pick('volumeFt3'),
    volumeM3: pick('volumeM3'),
    netVolume: pick('netVolume'),
  };
};

/** What a failed action reports: the code, the reason and the cause of its CoreError. */
const failure = (action: () => unknown): { code: string; reason?: string; cause?: unknown } => {
  try {
    action();
  } catch (error) {
    if (error instanceof CoreError) {
      return {
        code: error.code,
        ...(error.reason === undefined ? {} : { reason: error.reason }),
        cause: error.cause,
      };
    }
    throw error;
  }
  return { code: 'NONE' };
};

/** The shopping lines of a run. */
const shoppingOf = (raw: Readonly<Record<string, unknown>>, options?: ValidateOptions) => {
  const result = concrete.run(raw, options);
  if (!result.ok) throw new Error(`run failed: ${JSON.stringify(result.errors)}`);
  return result.value.shopping;
};

const places2 = (value: Rational): string => {
  const { integer, fraction } = toDecimalParts(value, 2);
  return `${integer.toString()}.${fraction}`;
};

describe('createConcrete (calc-concrete › Yield injection)', () => {
  // spec: calc-concrete › [CC4] Valid yields
  it('returns the concrete calculator for valid yields', () => {
    expect(concrete.id).toBe('concrete');
    expect(concrete.inputs).toHaveLength(17);
  });
});

describe('concrete volumes (calc-concrete › Volume computation)', () => {
  // spec: calc-concrete › [CC7] Slab default (S1)
  it('computes the default slab: 40 ft3 net, 44 ft3 with 10% extra', () => {
    const { netVolume, volumeFt3, volumeYd3, volumeM3 } = volumes({});
    expect(valueIn(netVolume, ft3)).toEqual(Rational.of(40));
    expect(valueIn(volumeFt3, ft3)).toEqual(Rational.of(44));
    expect(valueIn(volumeYd3, yd3)).toEqual(Rational.of(44, 27));
    expect(valueIn(volumeM3, m3)).toEqual(Rational.of(608369751, 488281250));
    expect(places2(valueIn(volumeYd3, yd3))).toBe('1.63');
    expect(places2(valueIn(volumeM3, m3))).toBe('1.25');
  });

  // spec: calc-concrete › [CC7] the three volume outputs are the same quantity
  it('returns the same quantity in the three volume outputs', () => {
    const { volumeFt3, volumeYd3, volumeM3 } = volumes({});
    for (const volume of [volumeFt3, volumeYd3, volumeM3]) {
      expect(valueIn(volume, in3)).toEqual(Rational.of(76032));
    }
  });

  // spec: calc-concrete › [CC8] Other slabs (S2)
  it('computes a 20 ft by 15 ft slab, 6 in thick', () => {
    const { volumeFt3, volumeYd3 } = volumes({ length: '20', width: '15', thickness: '6in' });
    expect(valueIn(volumeFt3, ft3)).toEqual(Rational.of(165));
    expect(valueIn(volumeYd3, yd3)).toEqual(Rational.of(55, 9));
  });

  // spec: calc-concrete › [CC8] Other slabs (S3, metric)
  it('computes a 4 m by 3 m slab, 10 cm thick, from bare metric numbers', () => {
    const { netVolume, volumeM3, volumeYd3, volumeFt3 } = volumes(
      { length: '4', width: '3', thickness: '10' },
      { unitSystem: 'metric' },
    );
    expect(valueIn(netVolume, m3)).toEqual(Rational.of(6, 5));
    expect(valueIn(volumeM3, m3)).toEqual(Rational.of(33, 25));
    expect(places2(valueIn(volumeYd3, yd3))).toBe('1.73');
    expect(places2(valueIn(volumeFt3, ft3))).toBe('46.62');
  });

  // spec: calc-concrete › [CC12] Zero dimension (Z)
  it('gives exactly zero volumes for a zero length, with no error', () => {
    const result = volumes({ length: '0' });
    for (const key of VOLUME_KEYS) {
      expect(valueIn(result[key], in3)).toEqual(Rational.ZERO);
    }
  });

  // spec: calc-concrete › [CC12] Maximum bounds, volumes (H)
  it('computes the maximum slab exactly', () => {
    const { netVolume, volumeYd3 } = volumes({
      length: '1000ft',
      width: '1000ft',
      thickness: '10ft',
      waste: '0',
    });
    expect(valueIn(netVolume, ft3)).toEqual(Rational.of(10000000));
    expect(valueIn(volumeYd3, yd3)).toEqual(Rational.of(10000000, 27));
    expect(places2(valueIn(volumeYd3, yd3))).toBe('370370.37');
  });

  // spec: calc-concrete › [CC16] Waste is applied before bags (volumes)
  it.each([
    ['0', 40],
    ['10', 44],
    ['12.5', 45],
  ])('adds %s%% extra: %i ft3', (waste, total) => {
    const { volumeFt3 } = volumes({ waste });
    expect(valueIn(volumeFt3, ft3)).toEqual(Rational.of(total));
  });
});

describe('createConcrete yield validation (calc-concrete › Yield injection)', () => {
  const BAG_YIELDS = {
    code: 'INVALID_DEFINITION',
    reason: 'BAG_YIELDS',
    cause: { id: 'concrete', reason: 'BAG_YIELDS' },
  };
  const withoutSixty = { '40': CONCRETE_YIELDS['40'], '80': CONCRETE_YIELDS['80'] };

  // spec: calc-concrete › [CC5] Invalid yields
  it.each([
    ['a missing 60', withoutSixty],
    ['an extra key 50', { ...CONCRETE_YIELDS, '50': CONCRETE_YIELDS['40'] }],
    ['a zero 80', { ...CONCRETE_YIELDS, '80': quantity(0, ft3) }],
    ['a negative 40', { ...CONCRETE_YIELDS, '40': quantity(-1, ft3) }],
    ['a length for 80', { ...CONCRETE_YIELDS, '80': quantity(1, ft) }],
    ['a lookalike for 60', { ...CONCRETE_YIELDS, '60': { exponents: {}, canonical: 1 } }],
    ['a number for 40', { ...CONCRETE_YIELDS, '40': 3 }],
  ])('throws BAG_YIELDS for %s', (_name, yields) => {
    expect(failure(() => createConcrete(yields as never))).toStrictEqual(BAG_YIELDS);
  });

  // spec: calc-concrete › [CC5] the factory owns the reason
  it('keeps BAG_YIELDS out of the closed reasons of defineCalculator', () => {
    expect(DEFINITION_REASONS).not.toContain('BAG_YIELDS');
  });
});

describe('concrete bags (calc-concrete › Waste and bag shopping)', () => {
  // spec: calc-concrete › [CC14] Default example, three bag sizes
  it.each([
    [{}, 'bag-80', 74n],
    [{ bag: '60' }, 'bag-60', 98n],
    [{ bag: '40' }, 'bag-40', 147n],
  ])('buys the default slab with %j as one line', (raw, purchaseUnit, qty) => {
    expect(shoppingOf(raw)).toEqual([{ materialId: 'concrete-mix', purchaseUnit, qty }]);
  });

  // spec: calc-concrete › [CC16] Waste is applied before bags
  it.each([
    ['0', 67n],
    ['10', 74n],
    ['12.5', 75n],
  ])('buys %s percent extra with the 80 lb bag', (waste, qty) => {
    expect(shoppingOf({ waste })[0]?.qty).toBe(qty);
  });

  // spec: calc-concrete › [CC12] Zero dimension: one line with no bags
  it('keeps one line with qty 0 for a zero length', () => {
    expect(shoppingOf({ length: '0' })).toEqual([
      { materialId: 'concrete-mix', purchaseUnit: 'bag-80', qty: 0n },
    ]);
  });
});

describe('concrete costs (calc-concrete › Costs)', () => {
  const costs = (raw: Readonly<Record<string, unknown>>) => {
    const { bagCost, readyMixCost } = outputs(raw);
    return { bagCost, readyMixCost };
  };

  // spec: calc-concrete › [CC19] Bag cost
  it('prices the bags by the bag count', () => {
    expect(costs({ bagPrice: '6.50' }).bagCost).toEqual(usd(481));
    expect(costs({ bag: '60', bagPrice: '$4.25' }).bagCost).toEqual(usd(Rational.of(833, 2)));
  });

  // spec: calc-concrete › [CC20] Ready-mix cost
  it('prices the ready-mix by the total volume in cubic yards, not the bags', () => {
    const result = costs({ readyMixPrice: '150' });
    expect(result.readyMixCost).toEqual(usd(Rational.of(2200, 9)));
    expect(result.bagCost).toEqual(usd(0));
  });

  // spec: calc-concrete › [CC21] Prices default to zero
  it('costs exactly zero with no price', () => {
    expect(costs({})).toEqual({ bagCost: usd(0), readyMixCost: usd(0) });
  });
});

describe('concrete footing and column (calc-concrete › Volume computation)', () => {
  const FOOTING = { shape: 'footing', length: '18ft' };

  // spec: calc-concrete › [CC9] Footing with a piece count (F1)
  it('computes three 18 ft footings, 16 in by 8 in', () => {
    const { netVolume, volumeFt3, volumeYd3 } = volumes({ ...FOOTING, count: '3' });
    expect(valueIn(netVolume, ft3)).toEqual(Rational.of(48));
    expect(valueIn(volumeFt3, ft3)).toEqual(Rational.of(264, 5));
    expect(valueIn(volumeYd3, yd3)).toEqual(Rational.of(88, 45));
    expect(valueIn(volumes({ ...FOOTING, count: '1' }).netVolume, ft3)).toEqual(Rational.of(16));
  });

  // spec: calc-concrete › [CC10] Column uses PI exactly (C1, C2)
  it.each([
    ['C1', {}, 2, 11, 5, '0.26'],
    ['C2', { count: '4' }, 8, 44, 5, '1.02'],
  ])('computes the columns %s from the exact PI', (_name, extra, netPi, totalPi, over, shown) => {
    const { netVolume, volumeFt3, volumeYd3 } = volumes({ shape: 'column', ...extra });
    expect(valueIn(netVolume, ft3)).toEqual(PI.mul(Rational.of(netPi)));
    expect(valueIn(volumeFt3, ft3)).toEqual(PI.mul(Rational.of(totalPi, over)));
    expect(places2(valueIn(volumeYd3, yd3))).toBe(shown);
  });

  // spec: calc-concrete › [CC13] Unused fields do not matter
  it('ignores the fields the shape does not use', () => {
    const plain = outputs({ ...FOOTING, count: '3' });
    const noisy = outputs({
      ...FOOTING,
      count: '3',
      diameter: '5ft',
      height: '50ft',
      stepCount: '40',
    });
    expect(noisy).toEqual(plain);
  });
});

describe('concrete bags for every shape (calc-concrete › Waste and bag shopping)', () => {
  const S2 = { length: '20', width: '15', thickness: '6in' };
  const F1 = { shape: 'footing', length: '18ft', count: '3' };
  const S3 = { length: '4', width: '3', thickness: '10' };

  // spec: calc-concrete › [CC15] Exact integers do not round up
  it.each([
    [S2, '80', 275n],
    [S2, '40', 550n],
    [F1, '80', 88n],
    [F1, '40', 176n],
  ])('buys exactly %j with the %s lb bag: %s', (raw, bag, qty) => {
    expect(shoppingOf({ ...raw, bag })[0]?.qty).toBe(qty);
  });

  // spec: calc-concrete › [CC17] Other shapes and zero (80, 60 and 40 lb)
  it.each([
    ['C1', { shape: 'column' }, undefined, [12n, 16n, 24n]],
    ['C2', { shape: 'column', count: '4' }, undefined, [47n, 62n, 93n]],
    ['S3', S3, { unitSystem: 'metric' as const }, [78n, 104n, 156n]],
    ['Z', { length: '0' }, undefined, [0n, 0n, 0n]],
  ])('buys the case %s: %j', (_name, raw, options, [qty80, qty60, qty40]) => {
    expect(shoppingOf({ ...raw, bag: '80' }, options)[0]?.qty).toBe(qty80);
    expect(shoppingOf({ ...raw, bag: '60' }, options)[0]?.qty).toBe(qty60);
    expect(shoppingOf({ ...raw, bag: '40' }, options)[0]?.qty).toBe(qty40);
  });
});

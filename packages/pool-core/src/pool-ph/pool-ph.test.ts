import { gal, isQuantityOf, oz, Rational, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { poolPh } from './pool-ph.ts';

// Taylor Technologies, K-1003 instructions (Instr. #5816), pH dosage charts: one drop of acid
// demand reagent (R-0015) in 10,000 gallons is 9.16 fl oz of muriatic acid (20° Baumé, 31.45% HCl),
// and one drop of base demand reagent (R-0016) is 5.13 oz of soda ash (sodium carbonate, 100%).
// The chart lists 1, 2 and 3 drops for 250 to 20,000 gallons, and every cell is that amount times
// the drops times the gallons over 10,000, rounded as printed.
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = poolPh.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
};

const valueOf = (raw: Readonly<Record<string, unknown>>, key: string) =>
  ran(raw).outputs.find((output) => output.key === key)?.value;

/** Fluid ounces of muriatic acid: 1/128 US gallon. */
const acid = (raw: Readonly<Record<string, unknown>>): Rational => {
  const value = valueOf(raw, 'liquid');
  if (!isQuantityOf(value, 'volume')) throw new Error('liquid is not a volume');
  return valueIn(value, gal).mul(Rational.of(128));
};

/** Ounces of soda ash, by weight. */
const sodaAsh = (raw: Readonly<Record<string, unknown>>): Rational => {
  const value = valueOf(raw, 'dry');
  if (!isQuantityOf(value, 'mass')) throw new Error('dry is not a mass');
  return valueIn(value, oz);
};

/** Fluid ounces of any volume output. */
const fluidOunces = (raw: Readonly<Record<string, unknown>>, key: string): Rational => {
  const value = valueOf(raw, key);
  if (!isQuantityOf(value, 'volume')) throw new Error(`${key} is not a volume`);
  return valueIn(value, gal).mul(Rational.of(128));
};

/** Ounces of any mass output. */
const ounces = (raw: Readonly<Record<string, unknown>>, key: string): Rational => {
  const value = valueOf(raw, key);
  if (!isQuantityOf(value, 'mass')) throw new Error(`${key} is not a mass`);
  return valueIn(value, oz);
};

const SODA = { product: 'soda-ash' } as const;

describe('pool pH', () => {
  it('reads the defaults: 20,000 gallons, muriatic acid, 2 drops', () => {
    const state = poolPh.validate({});
    expect(state.ok && state.value).toEqual({
      gallons: Rational.of(20_000),
      product: 'muriatic-31-45',
      drops: 2,
      units: 'us',
    });
  });

  it('gives 9.16 fl oz of muriatic acid a drop per 10,000 gallons, exactly', () => {
    expect(acid({ gallons: '10000', drops: '1' })).toEqual(Rational.of(916, 100));
    expect(sodaAsh({ gallons: '10000', drops: '1' })).toEqual(Rational.ZERO);
  });

  it('gives 5.13 oz of soda ash a drop per 10,000 gallons, exactly', () => {
    expect(sodaAsh({ ...SODA, gallons: '10000', drops: '1' })).toEqual(Rational.of(513, 100));
    expect(acid({ ...SODA, gallons: '10000', drops: '1' })).toEqual(Rational.ZERO);
  });

  // the muriatic acid column of the chart, in fl oz (pt = 16, qt = 32), to its printed digits
  it.each([
    ['250', '1', 0.23, 2],
    ['1000', '3', 2.75, 2],
    ['5000', '1', 4.58, 2],
    ['5000', '3', 13.7, 1],
    ['10000', '2', 1.15 * 16, 0],
    ['15000', '1', 13.7, 1],
    ['20000', '3', 1.72 * 32, 0],
  ] as const)(
    'matches the chart: %s gal, %s drops of acid demand',
    (gallons, drops, flOz, digits) => {
      expect(acid({ gallons, drops }).toNumber()).toBeCloseTo(flOz, digits);
    },
  );

  // the soda ash column, in oz (lb = 16)
  it.each([
    ['250', '1', 0.13, 2],
    ['1000', '3', 1.54, 2],
    ['5000', '2', 5.13, 2],
    ['10000', '3', 15.4, 1],
    ['15000', '3', 1.44 * 16, 0],
    ['20000', '2', 1.28 * 16, 0],
  ] as const)(
    'matches the chart: %s gal, %s drops of base demand',
    (gallons, drops, ounces, digits) => {
      expect(sodaAsh({ ...SODA, gallons, drops }).toNumber()).toBeCloseTo(ounces, digits);
    },
  );

  // 20,000 / 10,000 x 2 x 9.16 = 36.64 fl oz; the chart prints 1.15 qt
  it('adds 36.64 fl oz of acid by default', () => {
    expect(acid({})).toEqual(Rational.of(3664, 100));
    expect(ran({}).shopping).toEqual([]);
  });

  it('adds nothing for no drops', () => {
    expect(acid({ drops: '0' })).toEqual(Rational.ZERO);
    expect(sodaAsh({ ...SODA, drops: '0' })).toEqual(Rational.ZERO);
  });

  it('says the chart stops at 3 drops past it, for either product', () => {
    // past 1 drop the acid is over the label's quart a day, past 3 the soda ash over its pound a
    // time (9.16 and 5.13 a drop against 16 per 10,000 gallons), so the split note comes too
    expect(ran({ ...SODA, drops: '3' }).warnings).toEqual([]);
    expect(ran({ drops: '4' }).warnings).toEqual([
      { code: 'pastChart', params: {} },
      { code: 'splitDays', params: {} },
    ]);
    expect(ran({ ...SODA, drops: '4' }).warnings).toEqual([
      { code: 'pastChart', params: {} },
      { code: 'splitAdditions', params: {} },
    ]);
    // each drop adds the same amount, as every row of the chart does
    expect(acid({ gallons: '10000', drops: '4' })).toEqual(Rational.of(3664, 100));
  });

  // HASA Muriatic Acid (31.45%), directions for use: "add one quart HASA MURIATIC ACID per 20,000
  // gallons of pool water per 24 hours ... Repeat as necessary at 24 hour intervals." A quart is
  // 32 fl oz, so the most a day is gallons x 32 / 20,000 fl oz.
  it('splits 20,000 gallons at 2 drops over 2 days: 36.64 fl oz is over the 32 fl oz a day', () => {
    expect(fluidOunces({}, 'liquidPerDay')).toEqual(Rational.of(32));
    expect(valueOf({}, 'days')).toEqual(Rational.of(2));
    expect(ran({}).warnings).toEqual([{ code: 'splitDays', params: {} }]);
  });

  it('keeps a dose within the label in one day, and caps the day at the pool’s quart share', () => {
    // 10,000 gal x 3 drops = 27.48 fl oz, over 10,000 x 32 / 20,000 = 16 fl oz: 2 days
    expect(fluidOunces({ gallons: '10000', drops: '3' }, 'liquidPerDay')).toEqual(Rational.of(16));
    expect(valueOf({ gallons: '10000', drops: '3' }, 'days')).toEqual(Rational.of(2));
    // 20,000 gal x 1 drop = 18.32 fl oz, under 32: one day, no note
    expect(valueOf({ drops: '1' }, 'days')).toEqual(Rational.of(1));
    expect(ran({ drops: '1' }).warnings).toEqual([]);
    // exactly the quart: 20,000 gal is 32 fl oz a day; 3 drops of 30,000 gal = 82.44 fl oz over
    // 48 a day: 2 days; 10 drops of 20,000 = 183.2 fl oz over 32: 6 days
    expect(valueOf({ gallons: '30000', drops: '3' }, 'days')).toEqual(Rational.of(2));
    expect(valueOf({ drops: '10' }, 'days')).toEqual(Rational.of(6));
    // no acid, no day, and no pool, no most to divide by
    expect(valueOf({ drops: '0' }, 'days')).toEqual(Rational.ZERO);
    expect(valueOf({ gallons: '0' }, 'days')).toEqual(Rational.ZERO);
    expect(valueOf({ ...SODA, gallons: '0' }, 'additions')).toEqual(Rational.ZERO);
    expect(valueOf({ ...SODA }, 'days')).toEqual(Rational.ZERO);
  });

  // pH Up (sodium carbonate 100%) label, made for Alliance Trading (01616483, REV050824): "a
  // maximum of one bag or 1 pound per 10,000 gallons ... Allow water to recirculate two to three
  // hours, recheck pH, and repeat treatments if necessary." 1 lb = 16 oz per 10,000 gallons a time.
  it('splits soda ash past 1 lb per 10,000 gallons into additions 2 to 3 hours apart', () => {
    expect(ounces({ ...SODA }, 'dryPerAddition')).toEqual(Rational.of(32));
    // 20,000 gal x 2 drops = 20.52 oz, under 32: one addition, no note
    expect(valueOf({ ...SODA }, 'additions')).toEqual(Rational.of(1));
    expect(ran({ ...SODA }).warnings).toEqual([]);
    // the chart's 3 drops stay under it: 10,000 gal x 3 = 15.39 oz, under 16
    expect(valueOf({ ...SODA, gallons: '10000', drops: '3' }, 'additions')).toEqual(Rational.of(1));
    // past the chart: 10,000 gal x 4 drops = 20.52 oz over 16: 2 additions
    expect(valueOf({ ...SODA, gallons: '10000', drops: '4' }, 'additions')).toEqual(Rational.of(2));
    expect(ran({ ...SODA, gallons: '10000', drops: '4' }).warnings).toEqual([
      { code: 'pastChart', params: {} },
      { code: 'splitAdditions', params: {} },
    ]);
    expect(valueOf({}, 'additions')).toEqual(Rational.ZERO);
  });

  it('rejects a part of a drop, a negative count, more than 10 drops and another product', () => {
    expect(poolPh.run({ drops: '1.5' }).ok).toBe(false);
    expect(poolPh.run({ drops: '-1' }).ok).toBe(false);
    expect(poolPh.run({ drops: '10' }).ok).toBe(true);
    expect(poolPh.run({ drops: '11' }).ok).toBe(false);
    expect(poolPh.run({ product: 'dry-acid' }).ok).toBe(false);
  });
});

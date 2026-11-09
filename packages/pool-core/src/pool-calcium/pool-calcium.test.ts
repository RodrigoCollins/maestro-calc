import { isQuantityOf, lb, oz, Rational, valueIn } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { poolCalcium } from './pool-calcium.ts';

// The dose is the label's: ClearView Calcium Increaser (Oreq Corporation), calcium chloride flake,
// "To raise calcium hardness 10 ppm use 2 ounces per 1,000 gallons of pool water", which is
// 20 oz = 1.25 lb per 10 ppm per 10,000 gallons. "If more than 3 pounds of this product is needed
// per 10,000 gallons of pool water, separate doses and apply this product at least 12 hours apart."
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = poolCalcium.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
};

const mass = (raw: Readonly<Record<string, unknown>>, key: string, unit = lb): Rational => {
  const value = ran(raw).outputs.find((output) => output.key === key)?.value;
  if (!isQuantityOf(value, 'mass')) throw new Error(`${key} is not a mass`);
  return valueIn(value, unit);
};

describe('the cross-check from first principles', () => {
  // Calcium hardness is read as CaCO3 (100.087 g/mol); one CaCl2 (110.984 g/mol) gives one Ca.
  // 10 ppm in 10,000 US gallons (37,854.11784 L) is 378.54 g of CaCO3, so 419.75 g of CaCl2.
  const pureGrams = (37_854.117_84 * 10 * 110.984) / 100.087 / 1000;
  const GRAMS_PER_POUND = 453.592_37;

  it('needs 0.925 lb of pure calcium chloride per 10 ppm per 10,000 gallons', () => {
    expect(pureGrams / GRAMS_PER_POUND).toBeCloseTo(0.9254, 4);
  });

  it('puts the label at 1.25 lb for a flake of 74% calcium chloride, the low end of its SDS', () => {
    expect(pureGrams / GRAMS_PER_POUND / 0.74).toBeCloseTo(1.25, 2);
  });

  it('keeps the label within 5% of a 77% flake (calcium chloride dihydrate grade)', () => {
    const flake = pureGrams / GRAMS_PER_POUND / 0.77;
    expect(flake).toBeCloseTo(1.202, 3);
    expect(1.25 / flake - 1).toBeLessThan(0.05);
  });
});

describe('pool calcium', () => {
  it('reads the defaults: 20,000 gallons from 180 to 200 ppm', () => {
    const state = poolCalcium.validate({});
    expect(state.ok && state.value).toEqual({
      gallons: Rational.of(20_000),
      current: Rational.of(180),
      target: Rational.of(200),
      units: 'us',
    });
  });

  it('adds the label dose: 1.25 lb, 20 oz, per 10 ppm per 10,000 gallons, exactly', () => {
    const raw = { gallons: '10000', current: '200', target: '210' };
    expect(mass(raw, 'pounds')).toEqual(Rational.of(5, 4));
    expect(mass(raw, 'ounces', oz)).toEqual(Rational.of(20));
    expect(mass(raw, 'ounces')).toEqual(mass(raw, 'pounds'));
  });

  it('matches the label per 1,000 gallons: 2 oz per 10 ppm', () => {
    expect(mass({ gallons: '1000', current: '0', target: '10' }, 'ounces', oz)).toEqual(
      Rational.of(2),
    );
  });

  // 20,000 / 10,000 x 20 / 10 x 1.25 = 5 lb, under the 6 lb a single dose of 20,000 gallons allows
  it('adds 5 lb by default, all at once, with no note', () => {
    expect(mass({}, 'pounds')).toEqual(Rational.of(5));
    expect(mass({}, 'ounces', oz)).toEqual(Rational.of(80));
    expect(mass({}, 'firstAddition')).toEqual(Rational.of(5));
    expect(ran({}).shopping).toEqual([]);
    expect(ran({}).warnings).toEqual([]);
  });

  // 24 ppm in 10,000 gallons is 3 lb: the most the label adds at once, and not more than it
  it('adds 3 lb per 10,000 gallons in one go without a note', () => {
    const raw = { gallons: '10000', current: '200', target: '224' };
    expect(mass(raw, 'pounds')).toEqual(Rational.of(3));
    expect(mass(raw, 'firstAddition')).toEqual(Rational.of(3));
    expect(ran(raw).warnings).toEqual([]);
  });

  // 20,000 gal from 150 to 250 ppm: 2 x 10 x 1.25 = 25 lb, at most 2 x 3 = 6 lb a dose
  it('splits a dose over 3 lb per 10,000 gallons and adds 3 lb per 10,000 first', () => {
    const raw = { current: '150', target: '250' };
    expect(mass(raw, 'pounds')).toEqual(Rational.of(25));
    expect(mass(raw, 'firstAddition')).toEqual(Rational.of(6));
    expect(ran(raw).warnings).toEqual([{ code: 'splitDose', params: {} }]);
  });

  it('adds nothing at the target', () => {
    const raw = { current: '200' };
    expect(mass(raw, 'pounds')).toEqual(Rational.ZERO);
    expect(mass(raw, 'firstAddition')).toEqual(Rational.ZERO);
    expect(ran(raw).warnings).toEqual([]);
  });

  it('adds nothing above the target and says only dilution lowers calcium', () => {
    const over = { current: '450' };
    expect(mass(over, 'pounds')).toEqual(Rational.ZERO);
    expect(mass(over, 'ounces')).toEqual(Rational.ZERO);
    expect(mass(over, 'firstAddition')).toEqual(Rational.ZERO);
    expect(ran(over).warnings).toEqual([{ code: 'dilutionToLower', params: {} }]);
  });

  it('reads up to 3,000 ppm and rejects a negative reading', () => {
    expect(poolCalcium.run({ current: '3000', target: '3000' }).ok).toBe(true);
    expect(poolCalcium.run({ current: '3001' }).ok).toBe(false);
    expect(poolCalcium.run({ current: '-5' }).ok).toBe(false);
  });
});

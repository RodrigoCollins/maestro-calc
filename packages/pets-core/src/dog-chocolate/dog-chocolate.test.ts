import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { dogChocolate } from './dog-chocolate.ts';

// Merck Veterinary Manual, "Chocolate Toxicosis in Animals" (Hayes): theobromine and caffeine
// together in mg per gram: cocoa powder 28.5, unsweetened baking chocolate 15.5, semisweet and
// sweet dark 5.3 to 5.6 (the top is used), cocoa bean hulls 9, milk chocolate 2.3, white 0.04.
// Mild signs from 20 mg/kg, heart effects from 40 to 50, seizures from 60.
// Worked check: a 10 kg dog and 50 g of milk chocolate: 50 x 2.3 = 115 mg, 11.5 mg/kg.
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = dogChocolate.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
};

const figure = (raw: Readonly<Record<string, unknown>>, key: string): number => {
  const value = ran(raw).outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`${key} is not a number`);
  return value.toNumber();
};

const CHECK = { weight: '10', weightUnit: 'kg', type: 'milk', amount: '50', amountUnit: 'g' };

describe('dog chocolate', () => {
  it('reads the defaults: a 20 lb dog that ate 1 oz of milk chocolate', () => {
    const state = dogChocolate.validate({});
    expect(state.ok && state.value).toEqual({
      weight: Rational.of(20),
      weightUnit: 'lb',
      type: 'milk',
      amount: Rational.ONE,
      amountUnit: 'oz',
    });
  });

  it('works the check of the Merck figures: 50 g of milk chocolate for 10 kg is 115 mg, 11.5 mg/kg', () => {
    expect(figure(CHECK, 'totalMg')).toBeCloseTo(115, 6);
    expect(figure(CHECK, 'dose')).toBeCloseTo(11.5, 6);
    expect(figure(CHECK, 'band')).toBe(0);
  });

  it('weighs an ounce as 28.349523125 g, and a pound as 0.45359237 kg', () => {
    // 1 oz of milk: 28.349523125 x 2.3 = 65.203903 mg, over 9.071847 kg = 7.188 mg/kg
    expect(figure({}, 'totalMg')).toBeCloseTo(65.2039, 3);
    expect(figure({}, 'dose')).toBeCloseTo(7.1875, 3);
  });

  it('uses the mg per gram of each kind', () => {
    const mg = (type: string) => figure({ ...CHECK, type, amount: '100' }, 'totalMg');
    expect(mg('white')).toBeCloseTo(4, 6);
    expect(mg('milk')).toBeCloseTo(230, 6);
    expect(mg('dark')).toBeCloseTo(560, 6);
    expect(mg('hulls')).toBeCloseTo(900, 6);
    expect(mg('baking')).toBeCloseTo(1550, 6);
    expect(mg('cocoa-powder')).toBeCloseTo(2850, 6);
  });

  it('places the dose in the band of 20, 40 and 60 mg/kg', () => {
    // 1 kg of dog on dark chocolate: 5.6 mg a gram, so grams x 5.6 mg/kg
    const band = (grams: string) =>
      figure(
        { weight: '1', weightUnit: 'kg', type: 'dark', amount: grams, amountUnit: 'g' },
        'band',
      );
    expect(band('3')).toBe(0); // 16.8
    expect(band('3.6')).toBe(1); // 20.16
    expect(band('7')).toBe(1); // 39.2
    expect(band('7.2')).toBe(2); // 40.32
    expect(band('10')).toBe(2); // 56
    expect(band('11')).toBe(3); // 61.6
  });

  it('puts a dose of exactly 20, 40 or 60 mg/kg in the higher band', () => {
    // cocoa hulls 9 mg a gram, 1 kg: 20/9 g is not exact, so use baking 15.5 x 2 g = 31 ... use milk
    // milk 2.3: 100 g for 11.5 kg is exactly 20 mg/kg
    const band = (amount: string, weight: string) =>
      figure({ weight, weightUnit: 'kg', type: 'milk', amount, amountUnit: 'g' }, 'band');
    expect(band('100', '11.5')).toBe(1);
    expect(band('200', '11.5')).toBe(2);
    expect(band('300', '11.5')).toBe(3);
  });

  it('gives the grams that reach each band: 20 x kg / mg per gram', () => {
    // 10 kg on milk: 200 / 2.3 = 86.96 g, 400 / 2.3 = 173.9 g, 600 / 2.3 = 260.9 g
    expect(figure(CHECK, 'reach20')).toBeCloseTo(86.9565, 3);
    expect(figure(CHECK, 'reach40')).toBeCloseTo(173.913, 3);
    expect(figure(CHECK, 'reach60')).toBeCloseTo(260.8696, 3);
  });

  it('is zero for nothing eaten', () => {
    expect(figure({ ...CHECK, amount: '0' }, 'dose')).toBe(0);
    expect(figure({ ...CHECK, amount: '0' }, 'band')).toBe(0);
  });

  it('keeps no shopping and no warnings', () => {
    expect(ran({}).shopping).toEqual([]);
    expect(ran({}).warnings).toEqual([]);
  });

  it('rejects the weights and amounts it cannot read', () => {
    expect(dogChocolate.run({ weight: '0' }).ok).toBe(false);
    expect(dogChocolate.run({ weight: '0.1' }).ok).toBe(true);
    expect(dogChocolate.run({ weight: '500' }).ok).toBe(true);
    expect(dogChocolate.run({ weight: '501' }).ok).toBe(false);
    expect(dogChocolate.run({ amount: '-1' }).ok).toBe(false);
    expect(dogChocolate.run({ amount: '100000' }).ok).toBe(true);
    expect(dogChocolate.run({ amount: '100001' }).ok).toBe(false);
    expect(dogChocolate.run({ type: 'carob' }).ok).toBe(false);
  });
});

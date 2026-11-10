import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { puppyWeight, SHARES, shareAt } from './puppy-weight.ts';

// Worked by hand from Table 1 of the WALTHAM pocket book of puppy nutrition and care ("adapted from
// NRC (2006)"): the percentage of adult weight at 1, 2, 3, 4, 5, 6, 9, 12, 15 and 18 months for
// small and medium breeds (adult under 25 kg), large breeds (25 to 45 kg) and giant breeds (over
// 45 kg), a straight line between the rows. Weeks are months at 12 / 52: 13 weeks is 3 months,
// 26 weeks 6 months, 39 weeks 9 months. Adult weight = weight now / share of adult weight now.
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = puppyWeight.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
};

const figure = (raw: Readonly<Record<string, unknown>>, key: string): number => {
  const value = ran(raw).outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`${key} is not a number`);
  return value.toNumber();
};

const codes = (raw: Readonly<Record<string, unknown>>): string[] =>
  ran(raw).warnings.map(({ code }) => code);

describe('puppy weight', () => {
  it('reads the defaults: a large-breed puppy of 21 lb at 13 weeks will weigh about 60 lb', () => {
    const state = puppyWeight.validate({});
    expect(state.ok && state.value).toEqual({
      weight: Rational.of(21),
      unit: 'lb',
      age: Rational.of(13),
      size: 'large',
    });
    // 13 weeks = 3 months, 35% of adult weight: 21 / 0.35
    expect(figure({}, 'adult')).toBe(60);
    expect(figure({}, 'share')).toBe(35);
    expect(figure({}, 'months')).toBe(3);
    expect(codes({})).toEqual([]);
  });

  it('transcribes the table as published', () => {
    expect(SHARES).toEqual({
      months: [1, 2, 3, 4, 5, 6, 9, 12, 15, 18],
      small: [9, 22, 37, 52, 61, 70, 83, 95, 100, 100],
      large: [7, 20, 35, 48, 57, 65, 77, 88, 94, 100],
      giant: [6, 14, 26, 38, 49, 60, 70, 80, 90, 100],
    });
  });

  it('reads every row of the table at its own age', () => {
    for (const size of ['small', 'large', 'giant'] as const)
      SHARES.months.forEach((month, row) => {
        expect(shareAt(Rational.of(month), size).toNumber(), `${size} ${String(month)}`).toBe(
          (SHARES[size][row] ?? 0) / 100,
        );
      });
  });

  it('draws a straight line between the rows', () => {
    // 8 weeks = 24/13 months, 11/13 of the way from 1 to 2 months
    expect(shareAt(Rational.of(24, 13), 'small').toNumber()).toBe(0.2); // 9 + 11
    expect(shareAt(Rational.of(24, 13), 'large').toNumber()).toBe(0.18); // 7 + 11
    // giant: 6 + (11/13) x 8 = 12.769...%
    expect(shareAt(Rational.of(24, 13), 'giant').equals(Rational.of(166, 1300))).toBe(true);
    // 16 weeks = 48/13 months, 9/13 of the way from 3 to 4: 37 + (9/13) x 15 = 47.38...%
    expect(shareAt(Rational.of(48, 13), 'small').equals(Rational.of(616, 1300))).toBe(true);
    // 7.5 months, halfway from 6 to 9: 70 + 6.5
    expect(shareAt(Rational.of(15, 2), 'small').toNumber()).toBe(0.765);
  });

  it('holds at 100% from the age the size class is grown', () => {
    expect(shareAt(Rational.of(15), 'small').toNumber()).toBe(1);
    expect(shareAt(Rational.of(20), 'small').toNumber()).toBe(1);
    expect(shareAt(Rational.of(24), 'giant').toNumber()).toBe(1);
  });

  it('works out the adult weight from the weight and the age', () => {
    // 26 weeks = 6 months, small breed at 70%: 14 / 0.70
    expect(figure({ weight: '14', age: '26', size: 'small' }, 'adult')).toBe(20);
    // 39 weeks = 9 months, giant breed at 70%: 70 / 0.70
    expect(figure({ weight: '70', age: '39', size: 'giant' }, 'adult')).toBe(100);
    // 8 weeks, small breed at 20%: 4 / 0.20
    expect(figure({ weight: '4', age: '8', size: 'small' }, 'adult')).toBe(20);
    // 16 weeks, small breed: 10 / (616 / 1300) = 21.10 lb
    expect(figure({ weight: '10', age: '16', size: 'small' }, 'adult')).toBeCloseTo(21.104, 3);
    // 52 weeks = 12 months, large breed at 88%: 44 / 0.88
    expect(figure({ weight: '44', age: '52', size: 'large' }, 'adult')).toBe(50);
  });

  it('gives the range of the size classes on either side of the one chosen', () => {
    // 21 lb at 3 months: small 37% gives 56.76, giant 26% gives 80.77
    expect(figure({}, 'low')).toBeCloseTo(56.757, 3);
    expect(figure({}, 'high')).toBeCloseTo(80.769, 3);
    // a small breed has no smaller class: low is its own figure, high the large one (65% at 6 months)
    expect(figure({ weight: '14', age: '26', size: 'small' }, 'low')).toBe(20);
    expect(figure({ weight: '14', age: '26', size: 'small' }, 'high')).toBeCloseTo(21.538, 3);
    // a giant has no larger class: high is its own figure, low the large one (77% at 9 months)
    expect(figure({ weight: '70', age: '39', size: 'giant' }, 'high')).toBe(100);
    expect(figure({ weight: '70', age: '39', size: 'giant' }, 'low')).toBeCloseTo(90.909, 3);
  });

  it('works in kilograms, and gives the other unit beside it', () => {
    // 10 kg at 3 months, large: 10 / 0.35 = 28.57 kg; 28.57 / 0.45359237 = 62.99 lb
    expect(figure({ weight: '10', unit: 'kg' }, 'adult')).toBeCloseTo(28.571, 3);
    expect(figure({ weight: '10', unit: 'kg' }, 'adultOther')).toBeCloseTo(62.99, 2);
    // 60 lb x 0.45359237 = 27.216 kg
    expect(figure({}, 'adultOther')).toBeCloseTo(27.2155, 4);
  });

  it('names the age each size class is grown: 15 months small and medium, 18 large and giant', () => {
    expect(figure({ size: 'small' }, 'grownBy')).toBe(15);
    expect(figure({ size: 'large' }, 'grownBy')).toBe(18);
    expect(figure({ size: 'giant' }, 'grownBy')).toBe(18);
  });

  it('warns under 12 weeks, where an error on the scale is multiplied the most', () => {
    expect(codes({ weight: '4', age: '8', size: 'small' })).toEqual(['early']);
    expect(codes({ weight: '6', age: '11.9', size: 'small' })).toEqual(['early']);
    expect(codes({ weight: '8', age: '12', size: 'small' })).toEqual([]);
  });

  it('warns that a grown dog weighs its adult weight already', () => {
    // 65 weeks = 15 months: a small breed is grown, a large one is at 94%
    expect(codes({ weight: '20', age: '65', size: 'small' })).toEqual(['grown']);
    expect(figure({ weight: '20', age: '65', size: 'small' }, 'adult')).toBe(20);
    expect(codes({ weight: '75.2', age: '65', size: 'large' })).toEqual([]);
    expect(figure({ weight: '75.2', age: '65', size: 'large' }, 'adult')).toBe(80);
    // 78 weeks = 18 months
    expect(codes({ weight: '60', age: '78', size: 'large' })).toEqual(['grown']);
  });

  it('warns when the estimate falls outside the adult weights of the size class chosen', () => {
    // small at 3 months, 30 lb: 30 / 0.37 = 81 lb = 36.8 kg, over the 25 kg of the class
    expect(codes({ weight: '30', age: '13', size: 'small' })).toEqual(['outsideClass']);
    // large at 3 months, 14 lb: 40 lb = 18.1 kg, under the 25 kg the class starts at
    expect(codes({ weight: '14', age: '13', size: 'large' })).toEqual(['outsideClass']);
    // giant at 9 months, 70 lb: 100 lb = 45.4 kg, just over 45 kg
    expect(codes({ weight: '70', age: '39', size: 'giant' })).toEqual([]);
    // the edges, 6 months at 70% and 65%, 9 months at 70%: 25 kg is small, 45 kg is large
    expect(codes({ weight: '17.5', unit: 'kg', age: '26', size: 'small' })).toEqual([]);
    expect(codes({ weight: '16.25', unit: 'kg', age: '26', size: 'large' })).toEqual([
      'outsideClass',
    ]);
    expect(codes({ weight: '31.5', unit: 'kg', age: '39', size: 'giant' })).toEqual([
      'outsideClass',
    ]);
  });

  it('keeps no shopping', () => {
    expect(ran({}).shopping).toEqual([]);
  });

  it('rejects the weights, ages and choices it cannot read', () => {
    expect(puppyWeight.run({ weight: '0' }).ok).toBe(false);
    expect(puppyWeight.run({ weight: '0.5' }).ok).toBe(true);
    expect(puppyWeight.run({ weight: '250' }).ok).toBe(true);
    expect(puppyWeight.run({ weight: '251' }).ok).toBe(false);
    expect(puppyWeight.run({ age: '5.9' }).ok).toBe(false);
    expect(puppyWeight.run({ age: '6' }).ok).toBe(true);
    expect(puppyWeight.run({ age: '104' }).ok).toBe(true);
    expect(puppyWeight.run({ age: '105' }).ok).toBe(false);
    expect(puppyWeight.run({ size: 'medium' }).ok).toBe(false);
  });
});

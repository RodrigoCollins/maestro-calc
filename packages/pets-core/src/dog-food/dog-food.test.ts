import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { dogFood } from './dog-food.ts';

// Hand-worked with RER = 70 x kg^0.75 (Merck Veterinary Manual; AAHA 2021 Box 1) and the Merck
// factor of the status. 10 kg: 10^0.75 = 5.6234, so RER = 393.64 kcal; neutered x 1.6 = 629.83 kcal.
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = dogFood.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
};

const figure = (raw: Readonly<Record<string, unknown>>, key: string): number => {
  const value = ran(raw).outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`${key} is not a number`);
  return value.toNumber();
};

const TEN_KG = { weight: '10', unit: 'kg' };

describe('dog food', () => {
  it('reads the defaults: a 40 lb neutered dog on a 360 kcal cup', () => {
    const state = dogFood.validate({});
    expect(state.ok && state.value).toEqual({
      weight: Rational.of(40),
      unit: 'lb',
      status: 'neutered',
      basis: 'cup',
      kcal: Rational.of(360),
    });
  });

  // 40 lb = 18.1437 kg, 18.1437^0.75 = 8.7911, RER = 615.38, x 1.6 = 984.61 kcal, / 360 = 2.735 cups
  it('feeds the 40 lb default 985 kcal and 2.74 cups a day', () => {
    expect(figure({}, 'rer')).toBeCloseTo(615.38, 1);
    expect(figure({}, 'mer')).toBeCloseTo(984.61, 1);
    expect(figure({}, 'portion')).toBeCloseTo(2.735, 3);
  });

  it('feeds 10 kg neutered 629.83 kcal, 1.75 cups of 360 kcal', () => {
    expect(figure(TEN_KG, 'mer')).toBeCloseTo(629.83, 1);
    expect(figure(TEN_KG, 'portion')).toBeCloseTo(1.7495, 3);
  });

  it('gives the grams of a label in kcal per kg: 629.83 / 3,600 x 1,000 = 174.95 g', () => {
    expect(figure({ ...TEN_KG, basis: 'kg', kcal: '3600' }, 'portion')).toBeCloseTo(174.95, 1);
  });

  it('gives the cans of a label in kcal per can: 629.83 / 400 = 1.575 cans', () => {
    expect(figure({ ...TEN_KG, basis: 'can', kcal: '400' }, 'portion')).toBeCloseTo(1.5746, 3);
  });

  it('reads a weight in pounds as 0.45359237 kg a pound', () => {
    expect(figure({ weight: '22.0462262185', unit: 'lb' }, 'mer')).toBeCloseTo(
      figure(TEN_KG, 'mer'),
      3,
    );
  });

  it('multiplies by the factor of each status: 1.8 intact, 1.4 inactive, 1.0 weight loss', () => {
    const rer = figure(TEN_KG, 'rer');
    expect(figure({ ...TEN_KG, status: 'intact' }, 'mer')).toBeCloseTo(rer * 1.8, 2);
    expect(figure({ ...TEN_KG, status: 'inactive' }, 'mer')).toBeCloseTo(rer * 1.4, 2);
    expect(figure({ ...TEN_KG, status: 'weight-loss' }, 'mer')).toBeCloseTo(rer, 2);
  });

  it('feeds a puppy 3.0 under 4 months and 2.0 from 4 months', () => {
    const rer = figure(TEN_KG, 'rer');
    expect(figure({ ...TEN_KG, status: 'puppy-young' }, 'mer')).toBeCloseTo(rer * 3, 2);
    expect(figure({ ...TEN_KG, status: 'puppy-older' }, 'mer')).toBeCloseTo(rer * 2, 2);
  });

  it('shows the range of Merck and AAHA: 1.4 to 1.6 times the RER for a neutered dog', () => {
    const rer = figure(TEN_KG, 'rer');
    expect(figure(TEN_KG, 'low')).toBeCloseTo(rer * 1.4, 2);
    expect(figure(TEN_KG, 'high')).toBeCloseTo(rer * 1.6, 2);
  });

  it('allows 10% of the day in treats and feeds 90% of the portion when they are given', () => {
    expect(figure(TEN_KG, 'treats')).toBeCloseTo(62.983, 2);
    expect(figure(TEN_KG, 'portionWithTreats')).toBeCloseTo(1.7495 * 0.9, 3);
  });

  it('keeps no money or shopping: a portion is what the page shows', () => {
    expect(ran({}).shopping).toEqual([]);
    expect(ran({}).warnings).toEqual([]);
  });

  it('rejects a weight of zero, a weight over 500 and a food with no calories', () => {
    expect(dogFood.run({ weight: '0' }).ok).toBe(false);
    expect(dogFood.run({ weight: '0.1' }).ok).toBe(true);
    expect(dogFood.run({ weight: '500' }).ok).toBe(true);
    expect(dogFood.run({ weight: '0.05' }).ok).toBe(false);
    expect(dogFood.run({ weight: '501' }).ok).toBe(false);
    expect(dogFood.run({ kcal: '0' }).ok).toBe(false);
    expect(dogFood.run({ status: 'cat' }).ok).toBe(false);
  });
});

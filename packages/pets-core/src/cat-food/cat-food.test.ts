import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { catFood } from './cat-food.ts';

// Hand-worked with RER = 70 x kg^0.75 (Merck Veterinary Manual; AAHA 2021 Box 1) and the Merck
// factor of the status. 4 kg: 4^0.75 = 2 x sqrt(2) = 2.8284, so RER = 197.99 kcal and a neutered
// cat (x 1.2) needs 237.59 kcal.
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = catFood.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
};

const figure = (raw: Readonly<Record<string, unknown>>, key: string): number => {
  const value = ran(raw).outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`${key} is not a number`);
  return value.toNumber();
};

const FOUR_KG = { weight: '4', unit: 'kg' };

describe('cat food', () => {
  it('reads the defaults: a 10 lb neutered cat on dry food of 350 kcal a cup', () => {
    const state = catFood.validate({});
    expect(state.ok && state.value).toEqual({
      weight: Rational.of(10),
      unit: 'lb',
      status: 'neutered',
      dryKcal: Rational.of(350),
      wetKcal: Rational.of(80),
      wetShare: Rational.ZERO,
    });
  });

  // 10 lb = 4.5359 kg, 4.5359^0.75 = 3.1081, RER = 217.57, x 1.2 = 261.08 kcal, / 350 = 0.746 cup
  it('feeds the 10 lb default 261 kcal and 0.75 cup of dry food a day', () => {
    expect(figure({}, 'rer')).toBeCloseTo(217.57, 1);
    expect(figure({}, 'mer')).toBeCloseTo(261.08, 1);
    expect(figure({}, 'cups')).toBeCloseTo(0.746, 3);
    expect(figure({}, 'cans')).toBe(0);
  });

  it('feeds 4 kg neutered 237.59 kcal', () => {
    expect(figure(FOUR_KG, 'rer')).toBeCloseTo(197.99, 2);
    expect(figure(FOUR_KG, 'mer')).toBeCloseTo(237.59, 2);
  });

  it('feeds wet food only by the can: 237.59 / 80 = 2.97 cans', () => {
    const wet = { ...FOUR_KG, wetShare: '100' };
    expect(figure(wet, 'cans')).toBeCloseTo(2.9698, 3);
    expect(figure(wet, 'cups')).toBe(0);
  });

  it('splits a mix by calories: half wet is 0.339 cup and 1.485 cans', () => {
    const mix = { ...FOUR_KG, wetShare: '50' };
    expect(figure(mix, 'cups')).toBeCloseTo(0.3394, 3);
    expect(figure(mix, 'cans')).toBeCloseTo(1.4849, 3);
  });

  it('feeds a kitten 2.5 times the RER, and 3 kg as 398.91 kcal', () => {
    expect(figure({ weight: '3', unit: 'kg', status: 'kitten' }, 'mer')).toBeCloseTo(398.91, 2);
  });

  it('multiplies by the factor of each status: 1.4 intact, 1.0 inactive, 0.8 weight loss', () => {
    const rer = figure(FOUR_KG, 'rer');
    expect(figure({ ...FOUR_KG, status: 'intact' }, 'mer')).toBeCloseTo(rer * 1.4, 2);
    expect(figure({ ...FOUR_KG, status: 'inactive' }, 'mer')).toBeCloseTo(rer, 2);
    expect(figure({ ...FOUR_KG, status: 'weight-loss' }, 'mer')).toBeCloseTo(rer * 0.8, 2);
  });

  it('shows the range of Merck and AAHA: 1.2 to 1.4 times the RER for a neutered cat', () => {
    const rer = figure(FOUR_KG, 'rer');
    expect(figure(FOUR_KG, 'low')).toBeCloseTo(rer * 1.2, 2);
    expect(figure(FOUR_KG, 'high')).toBeCloseTo(rer * 1.4, 2);
  });

  it('allows 10% of the day in treats and feeds 90% of each amount when they are given', () => {
    const mix = { ...FOUR_KG, wetShare: '50' };
    expect(figure(mix, 'treats')).toBeCloseTo(23.759, 2);
    expect(figure(mix, 'cupsWithTreats')).toBeCloseTo(0.3055, 3);
    expect(figure(mix, 'cansWithTreats')).toBeCloseTo(1.3364, 3);
  });

  it('keeps no shopping and no warnings', () => {
    expect(ran({}).shopping).toEqual([]);
    expect(ran({}).warnings).toEqual([]);
  });

  it('rejects the weights and shares it cannot read', () => {
    expect(catFood.run({ weight: '0' }).ok).toBe(false);
    expect(catFood.run({ weight: '0.1' }).ok).toBe(true);
    expect(catFood.run({ weight: '100' }).ok).toBe(true);
    expect(catFood.run({ weight: '101' }).ok).toBe(false);
    expect(catFood.run({ wetShare: '101' }).ok).toBe(false);
    expect(catFood.run({ wetShare: '-1' }).ok).toBe(false);
    expect(catFood.run({ dryKcal: '0' }).ok).toBe(false);
    expect(catFood.run({ wetKcal: '0' }).ok).toBe(false);
    expect(catFood.run({ status: 'puppy-young' }).ok).toBe(false);
  });
});

import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { dogAge } from './dog-age.ts';

// The size chart, worked by hand:
// - every size, the first two years (Merck Veterinary Manual, dog owners' table, the low end of
//   each row): 6 months 10, 1 year 15, 18 months 20, 2 years 24, a straight line between them;
// - medium (21 to 50 lb), the AVMA chart: 15 24 28 32 36 42 47 51 56 60 65 69 74 78 83 87 for 1 to
//   16 years, then the chart's own average of (87 - 24) / 14 = 4.5 a year;
// - after 2 years, small 4 a year, large 5.5 and giant 7.5 (PetMD, Coates: 4, 5 to 6, 7 to 8).
// The DNA clock (Wang et al. 2020): human age = 16 ln(dog age) + 31.
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = dogAge.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
};

const figure = (raw: Readonly<Record<string, unknown>>, key: string): number => {
  const value = ran(raw).outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`${key} is not a number`);
  return value.toNumber();
};

const human = (age: string, size: string): number => figure({ from: 'dog', age, size }, 'answer');
const dog = (age: string, size: string): number => figure({ from: 'human', age, size }, 'answer');

describe('dog age', () => {
  it('reads the defaults: a 3-year-old medium dog', () => {
    const state = dogAge.validate({});
    expect(state.ok && state.value).toEqual({ from: 'dog', age: Rational.of(3), size: 'medium' });
    expect(figure({}, 'answer')).toBe(28);
  });

  it('gives every size the first two years of Merck: 10, 15, 20 and 24', () => {
    for (const size of ['small', 'medium', 'large', 'giant']) {
      expect(human('0.5', size)).toBe(10);
      expect(human('0.75', size)).toBe(12.5);
      expect(human('1', size)).toBe(15);
      expect(human('1.5', size)).toBe(20);
      expect(human('2', size)).toBe(24);
    }
  });

  it('follows the AVMA chart for a medium dog, year by year', () => {
    const chart = [15, 24, 28, 32, 36, 42, 47, 51, 56, 60, 65, 69, 74, 78, 83, 87];
    expect(chart.map((_, index) => human(String(index + 1), 'medium'))).toEqual(chart);
  });

  it('draws a straight line between the years of the chart, and 4.5 a year past 16', () => {
    expect(human('2.5', 'medium')).toBe(26);
    expect(human('5.5', 'medium')).toBe(39);
    expect(human('18', 'medium')).toBe(96);
    expect(human('20', 'medium')).toBe(105);
  });

  it('adds 4, 5.5 and 7.5 a year after 2 for small, large and giant dogs', () => {
    expect(human('3', 'small')).toBe(28);
    expect(human('10', 'small')).toBe(56);
    expect(human('20', 'small')).toBe(96);
    expect(human('3', 'large')).toBe(29.5);
    expect(human('10', 'large')).toBe(68);
    expect(human('3', 'giant')).toBe(31.5);
    expect(human('10', 'giant')).toBe(84);
    expect(human('16', 'giant')).toBe(129);
  });

  it('works back from a human age to the dog age on the same chart', () => {
    expect(dog('28', 'medium')).toBe(3);
    expect(dog('26', 'medium')).toBe(2.5);
    expect(dog('60', 'small')).toBe(11);
    expect(dog('12.5', 'giant')).toBe(0.75);
    expect(dog('105', 'medium')).toBe(20);
    // 2 + 26 / 5.5
    expect(dog('50', 'large')).toBeCloseTo(6.727273, 6);
  });

  it('gives the DNA clock of Wang et al. both ways', () => {
    expect(figure({ age: '1' }, 'wang')).toBe(31);
    // 16 x ln 3 + 31 = 48.577797
    expect(figure({ age: '3' }, 'wang')).toBeCloseTo(48.577797, 6);
    // 16 x ln 12 + 31 = 70.758506
    expect(figure({ age: '12' }, 'wang')).toBeCloseTo(70.758506, 6);
    expect(figure({ from: 'human', age: '31' }, 'wang')).toBe(1);
    // e^((47 - 31) / 16) = e
    expect(figure({ from: 'human', age: '47' }, 'wang')).toBeCloseTo(2.718282, 6);
  });

  it('gives the seven-year rule for comparison', () => {
    expect(figure({ age: '3' }, 'seven')).toBe(21);
    expect(figure({ from: 'human', age: '28' }, 'seven')).toBe(4);
  });

  it('keeps the dog age and the human age of the chart, whichever was given', () => {
    expect(figure({ age: '3' }, 'dogAge')).toBe(3);
    expect(figure({ age: '3' }, 'humanAge')).toBe(28);
    expect(figure({ from: 'human', age: '28' }, 'dogAge')).toBe(3);
    expect(figure({ from: 'human', age: '28' }, 'humanAge')).toBe(28);
  });

  it('names the AAHA life stage: puppy, young adult, mature adult, then senior by size', () => {
    const stage = (age: string, size = 'medium') => figure({ age, size }, 'stage');
    expect(stage('0.5')).toBe(0);
    expect(stage('0.74')).toBe(0);
    expect(stage('0.75')).toBe(1);
    expect(stage('3.9')).toBe(1);
    expect(stage('4')).toBe(2);
    expect(stage('9.9')).toBe(2);
    expect(stage('10')).toBe(3);
    expect(stage('10.9', 'small')).toBe(2);
    expect(stage('11', 'small')).toBe(3);
    expect(stage('7.9', 'large')).toBe(2);
    expect(stage('8', 'large')).toBe(3);
    expect(stage('6.9', 'giant')).toBe(2);
    expect(stage('7', 'giant')).toBe(3);
  });

  it('gives the senior age of each size from VCA: 11, 10, 8 and 7', () => {
    const at = (size: string) => figure({ size }, 'seniorAt');
    expect([at('small'), at('medium'), at('large'), at('giant')]).toEqual([11, 10, 8, 7]);
  });

  it('warns when the dog age is outside the 6 months to 20 years of the sources', () => {
    expect(ran({ age: '0.5' }).warnings).toEqual([]);
    const codes = (raw: Readonly<Record<string, string>>) =>
      ran(raw).warnings.map(({ code }) => code);
    expect(codes({ age: '20' })).not.toContain('outside');
    expect(ran({ age: '21' }).warnings.map(({ code }) => code)).toContain('outside');
    expect(ran({ from: 'human', age: '9' }).warnings.map(({ code }) => code)).toContain('outside');
    expect(
      ran({ from: 'human', age: '97', size: 'small' }).warnings.map(({ code }) => code),
    ).toContain('outside');
    expect(codes({ from: 'human', age: '96', size: 'small' })).not.toContain('outside');
    expect(codes({ from: 'human', age: '10', size: 'small' })).toEqual([]);
  });

  it('warns when the DNA clock reads a dog age outside the 16 years of its study', () => {
    expect(ran({ age: '16' }).warnings).toEqual([]);
    expect(ran({ age: '17' }).warnings.map(({ code }) => code)).toEqual(['wangOutside']);
    // e^((80 - 31) / 16) = 21.4 dog years
    expect(ran({ from: 'human', age: '80' }).warnings.map(({ code }) => code)).toEqual([
      'wangOutside',
    ]);
  });

  it('keeps no shopping', () => {
    expect(ran({}).shopping).toEqual([]);
  });

  it('rejects the ages and choices it cannot read', () => {
    expect(dogAge.run({ age: '0.4' }).ok).toBe(false);
    expect(dogAge.run({ age: '0.5' }).ok).toBe(true);
    expect(dogAge.run({ age: '120' }).ok).toBe(true);
    expect(dogAge.run({ age: '121' }).ok).toBe(false);
    expect(dogAge.run({ size: 'tiny' }).ok).toBe(false);
    expect(dogAge.run({ from: 'cat' }).ok).toBe(false);
  });
});

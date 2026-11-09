import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import {
  catAge,
  careStageOf,
  catYearsOf,
  cornellHumanYearsOf,
  humanYearsOf,
  stageOf,
} from './cat-age.ts';

// The chart, worked by hand from the table of the 2010 AAFP-AAHA Feline Life Stage Guidelines:
// 1 month 1 (0 to 1), 2 months 2 and 3 months 4 (2 to 4), 4 months 7 (the middle of 6 to 8),
// 6 months 10, 7 months 12, 12 months 15, 18 months 21, 2 years 24, then 4 a year (25 years 116),
// a straight line between the rows.
// Cornell Feline Health Center: 16 at 1, 21 at 2, then about 4 a year.
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = catAge.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
};

const figure = (raw: Readonly<Record<string, unknown>>, key: string): number => {
  const value = ran(raw).outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`${key} is not a number`);
  return value.toNumber();
};

const human = (age: string): number => figure({ from: 'cat', age }, 'answer');
const cat = (age: string): number => figure({ from: 'human', age }, 'answer');
const codes = (raw: Readonly<Record<string, string>>): string[] =>
  ran(raw).warnings.map(({ code }) => code);

describe('cat age', () => {
  it('reads the defaults: a 5-year-old cat is 36', () => {
    const state = catAge.validate({});
    expect(state.ok && state.value).toEqual({ from: 'cat', age: Rational.of(5) });
    expect(figure({}, 'answer')).toBe(36);
  });

  it('follows the table of the 2010 guidelines through the kitten months', () => {
    expect(human('0')).toBe(0);
    expect(human(String(1 / 12).slice(0, 6))).toBeCloseTo(1, 2);
    expect(human('0.25')).toBe(4);
    expect(human('0.5')).toBe(10);
    expect(human('1')).toBe(15);
    expect(human('1.5')).toBe(21);
    expect(human('2')).toBe(24);
    expect(humanYearsOf(Rational.of(1, 12)).toNumber()).toBe(1);
    expect(humanYearsOf(Rational.of(1, 6)).toNumber()).toBe(2);
    expect(humanYearsOf(Rational.of(1, 3)).toNumber()).toBe(7);
    expect(humanYearsOf(Rational.of(7, 12)).toNumber()).toBe(12);
  });

  it('adds 4 human years a year after 2, to 116 at 25 and on past it', () => {
    const table = [15, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80, 84, 88, 92, 96];
    expect(table.map((_, index) => human(String(index + 1)))).toEqual(table);
    expect(human('25')).toBe(116);
    expect(human('26')).toBe(120);
  });

  it('draws a straight line between the rows', () => {
    // 7 months 12, 12 months 15: 12 + (1/6) x 3 / (5/12) = 13.2
    expect(human('0.75')).toBe(13.2);
    expect(human('1.25')).toBe(18);
    expect(human('5.5')).toBe(38);
  });

  it('works back from a human age to the cat age on the same chart', () => {
    expect(cat('36')).toBe(5);
    expect(cat('13.2')).toBe(0.75);
    expect(cat('15')).toBe(1);
    expect(cat('50')).toBe(8.5);
    expect(cat('116')).toBe(25);
    // 1/3 + (9 - 7) / 18
    expect(cat('9')).toBeCloseTo(4 / 9, 12);
    expect(catYearsOf(Rational.of(4)).equals(Rational.of(1, 4))).toBe(true);
  });

  it('gives Cornell’s figure beside it: 16 at 1, 21 at 2, then 4 a year', () => {
    const cornell = (age: string) => figure({ age }, 'cornell');
    expect(cornell('1')).toBe(16);
    expect(cornell('2')).toBe(21);
    expect(cornell('10')).toBe(53);
    expect(cornell('12')).toBe(61);
    expect(cornell('15')).toBe(73);
    expect(cornell('1.5')).toBe(18.5);
    expect(cornell('0.5')).toBe(8);
    expect(cornellHumanYearsOf(Rational.of(20)).toNumber()).toBe(93);
    // worked back: 2 + (50 - 21) / 4
    expect(figure({ from: 'human', age: '50' }, 'cornell')).toBe(9.25);
    expect(figure({ from: 'human', age: '16' }, 'cornell')).toBe(1);
    expect(figure({ from: 'human', age: '18.5' }, 'cornell')).toBe(1.5);
  });

  it('gives the seven-year rule for comparison', () => {
    expect(figure({ age: '5' }, 'seven')).toBe(35);
    expect(figure({ from: 'human', age: '28' }, 'seven')).toBe(4);
  });

  it('keeps the cat age and the human age of the chart, whichever was given', () => {
    expect(figure({ age: '5' }, 'catAge')).toBe(5);
    expect(figure({ age: '5' }, 'humanAge')).toBe(36);
    expect(figure({ from: 'human', age: '36' }, 'catAge')).toBe(5);
    expect(figure({ from: 'human', age: '36' }, 'humanAge')).toBe(36);
  });

  it('names the 2021 AAHA/AAFP life stage: kitten, young adult, mature adult, senior over 10', () => {
    const stage = (age: string) => figure({ age }, 'stage');
    expect(stage('0.99')).toBe(0);
    expect(stage('1')).toBe(1);
    expect(stage('6.99')).toBe(1);
    expect(stage('7')).toBe(2);
    expect(stage('10')).toBe(2);
    expect(stage('10.01')).toBe(3);
    expect(stage('20')).toBe(3);
    expect(stageOf(Rational.of(11))).toBe(3);
    // worked back: 60 human years is 11 cat years
    expect(figure({ from: 'human', age: '60' }, 'stage')).toBe(3);
  });

  it('names the six stages of International Cat Care, kitten to super senior', () => {
    const care = (age: string) => figure({ age }, 'careStage');
    expect(care('0.5')).toBe(0);
    expect(care(String(7 / 12).slice(0, 8))).toBe(0);
    expect(careStageOf(Rational.of(7, 12))).toBe(1);
    expect(care('2.99')).toBe(1);
    expect(care('3')).toBe(2);
    expect(care('6.99')).toBe(2);
    expect(care('7')).toBe(3);
    expect(care('10.99')).toBe(3);
    expect(care('11')).toBe(4);
    expect(care('14.99')).toBe(4);
    expect(care('15')).toBe(5);
  });

  it('counts the visits a year of the 2021 guidelines: one at least, two for a senior', () => {
    const visits = (age: string) => figure({ age }, 'visits');
    expect([visits('0.5'), visits('5'), visits('10'), visits('11')]).toEqual([1, 1, 1, 2]);
  });

  it('warns past the 25 years of the table', () => {
    expect(codes({ age: '25' })).toEqual([]);
    expect(codes({ age: '25.5' })).toEqual(['outside']);
    expect(codes({ from: 'human', age: '116' })).toEqual([]);
    expect(codes({ from: 'human', age: '117' })).toEqual(['outside']);
  });

  it('warns that Cornell gives no figure under 1 year', () => {
    expect(codes({ age: '0.9' })).toEqual(['cornellOutside']);
    expect(codes({ age: '1' })).toEqual([]);
    expect(codes({ from: 'human', age: '15.9' })).toEqual(['cornellOutside']);
    expect(codes({ from: 'human', age: '16' })).toEqual([]);
  });

  it('keeps no shopping', () => {
    expect(ran({}).shopping).toEqual([]);
  });

  it('rejects the ages and choices it cannot read', () => {
    expect(catAge.run({ age: '-1' }).ok).toBe(false);
    expect(catAge.run({ age: '0' }).ok).toBe(true);
    expect(catAge.run({ age: '120' }).ok).toBe(true);
    expect(catAge.run({ age: '121' }).ok).toBe(false);
    expect(catAge.run({ from: 'dog' }).ok).toBe(false);
  });
});

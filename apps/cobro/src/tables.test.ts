import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { marginRows, markupRows, rateOfExample } from './tables.ts';

// hand-verified: margin = markup / (1 + markup)
describe('markup table', () => {
  it('turns each markup into the margin it leaves', () => {
    expect(markupRows('en')).toEqual([
      ['10%', '9.09%'],
      ['15%', '13.04%'],
      ['20%', '16.67%'],
      ['25%', '20%'],
      ['30%', '23.08%'],
      ['50%', '33.33%'],
      ['100%', '50%'],
    ]);
  });

  it('writes the percent with a space in Spanish', () => {
    expect(markupRows('es')[2]).toEqual(['20 %', '16.67 %']);
  });
});

// hand-verified: markup = margin / (1 - margin)
describe('margin table', () => {
  it('turns each margin into the markup that gives it', () => {
    expect(marginRows('en')).toEqual([
      ['10%', '11.11%'],
      ['20%', '25%'],
      ['25%', '33.33%'],
      ['30%', '42.86%'],
      ['40%', '66.67%'],
      ['50%', '100%'],
    ]);
  });

  it('writes the percent with a space in Spanish', () => {
    expect(marginRows('es')[1]).toEqual(['20 %', '25 %']);
  });
});

// (60,000 + 12,000) / (46 x 30) = 72,000 / 1,380 = 52.1739...
describe('the hourly-rate example', () => {
  it('divides the income and the costs by the hours that can be billed', () => {
    expect(rateOfExample()).toEqual(Rational.of(72_000, 1_380));
    expect(rateOfExample().mul(Rational.of(100)).floor()).toBe(5217n);
  });
});

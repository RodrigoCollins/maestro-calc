import { Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { phasedOut } from './phase-out.ts';

// Schedule 1-A (Form 1040) 2025, lines 7-13 (tips) and 15-21 (overtime): the capped amount less
// $100 for each whole $1,000 of MAGI over the threshold, never below zero.
// https://www.irs.gov/pub/irs-pdf/f1040s1a.pdf
describe('phasedOut', () => {
  it.each([
    // capped, MAGI, threshold, deduction
    [12_500, 60_000, 150_000, 12_500],
    [12_500, 150_000, 150_000, 12_500],
    [12_500, 150_999, 150_000, 12_500],
    [12_500, 151_000, 150_000, 12_400],
    [12_500, 165_500, 150_000, 11_000],
    [25_000, 310_999, 300_000, 24_000],
    [12_500, 275_000, 150_000, 0],
    [12_500, 400_000, 150_000, 0],
    [4_400, 190_000, 150_000, 400],
  ])('caps %d at MAGI %d over %d to %d', (capped, magi, threshold, deduction) => {
    expect(phasedOut(usd(capped), usd(magi), usd(threshold))).toEqual(usd(deduction));
  });

  it('keeps the cents of the capped amount: $1,234.56 at MAGI $152,000 is $1,034.56', () => {
    expect(phasedOut(usd(Rational.of(123456, 100)), usd(152_000), usd(150_000))).toEqual(
      usd(Rational.of(103456, 100)),
    );
  });
});

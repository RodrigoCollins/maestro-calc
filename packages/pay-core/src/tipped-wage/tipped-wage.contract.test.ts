import { Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { tippedWage } from './tipped-wage.ts';

// The URL keys are a public contract: a shared link must reopen the same week forever.
describe('tipped wage contract', () => {
  it('keys the cash wage, the tips and the hours of the week', () => {
    expect(tippedWage.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['cashWage', 'c'],
      ['tips', 't'],
      ['hours', 'h'],
    ]);
  });

  it('starts at the federal cash wage of $2.13, $250 in tips and 40 hours', () => {
    expect(tippedWage.inputs.map((input) => input.default)).toEqual([
      usd(Rational.of(213, 100)),
      usd(250),
      Rational.of(40),
    ]);
  });

  it('leads with the pay per hour, then the week, the tip credit, the top-up and overtime', () => {
    expect(tippedWage.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['perHour', 'primary'],
      ['totalPay', 'secondary'],
      ['wages', 'secondary'],
      ['tipsPerHour', 'secondary'],
      ['tipCredit', 'secondary'],
      ['topUp', 'secondary'],
      ['overtimeHours', 'secondary'],
      ['overtimePremium', 'secondary'],
    ]);
  });

  it('warns when the employer owes a top-up to the minimum wage', () => {
    expect(tippedWage.warnings).toEqual(['topUpOwed']);
  });
});

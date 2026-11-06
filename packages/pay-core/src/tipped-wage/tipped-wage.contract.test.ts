import { decode, encode, Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { tippedWage } from './tipped-wage.ts';

// The URL keys are a public contract: a shared link must reopen the same week forever.
describe('tipped wage contract', () => {
  it('keys the cash wage, the tips and the hours of the week', () => {
    expect(tippedWage.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['cashWage', 'c'],
      ['tips', 't'],
      ['hours', 'h'],
      ['minimumWage', 'm'],
      ['maxTipCredit', 'k'],
    ]);
  });

  it('starts at the federal figures: $2.13 cash, $250 in tips, 40 h, $7.25 and $5.12', () => {
    expect(tippedWage.inputs.map((input) => input.default)).toEqual([
      usd(Rational.of(213, 100)),
      usd(250),
      Rational.of(40),
      usd(Rational.of(725, 100)),
      usd(Rational.of(512, 100)),
    ]);
  });

  it('reopens a link written before the state figures on the federal $7.25 and $5.12', () => {
    const { state, issues } = decode(tippedWage, 'v=1&c=3&t=150&h=44');
    expect(issues).toEqual([]);
    expect(state).toEqual({
      cashWage: usd(3),
      tips: usd(150),
      hours: Rational.of(44),
      minimumWage: usd(Rational.of(725, 100)),
      maxTipCredit: usd(Rational.of(512, 100)),
    });
  });

  it('writes a federal week as before and adds a state only by its own keys', () => {
    const federal = tippedWage.validate({ tips: '150' });
    const arizona = tippedWage.validate({
      cashWage: '12.15',
      minimumWage: '15.15',
      maxTipCredit: '3',
    });
    if (!federal.ok || !arizona.ok) throw new Error('the weeks must validate');
    expect(encode(tippedWage, federal.value)).toBe('v=1&t=150');
    expect(encode(tippedWage, arizona.value)).toMatch(/^v=1&c=[^&]+&m=[^&]+&k=3$/);
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

import { Rational, usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { shiftDifferential } from './shift-differential.ts';

// The URL keys are a public contract: a shared link must reopen the same week forever.
describe('shift differential contract', () => {
  it('keys the rate, the kind of differential, its size and the hours of each rate', () => {
    expect(shiftDifferential.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['rate', 'r'],
      ['source', 's'],
      ['percent', 'p'],
      ['amount', 'a'],
      ['baseHours', 'b'],
      ['shiftHours', 'n'],
    ]);
  });

  it('starts at $20 an hour, 10 percent more for 16 of 40 hours', () => {
    expect(shiftDifferential.inputs.map((input) => input.default)).toEqual([
      usd(20),
      'percent',
      Rational.of(10),
      usd(2),
      Rational.of(24),
      Rational.of(16),
    ]);
  });

  it('leads with the pay of the week, then the rates, the hours and the overtime', () => {
    expect(shiftDifferential.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['pay', 'primary'],
      ['shiftRate', 'secondary'],
      ['differentialPay', 'secondary'],
      ['straightPay', 'secondary'],
      ['totalHours', 'secondary'],
      ['regularRate', 'secondary'],
      ['overtimeHours', 'secondary'],
      ['overtimePremium', 'secondary'],
    ]);
  });

  it('warns when the hours are more than a week has', () => {
    expect(shiftDifferential.warnings).toEqual(['moreThanAWeek']);
  });
});

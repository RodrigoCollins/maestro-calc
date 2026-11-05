import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { ptoAccrual } from './pto-accrual.ts';

// The URL keys are a public contract: a shared link must reopen the same accrual forever.
describe('PTO accrual contract', () => {
  it('keys the days off, the hours of a day off and the hours worked a week', () => {
    expect(ptoAccrual.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['ptoDays', 'd'],
      ['hoursPerDay', 'h'],
      ['hoursPerWeek', 'w'],
    ]);
  });

  it('starts at 10 days of 8 hours on a 40 hour week', () => {
    expect(ptoAccrual.inputs.map((input) => input.default)).toEqual([
      Rational.of(10),
      Rational.of(8),
      Rational.of(40),
    ]);
  });

  it('leads with the hours earned every two weeks, then the other periods and the rates', () => {
    expect(ptoAccrual.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['biweekly', 'primary'],
      ['weekly', 'secondary'],
      ['semimonthly', 'secondary'],
      ['monthly', 'secondary'],
      ['perHourWorked', 'secondary'],
      ['hoursPerPtoHour', 'secondary'],
      ['annualHours', 'secondary'],
    ]);
  });

  it('warns when the time off is more than the hours worked', () => {
    expect(ptoAccrual.warnings).toEqual(['moreThanWorked']);
  });
});

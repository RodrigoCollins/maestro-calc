import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { decimalHours } from './decimal-hours.ts';

// The URL keys are a public contract: a shared link must reopen the same conversion forever.
describe('minutes to decimal hours contract', () => {
  it('keys the hours, the minutes and the decimal hours', () => {
    expect(decimalHours.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['hours', 'h'],
      ['minutes', 'm'],
      ['decimal', 'd'],
    ]);
  });

  it('starts at 8 h 20 min and 7.75 h', () => {
    expect(decimalHours.inputs.map((input) => input.default)).toEqual([8, 20, Rational.of(31, 4)]);
  });

  it('leads with the decimal hours, then the decimal read back as hours and minutes', () => {
    expect(decimalHours.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['decimalHours', 'primary'],
      ['fromDecimal', 'secondary'],
    ]);
  });
});

import { describe, expect, it } from 'vitest';
import { payConverter } from './pay-converter.ts';

describe('pay converter outputs', () => {
  it('leads with the annual pay, then every other period', () => {
    expect(payConverter.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['annual', 'primary'],
      ['hourly', 'secondary'],
      ['weekly', 'secondary'],
      ['biweekly', 'secondary'],
      ['semimonthly', 'secondary'],
      ['monthly', 'secondary'],
    ]);
  });
});

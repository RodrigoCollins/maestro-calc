import { usd } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { shiftPay } from './shift-pay.ts';

// The URL keys are a public contract: a shared link must reopen the same shift forever. The time
// keys are the hours calculator's, so its links read the same here.
describe('shift pay calculator contract', () => {
  it('keys the start, the end, the break and the rate', () => {
    expect(shiftPay.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['start', 's'],
      ['end', 'e'],
      ['unpaidBreak', 'b'],
      ['rate', 'r'],
    ]);
  });

  it('starts at 9:00 to 17:00 with a 30 minute break at $20 an hour', () => {
    expect(shiftPay.inputs.map((input) => input.default)).toEqual([540, 1020, 30, usd(20)]);
  });

  it('leads with the paid hours, then the shift, the day and the week', () => {
    expect(shiftPay.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['hours', 'primary'],
      ['shiftHours', 'secondary'],
      ['dayPay', 'secondary'],
      ['weekHours', 'secondary'],
      ['overtimeHours', 'secondary'],
      ['weekPay', 'secondary'],
    ]);
  });
});

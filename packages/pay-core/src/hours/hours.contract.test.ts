import { describe, expect, it } from 'vitest';
import { hoursBetween } from './hours.ts';

// The URL keys are a public contract: a shared link must reopen the same shift forever.
describe('hours calculator contract', () => {
  it('keys the start, the end and the break', () => {
    expect(hoursBetween.inputs.map(({ key, urlKey }) => [key, urlKey])).toEqual([
      ['start', 's'],
      ['end', 'e'],
      ['unpaidBreak', 'b'],
    ]);
  });

  it('starts at 9:00 to 17:30 with a 30 minute break', () => {
    expect(hoursBetween.inputs.map((input) => input.default)).toEqual([540, 1050, 30]);
  });

  it('leads with the hours worked, then the length of the shift', () => {
    expect(hoursBetween.outputs.map(({ key, role }) => [key, role])).toEqual([
      ['hours', 'primary'],
      ['shiftHours', 'secondary'],
    ]);
  });
});

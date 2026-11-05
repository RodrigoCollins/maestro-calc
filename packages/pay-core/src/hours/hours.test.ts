import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { hoursBetween } from './hours.ts';

// Hand-verified: 9:00 to 17:30 is 8 h 30 min, less a 30 min break is 8 h 0 min = 8.00 h;
// 22:00 to 6:15 crosses midnight: 2 h to midnight + 6 h 15 min = 8 h 15 min = 8.25 h.
const r = (n: number, d = 1): Rational => Rational.of(n, d);

const ranOf = (raw: Readonly<Record<string, unknown>>) => {
  const ran = hoursBetween.run(raw);
  if (!ran.ok) throw new Error(JSON.stringify(ran.errors));
  const outputs = Object.fromEntries(ran.value.outputs.map(({ key, value }) => [key, value]));
  return { outputs, warnings: ran.value.warnings };
};

describe('hours between two times', () => {
  it('counts 9:00 to 17:30 less a 30 minute break as 8 hours', () => {
    expect(ranOf({})).toEqual({ outputs: { hours: r(8), shiftHours: r(17, 2) }, warnings: [] });
  });

  it('reads 12-hour times the same: 9:00 am to 5:30 pm', () => {
    expect(ranOf({ start: '9:00 am', end: '5:30 pm' }).outputs['hours']).toEqual(r(8));
  });

  it('counts an end before the start into the next day: 22:00 to 6:15 is 8.25 hours', () => {
    expect(ranOf({ start: '22:00', end: '6:15', unpaidBreak: '0' })).toEqual({
      outputs: { hours: r(33, 4), shiftHours: r(33, 4) },
      warnings: [{ code: 'overnight', params: {} }],
    });
  });

  it('calls a shift that ends at midnight overnight, and one that starts there not', () => {
    const { outputs, warnings } = ranOf({ start: '16:00', end: '0:00', unpaidBreak: '0' });
    expect(outputs['hours']).toEqual(r(8));
    expect(warnings).toEqual([{ code: 'overnight', params: {} }]);
    expect(ranOf({ start: '0:00', end: '8:00', unpaidBreak: '0' }).warnings).toEqual([]);
  });

  it('keeps odd minutes exact: 8:07 to 16:52 less 45 minutes is 8 hours', () => {
    expect(ranOf({ start: '8:07', end: '16:52', unpaidBreak: '45' }).outputs['hours']).toEqual(
      r(8),
    );
    expect(ranOf({ start: '8:00', end: '8:20', unpaidBreak: '0' }).outputs['hours']).toEqual(
      r(1, 3),
    );
  });

  it('warns and counts zero when the break is as long as the shift, or longer', () => {
    for (const unpaidBreak of ['30', '45']) {
      expect(ranOf({ start: '7:00', end: '7:30', unpaidBreak }), unpaidBreak).toEqual({
        outputs: { hours: r(0), shiftHours: r(1, 2) },
        warnings: [{ code: 'breakTooLong', params: {} }],
      });
    }
    expect(ranOf({ start: '7:00', end: '7:31', unpaidBreak: '30' })).toEqual({
      outputs: { hours: r(1, 60), shiftHours: r(31, 60) },
      warnings: [],
    });
  });

  it('warns about the same start and end, and counts zero', () => {
    expect(ranOf({ start: '9:00', end: '9:00', unpaidBreak: '0' })).toEqual({
      outputs: { hours: r(0), shiftHours: r(0) },
      warnings: [{ code: 'sameTime', params: {} }],
    });
  });

  it('warns about a missing time, and counts zero', () => {
    for (const blank of [{ start: '' }, { end: '' }, { start: '', end: '' }]) {
      expect(ranOf(blank), JSON.stringify(blank)).toEqual({
        outputs: { hours: r(0), shiftHours: r(0) },
        warnings: [{ code: 'missingTime', params: {} }],
      });
    }
  });

  it('refuses a time it cannot read and a break over 12 hours', () => {
    expect(hoursBetween.run({ start: '25:00' }).ok).toBe(false);
    expect(hoursBetween.run({ end: '9:75' }).ok).toBe(false);
    expect(hoursBetween.run({ unpaidBreak: '721' }).ok).toBe(false);
    expect(hoursBetween.run({ unpaidBreak: '720' }).ok).toBe(true);
  });
});

import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import { civilFromDays } from './dates.ts';
import { dogDueDate } from './dog-due-date.ts';

// Merck Veterinary Manual, "Whelping and Queening in Dogs and Cats" (Davidson, July 2026): 58 to 72
// days from the first day the female allowed breeding; 64 to 66 days from the LH surge or the first
// rise of progesterone above 2 ng/mL; 56 to 58 days from the first day of diestrus.
const ran = (raw: Readonly<Record<string, unknown>>) => {
  const result = dogDueDate.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value;
};

const day = (raw: Readonly<Record<string, unknown>>, key: string) => {
  const value = ran(raw).outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`${key} is not a number`);
  return civilFromDays(value.toNumber());
};

const number = (raw: Readonly<Record<string, unknown>>, key: string): number => {
  const value = ran(raw).outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`${key} is not a number`);
  return value.toNumber();
};

const MARCH_FIRST = { year: '2026', month: '3', day: '1' };

describe('dog due date', () => {
  it('reads the defaults: breeding on 1 March 2026', () => {
    const state = dogDueDate.validate({});
    expect(state.ok && state.value).toEqual({
      method: 'breeding',
      year: 2026,
      month: 3,
      day: 1,
    });
  });

  // 1 March + 58 days = 28 April (30 days to 31 March, 28 more); + 72 days = 12 May
  it('gives the window of 58 to 72 days from the first day of breeding: 28 April to 12 May', () => {
    expect(day(MARCH_FIRST, 'earliest')).toEqual({ year: 2026, month: 4, day: 28 });
    expect(day(MARCH_FIRST, 'latest')).toEqual({ year: 2026, month: 5, day: 12 });
    expect(number(MARCH_FIRST, 'minDays')).toBe(58);
    expect(number(MARCH_FIRST, 'maxDays')).toBe(72);
  });

  // 1 March + 64 = 4 May (30 to 31 March, 30 to 30 April, 4 more); + 66 = 6 May
  it('gives 64 to 66 days from the LH surge: 4 May to 6 May', () => {
    const lh = { ...MARCH_FIRST, method: 'lh' };
    expect(day(lh, 'earliest')).toEqual({ year: 2026, month: 5, day: 4 });
    expect(day(lh, 'latest')).toEqual({ year: 2026, month: 5, day: 6 });
  });

  // 1 March + 56 = 26 April; + 58 = 28 April
  it('gives 56 to 58 days from the first day of diestrus: 26 April to 28 April', () => {
    const diestrus = { ...MARCH_FIRST, method: 'diestrus' };
    expect(day(diestrus, 'earliest')).toEqual({ year: 2026, month: 4, day: 26 });
    expect(day(diestrus, 'latest')).toEqual({ year: 2026, month: 4, day: 28 });
  });

  it('crosses a year end and a leap day', () => {
    // 15 December 2025 + 58 = 11 February 2026
    expect(day({ year: '2025', month: '12', day: '15' }, 'earliest')).toEqual({
      year: 2026,
      month: 2,
      day: 11,
    });
    // 28 February 2024 + 58 = 26 April 2024 (2024 has 29 days in February)
    expect(day({ year: '2024', month: '2', day: '28' }, 'earliest')).toEqual({
      year: 2024,
      month: 4,
      day: 26,
    });
  });

  it('keeps the day of the date the window counts from', () => {
    expect(day(MARCH_FIRST, 'from')).toEqual({ year: 2026, month: 3, day: 1 });
  });

  it('moves a day past the end of the month back to its last day, and says so', () => {
    const late = { year: '2026', month: '2', day: '31' };
    expect(day(late, 'from')).toEqual({ year: 2026, month: 2, day: 28 });
    expect(ran(late).warnings).toEqual([{ code: 'dayMovedBack', params: {} }]);
    expect(ran({ year: '2024', month: '2', day: '30' }).warnings).toEqual([
      { code: 'dayMovedBack', params: {} },
    ]);
    expect(ran({ year: '2024', month: '2', day: '29' }).warnings).toEqual([]);
    expect(ran(MARCH_FIRST).warnings).toEqual([]);
  });

  it('keeps no shopping', () => {
    expect(ran({}).shopping).toEqual([]);
  });

  it('rejects a date it cannot read', () => {
    expect(dogDueDate.run({ month: '0' }).ok).toBe(false);
    expect(dogDueDate.run({ month: '13' }).ok).toBe(false);
    expect(dogDueDate.run({ month: '1' }).ok).toBe(true);
    expect(dogDueDate.run({ month: '12' }).ok).toBe(true);
    expect(dogDueDate.run({ day: '0' }).ok).toBe(false);
    expect(dogDueDate.run({ day: '32' }).ok).toBe(false);
    expect(dogDueDate.run({ day: '31' }).ok).toBe(true);
    expect(dogDueDate.run({ year: '1969' }).ok).toBe(false);
    expect(dogDueDate.run({ year: '1970' }).ok).toBe(true);
    expect(dogDueDate.run({ year: '2100' }).ok).toBe(true);
    expect(dogDueDate.run({ year: '2101' }).ok).toBe(false);
    expect(dogDueDate.run({ method: 'ultrasound' }).ok).toBe(false);
  });
});

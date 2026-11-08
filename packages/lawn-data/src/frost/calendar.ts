/** Days per month of the 365-day calendar the frost day numbers use (no February 29). */
const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/** A day number (1 = January 1 ... 365 = December 31) as a month (1..12) and day of month. */
export function monthDayOfDay(day: number): { month: number; day: number } {
  if (!Number.isInteger(day) || day < 1 || day > 365) {
    throw new RangeError(`day number must be an integer in 1..365, got ${String(day)}`);
  }
  let rest = day;
  for (const [index, length] of MONTH_DAYS.entries()) {
    if (rest <= length) return { month: index + 1, day: rest };
    rest -= length;
  }
  throw new RangeError(`day number out of range: ${String(day)}`);
}

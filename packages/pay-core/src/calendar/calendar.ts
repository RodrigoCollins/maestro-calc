/*
 * Calendar arithmetic of the date pages: civil dates (`m` 1 to 12) worked through `Date.UTC`, so
 * no time zone or daylight saving shift moves a day. The caller says which day is today (the
 * visitor's local date in the browser, a fixed date in a test); nothing here reads a clock.
 */

/** A calendar date: year, month (1 to 12) and day of the month. */
export interface CivilDate {
  readonly y: number;
  readonly m: number;
  readonly d: number;
}

const DAY_MS = 86_400_000;
/** The first and the last year of a date this module reads: the Gregorian calendar, four digits. */
const FIRST_YEAR = 1583;
const LAST_YEAR = 9999;

const mod = (value: number, by: number): number => ((value % by) + by) % by;

export const isLeapYear = (y: number): boolean => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

export const daysInMonth = (y: number, m: number): number =>
  m === 2 ? (isLeapYear(y) ? 29 : 28) : [4, 6, 9, 11].includes(m) ? 30 : 31;

/** Whether `date` is a real date of the Gregorian calendar, 1583 to 9999. */
export const isValidDate = ({ y, m, d }: CivilDate): boolean =>
  Number.isInteger(y) &&
  Number.isInteger(m) &&
  Number.isInteger(d) &&
  y >= FIRST_YEAR &&
  y <= LAST_YEAR &&
  m >= 1 &&
  m <= 12 &&
  d >= 1 &&
  d <= daysInMonth(y, m);

/** The `YYYY-MM-DD` of a date field as a date, or `null` for anything else. */
export const parseIsoDate = (text: string): CivilDate | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.trim());
  if (match === null) return null;
  const date = { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
  return isValidDate(date) ? date : null;
};

const two = (value: number): string => String(value).padStart(2, '0');

/** A date as `YYYY-MM-DD`, the value of a date field. */
export const isoOf = ({ y, m, d }: CivilDate): string => `${String(y)}-${two(m)}-${two(d)}`;

const utcOf = ({ y, m, d }: CivilDate): number => Date.UTC(y, m - 1, d);

const fromUtc = (ms: number): CivilDate => {
  const date = new Date(ms);
  return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() };
};

export const addDays = (date: CivilDate, days: number): CivilDate =>
  fromUtc(utcOf(date) + days * DAY_MS);

/** The days from `from` to `to`, negative when `to` comes first. */
export const daysFrom = (from: CivilDate, to: CivilDate): number =>
  Math.round((utcOf(to) - utcOf(from)) / DAY_MS);

/** The weekday of a date, 0 for Monday to 6 for Sunday. */
export const weekdayOf = (date: CivilDate): number => mod(new Date(utcOf(date)).getUTCDay() - 1, 7);

/**
 * Easter Sunday of a Gregorian year, by the anonymous Gregorian computus (Meeus, Jones and
 * Butcher): the Sunday after the ecclesiastical full moon on or after March 21.
 */
export const easterOf = (y: number): CivilDate => {
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { y, m: month, d: day };
};

/** The `n`th (1 for the first) `weekday` (0 for Monday) of a month. */
export const nthWeekdayOf = (y: number, m: number, weekday: number, n: number): CivilDate => {
  const first = { y, m, d: 1 };
  return addDays(first, mod(weekday - weekdayOf(first), 7) + (n - 1) * 7);
};

/**
 * When a dated day falls in a year: on a fixed date, some days from Easter Sunday (Good Friday is
 * −2), or on the `n`th weekday of a month.
 */
export type DateRule =
  | { readonly kind: 'fixed'; readonly m: number; readonly d: number }
  | { readonly kind: 'easter'; readonly offset: number }
  | {
      readonly kind: 'nth-weekday';
      readonly m: number;
      readonly weekday: number;
      readonly n: number;
    };

export const dateOfRule = (rule: DateRule, y: number): CivilDate => {
  if (rule.kind === 'fixed') return { y, m: rule.m, d: rule.d };
  if (rule.kind === 'easter') return addDays(easterOf(y), rule.offset);
  return nthWeekdayOf(y, rule.m, rule.weekday, rule.n);
};

/** The next date of `rule` from `today`, today's own when it is today, and the days to it. */
export const nextOccurrence = (
  rule: DateRule,
  today: CivilDate,
): { readonly date: CivilDate; readonly days: number } => {
  const thisYear = dateOfRule(rule, today.y);
  const date = daysFrom(today, thisYear) >= 0 ? thisYear : dateOfRule(rule, today.y + 1);
  return { date, days: daysFrom(today, date) };
};

/** Days as whole weeks and the days left. */
export const weeksAndDaysOf = (
  days: number,
): { readonly weeks: number; readonly days: number } => ({
  weeks: Math.floor(days / 7),
  days: days % 7,
});

/** The days between two dates and how they split. */
export interface DaysBetween {
  /** The days counted: the end minus the start, plus 1 when both ends count. */
  readonly days: number;
  readonly weeks: number;
  readonly restDays: number;
  /** The Mondays to Fridays among the days counted; holidays are not taken out. */
  readonly businessDays: number;
  /** Whether the end came before the start: the two were swapped. */
  readonly reversed: boolean;
}

/**
 * The days from `start` to `end`. Without `inclusive` the days counted are those after the start
 * up to the end (the end minus the start); with it, the start counts too.
 */
export const daysBetween = (start: CivilDate, end: CivilDate, inclusive: boolean): DaysBetween => {
  const reversed = daysFrom(start, end) < 0;
  const [from, to] = reversed ? [end, start] : [start, end];
  const days = daysFrom(from, to) + (inclusive ? 1 : 0);
  // the first day counted, then its weekdays: five a whole week, then each day left one by one
  const first = inclusive ? weekdayOf(from) : mod(weekdayOf(from) + 1, 7);
  const { weeks, days: restDays } = weeksAndDaysOf(days);
  let businessDays = weeks * 5;
  for (let i = 0; i < restDays; i += 1) if (mod(first + i, 7) < 5) businessDays += 1;
  return { days, weeks, restDays, businessDays, reversed };
};

/**
 * The pay of working a mandatory rest day in Mexico (Ley Federal del Trabajo, art. 75): the day's
 * wage, which is owed for the rest day anyway, plus double wages for the service, in cents.
 */
export const restDayPayOf = (
  wageCents: number,
): { readonly wage: number; readonly double: number; readonly total: number } => {
  if (!Number.isInteger(wageCents) || wageCents < 0)
    throw new RangeError(`a daily wage is whole cents, 0 or more: ${String(wageCents)}`);
  return { wage: wageCents, double: wageCents * 2, total: wageCents * 3 };
};

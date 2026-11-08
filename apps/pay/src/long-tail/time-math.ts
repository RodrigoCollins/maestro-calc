/*
 * The clock and calendar arithmetic of the live time pages, with no import at all: the build uses
 * it for the tables of each page, and the one client script (`../client/time-now.ts`) for the
 * answer it fills from the visitor's clock. Times of day are minutes from midnight; dates are
 * civil dates (`m` 1 to 12), worked through `Date.UTC` so no time zone or daylight saving shift
 * moves a day.
 */

const DAY_MINUTES = 1440;
const DAY_MS = 86_400_000;

/** A calendar date: year, month (1 to 12) and day of the month. */
export interface CivilDate {
  readonly y: number;
  readonly m: number;
  readonly d: number;
}

const mod = (value: number, by: number): number => ((value % by) + by) % by;

/** `minutes` (a time of day) moved by `delta` minutes: the time it lands on and the days crossed. */
export const clockShift = (minutes: number, delta: number): { minutes: number; days: number } => ({
  minutes: mod(minutes + delta, DAY_MINUTES),
  days: Math.floor((minutes + delta) / DAY_MINUTES),
});

/** The minutes from `now` to the next `target` (both times of day): tomorrow's once it has passed. */
export const untilOf = (now: number, target: number): { minutes: number; tomorrow: boolean } => {
  const wait = target - now;
  return wait >= 0
    ? { minutes: wait, tomorrow: false }
    : { minutes: wait + DAY_MINUTES, tomorrow: true };
};

/** Minutes as hours and minutes, the same in both languages: `6 h 0 min`. */
export const durationOf = (minutes: number): string =>
  `${String(Math.floor(minutes / 60))} h ${String(minutes % 60)} min`;

export const isLeap = (y: number): boolean => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

export const daysInMonth = (y: number, m: number): number =>
  m === 2 ? (isLeap(y) ? 29 : 28) : [4, 6, 9, 11].includes(m) ? 30 : 31;

const utcOf = ({ y, m, d }: CivilDate): number => Date.UTC(y, m - 1, d);

const fromUtc = (ms: number): CivilDate => {
  const date = new Date(ms);
  return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() };
};

export const addDays = (date: CivilDate, days: number): CivilDate =>
  fromUtc(utcOf(date) + days * DAY_MS);

/** `months` calendar months on, the day of the month kept, or the last day of a shorter month. */
export const addMonths = (date: CivilDate, months: number): CivilDate => {
  const index = date.y * 12 + date.m - 1 + months;
  const y = Math.floor(index / 12);
  const m = mod(index, 12) + 1;
  return { y, m, d: Math.min(date.d, daysInMonth(y, m)) };
};

/** The weekday of a date, 0 for Monday to 6 for Sunday. */
export const weekdayOf = (date: CivilDate): number => mod(new Date(utcOf(date)).getUTCDay() - 1, 7);

/** The days from `from` to `to`, negative when `to` comes first. */
export const dayDelta = (from: CivilDate, to: CivilDate): number =>
  Math.round((utcOf(to) - utcOf(from)) / DAY_MS);

/**
 * The weekdays, Monday to Friday, among the `days` days after a day of weekday `start` (0 is
 * Monday), the start left out; a negative `days` counts the days before it.
 */
export const weekdaysIn = (start: number, days: number): number => {
  const step = Math.sign(days);
  let count = 0;
  for (let i = 1; i <= Math.abs(days); i += 1) if (mod(start + i * step, 7) < 5) count += 1;
  return count;
};

/** The local calendar date of a moment, as the visitor's clock reads it. */
export const civilOf = (moment: Date): CivilDate => ({
  y: moment.getFullYear(),
  m: moment.getMonth() + 1,
  d: moment.getDate(),
});

/** `template` with each `{name}` of `values` in its place; an unknown name stays as written. */
export const fillTemplate = (template: string, values: Readonly<Record<string, string>>): string =>
  template.replace(/\{(\w+)\}/g, (whole, name: string) => values[name] ?? whole);

/** How the client writes a moment, in the page's language (`Intl.DateTimeFormat`). */
export interface LiveFormats {
  readonly time: (moment: Date) => string;
  readonly weekday: (moment: Date) => string;
  readonly date: (moment: Date) => string;
}

/**
 * The live answer of a time page at `now`: `kind` and `data` are the `data-*` attributes of its
 * slot (`LongTailPage.live`), the sentences in them filled with the figures. An offset is signed
 * minutes, a countdown its time of day, a date signed days or months; an unknown kind, or a
 * sentence the slot lacks, leaves the page as built (`undefined`).
 */
export const liveTextOf = (
  kind: string,
  data: Readonly<Record<string, string | undefined>>,
  now: Date,
  formats: LiveFormats,
): string | undefined => {
  const amount = Number(data['amount']);
  const fill = (template: string | undefined, values: Readonly<Record<string, string>>) =>
    template === undefined
      ? undefined
      : fillTemplate(template, { now: formats.time(now), ...values });
  if (kind === 'offset') {
    const then = new Date(now.getTime() + amount * 60_000);
    const days = dayDelta(civilOf(now), civilOf(then));
    const template = days < 0 ? data['before'] : days > 0 ? data['after'] : data['same'];
    return fill(template, { time: formats.time(then), weekday: formats.weekday(then) });
  }
  if (kind === 'until') {
    const { minutes, tomorrow } = untilOf(now.getHours() * 60 + now.getMinutes(), amount);
    return fill(tomorrow ? data['tomorrow'] : data['today'], { duration: durationOf(minutes) });
  }
  if (kind === 'date') {
    const today = civilOf(now);
    const { y, m, d } =
      data['unit'] === 'month' ? addMonths(today, amount) : addDays(today, amount);
    return fill(data['text'], {
      today: formats.date(now),
      date: formats.date(new Date(y, m - 1, d)),
    });
  }
  return undefined;
};

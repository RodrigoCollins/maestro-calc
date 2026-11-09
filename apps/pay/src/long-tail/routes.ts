/*
 * The long-tail jobs and their paths, with no import at all: the browser suites of
 * `tooling/site-browser/e2e-pay` read the page list from here without the workspace install, and
 * their typecheck loads even type-only imports (`../time-card/receipt.ts` reaches the core). The
 * two types below are structural copies; `../routes.ts` checks them by using `LONG_TAIL_ROUTES`
 * as its own `Route[]`.
 */

type Lang = 'en' | 'es';

interface Route {
  readonly id: string;
  readonly kind: 'calculator' | 'article';
  readonly en: string;
  readonly es: string;
}

/**
 * One common search a calculator answers (plans/growth/PLAN.md, lever 1). A `convert` job is the
 * pay converter's: an hourly rate people ask the yearly pay of, or a salary they ask the hourly
 * rate of, at 40 hours a week and 52 paid weeks. An `overtime` job is the time card's: the time
 * and a half of an hourly rate, and the pay of common overtime hours past 40 in the week. Only the
 * amount is given; every figure of the page is the engine's.
 */
export interface Job {
  readonly kind: 'convert' | 'overtime';
  readonly amount: string;
  readonly per: 'hour' | 'year';
  readonly slug: Readonly<Record<Lang, string>>;
}

/** An amount as a slug reads it: `17.50` is `17-50`. */
const amountSlugOf = (amount: string): string => amount.replace('.', '-');

const hourly = (amount: string): Job => ({
  kind: 'convert',
  amount,
  per: 'hour',
  slug: {
    en: `${amountSlugOf(amount)}-an-hour-is-how-much-a-year`,
    es: `${amountSlugOf(amount)}-la-hora-cuanto-es-al-ano`,
  },
});

const salary = (amount: string): Job => ({
  kind: 'convert',
  amount,
  per: 'year',
  slug: { en: `${amount}-a-year-is-how-much-an-hour`, es: `${amount}-al-ano-cuanto-es-por-hora` },
});

const overtime = (amount: string): Job => ({
  kind: 'overtime',
  amount,
  per: 'hour',
  slug: { en: `time-and-a-half-for-${amount}-an-hour`, es: `tiempo-y-medio-de-${amount}-la-hora` },
});

/** Each kind in ascending order: the calculators list them in this order. */
export const JOBS: readonly Job[] = [
  hourly('12'),
  hourly('13'),
  hourly('14'),
  hourly('15'),
  hourly('16'),
  hourly('17'),
  hourly('17.50'),
  hourly('18'),
  hourly('19'),
  hourly('20'),
  hourly('21'),
  hourly('22'),
  hourly('23'),
  hourly('24'),
  hourly('25'),
  hourly('26'),
  hourly('27'),
  hourly('28'),
  hourly('29'),
  hourly('30'),
  hourly('31'),
  hourly('32'),
  hourly('33'),
  hourly('35'),
  hourly('36'),
  hourly('37'),
  hourly('38'),
  hourly('40'),
  hourly('42'),
  hourly('45'),
  hourly('50'),
  hourly('55'),
  hourly('60'),
  hourly('65'),
  hourly('70'),
  hourly('75'),
  hourly('80'),
  hourly('100'),
  salary('25000'),
  salary('30000'),
  salary('35000'),
  salary('40000'),
  salary('45000'),
  salary('50000'),
  salary('55000'),
  salary('60000'),
  salary('65000'),
  salary('70000'),
  salary('75000'),
  salary('80000'),
  salary('85000'),
  salary('90000'),
  salary('95000'),
  salary('100000'),
  salary('110000'),
  salary('120000'),
  salary('130000'),
  salary('150000'),
  salary('200000'),
  overtime('15'),
  overtime('16'),
  overtime('17'),
  overtime('18'),
  overtime('19'),
  overtime('20'),
  overtime('21'),
  overtime('22'),
  overtime('23'),
  overtime('24'),
  overtime('25'),
  overtime('26'),
  overtime('28'),
  overtime('30'),
  overtime('35'),
  overtime('40'),
];

/**
 * A shift people ask the hours of, "how many hours is 9am to 5pm": the hours calculator's. The
 * times are minutes from midnight; an end before the start is the next day, so the shift crosses
 * midnight. Every figure of its page is the engine's.
 */
export interface Shift {
  readonly kind: 'shift';
  readonly start: number;
  readonly end: number;
  readonly slug: Readonly<Record<Lang, string>>;
}

/** A time of a slug: `9am`, `8-30am` in English, `9-am`, `8-30-am` in Spanish. */
const clockSlugOf = (minutes: number): Readonly<Record<Lang, string>> => {
  const hour = Math.floor(minutes / 60);
  const clock = String(hour % 12 === 0 ? 12 : hour % 12);
  const time = minutes % 60 === 0 ? clock : `${clock}-${String(minutes % 60).padStart(2, '0')}`;
  const half = hour < 12 ? 'am' : 'pm';
  return { en: `${time}${half}`, es: `${time}-${half}` };
};

/** `'8:30'` is 510 minutes from midnight. */
const minutesOf = (time: string): number => {
  const [hour = '', minute = ''] = time.split(':');
  return Number(hour) * 60 + Number(minute);
};

/** A shift from `from` to `to`, each a time of a 24-hour clock. */
const shift = (from: string, to: string): Shift => {
  const start = minutesOf(from);
  const end = minutesOf(to);
  const s = clockSlugOf(start);
  const e = clockSlugOf(end);
  return {
    kind: 'shift',
    start,
    end,
    slug: {
      en: `how-many-hours-is-${s.en}-to-${e.en}`,
      es: `cuantas-horas-son-de-${s.es}-a-${e.es}`,
    },
  };
};

/** By length, then by start: the hours calculator lists them, and a page links its nearest, so. */
export const SHIFTS: readonly Shift[] = [
  shift('9:00', '15:00'),
  shift('10:00', '16:00'),
  shift('8:00', '15:00'),
  shift('9:00', '16:00'),
  shift('5:00', '13:00'),
  shift('6:00', '14:00'),
  shift('7:00', '15:00'),
  shift('8:00', '16:00'),
  shift('8:30', '16:30'),
  shift('9:00', '17:00'),
  shift('10:00', '18:00'),
  shift('11:00', '19:00'),
  shift('12:00', '20:00'),
  shift('14:00', '22:00'),
  shift('15:00', '23:00'),
  shift('16:00', '0:00'),
  shift('22:00', '6:00'),
  shift('23:00', '7:00'),
  shift('6:00', '14:30'),
  shift('8:00', '16:30'),
  shift('8:30', '17:00'),
  shift('6:00', '15:00'),
  shift('7:00', '16:00'),
  shift('8:00', '17:00'),
  shift('9:00', '18:00'),
  shift('10:00', '19:00'),
  shift('6:00', '16:00'),
  shift('7:00', '17:00'),
  shift('8:00', '18:00'),
  shift('6:00', '18:00'),
  shift('7:00', '19:00'),
  shift('8:00', '20:00'),
  shift('9:00', '21:00'),
  shift('19:00', '7:00'),
  shift('20:00', '8:00'),
  shift('21:00', '9:00'),
];

/**
 * Paid days off a year people ask the PTO per paycheck of, "how much PTO do I earn with 15 days a
 * year": the PTO accrual calculator's, at its defaults (8-hour days off, a 40-hour week) and every
 * two weeks. Every figure of its page is the engine's.
 */
export interface Pto {
  readonly kind: 'pto';
  readonly days: number;
  readonly slug: Readonly<Record<Lang, string>>;
}

const pto = (days: number): Pto => ({
  kind: 'pto',
  days,
  slug: {
    en: `pto-per-paycheck-with-${String(days)}-days-a-year`,
    es: `vacaciones-por-cheque-con-${String(days)}-dias-al-ano`,
  },
});

/** In ascending order: the PTO accrual calculator lists them, and a page links its nearest, so. */
export const PTOS: readonly Pto[] = [5, 10, 12, 15, 20, 25].map(pto);

/**
 * Minutes people ask the decimal hours of, "what is 15 minutes in decimal hours": the minutes to
 * decimal hours converter's. Every figure of its page is the engine's.
 */
export interface Minutes {
  readonly kind: 'minutes';
  readonly minutes: number;
  readonly slug: Readonly<Record<Lang, string>>;
}

const minutes = (count: number): Minutes => ({
  kind: 'minutes',
  minutes: count,
  slug: {
    en: `what-is-${String(count)}-minutes-in-decimal-hours`,
    es: `cuanto-son-${String(count)}-minutos-en-horas-decimales`,
  },
});

/** In ascending order: the converter lists them, and a page links its nearest, so. */
export const MINUTES: readonly Minutes[] = [10, 15, 20, 30, 40, 45, 50].map(minutes);

/**
 * An hourly rate people ask the double time of, "what is double time for $20 an hour": the
 * overtime calculator's, under the California rule, where hours past 12 in a day pay double. Only
 * the rate is given; every figure of its page is the engine's.
 */
export interface DoubleTime {
  readonly kind: 'double';
  readonly amount: string;
  readonly slug: Readonly<Record<Lang, string>>;
}

const double = (amount: string): DoubleTime => ({
  kind: 'double',
  amount,
  slug: { en: `double-time-for-${amount}-an-hour`, es: `tiempo-doble-de-${amount}-la-hora` },
});

/** In ascending order: the overtime calculator lists them, and a page links its nearest, so. */
export const DOUBLES: readonly DoubleTime[] = ['15', '18', '20', '22', '25', '30'].map(double);

/**
 * An hourly rate and a shift differential people ask the pay of, "what is a 10% shift differential
 * on $20 an hour" or "$18 an hour with a $2 shift differential": the shift differential
 * calculator's, as a percent of the rate or an amount an hour. Only the rate and the differential
 * are given; every figure of its page is the engine's.
 */
export interface Differential {
  readonly kind: 'differential';
  readonly amount: string;
  readonly source: 'percent' | 'amount';
  readonly differential: string;
  readonly slug: Readonly<Record<Lang, string>>;
}

const percentOn = (differential: string, amount: string): Differential => ({
  kind: 'differential',
  amount,
  source: 'percent',
  differential,
  slug: {
    en: `${differential}-percent-shift-differential-on-${amount}-an-hour`,
    es: `diferencial-de-turno-del-${differential}-por-ciento-sobre-${amount}-la-hora`,
  },
});

const dollarsOn = (differential: string, amount: string): Differential => ({
  kind: 'differential',
  amount,
  source: 'amount',
  differential,
  slug: {
    en: `${amount}-an-hour-with-a-${differential}-dollar-shift-differential`,
    es: `${amount}-la-hora-con-diferencial-de-turno-de-${differential}-dolares`,
  },
});

/**
 * The percents first, then the dollars an hour, each by rate and then by differential: the shift
 * differential calculator lists them, and a page links its nearest, so.
 */
export const DIFFERENTIALS: readonly Differential[] = [
  percentOn('10', '15'),
  percentOn('10', '18'),
  percentOn('10', '20'),
  percentOn('15', '20'),
  percentOn('10', '22'),
  percentOn('10', '25'),
  percentOn('10', '30'),
  dollarsOn('2', '15'),
  dollarsOn('2', '18'),
  dollarsOn('1', '20'),
  dollarsOn('2', '20'),
  dollarsOn('3', '20'),
  dollarsOn('2', '25'),
];

/**
 * A tipped week at the $2.13 federal cash wage people ask about: the tipped wage calculator's.
 * An `owed` week asks whether the employer owes a top-up to the $7.25 minimum, an `overtime` week
 * asks what the hours over 40 add, and a `perHour` week asks the tips per hour. Only the tips and
 * the hours are given; every figure of its page is the engine's.
 */
export interface Tipped {
  readonly kind: 'tipped';
  readonly question: 'owed' | 'overtime' | 'perHour';
  readonly tips: string;
  readonly hours: string;
  readonly slug: Readonly<Record<Lang, string>>;
}

const owed = (tips: string): Tipped => ({
  kind: 'tipped',
  question: 'owed',
  tips,
  hours: '40',
  slug: {
    en: `2-13-an-hour-plus-${tips}-in-tips-for-40-hours`,
    es: `2-13-la-hora-mas-${tips}-de-propinas-en-40-horas`,
  },
});

/** The tips of every tipped overtime week: enough to cover the tip credit up to 60 hours. */
const OVERTIME_TIPS = '400';

const tippedOvertime = (hours: string): Tipped => ({
  kind: 'tipped',
  question: 'overtime',
  tips: OVERTIME_TIPS,
  hours,
  slug: {
    en: `tipped-overtime-for-${hours}-hours-at-2-13-an-hour`,
    es: `horas-extra-con-propinas-${hours}-horas-a-2-13-la-hora`,
  },
});

const tipsPerHour = (tips: string, hours: string): Tipped => ({
  kind: 'tipped',
  question: 'perHour',
  tips,
  hours,
  slug: {
    en: `${tips}-in-tips-over-${hours}-hours-is-how-much-an-hour`,
    es: `${tips}-de-propinas-en-${hours}-horas-cuanto-es-por-hora`,
  },
});

/**
 * The top-up weeks by tips, the overtime weeks by hours, then the tips per hour by hours and by
 * tips: the tipped wage calculator lists them, and a page links its nearest, so.
 */
export const TIPPED: readonly Tipped[] = [
  owed('100'),
  owed('150'),
  owed('200'),
  owed('250'),
  owed('300'),
  tippedOvertime('45'),
  tippedOvertime('50'),
  tippedOvertime('55'),
  tippedOvertime('60'),
  tipsPerHour('200', '20'),
  tipsPerHour('300', '25'),
  tipsPerHour('500', '40'),
  tipsPerHour('800', '40'),
];

/**
 * A number of hours people ask the calendar days of, "how many days is 72 hours": plain
 * arithmetic, 24 hours a day, set beside the same hours as working time (8-hour workdays, 40-hour
 * workweeks, 2,080-hour work years). The hours calculator lists them.
 */
export interface Days {
  readonly kind: 'days';
  readonly hours: number;
  readonly slug: Readonly<Record<Lang, string>>;
}

const days = (hours: number): Days => ({
  kind: 'days',
  hours,
  slug: {
    en: `how-many-days-is-${String(hours)}-hours`,
    es: `cuantos-dias-son-${String(hours)}-horas`,
  },
});

/** In ascending order: the hours calculator lists them, and a page links its nearest, so. */
export const DAYS: readonly Days[] = [
  48, 72, 96, 100, 200, 300, 400, 500, 1000, 1500, 2000, 3000, 10000,
].map(days);

/**
 * A time some hours ago, some hours from now or some minutes from now, "what time was it 15 hours
 * ago": the visitor's
 * clock moved by the offset. The page is built once, so it gives the rule and the table from each
 * hour of the day, and `../client/time-now.ts` fills the answer from the visitor's clock.
 */
export interface TimeOffset {
  readonly kind: 'time-offset';
  readonly amount: number;
  readonly unit: 'hour' | 'minute';
  readonly direction: 'ago' | 'from-now';
  readonly slug: Readonly<Record<Lang, string>>;
}

/** `1 hour`, `5 hours` in a slug: the singular for one. */
const hourSlug = (amount: number): Readonly<Record<Lang, string>> =>
  amount === 1
    ? { en: '1-hour', es: '1-hora' }
    : { en: `${String(amount)}-hours`, es: `${String(amount)}-horas` };

const hoursAgo = (amount: number): TimeOffset => ({
  kind: 'time-offset',
  amount,
  unit: 'hour',
  direction: 'ago',
  slug: { en: `${hourSlug(amount).en}-ago`, es: `hace-${hourSlug(amount).es}` },
});

const hoursFromNow = (amount: number): TimeOffset => ({
  kind: 'time-offset',
  amount,
  unit: 'hour',
  direction: 'from-now',
  slug: { en: `${hourSlug(amount).en}-from-now`, es: `dentro-de-${hourSlug(amount).es}` },
});

const minutesFromNow = (amount: number): TimeOffset => ({
  kind: 'time-offset',
  amount,
  unit: 'minute',
  direction: 'from-now',
  slug: { en: `${String(amount)}-minutes-from-now`, es: `dentro-de-${String(amount)}-minutos` },
});

/** The hours people ask about either way: every hour of a day, then a day and a half to three. */
const OFFSET_HOURS = [...Array.from({ length: 24 }, (_, i) => i + 1), 36, 48, 72];

/** Each ascending: a page links the nearest of its own kind. */
export const HOURS_AGO: readonly TimeOffset[] = OFFSET_HOURS.map(hoursAgo);
export const HOURS_FROM_NOW: readonly TimeOffset[] = OFFSET_HOURS.map(hoursFromNow);
export const MINUTES_FROM_NOW: readonly TimeOffset[] = [5, 10, 15, 20, 25, 30, 40, 45, 50, 90].map(
  minutesFromNow,
);

/** The hours ago, the hours from now, then the minutes from now. */
export const TIME_OFFSETS: readonly TimeOffset[] = [
  ...HOURS_AGO,
  ...HOURS_FROM_NOW,
  ...MINUTES_FROM_NOW,
];

/**
 * A time of day people count down to, "how long until 3:00 pm": minutes from midnight, 0 for
 * 12:00 am. The page gives the subtraction and the count from each hour; the script, the live one.
 */
export interface Until {
  readonly kind: 'until';
  readonly minutes: number;
  readonly slug: Readonly<Record<Lang, string>>;
}

const until = (minutes: number): Until => {
  const hour = Math.floor(minutes / 60);
  const clock = `${String(hour % 12 === 0 ? 12 : hour % 12)}-${String(minutes % 60).padStart(2, '0')}-${hour < 12 ? 'am' : 'pm'}`;
  return {
    kind: 'until',
    minutes,
    slug: { en: `how-long-until-${clock}`, es: `cuanto-falta-para-las-${clock}` },
  };
};

/**
 * Every hour on the hour, the half hours from 7:30 am to 9:30 pm and the quarter hours of the
 * afternoon, from 1:15 to 4:45 pm, in the order of the day: a page links its nearest.
 */
export const UNTILS: readonly Until[] = [
  ...Array.from({ length: 24 }, (_, hour) => hour * 60),
  ...Array.from({ length: 15 }, (_, i) => (7 + i) * 60 + 30),
  ...[795, 825, 855, 885, 915, 945, 975, 1005],
]
  .toSorted((x, y) => x - y)
  .map(until);

/**
 * A date some days or months from today, or some days ago, "what is the date 28 days from today":
 * calendar arithmetic. The page gives the weekday it lands on and the tables from the first of
 * each month; the script, today's.
 */
export interface DaysFrom {
  readonly kind: 'days-from';
  readonly amount: number;
  readonly unit: 'day' | 'month';
  readonly direction: 'ago' | 'from-now';
  readonly slug: Readonly<Record<Lang, string>>;
}

const daysFrom = (amount: number): DaysFrom => ({
  kind: 'days-from',
  amount,
  unit: 'day',
  direction: 'from-now',
  slug: { en: `${String(amount)}-days-from-today`, es: `${String(amount)}-dias-a-partir-de-hoy` },
});

const monthsFrom = (amount: number): DaysFrom => ({
  kind: 'days-from',
  amount,
  unit: 'month',
  direction: 'from-now',
  slug:
    amount === 1
      ? { en: '1-month-from-today', es: '1-mes-a-partir-de-hoy' }
      : {
          en: `${String(amount)}-months-from-today`,
          es: `${String(amount)}-meses-a-partir-de-hoy`,
        },
});

/** The days from today ascending, the 30 days ago beside the 30 days from today. */
export const DAYS_FROM_TODAY: readonly DaysFrom[] = [
  ...[5, 7, 10, 14, 15, 20, 21, 25, 28, 30].map(daysFrom),
  {
    kind: 'days-from',
    amount: 30,
    unit: 'day',
    direction: 'ago',
    slug: { en: '30-days-ago-from-today', es: 'hace-30-dias' },
  },
  ...[40, 45, 50, 60, 75, 90, 100, 120, 180, 365].map(daysFrom),
];

/** Every month of a year, ascending. */
export const MONTHS_FROM_TODAY: readonly DaysFrom[] = Array.from({ length: 12 }, (_, i) =>
  monthsFrom(i + 1),
);

/** The days, then the months. */
export const DAYS_FROM: readonly DaysFrom[] = [...DAYS_FROM_TODAY, ...MONTHS_FROM_TODAY];

/**
 * The pages of one kind a live page links its nearest of, and the hours calculator lists
 * together: the hours ago, the hours from now, the minutes from now, the times of day, the days
 * from today and the months from today.
 */
export const LIVE_GROUPS: readonly (readonly (TimeOffset | Until | DaysFrom)[])[] = [
  HOURS_AGO,
  HOURS_FROM_NOW,
  MINUTES_FROM_NOW,
  UNTILS,
  DAYS_FROM_TODAY,
  MONTHS_FROM_TODAY,
];

/** The group of a live page (`LIVE_GROUPS`). */
export const liveGroupOf = <T extends TimeOffset | Until | DaysFrom>(job: T): readonly T[] => {
  const group = LIVE_GROUPS.find((each) => each.includes(job));
  if (group === undefined) throw new Error(`no live group holds ${job.slug.en}`);
  return group as readonly T[];
};

/** The pages of the three families above: their one script fills the answer from the clock. */
export const LIVE_JOBS: readonly (TimeOffset | Until | DaysFrom)[] = [
  ...TIME_OFFSETS,
  ...UNTILS,
  ...DAYS_FROM,
];

/** A long-tail page's job, of any family. */
export type LongTailJob =
  | Job
  | Shift
  | Pto
  | Minutes
  | DoubleTime
  | Differential
  | Tipped
  | Days
  | TimeOffset
  | Until
  | DaysFrom;

/** Every long-tail job: the two page templates build one page per language from each. */
export const LONG_TAIL_JOBS: readonly LongTailJob[] = [
  ...JOBS,
  ...SHIFTS,
  ...PTOS,
  ...MINUTES,
  ...DOUBLES,
  ...DIFFERENTIALS,
  ...TIPPED,
  ...DAYS,
  ...LIVE_JOBS,
];

export const pathOf = (job: LongTailJob, lang: Lang): string =>
  lang === 'en' ? `/pay/${job.slug.en}` : `/es/pago/${job.slug.es}`;

export const LONG_TAIL_ROUTES: readonly Route[] = LONG_TAIL_JOBS.map((job) => ({
  id: `pay-${job.slug.en}`,
  kind: 'article',
  en: pathOf(job, 'en'),
  es: pathOf(job, 'es'),
}));

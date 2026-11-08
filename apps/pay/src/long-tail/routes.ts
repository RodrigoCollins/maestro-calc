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

const hourly = (amount: string): Job => ({
  kind: 'convert',
  amount,
  per: 'hour',
  slug: { en: `${amount}-an-hour-is-how-much-a-year`, es: `${amount}-la-hora-cuanto-es-al-ano` },
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
  hourly('15'),
  hourly('16'),
  hourly('17'),
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
  hourly('30'),
  hourly('32'),
  hourly('35'),
  hourly('40'),
  hourly('45'),
  hourly('50'),
  hourly('60'),
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
  salary('120000'),
  salary('150000'),
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

/** A long-tail page's job, of any family. */
export type LongTailJob = Job | Shift | Pto | Minutes | DoubleTime | Differential | Tipped;

/** Every long-tail job: the two page templates build one page per language from each. */
export const LONG_TAIL_JOBS: readonly LongTailJob[] = [
  ...JOBS,
  ...SHIFTS,
  ...PTOS,
  ...MINUTES,
  ...DOUBLES,
  ...DIFFERENTIALS,
  ...TIPPED,
];

export const pathOf = (job: LongTailJob, lang: Lang): string =>
  lang === 'en' ? `/pay/${job.slug.en}` : `/es/pago/${job.slug.es}`;

export const LONG_TAIL_ROUTES: readonly Route[] = LONG_TAIL_JOBS.map((job) => ({
  id: `pay-${job.slug.en}`,
  kind: 'article',
  en: pathOf(job, 'en'),
  es: pathOf(job, 'es'),
}));

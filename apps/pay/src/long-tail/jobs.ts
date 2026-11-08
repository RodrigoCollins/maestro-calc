import { encode, type Money, type Rational } from '@maestro-calc/core';
import { payConverter } from '@maestro-calc/pay-core/pay-converter';
import { timeCard } from '@maestro-calc/pay-core/time-card';
import { moneyText } from '../format.ts';
import { PATHS, PAY_CONVERTER_TEXTS } from '../pay-converter/texts.ts';
import { descriptionOf, titleOf } from '../seo/meta.ts';
import type { Lang } from '../time-card/receipt.ts';
import { TIME_CARD_TEXTS } from '../time-card/texts.ts';
import { jobSectionsOf } from './convert-sections.ts';
import { daysLinksOf, daysPageOf } from './days.ts';
import { differentialLinksOf, differentialPageOf } from './differentials.ts';
import { doubleLinksOf, doublePageOf } from './doubles.ts';
import { nearestOf } from './nearest.ts';
import type { LongTailSection, LongTailSource } from './sections.ts';
import { minutesLinksOf, minutesPageOf } from './minutes.ts';
import { ptoLinksOf, ptoPageOf } from './pto.ts';
import { JOBS, pathOf, type Job, type LongTailJob } from './routes.ts';
import { shiftLinksOf, shiftPageOf } from './shifts.ts';
import { tippedLinksOf, tippedPageOf } from './tipped.ts';

export {
  DAYS,
  DIFFERENTIALS,
  DOUBLES,
  JOBS,
  LONG_TAIL_JOBS,
  LONG_TAIL_ROUTES,
  MINUTES,
  PTOS,
  SHIFTS,
  TIPPED,
  type Days,
  type Differential,
  type DoubleTime,
  type Job,
  type LongTailJob,
  type Minutes,
  type Pto,
  type Shift,
  type Tipped,
} from './routes.ts';

/** `$41,600.00` reads `$41,600` in a sentence; cents stay when there are any. */
const short = (text: string): string => text.replace(/\.00$/, '');

/** An amount as a sentence reads it: `$50,000`, and `$17.50` with its cents. */
const dollarsOf = (amount: string): string => {
  const value = Number(amount);
  const cents = Number.isInteger(value) ? 0 : 2;
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: cents, maximumFractionDigits: cents })}`;
};

/** The weekly hours past which the federal rule pays overtime. */
const WEEK_HOURS = 40;

/** The words of each language around the engine's figures. */
const WORDS = {
  en: {
    per: { hour: 'an hour', year: 'a year' },
    ask: { hour: 'a year', year: 'an hour' },
    question: (given: string, ask: string): string => `${given} is how much ${ask}?`,
    headline: (given: string, figure: string, ask: string): string =>
      `${given} is ${figure} ${ask}`,
    searched: (headline: string): string =>
      `${headline}, at 40 hours a week and 52 paid weeks, before taxes.`,
    answer: (given: string, figure: string, ask: string): string =>
      `At 40 hours a week and 52 paid weeks, ${given} comes to ${figure} ${ask}, before taxes.`,
    edit: 'Change the hours or the weeks in the calculator',
    others: 'Other common amounts',
    common: 'Common amounts',
    overtime: {
      kicker: 'Overtime pay · free',
      question: (given: string): string => `What is time and a half for ${given}?`,
      headline: (given: string, rate: string): string =>
        `Time and a half for ${given} is ${rate} an hour`,
      searched: (headline: string, hours: number, pay: string, week: string): string =>
        `${headline}, so ${String(hours)} overtime hours past 40 in a week pay ${pay} under the federal rule. The ${String(WEEK_HOURS + hours)}-hour week comes to ${week} before taxes.`,
      answer: (given: string, rate: string, hours: number, pay: string, week: string): string =>
        `Time and a half for ${given} is ${rate} an hour. Under the federal rule, ${String(hours)} overtime hours past 40 in a week pay ${pay}, and the ${String(WEEK_HOURS + hours)}-hour week comes to ${week} before taxes.`,
      figure: 'Overtime rate, 1.5 times',
      row: (hours: number): string => `Pay for ${String(hours)} overtime hours`,
      breakdown: 'Overtime pay by hours',
      edit: 'Enter your own week in the time card',
      others: 'Other common rates',
      common: 'Time and a half at common rates',
    },
  },
  es: {
    per: { hour: 'la hora', year: 'al año' },
    ask: { hour: 'al año', year: 'por hora' },
    question: (given: string, ask: string): string => `¿${given} cuánto es ${ask}?`,
    headline: (given: string, figure: string, ask: string): string =>
      `${given} son ${figure} ${ask}`,
    searched: (headline: string): string =>
      `${headline}, con 40 horas por semana y 52 semanas pagadas, antes de impuestos.`,
    answer: (given: string, figure: string, ask: string): string =>
      `Con 40 horas por semana y 52 semanas pagadas, ${given} son ${figure} ${ask}, antes de impuestos.`,
    edit: 'Cambia las horas o las semanas en la calculadora',
    others: 'Otras cantidades comunes',
    common: 'Cantidades comunes',
    overtime: {
      kicker: 'Horas extra · gratis',
      question: (given: string): string => `¿Cuánto es tiempo y medio de ${given}?`,
      headline: (given: string, rate: string): string =>
        `Tiempo y medio de ${given} es ${rate} la hora`,
      searched: (headline: string, hours: number, pay: string, week: string): string =>
        `${headline}, así que ${String(hours)} horas extra después de 40 en la semana pagan ${pay} con la regla federal. La semana de ${String(WEEK_HOURS + hours)} horas suma ${week} antes de impuestos.`,
      answer: (given: string, rate: string, hours: number, pay: string, week: string): string =>
        `Tiempo y medio de ${given} es ${rate} la hora. Con la regla federal, ${String(hours)} horas extra después de 40 en la semana pagan ${pay}, y la semana de ${String(WEEK_HOURS + hours)} horas suma ${week} antes de impuestos.`,
      figure: 'Tarifa de hora extra, 1.5 veces',
      row: (hours: number): string => `Pago por ${String(hours)} horas extra`,
      breakdown: 'Pago de horas extra según las horas',
      edit: 'Anota tu propia semana en la tarjeta de horas',
      others: 'Otras tarifas comunes',
      common: 'Tiempo y medio con tarifas comunes',
    },
  },
} as const;

/** The time card's pages, which the overtime jobs open. */
export const TIME_CARD_PATHS = {
  en: '/time-card-calculator',
  es: '/es/calculadora-de-horas-trabajadas',
} as const satisfies Record<Lang, string>;

/** The overtime hours of the table, and the row the lead and the time card link use. */
const OVERTIME_HOURS = [5, 10, 15, 20] as const;
const MAIN_HOURS = 10;

const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri'] as const;

/**
 * A week of the time card at `rate` with `hours` overtime hours under the federal rule: Monday to
 * Friday from 8:00 with no break, 8 hours each plus an even share of the overtime, the rest of it
 * on Friday; no weekend.
 */
export const overtimeWeekOf = (rate: string, hours: number): Readonly<Record<string, string>> => {
  const share = Math.floor(hours / WEEKDAYS.length);
  const rest = hours - share * WEEKDAYS.length;
  const days = WEEKDAYS.flatMap((day): [string, string][] => {
    const end = 8 + 8 + share + (day === 'fri' ? rest : 0);
    return [
      [day, '8:00'],
      [`${day}Out`, `${String(end)}:00`],
      [`${day}Break`, '0'],
    ];
  });
  return Object.fromEntries<string>([
    ['rate', rate],
    ['rule', 'federal'],
    ...days,
    ['sat', ''],
    ['satOut', ''],
  ]);
};

export interface LongTailPage {
  readonly kicker: string;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly lead: string;
  readonly figure: string;
  readonly figureLabel: string;
  /** The label of the list of rows. */
  readonly breakdown: string;
  /** Every other pay period, or the pay of each common overtime hours, as the engine gives it. */
  readonly rows: readonly {
    readonly key: string;
    readonly label: string;
    readonly value: string;
  }[];
  /** The calculator the page answers for: its link, prefilled, and its title, for the breadcrumb. */
  readonly calculator: { readonly href: string; readonly label: string; readonly title: string };
  readonly note: string;
  readonly paths: Readonly<Record<Lang, string>>;
  readonly others: CommonLinks;
  /** The sections under the answer: the figures worked out, the page's own tables and rules. */
  readonly sections?: readonly LongTailSection[];
  /** The primary sources the sections cite, listed under a sources heading. */
  readonly sources?: readonly LongTailSource[];
}

export interface CommonLinks {
  readonly heading: string;
  readonly links: readonly { readonly href: string; readonly label: string }[];
}

/**
 * A family of long-tail pages, listed together: hourly rates, salaries, overtime rates, double-time
 * rates, shifts, PTO days, minutes, shift differentials, tipped weeks or hours in days.
 */
export type Family =
  | Job['per']
  | 'overtime'
  | 'double'
  | 'shift'
  | 'pto'
  | 'minutes'
  | 'differential'
  | 'tipped'
  | 'days';

const familyOf = (job: Job): Family => (job.kind === 'overtime' ? 'overtime' : job.per);

/** The question of a job, as its heading and its links read it. */
const questionOf = (job: Job, lang: Lang): string => {
  const w = WORDS[lang];
  const given = `${dollarsOf(job.amount)} ${w.per[job.per]}`;
  return job.kind === 'overtime' ? w.overtime.question(given) : w.question(given, w.ask[job.per]);
};

/**
 * The long-tail pages of one family, as links: every one of them on their calculator, and on a
 * page of the family (`except`) only its nearest amounts.
 */
export const commonLinksOf = (family: Family, lang: Lang, except?: Job): CommonLinks => {
  if (family === 'shift') return shiftLinksOf(lang);
  if (family === 'pto') return ptoLinksOf(lang);
  if (family === 'minutes') return minutesLinksOf(lang);
  if (family === 'double') return doubleLinksOf(lang);
  if (family === 'differential') return differentialLinksOf(lang);
  if (family === 'tipped') return tippedLinksOf(lang);
  if (family === 'days') return daysLinksOf(lang);
  const w = family === 'overtime' ? WORDS[lang].overtime : WORDS[lang];
  const members = JOBS.filter((job) => familyOf(job) === family);
  const listed = except === undefined ? members : nearestOf(members, except);
  return {
    heading: except === undefined ? w.common : w.others,
    links: listed.map((job) => ({ href: pathOf(job, lang), label: questionOf(job, lang) })),
  };
};

/** The money outputs of the time card on the federal week with `hours` overtime hours at `rate`. */
const overtimeRun = (rate: string, hours: number): ((key: string) => string) => {
  const ran = timeCard.run(overtimeWeekOf(rate, hours));
  if (!ran.ok) throw new Error(`the overtime week of ${rate} must run`);
  const out = new Map<string, Money | Rational>(
    ran.value.outputs.map(({ key, value }) => [key, value]),
  );
  return (key) => {
    const value = out.get(key);
    if (value === undefined || !('currency' in value)) throw new Error(`no money output ${key}`);
    return moneyText(value);
  };
};

/** The page of an overtime job: the rate and the pay of each overtime hours, from the time card. */
const overtimePageOf = (job: Job, lang: Lang): LongTailPage => {
  const w = WORDS[lang].overtime;
  // the rate is what the time card pays for one hour past 40
  const figure = overtimeRun(job.amount, 1)('overtimePay');
  const rows = OVERTIME_HOURS.map((hours) => ({
    key: String(hours),
    label: w.row(hours),
    value: overtimeRun(job.amount, hours)('overtimePay'),
  }));
  const main = overtimeRun(job.amount, MAIN_HOURS);
  const question = questionOf(job, lang);
  const given = `$${job.amount} ${WORDS[lang].per.hour}`;
  const answer = w.answer(
    given,
    short(figure),
    MAIN_HOURS,
    short(main('overtimePay')),
    short(main('pay')),
  );
  const headline = w.headline(given, short(figure));
  const searched = w.searched(headline, MAIN_HOURS, short(main('overtimePay')), short(main('pay')));
  const validated = timeCard.validate(overtimeWeekOf(job.amount, MAIN_HOURS));
  if (!validated.ok) throw new Error(`the overtime week of ${job.amount} must validate`);
  return {
    kicker: w.kicker,
    title: titleOf(headline),
    description: descriptionOf(
      searched,
      rows.map(({ label, value }) => `${label}: ${short(value)}`),
    ),
    h1: question,
    lead: answer,
    figure,
    figureLabel: w.figure,
    breakdown: w.breakdown,
    rows,
    calculator: {
      href: `${TIME_CARD_PATHS[lang]}?${encode(timeCard, validated.value)}`,
      label: w.edit,
      title: TIME_CARD_TEXTS[lang].title,
    },
    note: TIME_CARD_TEXTS[lang].note,
    paths: { en: pathOf(job, 'en'), es: pathOf(job, 'es') },
    others: commonLinksOf('overtime', lang, job),
    ...jobSectionsOf(job, lang),
  };
};

/** The page of one job in one language, its figures run through its engine at build time. */
export const longTailPageOf = (job: LongTailJob, lang: Lang): LongTailPage => {
  if (job.kind === 'shift') return shiftPageOf(job, lang);
  if (job.kind === 'pto') return ptoPageOf(job, lang);
  if (job.kind === 'minutes') return minutesPageOf(job, lang);
  if (job.kind === 'double') return doublePageOf(job, lang);
  if (job.kind === 'differential') return differentialPageOf(job, lang);
  if (job.kind === 'tipped') return tippedPageOf(job, lang);
  if (job.kind === 'days') return daysPageOf(job, lang);
  if (job.kind === 'overtime') return overtimePageOf(job, lang);
  const validated = payConverter.validate({ amount: job.amount, per: job.per });
  const ran = payConverter.run({ amount: job.amount, per: job.per });
  if (!validated.ok || !ran.ok) throw new Error(`the job ${job.amount} must run`);
  const out = new Map<string, Money>(ran.value.outputs.map(({ key, value }) => [key, value]));
  const text = (key: string): string => {
    const value = out.get(key);
    if (value === undefined) throw new Error(`no output ${key}`);
    return moneyText(value);
  };
  const w = WORDS[lang];
  const t = PAY_CONVERTER_TEXTS[lang];
  const variant = job.per === 'hour' ? 'hourly' : 'salary';
  const figureKey = job.per === 'hour' ? 'annual' : 'hourly';
  const givenKey = job.per === 'hour' ? 'hourly' : 'annual';
  const given = `${short(text(givenKey))} ${w.per[job.per]}`;
  const figure = text(figureKey);
  const question = questionOf(job, lang);
  const rows = Object.entries(t.outputs)
    .filter(([key]) => key !== figureKey && key !== givenKey)
    .map(([key, label]) => ({ key, label, value: text(key) }));
  const answer = w.answer(given, short(figure), w.ask[job.per]);
  const headline = w.headline(given, short(figure), w.ask[job.per]);
  return {
    kicker: t.kicker,
    title: titleOf(headline),
    description: descriptionOf(
      w.searched(headline),
      rows.map(({ label, value }) => `${label}: ${short(value)}`),
    ),
    h1: question,
    lead: answer,
    figure,
    figureLabel: t.outputs[figureKey],
    breakdown: t.breakdown,
    rows,
    calculator: {
      href: `${PATHS[variant][lang]}?${encode(payConverter, validated.value)}`,
      label: w.edit,
      title: t.variants[variant].title,
    },
    note: t.note,
    paths: { en: pathOf(job, 'en'), es: pathOf(job, 'es') },
    others: commonLinksOf(job.per, lang, job),
    ...jobSectionsOf(job, lang),
  };
};

import { encode, type Money, type Rational } from '@maestro-calc/core';
import { tippedWage } from '@maestro-calc/pay-core/tipped-wage';
import { hoursText, moneyText } from '../format.ts';
import { descriptionOf, titleOf } from '../seo/meta.ts';
import type { Lang } from '../time-card/receipt.ts';
import { TIPPED_PATHS, TIPPED_TEXTS, type TippedOutput } from '../tipped/texts.ts';
import type { CommonLinks, LongTailPage } from './jobs.ts';
import { tippedSectionsOf } from './wage-sections.ts';
import { nearestOf } from './nearest.ts';
import { pathOf, TIPPED, type Tipped } from './routes.ts';

/** `$85.20` stays whole; `$290.00` reads `$290` in a sentence. */
const short = (text: string): string => text.replace(/\.00$/, '');

/** The federal cash wage of every page, the calculator's default (FLSA 3(m)). */
export const CASH_WAGE = '2.13';

/** The money outputs of the calculator the page lists, in the engine's order. */
const ROW_KEYS = [
  'perHour',
  'totalPay',
  'wages',
  'tipsPerHour',
  'tipCredit',
  'topUp',
  'overtimePremium',
] as const;

/** The output each kind of page answers with. */
const FIGURE = {
  owed: 'topUp',
  overtime: 'overtimePremium',
  perHour: 'tipsPerHour',
} as const satisfies Record<Tipped['question'], TippedOutput>;

/** The engine's figures of a page, as a sentence reads them. */
interface Figures {
  readonly cash: string;
  readonly tips: string;
  readonly hours: string;
  /** What the hours pay at the federal minimum wage, and that wage an hour. */
  readonly minimumWeek: string;
  readonly minimum: string;
  readonly wages: string;
  readonly totalPay: string;
  readonly perHour: string;
  readonly topUp: string;
  readonly tipsPerHour: string;
  readonly overtimeHours: string;
  readonly premium: string;
}

const WORDS = {
  en: {
    question: (job: Tipped): string => {
      if (job.question === 'owed') {
        return `$${CASH_WAGE} an hour plus $${job.tips} in tips for ${job.hours} hours: does my employer owe me?`;
      }
      if (job.question === 'overtime') {
        return `What is tipped overtime for ${job.hours} hours at $${CASH_WAGE} an hour?`;
      }
      return `$${job.tips} in tips over ${job.hours} hours is how much an hour?`;
    },
    headline: (job: Tipped): string => {
      if (job.question === 'owed') {
        return `$${CASH_WAGE} an hour plus $${job.tips} in tips, ${job.hours} hours: am I owed?`;
      }
      if (job.question === 'overtime') {
        return `Tipped overtime for ${job.hours} hours at $${CASH_WAGE} an hour:`;
      }
      return `$${job.tips} in tips over ${job.hours} hours is how much an hour?`;
    },
    answer: (job: Tipped, f: Figures, owes: boolean): string => {
      if (job.question === 'owed') {
        return owes
          ? `${f.cash} an hour plus ${f.tips} in tips for ${f.hours} hours falls short of the ${f.minimumWeek} that ${f.hours} hours at the ${f.minimum} federal minimum pay. Your ${f.wages} in cash wages and ${f.tips} in tips leave a ${f.topUp} difference your employer owes you, so you earn ${f.perHour} an hour before taxes.`
          : `${f.cash} an hour plus ${f.tips} in tips for ${f.hours} hours comes to ${f.totalPay}, above the ${f.minimumWeek} that ${f.hours} hours at the ${f.minimum} federal minimum pay. Your employer owes you nothing more: you earn ${f.perHour} an hour before taxes.`;
      }
      if (job.question === 'overtime') {
        return `At ${f.cash} an hour, the ${f.overtimeHours} hours over 40 of a ${f.hours}-hour week add ${f.premium}: half of the full ${f.minimum} minimum for each, not of ${f.cash}. With ${f.tips} in tips, the week pays ${f.wages} in cash wages, the ${f.premium} premium and the tips: ${f.totalPay} before taxes, or ${f.perHour} an hour.`;
      }
      return `${f.tips} in tips over ${f.hours} hours is ${f.tipsPerHour} an hour in tips. With the ${f.cash} cash wage, the ${f.hours} hours pay ${f.wages} more, so the week comes to ${f.totalPay} before taxes, or ${f.perHour} an hour, above the ${f.minimum} federal minimum.`;
    },
    breakdown: (job: Tipped): string =>
      `A ${job.hours}-hour week at $${CASH_WAGE} an hour with $${job.tips} in tips`,
    edit: 'Enter your own week in the tipped wage calculator',
    others: 'Other tipped pay questions',
    common: 'Tipped pay at common figures',
  },
  es: {
    question: (job: Tipped): string => {
      if (job.question === 'owed') {
        return `$${CASH_WAGE} la hora más $${job.tips} de propinas en ${job.hours} horas: ¿mi empleador me debe algo?`;
      }
      if (job.question === 'overtime') {
        return `¿Cuánto pagan las horas extra con propinas en ${job.hours} horas a $${CASH_WAGE} la hora?`;
      }
      return `¿$${job.tips} de propinas en ${job.hours} horas cuánto es por hora?`;
    },
    headline: (job: Tipped): string => {
      if (job.question === 'owed') {
        return `$${CASH_WAGE} la hora más $${job.tips} de propinas, ${job.hours} horas: ¿me deben?`;
      }
      if (job.question === 'overtime') {
        return `Horas extra con propinas, ${job.hours} horas a $${CASH_WAGE} la hora:`;
      }
      return `¿$${job.tips} de propinas en ${job.hours} horas cuánto es por hora?`;
    },
    answer: (job: Tipped, f: Figures, owes: boolean): string => {
      if (job.question === 'owed') {
        return owes
          ? `${f.cash} la hora más ${f.tips} de propinas en ${f.hours} horas no llegan a los ${f.minimumWeek} que pagan ${f.hours} horas al mínimo federal de ${f.minimum}. Tus ${f.wages} de salario en efectivo y ${f.tips} de propinas dejan una diferencia de ${f.topUp} que tu empleador te debe, así que ganas ${f.perHour} la hora antes de impuestos.`
          : `${f.cash} la hora más ${f.tips} de propinas en ${f.hours} horas suman ${f.totalPay}, más que los ${f.minimumWeek} que pagan ${f.hours} horas al mínimo federal de ${f.minimum}. Tu empleador no te debe nada más: ganas ${f.perHour} la hora antes de impuestos.`;
      }
      if (job.question === 'overtime') {
        return `Con ${f.cash} la hora, las ${f.overtimeHours} horas después de 40 de una semana de ${f.hours} horas suman ${f.premium}: la mitad del mínimo completo de ${f.minimum} por cada una, no de ${f.cash}. Con ${f.tips} de propinas, la semana paga ${f.wages} de salario en efectivo, la prima de ${f.premium} y las propinas: ${f.totalPay} antes de impuestos, o ${f.perHour} la hora.`;
      }
      return `${f.tips} de propinas en ${f.hours} horas son ${f.tipsPerHour} la hora en propinas. Con el salario en efectivo de ${f.cash}, las ${f.hours} horas pagan ${f.wages} más, así que la semana suma ${f.totalPay} antes de impuestos, o ${f.perHour} la hora, más que el mínimo federal de ${f.minimum}.`;
    },
    breakdown: (job: Tipped): string =>
      `Una semana de ${job.hours} horas a $${CASH_WAGE} la hora con $${job.tips} de propinas`,
    edit: 'Anota tu propia semana en la calculadora de propinas por hora',
    others: 'Otras preguntas de pago con propinas',
    common: 'Pago con propinas en cifras comunes',
  },
} as const;

/** The calculator's inputs for the job's week, at the federal cash wage, with `tips` if given. */
export const tippedWeekOf = (job: Tipped, tips = job.tips): Readonly<Record<string, string>> => ({
  cashWage: CASH_WAGE,
  tips,
  hours: job.hours,
});

/** The tipped pages as links: every one on the calculator, on one its nearest. */
export const tippedLinksOf = (lang: Lang, except?: Tipped): CommonLinks => {
  const w = WORDS[lang];
  const listed = except === undefined ? TIPPED : nearestOf(TIPPED, except);
  return {
    heading: except === undefined ? w.common : w.others,
    links: listed.map((job) => ({ href: pathOf(job, lang), label: w.question(job) })),
  };
};

/** The outputs of the calculator on the job's week: money as text, and the overtime hours. */
const tippedRun = (job: Tipped, tips?: string): ((key: string) => string) => {
  const ran = tippedWage.run(tippedWeekOf(job, tips));
  if (!ran.ok) throw new Error(`the tipped week of ${job.slug.en} must run`);
  const out = new Map<string, Money | Rational>(
    ran.value.outputs.map(({ key, value }) => [key, value]),
  );
  return (key) => {
    const value = out.get(key);
    if (value === undefined) throw new Error(`no output ${key}`);
    return 'currency' in value ? moneyText(value) : hoursText(value);
  };
};

/** The page of one tipped job in one language, every figure from the calculator. */
export const tippedPageOf = (job: Tipped, lang: Lang): LongTailPage => {
  const w = WORDS[lang];
  const t = TIPPED_TEXTS[lang];
  const week = tippedRun(job);
  // with no tips and no overtime the employer tops the cash wage up to the minimum: the minimum
  // week of the hours (asked only of the 40-hour weeks) and the minimum wage an hour
  const bare = tippedRun({ ...job, hours: String(Math.min(Number(job.hours), 40)) }, '0');
  const figureKey = FIGURE[job.question];
  const figure = week(figureKey);
  const owes = week('topUp') !== '$0.00';
  if (job.question !== 'owed' && owes) {
    throw new Error(`the tipped week of ${job.slug.en} must owe no top-up`);
  }
  const rows = ROW_KEYS.filter((key) => key !== figureKey).map((key) => ({
    key,
    label: key === 'perHour' ? t.figureLabel : t.outputs[key],
    value: week(key),
  }));
  const answer = w.answer(
    job,
    {
      cash: `$${CASH_WAGE}`,
      tips: `$${job.tips}`,
      hours: job.hours,
      minimumWeek: short(bare('totalPay')),
      minimum: short(bare('perHour')),
      wages: short(week('wages')),
      totalPay: short(week('totalPay')),
      perHour: short(week('perHour')),
      topUp: short(week('topUp')),
      tipsPerHour: short(week('tipsPerHour')),
      overtimeHours: week('overtimeHours'),
      premium: short(week('overtimePremium')),
    },
    owes,
  );
  const validated = tippedWage.validate(tippedWeekOf(job));
  if (!validated.ok) throw new Error(`the tipped week of ${job.slug.en} must validate`);
  const note = t.notes[job.question === 'overtime' ? 3 : 2];
  if (note === undefined) throw new Error('the tipped wage calculator must state the law');
  return {
    kicker: t.kicker,
    title: titleOf(`${w.headline(job)} ${short(figure)}`),
    description: descriptionOf(
      answer,
      rows.map(({ label, value }) => `${label}: ${short(value)}`),
    ),
    h1: w.question(job),
    lead: answer,
    figure,
    figureLabel: t.outputs[figureKey],
    breakdown: w.breakdown(job),
    rows,
    calculator: {
      href: `${TIPPED_PATHS[lang]}?${encode(tippedWage, validated.value)}`,
      label: w.edit,
      title: t.title,
    },
    note,
    paths: { en: pathOf(job, 'en'), es: pathOf(job, 'es') },
    others: tippedLinksOf(lang, job),
    ...tippedSectionsOf(job, lang),
  };
};

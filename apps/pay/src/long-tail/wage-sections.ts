import { type Money, Rational, scaleMoney, usd } from '@maestro-calc/core';
import { shiftDifferential } from '@maestro-calc/pay-core/shift-differential';
import { tippedWage } from '@maestro-calc/pay-core/tipped-wage';
import { hoursText, moneyText } from '../format.ts';
import type { Lang } from '../time-card/receipt.ts';
import type { JobSections } from './convert-sections.ts';
import type { Differential, Tipped } from './routes.ts';
import { SOURCES } from './sections.ts';

/*
 * The sections of the shift differential and tipped pages under their answer: the week worked out
 * step by step with the calculator's own figures, and a table of the same job at other hours or
 * other tips. Every dollar is the calculator's; the rules are those the calculators cite.
 */

type Out = (key: string) => Money | Rational;

const outOf = (outputs: readonly { readonly key: string; readonly value: unknown }[]): Out => {
  const map = new Map(outputs.map(({ key, value }) => [key, value as Money | Rational]));
  return (key) => {
    const value = map.get(key);
    if (value === undefined) throw new Error(`no output ${key}`);
    return value;
  };
};

const money = (out: Out, key: string): Money => out(key) as Money;
const m = (out: Out, key: string): string => moneyText(money(out, key));
const add = (...amounts: readonly Money[]): Money =>
  usd(amounts.reduce((sum, each) => sum.add(each.amount), Rational.of(0)));

/** The shift differential calculator on `job` with `baseHours` at the base rate and `shiftHours` on the shift. */
const differentialRun = (job: Differential, baseHours: number, shiftHours: number): Out => {
  const ran = shiftDifferential.run({
    rate: job.amount,
    source: job.source,
    [job.source]: job.differential,
    baseHours: String(baseHours),
    shiftHours: String(shiftHours),
  });
  if (!ran.ok) throw new Error(`the differential ${job.slug.en} must run`);
  return outOf(ran.value.outputs);
};

/** The tipped wage calculator at the $2.13 cash wage with `tips` over `hours`. */
const tippedRun = (tips: string, hours: string): Out => {
  const ran = tippedWage.run({ cashWage: '2.13', tips, hours });
  if (!ran.ok) throw new Error(`the tipped week of ${tips} over ${hours} must run`);
  return outOf(ran.value.outputs);
};

const SHIFT_HOURS = [8, 16, 24, 32, 40] as const;
const TIP_FACTORS = [Rational.of(1, 2), Rational.of(1), Rational.of(3, 2), Rational.of(2)] as const;

const WORDS = {
  en: {
    heading: 'How the figures are worked out',
    differential: {
      percent: (p: string, base: string, share: string, diff: string): string =>
        `${p}% of ${base}: ${base} × ${share} = ${diff} an hour.`,
      amount: (base: string, diff: string): string =>
        `The differential is a flat ${diff} an hour on top of ${base}.`,
      shift: (base: string, diff: string, rate: string): string =>
        `On the shift: ${base} + ${diff} = ${rate} an hour.`,
      week: (base: string, rate: string, straight: string, diff: string): string =>
        `The 48-hour week, 24 hours at ${base} and 24 at ${rate}, has ${straight} of straight-time pay, ${diff} of it differential.`,
      overtime: (straight: string, regular: string, premium: string, pay: string): string =>
        `The differential counts in the regular rate (29 CFR 778.207), the weighted average of the week (29 CFR 778.115): ${straight} ÷ 48 = ${regular}. Each of the 8 hours over 40 adds half of it, ${premium} in all, so the week pays ${pay}.`,
      tableHeading: (rate: string): string => `More or fewer hours at ${rate} on the shift`,
      tableIntro:
        'The calculator on weeks of shift hours only, up to the 40 that keep them straight time:',
      caption: (rate: string): string => `Hours at ${rate} an hour`,
      head: ['Hours on the shift', 'Pay', 'Of it, differential'],
    },
    tipped: {
      cash: (hours: string, wages: string): string =>
        `Cash wage: $2.13 × ${hours} hours = ${wages}.`,
      withTips: (wages: string, tips: string, sum: string): string =>
        `With the tips: ${wages} + ${tips} = ${sum}.`,
      minimum: (hours: string, week: string): string =>
        `The federal minimum for those hours: $7.25 × ${hours} = ${week}.`,
      owes: (week: string, sum: string, topUp: string, total: string, perHour: string): string =>
        `${week} − ${sum} = ${topUp}: the top-up the employer owes, so the week pays ${total}, ${perHour} an hour.`,
      covered: (sum: string, week: string, perHour: string): string =>
        `${sum} is more than ${week}, so nothing is owed: ${perHour} an hour.`,
      premium: (over: string, premium: string): string =>
        `Overtime premium: ${over} hours over 40 × half of the $7.25 minimum = ${premium}.`,
      week: (
        wages: string,
        premium: string,
        tips: string,
        total: string,
        perHour: string,
        hours: string,
      ): string =>
        `The week: ${wages} + ${premium} + ${tips} = ${total}, or ${perHour} an hour over ${hours} hours.`,
      tipsPerHour: (tips: string, hours: string, perHour: string): string =>
        `Tips an hour: ${tips} ÷ ${hours} = ${perHour}.`,
      together: (
        wages: string,
        tips: string,
        total: string,
        hours: string,
        perHour: string,
      ): string =>
        `Together: ${wages} + ${tips} = ${total}, and ${total} ÷ ${hours} = ${perHour} an hour.`,
      tableHeading: (hours: string): string => `${hours} hours with other tips`,
      tableIntro: (hours: string): string =>
        `The calculator on the same ${hours} hours at $2.13 an hour with half, the same, one and a half times and twice the tips (DOL Fact Sheet #15: the employer makes up any shortfall from $7.25 an hour over the workweek):`,
      caption: (hours: string): string => `${hours} hours at $2.13 an hour`,
      head: ['Tips', 'Top-up owed', 'Pay an hour'],
    },
  },
  es: {
    heading: 'Cómo se calcula',
    differential: {
      percent: (p: string, base: string, share: string, diff: string): string =>
        `${p}% de ${base}: ${base} × ${share} = ${diff} la hora.`,
      amount: (base: string, diff: string): string =>
        `El diferencial es una suma fija de ${diff} la hora sobre ${base}.`,
      shift: (base: string, diff: string, rate: string): string =>
        `En el turno: ${base} + ${diff} = ${rate} la hora.`,
      week: (base: string, rate: string, straight: string, diff: string): string =>
        `La semana de 48 horas, 24 a ${base} y 24 a ${rate}, tiene ${straight} de pago a tarifa normal, ${diff} de ellos de diferencial.`,
      overtime: (straight: string, regular: string, premium: string, pay: string): string =>
        `El diferencial cuenta en la tarifa regular (29 CFR 778.207), el promedio ponderado de la semana (29 CFR 778.115): ${straight} ÷ 48 = ${regular}. Cada una de las 8 horas después de 40 suma la mitad, ${premium} en total, así que la semana paga ${pay}.`,
      tableHeading: (rate: string): string => `Más o menos horas a ${rate} en el turno`,
      tableIntro:
        'La calculadora con semanas solo de horas del turno, hasta las 40 que se pagan a tarifa normal:',
      caption: (rate: string): string => `Horas a ${rate} la hora`,
      head: ['Horas en el turno', 'Pago', 'De eso, diferencial'],
    },
    tipped: {
      cash: (hours: string, wages: string): string =>
        `Salario en efectivo: $2.13 × ${hours} horas = ${wages}.`,
      withTips: (wages: string, tips: string, sum: string): string =>
        `Con las propinas: ${wages} + ${tips} = ${sum}.`,
      minimum: (hours: string, week: string): string =>
        `El mínimo federal por esas horas: $7.25 × ${hours} = ${week}.`,
      owes: (week: string, sum: string, topUp: string, total: string, perHour: string): string =>
        `${week} − ${sum} = ${topUp}: la diferencia que te debe el empleador, así que la semana paga ${total}, ${perHour} la hora.`,
      covered: (sum: string, week: string, perHour: string): string =>
        `${sum} es más que ${week}, así que no te deben nada: ${perHour} la hora.`,
      premium: (over: string, premium: string): string =>
        `Prima de horas extra: ${over} horas después de 40 × la mitad del mínimo de $7.25 = ${premium}.`,
      week: (
        wages: string,
        premium: string,
        tips: string,
        total: string,
        perHour: string,
        hours: string,
      ): string =>
        `La semana: ${wages} + ${premium} + ${tips} = ${total}, o ${perHour} la hora en ${hours} horas.`,
      tipsPerHour: (tips: string, hours: string, perHour: string): string =>
        `Propinas por hora: ${tips} ÷ ${hours} = ${perHour}.`,
      together: (
        wages: string,
        tips: string,
        total: string,
        hours: string,
        perHour: string,
      ): string =>
        `En total: ${wages} + ${tips} = ${total}, y ${total} ÷ ${hours} = ${perHour} la hora.`,
      tableHeading: (hours: string): string => `${hours} horas con otras propinas`,
      tableIntro: (hours: string): string =>
        `La calculadora con las mismas ${hours} horas a $2.13 la hora y la mitad, lo mismo, una vez y media y el doble de propinas (DOL Fact Sheet #15: el empleador completa lo que falte para $7.25 la hora en la semana laboral):`,
      caption: (hours: string): string => `${hours} horas a $2.13 la hora`,
      head: ['Propinas', 'Diferencia que te deben', 'Pago por hora'],
    },
  },
} as const;

/** The sections and sources of the shift differential page of `job` in `lang`. */
export const differentialSectionsOf = (job: Differential, lang: Lang): JobSections => {
  const w = WORDS[lang].differential;
  const base = `$${job.amount}`;
  const hour = differentialRun(job, 0, 1);
  const week = differentialRun(job, 24, 24);
  const diff = m(hour, 'differentialPay');
  const rate = m(hour, 'shiftRate');
  if (
    !add(money(week, 'straightPay'), money(week, 'overtimePremium')).amount.equals(
      money(week, 'pay').amount,
    )
  ) {
    throw new Error('the differential week must add up');
  }
  const share = Rational.of(Number(job.differential), 100);
  const rows = SHIFT_HOURS.map((hours) => {
    const out = differentialRun(job, 0, hours);
    return [String(hours), m(out, 'pay'), m(out, 'differentialPay')];
  });
  return {
    sections: [
      {
        id: 'worked',
        heading: WORDS[lang].heading,
        paragraphs: [],
        steps: [
          job.source === 'percent'
            ? w.percent(job.differential, base, hoursText(share), diff)
            : w.amount(base, diff),
          w.shift(base, diff, rate),
          w.week(base, rate, m(week, 'straightPay'), m(week, 'differentialPay')),
          w.overtime(
            m(week, 'straightPay'),
            m(week, 'regularRate'),
            m(week, 'overtimePremium'),
            m(week, 'pay'),
          ),
        ],
      },
      {
        id: 'hours',
        heading: w.tableHeading(rate),
        paragraphs: [w.tableIntro],
        table: { caption: w.caption(rate), head: w.head, rows },
      },
    ],
    sources: [SOURCES.ecfr778207, SOURCES.ecfr778115, SOURCES.factSheet23],
  };
};

/** The sections and sources of the tipped page of `job` in `lang`. */
export const tippedSectionsOf = (job: Tipped, lang: Lang): JobSections => {
  const w = WORDS[lang].tipped;
  const out = tippedRun(job.tips, job.hours);
  const tips = moneyText(usd(Number(job.tips)));
  const wages = money(out, 'wages');
  const sum = add(wages, usd(Number(job.tips)));
  const total = add(sum, money(out, 'overtimePremium'), money(out, 'topUp'));
  if (!total.amount.equals(money(out, 'totalPay').amount))
    throw new Error('the tipped week must add up');
  const steps =
    job.question === 'owed'
      ? (() => {
          const minimum = m(tippedRun('0', job.hours), 'totalPay');
          const owes = money(out, 'topUp').amount.compare(Rational.of(0)) > 0;
          return [
            w.cash(job.hours, moneyText(wages)),
            w.withTips(moneyText(wages), tips, moneyText(sum)),
            w.minimum(job.hours, minimum),
            owes
              ? w.owes(
                  minimum,
                  moneyText(sum),
                  m(out, 'topUp'),
                  m(out, 'totalPay'),
                  m(out, 'perHour'),
                )
              : w.covered(moneyText(sum), minimum, m(out, 'perHour')),
          ];
        })()
      : job.question === 'overtime'
        ? [
            w.cash(job.hours, moneyText(wages)),
            w.premium(hoursText(out('overtimeHours') as Rational), m(out, 'overtimePremium')),
            w.week(
              moneyText(wages),
              m(out, 'overtimePremium'),
              tips,
              m(out, 'totalPay'),
              m(out, 'perHour'),
              job.hours,
            ),
          ]
        : [
            w.tipsPerHour(tips, job.hours, m(out, 'tipsPerHour')),
            w.cash(job.hours, moneyText(wages)),
            w.together(moneyText(wages), tips, m(out, 'totalPay'), job.hours, m(out, 'perHour')),
          ];
  const rows = TIP_FACTORS.map((factor) => {
    const other = scaleMoney(usd(Number(job.tips)), factor);
    const ran = tippedRun(moneyText(other).replace(/[$,]/g, ''), job.hours);
    return [moneyText(other), m(ran, 'topUp'), m(ran, 'perHour')];
  });
  return {
    sections: [
      { id: 'worked', heading: WORDS[lang].heading, paragraphs: [], steps },
      {
        id: 'tips',
        heading: w.tableHeading(job.hours),
        paragraphs: [w.tableIntro(job.hours)],
        table: { caption: w.caption(job.hours), head: w.head, rows },
      },
    ],
    sources: [SOURCES.factSheet15, SOURCES.factSheet23],
  };
};

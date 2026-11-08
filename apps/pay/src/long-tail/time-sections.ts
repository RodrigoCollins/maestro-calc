import { Rational, usd } from '@maestro-calc/core';
import { decimalHours } from '@maestro-calc/pay-core/decimal-hours';
import { ptoAccrual } from '@maestro-calc/pay-core/pto-accrual';
import { decimalHoursText, hoursText, moneyText, rateText } from '../format.ts';
import type { Lang } from '../time-card/receipt.ts';
import type { JobSections } from './convert-sections.ts';
import type { Minutes, Pto } from './routes.ts';
import { SOURCES } from './sections.ts';

/*
 * The sections of the minutes and PTO pages under their answer: the division worked out and what
 * two-place rounding does, the minutes on a week of 8-hour days, their pay at common rates and on a
 * quarter-hour time clock; the PTO accrual worked out, how long a day off takes to build up and
 * what the hours are worth. Every figure is the converter's or the PTO calculator's.
 */

/** The hourly rates of the pay tables. */
const RATES = [15, 20, 25, 30] as const;

/** The decimal hours of `hours` and `minutes`, from the converter. */
const decimalOf = (hours: number, minutes: number): Rational => {
  const ran = decimalHours.run({ hours: String(hours), minutes: String(minutes) });
  const value = ran.ok
    ? ran.value.outputs.find(({ key }) => key === 'decimalHours')?.value
    : undefined;
  if (value === undefined) throw new Error(`${String(hours)} h ${String(minutes)} min must run`);
  return value;
};

/** Two places, as payroll writes hours: the value the converter shows. */
const twoPlaces = (hours: Rational): Rational =>
  Rational.of(Math.round(Number(decimalHoursText(hours).replace(/,/g, '')) * 100), 100);

const dollars = (amount: Rational): string => moneyText(usd(amount));

const WORDS = {
  en: {
    heading: 'How the figures are worked out',
    minutes: {
      divide: (minutes: number, exact: string, rounded: boolean): string =>
        `${String(minutes)} ÷ 60 = ${exact}${rounded ? '…' : ''} hours.`,
      rounded: (decimal: string, back: string, minutes: number): string =>
        `Rounded to two places, as payroll writes it: ${decimal}. Back to minutes, ${decimal} × 60 = ${back} minutes, not quite ${String(minutes)}: on a long run of entries, the rounding adds up.`,
      exact: (decimal: string, minutes: number): string =>
        `It ends within two places, so ${decimal} × 60 = ${String(minutes)} minutes again, with nothing lost to rounding.`,
      week: (minutes: number, decimal: string, day: string, week: string, over: string): string =>
        `On a day of 8 hours ${String(minutes)} minutes, 8 + ${decimal} = ${day} hours; five such days come to ${week} hours, so ${over} of them are over 40 and owed time and a half under the FLSA (DOL Fact Sheet #23).`,
      payHeading: (minutes: number): string => `Pay for ${String(minutes)} minutes`,
      payIntro: (minutes: number, decimal: string): string =>
        `What ${String(minutes)} minutes pay at common rates, worked from the exact fraction of an hour and from the two-place ${decimal}:`,
      caption: (minutes: number): string => `${String(minutes)} minutes of work`,
      head: (decimal: string): readonly string[] => [
        'Hourly rate',
        'Exact (÷ 60)',
        `From ${decimal} h`,
      ],
      quarter: (minutes: number, quarter: number, hours: string): string =>
        `A time clock that rounds to the nearest quarter hour records ${String(minutes)} minutes as ${String(quarter)} minutes, ${hours} hours. Rounding is allowed only if, over time, you are still paid for all the time you worked (29 CFR 785.48).`,
    },
    pto: {
      steps: (
        days: number,
        year: string,
        biweekly: string,
        rate: string,
        worked: string,
        build: string,
      ): readonly string[] => [
        `A year: ${String(days)} days × 8 hours = ${year} hours of PTO.`,
        `Every two weeks: ${year} ÷ 26 paychecks = ${biweekly} hours.`,
        `Per hour worked: ${year} ÷ 2,080 hours (40 × 52) = ${rate}, or 1 hour off for every ${worked} hours you work.`,
        `A whole 8-hour day off builds up every ${build} weeks (52 ÷ ${String(days)}).`,
      ],
      valueHeading: (days: number): string => `What ${String(days)} days of PTO are worth`,
      valueIntro: (days: number, year: string): string =>
        `Paid at your regular rate, the ${year} hours of ${String(days)} days off are worth, before taxes:`,
      caption: (days: number): string => `${String(days)} paid days off a year`,
      head: ['Hourly rate', 'Accrued per paycheck', 'A year'],
      law: 'Federal law does not require PTO: the U.S. Department of Labor says the FLSA does not require payment for time not worked, such as vacations, sick leave or holidays. These benefits are a matter of agreement between you and your employer.',
    },
  },
  es: {
    heading: 'Cómo se calcula',
    minutes: {
      divide: (minutes: number, exact: string, rounded: boolean): string =>
        `${String(minutes)} ÷ 60 = ${exact}${rounded ? '…' : ''} horas.`,
      rounded: (decimal: string, back: string, minutes: number): string =>
        `Redondeado a dos decimales, como lo escribe la nómina: ${decimal}. De vuelta a minutos, ${decimal} × 60 = ${back} minutos, no llega a ${String(minutes)}: en muchas marcas, el redondeo se acumula.`,
      exact: (decimal: string, minutes: number): string =>
        `Termina dentro de dos decimales, así que ${decimal} × 60 = ${String(minutes)} minutos otra vez, sin perder nada por redondeo.`,
      week: (minutes: number, decimal: string, day: string, week: string, over: string): string =>
        `En un día de 8 horas y ${String(minutes)} minutos, 8 + ${decimal} = ${day} horas; cinco días así suman ${week} horas, así que ${over} pasan de 40 y se pagan a tiempo y medio según la FLSA (DOL Fact Sheet #23).`,
      payHeading: (minutes: number): string => `Pago por ${String(minutes)} minutos`,
      payIntro: (minutes: number, decimal: string): string =>
        `Lo que pagan ${String(minutes)} minutos con tarifas comunes, calculado con la fracción exacta de hora y con el ${decimal} de dos decimales:`,
      caption: (minutes: number): string => `${String(minutes)} minutos de trabajo`,
      head: (decimal: string): readonly string[] => [
        'Tarifa por hora',
        'Exacto (÷ 60)',
        `Con ${decimal} h`,
      ],
      quarter: (minutes: number, quarter: number, hours: string): string =>
        `Un reloj marcador que redondea al cuarto de hora más cercano registra ${String(minutes)} minutos como ${String(quarter)} minutos, ${hours} horas. El redondeo solo se permite si, con el tiempo, te pagan todo el tiempo que trabajaste (29 CFR 785.48).`,
    },
    pto: {
      steps: (
        days: number,
        year: string,
        biweekly: string,
        rate: string,
        worked: string,
        build: string,
      ): readonly string[] => [
        `Al año: ${String(days)} días × 8 horas = ${year} horas de PTO.`,
        `Cada dos semanas: ${year} ÷ 26 cheques = ${biweekly} horas.`,
        `Por hora trabajada: ${year} ÷ 2,080 horas (40 × 52) = ${rate}, o 1 hora libre por cada ${worked} horas que trabajas.`,
        `Un día libre entero de 8 horas se acumula cada ${build} semanas (52 ÷ ${String(days)}).`,
      ],
      valueHeading: (days: number): string => `Cuánto valen ${String(days)} días de PTO`,
      valueIntro: (days: number, year: string): string =>
        `Pagadas a tu tarifa regular, las ${year} horas de ${String(days)} días libres valen, antes de impuestos:`,
      caption: (days: number): string => `${String(days)} días libres pagados al año`,
      head: ['Tarifa por hora', 'Acumulado por cheque', 'Al año'],
      law: 'La ley federal no exige PTO: el Departamento de Trabajo de EE. UU. dice que la FLSA no exige pagar el tiempo no trabajado, como vacaciones, licencias por enfermedad o feriados. Estos beneficios son un acuerdo entre tú y tu empleador.',
    },
  },
} as const;

/** The sections and sources of the minutes page of `job` in `lang`. */
export const minutesSectionsOf = (job: Minutes, lang: Lang): JobSections => {
  const w = WORDS[lang].minutes;
  const n = job.minutes;
  const exact = decimalOf(0, n);
  const two = twoPlaces(exact);
  const decimal = decimalHoursText(exact);
  const rounded = !two.equals(exact);
  const day = decimalOf(8, n);
  const week = day.mul(Rational.of(5));
  const quarter = Math.round(n / 15) * 15;
  const rows = RATES.map((rate) => [
    moneyText(usd(rate)),
    dollars(exact.mul(Rational.of(rate))),
    dollars(two.mul(Rational.of(rate))),
  ]);
  return {
    sections: [
      {
        id: 'worked',
        heading: WORDS[lang].heading,
        paragraphs: [],
        steps: [
          w.divide(n, rateText(exact), (n * 10_000) % 60 !== 0),
          rounded
            ? w.rounded(decimal, hoursText(two.mul(Rational.of(60))), n)
            : w.exact(decimal, n),
          w.week(n, decimal, hoursText(day), hoursText(week), hoursText(week.sub(Rational.of(40)))),
        ],
      },
      {
        id: 'pay',
        heading: w.payHeading(n),
        paragraphs: [w.payIntro(n, decimal)],
        table: { caption: w.caption(n), head: w.head(decimal), rows },
        after: [w.quarter(n, quarter, decimalHoursText(Rational.of(quarter, 60)))],
      },
    ],
    sources: [SOURCES.factSheet23, SOURCES.ecfr48],
  };
};

/** The sections and sources of the PTO page of `job` in `lang`. */
export const ptoSectionsOf = (job: Pto, lang: Lang): JobSections => {
  const w = WORDS[lang].pto;
  const ran = ptoAccrual.run({ ptoDays: String(job.days) });
  if (!ran.ok) throw new Error(`the PTO job of ${String(job.days)} must run`);
  const out = new Map<string, Rational>(ran.value.outputs.map(({ key, value }) => [key, value]));
  const value = (key: string): Rational => {
    const found = out.get(key);
    if (found === undefined) throw new Error(`no PTO output ${key}`);
    return found;
  };
  const year = value('annualHours');
  const biweekly = value('biweekly');
  const rows = RATES.map((rate) => [
    moneyText(usd(rate)),
    dollars(biweekly.mul(Rational.of(rate))),
    dollars(year.mul(Rational.of(rate))),
  ]);
  return {
    sections: [
      {
        id: 'worked',
        heading: WORDS[lang].heading,
        paragraphs: [],
        steps: w.steps(
          job.days,
          hoursText(year),
          decimalHoursText(biweekly),
          rateText(value('perHourWorked')),
          hoursText(value('hoursPerPtoHour')),
          hoursText(Rational.of(52, job.days)),
        ),
      },
      {
        id: 'value',
        heading: w.valueHeading(job.days),
        paragraphs: [w.valueIntro(job.days, hoursText(year))],
        table: { caption: w.caption(job.days), head: w.head, rows },
        after: [w.law],
      },
    ],
    sources: [SOURCES.vacation],
  };
};

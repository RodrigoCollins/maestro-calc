import { type Money, Rational, usd } from '@maestro-calc/core';
import { overtime } from '@maestro-calc/pay-core/overtime';
import { hoursText, moneyText } from '../format.ts';
import { MINIMUM_WAGE_STATES, MINIMUM_WAGE_STATES_SOURCES } from '../guide/minimum-wage-states.ts';
import { OVERTIME_STATES_SOURCES } from '../guide/overtime-states.ts';
import type { Lang } from '../time-card/receipt.ts';
import { daysOf, type JobSections, payOf } from './convert-sections.ts';
import type { DoubleTime } from './routes.ts';
import { SOURCES } from './sections.ts';

/*
 * The sections of a double-time page under its answer: a 14-hour California day worked out hour by
 * hour with the overtime calculator, the same week under the federal rule, and three weeks priced
 * by the time card under each rule.
 */

/** The days of the overtime calculator, Monday first. */
const WEEK = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

/** A 14-hour Monday and four 8-hour days. */
const LONG_MONDAY = [14, 8, 8, 8, 8, 0, 0] as const;

/** Six 8-hour days and a 10-hour Sunday, the seventh consecutive day of the workweek. */
const SEVENTH_DAY = [8, 8, 8, 8, 8, 8, 10] as const;

/** The overtime calculator on the week of `hours`, Monday first, at `rate`, under `rule`. */
const weekOf = (
  rate: string,
  rule: 'federal' | 'california',
  hours: readonly number[] = LONG_MONDAY,
): ((key: string) => Money | Rational) => {
  const ran = overtime.run({
    rate,
    rule,
    ...Object.fromEntries(WEEK.map((day, index) => [day, String(hours[index] ?? 0)])),
  });
  if (!ran.ok) throw new Error(`the double-time week of ${rate} must run`);
  const out = new Map<string, Money | Rational>(
    ran.value.outputs.map(({ key, value }) => [key, value]),
  );
  return (key) => {
    const value = out.get(key);
    if (value === undefined) throw new Error(`no output ${key}`);
    return value;
  };
};

const text = (value: Money | Rational): string =>
  'currency' in value ? moneyText(value) : hoursText(value);

const WORDS = {
  en: {
    heading: 'How the figures are worked out',
    steps: (
      rate: string,
      double: string,
      half: string,
      f: (key: string) => string,
      fed: string,
    ): readonly string[] => [
      `Double time: ${rate} × 2 = ${double} an hour; time and a half is ${rate} × 1.5 = ${half}.`,
      'A 14-hour Monday in California: hours 1 to 8 are regular, hours 9 to 12 are time and a half, and hours 13 and 14 are double time.',
      `With four 8-hour days after it, the 46-hour week has ${f('regularHours')} regular hours (${f('regularPay')}), ${f('overtimeHours')} hours at time and a half (${f('overtimePay')}) and ${f('doubleHours')} at double time (${f('doublePay')}): ${f('pay')} before taxes.`,
      `Under the federal rule the same week pays ${fed}: only the 6 hours over 40 earn time and a half, and none earn double.`,
    ],
    seventhHeading: (rate: string): string => `A California seventh day at ${rate} an hour`,
    seventh: (rate: string): string =>
      `On the seventh day in a row of the workweek California pays the first 8 hours at time and a half and the rest at double time (California Labor Commissioner). Six 8-hour days and a 10-hour Sunday at ${rate} an hour, Saturday already past 40:`,
    seventhCaption: (rate: string): string => `Seven days in a row at ${rate} an hour`,
    seventhHead: ['Hours', 'California hours', 'California pay', 'Federal hours', 'Federal pay'],
    seventhRows: ['Regular', 'Time and a half', 'Double time', 'Week'],
    seventhAfter: (
      rate: string,
      ca: string,
      diff: string,
      fed: string,
      double: string,
      half: string,
    ): string =>
      `At ${rate} an hour the California week pays ${ca}, ${diff} more than the ${fed} of the federal rule: the 2 hours past 8 on Sunday earn ${double} an hour instead of ${half}.`,
    minimumsHeading: (rate: string): string => `${rate} an hour against state minimum wages`,
    above: (rate: string, ca: string, next: string, diff: string): string =>
      `California, the one state whose law requires double time, has a minimum wage of ${ca} in 2026 (${next} from January 1, 2027), so ${rate} is ${diff} an hour above it.`,
    below: (rate: string, ca: string, next: string, double: string): string =>
      `California, the one state whose law requires double time, has a minimum wage of ${ca} in 2026 (${next} from January 1, 2027), above ${rate}: a worker there earns at least ${ca} an hour, so double time is at least ${double}.`,
    many: (count: number, rate: string, list: string): string =>
      `${String(count)} states and DC have a 2026 minimum wage above ${rate}: ${list}. There the state minimum is the floor, and double time is at least twice it.`,
    one: (name: string, rate: string, wage: string): string =>
      `Only the ${name} has a 2026 minimum wage above ${rate}, at ${wage}.`,
    none: (rate: string, name: string, wage: string, gap: string, twice: string): string =>
      `No state and not DC has a 2026 minimum wage above ${rate}; the highest is the ${name}'s ${wage}, ${gap} below it, so double time at ${rate} is ${twice} an hour over twice the highest minimum.`,
    rulesHeading: (rate: string): string => `When ${rate} an hour pays double`,
    rules:
      'The federal FLSA never requires double time, only time and a half past 40 hours in a workweek (DOL Fact Sheet #23); California pays double past 12 hours in a day. The time card on three long-day weeks:',
    caption: (rate: string): string => `Weeks at ${rate} an hour, gross pay`,
    head: ['Week', 'Federal rule', 'California rule'],
    weeks: ['Three 13-hour days (39 h)', 'Two 16-hour days (32 h)', 'Four 12-hour days (48 h)'],
  },
  es: {
    heading: 'Cómo se calcula',
    steps: (
      rate: string,
      double: string,
      half: string,
      f: (key: string) => string,
      fed: string,
    ): readonly string[] => [
      `Tiempo doble: ${rate} × 2 = ${double} la hora; el tiempo y medio es ${rate} × 1.5 = ${half}.`,
      'Un lunes de 14 horas en California: las horas 1 a 8 son regulares, las horas 9 a 12 van a tiempo y medio, y las horas 13 y 14 a tiempo doble.',
      `Con cuatro días de 8 horas después, la semana de 46 horas tiene ${f('regularHours')} horas regulares (${f('regularPay')}), ${f('overtimeHours')} horas a tiempo y medio (${f('overtimePay')}) y ${f('doubleHours')} a tiempo doble (${f('doublePay')}): ${f('pay')} antes de impuestos.`,
      `Con la regla federal la misma semana paga ${fed}: solo las 6 horas que pasan de 40 van a tiempo y medio, y ninguna al doble.`,
    ],
    seventhHeading: (rate: string): string => `Un séptimo día en California a ${rate} la hora`,
    seventh: (rate: string): string =>
      `En el séptimo día seguido de la semana laboral California paga las primeras 8 horas a tiempo y medio y el resto al doble (Comisionado Laboral de California). Seis días de 8 horas y un domingo de 10 a ${rate} la hora, con el sábado ya después de 40:`,
    seventhCaption: (rate: string): string => `Siete días seguidos a ${rate} la hora`,
    seventhHead: [
      'Horas',
      'Horas en California',
      'Pago en California',
      'Horas federales',
      'Pago federal',
    ],
    seventhRows: ['Regulares', 'Tiempo y medio', 'Tiempo doble', 'Semana'],
    seventhAfter: (
      rate: string,
      ca: string,
      diff: string,
      fed: string,
      double: string,
      half: string,
    ): string =>
      `A ${rate} la hora la semana de California paga ${ca}, ${diff} más que los ${fed} de la regla federal: las 2 horas después de 8 del domingo pagan ${double} la hora en vez de ${half}.`,
    minimumsHeading: (rate: string): string =>
      `${rate} la hora frente a los salarios mínimos estatales`,
    above: (rate: string, ca: string, next: string, diff: string): string =>
      `California, el único estado cuya ley exige tiempo doble, tiene un salario mínimo de ${ca} en 2026 (${next} desde el 1 de enero de 2027), así que ${rate} está ${diff} la hora por encima.`,
    below: (rate: string, ca: string, next: string, double: string): string =>
      `California, el único estado cuya ley exige tiempo doble, tiene un salario mínimo de ${ca} en 2026 (${next} desde el 1 de enero de 2027), más que ${rate}: allí se gana al menos ${ca} la hora, así que el tiempo doble es de al menos ${double}.`,
    many: (count: number, rate: string, list: string): string =>
      `${String(count)} estados y DC tienen un salario mínimo de 2026 mayor que ${rate}: ${list}. Allí el mínimo estatal es el piso, y el tiempo doble es al menos el doble de él.`,
    one: (name: string, rate: string, wage: string): string =>
      `Solo el ${name} tiene un salario mínimo de 2026 mayor que ${rate}, de ${wage}.`,
    none: (rate: string, name: string, wage: string, gap: string, twice: string): string =>
      `Ningún estado, ni DC, tiene un salario mínimo de 2026 mayor que ${rate}; el más alto es el del ${name}, de ${wage}, ${gap} menos, así que el tiempo doble a ${rate} supera en ${twice} la hora al doble del mínimo más alto.`,
    rulesHeading: (rate: string): string => `Cuándo ${rate} la hora se paga al doble`,
    rules:
      'La ley federal FLSA nunca exige tiempo doble, solo tiempo y medio después de 40 horas en la semana (DOL Fact Sheet #23); California paga el doble después de 12 horas en un día. La tarjeta de horas con tres semanas de días largos:',
    caption: (rate: string): string => `Semanas a ${rate} la hora, pago bruto`,
    head: ['Semana', 'Regla federal', 'Regla de California'],
    weeks: [
      'Tres días de 13 horas (39 h)',
      'Dos días de 16 horas (32 h)',
      'Cuatro días de 12 horas (48 h)',
    ],
  },
} as const;

/** The sections and sources of the double-time page of `job` in `lang`. */
export const doubleSectionsOf = (job: DoubleTime, lang: Lang): JobSections => {
  const w = WORDS[lang];
  const rate = `$${job.amount}`;
  const california = weekOf(job.amount, 'california');
  const parts = ['regularPay', 'overtimePay', 'doublePay'].map((key) => california(key) as Money);
  const total = parts.reduce((sum, part) => sum.add(part.amount), Rational.of(0));
  if (!total.equals((california('pay') as Money).amount)) throw new Error('the week must add up');
  const weeks = [daysOf(3, 13), daysOf(2, 16), daysOf(4, 12)];
  const rows = weeks.map((days, index) => [
    w.weeks[index] ?? '',
    moneyText(payOf(job.amount, days, 'federal')),
    moneyText(payOf(job.amount, days, 'california')),
  ]);
  // the seventh day: the overtime calculator under each rule
  const seventhCa = weekOf(job.amount, 'california', SEVENTH_DAY);
  const seventhFed = weekOf(job.amount, 'federal', SEVENTH_DAY);
  const seventhRows = (
    [
      ['regularHours', 'regularPay'],
      ['overtimeHours', 'overtimePay'],
      ['doubleHours', 'doublePay'],
      ['totalHours', 'pay'],
    ] as const
  ).map(([hours, pay], index) => [
    w.seventhRows[index] ?? '',
    text(seventhCa(hours)),
    text(seventhCa(pay)),
    text(seventhFed(hours)),
    text(seventhFed(pay)),
  ]);
  const caPay = seventhCa('pay') as Money;
  const fedPay = seventhFed('pay') as Money;

  // the rate against the 2026 state minimum wages, from the state table
  const cents = Math.round(Number(job.amount) * 100);
  const dollars = (value: number): string => moneyText(usd(Rational.of(value, 100)));
  const californiaWage = MINIMUM_WAGE_STATES.find(({ name }) => name.en === 'California');
  if (californiaWage?.scheduled === undefined) throw new Error('California has a 2027 rate');
  const californiaText =
    cents > californiaWage.wage
      ? w.above(
          rate,
          dollars(californiaWage.wage),
          dollars(californiaWage.scheduled.wage),
          dollars(cents - californiaWage.wage),
        )
      : w.below(
          rate,
          dollars(californiaWage.wage),
          dollars(californiaWage.scheduled.wage),
          dollars(californiaWage.wage * 2),
        );
  const higher = MINIMUM_WAGE_STATES.filter(({ wage }) => wage > cents);
  const highest = MINIMUM_WAGE_STATES.toSorted((a, b) => b.wage - a.wage)[0];
  if (highest === undefined) throw new Error('the state table has rows');
  const [only] = higher;
  const higherText =
    higher.length === 0
      ? w.none(
          rate,
          highest.name[lang],
          dollars(highest.wage),
          dollars(cents - highest.wage),
          dollars((cents - highest.wage) * 2),
        )
      : higher.length === 1 && only !== undefined
        ? w.one(only.name[lang], rate, dollars(only.wage))
        : w.many(
            higher.filter(({ name }) => name.en !== 'District of Columbia').length,
            rate,
            higher.map(({ name, wage }) => `${name[lang]} (${dollars(wage)})`).join(', '),
          );

  return {
    sections: [
      {
        id: 'worked',
        heading: w.heading,
        paragraphs: [],
        steps: w.steps(
          rate,
          text(california('doubleRate')),
          text(california('overtimeRate')),
          (key) => text(california(key)),
          text(weekOf(job.amount, 'federal')('pay')),
        ),
      },
      {
        id: 'rules',
        heading: w.rulesHeading(rate),
        paragraphs: [w.rules],
        table: { caption: w.caption(rate), head: w.head, rows },
      },
      {
        id: 'seventh-day',
        heading: w.seventhHeading(rate),
        paragraphs: [w.seventh(rate)],
        table: { caption: w.seventhCaption(rate), head: w.seventhHead, rows: seventhRows },
        after: [
          w.seventhAfter(
            rate,
            moneyText(caPay),
            moneyText(usd(caPay.amount.sub(fedPay.amount))),
            moneyText(fedPay),
            text(california('doubleRate')),
            text(california('overtimeRate')),
          ),
        ],
      },
      {
        id: 'minimums',
        heading: w.minimumsHeading(rate),
        paragraphs: [californiaText, higherText],
      },
    ],
    sources: [
      SOURCES.factSheet23,
      OVERTIME_STATES_SOURCES.ca,
      MINIMUM_WAGE_STATES_SOURCES.dol,
      MINIMUM_WAGE_STATES_SOURCES.ca,
    ],
  };
};

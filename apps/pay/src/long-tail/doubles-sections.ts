import { type Money, Rational } from '@maestro-calc/core';
import { overtime } from '@maestro-calc/pay-core/overtime';
import { hoursText, moneyText } from '../format.ts';
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

/** The overtime calculator on a 14-hour Monday and four 8-hour days at `rate`, under `rule`. */
const weekOf = (
  rate: string,
  rule: 'federal' | 'california',
): ((key: string) => Money | Rational) => {
  const ran = overtime.run({
    rate,
    rule,
    mon: '14',
    tue: '8',
    wed: '8',
    thu: '8',
    fri: '8',
    sat: '0',
    sun: '0',
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
    rulesHeading: (rate: string): string => `When ${rate} an hour pays double`,
    rules:
      'The federal FLSA never requires double time: it requires time and a half for the hours over 40 in a workweek (DOL Fact Sheet #23). California owes double time for the hours over 12 in a workday and over 8 on the seventh consecutive day of the workweek (California Labor Commissioner). The time card prices three long-day weeks under each rule:',
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
    rulesHeading: (rate: string): string => `Cuándo ${rate} la hora se paga al doble`,
    rules:
      'La ley federal FLSA nunca exige tiempo doble: exige tiempo y medio por las horas que pasan de 40 en una semana laboral (DOL Fact Sheet #23). California paga tiempo doble por las horas que pasan de 12 en un día de trabajo y de 8 en el séptimo día seguido de la semana laboral (Comisionado Laboral de California). La tarjeta de horas calcula tres semanas de días largos con cada regla:',
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
    ],
    sources: [SOURCES.factSheet23, OVERTIME_STATES_SOURCES.ca],
  };
};

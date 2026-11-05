import { Rational, type Money } from '@maestro-calc/core';
import { decimalHours } from '@maestro-calc/pay-core/decimal-hours';
import { hoursBetween } from '@maestro-calc/pay-core/hours';
import { overtime } from '@maestro-calc/pay-core/overtime';
import { ptoAccrual } from '@maestro-calc/pay-core/pto-accrual';
import { timeCard } from '@maestro-calc/pay-core/time-card';
import { decimalHoursText, hoursText, rateText } from '../format.ts';
import { outputOf } from '../time-card/receipt.ts';

/** A worked example of the methodology page: raw time card fields over the default week. */
export interface Example {
  readonly id:
    'federal-week' | 'california-long-day' | 'california-ten-hour-days' | 'california-seventh-day';
  readonly inputs: Readonly<Record<string, string>>;
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

/** Every day off, then the given days worked with no break. */
export const only = (days: readonly string[], start: string, end: string): Record<string, string> =>
  Object.fromEntries(
    DAYS.flatMap((day) =>
      days.includes(day)
        ? [
            [day, start],
            [`${day}Out`, end],
            [`${day}Break`, '0'],
          ]
        : [
            [day, ''],
            [`${day}Out`, ''],
          ],
    ),
  );

export const EXAMPLES: readonly Example[] = [
  // the default week: Mon-Fri 9 h, Sat 4.5 h
  { id: 'federal-week', inputs: {} },
  // the default week with a 13 h Monday (6:00 am to 7:30 pm, 30 min break)
  {
    id: 'california-long-day',
    inputs: { rule: 'california', mon: '6:00 am', monOut: '7:30 pm' },
  },
  // DLSE opinion letter 2000.01.19: 10 hours a day, five days
  {
    id: 'california-ten-hour-days',
    inputs: {
      rule: 'california',
      ...only(['mon', 'tue', 'wed', 'thu', 'fri'], '8:00 am', '6:00 pm'),
    },
  },
  // seven days of 9 h (7:00 am to 4:30 pm, 30 min break): Sunday is the seventh day
  {
    id: 'california-seventh-day',
    inputs: {
      rule: 'california',
      sat: '7:00 am',
      satOut: '4:30 pm',
      satBreak: '30',
      sun: '7:00 am',
      sunOut: '4:30 pm',
      sunBreak: '30',
    },
  },
];

export interface Figures {
  readonly regularHours: Rational;
  readonly overtimeHours: Rational;
  readonly doubleHours: Rational;
  readonly pay: Money;
}

/** A week of time card fields, named; the guides' examples share this shape. */
export interface WorkedWeek {
  readonly id: string;
  readonly inputs: Readonly<Record<string, string>>;
}

/** What the time card gives for an example; a failing example is a build error. */
export const figuresOf = (example: WorkedWeek): Figures => {
  const ran = timeCard.run(example.inputs);
  if (!ran.ok) throw new Error(`worked example ${example.id} does not run`);
  return {
    regularHours: outputOf(ran.value, 'regularHours'),
    overtimeHours: outputOf(ran.value, 'overtimeHours'),
    doubleHours: outputOf(ran.value, 'doubleHours'),
    pay: outputOf(ran.value, 'pay'),
  };
};

/**
 * A worked example of the hours calculator (`hours`, start and end times) or of the decimal hours
 * converter (`decimal-hours`, hours and minutes, or a decimal read back): one figure of hours.
 */
export type HoursExample =
  | {
      readonly id: 'day-shift' | 'night-shift';
      readonly calculator: 'hours';
      readonly inputs: Readonly<Record<string, string>>;
    }
  | {
      readonly id: 'eight-twenty' | 'forty-five' | 'seven-seventy-five';
      readonly calculator: 'decimal-hours';
      readonly output: 'decimalHours' | 'fromDecimal';
      readonly inputs: Readonly<Record<string, string>>;
    };

export const HOURS_EXAMPLES: readonly HoursExample[] = [
  {
    id: 'day-shift',
    calculator: 'hours',
    inputs: { start: '9:00', end: '17:30', unpaidBreak: '30' },
  },
  {
    id: 'night-shift',
    calculator: 'hours',
    inputs: { start: '22:00', end: '6:15', unpaidBreak: '0' },
  },
  {
    id: 'eight-twenty',
    calculator: 'decimal-hours',
    output: 'decimalHours',
    inputs: { hours: '8', minutes: '20' },
  },
  {
    id: 'forty-five',
    calculator: 'decimal-hours',
    output: 'decimalHours',
    inputs: { hours: '0', minutes: '45' },
  },
  {
    id: 'seven-seventy-five',
    calculator: 'decimal-hours',
    output: 'fromDecimal',
    inputs: { decimal: '7.75' },
  },
];

/** The hours an example comes to; a failing example is a build error. */
export const hoursOf = (example: HoursExample): Rational => {
  const ran =
    example.calculator === 'hours'
      ? hoursBetween.run(example.inputs)
      : decimalHours.run(example.inputs);
  if (!ran.ok) throw new Error(`methodology example ${example.id} does not run`);
  const key = example.calculator === 'hours' ? 'hours' : example.output;
  const value = ran.value.outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`no hours ${key} in ${example.id}`);
  return value;
};

/** A worked example of the PTO accrual calculator: its raw fields over the defaults. */
export interface PtoExample {
  readonly id: 'two-weeks' | 'three-weeks' | 'part-time' | 'four-weeks';
  readonly inputs: Readonly<Record<string, string>>;
}

export const PTO_EXAMPLES: readonly PtoExample[] = [
  { id: 'two-weeks', inputs: {} },
  { id: 'three-weeks', inputs: { ptoDays: '15' } },
  { id: 'part-time', inputs: { hoursPerDay: '6', hoursPerWeek: '30' } },
  { id: 'four-weeks', inputs: { ptoDays: '20' } },
];

/** The figures the page shows for a PTO example, written as the calculator writes them. */
export interface PtoFigures {
  readonly annual: string;
  readonly biweekly: string;
  readonly perHour: string;
}

/** The figures of a PTO example; a failing example is a build error. */
export const ptoFiguresOf = (example: PtoExample): PtoFigures => {
  const ran = ptoAccrual.run(example.inputs);
  if (!ran.ok) throw new Error(`methodology example ${example.id} does not run`);
  const hours = (key: string): Rational => {
    const value = ran.value.outputs.find((output) => output.key === key)?.value;
    if (!(value instanceof Rational)) throw new Error(`no hours ${key} in ${example.id}`);
    return value;
  };
  return {
    annual: hoursText(hours('annualHours')),
    biweekly: decimalHoursText(hours('biweekly')),
    perHour: rateText(hours('perHourWorked')),
  };
};

/** A worked example of the overtime calculator: the hours of each day, every other day off. */
export interface OvertimeExample {
  readonly id: 'four-tens-federal' | 'four-tens-california' | 'long-day-california';
  readonly inputs: Readonly<Record<string, string>>;
}

const OFF = { mon: '0', tue: '0', wed: '0', thu: '0', fri: '0', sat: '0', sun: '0' };
const FOUR_TENS = { ...OFF, mon: '10', tue: '10', wed: '10', thu: '10' };

export const OVERTIME_EXAMPLES: readonly OvertimeExample[] = [
  { id: 'four-tens-federal', inputs: FOUR_TENS },
  { id: 'four-tens-california', inputs: { ...FOUR_TENS, rule: 'california' } },
  {
    id: 'long-day-california',
    inputs: { ...OFF, rule: 'california', mon: '13', tue: '8', wed: '8', thu: '8', fri: '8' },
  },
];

/** What the overtime calculator gives for an example; a failing example is a build error. */
export const overtimeFiguresOf = (example: OvertimeExample): Figures => {
  const ran = overtime.run(example.inputs);
  if (!ran.ok) throw new Error(`methodology example ${example.id} does not run`);
  const out = new Map<string, Money | Rational>(
    ran.value.outputs.map(({ key, value }) => [key, value]),
  );
  const hours = (key: string): Rational => {
    const value = out.get(key);
    if (!(value instanceof Rational)) throw new Error(`no hours ${key}`);
    return value;
  };
  const pay = out.get('pay');
  if (pay === undefined || !('currency' in pay)) throw new Error('no pay');
  return {
    regularHours: hours('regularHours'),
    overtimeHours: hours('overtimeHours'),
    doubleHours: hours('doubleHours'),
    pay,
  };
};

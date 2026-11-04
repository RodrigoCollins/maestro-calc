import { Rational, type Money } from '@maestro-calc/core';
import { overtime } from '@maestro-calc/pay-core/overtime';
import { timeCard } from '@maestro-calc/pay-core/time-card';
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

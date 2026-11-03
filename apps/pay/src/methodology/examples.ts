import type { Money, Rational } from '@maestro-calc/core';
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
const only = (days: readonly string[], start: string, end: string): Record<string, string> =>
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

/** What the time card gives for an example; a failing example is a build error. */
export const figuresOf = (example: Example): Figures => {
  const ran = timeCard.run(example.inputs);
  if (!ran.ok) throw new Error(`methodology example ${example.id} does not run`);
  return {
    regularHours: outputOf(ran.value, 'regularHours'),
    overtimeHours: outputOf(ran.value, 'overtimeHours'),
    doubleHours: outputOf(ran.value, 'doubleHours'),
    pay: outputOf(ran.value, 'pay'),
  };
};

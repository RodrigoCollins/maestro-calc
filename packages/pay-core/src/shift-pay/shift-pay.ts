import {
  clockInput,
  countInput,
  defineCalculator,
  moneyInput,
  scaleMoney,
  usd,
} from '@maestro-calc/core';
import { hoursBetween } from '../hours/hours.ts';
import { payOf, splitWeek } from '../overtime/split.ts';

/** The shifts of the week the calculator pays: Monday to Friday. */
const DAYS = 5;

/**
 * One shift and its pay, the tool of the shift pages: the hours between two times less an unpaid
 * break (the hours calculator's, with its warnings), their pay for the day at an hourly rate, and a
 * week of five such shifts paid under the federal rule, every hour past 40 at time and a half.
 */
export const shiftPay = defineCalculator({
  id: 'shift-pay',
  inputs: [
    clockInput({ key: 'start', urlKey: 's', default: 540 }),
    clockInput({ key: 'end', urlKey: 'e', default: 1020 }),
    countInput({ key: 'unpaidBreak', urlKey: 'b', default: 30, max: 720 }),
    moneyInput({ key: 'rate', urlKey: 'r', default: usd(20), max: usd(1000) }),
  ],
  outputs: [
    { key: 'hours', measure: 'hours', role: 'primary' },
    { key: 'shiftHours', measure: 'hours', role: 'secondary' },
    { key: 'dayPay', measure: 'money', role: 'secondary' },
    { key: 'weekHours', measure: 'hours', role: 'secondary' },
    { key: 'overtimeHours', measure: 'hours', role: 'secondary' },
    { key: 'weekPay', measure: 'money', role: 'secondary' },
  ],
  warnings: ['overnight', 'missingTime', 'sameTime', 'breakTooLong'],
  compute: ({ start, end, unpaidBreak, rate }) => {
    const day = hoursBetween.compute({ start, end, unpaidBreak });
    const { hours, shiftHours } = day.outputs;
    const split = splitWeek(
      'federal',
      Array.from({ length: DAYS }, () => hours),
      rate,
    );
    return {
      outputs: {
        hours,
        shiftHours,
        dayPay: scaleMoney(rate, hours),
        weekHours: split.regular.add(split.overtime),
        overtimeHours: split.overtime,
        weekPay: payOf(rate, split).pay,
      },
      shopping: [],
      warnings: day.warnings,
    };
  },
});

import {
  decimalInput,
  defineCalculator,
  moneyInput,
  Rational,
  scaleMoney,
  selectInput,
  usd,
} from '@maestro-calc/core';
import { payOf, RULES, splitWeek } from './split.ts';

const ZERO = Rational.of(0);

/** A day's hours worked, keyed by the day and its two-letter stem; the week starts Monday. */
const day = <const K extends string>(key: K, urlKey: string, hours: Rational) =>
  decimalInput({ key, urlKey, default: hours, min: ZERO, max: Rational.of(24) });

/**
 * The overtime calculator of plans/pago-del-trabajador/PLAN.md: the hourly rate, the overtime rule
 * and the hours worked each day of the week give the regular, overtime and double-time hours and
 * the gross pay. The default week is the time card's: Monday to Friday 9 h, Saturday 4.5 h.
 */
export const overtime = defineCalculator({
  id: 'overtime',
  inputs: [
    moneyInput({ key: 'rate', urlKey: 'r', default: usd(22), max: usd(1000) }),
    selectInput({ key: 'rule', urlKey: 'ru', options: RULES, default: 'federal' }),
    day('mon', 'mo', Rational.of(9)),
    day('tue', 'tu', Rational.of(9)),
    day('wed', 'we', Rational.of(9)),
    day('thu', 'th', Rational.of(9)),
    day('fri', 'fr', Rational.of(9)),
    day('sat', 'sa', Rational.of(9, 2)),
    day('sun', 'su', ZERO),
  ],
  outputs: [
    { key: 'pay', measure: 'money', role: 'primary' },
    { key: 'totalHours', measure: 'hours', role: 'secondary' },
    { key: 'regularHours', measure: 'hours', role: 'secondary' },
    { key: 'overtimeHours', measure: 'hours', role: 'secondary' },
    { key: 'doubleHours', measure: 'hours', role: 'secondary' },
    { key: 'regularPay', measure: 'money', role: 'secondary' },
    { key: 'overtimePay', measure: 'money', role: 'secondary' },
    { key: 'doublePay', measure: 'money', role: 'secondary' },
    { key: 'overtimeRate', measure: 'money', role: 'secondary' },
    { key: 'doubleRate', measure: 'money', role: 'secondary' },
  ],
  warnings: [],
  compute: (inputs) => {
    const { mon, tue, wed, thu, fri, sat, sun } = inputs;
    const split = splitWeek(inputs.rule, [mon, tue, wed, thu, fri, sat, sun], inputs.rate);
    return {
      outputs: {
        ...payOf(inputs.rate, split),
        totalHours: split.regular.add(split.overtime).add(split.double),
        regularHours: split.regular,
        overtimeHours: split.overtime,
        doubleHours: split.double,
        overtimeRate: scaleMoney(inputs.rate, Rational.of(3, 2)),
        doubleRate: scaleMoney(inputs.rate, Rational.of(2)),
      },
      shopping: [],
      warnings: [],
    };
  },
});

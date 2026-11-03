import { defineCalculator, Rational, scaleMoney, usd, type Money } from '@maestro-calc/core';

/** The periods a pay amount can be given in, and how many of each fit in a year. */
const PERIODS = ['hour', 'week', 'biweekly', 'semimonthly', 'month', 'year'] as const;
type Period = (typeof PERIODS)[number];

/**
 * Hourly pay to salary and back (plans/pago-del-trabajador/PLAN.md): an amount per period, the
 * hours worked a week and the weeks paid a year give the pay in every period. Weekly is hourly
 * times the hours, biweekly two weeks, annual the weekly pay times the weeks; monthly and
 * semimonthly divide the annual by 12 and 24. Any other period goes through the annual pay.
 */
export const payConverter = defineCalculator({
  id: 'pay-converter',
  inputs: [
    { kind: 'money', key: 'amount', urlKey: 'a', default: usd(22), max: usd(10_000_000) },
    { kind: 'select', key: 'per', urlKey: 'p', options: PERIODS, default: 'hour' },
    { kind: 'count', key: 'hoursPerWeek', urlKey: 'h', default: 40, min: 1, max: 168 },
    { kind: 'count', key: 'weeksPerYear', urlKey: 'w', default: 52, min: 1, max: 52 },
  ],
  outputs: [
    { key: 'annual', measure: 'money', role: 'primary' },
    { key: 'hourly', measure: 'money', role: 'secondary' },
    { key: 'weekly', measure: 'money', role: 'secondary' },
    { key: 'biweekly', measure: 'money', role: 'secondary' },
    { key: 'semimonthly', measure: 'money', role: 'secondary' },
    { key: 'monthly', measure: 'money', role: 'secondary' },
  ],
  warnings: [],
  compute: (inputs) => {
    const hours = Rational.of(inputs.hoursPerWeek);
    const weeks = Rational.of(inputs.weeksPerYear);
    // how many of each period make the annual pay
    const perYear: Readonly<Record<Period, Rational>> = {
      hour: hours.mul(weeks),
      week: weeks,
      biweekly: weeks.div(Rational.of(2)),
      semimonthly: Rational.of(24),
      month: Rational.of(12),
      year: Rational.of(1),
    };
    const annual: Money = scaleMoney(inputs.amount, perYear[inputs.per]);
    const per = (count: Rational): Money => scaleMoney(annual, Rational.of(1).div(count));
    return {
      outputs: {
        annual,
        hourly: per(perYear.hour),
        weekly: per(perYear.week),
        biweekly: per(perYear.biweekly),
        semimonthly: per(perYear.semimonthly),
        monthly: per(perYear.month),
      },
      shopping: [],
      warnings: [],
    };
  },
});

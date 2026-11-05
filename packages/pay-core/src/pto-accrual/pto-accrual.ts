import { decimalInput, defineCalculator, Rational } from '@maestro-calc/core';

const WEEKS_PER_YEAR = Rational.of(52);

/**
 * Paid time off spread over the year, the way an accrual policy earns it: the days off a year
 * times the hours of a day off are the PTO hours a year, divided by the pay periods (52 weeks,
 * 26 two-week periods, 24 half months, 12 months) and by the hours worked a year (the hours a
 * week times 52). The reverse rate is the hours worked to earn one hour off. Time off above the
 * hours worked a year is a `moreThanWorked` notice: no accrual policy earns more than one hour
 * off per hour worked.
 */
export const ptoAccrual = defineCalculator({
  id: 'pto-accrual',
  inputs: [
    decimalInput({
      key: 'ptoDays',
      urlKey: 'd',
      default: Rational.of(10),
      min: Rational.of(1, 2),
      max: Rational.of(365),
    }),
    decimalInput({
      key: 'hoursPerDay',
      urlKey: 'h',
      default: Rational.of(8),
      min: Rational.of(1),
      max: Rational.of(24),
    }),
    decimalInput({
      key: 'hoursPerWeek',
      urlKey: 'w',
      default: Rational.of(40),
      min: Rational.of(1),
      max: Rational.of(168),
    }),
  ],
  outputs: [
    { key: 'biweekly', measure: 'hours', role: 'primary' },
    { key: 'weekly', measure: 'hours', role: 'secondary' },
    { key: 'semimonthly', measure: 'hours', role: 'secondary' },
    { key: 'monthly', measure: 'hours', role: 'secondary' },
    { key: 'perHourWorked', measure: 'hours', role: 'secondary' },
    { key: 'hoursPerPtoHour', measure: 'hours', role: 'secondary' },
    { key: 'annualHours', measure: 'hours', role: 'secondary' },
  ],
  warnings: ['moreThanWorked'],
  compute: ({ ptoDays, hoursPerDay, hoursPerWeek }) => {
    const annualHours = ptoDays.mul(hoursPerDay);
    const worked = hoursPerWeek.mul(WEEKS_PER_YEAR);
    const per = (periods: number): Rational => annualHours.div(Rational.of(periods));
    return {
      outputs: {
        biweekly: per(26),
        weekly: per(52),
        semimonthly: per(24),
        monthly: per(12),
        perHourWorked: annualHours.div(worked),
        hoursPerPtoHour: worked.div(annualHours),
        annualHours,
      },
      shopping: [],
      warnings:
        annualHours.compare(worked) > 0 ? [{ code: 'moreThanWorked' as const, params: {} }] : [],
    };
  },
});

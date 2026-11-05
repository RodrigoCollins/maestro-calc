import {
  countInput,
  decimalInput,
  defineCalculator,
  Rational,
  toDecimalParts,
} from '@maestro-calc/core';

const SIXTY = Rational.of(60);

/**
 * Hours and minutes to decimal hours, the way a time card or a payroll system writes them: the
 * hours plus the minutes over 60, exact (the page rounds to two places). The reverse line reads
 * a decimal back as hours and whole minutes: the decimal times 60, to the nearest minute.
 */
export const decimalHours = defineCalculator({
  id: 'decimal-hours',
  inputs: [
    countInput({ key: 'hours', urlKey: 'h', default: 8, max: 999 }),
    countInput({ key: 'minutes', urlKey: 'm', default: 20, max: 59 }),
    decimalInput({
      key: 'decimal',
      urlKey: 'd',
      default: Rational.of(31, 4),
      max: Rational.of(999),
    }),
  ],
  outputs: [
    { key: 'decimalHours', measure: 'hours', role: 'primary' },
    { key: 'fromDecimal', measure: 'hours', role: 'secondary' },
  ],
  warnings: [],
  compute: ({ hours, minutes, decimal }) => {
    const wholeMinutes = toDecimalParts(decimal.mul(SIXTY), 0).integer;
    return {
      outputs: {
        decimalHours: Rational.of(hours).add(Rational.of(minutes).div(SIXTY)),
        fromDecimal: Rational.of(wholeMinutes).div(SIXTY),
      },
      shopping: [],
      warnings: [],
    };
  },
});

import {
  addMoney,
  decimalInput,
  defineCalculator,
  moneyInput,
  percentInput,
  Rational,
  scaleMoney,
  selectInput,
  usd,
} from '@maestro-calc/core';

const ZERO = Rational.of(0);
const HUNDRED = Rational.of(100);
const HALF = Rational.of(1, 2);
const FORTY = Rational.of(40);
const WEEK = Rational.of(168);

/**
 * A week paid at a base rate and at a shift differential (nights, evenings, weekends): the
 * differential is a percent of the base rate or an amount an hour (`source`). The FLSA counts the
 * differential in the regular rate (29 CFR 778.207(b)), and with two rates the regular rate is the
 * weighted average, the straight-time pay over the hours worked (29 CFR 778.115); the hours over
 * 40 add half of it as the overtime premium. Hours above the 168 of a week are a `moreThanAWeek`
 * notice.
 */
export const shiftDifferential = defineCalculator({
  id: 'shift-differential',
  inputs: [
    moneyInput({
      key: 'rate',
      urlKey: 'r',
      default: usd(20),
      min: usd(Rational.of(1, 100)),
      max: usd(1000),
    }),
    selectInput({ key: 'source', urlKey: 's', options: ['percent', 'amount'], default: 'percent' }),
    percentInput({ key: 'percent', urlKey: 'p', default: Rational.of(10) }),
    moneyInput({ key: 'amount', urlKey: 'a', default: usd(2), max: usd(100) }),
    decimalInput({ key: 'baseHours', urlKey: 'b', default: Rational.of(24), min: ZERO, max: WEEK }),
    decimalInput({
      key: 'shiftHours',
      urlKey: 'n',
      default: Rational.of(16),
      min: Rational.of(1, 2),
      max: WEEK,
    }),
  ],
  outputs: [
    { key: 'pay', measure: 'money', role: 'primary' },
    { key: 'shiftRate', measure: 'money', role: 'secondary' },
    { key: 'differentialPay', measure: 'money', role: 'secondary' },
    { key: 'straightPay', measure: 'money', role: 'secondary' },
    { key: 'totalHours', measure: 'hours', role: 'secondary' },
    { key: 'regularRate', measure: 'money', role: 'secondary' },
    { key: 'overtimeHours', measure: 'hours', role: 'secondary' },
    { key: 'overtimePremium', measure: 'money', role: 'secondary' },
  ],
  warnings: ['moreThanAWeek'],
  compute: ({ rate, source, percent, amount, baseHours, shiftHours }) => {
    const differential = source === 'amount' ? amount : scaleMoney(rate, percent.div(HUNDRED));
    const shiftRate = addMoney(rate, differential);
    const straightPay = addMoney(scaleMoney(rate, baseHours), scaleMoney(shiftRate, shiftHours));
    const totalHours = baseHours.add(shiftHours);
    const regularRate = scaleMoney(straightPay, Rational.of(1).div(totalHours));
    const over = totalHours.sub(FORTY);
    const overtimeHours = over.compare(ZERO) > 0 ? over : ZERO;
    const overtimePremium = scaleMoney(regularRate, overtimeHours.mul(HALF));
    return {
      outputs: {
        pay: addMoney(straightPay, overtimePremium),
        shiftRate,
        differentialPay: scaleMoney(differential, shiftHours),
        straightPay,
        totalHours,
        regularRate,
        overtimeHours,
        overtimePremium,
      },
      shopping: [],
      warnings:
        totalHours.compare(WEEK) > 0 ? [{ code: 'moreThanAWeek' as const, params: {} }] : [],
    };
  },
});

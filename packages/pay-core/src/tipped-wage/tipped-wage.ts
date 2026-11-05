import {
  addMoney,
  compareMoney,
  decimalInput,
  defineCalculator,
  moneyInput,
  Rational,
  scaleMoney,
  subMoney,
  usd,
  type Money,
} from '@maestro-calc/core';

const ZERO = Rational.of(0);
const HALF = Rational.of(1, 2);
const FORTY = Rational.of(40);
const WEEK = Rational.of(168);
/** The federal minimum wage, $7.25 an hour (FLSA section 6). */
const MINIMUM_WAGE = usd(Rational.of(725, 100));
/** The least cash wage an employer that takes a tip credit pays, $2.13 an hour (FLSA 3(m)). */
const CASH_WAGE = usd(Rational.of(213, 100));

const largerOf = (a: Money, b: Money): Money => (compareMoney(a, b) >= 0 ? a : b);
const smallerOf = (a: Money, b: Money): Money => (compareMoney(a, b) <= 0 ? a : b);

/**
 * A tipped week under the FLSA (DOL Fact Sheet #15): the employer pays a cash wage of at least
 * $2.13 an hour and counts the tips toward the $7.25 minimum, a tip credit of at most the gap
 * between the two ($5.12 at $2.13) and never more than the tips. When cash wage + tips fall short
 * of $7.25 an hour over the workweek, the employer makes up the difference (`topUp`, with a
 * `topUpOwed` notice). Overtime is figured on the full minimum wage, or on the cash wage when it
 * is higher: the hours over 40 add half of it, paid by the employer.
 */
export const tippedWage = defineCalculator({
  id: 'tipped-wage',
  inputs: [
    moneyInput({
      key: 'cashWage',
      urlKey: 'c',
      default: CASH_WAGE,
      min: CASH_WAGE,
      max: usd(1000),
    }),
    moneyInput({ key: 'tips', urlKey: 't', default: usd(250), max: usd(100000) }),
    decimalInput({
      key: 'hours',
      urlKey: 'h',
      default: Rational.of(40),
      min: Rational.of(1, 2),
      max: WEEK,
    }),
  ],
  outputs: [
    { key: 'perHour', measure: 'money', role: 'primary' },
    { key: 'totalPay', measure: 'money', role: 'secondary' },
    { key: 'wages', measure: 'money', role: 'secondary' },
    { key: 'tipsPerHour', measure: 'money', role: 'secondary' },
    { key: 'tipCredit', measure: 'money', role: 'secondary' },
    { key: 'topUp', measure: 'money', role: 'secondary' },
    { key: 'overtimeHours', measure: 'hours', role: 'secondary' },
    { key: 'overtimePremium', measure: 'money', role: 'secondary' },
  ],
  warnings: ['topUpOwed'],
  compute: ({ cashWage, tips, hours }) => {
    const perHour = Rational.of(1).div(hours);
    const wages = scaleMoney(cashWage, hours);
    const gap = scaleMoney(largerOf(subMoney(MINIMUM_WAGE, cashWage), usd(0)), hours);
    const tipCredit = smallerOf(tips, gap);
    const topUp = subMoney(gap, tipCredit);
    const over = hours.sub(FORTY);
    const overtimeHours = over.compare(ZERO) > 0 ? over : ZERO;
    const regularRate = largerOf(cashWage, MINIMUM_WAGE);
    const overtimePremium = scaleMoney(regularRate, overtimeHours.mul(HALF));
    const totalPay = addMoney(addMoney(wages, topUp), addMoney(overtimePremium, tips));
    return {
      outputs: {
        perHour: scaleMoney(totalPay, perHour),
        totalPay,
        wages,
        tipsPerHour: scaleMoney(tips, perHour),
        tipCredit,
        topUp,
        overtimeHours,
        overtimePremium,
      },
      shopping: [],
      warnings: compareMoney(topUp, usd(0)) > 0 ? [{ code: 'topUpOwed' as const, params: {} }] : [],
    };
  },
});

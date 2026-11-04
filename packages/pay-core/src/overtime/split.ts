import { addMoney, Rational, scaleMoney, type Money } from '@maestro-calc/core';

/** The overtime rules a week can be paid under. */
export const RULES = ['federal', 'california'] as const;
export type Rule = (typeof RULES)[number];

/** The hours of a week split by the rate they are paid at. */
export interface Split {
  readonly regular: Rational;
  readonly overtime: Rational;
  readonly double: Rational;
}

const ZERO = Rational.of(0);
const H8 = Rational.of(8);
const H12 = Rational.of(12);
const H40 = Rational.of(40);
const ONE_AND_A_HALF = Rational.of(3, 2);
const TWO = Rational.of(2);

// The smaller and the larger of two exact amounts as (a + b ∓ |a - b|) / 2: no comparison whose
// tie could go either way, so every mutant of these lines changes a result.
const min = (a: Rational, b: Rational): Rational => a.add(b).sub(a.sub(b).abs()).div(TWO);
const max = (a: Rational, b: Rational): Rational => a.add(b).add(a.sub(b).abs()).div(TWO);
const sum = (hours: readonly Rational[]): Rational => hours.reduce((a, b) => a.add(b), ZERO);

/** FLSA: every hour past 40 in the workweek is overtime at 1.5x; there is no double time. */
const federal = (days: readonly Rational[]): Split => {
  const total = sum(days);
  const regular = min(total, H40);
  return { regular, overtime: total.sub(regular), double: ZERO };
};

/**
 * California (Labor Code 510): past 8 h in a day at 1.5x and past 12 h at 2x; on the seventh
 * consecutive workday the first 8 h at 1.5x and the rest at 2x; then regular hours past 40 in the
 * week become overtime (daily overtime is not counted again: DLSE opinion letter 2000.01.19).
 */
const california = (days: readonly Rational[]): Split => {
  const seventh = days.every((hours) => hours.sign() > 0);
  let regular = ZERO;
  let overtime = ZERO;
  let double = ZERO;
  days.forEach((hours, index) => {
    if (seventh && index === days.length - 1) {
      overtime = overtime.add(min(hours, H8));
      double = double.add(max(hours.sub(H8), ZERO));
      return;
    }
    regular = regular.add(min(hours, H8));
    overtime = overtime.add(min(max(hours.sub(H8), ZERO), H12.sub(H8)));
    double = double.add(max(hours.sub(H12), ZERO));
  });
  const excess = max(regular.sub(H40), ZERO);
  return { regular: regular.sub(excess), overtime: overtime.add(excess), double };
};

/** The hours worked each day of a Monday-to-Sunday week, split under `rule`. */
export const splitWeek = (rule: Rule, days: readonly Rational[]): Split =>
  rule === 'california' ? california(days) : federal(days);

/** The pay of a split week at an hourly `rate`: regular at 1x, overtime at 1.5x, double at 2x. */
export const payOf = (
  rate: Money,
  split: Split,
): {
  readonly regularPay: Money;
  readonly overtimePay: Money;
  readonly doublePay: Money;
  readonly pay: Money;
} => {
  const regularPay = scaleMoney(rate, split.regular);
  const overtimePay = scaleMoney(rate, split.overtime.mul(ONE_AND_A_HALF));
  const doublePay = scaleMoney(rate, split.double.mul(TWO));
  return {
    regularPay,
    overtimePay,
    doublePay,
    pay: addMoney(addMoney(regularPay, overtimePay), doublePay),
  };
};

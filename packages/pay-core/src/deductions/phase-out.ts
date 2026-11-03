import { compareMoney, Rational, subMoney, usd, type Money } from '@maestro-calc/core';

const STEP = Rational.of(1000);
const CUT = 100n;

/**
 * Schedule 1-A (Form 1040), lines 10-13 and 18-21: a capped deduction less $100 for each whole
 * $1,000 by which the MAGI exceeds the threshold (1.5 steps round down to 1), never below zero.
 */
export const phasedOut = (capped: Money, magi: Money, threshold: Money): Money => {
  if (compareMoney(magi, threshold) <= 0) return capped;
  const steps = magi.amount.sub(threshold.amount).div(STEP).floor();
  const left = subMoney(capped, usd(Rational.of(steps * CUT)));
  return compareMoney(left, usd(0)) < 0 ? usd(0) : left;
};

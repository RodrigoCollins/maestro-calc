import {
  compareMoney,
  defineCalculator,
  Rational,
  scaleMoney,
  subMoney,
  usd,
} from '@maestro-calc/core';
import { phasedOut } from '../deductions/phase-out.ts';
import { BRACKETS, FILINGS, savingsOf, THRESHOLD } from '../deductions/schedule-1a.ts';

/** Line 15: the overtime cap, $12,500 or $25,000 on a joint return. */
const CAP = { single: usd(12_500), joint: usd(25_000) } as const;
const HALF = Rational.of(1, 2);

/**
 * No tax on overtime (Schedule 1-A, Part III): the qualified overtime compensation is the "half" of
 * the time and a half the FLSA requires, from the hours and the rate or straight from the W-2;
 * it is capped, then phased out by MAGI. The savings multiply the deduction by the bracket.
 */
export const noTaxOnOvertime = defineCalculator({
  id: 'no-tax-on-overtime',
  inputs: [
    { kind: 'select', key: 'source', urlKey: 's', options: ['hours', 'amount'], default: 'hours' },
    { kind: 'money', key: 'rate', urlKey: 'r', default: usd(22), max: usd(1000) },
    { kind: 'count', key: 'overtimeHours', urlKey: 'o', default: 300, max: 5000 },
    { kind: 'money', key: 'premium', urlKey: 'q', default: usd(3300), max: usd(1_000_000) },
    { kind: 'select', key: 'filing', urlKey: 'f', options: FILINGS, default: 'single' },
    { kind: 'money', key: 'magi', urlKey: 'm', default: usd(60_000), max: usd(100_000_000) },
    { kind: 'select', key: 'bracket', urlKey: 'b', options: BRACKETS, default: '12' },
  ],
  outputs: [
    { key: 'deduction', measure: 'money', role: 'primary' },
    { key: 'premium', measure: 'money', role: 'secondary' },
    { key: 'reduction', measure: 'money', role: 'secondary' },
    { key: 'savings', measure: 'money', role: 'secondary' },
  ],
  warnings: [],
  compute: (inputs) => {
    const premium =
      inputs.source === 'amount'
        ? inputs.premium
        : scaleMoney(inputs.rate, Rational.of(inputs.overtimeHours).mul(HALF));
    const cap = CAP[inputs.filing];
    const capped = compareMoney(premium, cap) < 0 ? premium : cap;
    const deduction = phasedOut(capped, inputs.magi, THRESHOLD[inputs.filing]);
    return {
      outputs: {
        deduction,
        premium,
        reduction: subMoney(capped, deduction),
        savings: savingsOf(deduction, inputs.bracket),
      },
      shopping: [],
      warnings: [],
    };
  },
});

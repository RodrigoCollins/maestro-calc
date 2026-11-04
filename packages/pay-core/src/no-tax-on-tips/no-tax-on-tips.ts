import { phasedOut } from '../deductions/phase-out.ts';
import { BRACKETS, FILINGS, savingsOf, THRESHOLD } from '../deductions/schedule-1a.ts';
import {
  compareMoney,
  defineCalculator,
  moneyInput,
  selectInput,
  subMoney,
  usd,
} from '@maestro-calc/core';

/** Line 7: the tips cap, $25,000 on every return, joint included. */
const CAP = usd(25_000);

/**
 * No tax on tips (Schedule 1-A, Part II): qualified tips capped at $25,000, then phased out by
 * MAGI. The savings multiply the deduction by the bracket the filer picks.
 */
export const noTaxOnTips = defineCalculator({
  id: 'no-tax-on-tips',
  inputs: [
    moneyInput({ key: 'tips', urlKey: 't', default: usd(8000), max: usd(1_000_000) }),
    selectInput({ key: 'filing', urlKey: 'f', options: FILINGS, default: 'single' }),
    moneyInput({ key: 'magi', urlKey: 'm', default: usd(45_000), max: usd(100_000_000) }),
    selectInput({ key: 'bracket', urlKey: 'b', options: BRACKETS, default: '12' }),
  ],
  outputs: [
    { key: 'deduction', measure: 'money', role: 'primary' },
    { key: 'reduction', measure: 'money', role: 'secondary' },
    { key: 'savings', measure: 'money', role: 'secondary' },
  ],
  warnings: [],
  compute: (inputs) => {
    const capped = compareMoney(inputs.tips, CAP) < 0 ? inputs.tips : CAP;
    const deduction = phasedOut(capped, inputs.magi, THRESHOLD[inputs.filing]);
    return {
      outputs: {
        deduction,
        reduction: subMoney(capped, deduction),
        savings: savingsOf(deduction, inputs.bracket),
      },
      shopping: [],
      warnings: [],
    };
  },
});

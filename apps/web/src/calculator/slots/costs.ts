import { Rational } from '@maestro-calc/core';
import {
  PageModuleError,
  type AnyCalculator,
  type CostSlot,
  type OutputKey,
  type MoneyKey,
} from '../page-module.ts';

/** True for a money value above zero: the amount of a `money` input is an exact `Rational`. */
const isPositive = (value: unknown): boolean =>
  typeof value === 'object' &&
  value !== null &&
  'amount' in value &&
  value.amount instanceof Rational &&
  value.amount.sign() === 1;

/**
 * Cost rows: each pairs a money output with the money input that prices it, and shows once that
 * price is above zero. Throws `COST_KINDS` when an output or a price is not money (D6).
 */
export function costSlot<C extends AnyCalculator>(
  calculator: C,
  rows: readonly { readonly output: OutputKey<C>; readonly price: MoneyKey<C> }[],
  copy: { readonly hint: string; readonly note?: string },
): CostSlot<C>;
export function costSlot(
  calculator: AnyCalculator,
  rows: readonly { readonly output: string; readonly price: string }[],
  copy: { readonly hint: string; readonly note?: string },
): CostSlot<AnyCalculator> {
  for (const row of rows) {
    const output = calculator.outputs.find(({ key }) => key === row.output);
    const price = calculator.inputs.find(({ key }) => key === row.price);
    if (output?.measure !== 'money' || price?.kind !== 'money') {
      throw new PageModuleError('COST_KINDS', { cause: { id: calculator.id, ...row } });
    }
  }
  return {
    rows,
    ...copy,
    visible: (valid) =>
      Object.fromEntries(rows.map(({ output, price }) => [output, isPositive(valid[price])])),
  };
}

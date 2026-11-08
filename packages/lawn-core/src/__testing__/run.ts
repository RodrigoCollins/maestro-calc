import { isQuantityOf, lb, Rational, valueIn } from '@maestro-calc/core';

/** The result of a calculator run: the value, or the field errors a rejected input carries. */
interface Runnable {
  readonly run: (raw: Readonly<Record<string, unknown>>) => {
    readonly ok: boolean;
    readonly value?: unknown;
    readonly errors?: unknown;
  };
}

export interface Ran {
  readonly outputs: readonly { readonly key: string; readonly value: unknown }[];
  readonly shopping: readonly { readonly materialId: string; readonly qty: bigint }[];
  readonly warnings: readonly { readonly code: string }[];
}

/** Runs `calculator` on the raw form text; a rejected input fails the test with its errors. */
export const ran = (calculator: Runnable, raw: Readonly<Record<string, unknown>> = {}): Ran => {
  const result = calculator.run(raw);
  if (!result.ok) throw new Error(JSON.stringify(result.errors));
  return result.value as Ran;
};

/** An output that is a mass, in pounds. */
export const pounds = (run: Ran, key: string): Rational => {
  const value = run.outputs.find((output) => output.key === key)?.value;
  if (!isQuantityOf(value, 'mass')) throw new Error(`${key} is not a mass`);
  return valueIn(value, lb);
};

/** An output that is a plain number. */
export const figure = (run: Ran, key: string): Rational => {
  const value = run.outputs.find((output) => output.key === key)?.value;
  if (!(value instanceof Rational)) throw new Error(`${key} is not a number`);
  return value;
};

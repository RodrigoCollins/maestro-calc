import {
  ft2,
  isQuantityOf,
  Rational,
  toCents,
  type Money,
  valueIn,
  type Calculator,
  type InputDescriptor,
  type OutputDescriptor,
} from '@maestro-calc/core';

export type Any = Calculator<
  string,
  readonly InputDescriptor[],
  readonly OutputDescriptor[],
  readonly string[]
>;

/** The outputs of a run by key; a failed run is a failed test. */
export const outputsOf = (
  calculator: Any,
  raw: Readonly<Record<string, unknown>> = {},
): Readonly<Record<string, unknown>> => {
  const result = calculator.run(raw);
  if (!result.ok) throw new Error(`run failed: ${JSON.stringify(result.errors)}`);
  return Object.fromEntries(result.value.outputs.map(({ key, value }) => [key, value]));
};

/** A money output as dollars and cents: `278.30`. */
export const dollarsOf = (
  calculator: Any,
  raw: Readonly<Record<string, unknown>>,
  key: string,
): string => {
  const value = outputsOf(calculator, raw)[key];
  if (typeof value !== 'object' || value === null || !('currency' in value))
    throw new Error(`${key} is not money`);
  const { integer, fraction } = toCents(value as Money);
  return `${String(integer)}.${fraction}`;
};

/** A number output, or an area output in square feet, as an exact Rational. */
export const exactOf = (
  calculator: Any,
  raw: Readonly<Record<string, unknown>>,
  key: string,
): Rational => {
  const value = outputsOf(calculator, raw)[key];
  if (isQuantityOf(value, 'area')) return valueIn(value, ft2);
  if (value instanceof Rational) return value;
  throw new Error(`${key} is neither a number nor an area`);
};

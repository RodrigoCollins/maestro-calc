import { CoreError } from '../errors.ts';
import { isMoney, type Money } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import type { DimensionName } from '../units/dimension.ts';
import { isQuantityOf, type Quantity } from '../units/quantity.ts';
import type {
  OutputDescriptor,
  RunOutput,
  RunResult,
  ShoppingLine,
  WarningEntry,
} from './descriptors.ts';
import type { ResultLocus, ResultReason, Runnable } from './run.ts';

/*
 * The shape checks of a `compute` result, in a module of their own so that a page script can load
 * `result-shape.ts` in their place (`skipResultChecks` of the web client build): every calculator
 * a page ships is run, and so checked, by its property tests in Node.
 */

const invalid = (
  id: string,
  reason: ResultReason,
  where?: { readonly output: string } | { readonly index: number },
): never => {
  const locus: ResultLocus = { id, ...where };
  throw new CoreError('INVALID_RESULT', reason, { cause: locus });
};

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isMeasure = (
  value: unknown,
  measure: OutputDescriptor['measure'],
): value is Quantity<DimensionName> | Money | Rational => {
  if (measure === 'money') return isMoney(value);
  return measure === 'hours' || measure === 'number'
    ? value instanceof Rational
    : isQuantityOf(value, measure);
};

/** The outputs as a frozen list in declaration order, when exactly the declared keys are own. */
const outputsOf = (
  id: string,
  declared: readonly OutputDescriptor[],
  outputs: unknown,
): readonly RunOutput<readonly OutputDescriptor[]>[] => {
  if (!isRecord(outputs)) return invalid(id, 'NOT_AN_OBJECT');
  // own enumerable string keys only: a prototype must not supply a declared output
  const own = Object.keys(outputs);
  if (own.length !== declared.length || !declared.every(({ key }) => own.includes(key))) {
    return invalid(id, 'OUTPUT_KEYS');
  }
  return Object.freeze(
    declared.map(({ key, role, measure }) => {
      const value = outputs[key];
      if (!isMeasure(value, measure)) return invalid(id, 'OUTPUT_MEASURE', { output: key });
      return Object.freeze({ key, role, value });
    }),
  );
};

/** A frozen copy of each line; `Array.from` visits the holes of a sparse list as `undefined`. */
const shoppingOf = (id: string, shopping: unknown): readonly ShoppingLine[] => {
  if (!Array.isArray(shopping)) return invalid(id, 'SHOPPING');
  return Object.freeze(
    Array.from(shopping, (line: unknown, index): ShoppingLine => {
      if (!isRecord(line)) return invalid(id, 'SHOPPING', { index });
      const { materialId, purchaseUnit, qty } = line;
      if (typeof materialId !== 'string' || typeof purchaseUnit !== 'string') {
        return invalid(id, 'SHOPPING', { index });
      }
      if (typeof qty !== 'bigint' || qty < 0n) return invalid(id, 'SHOPPING', { index });
      return Object.freeze({ materialId, purchaseUnit, qty });
    }),
  );
};

type Param = number | boolean | string;

const isParam = (value: unknown): value is Param =>
  typeof value === 'boolean' || typeof value === 'string' || Number.isFinite(value);

/** A frozen copy of each warning, whose code is declared and whose params are scalar. */
const warningsOf = (
  id: string,
  declared: readonly string[],
  warnings: unknown,
): readonly WarningEntry<string>[] => {
  if (!Array.isArray(warnings)) return invalid(id, 'WARNING');
  return Object.freeze(
    Array.from(warnings, (warning: unknown, index): WarningEntry<string> => {
      if (!isRecord(warning)) return invalid(id, 'WARNING', { index });
      const { code, params } = warning;
      const known = declared.find((candidate) => candidate === code);
      if (known === undefined || !isRecord(params)) return invalid(id, 'WARNING', { index });
      const entries = Object.entries(params);
      if (!entries.every((entry): entry is [string, Param] => isParam(entry[1]))) {
        return invalid(id, 'WARNING', { index });
      }
      return Object.freeze({ code: known, params: Object.freeze(Object.fromEntries(entries)) });
    }),
  );
};

/** The shape of a `compute` result as a frozen run result; a result off the contract throws. */
export const shapeOf = (
  { id, outputs, warnings }: Pick<Runnable, 'id' | 'outputs' | 'warnings'>,
  result: unknown,
): RunResult<readonly OutputDescriptor[], string> => {
  if (!isRecord(result)) return invalid(id, 'NOT_AN_OBJECT');
  return Object.freeze({
    outputs: outputsOf(id, outputs, result['outputs']),
    shopping: shoppingOf(id, result['shopping']),
    warnings: warningsOf(id, warnings, result['warnings']),
  });
};

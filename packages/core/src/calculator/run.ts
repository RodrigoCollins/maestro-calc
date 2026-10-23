import { CoreError } from '../errors.ts';
import { isMoney, type Money } from '../money/money.ts';
import { ok, type Result } from '../result.ts';
import type { DimensionName } from '../units/dimension.ts';
import { isQuantityOf, type Quantity } from '../units/quantity.ts';
import type {
  AnyCalculator,
  FieldError,
  OutputDescriptor,
  RunOutput,
  RunResult,
  ShoppingLine,
  ValidateOptions,
  WarningEntry,
} from './descriptors.ts';

/** The parts of a calculator that `run` needs. */
export type Runnable = Pick<AnyCalculator, 'id' | 'outputs' | 'warnings' | 'validate' | 'compute'>;

/** Why a `compute` result is rejected; each is the `reason` of an `INVALID_RESULT` error. */
export const RESULT_REASONS = [
  'NOT_AN_OBJECT',
  'OUTPUT_KEYS',
  'OUTPUT_MEASURE',
  'SHOPPING',
  'WARNING',
] as const;

export type ResultReason = (typeof RESULT_REASONS)[number];

/**
 * Where a result is faulty, carried as the `cause` of the `INVALID_RESULT` error: the calculator
 * `id`, the declared `output` key or the `index` of the shopping line or warning. Identifiers and
 * numbers only, never prose.
 */
export interface ResultLocus {
  readonly id: string;
  readonly output?: string;
  readonly index?: number;
}

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
): value is Quantity<DimensionName> | Money =>
  measure === 'money' ? isMoney(value) : isQuantityOf(value, measure);

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
const shapeOf = (
  { id, outputs, warnings }: Runnable,
  result: unknown,
): RunResult<readonly OutputDescriptor[], string> => {
  if (!isRecord(result)) return invalid(id, 'NOT_AN_OBJECT');
  return Object.freeze({
    outputs: outputsOf(id, outputs, result['outputs']),
    shopping: shoppingOf(id, result['shopping']),
    warnings: warningsOf(id, warnings, result['warnings']),
  });
};

/**
 * `validate` then `compute`. A failed validation is returned as it is and `compute` is not called;
 * a computed result that breaks the shape rules throws `INVALID_RESULT` with a reason and a locus.
 * The result is a frozen copy, so what `compute` built (and may still hold) cannot change it.
 */
export const runCalculator = (
  calculator: Runnable,
  raw: Readonly<Record<string, unknown>>,
  options?: ValidateOptions,
): Result<RunResult<readonly OutputDescriptor[], string>, FieldError> => {
  const inputs = calculator.validate(raw, options);
  if (!inputs.ok) return inputs;
  return ok(shapeOf(calculator, calculator.compute(inputs.value)));
};

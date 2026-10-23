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

/** The outputs as a list in declaration order, when exactly the declared keys are own. */
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
  return declared.map(({ key, role, measure }) => {
    const value = outputs[key];
    if (!isMeasure(value, measure)) return invalid(id, 'OUTPUT_MEASURE', { output: key });
    return { key, role, value };
  });
};

const isShoppingLine = (line: unknown): line is ShoppingLine =>
  isRecord(line) &&
  typeof line['materialId'] === 'string' &&
  typeof line['purchaseUnit'] === 'string' &&
  typeof line['qty'] === 'bigint' &&
  line['qty'] >= 0n;

const isParam = (value: unknown): boolean => ['number', 'boolean', 'string'].includes(typeof value);

const isDeclaredWarning = (
  declared: readonly string[],
  warning: unknown,
): warning is WarningEntry<string> =>
  isRecord(warning) &&
  declared.some((code) => code === warning['code']) &&
  isRecord(warning['params']) &&
  Object.values(warning['params']).every(isParam);

const shoppingOf = (id: string, shopping: unknown): readonly ShoppingLine[] => {
  if (!Array.isArray(shopping)) return invalid(id, 'SHOPPING');
  // `findIndex` visits the holes of a sparse list as `undefined`, which is not a line
  const index = shopping.findIndex((line) => !isShoppingLine(line));
  return index === -1 ? shopping.filter(isShoppingLine) : invalid(id, 'SHOPPING', { index });
};

const warningsOf = (
  id: string,
  declared: readonly string[],
  warnings: unknown,
): readonly WarningEntry<string>[] => {
  if (!Array.isArray(warnings)) return invalid(id, 'WARNING');
  const isValid = (warning: unknown): warning is WarningEntry<string> =>
    isDeclaredWarning(declared, warning);
  const index = warnings.findIndex((warning) => !isValid(warning));
  return index === -1 ? warnings.filter(isValid) : invalid(id, 'WARNING', { index });
};

/** The shape of a `compute` result as a run result; a result off the contract throws. */
const shapeOf = (
  { id, outputs, warnings }: Runnable,
  result: unknown,
): RunResult<readonly OutputDescriptor[], string> => {
  if (!isRecord(result)) return invalid(id, 'NOT_AN_OBJECT');
  return {
    outputs: outputsOf(id, outputs, result['outputs']),
    shopping: shoppingOf(id, result['shopping']),
    warnings: warningsOf(id, warnings, result['warnings']),
  };
};

/**
 * `validate` then `compute`. A failed validation is returned as it is and `compute` is not called;
 * a computed result that breaks the shape rules throws `INVALID_RESULT` with a reason and a locus.
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

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
export type Runnable = Pick<AnyCalculator, 'outputs' | 'warnings' | 'validate' | 'compute'>;

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null;

const isMeasure = (
  value: unknown,
  measure: OutputDescriptor['measure'],
): value is Quantity<DimensionName> | Money =>
  measure === 'money' ? isMoney(value) : isQuantityOf(value, measure);

/** The outputs as a list in declaration order, or `undefined` unless exactly the declared keys hold. */
const listOutputs = (
  declared: readonly OutputDescriptor[],
  outputs: unknown,
): RunOutput<readonly OutputDescriptor[]>[] | undefined => {
  if (!isRecord(outputs) || Object.keys(outputs).length !== declared.length) return undefined;
  const list: RunOutput<readonly OutputDescriptor[]>[] = [];
  for (const { key, role, measure } of declared) {
    const value = outputs[key];
    if (!isMeasure(value, measure)) return undefined;
    list.push({ key, role, value });
  }
  return list;
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

/** The shape of a `compute` result as a run result, or `undefined` when it breaks the contract. */
const shapeOf = (
  { outputs, warnings }: Runnable,
  result: unknown,
): RunResult<readonly OutputDescriptor[], string> | undefined => {
  if (!isRecord(result)) return undefined;
  const listed = listOutputs(outputs, result['outputs']);
  const { shopping, warnings: emitted } = result;
  if (listed === undefined || !Array.isArray(shopping) || !Array.isArray(emitted)) return undefined;
  if (!shopping.every(isShoppingLine)) return undefined;
  if (!emitted.every((warning) => isDeclaredWarning(warnings, warning))) return undefined;
  return { outputs: listed, shopping, warnings: emitted };
};

/**
 * `validate` then `compute`. A failed validation is returned as it is and `compute` is not called;
 * a computed result that breaks the shape rules throws `INVALID_RESULT`.
 */
export const runCalculator = (
  calculator: Runnable,
  raw: Readonly<Record<string, unknown>>,
  options?: ValidateOptions,
): Result<RunResult<readonly OutputDescriptor[], string>, FieldError> => {
  const inputs = calculator.validate(raw, options);
  if (!inputs.ok) return inputs;
  const shaped = shapeOf(calculator, calculator.compute(inputs.value));
  if (shaped === undefined) throw new CoreError('INVALID_RESULT');
  return ok(shaped);
};

import { ok, type Result } from '../result.ts';
import type {
  AnyCalculator,
  FieldError,
  OutputDescriptor,
  RunResult,
  ValidateOptions,
} from './descriptors.ts';
import { shapeOf } from './result-checks.ts';

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

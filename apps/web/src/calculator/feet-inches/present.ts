import type { feetInches } from '@maestro-calc/core/calculators/feet-inches';
import type { Ready } from '../page-module.ts';
import { dimensionText } from '../present.ts';

type Moment = Ready<typeof feetInches>;

/** The case of the answer: the operation, or `longer` when a subtraction's second length is the longer (its only warning). */
export const answerCase = ({ valid, result }: Moment): string =>
  result.warnings.length > 0 ? 'longer' : valid.operation;

/** The placeholder values of the answer: both lengths as text, the number, and the result the slot hands over. */
export const answerValues = (moment: Moment, primary: string): Record<string, string> => {
  const { valid, system } = moment;
  return {
    first: dimensionText(valid.first, system),
    second: dimensionText(valid.second, system),
    factor: String(valid.factor),
    result: primary,
  };
};

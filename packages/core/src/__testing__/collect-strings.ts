import { Rational } from '../rational/rational.ts';

/**
 * Every string value inside `value`, in document order: strings as they are, a Rational as its
 * canonical string, arrays and objects (a quantity or money included) by their values. Numbers,
 * bigints and property names are not strings of the value. Test support for the language-free
 * check of a calculator result.
 */
export const collectStrings = (value: unknown): string[] => {
  if (typeof value === 'string') return [value];
  if (value instanceof Rational) return [value.toString()];
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
};

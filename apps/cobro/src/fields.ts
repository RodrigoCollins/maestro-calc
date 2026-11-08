import { Rational, isQuantityOf, type InputDescriptor, type Money } from '@maestro-calc/core';
import { dollarsFieldText, fieldText } from './format.ts';

/** Inches in each unit a length field is written in by default. */
const INCHES = { in: 1, ft: 12, yd: 36 } as const;

const isMoney = (value: unknown): value is Money =>
  typeof value === 'object' && value !== null && 'currency' in value;

/**
 * What a field shows for a value of its input: a length in the unit the field is labelled in (feet
 * or inches), a number or a percent plain, dollars without the sign, a count or a choice as it is.
 * The page renders the defaults through it and the script restores a shared link through it.
 */
export const fieldTextOf = (input: InputDescriptor, value: unknown): string => {
  if (input.kind === 'length' && isQuantityOf(value, 'length')) {
    return fieldText(value.canonical.div(Rational.of(INCHES[input.defaultUnit])));
  }
  if (isMoney(value)) return dollarsFieldText(value);
  if (value instanceof Rational) return fieldText(value);
  return String(value);
};

/** The text of a field's default. */
export const defaultTextOf = (input: InputDescriptor): string =>
  fieldTextOf(input, 'default' in input ? input.default : '');

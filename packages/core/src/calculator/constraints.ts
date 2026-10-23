import { Rational } from '../rational/rational.ts';
import type { BoundedDescriptor, SelectDescriptor } from './descriptors.ts';

/**
 * A violated constraint. `params` carries the bound as a canonical Rational string in the
 * canonical unit of the kind: inches for a length, a whole number for a count, percent points for
 * a percent, dollars for money. Never prose.
 */
export type ConstraintError =
  | { readonly code: 'BELOW_MIN'; readonly params: { readonly min: string } }
  | { readonly code: 'ABOVE_MAX'; readonly params: { readonly max: string } }
  | { readonly code: 'UNKNOWN_OPTION' };

interface Bounds {
  readonly min: Rational | undefined;
  readonly max: Rational | undefined;
}

const HUNDRED = Rational.of(100);

/** The inclusive bounds of a descriptor with the defaults of its kind applied. */
export const boundsOf = (descriptor: BoundedDescriptor): Bounds => {
  switch (descriptor.kind) {
    case 'length':
      return { min: descriptor.min?.canonical, max: descriptor.max?.canonical };
    case 'count':
      return {
        min: Rational.of(descriptor.min ?? 0),
        max: Rational.of(descriptor.max ?? Number.MAX_SAFE_INTEGER),
      };
    case 'percent':
      return { min: descriptor.min ?? Rational.ZERO, max: descriptor.max ?? HUNDRED };
    case 'money':
      return { min: descriptor.min?.amount ?? Rational.ZERO, max: descriptor.max?.amount };
  }
};

/** The exact amount of a descriptor's default, for a count a whole number. */
export const defaultAmount = (descriptor: BoundedDescriptor): Rational => {
  switch (descriptor.kind) {
    case 'length':
      return descriptor.default.canonical;
    case 'count':
      return Rational.of(descriptor.default);
    case 'percent':
      return descriptor.default;
    case 'money':
      return descriptor.default.amount;
  }
};

/**
 * Checks an exact amount (the canonical value of a length, a count, percent points, or dollars)
 * against the inclusive bounds of its descriptor. A count is checked as a Rational so that a value
 * beyond the safe integers is compared without precision loss.
 */
export const checkAmount = (
  descriptor: BoundedDescriptor,
  amount: Rational,
): ConstraintError | undefined => {
  const { min, max } = boundsOf(descriptor);
  if (min !== undefined && amount.compare(min) < 0) {
    return { code: 'BELOW_MIN', params: { min: min.toString() } };
  }
  if (max !== undefined && amount.compare(max) > 0) {
    return { code: 'ABOVE_MAX', params: { max: max.toString() } };
  }
  return undefined;
};

/** Checks an option id against the exact, case-sensitive options of a select. */
export const checkOption = (
  descriptor: SelectDescriptor,
  option: string,
): ConstraintError | undefined =>
  descriptor.options.includes(option) ? undefined : { code: 'UNKNOWN_OPTION' };

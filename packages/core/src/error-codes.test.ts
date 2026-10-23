import { describe, expect, it } from 'vitest';
import { FIELD_ERROR_CODES } from './error-codes.ts';

describe('error codes (calculator-contract › Total validation without silent coercion)', () => {
  // spec: the full set of FieldError codes
  it('lists the ten field error codes in the order of the spec', () => {
    expect(FIELD_ERROR_CODES).toEqual([
      'EMPTY',
      'MALFORMED',
      'DECIMAL_COMMA',
      'ZERO_DENOMINATOR',
      'UNKNOWN_UNIT',
      'TOO_LONG',
      'TOO_LARGE',
      'BELOW_MIN',
      'ABOVE_MAX',
      'UNKNOWN_OPTION',
    ]);
    expect(new Set(FIELD_ERROR_CODES).size).toBe(10);
  });
});

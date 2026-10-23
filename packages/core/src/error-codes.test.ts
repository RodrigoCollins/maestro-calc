import { describe, expect, it } from 'vitest';
import { ALL_ERROR_CODES, FIELD_ERROR_CODES, URL_ISSUE_CODES } from './error-codes.ts';

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

  // a shared constant must not be changeable by a consumer (PR 11 review RES-6)
  it('freezes the three lists', () => {
    expect(Object.isFrozen(FIELD_ERROR_CODES)).toBe(true);
    expect(Object.isFrozen(URL_ISSUE_CODES)).toBe(true);
    expect(Object.isFrozen(ALL_ERROR_CODES)).toBe(true);
  });
});

describe('URL issue codes (url-state-codec › Decoding)', () => {
  // spec: the two diagnostics of decode
  it('lists the two url issue codes', () => {
    expect(URL_ISSUE_CODES).toEqual(['INVALID_VALUE', 'UNSUPPORTED_VERSION']);
  });

  // spec: i18n-catalog › every user-facing code has a message; design: 12 distinct codes
  it('joins the ten field codes and the two url codes in a stable order', () => {
    expect(ALL_ERROR_CODES).toEqual([...FIELD_ERROR_CODES, 'INVALID_VALUE', 'UNSUPPORTED_VERSION']);
    expect(ALL_ERROR_CODES).toHaveLength(12);
    expect(new Set(ALL_ERROR_CODES).size).toBe(12);
  });
});

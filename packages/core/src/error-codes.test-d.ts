import { describe, expectTypeOf, it } from 'vitest';
import type { ConstraintError } from './calculator/constraints.ts';
import type { AllErrorCode, FieldErrorCode, UrlIssueCode } from './error-codes.ts';
import type { LengthParseCode } from './format/length-parser/codes.ts';
import type { MoneyParseCode } from './money/parse.ts';
import type { DecimalParseCode } from './rational/decimal.ts';

describe('FieldErrorCode (calculator-contract › Total validation without silent coercion)', () => {
  it('is the union of the ten codes', () => {
    expectTypeOf<FieldErrorCode>().toEqualTypeOf<
      | 'EMPTY'
      | 'MALFORMED'
      | 'DECIMAL_COMMA'
      | 'ZERO_DENOMINATOR'
      | 'UNKNOWN_UNIT'
      | 'TOO_LONG'
      | 'TOO_LARGE'
      | 'BELOW_MIN'
      | 'ABOVE_MAX'
      | 'UNKNOWN_OPTION'
    >();
  });

  // every code a parser or a constraint can return is a field error code
  it('covers the codes of the parsers and the constraint checks', () => {
    expectTypeOf<
      LengthParseCode | MoneyParseCode | DecimalParseCode | ConstraintError['code']
    >().toExtend<FieldErrorCode>();
  });
});

describe('UrlIssueCode (url-state-codec › Decoding)', () => {
  it('is the union of the two url codes', () => {
    expectTypeOf<UrlIssueCode>().toEqualTypeOf<'INVALID_VALUE' | 'UNSUPPORTED_VERSION'>();
  });
});

describe('AllErrorCode (url-state-codec › Decoding)', () => {
  it('is the union of the field codes and the url codes', () => {
    expectTypeOf<AllErrorCode>().toEqualTypeOf<FieldErrorCode | UrlIssueCode>();
  });
});

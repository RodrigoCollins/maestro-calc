import { Rational } from '../../rational/rational.ts';
import { err, ok, type Result } from '../../result.ts';
import type { CountDescriptor, InputKind } from '../descriptors.ts';
import {
  builderOf,
  parseText,
  withinBounds,
  withinUrlBounds,
  type ParseFailure,
} from './shared.ts';

/** The grammar of a count: digits only, so no sign, point or exponent. */
const WHOLE_NUMBER = /^[0-9]+$/;

/** A whole number: digits only; a comma is a decimal comma. */
const parseWhole = (text: string): Result<bigint, ParseFailure> => {
  if (text.includes(',')) return err({ code: 'DECIMAL_COMMA' });
  return WHOLE_NUMBER.test(text) ? ok(BigInt(text)) : err({ code: 'MALFORMED' });
};

/** A number is a count only when it is already a non-negative safe integer. */
const wholeNumber = (value: number): Result<bigint, ParseFailure> =>
  Number.isSafeInteger(value) && value >= 0 ? ok(BigInt(value)) : err({ code: 'MALFORMED' });

/** A whole number, compared as a Rational so a value beyond the safe integers loses no precision. */
const COUNT: InputKind<CountDescriptor> = {
  read: (input, raw) => {
    // a string is compared as a bigint, so a value beyond the safe integers is ABOVE_MAX
    const whole = typeof raw === 'number' ? wholeNumber(raw) : parseText(raw, parseWhole);
    return whole.ok ? withinBounds(input, Rational.of(whole.value), Number(whole.value)) : whole;
  },
  // `Number.isSafeInteger` does not coerce, so `String` only ever sees a number here
  urlText: (_input, value) =>
    Number.isSafeInteger(value) && WHOLE_NUMBER.test(String(value)) ? String(value) : undefined,
  fromUrl: (input, text) => {
    if (!WHOLE_NUMBER.test(text)) return undefined;
    const amount = withinUrlBounds(input, Rational.of(BigInt(text)));
    return amount === undefined ? undefined : Number(amount.num);
  },
};

/** A whole-number input; the bounds default to `0..Number.MAX_SAFE_INTEGER`. */
export const countInput = /* @__PURE__ */ builderOf<CountDescriptor>('count', COUNT);

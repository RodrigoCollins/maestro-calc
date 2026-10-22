import { CoreError } from '../errors.ts';
import { err, ok, type Result } from '../result.ts';
import { MAX_PARSE_LENGTH } from './limits.ts';

// The only sign test in this module. Every caller either never passes zero (nonzero divisor,
// non-equal operands, nonzero numerator) or treats it like a positive one (-0n is 0n), so the
// `<=` mutant is equivalent. Stryker ignores every EqualityOperator mutant on the line, so the
// `>=` mutant is hidden with it; the sign behaviour is pinned by abs, neg, sign and compare tests.
// Stryker disable next-line EqualityOperator: `<=` is equivalent (see above)
const isNegative = (value: bigint): boolean => value < 0n;

const abs = (value: bigint): bigint => (isNegative(value) ? -value : value);

const gcd = (a: bigint, b: bigint): bigint => {
  let x = abs(a);
  let y = abs(b);
  while (y !== 0n) {
    [x, y] = [y, x % y];
  }
  return x;
};

const SAFE_MAX = BigInt(Number.MAX_SAFE_INTEGER);
const QUOTIENT_BITS = 64;

const bitLength = (value: bigint): number => value.toString(2).length;

/** Multiplies by 2^exponent in two steps so an intermediate power cannot overflow or underflow. */
const scaleByPowerOfTwo = (value: number, exponent: number): number => {
  const half = Math.trunc(exponent / 2);
  return value * 2 ** half * 2 ** (exponent - half);
};

const toBigInt = (value: bigint | number): bigint => {
  if (typeof value === 'bigint') return value;
  if (!Number.isSafeInteger(value)) throw new CoreError('NOT_AN_INTEGER');
  return BigInt(value);
};

export const RATIONAL_PARSE_CODES = ['MALFORMED', 'ZERO_DENOMINATOR'] as const;

export type RationalParseCode = (typeof RATIONAL_PARSE_CODES)[number];

export interface RationalParseError {
  readonly code: RationalParseCode;
}

const CANONICAL = /^-?[0-9]+(?:\/[0-9]+)?$/;

/**
 * An exact rational number over arbitrary-precision integers, always in canonical form: positive
 * denominator, coprime parts, zero as 0/1. Equal values have identical fields, so deep equality
 * is value equality.
 */
export class Rational {
  static readonly ZERO: Rational = new Rational(0n, 1n);
  static readonly ONE: Rational = new Rational(1n, 1n);

  readonly num: bigint;
  readonly den: bigint;

  private constructor(num: bigint, den: bigint) {
    this.num = num;
    this.den = den;
    Object.freeze(this);
  }

  /** Builds a normalized Rational; numbers must be safe integers. */
  static of(n: bigint | number, d: bigint | number = 1n): Rational {
    const num = toBigInt(n);
    const den = toBigInt(d);
    if (den === 0n) throw new CoreError('ZERO_DENOMINATOR');
    const divisor = isNegative(den) ? -gcd(num, den) : gcd(num, den);
    return new Rational(num / divisor, den / divisor);
  }

  add(other: Rational): Rational {
    return Rational.of(this.num * other.den + other.num * this.den, this.den * other.den);
  }

  sub(other: Rational): Rational {
    return Rational.of(this.num * other.den - other.num * this.den, this.den * other.den);
  }

  mul(other: Rational): Rational {
    return Rational.of(this.num * other.num, this.den * other.den);
  }

  div(other: Rational): Rational {
    return this.mul(other.inv());
  }

  neg(): Rational {
    return Rational.of(-this.num, this.den);
  }

  abs(): Rational {
    return Rational.of(abs(this.num), this.den);
  }

  /** Multiplicative inverse; throws DIVISION_BY_ZERO for zero. */
  inv(): Rational {
    if (this.num === 0n) throw new CoreError('DIVISION_BY_ZERO');
    return Rational.of(this.den, this.num);
  }

  /** Total order consistent with the real numbers: -1, 0 or 1. */
  compare(other: Rational): -1 | 0 | 1 {
    const left = this.num * other.den;
    const right = other.num * this.den;
    if (left === right) return 0;
    return isNegative(left - right) ? -1 : 1;
  }

  equals(other: Rational): boolean {
    return this.num === other.num && this.den === other.den;
  }

  sign(): -1 | 0 | 1 {
    if (this.num === 0n) return 0;
    return isNegative(this.num) ? -1 : 1;
  }

  isZero(): boolean {
    return this.num === 0n;
  }

  isInteger(): boolean {
    return this.den === 1n;
  }

  /** Largest integer not above this value (toward negative infinity). */
  floor(): bigint {
    const remainder = ((this.num % this.den) + this.den) % this.den;
    return (this.num - remainder) / this.den;
  }

  /** Smallest integer not below this value (toward positive infinity). */
  ceil(): bigint {
    return -this.neg().floor();
  }

  /** Canonical text: `n` for integers, otherwise `n/d`. */
  toString(): string {
    return this.den === 1n ? String(this.num) : `${String(this.num)}/${String(this.den)}`;
  }

  /**
   * Parses the machine format `-?digits(/digits)?` and normalizes the result.
   *
   * Precondition: callers bound the length (128 characters for form input, 256 for URL input).
   * As a safety net, text longer than `MAX_PARSE_LENGTH` is rejected as MALFORMED.
   */
  static fromString(text: string): Result<Rational, RationalParseError> {
    if (text.length > MAX_PARSE_LENGTH || !CANONICAL.test(text)) return err({ code: 'MALFORMED' });
    const slash = text.indexOf('/');
    const numerator = BigInt(text.slice(0, slash === -1 ? text.length : slash));
    const denominator = slash === -1 ? 1n : BigInt(text.slice(slash + 1));
    if (denominator === 0n) return err({ code: 'ZERO_DENOMINATOR' });
    return ok(Rational.of(numerator, denominator));
  }

  /**
   * The only lossy exit. Exact to the nearest double when both parts are safe integers, otherwise
   * within one ulp (or a signed Infinity beyond the double range).
   */
  toNumber(): number {
    const magnitude = abs(this.num);
    if (magnitude <= SAFE_MAX && this.den <= SAFE_MAX) return Number(this.num) / Number(this.den);
    // Scale so the integer quotient keeps 64 or 65 significant bits, then undo the scaling. A
    // negative shift is a right shift, and floor(floor(m / 2^k) / d) = floor(m / (2^k d)).
    const shift = QUOTIENT_BITS - (bitLength(magnitude) - bitLength(this.den));
    const result = scaleByPowerOfTwo(Number((magnitude << BigInt(shift)) / this.den), -shift);
    return isNegative(this.num) ? -result : result;
  }

  /** Direct serialization would lose exactness; persistence uses `toString`. */
  toJSON(): never {
    throw new TypeError('Rational is not JSON serializable; persist toString()');
  }

  [Symbol.toPrimitive](hint: 'default' | 'number' | 'string'): string {
    if (hint === 'string') return this.toString();
    throw new TypeError('Rational has no implicit numeric conversion; use toNumber()');
  }
}

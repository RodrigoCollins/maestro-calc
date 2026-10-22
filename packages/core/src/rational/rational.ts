import { CoreError } from '../errors.ts';

const abs = (value: bigint): bigint => (value < 0n ? -value : value);

const gcd = (a: bigint, b: bigint): bigint => {
  let x = abs(a);
  let y = abs(b);
  while (y !== 0n) {
    [x, y] = [y, x % y];
  }
  return x;
};

const toBigInt = (value: bigint | number): bigint => {
  if (typeof value === 'bigint') return value;
  if (!Number.isSafeInteger(value)) throw new CoreError('NOT_AN_INTEGER');
  return BigInt(value);
};

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
    const divisor = gcd(num, den) * (den < 0n ? -1n : 1n);
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
    return left < right ? -1 : 1;
  }

  equals(other: Rational): boolean {
    return this.num === other.num && this.den === other.den;
  }

  sign(): -1 | 0 | 1 {
    if (this.num === 0n) return 0;
    return this.num < 0n ? -1 : 1;
  }

  isZero(): boolean {
    return this.num === 0n;
  }

  isInteger(): boolean {
    return this.den === 1n;
  }

  /** Largest integer not above this value (toward negative infinity). */
  floor(): bigint {
    const quotient = this.num / this.den;
    return this.num < 0n && quotient * this.den !== this.num ? quotient - 1n : quotient;
  }

  /** Smallest integer not below this value (toward positive infinity). */
  ceil(): bigint {
    const quotient = this.num / this.den;
    return this.num > 0n && quotient * this.den !== this.num ? quotient + 1n : quotient;
  }
}

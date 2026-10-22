import { CoreError } from '../errors.ts';
import { Rational } from '../rational/rational.ts';

/**
 * How a value between two ticks is resolved. `nearest` sends exact ties away from zero (so
 * `round(-x) = -round(x)`), `up` goes toward positive infinity and `down` toward negative
 * infinity.
 */
export type RoundingMode = 'nearest' | 'up' | 'down';

const MIN_DENOMINATOR = 2;
const MAX_DENOMINATOR = 64;
const HALF = Rational.of(1, 2);

// One rounding rule per mode on an exact scaled value. A table (not an if chain) plus an
// own-property check means an unknown mode throws instead of silently behaving like `nearest`
// (a plain index would also find inherited names such as `toString`).
const ROUNDERS: Readonly<Record<RoundingMode, (scaled: Rational) => bigint>> = {
  up: (scaled) => scaled.ceil(),
  down: (scaled) => scaled.floor(),
  // Half up on the magnitude, then restore the sign: ties move away from zero in both signs.
  nearest: (scaled) => {
    const magnitude = scaled.abs().add(HALF).floor();
    return scaled.sign() === -1 ? -magnitude : magnitude;
  },
};

/**
 * The shared kernel, module-internal (exported for `decimal-parts.ts`, not from the barrel): the
 * integer `k` that `value * scale` rounds to under `mode`. Fraction ticks use
 * `scale = denominator`, decimal places use `scale = 10^places`. Throws `INVALID_MODE` for
 * anything but `nearest`, `up` or `down`.
 */
export const roundScaled = (value: Rational, scale: bigint, mode: RoundingMode): bigint => {
  if (!Object.hasOwn(ROUNDERS, mode)) throw new CoreError('INVALID_MODE');
  return ROUNDERS[mode](value.mul(Rational.of(scale)));
};

/**
 * Rounds `value` to a multiple of `1/denominator` per `mode` (default `nearest`) and returns the
 * tick count `k`, so the rounded value is `k/denominator`. Throws `INVALID_DENOMINATOR` unless
 * `denominator` is an integer in 2..64, and `INVALID_MODE` for an unknown `mode`.
 */
export const roundToFraction = (
  value: Rational,
  denominator: number,
  mode: RoundingMode = 'nearest',
): bigint => {
  if (
    !Number.isInteger(denominator) ||
    denominator < MIN_DENOMINATOR ||
    denominator > MAX_DENOMINATOR
  ) {
    throw new CoreError('INVALID_DENOMINATOR');
  }
  return roundScaled(value, BigInt(denominator), mode);
};

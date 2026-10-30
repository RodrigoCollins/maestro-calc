import { Rational } from '../rational/rational.ts';
import { PI } from './pi.ts';

/** The decimals of a degree the arctangent keeps: the error is below 10^-20 of a degree. */
export const ATAN_PLACES = 20;

/** The fixed-point scale of the series: 10^45, far below the error the result keeps. */
const SCALE = 10n ** 45n;

const HALF_TURN = Rational.of(180);
const RIGHT_ANGLE = Rational.of(90);
const RESULT = 10n ** 30n;

/**
 * atan(t) in radians for 0 ≤ t ≤ 1, scaled by 10^45, by Euler's series
 * atan(t) = t/(1+t²) · Σ cₙ yⁿ with y = t²/(1+t²) ≤ 1/2 and cₙ = cₙ₋₁ · 2n/(2n+1). Every term is
 * positive and at most half the one before, so the tail after a term is below that term; each
 * integer division drops less than one unit of 10^-45, and at most 160 terms run, so the result is
 * within 10^-42 radian.
 */
const atanScaled = (t: Rational): bigint => {
  const onePlus = Rational.ONE.add(t.mul(t));
  // y = t² / (1 + t²) as a reduced fraction
  const y = t.mul(t).div(onePlus);
  let term = (t.num * onePlus.den * SCALE) / (t.den * onePlus.num);
  let sum = 0n;
  for (let n = 1n; term > 0n; n += 1n) {
    sum += term;
    term = (term * 2n * n * y.num) / ((2n * n + 1n) * y.den);
  }
  return sum;
};

/**
 * The arctangent of `t` in degrees (core-geometry › Arctangent): the angle of a slope of `t`, rise
 * over run. Odd, zero at zero, and within 10^-20 of a degree: the series keeps 10^-42 radian,
 * `PI` is within 10^-35, and the result is truncated to thirty decimals. A slope above one uses
 * atan(t) = 90° − atan(1/t), so the series always runs on t ≤ 1.
 */
export const arctangentDegrees = (t: Rational): Rational => {
  if (t.sign() === -1) return arctangentDegrees(t.neg()).neg();
  const steep = t.compare(Rational.ONE) === 1;
  const radians = Rational.of(atanScaled(steep ? t.inv() : t), SCALE);
  const degrees = radians.mul(HALF_TURN).div(PI);
  const angle = steep ? RIGHT_ANGLE.sub(degrees) : degrees;
  return Rational.of(angle.mul(Rational.of(RESULT)).floor(), RESULT);
};

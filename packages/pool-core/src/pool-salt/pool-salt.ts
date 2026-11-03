import { ceilToPurchaseUnits, defineCalculator, lb, quantity, Rational } from '@maestro-calc/core';

/** A gallon of water weighs about 8.34 lb, so 1 ppm in a gallon is 8.34 millionths of a pound. */
const POUNDS_PER_GALLON = Rational.of(834, 100);
const MILLION = Rational.of(1_000_000);
/** The common bag of pool salt. */
const BAG = Rational.of(40);
/** Hayward's AquaRite manual: add about three quarters, run the pump 24 hours, test, then the rest. */
const FIRST = Rational.of(3, 4);

const ppm = <K extends string>(key: K, urlKey: string, value: number) =>
  ({
    kind: 'decimal',
    key,
    urlKey,
    default: Rational.of(value),
    max: Rational.of(10_000),
  }) as const;

/**
 * Pool salt: the pounds that raise the pool from the current reading to the target,
 * gallons x (target - current) x 8.34 / 1,000,000, and the 40 lb bags that cover them. Salt only
 * comes down by draining, so a reading over the target adds nothing and says so.
 */
export const poolSalt = defineCalculator({
  id: 'pool-salt',
  inputs: [
    {
      kind: 'decimal',
      key: 'gallons',
      urlKey: 'g',
      default: Rational.of(20_000),
      max: Rational.of(1_000_000),
    },
    ppm('current', 'c', 2400),
    ppm('target', 't', 3200),
  ],
  outputs: [
    {
      key: 'pounds',
      measure: 'mass',
      role: 'primary',
      display: { unit: 'lb', format: 'decimal', places: 1 },
    },
    {
      key: 'kilograms',
      measure: 'mass',
      role: 'secondary',
      display: { unit: 'kg', format: 'decimal', places: 1 },
    },
    {
      key: 'firstAddition',
      measure: 'mass',
      role: 'secondary',
      display: { unit: 'lb', format: 'decimal', places: 1 },
    },
  ],
  warnings: ['drainToLower'],
  compute: ({ gallons, current, target }) => {
    // a reading at or over the target adds nothing
    const difference = target.sub(current);
    const raise = difference.sign() === -1 ? Rational.ZERO : difference;
    const pounds = gallons.mul(raise).mul(POUNDS_PER_GALLON).div(MILLION);
    const mass = quantity(pounds, lb);
    return {
      outputs: { pounds: mass, kilograms: mass, firstAddition: quantity(pounds.mul(FIRST), lb) },
      shopping: [
        {
          materialId: 'pool-salt',
          purchaseUnit: 'bag-40',
          qty: ceilToPurchaseUnits(pounds.div(BAG)),
        },
      ],
      warnings: difference.sign() === -1 ? [{ code: 'drainToLower' as const, params: {} }] : [],
    };
  },
});

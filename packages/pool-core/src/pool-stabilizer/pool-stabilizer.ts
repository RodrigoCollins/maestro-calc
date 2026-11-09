import { decimalInput, defineCalculator, kg, quantity, Rational } from '@maestro-calc/core';
import { litersOf, unitsInput } from '../units.ts';
/** Milligrams in a kilogram. */
const MILLION = Rational.of(1_000_000);
/** The CDC's Model Aquatic Health Code (2024, 5.7.3.1.3.2): public pools keep CYA at or below 90 ppm. */
const CODE_LIMIT = Rational.of(90);

const ppm = <K extends string>(key: K, urlKey: string, value: number) =>
  decimalInput({ key, urlKey, default: Rational.of(value), max: Rational.of(500) });

/**
 * Cyanuric acid (stabilizer, conditioner): the pure acid that raises CYA from the current reading
 * to the target, gallons x 3.785411784 x (target - current) milligrams, in pounds and ounces; the
 * dose assumes a 100% product. CYA only comes down by draining, so a reading over the target adds
 * nothing and says so, and a target over the 90 ppm public-pool limit is noted.
 */
export const poolStabilizer = defineCalculator({
  id: 'pool-stabilizer',
  inputs: [
    decimalInput({
      key: 'gallons',
      urlKey: 'g',
      default: Rational.of(20_000),
      max: Rational.of(1_000_000),
    }),
    ppm('current', 'c', 0),
    ppm('target', 't', 30),
    unitsInput(),
  ],
  outputs: [
    {
      key: 'pounds',
      measure: 'mass',
      role: 'primary',
      display: { unit: 'lb', format: 'decimal', places: 1 },
    },
    {
      key: 'ounces',
      measure: 'mass',
      role: 'secondary',
      display: { unit: 'oz', format: 'decimal', places: 1 },
    },
  ],
  warnings: ['drainToLower', 'overCodeLimit'],
  compute: ({ gallons, current, target, units }) => {
    // a reading at or over the target adds nothing
    const difference = target.sub(current);
    const raise = difference.sign() === -1 ? Rational.ZERO : difference;
    const mass = quantity(litersOf(gallons, units).mul(raise).div(MILLION), kg);
    return {
      outputs: { pounds: mass, ounces: mass },
      shopping: [],
      warnings: [
        ...(difference.sign() === -1 ? [{ code: 'drainToLower' as const, params: {} }] : []),
        ...(target.sub(CODE_LIMIT).sign() === 1
          ? [{ code: 'overCodeLimit' as const, params: {} }]
          : []),
      ],
    };
  },
});

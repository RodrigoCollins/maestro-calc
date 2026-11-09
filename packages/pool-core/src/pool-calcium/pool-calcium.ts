import { decimalInput, defineCalculator, lb, quantity, Rational } from '@maestro-calc/core';
import { gallonsOf, unitsInput } from '../units.ts';

/**
 * ClearView Calcium Increaser label (Oreq Corporation), calcium chloride flake (74-100% by its
 * SDS): "To raise calcium hardness 10 ppm use 2 ounces per 1,000 gallons of pool water", which is
 * 1.25 lb per 10 ppm per 10,000 gallons, gallons x ppm / 80,000 lb.
 */
const POUNDS_PER_PPM_GALLON = Rational.of(1, 80_000);
/**
 * The same label: "If more than 3 pounds of this product is needed per 10,000 gallons of pool
 * water, separate doses and apply this product at least 12 hours apart."
 */
const DOSE_PER_GALLON = Rational.of(3, 10_000);

const ppm = <K extends string>(key: K, urlKey: string, value: number) =>
  decimalInput({ key, urlKey, default: Rational.of(value), max: Rational.of(3000) });

/**
 * Calcium hardness increaser: the calcium chloride flake that raises calcium hardness from the
 * current reading to the target at the label's 1.25 lb per 10 ppm per 10,000 gallons, and the
 * first addition, at most 3 lb per 10,000 gallons, after which the label waits 12 hours. Calcium
 * only comes down by dilution, so a reading over the target adds nothing and says so.
 */
export const poolCalcium = defineCalculator({
  id: 'pool-calcium',
  inputs: [
    decimalInput({
      key: 'gallons',
      urlKey: 'g',
      default: Rational.of(20_000),
      max: Rational.of(1_000_000),
    }),
    ppm('current', 'c', 180),
    ppm('target', 't', 200),
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
    {
      key: 'firstAddition',
      measure: 'mass',
      role: 'secondary',
      display: { unit: 'lb', format: 'decimal', places: 1 },
    },
  ],
  warnings: ['dilutionToLower', 'splitDose'],
  compute: ({ gallons: volume, current, target, units }) => {
    const gallons = gallonsOf(volume, units);
    // a reading at or over the target adds nothing
    const difference = target.sub(current);
    const raise = difference.sign() === -1 ? Rational.ZERO : difference;
    const pounds = gallons.mul(raise).mul(POUNDS_PER_PPM_GALLON);
    const most = gallons.mul(DOSE_PER_GALLON);
    const split = pounds.compare(most) === 1;
    const mass = quantity(pounds, lb);
    return {
      outputs: {
        pounds: mass,
        ounces: mass,
        firstAddition: quantity(split ? most : pounds, lb),
      },
      shopping: [],
      warnings: [
        ...(difference.sign() === -1 ? [{ code: 'dilutionToLower' as const, params: {} }] : []),
        ...(split ? [{ code: 'splitDose' as const, params: {} }] : []),
      ],
    };
  },
});

import { decimalInput, defineCalculator, kg, quantity, Rational } from '@maestro-calc/core';

/** A US gallon is exactly 3.785411784 L (NIST SP 811), and 1 ppm is 1 mg/L. */
const LITERS_PER_GALLON = Rational.of(3_785_411_784, 1_000_000_000);
/**
 * Total alkalinity is read as calcium carbonate: CaCO3 (100.087 g/mol, two equivalents) weighs
 * 50.04 g an equivalent, and sodium bicarbonate (NaHCO3, 84.007 g/mol) gives one, so 1 ppm of TA is
 * 84.007 / 50.04 = 1.6788 mg/L of baking soda.
 */
const BICARBONATE_PER_PPM = Rational.of(84_007, 50_040);
/** Milligrams in a kilogram. */
const MILLION = Rational.of(1_000_000);

const ppm = <K extends string>(key: K, urlKey: string, value: number) =>
  decimalInput({ key, urlKey, default: Rational.of(value), max: Rational.of(1000) });

/**
 * Total alkalinity increaser: the sodium bicarbonate (baking soda) that raises total alkalinity
 * from the current reading to the target, gallons x 3.785411784 x (target - current) x 84.007 /
 * 50.04 milligrams, in pounds and ounces. Lowering alkalinity takes acid, which this calculator
 * does not dose, so a reading over the target adds nothing and says so.
 */
export const poolAlkalinity = defineCalculator({
  id: 'pool-alkalinity',
  inputs: [
    decimalInput({
      key: 'gallons',
      urlKey: 'g',
      default: Rational.of(20_000),
      max: Rational.of(1_000_000),
    }),
    ppm('current', 'c', 70),
    ppm('target', 't', 100),
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
  warnings: ['acidToLower'],
  compute: ({ gallons, current, target }) => {
    // a reading at or over the target adds nothing
    const difference = target.sub(current);
    const raise = difference.sign() === -1 ? Rational.ZERO : difference;
    const milligrams = gallons.mul(LITERS_PER_GALLON).mul(raise).mul(BICARBONATE_PER_PPM);
    const mass = quantity(milligrams.div(MILLION), kg);
    return {
      outputs: { pounds: mass, ounces: mass },
      shopping: [],
      warnings: difference.sign() === -1 ? [{ code: 'acidToLower' as const, params: {} }] : [],
    };
  },
});

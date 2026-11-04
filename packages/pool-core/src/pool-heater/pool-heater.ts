import { decimalInput, defineCalculator, Rational } from '@maestro-calc/core';

/**
 * 1 BTU raises 1 lb of water by 1 °F, and a US gallon of water weighs about 8.34 lb, so warming a
 * gallon by 1 °F takes 8.34 BTU.
 */
const BTU_PER_GALLON_DEGREE = Rational.of(834, 100);

/**
 * Pool heater: the heat that warms the water by the rise, gallons x 8.34 x rise BTU, and the
 * output a heater must give to do it in the hours, that heat over the hours (BTU per hour). It
 * leaves out the heat the pool loses while it warms (wind, evaporation, no cover), so a real
 * heater is sized larger.
 */
export const poolHeater = defineCalculator({
  id: 'pool-heater',
  inputs: [
    decimalInput({
      key: 'gallons',
      urlKey: 'g',
      default: Rational.of(20_000),
      max: Rational.of(1_000_000),
    }),
    decimalInput({ key: 'rise', urlKey: 'r', default: Rational.of(10), max: Rational.of(100) }),
    decimalInput({
      key: 'hours',
      urlKey: 'h',
      default: Rational.of(24),
      min: Rational.ONE,
      max: Rational.of(720),
    }),
  ],
  outputs: [
    { key: 'btuPerHour', measure: 'number', role: 'primary' },
    { key: 'btu', measure: 'number', role: 'secondary' },
  ],
  warnings: [],
  compute: ({ gallons, rise, hours }) => {
    const btu = gallons.mul(BTU_PER_GALLON_DEGREE).mul(rise);
    return {
      outputs: { btuPerHour: btu.div(hours), btu },
      shopping: [],
      warnings: [],
    };
  },
});

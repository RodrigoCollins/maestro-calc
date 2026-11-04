import {
  add,
  defineCalculator,
  ft,
  inch,
  lengthInput,
  multiply,
  PI,
  quantity,
  Rational,
  scale,
  selectInput,
} from '@maestro-calc/core';

/** The shapes the calculator measures exactly; a kidney pool has no exact formula. */
const SHAPES = ['rectangle', 'round', 'oval'] as const;

const HALF = Rational.of(1, 2);
const QUARTER = Rational.of(1, 4);

const length = <K extends string>(key: K, urlKey: string, feet: number) =>
  lengthInput({
    key,
    urlKey,
    default: quantity(feet * 12, inch),
    defaultUnit: 'ft',
    metricDefaultUnit: 'm',
    min: quantity(0, inch),
    max: quantity(500, ft),
  });

/**
 * Pool volume: the surface area of the shape times the average of the shallow and the deep end.
 * A round pool reads the length as its diameter (pi x d^2 / 4); an oval is the ellipse of the
 * length and the width (pi x l x w / 4). Exact arithmetic; the core's Rational pi is the only
 * approximation, below 10^-35.
 */
export const poolVolume = defineCalculator({
  id: 'pool-volume',
  inputs: [
    selectInput({ key: 'shape', urlKey: 's', options: SHAPES, default: 'rectangle' }),
    length('length', 'l', 32),
    length('width', 'w', 16),
    length('shallow', 'sh', 3.5),
    length('deep', 'd', 8),
  ],
  outputs: [
    {
      key: 'gallons',
      measure: 'volume',
      role: 'primary',
      display: { unit: 'gal', format: 'decimal', places: 0 },
    },
    {
      key: 'liters',
      measure: 'volume',
      role: 'secondary',
      display: { unit: 'L', format: 'decimal', places: 0 },
    },
    {
      key: 'cubicFeet',
      measure: 'volume',
      role: 'secondary',
      display: { unit: 'ft3', format: 'decimal', places: 1 },
    },
  ],
  warnings: [],
  compute: ({ shape, length, width, shallow, deep }) => {
    const area =
      shape === 'rectangle'
        ? multiply(length, width)
        : shape === 'round'
          ? scale(multiply(length, length), PI.mul(QUARTER))
          : scale(multiply(length, width), PI.mul(QUARTER));
    const volume = multiply(area, scale(add(shallow, deep), HALF));
    return {
      outputs: { gallons: volume, liters: volume, cubicFeet: volume },
      shopping: [],
      warnings: [],
    };
  },
});

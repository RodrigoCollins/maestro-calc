import { defineCalculator } from '../../calculator/define.ts';
import { CoreError } from '../../errors.ts';
import { ceilToPurchaseUnits } from '../../format/purchase.ts';
import { multiplyCount, usd } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, ft2, gal, inch } from '../../units/catalog.ts';
import { add, multiply, ratio, scale, sign, sub } from '../../units/ops.ts';
import { isQuantityOf, quantity, type Quantity } from '../../units/quantity.ts';

/** The area of one door left out of the walls: a standard 36 in by 80 in door, exactly 20 ft². */
const DOOR = quantity(20, ft2);

/** The area of one window left out of the walls: a 3 ft by 5 ft window, 15 ft². */
const WINDOW = quantity(15, ft2);

/**
 * The area one gallon of paint covers in one coat. Injected, so core holds no material constant.
 */
export interface PaintCoverage {
  readonly perGallon: Quantity<'area'>;
}

/** The reason is not one of `DEFINITION_REASONS`: the factory owns it. */
const coverageFailure = (): CoreError =>
  new CoreError('INVALID_DEFINITION', 'PAINT_COVERAGE', {
    cause: { id: 'paint', reason: 'PAINT_COVERAGE' },
  });

/**
 * The factory owns this check, before `defineCalculator` runs: the coverage is exactly the key
 * `perGallon`, an area above zero, read once into a frozen snapshot.
 */
const snapshotCoverage = (coverage: unknown): PaintCoverage => {
  if (typeof coverage !== 'object' || coverage === null) throw coverageFailure();
  if (Object.keys(coverage).length !== 1) throw coverageFailure();
  const value: unknown = Object.hasOwn(coverage, 'perGallon')
    ? Reflect.get(coverage, 'perGallon')
    : undefined;
  if (!isQuantityOf(value, 'area') || sign(value) !== 1) throw coverageFailure();
  return Object.freeze({ perGallon: value });
};

/**
 * The paint calculator (calc-paint): the walls of a rectangular room, less its doors and windows,
 * the gallons for the coats at the injected coverage, the whole gallon cans to buy and an optional
 * cost per gallon. Exact arithmetic throughout; the can count is the only rounding.
 */
export const createPaint = (suppliedCoverage: PaintCoverage) => {
  const coverage = snapshotCoverage(suppliedCoverage);
  return defineCalculator({
    id: 'paint',
    inputs: [
      {
        kind: 'length',
        key: 'length',
        urlKey: 'l',
        default: quantity(144, inch),
        defaultUnit: 'ft',
        metricDefaultUnit: 'm',
        min: quantity(0, inch),
        max: quantity(1000, ft),
      },
      {
        kind: 'length',
        key: 'width',
        urlKey: 'w',
        default: quantity(144, inch),
        defaultUnit: 'ft',
        metricDefaultUnit: 'm',
        min: quantity(0, inch),
        max: quantity(1000, ft),
      },
      {
        kind: 'length',
        key: 'height',
        urlKey: 'h',
        default: quantity(96, inch),
        defaultUnit: 'ft',
        metricDefaultUnit: 'm',
        min: quantity(0, inch),
        max: quantity(50, ft),
      },
      { kind: 'count', key: 'doors', urlKey: 'dr', default: 1, min: 0, max: 50 },
      { kind: 'count', key: 'windows', urlKey: 'wn', default: 2, min: 0, max: 100 },
      { kind: 'count', key: 'coats', urlKey: 'c', default: 2, min: 1, max: 5 },
      { kind: 'money', key: 'gallonPrice', urlKey: 'gp', default: usd(0), max: usd(10000) },
    ],
    outputs: [
      {
        key: 'gallons',
        measure: 'volume',
        role: 'primary',
        display: { unit: 'gal', format: 'decimal', places: 2 },
      },
      {
        key: 'liters',
        measure: 'volume',
        role: 'secondary',
        display: { unit: 'L', format: 'decimal', places: 2 },
      },
      {
        key: 'paintArea',
        measure: 'area',
        role: 'secondary',
        display: { unit: 'ft2', format: 'decimal', places: 2 },
      },
      {
        key: 'wallArea',
        measure: 'area',
        role: 'intermediate',
        display: { unit: 'ft2', format: 'decimal', places: 2 },
      },
      { key: 'cost', measure: 'money', role: 'secondary' },
    ],
    compute: ({ length, width, height, doors, windows, coats, gallonPrice }) => {
      const walls = scale(multiply(add(length, width), height), Rational.of(2));
      const openings = add(scale(DOOR, Rational.of(doors)), scale(WINDOW, Rational.of(windows)));
      const left = sub(walls, openings);
      // openings larger than the walls paint nothing, never a negative amount
      const area = sign(left) === 1 ? left : quantity(0, ft2);
      const gallons = quantity(ratio(area, coverage.perGallon).mul(Rational.of(coats)), gal);
      // whole cans only: the ceiling of the gallons is the only rounding
      const cans = ceilToPurchaseUnits(ratio(gallons, quantity(1, gal)));
      return {
        outputs: {
          gallons,
          liters: gallons,
          paintArea: area,
          wallArea: walls,
          cost: multiplyCount(gallonPrice, cans),
        },
        shopping: [{ materialId: 'paint', purchaseUnit: 'gallon', qty: cans }],
        warnings: [],
      };
    },
  });
};

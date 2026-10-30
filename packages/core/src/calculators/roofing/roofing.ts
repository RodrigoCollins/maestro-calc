import { defineCalculator } from '../../calculator/define.ts';
import { CoreError } from '../../errors.ts';
import { ceilToPurchaseUnits } from '../../format/purchase.ts';
import { squareRoot } from '../../geometry/sqrt.ts';
import { multiplyCount, usd } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, inch } from '../../units/catalog.ts';
import { multiply, ratio, scale, sign, sub } from '../../units/ops.ts';
import { isQuantityOf, quantity, type Quantity } from '../../units/quantity.ts';

const HUNDRED = Rational.of(100);
const TWELVE = Rational.of(12);

/**
 * The IRC 2021 rules the underlayment follows, Table R905.1.1(2) for asphalt shingles where wind
 * design is not required: from 4 in 12 one layer lapped 2 in; from 2 in 12 up to 4 in 12 two
 * layers (36 in sheets lapped 19 in: each sheet shows 17 in, half of its width less 2 in); end laps
 * 4 in. R905.2.2: asphalt shingles only from 2 in 12. Code values, not material data: they live
 * with the check.
 */
const SIDE_LAP = quantity(2, inch);
const END_LAP = quantity(4, inch);
const ONE_LAYER_FROM = 4;
const MINIMUM = 2;

/**
 * What a bundle of shingles covers and the size of a roll of underlayment. Injected, so core holds
 * no material constant.
 */
export interface RoofingCoverage {
  readonly bundle: Quantity<'area'>;
  readonly rollWidth: Quantity<'length'>;
  readonly rollLength: Quantity<'length'>;
}

/** The reason is not one of `DEFINITION_REASONS`: the factory owns it. */
const coverageFailure = (): CoreError =>
  new CoreError('INVALID_DEFINITION', 'ROOFING_COVERAGE', {
    cause: { id: 'roofing', reason: 'ROOFING_COVERAGE' },
  });

/**
 * The factory owns this check, before `defineCalculator` runs: the coverage is exactly the keys
 * `bundle`, `rollWidth` and `rollLength`, an area above zero and a roll wider than its side lap and
 * longer than its end lap, read once into a frozen snapshot.
 */
const snapshotCoverage = (coverage: unknown): RoofingCoverage => {
  if (typeof coverage !== 'object' || coverage === null) throw coverageFailure();
  if (Object.keys(coverage).length !== 3) throw coverageFailure();
  const own = (key: string): unknown =>
    Object.hasOwn(coverage, key) ? Reflect.get(coverage, key) : undefined;
  const [bundle, rollWidth, rollLength] = [own('bundle'), own('rollWidth'), own('rollLength')];
  if (!isQuantityOf(bundle, 'area') || sign(bundle) !== 1) throw coverageFailure();
  if (!isQuantityOf(rollWidth, 'length') || sign(sub(rollWidth, SIDE_LAP)) !== 1) {
    throw coverageFailure();
  }
  if (!isQuantityOf(rollLength, 'length') || sign(sub(rollLength, END_LAP)) !== 1) {
    throw coverageFailure();
  }
  return Object.freeze({ bundle, rollWidth, rollLength });
};

/**
 * The roofing calculator (calc-roofing): the roof over a rectangular footprint at a pitch, in
 * squares; the bundles of shingles and the rolls of underlayment with an extra allowance, the
 * underlayment doubled below 4 in 12; the IRC check of the asphalt shingle minimum. The slope factor
 * √(1 + (p/12)²) is truncated to 20 decimals; the rest is exact, and the purchase counts are the
 * only rounding.
 */
export const createRoofing = (suppliedCoverage: RoofingCoverage) => {
  const coverage = snapshotCoverage(suppliedCoverage);
  const length = sub(coverage.rollLength, END_LAP);
  const lapped = sub(coverage.rollWidth, SIDE_LAP);
  /** What a roll covers in one layer, and in two (half the lapped width shows). */
  const oneLayer = multiply(length, lapped);
  const twoLayers = scale(oneLayer, Rational.of(1, 2));
  return defineCalculator({
    id: 'roofing',
    inputs: [
      {
        kind: 'length',
        key: 'length',
        urlKey: 'l',
        default: quantity(40, ft),
        defaultUnit: 'ft',
        metricDefaultUnit: 'm',
        min: quantity(0, inch),
        max: quantity(1000, ft),
      },
      {
        kind: 'length',
        key: 'width',
        urlKey: 'w',
        default: quantity(30, ft),
        defaultUnit: 'ft',
        metricDefaultUnit: 'm',
        min: quantity(0, inch),
        max: quantity(1000, ft),
      },
      { kind: 'count', key: 'pitch', urlKey: 'p', default: 6, min: 0, max: 24 },
      {
        kind: 'percent',
        key: 'waste',
        urlKey: 'ws',
        default: Rational.of(10),
        min: Rational.ZERO,
        max: Rational.of(50),
      },
      { kind: 'money', key: 'bundlePrice', urlKey: 'bp', default: usd(0), max: usd(10000) },
      { kind: 'money', key: 'rollPrice', urlKey: 'rp', default: usd(0), max: usd(10000) },
    ],
    outputs: [
      {
        key: 'squares',
        measure: 'area',
        role: 'primary',
        display: { unit: 'sq', format: 'decimal', places: 2 },
      },
      {
        key: 'areaFt2',
        measure: 'area',
        role: 'secondary',
        display: { unit: 'ft2', format: 'decimal', places: 2 },
      },
      {
        key: 'areaM2',
        measure: 'area',
        role: 'secondary',
        display: { unit: 'm2', format: 'decimal', places: 2 },
      },
      { key: 'shinglesCost', measure: 'money', role: 'secondary' },
      { key: 'underlaymentCost', measure: 'money', role: 'secondary' },
    ],
    warnings: ['belowMinimum', 'doubleUnderlayment'],
    compute: ({ length: footLength, width, pitch, waste, bundlePrice, rollPrice }) => {
      const slope = Rational.of(pitch).div(TWELVE);
      const area = scale(
        multiply(footLength, width),
        squareRoot(Rational.ONE.add(slope.mul(slope))),
      );
      const needed = scale(area, Rational.ONE.add(waste.div(HUNDRED)));
      const bundles = ceilToPurchaseUnits(ratio(needed, coverage.bundle));
      const double = pitch < ONE_LAYER_FROM;
      const rolls = ceilToPurchaseUnits(ratio(needed, double ? twoLayers : oneLayer));
      const below = pitch < MINIMUM;
      return {
        outputs: {
          squares: area,
          areaFt2: area,
          areaM2: area,
          shinglesCost: multiplyCount(bundlePrice, bundles),
          underlaymentCost: multiplyCount(rollPrice, rolls),
        },
        shopping: [
          { materialId: 'shingles', purchaseUnit: 'bundle', qty: bundles },
          { materialId: 'underlayment', purchaseUnit: 'roll', qty: rolls },
        ],
        warnings: below
          ? [{ code: 'belowMinimum' as const, params: { minimum: MINIMUM } }]
          : double
            ? [{ code: 'doubleUnderlayment' as const, params: {} }]
            : [],
      };
    },
  });
};

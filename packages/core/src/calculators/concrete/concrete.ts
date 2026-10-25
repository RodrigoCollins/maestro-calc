import { defineCalculator } from '../../calculator/define.ts';
import type { LengthDescriptor } from '../../calculator/descriptors.ts';
import { CoreError } from '../../errors.ts';
import { ceilToPurchaseUnits } from '../../format/purchase.ts';
import { multiplyCount, usd } from '../../money/money.ts';
import { costOf, unitPrice } from '../../money/unit-price.ts';
import { circleArea } from '../../geometry/circle.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, inch, yd3 } from '../../units/catalog.ts';
import { divideScalar, multiply, ratio, scale, sign } from '../../units/ops.ts';
import { isQuantityOf, quantity, type Quantity } from '../../units/quantity.ts';

const HUNDRED = Rational.of(100);

const TWO = Rational.of(2);

type Length = Quantity<'length'>;

/** The volume of a slab: `length x width x thickness`. */
const slabVolume = (length: Length, width: Length, thickness: Length): Quantity<'volume'> =>
  multiply(multiply(length, width), thickness);

/** The volume of `count` footings: `length x footingWidth x footingDepth` each. */
const footingVolume = (
  length: Length,
  footingWidth: Length,
  footingDepth: Length,
  count: number,
): Quantity<'volume'> =>
  scale(multiply(multiply(length, footingWidth), footingDepth), Rational.of(count));

/** The volume of `count` columns: `PI x (diameter / 2)^2 x height` each. */
const columnVolume = (diameter: Length, height: Length, count: number): Quantity<'volume'> =>
  scale(multiply(circleArea(divideScalar(diameter, TWO)), height), Rational.of(count));

/** The shapes of the calculator, in the order the select offers them. */
const SHAPES = ['slab', 'footing', 'column', 'steps'] as const;

/** The bag sizes in pounds, in the order the select offers them. */
const BAG_SIZES = ['40', '60', '80'] as const;

type Shape = (typeof SHAPES)[number];
type BagSize = (typeof BAG_SIZES)[number];

/** The purchase unit id of a bag size: the one key of the yields, the data and the shopping line. */
const bagUnitOf = (size: BagSize): `bag-${BagSize}` => `bag-${size}`;

/**
 * The yield of one bag, by purchase unit id (`bag-<pounds>`), the id the material record and the
 * shopping line use too: injected, so core holds no material constant.
 */
export type BagYields = Readonly<Record<`bag-${BagSize}`, Quantity<'volume'>>>;

/**
 * The volume of `stepCount` steps: step `k` is a full-height block `stepWidth x run x (k x rise)`,
 * and `1 + 2 + ... + N` is `N(N+1)/2`.
 */
const stepsVolume = (
  stepWidth: Length,
  rise: Length,
  run: Length,
  stepCount: number,
): Quantity<'volume'> => {
  const steps = Rational.of(stepCount);
  return scale(
    multiply(multiply(stepWidth, run), rise),
    steps.mul(steps.add(Rational.ONE)).div(TWO),
  );
};

/** The fields `netVolumeOf` reads, by the shape that uses them. */
interface Dimensions {
  readonly shape: Shape;
  readonly length: Length;
  readonly width: Length;
  readonly thickness: Length;
  readonly footingWidth: Length;
  readonly footingDepth: Length;
  readonly diameter: Length;
  readonly height: Length;
  readonly stepWidth: Length;
  readonly rise: Length;
  readonly run: Length;
  readonly stepCount: number;
  readonly count: number;
}

/** The volume of each shape; the fields of the other shapes are not read. */
const VOLUME_OF: Readonly<Record<Shape, (inputs: Dimensions) => Quantity<'volume'>>> = {
  slab: (d) => slabVolume(d.length, d.width, d.thickness),
  footing: (d) => footingVolume(d.length, d.footingWidth, d.footingDepth, d.count),
  column: (d) => columnVolume(d.diameter, d.height, d.count),
  steps: (d) => stepsVolume(d.stepWidth, d.rise, d.run, d.stepCount),
};

/** The net volume of the chosen shape. */
const netVolumeOf = (inputs: Dimensions): Quantity<'volume'> => VOLUME_OF[inputs.shape](inputs);

/** The reason is not one of `DEFINITION_REASONS`: the factory owns it. */
const bagYieldsFailure = (): CoreError =>
  new CoreError('INVALID_DEFINITION', 'BAG_YIELDS', {
    cause: { id: 'concrete', reason: 'BAG_YIELDS' },
  });

/**
 * The factory owns this check, before `defineCalculator` runs: the yields are exactly the keys
 * `bag-40`, `bag-60` and `bag-80`, each a volume above zero. It returns a frozen snapshot read once,
 * so a caller that keeps and changes its object (or a getter) cannot alter the calculator later.
 */
const snapshotBagYields = (yields: unknown): BagYields => {
  if (typeof yields !== 'object' || yields === null) throw bagYieldsFailure();
  if (Object.keys(yields).length !== BAG_SIZES.length) throw bagYieldsFailure();
  const read = (size: BagSize): Quantity<'volume'> => {
    const unit = bagUnitOf(size);
    const value: unknown = Object.hasOwn(yields, unit) ? Reflect.get(yields, unit) : undefined;
    if (!isQuantityOf(value, 'volume') || sign(value) !== 1) throw bagYieldsFailure();
    return value;
  };
  return Object.freeze({ 'bag-40': read('40'), 'bag-60': read('60'), 'bag-80': read('80') });
};

/** A length field: its default in inches, the unit a bare number is read in, and its maximum. */
const lengthField = <const K extends string, const U extends string>(
  key: K,
  urlKey: U,
  defaultInches: number,
  [defaultUnit, metricDefaultUnit]: readonly ['in' | 'ft', 'cm' | 'm'],
  max: Quantity<'length'>,
): LengthDescriptor & { readonly key: K; readonly urlKey: U } => ({
  kind: 'length',
  key,
  urlKey,
  default: quantity(defaultInches, inch),
  defaultUnit,
  metricDefaultUnit,
  min: quantity(0, inch),
  max,
});

/** Large dimensions are read in feet (and metres), small ones in inches (and centimetres). */
const BIG = ['ft', 'm'] as const;
const SMALL = ['in', 'cm'] as const;

/**
 * The concrete calculator (calc-concrete): the volume of a slab, a footing, a column or steps, a
 * waste allowance, a bag shopping line and optional costs. `yields` are the bag yields, supplied
 * by the composition root; exact arithmetic throughout, rounding only at the bag count.
 */
export const createConcrete = (suppliedYields: BagYields) => {
  const yields = snapshotBagYields(suppliedYields);
  return defineCalculator({
    id: 'concrete',
    inputs: [
      {
        kind: 'select',
        key: 'shape',
        urlKey: 'sh',
        default: 'slab',
        options: SHAPES,
      },
      lengthField('length', 'l', 144, BIG, quantity(1000, ft)),
      lengthField('width', 'w', 120, BIG, quantity(1000, ft)),
      lengthField('thickness', 't', 4, SMALL, quantity(10, ft)),
      lengthField('footingWidth', 'fw', 16, SMALL, quantity(10, ft)),
      lengthField('footingDepth', 'fd', 8, SMALL, quantity(10, ft)),
      lengthField('diameter', 'd', 12, SMALL, quantity(20, ft)),
      lengthField('height', 'h', 96, BIG, quantity(100, ft)),
      lengthField('stepWidth', 'sw', 48, BIG, quantity(100, ft)),
      lengthField('rise', 'rs', 7, SMALL, quantity(5, ft)),
      lengthField('run', 'rn', 11, SMALL, quantity(5, ft)),
      { kind: 'count', key: 'stepCount', urlKey: 'ns', default: 3, min: 0, max: 50 },
      { kind: 'count', key: 'count', urlKey: 'n', default: 1, min: 1, max: 1000 },
      {
        kind: 'percent',
        key: 'waste',
        urlKey: 'ws',
        default: Rational.of(10),
        min: Rational.ZERO,
        max: Rational.of(50),
      },
      { kind: 'select', key: 'bag', urlKey: 'bg', default: '80', options: BAG_SIZES },
      { kind: 'money', key: 'bagPrice', urlKey: 'bp', default: usd(0), max: usd(10000) },
      { kind: 'money', key: 'readyMixPrice', urlKey: 'rp', default: usd(0), max: usd(10000) },
    ],
    outputs: [
      {
        key: 'volumeYd3',
        measure: 'volume',
        role: 'primary',
        display: { unit: 'yd3', format: 'decimal', places: 2 },
      },
      {
        key: 'volumeFt3',
        measure: 'volume',
        role: 'secondary',
        display: { unit: 'ft3', format: 'decimal', places: 2 },
      },
      {
        key: 'volumeM3',
        measure: 'volume',
        role: 'secondary',
        display: { unit: 'm3', format: 'decimal', places: 2 },
      },
      {
        key: 'netVolume',
        measure: 'volume',
        role: 'intermediate',
        display: { unit: 'ft3', format: 'decimal', places: 2 },
      },
      { key: 'bagCost', measure: 'money', role: 'secondary' },
      { key: 'readyMixCost', measure: 'money', role: 'secondary' },
    ],
    compute: (inputs) => {
      const { waste, bag, bagPrice, readyMixPrice } = inputs;
      const net = netVolumeOf(inputs);
      const total = scale(net, Rational.ONE.add(waste.div(HUNDRED)));
      // whole bags only: the ceiling of total volume over the yield is the only rounding
      const unit = bagUnitOf(bag);
      const qty = ceilToPurchaseUnits(ratio(total, yields[unit]));
      return {
        outputs: {
          volumeYd3: total,
          volumeFt3: total,
          volumeM3: total,
          netVolume: net,
          bagCost: multiplyCount(bagPrice, qty),
          readyMixCost: costOf(unitPrice(readyMixPrice, yd3), total),
        },
        shopping: [{ materialId: 'concrete-mix', purchaseUnit: unit, qty }],
        warnings: [],
      };
    },
  });
};

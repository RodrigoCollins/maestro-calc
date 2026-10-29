import { defineCalculator } from '../../calculator/define.ts';
import { CoreError } from '../../errors.ts';
import { usd } from '../../money/money.ts';
import { costOf, unitPrice } from '../../money/unit-price.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, inch, ton } from '../../units/catalog.ts';
import { divide, multiply, scale, sign } from '../../units/ops.ts';
import { isQuantityOf, quantity, type Quantity } from '../../units/quantity.ts';

const HUNDRED = Rational.of(100);

/** How the gravel is placed, in the order the select offers them. */
const PLACEMENTS = ['compacted', 'loose'] as const;

type Placement = (typeof PLACEMENTS)[number];

/**
 * The weight of a cubic yard of gravel by placement: compacted in place, and loose (how the yard
 * measures what it sells by volume). Injected, so core holds no material constant.
 */
export type GravelDensities = Readonly<Record<Placement, Quantity<'density'>>>;

/** The reason is not one of `DEFINITION_REASONS`: the factory owns it. */
const densitiesFailure = (): CoreError =>
  new CoreError('INVALID_DEFINITION', 'GRAVEL_DENSITIES', {
    cause: { id: 'gravel', reason: 'GRAVEL_DENSITIES' },
  });

/**
 * The factory owns this check, before `defineCalculator` runs: the densities are exactly the keys
 * `compacted` and `loose`, each a density above zero, read once into a frozen snapshot.
 */
const snapshotDensities = (densities: unknown): GravelDensities => {
  if (typeof densities !== 'object' || densities === null) throw densitiesFailure();
  if (Object.keys(densities).length !== PLACEMENTS.length) throw densitiesFailure();
  const read = (placement: Placement): Quantity<'density'> => {
    const value: unknown = Object.hasOwn(densities, placement)
      ? Reflect.get(densities, placement)
      : undefined;
    if (!isQuantityOf(value, 'density') || sign(value) !== 1) throw densitiesFailure();
    return value;
  };
  return Object.freeze({ compacted: read('compacted'), loose: read('loose') });
};

/**
 * The gravel calculator (calc-gravel): the weight of a rectangle of gravel at a depth, compacted or
 * loose, with an extra allowance, the loose volume to order, and an optional cost per ton. Exact
 * arithmetic throughout; rounding happens only for display.
 */
export const createGravel = (suppliedDensities: GravelDensities) => {
  const densities = snapshotDensities(suppliedDensities);
  return defineCalculator({
    id: 'gravel',
    inputs: [
      {
        kind: 'length',
        key: 'length',
        urlKey: 'l',
        default: quantity(240, inch),
        defaultUnit: 'ft',
        metricDefaultUnit: 'm',
        min: quantity(0, inch),
        max: quantity(1000, ft),
      },
      {
        kind: 'length',
        key: 'width',
        urlKey: 'w',
        default: quantity(120, inch),
        defaultUnit: 'ft',
        metricDefaultUnit: 'm',
        min: quantity(0, inch),
        max: quantity(1000, ft),
      },
      {
        kind: 'length',
        key: 'depth',
        urlKey: 'd',
        default: quantity(4, inch),
        defaultUnit: 'in',
        metricDefaultUnit: 'cm',
        min: quantity(0, inch),
        max: quantity(10, ft),
      },
      { kind: 'select', key: 'placement', urlKey: 'pl', default: 'compacted', options: PLACEMENTS },
      {
        kind: 'percent',
        key: 'waste',
        urlKey: 'ws',
        default: Rational.of(5),
        min: Rational.ZERO,
        max: Rational.of(50),
      },
      { kind: 'money', key: 'tonPrice', urlKey: 'tp', default: usd(0), max: usd(10000) },
    ],
    outputs: [
      {
        key: 'tons',
        measure: 'mass',
        role: 'primary',
        display: { unit: 'ton', format: 'decimal', places: 2 },
      },
      {
        key: 'tonnes',
        measure: 'mass',
        role: 'secondary',
        display: { unit: 'tonne', format: 'decimal', places: 2 },
      },
      {
        key: 'orderYd3',
        measure: 'volume',
        role: 'secondary',
        display: { unit: 'yd3', format: 'decimal', places: 2 },
      },
      {
        key: 'orderM3',
        measure: 'volume',
        role: 'secondary',
        display: { unit: 'm3', format: 'decimal', places: 2 },
      },
      {
        key: 'placedYd3',
        measure: 'volume',
        role: 'intermediate',
        display: { unit: 'yd3', format: 'decimal', places: 2 },
      },
      { key: 'cost', measure: 'money', role: 'secondary' },
    ],
    compute: ({ length, width, depth, placement, waste, tonPrice }) => {
      const placed = multiply(multiply(length, width), depth);
      const total = scale(placed, Rational.ONE.add(waste.div(HUNDRED)));
      const weight = multiply(total, densities[placement]);
      // the yard measures by the loose volume, whatever the placement
      const order = divide(weight, densities.loose);
      return {
        outputs: {
          tons: weight,
          tonnes: weight,
          orderYd3: order,
          orderM3: order,
          placedYd3: placed,
          cost: costOf(unitPrice(tonPrice, ton), weight),
        },
        shopping: [],
        warnings: [],
      };
    },
  });
};

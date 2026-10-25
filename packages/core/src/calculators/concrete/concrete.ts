import { defineCalculator } from '../../calculator/define.ts';
import type { LengthDescriptor } from '../../calculator/descriptors.ts';
import { usd } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, inch } from '../../units/catalog.ts';
import { multiply, scale } from '../../units/ops.ts';
import { quantity, type Quantity } from '../../units/quantity.ts';

/** The yield of one bag, by bag size in pounds: injected, so core holds no material constant. */
export type BagYields = Readonly<Record<'40' | '60' | '80', Quantity<'volume'>>>;

const HUNDRED = Rational.of(100);

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
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the bag slice reads the yields
export const createConcrete = (_yields: BagYields) =>
  defineCalculator({
    id: 'concrete',
    inputs: [
      { kind: 'select', key: 'shape', urlKey: 'sh', default: 'slab', options: ['slab'] },
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
      { kind: 'select', key: 'bag', urlKey: 'bg', default: '80', options: ['40', '60', '80'] },
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
    ],
    compute: ({ length, width, thickness, waste }) => {
      const net = multiply(multiply(length, width), thickness);
      const total = scale(net, Rational.ONE.add(waste.div(HUNDRED)));
      return {
        outputs: { volumeYd3: total, volumeFt3: total, volumeM3: total, netVolume: net },
        shopping: [],
        warnings: [],
      };
    },
  });

import { defineCalculator } from '../../calculator/define.ts';
import { arctangentDegrees } from '../../geometry/atan.ts';
import { squareRoot } from '../../geometry/sqrt.ts';
import { Rational } from '../../rational/rational.ts';
import { deg, ft, inch } from '../../units/catalog.ts';
import { add, ratio, scale } from '../../units/ops.ts';
import { quantity } from '../../units/quantity.ts';

/** The roof coverings the IRC check knows, in the order the select offers them. */
const COVERINGS = ['asphalt', 'tile', 'metal', 'roll', 'slate', 'wood'] as const;

type Covering = (typeof COVERINGS)[number];

/**
 * The minimum slope of each covering, in units of rise per 12 of run, from the IRC 2021: R905.2.2
 * asphalt shingles, R905.3.2 clay and concrete tile, R905.4.2 metal roof shingles, R905.5.2
 * mineral-surfaced roll roofing, R905.6.2 slate, R905.7.2 and R905.8.2 wood shingles and shakes.
 * These are code values, not material data: they live with the check.
 */
const MINIMUM = {
  asphalt: Rational.of(2),
  tile: Rational.of(5, 2),
  metal: Rational.of(3),
  roll: Rational.of(1),
  slate: Rational.of(4),
  wood: Rational.of(3),
} as const satisfies Record<Covering, Rational>;

/** Asphalt shingles and tile take two layers of underlayment below 4 in 12 (R905.2.2, R905.3.2). */
const DOUBLE_BELOW = Rational.of(4);
const DOUBLED: readonly Covering[] = ['asphalt', 'tile'];

const TWELVE = Rational.of(12);

/**
 * The roof pitch calculator (calc-roof-pitch): the pitch in 12, the angle and the rafter length of a
 * rise over a run, and the IRC check of the chosen covering. The rafter multiplies the run by
 * √(1 + t²), truncated to 20 decimals, and the angle is atan(t) within 10^-20 of a degree; the rest
 * is exact.
 */
export const roofPitch = defineCalculator({
  id: 'roof-pitch',
  inputs: [
    {
      kind: 'length',
      key: 'rise',
      urlKey: 'r',
      default: quantity(6, inch),
      defaultUnit: 'in',
      metricDefaultUnit: 'cm',
      min: quantity(0, inch),
      max: quantity(100, ft),
    },
    {
      kind: 'length',
      key: 'run',
      urlKey: 'n',
      default: quantity(12, inch),
      defaultUnit: 'in',
      metricDefaultUnit: 'cm',
      min: quantity(Rational.of(1, 16), inch),
      max: quantity(100, ft),
    },
    {
      kind: 'length',
      key: 'rafterRun',
      urlKey: 'rr',
      default: quantity(144, inch),
      defaultUnit: 'ft',
      metricDefaultUnit: 'm',
      min: quantity(0, inch),
      max: quantity(100, ft),
    },
    {
      kind: 'length',
      key: 'overhang',
      urlKey: 'oh',
      default: quantity(12, inch),
      defaultUnit: 'in',
      metricDefaultUnit: 'cm',
      min: quantity(0, inch),
      max: quantity(10, ft),
    },
    { kind: 'select', key: 'covering', urlKey: 'c', default: 'asphalt', options: COVERINGS },
  ],
  outputs: [
    {
      key: 'pitch',
      measure: 'length',
      role: 'primary',
      display: { unit: 'in', format: 'decimal', places: 2 },
    },
    {
      key: 'angle',
      measure: 'angle',
      role: 'secondary',
      display: { unit: 'deg', format: 'decimal', places: 2 },
    },
    {
      key: 'rafter',
      measure: 'length',
      role: 'secondary',
      display: { unit: 'ft', format: 'decimal', places: 2 },
    },
    {
      key: 'rafterM',
      measure: 'length',
      role: 'secondary',
      display: { unit: 'm', format: 'decimal', places: 2 },
    },
  ],
  warnings: ['belowMinimum', 'doubleUnderlayment'],
  compute: ({ rise, run, rafterRun, overhang, covering }) => {
    const slope = ratio(rise, run);
    const pitch = slope.mul(TWELVE);
    const rafter = scale(add(rafterRun, overhang), squareRoot(Rational.ONE.add(slope.mul(slope))));
    const minimum = MINIMUM[covering];
    const below = pitch.compare(minimum) === -1;
    const double = !below && DOUBLED.includes(covering) && pitch.compare(DOUBLE_BELOW) === -1;
    return {
      outputs: {
        pitch: quantity(pitch, inch),
        angle: quantity(arctangentDegrees(slope), deg),
        rafter,
        rafterM: rafter,
      },
      shopping: [],
      warnings: [
        ...(below
          ? [{ code: 'belowMinimum' as const, params: { minimum: minimum.toNumber() } }]
          : []),
        ...(double ? [{ code: 'doubleUnderlayment' as const, params: {} }] : []),
      ],
    };
  },
});

import { defineCalculator } from '../../calculator/define.ts';
import { CoreError } from '../../errors.ts';
import { ceilToPurchaseUnits } from '../../format/purchase.ts';
import { multiplyCount, usd } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { ft, ft2, gal, inch } from '../../units/catalog.ts';
import { add, multiply, ratio, scale, sign, sub } from '../../units/ops.ts';
import { isQuantityOf, quantity, type Quantity } from '../../units/quantity.ts';

const HUNDRED = Rational.of(100);

/** The area of one door left out of the walls: a standard 36 in by 80 in door, exactly 20 ft². */
const DOOR = quantity(20, ft2);

/** The area of one window left out of the walls: a 3 ft by 5 ft window, 15 ft². */
const WINDOW = quantity(15, ft2);

/** What the drywall covers, in the order the select offers them. */
const SURFACES = ['walls-ceiling', 'walls'] as const;

/** The panel sizes, 4 ft wide, in the order the select offers them. */
const SHEETS = ['4x8', '4x12'] as const;

type Sheet = (typeof SHEETS)[number];

/** A panel covers its face: 4 by 8 ft is 32 ft², 4 by 12 ft is 48 ft². */
const SHEET_AREA = {
  '4x8': quantity(32, ft2),
  '4x12': quantity(48, ft2),
} as const satisfies Record<Sheet, unknown>;

/** A pail of ready-mixed joint compound as sold, 4.5 gallons, and a roll of paper tape, 500 ft. */
const PAIL = quantity(Rational.of(9, 2), gal);
const ROLL = quantity(500, ft);

/**
 * The joint compound and the paper tape a finished area takes, per `per` of panels. Injected, so
 * core holds no material constant.
 */
export interface DrywallFinishing {
  readonly per: Quantity<'area'>;
  readonly compound: Quantity<'volume'>;
  readonly tape: Quantity<'length'>;
}

/** The reason is not one of `DEFINITION_REASONS`: the factory owns it. */
const finishingFailure = (): CoreError =>
  new CoreError('INVALID_DEFINITION', 'DRYWALL_FINISHING', {
    cause: { id: 'drywall', reason: 'DRYWALL_FINISHING' },
  });

/**
 * The factory owns this check, before `defineCalculator` runs: the rates are exactly the keys
 * `per`, `compound` and `tape`, an area, a volume and a length, each above zero, read once into a
 * frozen snapshot.
 */
const snapshotFinishing = (finishing: unknown): DrywallFinishing => {
  if (typeof finishing !== 'object' || finishing === null) throw finishingFailure();
  if (Object.keys(finishing).length !== 3) throw finishingFailure();
  const own = (key: string): unknown =>
    Object.hasOwn(finishing, key) ? Reflect.get(finishing, key) : undefined;
  const [per, compound, tape] = [own('per'), own('compound'), own('tape')];
  if (!isQuantityOf(per, 'area') || sign(per) !== 1) throw finishingFailure();
  if (!isQuantityOf(compound, 'volume') || sign(compound) !== 1) throw finishingFailure();
  if (!isQuantityOf(tape, 'length') || sign(tape) !== 1) throw finishingFailure();
  return Object.freeze({ per, compound, tape });
};

/**
 * The drywall calculator (calc-drywall): the walls of a rectangular room, less its doors and
 * windows, and its ceiling if chosen; the panels with an extra allowance, and the joint compound
 * and tape to finish the area. Exact arithmetic throughout; the purchase counts are the only
 * rounding.
 */
export const createDrywall = (suppliedFinishing: DrywallFinishing) => {
  const finishing = snapshotFinishing(suppliedFinishing);
  return defineCalculator({
    id: 'drywall',
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
      {
        kind: 'select',
        key: 'surfaces',
        urlKey: 'sf',
        default: 'walls-ceiling',
        options: SURFACES,
      },
      { kind: 'select', key: 'sheet', urlKey: 'sz', default: '4x8', options: SHEETS },
      {
        kind: 'percent',
        key: 'waste',
        urlKey: 'ws',
        default: Rational.of(10),
        min: Rational.ZERO,
        max: Rational.of(50),
      },
      { kind: 'money', key: 'sheetPrice', urlKey: 'sp', default: usd(0), max: usd(10000) },
    ],
    outputs: [
      {
        key: 'areaFt2',
        measure: 'area',
        role: 'primary',
        display: { unit: 'ft2', format: 'decimal', places: 2 },
      },
      {
        key: 'areaM2',
        measure: 'area',
        role: 'secondary',
        display: { unit: 'm2', format: 'decimal', places: 2 },
      },
      {
        key: 'compound',
        measure: 'volume',
        role: 'secondary',
        display: { unit: 'gal', format: 'decimal', places: 2 },
      },
      {
        key: 'tape',
        measure: 'length',
        role: 'secondary',
        display: { unit: 'ft', format: 'decimal', places: 2 },
      },
      { key: 'cost', measure: 'money', role: 'secondary' },
    ],
    compute: ({ length, width, height, doors, windows, surfaces, sheet, waste, sheetPrice }) => {
      const walls = scale(multiply(add(length, width), height), Rational.of(2));
      const openings = add(scale(DOOR, Rational.of(doors)), scale(WINDOW, Rational.of(windows)));
      const left = sub(walls, openings);
      // openings larger than the walls cover nothing, never a negative area
      const wallArea = sign(left) === 1 ? left : quantity(0, ft2);
      const area = surfaces === 'walls-ceiling' ? add(wallArea, multiply(length, width)) : wallArea;
      const share = ratio(area, finishing.per);
      const compound = scale(finishing.compound, share);
      const tape = scale(finishing.tape, share);
      // the extra is for the cut panels only; the finishing follows the area itself
      const panels = scale(area, Rational.ONE.add(waste.div(HUNDRED)));
      const sheets = ceilToPurchaseUnits(ratio(panels, SHEET_AREA[sheet]));
      return {
        outputs: {
          areaFt2: area,
          areaM2: area,
          compound,
          tape,
          cost: multiplyCount(sheetPrice, sheets),
        },
        shopping: [
          { materialId: 'drywall', purchaseUnit: `sheet-${sheet}`, qty: sheets },
          {
            materialId: 'joint-compound',
            purchaseUnit: 'pail',
            qty: ceilToPurchaseUnits(ratio(compound, PAIL)),
          },
          {
            materialId: 'joint-tape',
            purchaseUnit: 'roll',
            qty: ceilToPurchaseUnits(ratio(tape, ROLL)),
          },
        ],
        warnings: [],
      };
    },
  });
};

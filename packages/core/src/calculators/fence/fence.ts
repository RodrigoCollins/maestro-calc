import { defineCalculator } from '../../calculator/define.ts';
import type { LengthDescriptor } from '../../calculator/descriptors.ts';
import { countInput } from '../../calculator/kinds/count.ts';
import { lengthInput } from '../../calculator/kinds/length.ts';
import { moneyInput } from '../../calculator/kinds/money.ts';
import { selectInput } from '../../calculator/kinds/select.ts';
import { CoreError } from '../../errors.ts';
import { ceilToPurchaseUnits } from '../../format/purchase.ts';
import { circleArea } from '../../geometry/circle.ts';
import { multiplyCount, usd } from '../../money/money.ts';
import { Rational } from '../../rational/rational.ts';
import { inch } from '../../units/catalog.ts';
import { add, multiply, ratio, scale, sign, sub } from '../../units/ops.ts';
import { isQuantityOf, quantity, type Quantity } from '../../units/quantity.ts';
import type { BagYields } from '../concrete/concrete.ts';

/** The fence styles, in the order the select offers them. */
const STYLES = ['privacy', 'picket', 'rail'] as const;

/** The bag sizes in pounds, as the concrete calculator offers them. */
const BAG_SIZES = ['40', '60', '80'] as const;

type BagSize = (typeof BAG_SIZES)[number];

/** The hole is 3 times as wide as the post (Quikrete, Setting Posts project sheet). */
const HOLE_PER_POST = Rational.of(3);

/**
 * A third of the post's length goes into the ground (Quikrete, Setting Posts), so the buried part is
 * half the height above ground.
 */
const BURIED_PER_HEIGHT = Rational.of(1, 2);

/** The gravel under the post, for drainage: 6 in, plus the depth above (Quikrete, Setting Posts). */
const GRAVEL = quantity(6, inch);

const TWO = Rational.of(2);

/** The reason is not one of `DEFINITION_REASONS`: the factory owns it. */
const bagYieldsFailure = (): CoreError =>
  new CoreError('INVALID_DEFINITION', 'BAG_YIELDS', {
    cause: { id: 'fence', reason: 'BAG_YIELDS' },
  });

/**
 * The bag yields of the concrete calculator, checked as it checks them: exactly the keys `bag-40`,
 * `bag-60` and `bag-80`, each a volume above zero, read once into a frozen snapshot.
 */
const snapshotBagYields = (yields: unknown): BagYields => {
  if (typeof yields !== 'object' || yields === null) throw bagYieldsFailure();
  if (Object.keys(yields).length !== BAG_SIZES.length) throw bagYieldsFailure();
  const read = (size: BagSize): Quantity<'volume'> => {
    const unit = `bag-${size}`;
    const value: unknown = Object.hasOwn(yields, unit) ? Reflect.get(yields, unit) : undefined;
    if (!isQuantityOf(value, 'volume') || sign(value) !== 1) throw bagYieldsFailure();
    return value;
  };
  return Object.freeze({ 'bag-40': read('40'), 'bag-60': read('60'), 'bag-80': read('80') });
};

/** A length field: its default, its bounds (in inches) and the units a bare number is read in. */
const lengthField = <const K extends string, const U extends string>(
  key: K,
  urlKey: U,
  [standard, min, max]: readonly [Rational | number, Rational | number, Rational | number],
  [defaultUnit, metricDefaultUnit]: readonly ['in' | 'ft', 'cm' | 'm'],
): LengthDescriptor & { readonly key: K; readonly urlKey: U } =>
  lengthInput({
    key,
    urlKey,
    default: quantity(standard, inch),
    defaultUnit,
    metricDefaultUnit,
    min: quantity(min, inch),
    max: quantity(max, inch),
  });

const BIG = ['ft', 'm'] as const;
const SMALL = ['in', 'cm'] as const;

/** The boards of a run: none on a rail fence, else the length over what one board covers. */
const boardsOf = (
  style: (typeof STYLES)[number],
  length: Quantity<'length'>,
  boardWidth: Quantity<'length'>,
  gap: Quantity<'length'>,
  space: Quantity<'length'>,
): bigint => {
  if (style === 'rail') return 0n;
  // a picket and its gap repeat along the run; board-on-board, the boards of each layer stand
  // `space` apart and the other layer covers the spaces, so two boards repeat every width + space
  return style === 'picket'
    ? ceilToPurchaseUnits(ratio(length, add(boardWidth, gap)))
    : ceilToPurchaseUnits(ratio(scale(length, TWO), add(boardWidth, space)));
};

/**
 * The fence calculator (calc-fence): the posts, rails and boards of a straight run of fence, the
 * holes of its posts and the concrete bags that set them, and optional costs. The run is cut into
 * sections no longer than the post spacing, with a post at each end of each section and one more
 * per gate (the opening needs a post on both sides); each section takes `rails` rails. Each hole
 * is 3 times the post's width and as deep as half the height above ground plus 6 in of gravel,
 * and the concrete fills it above the gravel, around the post, up to the ground, as the treated
 * wood guide of Viance sets it. `yields` are the bag yields of the concrete calculator, supplied
 * by the composition root. Exact arithmetic throughout; the counts are the only rounding.
 */
export const createFence = (suppliedYields: BagYields) => {
  const yields = snapshotBagYields(suppliedYields);
  return defineCalculator({
    id: 'fence',
    inputs: [
      lengthField('length', 'l', [1200, 12, 60000], BIG),
      lengthField('height', 'h', [72, 12, 144], BIG),
      lengthField('spacing', 'sp', [96, 12, 144], BIG),
      selectInput({ key: 'style', urlKey: 's', default: 'privacy', options: STYLES }),
      lengthField('boardWidth', 'bw', [Rational.of(11, 2), 1, 12], SMALL),
      lengthField('gap', 'gp', [Rational.of(5, 2), 0, 12], SMALL),
      lengthField('boardSpace', 'bs', [4, 0, 12], SMALL),
      countInput({ key: 'rails', urlKey: 'r', default: 3, min: 1, max: 6 }),
      countInput({ key: 'gates', urlKey: 'g', default: 0, min: 0, max: 50 }),
      lengthField('postWidth', 'pw', [Rational.of(7, 2), 1, 12], SMALL),
      selectInput({ key: 'bag', urlKey: 'bg', default: '80', options: BAG_SIZES }),
      moneyInput({ key: 'postPrice', urlKey: 'pp', default: usd(0), max: usd(10000) }),
      moneyInput({ key: 'railPrice', urlKey: 'rp', default: usd(0), max: usd(10000) }),
      moneyInput({ key: 'boardPrice', urlKey: 'bp', default: usd(0), max: usd(10000) }),
      moneyInput({ key: 'bagPrice', urlKey: 'cp', default: usd(0), max: usd(10000) }),
    ],
    outputs: [
      { key: 'posts', measure: 'number', role: 'primary' },
      {
        key: 'postLength',
        measure: 'length',
        role: 'secondary',
        display: { unit: 'ft', format: 'fraction', denominator: 8 },
      },
      {
        key: 'holeDiameter',
        measure: 'length',
        role: 'secondary',
        display: { unit: 'in', format: 'fraction', denominator: 8 },
      },
      {
        key: 'holeDepth',
        measure: 'length',
        role: 'secondary',
        display: { unit: 'in', format: 'fraction', denominator: 8 },
      },
      {
        key: 'concreteFt3',
        measure: 'volume',
        role: 'secondary',
        display: { unit: 'ft3', format: 'decimal', places: 2 },
      },
      {
        key: 'gravelFt3',
        measure: 'volume',
        role: 'secondary',
        display: { unit: 'ft3', format: 'decimal', places: 2 },
      },
      { key: 'postCost', measure: 'money', role: 'secondary' },
      { key: 'railCost', measure: 'money', role: 'secondary' },
      { key: 'boardCost', measure: 'money', role: 'secondary' },
      { key: 'bagCost', measure: 'money', role: 'secondary' },
    ],
    compute: (inputs) => {
      const { length, height, spacing, style, rails, gates, postWidth, bag } = inputs;
      const sections = ceilToPurchaseUnits(ratio(length, spacing));
      const posts = sections + 1n + BigInt(gates);
      const railCount = sections * BigInt(rails);
      const boards = boardsOf(style, length, inputs.boardWidth, inputs.gap, inputs.boardSpace);
      const buried = scale(height, BURIED_PER_HEIGHT);
      const diameter = scale(postWidth, HOLE_PER_POST);
      const hole = circleArea(scale(diameter, Rational.ONE.div(TWO)));
      const perPost = Rational.of(posts);
      // the concrete fills the hole above the gravel, less the post that stands in it
      const concrete = scale(multiply(sub(hole, multiply(postWidth, postWidth)), buried), perPost);
      const gravel = scale(multiply(hole, GRAVEL), perPost);
      const unit = `bag-${bag}` as const;
      const bags = ceilToPurchaseUnits(ratio(concrete, yields[unit]));
      return {
        outputs: {
          posts: perPost,
          postLength: add(height, buried),
          holeDiameter: diameter,
          holeDepth: add(buried, GRAVEL),
          concreteFt3: concrete,
          gravelFt3: gravel,
          postCost: multiplyCount(inputs.postPrice, posts),
          railCost: multiplyCount(inputs.railPrice, railCount),
          boardCost: multiplyCount(inputs.boardPrice, boards),
          bagCost: multiplyCount(inputs.bagPrice, bags),
        },
        shopping: [
          { materialId: 'fence-post', purchaseUnit: 'post', qty: posts },
          { materialId: 'fence-rail', purchaseUnit: 'rail', qty: railCount },
          { materialId: 'fence-board', purchaseUnit: 'board', qty: boards },
          { materialId: 'concrete-mix', purchaseUnit: unit, qty: bags },
        ],
        warnings: [],
      };
    },
  });
};

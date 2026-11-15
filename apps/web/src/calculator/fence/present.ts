import { ft3, inch, isQuantityOf, valueIn, type Quantity } from '@maestro-calc/core';
import { CONCRETE_MIX_YIELDS } from '@maestro-calc/data/yields/concrete-mix';
import type { fence } from '../../lib/fence.ts';
import type { Moment, Ready } from '../page-module.ts';
import { DASH, dimensionText, groupedInteger, volumeText } from '../present.ts';

/*
 * The text of the short answer and the four shopping lines of the fence page: the fence
 * calculator's own outputs on top of the language-free number text of `present.ts`.
 */

/** A length in inches, the unit of the plan's ratio. */
export const inches = (length: Quantity<'length'>): number => valueIn(length, inch).toNumber();

type Fills = Readonly<Record<string, string>>;

/** The quantities of the engine's lines, in its order: posts, rails, boards, bags. */
const quantitiesOf = ({ result }: Ready<typeof fence>): readonly string[] =>
  result.shopping.map(({ qty }) => groupedInteger(qty));

/**
 * The placeholder values of the answer templates (one per style): the length, the height and the
 * spacing as the language-free text of the answer, the posts as the primary sentence the slot hands
 * over, the rails, the boards and the bags.
 */
export const answerValues = (moment: Ready<typeof fence>, primary: string): Fills => {
  const { valid, system } = moment;
  const [, rails = '', boards = '', bags = ''] = quantitiesOf(moment);
  return {
    length: dimensionText(valid.length, system),
    height: dimensionText(valid.height, system),
    spacing: dimensionText(valid.spacing, system),
    posts: primary,
    rails,
    boards,
    bags,
  };
};

/** A length of the state as the line names it, or the dash while the form holds no result. */
const lengthFill = (moment: Moment<typeof fence>, length: Quantity<'length'>): Fills => ({
  length: moment.result === undefined ? DASH : dimensionText(length, moment.system),
});

/** The post line: the length of post the height takes (the height and its buried half). */
export const postFills = (moment: Moment<typeof fence>): Fills => {
  const output = moment.result?.outputs.find(({ key }) => key === 'postLength')?.value;
  return isQuantityOf(output, 'length') ? lengthFill(moment, output) : { length: DASH };
};

/** The rail line: a rail spans one section, the post spacing. */
export const railFills = (moment: Moment<typeof fence>): Fills =>
  lengthFill(moment, moment.valid.spacing);

/** The board line: a board or a picket is as long as the fence is high. */
export const boardFills = (moment: Moment<typeof fence>): Fills =>
  lengthFill(moment, moment.valid.height);

/** The bag line's note: the cubic feet one 80 lb bag yields, two places, or a dash without a result. */
export const bagFills = (moment: Moment<typeof fence>): Fills => ({
  yield: moment.result === undefined ? DASH : volumeText(CONCRETE_MIX_YIELDS['bag-80'], ft3),
});

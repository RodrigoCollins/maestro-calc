import type { UnitSystem } from '@maestro-calc/core';
import type { topsoil } from '@maestro-calc/core/calculators/topsoil';
import type { Frame, Ready } from '../page-module.ts';
import { dimensionText } from '../present.ts';
import { ANSWER, noteBelow, rectangleShape, type Plan, type SideTexts } from '../slots/drawing.ts';
import { inches } from './present.ts';

/*
 * The plan of the topsoil page: the bed or patch as the square footage page draws a rectangle, with the depth
 * as a note under it. Pure and language-free: the sides are the texts of the answer, the note is a
 * page message, and the name is the answer sentence.
 */

/** The viewBox of the drawing, the same in every state. */
export const FRAME: Frame = { width: 300, height: 200 };

/** The page messages the plan names: the depth note. */
export const MESSAGES: readonly string[] = ['drawing.note'];

const SYSTEMS: readonly UnitSystem[] = ['imperial', 'metric'];

/** The plan of a ready moment; the bag size changes the count, not the plan. */
export const planOf = (moment: Ready<typeof topsoil>): Plan => {
  const { valid, system } = moment;
  const sides = (each: UnitSystem): SideTexts => ({
    length: dimensionText(valid.length, each),
    width: dimensionText(valid.width, each),
  });
  // the layout keeps room for the texts of the other system, so the toggle moves nothing
  const all = [sides(system), ...SYSTEMS.filter((each) => each !== system).map(sides)] as const;
  const shape = rectangleShape(FRAME, inches(valid.length), inches(valid.width), all);
  return {
    name: ANSWER,
    outline: shape.outline,
    lines: shape.lines,
    labels: [
      ...shape.labels,
      noteBelow(FRAME, shape.box, {
        message: 'drawing.note',
        fills: { depth: dimensionText(valid.depth, system) },
      }),
    ],
  };
};

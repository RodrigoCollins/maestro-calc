import type { UnitSystem } from '@maestro-calc/core';
import type { boardFeet } from '@maestro-calc/core/calculators/board-feet';
import type { Frame, Ready } from '../page-module.ts';
import { dimensionText } from '../present.ts';
import { ANSWER, noteBelow, rectangleShape, type Plan, type SideTexts } from '../slots/drawing.ts';
import { crossText, inches } from './present.ts';

/*
 * The plan of the board feet page: the face of one board, its length by its width, as the square
 * footage page draws a rectangle, with the thickness as a note under it. Pure and language-free:
 * the sides are the texts of the answer, the note is a page message, and the name is the answer.
 */

/** The viewBox of the drawing, the same in every state. */
export const FRAME: Frame = { width: 300, height: 200 };

/** The page messages the plan names: the thickness note. */
export const MESSAGES: readonly string[] = ['drawing.note'];

const SYSTEMS: readonly UnitSystem[] = ['imperial', 'metric'];

/** The plan of a ready moment; the pieces and the price change the figures, not the plan. */
export const planOf = (moment: Ready<typeof boardFeet>): Plan => {
  const { valid, system } = moment;
  const sides = (each: UnitSystem): SideTexts => ({
    length: dimensionText(valid.length, each),
    width: crossText(valid.width, each),
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
        fills: { thickness: crossText(valid.thickness, system) },
      }),
    ],
  };
};

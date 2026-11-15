import type { UnitSystem } from '@maestro-calc/core';
import type { fence } from '../../lib/fence.ts';
import type { Frame, Ready } from '../page-module.ts';
import { dimensionText } from '../present.ts';
import { ANSWER, noteBelow, rectangleShape, type Plan, type SideTexts } from '../slots/drawing.ts';
import { inches } from './present.ts';

/*
 * The plan of the fence page: the face of the run, its length by its height, as the square footage
 * page draws a rectangle, with the post spacing as a note under it. Pure and language-free: the
 * sides are the texts of the answer, the note is a page message, and the name is the answer.
 */

/** The viewBox of the drawing, the same in every state. */
export const FRAME: Frame = { width: 300, height: 200 };

/** The page messages the plan names: the post spacing note. */
export const MESSAGES: readonly string[] = ['drawing.note'];

const SYSTEMS: readonly UnitSystem[] = ['imperial', 'metric'];

/** The plan of a ready moment; the style, the gates and the prices change the figures, not the plan. */
export const planOf = (moment: Ready<typeof fence>): Plan => {
  const { valid, system } = moment;
  const sides = (each: UnitSystem): SideTexts => ({
    length: dimensionText(valid.length, each),
    width: dimensionText(valid.height, each),
  });
  // the layout keeps room for the texts of the other system, so the toggle moves nothing
  const all = [sides(system), ...SYSTEMS.filter((each) => each !== system).map(sides)] as const;
  const shape = rectangleShape(FRAME, inches(valid.length), inches(valid.height), all);
  return {
    name: ANSWER,
    outline: shape.outline,
    lines: shape.lines,
    labels: [
      ...shape.labels,
      noteBelow(FRAME, shape.box, {
        message: 'drawing.note',
        fills: { spacing: dimensionText(valid.spacing, system) },
      }),
    ],
  };
};

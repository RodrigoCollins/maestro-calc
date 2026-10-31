import type { UnitSystem } from '@maestro-calc/core';
import type { roofPitch } from '@maestro-calc/core/calculators/roof-pitch';
import type { Frame, Ready } from '../page-module.ts';
import { dimensionText } from '../present.ts';
import { ANSWER, noteAbove, type Plan, type StairTexts } from '../slots/drawing.ts';
import { slopeShape } from '../slots/slope.ts';
import { inches, pitchFigure } from './present.ts';

/*
 * The plan of the roof pitch page: the slope in side view, the run under it and the rise on its
 * right, with the pitch in 12 as a note above. Pure and language-free: the sides are the texts of
 * the answer, the note is the page's pitch message, and the name is the answer sentence.
 */

/** The viewBox of the drawing, the same in every state. */
export const FRAME: Frame = { width: 300, height: 200 };

/** The page messages the plan names: the pitch figure. */
export const MESSAGES: readonly string[] = ['pitch'];

const SYSTEMS: readonly UnitSystem[] = ['imperial', 'metric'];

/** The plan of a ready moment, or `null` for a flat roof (a zero rise has no slope to draw). */
export const planOf = (moment: Ready<typeof roofPitch>): Plan | null => {
  const { valid, system } = moment;
  const rise = inches(valid.rise);
  if (rise === 0) return null;
  const sides = (each: UnitSystem): StairTexts => ({
    rise: dimensionText(valid.rise, each),
    run: dimensionText(valid.run, each),
  });
  // the layout keeps room for the texts of the other system, so the toggle moves nothing
  const all = [sides(system), ...SYSTEMS.filter((each) => each !== system).map(sides)] as const;
  const shape = slopeShape(FRAME, { run: inches(valid.run), rise }, all);
  return {
    name: ANSWER,
    outline: shape.outline,
    lines: shape.lines,
    labels: [
      ...shape.labels,
      noteAbove(FRAME, shape.box, {
        message: 'pitch',
        fills: { value: pitchFigure(moment) },
      }),
    ],
  };
};

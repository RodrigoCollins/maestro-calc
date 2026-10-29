import { inch, valueIn, type UnitSystem } from '@maestro-calc/core';
import type { concrete } from '../../lib/concrete.ts';
import type { Frame, Ready } from '../page-module.ts';
import { dimensionText } from '../present.ts';
import {
  circleShape,
  markLabel,
  noteBelow,
  rectangleShape,
  type Box,
  type Plan,
  type Shape,
  type SideTexts,
} from '../slots/drawing.ts';
import { SHAPES } from './shapes.ts';

/*
 * The plans of the concrete page (blueprint-drawing › [BD4]-[BD8]), selected by the shape of the
 * last valid state. Pure and language-free: dimensions are the texts of the answer, the count mark
 * `× n` is a symbol, and the words (the name and the note of each shape) are page messages the
 * controller fills from these texts.
 */

/** The viewBox of the drawing, the same in every state. */
export const FRAME: Frame = { width: 300, height: 200 };

/** The page messages the plans name: the accessible name and the note of each shape. */
export const MESSAGES: readonly string[] = SHAPES.flatMap((shape) => [
  `drawing.${shape}`,
  `drawing.${shape}.note`,
]);

/** A column is drawn at one size: its diameter is a label, not a scale. */
const RADIUS = 60;

type Moment = Ready<typeof concrete>;
type Valid = Moment['valid'];

const SYSTEMS: readonly UnitSystem[] = ['imperial', 'metric'];
const inches = (length: Valid['length']): number => valueIn(length, inch).toNumber();

/** The side texts of a rectangle plan, the active unit system first, so a toggle moves nothing. */
const sidesOf = (
  moment: Moment,
  sides: (valid: Valid, system: UnitSystem) => SideTexts,
): readonly [SideTexts, ...SideTexts[]] => [
  sides(moment.valid, moment.system),
  ...SYSTEMS.filter((each) => each !== moment.system).map((each) => sides(moment.valid, each)),
];

/** The count mark `× n` of `n` pieces, none for one. */
const countMarks = (box: Box, count: number) =>
  count > 1 ? [markLabel(box, `× ${String(count)}`)] : [];

/** A shape's plan: its outline and lines, its labels, its note under it and any count mark. */
const planWith = (
  shape: Shape,
  name: Plan['name'],
  note: Plan['name'],
  marks: Plan['labels'] = [],
): Plan => ({
  name,
  outline: shape.outline,
  lines: shape.lines,
  labels: [...shape.labels, noteBelow(shape.box, note), ...marks],
});

const slab = (moment: Moment): Plan => {
  const { valid, system } = moment;
  const all = sidesOf(moment, (state, each) => ({
    length: dimensionText(state.length, each),
    width: dimensionText(state.width, each),
  }));
  const thickness = dimensionText(valid.thickness, system);
  // the slab's volume does not use the count, so the plan does not mark it
  return planWith(
    rectangleShape(FRAME, inches(valid.length), inches(valid.width), all),
    { message: 'drawing.slab', fills: { ...all[0], thickness } },
    { message: 'drawing.slab.note', fills: { thickness } },
  );
};

const footing = (moment: Moment): Plan => {
  const { valid, system } = moment;
  const all = sidesOf(moment, (state, each) => ({
    length: dimensionText(state.length, each),
    width: dimensionText(state.footingWidth, each),
  }));
  const depth = dimensionText(valid.footingDepth, system);
  const shape = rectangleShape(FRAME, inches(valid.length), inches(valid.footingWidth), all);
  return planWith(
    shape,
    { message: 'drawing.footing', fills: { ...all[0], depth, count: String(valid.count) } },
    { message: 'drawing.footing.note', fills: { depth } },
    countMarks(shape.box, valid.count),
  );
};

const column = (moment: Moment): Plan => {
  const { valid, system } = moment;
  const diameter = dimensionText(valid.diameter, system);
  const height = dimensionText(valid.height, system);
  const shape = circleShape(FRAME, RADIUS, { text: diameter });
  // the count sits in the lower half of the circle's inscribed square, under the diameter
  const half = RADIUS / Math.SQRT2;
  const lower: Box = {
    x: shape.box.x + RADIUS - half,
    y: shape.box.y + RADIUS,
    w: 2 * half,
    h: half,
  };
  return planWith(
    shape,
    { message: 'drawing.column', fills: { diameter, height, count: String(valid.count) } },
    { message: 'drawing.column.note', fills: { height } },
    countMarks(lower, valid.count),
  );
};

/** The plan of a ready moment, by the shape of its valid state; `null` for one not drawn yet. */
export const planOf = (moment: Moment): Plan | null => {
  switch (moment.valid.shape) {
    case 'slab':
      return slab(moment);
    case 'footing':
      return footing(moment);
    case 'column':
      return column(moment);
    default:
      return null;
  }
};

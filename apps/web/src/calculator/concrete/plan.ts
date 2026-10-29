import { inch, valueIn, type UnitSystem } from '@maestro-calc/core';
import type { concrete } from '../../lib/concrete.ts';
import type { Frame, Ready } from '../page-module.ts';
import { dimensionText } from '../present.ts';
import {
  ANSWER,
  circleShape,
  markLabel,
  noteAbove,
  noteBelow,
  rectangleShape,
  stairShape,
  type Box,
  type Label,
  type Plan,
  type Shape,
  type SideTexts,
  type StairTexts,
} from '../slots/drawing.ts';
import { SHAPES } from './shapes.ts';

/*
 * The plans of the concrete page (blueprint-drawing › [BD4]-[BD8]), selected by the shape of the
 * last valid state. Pure and language-free: dimensions are the texts of the answer, the count mark
 * `× n` is a symbol, the note of each shape is a page message the controller fills, and the name is
 * the answer sentence, which names the shape and its dimensions already (no second template).
 */

/** The viewBox of the drawing, the same in every state. */
export const FRAME: Frame = { width: 300, height: 200 };

/** The page messages the plans name: the note of each shape (the answer sentence is the name). */
export const MESSAGES: readonly string[] = SHAPES.map((shape) => `drawing.${shape}.note`);

/** A column is drawn at one size: its diameter is a label, not a scale. */
const RADIUS = 60;

type Moment = Ready<typeof concrete>;
type Valid = Moment['valid'];

const SYSTEMS: readonly UnitSystem[] = ['imperial', 'metric'];
const inches = (length: Valid['length']): number => valueIn(length, inch).toNumber();

/** Texts in every unit system, the active one first: the layout keeps room for all, so a toggle moves nothing. */
const inSystems = <T>(moment: Moment, texts: (system: UnitSystem) => T): readonly [T, ...T[]] => [
  texts(moment.system),
  ...SYSTEMS.filter((each) => each !== moment.system).map(texts),
];

/** The count mark `× n` of `n` pieces, none for one. */
const countMarks = (box: Box, count: number) =>
  count > 1 ? [markLabel(box, `× ${String(count)}`)] : [];

/** A shape's plan: its outline and lines, its labels, its note under it and any count mark. */
const planWith = (shape: Shape, note: Label, marks: Plan['labels'] = []): Plan => ({
  name: ANSWER,
  outline: shape.outline,
  lines: shape.lines,
  labels: [...shape.labels, noteBelow(FRAME, shape.box, note), ...marks],
});

const slab = (moment: Moment): Plan => {
  const { valid, system } = moment;
  const all = inSystems<SideTexts>(moment, (each) => ({
    length: dimensionText(valid.length, each),
    width: dimensionText(valid.width, each),
  }));
  const thickness = dimensionText(valid.thickness, system);
  // the slab's volume does not use the count, so the plan does not mark it
  return planWith(rectangleShape(FRAME, inches(valid.length), inches(valid.width), all), {
    message: 'drawing.slab.note',
    fills: { thickness },
  });
};

const footing = (moment: Moment): Plan => {
  const { valid, system } = moment;
  const all = inSystems<SideTexts>(moment, (each) => ({
    length: dimensionText(valid.length, each),
    width: dimensionText(valid.footingWidth, each),
  }));
  const depth = dimensionText(valid.footingDepth, system);
  const shape = rectangleShape(FRAME, inches(valid.length), inches(valid.footingWidth), all);
  return planWith(
    shape,
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
    { message: 'drawing.column.note', fills: { height } },
    countMarks(lower, valid.count),
  );
};

const steps = (moment: Moment): Plan | null => {
  const { valid } = moment;
  if (valid.stepCount === 0) return null;
  const all = inSystems<StairTexts>(moment, (each) => ({
    rise: dimensionText(valid.rise, each),
    run: dimensionText(valid.run, each),
  }));
  const shape = stairShape(
    FRAME,
    { run: inches(valid.run), rise: inches(valid.rise), count: valid.stepCount },
    all,
  );
  const count = String(valid.stepCount);
  return {
    name: ANSWER,
    outline: shape.outline,
    lines: shape.lines,
    labels: [
      ...shape.labels,
      noteAbove(FRAME, shape.box, { message: 'drawing.steps.note', fills: { count } }),
    ],
  };
};

/** The plan of a ready moment, by the shape of its valid state; `null` for a stair of no steps. */
export const planOf = (moment: Moment): Plan | null => {
  switch (moment.valid.shape) {
    case 'slab':
      return slab(moment);
    case 'footing':
      return footing(moment);
    case 'column':
      return column(moment);
    default:
      return steps(moment);
  }
};

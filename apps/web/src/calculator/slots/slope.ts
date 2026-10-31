import type { Frame } from '../page-module.ts';
import {
  dimensionLine,
  fitLabel,
  fitRectangle,
  LABEL,
  LINE,
  longest,
  MARGIN,
  NOTE,
  num,
  OFFSET,
  PAD,
  round,
  textWidth,
  type Gutters,
  type Shape,
  type StairTexts,
} from './drawing.ts';

/*
 * The roof slope of the drawing slot, in a module of its own: `drawing.ts` is one chunk shared by
 * every page that draws, so a shape only one page draws lives beside it and ships with that page.
 */

/**
 * A roof slope in side view, rising to the right: a right triangle with the run along the bottom and
 * the rise up the right side, clamped like a rectangle of `run` by `rise` (so its ratio is the
 * slope's). The run is measured under it and the rise on its right; the top row is left for a note.
 * `all` holds the texts of every unit system, the active one first.
 */
export const slopeShape = (
  frame: Frame,
  { run, rise }: { readonly run: number; readonly rise: number },
  all: readonly [StairTexts, ...StairTexts[]],
): Shape => {
  const [texts] = all;
  const room = (key: keyof StairTexts) => longest(all.map((each) => each[key]));
  const gutters: Gutters = {
    top: round(PAD + LINE * NOTE),
    right: round(OFFSET + PAD + textWidth(room('rise'), LABEL)),
    bottom: round(OFFSET + PAD + LINE * LABEL),
    left: MARGIN,
  };
  const box = fitRectangle(frame, gutters, run, rise);
  const [x2, ground] = [round(box.x + box.w), round(box.y + box.h)];
  const foot = { x: x2, y: ground };
  const runLine = dimensionLine({ x: box.x, y: ground }, foot, 'bottom', { text: texts.run });
  const riseLine = dimensionLine(foot, { x: x2, y: box.y }, 'right', { text: texts.rise });
  return {
    box,
    outline: [
      {
        kind: 'path',
        d: `M${num(box.x)} ${num(ground)}L${num(x2)} ${num(ground)}L${num(x2)} ${num(box.y)}Z`,
      },
    ],
    lines: [...runLine.lines, ...riseLine.lines],
    labels: [
      ...runLine.labels.map((label) => fitLabel(label, frame, room('run'))),
      ...riseLine.labels,
    ],
  };
};

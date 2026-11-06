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
 * The stair profile of the drawing slot, in a module of its own like `slope.ts`: only the concrete
 * page draws it (steps), so it ships with that page and not in the chunk every page that draws shares.
 */

/**
 * A stair in side view, rising to the right: `count` treads, each `run` long and `rise` tall, the
 * whole profile clamped like a rectangle of `count · run` by `count · rise` (so its ratio is the
 * step's). The rise is measured on the left of the first riser and the run under the first tread;
 * the top row is left for a note. `all` holds the texts of every unit system, the active one first.
 */
export const stairShape = (
  frame: Frame,
  { run, rise, count }: { readonly run: number; readonly rise: number; readonly count: number },
  all: readonly [StairTexts, ...StairTexts[]],
): Shape => {
  const [texts] = all;
  const room = (key: keyof StairTexts) => longest(all.map((each) => each[key]));
  const gutters: Gutters = {
    top: round(PAD + LINE * NOTE),
    right: MARGIN,
    bottom: round(OFFSET + PAD + LINE * LABEL),
    left: round(OFFSET + PAD + textWidth(room('rise'), LABEL)),
  };
  const box = fitRectangle(frame, gutters, count * run, count * rise);
  const [tread, riser] = [box.w / count, box.h / count];
  const ground = box.y + box.h;
  // each corner once, so a riser is vertical whatever the rounding of its two treads
  const across = (k: number): string => num(box.x + k * tread);
  const steps = Array.from({ length: count }, (_, k) => {
    const y = num(ground - (k + 1) * riser);
    return `L${across(k)} ${y}L${across(k + 1)} ${y}`;
  });
  const first = { x: box.x, y: round(ground - riser) };
  const runEnd = { x: round(box.x + tread), y: ground };
  const riseLine = dimensionLine({ x: box.x, y: ground }, first, 'left', { text: texts.rise });
  const runLine = dimensionLine({ x: box.x, y: ground }, runEnd, 'bottom', { text: texts.run });
  return {
    box,
    outline: [
      {
        kind: 'path',
        d: `M${num(box.x)} ${num(ground)}${steps.join('')}L${across(count)} ${num(ground)}Z`,
      },
    ],
    lines: [...riseLine.lines, ...runLine.lines],
    labels: [
      ...riseLine.labels,
      ...runLine.labels.map((label) => fitLabel(label, frame, room('run'))),
    ],
  };
};

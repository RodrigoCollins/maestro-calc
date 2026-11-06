import type { Frame } from '../page-module.ts';
import { LABEL, LINE, NOTE, PAD, round, segment, tick, type Label, type Shape } from './drawing.ts';

/*
 * The circle of the drawing slot, in a module of its own like `slope.ts`: only the concrete page
 * draws it (a column), so it ships with that page and not in the chunk every page that draws shares.
 */

/**
 * A circle of radius `r` centred across the frame and above the note row, with one horizontal
 * diameter line through its centre (orange ticks at both ends) and its label above the line. The
 * box is the circle's square, so a note goes under the circle.
 */
export const circleShape = (frame: Frame, r: number, label: Label): Shape => {
  const cx = round(frame.width / 2);
  const cy = round((frame.height - PAD - LINE * NOTE) / 2);
  const [from, to] = [
    { x: cx - r, y: cy },
    { x: cx + r, y: cy },
  ];
  return {
    box: { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r },
    outline: [{ kind: 'circle', cx, cy, r }],
    lines: [
      { d: segment(from, to), tone: 'helper' },
      { d: `${tick(from)}${tick(to)}`, tone: 'tick' },
    ],
    labels: [
      {
        x: cx,
        y: round(cy - PAD - (LINE * LABEL) / 2),
        anchor: 'middle',
        size: LABEL,
        tone: 'dimension',
        label,
      },
    ],
  };
};

import type { Frame } from '../page-module.ts';
import { CHAR } from './label-metrics.ts';

/*
 * The geometry of the drawing slot (blueprint-drawing): pure numbers in one fixed viewBox, with no
 * DOM and no words. A page's `plan.ts` builds a `Plan` from these helpers; the controller resolves
 * its labels to text and the writer of `client/draw.ts` turns it into SVG nodes. The layout is
 * labels first: the gutters hold the estimated label widths, then the outline fills what is left.
 */

/** A label: language-free text (`10 ft`), or a page message filled by the controller. */
export type Label =
  | { readonly text: string }
  | { readonly message: string; readonly fills: Readonly<Record<string, string>> };

/**
 * A text of the drawing, centred on `y`: a dimension label (17 units, white) or a note (15 units,
 * the helper colour). The writer takes the colour from the tone, never from the size.
 */
export interface PlanLabel {
  readonly x: number;
  readonly y: number;
  readonly anchor: 'start' | 'middle' | 'end';
  readonly size: 15 | 17;
  readonly tone: 'dimension' | 'note';
  readonly label: Label;
}

export type Outline =
  | {
      readonly kind: 'rect';
      readonly x: number;
      readonly y: number;
      readonly w: number;
      readonly h: number;
    }
  | { readonly kind: 'circle'; readonly cx: number; readonly cy: number; readonly r: number }
  | { readonly kind: 'path'; readonly d: string };

/** One path of strokes: the dimension line, its dashed extensions, or its orange ticks. */
export interface PlanLine {
  readonly d: string;
  readonly tone: 'helper' | 'extension' | 'tick';
}

/**
 * The name of a plan that is the page's answer sentence, which already names the shape and its
 * dimensions: the page then carries no second template for the drawing (a page with an answer).
 */
export const ANSWER = { answer: true } as const;

/** What a page draws for one moment: its accessible name, the outline, the lines and the labels. */
export interface Plan {
  readonly name: Label | typeof ANSWER;
  readonly outline: readonly Outline[];
  readonly lines: readonly PlanLine[];
  readonly labels: readonly PlanLabel[];
}

/** A label the controller has resolved: its text in the page's language. */
export type ResolvedLabel = Omit<PlanLabel, 'label'> & { readonly text: string };

/** What the writer draws: the plan of a moment with every label resolved, and the frame it fills. */
export interface ResolvedPlan extends Omit<Plan, 'name' | 'labels'> {
  readonly frame: Frame;
  readonly name: string;
  readonly labels: readonly ResolvedLabel[];
}

export interface Point {
  readonly x: number;
  readonly y: number;
}
export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Gutters = Readonly<Record<Side, number>>;
export interface Box {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/** The largest aspect ratio drawn, either way: 100 ft by 1 ft is drawn 4 to 1, its labels true. */
export const CLAMP = 4;
/**
 * The height of a label box, in sizes: the ascent and descent of Barlow Condensed, which Chromium
 * measures at 1.24 sizes (`getBBox`, 21.1 at 17), centred on the label's `y`.
 */
export const LINE = 1.25;
/** From the outline to its dimension line. */
export const OFFSET = 14;
/** From a dimension line to its label, and from the outline to the bottom row. */
export const PAD = 6;
/** How far an extension line passes its dimension line, and the half length of a tick. */
const EXTEND = 4;
const TICK = 5;
export const LABEL = 17;
export const NOTE = 15;
/** The right margin of a rectangle plan. */
export const MARGIN = 6;
/** A text goes inside a box when it leaves this much room across and the box is this tall. */
export const INSET = 12;
export const INSIDE_HEIGHT = 29;

/** `n` rounded to a tenth, the precision of every coordinate. */
export const round = (n: number): number => Math.round(n * 10) / 10;
export const num = (n: number): string => String(round(n));

/** The estimated width of `text` at `size`: `chars × size × CHAR`. */
export const textWidth = (text: string, size: number): number => round(text.length * size * CHAR);

/** The ratio drawn for `length` by `width`, in [1/4, 4]; a zero side is the extreme, two make a square. */
export const clampedRatio = (length: number, width: number): number => {
  if (length >= width)
    return width === 0 ? (length === 0 ? 1 : CLAMP) : Math.min(length / width, CLAMP);
  return 1 / clampedRatio(width, length);
};

/** The largest rectangle at the clamped ratio inside the frame less its gutters, centred there. */
export const fitRectangle = (
  frame: Frame,
  gutters: Gutters,
  length: number,
  width: number,
): Box => {
  const across = frame.width - gutters.left - gutters.right;
  const down = frame.height - gutters.top - gutters.bottom;
  const ratio = clampedRatio(length, width);
  const w = Math.min(across, down * ratio);
  const h = w / ratio;
  return {
    x: round(gutters.left + (across - w) / 2),
    y: round(gutters.top + (down - h) / 2),
    w: round(w),
    h: round(h),
  };
};

/** A straight path from `from` to `to`. */
export const segment = (from: Point, to: Point): string =>
  `M${num(from.x)} ${num(from.y)}L${num(to.x)} ${num(to.y)}`;

/** A 45° tick through `at`, from lower left to upper right. */
export const tick = (at: Point): string =>
  segment({ x: at.x - TICK, y: at.y + TICK }, { x: at.x + TICK, y: at.y - TICK });

/**
 * The dimension of the edge from `a` to `b`, drawn on `side` of it: the line 14 units out, the two
 * dashed extensions from the edge to 4 units past the line, two orange ticks and the label 6 units
 * beyond the line (centred above or below, ending before or starting after).
 */
export const dimensionLine = (
  a: Point,
  b: Point,
  side: Side,
  label: Label,
): Pick<Plan, 'lines' | 'labels'> => {
  const sign = side === 'top' || side === 'left' ? -1 : 1;
  const across = side === 'top' || side === 'bottom';
  const out = (point: Point, by: number): Point =>
    across ? { x: point.x, y: point.y + sign * by } : { x: point.x + sign * by, y: point.y };
  const [from, to] = [out(a, OFFSET), out(b, OFFSET)];
  const middle = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
  const at = across
    ? { x: middle.x, y: middle.y + sign * (PAD + (LINE * LABEL) / 2) }
    : { x: middle.x + sign * PAD, y: middle.y };
  const anchor = across ? 'middle' : side === 'left' ? 'end' : 'start';
  return {
    lines: [
      { d: segment(from, to), tone: 'helper' },
      {
        d: `${segment(a, out(a, OFFSET + EXTEND))}${segment(b, out(b, OFFSET + EXTEND))}`,
        tone: 'extension',
      },
      { d: `${tick(from)}${tick(to)}`, tone: 'tick' },
    ],
    labels: [{ x: round(at.x), y: round(at.y), anchor, size: LABEL, tone: 'dimension', label }],
  };
};

/** The estimated box of a label: a message, whose text the controller fills later, counts as empty. */
export const labelBox = ({ x, y, anchor, size, label }: PlanLabel): Box => {
  const w = 'text' in label ? textWidth(label.text, size) : 0;
  const start = anchor === 'start' ? x : anchor === 'end' ? x - w : x - w / 2;
  return { x: round(start), y: round(y - (LINE * size) / 2), w, h: round(LINE * size) };
};

/**
 * A centred label moved across, if it must, so that its estimated box stays inside the frame.
 * `room` is the text whose width it keeps (the longest the label takes in any unit system), so
 * the label sits at the same `x` whichever of them it shows.
 */
export const fitLabel = (label: PlanLabel, frame: Frame, room?: string): PlanLabel => {
  const { w } = labelBox(room === undefined ? label : { ...label, label: { text: room } });
  return { ...label, x: round(Math.min(Math.max(label.x, w / 2), frame.width - w / 2)) };
};

/** The longest of some texts (the first of equals). */
export const longest = (texts: readonly string[]): string =>
  texts.reduce((a, b) => (b.length > a.length ? b : a), '');

/** The gutters of a rectangle plan: the top label row, the bottom row, a margin and the width label. */
export const rectangleGutters = (widthText: string): Gutters => ({
  top: round(OFFSET + PAD + LINE * LABEL),
  right: MARGIN,
  bottom: round(PAD + LINE * LABEL),
  left: round(OFFSET + PAD + textWidth(widthText, LABEL)),
});

/** The two side texts of a rectangle plan in one unit system. */
export interface SideTexts {
  readonly length: string;
  readonly width: string;
}

/** A drawn shape: its box, its outline, its dimension lines and their labels. */
export interface Shape extends Pick<Plan, 'outline' | 'lines' | 'labels'> {
  readonly box: Box;
}

/**
 * A rectangle in plan with its two dimensions: the length along the top, the width on the left (a
 * deliberate departure from the mockup's right-hand line, which keeps the reading order length
 * then width). `all` holds the side texts of every unit system, the active one first; the layout
 * keeps room for the longest of each, so a unit toggle moves nothing.
 */
export const rectangleShape = (
  frame: Frame,
  length: number,
  width: number,
  all: readonly [SideTexts, ...SideTexts[]],
): Shape => {
  const [texts] = all;
  const room = (key: keyof SideTexts) => longest(all.map((each) => each[key]));
  const box = fitRectangle(frame, rectangleGutters(room('width')), length, width);
  const [x2, y2] = [box.x + box.w, box.y + box.h];
  const top = dimensionLine({ x: box.x, y: box.y }, { x: x2, y: box.y }, 'top', {
    text: texts.length,
  });
  const left = dimensionLine({ x: box.x, y: box.y }, { x: box.x, y: y2 }, 'left', {
    text: texts.width,
  });
  return {
    box,
    outline: [{ kind: 'rect', ...box }],
    lines: [...top.lines, ...left.lines],
    labels: [...top.labels.map((label) => fitLabel(label, frame, room('length'))), ...left.labels],
  };
};

/** The two texts of a rise over a run (a stair profile, a roof slope) in one unit system. */
export interface StairTexts {
  readonly rise: string;
  readonly run: string;
}

/**
 * A note in words in the row above a box, centred on the frame: its text is filled later and differs
 * by language and unit system, and centred there any text up to the frame's width fits, so a toggle
 * never moves it. The step count of a stair profile.
 */
export const noteAbove = (frame: Frame, box: Box, label: Label): PlanLabel => ({
  x: round(frame.width / 2),
  y: round(box.y - PAD - (LINE * NOTE) / 2),
  anchor: 'middle',
  size: NOTE,
  tone: 'note',
  label,
});

/** A note in words in the row under a box, centred on the frame like `noteAbove`: a thickness, depth or height. */
export const noteBelow = (frame: Frame, box: Box, label: Label): PlanLabel => ({
  x: round(frame.width / 2),
  y: round(box.y + box.h + PAD + (LINE * NOTE) / 2),
  anchor: 'middle',
  size: NOTE,
  tone: 'note',
  label,
});

export { CHAR };

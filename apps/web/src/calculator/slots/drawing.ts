import type { Frame } from '../page-module.ts';

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

/** What a page draws for one moment: its accessible name, the outline, the lines and the labels. */
export interface Plan {
  readonly name: Label;
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
 * The estimated width of a character, in sizes: wide enough for the widest common fallback the
 * font stack can reach before or without Barlow Condensed (DejaVu Sans Bold, whose widest label,
 * `<0.01 cm`, averages 0.661 sizes), so the labels never meet in any of them. Barlow Condensed 600
 * itself stays under 0.42.
 */
export const CHAR = 0.67;
/**
 * The height of a label box, in sizes: the ascent and descent of Barlow Condensed, which Chromium
 * measures at 1.24 sizes (`getBBox`, 21.1 at 17), centred on the label's `y`.
 */
const LINE = 1.25;
/** From the outline to its dimension line. */
const OFFSET = 14;
/** From a dimension line to its label, and from the outline to the bottom row. */
const PAD = 6;
/** How far an extension line passes its dimension line, and the half length of a tick. */
const EXTEND = 4;
const TICK = 5;
const LABEL = 17;
const NOTE = 15;
/** The right margin of a rectangle plan. */
const MARGIN = 6;
/** The area goes inside when it leaves this much room across and the rectangle is this tall. */
const INSET = 12;
const INSIDE_HEIGHT = 29;

/** `n` rounded to a tenth, the precision of every coordinate. */
const round = (n: number): number => Math.round(n * 10) / 10;
const num = (n: number): string => String(round(n));

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

const segment = (from: Point, to: Point): string =>
  `M${num(from.x)} ${num(from.y)}L${num(to.x)} ${num(to.y)}`;

/** A 45° tick through `at`, from lower left to upper right. */
const tick = (at: Point): string =>
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
const longest = (texts: readonly string[]): string =>
  texts.reduce((a, b) => (b.length > a.length ? b : a), '');

/**
 * The area note of an outline box: centred inside when `room` (the longest text it takes, `text`
 * by default) leaves 6 units each side and the box is 29 tall, else centred in the row below it,
 * fitted to the frame. Shared by every plan that writes an area under or in its shape.
 */
export const areaLabel = (frame: Frame, box: Box, text: string, room: string = text): PlanLabel => {
  const inside = textWidth(room, NOTE) <= box.w - INSET && box.h >= INSIDE_HEIGHT;
  const label: PlanLabel = {
    x: round(box.x + box.w / 2),
    y: round(inside ? box.y + box.h / 2 : box.y + box.h + PAD + (LINE * NOTE) / 2),
    anchor: 'middle',
    size: NOTE,
    tone: 'note',
    label: { text },
  };
  return fitLabel(label, frame, room);
};

/** The gutters of a rectangle plan: the top label row, the bottom row, a margin and the width label. */
export const rectangleGutters = (widthText: string): Gutters => ({
  top: round(OFFSET + PAD + LINE * LABEL),
  right: MARGIN,
  bottom: round(PAD + LINE * LABEL),
  left: round(OFFSET + PAD + textWidth(widthText, LABEL)),
});

/** The three texts of a rectangle plan in one unit system. */
export interface RectangleTexts {
  readonly length: string;
  readonly width: string;
  readonly area: string;
}

/** What a rectangle plan is drawn from: the two sides (any unit, only their ratio counts) and the texts. */
export interface RectangleSpec {
  readonly length: number;
  readonly width: number;
  readonly texts: RectangleTexts;
  /**
   * The texts of the same moment in the other unit systems. The layout keeps room for the longest
   * of each (the left gutter, the area inside or below, the fitted `x`), so a toggle moves nothing.
   */
  readonly others?: readonly RectangleTexts[];
  readonly name: Label;
}

/**
 * A rectangle in plan: the length along the top, the width on the left (a deliberate departure from
 * the mockup's right-hand line, which keeps the reading order length then width), and the area
 * inside when it fits with 6 units each side and the rectangle is 29 tall, else in the bottom row.
 */
export const rectanglePlan = (frame: Frame, spec: RectangleSpec): Plan => {
  const { texts } = spec;
  const all = [texts, ...(spec.others ?? [])];
  const room = (key: keyof RectangleTexts) => longest(all.map((each) => each[key]));
  const rect = fitRectangle(frame, rectangleGutters(room('width')), spec.length, spec.width);
  const [x2, y2] = [rect.x + rect.w, rect.y + rect.h];
  const top = dimensionLine({ x: rect.x, y: rect.y }, { x: x2, y: rect.y }, 'top', {
    text: texts.length,
  });
  const left = dimensionLine({ x: rect.x, y: rect.y }, { x: rect.x, y: y2 }, 'left', {
    text: texts.width,
  });
  return {
    name: spec.name,
    outline: [{ kind: 'rect', ...rect }],
    lines: [...top.lines, ...left.lines],
    labels: [
      ...top.labels.map((label) => fitLabel(label, frame, room('length'))),
      ...left.labels,
      areaLabel(frame, rect, texts.area, room('area')),
    ],
  };
};

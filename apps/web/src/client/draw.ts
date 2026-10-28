import type { Frame } from '../calculator/page-module.ts';
import type { PlanLine, ResolvedPlan } from '../calculator/slots/drawing.ts';

/*
 * The SVG writer of the drawing slot (blueprint-drawing). Only the entry of a page that declares
 * the slot imports it and hands it to the mount as its `draw` hook, so no other page ships it.
 * `nodesOf` is pure and unit-tested; `draw` applies its list to the server box with
 * `createElementNS` in the box's own namespace, `setAttribute` and `textContent`: no HTML string,
 * no namespace literal, no style. The colours are SVG presentation attributes.
 */

/** The swatches of `docs/design/direction.md` the drawing uses, on Blueprint ink. */
export const COLOURS = { white: '#FFFFFF', orange: '#F06A1D', helper: '#B9C6DA' } as const;

/** The pitch of the blueprint grid, in viewBox units. */
const GRID = 16;

/** One SVG element: its tag, its attributes and its text. */
export interface SvgNode {
  readonly tag: string;
  readonly attrs: Readonly<Record<string, string>>;
  readonly text?: string;
}

/** The inner lines of the grid over the frame, as one path: verticals, then horizontals. */
export const gridOf = ({ width, height }: Frame): string => {
  const at = (size: number) =>
    Array.from({ length: Math.ceil(size / GRID) - 1 }, (_, index) => String(GRID * (index + 1)));
  return [
    ...at(width).map((x) => `M${x} 0V${String(height)}`),
    ...at(height).map((y) => `M0 ${y}H${String(width)}`),
  ].join('');
};

const SHAPE = {
  fill: COLOURS.white,
  'fill-opacity': '0.08',
  stroke: COLOURS.white,
  'stroke-width': '2',
};

const STROKES: Readonly<Record<PlanLine['tone'], Readonly<Record<string, string>>>> = {
  helper: { stroke: COLOURS.helper, 'stroke-width': '1.2' },
  extension: { stroke: COLOURS.helper, 'stroke-width': '1', 'stroke-dasharray': '2 3' },
  tick: { stroke: COLOURS.orange, 'stroke-width': '2' },
};

/** The nodes of a plan, in paint order: the grid, the outline, the lines, the labels. */
export const nodesOf = (plan: ResolvedPlan): readonly SvgNode[] => [
  {
    tag: 'path',
    attrs: {
      d: gridOf(plan.frame),
      fill: 'none',
      stroke: COLOURS.white,
      'stroke-opacity': '0.07',
      'stroke-width': '1',
    },
  },
  ...plan.outline.map((shape): SvgNode => {
    switch (shape.kind) {
      case 'rect':
        return {
          tag: 'rect',
          attrs: {
            x: String(shape.x),
            y: String(shape.y),
            width: String(shape.w),
            height: String(shape.h),
            ...SHAPE,
          },
        };
      case 'circle':
        return {
          tag: 'circle',
          attrs: { cx: String(shape.cx), cy: String(shape.cy), r: String(shape.r), ...SHAPE },
        };
      case 'path':
        return { tag: 'path', attrs: { d: shape.d, ...SHAPE } };
    }
  }),
  ...plan.lines.map(({ d, tone }): SvgNode => ({
    tag: 'path',
    attrs: { d, fill: 'none', ...STROKES[tone] },
  })),
  ...plan.labels.map(({ x, y, anchor, size, text }): SvgNode => ({
    tag: 'text',
    attrs: {
      x: String(x),
      y: String(y),
      'text-anchor': anchor,
      'dominant-baseline': 'central',
      'font-size': String(size),
      fill: size === 17 ? COLOURS.white : COLOURS.helper,
    },
    text,
  })),
];

/** The writer the mount calls with each box and the plan of each valid state. */
export type Draw = (box: Element, plan: ResolvedPlan | null) => void;

/** The last plan drawn in each box, so a render that changes nothing leaves the DOM alone. */
const drawn = new WeakMap<Element, string>();

/**
 * Draws `plan` in `box`, replacing what it held, and names it (`role="img"`, `aria-label`); a
 * `null` plan empties the box and hides it from assistive technology again. The size of the box is
 * the server's: nothing here sets one.
 */
export const draw: Draw = (box, plan) => {
  const key = JSON.stringify(plan);
  if (drawn.get(box) === key) return;
  drawn.set(box, key);
  if (plan === null) {
    box.replaceChildren();
    box.removeAttribute('role');
    box.removeAttribute('aria-label');
    box.setAttribute('aria-hidden', 'true');
    return;
  }
  box.replaceChildren(
    ...nodesOf(plan).map(({ tag, attrs, text }) => {
      const node = box.ownerDocument.createElementNS(box.namespaceURI, tag);
      for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
      if (text !== undefined) node.textContent = text;
      return node;
    }),
  );
  box.setAttribute('role', 'img');
  if (box.getAttribute('aria-label') !== plan.name) box.setAttribute('aria-label', plan.name);
  box.removeAttribute('aria-hidden');
};

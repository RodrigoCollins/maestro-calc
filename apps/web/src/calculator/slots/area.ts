import type { Frame } from '../page-module.ts';
import {
  fitLabel,
  INSET,
  INSIDE_HEIGHT,
  LINE,
  longest,
  NOTE,
  PAD,
  rectangleShape,
  round,
  textWidth,
  type Box,
  type Label,
  type Plan,
  type PlanLabel,
  type SideTexts,
} from './drawing.ts';

/*
 * The area note and the rectangle plan of the drawing slot, in a module of their own like
 * `slope.ts`: only the square footage page draws them, so they ship with that page and not in the
 * chunk every page that draws shares.
 */

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

/** The three texts of a rectangle plan in one unit system. */
export interface RectangleTexts extends SideTexts {
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

/** A rectangle in plan with the area inside when it fits with 6 units each side and is 29 tall, else in the bottom row. */
export const rectanglePlan = (frame: Frame, spec: RectangleSpec): Plan => {
  const all = [spec.texts, ...(spec.others ?? [])] as const;
  const shape = rectangleShape(frame, spec.length, spec.width, all);
  const area = longest(all.map((each) => each.area));
  return {
    name: spec.name,
    outline: shape.outline,
    lines: shape.lines,
    labels: [...shape.labels, areaLabel(frame, shape.box, spec.texts.area, area)],
  };
};

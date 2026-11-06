import {
  INSET,
  INSIDE_HEIGHT,
  LABEL,
  LINE,
  round,
  textWidth,
  type Box,
  type PlanLabel,
} from './drawing.ts';

/*
 * The count mark of the drawing slot, in a module of its own like `slope.ts`: only the concrete
 * page writes it (footings and columns), so it ships with that page and not in the chunk every page
 * that draws shares.
 */

/**
 * A language-free mark (the count `× 3`) centred in a box when it leaves 6 units each side and the
 * box is 29 tall, else at the start of the top row of the frame, where no plan writes.
 */
export const markLabel = (box: Box, text: string): PlanLabel => {
  const inside = textWidth(text, LABEL) <= box.w - INSET && box.h >= INSIDE_HEIGHT;
  return {
    x: inside ? round(box.x + box.w / 2) : 0,
    y: inside ? round(box.y + box.h / 2) : round((LINE * LABEL) / 2),
    anchor: inside ? 'middle' : 'start',
    size: LABEL,
    tone: 'dimension',
    label: { text },
  };
};

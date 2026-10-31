import type { Quantity } from '@maestro-calc/core';
import { inch, valueIn } from '@maestro-calc/core';
import { feetInches } from '@maestro-calc/core/calculators/feet-inches';
import { required } from '../controller.ts';
import type { Frame, Ready } from '../page-module.ts';
import { dimensionText, outputText } from '../present.ts';
import {
  ANSWER,
  LABEL,
  LINE,
  MARGIN,
  num,
  PAD,
  round,
  type Plan,
  type PlanLabel,
} from '../slots/drawing.ts';

/*
 * The plan of the feet and inches page: the lengths as bars to scale, as tape measurements laid
 * side by side. A sum or a difference draws both lengths and the result; a product or a quotient
 * draws the length and the result, the longer of the two split into its parts. Each bar carries its
 * text above it, as the answer writes it, so the plan is language-free and names no message.
 */

/** The viewBox of the drawing, the same in every state. */
export const FRAME: Frame = { width: 300, height: 200 };

/** The page messages the plan names: none, every label is a length. */
export const MESSAGES: readonly string[] = [];

type Moment = Ready<typeof feetInches>;

/** The height of a bar, the room between rows, and the most parts a bar is split into. */
const BAR = 16;
const GAP = 12;
const MOST_PARTS = 16;
/** A row: its label, 6 to the bar, then the bar. */
const ROW = LINE * LABEL + PAD + BAR;

interface Row {
  readonly length: Quantity<'length'>;
  readonly text: string;
  /** How many equal parts the bar shows (1: none). */
  readonly parts: number;
}

/** The result as the large figure writes it in the moment's unit system. */
const resultText = ({ result, system }: Moment): string => {
  const key = system === 'metric' ? 'resultM' : 'result';
  const output = required(
    feetInches.outputs.find((each) => each.key === key),
    key,
  );
  const figure = outputText(
    output,
    required(
      result.outputs.find((each) => each.key === key),
      key,
    ).value,
  );
  // the metric figure is a bare decimal (its row names the unit); the imperial one carries its units
  return system === 'metric' ? `${figure} m` : figure;
};

const rowsOf = (moment: Moment): readonly Row[] => {
  const { valid, result, system } = moment;
  const outcome = required(
    result.outputs.find((each) => each.key === 'result'),
    'result',
  ).value;
  const first = { length: valid.first, text: dimensionText(valid.first, system) };
  const last = { length: outcome, text: resultText(moment) };
  const parts = valid.factor <= MOST_PARTS ? valid.factor : 1;
  switch (valid.operation) {
    case 'add':
    case 'subtract':
      return [
        { ...first, parts: 1 },
        { length: valid.second, text: dimensionText(valid.second, system), parts: 1 },
        { ...last, parts: 1 },
      ];
    case 'multiply':
      return [
        { ...first, parts: 1 },
        { ...last, parts },
      ];
    case 'divide':
      return [
        { ...first, parts },
        { ...last, parts: 1 },
      ];
  }
};

const inches = (length: Quantity<'length'>): number => valueIn(length, inch).toNumber();

/** The plan of a ready moment, or `null` when every length is zero (nothing to scale). */
export const planOf = (moment: Moment): Plan | null => {
  const rows = rowsOf(moment);
  const longest = Math.max(...rows.map(({ length }) => inches(length)));
  if (longest === 0) return null;
  const span = FRAME.width - 2 * MARGIN;
  const top = (FRAME.height - rows.length * ROW - (rows.length - 1) * GAP) / 2;
  const placed = rows.map((row, index) => {
    const y = top + index * (ROW + GAP);
    const w = (inches(row.length) / longest) * span;
    return { row, y, w, barY: round(y + LINE * LABEL + PAD) };
  });
  const splits = placed.flatMap(({ row, w, barY }) =>
    Array.from({ length: row.parts - 1 }, (_, k) => {
      const x = num(MARGIN + (w * (k + 1)) / row.parts);
      return `M${x} ${num(barY)}L${x} ${num(barY + BAR)}`;
    }),
  );
  return {
    name: ANSWER,
    outline: placed.map(({ w, barY }) => ({
      kind: 'rect',
      x: MARGIN,
      y: barY,
      w: round(w),
      h: BAR,
    })),
    lines: splits.length === 0 ? [] : [{ d: splits.join(''), tone: 'tick' }],
    labels: placed.map(({ row, y }): PlanLabel => ({
      x: MARGIN,
      y: round(y + (LINE * LABEL) / 2),
      anchor: 'start',
      size: LABEL,
      tone: 'dimension',
      label: { text: row.text },
    })),
  };
};

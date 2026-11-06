import type { Quantity } from '@maestro-calc/core';
import { inch, valueIn } from '@maestro-calc/core';
import { feetInches } from '@maestro-calc/core/calculators/feet-inches';
import { required } from '../controller.ts';
import type { Frame, Ready } from '../page-module.ts';
import { dimensionText, outputText } from '../present.ts';
import { numberOf } from './present.ts';
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
 * draws the length and the result, the longer of the two split into its parts; a fit draws the
 * length cut after each whole piece, the piece, and what is left. Each bar carries its text above it, as the answer writes it, so the plan is language-free and names no message.
 */

/** The viewBox of the drawing, the same in every state. */
export const FRAME: Frame = { width: 300, height: 200 };

/** The page messages the plan names: none, every label is a length. */
export const MESSAGES: readonly string[] = [];

type Moment = Ready<typeof feetInches>;

/** The height of a bar, the room between rows, and the most parts (or pieces) a bar is split into. */
const BAR = 16;
const GAP = 12;
const MOST_PARTS = 16;
/** A row: its label, 6 to the bar, then the bar. */
const ROW = LINE * LABEL + PAD + BAR;

interface Row {
  readonly length: Quantity<'length'>;
  readonly text: string;
  /** Where the bar is cut, as fractions of its length (none: an empty list). */
  readonly cuts: readonly number[];
}

/** The cuts of a bar split into `parts` equal parts (1: none). */
const equal = (parts: number): readonly number[] =>
  Array.from({ length: parts - 1 }, (_, k) => (k + 1) / parts);

const NO_CUT: readonly number[] = [];

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

const inches = (length: Quantity<'length'>): number => valueIn(length, inch).toNumber();

/**
 * The cuts of the first length of a fit: one after each whole piece, none at its very end (an
 * exact fit leaves nothing past the last piece), and none past `MOST_PARTS` pieces.
 */
const fitCuts = (moment: Moment, left: Quantity<'length'>): readonly number[] => {
  const count = Number(numberOf(moment, 'pieces').floor());
  if (count > MOST_PARTS) return NO_CUT;
  const step = inches(moment.valid.second) / inches(moment.valid.first);
  const cuts = Array.from({ length: count }, (_, k) => (k + 1) * step);
  return valueIn(left, inch).isZero() ? cuts.slice(0, -1) : cuts;
};

const rowsOf = (moment: Moment): readonly Row[] => {
  const { valid, result, system } = moment;
  const outcome = required(
    result.outputs.find((each) => each.key === 'result'),
    'result',
  ).value;
  const first = { length: valid.first, text: dimensionText(valid.first, system) };
  const second = { length: valid.second, text: dimensionText(valid.second, system), cuts: NO_CUT };
  const last = { length: outcome, text: resultText(moment) };
  const parts = equal(valid.factor <= MOST_PARTS ? valid.factor : 1);
  switch (valid.operation) {
    case 'add':
    case 'subtract':
      return [{ ...first, cuts: NO_CUT }, second, { ...last, cuts: NO_CUT }];
    case 'multiply':
      return [
        { ...first, cuts: NO_CUT },
        { ...last, cuts: parts },
      ];
    case 'divide':
      return [
        { ...first, cuts: parts },
        { ...last, cuts: NO_CUT },
      ];
    case 'fit':
      return [{ ...first, cuts: fitCuts(moment, outcome) }, second, { ...last, cuts: NO_CUT }];
  }
};

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
    row.cuts.map((cut) => {
      const x = num(MARGIN + w * cut);
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

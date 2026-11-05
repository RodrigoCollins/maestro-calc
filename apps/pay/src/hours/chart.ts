import { decimalHours } from '@maestro-calc/pay-core/decimal-hours';
import { decimalHoursText } from '../format.ts';

export interface ChartEntry {
  readonly minutes: number;
  /** The minutes in decimal hours, as the page writes them: `0.75`. */
  readonly decimal: string;
}

/** One minute in decimal hours, run through the converter at build time. */
const entryOf = (minutes: number): ChartEntry => {
  const ran = decimalHours.run({ hours: '0', minutes: String(minutes) });
  if (!ran.ok) throw new Error(`the chart minute ${String(minutes)} must run`);
  const [first] = ran.value.outputs;
  if (first?.key !== 'decimalHours') throw new Error('the converter must lead with decimal hours');
  return { minutes, decimal: decimalHoursText(first.value) };
};

/** Every minute from 0 to 59 in decimal hours. */
export const chartOf = (): ChartEntry[] =>
  Array.from({ length: 60 }, (_, minutes) => entryOf(minutes));

/** The chart as a table of 20 rows of three columns: 0 to 19, 20 to 39 and 40 to 59 minutes. */
export const CHART_ROWS: readonly (readonly ChartEntry[])[] = Array.from({ length: 20 }, (_, row) =>
  [row, row + 20, row + 40].map(entryOf),
);

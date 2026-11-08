import {
  countInput,
  decimalInput,
  moneyInput,
  percentInput,
  Rational,
  selectInput,
  usd,
} from '@maestro-calc/core';
import { LABOR_BASES } from './quote.ts';

/**
 * The labor fields every quote shares. The selector comes first and its driven fields follow it
 * (the page shows the hours and the crew for `hour`, the price per square foot for `area`). The
 * defaults are example numbers that make the first receipt readable; they are never a price.
 */
export const laborInputs = [
  selectInput({ key: 'laborBy', urlKey: 'lb', default: 'hour', options: LABOR_BASES }),
  decimalInput({
    key: 'hours',
    urlKey: 'hr',
    default: Rational.of(8),
    max: Rational.of(10_000),
  }),
  countInput({ key: 'crew', urlKey: 'cr', default: 1, min: 1, max: 100 }),
  moneyInput({ key: 'rate', urlKey: 'r', default: usd(25), max: usd(1000) }),
  moneyInput({ key: 'areaRate', urlKey: 'ar', default: usd(2), max: usd(1000) }),
] as const;

/** The overhead and the profit, as percent points; both start at the example values. */
export const markupInputs = [
  percentInput({
    key: 'overhead',
    urlKey: 'ov',
    default: Rational.of(10),
    min: Rational.ZERO,
    max: Rational.of(100),
  }),
  percentInput({
    key: 'profit',
    urlKey: 'pf',
    default: Rational.of(15),
    min: Rational.ZERO,
    max: Rational.of(100),
  }),
] as const;

/** The itemized total, first the one the receipt ends on. */
export const quoteOutputs = [
  { key: 'total', measure: 'money', role: 'primary' },
  { key: 'labor', measure: 'money', role: 'secondary' },
  { key: 'materials', measure: 'money', role: 'secondary' },
  { key: 'subtotal', measure: 'money', role: 'secondary' },
  { key: 'overhead', measure: 'money', role: 'secondary' },
  { key: 'profit', measure: 'money', role: 'secondary' },
] as const;

/**
 * What the labor line needs of the job besides the fields: the whole purchase units of its main
 * material (cans, sheets, bags) and its area in square feet.
 */
export const laborOutputs = [
  { key: 'units', measure: 'number', role: 'secondary' },
  {
    key: 'area',
    measure: 'area',
    role: 'secondary',
    display: { unit: 'ft2', format: 'decimal', places: 0 },
  },
] as const;

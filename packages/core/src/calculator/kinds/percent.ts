import { parseDecimal } from '../../rational/decimal.ts';
import type { Rational } from '../../rational/rational.ts';
import type { Result } from '../../result.ts';
import type { InputKind, PercentDescriptor } from '../descriptors.ts';
import {
  builderOf,
  parseText,
  rationalText,
  readUrlAmount,
  withinBounds,
  type ParseFailure,
} from './shared.ts';

/** Percent points as a decimal with one optional trailing `%` and no blank before it. */
const parsePercent = (text: string): Result<Rational, ParseFailure> =>
  parseDecimal(text.endsWith('%') ? text.slice(0, -1) : text);

/** Percent points, exact; the URL holds the canonical Rational of the points. */
const PERCENT: InputKind<PercentDescriptor> = {
  read: (input, raw) => {
    const percent = parseText(raw, parsePercent);
    return percent.ok ? withinBounds(input, percent.value, percent.value) : percent;
  },
  urlText: rationalText,
  fromUrl: readUrlAmount,
};

/** A percent input in percent points (12.5 percent is `25/2`); bounds default to `0..100`. */
export const percentInput = /* @__PURE__ */ builderOf<PercentDescriptor>('percent', PERCENT);

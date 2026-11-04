import { parseDecimal } from '../../rational/decimal.ts';
import type { DecimalDescriptor, InputKind } from '../descriptors.ts';
import { builderOf, parseText, rationalText, readUrlAmount, withinBounds } from './shared.ts';

/** A plain decimal, exact, with no unit and no `%`; the URL holds its canonical Rational. */
const DECIMAL: InputKind<DecimalDescriptor> = {
  read: (input, raw) => {
    const decimal = parseText(raw, parseDecimal);
    return decimal.ok ? withinBounds(input, decimal.value, decimal.value) : decimal;
  },
  urlText: rationalText,
  fromUrl: readUrlAmount,
};

/** A plain decimal input; the minimum defaults to 0 and there is no maximum unless declared. */
export const decimalInput = /* @__PURE__ */ builderOf<DecimalDescriptor>('decimal', DECIMAL);

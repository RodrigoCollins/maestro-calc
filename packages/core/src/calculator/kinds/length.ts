import { parseLength } from '../../format/length-parser/parser.ts';
import { ok } from '../../result.ts';
import { cm, ft, inch, m, mm, yd } from '../../units/catalog.ts';
import { isQuantityOf, quantity } from '../../units/quantity.ts';
import type { Unit } from '../../units/unit.ts';
import type { InputKind, LengthDescriptor } from '../descriptors.ts';
import { builderOf, parseText, readUrlAmount, withinBounds } from './shared.ts';

const LENGTH_UNITS: Readonly<
  Record<LengthDescriptor['defaultUnit' | 'metricDefaultUnit'], Unit<'length'>>
> = {
  in: inch,
  ft,
  yd,
  mm,
  cm,
  m,
};

/**
 * A length: a quantity as it is, or text in the length grammar, a bare number in the default unit
 * of the unit system. The URL holds canonical inches.
 */
const LENGTH: InputKind<LengthDescriptor> = {
  read: (input, raw, unitSystem) => {
    const unit =
      LENGTH_UNITS[unitSystem === 'metric' ? input.metricDefaultUnit : input.defaultUnit];
    const length = isQuantityOf(raw, 'length')
      ? ok(raw)
      : parseText(raw, (text) => parseLength(text, { defaultUnit: unit }));
    return length.ok ? withinBounds(input, length.value.canonical, length.value) : length;
  },
  urlText: (_input, value) =>
    isQuantityOf(value, 'length') ? value.canonical.toString() : undefined,
  fromUrl: (input, text) => {
    const amount = readUrlAmount(input, text);
    return amount === undefined ? undefined : quantity(amount, inch);
  },
};

/** A length input; `defaultUnit` applies to bare numbers in imperial, `metricDefaultUnit` in metric. */
export const lengthInput = /* @__PURE__ */ builderOf<LengthDescriptor>('length', LENGTH);

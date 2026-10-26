import {
  cm,
  formatFeetInches,
  inch,
  m,
  mm,
  quantity,
  Rational,
  toCents,
  toDecimalParts,
  usd,
  valueIn,
  type InputDescriptor,
  type LengthDescriptor,
  type Money,
  type Quantity,
  type Unit,
  type UnitSystem,
} from '@maestro-calc/core';

/*
 * The text of every number a calculator page shows. Pure and language-free: `,` groups thousands
 * and `.` marks decimals in both locales (no `Intl`), so the build-time render and the script write
 * the same strings. Words arrive as arguments (templates), never from a catalog.
 */

type Length = Quantity<'length'>;

/** What a figure shows while its field is invalid or the page has no result. */
export const DASH = '—';

/** The largest denominator of a feet-and-inches fraction (1/64 of an inch). */
const FRACTION_LIMIT = 64n;
/** `toDecimalParts` rounds to at most this many places. */
const MAX_PLACES = 12;

const METRIC_UNITS = { mm, cm, m } as const;

/** `1234567` as `1,234,567`. */
export const groupedInteger = (value: bigint): string =>
  String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** `value` rounded to `places` decimals (ties away from zero), with the integer part grouped on request. */
const decimalText = (value: Rational, places: number, grouped: boolean): string => {
  const { negative, integer, fraction } = toDecimalParts(value, places);
  const whole = grouped ? groupedInteger(integer) : String(integer);
  return `${negative ? '-' : ''}${whole}${places === 0 ? '' : `.${fraction}`}`;
};

/** A volume in `unit` with two decimal places, for display only: `370,370.37`. */
export const volumeText = (volume: Quantity<'volume'>, unit: Unit<'volume'>): string =>
  decimalText(valueIn(volume, unit), 2, true);

/** Dollars rounded to the cent for display only: `$481.00`, `-$5.00`. */
export const moneyText = (money: Money): string => {
  const { negative, integer, fraction } = toCents(money);
  return `${negative ? '-' : ''}$${groupedInteger(integer)}.${fraction}`;
};

/** A percent as its canonical decimal: `10`, `12.5` (two places at most, no trailing zeros). */
export const percentText = (percent: Rational): string =>
  decimalText(percent, 2, false).replace(/\.?0+$/, '');

/** Replaces each `{name}` of `template` that `values` holds; other placeholders stay. */
export const fillMessage = (template: string, values: Readonly<Record<string, string>>): string =>
  template.replace(/\{(\w+)\}/g, (placeholder, name: string) => values[name] ?? placeholder);

/** The decimal places of a fraction with this denominator, or `undefined` when it never terminates. */
const placesOf = (denominator: bigint): number | undefined => {
  let rest = denominator;
  let twos = 0;
  let fives = 0;
  while (rest % 2n === 0n) {
    rest /= 2n;
    twos += 1;
  }
  while (rest % 5n === 0n) {
    rest /= 5n;
    fives += 1;
  }
  const places = Math.max(twos, fives);
  return rest === 1n && places <= MAX_PLACES ? places : undefined;
};

/** `3 1/2`, `1/2` or `3`: whole inches with a reduced fraction. */
const inchesPart = (whole: bigint, numerator: bigint, denominator: bigint): string => {
  if (numerator === 0n) return String(whole);
  const fraction = `${String(numerator)}/${String(denominator)}`;
  return whole === 0n ? fraction : `${String(whole)} ${fraction}`;
};

interface UsStyle {
  /** Total inches even above a foot (`16 in`), as a field with an inch unit shows them. */
  readonly inchesOnly: boolean;
  /** Group the feet (`1,000 ft`) for text the reader does not type back. */
  readonly grouped: boolean;
}

/** A length as feet, inches and a fraction rounded to the nearest `1/denominator` of an inch. */
const usText = (length: Length, denominator: number, { inchesOnly, grouped }: UsStyle): string => {
  const { feet, inches, fraction } = formatFeetInches(length, { denominator }).parts;
  const rest = (whole: bigint) => inchesPart(whole, fraction.numerator, fraction.denominator);
  if (inchesOnly || feet === 0n) return `${rest(feet * 12n + inches)} in`;
  const feetText = `${grouped ? groupedInteger(feet) : String(feet)} ft`;
  return inches === 0n && fraction.numerator === 0n ? feetText : `${feetText} ${rest(inches)} in`;
};

/** The exact decimal of a length in `unit`, or `undefined` when it has none (or too many places). */
const exactMetricText = (
  length: Length,
  unit: Unit<'length'>,
  grouped: boolean,
): string | undefined => {
  const value = valueIn(length, unit);
  const places = placesOf(value.den);
  return places === undefined ? undefined : decimalText(value, places, grouped);
};

/** Below this a US length rounds to zero at 1/64 in. */
const TINY_US = '<1/64 in';
/** Below this a metric length rounds to `0.00 cm`. */
const TINY_METRIC = '<0.01 cm';
/** From here a metric length rounds to `1.00 m`: the unit is chosen from the rounded value. */
const METRE_FROM = Rational.of(995, 1000);

/**
 * A length inside a sentence, rounded for display: US as `12 ft`, `4 in`, `12 ft 6 in`,
 * `5 ft 3 1/2 in` (to 1/64 in); metric with two places, metres from 0.995 m (which rounds to
 * `1.00 m`), else centimetres. A nonzero length that rounds to nothing reads `<1/64 in` or
 * `<0.01 cm`, never a zero. Lengths are never negative here (the engine bounds them at zero).
 */
export const dimensionText = (length: Length, system: UnitSystem): string => {
  const zero = valueIn(length, inch).isZero();
  if (system === 'imperial') {
    const text = usText(length, 64, { inchesOnly: false, grouped: true });
    return text === '0 in' && !zero ? TINY_US : text;
  }
  const metres = valueIn(length, m);
  if (metres.compare(METRE_FROM) !== -1) return `${decimalText(metres, 2, true)} m`;
  const centimetres = decimalText(valueIn(length, cm), 2, true);
  return centimetres === '0.00' && !zero ? TINY_METRIC : `${centimetres} cm`;
};

/** What a length field needs to know about its descriptor to write its text. */
export type LengthUnits = Pick<LengthDescriptor, 'defaultUnit' | 'metricDefaultUnit'>;

/** The text of a length field or of its bound; only the bound groups thousands (`1,000 ft`). */
const lengthText = (
  length: Length,
  units: LengthUnits,
  system: UnitSystem,
  grouped: boolean,
): string => {
  const inches = valueIn(length, inch);
  if (system === 'metric') {
    const unit = METRIC_UNITS[units.metricDefaultUnit];
    const decimal = exactMetricText(length, unit, grouped);
    if (decimal !== undefined) return `${decimal} ${unit.id}`;
  } else if (inches.den <= FRACTION_LIMIT) {
    const inchesOnly = units.defaultUnit === 'in';
    if (inches.isZero()) return inchesOnly ? '0 in' : '0 ft';
    const denominator = inches.den < 2n ? 2 : Number(inches.den);
    return usText(length, denominator, { inchesOnly, grouped });
  }
  // no US fraction and no metric decimal: the exact inches, which is never a whole number here
  return `${String(inches.num)}/${String(inches.den)} in`;
};

/**
 * The text of a length field: exact, so that parsing it gives the same length back. US is feet and
 * inches with a fraction of denominator 64 at most when that is exact (`12 ft 6 in`; `16 in` in a
 * field whose unit is inches), else exact inches (`20000/127 in`). Metric is the exact decimal in
 * the field's metric unit (`3.6576 m`), else exact inches (`127/3 in`).
 */
export const fieldText = (length: Length, units: LengthUnits, system: UnitSystem): string =>
  lengthText(length, units, system, false);

/** A violated bound (`min` or `max`, a canonical Rational string) in the unit of its field. */
export const boundText = (field: InputDescriptor, bound: string, system: UnitSystem): string => {
  const parsed = Rational.fromString(bound);
  if (!parsed.ok) throw new TypeError(`not a bound: ${bound}`);
  const value = parsed.value;
  switch (field.kind) {
    case 'length':
      return lengthText(quantity(value, inch), field, system, true);
    case 'percent':
      return `${percentText(value)}%`;
    case 'count':
      return groupedInteger(value.num);
    case 'money':
      return moneyText(usd(value));
    default:
      throw new TypeError(`${field.kind} has no bounds`);
  }
};

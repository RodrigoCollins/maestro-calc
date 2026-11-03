import {
  formatFeetInches,
  gal,
  isQuantityOf,
  kg,
  lb,
  oz,
  Rational,
  toDecimalParts,
  valueIn,
  type Quantity,
  type Unit,
} from '@maestro-calc/core';

/** Thousands grouped with commas: `22023` is `22,023`. */
const grouped = (integer: bigint): string =>
  integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** An exact amount to `places` decimals, grouped: `133.4`, `55.6`, `1,211`. */
export const amountText = (value: Rational, places = 0): string => {
  const { negative, integer, fraction } = toDecimalParts(value, places);
  return `${negative ? '-' : ''}${grouped(integer)}${places > 0 ? `.${fraction}` : ''}`;
};

/** A volume in `unit` to `places` decimals, grouped: `22,023` gallons, `2,944.0` cubic feet. */
export const volumeText = (
  volume: Quantity<'volume'>,
  unit: Unit<'volume'>,
  places = 0,
): string => {
  const { negative, integer, fraction } = toDecimalParts(valueIn(volume, unit), places);
  return `${negative ? '-' : ''}${grouped(integer)}${places > 0 ? `.${fraction}` : ''}`;
};

/** A length as a field shows it, to the nearest 1/16 in: `32 ft`, `3 ft 6 in`, `9 1/2 in`. */
export const lengthFieldText = (length: Quantity<'length'>): string => {
  const { parts } = formatFeetInches(length, { denominator: 16 });
  const { numerator, denominator } = parts.fraction;
  const inches =
    numerator === 0n
      ? parts.inches === 0n
        ? ''
        : `${String(parts.inches)} in`
      : `${parts.inches === 0n ? '' : `${String(parts.inches)} `}${String(numerator)}/${String(denominator)} in`;
  const feet = parts.feet === 0n ? '' : `${String(parts.feet)} ft`;
  return [feet, inches].filter(Boolean).join(' ') || '0 ft';
};

const PER_GALLON = Rational.of(128);

/**
 * The text of an output of the dose calculators, in the unit the page names: pounds and
 * kilograms of salt, fluid ounces of liquid chlorine (1/128 gal), ounces of a granular product and
 * gallons a minute of pump flow.
 */
export const outputText = (key: string, value: unknown): string => {
  if (isQuantityOf(value, 'mass'))
    return amountText(valueIn(value, key === 'kilograms' ? kg : key === 'dry' ? oz : lb), 1);
  if (isQuantityOf(value, 'volume'))
    return amountText(
      key === 'liquid' ? valueIn(value, gal).mul(PER_GALLON) : valueIn(value, gal),
      1,
    );
  throw new Error(`no text for output ${key}`);
};

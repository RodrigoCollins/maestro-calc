import {
  formatFeetInches,
  toDecimalParts,
  valueIn,
  type Quantity,
  type Unit,
} from '@maestro-calc/core';

/** Thousands grouped with commas: `22023` is `22,023`. */
const grouped = (integer: bigint): string =>
  integer.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

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

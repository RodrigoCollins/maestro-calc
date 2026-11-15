import {
  formatFeetInches,
  gal,
  isQuantityOf,
  kg,
  lb,
  liter,
  m,
  oz,
  Rational,
  toDecimalParts,
  valueIn,
  type Quantity,
  type Unit,
} from '@maestro-calc/core';
import type { Units } from '@maestro-calc/pool-core/units';

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

/**
 * A length as a field shows it, to the nearest 1/16 in: `32 ft`, `3 ft 6 in`, `9 1/2 in`; in
 * metric to the centimetre, trailing zeros dropped: `10 m`, `2.5 m`, `1.07 m`.
 */
export const lengthFieldText = (length: Quantity<'length'>, system: Units = 'us'): string => {
  if (system === 'metric') {
    const metres = amountText(valueIn(length, m), 2).replaceAll(',', '');
    return `${metres.replace(/\.?0+$/, '')} m`;
  }
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

const MINUTES_PER_HOUR = Rational.of(60);

/** Hours as whole hours and the nearest minute, the hours grouped: `33 h 20 min`. */
export const durationText = (hours: Rational): string => {
  const { integer } = toDecimalParts(hours.mul(MINUTES_PER_HOUR), 0);
  return `${grouped(integer / 60n)} h ${String(integer % 60n)} min`;
};

const PER_GALLON = Rational.of(128);

/**
 * The text of an output of the dose calculators, in the unit the page names: pounds and
 * kilograms of salt, ounces of baking soda or stabilizer, fluid ounces of liquid chlorine or
 * muriatic acid (1/128 gal, every `liquid…` key), ounces of a granular product (every `dry…` key) and
 * gallons a minute of pump flow; a plain number is the fill time in hours and minutes, or a whole
 * figure (BTU, minutes).
 */
export const outputText = (
  key: string,
  value: unknown,
  system: Units = 'us',
  as?: string,
): string =>
  as === 'large'
    ? largeText(value, system)
    : system === 'metric'
      ? metricText(key, value)
      : usText(key, value);

/** The ppm a chlorine product brings with it (`cya`, `hardness`), to a tenth. */
const TENTHS = new Set(['cya', 'hardness']);

/**
 * A dose in the larger unit, the row under its large figure: pounds or kilograms of a granular
 * product to two places, gallons of a liquid to two places, or millilitres in metric, where the large
 * figure is already litres.
 */
const largeText = (value: unknown, system: Units): string => {
  if (isQuantityOf(value, 'mass'))
    return amountText(valueIn(value, system === 'metric' ? kg : lb), 2);
  if (isQuantityOf(value, 'volume'))
    return system === 'metric'
      ? amountText(valueIn(value, liter).mul(THOUSAND))
      : amountText(valueIn(value, gal), 2);
  throw new Error('no larger unit for a plain number');
};

const THOUSAND = Rational.of(1000);

/**
 * The same outputs in metric: kilograms (grams for the small `dry…` and `ounces` rows) and liquids
 * in litres to two places. The `kilograms` row of the salt page shows pounds instead, since the
 * large figure above it is already kilograms. Anything else is written as in the US.
 */
const metricText = (key: string, value: unknown): string => {
  if (isQuantityOf(value, 'mass')) {
    if (key === 'kilograms') return amountText(valueIn(value, lb), 1);
    return key.startsWith('dry') || key === 'ounces'
      ? amountText(valueIn(value, kg).mul(THOUSAND))
      : amountText(valueIn(value, kg), 1);
  }
  if (isQuantityOf(value, 'volume') && key.startsWith('liquid'))
    return amountText(valueIn(value, liter), 2);
  return usText(key, value);
};

const usText = (key: string, value: unknown): string => {
  if (isQuantityOf(value, 'mass'))
    return amountText(
      valueIn(
        value,
        key === 'kilograms' ? kg : key.startsWith('dry') || key === 'ounces' ? oz : lb,
      ),
      1,
    );
  if (isQuantityOf(value, 'volume'))
    return amountText(
      key.startsWith('liquid') ? valueIn(value, gal).mul(PER_GALLON) : valueIn(value, gal),
      1,
    );
  if (value instanceof Rational)
    return key === 'time' ? durationText(value) : amountText(value, TENTHS.has(key) ? 1 : 0);
  throw new Error(`no text for output ${key}`);
};

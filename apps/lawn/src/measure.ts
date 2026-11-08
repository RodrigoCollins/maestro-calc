import { parseDecimal, Rational } from '@maestro-calc/core';
import { amountText } from './format.ts';

/**
 * The area of a length and a width in feet, as the helper shows it (`1,200`, two decimals at
 * most); `0` while either one is empty or cannot be read.
 */
export const areaText = (length: string, width: string): string => {
  const a = parseDecimal(length.trim());
  const b = parseDecimal(width.trim());
  if (!a.ok || !b.ok) return '0';
  const area: Rational = a.value.mul(b.value);
  return area.sign() < 0 ? '0' : amountText(area, area.isInteger() ? 0 : 2);
};

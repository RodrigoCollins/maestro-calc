import { Rational } from '../rational/rational.ts';

// The patterns of calculator-contract › Pure, language-free compute: an identifier, a canonical
// Rational, or the currency code, and never whitespace or markup.
const IDENTIFIER = /^[a-z][A-Za-z0-9._-]*$/;

/** True when `text` parses as a Rational and prints back as the same text: `2/4` and `1/1` do not. */
export const isCanonicalRational = (text: string): boolean => {
  const parsed = Rational.fromString(text);
  return parsed.ok && parsed.value.toString() === text;
};

/**
 * True when a string of a calculator result may appear in it (CC25): an identifier, a canonical
 * Rational or `USD`, and never whitespace or markup. Test support shared by the fixture check
 * and the registry-wide check.
 */
export const isLanguageFree = (text: string): boolean =>
  (IDENTIFIER.test(text) || isCanonicalRational(text) || text === 'USD') && !/[\s<>]/.test(text);

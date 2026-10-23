import { collectStrings } from '@maestro-calc/core/testing/collect-strings';
import { isLanguageFree } from '@maestro-calc/core/testing/language-free';

/** What the check needs of a calculator: its id and a `run` that can be called with defaults. */
interface Runnable {
  readonly id: string;
  run(raw: Readonly<Record<string, unknown>>): { readonly ok: boolean };
}

/**
 * The strings of the result of `run({})` that a calculator may not return (calculator-contract ›
 * Language-free results): anything but an identifier, a canonical Rational or `USD`. An empty
 * result is reported too, because a check that saw no string proved nothing.
 */
export const languageFreeProblems = (calculator: Runnable): string[] => {
  const result = calculator.run({});
  if (!result.ok) return [`${calculator.id}: the defaults do not run`];
  const strings = collectStrings(result);
  if (strings.length === 0) {
    return [`${calculator.id}: the result holds no string, so the check proves nothing`];
  }
  return strings
    .filter((text) => !isLanguageFree(text))
    .map((text) => `${calculator.id}: "${text}" is not language-free`);
};

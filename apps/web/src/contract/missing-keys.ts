import { ALL_ERROR_CODES, messageKeysOf } from '@maestro-calc/core';
import type { MaterialRecord } from '@maestro-calc/data';
import { materialKeysOf } from './material-catalog.ts';

/** What the keys derive from: the id, inputs, outputs and warnings of a calculator. */
type KeySource = Parameters<typeof messageKeysOf>[0];

/**
 * Every message a page of `calculator` needs (i18n-catalog › Key naming convention): the keys
 * core derives from its descriptors, then one `errors.<CODE>` per user-facing error code.
 */
export const requiredKeys = (calculator: KeySource): string[] => [
  ...messageKeysOf(calculator),
  ...ALL_ERROR_CODES.map((code) => `errors.${code}`),
];

/** The required keys that `catalog` has no entry for, by name, in the order of `requiredKeys`. */
export const missingKeys = (
  calculator: KeySource,
  catalog: Readonly<Record<string, string>>,
): string[] => requiredKeys(calculator).filter((key) => !Object.hasOwn(catalog, key));

/**
 * The keys of `catalog` that `calculator` does not account for, by name: the required keys and the
 * material keys of the materials it buys (`bought`, from `materialsBoughtBy`); from the page slice
 * on, its `calc.<id>.page.*` keys too (i18n-catalog › Undeclared extra key fails).
 */
export const extraKeys = (
  calculator: KeySource,
  catalog: Readonly<Record<string, string>>,
  bought: readonly MaterialRecord[],
): string[] => {
  const allowed = new Set([...requiredKeys(calculator), ...bought.flatMap(materialKeysOf)]);
  return Object.keys(catalog).filter((key) => !allowed.has(key));
};

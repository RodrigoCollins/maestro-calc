import { ALL_ERROR_CODES, messageKeysOf } from '@maestro-calc/core';

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

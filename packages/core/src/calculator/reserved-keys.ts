/*
 * Lives in `calculator/` rather than `url/` so that `define.ts` never imports the codec (design
 * RD-1: the dependency points from `url/` to `calculator/`, never back). `url/` re-exports it.
 */

/** The URL key of the format version (`v=1`). */
export const VERSION_KEY = 'v';

/** The URL key of the unit-system preference (`u=m`). */
export const UNIT_KEY = 'u';

/** URL keys that belong to the codec: the format version and the unit-system preference. */
export const RESERVED_URL_KEYS: readonly string[] = Object.freeze([VERSION_KEY, UNIT_KEY]);

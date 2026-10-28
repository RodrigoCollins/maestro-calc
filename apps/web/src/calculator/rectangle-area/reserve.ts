import type { Reserve } from '../../lib/reserve.ts';

/**
 * The answer and notice line counts of the square footage page (calculator-page › [CP73], design
 * K6, K11), measured on the built page in Chromium, 320 to 1280 px in 1 px steps, both locales,
 * every answer sentence of the record's `layoutQueries` and the `—` state, the "not running" note
 * and both URL notices. Each breakpoint is where the tallest content loses a line, rounded up to
 * 0.5rem unless an e2e width lies in between (the notice step at 387 px, where 386 px is a width of
 * the concrete page). The values live here, outside the page module, so no client bundle carries them.
 */
export const rectangleAreaReserve = {
  answer: [3, [20.5, 2], [37.5, 1]],
  notice: [6, [24.1875, 5], [30.5, 4], [44.5, 3]],
} as const satisfies Reserve;

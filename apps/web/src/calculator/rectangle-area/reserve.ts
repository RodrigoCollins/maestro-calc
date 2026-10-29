import type { Reserve } from '../../lib/reserve.ts';

/**
 * The answer and notice line counts of the square footage page (calculator-page › [CP73], design
 * K6, K11), measured on the built page in Chromium, 320 to 1280 px in 1 px steps, both locales,
 * every answer sentence of the record's `layoutQueries` and the `—` state, the "not running" note
 * and both URL notices, with the web font and with the fallback font (the taller counts). Each
 * breakpoint is where the tallest content loses a line, rounded up to 0.5rem. The values live here, outside the page module, so no client bundle carries them.
 */
export const rectangleAreaReserve = {
  answer: [2, [30, 1]],
  notice: [4, [21.5, 3], [29.5, 2], [55, 1], [64, 2]],
} as const satisfies Reserve;

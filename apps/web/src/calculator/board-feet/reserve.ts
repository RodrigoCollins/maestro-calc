import type { Reserve } from '../../lib/reserve.ts';

/**
 * The answer line counts of the board feet page (calculator-page › [CP73], design K6, K11), measured
 * on the built page in Chromium, 320 to 1280 px in 1 px steps, both locales, every answer sentence
 * of the record's `layoutQueries`, with the web font and with the fallback font (the taller counts).
 * Each breakpoint is where the tallest sentence loses a line, rounded up to 0.5rem. The notice keeps
 * the shared ladder. The values live here, outside the page module, so no client bundle carries them.
 */
export const boardFeetReserve = {
  answer: [4, [21, 3], [30.5, 2], [57, 1]],
} as const satisfies Reserve;

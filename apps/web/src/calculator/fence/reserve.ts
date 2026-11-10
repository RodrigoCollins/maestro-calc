import type { Reserve } from '../../lib/reserve.ts';

/**
 * The answer line counts of the fence page (calculator-page › [CP73], design K6, K11), measured on
 * the built page in Chromium, 320 to 1280 px, both locales, every answer sentence of the record's
 * `layoutQueries`, with the web font and with the fallback font (the taller counts): 4 lines up to
 * 420 px, 3 up to 581 px, then 2. Each breakpoint is where the tallest sentence
 * loses a line, rounded up to 0.5rem. The notice keeps the shared ladder. The values live here,
 * outside the page module, so no client bundle carries them.
 */
export const fenceReserve = {
  answer: [4, [26.5, 3], [36.5, 2]],
} as const satisfies Reserve;

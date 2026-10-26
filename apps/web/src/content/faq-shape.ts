/*
 * What the FAQ of a calculator entry is, shared by the reader (`faqOf`), the JSON-LD builder and
 * the built-site checks, so the three cannot drift apart.
 */

/** The FAQ of an entry: at least this many items, each answer at most this many characters. */
export const FAQ_MIN_ITEMS = 4;
export const FAQ_MAX_ANSWER = 450;

/** The ids of the FAQ section, by locale (calculator-page › [CP5]). */
export const FAQ_SECTION_IDS = ['faq', 'preguntas-frecuentes'] as const;

/** One FAQ item: the question and its plain-text answer. */
export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

/** Curly quotes as straight ones (Astro's smartypants curls the apostrophes of the rendered body). */
export const straightQuotes = (text: string): string =>
  text.replaceAll(/[‘’]/g, "'").replaceAll(/[“”]/g, '"');

/**
 * The text as the Markdown source wrote it, before smartypants: quotes straight, `…` as `...`,
 * en and em dashes as `--` and `---`. Both sides of a parity check go through it.
 */
export const sourceTypography = (text: string): string =>
  straightQuotes(text).replaceAll('…', '...').replaceAll('—', '---').replaceAll('–', '--');

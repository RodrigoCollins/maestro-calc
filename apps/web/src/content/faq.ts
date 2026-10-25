/** The FAQ of a calculator entry: at least this many items, each answer at most this many characters. */
export const FAQ_MIN_ITEMS = 4;
export const FAQ_MAX_ANSWER = 450;

/** The ids of the FAQ section, by locale (calculator-page › [CP5]). */
const FAQ_IDS = ['faq', 'preguntas-frecuentes'];

/** What an answer may not hold: a link, a tag, emphasis, code or a list (it is repeated in JSON-LD). */
const NOT_PLAIN = [/\[[^\]]*\]\([^)]*\)/, /[<>]/, /[*_`]/, /^\s*(?:[-+]|\d+[.)])\s/m];

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

const squeeze = (text: string): string => text.replaceAll(/\s+/g, ' ').trim();

/** The text of the FAQ section: from its `<h2 id>` up to the next `<h2`. */
const sectionOf = (body: string): string => {
  const start = FAQ_IDS.map((id) => body.indexOf(`<h2 id="${id}"`)).find((index) => index !== -1);
  if (start === undefined) throw new Error('the body has no FAQ section');
  const rest = body.slice(start + 1);
  const next = rest.indexOf('<h2');
  return rest.slice(rest.indexOf('>') + 1, next === -1 ? undefined : next);
};

/**
 * The questions (`###`) and plain-text answers of the FAQ section, in order. The answers feed the
 * `FAQPage` JSON-LD and the page HTML, so they stay short and free of markup; a violation throws
 * an error that names the question.
 */
export const faqOf = (body: string): FaqItem[] => {
  const items: { question: string; lines: string[] }[] = [];
  for (const line of sectionOf(body).split('\n')) {
    if (line.startsWith('### ')) items.push({ question: squeeze(line.slice(4)), lines: [] });
    else items.at(-1)?.lines.push(line);
  }
  const faq = items.map(({ question, lines }) => {
    const raw = lines.join('\n');
    if (NOT_PLAIN.some((pattern) => pattern.test(raw))) {
      throw new Error(`FAQ answer to "${question}" is not plain text`);
    }
    const answer = squeeze(raw);
    if (answer === '') throw new Error(`FAQ question "${question}" has no answer`);
    if (answer.length > FAQ_MAX_ANSWER) {
      throw new Error(
        `FAQ answer to "${question}" has ${String(answer.length)} characters, the limit is ${String(FAQ_MAX_ANSWER)}`,
      );
    }
    return { question, answer };
  });
  if (faq.length < FAQ_MIN_ITEMS) {
    throw new Error(
      `the FAQ has ${String(faq.length)} items, at least ${String(FAQ_MIN_ITEMS)} are required`,
    );
  }
  return faq;
};

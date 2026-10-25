import type { Locale } from '@maestro-calc/i18n';

/** What the full-length placeholder page holds (calculator-page › Page anatomy; design C18, DR-16). */
export const WORDS = 1_500;
export const FAQ_ITEMS = 8;
export const FAQ_ANSWER_LENGTH = 450;

/**
 * Running prose: every other word is a short function word, the rest are longer content words, as
 * in natural text. The average word is 5.0 letters in English and 5.2 in Spanish (natural prose is
 * about 4.7 and 5.0), so the placeholder is a little heavier than real copy.
 */
const VOCABULARY: Record<
  Locale,
  { readonly short: readonly string[]; readonly long: readonly string[] }
> = {
  en: {
    short:
      'the of and to in is that for it as with be by on or from you use this if than each when'.split(
        ' ',
      ),
    long: (
      'measurement thickness calculator concrete estimate supplier dimensions foundation material quantity ' +
      'delivery footing column volume reinforcement specification contractor excavation preparation ' +
      'compaction formwork before enter check pour depth width length cubic'
    ).split(' '),
  },
  es: {
    short: (
      'de la el en y que los se del las un por con para una es al lo como más pero sus entre cuando ' +
      'también porque sobre según'
    ).split(' '),
    long: (
      'concreto losa zapata columna escalones volumen bolsas rendimiento cúbicas yardas medida largo ' +
      'ancho espesor desperdicio proveedor estimación vaciado terreno revisar mezcla curado acabado ' +
      'profundidad nivelar plano'
    ).split(' '),
  },
};

/** `count` words of deterministic placeholder text, with a full stop every twelfth word. */
export const words = (locale: Locale, count: number, offset = 0): string => {
  const { short, long } = VOCABULARY[locale];
  return Array.from({ length: count }, (_, index) => {
    const pool = index % 2 === 0 ? short : long;
    const word = pool[(Math.floor(index / 2) * 7 + offset) % pool.length] ?? '';
    return (index + 1) % 12 === 0 ? `${word}.` : word;
  }).join(' ');
};

export interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

/** Exactly 8 items whose answers are exactly 600 characters. */
export const faqOf = (locale: Locale): FaqItem[] =>
  Array.from({ length: FAQ_ITEMS }, (_, index) => ({
    question: `Placeholder question number ${String(index + 1)} about concrete?`,
    answer: `${words(locale, 150, index).slice(0, FAQ_ANSWER_LENGTH - 1)}.`,
  }));

/**
 * The content sections of a calculator entry as HTML: 1,500 words in all, the FAQ with its eight
 * answers, then `extra` more characters of copy (the seeded failure of the budget test).
 */
export const copyOf = (locale: Locale, extra = 0): string => {
  const section = (id: string, heading: string, count: number): string =>
    `<h2 id="${id}">${heading}</h2>` +
    Array.from(
      { length: Math.ceil(count / 60) },
      (_, part) => `<p>${words(locale, 60, part)}</p>`,
    ).join('');
  return (
    section('how-to-use', 'How to use this calculator', WORDS / 4) +
    section('formulas', 'Formulas and worked example', WORDS / 4) +
    section('tips', 'Tips and common mistakes', WORDS / 4) +
    '<h2 id="faq">Frequently asked questions</h2>' +
    faqOf(locale)
      .map(({ question, answer }) => `<h3>${question}</h3><p>${answer}</p>`)
      .join('') +
    `<h2 id="sources">Sources and review date</h2><p>${words(locale, WORDS / 4 - 20)}</p>` +
    (extra > 0 ? `<p>${'x'.repeat(extra)}</p>` : '')
  );
};

import { describe, expect, it } from 'vitest';
import {
  FAQ_MAX_ANSWER,
  FAQ_MIN_ITEMS,
  FAQ_SECTION_IDS,
  sourceTypography,
  straightQuotes,
} from './faq-shape.ts';

describe('FAQ shape (calculator-page › [CP5], [CP10]; design C16)', () => {
  it('states the limits and the section ids once', () => {
    expect(FAQ_MIN_ITEMS).toBe(4);
    expect(FAQ_MAX_ANSWER).toBe(450);
    expect(FAQ_SECTION_IDS).toEqual(['faq', 'preguntas-frecuentes']);
  });

  it('straightens single and double curly quotes and leaves the rest', () => {
    expect(straightQuotes('\u2018a\u2019 \u201Cb\u201D it\u2019s \u2026 \u2014')).toBe(
      "'a' \"b\" it's \u2026 \u2014",
    );
  });

  it('undoes what smartypants does to the source: quotes, ellipsis and dashes', () => {
    expect(sourceTypography('\u201CIt\u2019s\u201D\u2026 a\u2013b\u2014c')).toBe(
      '"It\'s"... a--b---c',
    );
    expect(sourceTypography('plain "text" - 10%')).toBe('plain "text" - 10%');
  });
});

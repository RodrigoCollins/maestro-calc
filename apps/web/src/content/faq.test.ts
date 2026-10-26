import { describe, expect, it } from 'vitest';
import { faqOf } from './faq.ts';
import { FAQ_MAX_ANSWER, FAQ_MIN_ITEMS } from './faq-shape.ts';

const item = (n: number, answer = `Answer ${String(n)} is plain text.`) =>
  `### Question ${String(n)}?\n\n${answer}\n`;

const body = (items: string, id = 'faq') =>
  `<h2 id="how-to-use">How to use</h2>\n\nText.\n\n<h2 id="${id}">FAQ</h2>\n\n${items}\n<h2 id="sources">Sources</h2>\n\n### Not a question?\n\nNot an answer.\n`;

const four = [1, 2, 3, 4].map((n) => item(n)).join('\n');

describe('faqOf (calculator-page › [CP10]; design C16)', () => {
  it('states its limits: 4 items at least, 450 characters at most', () => {
    expect(FAQ_MIN_ITEMS).toBe(4);
    expect(FAQ_MAX_ANSWER).toBe(450);
  });

  // spec: site-seo › [SE20] builder side: the questions and answers in order, from the FAQ section only
  it.each([
    ['en', 'faq'],
    ['es', 'preguntas-frecuentes'],
  ])('reads the %s FAQ section in order and stops at the next h2', (_locale, id) => {
    expect(faqOf(body(four, id))).toEqual([
      { question: 'Question 1?', answer: 'Answer 1 is plain text.' },
      { question: 'Question 2?', answer: 'Answer 2 is plain text.' },
      { question: 'Question 3?', answer: 'Answer 3 is plain text.' },
      { question: 'Question 4?', answer: 'Answer 4 is plain text.' },
    ]);
  });

  it('joins the lines and paragraphs of an answer with single spaces', () => {
    const items = four.replace(
      'Answer 1 is plain text.',
      'First   line\nsecond line.\n\nSecond paragraph.',
    );
    expect(faqOf(body(items))[0]?.answer).toBe('First line second line. Second paragraph.');
  });

  it('accepts an answer of exactly 450 characters', () => {
    const answer = 'a'.repeat(FAQ_MAX_ANSWER);
    expect(faqOf(body(four.replace('Answer 2 is plain text.', answer)))[1]?.answer).toHaveLength(
      450,
    );
  });

  // spec: calculator-page › [CP10] an answer over the cap fails, naming the question
  it('throws on an answer of 451 characters, naming the question and the length', () => {
    expect(() => faqOf(body(four.replace('Answer 2 is plain text.', 'a'.repeat(451))))).toThrow(
      'FAQ answer to "Question 2?" has 451 characters, the limit is 450',
    );
  });

  it.each([
    ['a link', 'See [the data sheet](https://example.com/a).'],
    ['a bare angle bracket', 'Use <b>bold</b> here.'],
    ['strong emphasis', 'This is **very** important.'],
    ['emphasis with stars', 'This is *quite* important.'],
    ['emphasis with underscores', 'This is _quite_ important.'],
    ['inline code', 'Use `ft3` here.'],
    ['a bullet list', 'Choices:\n- one\n- two'],
    ['a starred list', '* one\n* two'],
    ['a numbered list', '1. one\n2. two'],
  ])('throws on %s inside an answer, naming the question', (_name, answer) => {
    expect(() => faqOf(body(four.replace('Answer 3 is plain text.', answer)))).toThrow(
      /FAQ answer to "Question 3\?" is not plain text/,
    );
  });

  it('allows the characters of plain prose: a percent, a dash, a slash, an apostrophe', () => {
    const answer = "10% extra, 12 ft x 10 ft / 4 in - it's 1.63 yd3 (about 44/27).";
    expect(faqOf(body(four.replace('Answer 1 is plain text.', answer)))[0]?.answer).toBe(answer);
  });

  // The page renders the body through smartypants, so curly quotes may reach the reader's side.
  it('writes the apostrophes and quotes of a question and an answer straight', () => {
    const items = four
      .replace('Question 1?', 'What\u2019s a \u201Cyard\u201D?')
      .replace('Answer 1 is plain text.', 'It\u2019s 27 ft\u00B3, a \u2018cubic\u2019 yard.');
    expect(faqOf(body(items))[0]).toEqual({
      question: 'What\'s a "yard"?',
      answer: "It's 27 ft\u00B3, a 'cubic' yard.",
    });
  });

  it('throws on fewer than four items', () => {
    const three = [1, 2, 3].map((n) => item(n)).join('\n');
    expect(() => faqOf(body(three))).toThrow('the FAQ has 3 items, at least 4 are required');
  });

  it('throws on a question without an answer', () => {
    expect(() => faqOf(body(four.replace('Answer 4 is plain text.', '')))).toThrow(
      'FAQ question "Question 4?" has no answer',
    );
  });

  it('throws when the body has no FAQ section', () => {
    expect(() => faqOf('<h2 id="how-to-use">How</h2>\n\nText.\n')).toThrow(
      'the body has no FAQ section',
    );
  });

  it('reads a FAQ section that is the last one of the body', () => {
    expect(faqOf(`<h2 id="faq">FAQ</h2>\n\n${four}`)).toHaveLength(4);
  });
});

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { concreteView } from '../../lib/calculator-page.ts';
import { siteText } from '../../lib/site-text.ts';
import { alternatesOf, pathOf, urlOf } from '../../routing/routes.ts';
import { serializeJsonLd } from '../../seo/json-ld.ts';
import CalculatorBody from './CalculatorBody.astro';
import type { CalculatorContent } from './model.ts';

/** The page HTML budget of site-quality (SQ7), in bytes. */
const HTML_BUDGET = 40_960;
const WORDS = 1_500;
const FAQ_ITEMS = 8;
const FAQ_ANSWER_LENGTH = 600;

const CONTENT: CalculatorContent = {
  updatedLabel: 'Last updated',
  updated: '2026-10-25',
  updatedText: 'October 25, 2026',
  sources: [
    {
      name: 'QUIKRETE Concrete Mix No. 1101 data sheet',
      url: 'https://www.quikrete.com/PDFs/DATA_SHEET-Concrete%20Mix%201101.pdf',
      retrieved: 'October 25, 2026',
    },
    {
      name: 'NIST Special Publication 811, Appendix B',
      url: 'https://www.nist.gov/pml/special-publication-811',
      retrieved: 'October 25, 2026',
    },
  ],
};

const VOCABULARY = [
  'concrete',
  'slab',
  'footing',
  'column',
  'steps',
  'volume',
  'bags',
  'yield',
  'cubic',
  'yards',
  'measure',
  'length',
  'width',
  'thickness',
  'extra',
  'waste',
  'order',
  'supplier',
  'estimate',
  'pour',
  'form',
  'level',
  'ground',
  'check',
  'plan',
  'mix',
  'water',
  'cure',
  'finish',
  'depth',
];

/** `count` words of deterministic placeholder text, with a full stop every twelfth word. */
const words = (count: number, offset = 0): string =>
  Array.from({ length: count }, (_, index) => {
    const word = VOCABULARY[(index * 7 + offset) % VOCABULARY.length] ?? 'concrete';
    return (index + 1) % 12 === 0 ? `${word}.` : word;
  }).join(' ');

/** Exactly `length` characters of placeholder text. */
const answer = (item: number): string => words(120, item).slice(0, FAQ_ANSWER_LENGTH - 1) + '.';

/** Five content sections of 1,500 words in all, then 8 FAQ items of 600 characters, as HTML. */
const copy = (extra = 0): { html: string; faq: { question: string; answer: string }[] } => {
  const faq = Array.from({ length: FAQ_ITEMS }, (_, index) => ({
    question: `Placeholder question number ${String(index + 1)} about concrete?`,
    answer: answer(index),
  }));
  const section = (id: string, heading: string, count: number): string =>
    `<h2 id="${id}">${heading}</h2>` +
    Array.from({ length: Math.ceil(count / 60) }, (_, part) => `<p>${words(60, part)}</p>`).join(
      '',
    );
  const html =
    section('how-to-use', 'How to use this calculator', WORDS / 4) +
    section('formulas', 'Formulas and worked example', WORDS / 4) +
    section('tips', 'Tips and common mistakes', WORDS / 4) +
    `<h2 id="faq">Frequently asked questions</h2>` +
    faq.map(({ question, answer: text }) => `<h3>${question}</h3><p>${text}</p>`).join('') +
    `<h2 id="sources">Sources and review date</h2><p>${words(WORDS / 4 - 20)}</p>` +
    (extra > 0 ? `<p>${'x'.repeat(extra)}</p>` : '');
  return { html, faq };
};

/** The bytes of the whole calculator page: layout, container, full-length copy and the JSON-LD. */
const measure = async (extra = 0): Promise<number> => {
  const text = siteText('en');
  const { html, faq } = copy(extra);
  const container = await AstroContainer.create();
  const body = await container.renderToString(CalculatorBody, {
    props: { view: concreteView('en'), content: CONTENT },
    partial: true,
    slots: { default: html },
  });
  const jsonLd = serializeJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: 'Concrete Calculator',
        url: urlOf(pathOf('home', 'en')),
        inLanguage: 'en-US',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        isAccessibleForFree: true,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: urlOf(pathOf('home', 'en')) },
          { '@type': 'ListItem', position: 2, name: 'Concrete Calculator' },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faq.map(({ question, answer: text }) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text },
        })),
      },
    ],
  });
  const page = await container.renderToString(BaseLayout, {
    props: {
      locale: 'en',
      id: 'about',
      head: {
        title: text('page.about.title'),
        description: text('page.about.description'),
        canonical: urlOf(pathOf('about', 'en')),
        alternates: alternatesOf('about'),
        jsonLd,
      },
    },
    partial: false,
    slots: { default: body },
  });
  return Buffer.byteLength(page);
};

describe('CalculatorBody HTML budget (calculator-page › Page anatomy; site-quality › [SQ7]; design C18, DR-16)', () => {
  // spec: site-quality › [SQ7] with full-length copy: 1,500 words, 8 FAQ answers of 600 characters, the JSON-LD
  it('fits the HTML budget with full-length copy, the JSON-LD and every template', async () => {
    const bytes = await measure();
    console.info(
      `calculator page HTML with full-length copy: ${String(bytes)} B of ${String(HTML_BUDGET)} B`,
    );
    expect(bytes).toBeLessThanOrEqual(HTML_BUDGET);
  });

  // seeded: the assertion bites, so a copy that is too long cannot pass unnoticed
  it('exceeds the budget once the copy grows past the headroom', async () => {
    const headroom = HTML_BUDGET - (await measure());
    expect(headroom).toBeGreaterThan(0);
    expect(await measure(headroom + 1)).toBeGreaterThan(HTML_BUDGET);
  });

  it('uses the sizes the spec fixes: 8 answers of 600 characters', () => {
    const { faq } = copy();
    expect(faq).toHaveLength(FAQ_ITEMS);
    expect(faq.every(({ answer: text }) => text.length === FAQ_ANSWER_LENGTH)).toBe(true);
    expect(copy().html.match(/\b[a-z]+\b/g)?.length ?? 0).toBeGreaterThan(WORDS);
  });
});

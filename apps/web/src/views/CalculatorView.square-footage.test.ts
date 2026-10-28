import { describe, expect, it } from 'vitest';
import { renderComponent } from '../__testing__/render-component.ts';
import { headStyleOf, PAGES } from '../lib/pages.ts';
import CalculatorView from './CalculatorView.astro';

/**
 * The square footage page as it is built: the real view, page row and entries. Its anatomy, its
 * review markers and its byte budgets are checked on `dist` by `check:site`, the same rules as
 * concrete's (calculator-page › [CP68]).
 */
const render = (locale: 'en' | 'es') =>
  renderComponent(CalculatorView, { id: 'rectangle-area', locale }, { partial: false });

/** The markup of a content section: from its heading to the next `h2`. */
const sectionOf = (html: string, id: string): string => {
  const start = html.indexOf(`id="${id}"`);
  const end = html.indexOf('<h2', start);
  return start === -1 ? '' : html.slice(start, end === -1 ? undefined : end);
};

const EXPECTED = {
  en: {
    title: 'Square Footage Calculator',
    answer: 'A 10 ft by 10 ft area is 100.00 square feet.',
    methodology: '/methodology#square-footage',
  },
  es: {
    title: 'Calculadora de pies cuadrados',
    answer: 'Un área de 10 ft por 10 ft mide 100.00 pies cuadrados.',
    methodology: '/es/metodologia#pies-cuadrados',
  },
} as const;

const SLOTS =
  '[data-choice], [data-step], [data-shopping], [data-line], [data-fill], [data-line-note], [data-cost-row], [data-hint-row], [data-price-hint]';

describe.each(['en', 'es'] as const)('the built square footage page in %s', (locale) => {
  const expected = EXPECTED[locale];

  // spec: calculator-page › [CP67] the static render: title, default answer and figures, no other slot
  it('renders the title, the default answer and the three figures, and no other slot', async () => {
    const document = await render(locale);
    expect(document.querySelector('main h1')?.text).toBe(expected.title);
    expect(document.querySelector('[data-answer]')?.text.trim()).toBe(expected.answer);
    expect(
      document
        .querySelectorAll('[data-output]')
        .map((el) => [el.getAttribute('data-output'), el.text]),
    ).toEqual([
      ['areaFt2', '100.00'],
      ['areaYd2', '11.11'],
      ['areaM2', '9.29'],
    ]);
    expect(document.querySelector('[data-primary]')?.text).toContain('100.00');
    expect(document.querySelectorAll(SLOTS)).toHaveLength(0);
  });

  // spec: calculator-page › [CP70] the worked example in Formulas and the link to its methodology section
  it('shows the worked example and links its methodology section', async () => {
    const document = await render(locale);
    const formulas = sectionOf(document.querySelector('main')?.innerHTML ?? '', 'formulas');
    for (const figure of ['12 ft', '10 ft', '120.00', '13.33', '11.15'])
      expect(formulas, figure).toContain(figure);
    expect(document.querySelectorAll(`main a[href="${expected.methodology}"]`)).toHaveLength(1);
  });

  // spec: calculator-page › [CP65] built: one head style from the row's reserve, both counts, none on the body
  it('carries its reserve as one head style and no style on the body', async () => {
    const document = await render(locale);
    const style = headStyleOf(PAGES['rectangle-area']);
    expect(style).toContain('--answer-lines');
    expect(style).toContain('--notice-lines');
    expect(
      document
        .querySelectorAll('head style')
        .filter((element) => element.text.includes('-lines'))
        .map((element) => element.text),
    ).toEqual([style]);
    expect(document.querySelectorAll('body style')).toHaveLength(0);
    expect(document.querySelector('[data-calculator]')?.getAttribute('style')).toBeUndefined();
  });

  // spec: site-routing-i18n › [SR25], site-shell › [SS20] one module script, its own island
  it('loads exactly one module script, the square footage island', async () => {
    const scripts = (await render(locale)).querySelectorAll('script[type=module][src]');
    expect(scripts).toHaveLength(1);
    expect(scripts[0]?.getAttribute('src')).toContain('RectangleAreaScript.astro');
  });
});

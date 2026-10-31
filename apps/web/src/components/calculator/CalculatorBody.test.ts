import {
  ALL_ERROR_CODES,
  ft3,
  isQuantity,
  m3,
  toDecimalParts,
  valueIn,
  yd3,
  type Rational,
} from '@maestro-calc/core';
import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enRectangleArea } from '@maestro-calc/i18n/catalogs/en/rectangle-area';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { describe, expect, it } from 'vitest';
import { renderComponent } from '../../__testing__/render-component.ts';
import { slotFreePage } from '../../contract/__testing__/slot-free-page.ts';
import { pageViewOf } from '../../lib/page-view.ts';
import { PAGES, pageView } from '../../lib/pages.ts';
import { PANEL_ROWS } from '../../lib/reserve.ts';
import { CALCULATOR_PAGES } from '../../routing/templates.ts';
import { calculators } from '../../lib/calculators.ts';
import CalculatorBody from './CalculatorBody.astro';
import type { CalculatorContent } from './model.ts';

const CONTENT: CalculatorContent = {
  updatedLabel: 'Last updated',
  updated: '2026-10-25',
  updatedText: 'October 25, 2026',
  sources: [{ name: 'QUIKRETE', url: 'https://www.quikrete.com/', retrieved: 'October 25, 2026' }],
};

const render = (locale: 'en' | 'es') =>
  renderComponent(CalculatorBody, { view: pageView('concrete', locale), content: CONTENT });

type Root = Awaited<ReturnType<typeof render>>;

const outputs = (root: Root): [string, string][] =>
  root
    .querySelectorAll('[data-output]')
    .map((el) => [el.getAttribute('data-output') ?? '', el.text]);

/** The inert messages of the page: the entries of its one template, by id. */
const messagesOf = (root: Root): Record<string, string> => {
  const found: Record<string, string> = {};
  for (const entry of root.querySelectorAll('template[data-messages] > p')) {
    found[entry.getAttribute('id') ?? ''] = entry.innerHTML;
  }
  return found;
};

describe('CalculatorBody, default result (calculator-page › Static render, [CP1], [CP2], [CP4])', () => {
  // spec: calculator-page › [CP1] built English page
  it('renders the English table: H1, answer, figures, shopping line, hidden costs and the hint', async () => {
    const root = await render('en');
    expect(root.querySelector('h1')?.text).toBe('Concrete Calculator');
    expect(root.querySelector('[data-answer]')?.text).toBe(
      'Slab (12 ft × 10 ft, 4 in thick): 1.63 cubic yards with 10% extra. Bags of 80 lb: 74.',
    );
    expect(outputs(root)).toEqual([
      ['volumeYd3', '1.63'],
      ['volumeFt3', '44.00'],
      ['volumeM3', '1.25'],
      ['netVolume', '40.00'],
      ['bagCost', '$0.00'],
      ['readyMixCost', '$0.00'],
    ]);
    expect(
      root
        .querySelectorAll('[data-shopping]')
        .map((el) => [el.getAttribute('data-shopping'), el.text]),
    ).toEqual([['bag-80', '74']]);
    expect(root.querySelector('.calc-shopping > span:first-child')?.text).toBe(
      'Concrete mix, 80 lb bags',
    );
    // trims C and D of blueprint-panel: no label class, no separate hint row
    expect(root.querySelectorAll('.calc-label, .calc-hint, [data-hint-row]')).toHaveLength(0);
    expect(root.querySelector('[data-line-note="0"]')?.text).toBe('About 0.60 cubic feet per bag');
    for (const key of ['bagCost', 'readyMixCost']) {
      expect(root.querySelector(`[data-output="${key}"]`)?.closest('[hidden]'), key).not.toBeNull();
      const hint = root.querySelector(`[data-price-hint="${key}"]`);
      expect(hint?.text).toBe('Add your price to see the cost');
      expect(hint?.closest('[hidden]'), key).toBeNull();
    }
  });

  // spec: calculator-page › [CP2] built Spanish page
  it('renders the Spanish table with the same figures', async () => {
    const root = await render('es');
    expect(root.querySelector('h1')?.text).toBe('Calculadora de Concreto');
    expect(root.querySelector('[data-answer]')?.text).toBe(
      'Losa (12 ft × 10 ft, 4 in de espesor): 1.63 yardas cúbicas con 10% de extra. Bolsas de 80 lb: 74.',
    );
    expect(outputs(root)).toEqual([
      ['volumeYd3', '1.63'],
      ['volumeFt3', '44.00'],
      ['volumeM3', '1.25'],
      ['netVolume', '40.00'],
      ['bagCost', '$0.00'],
      ['readyMixCost', '$0.00'],
    ]);
    expect(root.querySelector('[data-shopping="bag-80"]')?.text).toBe('74');
    expect(root.querySelector('.calc-shopping > span:first-child')?.text).toBe(
      'Mezcla de concreto, bolsas de 80 lb',
    );
    expect(root.querySelector('[data-line-note="0"]')?.text).toBe(
      'Unos 0.60 pies cúbicos por bolsa',
    );
    expect(root.querySelector('[data-price-hint="bagCost"]')?.text).toBe(
      'Agrega tu precio para ver el costo',
    );
  });

  // spec: calculator-page › [CP3] the figures are the engine's, rounded for display
  it('shows the engine output rounded to two places', async () => {
    const entry = calculators.find(({ id }) => id === 'concrete');
    if (entry === undefined) throw new Error('concrete is not registered');
    const result = entry.run({});
    if (!result.ok) throw new Error('run failed');
    const places2 = (value: Rational) => {
      const { integer, fraction } = toDecimalParts(value, 2);
      return `${integer.toString()}.${fraction}`;
    };
    const quantityOf = (key: 'volumeYd3' | 'volumeFt3' | 'volumeM3' | 'netVolume') => {
      const output = result.value.outputs.find((found) => found.key === key);
      if (output === undefined || !isQuantity(output.value)) throw new Error(`no volume ${key}`);
      return output.value;
    };
    const shown = new Map(outputs(await render('en')));
    expect(shown.get('volumeYd3')).toBe(places2(valueIn(quantityOf('volumeYd3'), yd3)));
    expect(shown.get('volumeFt3')).toBe(places2(valueIn(quantityOf('volumeFt3'), ft3)));
    expect(shown.get('volumeM3')).toBe(places2(valueIn(quantityOf('volumeM3'), m3)));
    expect(shown.get('netVolume')).toBe(places2(valueIn(quantityOf('netVolume'), ft3)));
    expect(result.value.shopping[0]?.qty).toBe(74n);
  });
});

describe('CalculatorBody, anatomy (calculator-page › [CP5], [CP15], [CP17])', () => {
  // spec: calculator-page › [CP5] breadcrumb list above the H1, the result h2, no nav in the body
  it('puts the labelled breadcrumb list before the h1, then the result h2, with no nav', async () => {
    const root = await render('en');
    const order = root.querySelectorAll('ol, h1, h2').map((el) => el.tagName.toLowerCase());
    expect(order.slice(0, 3)).toEqual(['ol', 'h1', 'h2']);
    expect(root.querySelector('ol')?.getAttribute('aria-label')).toBe('Breadcrumb');
    expect(root.querySelectorAll('nav')).toHaveLength(0);
    expect(root.querySelector('h2')?.text).toBe('Result');
    expect((await render('es')).querySelector('ol')?.getAttribute('aria-label')).toBe(
      'Ruta de navegación',
    );
  });

  // spec: calculator-page › [CP15] the panel in the order of the spec, with units
  it('reads the panel, then the shopping list, in the order of the spec', async () => {
    const parts = (await render('en')).querySelectorAll('.calc-result, .calc-list');
    expect(parts.map((part) => part.classNames)).toEqual(['calc-result', 'calc-list']);
    const text = parts
      .map((part) => part.text)
      .join(' ')
      .replaceAll(/\s+/g, ' ');
    const order = [
      '1.63 cubic yards',
      '44.00',
      '1.25',
      '40.00',
      'Concrete mix, 80 lb bags',
      '74',
      'About 0.60 cubic feet per bag',
    ].map((part) => text.indexOf(part));
    expect(order.every((index) => index >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  // spec: calculator-page › [CP17] the estimate note and the link to the terms
  it('ends the panel with the estimate note and the terms link of the locale', async () => {
    const en = await render('en');
    expect(en.querySelector('.calc-result')?.text).toContain(
      'Estimates only. Check quantities with your supplier and the local building code.',
    );
    expect(en.querySelector('.calc-result a')?.getAttribute('href')).toBe('/terms');
    expect((await render('es')).querySelector('.calc-result a')?.getAttribute('href')).toBe(
      '/es/terminos',
    );
  });

  it('shows the sources and the review date after the content slot', async () => {
    const root = await renderComponent(
      CalculatorBody,
      { view: pageView('concrete', 'en'), content: CONTENT },
      { slots: { default: '<h2 id="how-to-use">How to use</h2>' } },
    );
    const ids = root.querySelectorAll('h2').map((el) => el.getAttribute('id'));
    expect(ids).toEqual(['calc-result-heading', 'how-to-use']);
    expect(root.querySelector('.calc-content')?.text).toContain('Last updated: October 25, 2026');
    expect(root.querySelectorAll('time')).toHaveLength(1);
  });
});

describe('CalculatorBody, without scripts (calculator-page › [CP40] static, [CP41] static, [CP44] static)', () => {
  // spec: calculator-page › [CP40] the note is visible, outside noscript, with the exact text
  it.each([
    [
      'en',
      'This page needs JavaScript to recalculate. If it is off or did not load, the result below is the example.',
    ],
    [
      'es',
      'Esta página necesita JavaScript para recalcular. Si está desactivado o no cargó, el resultado de abajo es el ejemplo.',
    ],
  ] as const)('shows the %s "not running" note outside noscript', async (locale, note) => {
    const root = await render(locale);
    const element = root.querySelector('[data-not-running]');
    expect(element?.text).toBe(note);
    expect(element?.closest('noscript')).toBeNull();
    expect(element?.closest('[hidden]')).toBeNull();
    expect(root.querySelectorAll('noscript')).toHaveLength(0);
  });

  // spec: calculator-page › [CP41] static, [CP40] static
  it('disables every control and hides the script-only ones', async () => {
    const root = await render('en');
    expect(
      root.querySelectorAll('input, button').every((control) => control.hasAttribute('disabled')),
    ).toBe(true);
    expect(root.querySelector('[data-copy]')?.hasAttribute('hidden')).toBe(true);
    expect(
      root
        .querySelectorAll('[data-step="waste"] button')
        .every((step) => step.hasAttribute('hidden')),
    ).toBe(true);
    expect(root.querySelectorAll('input[name]')).toHaveLength(15);
  });

  // spec: calculator-page › [CP44] static, DR-13: the areas the script rewrites exist from the start
  it('reserves the areas that the script reveals or rewrites', async () => {
    const root = await render('en');
    const reserved = root
      .querySelectorAll('[data-reserved]')
      .map((el) => el.getAttribute('data-reserved'));
    expect(reserved.sort()).toEqual(['answer', 'copy', 'notice']);
    expect(root.querySelector('[data-reserved="answer"]')?.getAttribute('aria-live')).toBe(
      'polite',
    );
    expect(root.querySelector('[data-reserved="notice"] [data-not-running]')).not.toBeNull();
  });

  // spec: calculator-page › [CP43] messages are inert template elements, none rendered
  it('keeps the twelve errors, the four sentences, the drawing notes, the copy states, the share text and the unit hints in templates', async () => {
    const root = await render('en');
    const byName = messagesOf(root);
    // the errors, the answers, the drawing notes, the copy states, the share text, the hints, the
    // primary sentences
    expect(Object.keys(byName)).toHaveLength(12 + 4 + 4 + 2 + 1 + 4 + 2);
    expect(root.querySelectorAll('template')).toHaveLength(1);
    expect(Object.keys(byName).filter((name) => name.startsWith('hint.'))).toEqual([
      'hint.ft',
      'hint.in',
      'hint.m',
      'hint.cm',
    ]);
    expect(byName['hint.cm']).toBe('centimeters');
    expect(byName['volume.yd3']).toBe('{value} cubic yards');
    expect(byName['volume.m3']).toBe('{value} cubic meters');
    for (const code of ALL_ERROR_CODES) {
      expect(byName[`errors.${code}`], code).toBe(enCommon[`errors.${code}`]);
    }
    expect(byName['errors.BELOW_MIN']).toContain('{min}');
    expect(byName['errors.ABOVE_MAX']).toContain('{max}');
    expect(Object.keys(byName).filter((name) => name.startsWith('answer.'))).toEqual([
      'answer.slab',
      'answer.footing',
      'answer.column',
      'answer.steps',
    ]);
    expect(byName['answer.steps']).toMatch(/^Steps \(.*Bags of \{bagLb\} lb: \{bags\}\.$/);
    expect(byName['copy.copied']).toBe('Link copied');
    expect(byName['copy.failed']).toBe('Could not copy. Select the link and copy it.');
    // spec: calculator-page › share requirement, i18n-catalog › [ICW22] the share text is inert
    expect(byName['share.text']).toBe('Check this calculation:');
    expect(root.querySelectorAll('template [data-output], template input')).toHaveLength(0);
    expect(messagesOf(await render('es'))['errors.MALFORMED']).toBe(esCommon['errors.MALFORMED']);
  });

  // spec: calculator-web-core › Page-view builder: the answer region exists only with an answer
  it('renders the answer region only for a view that has an answer', async () => {
    expect((await render('en')).querySelectorAll('[data-answer]')).toHaveLength(1);
    // the catalog of a page with neither an answer nor a primary sentence: no page copy
    const copy = Object.fromEntries(
      Object.entries(enRectangleArea).filter(([key]) => !key.includes('.page.')),
    );
    const view = pageViewOf(slotFreePage, 'en', { ...enCommon, ...copy, ...enSite });
    const root = await renderComponent(CalculatorBody, { view, content: CONTENT });
    expect(root.querySelectorAll('[data-answer], [data-reserved="answer"]')).toHaveLength(0);
    expect(root.querySelector('[data-calculator]')?.getAttribute('data-calculator')).toBe(
      'rectangle-area',
    );
    // the messages are the view's list, in order: the errors first, then the copy states and the hints
    expect(Object.keys(messagesOf(root)).slice(ALL_ERROR_CODES.length)).toEqual([
      'copy.copied',
      'copy.failed',
      'share.text',
      'hint.ft',
      'hint.m',
    ]);
  });
});

describe('CalculatorBody, the copy area (calculator-page › [CP80], [CP81], [CP83], [CP84] static)', () => {
  // blueprint-ui slice 4: the actions follow the result (and the shopping list), outside the form
  it('puts the copy area after the result and the shopping list, outside the form, then the notice', async () => {
    const root = await render('en');
    const copy = root.querySelector('[data-reserved="copy"]');
    expect(copy?.closest('form')).toBeNull();
    expect(copy?.previousElementSibling?.classNames).toBe('calc-list');
    expect(copy?.nextElementSibling?.getAttribute('data-reserved')).toBe('notice');
    expect(root.querySelector('[data-copy]')?.hasAttribute('hidden')).toBe(true);
    expect(root.querySelector('[data-copy]')?.hasAttribute('disabled')).toBe(true);
    expect(root.querySelector('[data-copy]')?.text.trim()).toBe('Copy link');
    expect(root.querySelector('[data-copy-status]')?.getAttribute('role')).toBe('status');
  });

  // spec: calculator-page › [CP80], [CP81], [CP83] static: the share anchor between the copy button
  // and the status, hidden, with the inert base and no href
  it.each([
    ['en', 'Send on WhatsApp'],
    ['es', 'Enviar por WhatsApp'],
  ] as const)('renders the %s share anchor hidden and without an href', async (locale, label) => {
    const copy = (await render(locale)).querySelector('[data-reserved="copy"]');
    expect(copy?.children.map((el) => el.tagName.toLowerCase())).toEqual(['button', 'a', 'p']);
    const anchor = copy?.querySelector('a');
    expect(anchor?.attributes).toEqual({
      class: 'calc-share',
      'data-share': 'https://wa.me/',
      target: '_blank',
      rel: 'noopener noreferrer',
      hidden: '',
    });
    expect(anchor?.text.trim()).toBe(label);
  });
});

describe('CalculatorBody, public hooks (calculator-page › [CP54], [CP56]; calculator-web-core › [CWC24], [CWC33])', () => {
  // spec: calculator-page › [CP54] the hooks of the concrete page
  it('exposes the generic hooks of the concrete page and none of the old ones', async () => {
    const root = await render('en');
    const values = (selector: string, attribute: string) =>
      root.querySelectorAll(selector).map((el) => el.getAttribute(attribute));
    expect(values('[data-choice="shape"] button', 'value')).toEqual([
      'slab',
      'footing',
      'column',
      'steps',
    ]);
    expect(values('[data-choice="bag"] button', 'value')).toEqual(['40', '60', '80']);
    expect(values('[data-step="waste"] button', 'value')).toEqual(['less', 'more']);
    for (const hook of ['[data-copy]', '[data-copy-status]', '[data-primary]']) {
      expect(root.querySelectorAll(hook), hook).toHaveLength(1);
    }
    expect(values('[data-shopping]', 'data-shopping')).toEqual(['bag-80']);
    expect(values('[data-output]', 'data-output')).toEqual([
      'volumeYd3',
      'volumeFt3',
      'volumeM3',
      'netVolume',
      'bagCost',
      'readyMixCost',
    ]);
    expect(values('[data-line]', 'data-line')).toEqual(['0']);
    expect(root.querySelector('[data-line="0"] [data-fill="bagLb"]')?.text).toBe('80');
    expect(root.querySelector('[data-line-note="0"] [data-fill="yield"]')?.text).toBe('0.60');
    const area = root.querySelector('[data-choice="shape"] + .calc-choice-area');
    expect(area?.getAttribute('style')).toBe('--calc-rows:4');
    expect(
      root.querySelectorAll(
        '[data-shape-button], [data-bag], [data-waste-step], [data-bag-lb], [data-bag-yield], [data-yield], [data-value], [data-direction], [data-reserved="shape"], [data-reserved="steppers"]',
      ),
    ).toHaveLength(0);
  });

  // spec: calculator-web-core › [CWC24], [CWC33] and calculator-page › [CP56]: a module with no slot renders no slot hook
  it('renders rectangle-area through the real components with two fields and no slot element', async () => {
    const view = pageViewOf(slotFreePage, 'en', {
      ...enCommon,
      ...enRectangleArea,
      ...enSite,
    });
    const root = await renderComponent(CalculatorBody, { view, content: CONTENT });
    expect(root.querySelector('[data-calculator]')?.getAttribute('data-calculator')).toBe(
      'rectangle-area',
    );
    expect(root.querySelectorAll('input').map((input) => input.getAttribute('id'))).toEqual([
      'calc-length',
      'calc-width',
    ]);
    expect(outputs(root)).toEqual([
      ['areaFt2', '100.00'],
      ['areaYd2', '11.11'],
      ['areaM2', '9.29'],
    ]);
    expect(root.querySelector('[data-primary]')?.text).toBe('100.00');
    expect(root.querySelectorAll('[data-unit]')).toHaveLength(2);
    expect(root.querySelectorAll('[data-copy], [data-copy-status]')).toHaveLength(2);
    expect(
      root.querySelectorAll(
        '[data-choice], [data-step], [data-shopping], [data-line], [data-fill], [data-line-note], [data-cost], [data-hint-row], [data-price-hint]',
      ),
    ).toHaveLength(0);
  });
});

// spec: blueprint-drawing › [BD20] the two-column panel holds every child of every page beside the
// drawing: the explicit grid of the drawing rule has more rows than any panel has children
describe('CalculatorBody, result panel rows (blueprint-drawing › [BD20])', () => {
  it.each(
    CALCULATOR_PAGES.flatMap((id) =>
      (['en', 'es'] as const).map((locale) => [id, locale] as const),
    ),
  )(
    '%s %s has no more panel children beside the drawing than the drawing rule has rows',
    async (id, locale) => {
      const root = await renderComponent(CalculatorBody, {
        view: pageView(id, locale),
        content: CONTENT,
      });
      const children = root.querySelectorAll('.calc-result > :not([data-drawing])');
      expect(children.length).toBeGreaterThan(0);
      expect(children.length).toBeLessThan(PANEL_ROWS);
    },
  );
});

// spec: blueprint-drawing › [BD22], calculator-page › [CP76] a page that draws renders one empty,
// hidden box between the large figure and the rows, in both locales
// The pages whose module declares a drawing; feet and inches has none yet (its tape drawing is a
// tracked follow-up of feet-inches-calculator), and a page without one renders no box.
const DRAWN = CALCULATOR_PAGES.filter((id) => PAGES[id].module.drawing !== undefined);

describe('CalculatorBody, the drawing box (blueprint-drawing › [BD22])', () => {
  it('renders no box on a page whose module declares no drawing', async () => {
    const root = await renderComponent(CalculatorBody, {
      view: pageView('feet-inches', 'en'),
      content: CONTENT,
    });
    expect(root.querySelectorAll('[data-drawing]')).toHaveLength(0);
  });

  it.each(DRAWN.flatMap((id) => (['en', 'es'] as const).map((locale) => [id, locale] as const)))(
    '%s %s renders one empty aria-hidden box after the large figure and before the rows',
    async (id, locale) => {
      const root = await renderComponent(CalculatorBody, {
        view: pageView(id, locale),
        content: CONTENT,
      });
      const boxes = root.querySelectorAll('[data-drawing]');
      expect(boxes).toHaveLength(1);
      expect(boxes[0]?.getAttribute('aria-hidden')).toBe('true');
      expect(boxes[0]?.childNodes).toHaveLength(0);
      expect(boxes[0]?.previousElementSibling?.classList.contains('calc-primary')).toBe(true);
      expect(boxes[0]?.nextElementSibling?.tagName).toBe('DL');
    },
  );
});

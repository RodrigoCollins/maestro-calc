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
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { describe, expect, it } from 'vitest';
import { renderComponent } from '../../__testing__/render-component.ts';
import { concreteView } from '../../lib/concrete-page.ts';
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
  renderComponent(CalculatorBody, { view: concreteView(locale), content: CONTENT });

type Root = Awaited<ReturnType<typeof render>>;

const outputs = (root: Root): [string, string][] =>
  root
    .querySelectorAll('[data-output]')
    .map((el) => [el.getAttribute('data-output') ?? '', el.text]);

/** The inert messages of the page, by `data-message`. */
const messagesOf = (root: Root): Record<string, string> => {
  const found: Record<string, string> = {};
  for (const template of root.querySelectorAll('template')) {
    found[template.getAttribute('data-message') ?? ''] = template.innerHTML;
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
    expect(root.querySelector('.calc-shopping .calc-label')?.text).toBe('Concrete mix, 80 lb bags');
    expect(root.querySelector('[data-bag-yield]')?.text).toBe('About 0.60 cubic feet per bag');
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
    expect(root.querySelector('.calc-shopping .calc-label')?.text).toBe(
      'Mezcla de concreto, bolsas de 80 lb',
    );
    expect(root.querySelector('[data-bag-yield]')?.text).toBe('Unos 0.60 pies cúbicos por bolsa');
    expect(root.querySelector('[data-price-hint="bagCost"]')?.text).toBe(
      'Agrega tu precio para ver el costo',
    );
  });

  // spec: calculator-page › [CP3] the figures are the engine's, rounded for display
  it('shows the engine output rounded to two places', async () => {
    const entry = calculators[1];
    expect(entry.id).toBe('concrete');
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
  it('reads the panel in the order of the spec', async () => {
    const panel = (await render('en')).querySelector('.calc-result');
    const text = (panel?.text ?? '').replaceAll(/\s+/g, ' ');
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
      { view: concreteView('en'), content: CONTENT },
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
      'This page needs JavaScript to recalculate. If it is off or did not load, the result below is the example. Example: a 12 ft by 10 ft slab, 4 in thick.',
    ],
    [
      'es',
      'Esta página necesita JavaScript para recalcular. Si está desactivado o no cargó, el resultado de abajo es el ejemplo. Ejemplo: una losa de 12 ft por 10 ft, de 4 in de espesor.',
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
      root.querySelectorAll('[data-waste-step]').every((step) => step.hasAttribute('hidden')),
    ).toBe(true);
    expect(root.querySelectorAll('input[name]')).toHaveLength(15);
  });

  // spec: calculator-page › [CP44] static, DR-13: the areas the script rewrites exist from the start
  it('reserves the areas that the script reveals or rewrites', async () => {
    const root = await render('en');
    const reserved = root
      .querySelectorAll('[data-reserved]')
      .map((el) => el.getAttribute('data-reserved'));
    expect(reserved.sort()).toEqual(['answer', 'copy', 'notice', 'shape', 'steppers']);
    expect(root.querySelector('[data-reserved="answer"]')?.getAttribute('aria-live')).toBe(
      'polite',
    );
    expect(root.querySelector('[data-reserved="notice"] [data-not-running]')).not.toBeNull();
  });

  // spec: calculator-page › [CP43] messages are inert template elements, none rendered
  it('keeps the twelve errors, the four sentences, the copy states and the unit hints in templates', async () => {
    const root = await render('en');
    const byName = messagesOf(root);
    expect(Object.keys(byName)).toHaveLength(12 + 4 + 2 + 4);
    expect(root.querySelectorAll('template')).toHaveLength(12 + 4 + 2 + 4);
    expect(Object.keys(byName).filter((name) => name.startsWith('hint.'))).toEqual([
      'hint.ft',
      'hint.in',
      'hint.m',
      'hint.cm',
    ]);
    expect(byName['hint.cm']).toBe('centimeters');
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
    expect(root.querySelectorAll('template [data-output], template input')).toHaveLength(0);
    expect(messagesOf(await render('es'))['errors.MALFORMED']).toBe(esCommon['errors.MALFORMED']);
  });
});

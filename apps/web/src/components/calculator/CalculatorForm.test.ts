import { enConcrete } from '@maestro-calc/i18n/catalogs/en/concrete';
import { esConcrete } from '@maestro-calc/i18n/catalogs/es/concrete';
import { describe, expect, it } from 'vitest';
import { renderComponent } from '../../__testing__/render-component.ts';
import { pageView } from '../../lib/pages.ts';
import CalculatorForm from './CalculatorForm.astro';
import type { AreaField, FormView } from './model.ts';

const render = (locale: 'en' | 'es') =>
  renderComponent(CalculatorForm, { form: pageView('concrete', locale).form });

describe('CalculatorForm (calculator-page › Form controls, [CP11] static, [CP12], [CP41] static)', () => {
  // spec: calculator-page › [CP11] static: each input is in the HTML once, in the one order of the
  // form, and only the slab fields are visible
  it('holds each input once, in the order of the form, with only the slab visible', async () => {
    const root = await render('en');
    const rows = root
      .querySelectorAll('.calc-choice-area .calc-field')
      .map((row) => [row.querySelector('input')?.getAttribute('name'), row.hasAttribute('hidden')]);
    expect(rows).toEqual([
      ['length', false],
      ['width', false],
      ['thickness', false],
      ['footingWidth', true],
      ['footingDepth', true],
      ['diameter', true],
      ['height', true],
      ['stepWidth', true],
      ['rise', true],
      ['run', true],
      ['stepCount', true],
      ['count', true],
    ]);
    const names = root.querySelectorAll('input').map((input) => input.getAttribute('name'));
    expect(new Set(names).size).toBe(names.length);
  });

  // spec: calculator-page › [CP14], [CP55]: the choice area reserves its rows through `--calc-rows`
  it('renders the choice area with its reserved shape and four reserved rows', async () => {
    const area = (await render('en')).querySelector('.calc-choice-area');
    expect(area?.getAttribute('data-reserved')).toBe('shape');
    expect(area?.getAttribute('style')).toBe('--calc-rows:4');
  });

  // spec: calculator-page › Form controls: the default text of each input
  it('shows the default text of every field, in the unit the field is read in', async () => {
    const root = await render('en');
    const valueOf = (name: string) =>
      root.querySelector(`input[name="${name}"]`)?.getAttribute('value');
    expect(
      [
        'length',
        'width',
        'thickness',
        'footingWidth',
        'footingDepth',
        'diameter',
        'height',
        'stepWidth',
        'rise',
        'run',
        'stepCount',
        'count',
        'waste',
      ].map(valueOf),
    ).toEqual([
      '12 ft',
      '10 ft',
      '4 in',
      '16 in',
      '8 in',
      '12 in',
      '8 ft',
      '4 ft',
      '7 in',
      '11 in',
      '3',
      '1',
      '10',
    ]);
  });

  // spec: calculator-page › [CP51] a visible unit hint on every length field, tied to its input
  it.each([
    ['en', { ft: 'feet', in: 'inches' }],
    ['es', { ft: 'pies', in: 'pulgadas' }],
  ] as const)(
    'shows the %s unit hint beside every length field and describes it',
    async (locale, words) => {
      const root = await render(locale);
      const feet = ['length', 'width', 'height', 'stepWidth'];
      const inches = ['thickness', 'footingWidth', 'footingDepth', 'diameter', 'rise', 'run'];
      for (const [keys, word] of [
        [feet, words.ft],
        [inches, words.in],
      ] as const) {
        for (const key of keys) {
          const hint = root.querySelector(`#calc-${key}-hint`);
          expect(hint?.text, key).toBe(word);
          expect(hint?.tagName, key).toBe('SMALL');
          expect(
            root.querySelector(`input[name="${key}"]`)?.getAttribute('aria-describedby'),
            key,
          ).toBe(`calc-${key}-hint`);
        }
      }
      expect(root.querySelectorAll('small')).toHaveLength(10);
      for (const key of ['stepCount', 'count', 'bagPrice', 'readyMixPrice']) {
        expect(
          root.querySelector(`input[name="${key}"]`)?.hasAttribute('aria-describedby'),
          key,
        ).toBe(false);
      }
    },
  );

  // spec: calculator-page › Form controls: the waste help is tied to the waste input
  it('describes the waste input by its help text', async () => {
    const root = await render('en');
    const input = root.querySelector('input[name="waste"]');
    expect(input?.getAttribute('aria-describedby')).toBe('calc-waste-help');
    expect(root.querySelector('#calc-waste-help')?.text.trim()).toBe(
      enConcrete['calc.concrete.page.wasteHelp'],
    );
  });

  it('leaves the prices empty with the 0.00 placeholder', async () => {
    const root = await render('en');
    for (const name of ['bagPrice', 'readyMixPrice']) {
      const input = root.querySelector(`input[name="${name}"]`);
      expect(input?.getAttribute('value'), name).toBe('');
      expect(input?.getAttribute('placeholder'), name).toBe('0.00');
    }
  });

  // spec: calculator-page › [CP12] labels, keyboards, no submit button
  it.each([
    ['en', enConcrete],
    ['es', esConcrete],
  ] as const)(
    'labels every %s input with its catalog text and the right keyboard',
    async (locale, catalog) => {
      const root = await render(locale);
      const inputs = root.querySelectorAll('input');
      expect(inputs).toHaveLength(15);
      for (const input of inputs) {
        const name = input.getAttribute('name') ?? '';
        const label = root.querySelector(`label[for="${input.getAttribute('id') ?? ''}"]`);
        expect(label?.text.trim(), name).toBe(
          catalog[`calc.concrete.inputs.${name}` as keyof typeof catalog],
        );
        expect(input.getAttribute('autocomplete'), name).toBe('off');
        expect(input.getAttribute('inputmode'), name).toBe(
          name === 'count' || name === 'stepCount' ? 'numeric' : 'decimal',
        );
      }
      expect(new Set(inputs.map((input) => input.getAttribute('id'))).size).toBe(inputs.length);
      expect(root.querySelectorAll('button[type=submit], input[type=submit]')).toHaveLength(0);
      expect(
        root.querySelectorAll('button').every((button) => button.getAttribute('type') === 'button'),
      ).toBe(true);
    },
  );

  // spec: calculator-page › [CP11] single-choice buttons form a labelled group with aria-pressed
  it('exposes the unit, shape and bag choices as pressed buttons in labelled groups', async () => {
    const root = await render('en');
    const pressed = (selector: string) =>
      root
        .querySelectorAll(selector)
        .map((button) => [button.text.trim(), button.getAttribute('aria-pressed')]);
    expect(pressed('[data-unit]')).toEqual([
      ['US (ft, in)', 'true'],
      ['Metric (m, cm)', 'false'],
    ]);
    expect(pressed('[data-choice="shape"]')).toEqual([
      ['Slab', 'true'],
      ['Footing', 'false'],
      ['Column', 'false'],
      ['Steps', 'false'],
    ]);
    expect(pressed('[data-choice="bag"]')).toEqual([
      ['40 lb', 'false'],
      ['60 lb', 'false'],
      ['80 lb', 'true'],
    ]);
    const groups = root.querySelectorAll('[role=group]');
    expect(groups).toHaveLength(3);
    for (const group of groups) {
      const labelled = group.getAttribute('aria-labelledby') ?? '';
      expect(root.querySelector(`#${labelled}`)?.text.trim(), labelled).not.toBe('');
    }
  });

  // spec: calculator-page › [CP41] static: disabled controls, the script-only controls hidden
  it('renders every control disabled and hides the steppers and the copy button', async () => {
    const root = await render('en');
    const controls = root.querySelectorAll('input, button');
    expect(controls.length).toBeGreaterThan(20);
    expect(controls.every((control) => control.hasAttribute('disabled'))).toBe(true);
    expect(
      root.querySelectorAll('[data-step="waste"]').map((button) => button.hasAttribute('hidden')),
    ).toEqual([true, true]);
    expect(root.querySelector('[data-copy]')?.hasAttribute('hidden')).toBe(true);
    expect(root.querySelector('[data-copy]')?.text.trim()).toBe('Copy link');
    expect(root.querySelector('[data-step="waste"][data-direction="less"]')?.text.trim()).toBe(
      'Less extra',
    );
  });

  it('keeps the reserved areas of the form (shape area, copy status)', async () => {
    const root = await render('en');
    expect(
      root.querySelectorAll('[data-reserved]').map((el) => el.getAttribute('data-reserved')),
    ).toEqual(['shape', 'steppers', 'copy']);
    expect(root.querySelector('[data-copy-status]')?.getAttribute('role')).toBe('status');
    expect(root.querySelector('.calc-help')?.text.trim()).toBe(
      enConcrete['calc.concrete.page.wasteHelp'],
    );
  });

  // spec: calculator-web-core › [CWC29] and calculator-page › [CP58]: the form view, not a constant, sets the rows
  it('renders the reserved rows of the area the form view carries, five for a taller option', async () => {
    const field = (key: string, visible: boolean): AreaField => ({
      key,
      label: key.toUpperCase(),
      value: '1',
      mode: 'numeric',
      visible,
    });
    const form: FormView = {
      unitsLabel: 'Units',
      units: [{ id: 'imperial', label: 'US', pressed: true }],
      items: [
        {
          kind: 'choice',
          key: 'mode',
          label: 'Mode',
          choices: [
            { id: 'small', label: 'Small', pressed: true },
            { id: 'huge', label: 'Huge', pressed: false },
          ],
          area: {
            rows: 5,
            fields: [
              field('a', true),
              field('b', false),
              field('c', false),
              field('d', false),
              field('e', false),
            ],
          },
        },
        {
          kind: 'field',
          field: { key: 'rate', label: 'Rate', value: '5', mode: 'decimal' },
          stepper: { key: 'rate', less: 'Less', more: 'More' },
        },
        {
          kind: 'choice',
          key: 'other',
          label: 'Other',
          choices: [{ id: 'x', label: 'X', pressed: true }],
        },
      ],
      copyLabel: 'Copy',
    };
    const root = await renderComponent(CalculatorForm, { form });
    const area = root.querySelector('.calc-choice-area');
    expect(area?.getAttribute('data-reserved')).toBe('mode');
    expect(area?.getAttribute('style')).toBe('--calc-rows:5');
    expect(
      area
        ?.querySelectorAll('.calc-field')
        .map((row) => [
          row.querySelector('input')?.getAttribute('name'),
          row.hasAttribute('hidden'),
        ]),
    ).toEqual([
      ['a', false],
      ['b', true],
      ['c', true],
      ['d', true],
      ['e', true],
    ]);
    // the item order of the view is the order of the markup: choice with its area, field with its stepper, choice
    expect(
      root
        .querySelectorAll('[data-choice], [data-step], .calc-choice-area, input')
        .map(
          (el) =>
            el.getAttribute('data-choice') ??
            el.getAttribute('data-step') ??
            el.getAttribute('name') ??
            el.getAttribute('class'),
        ),
    ).toEqual([
      'mode',
      'mode',
      'calc-choice-area',
      'a',
      'b',
      'c',
      'd',
      'e',
      'rate',
      'rate',
      'rate',
      'other',
    ]);
    // a choice with no area and a field with no stepper render neither
    expect(root.querySelectorAll('.calc-choice-area')).toHaveLength(1);
    expect(root.querySelectorAll('.calc-steppers')).toHaveLength(1);
    expect(root.querySelector('[data-choice="other"]')?.getAttribute('data-value')).toBe('x');
    expect(root.querySelector('#calc-other-label')?.text.trim()).toBe('Other');
  });
});

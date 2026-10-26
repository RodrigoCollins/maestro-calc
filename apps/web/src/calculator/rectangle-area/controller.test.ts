import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { enCommon } from '@maestro-calc/i18n/catalogs/en/common';
import { enSite } from '@maestro-calc/i18n/catalogs/en/site';
import { describe, expect, it, vi } from 'vitest';
import {
  controllerOf,
  type Controller,
  type Environment,
  type Output as ControllerOutput,
  type UiEvent as ControllerEvent,
} from '../controller.ts';
import { definePage, type AnyCalculator } from '../page-module.ts';
import { rectangleAreaPage } from './page.ts';

type Output = ControllerOutput<typeof rectangleArea>;
type UiEvent = ControllerEvent<typeof rectangleArea>;

const ENV: Environment = {
  messages: {
    'errors.MALFORMED': enCommon['errors.MALFORMED'],
    'hint.ft': enSite['site.calculator.hintFt'],
    'hint.m': enSite['site.calculator.hintM'],
  },
  origin: 'https://example.test',
  path: '/area',
  switchPath: '/otro',
  helps: new Set(),
};

/** Applies the events in order from the page loaded with `search`; the last output. */
const last = (
  search: string,
  events: readonly UiEvent[] = [],
  page = rectangleAreaPage,
): Output => {
  const controller = controllerOf(page);
  let output = controller.start(ENV, search);
  for (const event of events) output = controller.applyEvent(ENV, output.state, event);
  return output;
};

const type = (key: 'length' | 'width', text: string): UiEvent => ({ type: 'text', key, text });
const units = (system: 'imperial' | 'metric'): UiEvent => ({ type: 'units', system });

/** The three figures of the page: ft², yd², m². */
const figures = ({ view }: Output) => [
  view.panel.figures.areaFt2,
  view.panel.figures.areaYd2,
  view.panel.figures.areaM2,
];

describe('rectangle-area through the generic controller (calculator-web-core › Rectangle-area headless proof)', () => {
  // spec: calculator-web-core › [CWC1] a minimal module
  it('starts from the defaults with no choice, stepper, shopping or cost data', () => {
    const out = last('');
    expect([out.view.fields.length.text, out.view.fields.width.text]).toEqual(['10 ft', '10 ft']);
    expect(figures(out)).toEqual(['100.00', '11.11', '9.29']);
    expect(out.view.choices).toEqual({});
    expect(out.view.visible).toEqual([]);
    expect(out.view.panel.shopping).toEqual([]);
    expect(out.view.panel.costs).toEqual({});
    expect(out.view.panel.primary).toEqual({
      key: 'areaFt2',
      before: '',
      value: '100.00',
      after: '',
    });
    expect(out.view.answer).toBeUndefined();
    expect(out.write).toBeUndefined();
    expect(rectangleAreaPage.steppers).toBeUndefined();
  });

  // spec: calculator-web-core › [CWC7] an invalid text blocks everything; 150 is read in feet
  it('dashes every figure for an invalid length and writes nothing, then recovers', () => {
    const bad = last('', [type('length', 'abc')]);
    expect(bad.view.fields.length).toMatchObject({
      invalid: true,
      message: enCommon['errors.MALFORMED'],
    });
    expect(figures(bad)).toEqual(['—', '—', '—']);
    expect(bad.write).toBeUndefined();
    const fixed = last('', [type('length', 'abc'), type('length', '150 in')]);
    expect(figures(fixed)).toEqual(['125.00', '13.89', '11.61']);
    expect(fixed.view.fields.width.text).toBe('10 ft');
    // a bare number is read in the default unit of the field, feet: 150 ft by 10 ft
    expect(figures(last('', [type('length', '150')]))).toEqual(['1,500.00', '166.67', '139.35']);
  });

  // spec: calculator-web-core › [CWC13] l and w are the URL keys of the second consumer
  it('restores a link and writes the metric toggle with the same keys', () => {
    const out = last('?v=1&l=150');
    expect([out.view.fields.length.text, out.view.fields.width.text]).toEqual([
      '12 ft 6 in',
      '10 ft',
    ]);
    expect(out.view.panel.figures.areaFt2).toBe('125.00');
    expect(last('?v=1&l=150', [units('metric')]).write).toBe('?v=1&u=m&l=150');
  });

  // spec: calculator-web-core › [CWC16] the metric toggle needs no optional slot
  it('toggles to metric with the metre hints and the same figures', () => {
    const out = last('', [units('metric')]);
    expect([out.view.fields.length.text, out.view.fields.width.text]).toEqual([
      '3.048 m',
      '3.048 m',
    ]);
    expect(figures(out)).toEqual(['100.00', '11.11', '9.29']);
    expect([out.view.fields.length.hint, out.view.fields.width.hint]).toEqual(['meters', 'meters']);
    expect(out.write).toBe('?v=1&u=m');
  });

  // spec: calculator-web-core › [CWC31] case A: 12 ft 6 in by 10 ft
  it('reads feet-and-inches marks and gives the case A figures', () => {
    expect(figures(last('', [type('length', `12' 6"`), type('width', `10'`)]))).toEqual([
      '125.00',
      '13.89',
      '11.61',
    ]);
  });

  // spec: calculator-web-core › [CWC16] a stepper press on a module with no stepper changes nothing
  it('ignores a step event because the module declares no stepper', () => {
    // widened to the any-calculator controller: the event union of this one has no percent key
    const controller: Controller<AnyCalculator> = controllerOf(rectangleAreaPage);
    const start = controller.start(ENV, '?v=1&l=150');
    const out = controller.applyEvent(ENV, start.state, {
      type: 'step',
      key: 'length',
      direction: 'more',
    });
    expect(out.state).toBe(start.state);
    expect(out.write).toBeUndefined();
    expect(out.view).toEqual(start.view);
  });

  // spec: calculator-web-core › [CWC6] the raw record holds the inputs of the definition and nothing else
  it('hands the engine a record with exactly length and width', () => {
    const validate = vi.fn(rectangleArea.validate);
    const page = definePage({ calculator: { ...rectangleArea, validate } });
    last('', [type('length', '20')], page);
    const [raw] = validate.mock.calls.at(-1) ?? [];
    expect(Object.keys(raw ?? {}).sort()).toEqual(['length', 'width']);
  });
});

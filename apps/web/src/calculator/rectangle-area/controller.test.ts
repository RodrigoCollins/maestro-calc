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
import { enRectangleArea } from '@maestro-calc/i18n/catalogs/en/rectangle-area';
import { esCommon } from '@maestro-calc/i18n/catalogs/es/common';
import { esRectangleArea } from '@maestro-calc/i18n/catalogs/es/rectangle-area';
import { esSite } from '@maestro-calc/i18n/catalogs/es/site';
import { slotFreePage } from '../../contract/__testing__/slot-free-page.ts';
import { pageViewOf } from '../../lib/page-view.ts';
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
const last = (search: string, events: readonly UiEvent[] = [], page = slotFreePage): Output => {
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

describe('a slot-free rectangle-area through the generic controller (calculator-web-core › Slot-free headless proof)', () => {
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
    expect(slotFreePage.steppers).toBeUndefined();
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
    const controller: Controller<AnyCalculator> = controllerOf(slotFreePage);
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

/** The environment of the real page in a locale: the messages are the page view's own templates. */
const envOf = (locale: 'en' | 'es'): Environment => {
  const catalog: Record<string, string> =
    locale === 'en'
      ? { ...enCommon, ...enRectangleArea, ...enSite }
      : { ...esCommon, ...esRectangleArea, ...esSite };
  return {
    ...ENV,
    messages: Object.fromEntries(pageViewOf(rectangleAreaPage, locale, catalog).messages),
  };
};

const answerOf = (locale: 'en' | 'es', search: string): Output => {
  const controller = controllerOf(rectangleAreaPage);
  return controller.start(envOf(locale), search);
};

/** The four hand-verified cases: query, [ft², yd², m²], the dimensions in each locale. */
const CASES = [
  ['v=1&l=144', ['120.00', '13.33', '11.15'], '12 ft by 10 ft', '12 ft por 10 ft'],
  ['v=1', ['100.00', '11.11', '9.29'], '10 ft by 10 ft', '10 ft por 10 ft'],
  ['v=1&l=150', ['125.00', '13.89', '11.61'], '12 ft 6 in by 10 ft', '12 ft 6 in por 10 ft'],
  ['v=1&l=240&w=180', ['300.00', '33.33', '27.87'], '20 ft by 15 ft', '20 ft por 15 ft'],
] as const;

describe('rectangle-area page: the answer through the controller (calc-rectangle-area)', () => {
  // spec: calc-rectangle-area › [RAP2] the default sentence per unit system and locale
  it.each([
    ['en', '', 'A 10 ft by 10 ft area is 100.00 square feet.'],
    ['es', '', 'Un área de 10 ft por 10 ft mide 100.00 pies cuadrados.'],
    ['en', '&u=m', 'A 3.05 m by 3.05 m area is 9.29 square meters.'],
    ['es', '&u=m', 'Un área de 3.05 m por 3.05 m mide 9.29 metros cuadrados.'],
  ] as const)('says the default %s sentence%s', (locale, units, sentence) => {
    expect(answerOf(locale, `?v=1${units}`).view.answer).toBe(sentence);
  });

  // spec: calc-rectangle-area › [RAP3] four cases, imperial: figures, large figure and the dimensions
  it.each(CASES)('gives %s the figures %j and names the dimensions', (query, shown, en, es) => {
    const out = answerOf('en', `?${query}`);
    expect(figures(out)).toEqual(shown);
    expect(out.view.panel.primary).toMatchObject({ key: 'areaFt2', value: shown[0] });
    expect(out.view.answer).toBe(`A ${en} area is ${shown[0]} square feet.`);
    expect(answerOf('es', `?${query}`).view.answer).toBe(
      `Un área de ${es} mide ${shown[0]} pies cuadrados.`,
    );
  });

  // spec: calc-rectangle-area › [RAP4] metric: the large figure is the m² value and the sentence ends with its unit
  it.each(CASES)('headlines the m² of %s under u=m with its unit', (query, shown) => {
    const en = answerOf('en', `?${query}&u=m`);
    expect(en.view.panel.primary).toMatchObject({ key: 'areaM2', value: shown[2] });
    expect(en.view.answer).toMatch(/square meters\.$/);
    expect(en.view.answer).toContain(`${shown[2]} square meters.`);
    const es = answerOf('es', `?${query}&u=m`);
    expect(es.view.answer).toMatch(/metros cuadrados\.$/);
    expect(es.view.answer).toContain(`${shown[2]} metros cuadrados.`);
  });
});

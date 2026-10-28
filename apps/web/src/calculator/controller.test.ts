import { inch, Rational, valueIn } from '@maestro-calc/core';
import { rectangleArea } from '@maestro-calc/core/calculators/rectangle-area';
import { describe, expect, it } from 'vitest';
import {
  choiceCalculator,
  hintedCalculator,
  moneyCalculator,
  pageModuleErrorOf,
  percentCalculator,
  shoppingCalculator,
} from '../__testing__/page-fixtures.ts';
import { controllerOf, type Environment, type UiEvent } from './controller.ts';
import { definePage, type Ready } from './page-module.ts';
import { choiceSlot } from './slots/choices.ts';
import type { Plan } from './slots/drawing.ts';
import { shoppingSlot } from './slots/shopping.ts';
import { stepperSlot } from './slots/steppers.ts';

const ENV: Environment = {
  messages: {},
  origin: 'https://example.test',
  path: '/fixture',
  switchPath: '/otro',
  helps: new Set(),
};

const line = (material: string, unit: string) => ({
  material,
  label: 'line',
  parts: () => ({ unit, fills: {} }),
});

describe('the shopping check (calculator-web-core › [CWC3], K15, M-4)', () => {
  const declared = (...materials: [string, string][]) =>
    shoppingSlot(
      shoppingCalculator,
      materials.map(([material, unit]) => line(material, unit)),
    );

  // spec: calculator-web-core › [CWC3] a declared material the engine does not return fails at creation
  it('throws SHOPPING_LINES when the controller is created with materials the engine lacks', () => {
    const module = definePage({
      calculator: shoppingCalculator,
      shopping: declared(['alpha', 'box-a'], ['gamma', 'bag-g']),
    });
    const error = pageModuleErrorOf(() => controllerOf(module));
    expect(error.code).toBe('SHOPPING_LINES');
    expect(error.cause).toEqual({ id: 'shopping-fixture' });
  });

  it('checks a module that declares no line, because the engine returns two', () => {
    const module = definePage({ calculator: shoppingCalculator });
    expect(pageModuleErrorOf(() => controllerOf(module)).code).toBe('SHOPPING_LINES');
  });

  // spec: calculator-web-core › [CWC3] two lines in the declared order, matched by material
  it('shows the lines in declared order when the engine returns them in the other order', () => {
    const module = definePage({
      calculator: shoppingCalculator,
      shopping: declared(['alpha', 'box-a'], ['beta', 'bag-b']),
    });
    const { view } = controllerOf(module).start(ENV, '');
    expect(view.panel.shopping.map(({ material, qty }) => [material, qty])).toEqual([
      ['alpha', '1,234'],
      ['beta', '7'],
    ]);
  });

  // spec: calculator-web-core › [CWC3] a later run that drifts from the declared lines fails too
  it('throws SHOPPING_LINES on a later run whose lines drift', () => {
    const module = definePage({
      calculator: shoppingCalculator,
      shopping: declared(['alpha', 'box-a'], ['beta', 'bag-b']),
    });
    const controller = controllerOf(module);
    expect(pageModuleErrorOf(() => controller.start(ENV, '?v=1&c1=2')).code).toBe('SHOPPING_LINES');
  });
});

describe('a money primary (calculator-web-core › Page-module contract: primary output)', () => {
  // spec: calculator-web-core › Generic controller behaviour: a money output is shown through moneyText
  it('shows the cost in the sentence named for its measure', () => {
    const { view } = controllerOf(definePage({ calculator: moneyCalculator })).start(
      { ...ENV, messages: { money: 'Total {value} dollars' } },
      '',
    );
    expect(view.panel.primary).toEqual({
      key: 'cost',
      before: 'Total ',
      value: '$5.00',
      after: ' dollars',
    });
  });
});

describe('a module with no slot (calculator-web-core › [CWC1], [CWC24])', () => {
  const controller = controllerOf(definePage({ calculator: percentCalculator(20) }));

  // spec: calculator-web-core › Page-module contract: the primary is the role: primary output
  it('shows the output with the primary role, with no sentence around it, and nothing else', () => {
    const { view } = controller.start(ENV, '');
    expect(view.panel.primary).toEqual({ key: 'total', before: '', value: '0.00', after: '' });
    expect(view.panel.figures).toEqual({ total: '0.00' });
    expect(view.panel.shopping).toEqual([]);
    expect(view.panel.costs).toEqual({});
    expect(view.answer).toBeUndefined();
    expect(view.visible).toEqual([]);
    expect(Object.values(view.fields).some(({ hidden }) => hidden)).toBe(false);
  });

  // spec: calculator-web-core › Generic controller behaviour: an event the module lacks changes nothing
  it('ignores a step event, for there is no stepper', () => {
    const started = controller.start(ENV, '');
    const stepped = controller.applyEvent(ENV, started.state, {
      type: 'step',
      key: 'tip',
      direction: 'more',
    });
    expect(stepped.state).toBe(started.state);
    expect(stepped.write).toBeUndefined();
  });

  it('ignores a choice event for a select the definition lacks and an option it lacks', () => {
    const started = controller.start(ENV, '');
    const unknownSelect = controller.applyEvent(ENV, started.state, {
      type: 'choice',
      select: 'nope' as never,
      option: 'x',
    });
    expect(unknownSelect.state).toBe(started.state);
    const inputOnly = controllerOf(definePage({ calculator: choiceCalculator }));
    const first = inputOnly.start(ENV, '');
    const unknownOption = inputOnly.applyEvent(ENV, first.state, {
      type: 'choice',
      select: 'mode',
      option: 'enormous',
    });
    expect(unknownOption.state).toBe(first.state);
    expect(unknownOption.write).toBeUndefined();
  });
});

describe('the stepper through the slot (calculator-page › [CP22], [CP57])', () => {
  const calculator = percentCalculator(20);
  const controller = controllerOf(
    definePage({ calculator, steppers: stepperSlot(calculator, { tip: Rational.of(5) }) }),
  );
  const press = (text: string, direction: 'less' | 'more') => {
    const started = controller.start(ENV, '');
    const typed = controller.applyEvent(ENV, started.state, { type: 'text', key: 'tip', text });
    return controller.applyEvent(ENV, typed.state, { type: 'step', key: 'tip', direction });
  };

  it('moves the value by the step and writes the query', () => {
    const out = press('10', 'more');
    expect(out.view.fields.tip.text).toBe('15');
    expect(out.write).toBe('?v=1&p1=15');
  });

  // spec: calculator-page › [CP57] the maximum is the descriptor's
  it('changes nothing when the value is already at the descriptor bound', () => {
    const atBound = press('20', 'more');
    const typed = press('20', 'less');
    expect(atBound.write).toBeUndefined();
    expect(atBound.view.fields.tip.text).toBe('20');
    expect(typed.view.fields.tip.text).toBe('15');
  });

  it('ignores a step event for a key it does not step', () => {
    const started = controller.start(ENV, '');
    const stepped = controller.applyEvent(ENV, started.state, {
      type: 'step',
      key: 'open' as never,
      direction: 'more',
    });
    expect(stepped.state).toBe(started.state);
  });
});

describe('a choice group of a fixture (calculator-web-core › [CWC28], [CWC29])', () => {
  const calculator = choiceCalculator;
  const controller = controllerOf(
    definePage({
      calculator,
      choices: choiceSlot(calculator, [
        {
          select: 'mode',
          shows: { small: ['one'], large: ['one', 'two', 'three'], huge: ['four', 'five'] },
        },
      ]),
    }),
  );

  it('shows the fields of the pressed option and hides the other driven fields', () => {
    const started = controller.start(ENV, '');
    expect(started.view.visible).toEqual(['one']);
    expect(started.view.fields.two.hidden).toBe(true);
    const large = controller.applyEvent(ENV, started.state, {
      type: 'choice',
      select: 'mode',
      option: 'large',
    });
    expect(large.view.visible).toEqual(['one', 'two', 'three']);
    expect(large.view.fields.three.hidden).toBe(false);
    expect(large.view.fields.four.hidden).toBe(true);
    expect(large.write).toBe('?v=1&m1=large');
    expect(large.view.choices).toEqual({ mode: 'large', other: 'x' });
  });
});

describe('the output check at creation (calculator-web-core › [CWC3])', () => {
  const decimal = { unit: 'ft', format: 'decimal', places: 2 } as const;
  const fraction = { unit: 'in', format: 'fraction', denominator: 16 } as const;

  it('creates a controller when every figured output has a decimal hint', () => {
    const module = definePage({ calculator: hintedCalculator({ span: decimal, edge: decimal }) });
    expect(controllerOf(module).start(ENV, '').view.panel.figures).toEqual({
      span: '1.00',
      edge: '0.50',
    });
  });

  it.each([
    ['a fraction hint on a secondary output', { span: decimal, edge: fraction }, 'edge'],
    ['a fraction hint on the primary output', { span: fraction, edge: decimal }, 'span'],
    ['a primary output with no hint', { edge: decimal }, 'span'],
  ] as const)('throws OUTPUT_HINT at creation for %s', (_what, hints, at) => {
    const module = definePage({ calculator: hintedCalculator(hints) });
    const error = pageModuleErrorOf(() => controllerOf(module));
    expect(error.code).toBe('OUTPUT_HINT');
    expect(error.cause).toEqual({ id: 'hinted-fixture', at });
  });

  it('checks the primary of each unit system', () => {
    const calculator = hintedCalculator({ span: decimal, edge: decimal });
    const module = definePage({ calculator, primary: { imperial: 'span', metric: 'edge' } });
    expect(() => controllerOf(module)).not.toThrow();
    const unhinted = hintedCalculator({ span: decimal });
    const broken = definePage({
      calculator: unhinted,
      primary: { imperial: 'span', metric: 'edge' },
    });
    expect(pageModuleErrorOf(() => controllerOf(broken)).cause).toEqual({
      id: 'hinted-fixture',
      at: 'edge',
    });
  });
});

describe('the plan of each ready moment (calculator-web-core › [CWC41]; blueprint-drawing › [BD10], [BD19])', () => {
  const FRAME = { width: 300, height: 200 };
  const PLAN_ENV: Environment = { ...ENV, messages: { drawing: 'Plan of {length}' } };
  type Moment = Ready<typeof rectangleArea>;
  const inches = ({ valid }: Moment): string =>
    `${String(valueIn(valid.length, inch).toNumber())} in`;
  /** A stub geometry: one label with the length in inches, and the name as a page message. */
  const drawn = (plan: (moment: Moment) => ReturnType<typeof stub> | null) =>
    definePage({
      calculator: rectangleArea,
      drawing: { frame: FRAME, messages: ['drawing'], plan },
    });
  const stub = (moment: Moment) => ({
    name: { message: 'drawing', fills: { length: inches(moment) } },
    outline: [{ kind: 'rect' as const, x: 1, y: 2, w: 3, h: 4 }],
    lines: [{ d: 'M1 2L3 4', tone: 'helper' as const }],
    labels: [
      {
        x: 5,
        y: 6,
        anchor: 'middle' as const,
        size: 17 as const,
        tone: 'dimension' as const,
        label: { text: inches(moment) },
      },
    ],
  });
  const length = (text: string): UiEvent<typeof rectangleArea> => ({
    type: 'text',
    key: 'length',
    text,
  });

  /** The plans of the start and of each event in turn, as the mount hands them to the writer. */
  const plans = (module: ReturnType<typeof drawn>, events: readonly string[]) => {
    const controller = controllerOf(module);
    let output = controller.start(PLAN_ENV, '');
    const seen = [output.view.plan];
    for (const text of events) {
      output = controller.applyEvent(PLAN_ENV, output.state, length(text));
      seen.push(output.view.plan);
    }
    return seen;
  };

  // spec: calculator-web-core › [CWC41], blueprint-drawing › [BD10] a plan per valid moment, none for abc
  it('gives a plan for the default, 20 ft and 15 ft, and none while abc is typed', () => {
    const seen = plans(drawn(stub), ['20 ft', 'abc', '15 ft']);
    expect(seen.map((plan) => plan?.labels.map(({ text }) => text))).toEqual([
      ['120 in'],
      ['240 in'],
      undefined,
      ['180 in'],
    ]);
  });

  it('resolves the labels and the name to text through the page messages, with the frame', () => {
    const [plan] = plans(drawn(stub), []);
    expect(plan).toEqual({
      frame: FRAME,
      name: 'Plan of 120 in',
      outline: [{ kind: 'rect', x: 1, y: 2, w: 3, h: 4 }],
      lines: [{ d: 'M1 2L3 4', tone: 'helper' }],
      labels: [{ x: 5, y: 6, anchor: 'middle', size: 17, tone: 'dimension', text: '120 in' }],
    });
  });

  it('reads a missing message as empty, so a label never shows its key', () => {
    const controller = controllerOf(drawn(stub));
    expect(controller.start(ENV, '').view.plan?.name).toBe('');
  });

  // The page writes only the declared messages into its inert template, so a plan naming another
  // one would mount with an empty name or label: creation fails instead (calculator-web-core › [CWC3])
  /** The stub with its one label a page message instead of a text, and a plain-text name. */
  const labelled = (moment: Moment): Plan => ({
    ...stub(moment),
    name: { text: 'plan' },
    labels: stub(moment).labels.map((label) => ({
      ...label,
      label: { message: 'side', fills: {} },
    })),
  });
  it.each<[string, (moment: Moment) => Plan, string]>([
    ['the name', stub, 'drawing'],
    ['a label', labelled, 'side'],
  ])(
    'throws PAGE_KEY at creation when %s of the default plan is an undeclared message',
    (_what, plan, at) => {
      const module = definePage({
        calculator: rectangleArea,
        drawing: { frame: FRAME, messages: ['other'], plan },
      });
      const error = pageModuleErrorOf(() => controllerOf(module));
      expect(error.code).toBe('PAGE_KEY');
      expect(error.cause).toEqual({ id: 'rectangle-area', at });
    },
  );

  it('creates the controller when every message of the default plan is declared', () => {
    expect(() => controllerOf(drawn(stub))).not.toThrow();
  });

  // spec: blueprint-drawing › [BD19] input: a state with no plan gives null, so the box empties
  it('gives null for a state the page does not draw', () => {
    expect(
      plans(
        drawn(() => null),
        ['20 ft', 'abc'],
      ),
    ).toEqual([null, null, undefined]);
  });

  // spec: calculator-web-core › [CWC44] a module with no drawing slot runs no drawing code
  it('gives no plan at all to a module with no drawing slot', () => {
    expect(plans(definePage({ calculator: rectangleArea }), ['20 ft', 'abc'])).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
  });
});

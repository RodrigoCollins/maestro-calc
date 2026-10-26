import { Rational } from '@maestro-calc/core';
import { describe, expect, it } from 'vitest';
import {
  choiceCalculator,
  moneyCalculator,
  pageModuleErrorOf,
  percentCalculator,
  shoppingCalculator,
} from '../__testing__/page-fixtures.ts';
import { controllerOf, type Environment } from './controller.ts';
import { definePage } from './page-module.ts';
import { choiceSlot } from './slots/choices.ts';
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
  fill: 'unit',
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

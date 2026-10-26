import { describe, expect, it } from 'vitest';
import {
  choiceCalculator,
  formCalculator,
  pageModuleErrorOf,
} from '../__testing__/page-fixtures.ts';
import { concretePage } from './concrete/page.ts';
import { formOf } from './form-layout.ts';
import { definePage } from './page-module.ts';
import { rectangleAreaPage } from './rectangle-area/page.ts';
import { choiceSlot } from './slots/choices.ts';

const TWELVE = [
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
];

describe('formOf (calculator-web-core › [CWC30], [CWC28])', () => {
  // spec: calculator-web-core › [CWC28] the concrete form in definition order, the shape area reserves four rows
  it('lays the concrete form out as the shape choice with its area, then the fields and the bag choice', () => {
    expect(formOf(concretePage)).toEqual([
      { kind: 'choice', select: 'shape', area: { fields: TWELVE, rows: 4 } },
      { kind: 'field', key: 'waste', stepper: true },
      { kind: 'choice', select: 'bag' },
      { kind: 'field', key: 'bagPrice', stepper: false },
      { kind: 'field', key: 'readyMixPrice', stepper: false },
    ]);
  });

  // spec: calculator-web-core › [CWC30] a module with no choice group reserves no choice-driven block
  it('lays rectangle-area out as its two fields and no choice item', () => {
    expect(formOf(rectangleAreaPage)).toEqual([
      { kind: 'field', key: 'length', stepper: false },
      { kind: 'field', key: 'width', stepper: false },
    ]);
  });

  it('gives a select with a slot group its area and keeps the plain fields after it', () => {
    const page = definePage({
      calculator: formCalculator,
      choices: choiceSlot(formCalculator, [
        { select: 'mode', shows: { small: ['a'], large: ['a', 'b'] } },
      ]),
    });
    expect(formOf(page)).toEqual([
      { kind: 'choice', select: 'mode', area: { fields: ['a', 'b'], rows: 2 } },
      { kind: 'field', key: 'c', stepper: false },
      { kind: 'field', key: 'd', stepper: false },
      { kind: 'field', key: 'e', stepper: false },
    ]);
  });

  // spec: calculator-web-core › Page-view builder: the form order is the declaration order
  it('throws FORM_ORDER when a driven field does not directly follow its select', () => {
    const gap = definePage({
      calculator: formCalculator,
      choices: choiceSlot(formCalculator, [
        { select: 'mode', shows: { small: ['a'], large: ['a', 'c'] } },
      ]),
    });
    const error = pageModuleErrorOf(() => formOf(gap));
    expect(error.code).toBe('FORM_ORDER');
    expect(error.cause).toEqual({ id: 'form-fixture', at: 'mode' });
  });

  it('throws FORM_ORDER for a boolean input, which the page has no control for', () => {
    const error = pageModuleErrorOf(() => formOf(definePage({ calculator: choiceCalculator })));
    expect(error.code).toBe('FORM_ORDER');
    expect(error.cause).toEqual({ id: 'choice-fixture', at: 'flag' });
  });
});

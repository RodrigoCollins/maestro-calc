import { describe, expect, it } from 'vitest';
import { choiceCalculator, pageModuleErrorOf } from '../../__testing__/page-fixtures.ts';
import { concrete } from '../../lib/concrete.ts';
import { SHAPE_FIELDS } from '../concrete/shapes.ts';
import { choiceSlot } from './choices.ts';

describe('choiceSlot (calculator-web-core › Reserved height from the choice group)', () => {
  const slot = choiceSlot(concrete, [{ select: 'shape', shows: SHAPE_FIELDS }]);
  const [shape] = slot.groups;

  // spec: calculator-web-core › [CWC28], calculator-page › [CP11] the fields of each shape
  it('shows the fields of each option in the order of the table', () => {
    expect(slot.groups).toHaveLength(1);
    expect(shape?.select).toBe('shape');
    expect(shape?.shown('slab')).toEqual(['length', 'width', 'thickness']);
    expect(shape?.shown('footing')).toEqual(['length', 'footingWidth', 'footingDepth', 'count']);
    expect(shape?.shown('column')).toEqual(['diameter', 'height', 'count']);
    expect(shape?.shown('steps')).toEqual(['stepWidth', 'rise', 'run', 'stepCount']);
  });

  it('shows nothing for an option it does not know', () => {
    expect(shape?.shown('pyramid')).toEqual([]);
  });

  it('drives the union of those fields in definition order', () => {
    expect(shape?.driven).toEqual([
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
    ]);
  });

  // spec: calculator-web-core › [CWC28] concrete reserves four rows
  it('reserves the rows of the tallest option', () => {
    expect(shape?.rows).toBe(4);
  });

  // spec: calculator-web-core › [CWC29], calculator-page › [CP58] a taller option grows the area
  it('reserves five rows when one option shows five fields, with no constant edited', () => {
    const fixture = choiceSlot(choiceCalculator, [
      {
        select: 'mode',
        shows: {
          small: ['one'],
          large: ['one', 'two', 'three'],
          huge: ['one', 'two', 'three', 'four', 'five'],
        },
      },
    ]);
    expect(fixture.groups[0]?.rows).toBe(5);
    expect(fixture.groups[0]?.driven).toEqual(['one', 'two', 'three', 'four', 'five']);
  });

  // spec: calculator-web-core › [CWC2] every select is a choice group; the slot only adds fields
  it('accepts no group at all', () => {
    expect(choiceSlot(concrete, []).groups).toEqual([]);
  });

  it('throws CHOICE_OPTIONS for an option with no entry', () => {
    const error = pageModuleErrorOf(() =>
      choiceSlot(concrete, [{ select: 'shape', shows: { slab: ['length'] } }]),
    );
    expect(error.code).toBe('CHOICE_OPTIONS');
    expect(error.cause).toEqual({ id: 'concrete', select: 'shape' });
  });

  it('throws CHOICE_OPTIONS for a key that is not a select input', () => {
    const error = pageModuleErrorOf(() =>
      choiceSlot(concrete, [{ select: 'width' as never, shows: {} }]),
    );
    expect(error.code).toBe('CHOICE_OPTIONS');
  });

  it.each(['flag', 'other', 'missing'] as const)(
    'throws CHOICE_OPTIONS when an option shows %s, which is not a text input',
    (key) => {
      const error = pageModuleErrorOf(() =>
        choiceSlot(choiceCalculator, [
          {
            select: 'mode',
            shows: { small: ['one'], large: [key as never], huge: ['two'] },
          },
        ]),
      );
      expect(error.code).toBe('CHOICE_OPTIONS');
      expect(error.cause).toEqual({ id: 'choice-fixture', select: 'mode', key });
    },
  );
});

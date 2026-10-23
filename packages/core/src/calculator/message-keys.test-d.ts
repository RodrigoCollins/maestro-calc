import { describe, expectTypeOf, it } from 'vitest';
import { fixtureBox } from '../__testing__/fixture-box.ts';
import { picker, rectangle } from '../__testing__/message-key-fixtures.ts';
import type { MessageKeysOf } from './message-keys.ts';

describe('MessageKeysOf (i18n-catalog › Key naming convention)', () => {
  // spec: i18n-catalog › Option keys [IN4]
  it('is the literal union of the keys of fixture-box', () => {
    expectTypeOf<MessageKeysOf<typeof fixtureBox>>().toEqualTypeOf<
      | 'calc.fixture-box.title'
      | 'calc.fixture-box.inputs.len'
      | 'calc.fixture-box.inputs.cnt'
      | 'calc.fixture-box.inputs.pct'
      | 'calc.fixture-box.inputs.sel'
      | 'calc.fixture-box.inputs.flg'
      | 'calc.fixture-box.inputs.prc'
      | 'calc.fixture-box.options.sel.x'
      | 'calc.fixture-box.options.sel.y'
      | 'calc.fixture-box.outputs.area'
      | 'calc.fixture-box.outputs.cost'
      | 'calc.fixture-box.warnings.bigCount'
    >();
  });

  it('pairs each select field with its own options and lists every warning', () => {
    // the option ids are still literals in the inputs `compute` receives
    type Inputs = Parameters<typeof picker.compute>[0];
    expectTypeOf<Inputs['shape']>().toEqualTypeOf<'round' | 'flat'>();
    expectTypeOf<Inputs['grade']>().toEqualTypeOf<'one'>();
    expectTypeOf(picker.id).toEqualTypeOf<'picker'>();
    expectTypeOf<MessageKeysOf<typeof picker>>().toEqualTypeOf<
      | 'calc.picker.title'
      | 'calc.picker.inputs.shape'
      | 'calc.picker.inputs.trim'
      | 'calc.picker.inputs.grade'
      | 'calc.picker.options.shape.round'
      | 'calc.picker.options.shape.flat'
      | 'calc.picker.options.grade.one'
      | 'calc.picker.outputs.weight'
      | 'calc.picker.warnings.heavy'
      | 'calc.picker.warnings.bulky'
    >();
  });

  // spec: i18n-catalog › Convention for the proof calculator [IN3a]
  it('has no option and no warning key for a calculator without selects or warnings', () => {
    expectTypeOf<MessageKeysOf<typeof rectangle>>().toEqualTypeOf<
      | 'calc.rectangle-area.title'
      | 'calc.rectangle-area.inputs.length'
      | 'calc.rectangle-area.inputs.width'
      | 'calc.rectangle-area.outputs.areaFt2'
      | 'calc.rectangle-area.outputs.areaYd2'
      | 'calc.rectangle-area.outputs.areaM2'
    >();
  });

  it('names no key of another calculator or of an undeclared warning', () => {
    expectTypeOf<'calc.picker.options.shape.one'>().not.toExtend<MessageKeysOf<typeof picker>>();
    expectTypeOf<'calc.picker.warnings.nope'>().not.toExtend<MessageKeysOf<typeof picker>>();
  });
});

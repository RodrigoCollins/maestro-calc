import { describe, expect, it } from 'vitest';
import { fixtureBox } from '../__testing__/fixture-box.ts';
import { picker, rectangle } from '../__testing__/message-key-fixtures.ts';
import { messageKeysOf } from './message-keys.ts';

describe('messageKeysOf (i18n-catalog › Key naming convention)', () => {
  // spec: i18n-catalog › Option keys [IN4]
  it('lists the title, inputs, options, outputs and warnings of fixture-box in that order', () => {
    expect(messageKeysOf(fixtureBox)).toEqual([
      'calc.fixture-box.title',
      'calc.fixture-box.inputs.len',
      'calc.fixture-box.inputs.cnt',
      'calc.fixture-box.inputs.pct',
      'calc.fixture-box.inputs.sel',
      'calc.fixture-box.inputs.flg',
      'calc.fixture-box.inputs.prc',
      'calc.fixture-box.options.sel.x',
      'calc.fixture-box.options.sel.y',
      'calc.fixture-box.outputs.area',
      'calc.fixture-box.outputs.cost',
      'calc.fixture-box.warnings.bigCount',
    ]);
  });

  // spec: i18n-catalog › Convention for the proof calculator [IN3a]
  it('lists no option and no warning key for a calculator without selects or warnings', () => {
    expect(messageKeysOf(rectangle)).toEqual([
      'calc.rectangle-area.title',
      'calc.rectangle-area.inputs.length',
      'calc.rectangle-area.inputs.width',
      'calc.rectangle-area.outputs.areaFt2',
      'calc.rectangle-area.outputs.areaYd2',
      'calc.rectangle-area.outputs.areaM2',
    ]);
  });

  it('lists the options of every select field under its own key, then outputs and warnings', () => {
    expect(messageKeysOf(picker)).toEqual([
      'calc.picker.title',
      'calc.picker.inputs.shape',
      'calc.picker.inputs.trim',
      'calc.picker.inputs.grade',
      'calc.picker.options.shape.round',
      'calc.picker.options.shape.flat',
      'calc.picker.options.grade.one',
      'calc.picker.outputs.weight',
      'calc.picker.warnings.heavy',
      'calc.picker.warnings.bulky',
    ]);
  });
});

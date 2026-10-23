import { describe, expect, it } from 'vitest';
import { fixtureBox } from '../__testing__/fixture-box.ts';
import { usd } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { err, ok } from '../result.ts';
import { inch } from '../units/catalog.ts';
import { multiply } from '../units/ops.ts';
import { quantity } from '../units/quantity.ts';
import { defineCalculator } from './define.ts';
import { validateRecord } from './validate.ts';

const validate = (raw: Readonly<Record<string, unknown>>): unknown =>
  validateRecord(fixtureBox.inputs, raw);

const defaults = {
  len: quantity(12, inch),
  cnt: 3,
  pct: Rational.of(10),
  sel: 'x',
  flg: false,
  prc: usd(Rational.of(249, 50)),
};

describe('validateRecord (calculator-contract › Total validation without silent coercion)', () => {
  // spec: calculator-contract › Empty record yields defaults [CC9]
  it('takes the default of every field absent from the record', () => {
    expect(validate({})).toEqual(ok(defaults));
  });

  // spec: calculator-contract › Unknown keys and undefined [CC20]
  it('treats undefined as absent and ignores undeclared keys', () => {
    expect(validate({ zzz: 1, len: undefined })).toEqual(ok(defaults));
    expect(validate({ zzz: 'x', cnt: undefined, sel: undefined, flg: undefined })).toEqual(
      ok(defaults),
    );
  });

  it('returns the value with its keys in declaration order', () => {
    const result = validateRecord(fixtureBox.inputs, {});
    expect(result.ok && Object.keys(result.value)).toEqual([
      'len',
      'cnt',
      'pct',
      'sel',
      'flg',
      'prc',
    ]);
  });

  // An inherited property is not a value the caller gave: a field may be named like one.
  it('does not read inherited properties as values', () => {
    const inherited = defineCalculator({
      id: 'inherited',
      inputs: [
        { kind: 'count', key: 'valueOf', urlKey: 'a', default: 4 },
        { kind: 'boolean', key: 'toString', urlKey: 'b', default: true },
      ],
      outputs: [{ key: 'area', measure: 'area', role: 'primary' }],
      compute: () => ({
        outputs: { area: multiply(quantity(1, inch), quantity(1, inch)) },
        shopping: [],
        warnings: [],
      }),
    });
    expect(validateRecord(inherited.inputs, {})).toEqual(ok({ valueOf: 4, toString: true }));
  });

  // Kinds are added one at a time (tasks 9.7 and 9.8): until a kind parses, a given value is
  // refused rather than accepted unchecked, and the errors follow the declaration order.
  it('refuses a given value that no kind parses yet, in declaration order', () => {
    expect(validate({ cnt: '7', len: '5', zzz: 1 })).toEqual({
      ok: false,
      errors: [
        { field: 'len', code: 'MALFORMED' },
        { field: 'cnt', code: 'MALFORMED' },
      ],
    });
    expect(validate({ flg: true })).toEqual(err({ field: 'flg', code: 'MALFORMED' }));
  });
});

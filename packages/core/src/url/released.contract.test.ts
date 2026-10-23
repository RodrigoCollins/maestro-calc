import { describe, expect, it } from 'vitest';
import { compareReleased, type ReleasedField } from './released-harness.ts';
import { defineCalculator } from '../calculator/define.ts';
import type { InputDescriptor } from '../calculator/descriptors.ts';
import { inch } from '../units/catalog.ts';
import { quantity } from '../units/quantity.ts';
import { decode, type UrlCodable } from './codec.ts';

/**
 * The public URL contract (url-state-codec › Key stability rules, rule 8): one ordered tuple per
 * input of every released calculator. A tuple is never modified or removed and a released
 * calculator never disappears; appending fields and calculators is allowed. The snapshot stays
 * empty until the first calculator ships in PR 12.
 */
const RELEASED: readonly ReleasedField[] = [];

/** Every calculator that has been released. */
const REGISTRY: readonly UrlCodable[] = [];

const lengthInput = (key: string, urlKey: string, inches: number): InputDescriptor => ({
  kind: 'length',
  key,
  urlKey,
  default: quantity(inches, inch),
  defaultUnit: 'ft',
  metricDefaultUnit: 'm',
});

/** A calculator shaped like the first one to ship (`rectangle-area`) with the given inputs. */
const area = (inputs: readonly [InputDescriptor, ...InputDescriptor[]], id = 'rectangle-area') =>
  defineCalculator({
    id,
    inputs,
    outputs: [{ key: 'size', measure: 'length', role: 'primary' }],
    compute: () => ({ outputs: { size: quantity(1, inch) }, shopping: [], warnings: [] }),
  });

const LENGTH: ReleasedField = {
  calculatorId: 'rectangle-area',
  key: 'length',
  urlKey: 'l',
  kind: 'length',
  default: '120',
};
const WIDTH: ReleasedField = { ...LENGTH, key: 'width', urlKey: 'w' };
const snapshot = [LENGTH, WIDTH];
const current = () => area([lengthInput('length', 'l', 120), lengthInput('width', 'w', 120)]);

describe('released url keys (url-state-codec › Key stability rules)', () => {
  it('holds for every released calculator', () => {
    expect(compareReleased(RELEASED, REGISTRY)).toEqual([]);
  });

  describe('harness', () => {
    it('accepts a calculator that matches its snapshot', () => {
      expect(compareReleased(snapshot, [current()])).toEqual([]);
    });

    // spec: Registry guards existing keys [UC21]
    it('fails when a url key is renamed from l to len', () => {
      const renamed = area([lengthInput('length', 'len', 120), lengthInput('width', 'w', 120)]);
      expect(compareReleased(snapshot, [renamed])).toEqual([
        'rectangle-area.length: url key changed from "l" to "len"',
      ]);
    });

    // spec: Default change rejected [UC22]
    it('fails when a length default changes from 120 to 144', () => {
      const retuned = area([lengthInput('length', 'l', 144), lengthInput('width', 'w', 120)]);
      expect(compareReleased(snapshot, [retuned])).toEqual([
        'rectangle-area.length: default changed from "120" to "144"',
      ]);
    });

    // spec: Additive change allowed [UC23]
    it('accepts an appended field, and an old link decodes with its default', () => {
      const widened = area([
        lengthInput('length', 'l', 120),
        lengthInput('width', 'w', 120),
        { kind: 'boolean', key: 'hole', urlKey: 'h', default: true },
      ]);
      expect(compareReleased(snapshot, [widened])).toEqual([]);
      expect(decode(widened, 'v=1&l=150').state).toEqual({
        length: quantity(150, inch),
        width: quantity(120, inch),
        hole: true,
      });
    });

    it('accepts an appended calculator', () => {
      const other = area([lengthInput('side', 's', 12)], 'square-area');
      expect(compareReleased(snapshot, [current(), other])).toEqual([]);
    });

    it('fails when a tuple is removed or a released calculator vanishes', () => {
      const narrowed = area([lengthInput('length', 'l', 120)]);
      expect(compareReleased(snapshot, [narrowed])).toEqual([
        'rectangle-area.width: field removed',
      ]);
      expect(compareReleased(snapshot, [])).toEqual([
        'rectangle-area: released calculator is missing',
      ]);
    });

    it('fails when a key or a kind changes, and when a field is inserted before others', () => {
      const keyed = area([lengthInput('long', 'l', 120), lengthInput('width', 'w', 120)]);
      expect(compareReleased(snapshot, [keyed])).toEqual([
        'rectangle-area.length: key changed from "length" to "long"',
      ]);
      const counted = area([
        { kind: 'count', key: 'length', urlKey: 'l', default: 120 },
        lengthInput('width', 'w', 120),
      ]);
      expect(compareReleased(snapshot, [counted])).toEqual([
        'rectangle-area.length: kind changed from "length" to "count"',
      ]);
      const inserted = area([
        lengthInput('depth', 'd', 120),
        lengthInput('length', 'l', 120),
        lengthInput('width', 'w', 120),
      ]);
      expect(compareReleased(snapshot, [inserted])).toEqual([
        'rectangle-area.length: key changed from "length" to "depth"',
        'rectangle-area.length: url key changed from "l" to "d"',
        'rectangle-area.width: key changed from "width" to "length"',
        'rectangle-area.width: url key changed from "w" to "l"',
      ]);
    });

    // spec: rule 4 (options may be added, never renamed or removed); options only for select
    it('requires options for select tuples only, and allows added options', () => {
      const select = (options: readonly [string, ...string[]]) =>
        area([{ kind: 'select', key: 'finish', urlKey: 'f', default: 'matte', options }]);
      const released: ReleasedField = {
        calculatorId: 'rectangle-area',
        key: 'finish',
        urlKey: 'f',
        kind: 'select',
        default: 'matte',
        options: ['matte', 'gloss'],
      };
      expect(compareReleased([released], [select(['matte', 'gloss'])])).toEqual([]);
      expect(compareReleased([released], [select(['matte', 'gloss', 'satin'])])).toEqual([]);
      expect(compareReleased([released], [select(['matte', 'satin'])])).toEqual([
        'rectangle-area.finish: option "gloss" removed',
      ]);
      const bare: ReleasedField = {
        calculatorId: 'rectangle-area',
        key: 'finish',
        urlKey: 'f',
        kind: 'select',
        default: 'matte',
      };
      expect(compareReleased([bare], [select(['matte'])])).toEqual([
        'rectangle-area.finish: a select tuple needs options',
      ]);
      expect(compareReleased([{ ...LENGTH, options: ['a'] }], [current()])).toEqual([
        'rectangle-area.length: only a select tuple has options',
      ]);
    });

    it('writes every default as its canonical url text', () => {
      const flag = area([{ kind: 'boolean', key: 'b', urlKey: 'b', default: true }]);
      const count = area([{ kind: 'count', key: 'n', urlKey: 'n', default: 7 }]);
      const tuple = (key: string, kind: ReleasedField['kind'], value: string): ReleasedField => ({
        calculatorId: 'rectangle-area',
        key,
        urlKey: key,
        kind,
        default: value,
      });
      expect(compareReleased([tuple('n', 'count', '7')], [count])).toEqual([]);
      expect(compareReleased([tuple('b', 'boolean', '1')], [flag])).toEqual([]);
      expect(compareReleased([tuple('b', 'boolean', 'true')], [flag])).toEqual([
        'rectangle-area.b: default changed from "true" to "1"',
      ]);
    });
  });
});

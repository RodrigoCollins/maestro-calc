import { describe, expect, it } from 'vitest';
import {
  compareReleased,
  type ReleasedCalculator,
  type ReleasedField,
} from './released-harness.ts';
import { defineCalculator } from '../calculator/define.ts';
import type { InputDescriptor } from '../calculator/descriptors.ts';
import { inch } from '../units/catalog.ts';
import { quantity } from '../units/quantity.ts';
import { decode } from './codec.ts';

const lengthInput = (key: string, urlKey: string, inches: number): InputDescriptor => ({
  kind: 'length',
  key,
  urlKey,
  default: quantity(inches, inch),
  defaultUnit: 'ft',
  metricDefaultUnit: 'm',
});

/** A calculator shaped like the first one to ship (`rectangle-area`) with the given inputs. */
const area = (
  inputs: readonly [InputDescriptor, ...InputDescriptor[]],
  id = 'rectangle-area',
  retiredUrlKeys: readonly string[] = [],
) =>
  defineCalculator({
    id,
    inputs,
    retiredUrlKeys,
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
      const appended: ReleasedField = {
        ...LENGTH,
        key: 'hole',
        urlKey: 'h',
        kind: 'boolean',
        default: '1',
      };
      expect(compareReleased([...snapshot, appended], [widened])).toEqual([]);
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

    it('checks each released calculator against its own tuples, wherever it is listed', () => {
      const side: ReleasedField = {
        calculatorId: 'square-area',
        key: 'side',
        urlKey: 's',
        kind: 'length',
        default: '12',
      };
      const square = area([lengthInput('side', 's', 12)], 'square-area');
      expect(compareReleased([...snapshot, side], [square, current()])).toEqual([]);
      const retuned = area([lengthInput('side', 's', 24)], 'square-area');
      expect(compareReleased([...snapshot, side], [retuned, current()])).toEqual([
        'square-area.side: default changed from "12" to "24"',
      ]);
      expect(compareReleased([...snapshot, side], [current()])).toEqual([
        'square-area: released calculator is missing',
      ]);
    });

    it('reports a default that is not a value of its kind', () => {
      // a hand-built calculator: `defineCalculator` would refuse the default
      const broken: ReleasedCalculator = {
        id: 'rectangle-area',
        retiredUrlKeys: [],
        // @ts-expect-error the default is not a count, on purpose
        inputs: [{ kind: 'count', key: 'n', urlKey: 'n', default: 'seven' }],
      };
      const tuple: ReleasedField = {
        ...LENGTH,
        key: 'n',
        urlKey: 'n',
        kind: 'count',
        default: '7',
      };
      expect(compareReleased([tuple], [broken])).toEqual([
        'rectangle-area.n: default changed from "7" to "(not a value)"',
      ]);
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
      const flag = area([{ kind: 'boolean', key: 'finish', urlKey: 'f', default: false }]);
      expect(compareReleased([released], [flag])).toEqual([
        'rectangle-area.finish: kind changed from "select" to "boolean"',
        'rectangle-area.finish: default changed from "matte" to "0"',
        'rectangle-area.finish: option "matte" removed',
        'rectangle-area.finish: option "gloss" removed',
      ]);
      expect(compareReleased([bare], [select(['matte'])])).toEqual([
        'rectangle-area.finish: a select tuple needs options',
      ]);
      expect(compareReleased([{ ...LENGTH, options: ['a'] }], [current()])).toEqual([
        'rectangle-area.length: only a select tuple has options',
      ]);
    });

    // spec: rules 2 and 3 (a new default needs a new field; the old key is retired, never reused)
    describe('a retired field', () => {
      const retired: ReleasedField = { ...WIDTH, retired: true };
      const oldKeyListed = (inputs: readonly [InputDescriptor, ...InputDescriptor[]]) =>
        area(inputs, 'rectangle-area', ['w']);

      it('accepts a field retired with its key in retiredUrlKeys', () => {
        const retuned = oldKeyListed([lengthInput('length', 'l', 120)]);
        expect(compareReleased([LENGTH, retired], [retuned])).toEqual([]);
      });

      it('accepts a replacement appended after the retired field', () => {
        const retuned = oldKeyListed([
          lengthInput('length', 'l', 120),
          lengthInput('breadth', 'br', 144),
        ]);
        expect(compareReleased([LENGTH, retired], [retuned])).toEqual([]);
      });

      it('fails when the key is not in retiredUrlKeys', () => {
        const silent = area([lengthInput('length', 'l', 120)]);
        expect(compareReleased([LENGTH, retired], [silent])).toEqual([
          'rectangle-area.width: retired url key "w" is missing from retiredUrlKeys',
        ]);
        const other = area([lengthInput('length', 'l', 120)], 'rectangle-area', ['x']);
        expect(compareReleased([LENGTH, retired], [other])).toEqual([
          'rectangle-area.width: retired url key "w" is missing from retiredUrlKeys',
        ]);
      });

      it('fails when a retired key comes back as a new input', () => {
        const reused = { ...current(), retiredUrlKeys: ['w'] };
        expect(compareReleased([LENGTH, retired], [reused])).toEqual([
          'rectangle-area.width: retired url key "w" is used again by the input "width"',
        ]);
        const unlisted = area([lengthInput('length', 'l', 120), lengthInput('depth', 'w', 12)]);
        expect(compareReleased([LENGTH, retired], [unlisted])).toEqual([
          'rectangle-area.width: retired url key "w" is missing from retiredUrlKeys',
          'rectangle-area.width: retired url key "w" is used again by the input "depth"',
        ]);
      });

      it('still holds the live fields to their position, skipping the retired one', () => {
        const depth: ReleasedField = { ...LENGTH, key: 'depth', urlKey: 'd' };
        const snapshotWithGap = [LENGTH, retired, depth];
        const shrunk = oldKeyListed([
          lengthInput('length', 'l', 120),
          lengthInput('depth', 'd', 120),
        ]);
        expect(compareReleased(snapshotWithGap, [shrunk])).toEqual([]);
        const swapped = oldKeyListed([
          lengthInput('depth', 'd', 120),
          lengthInput('length', 'l', 120),
        ]);
        expect(compareReleased(snapshotWithGap, [swapped])).toEqual([
          'rectangle-area.length: key changed from "length" to "depth"',
          'rectangle-area.length: url key changed from "l" to "d"',
          'rectangle-area.depth: key changed from "depth" to "length"',
          'rectangle-area.depth: url key changed from "d" to "l"',
        ]);
        const narrowed = oldKeyListed([lengthInput('length', 'l', 120)]);
        expect(compareReleased(snapshotWithGap, [narrowed])).toEqual([
          'rectangle-area.depth: field removed',
        ]);
      });

      it('does not excuse removing a live field', () => {
        const narrowed = oldKeyListed([lengthInput('length', 'l', 120)]);
        expect(compareReleased([LENGTH, WIDTH], [narrowed])).toEqual([
          'rectangle-area.width: field removed',
        ]);
      });
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

import { describe, expect, it } from 'vitest';
import { usd } from '../../money/money.ts';
import type { InputDescriptor } from '../descriptors.ts';
import { Rational } from '../../rational/rational.ts';
import { inch } from '../../units/catalog.ts';
import { quantity } from '../../units/quantity.ts';
import {
  booleanInput,
  clockInput,
  countInput,
  decimalInput,
  lengthInput,
  moneyInput,
  percentInput,
  selectInput,
} from './index.ts';

const BUILT = [
  lengthInput({
    key: 'len',
    urlKey: 'a',
    default: quantity(1, inch),
    defaultUnit: 'in',
    metricDefaultUnit: 'cm',
  }),
  countInput({ key: 'cnt', urlKey: 'b', default: 1 }),
  percentInput({ key: 'pct', urlKey: 'c', default: Rational.ONE }),
  decimalInput({ key: 'dec', urlKey: 'd', default: Rational.ONE }),
  selectInput({ key: 'sel', urlKey: 'e', default: 'x', options: ['x'] }),
  booleanInput({ key: 'flg', urlKey: 'f', default: false }),
  moneyInput({ key: 'prc', urlKey: 'g', default: usd(0) }),
  clockInput({ key: 'tin', urlKey: 'h', default: null }),
] as const;

describe('input kind builders (each descriptor carries the code of its own kind)', () => {
  it('names the kind and keeps every declared property', () => {
    expect(BUILT.map(({ kind }) => kind)).toEqual([
      'length',
      'count',
      'percent',
      'decimal',
      'select',
      'boolean',
      'money',
      'clock',
    ]);
    const { codec, ...count } = countInput({ key: 'cnt', urlKey: 'b', default: 2, min: 1, max: 9 });
    expect(codec).toBe(BUILT[1].codec);
    expect(count).toEqual({ kind: 'count', key: 'cnt', urlKey: 'b', default: 2, min: 1, max: 9 });
  });

  it('shares one codec per kind, distinct from the codec of every other kind', () => {
    const again = selectInput({ key: 'other', urlKey: 'z', default: 'y', options: ['y'] });
    expect(again.codec).toBe(BUILT[4].codec);
    expect(new Set(BUILT.map(({ codec }) => codec)).size).toBe(BUILT.length);
  });

  it('lets the kind override nothing: a spec cannot set kind or codec', () => {
    // @ts-expect-error a spec has no kind: the builder names it
    countInput({ kind: 'money', key: 'cnt', urlKey: 'b', default: 1 });
    // @ts-expect-error nor a codec
    countInput({ codec: BUILT[6].codec, key: 'cnt', urlKey: 'b', default: 1 });
    // an untyped caller gets the kind and the codec of the builder all the same
    const untyped = countInput as (spec: object) => InputDescriptor;
    const built = untyped({ kind: 'money', codec: BUILT[6].codec, key: 'cnt', urlKey: 'b' });
    expect(built.kind).toBe('count');
    expect(built.codec).toBe(BUILT[1].codec);
  });
});

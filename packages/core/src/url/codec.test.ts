import { describe, expect, it } from 'vitest';
import { fixtureBox } from '../__testing__/fixture-box.ts';
import { defineCalculator } from '../calculator/define.ts';
import type { InputsOf } from '../calculator/descriptors.ts';
import { CoreError } from '../errors.ts';
import { usd } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { ft, inch, m } from '../units/catalog.ts';
import { quantity } from '../units/quantity.ts';
import { encode } from './codec.ts';

const r = (n: number, d = 1): Rational => Rational.of(n, d);

/** `encode` with a state the types would reject: what an untyped caller can hand over. */
const encodeUntyped = (state: Readonly<Record<string, unknown>>): string =>
  // @ts-expect-error the state is not InputsOf the fixture inputs, on purpose
  encode(fixtureBox, state);

const caught = (action: () => unknown): unknown => {
  try {
    action();
  } catch (error) {
    return error;
  }
  return undefined;
};

/** The default `fixture-box` state: 12 in, 3, 10, x, false, $4.98. */
type Box = InputsOf<typeof fixtureBox.inputs>;
const defaults: Box = {
  len: quantity(12, inch),
  cnt: 3,
  pct: r(10),
  sel: 'x',
  flg: false,
  prc: usd(r(249, 50)),
};

const flagBox = defineCalculator({
  id: 'flag-box',
  inputs: [{ kind: 'boolean', key: 'on', urlKey: 'e', default: true }],
  outputs: [{ key: 'size', measure: 'length', role: 'primary' }],
  compute: () => ({ outputs: { size: quantity(1, inch) }, shopping: [], warnings: [] }),
});

describe('encode (url-state-codec › Encoding)', () => {
  // spec: Encoding › All defaults [UC1]
  it('encodes the default state as v=1, and v=1&u=m for metric', () => {
    expect(encode(fixtureBox, defaults)).toBe('v=1');
    expect(encode(fixtureBox, defaults, { unitSystem: 'metric' })).toBe('v=1&u=m');
    expect(encode(fixtureBox, defaults, { unitSystem: 'imperial' })).toBe('v=1');
    expect(encode(fixtureBox, defaults, {})).toBe('v=1');
  });

  // spec: Encoding › Single and combined fields [UC2]
  it.each<[string, Partial<Box>, string]>([
    ['cnt 7', { cnt: 7 }, 'v=1&b=7'],
    ['pct 25/2', { pct: r(25, 2) }, 'v=1&c=25/2'],
    ['flg true', { flg: true }, 'v=1&e=1'],
    ['sel y', { sel: 'y' }, 'v=1&d=y'],
    ['len 63.5 in', { len: quantity(r(127, 2), inch) }, 'v=1&a=127/2'],
    ['prc $0.37', { prc: usd(r(37, 100)) }, 'v=1&f=37/100'],
  ])('encodes a state that differs only in %s', (_label, change, expected) => {
    expect(encode(fixtureBox, { ...defaults, ...change })).toBe(expected);
  });

  it('encodes the full state in declaration order', () => {
    const full: Box = {
      len: quantity(r(127, 2), inch),
      cnt: 7,
      pct: r(25, 2),
      sel: 'y',
      flg: true,
      prc: usd(5),
    };
    expect(encode(fixtureBox, full)).toBe('v=1&a=127/2&b=7&c=25/2&d=y&e=1&f=5');
    expect(encode(fixtureBox, full, { unitSystem: 'metric' })).toBe(
      'v=1&u=m&a=127/2&b=7&c=25/2&d=y&e=1&f=5',
    );
  });

  // spec: Encoding › Equal value, different spelling is omitted [UC3]
  it('omits a value equal to its default whatever the unit it was written in', () => {
    expect(encode(fixtureBox, { ...defaults, len: quantity(1, ft) })).toBe('v=1');
    expect(encode(fixtureBox, { ...defaults, pct: r(100, 10) })).toBe('v=1');
    expect(encode(fixtureBox, { ...defaults, prc: usd(r(498, 100)) })).toBe('v=1');
  });

  // spec: Encoding › Metric input canonicalizes to inches [UC4]
  it('writes a metre as exact inches and keeps the unit-system preference apart', () => {
    expect(encode(fixtureBox, { ...defaults, len: quantity(1, m) }, { unitSystem: 'metric' })).toBe(
      'v=1&u=m&a=5000/127',
    );
  });

  // spec: Encoding › Zero and non-default boolean false [UC5]
  it('writes zero and a false that differs from a true default', () => {
    expect(encode(fixtureBox, { ...defaults, len: quantity(0, inch) })).toBe('v=1&a=0');
    expect(encode(fixtureBox, { ...defaults, cnt: 0, pct: r(0), prc: usd(0) })).toBe(
      'v=1&b=0&c=0&f=0',
    );
    expect(encode(flagBox, { on: false })).toBe('v=1&e=0');
    expect(encode(flagBox, { on: true })).toBe('v=1');
  });

  // spec: money › URL value [MN10]: $0.37 is exactly 37/100 dollars
  it('writes money as exact dollars', () => {
    expect(encode(fixtureBox, { ...defaults, prc: usd(r(37, 100)) })).toBe('v=1&f=37/100');
  });

  // spec: Encoding › the serializer emits only [0-9a-z/-], so nothing is percent-encoded
  it('emits only url-safe characters, a literal slash and never an escape', () => {
    const query = encode(
      fixtureBox,
      { ...defaults, len: quantity(r(-1, 3), inch), prc: usd(r(1, 3)), sel: 'y' },
      { unitSystem: 'metric' },
    );
    expect(query).toBe('v=1&u=m&a=-1/3&d=y&f=1/3');
    expect(query).toMatch(/^[0-9a-z/=&-]+$/);
    expect(query).not.toContain('%');
  });

  it('never emits the calculator id or a key the descriptors do not declare', () => {
    const state = { ...defaults, cnt: 7, extra: 'z' };
    expect(encode(fixtureBox, state)).toBe('v=1&b=7');
    expect(encode(fixtureBox, { ...defaults, cnt: 7 })).not.toContain('fixture');
  });

  // a state is trusted to be typed; an untyped one is a programming error (D5)
  it.each([
    ['len', { ...defaults, len: 12 }],
    ['len', { ...defaults, len: usd(12) }],
    ['len', { ...defaults, len: quantity(12, m).canonical }],
    ['cnt', { ...defaults, cnt: -1 }],
    ['cnt', { ...defaults, cnt: 1.5 }],
    ['cnt', { ...defaults, cnt: 2 ** 53 }],
    ['cnt', { ...defaults, cnt: '3' }],
    ['pct', { ...defaults, pct: 10 }],
    ['sel', { ...defaults, sel: 5 }],
    ['sel', { ...defaults, sel: 'z' }],
    ['flg', { ...defaults, flg: 'true' }],
    ['prc', { ...defaults, prc: quantity(1, inch) }],
    ['prc', { ...defaults, prc: undefined }],
  ])('throws INVALID_STATE for an untyped %s', (field, state) => {
    const error = caught(() => encodeUntyped(state));
    expect(error).toBeInstanceOf(CoreError);
    expect(error).toMatchObject({
      code: 'INVALID_STATE',
      reason: 'FIELD_VALUE',
      cause: { id: 'fixture-box', field },
    });
  });

  // the state itself must be an object, as for `validate` (PR 11 review RES-4)
  it.each<[string, unknown]>([
    ['null', null],
    ['undefined', undefined],
    ['a number', 5],
    ['a string', 'v=1'],
    ['a function', () => defaults],
  ])('throws NOT_AN_OBJECT for %s as the state', (_name, state) => {
    // @ts-expect-error the state is not an object, on purpose
    const error = caught(() => encode(fixtureBox, state));
    expect(error).toBeInstanceOf(CoreError);
    expect(error).toMatchObject({ code: 'NOT_AN_OBJECT' });
  });

  it('reports a list as an untyped state, not as a missing object', () => {
    // @ts-expect-error a list is not a state, on purpose
    const error = caught(() => encode(fixtureBox, []));
    expect(error).toMatchObject({
      code: 'INVALID_STATE',
      cause: { id: 'fixture-box', field: 'len' },
    });
  });
});

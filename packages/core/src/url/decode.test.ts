import { describe, expect, it } from 'vitest';
import { fixtureBox } from '../__testing__/fixture-box.ts';
import { defineCalculator } from '../calculator/define.ts';
import type { InputsOf } from '../calculator/descriptors.ts';
import { usd } from '../money/money.ts';
import { Rational } from '../rational/rational.ts';
import { inch } from '../units/catalog.ts';
import { quantity } from '../units/quantity.ts';
import { decode } from './codec.ts';

const r = (n: number, d = 1): Rational => Rational.of(n, d);

type Box = InputsOf<typeof fixtureBox.inputs>;
/** The default `fixture-box` state: 12 in, 3, 10, x, false, $4.98. */
const defaults: Box = {
  len: quantity(12, inch),
  cnt: 3,
  pct: r(10),
  sel: 'x',
  flg: false,
  prc: usd(r(249, 50)),
};
const box = (change: Partial<Box> = {}): Box => ({ ...defaults, ...change });
const invalid = (...keys: string[]) => keys.map((key) => ({ code: 'INVALID_VALUE', key }));
const digits = (count: number): string => '7'.repeat(count);

describe('decode (url-state-codec › Decoding)', () => {
  // spec: Decoding › Round trip of a full state [UC6]
  it('decodes a full state with no issues', () => {
    expect(decode(fixtureBox, 'v=1&a=127/2&b=7&c=25/2&d=y&e=1&f=5')).toEqual({
      state: {
        len: quantity(r(127, 2), inch),
        cnt: 7,
        pct: r(25, 2),
        sel: 'y',
        flg: true,
        prc: usd(5),
      },
      unitSystem: 'imperial',
      issues: [],
    });
  });

  // spec: Decoding › Missing version and empty query [UC7]
  it.each([
    ['a=24', box({ len: quantity(24, inch) })],
    ['?a=24', box({ len: quantity(24, inch) })],
    ['', box()],
    ['v=1', box()],
    ['?', box()],
    ['v=1&u=m', box()],
  ])('decodes %j', (query, state) => {
    const decoded = decode(fixtureBox, query);
    expect(decoded.state).toEqual(state);
    expect(decoded.issues).toEqual([]);
    expect(decoded.unitSystem).toBe(query.endsWith('u=m') ? 'metric' : 'imperial');
  });

  // spec: Decoding › Encoded slash accepted [UC8]
  it.each(['v=1&a=127%2F2', 'v=1&a=127%2f2', 'v=1&a=127/2'])('reads %j as 63.5 in', (query) => {
    expect(decode(fixtureBox, query)).toEqual({
      state: box({ len: quantity(r(127, 2), inch) }),
      unitSystem: 'imperial',
      issues: [],
    });
  });

  // spec: Decoding › Unit-system preference [UC9]; PR 9 review R1-3: u maps strictly to the union
  it('maps u=m to metric and never changes how a length is read', () => {
    expect(decode(fixtureBox, 'v=1&u=m&a=5')).toEqual({
      state: box({ len: quantity(5, inch) }),
      unitSystem: 'metric',
      issues: [],
    });
  });
  it.each(['x', '', 'M', 'metric', 'imperial', 'i', 'toString'])(
    'reports u=%j as imperial with one INVALID_VALUE for u',
    (value) => {
      expect(decode(fixtureBox, `v=1&u=${value}`)).toEqual({
        state: box(),
        unitSystem: 'imperial',
        issues: invalid('u'),
      });
    },
  );
  it('lets the first u win and reads an escaped m', () => {
    expect(decode(fixtureBox, 'v=1&u=m&u=i').unitSystem).toBe('metric');
    expect(decode(fixtureBox, 'v=1&u=m&u=i').issues).toEqual([]);
    expect(decode(fixtureBox, 'v=1&u=x&u=m')).toMatchObject({
      unitSystem: 'imperial',
      issues: invalid('u'),
    });
    expect(decode(fixtureBox, 'v=1&u=%6D').unitSystem).toBe('metric');
  });

  // spec: Decoding › Unknown keys ignored [UC10]
  it('ignores unknown, differently cased and retired keys without a trace', () => {
    expect(decode(fixtureBox, 'utm_source=x&A=5&zz=1&v=1&b=7')).toEqual({
      state: box({ cnt: 7 }),
      unitSystem: 'imperial',
      issues: [],
    });
    const retired = defineCalculator({
      id: 'retired-box',
      inputs: [{ kind: 'count', key: 'n', urlKey: 'n', default: 1 }],
      outputs: [{ key: 'size', measure: 'length', role: 'primary' }],
      retiredUrlKeys: ['q'],
      compute: () => ({ outputs: { size: quantity(1, inch) }, shopping: [], warnings: [] }),
    });
    expect(decode(retired, 'q=oops&n=4').state).toEqual({ n: 4 });
    expect(decode(retired, 'q=oops&n=4').issues).toEqual([]);
  });

  // spec: Decoding › Invalid values default individually [UC11]
  it('defaults every invalid field and lists the issues in query order', () => {
    expect(decode(fixtureBox, 'v=1&a=abc&b=101&c=-1&d=z&e=true&f=4.98')).toEqual({
      state: box(),
      unitSystem: 'imperial',
      issues: invalid('a', 'b', 'c', 'd', 'e', 'f'),
    });
    expect(decode(fixtureBox, 'v=1&a=abc&b=7')).toEqual({
      state: box({ cnt: 7 }),
      unitSystem: 'imperial',
      issues: invalid('a'),
    });
    expect(decode(fixtureBox, 'f=x&u=q&a=y').issues).toEqual(invalid('f', 'u', 'a'));
  });

  // spec: Decoding › User-input spellings rejected [UC12]
  it.each([
    [`v=1&a=5'`, 'a'],
    ['v=1&a=63.5in', 'a'],
    ['v=1&a=1 m', 'a'],
    ['v=1&f=$5', 'f'],
  ])('rejects %j', (query, key) => {
    expect(decode(fixtureBox, query)).toEqual({
      state: box(),
      unitSystem: 'imperial',
      issues: invalid(key),
    });
  });

  // spec: Decoding › Out-of-range and zero denominator [UC13]
  it.each(['v=1&a=-1', 'v=1&a=1201', 'v=1&a=1/0', 'v=1&a=2401/2'])(
    'defaults len for %j',
    (query) => {
      expect(decode(fixtureBox, query)).toEqual({
        state: box(),
        unitSystem: 'imperial',
        issues: invalid('a'),
      });
    },
  );
  it.each(['v=1&f=-1', 'v=1&f=10001'])('defaults prc for %j', (query) => {
    expect(decode(fixtureBox, query)).toEqual({
      state: box(),
      unitSystem: 'imperial',
      issues: invalid('f'),
    });
  });
  it('accepts the maximum length', () => {
    expect(decode(fixtureBox, 'v=1&a=1200')).toEqual({
      state: box({ len: quantity(1200, inch) }),
      unitSystem: 'imperial',
      issues: [],
    });
  });

  // spec: Decoding › Non-canonical but valid values [UC14]
  it('normalizes valid values that are not canonical', () => {
    expect(decode(fixtureBox, 'v=1&a=24/2&b=007&c=25/2&f=498/100')).toEqual({
      state: box({ len: quantity(12, inch), cnt: 7, pct: r(25, 2), prc: usd(r(249, 50)) }),
      unitSystem: 'imperial',
      issues: [],
    });
  });

  // spec: money › URL value [MN10]: $0.37 is exactly 37/100 dollars
  it('reads 37/100 as exactly $0.37', () => {
    expect(decode(fixtureBox, 'v=1&f=37/100').state.prc).toEqual(usd(r(37, 100)));
  });

  // spec: Decoding › Empty, overlong, and malformed-escape values [UC15]
  it.each([
    ['empty', 'v=1&a='],
    ['no equals sign', 'v=1&a'],
    ['257 digits', `v=1&a=${digits(257)}`],
    ['malformed escape', 'v=1&a=1%zz'],
    ['truncated escape', 'v=1&a=1%2'],
    ['not utf-8', 'v=1&a=%ff'],
  ])('defaults len for %s with one issue', (_label, query) => {
    expect(decode(fixtureBox, query)).toEqual({
      state: box(),
      unitSystem: 'imperial',
      issues: invalid('a'),
    });
  });

  // spec: Decoding › Duplicate keys [UC16]
  it('lets the first occurrence of a key win without an issue', () => {
    expect(decode(fixtureBox, 'v=1&b=5&b=7')).toEqual({
      state: box({ cnt: 5 }),
      unitSystem: 'imperial',
      issues: [],
    });
    // the first occurrence wins even when it is the invalid one
    expect(decode(fixtureBox, 'b=x&b=7')).toMatchObject({ state: box(), issues: invalid('b') });
    // a percent-encoded key is the same key
    expect(decode(fixtureBox, 'a=5&%61=7').state).toEqual(box({ len: quantity(5, inch) }));
  });

  // spec: Decoding › Splitting: keys percent-decoded, `+` has no special meaning
  it('percent-decodes keys, splits at the first equals sign and gives + no meaning', () => {
    expect(decode(fixtureBox, '%61=5&%62=7').state).toEqual(
      box({ len: quantity(5, inch), cnt: 7 }),
    );
    expect(decode(fixtureBox, 'b%3D7').state).toEqual(box());
    expect(decode(fixtureBox, 'b=7=8')).toMatchObject({ state: box(), issues: invalid('b') });
    expect(decode(fixtureBox, 'a=1+2')).toMatchObject({ state: box(), issues: invalid('a') });
    expect(decode(fixtureBox, 'a+b=5').state).toEqual(box());
    expect(decode(fixtureBox, '%zz=1&&=&b=7&=5')).toEqual({
      state: box({ cnt: 7 }),
      unitSystem: 'imperial',
      issues: [],
    });
  });

  it('returns a frozen result that holds no shared state', () => {
    const decoded = decode(fixtureBox, 'b=7&a=x');
    expect(Object.isFrozen(decoded)).toBe(true);
    expect(Object.isFrozen(decoded.state)).toBe(true);
    expect(Object.isFrozen(decoded.issues)).toBe(true);
    expect(decoded.issues.every((issue) => Object.isFrozen(issue))).toBe(true);
    expect(decode(fixtureBox, 'b=7&a=x')).toEqual(decoded);
  });
});
